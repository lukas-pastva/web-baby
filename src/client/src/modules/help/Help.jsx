import React from "react";

/* simple static help – re-uses the global header & full-width layout */
export default function HelpPage() {
  const rt = window.__ENV__ || {};
  const childName    = rt.childName   || "";
  const childSurname = rt.childSurname|| "";

  return (
    <>
      <header className="mod-header">
        <h1>Web-Baby</h1>

        <nav>
          <a href="/milking">Today</a>
          <a href="/milking/all">All days</a>
          <a href="/help">Help</a>
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
            A lightweight tracker that lets parents log every milk feed and see
            whether the baby is above or below common recommendations.
          </p>

          <h3>Pages</h3>
          <ul>
            <li><strong>Today</strong> – add feeds, live chart.</li>
            <li><strong>All days</strong> – timeline from birth to today.</li>
            <li><strong>Help</strong> – this page.</li>
          </ul>

          <h3>Shortcuts</h3>
          <ul>
            <li><kbd>T</kbd> – jump to Today</li>
            <li><kbd>A</kbd> – jump to All days</li>
          </ul>

          <p style={{ marginTop: "1.2rem" }}>
            Questions or ideas?&nbsp;Open an issue on GitHub 🙂
          </p>
        </div>
      </main>
    </>
  );
}
