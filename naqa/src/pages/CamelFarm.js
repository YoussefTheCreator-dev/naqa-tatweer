// Camel Farm module: overview, herd list (search/filter), individual profile
// (photo, tag, daily care, weight chart, vitals, vaccines, breeding, location,
// export), alerts, and water & feed tracker.
import { html, useState, useEffect, Fragment } from "../core/html.js";
import { useStore } from "../core/store.js";
import { FarmOverview } from "./Dashboard.js";
import { Tabs } from "../components/Tabs.js";
import { AlertsPanel } from "../components/AlertsPanel.js";
import { TrendChart } from "../components/TrendChart.js";
import { BackBar } from "../components/Header.js";
import { EmptyState } from "../components/EmptyState.js";
import { Avatar, PhotoUpload } from "../components/Avatar.js";
import { HealthRing, HealthDot, CompletenessBar, Collapsible, ScoreDots } from "../components/ProfileBits.js";
import { QrCode } from "../components/Qr.js";
import { ContactsModal } from "../components/Contacts.js";
import { Expenses } from "../components/Expenses.js";
import { totalForEntity } from "../utils/expenses.js";
import { DiagnosisTool } from "../components/Diagnosis.js";
import {
  Camel, Scale, Heart, Bell, Drop, Plus, Syringe, Trash, Search, Filter, Tag,
  Thermometer, MapPin, Activity, Printer, Male, Female, Clock, Camera, AlertTriangle, FileText, Users,
} from "../components/Icons.js";
import { camelAlerts, statusMeta } from "../utils/alerts.js";
import { weightTrend } from "../utils/weight.js";
import { breedingInfo, breedingMilestones, expectedBirthISO } from "../utils/breeding.js";
import { printCamelPassport } from "../utils/passport.js";
import { uid, todayISO, formatDate, dueLabel, daysBetween } from "../utils/helpers.js";
import { CARE_ITEMS, careForDay, todayCompletion } from "../utils/care.js";
import { completeness } from "../utils/completeness.js";

const careIcons = { Drop, Heart, Activity, Scale };

function StatusBadge({ status }) {
  const { t } = useStore();
  const m = statusMeta[status] || statusMeta.healthy;
  return html`<span class=${`badge ${m.tone}`}><span class="dot" style=${{ background: "currentColor" }}></span>${t(m.en, m.ar)}</span>`;
}

// Weight trend arrow: ↑ green gaining, ↓ red losing >5%, → grey stable.
function TrendArrow({ camel }) {
  const { t } = useStore();
  const { dir, pct } = weightTrend(camel);
  const meta = {
    up: { ch: "↑", color: "var(--ok)", lbl: t("gaining", "زيادة") },
    down: { ch: "↓", color: "var(--danger)", lbl: t("losing", "نقص") },
    flat: { ch: "→", color: "var(--ink-soft)", lbl: t("stable", "مستقر") },
  }[dir];
  return html`<span title=${`${meta.lbl} ${Math.abs(Math.round(pct))}% / 30d`}
    style=${{ color: meta.color, fontWeight: 800, fontSize: "16px", marginInlineStart: "4px" }}>
    ${meta.ch} ${Math.abs(Math.round(pct))}%
  </span>`;
}

