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
 * Stacked bar-chart of recommended vs actual ml
 * X-axis = calendar day label
 */
export default function AllDaysChart({ labels, recommended, actual }) {
  const data = {
    labels,
    datasets: [
      {
        label: "Recommended",
        data : recommended,
        stack: "stack",
      },
      {
        label: "Actual",
        data : actual,
        stack: "stack",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales : { y: { stacked: true }, x: { stacked: true } },
  };

  return (
    <div className="card" style={{ height: 320 }}>
      <h3>Intake per day</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
