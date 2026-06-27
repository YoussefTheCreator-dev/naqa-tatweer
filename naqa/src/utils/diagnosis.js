import { runPalmInference } from "./palmModel.js";
import { runCamelInference } from "./camelModel.js";
export { preloadPalmModel } from "./palmModel.js";
export { preloadCamelModel } from "./camelModel.js";

// Routes each image to the real on-device model for its type.
export async function runDiagnosisModel(imageDataUrl, type) {
  if (type === "palm") {
    return runPalmInference(imageDataUrl);
  }
  if (type === "camel") {
    return runCamelInference(imageDataUrl);
  }
  throw new Error("Unknown diagnosis type: " + type);
}

export function resultToNote(result, type) {
  const pct = Math.round((result.confidence || 0) * 100);
  const concerns = (result.concerns || []).map((c) => c.name).join(", ");
  return (
    `AI ${type} scan: ${result.condition} (${pct}% confidence). ` +
    (concerns ? `Concerns: ${concerns}. ` : "") +
    `${result.recommendation}.`
  );
}
