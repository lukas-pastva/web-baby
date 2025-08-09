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
  const iLo    = Math.floor(months);
  const iHi    = Math.min(iLo + 1, 12);
  const t      = months - iLo;

  const med = WHO_MEDIAN_CM[sex] || WHO_MEDIAN_CM.girl;
  const cm  = med[iLo] + t * (med[iHi] - med[iLo]);
  return cm;
}
