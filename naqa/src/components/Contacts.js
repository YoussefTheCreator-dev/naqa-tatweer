// Vet / authority contact book (Feature 5). A clean list with initials avatars,
// speciality badges, a large call button, favourites pinned to the top, plus an
// inline add/edit form. Opened from Settings, each camel profile, and the SOS modal.
import { html, useState } from "../core/html.js";
import { useStore } from "../core/store.js";
import { Phone, Plus, Trash, Edit, Star, X, Users } from "./Icons.js";

const SPECIALITIES = ["Camel Vet", "Palm Specialist", "Farm Authority", "Emergency", "Other"];
const SPEC_AR = {
  "Camel Vet": "طبيب إبل", "Palm Specialist": "أخصائي نخيل",
  "Farm Authority": "جهة زراعية", "Emergency": "طوارئ", "Other": "أخرى",
};
const initials = (name) => (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const EMPTY = { name: "", phone: "", speciality: "Camel Vet", notes: "", favourite: false };

export function ContactsModal({ onClose }) {
  const { t, lang, contacts, addContact, updateContact, removeContact } = useStore();
  const [form, setForm] = useState(null); // null = list view; object = add/edit
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const sorted = contacts.slice().sort((a, b) => (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0) || a.name.localeCompare(b.name));

  function save(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    if (form.id) updateContact(form.id, form);
    else addContact(form);
    setForm(null);
  }

  return html`<div class="overlay" onClick=${onClose}>
    <div class="modal stack gap-12" style=${{ maxWidth: "480px", maxHeight: "88vh", overflowY: "auto" }} onClick=${(e) => e.stopPropagation()}>
      <div class="row between">
        <h3 style=${{ margin: 0 }}><${Users} size=${18} /> ${t("Vet & Farm Contacts", "جهات الاتصال البيطرية")}</h3>
        <button class="btn btn-ghost btn-icon" onClick=${onClose} aria-label="Close"><${X} size=${16} /></button>
      </div>

      ${form
        ? html`<form class="stack gap-8" onSubmit=${save}>
            <div class="field"><label>${t("Name", "الاسم")}</label><input class="input" value=${form.name} onInput=${set("name")} required /></div>
            <div class="field"><label>${t("Phone number", "رقم الهاتف")}</label><input class="input" value=${form.phone} onInput=${set("phone")} placeholder="+97150…" required /></div>
            <div class="field"><label>${t("Speciality", "التخصص")}</label>
              <select class="select" value=${form.speciality} onChange=${set("speciality")}>
                ${SPECIALITIES.map((s) => html`<option key=${s} value=${s}>${lang === "ar" ? SPEC_AR[s] : s}</option>`)}
              </select>
            </div>
            <div class="field"><label>${t("Notes", "ملاحظات")}</label><textarea class="input" rows="2" value=${form.notes} onInput=${set("notes")}></textarea></div>
            <label class="check-line"><input type="checkbox" checked=${!!form.favourite} onChange=${(e) => setForm((s) => ({ ...s, favourite: e.target.checked }))} /> ${t("Favourite (pin to top)", "مفضّل (تثبيت بالأعلى)")}</label>
            <div class="row gap-8">
              <button type="submit" class="btn btn-primary grow">${t("Save contact", "حفظ")}</button>
              <button type="button" class="btn btn-ghost" onClick=${() => setForm(null)}>${t("Cancel", "إلغاء")}</button>
            </div>
          </form>`
        : html`<div class="stack gap-10">
            <button class="btn btn-primary btn-sm" onClick=${() => setForm({ ...EMPTY })}><${Plus} size=${15} /> ${t("Add contact", "إضافة جهة")}</button>
            ${sorted.length === 0
              ? html`<div class="empty">${t("No contacts yet.", "لا توجد جهات اتصال.")}</div>`
              : html`<div class="stack gap-8">
                  ${sorted.map((c) => html`<div key=${c.id} class="contact-row">
                    <span class="contact-avatar">${initials(c.name)}</span>
                    <span class="grow">
                      <div class="row gap-8" style=${{ alignItems: "center" }}>
                        <span style=${{ fontWeight: 700 }}>${c.name}</span>
                        ${c.favourite ? html`<${Star} size=${13} style=${{ color: "var(--warn)", fill: "var(--warn)" }} />` : null}
                      </div>
                      <span class="badge info" style=${{ marginBlockStart: "3px" }}>${lang === "ar" ? (SPEC_AR[c.speciality] || c.speciality) : c.speciality}</span>
                      ${c.notes ? html`<div class="muted" style=${{ fontSize: "12px", marginBlockStart: "3px" }}>${c.notes}</div>` : null}
                    </span>
                    <span class="stack gap-4" style=${{ alignItems: "center" }}>
                      <a class="btn btn-primary btn-icon" href=${`tel:${c.phone}`} aria-label="Call" style=${{ textDecoration: "none" }}><${Phone} size=${18} /></a>
                      <span class="row gap-4">
                        <button class="btn btn-ghost btn-icon" style=${{ padding: "5px" }} onClick=${() => updateContact(c.id, { favourite: !c.favourite })} aria-label="Favourite"><${Star} size=${13} style=${{ color: c.favourite ? "var(--warn)" : "var(--ink-soft)" }} /></button>
                        <button class="btn btn-ghost btn-icon" style=${{ padding: "5px" }} onClick=${() => setForm({ ...c })} aria-label="Edit"><${Edit} size=${13} /></button>
                        <button class="btn btn-ghost btn-icon" style=${{ padding: "5px" }} onClick=${() => removeContact(c.id)} aria-label="Delete"><${Trash} size=${13} /></button>
                      </span>
                    </span>
                  </div>`)}
                </div>`}
          </div>`}
    </div>
  </div>`;
}
