// Task Calendar (Feature 9 — build order 12). Read-only monthly grid with
// colored status dots; click a day to see its tasks. Tasks are managed from
// their own profiles — this view only surfaces them.
import { html, useState } from "../core/html.js";
import { useStore } from "../core/store.js";
import { calendarEvents, groupByDay, dayStatuses } from "../utils/calendar.js";
import { todayISO, formatDate } from "../utils/helpers.js";
import { ArrowLeft, ChevronDown, ChevronUp } from "../components/Icons.js";

const WEEK_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_AR = ["إث", "ثل", "أر", "خ", "ج", "س", "أح"];
const STATUS_DOT = { overdue: "var(--danger)", due: "var(--warn)", completed: "var(--ok)" };

export function CalendarPage({ onBack, onGoTo }) {
  const { t, lang, camels, palms, reminders } = useStore();
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() }); // m: 0–11
  const [selected, setSelected] = useState(todayISO());

  const events = calendarEvents({ camels, palms, reminders });
  const byDay = groupByDay(events);

  const first = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7; // make Monday=0
  const monthLabel = first.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-GB", { month: "long", year: "numeric" });

  const iso = (d) => `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const prev = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const next = () => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedEvents = (byDay[selected] || []).slice().sort((a, b) => {
    const order = { overdue: 0, due: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return html`<div class="container page-pad stack gap-16 fade-in" style=${{ maxWidth: "760px" }}>
    <button class="back-link" onClick=${onBack}><${ArrowLeft} size=${18} /> ${t("Back to home", "العودة للرئيسية")}</button>

    <div class="card stack gap-12">
      <div class="row between">
        <button class="btn btn-ghost btn-icon" onClick=${prev} aria-label="Previous month"><${ChevronDown} size=${18} style=${{ transform: "rotate(90deg)" }} /></button>
        <h2 class="section-title" style=${{ margin: 0 }}>${monthLabel}</h2>
        <button class="btn btn-ghost btn-icon" onClick=${next} aria-label="Next month"><${ChevronDown} size=${18} style=${{ transform: "rotate(-90deg)" }} /></button>
      </div>

      <div class="cal-grid">
        ${(lang === "ar" ? WEEK_AR : WEEK_EN).map((w, i) => html`<div key=${"h" + i} class="cal-head">${w}</div>`)}
        ${cells.map((d, i) => {
          if (d == null) return html`<div key=${"e" + i} class="cal-cell empty"></div>`;
          const dISO = iso(d);
          const statuses = dayStatuses(byDay[dISO] || []);
          const isToday = dISO === todayISO();
          const isSel = dISO === selected;
          return html`<button key=${dISO} class=${`cal-cell ${isToday ? "today" : ""} ${isSel ? "sel" : ""}`} onClick=${() => setSelected(dISO)}>
            <span class="cal-num">${d}</span>
            <span class="cal-dots">${statuses.map((s) => html`<span key=${s} class="cal-dot" style=${{ background: STATUS_DOT[s] }}></span>`)}</span>
          </button>`;
        })}
      </div>

      <div class="row gap-12 wrap" style=${{ fontSize: "12px" }}>
        <span class="row gap-4"><span class="cal-dot" style=${{ background: "var(--danger)" }}></span> ${t("Overdue", "متأخر")}</span>
        <span class="row gap-4"><span class="cal-dot" style=${{ background: "var(--warn)" }}></span> ${t("Due", "مستحق")}</span>
        <span class="row gap-4"><span class="cal-dot" style=${{ background: "var(--ok)" }}></span> ${t("Completed", "مكتمل")}</span>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title" style=${{ marginBlockStart: 0 }}>${formatDate(selected, lang === "ar" ? "ar-AE" : "en-GB")}</h3>
      ${selectedEvents.length === 0
        ? html`<div class="empty">${t("No tasks on this day.", "لا مهام في هذا اليوم.")}</div>`
        : html`<div class="stack gap-8">
            ${selectedEvents.map((e, i) => html`<div key=${i} class="row gap-10" style=${{ padding: "8px 0", borderBlockEnd: "1px solid var(--line)" }}>
              <span class="cal-dot" style=${{ background: STATUS_DOT[e.status], width: "10px", height: "10px" }}></span>
              <span class="grow"><span style=${{ fontWeight: 600 }}>${e.title}</span></span>
              ${e.id ? html`<button class="btn btn-ghost btn-sm" onClick=${() => onGoTo(e.farmType, e.id)}>${t("Open", "فتح")}</button>` : null}
            </div>`)}
          </div>`}
    </div>
  </div>`;
}
