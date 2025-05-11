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

export default function SummaryChart({ recommended = 0, actual = 0 }) {
  const data = {
    labels   : ["Recommended", "Actual"],
    datasets : [
      {
        label           : "Recommended",
        data            : [recommended, 0],
        backgroundColor : "#d2d8e0",   // light grey
      },
      {
        label           : "Actual",
        data            : [0, actual],
        backgroundColor : "#18be94",   // teal
      },
    ],
  };

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    plugins             : { legend: { display: false } },
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
