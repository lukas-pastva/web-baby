import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,   // kept for internal defaults
  LinearScale,
  TimeScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { startOfDay, endOfDay } from "date-fns";
import { accentColor } from "../../../theme.js";

ChartJS.register(
  CategoryScale, LinearScale, TimeScale,
  BarElement, PointElement, LineElement,
  Tooltip, Legend
);

/* ─────────────────────────── colour + icon map ──────────────────── */
const TYPE_META = {
  BREAST_DIRECT : { c: "#f4a261", lbl: "🤱 Direct"      },
  BREAST_BOTTLE : { c: "#2a9d8f", lbl: "🤱🍼 Bottle"     },
  FORMULA_PUMP  : { c: "#e76f51", lbl: "🍼⚙ Tube"       },
  FORMULA_BOTTLE: { c: "#264653", lbl: "🍼 Bottle"      },
};

export default function SummaryChart({ feeds = [], recommended = 0 }) {
  /* ----------------------------------------------------------------
   *  Build datasets – bars per feed + cumulative line
   * ---------------------------------------------------------------- */
  const {
    barDataByType,
    cumulativeLine,
    startTs, endTs,
  } = useMemo(() => {
    const baseDate = feeds.length ? new Date(feeds[0].fedAt) : new Date();
    const dayStart = startOfDay(baseDate);
    const dayEnd   = endOfDay(baseDate);

    const byType = Object.fromEntries(
      Object.keys(TYPE_META).map(k => [k, []])
    );
    const cumLine = [];
    let running = 0;

    [...feeds]
      .sort((a, b) => new Date(a.fedAt) - new Date(b.fedAt))
      .forEach(({ fedAt, feedingType, amountMl }) => {
        const ts = new Date(fedAt);
        byType[feedingType].push({ x: ts, y: amountMl });
        running += amountMl;
        cumLine.push({ x: ts, y: running });
      });

    if (cumLine.length === 0) cumLine.push({ x: dayStart, y: 0 });

    return { barDataByType: byType, cumulativeLine: cumLine,
             startTs: dayStart, endTs: dayEnd };
  }, [feeds]);

  const accent = accentColor();

  /* ── bar datasets (one per feed-type) ───────────────────────────── */
  const barSets = Object.entries(TYPE_META).map(([code, meta]) => ({
    type           : "bar",
    label          : meta.lbl,
    data           : barDataByType[code],
    backgroundColor: meta.c,
    barThickness   : 8,
    borderSkipped  : false,
    yAxisID        : "y",          // ← unified axis
    order          : 2,
  }));

  /* ── cumulative & recommended lines – now on the SAME axis ─────── */
  const datasets = [
    ...barSets,
    {
      type           : "line",
      label          : "Cumulative total",
      data           : cumulativeLine,
      borderColor    : accent,
      backgroundColor: accent,
      tension        : 0.25,
      stepped        : true,
      pointRadius    : 3,
      yAxisID        : "y",        // ← unified axis
      order          : 1,
    },
    {
      type        : "line",
      label       : "Recommended",
      data        : [
        { x: startTs, y: recommended },
        { x: endTs,   y: recommended },
      ],
      borderColor : "#9ca3af",
      borderDash  : [4, 4],
      pointRadius : 0,
      tension     : 0,
      stepped     : true,
      yAxisID     : "y",           // ← unified axis
      order       : 0,
    },
  ];

  /* ── chart options ──────────────────────────────────────────────── */
  const options = {
    responsive         : true,
    maintainAspectRatio: false,
    interaction        : { mode: "index", intersect: false },
    plugins            : { legend: { position: "top" } },
    scales             : {
      y: {
        beginAtZero: true,
        stacked    : true,
        title      : { display: true, text: "ml" },
      },
      x: {
        type : "time",
        time : { unit: "hour", displayFormats: { hour: "HH:mm" } },
        min  : startTs,
        max  : endTs,
        title: { display: true, text: "Time of day" },
      },
    },
  };

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <>
      <h3>Intake over the day</h3>
      <div style={{ height: 320 }}>
        <Bar data={{ datasets }} options={options} />
      </div>
    </>
  );
}
