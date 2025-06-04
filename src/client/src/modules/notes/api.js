async function json(p) {
    const r = await p;
    if (r.status === 204) return null;
    if (r.ok) return r.json();
    throw new Error(`HTTP ${r.status} – ${await r.text()}`);
  }
  
  export default {
    listNotes(from, to) {
      const q = [];
      if (from) q.push(`from=${from}`);
      if (to)   q.push(`to=${to}`);
      const qs = q.length ? "?" + q.join("&") : "";
      return json(fetch(`/api/notes${qs}`));
    },
    insertNote(p)  { return json(fetch("/api/notes",        { method:"POST", body:JSON.stringify(p),        headers:{ "Content-Type":"application/json" } })); },
    updateNote(id,p){ return json(fetch(`/api/notes/${id}`, { method:"PUT",  body:JSON.stringify(p),        headers:{ "Content-Type":"application/json" } })); },
    deleteNote(id) { return json(fetch(`/api/notes/${id}`,  { method:"DELETE" })); },
  };
  