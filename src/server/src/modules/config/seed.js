import { AppConfig } from "./model.js";

/* make sure the table (and one default row) exist */
export async function syncConfig() {
  await AppConfig.sync();
  const count = await AppConfig.count();
  if (count === 0) {
    await AppConfig.create({ id:1, theme:"boy", mode:"light", disabledTypes:[] });
  }
}
