import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { accentColor } from "../../../theme.js";   // ← path from /components

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ─── colour for every feeding type ─────────────────────────────── */
const TYPE_COLORS = {
  BREAST_DIRECT : "#8dd3c7",
  BREAST_BOTTLE : "#80b1d3",
  FORMULA_PUMP  : "#fb8072",
  FORMULA_BOTTLE: "#bebada",
};

/**
 * Stacked intake chart: one grey “Recommended” bar + a coloured stack
 * that splits the actual intake into its four feeding-type segments.
 */
export default function AllDaysChart({ labels = [], recommended = [], byType = {} }) {
  const accent = accentColor();            // still available for other uses

  const data = {
    labels,
    datasets: [
      /* separate bar so users can eyeball total vs. recommendation */
      {
        stack          : "rec",
        label          : "Recommended",
        data           : recommended,
        backgroundColor: "#d2d8e0",
      },
      /* 4 coloured segments build one “actual” stack */
      ...Object.entries(TYPE_COLORS).map(([type, color]) => ({
        stack          : "act",
        label          : type.replace(/_/g, " "),
        data           : byType[type] || [],
        backgroundColor: color,
      })),
    ],
  };

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    plugins             : {
      legend : { position:"top" },
      tooltip: { intersect:false },
    },
    scales: {
      x: { stacked:true },
      y: { stacked:true, beginAtZero:true },
    },
  };

  return (
    <div className="card" style={{ height: 400 }}>
      <h3>Intake per day</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
