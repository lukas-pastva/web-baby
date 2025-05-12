import React from "react";

const path = () => window.location.pathname;

export default function HelpPage() {
  const rt = window.__ENV__ || {};
  const childName    = rt.childName   || "";
  const childSurname = rt.childSurname|| "";

  return (
    <>
      <header className="mod-header">
        <h1>{rt.appTitle || "Web-Baby"}</h1>
        <nav>
          <a href="/milking"      className={path() === "/milking"      ? "active" : ""}>Today</a>
          <a href="/milking/all"  className={path().startsWith("/milking/all") ? "active" : ""}>All days</a>
          <a href="/weight"       className={path() === "/weight"       ? "active" : ""}>Weight</a>
          <a href="/help"         className={path() === "/help"         ? "active" : ""}>Help</a>
          <a href="/config"       className={path() === "/config"       ? "active" : ""}>Config</a>
        </nav>
        <div className="meta">
          <strong>{childName} {childSurname}</strong>
        </div>
      </header>

      <main>
        <div className="card">
          <h2>Help</h2>

          <h3>What is Web-Baby?</h3>
          <p>
            A lightweight tracker that lets parents log every milk feed and weight
            measurement, see daily&nbsp;intake versus recommendations and follow progress
            over time – all running offline in your browser or self-hosted with Docker.
          </p>

          <h3>Pages</h3>
          <ul>
            <li><strong>Today</strong> – add feeds; stacked bar shows <em>per type</em> and a total.</li>
            <li><strong>All&nbsp;days</strong> – timeline from birth to today, stacked by type.</li>
            <li><strong>Weight</strong> – chart &amp; table for daily weight.</li>
            <li><strong>Config</strong> – change theme or hide feed types (session-only).</li>
            <li><strong>Help</strong> – you’re here 🎉</li>
          </ul>

          <h3>Shortcuts</h3>
          <ul>
            <li><kbd>T</kbd> – jump to Today</li>
            <li><kbd>A</kbd> – jump to All&nbsp;days</li>
            <li><kbd>C</kbd> – open Config</li>
          </ul>

          <p style={{ marginTop: "1.2rem" }}>
            Issues or ideas?&nbsp;Open an issue on GitHub – feedback is welcome!
          </p>
        </div>
      </main>
    </>
  );
}
