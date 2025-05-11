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

export default function AllDaysChart({ labels, recommended, actual }) {
  const data = {
    labels,
    datasets: [
      {
        label           : "Recommended",
        data            : recommended,
        backgroundColor : "#d2d8e0",
      },
      {
        label           : "Actual",
        data            : actual,
        backgroundColor : "#18be94",
      },
    ],
  };

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    plugins             : { legend: { position: "bottom" } },
    scales              : {
      x: { stacked: false },
      y: { stacked: false, beginAtZero: true },
    },
  };

  return (
    <div className="card" style={{ height: 400 }}>
      <h3>Intake per day</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
