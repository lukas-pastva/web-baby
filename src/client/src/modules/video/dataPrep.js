/**
 * Pre-compute all baby data indexed by dayIndex (days since birth).
 *
 * Returns:
 *   totalDays   – number of days from birth to today
 *   birthDate   – Date object
 *   byDay[i]    – { dayIndex, date, summary, weightG, heightCm, teethCount,
 *                   feedCount, maxSleepSoFar }
 */
import { startOfDay, differenceInCalendarDays, addDays } from "date-fns";

export function prepareData({ birthTs, summaries, weights, heights, teeth }) {
  const birthDate = startOfDay(new Date(birthTs));
  const today     = startOfDay(new Date());
  const totalDays = differenceInCalendarDays(today, birthDate) + 1;

  /* ---- index summaries by day string ---- */
  const sumMap = {};
  (summaries || []).forEach(s => { sumMap[s.day] = s; });

  /* ---- sort weight / height by date ---- */
  const wSorted = [...(weights || [])].sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));
  const hSorted = [...(heights || [])].sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));

  /* helper: interpolate between surrounding measurements */
  function interpolate(sorted, field, dayDate) {
    if (sorted.length === 0) return null;
    const ts = dayDate.getTime();
    let before = null, after = null;
    for (const r of sorted) {
      const rTs = new Date(r.measuredAt).getTime();
      if (rTs <= ts) before = r;
      if (rTs >= ts && !after) after = r;
    }
    if (before && after && before !== after) {
      const t = (ts - new Date(before.measuredAt).getTime()) /
                (new Date(after.measuredAt).getTime() - new Date(before.measuredAt).getTime());
      return before[field] + t * (after[field] - before[field]);
    }
    if (before) return before[field];
    if (after)  return after[field];
    return null;
  }

  /* ---- cumulative teeth by day ---- */
  const teethByDay = new Array(totalDays).fill(0);
  (teeth || []).forEach(t => {
    if (!t.appearedAt) return;
    const di = differenceInCalendarDays(new Date(t.appearedAt), birthDate);
    if (di >= 0 && di < totalDays) {
      for (let d = di; d < totalDays; d++) teethByDay[d]++;
    }
  });

  /* ---- build per-day array ---- */
  const byDay = [];
  let maxSleepSoFar = 0;
  for (let i = 0; i < totalDays; i++) {
    const date   = addDays(birthDate, i);
    const dayStr = date.toISOString().slice(0, 10);
    const summary = sumMap[dayStr] || null;

    const weightG  = interpolate(wSorted, "weightGrams", date);
    const heightCm = interpolate(hSorted, "heightCm", date);

    const sleepH = summary?.sleepHours ?? null;
    if (sleepH != null && sleepH > maxSleepSoFar) maxSleepSoFar = sleepH;

    byDay.push({
      dayIndex   : i,
      date,
      dayStr,
      summary,
      weightG    : weightG != null ? Math.round(weightG) : null,
      heightCm   : heightCm != null ? +heightCm.toFixed(1) : null,
      teethCount : teethByDay[i],
      feedCount  : summary?.feedCount ?? 0,
      sleepHours : sleepH,
      maxSleepSoFar,
    });
  }

  return { totalDays, birthDate, byDay };
}
