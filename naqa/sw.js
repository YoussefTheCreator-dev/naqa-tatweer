const CACHE = 'naqa-v2';

// Pre-cache the full app shell on install.
// Uses Promise.allSettled so one slow/missing file never blocks the SW.
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/theme.css',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  // Core
  '/src/main.js',
  '/src/app.js',
  '/src/core/html.js',
  '/src/core/store.js',
  // Hooks
  '/src/hooks/useLocalStorage.js',
  '/src/hooks/useWeather.js',
  // Pages
  '/src/pages/Landing.js',
  '/src/pages/Dashboard.js',
  '/src/pages/CamelFarm.js',
  '/src/pages/PalmFarm.js',
  '/src/pages/ScanPage.js',
  '/src/pages/Calendar.js',
  // Components
  '/src/components/AdvisoryBanner.js',
  '/src/components/AlertBar.js',
  '/src/components/AlertsPanel.js',
  '/src/components/Avatar.js',
  '/src/components/Chatbot.js',
  '/src/components/Contacts.js',
  '/src/components/Diagnosis.js',
  '/src/components/EmptyState.js',
  '/src/components/Expenses.js',
  '/src/components/FarmHealthCard.js',
  '/src/components/FloatingActions.js',
  '/src/components/Footer.js',
  '/src/components/Header.js',
  '/src/components/Icons.js',
  '/src/components/OfflineBanner.js',
  '/src/components/Onboarding.js',
  '/src/components/ProfileBits.js',
  '/src/components/Qr.js',
  '/src/components/Reminders.js',
  '/src/components/Settings.js',
  '/src/components/SOSButton.js',
  '/src/components/Sparkline.js',
  '/src/components/StatCard.js',
  '/src/components/Tabs.js',
  '/src/components/Toaster.js',
  '/src/components/TrendChart.js',
  '/src/components/WeatherHistory.js',
  '/src/components/WeatherWidget.js',
  // Utils
  '/src/utils/alerts.js',
  '/src/utils/breeding.js',
  '/src/utils/calendar.js',
  '/src/utils/camelModel.js',
  '/src/utils/care.js',
  '/src/utils/completeness.js',
  '/src/utils/deeplink.js',
  '/src/utils/diagnosis.js',
  '/src/utils/expenses.js',
  '/src/utils/health.js',
  '/src/utils/helpers.js',
  '/src/utils/palmModel.js',
  '/src/utils/passport.js',
  '/src/utils/qrgen.js',
  '/src/utils/seed.js',
  '/src/utils/summary.js',
  '/src/utils/weather.js',
  '/src/utils/weatherLog.js',
  '/src/utils/weight.js',
  '/src/utils/whatsapp.js',
  '/src/utils/yieldPredict.js',
  // Vendor (ONNX Runtime — bundled for offline camel model)
  '/vendor/ort.min.js',
  '/vendor/ort-wasm-simd-threaded.mjs',
  '/vendor/ort-wasm-simd-threaded.wasm',
  // AI model files
  '/models/camel/labels.json',
  '/models/camel/camel_triage_model.onnx',
  '/models/palm/labels.json',
  '/models/palm/model.json',
  '/models/palm/group1-shard1of3.bin',
  '/models/palm/group1-shard2of3.bin',
  '/models/palm/group1-shard3of3.bin',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', evt => {
  self.skipWaiting(); // activate immediately, don't wait for old SW to die
  evt.waitUntil(
    caches.open(CACHE).then(cache =>
      // allSettled: individual failures are tolerated (e.g. large model files
      // on a slow connection won't abort the whole install)
      Promise.allSettled(SHELL.map(url => cache.add(url)))
    )
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // take control of open tabs immediately
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', evt => {
  const { request } = evt;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept backend API calls (port 8000 or 8001)
  if (url.hostname === 'localhost' && (url.port === '8000' || url.port === '8001')) return;

  // Network-first for live weather data (stale weather is worse than no weather)
  if (url.hostname.includes('open-meteo.com')) {
    evt.respondWith(networkFirst(request));
    return;
  }

  // Network-first for Google Fonts (always want latest, fall back to cached)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    evt.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for everything else (CDN libs, app files, model weights)
  evt.respondWith(cacheFirst(request));
});

// ── Strategies ────────────────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('NAQA is offline and this resource is not cached.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
