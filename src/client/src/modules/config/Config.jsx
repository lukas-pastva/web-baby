import React, { useState } from "react";
import Header from "../../components/Header.jsx";
import { loadConfig, saveConfig } from "../../config.js";
import { ORDER as ALL_TYPES, ICONS } from "../../feedTypes.js";

export default function ConfigPage() {
  const initial = loadConfig();

  /* palette + mode -------------------------------------------------- */
  const [theme, setTheme] = useState(initial.theme ?? "boy");
  const [mode,  setMode ] = useState(initial.mode  ?? "auto");

  /* other toggles --------------------------------------------------- */
  const [disabled,    setDisabled] = useState(new Set(initial.disabledTypes));
  const [birthWeight, setWeight]   = useState(
    initial.birthWeightGrams != null ? String(initial.birthWeightGrams) : "",
  );

  /* birth date / time ---------------------------------------------- */
  const initDate = initial.birthTs ? new Date(initial.birthTs) : null;
  const [birthDate, setBirthDate] = useState(
    initDate ? initDate.toISOString().slice(0, 10) : "",
  );
  const [birthTime, setBirthTime] = useState(
    initDate ? initDate.toISOString().slice(11, 16) : "",
  );

  const [saved, setSaved] = useState(false);

  /* utilities ------------------------------------------------------- */
  const toggleType = (t) =>
    setDisabled((d) => {
      const n = new Set(d);
      n.has(t) ? n.delete(t) : n.add(t);
      return n;
    });

  const handleSave = () => {
    const birthTs =
      birthDate && birthTime
        ? `${birthDate}T${birthTime}:00Z`
        : birthDate
        ? `${birthDate}T00:00:00Z`
        : null;

    saveConfig({
      theme,
      mode,
      disabledTypes   : [...disabled],
      birthTs,
      birthWeightGrams: birthWeight ? Number(birthWeight) : null,
    });

    document.documentElement.setAttribute("data-theme", theme);
    if (mode !== "auto") {
      document.documentElement.setAttribute("data-mode", mode);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ─────────────────────────── UI ─────────────────────────── */
  return (
    <>
      <Header />

      <main>
        <section className="card config-wrap">
          <h2>Configuration</h2>

          {/* birth date & time */}
          <h3>Baby birth date &amp; time</h3>
          <div style={{
            display:"flex", gap:"1rem", flexWrap:"wrap",
            justifyContent:"center", marginBottom:"1rem",
          }}>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
            />
          </div>

          {/* birth weight */}
          <h3>Baby birth weight&nbsp;(grams)</h3>
          <input
            type="number"
            min={0}
            placeholder="e.g. 3500"
            value={birthWeight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />

          {/* accent theme */}
          <h3>Theme (accent)</h3>
          <div style={{
            display:"flex", gap:"1.5rem",
            justifyContent:"center", marginBottom:"1rem",
          }}>
            <label>
              <input
                type="radio"
                name="theme"
                value="boy"
                checked={theme === "boy"}
                onChange={() => setTheme("boy")}
              />{" "}
              Teal
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                value="girl"
                checked={theme === "girl"}
                onChange={() => setTheme("girl")}
              />{" "}
              Pink
            </label>
          </div>

          {/* colour-scheme mode */}
          <h3>Mode (colour-scheme)</h3>
          <div style={{
            display:"flex", gap:"1.5rem",
            justifyContent:"center", marginBottom:"1rem",
          }}>
            <label>
              <input
                type="radio"
                name="mode"
                value="light"
                checked={mode === "light"}
                onChange={() => setMode("light")}
              />{" "}
              Light
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="dark"
                checked={mode === "dark"}
                onChange={() => setMode("dark")}
              />{" "}
              Dark
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="auto"
                checked={mode === "auto"}
                onChange={() => setMode("auto")}
              />{" "}
              Auto
            </label>
          </div>

          {/* enabled feed-types */}
          <h3>Enabled feed types</h3>
          <ul className="config-types">
            {ALL_TYPES.map((t) => (
              <li key={t}>
                <label>
                  <input
                    type="checkbox"
                    checked={!disabled.has(t)}
                    onChange={() => toggleType(t)}
                  />{" "}
                  {ICONS[t]} {t.replace(/_/g, " ")}
                </label>
              </li>
            ))}
          </ul>

          <button className="btn" onClick={handleSave}>
            Save
          </button>
          {saved && <span className="msg-success">✓ Saved</span>}
        </section>
      </main>
    </>
  );
}
