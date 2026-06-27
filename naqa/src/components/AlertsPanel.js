// Generic alerts list panel.
import { html } from "../core/html.js";
import { useStore } from "../core/store.js";
import { Bell, Check } from "./Icons.js";

export function AlertsPanel({ alerts, onSelect }) {
  const { t } = useStore();
  if (!alerts || alerts.length === 0)
    return html`<div class="card stack gap-8 center" style=${{ alignItems: "center", padding: "40px 16px" }}>
      <span class="avatar" style=${{ background: "var(--ok-bg)", color: "var(--ok)" }}><${Check} size=${22} /></span>
      <div style=${{ fontWeight: 700 }}>${t("All clear", "كل شيء على ما يرام")}</div>
      <div class="muted">${t("No active alerts right now.", "لا توجد تنبيهات حالياً.")}</div>
    </div>`;

  return html`<div class="card card-pad-0">
    ${alerts.map(
      (a, i) => html`<button
        key=${i}
        class="list-row"
        style=${{ width: "100%", background: "none", border: "none", textAlign: "start", borderBlockEnd: "1px solid var(--line)" }}
        onClick=${() => onSelect && onSelect(a)}>
        <span class=${`badge ${a.tone}`}><${Bell} size=${14} /></span>
        <span class="grow">
          <div style=${{ fontWeight: 700 }}>${a.subject}</div>
          <div class="muted" style=${{ fontSize: "13px" }}>${a.en ? t(a.en, a.ar) : a.text}</div>
        </span>
        <span class=${`dot`} style=${{ background: a.tone === "danger" ? "var(--danger)" : a.tone === "warn" ? "var(--warn)" : "var(--info)" }}></span>
      </button>`
    )}
  </div>`;
}
