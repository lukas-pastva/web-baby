import React from "react";
import { format } from "date-fns";

export default function MilkLogTable({ logs }) {
  return (
    <>
      <h3>Today’s feeds</h3>
      {logs.length === 0 && <p>No entries yet.</p>}
      {logs.length > 0 && (
        <table>
          <thead>
            <tr><th>Time</th><th>Amount (ml)</th><th>Type</th></tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td>{format(new Date(l.fedAt), "HH:mm")}</td>
                <td>{l.amountMl}</td>
                <td>{l.feedingType.replace("_"," ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
