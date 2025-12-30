import React, { useState, useEffect } from "react";
import Header from "../../../components/Header.jsx";
import api from "../api.js";
import { format } from "date-fns";

const TEETH = [
  { code: "UR5", name: "Upper Right 2nd Molar", row: "upper", side: "right", pos: 5 },
  { code: "UR4", name: "Upper Right 1st Molar", row: "upper", side: "right", pos: 4 },
  { code: "UR3", name: "Upper Right Canine", row: "upper", side: "right", pos: 3 },
  { code: "UR2", name: "Upper Right Lateral Incisor", row: "upper", side: "right", pos: 2 },
  { code: "UR1", name: "Upper Right Central Incisor", row: "upper", side: "right", pos: 1 },
  { code: "UL1", name: "Upper Left Central Incisor", row: "upper", side: "left", pos: 1 },
  { code: "UL2", name: "Upper Left Lateral Incisor", row: "upper", side: "left", pos: 2 },
  { code: "UL3", name: "Upper Left Canine", row: "upper", side: "left", pos: 3 },
  { code: "UL4", name: "Upper Left 1st Molar", row: "upper", side: "left", pos: 4 },
  { code: "UL5", name: "Upper Left 2nd Molar", row: "upper", side: "left", pos: 5 },
  { code: "LR5", name: "Lower Right 2nd Molar", row: "lower", side: "right", pos: 5 },
  { code: "LR4", name: "Lower Right 1st Molar", row: "lower", side: "right", pos: 4 },
  { code: "LR3", name: "Lower Right Canine", row: "lower", side: "right", pos: 3 },
  { code: "LR2", name: "Lower Right Lateral Incisor", row: "lower", side: "right", pos: 2 },
  { code: "LR1", name: "Lower Right Central Incisor", row: "lower", side: "right", pos: 1 },
  { code: "LL1", name: "Lower Left Central Incisor", row: "lower", side: "left", pos: 1 },
  { code: "LL2", name: "Lower Left Lateral Incisor", row: "lower", side: "left", pos: 2 },
  { code: "LL3", name: "Lower Left Canine", row: "lower", side: "left", pos: 3 },
  { code: "LL4", name: "Lower Left 1st Molar", row: "lower", side: "left", pos: 4 },
  { code: "LL5", name: "Lower Left 2nd Molar", row: "lower", side: "left", pos: 5 },
];

const TOOTH_WIDTHS = { 1: 28, 2: 24, 3: 22, 4: 32, 5: 32 };
const TOOTH_HEIGHTS = { 1: 32, 2: 30, 3: 34, 4: 28, 5: 28 };

