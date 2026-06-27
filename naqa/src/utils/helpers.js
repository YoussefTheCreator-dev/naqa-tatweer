// Small shared utilities.

export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function daysBetween(aISO, bISO) {
  const a = new Date(aISO).getTime();
  const b = new Date(bISO).getTime();
  return Math.round((b - a) / 86400000);
}

export function formatDate(iso, locale = "en-GB") {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// Relative "due" language for reminders.
export function dueLabel(iso) {
  if (!iso) return { text: "No date", tone: "info" };
  const d = daysBetween(todayISO(), iso);
  if (d < 0) return { text: `Overdue ${Math.abs(d)}d`, tone: "danger" };
  if (d === 0) return { text: "Due today", tone: "warn" };
  if (d <= 7) return { text: `Due in ${d}d`, tone: "warn" };
  return { text: `Due in ${d}d`, tone: "ok" };
}

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// Read a CSS custom property value (for chart theming).
export function cssVar(name, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}
