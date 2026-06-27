// Weather-derived, farm-aware advisory banner.
import { html } from "../core/html.js";
import { getAdvisory } from "../utils/weather.js";
import { Bell } from "./Icons.js";

export function AdvisoryBanner({ weather, farmType }) {
  const adv = getAdvisory(weather, farmType);
  if (!adv) return null;
  return html`<div class=${`advisory ${adv.tone} fade-in`} role="status">
    <${Bell} size=${20} />
    <div><b>${adv.title}</b><span>${adv.text}</span></div>
  </div>`;
}
