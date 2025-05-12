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
/*  Helpers ---------------------------------------------------------- */
/* ------------------------------------------------------------------ */
function tzOffsetString(date = new Date()) {
  const offsetMin = -date.getTimezoneOffset();          // west = –, east = +
  const sign      = offsetMin >= 0 ? "+" : "-";
  const abs       = Math.abs(offsetMin);
  const hh        = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm        = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;                           // e.g. “+02:00”
}

/* ------------------------------------------------------------------ */
/*  API surface ------------------------------------------------------ */
/* ------------------------------------------------------------------ */
export default {
  /* recommendations */
  listRecs () {
    return json(fetch("/api/milking/recommendations"));
  },

  /* feeds ----------------------------------------------------------- */
  /**
   * Return all feeds that fall within the *local* calendar day.
   * We send an explicit timezone-aware range instead of naïve UTC
   * midnight → 23:59 so entries around midnight never bleed over.
   */
  listFeeds(day) {
    const tz      = tzOffsetString();
    const fromIso = `${day}T00:00:00${tz}`;
    const toIso   = `${day}T23:59:59${tz}`;
    return json(
      fetch(
        `/api/milking/feeds?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`
      )
    );
  },

  insertFeed(payload) {
    return json(fetch("/api/milking/feeds", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload),
    }));
  },

  updateFeed(id, payload) {
    return json(fetch(`/api/milking/feeds/${id}`, {
      method : "PUT",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload),
    }));
  },

  deleteFeed(id) {
    return json(fetch(`/api/milking/feeds/${id}`, { method: "DELETE" }));
  },
};
