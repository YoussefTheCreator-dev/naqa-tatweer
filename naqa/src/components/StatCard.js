// Quick-stat card used on the dashboard (optional 7-day sparkline).
import { html } from "../core/html.js";
import { Sparkline } from "./Sparkline.js";

const tones = {
  palm: { bg: "var(--ok-bg)", fg: "var(--palm)" },
  sand: { bg: "var(--surface-2)", fg: "var(--terracotta)" },
  warn: { bg: "var(--warn-bg)", fg: "var(--warn)" },
  danger: { bg: "var(--danger-bg)", fg: "var(--danger)" },
  info: { bg: "var(--info-bg)", fg: "var(--info)" },
};

export function StatCard({ icon: Icon, value, label, tone = "palm", spark }) {
  const c = tones[tone] || tones.palm;
  return html`<div class="card hover stat">
    <div class="ico" style=${{ background: c.bg, color: c.fg }}>
      <${Icon} size=${22} />
    </div>
    <div class="num">${value}</div>
    <div class="lbl">${label}</div>
    ${spark && html`<${Sparkline} data=${spark} color=${c.fg} />`}
  </div>`;
}
