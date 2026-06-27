// Friendly illustrated empty state with a call-to-action.
import { html } from "../core/html.js";
import { Plus } from "./Icons.js";

function DesertScene({ type }) {
  // Inline SVG: dunes + a single camel or palm silhouette.
  const accent = type === "camel" ? "var(--terracotta)" : "var(--palm)";
  return html`<svg width="180" height="120" viewBox="0 0 180 120" fill="none" aria-hidden="true">
    <circle cx="138" cy="34" r="16" fill="var(--sand)" opacity="0.5" />
    <path d="M0 92c30-14 54-14 90 0s60 6 90-6v40H0z" fill="var(--sand)" opacity="0.55" />
    <path d="M0 108c40-10 70-6 100 2s50 2 80-6v16H0z" fill=${accent} opacity="0.18" />
    ${type === "camel"
      ? html`<g stroke=${accent} stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(58,52)">
          <path d="M2 40c0-8 3-12 3-20 0-7 6-11 11-11" />
          <path d="M16 9c3-9 7-12 10-3 1.6 5 3 6 6 6s5-3 6-6c3-7 7-4 7 3 0 8 3 12 6 16" />
          <path d="M8 40v6M14 40v6M44 42v6M50 42v6" />
        </g>`
      : html`<g stroke=${accent} stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(74,40)">
          <path d="M16 60V26" />
          <path d="M16 26c-10-10-22-8-30-4 5-9 20-12 30-3M16 26c10-10 22-8 30-4-5-9-20-12-30-3" />
          <path d="M16 26c-3-12-12-18-20-20 12-1 20 8 20 16M16 26c3-12 12-18 20-20-12-1-20 8-20 16" />
        </g>`}
  </svg>`;
}

export function EmptyState({ type, title, subtitle, cta, onCta }) {
  return html`<div class="card stack gap-12 fade-in" style=${{ alignItems: "center", textAlign: "center", padding: "34px 18px" }}>
    <${DesertScene} type=${type} />
    <div style=${{ fontWeight: 800, fontSize: "18px" }}>${title}</div>
    <div class="muted" style=${{ maxWidth: "360px" }}>${subtitle}</div>
    ${cta && html`<button class="btn btn-primary" onClick=${onCta}><${Plus} size=${16} /> ${cta}</button>`}
  </div>`;
}
