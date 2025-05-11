import React, { useEffect, useState } from "react";
import { startOfToday, formatISO, format } from "date-fns";
import { listRecommendations, listLogs, insertLog } from "./api";
import MilkLogForm   from "./components/MilkLogForm.jsx";
import MilkLogTable  from "./components/MilkLogTable.jsx";
import SummaryChart  from "./components/SummaryChart.jsx";

export default function App() {
  const [recs, setRecs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(startOfToday());
  const [error, setError] = useState("");

  /* ---- initial load ---- */
  useEffect(() => {
    listRecommendations().then(setRecs).catch(e => setError(e.message));
  }, []);

  /* ---- logs for chosen date ---- */
  async function refreshLogs(d = date) {
    const day = formatISO(d, { representation: "date" });
    listLogs(`?from=${day}&to=${day}T23:59:59`).then(setLogs).catch(e => setError(e.message));
  }
  useEffect(() => { refreshLogs(); }, [date]);

  /* ---- insert handler ---- */
  async function handleInsert(data) {
    await insertLog(data);
    await refreshLogs();
  }

  const totRec = recs.find(r => r.ageDays === Math.floor((date - new Date(recs[0]?.createdAt || Date.now()))/864e5))?.totalMl;
  const totAct = logs.reduce((s,l) => s + l.amountMl, 0);

  return (
    <>
      <header>
        <h1>Web-Baby</h1>
        <span>{format(date, "eeee, d LLL yyyy")}</span>
      </header>

      <main>
        {error && <p style={{color:"#c00"}}>{error}</p>}

        <div className="card">
          <MilkLogForm onSave={handleInsert} defaultDate={date} />
        </div>

        <div className="card">
          <MilkLogTable logs={logs} />
        </div>

        <div className="card">
          <SummaryChart recommended={totRec} actual={totAct} />
        </div>
      </main>
    </>
  );
}
