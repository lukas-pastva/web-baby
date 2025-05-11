import express from "express";
import dotenv   from "dotenv";
import cors     from "cors";
import path     from "path";
import { fileURLToPath } from "url";
import { sync, MilkLog, Recommendation, FeedingType } from "./models.js";

dotenv.config();
await sync();                 // create tables if missing

const app  = express();
const port = process.env.PORT || 8080;

/* ---- Middleware ---- */
app.use(cors());
app.use(express.json());

/* ---- API ---- */
app.get("/api/recommendations", async (_req, res) => {
  res.json(await Recommendation.findAll({ order: [["ageDays", "ASC"]] }));
});

app.get("/api/logs", async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from) where.fedAt = { ...where.fedAt, [Op.gte]: new Date(from) };
  if (to)   where.fedAt = { ...where.fedAt, [Op.lte]: new Date(to) };
  res.json(await MilkLog.findAll({ where, order: [["fedAt", "ASC"]] }));
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

/* ---- Front-end ---- */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "../public/index.html")));

/* ---- Start ---- */
app.listen(port, () => console.log(`Web-baby listening on ${port}`));
