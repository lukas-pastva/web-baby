import React, { useState } from "react";
import { ALL_TYPES, loadConfig, saveConfig } from "../../config.js";

const path = () => window.location.pathname;

export default function ConfigPage() {
  const env     = window.__ENV__ || {};
  const initial = loadConfig();

  const [theme, setTheme]       = useState(initial.theme ?? env.theme ?? "boy");
  const [disabled, setDisabled] = useState(new Set(initial.disabledTypes));
  const [saved, setSaved]       = useState(false);

  /* toggle helpers */
  function toggleType(t) {
    const next = new Set(disabled);
    next.has(t) ? next.delete(t) : next.add(t);
    setDisabled(next);
  }

  function handleSave() {
    saveConfig({ theme: theme || null, disabledTypes: [...disabled] });
    /* live-apply theme */
    document.documentElement.setAttribute("data-theme", theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <header className="mod-header">
        <h1>{env.appTitle || "Web-Baby"}</h1>
        <nav>
          <a href="/milking"      className={path() === "/milking"      ? "active" : ""}>Today</a>
          <a href="/milking/all"  className={path().startsWith("/milking/all") ? "active" : ""}>All days</a>
          <a href="/weight"       className={path() === "/weight"       ? "active" : ""}>Weight</a>
          <a href="/help"         className={path() === "/help"         ? "active" : ""}>Help</a>
          <a href="/config"       className={path() === "/config"       ? "active" : ""}>Config</a>
        </nav>
      </header>

      <main>
        <section className="card config-wrap">
          <h2>Configuration (session-only)</h2>

          <h3>Theme</h3>
          <div style={{ display:"flex", gap:"1.5rem", justifyContent:"center", marginBottom:"1rem" }}>
            <label>
              <input type="radio" name="theme" value="boy"
                     checked={theme === "boy"} onChange={() => setTheme("boy")} />
              {" "}Boy / teal
            </label>
            <label>
              <input type="radio" name="theme" value="girl"
                     checked={theme === "girl"} onChange={() => setTheme("girl")} />
              {" "}Girl / pink
            </label>
          </div>

          <h3>Enabled milk types</h3>
          <ul className="config-types">
            {ALL_TYPES.map(t => (
              <li key={t}>
                <label>
                  <input type="checkbox"
                         checked={!disabled.has(t)}
                         onChange={() => toggleType(t)} />{" "}
                  {t.replace(/_/g, " ")}
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
