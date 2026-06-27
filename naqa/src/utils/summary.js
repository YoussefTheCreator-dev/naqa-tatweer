// Daily farm summary used by the WhatsApp message + Settings preview.
import { todayISO, daysBetween, formatDate } from "./helpers.js";
import { camelAlerts, palmAlerts } from "./alerts.js";
import { todayCompletion } from "./care.js";
import { farmHealthScore } from "./health.js";

export function computeSummary({ camels = [], palms = [], dailyCare = {} }) {
  const overdueVaccines = camels.reduce((n, c) =>
    n + (c.vaccines || []).filter((v) => v.next && daysBetween(todayISO(), v.next) < 0).length, 0);
  const checklistsIncomplete = camels.filter((c) => todayCompletion(dailyCare, c.id) < 1).length;
  const health = farmHealthScore({ camels, palms, dailyCare });
  return {
    date: formatDate(todayISO()),
    camelCount: camels.length,
    camelAlerts: camelAlerts(camels, dailyCare).length,
    palmCount: palms.length,
    palmAlerts: palmAlerts(palms).length,
    checklistsIncomplete,
    overdueVaccines,
    healthScore: health.score,
    healthLabel: health.en,
  };
}
