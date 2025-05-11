import { Recommendation, Feed } from "./model.js";

/**
 * Synchronise both tables and seed baseline recommendations once.
 * Called from server/src/index.js on start-up.
 */
export async function syncAll() {
  await Promise.all([Recommendation.sync(), Feed.sync()]);

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
      { ageDays: 7, totalMl: 450, mealsPerDay: 6 },
    ]);
  }
}
