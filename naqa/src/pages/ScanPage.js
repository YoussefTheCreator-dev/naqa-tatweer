// Standalone guest Quick Scan — no farm context, nothing saved to localStorage.
import { html, useState } from "../core/html.js";
import { useStore } from "../core/store.js";
import { DiagnosisTool } from "../components/Diagnosis.js";
import { resultToNote } from "../utils/diagnosis.js";
import { Camel, Palm, ArrowLeft, Plus } from "../components/Icons.js";

export function ScanPage({ type, onAddToFarm, onBack }) {
  const { t } = useStore();
  const [result, setResult] = useState(null);
  const Icon = type === "camel" ? Camel : Palm;
  const color = type === "camel" ? "var(--terracotta)" : "var(--palm)";

  return html`<div class="container page-pad stack gap-16 fade-in" style=${{ maxWidth: "620px" }}>
    <button class="back-link" onClick=${onBack}><${ArrowLeft} size=${18} /> ${t("Back to home", "العودة للرئيسية")}</button>

    <div class="card row gap-12" style=${{ alignItems: "center", borderInlineStart: `5px solid ${color}` }}>
      <span class="avatar" style=${{ background: color, width: "46px", height: "46px" }}><${Icon} size=${24} stroke=${1.7} /></span>
      <div>
        <h2 style=${{ margin: 0, fontFamily: "var(--font-head)" }}>${t("Quick Scan", "فحص سريع")} — ${type === "camel" ? t("Camel", "ناقة") : t("Palm", "نخلة")}</h2>
        <div class="muted" style=${{ fontSize: "13px" }}>${t("Nothing will be saved", "لن يتم حفظ أي شيء")}</div>
      </div>
    </div>

    <div class="card"><${DiagnosisTool} type=${type} onResult=${(r) => setResult(r)} /></div>

    ${result &&
      html`<div class="row gap-8 wrap">
        <button class="btn btn-primary grow" onClick=${() => onAddToFarm(type, resultToNote(result, type))}>
          <${Plus} size=${16} /> ${t("Add to my farm", "أضف إلى مزرعتي")}
        </button>
        <button class="btn btn-ghost grow" onClick=${onBack}>${t("Discard and go back", "تجاهل والعودة")}</button>
      </div>`}
  </div>`;
}
