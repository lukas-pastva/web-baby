import { Router } from "express";
import { AppConfig } from "./model.js";

const r = Router();

/* ensure exactly one row exists */
async function getRow() {
  let row = await AppConfig.findByPk(1);
  if (!row) row = await AppConfig.create({ id: 1 });     // defaults
  return row;
}

/* GET  →  current config */
r.get("/api/config", async (_req, res) => {
  res.json(await getRow());
});

/* PUT  →  update config */
r.put("/api/config", async (req, res) => {
  const row = await getRow();
  const { theme, mode, disabledTypes } = req.body;

  await row.update({
    theme        : ["boy","girl"].includes(theme)           ? theme         : row.theme,
    mode         : ["light","dark"].includes(mode)          ? mode          : row.mode,
    disabledTypes: Array.isArray(disabledTypes)             ? disabledTypes : row.disabledTypes,
  });

  res.json(row);
});

export default r;
