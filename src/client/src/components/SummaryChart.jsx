import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function SummaryChart({ recommended = 0, actual = 0 }) {
  const data = {
    labels: ["Recommended", "Actual"],
    datasets: [{
      label: "ml",
      data : [recommended, actual],
    }],
  };
  const options = { plugins: { legend: { display: false } } };

  return (
    <>
      <h3>Total for the day</h3>
      <Bar data={data} options={options} />
    </>
  );
}
