import React, { useState, useEffect } from "react";
import { format, formatISO } from "date-fns";
import { isTypeEnabled }   from "../../../config.js";
import {
  ORDER       as TYPES_IN_ORDER,
  ICONS, LABELS,
} from "../../../feedTypes.js";

/* amounts 10-300 ml in 5-ml steps */
const AMOUNT_OPTS = Array.from({ length: 59 }, (_, i) => 10 + i * 5);

function nowDate() { return format(new Date(), "yyyy-MM-dd"); }
function nowTime() { return format(new Date(), "HH:mm"); }

export default function FeedForm({ onSave }) {
  const enabledTypes = TYPES_IN_ORDER.filter(isTypeEnabled);
  const fallbackType = enabledTypes[0] || TYPES_IN_ORDER[0];

  /* ---- state ----------------------------------------------------- */
  const [amount, setAmt] = useState(60);
  const [type,   setType] = useState(fallbackType);
  const [date,   setDate] = useState(nowDate());
  const [time,   setTime] = useState(nowTime());

  const [auto,   setAuto] = useState(true);   // auto-update flag
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  /* ---- keep date/time current every minute while auto === true --- */
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setDate(nowDate());
      setTime(nowTime());
    }, 60_000);
    return () => clearInterval(id);
  }, [auto]);

  /* stop auto when user edits date or time */
  function handleDate(e) { setDate(e.target.value); setAuto(false); }
  function handleTime(e) { setTime(e.target.value); setAuto(false); }

  /* ---- submit ---------------------------------------------------- */
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

    /* reset form & restart auto-updating */
    setAmt(60);
    setDate(nowDate());
    setTime(nowTime());
    setAuto(true);
  }

  /* ---- UI -------------------------------------------------------- */
  return (
    <section className="card" style={{ marginBottom:"1rem", maxWidth:"600px" }}>
      <h3 style={{ marginTop:0 }}>Add feed</h3>

      <form onSubmit={handleSubmit}>
        <table style={{ width:"100%", borderCollapse:"collapse", lineHeight:1.3 }}>
          <tbody>
            <tr>
              <td style={{ width:"40%", padding:".25rem .4rem" }}>
                <label htmlFor="amount"><strong>Amount&nbsp;(ml)</strong></label>
              </td>
              <td style={{ padding:".25rem .4rem" }}>
                <select
                  id="amount"
                  value={amount}
                  onChange={e => setAmt(Number(e.target.value))}
                  style={{ width:"100%" }}
                >
                  {AMOUNT_OPTS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </td>
            </tr>

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

            <tr>
              <td style={{ padding:".25rem .4rem" }}><strong>Date</strong></td>
              <td style={{ padding:".25rem .4rem" }}>
                <input
                  type="date"
                  value={date}
                  onChange={handleDate}
                  style={{ width:"100%" }}
                  required
                />
              </td>
            </tr>

            <tr>
              <td style={{ padding:".25rem .4rem" }}><strong>Time</strong></td>
              <td style={{ padding:".25rem .4rem" }}>
                <input
                  type="time"
                  value={time}
                  onChange={handleTime}
                  style={{ width:"100%" }}
                  required
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop:".6rem", textAlign:"right" }}>
          <button className="btn" disabled={saving}>
            {saving ? <span className="spinner"></span> : "Save"}
          </button>
          {saved && (
            <span className="msg-success" role="status" style={{ marginLeft:".6rem" }}>
              ✓ Saved
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
