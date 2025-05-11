import React, { useEffect, useState } from "react";
import { subDays, startOfDay, format } from "date-fns";
import api      from "../api.js";
import DayCard  from "../components/DayCard.jsx";

const DAYS_PER_PAGE = 50;

const rt        = window.__ENV__ || {};
const birthTs   = rt.birthTs ? new Date(rt.birthTs) : null;
const childName = rt.childName   || "";
const childSurname = rt.childSurname || "";

export default function MilkingHistory() {
  const [page, setPage]       = useState(0);
  const [recs, setRecs]       = useState([]);
  const [feedsByDay, setData] = useState({});
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  /* recommendations */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* load N×50-day pages */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const today = startOfDay(new Date());
      const promises = [];

      for (let i = 0; i < DAYS_PER_PAGE; i++) {
        const date = subDays(today, page * DAYS_PER_PAGE + i);
        const day  = format(date, "yyyy-MM-dd");

        promises.push(
          api.listFeeds(day)
             .then(rows => ({ day, date, rows }))
             .catch(()  => ({ day, date, rows: [] }))
        );
      }

      const results = await Promise.all(promises);
      setData(prev => Object.fromEntries(
        [...Object.entries(prev), ...results.map(r => [r.day, r])]
      ));
      setLoading(false);
    })();
  }, [page]);

  /* helper */
  const recForAge = (age) =>
    recs.find(r => r.ageDays === age)?.totalMl ?? 0;

  return (
      <header className="mod-header" style={{ marginBottom: "1rem" }}>
      <div>
        <h2 style={{ margin: 0 }}>Milking – all days</h2>
        <nav>
          <a href="/milking">Today</a>
          <a href="/milking/all">All days</a>
          <a href="/help">Help</a>
        </nav>
      </div>

      <div className="meta">
        <strong>{childName} {childSurname}</strong><br />
      </div>
      </header>

      {err && <p style={{ color: "#c00" }}>{err}</p>}

      {Object.values(feedsByDay)
        .sort((a, b) => b.date - a.date)
        .map(({ day, date, rows }) => {
          const ageDays =
            birthTs ? Math.round((date - birthTs) / 864e5) : null;
          return (
            <DayCard
              key={day}
              date={date}
              feeds={rows}
              recTotal={ageDays != null ? recForAge(ageDays) : 0}
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
