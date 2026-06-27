// Global footer — visible on every screen.
import { html } from "../core/html.js";

export function Footer({ home = false }) {
  return html`<footer class="app-footer">
    ${home && html`<div class="foot-tagline">NAQA · ناقة — Built for Al Quaa, Al Ain 🌴</div>`}
    <div>
      For feedback and bug reports, contact Medtech Pioneers
    </div>
  </footer>`;
}
