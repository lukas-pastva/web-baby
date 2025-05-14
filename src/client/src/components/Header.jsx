import React from "react";
import { differenceInCalendarDays, startOfToday } from "date-fns";

/**
 * Re-usable page header with centred nav and baby’s age.
 *
 * Props
 * ─────
 * • showMeta — show / hide child-name + age block (default = true)
 */
export default function Header({ showMeta = true }) {
  const p      = window.location.pathname;
  const rt     = window.__ENV__ || {};
  const child  = `${rt.childName || ""} ${rt.childSurname || ""}`.trim();

  // compute age in days from birthTs (ISO string or timestamp)
  const birthTs = rt.birthTs ? new Date(rt.birthTs) : null;
  const ageText = birthTs
    ? `${differenceInCalendarDays(startOfToday(), birthTs)} days`
    : "";

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

      {/* child name + age */}
      {showMeta && (child || ageText) && (
        <div className="meta" style={{ textAlign:"right", lineHeight:1.2 }}>
          {child && <strong>{child}</strong>}
          {child && ageText && <br />}
          {ageText && <small>{ageText}</small>}
        </div>
      )}
    </header>
  );
}
