import express  from "express";
import cors     from "cors";
import path     from "path";
import { fileURLToPath } from "url";
import dotenv   from "dotenv";

import milkingRoutes  from "./modules/milking/routes.js";
import { syncAll }    from "./modules/milking/seed.js";
import weightRoutes   from "./modules/weight/routes.js";
import { syncWeight } from "./modules/weight/seed.js";

/* ───────────────────────────────────────────────────────── bootstrap */
dotenv.config();
await Promise.all([syncAll(), syncWeight()]);

const app  = express();
const port = process.env.PORT || 8080;

/* ───────────────────────────────────────────────────────── middleware */
app.use(cors());
app.use(express.json());

/* ───────────────────────────────────────────────────────── API routes */
app.use(milkingRoutes);
app.use(weightRoutes);

/* ───────────────────────────────────────────────────────── runtime env
   Exposes /env.js which the frontend loads *before* React boots.       */
app.get("/env.js", (_req, res) => {
  res.type("application/javascript");

  /* helper – keep numeric-timestamp strings numeric */
  const normBirthTs = (v) => (v && /^\d+$/.test(v) ? Number(v) : v || "");

  /* guard against typos – only “boy” or “girl” accepted */
  const rawTheme = (process.env.BABY_THEME || "").toLowerCase();
  const theme    = rawTheme === "girl" ? "girl" : "boy";

  res.send(
    `window.__ENV__ = ${JSON.stringify({
      birthTs     : normBirthTs(process.env.BIRTH_TS),
      childName   : process.env.CHILD_NAME    || "",
      childSurname: process.env.CHILD_SURNAME || "",
      appTitle    : process.env.APP_TITLE     || "Web-Baby",
      theme,
    })};`
  );
});

/* ───────────────────────────────────────────────────────── static SPA */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "../public/index.html"))
);

/* ───────────────────────────────────────────────────────── start □ ■  */
app.listen(port, () => console.log(`Web-Baby listening on ${port}`));
