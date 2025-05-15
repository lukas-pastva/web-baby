import React, { useState } from "react";
import Header from "../../components/Header.jsx";
import { ALL_TYPES, loadConfig, saveConfig } from "../../config.js";

/* icons for nicer display */
const ICONS = {
  BREAST_DIRECT : "🤱",
  BREAST_BOTTLE : "🤱🍼",
  FORMULA_PUMP  : "🍼⚙️",
  FORMULA_BOTTLE: "🍼",
};

export default function ConfigPage() {
  const initial = loadConfig();

  const [theme,        setTheme]     = useState(initial.theme ?? "boy");
  const [disabled,     setDisabled]  = useState(new Set(initial.disabledTypes));
  const [childName,    setName]      = useState(initial.childName ?? "");
  const [childSurname, setSurname]   = useState(initial.childSurname ?? "");
  const [appTitle,     setTitle]     = useState(initial.appTitle ?? "Web-Baby");

  /* birth date & time split for nicer inputs */
  const initDate = initial.birthTs ? new Date(initial.birthTs) : null;
  const [birthDate, setBirthDate] = useState(
    initDate ? initDate.toISOString().slice(0, 10) : ""
  );
  const [birthTime, setBirthTime] = useState(
    initDate ? initDate.toISOString().slice(11, 16) : ""
  );

  const [saved, setSaved] = useState(false);

  const toggleType = (t) =>
    setDisabled((d) => {
      const next = new Set(d);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const handleSave = () => {
    const birthTs =
      birthDate && birthTime
        ? `${birthDate}T${birthTime}:00Z`
        : birthDate
        ? `${birthDate}T00:00:00Z`
        : null;

    saveConfig({
      theme        : theme || null,
      childName    : childName.trim(),
      childSurname : childSurname.trim(),
      disabledTypes: [...disabled],
      birthTs,
      appTitle     : appTitle.trim() || "Web-Baby",
    });

    /* immediately apply theme */
    document.documentElement.setAttribute("data-theme", theme);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Header />

      <main>
        <section className="card config-wrap">
          <h2>Configuration</h2>

          <h3>Application title</h3>
          <input
            type="text"
            value={appTitle}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />

          <h3>Baby birth date &amp; time</h3>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
            />
          </div>

          <h3>Baby name</h3>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <input
              type="text"
              placeholder="First name"
              value={childName}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Surname"
              value={childSurname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>

          <h3>Theme</h3>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <label>
              <input
                type="radio"
                name="theme"
                value="boy"
                checked={theme === "boy"}
                onChange={() => setTheme("boy")}
              />{" "}
              Teal
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                value="girl"
                checked={theme === "girl"}
                onChange={() => setTheme("girl")}
              />{" "}
              Pink
            </label>
          </div>

          <h3>Enabled feed types</h3>
          <ul className="config-types">
            {ALL_TYPES.map((t) => (
              <li key={t}>
                <label>
                  <input
                    type="checkbox"
                    checked={!disabled.has(t)}
                    onChange={() => toggleType(t)}
                  />
                  &nbsp;{ICONS[t]} {t.replace(/_/g, " ")}
                </label>
              </li>
            ))}
          </ul>

          <button className="btn" onClick={handleSave}>
            Save
          </button>
          {saved && <span className="msg-success">✓ Saved</span>}
        </section>
      </main>
    </>
  );
}
