import { Router } from "express";
import { Tooth } from "./model.js";

const r = Router();

/* list all teeth */
r.get("/api/teething/teeth", async (req, res) => {
  res.json(await Tooth.findAll({ order: [["toothCode", "ASC"]] }));
});

/* upsert a tooth (create or update) */
r.post("/api/teething/teeth", async (req, res) => {
  const { toothCode, appearedAt } = req.body;
  if (!toothCode)
    return res.status(400).json({ error: "toothCode required" });

  const [row] = await Tooth.upsert({ toothCode, appearedAt });
  res.json(row);
});

/* update */
r.put("/api/teething/teeth/:id", async (req, res) => {
  const row = await Tooth.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });

  const { toothCode, appearedAt } = req.body;
  await row.update({ toothCode, appearedAt });
  res.json(row);
});

/* delete */
r.delete("/api/teething/teeth/:id", async (req, res) => {
  const row = await Tooth.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });

  await row.destroy();
  res.status(204).end();
});

/* clear a tooth (set appearedAt to null) */
r.post("/api/teething/teeth/:toothCode/clear", async (req, res) => {
  const row = await Tooth.findOne({ where: { toothCode: req.params.toothCode } });
  if (!row) return res.status(404).json({ error: "not found" });

  await row.update({ appearedAt: null });
  res.json(row);
});

export default r;
