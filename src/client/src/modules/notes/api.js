// Unified API – works for both the new NotesPage and any legacy calls.
async function json(p) {
    const r = await p;
    if (r.status === 204) return null;
    if (r.ok)            return r.json();
    throw new Error(`HTTP ${r.status}`);
  }
  
  function post(url, payload) {
    return json(
      fetch(url, {
        method : "POST",
        headers: { "Content-Type":"application/json" },
        body   : JSON.stringify(payload),
      }),
    );
  }
  
  function put(url, payload) {
    return json(
      fetch(url, {
        method : "PUT",
        headers: { "Content-Type":"application/json" },
        body   : JSON.stringify(payload),
      }),
    );
  }
  
  /* ---------- canonical surface (used by NotesPage.jsx) ---------- */
  const api = {
    list   : ()        => json(fetch("/api/notes")),
    add    : (p)       => post("/api/notes", p),
    update : (id, p)   => put(`/api/notes/${id}`, p),
    remove : (id)      => json(fetch(`/api/notes/${id}`, { method:"DELETE" })),
  };
  
  /* ---------- backward-compat aliases (old Minimal Dashboard) ---- */
  api.listNotes   = api.list;
  api.insertNote  = api.add;
  api.updateNote  = api.update;
  api.deleteNote  = api.remove;
  
  export default api;
  