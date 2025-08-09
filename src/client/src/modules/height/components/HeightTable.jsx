import React, { useState } from "react";

/** Editable (inline) list of height entries – one per day. */
export default function HeightTable({ rows, onUpdate, onDelete }) {
  const [editingId, setEdit] = useState(null);
  const [formVals, setForm]  = useState({ cm:"", datePart:"" });

  function beginEdit(row) {
    setForm({ cm: row.heightCm, datePart: row.measuredAt });
    setEdit(row.id);
  }

  async function saveEdit(e) {
    e.preventDefault();
    await onUpdate(editingId, {
      measuredAt: formVals.datePart,
      heightCm  : Number(formVals.cm),
    });
    setEdit(null);
  }

  async function del(id) {
    if (confirm("Delete height record?")) await onDelete(id);
  }

  const hasAct = onUpdate || onDelete;

  return (
    <>
      <h3>Recorded heights</h3>

      {rows.length === 0 && <p>No entries.</p>}

      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Height&nbsp;(cm)</th>
              {hasAct && <th></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <React.Fragment key={r.id}>
                <tr>
                  <td>{r.measuredAt}</td>
                  <td>{r.heightCm}</td>
                  {hasAct && (
                    <td style={{ whiteSpace:"nowrap" }}>
                      {onUpdate && (
                        <button
                          className="btn-light"
                          onClick={() => beginEdit(r)}
                          style={{ marginRight:".4rem" }}
                        >Edit</button>
                      )}
                      {onDelete && (
                        <button
                          className="btn-light"
                          onClick={() => del(r.id)}
                        >×</button>
                      )}
                    </td>
                  )}
                </tr>

                {editingId === r.id && (
                  <tr>
                    <td colSpan={3}>
                      <form onSubmit={saveEdit} style={{ display:"flex", gap:".5rem", flexWrap:"wrap" }}>
                        <input
                          type="number"
                          value={formVals.cm}
                          onChange={e => setForm({ ...formVals, cm:e.target.value })}
                          min={0}
                          step="0.1"
                          required
                          style={{ width:120 }}
                        />
                        <input
                          type="date"
                          value={formVals.datePart}
                          onChange={e => setForm({ ...formVals, datePart:e.target.value })}
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
