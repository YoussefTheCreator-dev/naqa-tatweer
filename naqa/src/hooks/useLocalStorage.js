// Persist a piece of React state to localStorage.
import { useState, useEffect, useRef } from "../core/html.js";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const first = useRef(true);
  useEffect(() => {
    // Avoid an unnecessary write on the very first render.
    if (first.current) {
      first.current = false;
      if (localStorage.getItem(key) != null) return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full / unavailable — ignore for demo */
    }
  }, [key, value]);

  return [value, setValue];
}
