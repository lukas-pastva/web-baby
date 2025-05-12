import React, { useState } from "react";
import { format, formatISO } from "date-fns";

/**
 * Form to add a single feed with animated feedback.
 * • DATE & TIME always default to *now* in the user’s browser.
 */
export default function FeedForm({ onSave }) {
  const now = new Date();

  const [amount, setAmt] = useState("");
  const [type,   setType] = useState("BREAST_DIRECT");
  const [date,   setDate] = useState(format(now, "yyyy-MM-dd"));
  const [time,   setTime] = useState(format(now, "HH:mm"));

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount) return;

    setSaving(true);

    const fedAtIso = formatISO(new Date(`${date}T${time}`));
    await onSave({
      fedAt      : fedAtIso,
      amountMl   : Number(amount),
      feedingType: type,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    /* quick reset for next entry */
    setAmt("");
    const n = new Date();
    setDate(format(n, "yyyy-MM-dd"));
    setTime(format(n, "HH:mm"));
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add feed</h3>

      <div style={{ display:"flex", gap:"0.75rem", alignItems:"center", flexWrap:"wrap" }}>
        <input
          type="number"
          placeholder="ml"
          value={amount}
          onChange={e => setAmt(e.target.value)}
          style={{ width: 100 }}
          min={0}
          required
        />

        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="BREAST_DIRECT">🤱 Breast – direct</option>
          <option value="BREAST_BOTTLE">🤱🍼 Breast – bottle</option>
          <option value="FORMULA_PUMP">🍼⚙️ Formula – pump / tube</option>
          <option value="FORMULA_BOTTLE">🍼 Formula – bottle</option>
        </select>

        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />

        <button className="btn" disabled={saving}>
          {saving ? <span className="spinner"></span> : "Save"}
        </button>
        {saved && <span className="msg-success" role="status">✓ Saved</span>}
      </div>
    </form>
  );
}
