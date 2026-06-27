// Farm Health Score (0–100) — a single, live, weighted figure summarising how
// well the whole farm is being cared for. Used by the home-screen card and the
// daily WhatsApp summary. Pure function of current data → recomputes live.
import { todayISO, daysBetween } from "./helpers.js";
import { todayCompletion } from "./care.js";

// Weighted categories. `max` points sum to 100.
//  - checklist : camels watered + fed today (uses essential-item completion)
//  - vaccines  : no overdue vaccines on any camel
//  - irrigation: no overdue irrigation (gap < 3 days) on any palm
//  - weight    : every camel weighed within the last 14 days
//  - inspection: every palm inspected within the last 30 days
export function farmHealthScore({ camels = [], palms = [], dailyCare = {} }) {
  // 1) Checklists completed today (water + food) — 30 pts.
  const checklistRatio = camels.length
    ? camels.reduce((s, c) => s + todayCompletion(dailyCare, c.id), 0) / camels.length
    : 1;

  // 2) Vaccines up to date — 20 pts. Fraction of camels with no overdue vaccine.
  const camelsNoOverdue = camels.filter(
    (c) => !(c.vaccines || []).some((v) => v.next && daysBetween(todayISO(), v.next) < 0)
  ).length;
  const vaccineRatio = camels.length ? camelsNoOverdue / camels.length : 1;

  // 3) Irrigation — 20 pts. Fraction of palms irrigated within the last 3 days.
  const palmsIrrigated = palms.filter((p) => {
    const last = (p.irrigationLog || []).map((i) => i.date).sort().slice(-1)[0];
    return last && daysBetween(last, todayISO()) < 3;
  }).length;
  const irrigationRatio = palms.length ? palmsIrrigated / palms.length : 1;

  // 4) Weight recorded in last 14 days — 15 pts.
  const camelsWeighed = camels.filter((c) => {
    const last = (c.weightLog || []).map((w) => w.date).sort().slice(-1)[0];
    return last && daysBetween(last, todayISO()) <= 14;
  }).length;
  const weightRatio = camels.length ? camelsWeighed / camels.length : 1;

  // 5) Inspection in last 30 days — 15 pts.
  const palmsInspected = palms.filter(
    (p) => p.lastInspection && daysBetween(p.lastInspection, todayISO()) <= 30
  ).length;
  const inspectionRatio = palms.length ? palmsInspected / palms.length : 1;

  const breakdown = [
    { key: "checklist", en: "Daily checklists", ar: "قوائم الرعاية اليومية", earned: Math.round(checklistRatio * 30), max: 30 },
    { key: "vaccines", en: "Vaccines up to date", ar: "تطعيمات محدّثة", earned: Math.round(vaccineRatio * 20), max: 20 },
    { key: "irrigation", en: "Palm irrigation", ar: "ري النخيل", earned: Math.round(irrigationRatio * 20), max: 20 },
    { key: "weight", en: "Weights recorded (14d)", ar: "أوزان مسجلة (14 يوم)", earned: Math.round(weightRatio * 15), max: 15 },
    { key: "inspection", en: "Palm inspections (30d)", ar: "فحوصات النخيل (30 يوم)", earned: Math.round(inspectionRatio * 15), max: 15 },
  ];

  const score = Math.min(100, breakdown.reduce((s, b) => s + b.earned, 0));
  return { score, breakdown, ...scoreMeta(score) };
}

export function scoreMeta(score) {
  if (score >= 80) return { tone: "ok", color: "var(--ok)", en: "Good", ar: "جيد" };
  if (score >= 50) return { tone: "warn", color: "var(--warn)", en: "Needs Attention", ar: "يحتاج انتباه" };
  return { tone: "danger", color: "var(--danger)", en: "Critical", ar: "حرج" };
}
