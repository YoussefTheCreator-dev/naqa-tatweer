// Context-aware chatbot drawer.
// Persona depends on the active farm: Camel Expert / Palm Expert / NAQA Assistant.
// Sends messages to the NAQA backend (FastAPI on :8000); falls back to Gemini if Ollama is unavailable.
import { html, useState, useRef, useEffect, Fragment } from "../core/html.js";
import { Chat, Send, X } from "./Icons.js";
import { useStore } from "../core/store.js";

const PERSONA = {
  camel: { en: "Camel Expert", ar: "خبير الإبل", color: "var(--terracotta)" },
  palm: { en: "Palm Expert", ar: "خبير النخيل", color: "var(--palm)" },
  home: { en: "NAQA Assistant", ar: "مساعد ناقة", color: "var(--palm)" },
};

const SUGGESTIONS = {
  camel: [
    ["How much water per camel in summer?", "كم تحتاج الناقة من الماء صيفاً؟"],
    ["Vaccine schedule for calves?", "جدول تطعيم الحشاش؟"],
    ["Signs of heat stress?", "علامات الإجهاد الحراري؟"],
  ],
  palm: [
    ["Best irrigation in 45°C heat?", "أفضل ري في حرارة 45°؟"],
    ["How to spot red palm weevil?", "كيف أكتشف سوسة النخيل؟"],
    ["When to fertilise Khalas?", "متى أسمّد الخلاص؟"],
  ],
  home: [
    ["What can NAQA do?", "ماذا يفعل ناقة؟"],
    ["Today's weather advice?", "نصيحة الطقس اليوم؟"],
    ["How do I add a new animal?", "كيف أضيف حيواناً؟"],
  ],
};

const BACKEND = "/api/chat";

function readFarmContext() {
  function parseLS(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
  }
  return {
    camels: parseLS("naqa.camels"),
    palms: parseLS("naqa.palms"),
    healthEvents: parseLS("naqa.healthEvents"),
  };
}

export function Chatbot({ farmType }) {
  const ctx = farmType || "home";
  const persona = PERSONA[ctx];
  const { t, lang } = useStore();
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const bodyRef = useRef(null);

  // Greet (and re-greet) whenever the persona/context changes while open.
  useEffect(() => {
    setMessages([
      {
        from: "bot",
        text: t(
          `Hi! I'm your ${persona.en}. Ask me anything about your farm.`,
          `مرحباً! أنا ${persona.ar}. اسألني أي شيء عن مزرعتك.`
        ),
      },
    ]);
  }, [ctx, lang]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, open]);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "me", text: q }]);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch(BACKEND, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, farm_context: readFarmContext(), language: lang }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setMessages((m) => [...m, { from: "bot", text: data.reply }]);
    } catch (e) {
      const isOffline = e instanceof TypeError || (e.message || "").includes("fetch");
      setMessages((m) => [...m, {
        from: "bot",
        text: isOffline
          ? t("Offline mode — backend not running", "وضع عدم الاتصال — الخادم غير مشغّل")
          : t("Error: " + e.message, "خطأ: " + e.message),
        error: true,
      }]);
    } finally {
      setTyping(false);
    }
  }

  return html`<${Fragment}>
    <button class="fab chat" style=${{ background: persona.color }} aria-label=${t("Open chat", "فتح المحادثة")} onClick=${() => setOpen(true)}>
      <${Chat} size=${24} />
    </button>
    ${open &&
    html`<div class="overlay" onClick=${() => setOpen(false)}>
      <div class="drawer" onClick=${(e) => e.stopPropagation()}>
        <div class="chat-head">
          <span class="avatar" style=${{ background: persona.color, width: "38px", height: "38px" }}><${Chat} size=${18} /></span>
          <div class="grow">
            <div style=${{ fontWeight: 800 }}>${t(persona.en, persona.ar)}</div>
            <div class="muted" style=${{ fontSize: "12px" }}>${t("Demo · NAQA Assistant", "تجريبي · مساعد ناقة")}</div>
          </div>
          <button class="btn btn-ghost btn-icon" onClick=${() => setOpen(false)} aria-label="Close"><${X} size=${18} /></button>
        </div>

        <div class="chat-body" ref=${bodyRef}>
          ${messages.map((m, i) => html`<div key=${i} class=${`bubble ${m.from}`} style=${m.error ? { color: "var(--danger, #dc2626)", borderColor: "#fca5a5" } : {}}>${m.text}</div>`)}
          ${typing && html`<div class="typing"><span></span><span></span><span></span></div>`}
        </div>

        <div class="chips">
          ${SUGGESTIONS[ctx].map(
            ([en, ar], i) => html`<button key=${i} class="chip" onClick=${() => send(t(en, ar))}>${t(en, ar)}</button>`
          )}
        </div>

        <div class="chat-input">
          <input
            class="input"
            placeholder=${t("Type a message…", "اكتب رسالة…")}
            value=${input}
            onInput=${(e) => setInput(e.target.value)}
            onKeyDown=${(e) => e.key === "Enter" && send()} />
          <button class="btn btn-primary btn-icon" onClick=${() => send()} aria-label=${t("Send", "إرسال")}><${Send} size=${18} /></button>
        </div>
      </div>
    </div>`}
  <//>`;
}
