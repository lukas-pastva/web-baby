import { Router } from "express";
import { AppConfig } from "./model.js";

const r = Router();

/* ensure the single config row exists */
async function getRow() {
  let row = await AppConfig.findByPk(1);
  if (!row) row = await AppConfig.create({ id: 1 });   // defaults
  return row;
}

/* GET  → current config */
r.get("/api/config", async (_req, res) => {
  res.json(await getRow());
});

/* PUT  → update config */
r.put("/api/config", async (req, res) => {
  const row = await getRow();
  const {
    theme,
    mode,
    disabledTypes,
    childName,
    childSurname,
    birthTs,
    appTitle,
  } = req.body;

  await row.update({
    theme        : ["boy","girl"].includes(theme)   ? theme         : row.theme,
    mode         : ["light","dark"].includes(mode)  ? mode          : row.mode,
    disabledTypes: Array.isArray(disabledTypes)     ? disabledTypes : row.disabledTypes,
    childName    : typeof childName === "string"    ? childName     : row.childName,
    childSurname : typeof childSurname === "string" ? childSurname  : row.childSurname,
    birthTs      : birthTs || null,
    appTitle     : typeof appTitle === "string" && appTitle.trim() ? appTitle.trim() : row.appTitle,
  });

  res.json(row);
});

export default r;
