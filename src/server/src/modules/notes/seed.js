import { Note } from "./model.js";

/* just make sure the table exists – no seed rows */
export async function syncNotes() {
  await Note.sync();
}
