import "./styles.css";
import React          from "react";
import { createRoot } from "react-dom/client";
import AppRoutes      from "./routes.jsx";
import {
  initConfig,
  effectiveTheme,
  effectiveMode,
} from "./config.js";

/* bootstrap – pull config, apply theme/mode, then mount SPA */
(async () => {
  const env = window.__ENV__ || {};

  /* pulls (or creates) the single config row */
  await initConfig(env);

  /* apply theme + light/dark mode */
  document.documentElement.setAttribute(
    "data-theme",
    effectiveTheme(env.theme || "boy")
  );
  document.documentElement.setAttribute(
    "data-mode",
    effectiveMode("light")
  );

  /* mount React app */
  createRoot(document.getElementById("root")).render(<AppRoutes />);
})();
