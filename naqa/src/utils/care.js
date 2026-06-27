// Daily care checklist helpers.
// Stored shape:  dailyCare[camelId][dateISO] = {
//   water:{done,time}, food:{done,time}, health:{done,time,note},
//   exercise:{done,time}, weightCheck:{done,time}
// }
// Keying by date means the checklist "resets" automatically each midnight
// (today's record simply doesn't exist yet) while history is preserved.
import { todayISO, daysBetween } from "./helpers.js";

export const CARE_ITEMS = [
  { key: "water", en: "Water", ar: "ماء", icon: "Drop", essential: true },
  { key: "food", en: "Food", ar: "طعام", icon: "Drop", essential: true },
  { key: "health", en: "Health check", ar: "فحص صحي", icon: "Heart", note: true },
  { key: "exercise", en: "Exercise", ar: "تمرين", icon: "Activity" },
  { key: "weightCheck", en: "Weight check", ar: "قياس الوزن", icon: "Scale" },
];

export function careForDay(dailyCare, camelId, day = todayISO()) {
  return (dailyCare && dailyCare[camelId] && dailyCare[camelId][day]) || {};
}

// Days since a care item was last marked done (0 = done today, Infinity = never).
export function daysSince(dailyCare, camelId, key) {
  const hist = dailyCare && dailyCare[camelId];
  if (!hist) return Infinity;
  const dates = Object.keys(hist)
    .filter((d) => hist[d] && hist[d][key] && hist[d][key].done)
    .sort();
  if (!dates.length) return Infinity;
  return daysBetween(dates[dates.length - 1], todayISO());
}

// Completion ratio for today's essential items (water + food) — 0..1.
export function todayCompletion(dailyCare, camelId) {
  const rec = careForDay(dailyCare, camelId);
  const essentials = CARE_ITEMS.filter((i) => i.essential);
  const done = essentials.filter((i) => rec[i.key] && rec[i.key].done).length;
  return essentials.length ? done / essentials.length : 0;
}
