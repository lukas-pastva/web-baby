import { Recommendation, Feed } from "./model.js";

/**
 * Build 365-day recommendation rows, each including:
 *   • total ml per day
 *   • meals per day
 *   • ml per single meal (rounded)
 *
 * These are generic WHO-like age-based guidelines used for charts/history.
 * The Dashboard uses a personalized endpoint for today's value, but the
 * "WHO" line and table cell read from this table.
 */
function buildRecommendations() {
  const rows = [];

  for (let ageDays = 0; ageDays < 365; ageDays++) {
    let totalMl, mealsPerDay;

    /* explicit first-week values (same as before) */
    switch (ageDays) {
      case 0: totalMl = 60;  mealsPerDay = 8; break;
      case 1: totalMl = 90;  mealsPerDay = 8; break;
      case 2: totalMl = 150; mealsPerDay = 7; break;
      case 3: totalMl = 200; mealsPerDay = 7; break;
      case 4: totalMl = 300; mealsPerDay = 6; break;
      case 5: totalMl = 350; mealsPerDay = 6; break;
      case 6: totalMl = 400; mealsPerDay = 6; break;
      case 7: totalMl = 450; mealsPerDay = 6; break;

      default:
        if (ageDays <= 30) {               // 8-30 d (ramp)
          const p = (ageDays - 7) / (30 - 7);
          totalMl     = Math.round(450 + p * (650 - 450));
          mealsPerDay = 7;
        } else if (ageDays <= 60) {        // 31-60 d (ramp)
          const p = (ageDays - 30) / (60 - 30);
          totalMl     = Math.round(650 + p * (800 - 650));
          mealsPerDay = 6;
        } else if (ageDays <= 90) {        // 61-90 d (ramp)
          const p = (ageDays - 60) / (90 - 60);
          totalMl     = Math.round(800 + p * (900 - 800));
          mealsPerDay = 5;
        } else if (ageDays <= 180) {       // 3–6 months: plateau ~900 ml
          totalMl     = 900;
          mealsPerDay = 5;
        } else {                           // 6–12 months: gradual taper to ~750 ml
          const p = (ageDays - 180) / (365 - 180);
          totalMl     = Math.round(900 + p * (750 - 900)); // 900 → 750
          mealsPerDay = 4;
        }
    }

    const perMealMl = Math.round(totalMl / mealsPerDay);
    rows.push({ ageDays, totalMl, mealsPerDay, perMealMl });
  }

  return rows;
}

/* ------------------------------------------------------------------ */
/*  Public – called once on server start                              */
/* ------------------------------------------------------------------ */
export async function syncAll() {
  // Ensure tables exist
  await Promise.all([Recommendation.sync({ alter:true }), Feed.sync()]);

  // Build the desired full set of 365 rows and UPSERT them.
  // This fixes older databases that only had 90 rows seeded previously.
  const desired = buildRecommendations();

  // Upsert all rows by primary key (ageDays). MySQL will use
  // ON DUPLICATE KEY UPDATE; other dialects use appropriate UPSERTs.
  await Recommendation.bulkCreate(desired, {
    updateOnDuplicate: ["totalMl", "mealsPerDay", "perMealMl"],
  });
}
