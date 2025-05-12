import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { accentColor } from "../../../theme.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/* ─────────────────────────── colour + icon map ──────────────────── */
const TYPE_META = {
  BREAST_DIRECT : { c: "#f4a261", lbl: "🤱 Direct"      },
  BREAST_BOTTLE : { c: "#2a9d8f", lbl: "🤱🍼 Bottle"     },
  FORMULA_PUMP  : { c: "#e76f51", lbl: "🍼⚙ Tube"       },
  FORMULA_BOTTLE: { c: "#264653", lbl: "🍼 Bottle"      },
};

export default function AllDaysChart({
  labels          = [],
  stacks          = {},          // { FEED_TYPE: [ …day values ] }
  recommended     = [],          // grey dotted line
}) {
  const accent = accentColor();

  /* ── build bar datasets (one per feed-type) ─────────────────────── */
  const datasets = Object.entries(TYPE_META).map(([code, meta]) => ({
    type           : "bar",
    label          : meta.lbl,
    data           : stacks[code] || labels.map(() => 0),
    backgroundColor: meta.c,
    stack          : "feeds",
    yAxisID        : "y",
  }));

  /* ── totals (sum of bar stacks) – blue line on left axis ────────── */
  const totals = labels.map((_, i) =>
    Object.keys(TYPE_META).reduce((s, k) => s + (stacks[k]?.[i] || 0), 0)
  );
  datasets.push({
    type        : "line",
    label       : "Total",
    data        : totals,
    borderColor : accent,
    backgroundColor: accent,
    tension     : 0.25,
    pointRadius : 3,
    yAxisID     : "y",
  });

  /* ── recommended – grey dashed line on *hidden* secondary axis ──── */
  datasets.push({
    type        : "line",
    label       : "Recommended",
    data        : recommended,
    borderColor : "#9ca3af",
    borderDash  : [4, 4],
    pointRadius : 2,
    tension     : 0.25,
    yAxisID     : "rec",
  });

  const data = { labels, datasets };

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    interaction         : { mode: "index", intersect: false },
    plugins             : { legend: { position: "top" } },
    scales              : {
      y:   { stacked: true, beginAtZero: true },
      rec: { display: false, beginAtZero: true },   // keeps grey line off the main scale
    },
  };

  return (
    <div className="card" style={{ height: 420 }}>
      <h3>Intake per day</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
