import React from "react";

/**
 * Parent mood grid — replaces the old sleep-hours line chart.
 * Shows a face per day based on the baby's longest sleep stretch:
 *   < 3 h  → exhausted
 *   3-5 h  → tired
 *   5-7 h  → okay
 *   7+ h   → happy / well-rested
 */

function moodFor(hours) {
  if (hours == null) return { emoji: "➖", label: "no data", color: "#9ca3af" };
  if (hours < 3)     return { emoji: "😫", label: "exhausted", color: "#ef4444" };
  if (hours < 5)     return { emoji: "😴", label: "tired",     color: "#f59e0b" };
  if (hours < 7)     return { emoji: "🙂", label: "okay",      color: "#3b82f6" };
  return                     { emoji: "😊", label: "well-rested", color: "#22c55e" };
}

export default function NightGapChart({ labels = [], gaps = [] }) {
  return (
    <div className="card">
      <h3>Parent mood (based on longest baby sleep)</h3>

      {/* legend */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: ".8rem", marginBottom: ".75rem", opacity: 0.75 }}>
        <span>😫 &lt;3 h</span>
        <span>😴 3-5 h</span>
        <span>🙂 5-7 h</span>
        <span>😊 7+ h</span>
      </div>

      {/* grid of days */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(62px, 1fr))",
        gap: "6px",
      }}>
        {labels.map((lbl, i) => {
          const h = gaps[i];
          const { emoji, label, color } = moodFor(h);
          return (
            <div
              key={i}
              title={`${lbl}: ${h != null ? h.toFixed(1) + "h" : "no data"} — ${label}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "6px 2px",
                borderRadius: 6,
                background: color + "18",
                border: `1px solid ${color}40`,
                lineHeight: 1.2,
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{emoji}</span>
              <span style={{ fontSize: ".65rem", opacity: 0.7, marginTop: 2 }}>{lbl}</span>
              {h != null && (
                <span style={{ fontSize: ".65rem", fontWeight: 600, color }}>
                  {h.toFixed(1)}h
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
