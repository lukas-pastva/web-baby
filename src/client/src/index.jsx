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
/*  Helper: resolve “auto” → light/dark by local daylight          */
/* --------------------------------------------------------------- */
function daylightMode() {
  const h = new Date().getHours();        // 0-23 local
  return h >= 7 && h < 19 ? "light" : "dark";
}

/* --------------------------------------------------------------- */
/*  Bootstrap: pull config → apply theme/mode → mount SPA          */
/* --------------------------------------------------------------- */
(async () => {
  /* fetch (or create) the single config row */
  await initConfig();
  const cfg = loadConfig();

  /* ---- accent palette ------------------------------------------ */
  document.documentElement.setAttribute(
    "data-theme",
    effectiveTheme(cfg.theme || "boy"),
  );

  /* ---- colour-scheme (light / dark / auto) --------------------- */
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

  /* ---- mount React app ----------------------------------------- */
  createRoot(document.getElementById("root")).render(<AppRoutes />);
})();
