# NAQA (ناقة) — AI Smart Farming Assistant

> Bilingual AI-powered dashboard for camel herd and date palm grove management in Al Ain, UAE.

**Tatweer Hackathon 2026 · Challenge 5 — Free Choice**
🌐 **Live Demo: https://naqa-tatweer.onrender.com**

---

## The Problem

Camel farming is the primary livelihood for thousands of families in Al Qua'a and the wider Al Ain region. Yet farmers today manage entire herds with paper records, detect disease by eye, and have no access to veterinary expertise outside working hours. A single case of undetected mange or MERS can spread to a full herd within days — costing tens of thousands of dirhams and months of recovery.

**Target users:** Smallholder camel farmers and date palm growers in rural UAE — specifically Al Qua'a, Al Ain — who own 5–50 camels and 10–100 date palms, operate with no backend infrastructure, and need tools that work in Arabic and offline.

---

## Solution

NAQA (Arabic: ناقة, meaning "she-camel") is a bilingual PWA that runs in any browser — no app store, no installation. It combines on-device AI diagnosis, real-time herd management, and an expert AI chatbot into one tool built specifically for this community.

### Core Features

| Feature | Detail |
|---|---|
| 🐪 Camel AI Diagnosis | ONNX model (5.6 MB) runs fully on-device via ONNX Runtime Web — no internet needed |
| 🌴 Palm AI Diagnosis | MobileNetV2 model served via FastAPI backend, 99.2% confidence on test images |
| 🤖 AI Farming Chatbot | LLaMA 3.3 70B via Groq — expert in UAE camel diseases, palm diseases, Al Ain climate |
| 📊 Herd Management | Health scores (0–100), weight trending, vaccine reminders, breeding calendar |
| 🌾 Grove Management | Harvest predictions, irrigation schedules, daily care checklists |
| 🌤️ Weather Advisories | Live Al Ain data from Open-Meteo — heat stress alerts, sandstorm warnings |
| 📱 PWA + Offline | Installable on any device, 61 files pre-cached — works without internet |
| 🇦🇪 Bilingual | Full Arabic (RTL) and English, switchable at runtime |
| 🚨 WhatsApp Alerts | Emergency alerts sent directly to farmer's WhatsApp via CallMeBot |
| 🖨️ Health Passport | Printable health record per animal for veterinary visits |

---

## Impact

- A sick camel detected 3 days earlier = prevents herd spread = saves ~AED 15,000–50,000 per animal
- Zero server cost for farmers — runs on any phone or tablet
- Tested on seed data: health score drops 22 points after 2 missed vaccine events, triggering automatic alert
- Palm diagnosis: 99.17% confidence on held-out test image (date palm, Al Ain)
- Chatbot correctly identified mange symptoms and recommended treatment protocol in under 3 seconds

---

## Feasibility

| Factor | Detail |
|---|---|
| Cost | Zero for farmers — free to use, open source |
| Infrastructure | No database, no cloud dependency for core features — localStorage only |
| Hardware | Runs on any smartphone or tablet from 2018 onwards |
| Connectivity | Core features (herd management, camel AI diagnosis) work fully offline |
| Maintenance | Static frontend needs no updates; backend hosted free on Render |
| Language | Full Arabic support — no literacy barrier for UI navigation |

---

## Scalability

- **Other emirates:** No code changes needed — Open-Meteo weather works anywhere, chatbot knows UAE farming broadly
- **Other livestock:** ONNX model slot can be swapped for sheep/goat models with no architecture changes
- **More users:** Backend on Render auto-scales; frontend served as static files
- **Community data:** localStorage can be upgraded to a shared Supabase backend in one afternoon
- **Government integration:** Health passport format designed to match UAE livestock registry records

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (CDN, no build step), htm, vanilla CSS |
| AI — Camel | ONNX Runtime Web, camel_triage_model.onnx (5.6 MB) |
| AI — Palm | FastAPI + ONNX Runtime (Python), MobileNetV2 converted via tf2onnx |
| AI — Chatbot | Groq API, LLaMA 3.3 70B Versatile |
| Weather | Open-Meteo API (no key, no cost) |
| Alerts | CallMeBot WhatsApp API |
| Backend | FastAPI + Uvicorn, Python 3.14 |
| Deployment | Render (free tier), GitHub auto-deploy |
| Offline | Service Worker, 61 files pre-cached |
| PWA | manifest.json, SVG icons, install prompt |

---

## How to Run

### Option 1 — Live (no setup)
Open **https://naqa-tatweer.onrender.com** in any browser.
> Note: Free tier cold start may take 30–60 seconds on first load.

### Option 2 — Local
```bash
# 1. Clone
git clone https://github.com/YoussefTheCreator-dev/naqa-tatweer.git
cd naqa-tatweer

# 2. Add API key
cp .env.example .env
# Edit .env → add your GROQ_API_KEY from console.groq.com (free)

# 3. Start backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8002

# 4. Start frontend (new terminal)
cd naqa
python -m http.server 5173

# 5. Open http://localhost:5173
```

---

## Evidence & Testing

- ✅ Camel ONNX model: loads and runs inference in browser (ONNX Runtime Web, verified via DevTools Network tab)
- ✅ Palm ONNX model: 99.17% confidence on date palm test image
- ✅ Chatbot: live response in <3 seconds — correctly diagnosed mange from symptom description
- ✅ Weather: live Al Ain data (38.6°C, 28% humidity confirmed during testing)
- ✅ Offline: all 61 app files cached by service worker — verified in Chrome DevTools → Application → Cache Storage
- ✅ PWA: install prompt confirmed in Chrome desktop and Android
- ✅ WhatsApp: CallMeBot endpoint returns HTTP 200
- ✅ localStorage: seed data (3 camels, 3 palms) persists across page reloads
- ✅ Arabic RTL: full layout switch confirmed

---

## Team

Youssef Mohamed Ahmed · Abdallah M. H. Qudaih · Hanan Zyad Aljaber · Siraj El Andary · Mazen Mohamed Awadalla

**Institution:** Abu Dhabi University, Al Ain
**Hackathon:** Tatweer Hackathon 2026 · Al Qua'a, Al Ain, UAE

For feedback and bug reports, contact Medtech Pioneers.
