import React, { useEffect, useState } from "react";
import {
  startOfToday,
  format,
  differenceInCalendarDays,
  differenceInMinutes,
} from "date-fns";

import Header        from "../../../components/Header.jsx";
import api           from "../api.js";
import FeedForm      from "../components/FeedForm.jsx";
import FeedTable     from "../components/FeedTable.jsx";
import SummaryChart  from "../components/SummaryChart.jsx";
import { loadConfig } from "../../../config.js";

/* helper – “1 h 23 m” / “45 m” */
function fmtMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h} h ${m} m` : `${m} m`;
}

export default function MilkingDashboard() {
  const { birthTs: birthTsRaw } = loadConfig();
  const birthTs = birthTsRaw ? new Date(birthTsRaw) : null;

  const [date,   setDate]   = useState(startOfToday());
  const [recs,   setRecs]   = useState([]);
  const [feeds,  setFeeds]  = useState([]);
  const [last,   setLast]   = useState(null);
  const [err,    setErr]    = useState("");

  /* refresh the banner every minute */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  /* flip to next day right after midnight */
  useEffect(() => {
    const id = setInterval(() => {
      const today = startOfToday();
      if (differenceInCalendarDays(today, date) !== 0) setDate(today);
    }, 60_000);
    return () => clearInterval(id);
  }, [date]);

  /* once: load the recommendation table */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* loaders -------------------------------------------------------- */
  const reloadFeeds = (d = date) =>
    api.listFeeds(format(d, "yyyy-MM-dd"))
       .then(setFeeds)
       .catch(e => setErr(e.message));

  const reloadLast = () =>
    api.latestFeed()
       .then(setLast)
       .catch(e => setErr(e.message));

  useEffect(() => { reloadFeeds(); reloadLast(); }, [date]);

  /* CRUD shortcuts */
  const refresh = () => { reloadFeeds(); reloadLast(); };

  const handleSave   = (p)     => api.insertFeed(p)   .then(refresh).catch(e => setErr(e.message));
  const handleUpdate = (id, p) => api.updateFeed(id,p).then(refresh).catch(e => setErr(e.message));
  const handleDelete = (id)    => api.deleteFeed(id)  .then(refresh).catch(e => setErr(e.message));

  /* today’s recommendation row (may be undefined if birth date not set) */
  const ageDays   = birthTs ? differenceInCalendarDays(date, birthTs) : null;
  const recRow    = recs.find(r => r.ageDays === ageDays) || {};
  const recToday  = recRow.totalMl     ?? 0;
  const recPer    = recRow.perMealMl   ?? 0;

  /* time since last feed (any date) */
  const lastFeedAt = last ? new Date(last.fedAt) : null;
  const minsSince  = lastFeedAt ? differenceInMinutes(now, lastFeedAt) : null;
  const didntEat   = minsSince != null ? fmtMinutes(minsSince) : "—";

  /* ------------------------------------------------------------------
   *  Continuous minute-by-minute target so far today
   * ---------------------------------------------------------------- */
  let targetSoFar = null;
  if (recToday > 0) {
    const minutesIntoDay = now.getHours() * 60 + now.getMinutes();      // 0-1439
    const fracDay        = minutesIntoDay / 1440;                       // 0-1
    targetSoFar          = Math.round(fracDay * recToday);
  }

  /* actual ml consumed so far today */
  const actualSoFar = feeds.reduce((s, f) => s + f.amountMl, 0);

  return (
    <>
      <Header />

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        {/* banner – time since last + per-meal + target so far */}
        <section className="card" style={{ marginBottom:"1.5rem" }}>
          <strong>Didn’t eat for:</strong>{" "}
          {lastFeedAt ? didntEat : <em>No feeds logged yet</em>}

          {recPer > 0 && (
            <>
              {" "}|{" "}
              <strong>Suggested per feed:</strong> {recPer} ml
            </>
          )}

          {targetSoFar != null && (
            <>
              {" "}|{" "}
              <strong>Should have eaten by now:</strong>{" "}
              {targetSoFar} ml&nbsp;
              <small style={{ opacity:0.7 }}>
                (logged&nbsp;{actualSoFar} ml)
              </small>
            </>
          )}
        </section>

        <FeedForm onSave={handleSave} />

        <FeedTable
          rows={feeds}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />

        <SummaryChart feeds={feeds} recommended={recToday} />
      </main>
    </>
  );
}
