import React, { useEffect, useState, useMemo } from "react";
import {
  startOfToday,
  differenceInCalendarDays,
  addDays,
} from "date-fns";

import Header        from "../../../components/Header.jsx";
import api           from "../api.js";
import WeightForm    from "../components/WeightForm.jsx";
import WeightTable   from "../components/WeightTable.jsx";
import WeightChart   from "../components/WeightChart.jsx";
import { loadConfig } from "../../../config.js";
import { medianRatio } from "../whoMedian.js";            // ← helper

/* ------------------------------------------------------------------ */
/*  Median-based expectation with smooth rebound                      */
/* ------------------------------------------------------------------ */
/**
 * • –7 % trough on day 3
 * • linear rebound to WHO median by day 15
 * • WHO median curve thereafter
 */
function expectedWeight(birthGrams, sex, ageDays) {
  if (!birthGrams) return null;

  /* dip from 0 % to –7 % in the first 3 days */
  if (ageDays <= 3) {
    return Math.round(birthGrams * (1 - 0.07 * (ageDays / 3)));
  }

  const who = birthGrams * medianRatio(sex, ageDays);   // WHO median kg→g

  /* smooth blend day 3 → 15 (12 days) */
  if (ageDays <= 15) {
    const t = (ageDays - 3) / 12;                       // 0 → 1
    const blended =
      birthGrams * (0.93 * (1 - t) + (who / birthGrams) * t);
    return Math.round(blended);
  }

  /* ≥ day 16 – follow WHO median outright */
  return Math.round(who);
}

export default function WeightDashboard() {
  /* ---------- configuration & birth info ------------------------- */
  const {
    birthTs         : birthTsRaw,
    birthWeightGrams,
    theme,                                   // boy / girl (sex hint)
  } = loadConfig();

  const sex         = theme === "boy" ? "boy" : "girl";
  const birthDate   = birthTsRaw ? new Date(birthTsRaw) : null;
  const birthWeight = Number.isFinite(birthWeightGrams)
    ? birthWeightGrams
    : 3500;

  /* ---------- CRUD helpers --------------------------------------- */
  const [weights, setWeights] = useState([]);
  const [err,     setErr]     = useState("");

  const reload = () =>
    api.listWeights().then(setWeights).catch(e => setErr(e.message));
  useEffect(reload, []);

  const handleSave   = p      => api.insertWeight(p)   .then(reload).catch(e => setErr(e.message));
  const handleUpdate = (id,p) => api.updateWeight(id,p).then(reload).catch(e => setErr(e.message));
  const handleDelete = id     => api.deleteWeight(id)  .then(reload).catch(e => setErr(e.message));

  /* ----------------------------------------------------------------
   *  Build continuous series for chart
   * ---------------------------------------------------------------- */
  const { labels, W, N, O, U } = useMemo(() => {
    if (weights.length === 0) return { labels: [], W: [], N: [], O: [], U: [] };

    const byDay = Object.fromEntries(
      weights.map(w => [w.measuredAt, w.weightGrams]),
    );

    const start = birthDate ?? new Date(weights[0].measuredAt);
    const end   = startOfToday();
    const days  = differenceInCalendarDays(end, start) + 1;

    const L = [], S = [], M = [], Hi = [], Lo = [];

    for (let d = 0; d < days; d++) {
      const dt     = addDays(start, d);
      const isoDay = dt.toISOString().slice(0, 10);

      const exp = birthDate
        ? expectedWeight(birthWeight, sex, d)
        : null;

      L.push(isoDay);
      S.push(byDay[isoDay] ?? null);                 // recorded
      M.push(exp ?? null);                           // median
      Hi.push(exp ? Math.round(exp * 1.10) : null); // +10 %
      Lo.push(exp ? Math.round(exp * 0.90) : null); // –10 %
    }
    return { labels: L, W: S, N: M, O: Hi, U: Lo };
  }, [weights, birthDate, birthWeight, sex]);

  /* ---------- render --------------------------------------------- */
  return (
    <>
      <Header />

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

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
