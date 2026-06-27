// App header: brand, contextual title, live weather mini, language + theme toggles.
import { html } from "../core/html.js";
import { useStore } from "../core/store.js";
import { WeatherMini } from "./WeatherWidget.js";
import { ArrowLeft, Globe, Moon, Sun, Bell, Settings as Gear, Calendar } from "./Icons.js";

export function Header({ weather, onHome, title, subtitle, alertCount = 0, onOpenSettings, onOpenCalendar }) {
  const { t, lang, setLang, theme, toggleTheme } = useStore();
  return html`<header class="app-header">
    <div class="container row between gap-12">
      <button class="brand-mark" style=${{ background: "none", border: "none", padding: 0 }} onClick=${onHome} aria-label="NAQA home">
        <span class="ar">ناقة</span>
        <span class="stack" style=${{ alignItems: "flex-start" }}>
          <span style=${{ fontFamily: "var(--font-head)", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>NAQA</span>
          <span class="en">${title || t("Smart Farming", "زراعة ذكية")}</span>
        </span>
      </button>

      <div class="row gap-12">
        ${weather && html`<${WeatherMini} weather=${weather} />`}
        <span class="header-bell" title=${t("Active alerts", "تنبيهات")}>
          <${Bell} size=${18} />
          ${alertCount > 0 && html`<span class="header-bell-badge">${alertCount > 99 ? "99+" : alertCount}</span>`}
        </span>
        <button class="btn btn-ghost btn-sm" onClick=${() => setLang(lang === "ar" ? "en" : "ar")} aria-label="Toggle language">
          <${Globe} size=${16} /> ${lang === "ar" ? "EN" : "ع"}
        </button>
        ${onOpenCalendar && html`<button class="btn btn-ghost btn-icon" onClick=${onOpenCalendar} aria-label=${t("Calendar", "التقويم")}><${Calendar} size=${16} /></button>`}
        ${onOpenSettings && html`<button class="btn btn-ghost btn-icon" onClick=${onOpenSettings} aria-label=${t("Settings", "الإعدادات")}><${Gear} size=${16} /></button>`}
        <button class="btn btn-ghost btn-icon" onClick=${toggleTheme} aria-label="Toggle theme">
          ${theme === "dark" ? html`<${Sun} size=${16} />` : html`<${Moon} size=${16} />`}
        </button>
      </div>
    </div>
  </header>`;
}

export function BackBar({ onBack, children }) {
  const { t } = useStore();
  return html`<div class="row between" style=${{ marginBlock: "10px 6px" }}>
    <button class="back-link" onClick=${onBack}><${ArrowLeft} size=${18} /> ${t("Back", "رجوع")}</button>
    <div class="row gap-8">${children}</div>
  </div>`;
}
