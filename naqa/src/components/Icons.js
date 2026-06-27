// Inline SVG icon set — themeable via currentColor, no external dependency.
import { html } from "../core/html.js";

const S = (props, children) => {
  const { size = 22, stroke = 2, ...rest } = props || {};
  return html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width=${size} height=${size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width=${stroke}
    stroke-linecap="round" stroke-linejoin="round" ...${rest}>${children}</svg>`;
};

export const Palm = (p) => S(p, html`
  <path d="M12 22v-9" />
  <path d="M12 13c-3-4-7-4-9-3 2-3 7-4 9-1" />
  <path d="M12 13c3-4 7-4 9-3-2-3-7-4-9-1" />
  <path d="M12 13c-1-4-4-7-6-8 4 0 6 3 6 6" />
  <path d="M12 13c1-4 4-7 6-8-4 0-6 3-6 6" />
`);

export const Camel = (p) => S(p, html`
  <path d="M3 18c0-2 1-3 1-5 0-2 2-3 3-3" />
  <path d="M7 10c1-3 2-4 3-1 .5 1.5 1 2 2 2s1.5-1 2-2c1-2 2-1 2 1 0 2 1 3 2 4" />
  <path d="M18 14c.5 2 1 3 1 4" />
  <path d="M5 18v2M7.5 18v2M16 18v2M18.5 18v2" />
  <path d="M6 7c0-1 1-1 1 0" />
`);

export const Drop = (p) => S(p, html`<path d="M12 3s6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 6-10 6-10z" />`);

export const Syringe = (p) => S(p, html`
  <path d="m18 2 4 4" />
  <path d="m17 7 3-3" />
  <path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5" />
  <path d="m9 11 2 2" />
  <path d="m13 7 2 2" />
  <path d="m6 18-3 3" />
`);

export const Scale = (p) => S(p, html`
  <path d="M12 3v18" />
  <path d="M7 21h10" />
  <path d="M5 7h14" />
  <path d="M7 7 4 14a3 3 0 0 0 6 0L7 7z" />
  <path d="M17 7l-3 7a3 3 0 0 0 6 0l-3-7z" />
`);

export const Bell = (p) => S(p, html`
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
`);

export const Chat = (p) => S(p, html`
  <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.5 8.5 0 1 1 21 11.5z" />
`);

export const SOS = (p) => S(p, html`
  <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5l-8-3z" />
  <path d="M12 8v4" />
  <path d="M12 16h.01" />
`);

export const Sun = (p) => S(p, html`
  <circle cx="12" cy="12" r="4" />
  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
`);

export const Cloud = (p) => S(p, html`<path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6 19h11.5z" />`);
export const CloudSun = (p) => S(p, html`
  <path d="M12 3v1M5.6 5.6l.7.7M3 12h1M18.4 5.6l-.7.7" />
  <circle cx="12" cy="11" r="3" />
  <path d="M16 18a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.2A3.2 3.2 0 0 0 7 18h9z" />
`);
export const Rain = (p) => S(p, html`
  <path d="M16 13a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 5 13h11z" />
  <path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" />
`);
export const Storm = (p) => S(p, html`
  <path d="M16 12a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 5 12h11z" />
  <path d="m12 13-3 5h3l-1 4 4-6h-3l1-3z" />
`);
export const Fog = (p) => S(p, html`
  <path d="M4 9h16M4 13h16M6 17h12M8 21h8" />
`);

export const Wind = (p) => S(p, html`
  <path d="M2 8h13a3 3 0 1 0-3-3" />
  <path d="M2 12h17a3 3 0 1 1-3 3" />
  <path d="M2 16h9a3 3 0 1 1-3 3" />
`);
export const Humidity = Drop;

export const Plus = (p) => S(p, html`<path d="M12 5v14M5 12h14" />`);
export const ArrowLeft = (p) => S(p, html`<path d="M19 12H5M12 19l-7-7 7-7" />`);
export const Phone = (p) => S(p, html`<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />`);
export const Send = (p) => S(p, html`<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />`);
export const X = (p) => S(p, html`<path d="M18 6 6 18M6 6l12 12" />`);
export const Calendar = (p) => S(p, html`
  <rect x="3" y="4" width="18" height="18" rx="2" />
  <path d="M16 2v4M8 2v4M3 10h18" />
`);
export const Check = (p) => S(p, html`<path d="M20 6 9 17l-5-5" />`);
export const Leaf = (p) => S(p, html`
  <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16z" />
  <path d="M4 20c3-6 6-9 12-12" />
`);
export const Camera = (p) => S(p, html`
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
  <circle cx="12" cy="13" r="4" />
`);
export const Moon = (p) => S(p, html`<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />`);
export const Globe = (p) => S(p, html`
  <circle cx="12" cy="12" r="9" />
  <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
`);
export const Heart = (p) => S(p, html`<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z" />`);
export const Trash = (p) => S(p, html`
  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
`);

export const Search = (p) => S(p, html`<circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />`);
export const Filter = (p) => S(p, html`<path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />`);
export const QrCode = (p) => S(p, html`
  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
  <rect x="3" y="14" width="7" height="7" rx="1" />
  <path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h4v-4" />
`);
export const Thermometer = (p) => S(p, html`<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />`);
export const MapPin = (p) => S(p, html`<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />`);
export const Activity = (p) => S(p, html`<path d="M22 12h-4l-3 9L9 3l-3 9H2" />`);
export const Clock = (p) => S(p, html`<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />`);
export const Upload = (p) => S(p, html`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />`);
export const Edit = (p) => S(p, html`<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />`);
export const Scissors = (p) => S(p, html`<circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />`);
export const ChevronDown = (p) => S(p, html`<path d="m6 9 6 6 6-6" />`);
export const ChevronUp = (p) => S(p, html`<path d="m18 15-6-6-6 6" />`);
export const Printer = (p) => S(p, html`<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" />`);
export const Tag = (p) => S(p, html`<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8z" /><circle cx="7" cy="7" r="1.2" />`);
export const Image = (p) => S(p, html`<rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" />`);
export const AlertTriangle = (p) => S(p, html`<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" />`);
export const Sprout = (p) => S(p, html`<path d="M7 20h10M12 20V10M12 10C12 6 9 4 5 4c0 4 3 6 7 6zM12 12c0-3 2-5 6-5 0 3-3 5-6 5z" />`);
export const Male = (p) => S(p, html`<circle cx="10" cy="14" r="6" /><path d="M14.5 9.5 20 4M15 4h5v5" />`);
export const Female = (p) => S(p, html`<circle cx="12" cy="8" r="6" /><path d="M12 14v8M9 19h6" />`);
export const FileText = (p) => S(p, html`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" />`);
export const Settings = (p) => S(p, html`<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />`);
export const MessageCircle = (p) => S(p, html`<path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.5 8.5 0 1 1 21 11.5z" />`);
export const Star = (p) => S(p, html`<path d="M12 2.5l2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.8 6.2 20.5l1.1-6.5L2.5 9.4l6.6-1L12 2.5z" />`);
export const Users = (p) => S(p, html`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />`);

// Map weather glyph key -> component.
export const weatherIcon = {
  sun: Sun,
  cloud: Cloud,
  "cloud-sun": CloudSun,
  rain: Rain,
  storm: Storm,
  fog: Fog,
  snow: Cloud,
};
