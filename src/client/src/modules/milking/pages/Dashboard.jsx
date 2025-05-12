import React, { useEffect, useState } from "react";
import {
  startOfToday, format, differenceInCalendarDays,
} from "date-fns";
import Header       from "../../../components/Header.jsx";
import api          from "../api.js";
import FeedForm     from "../components/FeedForm.jsx";
import FeedTable    from "../components/FeedTable.jsx";
import SummaryChart from "../components/SummaryChart.jsx";

const rt           = window.__ENV__ || {};
const birthTs      = rt.birthTs ? new Date(rt.birthTs) : null;

export default function MilkingDashboard() {
  const [date, setDate]   = useState(startOfToday());
  const [recs, setRecs]   = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [err,  setErr]    = useState("");

  /* auto-roll into next day at 00:00 */
  useEffect(() => {
    const id = setInterval(() => {
      const today = startOfToday();
      if (differenceInCalendarDays(today, date) !== 0) setDate(today);
    }, 60_000);
    return () => clearInterval(id);
  }, [date]);

  useEffect(() => { api.listRecs().then(setRecs).catch(e=>setErr(e.message)); }, []);

  const reload = async (d = date) => {
    const day = format(d,"yyyy-MM-dd");
    api.listFeeds(day).then(setFeeds).catch(e=>setErr(e.message));
  };
  useEffect(() => { reload(); }, [date]);

  const handleSave   =  f => api.insertFeed(f).then(reload).catch(e=>setErr(e.message));
  const handleUpdate = (id,p)=>api.updateFeed(id,p).then(reload).catch(e=>setErr(e.message));
  const handleDelete = id   => api.deleteFeed(id)   .then(reload).catch(e=>setErr(e.message));

  /* recommendation */
  const ageDays  = birthTs ? differenceInCalendarDays(date,birthTs) : null;
  const recToday = recs.find(r=>r.ageDays===ageDays);
  const totalMl  = feeds.reduce((s,f)=>s+f.amountMl,0);

  return (
    <>
      <Header />

      {err && <p style={{color:"#c00",padding:"0 1rem"}}>{err}</p>}

      <main>
        <FeedForm onSave={handleSave}/>
        <FeedTable rows={feeds} onUpdate={handleUpdate} onDelete={handleDelete}/>
        <SummaryChart recommended={recToday?.totalMl ?? 0} actual={totalMl}/>
      </main>
    </>
  );
}
