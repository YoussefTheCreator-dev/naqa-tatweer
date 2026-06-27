// Pill tab bar.
import { html } from "../core/html.js";

export function Tabs({ tabs, active, onChange }) {
  return html`<div class="tabs">
    ${tabs.map(
      (tb) => html`<button
        key=${tb.key}
        class=${`tab ${active === tb.key ? "active" : ""}`}
        onClick=${() => onChange(tb.key)}>
        ${tb.icon ? html`<${tb.icon} size=${16} />` : null}${tb.label}
        ${tb.badge ? html`<span class="badge danger" style=${{ padding: "0 7px", marginInlineStart: "2px" }}>${tb.badge}</span>` : null}
      </button>`
    )}
  </div>`;
}
