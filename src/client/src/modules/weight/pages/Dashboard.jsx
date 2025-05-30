import React, { useEffect, useState, useMemo } from "react";
import {
  startOfToday,
  differenceInCalendarDays,
  addDays,
} from "date-fns";

import Header       from "../../../components/Header.jsx";
import api          from "../api.js";
import WeightForm   from "../components/WeightForm.jsx";
import WeightTable  from "../components/WeightTable.jsx";
import WeightChart  from "../components/WeightChart.jsx";
import { loadConfig } from "../../../config.js";
import { WHO_MEDIAN_KG, medianRatio } from "../whoMedian.js";   // NEW

/* --------------------------------------------------------------- */
/*  Median-based expectation                                       */
/* --------------------------------------------------------------- */
function expectedWeight(birthGrams, sex, ageDays) {
  if (!birthGrams) return null;

  /* Day-0 to Day-10: include physiological loss then regain */
  if (ageDays <= 3)   return Math.round(birthGrams * (1 - 0.07 * (ageDays / 3)));
  if (ageDays <= 10)  return Math.round(birthGrams * (0.93 + 0.07 * ((ageDays - 3) / 7)));

  /* ≥ Day-11: scale birth-weight by WHO median ratio          */
  const ratio = medianRatio(sex, ageDays);
  return Math.round(birthGrams * ratio);
}

export default function WeightDashboard() {
  /* ---- basic config -------------------------------------------- */
  const {
    birthTs         : birthTsRaw,
    birthWeightGrams,
    theme,                          // boy / girl  (used as sex hint)
  } = loadConfig();

  const sex         = theme === "boy" ? "boy" : "girl";
  const birthDate   = birthTsRaw ? new Date(birthTsRaw) : null;
  const birthWeight = Number.isFinite(birthWeightGrams) ? birthWeightGrams : 3500;

  /* ---- CRUD helpers -------------------------------------------- */
  const [weights, setWeights] = useState([]);
  const [err,     setErr]     = useState("");

  const reload = () =>
    api.listWeights().then(setWeights).catch(e => setErr(e.message));
  useEffect(reload, []);

  const handleSave   = p      => api.insertWeight(p)   .then(reload).catch(e => setErr(e.message));
  const handleUpdate = (id,p) => api.updateWeight(id,p).then(reload).catch(e => setErr(e.message));
  const handleDelete = id     => api.deleteWeight(id)  .then(reload).catch(e => setErr(e.message));

  /* --------------------------------------------------------------- */
  /*  Build *continuous* day-by-day series                           */
  /* --------------------------------------------------------------- */
  const { labels, W, N, O, U } = useMemo(() => {
    if (weights.length === 0) return { labels: [], W: [], N: [], O: [], U: [] };

    const byDay = Object.fromEntries(weights.map(w => [w.measuredAt, w.weightGrams]));

    const start = birthDate ?? new Date(weights[0].measuredAt);
    const end   = startOfToday();
    const days  = differenceInCalendarDays(end, start) + 1;

    const L = [], S = [], M = [], Hi = [], Lo = [];

    for (let d = 0; d < days; d++) {
      const dt     = addDays(start, d);
      const isoDay = dt.toISOString().slice(0,10);

      const exp = birthDate ? expectedWeight(birthWeight, sex, d) : null;

      L.push(isoDay);
      S.push(byDay[isoDay] ?? null);
      M.push(exp ?? null);
      Hi.push(exp ? Math.round(exp * 1.10) : null);
      Lo.push(exp ? Math.round(exp * 0.90) : null);
    }
    return { labels: L, W: S, N: M, O: Hi, U: Lo };
  }, [weights, birthDate, birthWeight, sex]);

  /* --------------------------------------------------------------- */
  /*  Render                                                         */
  /* --------------------------------------------------------------- */
  return (
    <>
      <Header />

      {err && <p style={{ color: "#c00", padding: "0 1rem" }}>{err}</p>}

      <main>
        <WeightForm onSave={handleSave} defaultDate={startOfToday()} />

        <WeightChart
          labels={labels}
          weights={W}
          normal={N}
          over={O}
          under={U}
        />

        <WeightTable
          rows={weights}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </main>
    </>
  );
}
