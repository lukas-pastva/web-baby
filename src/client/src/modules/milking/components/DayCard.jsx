import React from "react";
import { format } from "date-fns";
import FeedTable from "./FeedTable.jsx";

export default function DayCard({ date, feeds, onUpdate, onDelete }) {
  const dayStr = format(date, "eeee, d LLL yyyy");

  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>{dayStr}</h3>
      <FeedTable rows={feeds} onUpdate={onUpdate} onDelete={onDelete} />
    </section>
  );
}
