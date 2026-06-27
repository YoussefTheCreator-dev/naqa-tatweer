// Renders the transient toast queue from the store.
import { html } from "../core/html.js";
import { useStore } from "../core/store.js";
import { Bell, X } from "./Icons.js";

export function Toaster() {
  const { toasts, dismissToast, t } = useStore();
  if (!toasts.length) return null;
  return html`<div class="toaster">
    ${toasts.map(
      (tt) => html`<div key=${tt.id} class=${`toast ${tt.tone || "info"}`} role="status">
        <${Bell} size=${18} />
        <span class="grow">${tt.en ? t(tt.en, tt.ar) : tt.msg}</span>
        <button class="toast-x" onClick=${() => dismissToast(tt.id)} aria-label="Dismiss"><${X} size=${15} /></button>
      </div>`
    )}
  </div>`;
}
