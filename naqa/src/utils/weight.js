// Camel weight-trend analysis (Feature 6). Compares the latest weight to the
// reading ~30 days ago (or the earliest available if the log spans <30 days).
export function weightTrend(camel) {
  const log = (camel.weightLog || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  if (log.length < 2) return { dir: "flat", pct: 0, cur: log[0] ? log[0].kg : camel.weight || 0, ref: null };

  const cur = log[log.length - 1];
  const target = new Date(); // 30 days before today
  target.setDate(target.getDate() - 30);

  // Latest reading on/before the 30-day mark; else the earliest reading.
  let ref = log[0];
  for (const w of log) { if (new Date(w.date) <= target) ref = w; }

  const pct = ref.kg ? ((cur.kg - ref.kg) / ref.kg) * 100 : 0; // +gain / -loss
  let dir = "flat";
  if (pct > 1) dir = "up";
  else if (pct < -5) dir = "down";
  return { dir, pct, cur: cur.kg, ref: ref.kg };
}
