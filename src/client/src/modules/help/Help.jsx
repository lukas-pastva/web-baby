import React from "react";

export default function HelpPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "1rem" }}>
      <h2>Web-Baby – Help</h2>

      <h3>What is this app?</h3>
      <p>
        Web-Baby lets parents record every milk feed and compare the baby’s
        actual intake with common recommendations.
      </p>

      <h3>Pages</h3>
      <ul>
        <li><strong>Today</strong> – add feeds, see live charts.</li>
        <li><strong>All days</strong> – review up to 50&nbsp;days at a time.</li>
        <li><strong>Help</strong> – you’re here now.</li>
      </ul>

      <h3>Shortcuts</h3>
      <ul>
        <li><kbd>T</kbd> – jump to “Today”.</li>
        <li><kbd>A</kbd> – jump to “All days”.</li>
      </ul>

      <p style={{ marginTop: "2rem" }}>
        Questions or ideas?&nbsp;Open an issue on GitHub 🙂
      </p>
    </main>
  );
}
