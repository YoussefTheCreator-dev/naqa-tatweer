// Task calendar aggregation (Feature 9 — build order 12). Collects dated
// events from every source into a flat list the calendar grid can group by day.
// status: "overdue" (red) | "due" (amber) | "completed" (green). Read-only.
import { todayISO } from "./helpers.js";
import { predictYield } from "./yieldPredict.js";

const dateOnly = (s) => (s ? String(s).slice(0, 10) : null);

export function calendarEvents({ camels = [], palms = [], reminders = [] }) {
  const today = todayISO();
  const out = [];
  const push = (date, status, type, title, farmType, id) => {
    if (date) out.push({ date, status, type, title, farmType, id });
  };
  const dueOrOverdue = (date) => (dateOnly(date) < today ? "overdue" : "due");

  // Vaccines — next due (amber/red) and given dates (green completed).
  for (const c of camels) {
    for (const v of c.vaccines || []) {
      if (v.next) push(dateOnly(v.next), dueOrOverdue(v.next), "vaccine", `Vaccine due: ${v.name} (${c.name})`, "camel", c.id);
      if (v.date) push(dateOnly(v.date), "completed", "vaccine", `Vaccinated: ${v.name} (${c.name})`, "camel", c.id);
    }
  }

  // Palm irrigation — logged sessions are completed; an overdue gap shows today.
  for (const p of palms) {
    const log = (p.irrigationLog || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    for (const i of log) push(dateOnly(i.date), "completed", "irrigation", `Irrigated #${p.code} (${i.litres} L)`, "palm", p.id);
    const last = log.length ? log[log.length - 1].date : null;
    const gapDays = last ? (new Date(today) - new Date(last)) / 86400000 : Infinity;
    if (gapDays >= 3) push(today, "overdue", "irrigation", `Irrigation overdue: #${p.code}`, "palm", p.id);

    // Harvest estimate.
    const y = predictYield(p);
    if (y) push(y.dateISO, "due", "harvest", `Harvest ~${y.targetYield}kg: #${p.code}`, "palm", p.id);

    // Next fertilisation / pruning if scheduled.
    if (p.nextFertilise) push(dateOnly(p.nextFertilise), dueOrOverdue(p.nextFertilise), "fertilise", `Fertilise #${p.code}`, "palm", p.id);
    if (p.nextPruning) push(dateOnly(p.nextPruning), dueOrOverdue(p.nextPruning), "pruning", `Prune #${p.code}`, "palm", p.id);
  }

  // Reminders + pregnancy milestones (reminders carry a `kind`/`group`).
  for (const r of reminders) {
    if (!r.when) continue;
    push(dateOnly(r.when), dueOrOverdue(r.when), r.kind === "breeding" ? "breeding" : "reminder", r.title, r.linkType || null, r.linkId || null);
  }

  return out;
}

// Group events by ISO date → { [date]: Event[] }.
export function groupByDay(events) {
  const map = {};
  for (const e of events) { (map[e.date] = map[e.date] || []).push(e); }
  return map;
}

// Which status dots a day should show (deduped, ordered red→amber→green).
export function dayStatuses(events) {
  const set = new Set(events.map((e) => e.status));
  return ["overdue", "due", "completed"].filter((s) => set.has(s));
}
