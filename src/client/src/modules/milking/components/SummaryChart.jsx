import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { format } from "date-fns";
import { accentColor } from "../../../theme.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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

export default function SummaryChart({ feeds = [], recommended = 0 }) {
  /* ----------------------------------------------------------------
   * Build per-feed stacks and running cumulative total
   * ---------------------------------------------------------------- */
  const { labels, stacks, cumulative } = useMemo(() => {
    const lbls   = [];
    const base   = Object.fromEntries(Object.keys(TYPE_META).map(k => [k, []]));
    const cumArr = [];

    let running = 0;
    [...feeds]
      .sort((a, b) => new Date(a.fedAt) - new Date(b.fedAt))   // chronological
      .forEach(({ fedAt, feedingType, amountMl }) => {
        lbls.push(format(new Date(fedAt), "HH:mm"));
        Object.keys(TYPE_META).forEach(t =>
          base[t].push(t === feedingType ? amountMl : 0)
        );
        running += amountMl;
        cumArr.push(running);
      });

    /* empty-day safeguard so chart renders without errors */
    if (lbls.length === 0) {
      lbls.push("—");
      Object.keys(TYPE_META).forEach(t => base[t].push(0));
      cumArr.push(0);
    }

    return { labels: lbls, stacks: base, cumulative: cumArr };
  }, [feeds]);

  const accent = accentColor();

  /* stacked bar datasets (one per feed-type) */
  const barSets = Object.entries(TYPE_META).map(([code, meta]) => ({
    type           : "bar",
    label          : meta.lbl,
    data           : stacks[code],
    backgroundColor: meta.c,
    stack          : "feeds",
    yAxisID        : "y",
    order          : 2,
  }));

  const datasets = [
    ...barSets,
    /* cumulative total – accent-coloured line */
    {
      type           : "line",
      label          : "Cumulative total",
      data           : cumulative,
      borderColor    : accent,
      backgroundColor: accent,
      tension        : 0.25,
      pointRadius    : 3,
      yAxisID        : "lin",      // hidden axis – keeps it out of the bar stack
      order          : 1,
    },
    /* recommended – grey dashed line */
    {
      type        : "line",
      label       : "Recommended",
      data        : labels.map(() => recommended),
      borderColor : "#9ca3af",
      borderDash  : [4, 4],
      pointRadius : 0,
      tension     : 0,
      yAxisID     : "lin",
      order       : 0,
    },
  ];

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    interaction         : { mode: "index", intersect: false },
    plugins             : { legend: { position: "top" } },
    scales              : {
      /* bars – stacked */
      y  : { beginAtZero: true, stacked: true },
      /* lines – same scale, hidden */
      lin: { beginAtZero: true, display: false },
    },
  };

  return (
    <>
      <h3>Intake over the day</h3>
      <div style={{ height: 320 }}>
        <Bar data={{ labels, datasets }} options={options} />
      </div>
    </>
  );
}
