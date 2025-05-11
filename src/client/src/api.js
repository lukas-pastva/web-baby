async function json(r) {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const listRecommendations = () => json(fetch("/api/recommendations"));
export const listLogs            = (qs="") => json(fetch(`/api/logs${qs}`));
export const insertLog           = (body) => json(fetch("/api/logs", {
  method : "POST",
  headers: { "Content-Type": "application/json" },
  body   : JSON.stringify(body),
}));
