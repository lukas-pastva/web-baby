import React, { useState } from "react";
import { format, formatISO } from "date-fns";
import { isTypeEnabled } from "../../../config.js";          // ← NEW

const TYPES_IN_ORDER = [
  "BREAST_DIRECT",
  "BREAST_BOTTLE",
  "FORMULA_PUMP",
  "FORMULA_BOTTLE",
];

/**
 * Form to add a single feed.
 * DATE & TIME always default to *now* in the user’s browser.
 * Option list honours the session-config “enabled types”.
 */
export default function FeedForm({ onSave }) {
  const now = new Date();

  /* first enabled type becomes the default */
  const enabledTypes      = TYPES_IN_ORDER.filter(isTypeEnabled);
  const fallbackType      = enabledTypes[0] || "BREAST_DIRECT";

  const [amount, setAmt]  = useState("");
  const [type,   setType] = useState(fallbackType);
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
          {enabledTypes.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
          ))}
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
