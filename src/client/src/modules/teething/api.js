async function json(p) {
  const r = await p;
  if (r.status === 204) return null;
  if (r.ok) return r.json();
  throw new Error(`HTTP ${r.status} – ${await r.text()}`);
}

export default {
  listTeeth() {
    return json(fetch("/api/teething/teeth"));
  },

  upsertTooth(payload) {
    return json(fetch("/api/teething/teeth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }));
  },

  updateTooth(id, payload) {
    return json(fetch(`/api/teething/teeth/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }));
  },

  deleteTooth(id) {
    return json(fetch(`/api/teething/teeth/${id}`, { method: "DELETE" }));
  },

  clearTooth(toothCode) {
    return json(fetch(`/api/teething/teeth/${toothCode}/clear`, {
      method: "POST",
    }));
  },
};
