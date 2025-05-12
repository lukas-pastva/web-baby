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

export default function SummaryChart({ recommended = 0, typeTotals = {} }) {
  const datasets = [];

  /* guideline line (grey) */
  datasets.push({
    type           : "line",
    label          : "Recommended",
    data           : [recommended],
    borderColor    : "#d2d8e0",
    backgroundColor: "#d2d8e0",
    tension        : 0.3,
    pointRadius    : 0,
    yAxisID        : "y",
  });

  /* stacked bars: one per feed-type */
  Object.entries(typeTotals).forEach(([type, val]) => {
    if (!val) return;                       // skip 0-value types
    const { c, icon } = TYPE_META[type] || {};
    datasets.push({
      label          : `${icon} ${type.replace("_", " ")}`,
      data           : [val],
      backgroundColor: c || accentColor(),
      stack          : "actual",
      borderWidth    : 1,
    });
  });

  /* total overlay line (accent) */
  const total = Object.values(typeTotals).reduce((s, v) => s + v, 0);
  datasets.push({
    type           : "line",
    label          : "Total",
    data           : [total],
    borderColor    : accentColor(),
    backgroundColor: accentColor(),
    tension        : 0.25,
    pointRadius    : 4,
    yAxisID        : "y",
  });

  const data = { labels: ["Today"], datasets };
  const options = {
    responsive         : true,
    maintainAspectRatio: false,
    interaction        : { mode: "index", intersect: false },
    plugins            : { legend: { position: "top" } },
    scales             : { y: { stacked: true, beginAtZero: true } },
  };

  return (
    <>
      <h3>Total for the day</h3>
      <div style={{ height: 260 }}>
        <Bar data={data} options={options} />
      </div>
    </>
  );
}
