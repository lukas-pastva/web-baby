import React, { useEffect, useState } from "react";
import {
  startOfToday,
  format,
  differenceInCalendarDays,
} from "date-fns";
import api          from "../api.js";
import FeedForm     from "../components/FeedForm.jsx";
import FeedTable    from "../components/FeedTable.jsx";
import SummaryChart from "../components/SummaryChart.jsx";

const rt            = window.__ENV__ || {};
const birthTs       = rt.birthTs ? new Date(rt.birthTs) : null;
const childName     = rt.childName   || "";
const childSurname  = rt.childSurname|| "";

export default function MilkingDashboard() {
  const [date, setDate]   = useState(startOfToday());
  const [recs, setRecs]   = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [err, setErr]     = useState("");

  /* recommendations once */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* feeds for selected date */
  useEffect(() => {
    const day = format(date, "yyyy-MM-dd");
    api.listFeeds(day).then(setFeeds).catch(e => setErr(e.message));
  }, [date]);

  /* insert */
  async function handleSave(feed) {
    await api.insertFeed(feed).catch(e => setErr(e.message));
    const day = format(date, "yyyy-MM-dd");
    api.listFeeds(day).then(setFeeds);
  }

  /* age & today’s recommendation */
  let recToday = null, ageText = "";
  if (birthTs) {
    const ageDays = differenceInCalendarDays(date, birthTs);
    recToday      = recs.find(r => r.ageDays === ageDays);
    ageText       = `${ageDays} days`;
  }
  const totalMl = feeds.reduce((s, f) => s + f.amountMl, 0);

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
          <strong>{childName} {childSurname}</strong><br />
          {ageText && <small>{ageText}</small>}
        </div>
      </header>

      {err && <p className="error">{err}</p>}

      <main>
        <FeedForm  onSave={handleSave} defaultDate={date} />
        <FeedTable rows={feeds} />
        <SummaryChart recommended={recToday?.totalMl ?? 0} actual={totalMl} />
      </main>
    </>
  );
}
