import express  from "express";
import cors     from "cors";
import path     from "path";
import { fileURLToPath } from "url";
import dotenv   from "dotenv";

import milkingRoutes from "./modules/milking/routes.js";
import { syncAll }   from "./modules/milking/seed.js";

dotenv.config();
await syncAll();                       // create tables + seed baseline

const app  = express();
const port = process.env.PORT || 8080;

/* ─── middleware ───────────────────────────────────────────── */
app.use(cors());
app.use(express.json());

/* ─── API modules ──────────────────────────────────────────── */
app.use(milkingRoutes);

/* ─── runtime config endpoint ──────────────────────────────── */
app.get("/env.js", (_req, res) => {
  res.type("application/javascript");
  const normBirthTs = (v) => (v && /^\d+$/.test(v) ? Number(v) : v || "");
  res.send(
    `window.__ENV__ = ${JSON.stringify({
      birthTs     : normBirthTs(process.env.BIRTH_TS),
      childName   : process.env.CHILD_NAME   || "",
      childSurname: process.env.CHILD_SURNAME|| "",
    })};`
  );
});

/* ─── serve front-end static build ─────────────────────────── */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "../public/index.html"))
);

/* ─── start ────────────────────────────────────────────────── */
app.listen(port, () => console.log(`Web-Baby listening on ${port}`));
