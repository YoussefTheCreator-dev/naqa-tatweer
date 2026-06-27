// Unified alert engine — aggregates camel, palm, daily-care, and reminder
// alerts into a single severity-ranked list used by the notification bar,
// dashboard counts, and per-module panels.
import { daysBetween, todayISO, formatDate } from "./helpers.js";
import { daysSince } from "./care.js";
import { weightTrend } from "./weight.js";

export const SEVERITY = {
  critical: { rank: -1, tone: "danger" },
  high: { rank: 0, tone: "danger" },
  medium: { rank: 1, tone: "warn" },
  low: { rank: 2, tone: "info" },
};

// Treat both critical and high as "urgent" for badge counts.
export const isUrgent = (alert) => {
  const sev = typeof alert === "string" ? alert : alert?.severity;
  return sev === "critical" || sev === "high";
};

function mk(severity, farmType, id, kind, subject, en, ar, extra = {}) {
  return { severity, tone: SEVERITY[severity].tone, farmType, id, kind, subject, en, ar, ...extra };
}

export function camelAlerts(camels, dailyCare = {}) {
  const out = [];
  for (const c of camels) {
    // --- Water / food daily care ---
    for (const [key, enWord, arWord] of [["water", "water", "الماء"], ["food", "food", "الطعام"]]) {
      const since = daysSince(dailyCare, c.id, key);
      if (since >= 2 && since !== Infinity)
        out.push(mk("high", "camel", c.id, key, c.name,
          `${c.name} has not had ${enWord} for ${since}+ days`,
          `${c.name}: لم ${key === "water" ? "تشرب" : "تأكل"} منذ ${since}+ يوم`));
      else if (since === Infinity)
        out.push(mk("high", "camel", c.id, key, c.name,
          `${c.name} has no ${enWord} record logged`,
          `${c.name}: لا يوجد سجل ${arWord}`));
      else if (since >= 1)
        out.push(mk("medium", "camel", c.id, key, c.name,
          `${c.name} ${enWord} not checked today`,
          `${c.name}: لم يُسجّل ${arWord} اليوم`));
    }
    // --- Vaccines ---
    for (const v of c.vaccines || []) {
      if (!v.next) continue;
      const d = daysBetween(todayISO(), v.next);
      if (d < 0)
        out.push(mk("high", "camel", c.id, "vaccine", c.name,
          `Vaccine overdue for ${c.name}: ${v.name} (${Math.abs(d)}d)`,
          `تطعيم متأخر لـ ${c.name}: ${v.name} (${Math.abs(d)} يوم)`));
      else if (d <= 7)
        out.push(mk("medium", "camel", c.id, "vaccine", c.name,
          `Vaccine due within ${d}d for ${c.name}: ${v.name}`,
          `تطعيم خلال ${d} يوم لـ ${c.name}: ${v.name}`));
    }
    // --- Weight not recorded 14+ days ---
    const wl = (c.weightLog || []).map((w) => w.date).sort();
    const lastW = wl[wl.length - 1];
    if (!lastW || daysBetween(lastW, todayISO()) >= 14)
      out.push(mk("low", "camel", c.id, "weight", c.name,
        `Weight not recorded for ${c.name} in 14+ days`,
        `لم يُسجّل وزن ${c.name} منذ 14+ يوم`));
    // --- Rapid weight loss (30-day trend) ---
    const tr = weightTrend(c);
    const loss = Math.round(-tr.pct); // positive = % lost
    if (tr.pct < -20)
      out.push(mk("critical", "camel", c.id, "weightloss", c.name,
        `🚨 ${c.name} has lost ${loss}% body weight — urgent vet visit recommended`,
        `🚨 ${c.name} فقدت ${loss}% من وزنها — يُنصح بزيارة بيطرية عاجلة`));
    else if (tr.pct < -10)
      out.push(mk("high", "camel", c.id, "weightloss", c.name,
        `⚠️ ${c.name} has lost ${loss}% of body weight in 30 days — health check recommended`,
        `⚠️ ${c.name} فقدت ${loss}% من وزنها خلال 30 يوم — يُنصح بفحص صحي`));
    if (c.status === "sick")
      out.push(mk("high", "camel", c.id, "health", c.name,
        `${c.name} marked as sick — needs attention`,
        `${c.name} مريضة — تحتاج رعاية`));
  }
  return out;
}

