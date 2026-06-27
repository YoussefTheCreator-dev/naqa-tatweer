import { html, useState, useRef, useEffect } from "../core/html.js";
import { useStore } from "../core/store.js";
import { runDiagnosisModel, preloadPalmModel, preloadCamelModel } from "../utils/diagnosis.js";
import { Camera, Camel, Palm, Check, AlertTriangle, FileText } from "./Icons.js";

const sevTone = { low: "info", medium: "warn", high: "danger" };

export function DiagnosisResult({ result }) {
  const { t } = useStore();
  const pct = Math.round((result.confidence || 0) * 100);
  const healthy = !result.vetRequired && (result.concerns || []).length === 0;
  const rec = t(
    result.recommendation || "",
    result.recommendationAr || result.recommendation || ""
  );
  return html`<div class="card stack gap-12 fade-in">
    <div class="row gap-12" style=${{ alignItems: "center" }}>
      <span class="avatar" style=${{ background: healthy ? "var(--palm)" : "var(--terracotta)", width: "44px", height: "44px" }}>
        ${healthy ? html`<${Check} size=${22} />` : html`<${AlertTriangle} size=${22} />`}
      </span>
      <div class="grow">
        <div class="muted" style=${{ fontSize: "12.5px" }}>${t("Diagnosis result", "نتيجة التشخيص")}</div>
        <div style=${{ fontWeight: 800, fontSize: "20px", fontFamily: "var(--font-head)" }}>${result.condition}</div>
      </div>
    </div>

    <div class="stack gap-4">
      <div class="row between" style=${{ fontSize: "13px" }}>
        <span class="muted">${t("Confidence", "نسبة الثقة")}</span>
        <span style=${{ fontWeight: 700 }}>${pct}%</span>
      </div>
      <div class="conf-bar"><span style=${{ width: pct + "%" }}></span></div>
    </div>

    ${(result.concerns || []).length > 0 &&
      html`<div class="stack gap-8">
        <div class="muted" style=${{ fontSize: "13px", fontWeight: 600 }}>${t("Concerns", "ملاحظات")}</div>
        ${result.concerns.map(
          (c, i) => html`<div key=${i} class="row between" style=${{ padding: "8px 12px", background: "var(--surface-2)", borderRadius: "10px" }}>
            <span style=${{ fontWeight: 600 }}>${c.name}</span>
            <span class=${`badge ${sevTone[c.severity] || "info"}`}>${t(c.severity, c.severity)}</span>
          </div>`
        )}
      </div>`}

    <div style=${{ background: "var(--surface-2)", borderRadius: "10px", padding: "12px 14px" }}>
      <div class="muted" style=${{ fontSize: "12.5px", marginBlockEnd: "2px" }}>${t("Recommendation", "التوصية")}</div>
      <div>${rec}</div>
    </div>

    ${result.vetRequired &&
      html`<div class="vet-banner"><${AlertTriangle} size=${18} /> ${t("Vet visit required", "زيارة بيطرية مطلوبة")}</div>`}
  </div>`;
}

// type: "camel" | "palm". onSave(result) optional → shows Save button.
// onResult(result) optional → notifies parent (used by Quick Scan).
export function DiagnosisTool({ type, onSave, onResult }) {
  const { t, online } = useStore();
  const [image, setImage] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef(null);
  const Icon = type === "camel" ? Camel : Palm;

  // Start downloading TF.js + model weights as soon as the diagnosis card is
  // visible so that by the time the user picks an image, the model is ready.
  useEffect(() => {
    if (type === "palm") preloadPalmModel();
    if (type === "camel") preloadCamelModel();
  }, []);

  if (!online)
    return html`<div class="vet-banner" style=${{ background: "var(--warn-bg)", color: "var(--warn)", borderColor: "#eccb7a" }}>
      <${AlertTriangle} size=${18} /> ${t("Camera diagnosis unavailable offline", "التشخيص بالكاميرا غير متاح بدون اتصال")}
    </div>`;

  function pick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setResult(null);
      setSaved(false);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function run() {
    if (!image) { inputRef.current && inputRef.current.click(); return; }
    setBusy(true);
    setError(null);
    try {
      const r = await runDiagnosisModel(image, type);
      setResult(r);
      onResult && onResult(r, image);
    } catch (e) {
      const msg = e.message || "";
      const isModelMissing =
        msg.includes("model.json") ||
        msg.includes("404") ||
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError");
      if (isModelMissing) {
        setError(type === "camel"
          ? t(
            "Camel model file not found. It should be at models/camel/camel_triage_model.onnx.",
            "ملف نموذج الإبل غير موجود. يجب أن يكون في models/camel/camel_triage_model.onnx."
          )
          : t(
            "Model files not found. Run the Colab notebook (Cell 8), download palm_model.zip, and place the files in models/palm/. See HOW_TO_ADD_MODEL.txt.",
            "ملفات النموذج غير موجودة. شغّل الـ Colab notebook (خلية 8)، نزّل palm_model.zip، وضع الملفات في models/palm/. راجع HOW_TO_ADD_MODEL.txt."
          ));
      } else {
        setError(t("Diagnosis failed: " + msg, "فشل التشخيص: " + msg));
      }
    }
    setBusy(false);
  }

  return html`<div class="stack gap-12">
    ${image
      ? html`<img class="diag-preview" src=${image} alt="preview" />`
      : html`<button type="button" class="diag-drop" onClick=${() => inputRef.current && inputRef.current.click()}>
          <${Camera} size=${30} />
          <div style=${{ fontWeight: 700 }}>${t("Take or upload a photo", "التقط أو ارفع صورة")}</div>
          <div style=${{ fontSize: "13px" }}>${t(type === "camel" ? "Capture the camel clearly" : "Capture the affected fronds/trunk", type === "camel" ? "صوّر الناقة بوضوح" : "صوّر السعف/الجذع المصاب")}</div>
        </button>`}

    <input ref=${inputRef} type="file" accept="image/*" capture="environment" style=${{ display: "none" }} onChange=${pick} />

    <div class="row gap-8">
      ${image && html`<button class="btn btn-ghost" onClick=${() => inputRef.current && inputRef.current.click()}><${Camera} size=${16} /> ${t("Retake", "إعادة")}</button>`}
      <button class="btn btn-primary grow" disabled=${busy} onClick=${run}>
        <${Icon} size=${16} /> ${busy ? t("Analyzing…", "جارٍ التحليل…") : t("Run Diagnosis", "تشغيل التشخيص")}
      </button>
    </div>

    ${error && html`<div class="vet-banner" style=${{ background: "var(--danger-bg,#fef2f2)", color: "var(--danger,#dc2626)", borderColor: "#fca5a5" }}>
      <${AlertTriangle} size=${18} /> ${error}
    </div>`}

    ${result && html`<${DiagnosisResult} result=${result} />`}

    ${result && onSave &&
      html`<button class="btn btn-accent" disabled=${saved} onClick=${() => { onSave(result); setSaved(true); }}>
        <${FileText} size=${16} /> ${saved ? t("Saved to health log ✓", "حُفظ في السجل ✓") : t("Save to health log", "حفظ في السجل الصحي")}
      </button>`}
  </div>`;
}
