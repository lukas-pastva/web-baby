import React from "react";
import { format } from "date-fns";

/**
 * Table of feeds for the selected day.
 */
export default function MilkLogTable({ logs, date }) {
  return (
    <>
      <h3>Feeds for {format(date, "eeee, d LLL yyyy")}</h3>

      {logs.length === 0 && <p>No entries yet.</p>}

      {logs.length > 0 && (
        <table>
          <thead>
            <tr><th>Time</th><th>Amount&nbsp;(ml)</th><th>Type</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{format(new Date(l.fedAt), "HH:mm")}</td>
                <td>{l.amountMl}</td>
                <td>{l.feedingType.replace("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
