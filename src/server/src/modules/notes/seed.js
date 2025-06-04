import { Note } from "./model.js";

/* only create the table – no seed rows */
export async function syncNotes() {
  await Note.sync();
}
