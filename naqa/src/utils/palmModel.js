// Palm disease inference — runs on the Python backend (POST /api/palm-diagnose).
// The palm_model.keras (MobileNetV2, 2-class) is loaded and cached server-side.
// This replaces the broken browser-side TF.js approach (Keras 3 format incompatibility).

const DIAGNOSE_URL = "/api/palm-diagnose";

export const PALM_CLASSES = ["Diseased", "Healthy"];

// no-op: model loads on first backend request; kept so Diagnosis.js import still works
export function preloadPalmModel() {}

export async function runPalmInference(imageDataUrl) {
  // Strip data URL prefix (data:image/jpeg;base64,...) — send only the base64 payload
  const base64 = imageDataUrl.includes(",")
    ? imageDataUrl.split(",")[1]
    : imageDataUrl;

  const res = await fetch(DIAGNOSE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Palm diagnosis server error ${res.status}`);
  }

  const data = await res.json();
  const isHealthy = data.label === "Healthy";

  return {
    condition: data.label,
    confidence: data.confidence,
    concerns: isHealthy ? [] : [{ name: data.label, severity: "high" }],
    recommendation: data.advice,
    recommendationAr: data.advice_ar,
    vetRequired: !isHealthy,
  };
}
