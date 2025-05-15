import { Recommendation, Feed } from "./model.js";

/**
 * Synchronise both tables and seed **daily recommendations for the
 * first 90 days (three months)** of life.
 *
 * • Keeps the explicit values you already had for days 0-7.
 * • From day 8 onward the total intake rises smoothly:
 *     – 8-30 d  : ≈ 450 → 650 ml  | 7 meals
 *     – 31-60 d : ≈ 650 → 800 ml  | 6 meals
 *     – 61-89 d : ≈ 800 → 900 ml  | 5 meals
 * • Numbers are created with simple piece-wise linear maths for
 *   easy tweaking later.
 */
function buildRecommendations() {
  const rows = [];

  for (let ageDays = 0; ageDays < 90; ageDays++) {
    let totalMl, mealsPerDay;

    /* ——— keep your original explicit first-week values ——— */
    switch (ageDays) {
      case 0: totalMl = 60;  mealsPerDay = 8; break;
      case 1: totalMl = 90;  mealsPerDay = 8; break;
      case 2: totalMl = 150; mealsPerDay = 7; break;
      case 3: totalMl = 200; mealsPerDay = 7; break;
      case 4: totalMl = 300; mealsPerDay = 6; break;
      case 5: totalMl = 350; mealsPerDay = 6; break;
      case 6: totalMl = 400; mealsPerDay = 6; break;
      case 7: totalMl = 450; mealsPerDay = 6; break;

      /* ——— smooth ramp-up for the remaining days ——— */
      default:
        if (ageDays <= 30) {               // 8-30 d
          const p = (ageDays - 7) / (30 - 7);
          totalMl     = Math.round(450 + p * (650 - 450));
          mealsPerDay = 7;
        } else if (ageDays <= 60) {        // 31-60 d
          const p = (ageDays - 30) / (60 - 30);
          totalMl     = Math.round(650 + p * (800 - 650));
          mealsPerDay = 6;
        } else {                           // 61-89 d
          const p = (ageDays - 60) / (90 - 60);
          totalMl     = Math.round(800 + p * (900 - 800));
          mealsPerDay = 5;
        }
    }

    rows.push({ ageDays, totalMl, mealsPerDay });
  }

  return rows;
}

/* ------------------------------------------------------------------ */
/*  Public – called once on server start                              */
/* ------------------------------------------------------------------ */
export async function syncAll() {
  /* make sure both tables exist */
  await Promise.all([Recommendation.sync(), Feed.sync()]);

  /* seed only if empty */
  if (await Recommendation.count() === 0) {
    await Recommendation.bulkCreate(buildRecommendations());
  }
}
