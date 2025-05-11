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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Simple line chart (date on X, grams on Y).
 */
export default function WeightChart({ labels = [], weights = [] }) {
  const data = {
    labels,
    datasets: [
      {
        label           : "Weight (g)",
        data            : weights,
        borderColor     : "#18be94",
        backgroundColor : "rgba(24,190,148,0.2)",
        tension         : 0.25,
        pointRadius     : 4,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    plugins             : { legend: { display: false } },
    scales              : {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Grams" } },
    },
  };

  return (
    <div className="card" style={{ height: 300 }}>
      <h3>Weight over time</h3>
      <Line data={data} options={options} />
    </div>
  );
}
