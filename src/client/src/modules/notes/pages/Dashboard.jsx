import React, { useEffect, useState } from "react";
import Header      from "../../../components/Header.jsx";
import api         from "../api.js";
import NoteForm    from "../components/NoteForm.jsx";
import NoteTable   from "../components/NoteTable.jsx";

export default function NotesDashboard() {
  const [notes, setNotes] = useState([]);
  const [err  , setErr  ] = useState("");

  const load = ()=> api.listNotes().then(setNotes).catch(e=>setErr(e.message));
  useEffect(load,[]);

  const handleSave   = p      => api.insertNote(p)  .then(load).catch(e=>setErr(e.message));
  const handleDelete = id     => api.deleteNote(id) .then(load).catch(e=>setErr(e.message));

  return (
    <>
      <Header />

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        <section className="card" style={{ maxWidth:600 }}>
          <NoteForm  onSave={handleSave} />
          <NoteTable rows={notes} onDelete={handleDelete} />
        </section>
      </main>
    </>
  );
}
