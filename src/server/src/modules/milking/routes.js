import { Router } from "express";
import { Op }     from "sequelize";
import { Recommendation, Feed, FeedingType } from "./model.js";

const r = Router();

/* recommendations */
r.get("/api/milking/recommendations", async (_req, res) => {
  res.json(await Recommendation.findAll({ order: [["ageDays", "ASC"]] }));
});

/* feeds list (query by date range) */
r.get("/api/milking/feeds", async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from) where.fedAt = { ...where.fedAt, [Op.gte]: new Date(from) };
  if (to)   where.fedAt = { ...where.fedAt, [Op.lte]: new Date(to) };
  res.json(await Feed.findAll({ where, order: [["fedAt", "ASC"]] }));
});

/* insert new feed */
r.post("/api/milking/feeds", async (req, res) => {
  const { fedAt, amountMl, feedingType } = req.body;

  if (!fedAt || !amountMl || !feedingType) {
    return res.status(400).json({ error: "fedAt, amountMl & feedingType required" });
  }
  if (!Object.values(FeedingType).includes(feedingType)) {
    return res.status(400).json({ error: "invalid feedingType" });
  }

  res.json(await Feed.create({ fedAt, amountMl, feedingType }));
});

export default r;
