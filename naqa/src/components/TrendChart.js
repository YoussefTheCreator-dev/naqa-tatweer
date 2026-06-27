// Reusable line chart (Recharts) for weight / growth logs.
import { html } from "../core/html.js";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { cssVar, formatDate } from "../utils/helpers.js";

export function TrendChart({ data, xKey = "date", yKey, unit = "", color }) {
  const stroke = color || cssVar("--palm", "#2D5A27");
  const grid = cssVar("--line", "#E5D8B8");
  const ink = cssVar("--ink-soft", "#6B6353");

  if (!data || data.length === 0)
    return html`<div class="empty">No data yet.</div>`;

  return html`<div style=${{ width: "100%", height: "240px" }}>
    <${ResponsiveContainer} width="100%" height="100%">
      <${LineChart} data=${data} margin=${{ top: 10, right: 12, left: -8, bottom: 0 }}>
        <${CartesianGrid} strokeDasharray="3 3" stroke=${grid} />
        <${XAxis} dataKey=${xKey} tickFormatter=${(d) => formatDate(d).slice(0, 6)} tick=${{ fill: ink, fontSize: 11 }} />
        <${YAxis} tick=${{ fill: ink, fontSize: 11 }} width=${44} domain=${["auto", "auto"]} />
        <${Tooltip}
          labelFormatter=${(d) => formatDate(d)}
          formatter=${(v) => [`${v} ${unit}`, ""]}
          contentStyle=${{ borderRadius: 12, border: `1px solid ${grid}`, fontSize: 13 }} />
        <${Line} type="monotone" dataKey=${yKey} stroke=${stroke} strokeWidth=${2.5}
          dot=${{ r: 3, fill: stroke }} activeDot=${{ r: 5 }} />
      <//>
    <//>
  </div>`;
}
