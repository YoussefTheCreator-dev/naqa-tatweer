import asyncio
import base64
import io
import json
import os
from pathlib import Path
from typing import Any, Optional

import httpx
import numpy as np
import onnxruntime as ort
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from PIL import Image
from pydantic import BaseModel

# Load .env from project root (parent of backend/)
load_dotenv(Path(__file__).parent.parent / ".env")
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "llama3.2"
GROQ_MODEL = "llama-3.3-70b-versatile"

PALM_ONNX_PATH = Path(__file__).parent.parent / "palm_model.onnx"
PALM_LABELS = ["Diseased", "Healthy"]
PALM_ADVICE = {
    "Healthy": {
        "en": "No signs of disease — continue regular irrigation and fertilisation.",
        "ar": "لا توجد علامات مرض — استمر في الري والتسميد المنتظم.",
    },
    "Diseased": {
        "en": "Signs of disease detected. Inspect fronds and trunk closely; common causes include fungal infection, scale insects, magnesium deficiency, or dryness. Consult an agronomist.",
        "ar": "تم اكتشاف علامات مرض. افحص السعف والجذع عن كثب؛ قد تكون الأسباب عدوى فطرية أو حشرات قشرية أو نقص مغنيسيوم أو جفاف. استشر مختصاً زراعياً.",
    },
}

SYSTEM_PROMPT = (
    "You are NAQA, an expert AI assistant for UAE camel farmers and date palm growers "
    "in Al Ain. You know camel diseases (mange, MERS, foot rot, bloat, camel pox), "
    "palm diseases (bayoud, dubas bug, black scorch, white scale), UAE desert climate, "
    "local farming practices, and can read farm_context JSON to give personalized advice "
    "about specific animals/trees by name. Always respond in the same language the user "
    "writes in (Arabic or English). Be concise and practical."
)

app = FastAPI(title="NAQA AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Palm ONNX session — loaded once, cached in memory ────────────────────────
_palm_session: Optional[ort.InferenceSession] = None
_palm_input_name: Optional[str] = None


def _load_palm_session() -> ort.InferenceSession:
    sess = ort.InferenceSession(str(PALM_ONNX_PATH), providers=["CPUExecutionProvider"])
    return sess


def get_palm_session() -> ort.InferenceSession:
    global _palm_session, _palm_input_name
    if _palm_session is None:
        _palm_session = _load_palm_session()
        _palm_input_name = _palm_session.get_inputs()[0].name
    return _palm_session


def _decode_image(b64_string: str) -> np.ndarray:
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    img = Image.open(io.BytesIO(base64.b64decode(b64_string))).convert("RGB")
    img = img.resize((224, 224), Image.LANCZOS)
    # Raw 0-255 float32 — Rescaling(2/255, -1) is baked into the ONNX graph
    return np.expand_dims(np.array(img, dtype=np.float32), 0)


def _run_palm_inference(arr: np.ndarray):
    sess = get_palm_session()
    preds = sess.run(None, {_palm_input_name: arr})[0][0]  # shape (2,)
    idx = int(np.argmax(preds))
    return PALM_LABELS[idx], float(preds[idx])


# ── Pydantic models ───────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    farm_context: Optional[Any] = None
    language: str = "en"


class PalmDiagnoseRequest(BaseModel):
    image: str  # base64 image, data-URL prefix optional


# ── Helpers ───────────────────────────────────────────────────────────────────

def build_user_message(message: str, farm_context: Any) -> str:
    if farm_context:
        ctx_str = json.dumps(farm_context, ensure_ascii=False, indent=2)
        return f"Farm context (JSON):\n{ctx_str}\n\nUser: {message}"
    return message


async def try_ollama(user_message: str) -> Optional[str]:
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_message},
                    ],
                    "stream": False,
                },
            )
            if resp.status_code == 200:
                return resp.json().get("message", {}).get("content", "").strip() or None
    except Exception:
        pass
    return None


async def try_groq(user_message: str) -> str:
    client = Groq(api_key=GROQ_API_KEY)
    response = await asyncio.to_thread(
        client.chat.completions.create,
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
    )
    return response.choices[0].message.content


# ── Routes ────────────────────────────────────────────────────────────────────

@app.post("/api/palm-diagnose")
async def palm_diagnose(req: PalmDiagnoseRequest):
    if not PALM_ONNX_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail=(
                "palm_model.onnx not found. Run: py -3.11 backend/convert_palm_to_onnx.py"
            ),
        )
    try:
        arr = await asyncio.to_thread(_decode_image, req.image)
        label, confidence = await asyncio.to_thread(_run_palm_inference, arr)
        advice = PALM_ADVICE[label]
        return {
            "label": label,
            "confidence": round(confidence, 4),
            "advice": advice["en"],
            "advice_ar": advice["ar"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Palm inference error: {e}")


@app.post("/api/chat")
async def chat(req: ChatRequest):
    user_message = build_user_message(req.message, req.farm_context)

    reply = await try_ollama(user_message)

    if reply is None:
        if not GROQ_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="Ollama unavailable and GROQ_API_KEY not set. Add it to .env.",
            )
        try:
            reply = await try_groq(user_message)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Groq error: {e}")

    return {"reply": reply}


@app.get("/health")
async def health():
    return {"status": "ok"}


from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="../naqa", html=True), name="static")
