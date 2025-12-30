import { DataTypes } from "sequelize";
import db from "../../db.js";

export const Tooth = db.define(
  "tooth_entry",
  {
    id          : { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    toothCode   : { type: DataTypes.STRING(10), allowNull: false, unique: true },
    appearedAt  : { type: DataTypes.DATEONLY, allowNull: true },
  },
  { timestamps: false }
);
