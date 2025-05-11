import React, { useEffect, useState, useMemo } from "react";
import { startOfToday } from "date-fns";
import api           from "../api.js";
import WeightForm    from "../components/WeightForm.jsx";
import WeightTable   from "../components/WeightTable.jsx";
import WeightChart   from "../components/WeightChart.jsx";

const rt            = window.__ENV__ || {};
const childName     = rt.childName   || "";
const childSurname  = rt.childSurname|| "";
const path          = () => window.location.pathname;

export default function WeightDashboard() {
  const [weights, setWeights] = useState([]);
  const [err, setErr]         = useState("");

  /* ---- load all weights once ------------------------------------- */
  const reload = () =>
    api.listWeights().then(setWeights).catch(e => setErr(e.message));
  useEffect(reload, []);

  /* ---- CRUD ------------------------------------------------------- */
  async function handleSave(payload) {
    await api.insertWeight(payload).catch(e => setErr(e.message));
    reload();
  }
  async function handleUpdate(id, p) {
    await api.updateWeight(id, p).catch(e => setErr(e.message));
    reload();
  }
  async function handleDelete(id) {
    await api.deleteWeight(id).catch(e => setErr(e.message));
    reload();
  }

  /* ---- chart arrays ------------------------------------------------ */
  const { labels, series } = useMemo(() => {
    const sorted = [...weights].sort((a, b) =>
      a.measuredAt < b.measuredAt ? -1 : 1
    );
    return {
      labels:  sorted.map(w => w.measuredAt),
      series:  sorted.map(w => w.weightGrams),
    };
  }, [weights]);

  /* ---- UI --------------------------------------------------------- */
  return (
    <>
      <header className="mod-header">
        <h1>Web-Baby</h1>
        <nav>
          <a href="/milking"      className={path() === "/milking"      ? "active":""}>Today</a>
          <a href="/milking/all"  className={path().startsWith("/milking/all")?"active":""}>All days</a>
          <a href="/weight"       className={path() === "/weight"       ? "active":""}>Weight</a>
          <a href="/help"         className={path() === "/help"         ? "active":""}>Help</a>
        </nav>
        <div className="meta">
          <strong>{childName} {childSurname}</strong>
        </div>
      </header>

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        <WeightForm  onSave={handleSave} defaultDate={startOfToday()} />
        <WeightChart labels={labels} weights={series} />
        <WeightTable rows={weights}
                     onUpdate={handleUpdate}
                     onDelete={handleDelete} />
      </main>
    </>
  );
}
