/* ---------- tiny fetch helper that preserves server error text ---------- */
async function json(respPromise) {
  const resp = await respPromise;
  if (resp.ok) return resp.json();

  /* try to forward whatever the back-end sent */
  let details = "";
  try { details = (await resp.json()).error || ""; } catch { /* ignore */ }

  const msg = `HTTP ${resp.status}${details ? " – " + details : ""}`;
  throw new Error(msg);
}

/* ---------- exported calls ---------- */
export const listRecommendations = () => json(fetch("/api/recommendations"));
export const listLogs            = (qs = "") => json(fetch(`/api/logs${qs}`));
export const insertLog           = (body) =>
  json(
    fetch("/api/logs", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(body),
    })
  );
