// Persistent, collapsible notification bar aggregating ALL alerts across every
// camel and palm tree (plus due reminders). Auto-refreshes every 60s.
import { html, useState, useEffect } from "../core/html.js";
import { useStore } from "../core/store.js";
import { allAlerts, isUrgent } from "../utils/alerts.js";
import { Bell, ChevronDown, ChevronUp, Clock, Check, AlertTriangle } from "./Icons.js";

const sevIcon = { critical: AlertTriangle, high: AlertTriangle, medium: Bell, low: Bell };

export function AlertBar({ onGoTo, onOpenReminders }) {
  const { t, camels, palms, dailyCare, reminders } = useStore();
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);

  // Auto-refresh every 60s (time-based alerts + due reminders).
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const alerts = allAlerts({ camels, palms, dailyCare, reminders });
  const high = alerts.filter((a) => isUrgent(a.severity)).length;
  const total = alerts.length;

  if (total === 0)
    return html`<div class="alert-bar ok">
      <${Check} size=${18} />
      <span class="grow">${t("All clear — no active alerts", "كل شيء على ما يرام — لا تنبيهات")}</span>
      <button class="alert-rem" onClick=${onOpenReminders}><${Clock} size=${15} /> ${t("Reminders", "تذكيرات")}</button>
    </div>`;

  return html`<div class=${`alert-bar ${high ? "has-urgent" : "has-alerts"}`}>
    <button class="alert-summary" onClick=${() => setOpen((o) => !o)}>
      <span class=${`alert-bell ${high ? "pulse" : ""}`}><${Bell} size=${18} /></span>
      <span class="grow row gap-8 wrap">
        ${high > 0 && html`<span class="badge danger">${high} ${t("urgent", "عاجل")}</span>`}
        <span style=${{ fontWeight: 700 }}>${total} ${t(total === 1 ? "alert" : "alerts", "تنبيه")}</span>
      </span>
      ${open ? html`<${ChevronUp} size=${18} />` : html`<${ChevronDown} size=${18} />`}
    </button>

    ${open &&
      html`<div class="alert-list">
        ${alerts.map(
          (a, i) => html`<div key=${i} class=${`alert-row sev-${a.severity}`}>
            <span class=${`sev-dot ${isUrgent(a.severity) ? "pulse" : ""}`}></span>
            <span class="grow"><span style=${{ fontWeight: 600 }}>${t(a.en, a.ar)}</span></span>
            ${a.id
              ? html`<button class="btn btn-ghost btn-sm" onClick=${() => onGoTo(a.farmType, a.id)}>${t("Go to", "اذهب")}</button>`
              : null}
          </div>`
        )}
        <div class="alert-foot">
          <button class="alert-rem" onClick=${onOpenReminders}><${Clock} size=${15} /> ${t("Manage reminders", "إدارة التذكيرات")}</button>
        </div>
      </div>`}
  </div>`;
}
