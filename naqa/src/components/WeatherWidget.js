// Live weather card for Al Ain. Two variants: full (landing/dashboard hero)
// and "mini" (compact summary for headers).
import { html } from "../core/html.js";
import { describeCode, AL_AIN } from "../utils/weather.js";
import { weatherIcon, Wind, Humidity } from "./Icons.js";
import { useStore } from "../core/store.js";

export function WeatherWidget({ weather, loading, error, cachedAt }) {
  const { t, online, lang } = useStore();
  if (loading && !weather)
    return html`<div class="weather"><div class="grow">${t("Loading Al Ain weather…", "جارٍ تحميل طقس العين…")}</div></div>`;
  if (error && !weather)
    return html`<div class="weather" style=${{ background: "var(--terracotta)" }}>
      <div>${t("Weather unavailable — check your connection.", "تعذّر تحميل الطقس — تحقق من الاتصال.")}</div>
    </div>`;

  const [label, glyph] = describeCode(weather.code);
  const Icon = weatherIcon[glyph] || weatherIcon.sun;
  let at = cachedAt;
  if (at == null) { try { at = JSON.parse(localStorage.getItem("naqa.weather.cache")).at; } catch {} }
  const stale = !online && at;
  const cachedTime = at
    ? new Date(at).toLocaleString(lang === "ar" ? "ar-AE" : "en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  return html`<div class="weather fade-in">
    <${Icon} size=${52} stroke=${1.6} />
    <div>
      <div class="temp">${weather.temp}°C</div>
      <div style=${{ fontSize: "13px", opacity: 0.9 }}>${label} · ${AL_AIN.name}</div>
      ${stale && html`<div style=${{ fontSize: "11.5px", opacity: 0.85, marginBlockStart: "2px" }}>📴 ${t("Last updated", "آخر تحديث")}: ${cachedTime}</div>`}
    </div>
    <div class="meta grow" style=${{ justifyContent: "flex-end" }}>
      <span class="row gap-4"><${Humidity} size=${16} /> <b>${weather.humidity}%</b> ${t("humidity", "رطوبة")}</span>
      <span class="row gap-4"><${Wind} size=${16} /> <b>${weather.wind}</b> ${t("km/h", "كم/س")}</span>
    </div>
  </div>`;
}

export function WeatherMini({ weather }) {
  const { t } = useStore();
  if (!weather) return html`<span class="weather-mini">${t("—", "—")}</span>`;
  const [label, glyph] = describeCode(weather.code);
  const Icon = weatherIcon[glyph] || weatherIcon.sun;
  return html`<span class="weather-mini" title=${label}>
    <${Icon} size=${18} />
    <span class="t">${weather.temp}°</span>
    <span>${weather.humidity}% · ${weather.wind}${t("km/h", "كم/س")}</span>
  </span>`;
}
