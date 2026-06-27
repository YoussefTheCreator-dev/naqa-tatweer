// Stacks the always-visible SOS + Chatbot floating buttons.
import { html } from "../core/html.js";
import { SOSButton } from "./SOSButton.js";
import { Chatbot } from "./Chatbot.js";

export function FloatingActions({ farmType }) {
  return html`<div class="fab-wrap">
    <${Chatbot} farmType=${farmType} />
    <${SOSButton} />
  </div>`;
}
