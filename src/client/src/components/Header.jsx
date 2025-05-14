import React, { useState } from "react";
import { differenceInCalendarDays, startOfToday } from "date-fns";
import { loadConfig, saveConfig } from "../config.js";

/**
 * Re-usable page header with centred nav, baby’s age
 * and a light/dark-mode toggle icon.
 *
 * Props
 * ─────
 * • showMeta — show / hide child-name + age block (default = true)
 */
export default function Header({ showMeta = true }) {
  const p     = window.location.pathname;
  const rt    = window.__ENV__ || {};
  const child = `${rt.childName || ""} ${rt.childSurname || ""}`.trim();

  /* ─── age calc (days) ──────────────────────────────────────────── */
  const birthTs = rt.birthTs ? new Date(rt.birthTs) : null;
  const ageText = birthTs
    ? `${differenceInCalendarDays(startOfToday(), birthTs)} days`
    : "";

  /* ─── mode toggle state ────────────────────────────────────────── */
  const { mode: storedMode = null } = loadConfig();
  const [mode, setMode] = useState(storedMode || "light");

  function toggleMode() {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    saveConfig({ ...loadConfig(), mode: next });
    document.documentElement.setAttribute("data-mode", next);
  }

  const modeIcon = mode === "light" ? "🌙" : "☀️";

  /* ─── UI ───────────────────────────────────────────────────────── */
  return (
    <header className="mod-header">
      <h1>{rt.appTitle || "Web-Baby"}</h1>

      {/* centred navigation */}
      <nav className="nav-center">
        <a href="/milking"      className={p === "/milking"             ? "active" : ""}>Today</a>
        <a href="/milking/all"  className={p.startsWith("/milking/all") ? "active" : ""}>All&nbsp;days</a>
        <a href="/weight"       className={p === "/weight"              ? "active" : ""}>Weight</a>
        <a href="/config"       className={p === "/config"              ? "active" : ""}>Config</a>
        <a href="/help"         className={p === "/help"                ? "active" : ""}>Help</a>
      </nav>

      {/* right-hand block – mode toggle + meta */}
      <div style={{ display:"flex", alignItems:"center", gap:".9rem" }}>
        {/* light / dark switch */}
        <button
          className="mode-toggle"
          onClick={toggleMode}
          aria-label="Toggle light/dark mode"
        >
          {modeIcon}
        </button>

        {/* child name + age */}
        {showMeta && (child || ageText) && (
          <div className="meta" style={{ textAlign:"right", lineHeight:1.2 }}>
            {child && <strong>{child}</strong>}
            {child && ageText && <br />}
            {ageText && <small>{ageText}</small>}
          </div>
        )}
      </div>
    </header>
  );
}
