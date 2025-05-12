import React from "react";

/**
 * Re-usable page header with centred nav.
 * Pass `showMeta={false}` if you don’t want the child’s name block.
 */
export default function Header({ showMeta = true }) {
  const p   = window.location.pathname;
  const rt  = window.__ENV__ || {};
  const child = `${rt.childName || ""} ${rt.childSurname || ""}`.trim();

  return (
    <header className="mod-header">
      <h1>{rt.appTitle || "Web-Baby"}</h1>

      {/* centred navigation */}
      <nav className="nav-center">
        <a href="/milking"      className={p === "/milking"          ? "active" : ""}>Today</a>
        <a href="/milking/all"  className={p.startsWith("/milking/all") ? "active" : ""}>All&nbsp;days</a>
        <a href="/weight"       className={p === "/weight"           ? "active" : ""}>Weight</a>
        <a href="/config"       className={p === "/config"           ? "active" : ""}>Config</a>
        <a href="/help"         className={p === "/help"             ? "active" : ""}>Help</a>
      </nav>

      {showMeta && child && (
        <div className="meta">
          <strong>{child}</strong>
        </div>
      )}
    </header>
  );
}
