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

/* Register the chart.js pieces once */
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Simple two-bar chart: recommended vs actual ml for the selected day.
 */
export default function SummaryChart({ recommended = 0, actual = 0 }) {
  const data = {
    labels: ["Recommended", "Actual"],
    datasets: [
      {
        label: "ml",
        data: [recommended, actual],
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
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
