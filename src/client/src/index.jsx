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

/* pick light/dark for “auto” */
function realMode(m = "auto") {
  if (m !== "auto") return m;
  const h = new Date().getHours();
  return h >= 7 && h < 19 ? "light" : "dark";
}

/* bootstrap – pull config, apply theme/mode, then mount SPA */
(async () => {
  await initConfig();

  const cfg = loadConfig();

  /* theme + resolved colour-scheme */
  document.documentElement.setAttribute(
    "data-theme",
    effectiveTheme(cfg.theme || "boy"),
  );
  document.documentElement.setAttribute(
    "data-mode",
    realMode(effectiveMode("auto")),
  );

  /* mount React app */
  createRoot(document.getElementById("root")).render(<AppRoutes />);
})();
