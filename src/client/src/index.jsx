import "./styles.css";
import React          from "react";
import { createRoot } from "react-dom/client";
import AppRoutes      from "./routes.jsx";
import { effectiveTheme } from "./config.js";

/* ─── apply theme (session config overrides ENV) ─────────────────── */
const envTheme = (window.__ENV__ || {}).theme || "boy";
const theme    = effectiveTheme(envTheme);
document.documentElement.setAttribute("data-theme", theme);

/* ─── mount the SPA ──────────────────────────────────────────────── */
createRoot(document.getElementById("root")).render(<AppRoutes />);
