import React, { useState } from "react";
import { format, formatISO } from "date-fns";

export default function FeedForm({ onSave, defaultDate }) {
  const now              = defaultDate ? new Date(defaultDate) : new Date();
  const [amount, setAmt] = useState("");
  const [type, setType]  = useState("BREAST_DIRECT");
  const [date, setDate]  = useState(format(now, "yyyy-MM-dd"));
  const [time, setTime]  = useState(format(now, "HH:mm"));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount) return;

    const fedAtIso = formatISO(new Date(`${date}T${time}`));
    await onSave({
      fedAt      : fedAtIso,
      amountMl   : Number(amount),
      feedingType: type,
    });

    /* reset amount + time to *current moment* for quick next entry */
    setAmt("");
    setTime(format(new Date(), "HH:mm"));
  }


  /* --- render ---------------------------------------------------------- */
  return (
    <form onSubmit={handleSubmit}>
      <h3>Add feed</h3>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap:"wrap" }}>
        {/* amount -------------------------------------------------------- */}
        <input
          type="number"
          placeholder="ml"
          value={amount}
          onChange={(e) => setAmt(e.target.value)}
          style={{ width: 100 }}
          min={0}
          required
        />

        {/* feed type ----------------------------------------------------- */}
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="BREAST_DIRECT">Breast – direct</option>
          <option value="BREAST_BOTTLE">Breast – bottle</option>
          <option value="FORMULA_PUMP">Formula – pump / tube</option>
          <option value="FORMULA_BOTTLE">Formula – bottle</option>
        </select>

        {/* date + time --------------------------------------------------- */}
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        {/* save ---------------------------------------------------------- */}
        <button className="btn">Save</button>
      </div>
    </form>
  );
}
