import React from "react";

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "var(--bg-card)",
          padding: "1.2rem 1.5rem",
          borderRadius: 8,
          minWidth: 280,
          maxWidth: 480,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ margin: "0 0 1rem" }}>{message}</p>
        <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
          <button className="btn-light" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
