import express  from "express";
import cors     from "cors";
import path     from "path";
import { fileURLToPath } from "url";
import dotenv   from "dotenv";

import milkingRoutes  from "./modules/milking/routes.js";
import { syncAll }    from "./modules/milking/seed.js";

import weightRoutes   from "./modules/weight/routes.js";
import { syncWeight } from "./modules/weight/seed.js";

/* config (theme / palette / etc.) */
import configRoutes   from "./modules/config/routes.js";
import { syncConfig } from "./modules/config/seed.js";

/* NEW – notes */
import noteRoutes     from "./modules/notes/routes.js";
import { syncNotes }  from "./modules/notes/seed.js";

/* ─────────────────────────────────────────────────────────────── */

dotenv.config();

/* ensure all tables exist / migrate */
await Promise.all([
  syncAll(),      // milking
  syncWeight(),   // weight
  syncConfig(),   // app config
  syncNotes(),    // notes  ← NEW
]);

const app  = express();
const port = process.env.PORT || 8080;

/* middleware */
app.use(cors());
app.use(express.json());

/* REST API */
app.use(milkingRoutes);
app.use(weightRoutes);
app.use(configRoutes);
app.use(noteRoutes);       /* ← NEW */

/* static SPA (built by Vite) */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "../public/index.html"))
);

app.listen(port, () => console.log(`Web-Baby listening on ${port}`));
