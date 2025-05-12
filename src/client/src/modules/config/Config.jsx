import React, { useState } from "react";
import Header                           from "../../components/Header.jsx";
import { ALL_TYPES, loadConfig, saveConfig } from "../../config.js";

/* icons for nicer display */
const ICONS = {
  BREAST_DIRECT : "🤱",
  BREAST_BOTTLE : "🤱🍼",
  FORMULA_PUMP  : "🍼⚙️",
  FORMULA_BOTTLE: "🍼",
};

export default function ConfigPage() {
  const env      = window.__ENV__ || {};
  const initial  = loadConfig();

  const [theme,    setTheme]    = useState(initial.theme ?? env.theme ?? "boy");
  const [disabled, setDisabled] = useState(new Set(initial.disabledTypes));
  const [saved,    setSaved]    = useState(false);

  const toggleType = (t) =>
    setDisabled(d => {
      const next = new Set(d);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const handleSave = () => {
    saveConfig({ theme: theme || null, disabledTypes: [...disabled] });
    document.documentElement.setAttribute("data-theme", theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {/* hide meta so the nav sits perfectly centred */}
      <Header showMeta={false} />

      <main>
        <section className="card config-wrap">
          <h2>Configuration (session-only)</h2>

          <h3>Theme</h3>
          <div style={{ display:"flex", gap:"1.5rem", justifyContent:"center", marginBottom:"1rem" }}>
            <label>
              <input type="radio" name="theme" value="boy"
                     checked={theme==="boy"} onChange={()=>setTheme("boy")} /> Teal
            </label>
            <label>
              <input type="radio" name="theme" value="girl"
                     checked={theme==="girl"} onChange={()=>setTheme("girl")} /> Pink
            </label>
          </div>

          <h3>Enabled feed types</h3>
          <ul className="config-types">
            {ALL_TYPES.map(t => (
              <li key={t}>
                <label>
                  <input type="checkbox"
                         checked={!disabled.has(t)}
                         onChange={() => toggleType(t)} />
                  &nbsp;{ICONS[t]} {t.replace(/_/g, " ")}
                </label>
              </li>
            ))}
          </ul>

          <button className="btn" onClick={handleSave}>Save</button>
          {saved && <span className="msg-success">✓ Saved</span>}
        </section>
      </main>
    </>
  );
}
