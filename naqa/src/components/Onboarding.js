// First-launch onboarding: 3 dismissible tip cards over a soft backdrop.
import { html, useState } from "../core/html.js";
import { useStore } from "../core/store.js";
import { Bell, Drop, Chat, Check, X } from "./Icons.js";

export function Onboarding() {
  const { t, onboarded, setOnboarded } = useStore();
  const [step, setStep] = useState(0);
  if (onboarded) return null;

  const tips = [
    { icon: Drop, color: "var(--palm)",
      en: "Track every camel & palm", ar: "تابع كل ناقة ونخلة",
      enBody: "Add animals and trees, log weight, growth, vaccines, irrigation and daily care — all saved on your device.",
      arBody: "أضف الحيوانات والأشجار وسجّل الوزن والنمو والتطعيمات والري والرعاية اليومية — محفوظة على جهازك." },
    { icon: Bell, color: "var(--terracotta)",
      en: "Smart alerts keep you ahead", ar: "تنبيهات ذكية تسبق المشاكل",
      enBody: "The alert bar gathers overdue vaccines, missed water/food, irrigation and inspections across your whole farm.",
      arBody: "يجمع شريط التنبيهات التطعيمات المتأخرة والماء والعلف والري والفحوصات لكامل مزرعتك." },
    { icon: Chat, color: "var(--palm)",
      en: "Weather + expert assistant", ar: "الطقس ومساعد خبير",
      enBody: "Live Al Ain weather drives daily advice, and the chat assistant answers camel & palm questions.",
      arBody: "طقس العين المباشر يقدّم نصائح يومية، ويجيب المساعد عن أسئلة الإبل والنخيل." },
  ];
  const tip = tips[step];
  const last = step === tips.length - 1;

  function finish() { setOnboarded(true); }

  return html`<div class="overlay" style=${{ zIndex: 80 }}>
    <div class="modal stack gap-12" style=${{ textAlign: "center" }}>
      <div class="row between">
        <span class="muted" style=${{ fontSize: "12px" }}>${step + 1} / ${tips.length}</span>
        <button class="btn btn-ghost btn-icon" onClick=${finish} aria-label="Skip"><${X} size=${16} /></button>
      </div>
      <span class="avatar" style=${{ background: tip.color, width: "64px", height: "64px", marginInline: "auto" }}><${tip.icon} size=${30} /></span>
      <h3 style=${{ margin: 0, fontFamily: "var(--font-head)" }}>${t(tip.en, tip.ar)}</h3>
      <p class="muted" style=${{ margin: 0 }}>${t(tip.enBody, tip.arBody)}</p>
      <div class="row gap-4" style=${{ justifyContent: "center" }}>
        ${tips.map((_, i) => html`<span key=${i} class="dot" style=${{ width: "8px", height: "8px", background: i === step ? tip.color : "var(--line)" }}></span>`)}
      </div>
      <div class="row gap-8">
        ${step > 0 && html`<button class="btn btn-ghost grow" onClick=${() => setStep(step - 1)}>${t("Back", "رجوع")}</button>`}
        <button class="btn btn-primary grow" onClick=${() => (last ? finish() : setStep(step + 1))}>
          ${last ? html`<${Check} size=${16} />` : null} ${last ? t("Get started", "لنبدأ") : t("Next", "التالي")}
        </button>
      </div>
    </div>
  </div>`;
}
