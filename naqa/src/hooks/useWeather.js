// Fetch + cache live weather. Refreshes every 15 min; caches to localStorage
// so the UI shows something instantly on reload while a fresh fetch runs.
// Also: re-fetches immediately when the browser comes back online (Feature 2),
// and appends every successful reading to the weather history log (Feature 7).
import { useState, useEffect } from "../core/html.js";
import { fetchWeather } from "../utils/weather.js";
import { logWeatherReading, seedIfEmpty } from "../utils/weatherLog.js";

seedIfEmpty();

const CACHE_KEY = "naqa.weather.cache";

export function useWeather() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) { const c = JSON.parse(raw); return { data: c.data, loading: true, error: null, cachedAt: c.at || null }; }
    } catch {}
    return { data: null, loading: true, error: null, cachedAt: null };
  });

  useEffect(() => {
    let alive = true;
    async function load() {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        // Offline: keep cached values, stop the spinner.
        setState((s) => ({ ...s, loading: false }));
        return;
      }
      try {
        const data = await fetchWeather();
        if (!alive) return;
        const at = Date.now();
        setState({ data, loading: false, error: null, cachedAt: at });
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, at }));
        logWeatherReading(data);
      } catch (e) {
        if (!alive) return;
        setState((s) => ({ ...s, loading: false, error: e.message || "Failed" }));
      }
    }
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    const onOnline = () => load(); // refresh immediately on reconnect
    window.addEventListener("online", onOnline);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return state; // { data, loading, error, cachedAt }
}
