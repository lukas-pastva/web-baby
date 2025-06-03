import db from "../../db.js";
import { AppConfig } from "./model.js";

/* ------------------------------------------------------------------ */
/*  Ensure schema is up-to-date and at least one row exists           */
/* ------------------------------------------------------------------ */
export async function syncConfig() {
  const qi = db.getQueryInterface();

  /* 1️⃣  Drop the old “appTitle” column (raw SQL to avoid driver bug) */
  try {
    const table = await qi.describeTable("app_config");
    if (table.appTitle) {
      console.warn("Removing legacy column appTitle …");
      await db.query("ALTER TABLE app_config DROP COLUMN appTitle");
    }
  } catch {
    /* table might not exist yet – ignore */
  }

  /* 2️⃣  Sync current model (no appTitle) */
  await AppConfig.sync({ alter: true });

  /* 3️⃣  Seed default row if missing */
  if (await AppConfig.count() === 0) {
    await AppConfig.create({
      id              : 1,
      theme           : "boy",
      mode            : "light",
      disabledTypes   : [],
      childName       : "",
      childSurname    : "",
      birthTs         : process.env.BIRTH_TS || null,
      birthWeightGrams: process.env.BIRTH_WEIGHT_GRAMS
        ? Number(process.env.BIRTH_WEIGHT_GRAMS)
        : null,
    });
  }
}
