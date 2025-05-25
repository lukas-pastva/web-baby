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

  const [amount, setAmt] = useState("");
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
    setAmt("");
    const n = new Date();
    setDate(format(n, "yyyy-MM-dd"));
    setTime(format(n, "HH:mm"));
  }

  /* ─────────────────────────── UI ──────────────────────────────── */
  return (
    <section
      className="card"
      style={{ marginBottom:"1.5rem", maxWidth:"600px" }}
    >
      <h3 style={{ marginTop:0 }}>Add feed</h3>

      <form onSubmit={handleSubmit}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <tbody>
            <tr>
              <td style={{ width:"40%" }}><label htmlFor="amount"><strong>Amount&nbsp;(ml)</strong></label></td>
              <td>
                <input
                  id="amount"
                  type="number"
                  placeholder="e.g. 90"
                  value={amount}
                  onChange={e => setAmt(e.target.value)}
                  style={{ width:"100%" }}
                  min={0}
                  required
                />
              </td>
            </tr>

            <tr>
              <td><strong>Type</strong></td>
              <td>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  style={{ width:"100%" }}
                >
                  {enabledTypes.map(t => (
                    <option key={t} value={t}>
                      {ICONS[t]} {LABELS[t]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td><strong>Date</strong></td>
              <td>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ width:"100%" }}
                  required
                />
              </td>
            </tr>

            <tr>
              <td><strong>Time</strong></td>
              <td>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  style={{ width:"100%" }}
                  required
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop:"1rem", textAlign:"right" }}>
          <button className="btn" disabled={saving}>
            {saving ? <span className="spinner"></span> : "Save"}
          </button>
          {saved && (
            <span
              className="msg-success"
              role="status"
              style={{ marginLeft:".6rem" }}
            >
              ✓ Saved
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
