import React, { useState } from "react";
import { format } from "date-fns";

export default function FeedTable({ rows }) {
  const [sortKey, setKey] = useState("fedAt");
  const [asc, setAsc]     = useState(true);

  function sort(k) {
    setAsc(k === sortKey ? !asc : true);
    setKey(k);
  }

  const sorted = [...rows].sort((a, b) => {
    const d = a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0;
    return asc ? d : -d;
  });

  return (
    <>
      <h3>Feeds for the day</h3>
      {sorted.length === 0 && <p>No entries.</p>}
      {sorted.length > 0 && (
        <table>
          <thead>
            <tr>
              <th onClick={() => sort("fedAt")}>Time</th>
              <th onClick={() => sort("amountMl")}>Amount (ml)</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(f => (
              <tr key={f.id}>
                <td>{format(new Date(f.fedAt), "HH:mm")}</td>
                <td>{f.amountMl}</td>
                <td>{f.feedingType.replace("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
