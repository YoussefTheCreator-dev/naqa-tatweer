// Reminder manager modal: add custom reminders optionally linked to a
// camel or tree. Due reminders also surface in the alert bar + a load toast.
import { html, useState } from "../core/html.js";
import { useStore } from "../core/store.js";
import { Clock, Plus, Trash, X } from "./Icons.js";
import { formatDate } from "../utils/helpers.js";

export function RemindersModal({ onClose }) {
  const { t, reminders, addReminder, removeReminder, camels, palms } = useStore();
  const [f, setF] = useState({ title: "", when: "", linkType: "", linkId: "" });

  function submit(e) {
    e.preventDefault();
    if (!f.title.trim() || !f.when) return;
    addReminder({ title: f.title.trim(), when: f.when, linkType: f.linkType || null, linkId: f.linkId || null });
    setF({ title: "", when: "", linkType: "", linkId: "" });
  }

  const linkOptions = f.linkType === "camel" ? camels : f.linkType === "palm" ? palms : [];

  return html`<div class="overlay" onClick=${onClose}>
    <div class="modal stack gap-12" onClick=${(e) => e.stopPropagation()}>
      <div class="row between">
        <h3 style=${{ margin: 0 }}><${Clock} size=${18} /> ${t("Reminders", "التذكيرات")}</h3>
        <button class="btn btn-ghost btn-icon" onClick=${onClose} aria-label="Close"><${X} size=${16} /></button>
      </div>

      <form class="stack gap-8" onSubmit=${submit}>
        <input class="input" placeholder=${t("Reminder title", "عنوان التذكير")} value=${f.title} onInput=${(e) => setF((s) => ({ ...s, title: e.target.value }))} required />
        <input class="input" type="datetime-local" value=${f.when} onInput=${(e) => setF((s) => ({ ...s, when: e.target.value }))} required />
        <div class="row gap-8">
          <select class="select" value=${f.linkType} onChange=${(e) => setF((s) => ({ ...s, linkType: e.target.value, linkId: "" }))}>
            <option value="">${t("No link", "بدون ربط")}</option>
            <option value="camel">${t("Camel", "ناقة")}</option>
            <option value="palm">${t("Palm tree", "نخلة")}</option>
          </select>
          ${f.linkType &&
            html`<select class="select grow" value=${f.linkId} onChange=${(e) => setF((s) => ({ ...s, linkId: e.target.value }))}>
              <option value="">${t("Select…", "اختر…")}</option>
              ${linkOptions.map((o) => html`<option key=${o.id} value=${o.id}>${o.name || o.code}</option>`)}
            </select>`}
        </div>
        <button class="btn btn-primary"><${Plus} size=${16} /> ${t("Add reminder", "إضافة تذكير")}</button>
      </form>

      ${reminders.length === 0
        ? html`<div class="empty">${t("No reminders yet.", "لا توجد تذكيرات.")}</div>`
        : html`<div class="card card-pad-0" style=${{ maxHeight: "240px", overflowY: "auto" }}>
            ${reminders.slice().sort((a, b) => new Date(a.when) - new Date(b.when)).map(
              (r) => html`<div key=${r.id} class="list-row">
                <span class="avatar" style=${{ background: "var(--info)", width: "38px", height: "38px" }}><${Clock} size=${16} /></span>
                <span class="grow"><div style=${{ fontWeight: 700 }}>${r.title}</div>
                  <div class="muted" style=${{ fontSize: "12.5px" }}>${formatDate(r.when)} ${new Date(r.when) <= new Date() ? "· " + t("due", "مستحق") : ""}</div></span>
                <button class="btn btn-ghost btn-icon" onClick=${() => removeReminder(r.id)}><${Trash} size=${15} /></button>
              </div>`
            )}
          </div>`}
    </div>
  </div>`;
}
