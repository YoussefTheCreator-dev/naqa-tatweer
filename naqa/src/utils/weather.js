// Open-Meteo (free, no API key) for Al Ain, UAE.
export const AL_AIN = { lat: 24.2075, lon: 55.7447, name: "Al Ain, UAE" };

const ENDPOINT =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${AL_AIN.lat}&longitude=${AL_AIN.lon}` +
  "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
  "&daily=sunrise,sunset&forecast_days=1" +
  "&wind_speed_unit=kmh&timezone=auto";

export async function fetchWeather() {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const data = await res.json();
  const c = data.current || {};
  const d = data.daily || {};
  return {
    temp: Math.round(c.temperature_2m),
    humidity: Math.round(c.relative_humidity_2m),
    wind: Math.round(c.wind_speed_10m),
    code: c.weather_code,
    time: c.time,
    sunrise: (d.sunrise && d.sunrise[0]) || null, // local ISO e.g. "2026-06-27T05:35"
    sunset: (d.sunset && d.sunset[0]) || null,
  };
}

// Decide theme from sunrise/sunset (local ISO strings). Returns "dark"|"light"|null.
export function themeForNow(weather, now = new Date()) {
  if (!weather || !weather.sunrise || !weather.sunset) return null;
  const sr = new Date(weather.sunrise).getTime();
  const ss = new Date(weather.sunset).getTime();
  const t = now.getTime();
  if (isNaN(sr) || isNaN(ss)) return null;
  // After sunset OR before sunrise → dark; between → light.
  return t >= ss || t < sr ? "dark" : "light";
}

// WMO weather codes -> label + simple glyph key.
export function describeCode(code) {
  const map = {
    0: ["Clear sky", "sun"],
    1: ["Mainly clear", "sun"],
    2: ["Partly cloudy", "cloud-sun"],
    3: ["Overcast", "cloud"],
    45: ["Fog", "fog"],
    48: ["Rime fog", "fog"],
    51: ["Light drizzle", "rain"],
    53: ["Drizzle", "rain"],
    55: ["Dense drizzle", "rain"],
    61: ["Light rain", "rain"],
    63: ["Rain", "rain"],
    65: ["Heavy rain", "rain"],
    71: ["Light snow", "snow"],
    80: ["Rain showers", "rain"],
    81: ["Rain showers", "rain"],
    82: ["Violent showers", "rain"],
    95: ["Thunderstorm", "storm"],
    96: ["Thunderstorm + hail", "storm"],
    99: ["Thunderstorm + hail", "storm"],
  };
  return map[code] || ["—", "sun"];
}

// Context-aware advisory derived from live weather + the active farm type.
// farmType: "camel" | "palm" | null (home)
export function getAdvisory(w, farmType) {
  if (!w) return null;
  if (w.temp >= 45)
    return {
      tone: "danger",
      title: "Extreme heat warning",
      text: "Avoid midday outdoor work. Camels need full shade and doubled water; pause palm pollination handling.",
    };
  if (w.temp >= 42)
    return {
      tone: "danger",
      title: "High heat alert",
      text:
        farmType === "palm"
          ? "Irrigate at dawn/dusk only and check for frond scorch on young palms."
          : "Ensure camels have shade and extra water; check calves and elders first.",
    };
  if (w.humidity >= 80)
    return {
      tone: "warn",
      title: "High humidity",
      text:
        farmType === "palm"
          ? "Watch for fungal risk on palms — inspect crowns and reduce overhead watering."
          : "Humid conditions — monitor herd for heat stress and skin issues.",
    };
  if (w.wind >= 40)
    return {
      tone: "warn",
      title: "Strong winds / dust",
      text: "Secure shade structures and feed troughs; delay spraying and pollination today.",
    };
  if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(w.code))
    return {
      tone: "info",
      title: "Rain expected",
      text: "Pause irrigation to save water and check drainage around tree bases.",
    };
  if (w.temp <= 12)
    return {
      tone: "info",
      title: "Cool night ahead",
      text: "Provide windbreaks for young camels; cold stress slows palm growth.",
    };
  return {
    tone: "ok",
    title: "Good conditions",
    text: "Weather is favourable for routine farm work and inspections today.",
  };
}
