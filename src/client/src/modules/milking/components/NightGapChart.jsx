import React, { useMemo } from "react";
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
  Legend,
);

/** Compute 7-day centred moving average, skipping nulls. */
function movingAvg(arr, window = 7) {
  const half = Math.floor(window / 2);
  return arr.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let j = i - half; j <= i + half; j++) {
      if (j >= 0 && j < arr.length && arr[j] != null) {
        sum += arr[j];
        count++;
      }
    }
    return count >= 1 ? +(sum / count).toFixed(2) : null;
  });
}

/** Longest uninterrupted *sleep-time* per day (hours). */
export default function NightGapChart({ labels = [], gaps = [] }) {
  const accent = accentColor();
  const avg = useMemo(() => movingAvg(gaps, 7), [gaps]);

  const data = {
    labels,
    datasets: [
      {
        label           : "7-day average",
        data            : avg,
        borderColor     : accent,
        backgroundColor : accent,
        borderWidth     : 3,
        tension         : 0.35,
        pointRadius     : 0,
        pointHoverRadius: 4,
        spanGaps        : true,
        order           : 1,
      },
      {
        label           : "Raw sleep (h)",
        data            : gaps,
        borderColor     : accent + "40",
        backgroundColor : accent + "60",
        borderWidth     : 1,
        tension         : 0.15,
        pointRadius     : 2,
        pointHoverRadius: 4,
        spanGaps        : true,
        order           : 2,
      },
    ],
  };

  const options = {
    responsive         : true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label(ctx) {
            const i = ctx.dataIndex;
            const raw = gaps[i] != null ? gaps[i].toFixed(1) + "h" : "—";
            const ma  = avg[i]  != null ? avg[i].toFixed(1) + "h"  : "—";
            if (ctx.datasetIndex === 0) return `Avg: ${ma}  (raw: ${raw})`;
            return `Raw: ${raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max        : 12,
        ticks      : { precision: 0 },
        title      : { display: true, text: "Hours" },
      },
      x: { title: { display: true, text: "Day" } },
    },
  };

  return (
    <div className="card" style={{ height: 260 }}>
      <h3>Longest sleep time (hours)</h3>
      <Line data={data} options={options} />
    </div>
  );
}
