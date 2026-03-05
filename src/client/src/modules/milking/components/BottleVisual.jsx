import React from "react";
import { accentColor } from "../../../theme.js";

/**
 * A bottle SVG whose physical size scales with ml eaten.
 * Purely visual — shows how much the baby ate today.
 * The bottle grows from tiny (0 ml) to full-size (~800 ml).
 */
export default function BottleVisual({ eatenMl = 0 }) {
  const accent = accentColor();

  /* Scale: 0 ml → smallest bottle, ~800 ml → max size.
     Using 800 as a soft cap so the bottle grows visibly at common amounts. */
  const ratio = Math.max(0.15, Math.min(1, eatenMl / 800));

  const maxH   = 140;
  const height = Math.round(maxH * ratio);
  const width  = Math.round(height * 0.45);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 60 140"
        style={{ transition: "width .4s ease, height .4s ease", filter: `drop-shadow(0 2px 6px ${accent}44)` }}
      >
        {/* nipple */}
        <path
          d="M20 18 Q20 4 30 2 Q40 4 40 18"
          fill={accent}
          opacity={0.85}
        />
        {/* body */}
        <rect
          x={8} y={18} rx={8} ry={8}
          width={44} height={115}
          fill={accent}
          opacity={0.75}
        />
        {/* ml lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line
            key={f}
            x1={14} y1={18 + 115 * (1 - f)}
            x2={28} y2={18 + 115 * (1 - f)}
            stroke="#fff"
            strokeWidth={1.5}
            opacity={0.5}
          />
        ))}
        {/* shine highlight */}
        <rect
          x={14} y={24} rx={3} ry={3}
          width={6} height={40}
          fill="#fff"
          opacity={0.25}
        />
      </svg>

      <span style={{ fontSize: "1.1rem", fontWeight: 600, color: accent }}>
        {eatenMl} ml
      </span>
    </div>
  );
}
