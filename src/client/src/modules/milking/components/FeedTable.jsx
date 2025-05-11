import React, { useState } from "react";
import { format, formatISO } from "date-fns";

/* emoji icons & friendly labels for quick scanning */
const ICONS = {
  BREAST_DIRECT : "🤱",
  BREAST_BOTTLE : "🍼",
  FORMULA_PUMP  : "🍼⚙️",
  FORMULA_BOTTLE: "🍼",
};
const LABELS = {
  BREAST_DIRECT : "Breast – direct",
  BREAST_BOTTLE : "Breast – bottle",
  FORMULA_PUMP  : "Formula – pump / tube",
  FORMULA_BOTTLE: "Formula – bottle",
};

/**
 * Sortable, editable feed table.
 * When Edit is clicked an inline form appears *below* the row.
 */
export default function FeedTable({ rows, onUpdate, onDelete }) {
  const [sortKey, setKey]     = useState("fedAt");
  const [asc, setAsc]         = useState(true);
  const [editingId, setEdit]  = useState(null);
  const [formVals, setForm]   = useState({
    amount   : "",
    type     : "BREAST_DIRECT",
    datePart : "",
    timePart : "",
  });

  /* ── helpers ──────────────────────────────────────────────────── */
  function sort(k) {
    setAsc(k === sortKey ? !asc : true);
    setKey(k);
  }

  const sorted = [...rows].sort((a, b) => {
    const d = a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0;
    return asc ? d : -d;
  });

  /* ── edit actions ─────────────────────────────────────────────── */
  function beginEdit(feed) {
    const dt = new Date(feed.fedAt);
    setForm({
      amount   : feed.amountMl,
      type     : feed.feedingType,
      datePart : format(dt, "yyyy-MM-dd"),
      timePart : format(dt, "HH:mm"),
    });
    setEdit(feed.id);
  }

  async function saveEdit(e) {
    e.preventDefault();
    const { amount, type, datePart, timePart } = formVals;
    const fedAt = formatISO(new Date(`${datePart}T${timePart}`));
    await onUpdate(editingId, {
      amountMl   : Number(amount),
      feedingType: type,
      fedAt,
    });
    setEdit(null);
  }

  async function del(id) {
    if (onDelete && confirm("Delete this feed entry?")) await onDelete(id);
  }

  /* ── UI ────────────────────────────────────────────────────────── */
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
              <React.Fragment key={f.id}>
                <tr>
                  <td>{format(new Date(f.fedAt), "HH:mm")}</td>
                  <td>{f.amountMl}</td>
                  <td>
                    <span className="feed-icon">{ICONS[f.feedingType]}</span>
                    {LABELS[f.feedingType]}
                  </td>
                  {(onUpdate || onDelete) && (
                    <td style={{ whiteSpace:"nowrap" }}>
                      {onUpdate && (
                        <button
                          className="btn-light"
                          onClick={() => beginEdit(f)}
                          style={{ marginRight:".4rem" }}
                        >Edit</button>
                      )}
                      {onDelete && (
                        <button
                          className="btn-light"
                          onClick={() => del(f.id)}
                        >×</button>
                      )}
                    </td>
                  )}
                </tr>

                {/* inline editor */}
                {editingId === f.id && (
                  <tr>
                    <td colSpan={4}>
                      <form onSubmit={saveEdit} style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
                        <input
                          type="number"
                          value={formVals.amount}
                          onChange={e => setForm({ ...formVals, amount:e.target.value })}
                          min={0}
                          required
                          style={{ width:90 }}
                        />
                        <select
                          value={formVals.type}
                          onChange={e => setForm({ ...formVals, type:e.target.value })}
                        >
                          {Object.entries(LABELS).map(([val, label]) => (
                            <option key={val} value={val}>
                              {ICONS[val]} {label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={formVals.datePart}
                          onChange={e => setForm({ ...formVals, datePart:e.target.value })}
                          required
                        />
                        <input
                          type="time"
                          value={formVals.timePart}
                          onChange={e => setForm({ ...formVals, timePart:e.target.value })}
                          required
                        />
                        <button className="btn">Save</button>
                        <button type="button" className="btn-light" onClick={() => setEdit(null)}>
                          Cancel
                        </button>
                      </form>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
