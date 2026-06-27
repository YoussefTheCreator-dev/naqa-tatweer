// Palm Farm module: overview, tree list (search/filter), individual profile
// (photo, tag, agronomic data, production, health logs, irrigation details),
// alerts, and irrigation tracker.
// NOTE: the AI photo disease-diagnosis feature is a separate module wired later.
import { html, useState, Fragment } from "../core/html.js";
import { useStore } from "../core/store.js";
import { FarmOverview } from "./Dashboard.js";
import { Tabs } from "../components/Tabs.js";
import { AlertsPanel } from "../components/AlertsPanel.js";
import { TrendChart } from "../components/TrendChart.js";
import { BackBar } from "../components/Header.js";
import { EmptyState } from "../components/EmptyState.js";
import { Avatar, PhotoUpload } from "../components/Avatar.js";
import { HealthRing, HealthDot, CompletenessBar, Collapsible } from "../components/ProfileBits.js";
import { QrCode } from "../components/Qr.js";
import { Expenses } from "../components/Expenses.js";
import { totalForEntity } from "../utils/expenses.js";
import { DiagnosisTool } from "../components/Diagnosis.js";
import {
  Palm, Leaf, Bell, Drop, Plus, Trash, Camera, Search, Filter, Tag, Printer,
  Sprout, Scissors, FileText, AlertTriangle,
} from "../components/Icons.js";
import { palmAlerts, statusMeta } from "../utils/alerts.js";
import { predictYield } from "../utils/yieldPredict.js";
import { uid, todayISO, formatDate, daysBetween } from "../utils/helpers.js";
import { completeness } from "../utils/completeness.js";

const VARIETIES = ["Khalas", "Khenaizi", "Lulu", "Fardh", "Barhi", "Medjool", "Sullaj", "Dabbas", "Other"];

function StatusBadge({ status }) {
  const { t } = useStore();
  const m = statusMeta[status] || statusMeta.healthy;
  return html`<span class=${`badge ${m.tone}`}><span class="dot" style=${{ background: "currentColor" }}></span>${t(m.en, m.ar)}</span>`;
}

function ageFromPlanting(p) {
  if (p.plantingDate) return Math.max(0, Math.floor(daysBetween(p.plantingDate, todayISO()) / 365));
  return p.age || 0;
}

// ---------------- Next harvest estimate (Feature 7) ----------------
function HarvestEstimate({ palm }) {
  const { t, lang } = useStore();
  const p = predictYield(palm);
  return html`<div class="card harvest-card">
    <h3 class="section-title" style=${{ marginBlockStart: 0 }}><${Sprout} size=${18} /> ${t("Next Harvest Estimate", "تقدير الحصاد القادم")}</h3>
    ${!p
      ? html`<div class="empty" style=${{ padding: "18px" }}>${t("Add your first harvest record to enable predictions", "أضف أول سجل حصاد لتفعيل التوقعات")}</div>`
      : html`<div class="stack gap-10">
          <div class="row gap-12 wrap" style=${{ alignItems: "baseline" }}>
            <div class="harvest-month">${p.inSeason ? t("In season now", "في الموسم الآن") : (lang === "ar" ? p.season.ar : p.monthLabel)}</div>
            ${!p.inSeason && html`<span class="badge info">${p.countdown} ${t("days to go", "يوم متبقٍ")}</span>`}
          </div>
          <div class="muted" style=${{ fontSize: "13.5px" }}>${t("Harvest season", "موسم الحصاد")}: <b>${lang === "ar" ? p.season.ar : p.season.en}</b> · ${palm.variety}</div>
          ${p.lastYield
            ? html`<div class="harvest-yield">
                ${t("Based on last yield of", "بناءً على آخر محصول")} <b>${p.lastYield} kg</b> — ${t("target yield", "المحصول المستهدف")} <b style=${{ color: "var(--palm)" }}>${p.targetYield} kg</b>
                ${p.healthy ? html`<span class="muted"> (+5%)</span>` : null}
              </div>`
            : null}
        </div>`}
  </div>`;
}

