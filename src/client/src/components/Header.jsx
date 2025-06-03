import React from "react";
import { differenceInCalendarDays, startOfToday } from "date-fns";
import { loadConfig } from "../config.js";

/**
 * Re-usable page header with centred nav and (optional) baby meta.
 *
 * Props
 * ─────
 * • showMeta — show / hide child-name + age block (default = true)
 */
export default function Header({ showMeta = true }) {
  const p = window.location.pathname;

  const {
    childName = "",
    childSurname = "",
    birthTs,
    appTitle: title = "Web-Baby",
  } = loadConfig();

  /* baby’s age in days */
  const birthDate = birthTs ? new Date(birthTs) : null;
  const ageText =
    birthDate ? `${differenceInCalendarDays(startOfToday(), birthDate)} days` : "";

  const child = `${childName} ${childSurname}`.trim();

  /* ─────────────────────────── UI */
  return (
    <header className="mod-header">
      {/* left – app title */}
      <h1>{title}</h1>

      {/* centre – navigation */}
      <nav className="nav-center">
        <a href="/milking"      className={p === "/milking"             ? "active" : ""}>Today</a>
        <a href="/milking/all"  className={p.startsWith("/milking/all") ? "active" : ""}>All&nbsp;days</a>
        <a href="/weight"       className={p === "/weight"              ? "active" : ""}>Weight</a>
        <a href="/config"       className={p === "/config"              ? "active" : ""}>Config</a>
        <a href="/help"         className={p === "/help"                ? "active" : ""}>Help</a>
      </nav>

      {/* right – baby meta (name + age) */}
      {showMeta && (child || ageText) && (
        <div
          className="meta"
          style={{ textAlign: "right", lineHeight: 1.2 }}
        >
          {child && <strong>{child}</strong>}
          {child && ageText && <br />}
          {ageText && <small>{ageText}</small>}
        </div>
      )}
    </header>
  );
}
