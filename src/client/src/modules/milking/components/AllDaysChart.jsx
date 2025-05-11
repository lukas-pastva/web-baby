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
        stack           : "stack",
      },
      {
        label           : "Actual",
        data            : actual,
        backgroundColor : "#18be94",
        stack           : "stack",
      },
    ],
  };

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    scales              : { x: { stacked: true }, y: { stacked: true } },
    plugins             : { legend: { position: "bottom" } },
  };

  return (
    <div className="card" style={{ height: 360 }}>
      <h3>Intake per day</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
