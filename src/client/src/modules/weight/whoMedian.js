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
