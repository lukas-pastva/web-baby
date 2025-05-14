import React, { useState } from "react";
import { format } from "date-fns";
import FeedTable     from "./FeedTable.jsx";
import SummaryChart  from "./SummaryChart.jsx";

/**
 * Collapsible “day card” that now shows:
 *   • the feed table (editable)
 *   • the per-day intake chart with recommended line
 *
 * Props
 * ─────
 * • date         – JS Date object for the day
 * • feeds        – array of feed rows [{ fedAt, amountMl, feedingType, … }]
 * • recommended  – number (ml) for that day’s suggested intake
 * • onUpdate     – (id, payload) ⇒ Promise  (optional)
 * • onDelete     – (id) ⇒ Promise           (optional)
 */
export default function DayCard({
  date,
  feeds,
  recommended = 0,
  onUpdate,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const dayStr          = format(date, "eeee, d LLL yyyy");

  function toggle() { setOpen(!open); }

  return (
    <section className="card">
      <header
        onClick={toggle}
        style={{
          display       : "flex",
          justifyContent: "space-between",
          alignItems    : "center",
          cursor        : "pointer",
          userSelect    : "none",
        }}
      >
        <h3 style={{ margin: 0 }}>{dayStr}</h3>
        <span style={{ fontSize:"1.4rem", lineHeight:1 }}>
          {open ? "−" : "+"}
        </span>
      </header>

      {open && (
        <>
          <FeedTable
            rows={feeds}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />

          {/* per-day stacked/step chart (same look as Today dashboard) */}
          <SummaryChart feeds={feeds} recommended={recommended} />
        </>
      )}
    </section>
  );
}
