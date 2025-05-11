import React, { useEffect, useState } from "react";
import {
  startOfDay,
  addDays,
  format,
  differenceInCalendarDays,
} from "date-fns";
import api     from "../api.js";
import DayCard from "../components/DayCard.jsx";

const DAYS_PER_PAGE = 50;

/* runtime config --------------------------------------------------- */
const rt            = window.__ENV__ || {};
const birthTs       = rt.birthTs ? new Date(rt.birthTs) : null;
const childName     = rt.childName   || "";
const childSurname  = rt.childSurname|| "";
const birthDay      = birthTs ? startOfDay(birthTs) : startOfDay(new Date());

export default function MilkingHistory() {
  const [page, setPage]       = useState(0);      // 0 => birth … +49
  const [recs, setRecs]       = useState([]);
  const [feedsByDay, setData] = useState({});
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  /* recommendations once */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* load 50 sequential days starting at birth+offset */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const promises = [];

      for (let i = 0; i < DAYS_PER_PAGE; i++) {
        const date = addDays(birthDay, page * DAYS_PER_PAGE + i);
        const day  = format(date, "yyyy-MM-dd");
        promises.push(
          api.listFeeds(day)
             .then(rows => ({ day, date, rows }))
             .catch(()  => ({ day, date, rows: [] }))
        );
      }

      const results = await Promise.all(promises);
      setData(prev =>
        Object.fromEntries([
          ...Object.entries(prev),
          ...results.map(r => [r.day, r]),
        ])
      );
      setLoading(false);
    })();
  }, [page]);

  const recForAge = (age) =>
    recs.find(r => r.ageDays === age)?.totalMl ?? 0;

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "1rem" }}>
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
          <strong>{childName} {childSurname}</strong>
        </div>
      </header>

      {err && <p style={{ color: "#c00" }}>{err}</p>}

      {Object.values(feedsByDay)
        .sort((a, b) => a.date - b.date)            /* oldest → newest */
        .map(({ day, date, rows }) => {
          const ageDays = differenceInCalendarDays(date, birthDay);
          return (
            <DayCard
              key={day}
              date={date}
              feeds={rows}
              recTotal={recForAge(ageDays)}
            />
          );
        })}

      <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <button className="btn-light" onClick={() => setPage(page + 1)}>
            Next&nbsp;{DAYS_PER_PAGE}&nbsp;days →
          </button>
        )}
      </div>
    </main>
  );
}
