import React from "react";
import { differenceInCalendarDays, startOfToday } from "date-fns";
import { loadConfig } from "../config.js";

/* Single place that shows the constant title */
const TITLE = "Web-Baby";

export default function Header({ showMeta = true }) {
  const p = window.location.pathname;

  const {
    childName = "",
    childSurname = "",
    birthTs,
  } = loadConfig();

  /* age text */
  const birthDate = birthTs ? new Date(birthTs) : null;
  const ageText = birthDate
    ? `${differenceInCalendarDays(startOfToday(), birthDate)} days`
    : "";

  const child = `${childName} ${childSurname}`.trim();

  return (
    <header className="mod-header">
      <h1>{TITLE}</h1>

      <nav className="nav-center">
        <a href="/milking"      className={p === "/milking"             ? "active" : ""}>Today</a>
        <a href="/milking/all"  className={p.startsWith("/milking/all") ? "active" : ""}>All&nbsp;days</a>
        <a href="/weight"       className={p === "/weight"              ? "active" : ""}>Weight</a>
        <a href="/config"       className={p === "/config"              ? "active" : ""}>Config</a>
        <a href="/help"         className={p === "/help"                ? "active" : ""}>Help</a>
      </nav>

      {showMeta && (child || ageText) && (
        <div className="meta" style={{ textAlign: "right", lineHeight: 1.2 }}>
          {child && <strong>{child}</strong>}
          {child && ageText && <br />}
          {ageText && <small>{ageText}</small>}
        </div>
      )}
    </header>
  );
}
