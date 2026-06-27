// Generate a QR PNG data URL on demand (off-screen), independent of React.
// Used by the passport / label print views. Returns null if QRCode missing.
export function qrDataUrl(url, size = 160) {
  if (!window.QRCode) return null;
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.left = "-9999px";
  document.body.appendChild(div);
  try {
    // eslint-disable-next-line no-new
    new window.QRCode(div, {
      text: url, width: size, height: size,
      colorDark: "#1C1C1C", colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.M,
    });
    const canvas = div.querySelector("canvas");
    if (canvas) { try { return canvas.toDataURL("image/png"); } catch {} }
    const img = div.querySelector("img");
    return img ? img.src : null;
  } finally {
    document.body.removeChild(div);
  }
}
