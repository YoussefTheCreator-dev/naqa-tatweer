// Entry point — mount the React tree.
import { html } from "./core/html.js";
import { createRoot } from "react-dom/client";
import { App } from "./app.js";

const root = createRoot(document.getElementById("root"));
root.render(html`<${App} />`);
