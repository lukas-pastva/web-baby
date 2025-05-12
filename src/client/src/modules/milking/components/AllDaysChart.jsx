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

/* colour + emoji per feed-type */
const TYPE_META = {
  BREAST_DIRECT : { c: "#f4a261", icon: "🤱"   },
  BREAST_BOTTLE : { c: "#2a9d8f", icon: "🤱🍼" },
  FORMULA_PUMP  : { c: "#e76f51", icon: "🍼⚙️" },
  FORMULA_BOTTLE: { c: "#264653", icon: "🍼"   },
};

export default function AllDaysChart({ labels = [], recommended = [], byType = {} }) {
  /* ── datasets ────────────────────────────────────────────────── */
  const datasets = [];

  /* guideline – thin grey line */
  datasets.push({
    type           : "line",
    label          : "Recommended",
    data           : recommended,
    borderColor    : "#d2d8e0",
    backgroundColor: "#d2d8e0",
    tension        : 0.3,
    pointRadius    : 0,
    yAxisID        : "y",
  });

  /* stacked bars – one per feed-type */
  Object.entries(byType).forEach(([type, arr]) => {
    const { c, icon } = TYPE_META[type] || {};
    datasets.push({
      label          : `${icon} ${type.replace("_", " ")}`,
      data           : arr,
      backgroundColor: c || accentColor(),
      stack          : "actual",          // all bars in a single stack
      borderWidth    : 1,
    });
  });

  /* total overlay line = Σ feed-types (NOT including recommended) */
  const totals = labels.map((_, i) =>
    Object.values(byType).reduce((sum, arr) => sum + (arr[i] || 0), 0)
  );
  datasets.push({
    type           : "line",
    label          : "Total",
    data           : totals,
    borderColor    : accentColor(),
    backgroundColor: accentColor(),
    tension        : 0.25,
    pointRadius    : 3,
    yAxisID        : "y",
  });

  /* ── chart config ────────────────────────────────────────────── */
  const data = { labels, datasets };
  const options = {
    responsive         : true,
    maintainAspectRatio: false,
    interaction        : { mode: "index", intersect: false },
    plugins            : { legend: { position: "top" } },
    scales             : {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <div className="card" style={{ height: 400 }}>
      <h3>Intake per day</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
