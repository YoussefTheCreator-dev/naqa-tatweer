// Camel breeding / pregnancy calendar (Feature 8).
// Gestation ≈ 390 days (≈13 months ≈ 56 weeks).
import { daysBetween, todayISO } from "./helpers.js";

export const GESTATION_DAYS = 390;
export const TOTAL_WEEKS = 56;

export function expectedBirthISO(conceptionISO) {
  if (!conceptionISO) return "";
  const d = new Date(conceptionISO);
  d.setDate(d.getDate() + GESTATION_DAYS);
  return d.toISOString().slice(0, 10);
}

export function breedingInfo(camel) {
  if (!camel.conceptionDate) return null;
  const days = Math.max(0, daysBetween(camel.conceptionDate, todayISO()));
  const week = Math.max(1, Math.min(TOTAL_WEEKS, Math.floor(days / 7) + 1));
  const pct = Math.max(0, Math.min(100, Math.round((days / GESTATION_DAYS) * 100)));
  return { birthISO: expectedBirthISO(camel.conceptionDate), week, pct, days };
}

// Auto-created milestone reminders (LOW priority). Stable ids + a `group`
// field so they can be re-synced/cleared without touching the user's own
// reminders. `when` is a datetime string the rest of the app understands.
export function breedingMilestones(camel) {
  if (!camel.conceptionDate) return [];
  const concept = new Date(camel.conceptionDate);
  const at = (d) => { const x = new Date(concept); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 16); };
  const group = "breed:" + camel.id;
  const base = { group, severity: "low", linkType: "camel", linkId: camel.id, kind: "breeding" };
  return [
    { ...base, id: `rem_breed_${camel.id}_m3`, title: `Schedule first pregnancy check for ${camel.name}`, when: at(90) },
    { ...base, id: `rem_breed_${camel.id}_m9`, title: `Prepare birthing pen for ${camel.name}`, when: at(270) },
    { ...base, id: `rem_breed_${camel.id}_m12`, title: `Birth expected within 4 weeks for ${camel.name}`, when: at(360) },
    { ...base, id: `rem_breed_${camel.id}_birth`, title: `${camel.name} birth due today!`, when: at(GESTATION_DAYS) },
  ];
}
