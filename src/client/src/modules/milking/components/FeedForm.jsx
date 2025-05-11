import React, { useState } from "react";
import { format, formatISO } from "date-fns";

/**
 * Form to add a single feed.
 * • DATE defaults to the day passed in (Today page = today).
 * • TIME always defaults to the current browser time.
 */
export default function FeedForm({ onSave, defaultDate }) {
  /* pick today’s date part from defaultDate, but time from “now” */
  const now              = new Date();
  const initialDate      = defaultDate ? new Date(defaultDate) : now;

  const [amount, setAmt] = useState("");
  const [type, setType]  = useState("BREAST_DIRECT");
  const [date, setDate]  = useState(format(initialDate, "yyyy-MM-dd"));
  const [time, setTime]  = useState(format(now, "HH:mm"));  // always now

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount) return;

    const fedAtIso = formatISO(new Date(`${date}T${time}`));
    await onSave({
      fedAt      : fedAtIso,
      amountMl   : Number(amount),
      feedingType: type,
    });

    /* quick reset for next entry */
    setAmt("");
    setTime(format(new Date(), "HH:mm"));
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
          <option value="BREAST_BOTTLE">🍼 Breast – bottle</option>
          <option value="FORMULA_PUMP">🍼⚙️ Formula – pump / tube</option>
          <option value="FORMULA_BOTTLE">🍼 Formula – bottle</option>
        </select>

        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />

        <button className="btn">Save</button>
      </div>
    </form>
  );
}
