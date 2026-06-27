// Always-visible floating SOS button + emergency contacts modal.
import { html, useState, Fragment } from "../core/html.js";
import { SOS, Phone, X, Users } from "./Icons.js";
import { useStore } from "../core/store.js";
import { ContactsModal } from "./Contacts.js";

const CONTACTS = [
  { en: "Veterinary Emergency", ar: "طوارئ بيطرية", tel: "+97137554444", sub: "Al Ain Vet Clinic" },
  { en: "Farm Authority (ADAFSA)", ar: "هيئة أبوظبي للزراعة", tel: "+97128181111", sub: "Agriculture & Food Safety" },
  { en: "Fire & Rescue", ar: "الدفاع المدني", tel: "997", sub: "Civil Defence" },
  { en: "Police", ar: "الشرطة", tel: "999", sub: "Emergency" },
  { en: "Ambulance", ar: "الإسعاف", tel: "998", sub: "Medical Emergency" },
];

export function SOSButton() {
  const [open, setOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const { t } = useStore();

  return html`<${Fragment}>
    <button class="fab sos" aria-label=${t("Emergency SOS", "طوارئ")} onClick=${() => setOpen(true)}>
      <${SOS} size=${26} />
    </button>
    ${open &&
    html`<div class="overlay" onClick=${() => setOpen(false)}>
      <div class="modal" onClick=${(e) => e.stopPropagation()}>
        <div class="row between" style=${{ marginBlockEnd: "8px" }}>
          <h3 style=${{ margin: 0, color: "var(--danger)" }}>${t("Emergency Contacts", "أرقام الطوارئ")}</h3>
          <button class="btn btn-ghost btn-icon" onClick=${() => setOpen(false)} aria-label="Close"><${X} size=${18} /></button>
        </div>
        <p class="muted" style=${{ marginBlockStart: 0, fontSize: "13px" }}>
          ${t("Tap a number to call. For life-threatening emergencies call 999.", "اضغط على الرقم للاتصال. للحالات الخطيرة اتصل 999.")}
        </p>
        <button class="btn btn-ghost btn-block" style=${{ marginBlockEnd: "10px" }} onClick=${() => setContactsOpen(true)}>
          <${Users} size=${16} /> ${t("Open my vet contact book", "فتح دفتر جهات الاتصال البيطرية")}
        </button>
        <div class="stack gap-8">
          ${CONTACTS.map(
            (c) => html`<a
              key=${c.tel}
              class="list-row card"
              style=${{ textDecoration: "none", padding: "12px 14px" }}
              href=${`tel:${c.tel}`}>
              <span class="avatar" style=${{ background: "var(--danger)" }}><${Phone} size=${20} /></span>
              <span class="grow">
                <div style=${{ fontWeight: 700 }}>${t(c.en, c.ar)}</div>
                <div class="muted" style=${{ fontSize: "12.5px" }}>${c.sub}</div>
              </span>
              <span style=${{ fontWeight: 700, color: "var(--danger)" }}>${c.tel}</span>
            </a>`
          )}
        </div>
      </div>
    </div>`}
    ${contactsOpen && html`<${ContactsModal} onClose=${() => setContactsOpen(false)} />`}
  <//>`;
}
