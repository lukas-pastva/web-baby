import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from "chart.js";
import { accentColor } from "../../../theme.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function FeedCountChart({ labels = [], counts = [] }) {
  const accent = accentColor();

  const data = {
    labels,
    datasets: [
      {
        type           : "bar",
        label          : "Feeds per day",
        data           : counts,
        backgroundColor: accent,
        borderRadius   : 4,
      },
    ],
  };

  const options = {
    responsive         : true,
    maintainAspectRatio: false,
    plugins            : { legend:{ display:false } },
    scales             : {
      y:{ beginAtZero:true, ticks:{ precision:0 } },
    },
  };

  return (
    <div className="card" style={{ height:260 }}>
      <h3>Number of feeds per day</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
