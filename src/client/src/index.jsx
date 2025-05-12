import "./styles.css";
import React           from "react";
import { createRoot }  from "react-dom/client";
import AppRoutes       from "./routes.jsx";

/* ─── apply theme from runtime config ───────────────────────── */
const theme = (window.__ENV__ || {}).theme || "boy";   // "boy" | "girl"
document.documentElement.setAttribute("data-theme", theme);

/* ─── mount app ─────────────────────────────────────────────── */
createRoot(document.getElementById("root")).render(<AppRoutes />);
