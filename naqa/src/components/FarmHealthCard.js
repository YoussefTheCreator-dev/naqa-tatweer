// Large "Farm Health Score" card for the home screen — an SVG progress ring
// around a big score number, a status label, and a per-category breakdown.
// Recomputes live from store data on every render.
import { html } from "../core/html.js";
import { useStore } from "../core/store.js";
import { farmHealthScore } from "../utils/health.js";
import { Heart } from "./Icons.js";

function ScoreRing({ score, color, size = 132, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return html`<svg width=${size} height=${size} viewBox=${`0 0 ${size} ${size}`} style=${{ transform: "rotate(-90deg)" }}>
    <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke="var(--surface-2)" stroke-width=${stroke} />
    <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke=${color} stroke-width=${stroke}
      stroke-linecap="round" stroke-dasharray=${c} stroke-dashoffset=${offset}
      style=${{ transition: "stroke-dashoffset 0.8s var(--ease)" }} />
  </svg>`;
}

export function FarmHealthCard() {
  const { t, camels, palms, dailyCare } = useStore();
  const { score, breakdown, color, en, ar } = farmHealthScore({ camels, palms, dailyCare });

  return html`<div class="card health-card">
    <div class="row gap-8" style=${{ marginBlockEnd: "12px" }}>
      <${Heart} size=${18} style=${{ color }} />
      <h3 class="section-title" style=${{ margin: 0 }}>${t("Farm Health Score", "مؤشر صحة المزرعة")}</h3>
    </div>
    <div class="health-grid">
      <div class="health-gauge">
        <${ScoreRing} score=${score} color=${color} />
        <div class="health-center">
          <div class="health-num">${score}<span class="health-den">/100</span></div>
          <div class="health-label" style=${{ color }}>${t(en, ar)}</div>
        </div>
      </div>
      <div class="health-breakdown">
        ${breakdown.map(
          (b) => html`<div key=${b.key} class="health-row">
            <span class="grow">${t(b.en, b.ar)}</span>
            <span class="health-bar"><span style=${{ width: (b.earned / b.max) * 100 + "%", background: color }}></span></span>
            <span class="health-pts">${b.earned}/${b.max}</span>
          </div>`
        )}
      </div>
    </div>
  </div>`;
}
