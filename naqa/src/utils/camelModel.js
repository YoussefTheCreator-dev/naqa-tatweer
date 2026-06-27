// Camel health-risk inference using ONNX Runtime Web.
// Model: YOLOv8 classification model trained in Colab (camel_triage_model.pt),
// exported to ONNX. Runs the exact trained model in the browser.
//   Input  → "images" [1,3,224,224] float32, RGB, NCHW, normalised to [0,1]
//   Output → "output0" [1,3] softmax over the three risk tiers
// Model file lives in models/camel/camel_triage_model.onnx
//
// NOTE: this model reports a RISK TIER (how urgent), not a specific disease,
// because the underlying dataset was too small to name individual diseases
// reliably. It was validated at ~83% on a held-out test set, and its errors
// only ever fall to an adjacent tier (no urgent case was ever called Low).

const MODEL_URL = "./models/camel/camel_triage_model.onnx";
// ONNX Runtime is bundled locally in /vendor so camel diagnosis works offline.
const ORT_LOCAL = "./vendor/ort.min.js";
const ORT_CDN = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/ort.min.js";
const IMG_SIZE = 224;

// Output index order from the model: 0=High_Risk, 1=Low_Risk, 2=Medium_Risk
export const CAMEL_CLASSES = ["High_Risk", "Low_Risk", "Medium_Risk"];

// Bilingual advice per risk tier. Decision-support, not a diagnosis.
const ADVICE = {
  "Low_Risk": {
    label_en: "Low risk",
    label_ar: "خطر منخفض",
    en: "No urgent signs detected. Keep monitoring the animal as usual and recheck if anything changes.",
    ar: "لا توجد علامات عاجلة. استمر في مراقبة الحيوان كالمعتاد وأعد الفحص إذا تغيّر أي شيء.",
    vetRequired: false,
    severity: "low",
  },
  "Medium_Risk": {
    label_en: "Medium risk",
    label_ar: "خطر متوسط",
    en: "Some signs worth watching. Monitor closely over the next 24 hours, ensure water and shade, and contact a vet if it worsens or doesn't improve.",
    ar: "بعض العلامات تستحق المتابعة. راقب الحيوان عن قرب خلال ٢٤ ساعة القادمة، ووفّر الماء والظل، واتصل بالطبيب البيطري إذا ساءت الحالة أو لم تتحسن.",
    vetRequired: false,
    severity: "medium",
  },
  "High_Risk": {
    label_en: "High risk",
    label_ar: "خطر مرتفع",
    en: "These signs need professional attention. Contact a vet now. Keep the animal calm, shaded, and with water while you arrange help.",
    ar: "هذه العلامات تحتاج إلى رعاية متخصصة. اتصل بالطبيب البيطري الآن. أبقِ الحيوان هادئاً في الظل مع توفير الماء حتى تجد المساعدة.",
    vetRequired: true,
    severity: "high",
  },
};

let _ort = null;
let _session = null;
let _loadPromise = null;

async function ensureORT() {
  if (_ort) return _ort;
  if (window.ort) return (_ort = window.ort);
  // Try the locally bundled copy first (works offline), then fall back to CDN.
  const tryLoad = (src) => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(window.ort);
    s.onerror = () => reject(new Error("script load failed: " + src));
    document.head.appendChild(s);
  });
  try {
    _ort = await tryLoad(ORT_LOCAL);
  } catch (e) {
    _ort = await tryLoad(ORT_CDN);
  }
  if (!_ort) throw new Error("Failed to load ONNX Runtime");
  // The wasm binaries sit next to ort.min.js in /vendor, and ORT resolves
  // wasmPaths relative to that script — so an absolute /vendor/ path is correct
  // whether the local copy or the CDN loaded.
  try { _ort.env.wasm.wasmPaths = new URL("vendor/", document.baseURI).href; } catch (e) {}
  return _ort;
}

async function _doLoad() {
  const ort = await ensureORT();
  // wasm backend runs everywhere; no GPU needed
  const session = await ort.InferenceSession.create(MODEL_URL, {
    executionProviders: ["wasm"],
  });
  _session = session;
  return session;
}

// Start downloading ORT + model in the background (call on component mount).
export function preloadCamelModel() {
  if (_session || _loadPromise) return;
  _loadPromise = _doLoad().catch(() => { _loadPromise = null; });
}

export async function loadCamelModel() {
  if (_session) return _session;
  if (!_loadPromise) _loadPromise = _doLoad();
  return _loadPromise;
}

function dataUrlToImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = url;
  });
}

// Draw the image to a 224x224 canvas and produce a Float32 NCHW tensor in [0,1].
function imageToTensor(ort, imgEl) {
  const canvas = document.createElement("canvas");
  canvas.width = IMG_SIZE;
  canvas.height = IMG_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgEl, 0, 0, IMG_SIZE, IMG_SIZE);
  const { data } = ctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE); // RGBA, HWC

  const size = IMG_SIZE * IMG_SIZE;
  const arr = new Float32Array(3 * size); // CHW
  for (let i = 0; i < size; i++) {
    arr[i] = data[i * 4] / 255;             // R plane
    arr[size + i] = data[i * 4 + 1] / 255;  // G plane
    arr[2 * size + i] = data[i * 4 + 2] / 255; // B plane
  }
  return new ort.Tensor("float32", arr, [1, 3, IMG_SIZE, IMG_SIZE]);
}

export async function runCamelInference(imageDataUrl) {
  const ort = await ensureORT();
  const session = await loadCamelModel();
  const imgEl = await dataUrlToImage(imageDataUrl);

  const input = imageToTensor(ort, imgEl);
  const inputName = session.inputNames[0];   // "images"
  const outputName = session.outputNames[0]; // "output0"
  const results = await session.run({ [inputName]: input });
  const probs = Array.from(results[outputName].data);

  const ranked = CAMEL_CLASSES.map((name, i) => ({ name, prob: probs[i] }))
    .sort((a, b) => b.prob - a.prob);

  const top = ranked[0];
  const info = ADVICE[top.name] || ADVICE["Low_Risk"];
  const isLow = top.name === "Low_Risk";

  // Surface the tier as a "concern" chip unless it's low risk.
  const concerns = [];
  if (!isLow) {
    concerns.push({ name: info.label_en, severity: info.severity });
  }

  return {
    condition: info.label_en,        // shown as the headline (e.g. "High risk")
    conditionAr: info.label_ar,
    confidence: top.prob,
    concerns,
    recommendation: info.en,
    recommendationAr: info.ar,
    vetRequired: info.vetRequired,
  };
}
