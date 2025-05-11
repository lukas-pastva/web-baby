export default function MilkingHistory() {
  import React, { useEffect, useState } from "react";
  import {
    startOfDay,
    addDays,
    format,
    differenceInCalendarDays,
  } from "date-fns";
  import api           from "../api.js";
  import DayCard       from "../components/DayCard.jsx";
  import AllDaysChart  from "../components/AllDaysChart.jsx";
  
  const path           = () => window.location.pathname;
  const DAYS_PER_PAGE  = 50;
  
  /* ─── runtime config ──────────────────────────────────────────────── */
  const rt           = window.__ENV__ || {};
  const birthTs      = rt.birthTs ? new Date(rt.birthTs) : null;
  const childName    = rt.childName   || "";
  const childSurname = rt.childSurname|| "";
  
  const birthDay = birthTs ? startOfDay(birthTs) : startOfDay(new Date());
  const today    = startOfDay(new Date());
  
  export default function MilkingHistory() {
    const [page, setPage]       = useState(0);
    const [recs, setRecs]       = useState([]);
    const [feedsByDay, setData] = useState({});
    const [err, setErr]         = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone]       = useState(false);   // reached today
  
    /* ---- recommendations once --------------------------------------- */
    useEffect(() => {
      api.listRecs().then(setRecs).catch(e => setErr(e.message));
    }, []);
  
    /* ---- load sequential days (birth → today) ----------------------- */
    useEffect(() => {
      if (done) return;
  
      (async () => {
        setLoading(true);
        const batch = [];
  
        for (let i = 0; i < DAYS_PER_PAGE; i++) {
          const offset = page * DAYS_PER_PAGE + i;
          const date   = addDays(birthDay, offset);
          if (date > today) { setDone(true); break; }
  
          const day = format(date, "yyyy-MM-dd");
          batch.push(
            api.listFeeds(day)
                .then(rows => ({ day, date, rows }))
                .catch(()  => ({ day, date, rows: [] }))
          );
        }
  
        const res = await Promise.all(batch);
        setData(prev =>
          Object.fromEntries([
            ...Object.entries(prev),
            ...res.map(r => [r.day, r]),
          ])
        );
        setLoading(false);
      })();
    }, [page, done]);
  
    /* ---- helpers ---------------------------------------------------- */
    const recForAge = (age) =>
      recs.find(r => r.ageDays === age)?.totalMl ?? 0;
  
    /* ---- build arrays (newest → oldest) ----------------------------- */
    const ordered = Object.values(feedsByDay).sort((a, b) => b.date - a.date);
  
    const labels      = [];
    const recommended = [];
    const actual      = [];
  
    ordered.forEach(({ date, rows }) => {
      labels.push(format(date, "d LLL"));
      const ageDays = differenceInCalendarDays(date, birthDay);
      recommended.push(recForAge(ageDays));
      actual.push(rows.reduce((s, f) => s + f.amountMl, 0));
    });
    /* ---- helpers ---------------------------------------------------- */
    const refreshDay = async (day) => {
      try {
        const rows = await api.listFeeds(day);
        setData(prev => ({ ...prev, [day]: { ...prev[day], rows } }));
      } catch (e) { setErr(e.message); }
    };
  
    async function handleUpdate(day, id, payload) {
      await api.updateFeed(id, payload).catch(e => setErr(e.message));
      refreshDay(day);
    }
  
    async function handleDelete(day, id) {
      await api.deleteFeed(id).catch(e => setErr(e.message));
      refreshDay(day);
    }
  
    /* ---- UI --------------------------------------------------------- */
    return (
      <>
        <header className="mod-header">
          <h1>Web-Baby</h1>
  
          <nav>
            <a href="/milking"      className={path() === "/milking"      ? "active" : ""}>Today</a>
            <a href="/milking/all"  className={path().startsWith("/milking/all") ? "active" : ""}>All days</a>
            <a href="/help"         className={path() === "/help"         ? "active" : ""}>Help</a>
          </nav>
  
          <div className="meta">
            <strong>{childName} {childSurname}</strong>
          </div>
        </header>
  
        {err && <p style={{ color: "#c00", padding: "0 1rem" }}>{err}</p>}
  
        <main>
          {labels.length > 0 && (
            <AllDaysChart labels={labels} recommended={recommended} actual={actual} />
          )}
  
          {ordered.map(({ day, date, rows }) => (
            <DayCard
              key={day}
              date={date}
              feeds={rows}
              onUpdate={(id, p) => handleUpdate(day, id, p)}
              onDelete={(id)   => handleDelete(day, id)}
            />
          ))}
  
  
          <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
            {loading ? (
              <p>Loading…</p>
            ) : done ? (
              <p><em>End of timeline</em></p>
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
  