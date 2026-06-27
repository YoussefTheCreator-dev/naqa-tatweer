// Circular/square avatar that shows an uploaded base64 photo, or a silhouette
// icon placeholder. PhotoUpload wraps it with a tap-to-upload affordance.
import { html, useRef } from "../core/html.js";
import { useStore } from "../core/store.js";
import { Camel, Palm, Camera } from "./Icons.js";

export function Avatar({ photo, type = "camel", size = 64, radius = "50%" }) {
  const Icon = type === "camel" ? Camel : Palm;
  const bg = type === "camel" ? "var(--terracotta)" : "var(--palm)";
  if (photo)
    return html`<span style=${{ width: size + "px", height: size + "px", borderRadius: radius, overflow: "hidden", flex: "none", display: "block", border: "2px solid var(--surface)" }}>
      <img src=${photo} alt="" style=${{ width: "100%", height: "100%", objectFit: "cover" }} />
    </span>`;
  return html`<span class="avatar" style=${{ background: bg, width: size + "px", height: size + "px", borderRadius: radius }}>
    <${Icon} size=${size * 0.5} stroke=${1.6} />
  </span>`;
}

// Resizes + compresses to a small JPEG base64 to keep localStorage light.
function fileToCompressedDataURL(file, max = 320) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoUpload({ photo, type, size = 84, onChange }) {
  const { t, pushToast } = useStore();
  const inputRef = useRef(null);

  async function pick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataURL(file);
      onChange(dataUrl);
    } catch {
      pushToast({ tone: "danger", en: "Could not read image", ar: "تعذّر قراءة الصورة" });
    }
  }

  return html`<div style=${{ position: "relative", width: size + "px", height: size + "px", flex: "none" }}>
    <${Avatar} photo=${photo} type=${type} size=${size} />
    <button type="button" class="photo-btn" title=${t("Upload photo", "رفع صورة")}
      onClick=${() => inputRef.current && inputRef.current.click()}>
      <${Camera} size=${15} />
    </button>
    ${photo &&
      html`<button type="button" class="photo-clear" title=${t("Remove", "إزالة")} onClick=${() => onChange("")}>×</button>`}
    <input ref=${inputRef} type="file" accept="image/*" style=${{ display: "none" }} onChange=${pick} />
  </div>`;
}
