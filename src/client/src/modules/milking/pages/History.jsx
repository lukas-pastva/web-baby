import React, { useEffect, useState } from "react";
import { subDays, startOfDay, format } from "date-fns";
import api        from "../api.js";
import DayCard    from "../components/DayCard.jsx";

const DAYS_PER_PAGE = 50;

/**
 * Loads feeds backwards in time, 50 days at a time.
 * Groups everything client-side so the back-end needs no change.
 */
export default function MilkingHistory() {
  const [page, setPage]       = useState(0);   // 0 => newest 50 days
  const [recs, setRecs]       = useState([]);
  const [feedsByDay, setData] = useState({});
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  /* fetch static daily recommendations once */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* load current page of days */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const today = startOfDay(new Date());
      const promises = [];

      for (let i = 0; i < DAYS_PER_PAGE; i++) {
        const date = subDays(today, page * DAYS_PER_PAGE + i);
        const day  = format(date, "yyyy-MM-dd");

        promises.push(
          api
            .listFeeds(day)
            .then((rows) => ({ day, date, rows }))
            .catch((e) => ({ day, date, rows: [], error: e }))
        );
      }

      const results = await Promise.all(promises);
      setData((prev) => {
        const next = { ...prev };
        for (const r of results) next[r.day] = r;
        return next;
      });
      setLoading(false);
    })();
  }, [page]);

  /* helper: pick recommendation for a given age-in-days */
  function recForAge(ageDays) {
    const row = recs.find((r) => r.ageDays === ageDays);
    return row ? row.totalMl : 0;
  }

  /* today at 00:00 to compute age-in-days */
  const birthday = (() => {
    const rt = window.__ENV__ || {};
    return rt.birthTs ? new Date(rt.birthTs) : null;
  })();

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "1rem" }}>
      <h2>Milking - all days</h2>

      {err && <p style={{ color: "#c00" }}>{err}</p>}

      {Object.values(feedsByDay)
        .sort((a, b) => b.date - a.date)                // newest first
        .map(({ day, date, rows }) => {
          const ageDays =
            birthday != null
              ? Math.round((date - birthday) / 864e5)
              : null;
          const recToday = ageDays != null ? recForAge(ageDays) : 0;

          return (
            <DayCard
              key={day}
              date={date}
              feeds={rows}
              recTotal={recToday}
            />
          );
        })}

      <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <button className="btn-light" onClick={() => setPage(page + 1)}>
            Load older 50&nbsp;days
          </button>
        )}
      </div>
    </main>
  );
}
