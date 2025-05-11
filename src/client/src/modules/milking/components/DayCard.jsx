import React, { useState } from "react";
import { format } from "date-fns";
import FeedTable from "./FeedTable.jsx";

export default function DayCard({ date, feeds, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);        // collapsed by default
  const dayStr          = format(date, "eeee, d LLL yyyy");

  return (
    <section className="card">
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ margin: 0 }}>{dayStr}</h3>
        <button
          className="btn-light"
          onClick={() => setOpen(!open)}
          title={open ? "Collapse" : "Expand"}
        >
          {open ? "−" : "+"}
        </button>
      </header>

      {open && (
        <FeedTable rows={feeds} onUpdate={onUpdate} onDelete={onDelete} />
      )}
    </section>
  );
}
