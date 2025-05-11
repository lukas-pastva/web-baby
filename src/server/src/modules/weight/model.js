import { DataTypes } from "sequelize";
import db from "../../db.js";

export const Weight = db.define(
  "weight_entry",
  {
    id          : { type: DataTypes.INTEGER, autoIncrement:true, primaryKey:true },
    measuredAt  : { type: DataTypes.DATEONLY, allowNull:false, unique:true },
    weightGrams : { type: DataTypes.INTEGER,   allowNull:false },
  },
  { timestamps:false }
);
