import React, { useState } from "react";
import { format } from "date-fns";

/**
 * Sortable table with optional edit / delete actions.
 * If `onUpdate` or `onDelete` are omitted the buttons are hidden.
 */
export default function FeedTable({ rows, onUpdate, onDelete }) {
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

  /* ---------------------------------------------------------------- */
  /*  Simple in-place edit using prompt() – keeps UI minimal          */
  /* ---------------------------------------------------------------- */
  async function handleEdit(feed) {
    if (!onUpdate) return;

    const amountMl = prompt("Amount (ml):", feed.amountMl);
    if (amountMl === null) return;                        // cancelled

    const feedingType = prompt(
      "Feeding type (BREAST_DIRECT / BREAST_BOTTLE / FORMULA_PUMP / FORMULA_BOTTLE):",
      feed.feedingType
    );
    if (feedingType === null) return;

    const fedAt = prompt(
      "Timestamp (ISO - leave empty to keep unchanged):",
      feed.fedAt
    );

    const payload = {
      amountMl   : Number(amountMl),
      feedingType: feedingType.trim(),
    };
    if (fedAt && fedAt.trim()) payload.fedAt = fedAt.trim();

    await onUpdate(feed.id, payload);
  }

  async function handleDelete(id) {
    if (!onDelete) return;
    if (confirm("Delete this feed entry?")) await onDelete(id);
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <>
      <h3>Feeds for the day</h3>
      {sorted.length === 0 && <p>No entries.</p>}
      {sorted.length > 0 && (
        <table>
          <thead>
            <tr>
              <th onClick={() => sort("fedAt")}>Time</th>
              <th onClick={() => sort("amountMl")}>Amount&nbsp;(ml)</th>
              <th>Type</th>
              {(onUpdate || onDelete) && <th></th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map(f => (
              <tr key={f.id}>
                <td>{format(new Date(f.fedAt), "HH:mm")}</td>
                <td>{f.amountMl}</td>
                <td>{f.feedingType.replace("_", " ")}</td>
                {(onUpdate || onDelete) && (
                  <td style={{ whiteSpace: "nowrap" }}>
                    {onUpdate && (
                      <button
                        type="button"
                        className="btn-light"
                        onClick={() => handleEdit(f)}
                        style={{ marginRight: ".4rem" }}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="btn-light"
                        onClick={() => handleDelete(f.id)}
                      >
                        ×
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
