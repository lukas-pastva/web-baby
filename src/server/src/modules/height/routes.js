import { Router } from "express";
import { Op }     from "sequelize";
import { Height } from "./model.js";

const r = Router();

/* list (optional range) */
r.get("/api/height/heights", async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from) where.measuredAt = { ...where.measuredAt, [Op.gte]: from };
  if (to)   where.measuredAt = { ...where.measuredAt, [Op.lte]: to };

  res.json(
    await Height.findAll({ where, order: [["measuredAt", "DESC"]] })
  );
});

/* create (upsert – max one entry per day) */
r.post("/api/height/heights", async (req, res) => {
  const { measuredAt, heightCm } = req.body;
  if (!measuredAt || (!Number.isFinite(heightCm) && heightCm !== 0))
    return res.status(400).json({ error: "measuredAt & heightCm required" });

  const [row] = await Height.upsert({ measuredAt, heightCm });
  res.json(row);
});

/* update */
r.put("/api/height/heights/:id", async (req, res) => {
  const row = await Height.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });

  const { measuredAt, heightCm } = req.body;
  await row.update({ measuredAt, heightCm });
  res.json(row);
});

/* delete */
r.delete("/api/height/heights/:id", async (req, res) => {
  const row = await Height.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  await row.destroy();
  res.status(204).end();
});

export default r;
