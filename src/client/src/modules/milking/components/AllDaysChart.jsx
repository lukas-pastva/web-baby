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
import { buildTypeMeta, ORDER as FEED_TYPES } from "../../../feedTypes.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

/* colour + label map from the single source */
const TYPE_META = buildTypeMeta();

export default function AllDaysChart({
  labels = [],
  stacks = {},      // { FEED_TYPE : [ … ] }
  recommended = [], // daily recommended totals
}) {
  const accent = accentColor();

  /* ───────────────────────────────────────── bars – one per type */
  const datasets = FEED_TYPES.map((code) => ({
    type           : "bar",
    label          : TYPE_META[code].lbl,
    data           : stacks[code] || labels.map(() => 0),
    backgroundColor: TYPE_META[code].c,
    /* all bars share the same stack so they add up vertically */
    stack          : "feeds",
    yAxisID        : "y",
  }));

  /* ───────────────────────────────────────── total line */
  const totals = labels.map((_, i) =>
    FEED_TYPES.reduce((s, k) => s + (stacks[k]?.[i] || 0), 0),
  );
  datasets.push({
    type           : "line",
    label          : "Total",
    data           : totals,
    borderColor    : accent,
    backgroundColor: accent,
    tension        : 0.25,
    pointRadius    : 3,
    /* its OWN stack so it never sums with anyone else          */
    stack          : "total",
    yAxisID        : "y",
    order          : 80,
  });

  /* ───────────────────────────────────────── recommended line */
  datasets.push({
    type       : "line",
    label      : "Recommended",
    data       : recommended,
    borderColor: "#9ca3af",
    borderDash : [4, 4],
    pointRadius: 2,
    tension    : 0.25,
    /* another dedicated stack – keeps it independent           */
    stack      : "rec",
    yAxisID    : "y",
    order      : 90,
  });

  /* ───────────────────────────────────────── chart options */
  const data = { labels, datasets };

  const options = {
    responsive         : true,
    maintainAspectRatio: false,
    interaction        : { mode: "index", intersect: false },
    plugins            : { legend: { position: "top" } },
    scales             : {
      /* keep stacking on – but datasets only stack with others
         that share the same `stack` id (‘feeds’ for bars only) */
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <div className="card" style={{ height: 420 }}>
      <h3>Intake per day</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
