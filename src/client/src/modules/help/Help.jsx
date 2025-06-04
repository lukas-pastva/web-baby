import React from "react";
import Header from "../../components/Header.jsx";

export default function HelpPage() {
  return (
    <>
      <Header />

      <main>
        <section className="card" style={{ maxWidth: "850px" }}>
          <h2 style={{ marginTop: 0 }}>Welcome to Web-Baby 👶🍼</h2>

          <p>
            Web-Baby is a tiny <strong>React + Express</strong> app that lets
            new parents log feeds, track weight, jot down notes and more – all
            in a single container you can self-host anywhere.
          </p>

          <h3>Pages at a glance</h3>
          <ul>
            <li><strong>Today</strong> – quick feed entry; stacked bar shows <em>types + total</em>.</li>
            <li><strong>All days</strong> – full timeline since birth with two overview charts.</li>
            <li><strong>Weight</strong> – record &amp; visualise daily weight against WHO medians.</li>
            <li><strong>Notes</strong> – dated free-text notes (vaccinations, milestones, anything).</li>
            <li><strong>Config</strong> – theme, birth details, hidden feed types.</li>
            <li><strong>Help</strong> – you’re here!</li>
          </ul>

          <h3>Keyboard shortcuts</h3>
          <table>
            <thead>
              <tr><th>Key</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr><td><kbd>T</kbd></td><td>Today</td></tr>
              <tr><td><kbd>A</kbd></td><td>All days</td></tr>
              <tr><td><kbd>W</kbd></td><td>Weight</td></tr>
              <tr><td><kbd>N</kbd></td><td>Notes</td></tr>
              <tr><td><kbd>C</kbd></td><td>Config</td></tr>
              <tr><td><kbd>H</kbd></td><td>Help</td></tr>
            </tbody>
          </table>

          <h3>FAQ</h3>
          <p><strong>❓ How do I record a vaccination?</strong><br/>
             Jump to <em>Notes</em>, pick the date, add a title like “1st DTaP”
             and any details – saved instantly.</p>

          <p><strong>❓ Where is my data kept?</strong><br/>
             Everything lives in a single MariaDB / MySQL database. The Docker
             image ships with migrations that auto-create the tables on first
             run (including the new <code>note_entries</code> table).</p>

          <p><strong>Need more help?</strong> Open an issue on GitHub – PRs and
             questions welcome 🙂</p>
        </section>
      </main>
    </>
  );
}