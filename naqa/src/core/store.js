// Global app store: farm data (camels, palms, feed log) + daily care +
// reminders + toasts + UI state (language/RTL, theme). Persisted to
// localStorage. Exposed via context.
import { html, createContext, useContext, useState, useEffect, useCallback } from "./html.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { SEED } from "../utils/seed.js";
import { todayISO, uid } from "../utils/helpers.js";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [camels, setCamels] = useLocalStorage("naqa.camels", SEED.camels);
  const [palms, setPalms] = useLocalStorage("naqa.palms", SEED.palms);
  const [feedLog, setFeedLog] = useLocalStorage("naqa.feedLog", SEED.feedLog);
  const [dailyCare, setDailyCare] = useLocalStorage("naqa.dailyCare", SEED.dailyCare || {});
  const [reminders, setReminders] = useLocalStorage("naqa.reminders", SEED.reminders || []);
  const [contacts, setContacts] = useLocalStorage("naqa.contacts", SEED.contacts || []);
  const [expenses, setExpenses] = useLocalStorage("naqa.expenses", SEED.expenses || []);
  const [lang, setLang] = useLocalStorage("naqa.lang", "en"); // "en" | "ar"
  const [theme, setTheme] = useLocalStorage("naqa.theme", "light"); // "light" | "dark"
  const [onboarded, setOnboarded] = useLocalStorage("naqa.onboarded", false);
  const [settings, setSettings] = useLocalStorage("naqa_settings", {
    farmName: "My Farm", number: "", apiKey: "", time: "07:00", enabled: false, lastSent: "", autoDark: true,
  });
  const updateSettings = (patch) => setSettings((s) => ({ ...s, ...patch }));

  // Manual theme toggle — also disables auto dark mode so the user's choice sticks.
  const toggleTheme = () => {
    setTheme((th) => (th === "dark" ? "light" : "dark"));
    setSettings((s) => ({ ...s, autoDark: false }));
  };

  // Transient toast queue (not persisted).
  const [toasts, setToasts] = useState([]);

  // Connectivity (Feature 2). `justReconnected` flips true for ~3s on reconnect.
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [justReconnected, setJustReconnected] = useState(false);
  useEffect(() => {
    const goOnline = () => { setOnline(true); setJustReconnected(true); setTimeout(() => setJustReconnected(false), 3000); };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  // Reflect language/theme onto <html> for dir + CSS.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // --- Camel ops ---
  const addCamel = (c) => setCamels((list) => [c, ...list]);
  const updateCamel = (id, patch) =>
    setCamels((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeCamel = (id) => setCamels((list) => list.filter((c) => c.id !== id));

  // --- Palm ops ---
  const addPalm = (p) => setPalms((list) => [p, ...list]);
  const updatePalm = (id, patch) =>
    setPalms((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removePalm = (id) => setPalms((list) => list.filter((p) => p.id !== id));

  // --- Feed/water log ---
  const addFeedEntry = (e) => setFeedLog((list) => [e, ...list]);
  const removeFeedEntry = (id) =>
    setFeedLog((list) => list.filter((e) => e.id !== id));

  // --- Daily care (date-keyed; auto-resets each day) ---
  const toggleCare = (camelId, key, extra = {}) =>
    setDailyCare((dc) => {
      const day = todayISO();
      const camel = dc[camelId] || {};
      const dayRec = camel[day] || {};
      const cur = dayRec[key] || {};
      const done = !cur.done;
      const next = {
        ...dayRec,
        [key]: { ...cur, done, time: done ? new Date().toISOString() : null, ...extra },
      };
      return { ...dc, [camelId]: { ...camel, [day]: next } };
    });
  const setCareNote = (camelId, key, note) =>
    setDailyCare((dc) => {
      const day = todayISO();
      const camel = dc[camelId] || {};
      const dayRec = camel[day] || {};
      const cur = dayRec[key] || {};
      return { ...dc, [camelId]: { ...camel, [day]: { ...dayRec, [key]: { ...cur, note } } } };
    });

  // --- Reminders ---
  const addReminder = (r) => setReminders((list) => [{ id: uid("rem"), ...r }, ...list]);
  const removeReminder = (id) => setReminders((list) => list.filter((r) => r.id !== id));
  // Replace all reminders belonging to a `group` (used for auto-managed
  // breeding milestones). No change if the group content is identical.
  const syncReminders = (group, items) =>
    setReminders((list) => {
      const others = list.filter((r) => r.group !== group);
      const next = [...others, ...items];
      const cur = list.filter((r) => r.group === group);
      const same = cur.length === items.length &&
        items.every((it) => cur.some((c) => c.id === it.id && c.when === it.when && c.title === it.title));
      return same ? list : next;
    });

  // --- Contacts (vet book) ---
  const addContact = (c) => setContacts((list) => [{ id: uid("contact"), ...c }, ...list]);
  const updateContact = (id, patch) => setContacts((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeContact = (id) => setContacts((list) => list.filter((c) => c.id !== id));

  // --- Expenses ---
  const addExpense = (e) => setExpenses((list) => [{ id: uid("exp"), ...e }, ...list]);
  const removeExpense = (id) => setExpenses((list) => list.filter((e) => e.id !== id));

  // --- Toasts ---
  const pushToast = useCallback((toast) => {
    const id = uid("toast");
    setToasts((list) => [...list, { id, tone: "info", ...toast }]);
    setTimeout(() => setToasts((list) => list.filter((tt) => tt.id !== id)), toast.duration || 5000);
  }, []);
  const dismissToast = (id) => setToasts((list) => list.filter((tt) => tt.id !== id));

  const value = {
    camels, addCamel, updateCamel, removeCamel,
    palms, addPalm, updatePalm, removePalm,
    feedLog, addFeedEntry, removeFeedEntry,
    dailyCare, toggleCare, setCareNote,
    reminders, addReminder, removeReminder, syncReminders,
    contacts, addContact, updateContact, removeContact,
    expenses, addExpense, removeExpense,
    toasts, pushToast, dismissToast,
    onboarded, setOnboarded,
    settings, setSettings, updateSettings,
    online, justReconnected,
    lang, setLang,
    theme, setTheme, toggleTheme,
    t: (en, ar) => (lang === "ar" ? ar : en),
  };

  return html`<${StoreContext.Provider} value=${value}>${children}<//>`;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
