// Expense tracker tab (Feature 6) — scope is "camel" or "palm". Manages
// expenses linked to that scope's animals/trees plus general-farm costs:
// monthly total, a Recharts bar chart by category, an add form, a dated list,
// and a plain-text monthly export (print).
import { html, useState } from "../core/html.js";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { useStore } from "../core/store.js";
import { CATEGORIES, CAT_AR, CAT_COLOR, isThisMonth, byCategory, sumAmount } from "../utils/expenses.js";
import { uid, todayISO, formatDate, cssVar } from "../utils/helpers.js";
import { Plus, Trash, Printer, FileText } from "./Icons.js";

export function Expenses({ scope }) {
  const { t, lang, expenses, addExpense, removeExpense, camels, palms, settings } = useStore();
  const [f, setF] = useState({ date: todayISO(), category: "Feed", amount: "", linkType: "general", linkId: "", notes: "" });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const entities = scope === "camel" ? camels : palms;
  const entityName = (e) => (scope === "camel" ? e.name : e.code);

  // Expenses relevant to this module: general + this scope.
  const relevant = expenses
    .filter((e) => e.linkType === "general" || e.linkType === scope)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const monthly = relevant.filter((e) => isThisMonth(e.date));
  const monthTotal = sumAmount(monthly);
  const chartData = byCategory(monthly);
  const grid = cssVar("--line", "#E5D8B8");
  const ink = cssVar("--ink-soft", "#6B6353");

  function submit(e) {
    e.preventDefault();
    const amount = Number(f.amount);
    if (!amount) return;
    addExpense({
      id: uid("exp"), date: f.date || todayISO(), category: f.category, amount,
      linkType: f.linkType, linkId: f.linkType === "general" ? null : (f.linkId || null), notes: f.notes.trim(),
    });
    setF({ date: todayISO(), category: f.category, amount: "", linkType: f.linkType, linkId: f.linkType === "general" ? "" : f.linkId, notes: "" });
  }

  function labelFor(e) {
    if (e.linkType === "general") return t("General farm", "المزرعة عامة");
    const ent = entities.find((x) => x.id === e.linkId) || (scope === "camel" ? camels : palms).find((x) => x.id === e.linkId);
    return ent ? entityName(ent) : t("General farm", "المزرعة عامة");
  }

  function exportMonth() {
    const farm = (settings && settings.farmName) || "My Farm";
    const now = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const lines = monthly.map((e) => `${formatDate(e.date)}  ${e.category.padEnd(10)} AED ${String(e.amount).padStart(7)}  ${labelFor(e)}${e.notes ? " — " + e.notes : ""}`);
    const cats = byCategory(monthly).map((c) => `  ${c.category.padEnd(10)} AED ${c.amount}`).join("\n");
    const text =
      `NAQA - ${farm}\n${scope === "camel" ? "Camel Farm" : "Palm Farm"} Expenses - ${now}\n` +
      `${"=".repeat(54)}\n` + (lines.join("\n") || "(no expenses this month)") +
      `\n${"-".repeat(54)}\nBy category:\n${cats}\n${"-".repeat(54)}\nTOTAL: AED ${monthTotal}\n`;
    const w = window.open("", "_blank", "width=640,height=720");
    if (!w) return;
    w.document.write(`<pre style="font-family:monospace;font-size:13px;padding:24px;white-space:pre-wrap">${text.replace(/</g, "&lt;")}</pre><script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>`);
    w.document.close();
  }

  return html`<div class="stack gap-12">
    <div class="row between wrap gap-8">
      <h3 class="section-title" style=${{ margin: 0 }}>${t("Expenses", "المصروفات")}</h3>
      <button class="btn btn-ghost btn-sm" onClick=${exportMonth}><${Printer} size=${15} /> ${t("Export month", "تصدير الشهر")}</button>
    </div>

    <div class="grid grid-2">
      <div class="card stack gap-4">
        <span class="muted" style=${{ fontSize: "13px" }}>${t("This month's spend", "إنفاق هذا الشهر")}</span>
        <span style=${{ fontFamily: "var(--font-head)", fontSize: "30px", fontWeight: 800 }}>AED ${monthTotal.toLocaleString()}</span>
        <span class="muted" style=${{ fontSize: "12.5px" }}>${monthly.length} ${t("entries", "إدخالات")}</span>
      </div>
      <div class="card">
        <div class="muted" style=${{ fontSize: "13px", marginBlockEnd: "6px" }}>${t("By category", "حسب الفئة")}</div>
        ${chartData.length === 0
          ? html`<div class="empty" style=${{ padding: "20px" }}>${t("No spend this month.", "لا إنفاق هذا الشهر.")}</div>`
          : html`<div style=${{ width: "100%", height: "160px" }}>
              <${ResponsiveContainer} width="100%" height="100%">
                <${BarChart} data=${chartData} margin=${{ top: 6, right: 8, left: -16, bottom: 0 }}>
                  <${CartesianGrid} strokeDasharray="3 3" stroke=${grid} vertical=${false} />
                  <${XAxis} dataKey="category" tick=${{ fill: ink, fontSize: 10 }} interval=${0} tickFormatter=${(c) => (lang === "ar" ? CAT_AR[c] : c).slice(0, 5)} />
                  <${YAxis} tick=${{ fill: ink, fontSize: 10 }} />
                  <${Tooltip} formatter=${(v) => [`AED ${v}`, ""]} contentStyle=${{ borderRadius: 12, border: `1px solid ${grid}`, fontSize: 13 }} />
                  <${Bar} dataKey="amount" radius=${[6, 6, 0, 0]}>
                    ${chartData.map((d) => html`<${Cell} key=${d.category} fill=${CAT_COLOR[d.category] || "var(--palm)"} />`)}
                  <//>
                <//>
              <//>
            </div>`}
      </div>
    </div>

    <form class="card row gap-8 wrap" onSubmit=${submit}>
      <input class="input" type="date" style=${{ width: "auto" }} value=${f.date} onChange=${set("date")} />
      <select class="select" style=${{ width: "auto" }} value=${f.category} onChange=${set("category")}>
        ${CATEGORIES.map((c) => html`<option key=${c} value=${c}>${lang === "ar" ? CAT_AR[c] : c}</option>`)}
      </select>
      <input class="input" type="number" min="0" style=${{ width: "120px" }} placeholder=${t("AED", "درهم")} value=${f.amount} onInput=${set("amount")} />
      <select class="select" style=${{ width: "auto" }} value=${f.linkType === "general" ? "general" : f.linkId} onChange=${(e) => { const v = e.target.value; if (v === "general") setF((s) => ({ ...s, linkType: "general", linkId: "" })); else setF((s) => ({ ...s, linkType: scope, linkId: v })); }}>
        <option value="general">${t("General farm", "المزرعة عامة")}</option>
        ${entities.map((x) => html`<option key=${x.id} value=${x.id}>${entityName(x)}</option>`)}
      </select>
      <input class="input grow" placeholder=${t("Notes", "ملاحظات")} value=${f.notes} onInput=${set("notes")} />
      <button class="btn btn-primary"><${Plus} size=${16} /> ${t("Add", "إضافة")}</button>
    </form>

    ${relevant.length === 0
      ? html`<div class="card empty">${t("No expenses logged yet.", "لا توجد مصروفات بعد.")}</div>`
      : html`<div class="card card-pad-0">
          ${relevant.map((e) => html`<div key=${e.id} class="list-row">
            <span class="avatar" style=${{ background: CAT_COLOR[e.category] || "var(--palm)", width: "40px", height: "40px", fontSize: "13px", fontWeight: 700 }}>${(lang === "ar" ? CAT_AR[e.category] : e.category).slice(0, 3)}</span>
            <span class="grow">
              <div style=${{ fontWeight: 700 }}>AED ${Number(e.amount).toLocaleString()} <span class="muted" style=${{ fontWeight: 400 }}>· ${lang === "ar" ? CAT_AR[e.category] : e.category}</span></div>
              <div class="muted" style=${{ fontSize: "12.5px" }}>${formatDate(e.date)} · ${labelFor(e)}${e.notes ? " · " + e.notes : ""}</div>
            </span>
            <button class="btn btn-ghost btn-icon" onClick=${() => removeExpense(e.id)}><${Trash} size=${15} /></button>
          </div>`)}
        </div>`}
  </div>`;
}
