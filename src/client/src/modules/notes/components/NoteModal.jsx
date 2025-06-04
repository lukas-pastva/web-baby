import React from "react";

export default function NoteModal({ children, onClose }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.4)",
      display:"flex", justifyContent:"center", alignItems:"center",
      zIndex:1000,
    }}>
      <div style={{ background:"var(--bg-card)", padding:"1.2rem 1.5rem",
                    borderRadius:8, minWidth:280, maxWidth:480 }}>
        {children}
        <div style={{ textAlign:"right", marginTop:"1rem" }}>
          <button className="btn-light" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
