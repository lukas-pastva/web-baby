import React, { useState } from "react";
import { format, formatISO } from "date-fns";
import { isTypeEnabled } from "../../../config.js";      // session helper

/* ─── icons & labels (same set used elsewhere) ───────────────────── */
const ICONS = {
  BREAST_DIRECT : "🤱",
  BREAST_BOTTLE : "🤱🍼",
  FORMULA_PUMP  : "🍼⚙️",
  FORMULA_BOTTLE: "🍼",
};
const LABELS = {
  BREAST_DIRECT : "Breast – direct",
  BREAST_BOTTLE : "Breast – bottle",
  FORMULA_PUMP  : "Formula – pump / tube",
  FORMULA_BOTTLE: "Formula – bottle",
};
const TYPES_IN_ORDER = Object.keys(ICONS);

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function FeedForm({ onSave }) {
  const now           = new Date();
  const enabledTypes  = TYPES_IN_ORDER.filter(isTypeEnabled);
  const fallbackType  = enabledTypes[0] || "BREAST_DIRECT";

  /* dropdown ml options 10…100 every 5 */
  const ML_OPTIONS = Array.from({ length: 19 }, (_, i) => 10 + i * 5); // [10,15,…,100]

  const [amount, setAmt] = useState("30");
  const [type,   setType] = useState(fallbackType);
  const [date,   setDate] = useState(format(now, "yyyy-MM-dd"));
  const [time,   setTime] = useState(format(now, "HH:mm"));

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount) return;

    setSaving(true);
    await onSave({
      fedAt      : formatISO(new Date(`${date}T${time}`)),
      amountMl   : Number(amount),
      feedingType: type,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    /* quick reset */
    setAmt("30");
    const n = new Date();
    setDate(format(n, "yyyy-MM-dd"));
    setTime(format(n, "HH:mm"));
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add feed</h3>

      <div style={{ display:"flex", gap:"0.75rem", alignItems:"center", flexWrap:"wrap" }}>
        {/* dropdown instead of free-text number */}
        <select value={amount} onChange={e => setAmt(e.target.value)}>
          {ML_OPTIONS.map(v => (
            <option key={v} value={v}>{v} ml</option>
          ))}
        </select>

        <select value={type} onChange={e => setType(e.target.value)}>
          {enabledTypes.map(t => (
            <option key={t} value={t}>
              {ICONS[t]} {LABELS[t]}
            </option>
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
