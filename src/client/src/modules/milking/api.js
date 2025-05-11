/* ------------------------------------------------------------------ */
/*  Tiny fetch helper – returns JSON or null on 204 ------------------ */
/* ------------------------------------------------------------------ */
async function json(promise) {
  const r = await promise;
  if (r.status === 204) return null;          // no-content
  if (r.ok) return r.json();
  throw new Error(`HTTP ${r.status} – ${await r.text()}`);
}

/* ------------------------------------------------------------------ */
/*  API surface ------------------------------------------------------ */
/* ------------------------------------------------------------------ */
export default {
  /* recommendations */
  listRecs ()                { return json(fetch("/api/milking/recommendations")); },

  /* feeds ----------------------------------------------------------- */
  listFeeds(day)             {
    return json(fetch(`/api/milking/feeds?from=${day}&to=${day}T23:59:59Z`));
  },

  insertFeed(payload)        {
    return json(fetch("/api/milking/feeds", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload),
    }));
  },

  updateFeed(id, payload)    {
    return json(fetch(`/api/milking/feeds/${id}`, {
      method : "PUT",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload),
    }));
  },

  deleteFeed(id)             {
    return json(fetch(`/api/milking/feeds/${id}`, { method: "DELETE" }));
  },
};
