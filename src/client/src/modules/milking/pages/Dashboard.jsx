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

/* ------------------------------------------------------------------ */
/*  Runtime config & helpers                                          */
/* ------------------------------------------------------------------ */
const rt            = window.__ENV__ || {};
const birthTs       = rt.birthTs ? new Date(rt.birthTs) : null;
const childName     = rt.childName   || "";
const childSurname  = rt.childSurname|| "";

const path = () => window.location.pathname;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function MilkingDashboard() {
  const [date, setDate]   = useState(startOfToday());
  const [recs, setRecs]   = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [err, setErr]     = useState("");

  /* ---- recommendations once --------------------------------------- */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* ---- feeds for selected date ------------------------------------ */
  const reloadFeeds = async (d = date) => {
    const day = format(d, "yyyy-MM-dd");
    api.listFeeds(day).then(setFeeds).catch(e => setErr(e.message));
  };
  useEffect(() => { reloadFeeds(); }, [date]);

  /* ---- CRUD handlers ---------------------------------------------- */
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

  /* ---- age & today’s recommendation ------------------------------- */
  let recToday = null, ageText = "";
  if (birthTs) {
    const ageDays = differenceInCalendarDays(date, birthTs);
    recToday      = recs.find(r => r.ageDays === ageDays);
    ageText       = `${ageDays} days`;
  }
  const totalMl = feeds.reduce((s, f) => s + f.amountMl, 0);

  /* ---- UI ---------------------------------------------------------- */
  return (
    <>
      <header className="mod-header">
        <h1>Web-Baby</h1>

        <nav>
          <a href="/milking"      className={path() === "/milking"      ? "active" : ""}>Today</a>
          <a href="/milking/all"  className={path().startsWith("/milking/all") ? "active" : ""}>All days</a>
          <a href="/weight"       className={path() === "/weight"       ? "active" : ""}>Weight</a>
          <a href="/help"         className={path() === "/help"         ? "active" : ""}>Help</a>
        </nav>

        <div className="meta">
          <strong>{childName} {childSurname}</strong><br />
          {ageText && <small>{ageText}</small>}
        </div>
      </header>

      {err && <p style={{ color: "#c00", padding: "0 1rem" }}>{err}</p>}

      <main>
        <FeedForm  onSave={handleSave} defaultDate={date} />
        <FeedTable rows={feeds}
                   onUpdate={handleUpdate}
                   onDelete={handleDelete} />
        <SummaryChart recommended={recToday?.totalMl ?? 0} actual={totalMl} />
      </main>
    </>
  );
}
