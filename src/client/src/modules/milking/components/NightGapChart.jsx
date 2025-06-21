import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

/** Longest uninterrupted *sleep-time* per day (hours). */
export default function NightGapChart({ labels = [], gaps = [] }) {
  const accent = accentColor();

  const data = {
    labels,
    datasets: [
      {
        label           : "Sleep time (h)",
        data            : gaps,            // nulls → “holes” on no-data days
        borderColor     : accent,
        backgroundColor : accent,
        tension         : 0.25,
        pointRadius     : 4,
        pointHoverRadius: 5,
        spanGaps        : true,
      },
    ],
  };

  const options = {
    responsive         : true,
    maintainAspectRatio: false,
    plugins            : { legend: { position: "top" } },
    scales             : {
      y: {
        beginAtZero: true,
        ticks      : { precision: 0 },
        title      : { display: true, text: "Hours" },
      },
      x: { title: { display: true, text: "Day" } },
    },
  };

  return (
    <div className="card" style={{ height: 260 }}>
      <h3>Longest sleep time (hours)</h3>
      <Line data={data} options={options} />
    </div>
  );
}
