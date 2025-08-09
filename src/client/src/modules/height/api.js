async function json(p) {
  const r = await p;
  if (r.status === 204) return null;
  if (r.ok) return r.json();
  throw new Error(`HTTP ${r.status} – ${await r.text()}`);
}

export default {
  listHeights(from, to) {                       // both optional
    const q = [];
    if (from) q.push(`from=${from}`);
    if (to)   q.push(`to=${to}`);
    const qs = q.length ? "?" + q.join("&") : "";
    return json(fetch(`/api/height/heights${qs}`));
  },

  insertHeight(payload) {
    return json(fetch("/api/height/heights", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload),
    }));
  },

  updateHeight(id, payload) {
    return json(fetch(`/api/height/heights/${id}`, {
      method : "PUT",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload),
    }));
  },

  deleteHeight(id) {
    return json(fetch(`/api/height/heights/${id}`, { method: "DELETE" }));
  },
};