export default function TeethingDashboard() {
  const [teethData, setTeethData] = useState({});
  const [selected, setSelected] = useState(null);
  const [dateInput, setDateInput] = useState(format(new Date(), "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    reload();
  }, []);

  async function reload() {
    const list = await api.listTeeth();
    const map = {};
    list.forEach((t) => {
      map[t.toothCode] = t;
    });
    setTeethData(map);
  }

  function getToothColor(code) {
    const tooth = teethData[code];
    if (tooth && tooth.appearedAt) return "var(--accent)";
    return "#e0e0e0";
  }

  function handleToothClick(tooth) {
    setSelected(tooth);
    const existing = teethData[tooth.code];
    if (existing && existing.appearedAt) {
      setDateInput(existing.appearedAt);
    } else {
      setDateInput(format(new Date(), "yyyy-MM-dd"));
    }
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    await api.upsertTooth({ toothCode: selected.code, appearedAt: dateInput });
    await reload();
    setSaving(false);
    setSelected(null);
  }

  async function handleClear() {
    if (!selected) return;
    const existing = teethData[selected.code];
    if (existing) {
      setSaving(true);
      await api.clearTooth(selected.code);
      await reload();
      setSaving(false);
    }
    setSelected(null);
  }

  function renderTooth(tooth, x, y) {
    const w = TOOTH_WIDTHS[tooth.pos];
    const h = TOOTH_HEIGHTS[tooth.pos];
    const appeared = teethData[tooth.code]?.appearedAt;

    return (
      <g
        key={tooth.code}
        onClick={() => handleToothClick(tooth)}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          rx={tooth.pos <= 2 ? 4 : tooth.pos === 3 ? 6 : 3}
          fill={getToothColor(tooth.code)}
          stroke={selected?.code === tooth.code ? "#333" : "#999"}
          strokeWidth={selected?.code === tooth.code ? 2 : 1}
        />
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          fontSize="10"
          fill={appeared ? "#fff" : "#666"}
          pointerEvents="none"
        >
          {tooth.pos}
        </text>
      </g>
    );
  }

  function renderMouth() {
    const width = 400;
    const height = 260;
    const centerX = width / 2;
    const gapX = 6;
    const upperY = 60;
    const lowerY = 200;

    const upperTeeth = TEETH.filter((t) => t.row === "upper");
    const lowerTeeth = TEETH.filter((t) => t.row === "lower");

    const getX = (side, pos) => {
      let offset = 0;
      for (let i = 1; i < pos; i++) {
        offset += TOOTH_WIDTHS[i] + gapX;
      }
      offset += TOOTH_WIDTHS[pos] / 2;
      return side === "right" ? centerX - gapX - offset : centerX + gapX + offset;
    };

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: 400, width: "100%" }}>
        {/* Mouth outline */}
        <ellipse
          cx={centerX}
          cy={height / 2}
          rx={180}
          ry={110}
          fill="#ffcccc"
          stroke="#cc9999"
          strokeWidth={3}
        />
        {/* Tongue */}
        <ellipse
          cx={centerX}
          cy={height / 2 + 10}
          rx={80}
          ry={50}
          fill="#ff9999"
        />
        {/* Upper gum */}
        <ellipse
          cx={centerX}
          cy={upperY + 5}
          rx={160}
          ry={35}
          fill="#ffb3b3"
        />
        {/* Lower gum */}
        <ellipse
          cx={centerX}
          cy={lowerY - 5}
          rx={160}
          ry={35}
          fill="#ffb3b3"
        />
        {/* Upper teeth */}
        {upperTeeth.map((t) => renderTooth(t, getX(t.side, t.pos), upperY))}
        {/* Lower teeth */}
        {lowerTeeth.map((t) => renderTooth(t, getX(t.side, t.pos), lowerY))}
        {/* Labels */}
        <text x={centerX} y={20} textAnchor="middle" fontSize="12" fill="#666">
          Upper Jaw
        </text>
        <text x={centerX} y={height - 10} textAnchor="middle" fontSize="12" fill="#666">
          Lower Jaw
        </text>
        <text x={30} y={height / 2} textAnchor="middle" fontSize="11" fill="#666">
          Right
        </text>
        <text x={width - 30} y={height / 2} textAnchor="middle" fontSize="11" fill="#666">
          Left
        </text>
      </svg>
    );
  }

  const appearedCount = Object.values(teethData).filter((t) => t.appearedAt).length;

  return (
    <>
      <Header />
      <main className="card" style={{ maxWidth: 500, margin: "20px auto", padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Teething Tracker</h2>
        <p style={{ color: "#666", marginBottom: 20 }}>
          {appearedCount} of 20 teeth have appeared. Click a tooth to record when it appeared.
        </p>

        {renderMouth()}

        {selected && (
          <div
            style={{
              marginTop: 20,
              padding: 15,
              background: "var(--bg-page)",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          >
            <h4 style={{ margin: "0 0 10px" }}>{selected.name}</h4>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <label>
                Date appeared:
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  style={{ marginLeft: 8, padding: "4px 8px" }}
                />
              </label>
              <button className="btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              {teethData[selected.code]?.appearedAt && (
                <button className="btn-light" onClick={handleClear} disabled={saving}>
                  Clear
                </button>
              )}
              <button
                className="btn-light"
                onClick={() => setSelected(null)}
                style={{ marginLeft: "auto" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ marginTop: 20, display: "flex", gap: 20, justifyContent: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 16,
                height: 16,
                background: "var(--accent)",
                borderRadius: 3,
                display: "inline-block",
              }}
            />
            Appeared
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 16,
                height: 16,
                background: "#e0e0e0",
                borderRadius: 3,
                display: "inline-block",
              }}
            />
            Not yet
          </span>
        </div>

        {/* Teeth list */}
        <details style={{ marginTop: 20 }}>
          <summary style={{ cursor: "pointer", color: "var(--accent)" }}>
            View all teeth details
          </summary>
          <table style={{ width: "100%", marginTop: 10, fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Tooth</th>
                <th style={{ textAlign: "left" }}>Date Appeared</th>
              </tr>
            </thead>
            <tbody>
              {TEETH.map((t) => (
                <tr
                  key={t.code}
                  onClick={() => handleToothClick(t)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{t.name}</td>
                  <td>
                    {teethData[t.code]?.appearedAt
                      ? format(new Date(teethData[t.code].appearedAt), "MMM d, yyyy")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </main>
    </>
  );
}
