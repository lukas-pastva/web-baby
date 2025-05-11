import React, { useEffect, useState } from "react";
import {
  startOfDay,
  addDays,
  format,
  differenceInCalendarDays,
} from "date-fns";
import api             from "../api.js";
import DayCard         from "../components/DayCard.jsx";
import AllDaysChart    from "../components/AllDaysChart.jsx";

const DAYS_PER_PAGE = 50;

/* runtime config */
const rt            = window.__ENV__ || {};
const birthTs       = rt.birthTs ? new Date(rt.birthTs) : null;
const childName     = rt.childName   || "";
const childSurname  = rt.childSurname|| "";
const birthDay      = birthTs ? startOfDay(birthTs) : startOfDay(new Date());

export default function MilkingHistory() {
  const [page, setPage]       = useState(0);
  const [recs, setRecs]       = useState([]);
  const [feedsByDay, setData] = useState({});
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  /* recommendations once */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* load 50 sequential days */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const jobs = [];

      for (let i = 0; i < DAYS_PER_PAGE; i++) {
        const date = addDays(birthDay, page * DAYS_PER_PAGE + i);
        const day  = format(date, "yyyy-MM-dd");
        jobs.push(
          api.listFeeds(day)
             .then(rows => ({ day, date, rows }))
             .catch(()  => ({ day, date, rows: [] }))
        );
      }

      const res = await Promise.all(jobs);
      setData(prev =>
        Object.fromEntries([...Object.entries(prev), ...res.map(r => [r.day, r])])
      );
      setLoading(false);
    })();
  }, [page]);

  /* helper */
  const recForAge = (age) =>
    recs.find(r => r.ageDays === age)?.totalMl ?? 0;

  /* build chart arrays */
  const ordered = Object.values(feedsByDay).sort((a, b) => a.date - b.date);
  const labels  = [];
  const recommended = [];
  const actual       = [];

  ordered.forEach(({ date, rows }) => {
    labels.push(format(date, "d LLL"));
    const ageDays = differenceInCalendarDays(date, birthDay);
    recommended.push(recForAge(ageDays));
    actual.push(rows.reduce((s, f) => s + f.amountMl, 0));
  });

  return (
    <>
      <header className="mod-header">
        <h1>Web-Baby</h1>

        <nav>
          <a href="/milking">Today</a>
          <a href="/milking/all">All days</a>
          <a href="/help">Help</a>
        </nav>

        <div className="meta">
          <strong>{childName} {childSurname}</strong>
        </div>
      </header>

      {err && <p style={{ color: "#c00" }}>{err}</p>}

      <main>
        {labels.length > 0 && (
          <AllDaysChart labels={labels} recommended={recommended} actual={actual} />
        )}

        {ordered.map(({ day, date, rows }) => (
          <DayCard key={day} date={date} feeds={rows} />
        ))}

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
    </>
  );
}
