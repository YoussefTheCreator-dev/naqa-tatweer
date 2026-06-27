# NAQA · ناقة — Smart Farming Assistant

Bilingual (Arabic + English) smart-farming dashboard for **Al Ain, UAE**, covering
**date palm farms** and **camel herds**. Built for the Al Quaa agriculture hackathon.

> This is the **dashboard shell + all navigation screens**. The camera / AI
> disease-diagnosis feature is a separate module wired in later — see the
> `DiagnosisPlaceholder` (`// TODO: wire DiagnosisCamera`) in `src/pages/PalmFarm.js`.

## Features in this build
- **Landing / intro** — bilingual hero, ambient CSS desert background, live weather
  widget (Open-Meteo, no API key), weather-aware advisory banner, two farm entry points.
- **My Farm dashboard** — farm title, date, live weather summary, quick stat cards.
- **Camel module** — herd list, add camel, profile (weight chart, vaccine log with
  next-due reminders, feeding schedule, notes), alerts panel, water & feed tracker.
- **Palm module** — tree list, add tree, profile (growth chart, treatment history,
  irrigation log), alerts panel, irrigation-by-section tracker, AI-diagnosis placeholder.
- **Chatbot** — context-aware persona (Camel Expert / Palm Expert / NAQA Assistant),
  typing indicator, canned replies, suggested-question chips. *(Placeholder responses;
  wire a real API in `src/components/Chatbot.js → getCannedReply`.)*
- **Floating SOS** — pulsing red button → emergency contacts modal with tap-to-call.
- **Bilingual + RTL** — Arabic/English toggle (flips `dir`), logical CSS properties.
- **Dark mode** — toggle in the header / landing.
- All data persists in **localStorage** (seeded with demo camels & palms on first run).

## Run it (no build step required)
There is **no Node.js** required. The app is plain ES modules loading React + Recharts
from a CDN via an import map, so it just needs to be **served over http** (not opened
as a `file://`, which blocks module + CDN requests).

Using the installed Python:
```
cd "%USERPROFILE%\Desktop\naqa"
python -m http.server 5173
```
Then open <http://localhost:5173> in a browser. An internet connection is needed
(CDN libraries + live weather).

## Project structure
```
naqa/
├─ index.html            # import map, fonts, mount point
├─ styles/theme.css      # full desert theme, RTL-aware, dark mode
├─ assets/               # (static assets — none required yet)
└─ src/
   ├─ main.js            # mounts the app
   ├─ app.js             # state-based router + layout shell
   ├─ core/              # html (htm+React) helper, global store/context
   ├─ hooks/             # useLocalStorage, useWeather
   ├─ utils/             # weather (Open-Meteo + advisory), seed data, alerts, helpers
   ├─ components/        # Header, WeatherWidget, AdvisoryBanner, StatCard, Tabs,
   │                     #   AlertsPanel, TrendChart, SOSButton, Chatbot, FloatingActions, Icons
   └─ pages/             # Landing, Dashboard (FarmOverview), CamelFarm, PalmFarm
```

## Upgrading to a Vite/React build later
Components are real ES modules using React + hooks. To migrate:
1. `npm create vite@latest naqa -- --template react`
2. Replace the `htm` template strings with JSX (or keep `htm` — it works under Vite too).
3. `npm i react react-dom recharts` and remove the import map from `index.html`.

## Theme tokens
Sand `#C9A96E` · Palm green `#2D5A27` · Terracotta `#C4622D` · Parchment `#F5ECD7` ·
Charcoal `#1C1C1C`. Fonts: **Cairo** (headings) + **Inter** (body).
