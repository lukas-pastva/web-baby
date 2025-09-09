/* WHO child-growth standards – median (P50) weight, kg
 * Monthly values 0-12 m for boys & girls.
 * Source: WHO Child Growth Standards, Weight-for-Age tables.
 */
export const WHO_MEDIAN_KG = {
  girl: [
    3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9,
  ],
  boy: [
    3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6,
  ],
};

/* Return a median-ratio relative to month-0
 * — linear interpolation between surrounding months.
 */
export function medianRatio(sex, ageDays) {
  const months = ageDays / 30.4375;              // mean days / month
  const iLo    = Math.floor(months);
  const iHi    = Math.min(iLo + 1, 12);
  const t      = months - iLo;                   // 0-1 between grid pts

  const med = WHO_MEDIAN_KG[sex] || WHO_MEDIAN_KG.girl;   // fallback
  const kg   = med[iLo] + t * (med[iHi] - med[iLo]);      // interp kg
  return kg / med[0];                                     // ratio v. birth
}

/** Linear interpolation of WHO median weight in kilograms (0–12 months). */
export function medianWeightKg(sex, ageDays) {
  const months = ageDays / 30.4375;
  const med = WHO_MEDIAN_KG[sex] || WHO_MEDIAN_KG.girl;
  if (months >= 12) return med[12];
  const iLo = Math.max(0, Math.floor(months));
  const iHi = Math.min(iLo + 1, 12);
  const t   = months - iLo;
  return med[iLo] + t * (med[iHi] - med[iLo]);
}

/** Median in grams convenience wrapper. */
export function medianWeightGrams(sex, ageDays) {
  return Math.round(medianWeightKg(sex, ageDays) * 1000);
}

/* Approximate WHO percentile using an LMS-style z-score near the median.
 * We use M from the median table above and approximate L≈1 and S≈0.08 (8% CV)
 * to reflect higher dispersion in weight vs. length during 0–12 months.
 */
function approxZFromWeight(sex, ageDays, weightGrams) {
  const M = medianWeightGrams(sex, ageDays);
  if (!Number.isFinite(weightGrams) || !Number.isFinite(M) || M <= 0) return null;
  const L = 1;        // Box-Cox power ~1
  const S = 0.08;     // coefficient of variation ~8%
  const z = ((weightGrams / M) ** L - 1) / S;  // simplifies with L≈1
  if (!Number.isFinite(z)) return null;
  return Math.max(-6, Math.min(6, z));
}

// Standard normal CDF using erf approximation (same as height module)
function standardNormalCdf(z) {
  const t  = 1 / (1 + 0.2316419 * Math.abs(z));
  const d  = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  const p  = d * t * (
    0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))
  );
  return z >= 0 ? 1 - p : p;
}

/** Return percentile (0–100) for given sex, ageDays and weightGrams (approximate). */
export function weightPercentile(sex, ageDays, weightGrams) {
  const z = approxZFromWeight(sex, ageDays, weightGrams);
  if (z === null) return null;
  const pct = 100 * standardNormalCdf(z);
  return Math.max(0, Math.min(100, pct));
}
