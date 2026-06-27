// Deep-link helpers for QR codes (Feature 4).
// URLs look like  https://host/path#/camel/{id}  or  #/palm/{id}.

export function profileUrl(type, id) {
  const base = location.origin + location.pathname;
  return `${base}#/${type}/${encodeURIComponent(id)}`;
}

// Parse the current hash into a route, or null if it isn't a profile link.
export function routeFromHash() {
  const m = (location.hash || "").match(/^#\/(camel|palm)\/(.+)$/);
  if (!m) return null;
  return { name: m[1], openId: decodeURIComponent(m[2]), addPrefill: null };
}
