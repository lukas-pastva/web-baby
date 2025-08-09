import React, { useEffect, useMemo, useState } from "react";
import {
  startOfToday,
  differenceInCalendarDays,
  addDays,
} from "date-fns";

import Header         from "../../../components/Header.jsx";
import api            from "../api.js";
import HeightForm     from "../components/HeightForm.jsx";
import HeightTable    from "../components/HeightTable.jsx";
import HeightChart    from "../components/HeightChart.jsx";
import { loadConfig } from "../../../config.js";
import { medianLengthCm } from "../whoLength.js";

/** Expected length from WHO median (absolute cm). */
function expectedLength(sex, ageDays) {
  return medianLengthCm(sex, ageDays);
}

export default function HeightDashboard() {
  const { birthTs: birthTsRaw, theme } = loadConfig();
  const sex       = theme === "boy" ? "boy" : "girl";
  const birthDate = birthTsRaw ? new Date(birthTsRaw) : null;

  const [rows, setRows] = useState([]);
  const [err, setErr]   = useState("");

  const reload       = () => api.listHeights().then(setRows).catch(e => setErr(e.message));
  const handleSave   = (p) => api.insertHeight(p).then(reload).catch(e => setErr(e.message));
  const handleUpdate = (id,p) => api.updateHeight(id,p).then(reload).catch(e => setErr(e.message));
  const handleDelete = (id) => api.deleteHeight(id).then(reload).catch(e => setErr(e.message));

  useEffect(reload, []);

  /* Build continuous series for chart */
  const { labels, H, N, O, U } = useMemo(() => {
    if (rows.length === 0) return { labels: [], H: [], N: [], O: [], U: [] };

    const byDay = Object.fromEntries(rows.map(r => [r.measuredAt, r.heightCm]));

    const start = birthDate ?? new Date(rows[0].measuredAt);
    const end   = startOfToday();
    const days  = differenceInCalendarDays(end, start) + 1;

    const L = [], S = [], M = [], Hi = [], Lo = [];

    for (let d = 0; d < days; d++) {
      const dt     = addDays(start, d);
      const isoDay = dt.toISOString().slice(0, 10);

      const exp = birthDate ? expectedLength(sex, d) : null;

      L.push(isoDay);
      S.push(byDay[isoDay] ?? null);
      M.push(exp ?? null);
      Hi.push(exp ? +(exp * 1.03).toFixed(1) : null);  // +3%
      Lo.push(exp ? +(exp * 0.97).toFixed(1) : null);  // -3%
    }

    return { labels: L, H: S, N: M, O: Hi, U: Lo };
  }, [rows, birthDate, sex]);

  return (
    <>
      <Header />

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        <HeightForm onSave={handleSave} defaultDate={startOfToday()} />

        <HeightChart
          labels={labels}
          heights={H}
          normal={N}
          over={O}
          under={U}
        />

        <HeightTable rows={rows} onUpdate={handleUpdate} onDelete={handleDelete} />
      </main>
    </>
  );
}
