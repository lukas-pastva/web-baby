import { Sequelize, DataTypes } from "sequelize";

/* ------------------------------------------------------------------ */
/*  Build the connection string                                       */
/* ------------------------------------------------------------------ */
function buildDbUrl() {
  /* 1️⃣  Full URL wins if provided */
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  /* 2️⃣  Otherwise compose from individual parts */
  const {
    DB_HOST,
    DB_NAME,
    DB_USER = "root",
    DB_PASSWORD = "",
    DB_PORT = 3306,
  } = process.env;

  if (!DB_HOST || !DB_NAME) {
    throw new Error(
      "Missing DB connection info. Set DATABASE_URL or DB_HOST + DB_NAME (+ optional DB_USER/DB_PASSWORD/DB_PORT)."
    );
  }

  const user = encodeURIComponent(DB_USER);
  const pass = encodeURIComponent(DB_PASSWORD);
  return `mariadb://${user}:${pass}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

const sequelize = new Sequelize(buildDbUrl(), {
  dialect: "mariadb",
  logging: false,
});

/* ------------------------------------------------------------------ */
/*  Constants & models                                                */
/* ------------------------------------------------------------------ */
export const FeedingType = {
  BREAST_DIRECT: "BREAST_DIRECT",
  BREAST_BOTTLE: "BREAST_BOTTLE",
  FORMULA_PUMP: "FORMULA_PUMP",
  FORMULA_BOTTLE: "FORMULA_BOTTLE",
};

/* ---------- Static recommendations ---------- */
export const Recommendation = sequelize.define(
  "Recommendation",
  {
    ageDays: { type: DataTypes.INTEGER, primaryKey: true },
    totalMl: { type: DataTypes.INTEGER, allowNull: false },
    mealsPerDay: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "recommendations", timestamps: false }
);

/* ---------- Milk logs ----------------------- */
export const MilkLog = sequelize.define(
  "MilkLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fedAt: { type: DataTypes.DATE, allowNull: false },
    amountMl: { type: DataTypes.INTEGER, allowNull: false },
    feedingType: {
      type: DataTypes.ENUM(...Object.values(FeedingType)),
      allowNull: false,
    },
  },
  { tableName: "milk_logs", timestamps: false }
);

export async function sync() {
  await sequelize.authenticate();
  await sequelize.sync();

  /* Seed baseline only once */
  const count = await Recommendation.count();
  if (count === 0) {
    await Recommendation.bulkCreate([
      { ageDays: 0, totalMl: 60, mealsPerDay: 8 },
      { ageDays: 1, totalMl: 90, mealsPerDay: 8 },
      { ageDays: 2, totalMl: 150, mealsPerDay: 7 },
      { ageDays: 3, totalMl: 200, mealsPerDay: 7 },
      { ageDays: 4, totalMl: 300, mealsPerDay: 6 },
      { ageDays: 5, totalMl: 350, mealsPerDay: 6 },
      { ageDays: 6, totalMl: 400, mealsPerDay: 6 },
      { ageDays: 7, totalMl: 450, mealsPerDay: 6 },
    ]);
  }
}

export default sequelize;
