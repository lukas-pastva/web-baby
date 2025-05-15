import React, { useEffect, useState, useMemo } from "react";
import {
  startOfToday,
  differenceInCalendarDays,
} from "date-fns";

import Header        from "../../../components/Header.jsx";
import api           from "../api.js";
import WeightForm    from "../components/WeightForm.jsx";
import WeightTable   from "../components/WeightTable.jsx";
import WeightChart   from "../components/WeightChart.jsx";
import { loadConfig } from "../../../config.js";

/* ── simple piece-wise growth model (0-12 m) ─────────────────────────
 * Approximate WHO girl standards centred on 3 500 g birth weight.
 * • 0-3 m   ~ +30 g/day
 * • 4-6 m   ~ +20 g/day
 * • 7-12 m  ~ +10 g/day
 * Returns grams expected for given age in days.
 */
function expectedWeight(birthGrams, ageDays) {
  if (ageDays <= 90)   return birthGrams + ageDays * 30;
  if (ageDays <= 180)  return birthGrams + 90*30 + (ageDays-90)  * 20;
  /* 181-365 */
  return birthGrams + 90*30 + 90*20 + (ageDays-180) * 10;
}

export default function WeightDashboard() {
  const { birthTs: birthTsRaw } = loadConfig();
  const birthDate = birthTsRaw ? new Date(birthTsRaw) : null;

  const [weights, setWeights] = useState([]);
  const [err, setErr]         = useState("");

  const reload = () =>
    api.listWeights()
       .then(setWeights)
       .catch(e => setErr(e.message));

  useEffect(reload, []);

  const handleSave   = (p)      => api.insertWeight(p)   .then(reload).catch(e => setErr(e.message));
  const handleUpdate = (id, p)  => api.updateWeight(id,p).then(reload).catch(e => setErr(e.message));
  const handleDelete = (id)     => api.deleteWeight(id)  .then(reload).catch(e => setErr(e.message));

  /* ---------- build chart series ---------------------------------- */
  const {
    labels, series, normal, over, under,
  } = useMemo(() => {
    const sorted = [...weights].sort(
      (a, b) => a.measuredAt < b.measuredAt ? -1 : 1
    );

    const L = [];
    const S = [];
    const N = [];
    const O = [];
    const U = [];

    sorted.forEach(w => {
      L.push(w.measuredAt);
      S.push(w.weightGrams);

      if (birthDate) {
        const age = differenceInCalendarDays(new Date(w.measuredAt), birthDate);
        const rec = expectedWeight(3500, age);          // 3 500 g start
        N.push(rec);
        O.push(Math.round(rec * 1.10));                 // +10 %
        U.push(Math.round(rec * 0.90));                 // −10 %
      } else {
        N.push(null); O.push(null); U.push(null);
      }
    });

    return { labels: L, series: S, normal: N, over: O, under: U };
  }, [weights, birthDate]);

  return (
    <>
      <Header />

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        <WeightForm
          onSave={handleSave}
          defaultDate={startOfToday()}
        />

        <WeightChart
          labels={labels}
          weights={series}
          normal={normal}
          over={over}
          under={under}
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
