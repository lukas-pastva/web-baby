import React, { useEffect, useState } from "react";
import {
  startOfToday,
  format,
  differenceInCalendarDays,
  intervalToDuration,
} from "date-fns";
import { listRecommendations, listLogs, insertLog } from "./api";
import MilkLogForm  from "./components/MilkLogForm.jsx";
import MilkLogTable from "./components/MilkLogTable.jsx";
import SummaryChart from "./components/SummaryChart.jsx";

/* ---- runtime config ------------------------------------------------- */
const rt          = window.__ENV__ || {};
const birthTs     = rt.birthTs     ? new Date(rt.birthTs) : null;
const childName   = rt.childName   || "";
const childSurname= rt.childSurname|| "";
const fullName    = `${childName}${childSurname ? " " + childSurname : ""}`;

export default function App() {
  const [recs, setRecs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(startOfToday());
  const [error, setError] = useState("");

  /* ---- static recommendations ---- */
  useEffect(() => {
    listRecommendations().then(setRecs).catch((e) => setError(e.message));
  }, []);

  /* ---- logs for selected date ---- */
  useEffect(() => {
    const dayStr = format(date, "yyyy-MM-dd");
    listLogs(`?from=${dayStr}&to=${dayStr}T23:59:59Z`)
      .then(setLogs)
      .catch((e) => setError(e.message));
  }, [date]);

  /* ---- insert handler ---- */
  async function handleInsert(data) {
    await insertLog(data).catch((e) => setError(e.message));
    const dayStr = format(date, "yyyy-MM-dd");
    listLogs(`?from=${dayStr}&to=${dayStr}T23:59:59Z`).then(setLogs);
  }

  /* ---- today’s recommendation & age string ------------------------- */
  let recToday = null;
  let ageText  = "";
  if (birthTs) {
    const ageDays = differenceInCalendarDays(date, birthTs);
    recToday      = recs.find((r) => r.ageDays === ageDays);

    const { years = 0, months = 0 } = intervalToDuration({
      start: birthTs,
      end  : date,
    });

    ageText = `${ageDays} days (${months} months, ${years} years)`;
  }

  const totalActual = logs.reduce((s, l) => s + l.amountMl, 0);

  /* ---- UI ----------------------------------------------------------- */
  return (
    <>
      <header>
        <h1>Web-Baby</h1>

        <div style={{ textAlign: "right" }}>
          {fullName && <strong>{fullName}</strong>}
          {fullName && <br />}
          <span>{format(date, "eeee, d LLL yyyy")}</span>
          {ageText && (
            <>
              <br />
              <small>{ageText}</small>
            </>
          )}
        </div>
      </header>

      <main>
        {error && <p style={{ color: "#c00" }}>{error}</p>}

        <div className="card">
          <MilkLogForm onSave={handleInsert} defaultDate={date} />
        </div>

        <div className="card">
          <MilkLogTable logs={logs} />
        </div>

        <div className="card">
          <SummaryChart
            recommended={recToday?.totalMl ?? 0}
            actual={totalActual}
          />
        </div>
      </main>
    </>
  );
}
