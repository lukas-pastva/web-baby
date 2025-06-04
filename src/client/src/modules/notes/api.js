// src/client/src/modules/notes/api.js
async function json(p) {
    const r = await p;
    if (r.status === 204) return null;
    if (r.ok) return r.json();
    throw new Error(`HTTP ${r.status}`);
  }
  
  export default {
    /* keep the underlying verbs */
    listNotes : ()      => json(fetch("/api/notes")),
    insertNote: (p)     => json(fetch("/api/notes", {
                        method:"POST",
                        headers:{ "Content-Type":"application/json" },
                        body:JSON.stringify(p)})),
    updateNote: (id,p)  => json(fetch(`/api/notes/${id}`,{
                        method:"PUT",
                        headers:{ "Content-Type":"application/json" },
                        body:JSON.stringify(p)})),
    deleteNote: (id)    => json(fetch(`/api/notes/${id}`,{ method:"DELETE" })),
  };
  