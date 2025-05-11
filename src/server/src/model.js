import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect : "mariadb",
  logging : false,              // silence every SQL by default
});

export const FeedingType = {
  BREAST_DIRECT  : "BREAST_DIRECT",
  BREAST_BOTTLE  : "BREAST_BOTTLE",
  FORMULA_PUMP   : "FORMULA_PUMP",
  FORMULA_BOTTLE : "FORMULA_BOTTLE",
};

/* ---------------- Static recommendations ---------------- */
export const Recommendation = sequelize.define(
  "Recommendation",
  {
    ageDays      : { type: DataTypes.INTEGER, primaryKey: true },
    totalMl      : { type: DataTypes.INTEGER, allowNull: false },
    mealsPerDay  : { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "recommendations", timestamps: false }
);

/* ---------------- Milk logs ----------------------------- */
export const MilkLog = sequelize.define(
  "MilkLog",
  {
    id          : { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fedAt       : { type: DataTypes.DATE, allowNull: false },
    amountMl    : { type: DataTypes.INTEGER, allowNull: false },
    feedingType : { type: DataTypes.ENUM(...Object.values(FeedingType)), allowNull: false },
  },
  { tableName: "milk_logs", timestamps: false }
);

export async function sync() {
  await sequelize.authenticate();
  await sequelize.sync();
  /* Boot-strap defaults only once */
  const count = await Recommendation.count();
  if (count === 0) {
    await Recommendation.bulkCreate([
      { ageDays: 0, totalMl: 60,  mealsPerDay: 8 },
      { ageDays: 1, totalMl: 90,  mealsPerDay: 8 },
      { ageDays: 2, totalMl: 150, mealsPerDay: 7 },
      { ageDays: 3, totalMl: 200, mealsPerDay: 7 },
      { ageDays: 4, totalMl: 300, mealsPerDay: 6 },
      { ageDays: 5, totalMl: 350, mealsPerDay: 6 },
      { ageDays: 6, totalMl: 400, mealsPerDay: 6 },
      { ageDays: 7, totalMl: 450, mealsPerDay: 6 }
    ]);
  }
}
export default sequelize;
