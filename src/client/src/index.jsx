import "./styles.css";
import React          from "react";
import { createRoot } from "react-dom/client";
import AppRoutes      from "./routes.jsx";
import {
  initConfig,
  loadConfig,
  effectiveTheme,
  effectiveMode,
} from "./config.js";

/* --------------------------------------------------------------- */
/*  Helper: map “auto” → light/dark by current daylight            */
/* --------------------------------------------------------------- */
function daylightMode() {
  const h = new Date().getHours();      // 0-23 local
  return h >= 7 && h < 19 ? "light" : "dark";
}

/* --------------------------------------------------------------- */
/*  Bootstrap – pull config ➜ apply theme/mode ➜ mount SPA         */
/* --------------------------------------------------------------- */
(async () => {
  await initConfig();                      // fetch or create config row
  const cfg = loadConfig();

  /* accent palette (boy / girl) */
  document.documentElement.setAttribute(
    "data-theme",
    effectiveTheme(cfg.theme || "boy"),
  );

  /* colour-scheme (light / dark / auto) */
  function applyMode() {
    const stored = effectiveMode(cfg.mode || "light");   // light | dark | auto
    const real   = stored === "auto" ? daylightMode() : stored;
    document.documentElement.setAttribute("data-mode", real);
  }
  applyMode();

  /* re-evaluate every 30 min when in “auto” */
  if (effectiveMode(cfg.mode || "light") === "auto") {
    setInterval(applyMode, 30 * 60 * 1000);
  }

  /* keyboard shortcuts (disabled when typing in input / textarea) */
  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    switch (e.key.toLowerCase()) {
      case "t": window.location.href = "/milking";      break;
      case "a": window.location.href = "/milking/all";  break;
      case "w": window.location.href = "/weight";       break;
      case "c": window.location.href = "/config";       break;
      case "h": window.location.href = "/help";         break;
      case "n": window.location.href = "/notes";        break;
      case "e": window.location.href = "/teething";     break;
      default:  break;
    }
  });

  /* mount React SPA */
  createRoot(document.getElementById("root")).render(<AppRoutes />);
})();
