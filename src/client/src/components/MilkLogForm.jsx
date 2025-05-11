import React, { useState } from "react";
import { formatISO } from "date-fns";

export default function MilkLogForm({ onSave, defaultDate }) {
  const [amount, setAmount] = useState("");
  const [type,   setType]   = useState("BREAST_DIRECT");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount) return;
    await onSave({
      fedAt      : formatISO(new Date()),
      amountMl   : Number(amount),
      feedingType: type,
    });
    setAmount("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add feed</h3>
      <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
        <input type="number" placeholder="ml" value={amount} onChange={e=>setAmount(e.target.value)} style={{width:100}}/>
        <select value={type} onChange={e=>setType(e.target.value)}>
          <option value="BREAST_DIRECT">Breast – direct</option>
          <option value="BREAST_BOTTLE">Breast – bottle</option>
          <option value="FORMULA_PUMP">Formula – pump / tube</option>
          <option value="FORMULA_BOTTLE">Formula – bottle</option>
        </select>
        <button className="btn">Save</button>
      </div>
    </form>
  );
}
