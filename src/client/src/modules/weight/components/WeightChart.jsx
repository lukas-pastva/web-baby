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
import { accentColor } from "../../../theme.js";   // ← fixed

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement,  Title, Tooltip, Legend
);

export default function WeightChart({ labels = [], weights = [] }) {
  const accent = accentColor();
  const data = {
    labels,
    datasets: [{
      label:"Weight (g)",
      data:weights,
      borderColor:accent,
      backgroundColor:"rgba(24,190,148,0.2)",
      tension:0.25,
      pointRadius:4,
      pointHoverRadius:5,
    }],
  };

  const options = {
    responsive:true,
    maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{
      x:{ title:{ display:true, text:"Date" } },
      y:{ title:{ display:true, text:"Grams" } },
    },
  };

  return (
    <div className="card" style={{ height: 300 }}>
      <h3>Weight over time</h3>
      <Line data={data} options={options} />
    </div>
  );
}
