/* …imports stay the same … */

export default function MilkingDashboard() {
  /* …all existing state/logic unchanged … */

  /* today’s recommendation row (may be undefined if birth date not set) */
  const ageDays   = birthTs ? differenceInCalendarDays(date, birthTs) : null;
  const recRow    = recs.find(r => r.ageDays === ageDays) || {};
  const recToday  = recRow.totalMl     ?? 0;
  const recPer    = recRow.perMealMl   ?? 0;
  const mealsDay  = recRow.mealsPerDay ?? null;

  /* timer since last feed (any day) */
  const lastFeedAt = last ? new Date(last.fedAt) : null;
  const minsSince  = lastFeedAt ? differenceInMinutes(now, lastFeedAt) : null;
  const didntEat   = minsSince != null ? fmtMinutes(minsSince) : "—";

  /* --------------------------------------------------------------------
   *  NEW ─ “should have eaten by now” target
   * ------------------------------------------------------------------ */
  let targetSoFar = null;
  if (mealsDay && recPer) {
    const minutesIntoDay = now.getHours() * 60 + now.getMinutes();   // 0-1439
    const expectedMeals  =
      Math.min(mealsDay, Math.floor((minutesIntoDay / 1440) * mealsDay));
    targetSoFar = expectedMeals * recPer;
  }

  /* actual ml consumed so far today (for extra context) */
  const actualSoFar = feeds.reduce((s, f) => s + f.amountMl, 0);

  return (
    <>
      <Header />

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        {/* banner – time since last + per-meal + target so far */}
        <section className="card" style={{ marginBottom:"1.5rem" }}>
          <strong>Didn’t eat for:</strong>{" "}
          {lastFeedAt ? didntEat : <em>No feeds logged yet</em>}

          {recPer > 0 && (
            <>
              {" "}|{" "}
              <strong>Suggested per feed:</strong> {recPer} ml
            </>
          )}

          {targetSoFar != null && (
            <>
              {" "}|{" "}
              <strong>Should have eaten by now:</strong>{" "}
              {targetSoFar} ml&nbsp;
              <small style={{ opacity:0.7 }}>
                (logged&nbsp;{actualSoFar} ml)
              </small>
            </>
          )}
        </section>

        {/* rest of the page unchanged */}
        <FeedForm  onSave={handleSave} />
        <FeedTable rows={feeds}
                   onUpdate={handleUpdate}
                   onDelete={handleDelete} />
        <SummaryChart feeds={feeds} recommended={recToday} />
      </main>
    </>
  );
}
