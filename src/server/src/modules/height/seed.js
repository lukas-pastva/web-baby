import { Height } from "./model.js";

/* just make sure the table exists – no seed data needed */
export async function syncHeight() {
  await Height.sync();
}
