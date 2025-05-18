import "./styles.css";
import React          from "react";
import { createRoot } from "react-dom/client";
import AppRoutes      from "./routes.jsx";
import {
  initConfig,
  loadConfig,
  effectiveTheme,
  storedMode,
} from "./config.js";

/* ── helper to apply light/dark according to “auto” ─────────────── */
function applyMode(mode) {
  let real = mode;
  if (mode === "auto") {
    const h = new Date().getHours();
    real = (h >= 7 && h < 19) ? "light" : "dark";
  }
  document.documentElement.setAttribute("data-mode", real);
}

/* ── bootstrap ──────────────────────────────────────────────────── */
(async () => {
  await initConfig();
  const cfg = loadConfig();

  /* theme */
  document.documentElement.setAttribute(
    "data-theme",
    effectiveTheme(cfg.theme || "boy")
  );

  /* mode (light/dark/auto) */
  applyMode(storedMode());

  /* when in auto re-evaluate every 30 min */
  if (storedMode() === "auto") {
    setInterval(() => applyMode("auto"), 30 * 60 * 1000);
  }

  createRoot(document.getElementById("root")).render(<AppRoutes />);
})();