// ---------------- Tree list ----------------
function Grove({ palms, onOpen, onAdd }) {
  const { t } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = palms.filter((p) => {
    const matchQ = !q || `${p.code} ${p.tagNumber || ""} ${p.variety}`.toLowerCase().includes(q.toLowerCase());
    return matchQ && (status === "all" || p.status === status);
  });

  return html`<div class="stack gap-12">
    <div class="row between wrap gap-8">
      <h3 class="section-title" style=${{ margin: 0 }}>${t("The Grove", "البستان")} <span class="muted">(${palms.length})</span></h3>
      <button class="btn btn-primary btn-sm" onClick=${onAdd}><${Plus} size=${16} /> ${t("Add Tree", "إضافة نخلة")}</button>
    </div>

    ${palms.length === 0
      ? html`<${EmptyState} type="palm"
          title=${t("No trees yet", "لا توجد نخيل بعد")}
          subtitle=${t("Plant your digital grove — add your first palm with its variety, tag and photo.", "ابدأ بستانك الرقمي — أضف أول نخلة مع الصنف والوسم والصورة.")}
          cta=${t("Add your first palm", "أضف أول نخلة")} onCta=${onAdd} />`
      : html`<${Fragment}>
          <div class="row gap-8 wrap">
            <span class="search grow">
              <${Search} size=${16} />
              <input placeholder=${t("Search code, tag or variety…", "ابحث بالرمز أو الوسم أو الصنف…")} value=${q} onInput=${(e) => setQ(e.target.value)} />
            </span>
            <span class="search">
              <${Filter} size=${16} />
              <select value=${status} onChange=${(e) => setStatus(e.target.value)}>
                <option value="all">${t("All statuses", "كل الحالات")}</option>
                <option value="healthy">${t("Healthy", "سليم")}</option>
                <option value="attention">${t("Attention", "مراقبة")}</option>
                <option value="diseased">${t("Diseased", "مصاب")}</option>
              </select>
            </span>
          </div>

          ${filtered.length === 0
            ? html`<div class="card empty">${t("No trees match your search.", "لا نتائج مطابقة.")}</div>`
            : html`<div class="grid grid-list">
                ${filtered.map((p) => html`<button key=${p.id} class="card hover stack gap-8" style=${{ textAlign: "start", cursor: "pointer" }} onClick=${() => onOpen(p.id)}>
                  <div class="row gap-12">
                    <${HealthRing} status=${p.status} size=${46}><${Avatar} photo=${p.photo} type="palm" size=${46} /><//>
                    <div class="grow">
                      <div class="row gap-8" style=${{ alignItems: "center" }}>
                        <span style=${{ fontWeight: 800, fontSize: "17px" }}>${p.code}</span>
                        <${HealthDot} status=${p.status} size=${10} />
                      </div>
                      <div class="muted" style=${{ fontSize: "13px" }}>${p.variety} · ${t("Sec", "قطاع")} ${p.section}</div>
                    </div>
                  </div>
                  <div class="row between">
                    ${p.tagNumber ? html`<span class="badge info"><${Tag} size=${12} /> #${p.tagNumber}</span>` : html`<span></span>`}
                    <span class="muted" style=${{ fontSize: "12px" }}>${t("Inspected", "فحص")} ${formatDate(p.lastInspection)}</span>
                  </div>
                </button>`)}
              </div>`}
        <//>`}
  </div>`;
}

// ---------------- Add tree ----------------
function AddPalm({ onCancel, onSave, prefill }) {
  const { t } = useStore();
  const [f, setF] = useState({ code: "", tagNumber: "", variety: "Khalas", plantingDate: "", section: "A", status: "healthy", notes: prefill || "" });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  function submit(e) {
    e.preventDefault();
    if (!f.code.trim()) return;
    const age = f.plantingDate ? Math.floor(daysBetween(f.plantingDate, todayISO()) / 365) : 0;
    onSave({
      id: uid("palm"), code: f.code.trim(), tagNumber: f.tagNumber.trim(),
      variety: f.variety, plantingDate: f.plantingDate, age,
      section: f.section, status: f.status, lastInspection: todayISO(),
      growthLog: [], treatments: [], irrigationLog: [], nextFertilise: "",
      photo: "", offshoots: 0, pollination: "not yet", soilType: "sandy",
      irrigationMethod: "drip", waterSource: "well", litresPerSession: 0,
      harvestLog: [], pestLog: [], fertiliserLog: [], notes: f.notes,
    });
  }
  return html`<form class="card stack" style=${{ maxWidth: "520px", margin: "0 auto" }} onSubmit=${submit}>
    <h3 class="section-title" style=${{ marginBlockStart: 0 }}>${t("Add New Palm Tree", "إضافة نخلة جديدة")}</h3>
    <div class="grid grid-2">
      <div class="field"><label>${t("Tree ID / Code", "رمز الشجرة")}</label><input class="input" value=${f.code} onInput=${set("code")} placeholder="P-A03" required /></div>
      <div class="field"><label>${t("Tag number", "رقم الوسم")}</label><input class="input" value=${f.tagNumber} onInput=${set("tagNumber")} placeholder="PLM-007" /></div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>${t("Variety", "الصنف")}</label>
        <select class="select" value=${f.variety} onChange=${set("variety")}>
          ${VARIETIES.map((v) => html`<option key=${v}>${v}</option>`)}
        </select>
      </div>
      <div class="field"><label>${t("Planting date", "تاريخ الزراعة")}</label><input class="input" type="date" value=${f.plantingDate} onChange=${set("plantingDate")} /></div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>${t("Section", "القطاع")}</label><input class="input" value=${f.section} onInput=${set("section")} /></div>
      <div class="field"><label>${t("Status", "الحالة")}</label>
        <select class="select" value=${f.status} onChange=${set("status")}>
          <option value="healthy">${t("Healthy", "سليم")}</option>
          <option value="attention">${t("Attention", "مراقبة")}</option>
          <option value="diseased">${t("Diseased", "مصاب")}</option>
        </select>
      </div>
    </div>
    <div class="field"><label>${t("Notes", "ملاحظات")}</label><textarea class="input" rows="2" value=${f.notes} onInput=${set("notes")}></textarea></div>
    <div class="row gap-8">
      <button type="submit" class="btn btn-primary grow">${t("Save Tree", "حفظ")}</button>
      <button type="button" class="btn btn-ghost" onClick=${onCancel}>${t("Cancel", "إلغاء")}</button>
    </div>
  </form>`;
}

// ---------------- Profile ----------------
function PalmProfile({ palm, onBack }) {
  const { t, updatePalm, removePalm, expenses } = useStore();
  const totalCost = totalForEntity(expenses, palm.id);
  const [h, setH] = useState("");
  const [irr, setIrr] = useState("");
  const [tr, setTr] = useState({ type: "Inspection", note: "" });
  const [harvest, setHarvest] = useState("");
  const [pest, setPest] = useState({ type: "", treatment: "" });
  const [fert, setFert] = useState({ type: "", qty: "" });
  const upd = (patch) => updatePalm(palm.id, patch);
  const fld = (k) => (e) => upd({ [k]: e.target.value });

  const growth = (palm.growthLog || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const comp = completeness(palm, "palm");

  function addGrowth(e) { e.preventDefault(); const v = Number(h); if (!v) return; upd({ growthLog: [...(palm.growthLog || []), { date: todayISO(), height: v }], height: v }); setH(""); }
  function addIrrigation(e) { e.preventDefault(); const v = Number(irr); if (!v) return; upd({ irrigationLog: [...(palm.irrigationLog || []), { date: todayISO(), litres: v }] }); setIrr(""); }
  function addTreatment(e) {
    e.preventDefault();
    if (!tr.note.trim() && tr.type !== "Inspection") return;
    const patch = { treatments: [...(palm.treatments || []), { id: uid("t"), date: todayISO(), type: tr.type, note: tr.note.trim() }], lastInspection: todayISO() };
    if (tr.type === "Fertilisation") { const d = new Date(); d.setDate(d.getDate() + 60); patch.nextFertilise = d.toISOString().slice(0, 10); }
    if (tr.type === "Pruning") { const d = new Date(); d.setDate(d.getDate() + 182); patch.lastPruning = todayISO(); patch.nextPruning = d.toISOString().slice(0, 10); }
    upd(patch); setTr({ type: "Inspection", note: "" });
  }
  function addHarvest(e) { e.preventDefault(); const v = Number(harvest); if (!v) return; upd({ harvestLog: [...(palm.harvestLog || []), { id: uid("h"), date: todayISO(), kg: v }], lastYield: v }); setHarvest(""); }
  function addPest(e) { e.preventDefault(); if (!pest.type.trim()) return; upd({ pestLog: [...(palm.pestLog || []), { id: uid("pl"), date: todayISO(), type: pest.type.trim(), treatment: pest.treatment.trim() }] }); setPest({ type: "", treatment: "" }); }
  function addFert(e) { e.preventDefault(); if (!fert.type.trim()) return; upd({ fertiliserLog: [...(palm.fertiliserLog || []), { id: uid("fl"), date: todayISO(), type: fert.type.trim(), qty: fert.qty.trim() }] }); setFert({ type: "", qty: "" }); }

  function saveDiagnosis(r) {
    const entry = { id: uid("dx"), date: todayISO(), condition: r.condition, confidence: r.confidence, recommendation: r.recommendation, vetRequired: r.vetRequired };
    upd({ healthLog: [entry, ...(palm.healthLog || [])] });
  }

  // Set pruning date helper when last pruning entered manually
  function onLastPruning(e) {
    const v = e.target.value;
    const patch = { lastPruning: v };
    if (v) { const d = new Date(v); d.setDate(d.getDate() + 182); patch.nextPruning = d.toISOString().slice(0, 10); }
    upd(patch);
  }

  return html`<div class="stack gap-16 fade-in profile-print">
    <${BackBar} onBack=${onBack}>
      <button class="btn btn-ghost btn-sm no-print" style=${{ padding: "6px 10px", fontSize: "13px" }} onClick=${() => window.print()}><${Printer} size=${14} /> ${t("Export", "تصدير")}</button>
      <select class="select btn-sm no-print" style=${{ width: "auto", padding: "6px 10px", fontSize: "13px" }} value=${palm.status} onChange=${fld("status")}>
        <option value="healthy">${t("Healthy", "سليم")}</option>
        <option value="attention">${t("Attention", "مراقبة")}</option>
        <option value="diseased">${t("Diseased", "مصاب")}</option>
      </select>
    <//>

    <!-- Identity -->
    <div class="card stack gap-12">
      <div class="row gap-16 wrap">
        <${HealthRing} status=${palm.status} size=${84}>
          <${PhotoUpload} photo=${palm.photo} type="palm" size=${84} onChange=${(p) => upd({ photo: p })} />
        <//>
        <div class="grow" style=${{ minWidth: 0 }}>
          <div class="row gap-8 wrap" style=${{ alignItems: "center" }}>
            <h2 style=${{ margin: 0, fontFamily: "var(--font-head)" }}>${palm.code}</h2>
            ${palm.tagNumber ? html`<span class="badge info" style=${{ fontSize: "13px" }}><${Tag} size=${13} /> #${palm.tagNumber}</span>` : null}
            <${StatusBadge} status=${palm.status} />
          </div>
          <div class="muted">${palm.variety} · ${ageFromPlanting(palm)} ${t("years", "سنة")} · ${t("Section", "قطاع")} ${palm.section} · ${t("Inspected", "فحص")} ${formatDate(palm.lastInspection)}</div>
          <div style=${{ marginBlockStart: "10px", maxWidth: "320px" }}><${CompletenessBar} percent=${comp} /></div>
          <div class="muted" style=${{ marginBlockStart: "8px", fontSize: "13px" }}>💰 ${t("Total cost to date", "إجمالي التكلفة")}: <b style=${{ color: "var(--ink)" }}>AED ${totalCost.toLocaleString()}</b></div>
        </div>
      </div>
      <div style=${{ display: "flex", justifyContent: "center" }}>
        <${QrCode} type="palm" id=${palm.id} name=${palm.code} tag=${palm.tagNumber}
          label=${t("Scan to open this profile", "امسح لفتح هذا الملف")} />
      </div>
    </div>

    <${HarvestEstimate} palm=${palm} />

    <!-- AI Health Diagnosis -->
    <div class="card no-print">
      <h3 class="section-title" style=${{ marginBlockStart: 0 }}><${Camera} size=${18} /> ${t("AI Leaf Diagnosis", "تشخيص الأوراق بالذكاء الاصطناعي")}</h3>
      <${DiagnosisTool} type="palm" onSave=${saveDiagnosis} />
      ${(palm.healthLog || []).length > 0 &&
        html`<div class="stack" style=${{ marginBlockStart: "12px" }}>
          <div class="muted" style=${{ fontWeight: 600, fontSize: "13px" }}>${t("Diagnosis history", "سجل التشخيص")}</div>
          ${palm.healthLog.map((e) => html`<div key=${e.id} class="row between" style=${{ padding: "8px 0", borderBlockEnd: "1px solid var(--line)" }}>
            <span class="row gap-8">${e.vetRequired ? html`<${AlertTriangle} size=${15} style=${{ color: "var(--danger)" }} />` : null}<span style=${{ fontWeight: 600 }}>${e.condition}</span> <span class="muted">${Math.round((e.confidence || 0) * 100)}%</span></span>
            <span class="muted">${formatDate(e.date)}</span>
          </div>`)}
        </div>`}
    </div>

    <!-- Growth chart -->
    <div class="card">
      <h3 class="section-title" style=${{ marginBlockStart: 0 }}><${Leaf} size=${18} /> ${t("Growth Log (height m)", "سجل النمو (الارتفاع م)")}</h3>
      <${TrendChart} data=${growth} yKey="height" unit="m" color="var(--palm)" />
      <form class="row gap-8 no-print" style=${{ marginBlockStart: "10px" }} onSubmit=${addGrowth}>
        <input class="input" type="number" step="0.01" min="0" placeholder=${t("Current height (m)", "الارتفاع الحالي (م)")} value=${h} onInput=${(e) => setH(e.target.value)} />
        <button class="btn btn-primary"><${Plus} size=${16} /> ${t("Log", "تسجيل")}</button>
      </form>
    </div>

    <!-- Agronomic data -->
    <${Collapsible} title=${t("Agronomic Data", "بيانات زراعية")} icon=${Sprout}>
      <div class="grid grid-2">
        <div class="field"><label>${t("Variety", "الصنف")}</label>
          <select class="select" value=${palm.variety} onChange=${fld("variety")}>${VARIETIES.map((v) => html`<option key=${v}>${v}</option>`)}</select>
        </div>
        <div class="field"><label>${t("Planting date (age auto)", "تاريخ الزراعة (العمر تلقائي)")}</label><input class="input" type="date" value=${palm.plantingDate || ""} onChange=${fld("plantingDate")} /></div>
      </div>
      <div class="grid grid-2">
        <div class="field"><label>${t("Height (m)", "الارتفاع (م)")}</label><input class="input" type="number" step="0.01" value=${palm.height || ""} onInput=${fld("height")} /></div>
        <div class="field"><label>${t("Offshoots / fronds", "الفسائل / السعف")}</label><input class="input" type="number" value=${palm.offshoots || ""} onInput=${fld("offshoots")} /></div>
      </div>
      <div class="grid grid-2">
        <div class="field"><label>${t("Pollination status", "حالة التلقيح")}</label>
          <select class="select" value=${palm.pollination || "not yet"} onChange=${fld("pollination")}>
            <option value="pollinated">${t("Pollinated", "ملقّحة")}</option>
            <option value="not yet">${t("Not yet", "ليس بعد")}</option>
            <option value="n/a">${t("Not applicable", "لا ينطبق")}</option>
          </select>
        </div>
        <div class="field"><label>${t("Soil type", "نوع التربة")}</label>
          <select class="select" value=${palm.soilType || "sandy"} onChange=${fld("soilType")}>
            <option value="sandy">${t("Sandy", "رملية")}</option>
            <option value="loamy">${t("Loamy", "طميية")}</option>
            <option value="clay">${t("Clay", "طينية")}</option>
            <option value="mixed">${t("Mixed", "مختلطة")}</option>
          </select>
        </div>
      </div>
      <div class="grid grid-2">
        <div class="field"><label>${t("Last pruning (sets next +6mo)", "آخر تقليم (يحدد التالي +6 أشهر)")}</label><input class="input" type="date" value=${palm.lastPruning || ""} onChange=${onLastPruning} /></div>
        <div class="field"><label>${t("Next pruning due", "التقليم القادم")}</label><input class="input" value=${formatDate(palm.nextPruning)} disabled /></div>
      </div>
    <//>

    <!-- Production -->
    <${Collapsible} title=${t("Production", "الإنتاج")} icon=${FileText} defaultOpen=${false}>
      <div class="grid grid-2">
        <div class="field"><label>${t("Expected harvest date", "تاريخ الحصاد المتوقع")}</label><input class="input" type="date" value=${palm.expectedHarvest || ""} onChange=${fld("expectedHarvest")} /></div>
        <div class="field"><label>${t("Last harvest yield (kg)", "آخر محصول (كجم)")}</label><input class="input" value=${palm.lastYield || ""} disabled /></div>
      </div>
      ${(palm.harvestLog || []).length
        ? html`<table class="table"><thead><tr><th>${t("Date", "التاريخ")}</th><th>${t("Yield (kg)", "المحصول")}</th></tr></thead><tbody>
            ${palm.harvestLog.slice().reverse().map((hv) => html`<tr key=${hv.id}><td class="muted">${formatDate(hv.date)}</td><td style=${{ fontWeight: 700 }}>${hv.kg} kg</td></tr>`)}
          </tbody></table>`
        : html`<div class="empty">${t("No harvest history.", "لا يوجد سجل حصاد.")}</div>`}
      <form class="row gap-8 no-print" onSubmit=${addHarvest}>
        <input class="input grow" type="number" min="0" placeholder=${t("Yield this harvest (kg)", "محصول هذا الحصاد (كجم)")} value=${harvest} onInput=${(e) => setHarvest(e.target.value)} />
        <button class="btn btn-primary"><${Plus} size=${16} /> ${t("Log", "تسجيل")}</button>
      </form>
    <//>

    <!-- Health logs -->
    <${Collapsible} title=${t("Health: Pests & Fertiliser", "الصحة: الآفات والتسميد")} icon=${Leaf} defaultOpen=${false}>
      <div>
        <div class="muted" style=${{ fontWeight: 600, fontSize: "13px", marginBlockEnd: "4px" }}>${t("Pest / disease log", "سجل الآفات / الأمراض")}</div>
        ${(palm.pestLog || []).length
          ? html`<table class="table"><thead><tr><th>${t("Date", "التاريخ")}</th><th>${t("Issue", "المشكلة")}</th><th>${t("Treatment", "العلاج")}</th></tr></thead><tbody>
              ${palm.pestLog.slice().reverse().map((pl) => html`<tr key=${pl.id}><td class="muted">${formatDate(pl.date)}</td><td>${pl.type}</td><td>${pl.treatment || "—"}</td></tr>`)}
            </tbody></table>`
          : html`<div class="empty">${t("No pest records.", "لا سجلات آفات.")}</div>`}
        <form class="row gap-8 wrap no-print" onSubmit=${addPest}>
          <input class="input grow" placeholder=${t("Pest / disease", "آفة / مرض")} value=${pest.type} onInput=${(e) => setPest((s) => ({ ...s, type: e.target.value }))} />
          <input class="input grow" placeholder=${t("Treatment / pesticide", "علاج / مبيد")} value=${pest.treatment} onInput=${(e) => setPest((s) => ({ ...s, treatment: e.target.value }))} />
          <button class="btn btn-primary"><${Plus} size=${16} /></button>
        </form>
      </div>
      <div>
        <div class="muted" style=${{ fontWeight: 600, fontSize: "13px", marginBlock: "8px 4px" }}>${t("Fertiliser log", "سجل التسميد")}</div>
        ${(palm.fertiliserLog || []).length
          ? html`<table class="table"><thead><tr><th>${t("Date", "التاريخ")}</th><th>${t("Type", "النوع")}</th><th>${t("Qty", "الكمية")}</th></tr></thead><tbody>
              ${palm.fertiliserLog.slice().reverse().map((fl) => html`<tr key=${fl.id}><td class="muted">${formatDate(fl.date)}</td><td>${fl.type}</td><td>${fl.qty || "—"}</td></tr>`)}
            </tbody></table>`
          : html`<div class="empty">${t("No fertiliser records.", "لا سجلات تسميد.")}</div>`}
        <form class="row gap-8 wrap no-print" onSubmit=${addFert}>
          <input class="input grow" placeholder=${t("Fertiliser type", "نوع السماد")} value=${fert.type} onInput=${(e) => setFert((s) => ({ ...s, type: e.target.value }))} />
          <input class="input" style=${{ width: "110px" }} placeholder=${t("Qty", "الكمية")} value=${fert.qty} onInput=${(e) => setFert((s) => ({ ...s, qty: e.target.value }))} />
          <button class="btn btn-primary"><${Plus} size=${16} /></button>
        </form>
      </div>
    <//>

    <!-- Treatment history -->
    <div class="card">
      <h3 class="section-title" style=${{ marginBlockStart: 0 }}><${Scissors} size=${18} /> ${t("Treatment History", "سجل المعالجات")}</h3>
      ${(palm.treatments || []).length === 0
        ? html`<div class="empty">${t("No treatments recorded.", "لا توجد معالجات.")}</div>`
        : html`<table class="table"><thead><tr><th>${t("Date", "التاريخ")}</th><th>${t("Type", "النوع")}</th><th>${t("Note", "ملاحظة")}</th></tr></thead><tbody>
            ${palm.treatments.slice().reverse().map((tt) => html`<tr key=${tt.id}>
              <td class="muted">${formatDate(tt.date)}</td>
              <td><span class="badge info">${tt.type}</span></td>
              <td>${tt.note || "—"}</td>
            </tr>`)}
          </tbody></table>`}
      <form class="row gap-8 wrap no-print" style=${{ marginBlockStart: "10px" }} onSubmit=${addTreatment}>
        <select class="select" style=${{ width: "auto" }} value=${tr.type} onChange=${(e) => setTr((s) => ({ ...s, type: e.target.value }))}>
          ${["Inspection", "Fertilisation", "Pollination", "Pruning", "Pesticide"].map((x) => html`<option key=${x}>${x}</option>`)}
        </select>
        <input class="input grow" placeholder=${t("Note", "ملاحظة")} value=${tr.note} onInput=${(e) => setTr((s) => ({ ...s, note: e.target.value }))} />
        <button class="btn btn-primary"><${Plus} size=${16} /></button>
      </form>
    </div>

    <!-- Irrigation -->
    <div class="card">
      <h3 class="section-title" style=${{ marginBlockStart: 0 }}><${Drop} size=${18} /> ${t("Irrigation", "الري")}</h3>
      <div class="grid grid-3">
        <div class="field"><label>${t("Method", "الطريقة")}</label>
          <select class="select" value=${palm.irrigationMethod || "drip"} onChange=${fld("irrigationMethod")}>
            <option value="drip">${t("Drip", "تنقيط")}</option>
            <option value="flood">${t("Flood", "غمر")}</option>
            <option value="sprinkler">${t("Sprinkler", "رش")}</option>
          </select>
        </div>
        <div class="field"><label>${t("Water source", "مصدر الماء")}</label>
          <select class="select" value=${palm.waterSource || "well"} onChange=${fld("waterSource")}>
            <option value="well">${t("Well", "بئر")}</option>
            <option value="network">${t("Network", "شبكة")}</option>
            <option value="tanker">${t("Tanker", "صهريج")}</option>
          </select>
        </div>
        <div class="field"><label>${t("Litres / session", "لتر / ريّة")}</label><input class="input" type="number" value=${palm.litresPerSession || ""} onInput=${fld("litresPerSession")} /></div>
      </div>
      ${(palm.irrigationLog || []).length === 0
        ? html`<div class="empty">${t("No irrigation logged.", "لا يوجد ري مسجل.")}</div>`
        : html`<div class="stack">
            ${palm.irrigationLog.slice().reverse().slice(0, 8).map((i, idx) => html`<div key=${idx} class="row between" style=${{ padding: "8px 0", borderBlockEnd: "1px solid var(--line)" }}>
              <span class="row gap-8"><${Drop} size=${16} /> ${i.litres} L</span>
              <span class="muted">${formatDate(i.date)}</span>
            </div>`)}
          </div>`}
      <form class="row gap-8 no-print" style=${{ marginBlockStart: "10px" }} onSubmit=${addIrrigation}>
        <input class="input" type="number" min="0" placeholder=${t("Litres today", "لترات اليوم")} value=${irr} onInput=${(e) => setIrr(e.target.value)} />
        <button class="btn btn-primary"><${Plus} size=${16} /> ${t("Log", "تسجيل")}</button>
      </form>
    </div>

    <!-- Notes -->
    <div class="card">
      <h3 class="section-title" style=${{ marginBlockStart: 0 }}>${t("Notes", "ملاحظات")}</h3>
      <textarea class="input" rows="3" value=${palm.notes || ""} onInput=${fld("notes")} placeholder=${t("Observations, scan results, history…", "ملاحظات، نتائج الفحص، السجل…")}></textarea>
    </div>

    <!-- Delete palm — always visible at bottom -->
    <div class="card no-print" style=${{ borderColor: "var(--danger)", background: "var(--danger-bg)" }}>
      <div class="row between" style=${{ alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <div style=${{ fontWeight: 700, color: "var(--danger)" }}>${t("Delete Tree", "حذف النخلة")}</div>
          <div class="muted" style=${{ fontSize: "13px" }}>${t("This action cannot be undone.", "لا يمكن التراجع عن هذا الإجراء.")}</div>
        </div>
        <button class="btn no-print" style=${{ background: "var(--danger)", color: "#fff", minWidth: "120px" }}
          onClick=${() => { if (confirm(t("Delete this tree? This cannot be undone.", "حذف هذه النخلة؟ لا يمكن التراجع."))) { removePalm(palm.id); onBack(); } }}>
          <${Trash} size=${16} /> ${t("Delete", "حذف")}
        </button>
      </div>
    </div>
  </div>`;
}

// ---------------- Irrigation tracker (per section) ----------------
function Irrigation({ palms }) {
  const { t, updatePalm } = useStore();
  const sections = [...new Set(palms.map((p) => p.section))].sort();
  function waterSection(sec) {
    const litres = Number(prompt(t("Litres per tree for section " + sec + "?", "لترات لكل نخلة في القطاع " + sec + "؟"), "120"));
    if (!litres) return;
    palms.filter((p) => p.section === sec).forEach((p) =>
      updatePalm(p.id, { irrigationLog: [...(p.irrigationLog || []), { date: todayISO(), litres }] }));
  }
  return html`<div class="stack gap-12">
    <h3 class="section-title" style=${{ margin: 0 }}><${Drop} size=${18} /> ${t("Irrigation by Section", "الري حسب القطاع")}</h3>
    ${sections.length === 0
      ? html`<div class="card empty">${t("Add trees to manage irrigation.", "أضف نخيلاً لإدارة الري.")}</div>`
      : html`<div class="grid grid-list">
          ${sections.map((sec) => {
            const trees = palms.filter((p) => p.section === sec);
            const total = trees.reduce((s, p) => s + (p.irrigationLog || []).filter((i) => i.date === todayISO()).reduce((a, i) => a + i.litres, 0), 0);
            return html`<div key=${sec} class="card stack gap-8">
              <div class="row between"><div style=${{ fontWeight: 800, fontSize: "18px" }}>${t("Section", "قطاع")} ${sec}</div><span class="badge info">${trees.length} ${t("trees", "نخلة")}</span></div>
              <div class="muted">${t("Today:", "اليوم:")} <b>${total} L</b></div>
              <button class="btn btn-primary btn-block" onClick=${() => waterSection(sec)}><${Drop} size=${16} /> ${t("Log irrigation", "تسجيل الري")}</button>
            </div>`;
          })}
        </div>`}
  </div>`;
}

// 7-day total irrigation litres for overview sparkline.
function irrigationSeries(palms) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    let litres = 0;
    palms.forEach((p) => (p.irrigationLog || []).forEach((r) => { if (r.date === day) litres += r.litres; }));
    days.push(litres);
  }
  return days;
}

// ---------------- Module root ----------------
export function PalmFarm({ weather, openId, onOpen, onBack, addPrefill }) {
  const { t, palms, addPalm } = useStore();
  const [tab, setTab] = useState(addPrefill ? "grove" : "overview");
  const [adding, setAdding] = useState(!!addPrefill);

  const alerts = palmAlerts(palms);
  const selected = palms.find((p) => p.id === openId);

  function handleSave(p) { addPalm(p); setAdding(false); onOpen(p.id); }

  if (selected) return html`<div class="page-pad"><${PalmProfile} palm=${selected} onBack=${onBack} /></div>`;
  if (adding) return html`<div class="page-pad"><${AddPalm} onCancel=${() => setAdding(false)} onSave=${handleSave} prefill=${addPrefill} /></div>`;

  const irrSpark = irrigationSeries(palms);
  const stats = [
    { icon: Palm, value: palms.length, label: t("Total trees", "إجمالي النخيل"), tone: "palm" },
    { icon: Leaf, value: palms.filter((p) => p.status === "healthy").length, label: t("Healthy", "سليمة"), tone: "palm" },
    { icon: Bell, value: alerts.length, label: t("Active alerts", "تنبيهات"), tone: alerts.length ? "danger" : "palm" },
    { icon: Drop, value: irrSpark.reduce((a, b) => a + b, 0) + "L", label: t("7-day water", "ماء 7 أيام"), tone: "info", spark: irrSpark },
  ];

  const tabs = [
    { key: "overview", label: t("Overview", "نظرة عامة") },
    { key: "grove", label: t("Trees", "النخيل") },
    { key: "alerts", label: t("Alerts", "تنبيهات"), badge: alerts.length || null },
    { key: "irrigation", label: t("Irrigation", "الري") },
    { key: "expenses", label: t("Expenses", "المصروفات") },
  ];

  return html`<div class="page-pad stack gap-16">
    <${Tabs} tabs=${tabs} active=${tab} onChange=${setTab} />
    ${tab === "overview" &&
      html`<${FarmOverview} farmType="palm" weather=${weather} stats=${stats}>
        <div class="stack gap-8">
          <h3 class="section-title" style=${{ margin: "4px 0 0" }}>${t("Recent Alerts", "أحدث التنبيهات")}</h3>
          <${AlertsPanel} alerts=${alerts.slice(0, 4)} onSelect=${(a) => onOpen(a.id)} />
        </div>
      <//>`}
    ${tab === "grove" && html`<${Grove} palms=${palms} onOpen=${onOpen} onAdd=${() => setAdding(true)} />`}
    ${tab === "alerts" && html`<${AlertsPanel} alerts=${alerts} onSelect=${(a) => onOpen(a.id)} />`}
    ${tab === "irrigation" && html`<${Irrigation} palms=${palms} />`}
    ${tab === "expenses" && html`<${Expenses} scope="palm" />`}
  </div>`;
}