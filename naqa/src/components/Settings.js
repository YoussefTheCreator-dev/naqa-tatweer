// Settings modal: farm name, language, and CallMeBot daily WhatsApp reminders.
import { html, useState } from "../core/html.js";
import { useStore } from "../core/store.js";
import { Settings as Gear, MessageCircle, Send, Globe, Check, X, Users } from "./Icons.js";
import { computeSummary } from "../utils/summary.js";
import { buildDailyMessage, dispatchWhatsApp } from "../utils/whatsapp.js";
import { ContactsModal } from "./Contacts.js";

const CALLMEBOT_NUMBER = "+34 613 01 49 37";

export function SettingsModal({ onClose }) {
  const { t, lang, setLang, settings, updateSettings, camels, palms, dailyCare, pushToast } = useStore();
  const s = settings;
  const [sending, setSending] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);

  async function sendTest() {
    if (!s.number || !s.apiKey) {
      pushToast({ tone: "warn", en: "Enter your WhatsApp number and API key first", ar: "أدخل رقم واتساب ومفتاح API أولاً" });
      return;
    }
    setSending(true);
    const msg = buildDailyMessage(computeSummary({ camels, palms, dailyCare }));
    try {
      const res = await dispatchWhatsApp(s.number, s.apiKey, msg);
      pushToast(res.queued
        ? { tone: "warn", en: "Offline — will send when connection restored", ar: "غير متصل — سيُرسل عند عودة الاتصال" }
        : { tone: "ok", en: "Test message sent — check WhatsApp", ar: "تم إرسال رسالة تجريبية — تحقق من واتساب" });
    } catch {
      pushToast({ tone: "danger", en: "Could not send — verify your details", ar: "تعذّر الإرسال — تحقق من البيانات" });
    }
    setSending(false);
  }

  const steps = [
    [`Save ${CALLMEBOT_NUMBER} in your phone contacts as "CallMeBot"`, `احفظ ${CALLMEBOT_NUMBER} في جهات الاتصال باسم "CallMeBot"`],
    [`Send this message on WhatsApp: "I allow callmebot to send me messages"`, `أرسل هذه الرسالة على واتساب: "I allow callmebot to send me messages"`],
    ["You will receive your API key via WhatsApp within seconds", "ستصلك رسالة بمفتاح API خلال ثوانٍ"],
    ["Paste your number and API key below and enable reminders", "الصق رقمك ومفتاح API بالأسفل وفعّل التذكيرات"],
  ];

  return html`<div class="overlay" onClick=${onClose}>
    <div class="modal stack gap-16" style=${{ maxWidth: "480px", maxHeight: "88vh", overflowY: "auto" }} onClick=${(e) => e.stopPropagation()}>
      <div class="row between">
        <h3 style=${{ margin: 0 }}><${Gear} size=${18} /> ${t("Settings", "الإعدادات")}</h3>
        <button class="btn btn-ghost btn-icon" onClick=${onClose} aria-label="Close"><${X} size=${16} /></button>
      </div>

      <!-- General -->
      <div class="field"><label>${t("Farm name", "اسم المزرعة")}</label>
        <input class="input" value=${s.farmName || ""} onInput=${(e) => updateSettings({ farmName: e.target.value })} placeholder="My Farm" />
      </div>
      <div class="field"><label>${t("Language", "اللغة")}</label>
        <button class="btn btn-ghost" onClick=${() => setLang(lang === "ar" ? "en" : "ar")}>
          <${Globe} size=${16} /> ${lang === "ar" ? "العربية ← English" : "English → العربية"}
        </button>
      </div>
      <button class="btn btn-ghost" onClick=${() => setContactsOpen(true)}>
        <${Users} size=${16} /> ${t("Vet & Farm Contacts", "جهات الاتصال البيطرية")}
      </button>
      <label class="row between" style=${{ cursor: "pointer" }}>
        <span><span style=${{ fontWeight: 600 }}>${t("Auto dark mode at sunset", "الوضع الليلي تلقائياً عند الغروب")}</span>
          <span class="muted" style=${{ display: "block", fontSize: "12.5px" }}>${t("Follows Al Ain sunrise & sunset", "يتبع شروق وغروب العين")}</span></span>
        <span class="switch"><input type="checkbox" checked=${s.autoDark !== false} onChange=${(e) => updateSettings({ autoDark: e.target.checked })} /><span class="track"></span></span>
      </label>

      <!-- WhatsApp -->
      <div class="card stack gap-12" style=${{ background: "var(--surface-2)" }}>
        <div class="row gap-8" style=${{ fontWeight: 800, fontFamily: "var(--font-head)" }}><${MessageCircle} size=${18} /> ${t("Daily WhatsApp Reminders", "تذكيرات واتساب اليومية")}</div>
        <div class="muted" style=${{ fontSize: "13px" }}>${t("Free via CallMeBot — no backend needed. One-time setup:", "مجاناً عبر CallMeBot — بدون خادم. إعداد لمرة واحدة:")}</div>
        ${steps.map((st, i) => html`<div key=${i} class="settings-step"><span class="n">${i + 1}</span><span style=${{ fontSize: "13.5px" }}>${t(st[0], st[1])}</span></div>`)}

        <div class="field"><label>${t("WhatsApp number (international)", "رقم واتساب (دولي)")}</label>
          <input class="input" value=${s.number || ""} onInput=${(e) => updateSettings({ number: e.target.value })} placeholder="+971501234567" />
        </div>
        <div class="field"><label>${t("CallMeBot API key", "مفتاح CallMeBot")}</label>
          <input class="input" value=${s.apiKey || ""} onInput=${(e) => updateSettings({ apiKey: e.target.value })} placeholder="123456" />
        </div>
        <div class="field"><label>${t("Preferred daily send time", "وقت الإرسال اليومي")}</label>
          <input class="input" type="time" value=${s.time || "07:00"} onChange=${(e) => updateSettings({ time: e.target.value })} />
        </div>
        <label class="row between" style=${{ cursor: "pointer" }}>
          <span style=${{ fontWeight: 600 }}>${t("Enable daily reminders", "تفعيل التذكيرات اليومية")}</span>
          <span class="switch"><input type="checkbox" checked=${!!s.enabled} onChange=${(e) => updateSettings({ enabled: e.target.checked })} /><span class="track"></span></span>
        </label>
        <button class="btn btn-primary" disabled=${sending} onClick=${sendTest}>
          <${Send} size=${16} /> ${sending ? t("Sending…", "جارٍ الإرسال…") : t("Send test WhatsApp now", "إرسال رسالة تجريبية الآن")}
        </button>
        ${s.lastSent && html`<div class="muted" style=${{ fontSize: "12px", textAlign: "center" }}>${t("Last daily sent", "آخر إرسال")}: ${s.lastSent}</div>`}
      </div>
    </div>
    ${contactsOpen && html`<${ContactsModal} onClose=${() => setContactsOpen(false)} />`}
  </div>`;
}
