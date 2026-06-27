// Weather history log (Feature 7). Stores up to 30 days of readings in
// localStorage under `naqa_weather_log`, auto-pruning older entries.
// One aggregate entry per calendar day so repeated 15-min fetches refine
// the day's min/max temperature and average humidity rather than bloating.
//
// Entry: { date, time, temp, tempMin, tempMax, humidity, humSum, humCount,
//          wind, code, ts }
const LOG_KEY = "naqa_weather_log";
const MAX_DAYS = 30;

function read() { try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; } catch { return []; } }
function write(list) { try { localStorage.setItem(LOG_KEY, JSON.stringify(list)); } catch {} }

export function logWeatherReading(w) {
  if (!w || typeof w.temp !== "number") return;
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);
  const list = read();
  const idx = list.findIndex((e) => e.date === date);
  if (idx >= 0) {
    const e = list[idx];
    e.temp = w.temp;
    e.tempMin = Math.min(e.tempMin != null ? e.tempMin : w.temp, w.temp);
    e.tempMax = Math.max(e.tempMax != null ? e.tempMax : w.temp, w.temp);
    e.humidity = w.humidity;
    e.humSum = (e.humSum || 0) + w.humidity;
    e.humCount = (e.humCount || 0) + 1;
    e.wind = w.wind; e.code = w.code; e.time = time; e.ts = now.getTime();
  } else {
    list.push({ date, time, temp: w.temp, tempMin: w.temp, tempMax: w.temp, humidity: w.humidity, humSum: w.humidity, humCount: 1, wind: w.wind, code: w.code, ts: now.getTime() });
  }
  const cutoff = Date.now() - MAX_DAYS * 86400000;
  write(list.filter((e) => (e.ts || 0) >= cutoff).sort((a, b) => a.ts - b.ts));
}

export function getWeatherLog() {
  return read().sort((a, b) => (a.ts || 0) - (b.ts || 0));
}

export function avgHumidity(e) {
  return e.humCount ? Math.round(e.humSum / e.humCount) : e.humidity;
}

// Last N calendar days of readings.
export function lastNDays(n = 7) {
  const cutoff = Date.now() - n * 86400000;
  return getWeatherLog().filter((e) => (e.ts || 0) >= cutoff);
}

// Count days in the log whose max temp exceeded `threshold` °C (heat stress).
export function highHeatDays(threshold = 42) {
  return getWeatherLog().filter((e) => (e.tempMax != null ? e.tempMax : e.temp) > threshold).length;
}

// Pre-populate plausible Al Ain readings so the chart is meaningful on first
// run. Real fetches refine today's entry afterwards. No-op if data exists.
export function seedIfEmpty() {
  if (read().length) return;
  const list = [];
  const month = new Date().getMonth(); // 0=Jan
  const summer = month >= 4 && month <= 9; // May–Oct
  const baseMax = summer ? 43 : 30;
  const baseMin = summer ? 30 : 19;
  for (let i = 12; i >= 1; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(13, 0, 0, 0);
    const wobble = Math.round((Math.sin(i) * 3));
    const tMax = baseMax + wobble + (i % 3 === 0 ? 2 : 0);
    const tMin = baseMin + Math.round(wobble / 2);
    const hum = 22 + ((i * 7) % 30);
    list.push({
      date: d.toISOString().slice(0, 10), time: "13:00",
      temp: tMax, tempMin: tMin, tempMax: tMax,
      humidity: hum, humSum: hum, humCount: 1,
      wind: 8 + (i % 10), code: i % 4 === 0 ? 1 : 0, ts: d.getTime(),
    });
  }
  write(list);
}
