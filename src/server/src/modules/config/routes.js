import { Router } from "express";
import { AppConfig } from "./model.js";

const r = Router();

async function getRow() {
  let row = await AppConfig.findByPk(1);
  if (!row) row = await AppConfig.create({ id:1 });
  return row;
}

/* GET current config */
r.get("/api/config", async (_req, res) => {
  res.json(await getRow());
});

/* PUT update */
r.put("/api/config", async (req, res) => {
  const row = await getRow();
  const {
    theme, mode, disabledTypes,
    childName, childSurname,
    birthTs, birthWeightGrams,
  } = req.body;

  await row.update({
    theme        : ["boy","girl"].includes(theme)       ? theme : row.theme,
    mode         : ["light","dark","auto"].includes(mode)? mode  : row.mode,
    disabledTypes: Array.isArray(disabledTypes)         ? disabledTypes : row.disabledTypes,
    childName    : typeof childName    === "string"     ? childName    : row.childName,
    childSurname : typeof childSurname === "string"     ? childSurname : row.childSurname,
    birthTs      : birthTs || null,
    birthWeightGrams: Number.isFinite(birthWeightGrams) ? Math.round(birthWeightGrams) : row.birthWeightGrams,
  });

  res.json(row);
});

export default r;
