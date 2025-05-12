import React from "react";
import Header from "../../components/Header.jsx";

export default function HelpPage() {
  return (
    <>
      <Header />

      <main>
        <div className="card">
          <h2>Help</h2>

          <h3>What is Web-Baby?</h3>
          <p>
            Web-Baby lets you record every milk feed and daily weight, compare
            intake with recommendations and visualise progress – all in a tiny
            self-hosted React&nbsp;+ Express app.
          </p>

          <h3>Pages</h3>
          <ul>
            <li><strong>Today</strong> – add feeds; stacked bar shows <em>types &amp; total</em>.</li>
            <li><strong>All&nbsp;days</strong> – timeline since birth, stacked by type.</li>
            <li><strong>Weight</strong> – log and chart daily weight.</li>
            <li><strong>Config</strong> – switch theme or hide feed types (stored in session).</li>
          </ul>

          <h3>Shortcuts</h3>
          <ul>
            <li><kbd>T</kbd> – Today</li>
            <li><kbd>A</kbd> – All&nbsp;days</li>
            <li><kbd>C</kbd> – Config</li>
          </ul>

          <p style={{ marginTop:"1.2rem" }}>Questions?  Open an issue on&nbsp;GitHub 🙂</p>
        </div>
      </main>
    </>
  );
}
