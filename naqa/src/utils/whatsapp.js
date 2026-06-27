// CallMeBot free WhatsApp integration — no backend, no API key from us.
// The user obtains their personal key by messaging the CallMeBot number once.
import { todayISO } from "./helpers.js";

export function buildDailyMessage(s) {
  return (
    `🐪 NAQA · ناقة — Daily Farm Summary\n` +
    `📅 ${s.date}\n` +
    `❤️ Farm Health Score: ${s.healthScore}/100 (${s.healthLabel})\n` +
    `🐪 Camels: ${s.camelCount} | ⚠️ ${s.camelAlerts} alerts\n` +
    `🌴 Palms: ${s.palmCount} | ⚠️ ${s.palmAlerts} alerts\n` +
    `📋 Checklists incomplete today: ${s.checklistsIncomplete}\n` +
    `💉 Overdue vaccines: ${s.overdueVaccines}\n` +
    `Open the app to take action.`
  );
}

export async function sendWhatsApp(number, key, message) {
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(number)}` +
    `&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(key)}`;
  // CallMeBot is cross-origin; no-cors fires the request (opaque response).
  return fetch(url, { mode: "no-cors" });
}

// --- Offline queue (Feature 2) ---
const QUEUE_KEY = "naqa_wa_queue";
function readQueue() { try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch { return []; } }
function writeQueue(q) { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch {} }

export function enqueueWhatsApp(number, key, message) {
  const q = readQueue();
  q.push({ number, key, message, at: Date.now() });
  writeQueue(q);
}
export function queuedCount() { return readQueue().length; }

// Try to send everything queued. Returns number of messages flushed.
export async function flushWhatsAppQueue() {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;
  const q = readQueue();
  if (!q.length) return 0;
  let sent = 0;
  for (const m of q) {
    try { await sendWhatsApp(m.number, m.key, m.message); sent++; } catch {}
  }
  writeQueue([]);
  return sent;
}

// Send now if online, otherwise queue for later. Returns { queued: boolean }.
export async function dispatchWhatsApp(number, key, message) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    enqueueWhatsApp(number, key, message);
    return { queued: true };
  }
  await sendWhatsApp(number, key, message);
  return { queued: false };
}

// Returns true if a daily message should be auto-sent right now.
export function shouldSendDaily(settings) {
  if (!settings || !settings.enabled || !settings.number || !settings.apiKey) return false;
  if (settings.lastSent === todayISO()) return false;
  const [hh, mm] = (settings.time || "07:00").split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hh || 7, mm || 0, 0, 0);
  const diffMin = (now - target) / 60000;
  return diffMin >= 0 && diffMin <= 10; // within 10 minutes past chosen time
}
