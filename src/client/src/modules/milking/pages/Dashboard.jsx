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

/* ─── runtime config ─────────────────────────────────────────────── */
const rt            = window.__ENV__ || {};
const birthTs       = rt.birthTs ? new Date(rt.birthTs) : null;
const childName     = rt.childName   || "";
const childSurname  = rt.childSurname|| "";

const path = () => window.location.pathname;

/* ─── component ──────────────────────────────────────────────────── */
export default function MilkingDashboard() {
  const [date, setDate]   = useState(startOfToday());
  const [recs, setRecs]   = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [err,  setErr]    = useState("");

  /* tick every minute so the view flips to the next day at 00:00 */
  useEffect(() => {
    const id = setInterval(() => {
      const today = startOfToday();
      if (differenceInCalendarDays(today, date) !== 0) setDate(today);
    }, 60_000);
    return () => clearInterval(id);
  }, [date]);

  /* recommendations (once) */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* feeds for selected date */
  const reloadFeeds = async (d = date) => {
    const day = format(d, "yyyy-MM-dd");
    api.listFeeds(day).then(setFeeds).catch(e => setErr(e.message));
  };
  useEffect(() => { reloadFeeds(); }, [date]);

  /* CRUD handlers */
  async function handleSave(feed) {
    await api.insertFeed(feed).catch(e => setErr(e.message));
    reloadFeeds();
  }
  async function handleUpdate(id, payload) {
    await api.updateFeed(id, payload).catch(e => setErr(e.message));
    reloadFeeds();
  }
  async function handleDelete(id) {
    await api.deleteFeed(id).catch(e => setErr(e.message));
    reloadFeeds();
  }

  /* today’s recommendation & per-type breakdown */
  let recToday = null, ageText = "";
  if (birthTs) {
    const ageDays = differenceInCalendarDays(date, birthTs);
    recToday      = recs.find(r => r.ageDays === ageDays);
    ageText       = `${ageDays} days`;
  }

  const byType = {
    BREAST_DIRECT : 0,
    BREAST_BOTTLE : 0,
    FORMULA_PUMP  : 0,
    FORMULA_BOTTLE: 0,
  };
  feeds.forEach(f => { byType[f.feedingType] += f.amountMl; });

  /* ─── UI ───────────────────────────────────────────────────────── */
  return (
    <>
      <header className="mod-header">
        <h1>{(window.__ENV__ || {}).appTitle || "Web-Baby"}</h1>

        <nav>
          <a href="/milking"      className={path() === "/milking"      ? "active":""}>Today</a>
          <a href="/milking/all"  className={path().startsWith("/milking/all")?"active":""}>All days</a>
          <a href="/weight"       className={path() === "/weight"       ? "active":""}>Weight</a>
          <a href="/help"         className={path() === "/help"         ? "active":""}>Help</a>
          <a href="/config"       className={path() === "/config"       ? "active" : ""}>Config</a>
        </nav>

        <div className="meta">
          <strong>{childName} {childSurname}</strong><br />
          {ageText && <small>{ageText}</small>}
        </div>
      </header>

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        <FeedForm  onSave={handleSave} />

        <FeedTable
          rows={feeds}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />

        <SummaryChart
          recommended={recToday?.totalMl ?? 0}
          byType={byType}
        />
      </main>
    </>
  );
}
