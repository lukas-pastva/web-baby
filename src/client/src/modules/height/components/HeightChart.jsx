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
  Legend
);

export default function HeightChart({
  labels = [],
  heights = [],  // recorded (may contain nulls)
  normal = [],   // WHO median
  over = [],     // +3 %
  under = [],    // −3 %
}) {
  const accent = accentColor();

  const datasets = [
    {
      label            : "Recorded height",
      data             : heights,
      borderColor      : accent,
      backgroundColor  : accent,
      tension          : 0.25,
      pointRadius      : 4,
      pointHoverRadius : 5,
      spanGaps         : true,
    },
    {
      label       : "WHO median",
      data        : normal,
      borderColor : "#10b981",
      tension     : 0.25,
      pointRadius : 0,
    },
    {
      label       : "≈ +3 %",
      data        : over,
      borderColor : "#dc2626",
      borderDash  : [4, 4],
      tension     : 0.25,
      pointRadius : 0,
    },
    {
      label       : "≈ -3 %",
      data        : under,
      borderColor : "#f59e0b",
      borderDash  : [4, 4],
      tension     : 0.25,
      pointRadius : 0,
    },
  ];

  const data = { labels, datasets };

  const options = {
    responsive         : true,
    maintainAspectRatio: false,
    plugins            : { legend: { position: "top" } },
    scales             : {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Centimetres" } },
    },
  };

  return (
    <div className="card" style={{ height: 300 }}>
      <h3>Height over time</h3>
      <Line data={data} options={options} />
    </div>
  );
}
