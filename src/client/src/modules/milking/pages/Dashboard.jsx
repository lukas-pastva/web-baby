import React, { useEffect, useState } from "react";
import {
  startOfToday,
  format,
  differenceInMinutes,
  subDays,
  differenceInCalendarDays,
} from "date-fns";

import Header        from "../../../components/Header.jsx";
import api           from "../api.js";
import FeedForm      from "../components/FeedForm.jsx";
import FeedTable     from "../components/FeedTable.jsx";
import SummaryChart  from "../components/SummaryChart.jsx";
import { loadConfig } from "../../../config.js";

/* helper – “1 h 23 m” / “45 m” */
const fmtMinutes = (min)=>
  `${Math.floor(min / 60) ? Math.floor(min / 60) + " h " : ""}${min % 60} m`;

export default function MilkingDashboard() {
  const { birthTs: birthTsRaw } = loadConfig();
  const birthTs = birthTsRaw ? new Date(birthTsRaw) : null;

  const [date]        = useState(startOfToday());   // today never changes mid-render
  const [feeds,  setFeeds ]        = useState([]);
  const [feedsY, setFeedsY]        = useState([]);  // ← yesterday
  const [last,   setLast  ]        = useState(null);
  const [err,    setErr   ]        = useState("");

  /* personalized recommendation for today */
  const [recToday, setRecToday] = useState(0);
  const [recPer,   setRecPer  ] = useState(0);

  /* WHO recommendation for today */
  const [whoToday, setWhoToday] = useState(0);

  /* tick every minute to refresh banner calculations */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  /* ─── loaders ──────────────────────────────────────────────────── */
  const reloadFeeds = () =>
    api.listFeeds(format(date, "yyyy-MM-dd"))
       .then(setFeeds)
       .catch(e => setErr(e.message));

  const reloadFeedsY = () => {
    const y = subDays(date, 1);
    api.listFeeds(format(y, "yyyy-MM-dd"))
       .then(setFeedsY)
       .catch(() => setFeedsY([]));          // silent if none
  };

  const reloadLast = () =>
    api.latestFeed().then(setLast).catch(e => setErr(e.message));

  const reloadRec = () =>
    api.todayRec()
       .then(r => {
         setRecToday(r?.totalMl || 0);
         setRecPer(r?.perMealMl || 0);
       })
       .catch(() => { setRecToday(0); setRecPer(0); });

  const reloadWho = () =>
    api.listRecs()
       .then(rows => {
         if (!birthTs) return setWhoToday(0);
         const ageDays = differenceInCalendarDays(date, birthTs);
         const rec = rows.find(r => r.ageDays === ageDays);
         setWhoToday(rec?.totalMl || 0);
       })
       .catch(() => setWhoToday(0));

  useEffect(() => { reloadFeeds(); reloadFeedsY(); reloadLast(); reloadRec(); reloadWho(); }, []);

  /* refresh helpers after CRUD */
  const refreshAll = ()=> { reloadFeeds(); reloadFeedsY(); reloadLast(); reloadRec(); reloadWho(); };
  const handleSave   = p        => api.insertFeed(p)   .then(refreshAll).catch(e => setErr(e.message));
  const handleUpdate = (id, p ) => api.updateFeed(id,p).then(refreshAll).catch(e => setErr(e.message));
  const handleDelete =  id      => api.deleteFeed(id)  .then(refreshAll).catch(e => setErr(e.message));

  /* time since last feed */
  const lastFeedAt = last ? new Date(last.fedAt) : null;
  const didntEat   = lastFeedAt
    ? fmtMinutes(differenceInMinutes(now, lastFeedAt))
    : "—";

  /* “target so far today” – uses personalized total */
  let targetSoFar = null;
  if (recToday > 0) {
    const minutesIntoDay = now.getHours() * 60 + now.getMinutes();
    targetSoFar          = Math.round((minutesIntoDay / 1440) * recToday);
  }

  /* eaten so far today */
  const actualSoFar = feeds.reduce((s,f)=>s+f.amountMl,0);

  /* eaten so far yesterday (up to the same time-of-day) */
  const minsIntoDay = now.getHours()*60 + now.getMinutes();
  const actualY = feedsY.reduce((s,f)=>{
    const t = new Date(f.fedAt);
    const m = t.getHours()*60 + t.getMinutes();
    return m <= minsIntoDay ? s + f.amountMl : s;
  },0);

  /* ─── UI ───────────────────────────────────────────────────────── */
  return (
    <>
      <Header />

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        {/* insert form */}
        <FeedForm onSave={handleSave} />

        {/* glance table with WHO vs Personalized */}
        <section className="card" style={{ marginBottom:"1.5rem" }}>
          <h3 style={{ marginTop:0 }}>Today at a glance</h3>
          <table style={{ width:"100%", borderCollapse:"collapse", lineHeight:1.3 }}>
            <tbody>
              <tr><td><strong>Should eat today (WHO)</strong></td><td>{whoToday || "—"}&nbsp;ml</td></tr>
              <tr><td><strong>Should eat today (personalized)</strong></td><td>{recToday || "—"}&nbsp;ml</td></tr>
              {recPer > 0 && <tr><td><strong>Suggested per feed</strong></td><td>{recPer}&nbsp;ml</td></tr>}
              <tr><td><strong>Should have eaten by now</strong></td><td>{targetSoFar != null ? targetSoFar : "—"}&nbsp;ml</td></tr>
              <tr><td><strong>Eaten so far</strong></td><td>{actualSoFar}&nbsp;ml</td></tr>
              <tr><td><strong>Didn’t eat for</strong></td><td>{lastFeedAt ? didntEat : <em>No feeds logged yet</em>}</td></tr>
              <tr><td><strong>Eaten by now yesterday</strong></td><td>{feedsY.length ? actualY : "—"}&nbsp;ml</td></tr>
            </tbody>
          </table>
        </section>

        {/* chart + table */}
        <SummaryChart feeds={feeds} recommended={recToday} />
        <FeedTable rows={feeds} onUpdate={handleUpdate} onDelete={handleDelete} />
      </main>
    </>
  );
}
