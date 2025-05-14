import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,   // kept for internal defaults
  LinearScale,
  TimeScale,      // NEW – true time axis
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";           // 👈 required adapter
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
    barDataByType,   // { FEED_TYPE: [ {x,timestamp, y,amount}, … ] }
    cumulativeLine,  // [ {x, y}, … ]
    startTs, endTs,
  } = useMemo(() => {
    /* if no feeds → today’s bounds */
    const baseDate = feeds.length ? new Date(feeds[0].fedAt) : new Date();
    const dayStart = startOfDay(baseDate);
    const dayEnd   = endOfDay(baseDate);

    /* initialise */
    const byType = Object.fromEntries(
      Object.keys(TYPE_META).map(k => [k, []])
    );
    const cumLine = [];
    let running = 0;

    [...feeds]
      .sort((a, b) => new Date(a.fedAt) - new Date(b.fedAt))   // chronological
      .forEach(({ fedAt, feedingType, amountMl }) => {
        const ts = new Date(fedAt);
        byType[feedingType].push({ x: ts, y: amountMl });
        running += amountMl;
        cumLine.push({ x: ts, y: running });
      });

    /* ensure at least one point so line renders */
    if (cumLine.length === 0) {
      cumLine.push({ x: dayStart, y: 0 });
    }

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
    // keep bars thin so individual feeds are visible
    barThickness   : 8,
    borderSkipped  : false,
    yAxisID        : "y",
    order          : 2,            // drawn under the line
  }));

  /* ── cumulative & recommended lines ─────────────────────────────── */
  const datasets = [
    ...barSets,
    {
      type           : "line",
      label          : "Cumulative total",
      data           : cumulativeLine,
      borderColor    : accent,
      backgroundColor: accent,
      tension        : 0.25,
      stepped        : true,       // clearer “step-up” look
      pointRadius    : 3,
      yAxisID        : "lin",
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
      yAxisID     : "lin",
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
      /* y – stacked bars */
      y  : { beginAtZero: true, stacked: true, title: { display: true, text: "ml" } },
      /* lin – hidden, for the two lines */
      lin: { display: false, beginAtZero: true },
      /* x – true time axis covering the whole day */
      x  : {
        type : "time",
        time : { unit: "hour", displayFormats: { hour: "HH:mm" } },
        min  : startTs,
        max  : endTs,
        title: { display: true, text: "Time of day" },
      },
    },
  };

  return (
    <>
      <h3>Intake over the day</h3>
      <div style={{ height: 320 }}>
        {/* “labels” array not needed when using a time axis */}
        <Bar data={{ datasets }} options={options} />
      </div>
    </>
  );
}
