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

/**
 * Stacked bar-chart: Recommended vs Actual ml per day.
 * Two clearly different colours.
 */
export default function AllDaysChart({ labels, recommended, actual }) {
  const data = {
    labels,
    datasets: [
      {
        label           : "Recommended",
        data            : recommended,
        backgroundColor : "#d2d8e0",   // light grey
        stack           : "stack",
      },
      {
        label           : "Actual",
        data            : actual,
        backgroundColor : "#18be94",   // teal
        stack           : "stack",
      },
    ],
  };

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    plugins             : { legend: { position: "bottom" } },
    scales              : { x: { stacked: true }, y: { stacked: true } },
  };

  return (
    <div className="card" style={{ height: 340 }}>
      <h3>Intake per day</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
