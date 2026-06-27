// Root component: state-based router + shared layout chrome
// (header, alert bar, toasts, onboarding, reminders, settings, footer).
import { html, useState, useEffect, Fragment } from "./core/html.js";
import { StoreProvider, useStore } from "./core/store.js";
import { useWeather } from "./hooks/useWeather.js";
import { themeForNow } from "./utils/weather.js";
import { allAlerts } from "./utils/alerts.js";
import { todayISO } from "./utils/helpers.js";
import { routeFromHash } from "./utils/deeplink.js";
import { computeSummary } from "./utils/summary.js";
import { shouldSendDaily, buildDailyMessage, dispatchWhatsApp, flushWhatsAppQueue } from "./utils/whatsapp.js";
import { Header } from "./components/Header.js";
import { AlertBar } from "./components/AlertBar.js";
import { OfflineBanner } from "./components/OfflineBanner.js";
import { FloatingActions } from "./components/FloatingActions.js";
import { Toaster } from "./components/Toaster.js";
import { Onboarding } from "./components/Onboarding.js";
import { RemindersModal } from "./components/Reminders.js";
import { SettingsModal } from "./components/Settings.js";
import { Footer } from "./components/Footer.js";
import { Landing } from "./pages/Landing.js";
import { CamelFarm } from "./pages/CamelFarm.js";
import { PalmFarm } from "./pages/PalmFarm.js";
import { ScanPage } from "./pages/ScanPage.js";
import { CalendarPage } from "./pages/Calendar.js";

function Shell() {
  const { data: weather } = useWeather();
  const { camels, palms, dailyCare, reminders, settings, updateSettings, pushToast, justReconnected, theme, setTheme } = useStore();
  // route: { name, openId, addPrefill } — honour a QR deep link on first load.
  const [route, setRoute] = useState(() => routeFromHash() || { name: "home", openId: null, addPrefill: null });
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const goHome = () => setRoute({ name: "home", openId: null, addPrefill: null });
  const selectFarm = (f) => setRoute({ name: f, openId: null, addPrefill: null });
  const goToProfile = (f, id) => setRoute({ name: f || "camel", openId: id, addPrefill: null });
  const setOpen = (id) => setRoute((r) => ({ ...r, openId: id }));
  const openScan = (type) => setRoute({ name: `scan-${type}`, openId: null, addPrefill: null });
  const openCalendar = () => setRoute({ name: "calendar", openId: null, addPrefill: null });
  const addToFarm = (type, notes) => setRoute({ name: type, openId: null, addPrefill: notes });

  // Respond to QR deep links arriving while the app is already open.
  useEffect(() => {
    const onHash = () => { const r = routeFromHash(); if (r) setRoute(r); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isFarm = route.name === "camel" || route.name === "palm";
  const isScan = route.name === "scan-camel" || route.name === "scan-palm";
  const farmType = isFarm ? route.name : null;
  const alertCount = allAlerts({ camels, palms, dailyCare, reminders }).length;

  // On first load: toast due reminders + maybe auto-send the daily WhatsApp.
  useEffect(() => {
    const today = todayISO();
    const due = reminders.filter((r) => r.when && r.when.slice(0, 10) <= today && new Date(r.when) <= new Date());
    if (due.length)
      pushToast({
        tone: "warn",
        en: due.length === 1 ? `Reminder due: ${due[0].title}` : `${due.length} reminders due today`,
        ar: due.length === 1 ? `تذكير مستحق: ${due[0].title}` : `${due.length} تذكيرات مستحقة اليوم`,
        duration: 6000,
      });

    if (shouldSendDaily(settings)) {
      const msg = buildDailyMessage(computeSummary({ camels, palms, dailyCare }));
      dispatchWhatsApp(settings.number, settings.apiKey, msg)
        .then((res) => {
          updateSettings({ lastSent: today });
          pushToast(res.queued
            ? { tone: "warn", en: "Offline — daily summary will send when connection restored", ar: "غير متصل — سيُرسل الملخص عند عودة الاتصال" }
            : { tone: "ok", en: "Daily WhatsApp summary sent", ar: "تم إرسال ملخص واتساب اليومي" });
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line

  // Flush any queued WhatsApp messages when connectivity returns (Feature 2).
  useEffect(() => {
    if (!justReconnected) return;
    flushWhatsAppQueue().then((n) => {
      if (n > 0) pushToast({ tone: "ok", en: `Sent ${n} queued WhatsApp message${n > 1 ? "s" : ""}`, ar: `تم إرسال ${n} رسالة مؤجلة` });
    });
  }, [justReconnected]); // eslint-disable-line

  // Auto dark mode at sunset (Feature 3). Re-checks now + every 10 min while
  // auto mode is enabled. Manual theme toggles disable auto (see store).
  useEffect(() => {
    if (!settings.autoDark || !weather) return;
    function check() {
      const want = themeForNow(weather);
      if (!want || want === theme) return;
      setTheme(want);
      pushToast(want === "dark"
        ? { tone: "info", en: "🌙 Switched to dark mode (sunset in Al Ain)", ar: "🌙 تم التحويل للوضع الليلي (غروب العين)" }
        : { tone: "info", en: "☀️ Switched to light mode (sunrise in Al Ain)", ar: "☀️ تم التحويل للوضع النهاري (شروق العين)" });
    }
    check();
    const id = setInterval(check, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [settings.autoDark, weather, theme]); // eslint-disable-line

  return html`<div class="app">
    <div class="desert-bg"></div>
    <${OfflineBanner} />

    ${route.name === "home"
      ? html`<${Landing} weather=${weather} onSelectFarm=${selectFarm} onScan=${openScan} onOpenSettings=${() => setSettingsOpen(true)} onCalendar=${openCalendar} />`
      : isScan
      ? html`<${Fragment}>
          <main>
            <${ScanPage} type=${route.name === "scan-camel" ? "camel" : "palm"} onAddToFarm=${addToFarm} onBack=${goHome} />
          </main>
        <//>`
      : route.name === "calendar"
      ? html`<${Fragment}>
          <main>
            <${CalendarPage} onBack=${goHome} onGoTo=${goToProfile} />
          </main>
        <//>`
      : html`<${Fragment}>
          <div class="sticky-top">
            <${Header} weather=${weather} onHome=${goHome} alertCount=${alertCount} onOpenSettings=${() => setSettingsOpen(true)} onOpenCalendar=${openCalendar} />
            <div class="container">
              <${AlertBar} onGoTo=${goToProfile} onOpenReminders=${() => setRemindersOpen(true)} />
            </div>
          </div>
          <main class="container">
            ${route.name === "camel"
              ? html`<${CamelFarm} weather=${weather} openId=${route.openId} onOpen=${setOpen} onBack=${() => setOpen(null)} addPrefill=${route.addPrefill} />`
              : html`<${PalmFarm} weather=${weather} openId=${route.openId} onOpen=${setOpen} onBack=${() => setOpen(null)} addPrefill=${route.addPrefill} />`}
          </main>
        <//>`}

    <${Footer} home=${route.name === "home"} />

    <${FloatingActions} farmType=${farmType} />
    <${Toaster} />
    <${Onboarding} />
    ${remindersOpen && html`<${RemindersModal} onClose=${() => setRemindersOpen(false)} />`}
    ${settingsOpen && html`<${SettingsModal} onClose=${() => setSettingsOpen(false)} />`}
  </div>`;
}

export function App() {
  return html`<${StoreProvider}><${Shell} /><//>`;
}
