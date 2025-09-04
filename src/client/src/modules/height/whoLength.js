/* WHO child-growth standards – median (P50) length/height, cm
 * Monthly values 0-12 m for boys & girls.
 * Source: WHO Child Growth Standards, Length/Height-for-Age tables.
 */
export const WHO_MEDIAN_CM = {
  girl: [
    49.1, 53.7, 57.1, 59.8, 62.1, 64.0, 65.7, 67.3, 68.7, 70.1, 71.5, 72.8, 74.0,
  ],
  boy: [
    49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 72.0, 73.3, 74.5, 75.7,
  ],
};

/** Linear interpolation between surrounding months (0–12). */
export function medianLengthCm(sex, ageDays) {
  const months = ageDays / 30.4375;
  const med = WHO_MEDIAN_CM[sex] || WHO_MEDIAN_CM.girl;

  // Clamp beyond table range to the last known month (12)
  if (months >= 12) return med[12];

  const iLo = Math.max(0, Math.floor(months));
  const iHi = Math.min(iLo + 1, 12);
  const t   = months - iLo;
  return med[iLo] + t * (med[iHi] - med[iLo]);
}

/*
 * Approximate WHO percentile via LMS-style z-score.
 * We currently use M from the table above and approximate L≈1 and S≈0.04 (4% CV),
 * which yields a reasonable shape near the median for 0–12 months.
 * This can be refined later with full WHO L,M,S tables.
 */
function approxZFromLength(sex, ageDays, lengthCm) {
  const M = medianLengthCm(sex, ageDays);
  if (!Number.isFinite(lengthCm) || !Number.isFinite(M) || M <= 0) return null;
  const L = 1;         // Box-Cox power ~1 (approx)
  const S = 0.04;      // coefficient of variation ~4% (approx)
  // LMS z-score (with L≈1 simplifies to (X/M - 1)/S)
  const z = ((lengthCm / M) ** L - 1) / S;
  // Guard absurd extremes
  if (!Number.isFinite(z)) return null;
  return Math.max(-6, Math.min(6, z));
}

// Standard normal CDF using erf approximation
function standardNormalCdf(z) {
  // Abramowitz & Stegun formula 7.1.26
  const t  = 1 / (1 + 0.2316419 * Math.abs(z));
  const d  = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  const p  = d * t * (
    0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))
  );
  const cdf = z >= 0 ? 1 - p : p;
  return cdf;
}

/** Return percentile (0–100) for given sex, ageDays and lengthCm (approximate). */
export function lengthPercentile(sex, ageDays, lengthCm) {
  const z = approxZFromLength(sex, ageDays, lengthCm);
  if (z === null) return null;
  const pct = 100 * standardNormalCdf(z);
  return Math.max(0, Math.min(100, pct));
}
