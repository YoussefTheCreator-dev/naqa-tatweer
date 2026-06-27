// Real scannable QR code for a camel/palm deep link (Feature 4), plus
// "Download QR" (PNG) and "Print QR label" (credit-card sized) actions.
// Uses the global window.QRCode (qrcodejs) loaded in index.html.
import { html, useRef, useEffect } from "../core/html.js";
import { useStore } from "../core/store.js";
import { profileUrl } from "../utils/deeplink.js";
import { Image as ImageIcon, Printer } from "./Icons.js";

// Pull a PNG data URL out of whatever qrcodejs rendered (canvas or img).
function qrDataUrl(container) {
  if (!container) return null;
  const canvas = container.querySelector("canvas");
  if (canvas) { try { return canvas.toDataURL("image/png"); } catch {} }
  const img = container.querySelector("img");
  if (img && img.src) return img.src;
  return null;
}

export function QrCode({ type, id, label, name, tag, size = 128 }) {
  const { t, settings } = useStore();
  const boxRef = useRef(null);
  const url = profileUrl(type, id);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    el.innerHTML = "";
    if (!window.QRCode) {
      el.innerHTML = `<div style="font-size:12px;color:var(--ink-soft);text-align:center">QR unavailable offline</div>`;
      return;
    }
    // eslint-disable-next-line no-new
    new window.QRCode(el, {
      text: url, width: size, height: size,
      colorDark: "#1C1C1C", colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.M,
    });
  }, [url, size]);

  function download() {
    const data = qrDataUrl(boxRef.current);
    if (!data) return;
    const a = document.createElement("a");
    a.href = data;
    a.download = `NAQA-${type}-${(tag || name || id).toString().replace(/\s+/g, "_")}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  function printLabel() {
    const data = qrDataUrl(boxRef.current);
    const farm = (settings && settings.farmName) || "My Farm";
    const w = window.open("", "_blank", "width=420,height=320");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>NAQA Label</title>
      <style>
        @page { size: 85.6mm 54mm; margin: 0; }
        * { box-sizing: border-box; }
        body { margin:0; font-family: Arial, sans-serif; }
        .label { width: 85.6mm; height: 54mm; padding: 5mm; display: flex; gap: 5mm; align-items: center; border: 1px solid #999; }
        .qr img, .qr canvas { width: 36mm; height: 36mm; }
        .info { flex:1; }
        .brand { font-weight: 800; color: #2D5A27; font-size: 13pt; }
        .nm { font-size: 15pt; font-weight: 800; margin: 2mm 0 1mm; }
        .meta { font-size: 9pt; color: #444; }
        .farm { font-size: 8pt; color: #777; margin-top: 2mm; }
      </style></head><body>
      <div class="label">
        <div class="qr">${data ? `<img src="${data}" />` : ""}</div>
        <div class="info">
          <div class="brand">NAQA · ناقة</div>
          <div class="nm">${name || id}</div>
          <div class="meta">${tag ? "#" + tag : ""} · ${type === "camel" ? "Camel" : "Palm tree"}</div>
          <div class="farm">${farm}</div>
        </div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>
      </body></html>`);
    w.document.close();
  }

  return html`<div class="qr-real" style=${{ maxWidth: "200px", width: "100%" }}>
    <div ref=${boxRef} class="qr-canvas"></div>
    ${label && html`<span class="muted" style=${{ fontSize: "12px", textAlign: "center" }}>${label}</span>`}
    <div class="row gap-6 no-print" style=${{ justifyContent: "center" }}>
      <button class="btn btn-ghost" style=${{ padding: "5px 10px", fontSize: "12px", whiteSpace: "nowrap" }} onClick=${download}><${ImageIcon} size=${13} /> ${t("Download", "تنزيل")}</button>
      <button class="btn btn-ghost" style=${{ padding: "5px 10px", fontSize: "12px", whiteSpace: "nowrap" }} onClick=${printLabel}><${Printer} size=${13} /> ${t("Print", "طباعة")}</button>
    </div>
  </div>`;
}