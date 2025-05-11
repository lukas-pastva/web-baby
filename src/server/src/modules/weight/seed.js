import { Weight } from "./model.js";

/* only sync the table – no baseline data */
export async function syncWeight() {
  await Weight.sync();
}
