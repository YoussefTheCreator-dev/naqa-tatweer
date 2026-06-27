// Tiny axis-less trend line for stat cards.
import { html } from "../core/html.js";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { cssVar } from "../utils/helpers.js";

export function Sparkline({ data, color, height = 34 }) {
  if (!data || data.length < 2) return null;
  const stroke = color || cssVar("--palm", "#2D5A27");
  const series = data.map((v, i) => (typeof v === "number" ? { i, v } : { i, v: v.v }));
  return html`<div style=${{ width: "100%", height: height + "px", marginBlockStart: "2px" }}>
    <${ResponsiveContainer} width="100%" height="100%">
      <${LineChart} data=${series} margin=${{ top: 4, right: 2, left: 2, bottom: 0 }}>
        <${Line} type="monotone" dataKey="v" stroke=${stroke} strokeWidth=${2} dot=${false} isAnimationActive=${false} />
      <//>
    <//>
  </div>`;
}
