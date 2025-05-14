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

const rt      = window.__ENV__ || {};
const birthTs = rt.birthTs ? new Date(rt.birthTs) : null;

/* helper: “1 h 23 m” / “45 m” */
function fmtMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h} h ${m} m` : `${m} m`;
}

export default function MilkingDashboard() {
  const [date,   setDate]   = useState(startOfToday());
  const [recs,   setRecs]   = useState([]);
  const [feeds,  setFeeds]  = useState([]);
  const [err,    setErr]    = useState("");

  /* tick every minute – lets us refresh the “didn’t eat for” timer */
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

  /* recommendations once */
  useEffect(() => { api.listRecs().then(setRecs).catch(e => setErr(e.message)); }, []);

  /* feeds for selected day */
  const reloadFeeds = (d = date) =>
    api.listFeeds(format(d, "yyyy-MM-dd")).then(setFeeds).catch(e => setErr(e.message));
  useEffect(reloadFeeds, [date]);

  /* CRUD shortcuts */
  const refresh      = ()      => reloadFeeds();
  const handleSave   = (f)     => api.insertFeed(f)   .then(refresh).catch(e => setErr(e.message));
  const handleUpdate = (id, p) => api.updateFeed(id,p).then(refresh).catch(e => setErr(e.message));
  const handleDelete = (id)    => api.deleteFeed(id)  .then(refresh).catch(e => setErr(e.message));

  /* today’s recommendation & age */
  const ageDays  = birthTs ? differenceInCalendarDays(date, birthTs) : null;
  const recToday = recs.find(r => r.ageDays === ageDays)?.totalMl ?? 0;

  /* time since last feed today */
  const lastFeedAt = feeds.length ? new Date(feeds[feeds.length - 1].fedAt) : null;
  const minsSince  = lastFeedAt ? differenceInMinutes(now, lastFeedAt) : null;
  const didntEat   = minsSince != null ? fmtMinutes(minsSince) : "—";

  return (
    <>
      <Header />

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        {/* “didn’t eat for …” banner */}
        <section className="card" style={{ marginBottom:"1.5rem" }}>
          <strong>Didn’t eat for:</strong>{" "}
          {lastFeedAt
            ? didntEat
            : <em>No feeds logged today</em>}
        </section>

        <FeedForm  onSave={handleSave} />
        <FeedTable rows={feeds}
                   onUpdate={handleUpdate}
                   onDelete={handleDelete} />
        <SummaryChart feeds={feeds} recommended={recToday} />
      </main>
    </>
  );
}
