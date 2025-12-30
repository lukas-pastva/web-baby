import { Tooth } from "./model.js";

/* just make sure the table exists – no seed data needed */
export async function syncTeething() {
  await Tooth.sync();
}
