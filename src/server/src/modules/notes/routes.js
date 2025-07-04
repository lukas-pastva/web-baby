import { Router } from "express";
import { Op }     from "sequelize";
import { Note }   from "./model.js";

const r = Router();

/* list – optional ?from=YYYY-MM-DD&to=YYYY-MM-DD */
r.get("/api/notes", async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from) where.noteDate = { ...where.noteDate, [Op.gte]: from };
  if (to)   where.noteDate = { ...where.noteDate, [Op.lte]: to };

  const rows = await Note.findAll({ where, order:[["noteDate","DESC"],["id","DESC"]] });
  res.json(rows);
});

/* create */
r.post("/api/notes", async (req, res) => {
  const { noteDate, title="", text="" } = req.body;
  if (!noteDate || !title.trim()) return res.status(400).json({ error:"noteDate & title required" });
  res.json(await Note.create({ noteDate, title:title.trim(), text }));
});

/* update */
r.put("/api/notes/:id", async (req, res) => {
  const row = await Note.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error:"not found" });

  const { noteDate, title, text } = req.body;
  await row.update({
    noteDate: noteDate ?? row.noteDate,
    title   : title?.trim() || row.title,
    text    : text ?? row.text,
  });
  res.json(row);
});

/* delete */
r.delete("/api/notes/:id", async (req, res) => {
  const row = await Note.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error:"not found" });
  await row.destroy();
  res.status(204).end();
});

export default r;
