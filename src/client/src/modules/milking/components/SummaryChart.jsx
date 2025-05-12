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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TYPE_COLORS = {
  BREAST_DIRECT : "#8dd3c7",
  BREAST_BOTTLE : "#80b1d3",
  FORMULA_PUMP  : "#fb8072",
  FORMULA_BOTTLE: "#bebada",
};

/**
 * Stacked bar (by type) + numeric total label.
 *
 *  props
 *  ────────────────────────────────────────────────
 *  recommended : number
 *  byType      : { [type]: ml }
 */
export default function SummaryChart({ recommended = 0, byType = {} }) {
  const total = Object.values(byType).reduce((s, v) => s + v, 0);

  const data = {
    labels  : ["Recommended", "Actual"],
    datasets: [
      {
        stack          : "rec",
        label          : "Recommended",
        data           : [recommended, 0],
        backgroundColor: "#d2d8e0",
      },
      ...Object.entries(TYPE_COLORS).map(([type, color]) => ({
        stack          : "act",
        label          : type.replace(/_/g, " "),
        data           : [0, byType[type] || 0],
        backgroundColor: color,
      })),
    ],
  };

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    plugins             : {
      legend : { display:true, position:"top" },
      tooltip: { intersect:false },
    },
    scales: { x:{ stacked:true }, y:{ stacked:true, beginAtZero:true } },
  };

  return (
    <>
      <h3>Total for the day</h3>
      <div style={{ height:260 }}>
        <Bar data={data} options={options} />
      </div>
      {/* numeric total label */}
      <p style={{ textAlign:"center", marginTop:8, fontWeight:600 }}>
        {total}&nbsp;ml consumed today
      </p>
    </>
  );
}
