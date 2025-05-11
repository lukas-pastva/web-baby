import React, { useState } from "react";
import { format } from "date-fns";
import FeedTable from "./FeedTable.jsx";

export default function DayCard({ date, feeds, onUpdate, onDelete }) {
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
        <FeedTable rows={feeds} onUpdate={onUpdate} onDelete={onDelete} />
      )}
    </section>
  );
}
