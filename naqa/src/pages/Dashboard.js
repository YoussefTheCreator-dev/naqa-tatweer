// "My Farm" overview — shared by both farm modules.
import { html } from "../core/html.js";
import { useStore } from "../core/store.js";
import { WeatherWidget } from "../components/WeatherWidget.js";
import { AdvisoryBanner } from "../components/AdvisoryBanner.js";
import { StatCard } from "../components/StatCard.js";
import { formatDate, todayISO } from "../utils/helpers.js";

export function FarmOverview({ farmType, weather, stats, children }) {
  const { t, lang, settings } = useStore();
  const titleEn = farmType === "camel" ? "Camel Farm" : "Palm Farm";
  const titleAr = farmType === "camel" ? "مزرعة الإبل" : "مزرعة النخيل";
  const farmName = (settings && settings.farmName) || "My Farm";

  return html`<div class="page-pad stack gap-16 fade-in">
    <div class="row between wrap gap-12">
      <div>
        <h2 class="section-title" style=${{ margin: 0 }}>${farmName} <span class="muted" style=${{ fontWeight: 600 }}>· ${t(titleEn, titleAr)}</span></h2>
        <div class="muted">${formatDate(todayISO(), lang === "ar" ? "ar-AE" : "en-GB")}</div>
      </div>
    </div>

    <${WeatherWidget} weather=${weather} loading=${!weather} />
    <${AdvisoryBanner} weather=${weather} farmType=${farmType} />

    <div class="grid grid-stats">
      ${stats.map((s, i) => html`<${StatCard} key=${i} ...${s} />`)}
    </div>

    ${children}
  </div>`;
}
