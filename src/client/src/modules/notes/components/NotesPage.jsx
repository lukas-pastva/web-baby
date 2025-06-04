import React,{useEffect,useState} from "react";
import { formatISO, format } from "date-fns";
import Header  from "../../../components/Header.jsx";
import api     from "../api.js";
import NoteModal from "./NoteModal.jsx";

function NoteForm({ onSave }) {
  const [date,setDate]   = useState(format(new Date(),"yyyy-MM-dd"));
  const [title,setT]     = useState("");
  const [text,setTxt]    = useState("");
  const [saving,setSav]  = useState(false);

  const submit = async e =>{
    e.preventDefault(); if(!title.trim()) return;
    setSav(true);
    await onSave({ noteDate:date, title, text });
    setSav(false); setT(""); setTxt("");
  };

  return (
    <form onSubmit={submit} style={{marginBottom:"1.2rem"}}>
      <h3>Add note</h3>
      <div style={{display:"flex",gap:".6rem",flexWrap:"wrap"}}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} required/>
        <input type="text" placeholder="Title" value={title} onChange={e=>setT(e.target.value)} required style={{flex:1,minWidth:160}}/>
        <button className="btn" disabled={saving}>Save</button>
      </div>
      <textarea
        placeholder="Details…"
        value={text}
        onChange={e=>setTxt(e.target.value)}
        rows={3}
        style={{width:"100%",marginTop:".6rem"}}
      />
    </form>
  );
}

export default function NotesPage(){
  const [rows,setRows]   = useState([]);
  const [err,setErr]     = useState("");
  const [modal,setModal] = useState(null);   // {mode:"view"|"edit"|"del", row}

  const load = ()=>api.list().then(setRows).catch(e=>setErr(e.message));
  useEffect(load,[]);

  /* CRUD helpers */
  const add    = p        => api.add(p)     .then(load).catch(e=>setErr(e.message));
  const update = (id,p)   => api.update(id,p).then(load).catch(e=>setErr(e.message));
  const remove = id       => api.remove(id) .then(load).catch(e=>setErr(e.message));

  /* ----- table ---- */
  return (
    <>
      <Header/>
      {err && <p style={{color:"#c00",padding:"0 1rem"}}>{err}</p>}

      <main>
        <section className="card" style={{maxWidth:700}}>
          <NoteForm onSave={add}/>

          <h3>Notes</h3>
          {rows.length===0 && <p>No notes yet.</p>}
          {rows.length>0 &&(
            <table>
              <thead><tr><th>Date</th><th>Title</th><th>Details…</th><th></th></tr></thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.id}>
                    <td>{r.noteDate}</td>
                    <td>{r.title}</td>
                    <td style={{maxWidth:260,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {r.text}
                    </td>
                    <td style={{whiteSpace:"nowrap"}}>
                      <button className="btn-light" onClick={()=>setModal({mode:"view",row:r})}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* ---------- modal ---------- */}
      {modal && (
        <NoteModal onClose={()=>setModal(null)}>
          {modal.mode==="view" && (
            <>
              <h3 style={{marginTop:0}}>{modal.row.title}</h3>
              <p><small>{modal.row.noteDate}</small></p>
              <p style={{whiteSpace:"pre-wrap"}}>{modal.row.text || <em>(no details)</em>}</p>

              <div style={{textAlign:"right",marginTop:"1rem"}}>
                <button className="btn-light" style={{marginRight:".6rem"}}
                        onClick={()=>setModal({mode:"edit",row:modal.row})}>Edit</button>
                <button className="btn-light"
                        onClick={()=>setModal({mode:"del",row:modal.row})}>Delete</button>
              </div>
            </>
          )}

          {modal.mode==="edit" && (
            <EditForm row={modal.row} onSave={(p)=>update(modal.row.id,p).then(()=>setModal(null))}/>
          )}

          {modal.mode==="del" && (
            <>
              <h3 style={{marginTop:0}}>Delete this note?</h3>
              <p><strong>{modal.row.title}</strong></p>
              <div style={{textAlign:"right",marginTop:"1rem"}}>
                <button className="btn-light" style={{marginRight:".6rem"}}
                        onClick={()=>setModal(null)}>Cancel</button>
                <button className="btn"
                        onClick={()=>remove(modal.row.id).then(()=>setModal(null))}>Delete</button>
              </div>
            </>
          )}
        </NoteModal>
      )}
    </>
  );
}

/* small inline form used inside modal */
function EditForm({ row, onSave }){
  const [title,setT]=useState(row.title);
  const [text,setTxt]=useState(row.text);
  const [date,setD]=useState(row.noteDate);
  const submit=e=>{
    e.preventDefault();
    onSave({ noteDate:date, title, text });
  };
  return(
    <form onSubmit={submit}>
      <h3 style={{marginTop:0}}>Edit note</h3>
      <input type="date" value={date} onChange={e=>setD(e.target.value)} required/>
      <input type="text" value={title} onChange={e=>setT(e.target.value)} required style={{width:"100%",marginTop:".6rem"}}/>
      <textarea rows={4} value={text} onChange={e=>setTxt(e.target.value)} style={{width:"100%",marginTop:".6rem"}}/>
      <div style={{textAlign:"right",marginTop:"1rem"}}>
        <button className="btn">Save</button>
      </div>
    </form>
  );
}
