import "./styles.css";
import React          from "react";
import { createRoot } from "react-dom/client";
import AppRoutes      from "./routes.jsx";
import { effectiveTheme, effectiveMode } from "./config.js";

/* ─── apply theme (boy/girl) ─────────────────────────────────────── */
const env = window.__ENV__ || {};

const theme = effectiveTheme(env.theme || "boy");
document.documentElement.setAttribute("data-theme", theme);

/* ─── apply light/dark mode ──────────────────────────────────────── */
const mode = effectiveMode("light");
document.documentElement.setAttribute("data-mode", mode);

/* ─── mount the SPA ──────────────────────────────────────────────── */
createRoot(document.getElementById("root")).render(<AppRoutes />);
