import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { accentColor } from "../../../theme.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const TYPE_META = {
  BREAST_DIRECT : { c: "#f4a261", lbl: "🤱 Direct"      },
  BREAST_BOTTLE : { c: "#2a9d8f", lbl: "🤱🍼 Bottle"     },
  FORMULA_PUMP  : { c: "#e76f51", lbl: "🍼⚙ Tube"       },
  FORMULA_BOTTLE: { c: "#264653", lbl: "🍼 Bottle"      },
};

export default function SummaryChart({ feeds = [], recommended = 0 }) {
  /* sum per feed-type */
  const sums = useMemo(() => {
    const base = Object.fromEntries(Object.keys(TYPE_META).map(k => [k, 0]));
    feeds.forEach(f => { base[f.feedingType] += f.amountMl; });
    return base;
  }, [feeds]);

  const accent = accentColor();
  const labels = ["Today"];                     // single column

  const barSets = Object.entries(TYPE_META).map(([code, meta]) => ({
    type           : "bar",
    label          : meta.lbl,
    data           : [sums[code]],
    backgroundColor: meta.c,
    stack          : "feeds",
    yAxisID        : "y",
  }));

  const total = Object.values(sums).reduce((a, b) => a + b, 0);

  const datasets = [
    ...barSets,
    {
      type        : "line",
      label       : "Total",
      data        : [total],
      borderColor : accent,
      backgroundColor: accent,
      tension     : 0.25,
      yAxisID     : "y",
    },
    {
      type        : "line",
      label       : "Recommended",
      data        : [recommended],
      borderColor : "#9ca3af",
      borderDash  : [4, 4],
      pointRadius : 3,
      tension     : 0.25,
      yAxisID     : "rec",
    },
  ];

  const options = {
    responsive          : true,
    maintainAspectRatio : false,
    interaction         : { mode:"index", intersect:false },
    plugins             : { legend:{ position:"top" } },
    scales              : {
      y  : { stacked:true, beginAtZero:true },
      rec: { display:false, beginAtZero:true },
    },
  };

  return (
    <>
      <h3>Total for the day</h3>
      <div style={{ height: 300 }}>
        <Bar data={{ labels, datasets }} options={options} />
      </div>
    </>
  );
}