// ---------------- Daily care ----------------
function DailyCare({ camel }) {
  const { t, dailyCare, toggleCare, setCareNote, lang } = useStore();
  const rec = careForDay(dailyCare, camel.id);
  const fmtTime = (iso) => {
    try { return new Date(iso).toLocaleTimeString(lang === "ar" ? "ar-AE" : "en-GB", { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };
  return html`<div class="card">
    <div class="row between" style=${{ marginBlockEnd: "10px" }}>
      <h3 class="section-title" style=${{ margin: 0 }}><${Clock} size=${18} /> ${t("Daily Care", "الرعاية اليومية")}</h3>
      <span class="muted" style=${{ fontSize: "12.5px" }}>${t("Resets daily", "تُعاد يومياً")} · ${formatDate(todayISO())}</span>
    </div>
    <div class="stack gap-8">
      ${CARE_ITEMS.map((item) => {
        const cur = rec[item.key] || {};
        const Icon = careIcons[item.icon] || Drop;
        return html`<div key=${item.key} class="care-row">
          <button class=${`care-check ${cur.done ? "done" : ""}`} onClick=${() => toggleCare(camel.id, item.key)} aria-pressed=${!!cur.done}>
            <${Icon} size=${16} />
          </button>
          <span class="grow">
            <div style=${{ fontWeight: 600 }}>${t(item.en, item.ar)}</div>
            ${cur.done && cur.time ? html`<div class="muted" style=${{ fontSize: "12px" }}>${t("at", "في")} ${fmtTime(cur.time)}</div>` : null}
          </span>
          ${item.note
            ? html`<input class="input" style=${{ maxWidth: "150px", padding: "6px 10px" }} placeholder=${t("Symptoms?", "أعراض؟")} value=${cur.note || ""} onInput=${(e) => setCareNote(camel.id, item.key, e.target.value)} />`
            : html`<span class=${`badge ${cur.done ? "ok" : "info"}`}>${cur.done ? t("Done", "تم") : t("Pending", "معلّق")}</span>`}
        </div>`;
      })}
    </div>
  </div>`;
}

// ---------------- Herd list (search + filter) ----------------
function Herd({ camels, onOpen, onAdd }) {
  const { t, dailyCare } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [showDiag, setShowDiag] = useState(false);

  const filtered = camels.filter((c) => {
    const matchQ = !q || `${c.name} ${c.tagNumber || ""}`.toLowerCase().includes(q.toLowerCase());
    const matchS = status === "all" || c.status === status;
    return matchQ && matchS;
  });

  return html`<div class="stack gap-12">
    <div class="row between wrap gap-8">
      <h3 class="section-title" style=${{ margin: 0 }}>${t("The Herd", "القطيع")} <span class="muted">(${camels.length})</span></h3>
      <button class="btn btn-primary btn-sm" onClick=${onAdd}><${Plus} size=${16} /> ${t("Add Camel", "إضافة ناقة")}</button>
    </div>

    <div class="diag-banner">
      <span class="avatar" style=${{ background: "var(--terracotta)", width: "44px", height: "44px" }}><${Camera} size=${22} /></span>
      <div class="grow">
        <div style=${{ fontWeight: 700 }}>${t("Spot something wrong?", "لاحظت مشكلة؟")}</div>
        <div class="muted" style=${{ fontSize: "13px" }}>${t("Diagnose a camel with the camera", "شخّص ناقة باستخدام الكاميرا")}</div>
      </div>
      <button class="btn btn-accent btn-sm" onClick=${() => setShowDiag((s) => !s)}><${Camera} size=${15} /> ${showDiag ? t("Close", "إغلاق") : t("Diagnose", "تشخيص")}</button>
    </div>
    ${showDiag && html`<div class="card"><${DiagnosisTool} type="camel" /></div>`}

    ${camels.length === 0
      ? html`<${EmptyState} type="camel"
          title=${t("No camels yet", "لا توجد إبل بعد")}
          subtitle=${t("Start your herd by adding your first camel — name, breed, tag and photo.", "ابدأ قطيعك بإضافة أول ناقة — الاسم والسلالة والوسم والصورة.")}
          cta=${t("Add your first camel", "أضف أول ناقة")} onCta=${onAdd} />`
      : html`<${Fragment}>
          <div class="row gap-8 wrap">
            <span class="search grow">
              <${Search} size=${16} />
              <input placeholder=${t("Search name or tag…", "ابحث بالاسم أو الوسم…")} value=${q} onInput=${(e) => setQ(e.target.value)} />
            </span>
            <span class="search">
              <${Filter} size=${16} />
              <select value=${status} onChange=${(e) => setStatus(e.target.value)}>
                <option value="all">${t("All statuses", "كل الحالات")}</option>
                <option value="healthy">${t("Healthy", "سليم")}</option>
                <option value="attention">${t("Attention", "مراقبة")}</option>
                <option value="sick">${t("Sick", "مريض")}</option>
              </select>
            </span>
          </div>

          ${filtered.length === 0
            ? html`<div class="card empty">${t("No camels match your search.", "لا نتائج مطابقة.")}</div>`
            : html`<div class="grid grid-list">
                ${filtered.map((c) => {
                  const comp = todayCompletion(dailyCare, c.id);
                  return html`<button key=${c.id} class="card hover stack gap-8" style=${{ textAlign: "start", cursor: "pointer" }} onClick=${() => onOpen(c.id)}>
                    <div class="row gap-12">
                      <${HealthRing} status=${c.status} size=${46}><${Avatar} photo=${c.photo} type="camel" size=${46} /><//>
                      <div class="grow">
                        <div class="row gap-8" style=${{ alignItems: "center" }}>
                          <span style=${{ fontWeight: 800, fontSize: "17px" }}>${c.name}</span>
                          <${HealthDot} status=${c.status} size=${10} />
                        </div>
                        <div class="muted" style=${{ fontSize: "13px" }}>${c.breed} · ${c.age} ${t("yrs", "سنة")}</div>
                      </div>
                    </div>
                    <div class="row between">
                      ${c.tagNumber ? html`<span class="badge info"><${Tag} size=${12} /> #${c.tagNumber}</span>` : html`<span class="muted" style=${{ fontSize: "12px" }}>${c.weight} kg</span>`}
                      <span class="muted" style=${{ fontSize: "12px" }}>${t("Care", "الرعاية")} ${Math.round(comp * 100)}%</span>
                    </div>
                  </button>`;
                })}
              </div>`}
        <//>`}
  </div>`;
}

// ---------------- Add camel ----------------
function AddCamel({ onCancel, onSave, prefill }) {
  const { t } = useStore();
  const [f, setF] = useState({ name: "", tagNumber: "", breed: "Majaheem", gender: "female", age: "", weight: "", status: "healthy", notes: prefill || "", feeding: "" });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) return;
    const w = Number(f.weight) || 0;
    onSave({
      id: uid("camel"), name: f.name.trim(), tagNumber: f.tagNumber.trim(),
      breed: f.breed, gender: f.gender, age: Number(f.age) || 0, weight: w,
      status: f.status, notes: f.notes, feeding: f.feeding,
      weightLog: w ? [{ date: todayISO(), kg: w }] : [], vaccines: [],
      bodyCondition: 0, tempLog: [], photo: "",
    });
  }

  return html`<form class="card stack" style=${{ maxWidth: "520px", margin: "0 auto" }} onSubmit=${submit}>
    <h3 class="section-title" style=${{ marginBlockStart: 0 }}>${t("Add New Camel", "إضافة ناقة جديدة")}</h3>
    <div class="grid grid-2">
      <div class="field"><label>${t("Name", "الاسم")}</label><input class="input" value=${f.name} onInput=${set("name")} required /></div>
      <div class="field"><label>${t("Tag number", "رقم الوسم")}</label><input class="input" value=${f.tagNumber} onInput=${set("tagNumber")} placeholder="UAE-0042" /></div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>${t("Breed", "السلالة")}</label>
        <select class="select" value=${f.breed} onChange=${set("breed")}>
          ${["Majaheem", "Sofor", "Awarik", "Homor", "Shaele", "Other"].map((b) => html`<option key=${b}>${b}</option>`)}
        </select>
      </div>
      <div class="field"><label>${t("Gender", "الجنس")}</label>
        <select class="select" value=${f.gender} onChange=${set("gender")}>
          <option value="female">${t("Female", "أنثى")}</option>
          <option value="male">${t("Male", "ذكر")}</option>
        </select>
      </div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>${t("Age (years)", "العمر (سنوات)")}</label><input class="input" type="number" min="0" value=${f.age} onInput=${set("age")} /></div>
      <div class="field"><label>${t("Weight (kg)", "الوزن (كجم)")}</label><input class="input" type="number" min="0" value=${f.weight} onInput=${set("weight")} /></div>
    </div>
    <div class="field"><label>${t("Status", "الحالة")}</label>
      <select class="select" value=${f.status} onChange=${set("status")}>
        <option value="healthy">${t("Healthy", "سليم")}</option>
        <option value="attention">${t("Attention", "مراقبة")}</option>
        <option value="sick">${t("Sick", "مريض")}</option>
      </select>
    </div>
    <div class="field"><label>${t("Feeding schedule", "جدول التغذية")}</label><input class="input" value=${f.feeding} onInput=${set("feeding")} placeholder=${t("e.g. Alfalfa 2×/day", "مثال: برسيم مرتين يومياً")} /></div>
    <div class="field"><label>${t("Notes", "ملاحظات")}</label><textarea class="input" rows="2" value=${f.notes} onInput=${set("notes")}></textarea></div>
    <div class="row gap-8">
      <button type="submit" class="btn btn-primary grow">${t("Save Camel", "حفظ")}</button>
      <button type="button" class="btn btn-ghost" onClick=${onCancel}>${t("Cancel", "إلغاء")}</button>
    </div>
  </form>`;
}

// ---------------- Profile ----------------
function CamelProfile({ camel, onBack }) {
  const { t, updateCamel, removeCamel, settings, syncReminders, lang, expenses } = useStore();
  const totalCost = totalForEntity(expenses, camel.id);

  // Keep breeding milestone reminders in sync with pregnancy state (Feature 8).
  useEffect(() => {
    const group = "breed:" + camel.id;
    const active = camel.gender === "female" && camel.pregnant && camel.conceptionDate;
    syncReminders(group, active ? breedingMilestones(camel) : []);
  }, [camel.id, camel.gender, camel.pregnant, camel.conceptionDate]); // eslint-disable-line
  const [wInput, setWInput] = useState("");
  const [vac, setVac] = useState({ name: "", next: "" });
  const [temp, setTemp] = useState("");
  const [contactsOpen, setContactsOpen] = useState(false);
  const upd = (patch) => updateCamel(camel.id, patch);
  const fld = (k) => (e) => upd({ [k]: e.target.value });

  const log = (camel.weightLog || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const tempLog = (camel.tempLog || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const comp = completeness(camel, "camel");

  function addWeight(e) {
    e.preventDefault();
    const kg = Number(wInput); if (!kg) return;
    upd({ weight: kg, weightLog: [...(camel.weightLog || []), { date: todayISO(), kg }] });
    setWInput("");
  }
  function addVaccine(e) {
    e.preventDefault();
    if (!vac.name.trim()) return;
    upd({ vaccines: [...(camel.vaccines || []), { id: uid("v"), name: vac.name.trim(), date: todayISO(), next: vac.next || "" }] });
    setVac({ name: "", next: "" });
  }
  function addTemp(e) {
    e.preventDefault();
    const v = Number(temp); if (!v) return;
    upd({ tempLog: [...(camel.tempLog || []), { date: todayISO(), temp: v }] });
    setTemp("");
  }
  const delVaccine = (id) => upd({ vaccines: camel.vaccines.filter((v) => v.id !== id) });
  function saveDiagnosis(r) {
    const entry = { id: uid("dx"), date: todayISO(), condition: r.condition, confidence: r.confidence, recommendation: r.recommendation, vetRequired: r.vetRequired };
    upd({ healthLog: [entry, ...(camel.healthLog || [])] });
  }

  return html`<div class="stack gap-16 fade-in profile-print">
    <${BackBar} onBack=${onBack}>
      <button class="btn btn-ghost btn-sm no-print" style=${{ padding: "6px 10px", fontSize: "13px" }} onClick=${() => setContactsOpen(true)}><${Users} size=${14} /> ${t("Vet", "بيطري")}</button>
      <button class="btn btn-ghost btn-sm no-print" style=${{ padding: "6px 10px", fontSize: "13px" }} onClick=${() => printCamelPassport(camel, (settings && settings.farmName) || "My Farm")}><${FileText} size=${14} /> ${t("Passport", "جواز")}</button>
      <button class="btn btn-ghost btn-sm no-print" style=${{ padding: "6px 10px", fontSize: "13px" }} onClick=${() => window.print()}><${Printer} size=${14} /> ${t("Export", "تصدير")}</button>
      <select class="select btn-sm no-print" style=${{ width: "auto", padding: "6px 10px", fontSize: "13px" }} value=${camel.status} onChange=${fld("status")}>
        <option value="healthy">${t("Healthy", "سليم")}</option>
        <option value="attention">${t("Attention", "مراقبة")}</option>
        <option value="sick">${t("Sick", "مريض")}</option>
      </select>
    <//>

    <!-- Identity card -->
    <div class="card stack gap-12">
      <div class="row gap-16 wrap">
        <${HealthRing} status=${camel.status} size=${84}>
          <${PhotoUpload} photo=${camel.photo} type="camel" size=${84} onChange=${(p) => upd({ photo: p })} />
        <//>
        <div class="grow" style=${{ minWidth: 0 }}>
          <div class="row gap-8 wrap" style=${{ alignItems: "center" }}>
            <h2 style=${{ margin: 0, fontFamily: "var(--font-head)" }}>${camel.name}</h2>
            ${camel.tagNumber ? html`<span class="badge info" style=${{ fontSize: "13px" }}><${Tag} size=${13} /> #${camel.tagNumber}</span>` : null}
            <${StatusBadge} status=${camel.status} />
          </div>
          <div class="muted">${camel.breed} · ${camel.age} ${t("years", "سنة")} · ${camel.weight} kg<${TrendArrow} camel=${camel} /> · ${camel.gender === "male" ? t("Male", "ذكر") : t("Female", "أنثى")}</div>
          <div style=${{ marginBlockStart: "10px", maxWidth: "320px" }}><${CompletenessBar} percent=${comp} /></div>
          <div class="muted" style=${{ marginBlockStart: "8px", fontSize: "13px" }}>💰 ${t("Total cost to date", "إجمالي التكلفة")}: <b style=${{ color: "var(--ink)" }}>AED ${totalCost.toLocaleString()}</b></div>
        </div>
      </div>
      <div style=${{ display: "flex", justifyContent: "center" }}>
        <${QrCode} type="camel" id=${camel.id} name=${camel.name} tag=${camel.tagNumber}
          label=${t("Scan to open this profile", "امسح لفتح هذا الملف")} />
      </div>
    </div>

    <${DailyCare} camel=${camel} />

    <!-- AI Health Diagnosis -->
    <div class="card no-print">
      <h3 class="section-title" style=${{ marginBlockStart: 0 }}><${Camera} size=${18} /> ${t("AI Health Diagnosis", "تشخيص صحي بالذكاء الاصطناعي")}</h3>
      <${DiagnosisTool} type="camel" onSave=${saveDiagnosis} />
      ${(camel.healthLog || []).length > 0 &&
        html`<div class="stack" style=${{ marginBlockStart: "12px" }}>
          <div class="muted" style=${{ fontWeight: 600, fontSize: "13px" }}>${t("Diagnosis history", "سجل التشخيص")}</div>
          ${camel.healthLog.map((e) => html`<div key=${e.id} class="row between" style=${{ padding: "8px 0", borderBlockEnd: "1px solid var(--line)" }}>
            <span class="row gap-8">${e.vetRequired ? html`<${AlertTriangle} size=${15} style=${{ color: "var(--danger)" }} />` : null}<span style=${{ fontWeight: 600 }}>${e.condition}</span> <span class="muted">${Math.round((e.confidence || 0) * 100)}%</span></span>
            <span class="muted">${formatDate(e.date)}</span>
          </div>`)}
        </div>`}
    </div>

    <!-- Weight chart -->
    <div class="card">
      <h3 class="section-title" style=${{ marginBlockStart: 0 }}><${Scale} size=${18} /> ${t("Weight Log", "سجل الوزن")}</h3>
      <${TrendChart} data=${log} yKey="kg" unit="kg" color="var(--terracotta)" />
      <form class="row gap-8 no-print" style=${{ marginBlockStart: "10px" }} onSubmit=${addWeight}>
        <input class="input" type="number" min="0" placeholder=${t("Today's weight (kg)", "وزن اليوم (كجم)")} value=${wInput} onInput=${(e) => setWInput(e.target.value)} />
        <button class="btn btn-primary"><${Plus} size=${16} /> ${t("Log", "تسجيل")}</button>
      </form>
    </div>

    <!-- Health & vitals -->
    <${Collapsible} title=${t("Health & Vitals", "الصحة والمؤشرات")} icon=${Heart}>
      <div class="field"><label>${t("Body condition score (1–5)", "درجة الحالة الجسدية (1–5)")}</label>
        <${ScoreDots} value=${camel.bodyCondition || 0} onChange=${(n) => upd({ bodyCondition: n })} />
      </div>
      <div class="grid grid-2">
        <div class="field"><label>${t("Last vet visit", "آخر زيارة بيطرية")}</label><input class="input" type="date" value=${camel.lastVetVisit || ""} onChange=${fld("lastVetVisit")} /></div>
        <div class="field"><label>${t("Vet name", "اسم الطبيب")}</label><input class="input" value=${camel.vetName || ""} onInput=${fld("vetName")} /></div>
      </div>
      <div class="field"><label>${t("Insurance / registration no.", "رقم التأمين / التسجيل")}</label><input class="input" value=${camel.insurance || ""} onInput=${fld("insurance")} /></div>
      <div class="field"><label>${t("Known conditions / allergies", "أمراض / حساسية معروفة")}</label><textarea class="input" rows="2" value=${camel.conditions || ""} onInput=${fld("conditions")}></textarea></div>
      <div>
        <div class="row between"><span style=${{ fontWeight: 600, fontSize: "13px" }} class="muted">${t("Temperature log (°C)", "سجل الحرارة (°م)")}</span></div>
        ${tempLog.length
          ? html`<div class="stack" style=${{ marginBlock: "6px" }}>${tempLog.slice().reverse().slice(0, 5).map((r, i) => html`<div key=${i} class="row between" style=${{ padding: "5px 0", borderBlockEnd: "1px solid var(--line)" }}><span class="row gap-8"><${Thermometer} size=${15} /> ${r.temp}°C</span><span class="muted">${formatDate(r.date)}</span></div>`)}</div>`
          : html`<div class="empty" style=${{ padding: "12px" }}>${t("No readings.", "لا قراءات.")}</div>`}
        <form class="row gap-8 no-print" onSubmit=${addTemp}>
          <input class="input" type="number" step="0.1" placeholder=${t("e.g. 37.5", "مثال 37.5")} value=${temp} onInput=${(e) => setTemp(e.target.value)} />
          <button class="btn btn-primary"><${Plus} size=${16} /></button>
        </form>
      </div>
    <//>

    <!-- Vaccines -->
    <div class="card">
      <h3 class="section-title" style=${{ marginBlockStart: 0 }}><${Syringe} size=${18} /> ${t("Vaccine Log", "سجل التطعيمات")}</h3>
      ${(camel.vaccines || []).length === 0
        ? html`<div class="empty">${t("No vaccines recorded.", "لا توجد تطعيمات مسجلة.")}</div>`
        : html`<table class="table"><thead><tr>
            <th>${t("Vaccine", "اللقاح")}</th><th>${t("Given", "تاريخ")}</th><th>${t("Next due", "الاستحقاق")}</th><th></th>
          </tr></thead><tbody>
            ${camel.vaccines.map((v) => {
              const d = v.next ? dueLabel(v.next) : null;
              return html`<tr key=${v.id}>
                <td style=${{ fontWeight: 600 }}>${v.name}</td>
                <td class="muted">${formatDate(v.date)}</td>
                <td>${v.next ? html`<span class=${`badge ${d.tone}`}>${formatDate(v.next)} · ${d.text}</span>` : "—"}</td>
                <td class="no-print"><button class="btn btn-ghost btn-icon" onClick=${() => delVaccine(v.id)}><${Trash} size=${14} /></button></td>
              </tr>`;
            })}
          </tbody></table>`}
      <form class="row gap-8 wrap no-print" style=${{ marginBlockStart: "10px" }} onSubmit=${addVaccine}>
        <input class="input grow" placeholder=${t("Vaccine name", "اسم اللقاح")} value=${vac.name} onInput=${(e) => setVac((s) => ({ ...s, name: e.target.value }))} />
        <input class="input" type="date" value=${vac.next} onInput=${(e) => setVac((s) => ({ ...s, next: e.target.value }))} title=${t("Next due", "الاستحقاق التالي")} />
        <button class="btn btn-primary"><${Plus} size=${16} /></button>
      </form>
    </div>

    <!-- Breeding & Pregnancy -->
    <${Collapsible} title=${t("Breeding & Pregnancy", "التكاثر والحمل")} icon=${camel.gender === "male" ? Male : Female} defaultOpen=${false}>
      <div class="field"><label>${t("Gender", "الجنس")}</label>
        <select class="select" value=${camel.gender || "female"} onChange=${fld("gender")}>
          <option value="female">${t("Female", "أنثى")}</option>
          <option value="male">${t("Male", "ذكر")}</option>
        </select>
      </div>
      ${camel.gender === "male"
        ? html`<${Fragment}>
            <label class="check-line"><input type="checkbox" checked=${!!camel.usedForBreeding} onChange=${(e) => upd({ usedForBreeding: e.target.checked })} /> ${t("Used for breeding", "يُستخدم للتكاثر")}</label>
            <div class="field"><label>${t("Last breeding date", "تاريخ آخر تلقيح")}</label><input class="input" type="date" value=${camel.lastBreedingDate || ""} onChange=${fld("lastBreedingDate")} /></div>
          <//>`
        : html`<${Fragment}>
            <label class="row between" style=${{ cursor: "pointer" }}>
              <span style=${{ fontWeight: 600 }}>${t("Pregnant", "حامل")}</span>
              <span class="switch"><input type="checkbox" checked=${!!camel.pregnant} onChange=${(e) => upd({ pregnant: e.target.checked, ...(e.target.checked ? {} : { conceptionDate: "", expectedBirth: "" }) })} /><span class="track"></span></span>
            </label>
            ${camel.pregnant && html`<${Fragment}>
              <div class="grid grid-2">
                <div class="field"><label>${t("Conception date", "تاريخ الإخصاب")}</label>
                  <input class="input" type="date" value=${camel.conceptionDate || ""} onChange=${(e) => upd({ conceptionDate: e.target.value, expectedBirth: expectedBirthISO(e.target.value) })} />
                </div>
                <div class="field"><label>${t("Expected birth (auto)", "الولادة المتوقعة (تلقائي)")}</label>
                  <input class="input" value=${camel.conceptionDate ? formatDate(expectedBirthISO(camel.conceptionDate)) : "—"} disabled />
                </div>
              </div>
              ${(() => {
                const bi = breedingInfo(camel);
                if (!bi) return html`<div class="muted" style=${{ fontSize: "13px" }}>${t("Set a conception date to track pregnancy progress.", "حدد تاريخ الإخصاب لتتبع تقدم الحمل.")}</div>`;
                return html`<div class="stack gap-8">
                  <div class="row between" style=${{ fontSize: "13.5px" }}>
                    <span style=${{ fontWeight: 700 }}>${t("Week", "الأسبوع")} ${bi.week} ${t("of", "من")} 56</span>
                    <span class="muted">${bi.pct}%</span>
                  </div>
                  <div class="prog"><span style=${{ width: bi.pct + "%", background: "var(--terracotta)" }}></span></div>
                  <div class="muted" style=${{ fontSize: "12.5px" }}>🍼 ${t("Milestone reminders added to your calendar & alerts.", "أُضيفت تذكيرات المراحل إلى التقويم والتنبيهات.")}</div>
                </div>`;
              })()}
            <//>`}
          <//>`}
      <div class="grid grid-2">
        <div class="field"><label>${t("Sire tag (father)", "وسم الأب")}</label><input class="input" value=${camel.sireTag || ""} onInput=${fld("sireTag")} /></div>
        <div class="field"><label>${t("Dam tag (mother)", "وسم الأم")}</label><input class="input" value=${camel.damTag || ""} onInput=${fld("damTag")} /></div>
      </div>
    <//>

    <!-- Location -->
    <${Collapsible} title=${t("Location", "الموقع")} icon=${MapPin} defaultOpen=${false}>
      <div class="grid grid-2">
        <div class="field"><label>${t("Paddock / pen", "الحظيرة")}</label><input class="input" value=${camel.paddock || ""} onInput=${fld("paddock")} placeholder=${t("North Pen A", "حظيرة الشمال أ")} /></div>
        <div class="field"><label>${t("GPS coordinates", "إحداثيات GPS")}</label><input class="input" value=${camel.gps || ""} onInput=${fld("gps")} placeholder="24.2075, 55.7447" /></div>
      </div>
    <//>

    <!-- Feeding + notes -->
    <div class="grid grid-2">
      <div class="card">
        <h3 class="section-title" style=${{ marginBlockStart: 0 }}><${Drop} size=${18} /> ${t("Feeding Schedule", "جدول التغذية")}</h3>
        <textarea class="input" rows="3" value=${camel.feeding || ""} onInput=${fld("feeding")} placeholder=${t("Describe daily feeding…", "صف التغذية اليومية…")}></textarea>
      </div>
      <div class="card">
        <h3 class="section-title" style=${{ marginBlockStart: 0 }}>${t("Notes", "ملاحظات")}</h3>
        <textarea class="input" rows="3" value=${camel.notes || ""} onInput=${fld("notes")} placeholder=${t("Observations, lineage, temperament…", "ملاحظات، النسب، الطباع…")}></textarea>
      </div>
    </div>

    ${contactsOpen && html`<${ContactsModal} onClose=${() => setContactsOpen(false)} />`}

    <!-- Delete camel — always visible at bottom -->
    <div class="card no-print" style=${{ borderColor: "var(--danger)", background: "var(--danger-bg)" }}>
      <div class="row between" style=${{ alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <div style=${{ fontWeight: 700, color: "var(--danger)" }}>${t("Delete Camel", "حذف الناقة")}</div>
          <div class="muted" style=${{ fontSize: "13px" }}>${t("This action cannot be undone.", "لا يمكن التراجع عن هذا الإجراء.")}</div>
        </div>
        <button class="btn no-print" style=${{ background: "var(--danger)", color: "#fff", minWidth: "120px" }}
          onClick=${() => { if (confirm(t("Delete this camel? This cannot be undone.", "حذف هذه الناقة؟ لا يمكن التراجع."))) { removeCamel(camel.id); onBack(); } }}>
          <${Trash} size=${16} /> ${t("Delete", "حذف")}
        </button>
      </div>
    </div>
  </div>`;
}

// ---------------- Water & Feed tracker ----------------
function WaterFeed() {
  const { t, feedLog, addFeedEntry, removeFeedEntry } = useStore();
  const [f, setF] = useState({ type: "Feed", item: "", qty: "" });
  function submit(e) {
    e.preventDefault();
    if (!f.item.trim()) return;
    addFeedEntry({ id: uid("f"), date: todayISO(), type: f.type, item: f.item.trim(), qty: f.qty });
    setF({ type: f.type, item: "", qty: "" });
  }
  return html`<div class="stack gap-12">
    <h3 class="section-title" style=${{ margin: 0 }}><${Drop} size=${18} /> ${t("Water & Feed Tracker", "متابعة الماء والعلف")}</h3>
    <form class="card row gap-8 wrap" onSubmit=${submit}>
      <select class="select" style=${{ width: "auto" }} value=${f.type} onChange=${(e) => setF((s) => ({ ...s, type: e.target.value }))}>
        <option value="Feed">${t("Feed", "علف")}</option>
        <option value="Water">${t("Water", "ماء")}</option>
      </select>
      <input class="input grow" placeholder=${t("Item (e.g. Alfalfa)", "الصنف (مثل البرسيم)")} value=${f.item} onInput=${(e) => setF((s) => ({ ...s, item: e.target.value }))} />
      <input class="input" style=${{ width: "120px" }} placeholder=${t("Qty", "الكمية")} value=${f.qty} onInput=${(e) => setF((s) => ({ ...s, qty: e.target.value }))} />
      <button class="btn btn-primary"><${Plus} size=${16} /> ${t("Log", "تسجيل")}</button>
    </form>
    ${feedLog.length === 0
      ? html`<div class="card empty">${t("No entries logged today.", "لا توجد إدخالات اليوم.")}</div>`
      : html`<div class="card card-pad-0">
          ${feedLog.map((e) => html`<div key=${e.id} class="list-row">
            <span class="avatar" style=${{ background: e.type === "Water" ? "var(--info)" : "var(--palm)", width: "40px", height: "40px" }}><${Drop} size=${18} /></span>
            <span class="grow"><div style=${{ fontWeight: 700 }}>${e.item} <span class="muted" style=${{ fontWeight: 400 }}>· ${e.qty}</span></div>
              <div class="muted" style=${{ fontSize: "13px" }}>${t(e.type, e.type === "Water" ? "ماء" : "علف")} · ${formatDate(e.date)}</div></span>
            <button class="btn btn-ghost btn-icon" onClick=${() => removeFeedEntry(e.id)}><${Trash} size=${15} /></button>
          </div>`)}
        </div>`}
  </div>`;
}

// 7-day herd care-completion series for the overview sparkline.
function careSeries(camels, dailyCare) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    let done = 0;
    camels.forEach((c) => {
      const rec = (dailyCare[c.id] && dailyCare[c.id][day]) || {};
      if (rec.water && rec.water.done && rec.food && rec.food.done) done++;
    });
    days.push(camels.length ? Math.round((done / camels.length) * 100) : 0);
  }
  return days;
}

// ---------------- Module root ----------------
export function CamelFarm({ weather, openId, onOpen, onBack, addPrefill }) {
  const { t, camels, addCamel, dailyCare } = useStore();
  const [tab, setTab] = useState(addPrefill ? "herd" : "overview");
  const [adding, setAdding] = useState(!!addPrefill);

  const alerts = camelAlerts(camels, dailyCare);
  const selected = camels.find((c) => c.id === openId);

  function handleSave(c) { addCamel(c); setAdding(false); onOpen(c.id); }

  if (selected) return html`<div class="page-pad"><${CamelProfile} camel=${selected} onBack=${onBack} /></div>`;
  if (adding) return html`<div class="page-pad"><${AddCamel} onCancel=${() => setAdding(false)} onSave=${handleSave} prefill=${addPrefill} /></div>`;

  // overview sparklines (real data)
  const wlByIdx = (() => {
    const k = Math.min(...camels.map((c) => (c.weightLog || []).length).concat([7]));
    if (!camels.length || k < 2) return null;
    const out = [];
    for (let j = 0; j < k; j++) {
      const sum = camels.reduce((s, c) => { const l = c.weightLog || []; return s + (l[l.length - k + j] ? l[l.length - k + j].kg : 0); }, 0);
      out.push(Math.round(sum / camels.length));
    }
    return out;
  })();

  const stats = [
    { icon: Camel, value: camels.length, label: t("Total camels", "إجمالي الإبل"), tone: "sand" },
    { icon: Heart, value: camels.filter((c) => c.status === "healthy").length, label: t("Healthy", "سليمة"), tone: "palm", spark: careSeries(camels, dailyCare) },
    { icon: Bell, value: alerts.length, label: t("Active alerts", "تنبيهات"), tone: alerts.length ? "danger" : "palm" },
    { icon: Scale, value: camels.length ? Math.round(camels.reduce((s, c) => s + (c.weight || 0), 0) / camels.length) + "kg" : "—", label: t("Avg weight", "متوسط الوزن"), tone: "info", spark: wlByIdx },
  ];

  const tabs = [
    { key: "overview", label: t("Overview", "نظرة عامة") },
    { key: "herd", label: t("Herd", "القطيع") },
    { key: "alerts", label: t("Alerts", "تنبيهات"), badge: alerts.length || null },
    { key: "water", label: t("Water & Feed", "ماء وعلف") },
    { key: "expenses", label: t("Expenses", "المصروفات") },
  ];

  return html`<div class="page-pad stack gap-16">
    <${Tabs} tabs=${tabs} active=${tab} onChange=${setTab} />
    ${tab === "overview" &&
      html`<${FarmOverview} farmType="camel" weather=${weather} stats=${stats}>
        <div class="stack gap-8">
          <h3 class="section-title" style=${{ margin: "4px 0 0" }}>${t("Recent Alerts", "أحدث التنبيهات")}</h3>
          <${AlertsPanel} alerts=${alerts.slice(0, 4)} onSelect=${(a) => onOpen(a.id)} />
        </div>
      <//>`}
    ${tab === "herd" && html`<${Herd} camels=${camels} onOpen=${onOpen} onAdd=${() => setAdding(true)} />`}
    ${tab === "alerts" && html`<${AlertsPanel} alerts=${alerts} onSelect=${(a) => onOpen(a.id)} />`}
    ${tab === "water" && html`<${WaterFeed} />`}
    ${tab === "expenses" && html`<${Expenses} scope="camel" />`}
  </div>`;
}