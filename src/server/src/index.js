import express from "express";
import dotenv  from "dotenv";
import cors    from "cors";
import path    from "path";
import { fileURLToPath } from "url";
import { Op }  from "sequelize";

import {
  sync,
  MilkLog,
  Recommendation,
  FeedingType,
} from "./model.js";

dotenv.config();
await sync();                     // create tables if they’re missing

const app  = express();
const port = process.env.PORT || 8080;

/* ─── middleware ───────────────────────────────────────────── */
app.use(cors());
app.use(express.json());

/* ─── API ───────────────────────────────────────────────────── */
app.get("/api/recommendations", async (_req, res) => {
  const rows = await Recommendation.findAll({ order: [["ageDays", "ASC"]] });
  res.json(rows);
});

app.get("/api/logs", async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from) where.fedAt = { ...where.fedAt, [Op.gte]: new Date(from) };
  if (to)   where.fedAt = { ...where.fedAt, [Op.lte]: new Date(to) };
  const rows = await MilkLog.findAll({ where, order: [["fedAt", "ASC"]] });
  res.json(rows);
});

app.post("/api/logs", async (req, res) => {
  const { fedAt, amountMl, feedingType } = req.body;

  if (!fedAt || !amountMl || !feedingType) {
    return res.status(400).json({ error: "fedAt, amountMl & feedingType required" });
  }
  if (!Object.values(FeedingType).includes(feedingType)) {
    return res.status(400).json({ error: "invalid feedingType" });
  }

  const row = await MilkLog.create({ fedAt, amountMl, feedingType });
  res.json(row);
});

/* ─── tiny runtime-config endpoint (env.js) ────────────────────────── */
app.get("/env.js", (_req, res) => {
  res.type("application/javascript");
  res.send(`window.__ENV__ = ${JSON.stringify({
    birthTs: process.env.BIRTH_TS || "",
  })};`);
});

/* ─── serve front-end ───────────────────────────────────────── */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "../public/index.html"))
);

/* ─── start ─────────────────────────────────────────────────── */
app.listen(port, () => console.log(`Web-baby listening on ${port}`));
