// Palm yield predictor (Feature 7). UAE date-palm harvest seasons by variety,
// plus a simple next-harvest estimate + target yield. All local, no services.
import { daysBetween, todayISO } from "./helpers.js";

// startMonth/endMonth are 1–12 inclusive.
const SEASONS = {
  Khalas: { start: 8, end: 9, en: "August–September", ar: "أغسطس–سبتمبر" },
  Medjool: { start: 9, end: 10, en: "September–October", ar: "سبتمبر–أكتوبر" },
  Barhi: { start: 7, end: 8, en: "July–August", ar: "يوليو–أغسطس" },
  Sullaj: { start: 8, end: 9, en: "August–September", ar: "أغسطس–سبتمبر" },
};
const DEFAULT_SEASON = { start: 8, end: 9, en: "August–September", ar: "أغسطس–سبتمبر" };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function seasonFor(variety) {
  return SEASONS[variety] || DEFAULT_SEASON;
}

// Returns null when there is no harvest history (prediction not yet possible).
export function predictYield(palm, now = new Date()) {
  const log = palm.harvestLog || [];
  const lastYield = palm.lastYield || (log.length ? log[log.length - 1].kg : 0);
  if (!log.length && !lastYield) return null;

  const season = seasonFor(palm.variety);
  let year = now.getFullYear();
  // If we're already past the end of this year's season, roll to next year.
  const endThisYear = new Date(year, season.end, 0); // last day of end month
  if (now > endThisYear) year += 1;

  const date = new Date(year, season.start - 1, 1);
  const dateISO = date.toISOString().slice(0, 10);
  const countdown = daysBetween(todayISO(), dateISO); // days until season start
  const inSeason = countdown <= 0;

  const healthy = palm.status === "healthy";
  const targetYield = lastYield ? Math.round(lastYield * (healthy ? 1.05 : 1)) : 0;

  return {
    season,
    monthLabel: `${MONTHS[season.start - 1]} ${year}`,
    monthIndex: season.start - 1,
    year,
    dateISO,
    countdown,
    inSeason,
    lastYield,
    targetYield,
    healthy,
  };
}