export function palmAlerts(palms) {
  const out = [];
  for (const p of palms) {
    // --- Irrigation ---
    const lastIrr = (p.irrigationLog || []).map((i) => i.date).sort().slice(-1)[0];
    const gap = lastIrr ? daysBetween(lastIrr, todayISO()) : Infinity;
    if (gap === Infinity)
      out.push(mk("high", "palm", p.id, "irrigation", p.code,
        `Tree #${p.code} has no irrigation logged`,
        `النخلة #${p.code}: لا يوجد سجل ري`));
    else if (gap >= 3)
      out.push(mk("high", "palm", p.id, "irrigation", p.code,
        `Tree #${p.code} irrigation overdue by ${gap} days`,
        `النخلة #${p.code}: ري متأخر ${gap} يوم`));
    else if (gap >= 1)
      out.push(mk("medium", "palm", p.id, "irrigation", p.code,
        `Tree #${p.code} irrigation due today`,
        `النخلة #${p.code}: الري مستحق اليوم`));
    // --- Fertilisation / treatment ---
    if (p.nextFertilise) {
      const d = daysBetween(todayISO(), p.nextFertilise);
      if (d <= 7)
        out.push(mk("medium", "palm", p.id, "fertilise", p.code,
          d < 0 ? `Tree #${p.code} fertilisation overdue by ${Math.abs(d)}d`
                : `Tree #${p.code} fertilisation due this week`,
          d < 0 ? `النخلة #${p.code}: تسميد متأخر ${Math.abs(d)} يوم`
                : `النخلة #${p.code}: التسميد مستحق هذا الأسبوع`));
    }
    // --- Pruning due ---
    if (p.nextPruning) {
      const d = daysBetween(todayISO(), p.nextPruning);
      if (d <= 7)
        out.push(mk("low", "palm", p.id, "pruning", p.code,
          `Tree #${p.code} pruning ${d < 0 ? "overdue" : "due soon"}`,
          `النخلة #${p.code}: التقليم ${d < 0 ? "متأخر" : "قريباً"}`));
    }
    // --- Inspection ---
    if (!p.lastInspection || daysBetween(p.lastInspection, todayISO()) >= 30)
      out.push(mk("low", "palm", p.id, "inspection", p.code,
        `Tree #${p.code} not inspected in 30+ days`,
        `النخلة #${p.code}: لم تُفحص منذ 30+ يوم`));
    if (p.status === "diseased")
      out.push(mk("high", "palm", p.id, "disease", p.code,
        `Tree #${p.code} disease flag — inspect & isolate`,
        `النخلة #${p.code}: مؤشر مرض — افحص واعزل`));
  }
  return out;
}

// Reminders that are due (datetime <= now) become alerts too.
export function reminderAlerts(reminders = []) {
  const now = Date.now();
  const out = [];
  for (const r of reminders) {
    if (!r.when) continue;
    if (new Date(r.when).getTime() <= now)
      out.push(mk(r.severity || "medium", r.linkType || "reminder", r.linkId || null, "reminder",
        r.title, `Reminder: ${r.title}`, `تذكير: ${r.title}`,
        { when: r.when, reminderId: r.id }));
  }
  return out;
}

// Combined, severity-sorted.
export function allAlerts({ camels = [], palms = [], dailyCare = {}, reminders = [] }) {
  const all = [
    ...camelAlerts(camels, dailyCare),
    ...palmAlerts(palms),
    ...reminderAlerts(reminders),
  ];
  all.sort((a, b) => SEVERITY[a.severity].rank - SEVERITY[b.severity].rank);
  return all;
}

export const statusMeta = {
  healthy: { tone: "ok", ring: "var(--ok)", en: "Healthy", ar: "سليم" },
  attention: { tone: "warn", ring: "var(--warn)", en: "Attention", ar: "مراقبة" },
  sick: { tone: "danger", ring: "var(--danger)", en: "Sick", ar: "مريض" },
  diseased: { tone: "danger", ring: "var(--danger)", en: "Diseased", ar: "مصاب" },
};
