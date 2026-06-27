// Reusable profile UI bits shared by camel & palm profiles.
import { html, useState } from "../core/html.js";
import { useStore } from "../core/store.js";
import { statusMeta } from "../utils/alerts.js";
import { QrCode, ChevronDown, ChevronUp } from "./Icons.js";

// Colored status ring wrapping an avatar/children.
export function HealthRing({ status, size = 84, children }) {
  const ring = (statusMeta[status] || statusMeta.healthy).ring;
  return html`<span style=${{
    display: "inline-grid", placeItems: "center", borderRadius: "50%",
    padding: "3px", background: `conic-gradient(${ring} 0 100%)`,
    width: size + 6 + "px", height: size + 6 + "px", flex: "none",
  }}>${children}</span>`;
}

// Small status dot (for list rows).
export function HealthDot({ status, size = 12 }) {
  const ring = (statusMeta[status] || statusMeta.healthy).ring;
  return html`<span class="dot" style=${{ width: size + "px", height: size + "px", background: ring, boxShadow: `0 0 0 3px color-mix(in srgb, ${ring} 22%, transparent)` }}></span>`;
}

export function CompletenessBar({ percent }) {
  const { t } = useStore();
  const color = percent >= 80 ? "var(--ok)" : percent >= 50 ? "var(--warn)" : "var(--terracotta)";
  return html`<div class="stack gap-4">
    <div class="row between" style=${{ fontSize: "12.5px" }}>
      <span class="muted">${t("Profile completeness", "اكتمال الملف")}</span>
      <span style=${{ fontWeight: 700, color }}>${percent}%</span>
    </div>
    <div class="prog"><span style=${{ width: percent + "%", background: color }}></span></div>
  </div>`;
}

export function QrBox({ label }) {
  return html`<div class="qr-box">
    <${QrCode} size=${56} />
    <span class="muted" style=${{ fontSize: "12px" }}>${label}</span>
  </div>`;
}

// Collapsible section card.
export function Collapsible({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return html`<div class="card">
    <button class="collapsible-head" onClick=${() => setOpen((o) => !o)}>
      <span class="row gap-8" style=${{ fontWeight: 800, fontFamily: "var(--font-head)", fontSize: "16px" }}>
        ${Icon ? html`<${Icon} size=${18} />` : null} ${title}
      </span>
      ${open ? html`<${ChevronUp} size=${18} />` : html`<${ChevronDown} size=${18} />`}
    </button>
    ${open && html`<div class="stack gap-12" style=${{ marginBlockStart: "12px" }}>${children}</div>`}
  </div>`;
}

// 1–5 body condition score as clickable dots.
export function ScoreDots({ value = 0, max = 5, onChange, color = "var(--terracotta)" }) {
  return html`<div class="row gap-8">
    ${Array.from({ length: max }, (_, i) => i + 1).map(
      (n) => html`<button key=${n} type="button" aria-label=${`Score ${n}`}
        onClick=${() => onChange && onChange(n)}
        class="score-dot"
        style=${{ background: n <= value ? color : "var(--surface-2)", borderColor: n <= value ? color : "var(--line)" }}>${n}</button>`
    )}
  </div>`;
}
