import { DataTypes } from "sequelize";
import db from "../../db.js";

/* Free-form daily notes (vaccinations, probiotics, milestones …) */
export const Note = db.define(
  "note_entry",
  {
    id      : { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    noteDate: { type: DataTypes.DATEONLY, allowNull: false },
    title   : { type: DataTypes.STRING(128), allowNull: false },
    body    : { type: DataTypes.TEXT,        allowNull: false },
  },
  { timestamps: false }
);
