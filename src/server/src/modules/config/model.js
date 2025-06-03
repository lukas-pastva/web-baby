import { DataTypes } from "sequelize";
import db from "../../db.js";

export const AppConfig = db.define(
  "app_config",
  {
    id           : { type: DataTypes.INTEGER, autoIncrement:true, primaryKey:true },
    theme        : { type: DataTypes.ENUM("boy","girl"),              allowNull:false, defaultValue:"boy"  },
    mode         : { type: DataTypes.ENUM("light","dark","auto"),     allowNull:false, defaultValue:"auto" },
    disabledTypes: { type: DataTypes.JSON,                            allowNull:false, defaultValue:[]     },
    childName    : { type: DataTypes.STRING(64),                      allowNull:false, defaultValue:""     },
    childSurname : { type: DataTypes.STRING(64),                      allowNull:false, defaultValue:""     },
    birthTs      : { type: DataTypes.DATE,                            allowNull:true  },
    birthWeightGrams: { type: DataTypes.INTEGER,                      allowNull:true  },
  },
  { timestamps:false }
);
