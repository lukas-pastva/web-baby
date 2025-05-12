import React, { useEffect, useState } from "react";
import {
  startOfToday, format, differenceInCalendarDays,
} from "date-fns";
import Header       from "../../../components/Header.jsx";
import api          from "../api.js";
import FeedForm     from "../components/FeedForm.jsx";
import FeedTable    from "../components/FeedTable.jsx";
import SummaryChart from "../components/SummaryChart.jsx";

const rt      = window.__ENV__ || {};
const birthTs = rt.birthTs ? new Date(rt.birthTs) : null;

export default function MilkingDashboard() {
  const [date, setDate]   = useState(startOfToday());
  const [recs, setRecs]   = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [err,  setErr]    = useState("");

  /* midnight rollover */
  useEffect(() => {
    const id = setInterval(() => {
      const today = startOfToday();
      if (differenceInCalendarDays(today, date) !== 0) setDate(today);
    }, 60_000);
    return () => clearInterval(id);
  }, [date]);

  useEffect(() => { api.listRecs().then(setRecs).catch(e => setErr(e.message)); }, []);

  const reloadFeeds = () => {
    const day = format(date, "yyyy-MM-dd");
    api.listFeeds(day).then(setFeeds).catch(e => setErr(e.message));
  };
  useEffect(reloadFeeds, [date]);

  /* CRUD */
  const handleSave   = f      => api.insertFeed(f)     .then(reloadFeeds).catch(e=>setErr(e.message));
  const handleUpdate = (id,p) => api.updateFeed(id,p)  .then(reloadFeeds).catch(e=>setErr(e.message));
  const handleDelete = id     => api.deleteFeed(id)    .then(reloadFeeds).catch(e=>setErr(e.message));

  /* recommendation + age */
  let ageText = "";
  let recToday = null;
  if (birthTs) {
    const ageDays = differenceInCalendarDays(date, birthTs);
    ageText  = `${ageDays} day${ageDays === 1 ? "" : "s"}`;
    recToday = recs.find(r => r.ageDays === ageDays);
  }

  /* per-type totals for the summary chart */
  const typeTotals = feeds.reduce((acc, f) => {
    acc[f.feedingType] = (acc[f.feedingType] || 0) + f.amountMl;
    return acc;
  }, {});

  return (
    <>
      <Header extra={ageText} />
      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        <FeedForm onSave={handleSave} />
        <FeedTable rows={feeds} onUpdate={handleUpdate} onDelete={handleDelete} />
        <SummaryChart
          recommended={recToday?.totalMl ?? 0}
          typeTotals={typeTotals}
        />
      </main>
    </>
  );
}
