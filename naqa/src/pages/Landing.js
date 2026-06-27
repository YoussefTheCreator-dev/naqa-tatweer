// Full-screen intro / hero with quick stats, farm entry points, and guest scan.
import { html } from "../core/html.js";
import { useStore } from "../core/store.js";
import { WeatherWidget } from "../components/WeatherWidget.js";
import { AdvisoryBanner } from "../components/AdvisoryBanner.js";
import { FarmHealthCard } from "../components/FarmHealthCard.js";
import { WeatherHistory } from "../components/WeatherHistory.js";
import { camelAlerts, palmAlerts, isUrgent } from "../utils/alerts.js";
import { Camel, Palm, Globe, Moon, Sun, Settings as Gear, Camera, Bell, Calendar } from "../components/Icons.js";

export function Landing({ weather, onSelectFarm, onScan, onOpenSettings, onCalendar }) {
  const { t, lang, setLang, theme, toggleTheme, camels, palms, dailyCare } = useStore();

  const cAlerts = camelAlerts(camels, dailyCare);
  const pAlerts = palmAlerts(palms);
  const camelsWithAlerts = new Set(cAlerts.map((a) => a.id)).size;
  const palmsWithAlerts = new Set(pAlerts.map((a) => a.id)).size;
  const urgent = [...cAlerts, ...pAlerts].filter((a) => isUrgent(a.severity)).length;

  const StripCard = (cls, num, label, badge, onClick) => html`<button class=${`strip-card ${cls}`} onClick=${onClick}>
    ${badge > 0 ? html`<span class="badge danger strip-badge">${badge}</span>` : null}
    <div class="strip-num">${num}</div>
    <div class="strip-lbl">${label}</div>
  </button>`;

  return html`<div class="hero fade-in">
    <div class="container stack gap-16">
      <div class="landing-controls">
        <span></span>
        <div class="row gap-8">
          <button class="btn btn-ghost btn-sm" onClick=${() => setLang(lang === "ar" ? "en" : "ar")}>
            <${Globe} size=${16} /> ${lang === "ar" ? "English" : "العربية"}
          </button>
          <button class="btn btn-ghost btn-icon" onClick=${onCalendar} aria-label=${t("Calendar", "التقويم")}><${Calendar} size=${16} /></button>
          <button class="btn btn-ghost btn-icon" onClick=${onOpenSettings} aria-label=${t("Settings", "الإعدادات")}><${Gear} size=${16} /></button>
          <button class="btn btn-ghost btn-icon" onClick=${toggleTheme} aria-label="Toggle theme">
            ${theme === "dark" ? html`<${Sun} size=${16} />` : html`<${Moon} size=${16} />`}
          </button>
        </div>
      </div>

      <div class="hero-logo">NAQA · ناقة</div>

      <p class="hero-tag">
        <span class="ar">مساعدك الذكي لمزارع العين</span>
        ${t("Your smart farming assistant for date palms & camel herds in Al Ain.",
            "نخيل التمر وقطعان الإبل — رعاية أذكى في بيئة الصحراء.")}
      </p>

      <div style=${{ maxWidth: "560px", marginInline: "auto", width: "100%" }} class="stack gap-12">
        <${WeatherWidget} weather=${weather} loading=${!weather} />
        <${AdvisoryBanner} weather=${weather} farmType=${null} />
      </div>

      <!-- Quick overview strip -->
      <div class="home-strip">
        ${StripCard("camel", camels.length, t("Camels", "الإبل"), camelsWithAlerts, () => onSelectFarm("camel"))}
        ${StripCard("palm", palms.length, t("Palm trees", "النخيل"), palmsWithAlerts, () => onSelectFarm("palm"))}
        ${StripCard("alert", urgent, t("Urgent alerts", "تنبيهات عاجلة"), 0, () => onSelectFarm(camelsWithAlerts >= palmsWithAlerts ? "camel" : "palm"))}
      </div>

      <!-- Farm health score -->
      <div style=${{ maxWidth: "720px", marginInline: "auto", width: "100%" }} class="stack gap-12">
        <${FarmHealthCard} />
        <${WeatherHistory} />
      </div>

      <!-- Farm entry -->
      <div class="entry-grid">
        <button class="entry-card" onClick=${() => onSelectFarm("camel")}>
          <span class="glyph" style=${{ background: "var(--terracotta)" }}><${Camel} size=${40} stroke=${1.7} /></span>
          <span class="t-ar">مزرعة الإبل</span>
          <span class="t-en">Camel Farm</span>
        </button>
        <button class="entry-card" onClick=${() => onSelectFarm("palm")}>
          <span class="glyph" style=${{ background: "var(--palm)" }}><${Palm} size=${40} stroke=${1.7} /></span>
          <span class="t-ar">مزرعة النخيل</span>
          <span class="t-en">Palm Farm</span>
        </button>
      </div>

      <!-- Guest quick scan -->
      <div class="scan-section">
        <div class="scan-divider"></div>
        <h3 class="section-title" style=${{ margin: 0 }}>${t("Found a stray animal or unidentified palm tree?", "وجدت حيواناً ضالاً أو نخلة مجهولة؟")}</h3>
        <p class="muted" style=${{ margin: "6px 0 0" }}>${t("Scan it directly without adding it to your farm", "افحصها مباشرة دون إضافتها لمزرعتك")}</p>
        <div class="scan-btns">
          <button class="btn btn-accent" onClick=${() => onScan("camel")}><${Camera} size=${16} /> ${t("Scan Camel", "فحص ناقة")}</button>
          <button class="btn btn-primary" onClick=${() => onScan("palm")}><${Camera} size=${16} /> ${t("Scan Palm", "فحص نخلة")}</button>
        </div>
      </div>
    </div>
  </div>`;
}