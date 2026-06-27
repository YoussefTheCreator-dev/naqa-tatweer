// Weather History card (Feature 7) — collapsible, collapsed by default.
// 7-day temperature + humidity dual-axis line chart, a min/max/avg table,
// and a 30-day high-heat-day count for camel heat-stress awareness.
import { html, useState, Fragment } from "../core/html.js";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { useStore } from "../core/store.js";
import { lastNDays, avgHumidity, highHeatDays } from "../utils/weatherLog.js";
import { formatDate, cssVar } from "../utils/helpers.js";
import { ChevronDown, ChevronUp, Sun } from "./Icons.js";

export function WeatherHistory() {
  const { t, lang } = useStore();
  const [open, setOpen] = useState(false);

  const days = lastNDays(7);
  const heat = highHeatDays(42);
  const grid = cssVar("--line", "#E5D8B8");
  const ink = cssVar("--ink-soft", "#6B6353");

  const chartData = days.map((e) => ({
    date: e.date,
    temp: e.tempMax != null ? e.tempMax : e.temp,
    humidity: avgHumidity(e),
  }));

  return html`<div class="card">
    <button class="collapsible-head" onClick=${() => setOpen((o) => !o)}>
      <span class="row gap-8" style=${{ fontWeight: 800, fontFamily: "var(--font-head)", fontSize: "16px" }}>
        <${Sun} size=${18} /> ${t("Weather History", "سجل الطقس")}
        ${heat > 0 ? html`<span class="badge danger">${heat} ${t("hot days", "أيام حارة")}</span>` : null}
      </span>
      ${open ? html`<${ChevronUp} size=${18} />` : html`<${ChevronDown} size=${18} />`}
    </button>
    ${open && html`<div class="stack gap-12" style=${{ marginBlockStart: "12px" }}>
      ${chartData.length === 0
        ? html`<div class="empty">${t("No weather history yet.", "لا يوجد سجل طقس بعد.")}</div>`
        : html`<${Fragment}>
            <div style=${{ width: "100%", height: "220px" }}>
              <${ResponsiveContainer} width="100%" height="100%">
                <${LineChart} data=${chartData} margin=${{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <${CartesianGrid} strokeDasharray="3 3" stroke=${grid} />
                  <${XAxis} dataKey="date" tick=${{ fill: ink, fontSize: 11 }} tickFormatter=${(d) => formatDate(d).slice(0, 6)} />
                  <${YAxis} yAxisId="t" tick=${{ fill: ink, fontSize: 11 }} width=${36} unit="°" />
                  <${YAxis} yAxisId="h" orientation="right" tick=${{ fill: ink, fontSize: 11 }} width=${36} unit="%" domain=${[0, 100]} />
                  <${Tooltip} labelFormatter=${(d) => formatDate(d)} contentStyle=${{ borderRadius: 12, border: `1px solid ${grid}`, fontSize: 13 }} />
                  <${Legend} wrapperStyle=${{ fontSize: 12 }} />
                  <${Line} yAxisId="t" type="monotone" dataKey="temp" name=${t("Temp °C", "حرارة °م")} stroke="var(--terracotta)" strokeWidth=${2.5} dot=${{ r: 2.5 }} />
                  <${Line} yAxisId="h" type="monotone" dataKey="humidity" name=${t("Humidity %", "رطوبة %")} stroke="var(--info)" strokeWidth=${2.5} dot=${{ r: 2.5 }} strokeDasharray="4 3" />
                <//>
              <//>
            </div>
            <table class="table">
              <thead><tr><th>${t("Day", "اليوم")}</th><th>${t("Min", "الأدنى")}</th><th>${t("Max", "الأعلى")}</th><th>${t("Avg humidity", "متوسط الرطوبة")}</th></tr></thead>
              <tbody>
                ${days.slice().reverse().map((e) => html`<tr key=${e.date}>
                  <td class="muted">${formatDate(e.date)}</td>
                  <td>${e.tempMin != null ? e.tempMin : e.temp}°C</td>
                  <td style=${{ fontWeight: 700 }}>${e.tempMax != null ? e.tempMax : e.temp}°C</td>
                  <td>${avgHumidity(e)}%</td>
                </tr>`)}
              </tbody>
            </table>
            <div class="muted" style=${{ fontSize: "13px" }}>🔥 ${t("High heat days (above 42°C)", "أيام الحر الشديد (فوق 42°م)")}: <b style=${{ color: "var(--danger)" }}>${heat}</b> ${t("in last 30 days", "خلال 30 يوم")}</div>
          <//>`}
    </div>`}
  </div>`;
}
