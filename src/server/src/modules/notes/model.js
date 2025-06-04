import { DataTypes } from "sequelize";
import db from "../../db.js";     // shared Sequelize instance

export const Note = db.define(
  "note_entry",
  {
    id      : { type: DataTypes.INTEGER, autoIncrement:true, primaryKey:true },
    noteDate: { type: DataTypes.DATEONLY, allowNull:false },
    title   : { type: DataTypes.STRING(128), allowNull:false },
    text    : { type: DataTypes.TEXT,        allowNull:false },
  },
  { timestamps:false }
);
