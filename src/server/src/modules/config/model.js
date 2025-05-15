import { DataTypes } from "sequelize";
import db from "../../db.js";          // shared Sequelize instance

/* One-row application-wide configuration */
export const AppConfig = db.define(
  "app_config",
  {
    id           : { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    theme        : { type: DataTypes.ENUM("boy","girl"),  allowNull:false, defaultValue:"boy" },
    mode         : { type: DataTypes.ENUM("light","dark"),allowNull:false, defaultValue:"light" },
    disabledTypes: { type: DataTypes.JSON,                 allowNull:false, defaultValue:[]  },
    childName    : { type: DataTypes.STRING(64),           allowNull:false, defaultValue:"" },
    childSurname : { type: DataTypes.STRING(64),           allowNull:false, defaultValue:"" },
    birthTs      : { type: DataTypes.DATE,                 allowNull:true  },
    appTitle     : { type: DataTypes.STRING(128),          allowNull:false, defaultValue:"Web-Baby" },
    birthWeightGrams: { type: DataTypes.INTEGER, allowNull:true },
  },
  { timestamps:false }
);
