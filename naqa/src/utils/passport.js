// Camel Health Passport (Feature 5) — opens a print-friendly, official-looking
// one-page document in a new window and triggers print. No external services.
import { profileUrl } from "./deeplink.js";
import { qrDataUrl } from "./qrgen.js";
import { formatDate, todayISO } from "./helpers.js";

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const SILHOUETTE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='none' stroke='%23C9A96E' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'><path d='M3 18c0-2 1-3 1-5 0-2 2-3 3-3'/><path d='M7 10c1-3 2-4 3-1 .5 1.5 1 2 2 2s1.5-1 2-2c1-2 2-1 2 1 0 2 1 3 2 4'/><path d='M18 14c.5 2 1 3 1 4'/><path d='M5 18v2M7.5 18v2M16 18v2M18.5 18v2'/></svg>`
  );

export function printCamelPassport(camel, farmName = "My Farm") {
  const qr = qrDataUrl(profileUrl("camel", camel.id), 150);
  const photo = camel.photo || SILHOUETTE;

  const vaccineRows =
    (camel.vaccines || []).length
      ? camel.vaccines
          .map((v) => `<tr><td>${esc(v.name)}</td><td>${esc(formatDate(v.date))}</td><td>${v.next ? esc(formatDate(v.next)) : "—"}</td></tr>`)
          .join("")
      : `<tr><td colspan="3" style="text-align:center;color:#888">No vaccines recorded</td></tr>`;

  const notes = (camel.healthLog || []).slice(0, 3);
  const notesHtml = notes.length
    ? notes
        .map((n) => `<li><b>${esc(formatDate(n.date))}:</b> ${esc(n.condition)}${n.recommendation ? " — " + esc(n.recommendation) : ""}</li>`)
        .join("")
    : `<li style="color:#888">No recent health notes</li>`;

  const gender = camel.gender === "male" ? "Male" : "Female";

  const w = window.open("", "_blank", "width=820,height=1100");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" />
  <title>Camel Health Passport — ${esc(camel.name)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #1c1c1c; margin: 0; }
    .doc { border: 3px double #2D5A27; padding: 22px 26px; position: relative; }
    .head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #2D5A27; padding-bottom: 12px; }
    .brand { font-size: 26px; font-weight: 800; color: #2D5A27; letter-spacing: 1px; }
    .brand small { display:block; font-size: 11px; letter-spacing: 3px; color: #888; font-weight: normal; }
    .title { text-align: right; }
    .title h1 { font-size: 19px; margin: 0; color: #1c1c1c; }
    .title .farm { font-size: 12px; color: #555; margin-top: 4px; }
    .body { display:flex; gap: 22px; margin-top: 18px; }
    .left { width: 180px; flex: none; text-align:center; }
    .photo { width: 160px; height: 160px; object-fit: cover; border: 1px solid #ccc; border-radius: 8px; background:#faf7ef; }
    .qr { margin-top: 12px; }
    .qr img { width: 120px; height: 120px; }
    .right { flex: 1; }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; }
    .f { border-bottom: 1px solid #eee; padding: 5px 0; }
    .f .k { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
    .f .v { font-size: 15px; font-weight: 700; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #2D5A27; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 20px 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
    th { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
    ul { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.7; }
    .seal { position: absolute; right: 30px; bottom: 70px; width: 96px; height: 96px; border: 2px solid #C4622D; border-radius: 50%; display:flex; align-items:center; justify-content:center; text-align:center; color:#C4622D; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; transform: rotate(-12deg); opacity: 0.8; }
    .foot { margin-top: 26px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 11px; color: #777; display:flex; justify-content: space-between; }
  </style></head><body>
  <div class="doc">
    <div class="head">
      <div class="brand">NAQA · ناقة<small>SMART FARMING</small></div>
      <div class="title"><h1>Camel Health Passport</h1><div class="farm">${esc(farmName)}</div></div>
    </div>
    <div class="body">
      <div class="left">
        <img class="photo" src="${photo}" alt="camel" />
        ${qr ? `<div class="qr"><img src="${qr}" alt="QR" /><div style="font-size:9px;color:#999">Scan to open profile</div></div>` : ""}
      </div>
      <div class="right">
        <div class="field-grid">
          <div class="f"><div class="k">Tag Number</div><div class="v">${esc(camel.tagNumber || "—")}</div></div>
          <div class="f"><div class="k">Name</div><div class="v">${esc(camel.name)}</div></div>
          <div class="f"><div class="k">Breed</div><div class="v">${esc(camel.breed || "—")}</div></div>
          <div class="f"><div class="k">Age</div><div class="v">${esc(camel.age || "—")} yrs</div></div>
          <div class="f"><div class="k">Gender</div><div class="v">${gender}</div></div>
          <div class="f"><div class="k">Weight</div><div class="v">${esc(camel.weight || "—")} kg</div></div>
        </div>
        <h2>Vaccination History</h2>
        <table><thead><tr><th>Vaccine</th><th>Date Given</th><th>Next Due</th></tr></thead><tbody>${vaccineRows}</tbody></table>
        <h2>Recent Health Notes</h2>
        <ul>${notesHtml}</ul>
        <h2>Owner / Farm Details</h2>
        <div class="field-grid">
          <div class="f"><div class="k">Farm</div><div class="v">${esc(farmName)}</div></div>
          <div class="f"><div class="k">Insurance / Reg.</div><div class="v">${esc(camel.insurance || "—")}</div></div>
          <div class="f"><div class="k">Paddock / Pen</div><div class="v">${esc(camel.paddock || "—")}</div></div>
          <div class="f"><div class="k">Attending Vet</div><div class="v">${esc(camel.vetName || "—")}</div></div>
        </div>
      </div>
    </div>
    <div class="seal">NAQA<br/>Official<br/>Record</div>
    <div class="foot">
      <span>Generated by NAQA · ناقة on ${esc(formatDate(todayISO()))}</span>
      <span>mazengumball@gmail.com</span>
    </div>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},300);};<\/script>
  </body></html>`);
  w.document.close();
}
