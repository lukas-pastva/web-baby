import React, { useState } from "react";
import { format } from "date-fns";

export default function NoteForm({ onSave }) {
  const [date , setDate ] = useState(format(new Date(),"yyyy-MM-dd"));
  const [title, setTitle] = useState("");
  const [body , setBody ] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved , setSaved ] = useState(false);

  async function handle(e){
    e.preventDefault();
    if(!title || !body) return;
    setSaving(true);
    await onSave({ noteDate:date, title:title.trim(), body:body.trim() });
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false),2000);
    setTitle(""); setBody("");
  }

  return (
    <form onSubmit={handle} style={{ marginBottom:"1rem" }}>
      <h3>Add note</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
        <input  type="date"   value={date}  onChange={e=>setDate(e.target.value)} />
        <input  type="text"   placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        <textarea rows={3}    placeholder="Details…" value={body} onChange={e=>setBody(e.target.value)} required />
        <div style={{ textAlign:"right" }}>
          <button className="btn" disabled={saving}>
            {saving? <span className="spinner"></span> : "Save"}
          </button>
          {saved && <span className="msg-success">✓ Saved</span>}
        </div>
      </div>
    </form>
  );
}

