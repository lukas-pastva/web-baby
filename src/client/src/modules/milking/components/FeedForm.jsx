import React, { useState } from "react";
import { format, formatISO } from "date-fns";
import { isTypeEnabled } from "../../../config.js";

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

/* common feed amounts (ml) – dropdown */
const AMOUNT_OPTS = Array.from({ length: 10 }, (_, i) => 30 * (i + 1)); // 30-300

export default function FeedForm({ onSave }) {
  const now           = new Date();
  const enabledTypes  = TYPES_IN_ORDER.filter(isTypeEnabled);
  const fallbackType  = enabledTypes[0] || "BREAST_DIRECT";

  const [amount, setAmt] = useState(90);                // default 90 ml
  const [type,   setType] = useState(fallbackType);
  const [date,   setDate] = useState(format(now, "yyyy-MM-dd"));
  const [time,   setTime] = useState(format(now, "HH:mm"));

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    await onSave({
      fedAt      : formatISO(new Date(`${date}T${time}`)),
      amountMl   : Number(amount),
      feedingType: type,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    /* reset to default dropdown choice, keep same date/time */
    setAmt(90);
  }

  /* ─────────────────────────── UI ─────────────────────────────── */
  return (
    <section
      className="card"
      style={{ marginBottom:"1rem", maxWidth:"600px" }}     /* tighter bottom gap  */
    >
      <h3 style={{ marginTop:0 }}>Add feed</h3>

      <form onSubmit={handleSubmit}>
        <table
          style={{
            width:"100%",
            borderCollapse:"collapse",
            lineHeight:1.3,                      /* matches glance table */
          }}
        >
          <tbody>
            {/* Amount dropdown */}
            <tr>
              <td style={{ width:"40%", padding:".25rem .4rem" }}>
                <label htmlFor="amount"><strong>Amount&nbsp;(ml)</strong></label>
              </td>
              <td style={{ padding:".25rem .4rem" }}>
                <select
                  id="amount"
                  value={amount}
                  onChange={e => setAmt(e.target.value)}
                  style={{ width:"100%" }}
                >
                  {AMOUNT_OPTS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </td>
            </tr>

            {/* Type */}
            <tr>
              <td style={{ padding:".25rem .4rem" }}><strong>Type</strong></td>
              <td style={{ padding:".25rem .4rem" }}>
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

            {/* Date */}
            <tr>
              <td style={{ padding:".25rem .4rem" }}><strong>Date</strong></td>
              <td style={{ padding:".25rem .4rem" }}>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ width:"100%" }}
                  required
                />
              </td>
            </tr>

            {/* Time */}
            <tr>
              <td style={{ padding:".25rem .4rem" }}><strong>Time</strong></td>
              <td style={{ padding:".25rem .4rem" }}>
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

        {/* actions */}
        <div style={{ marginTop:".6rem", textAlign:"right" }}>
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
