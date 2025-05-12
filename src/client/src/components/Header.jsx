import React from "react";

/**
 * Re-usable page header with centred nav.
 *
 * Props
 * ─────
 * • showMeta ─ show / hide child-name block (default = true)
 * • extra    ─ optional extra line (e.g. “23 days”) under the name
 */
export default function Header({ showMeta = true, extra = "" }) {
  const p   = window.location.pathname;
  const rt  = window.__ENV__ || {};
  const child = `${rt.childName || ""} ${rt.childSurname || ""}`.trim();

  return (
    <header className="mod-header">
      <h1>{rt.appTitle || "Web-Baby"}</h1>

      {/* ─── centred navigation ─────────────────────────────────── */}
      <nav className="nav-center">
        <a href="/milking"      className={p === "/milking"              ? "active" : ""}>Today</a>
        <a href="/milking/all"  className={p.startsWith("/milking/all")  ? "active" : ""}>All&nbsp;days</a>
        <a href="/weight"       className={p === "/weight"               ? "active" : ""}>Weight</a>
        <a href="/config"       className={p === "/config"               ? "active" : ""}>Config</a>
        <a href="/help"         className={p === "/help"                 ? "active" : ""}>Help</a>
      </nav>

      {/* ─── meta block ─────────────────────────────────────────── */}
      {showMeta && child && (
        <div className="meta" style={{ textAlign:"right", lineHeight:1.2 }}>
          <strong>{child}</strong>
          {extra && <><br/><small>{extra}</small></>}
        </div>
      )}
    </header>
  );
}
