import React from "react";
import { format } from "date-fns";

export default function NoteTable({ rows=[], onDelete }) {
  if(rows.length===0) return <p>No notes yet.</p>;

  return (
    <table>
      <thead>
        <tr><th>Date</th><th>Title</th><th></th></tr>
      </thead>
      <tbody>
        {rows.map(n=>(
          <tr key={n.id}>
            <td>{format(new Date(n.noteDate),"d LLL yyyy")}</td>
            <td>{n.title}</td>
            <td style={{ whiteSpace:"nowrap" }}>
              {onDelete && (
                <button className="btn-light" onClick={()=>onDelete(n.id)}>×</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
