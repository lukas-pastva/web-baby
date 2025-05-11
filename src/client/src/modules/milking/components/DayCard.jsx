import React from "react";
import { format } from "date-fns";
import FeedTable     from "./FeedTable.jsx";
import SummaryChart  from "./SummaryChart.jsx";

/**
 * One self-contained “card” for a single calendar day:
 *  – header with date
 *  – table of feeds
 *  – tiny bar chart (recommended vs actual)
 */
export default function DayCard({ date, feeds, recTotal = 0 }) {
  const dayStr = format(date, "eeee, d LLL yyyy");
  const total  = feeds.reduce((s, f) => s + f.amountMl, 0);

  return (
    <section
      style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,.08)",
        marginBottom: "1.25rem",
        padding: "1rem 1.5rem",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{dayStr}</h3>

      <FeedTable rows={feeds} />

      <SummaryChart recommended={recTotal} actual={total} />
    </section>
  );
}
