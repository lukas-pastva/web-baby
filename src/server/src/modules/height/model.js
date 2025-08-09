import { DataTypes } from "sequelize";
import db from "../../db.js";           // shared Sequelize instance

export const Height = db.define(
  "height_entry",
  {
    id         : { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    measuredAt : { type: DataTypes.DATEONLY, allowNull: false, unique: true },
    heightCm   : { type: DataTypes.FLOAT,    allowNull: false },
  },
  { timestamps: false }
);
