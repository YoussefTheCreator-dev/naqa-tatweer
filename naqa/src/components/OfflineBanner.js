// Slim connectivity banner pinned above everything (Feature 2).
// Offline: amber, dismissible (reappears after 60s if still offline).
// Back online: green "syncing now" banner shown for ~3s.
import { html, useState, useEffect } from "../core/html.js";
import { useStore } from "../core/store.js";
import { X } from "./Icons.js";

export function OfflineBanner() {
  const { t, online, justReconnected } = useStore();
  const [dismissed, setDismissed] = useState(false);

  // Re-show after 60s if still offline. Reset dismissal whenever we go online.
  useEffect(() => {
    if (online) { setDismissed(false); return; }
    if (!dismissed) return;
    const id = setTimeout(() => setDismissed(false), 60000);
    return () => clearTimeout(id);
  }, [online, dismissed]);

  if (online) {
    if (!justReconnected) return null;
    return html`<div class="net-banner ok">✅ ${t("Back online — syncing now", "عاد الاتصال — جارٍ المزامنة")}</div>`;
  }

  if (dismissed) return null;
  return html`<div class="net-banner off">
    <span class="grow">⚠️ ${t("You are offline — weather data will not update", "أنت غير متصل — لن يتم تحديث بيانات الطقس")}</span>
    <button class="net-x" onClick=${() => setDismissed(true)} aria-label="Dismiss"><${X} size=${15} /></button>
  </div>`;
}
