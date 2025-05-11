async function json(p) {
  const r = await p;
  if (r.ok) return r.json();
  const msg = `HTTP ${r.status} – ${await r.text()}`;
  throw new Error(msg);
}

export default {
  listRecs : ()          => json(fetch("/api/milking/recommendations")),
  listFeeds: (day)       =>
    json(fetch(`/api/milking/feeds?from=${day}&to=${day}T23:59:59Z`)),
  insertFeed: (payload)  =>
    json(
      fetch("/api/milking/feeds", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(payload),
      })
    ),
};
