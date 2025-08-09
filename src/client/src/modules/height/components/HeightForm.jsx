import React, { useState } from "react";
import { format } from "date-fns";

/** One-line form to record baby's height (cm). */
export default function HeightForm({ onSave, defaultDate = new Date() }) {
  const [cm, setCm]         = useState("");
  const [date, setDate]     = useState(format(defaultDate, "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cm) return;

    setSaving(true);

    await onSave({
      measuredAt: date,         // DATEONLY (YYYY-MM-DD)
      heightCm  : Number(cm),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    setCm("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add height</h3>
      <div style={{ display:"flex", gap:".7rem", alignItems:"center", flexWrap:"wrap" }}>
        <input
          type="number"
          placeholder="cm"
          value={cm}
          onChange={e => setCm(e.target.value)}
          min={0}
          step="0.1"
          style={{ width:120 }}
          required
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <button className="btn" disabled={saving}>
          {saving ? <span className="spinner"></span> : "Save"}
        </button>
        {saved && <span className="msg-success" role="status">✓ Saved</span>}
      </div>
    </form>
  );
}
