import React, { useEffect, useState } from "react";
import {
  startOfDay,
  addDays,
  format,
  differenceInCalendarDays,
} from "date-fns";

import Header            from "../../../components/Header.jsx";
import api               from "../api.js";
import DayCard           from "../components/DayCard.jsx";
import AllDaysChart      from "../components/AllDaysChart.jsx";
import FeedCountChart    from "../components/FeedCountChart.jsx";
import NightGapChart     from "../components/NightGapChart.jsx";
import { loadConfig }    from "../../../config.js";
import { ORDER as FEED_TYPES } from "../../../feedTypes.js";

const DAYS_PER_PAGE = 50;

export default function MilkingHistory() {
  /* ----------------------------------------------------------------
   *  Birth date (for age-based recommendations)
   * ---------------------------------------------------------------- */
  const { birthTs: birthTsRaw } = loadConfig();
  const birthDay = birthTsRaw ? startOfDay(new Date(birthTsRaw))
                              : startOfDay(new Date());
  const today    = startOfDay(new Date());

  /* ----------------------------------------------------------------
   *  State
   * ---------------------------------------------------------------- */
  const [page,         setPage]    = useState(0);
  const [recs,         setRecs]    = useState([]);
  const [feedsByDay,   setData]    = useState({});
  const [err,          setErr]     = useState("");
  const [loading,      setLoading] = useState(false);
  const [done,         setDone]    = useState(false);

  /* ----------------------------------------------------------------
   *  Fetch static recommendation table once
   * ---------------------------------------------------------------- */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* ----------------------------------------------------------------
   *  Paged loader: birth-day → today, 50 calendar days per page
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (done) return;

    (async () => {
      setLoading(true);
      const batch = [];

      for (let i = 0; i < DAYS_PER_PAGE; i++) {
        const offset = page * DAYS_PER_PAGE + i;
        const date   = addDays(birthDay, offset);
        if (date > today) { setDone(true); break; }

        const dayStr = format(date, "yyyy-MM-dd");
        batch.push(
          api.listFeeds(dayStr)
             .then(rows => ({ dayStr, date, rows }))
             .catch(()  => ({ dayStr, date, rows: [] }))
        );
      }

      const res = await Promise.all(batch);
      setData(prev =>
        Object.fromEntries([
          ...Object.entries(prev),
          ...res.map(r => [r.dayStr, r]),
        ]),
      );
      setLoading(false);
    })();
  }, [page, done, birthDay, today]);

  /* ----------------------------------------------------------------
   *  Build arrays for the timeline charts
   * ---------------------------------------------------------------- */
  const ordered = Object.values(feedsByDay)
                        .sort((a, b) => b.date - a.date);  // newest first

  const labels      = [];
  const recommended = [];
  const feedCounts  = [];
  const sleepHours  = [];      // longest 20:00-08:00 stretch, null = skip
  const stacks      = Object.fromEntries(FEED_TYPES.map(t => [t, []]));

  ordered.forEach(({ date, rows }) => {
    labels.push(format(date, "d LLL"));

    /* age-specific recommended daily total */
    const age = differenceInCalendarDays(date, birthDay);
    recommended.push(
      recs.find(r => r.ageDays === age)?.totalMl ?? 0,
    );

    /* feeds per day */
    feedCounts.push(rows.length);

    /* cumulative ml per feed-type for stacked chart */
    const sums = Object.fromEntries(FEED_TYPES.map(t => [t, 0]));
    rows.forEach(f => { sums[f.feedingType] += f.amountMl; });
    FEED_TYPES.forEach(t => stacks[t].push(sums[t]));

    /* --------------------------------------------------------------
     *  Longest “sleep-time” window (20:00 → 08:00)
     * -------------------------------------------------------------- */
    const nightStart = new Date(date);          // 20:00 same calendar day
    nightStart.setHours(20, 0, 0, 0);

    const nightEnd = new Date(nightStart);      // 08:00 next day
    nightEnd.setDate(nightEnd.getDate() + 1);
    nightEnd.setHours(8, 0, 0, 0);

    /* collect feeds that fall into the night window — may span two
       calendar days, so pull rows of the next day too (if loaded) */
    const nextIso = format(addDays(date, 1), "yyyy-MM-dd");
    const nightFeeds = [
      ...rows,
      ...(feedsByDay[nextIso]?.rows ?? []),
    ].filter(f => {
      const t = new Date(f.fedAt);
      return t >= nightStart && t <= nightEnd;
    });

    /* if *absolutely no* feeds in entire 24 h => treat as “no data” */
    const hasAnyFeedsToday = rows.length > 0 ||
                             (feedsByDay[nextIso]?.rows?.length ?? 0) > 0;

    if (!hasAnyFeedsToday) {
      sleepHours.push(null);
    } else {
      /* compute longest gap inside 20:00-08:00 */
      let maxGapMs = nightFeeds.length === 0
        ? nightEnd - nightStart                       // slept whole night
        : 0;

      if (nightFeeds.length > 0) {
        const asc = nightFeeds.sort(
          (a, b) => new Date(a.fedAt) - new Date(b.fedAt),
        );

        /* start → first feed */
        maxGapMs = Math.max(maxGapMs, new Date(asc[0].fedAt) - nightStart);

        /* between feeds */
        for (let i = 1; i < asc.length; i++) {
          const gap = new Date(asc[i].fedAt) - new Date(asc[i - 1].fedAt);
          if (gap > maxGapMs) maxGapMs = gap;
        }

        /* last feed → end */
        maxGapMs = Math.max(
          maxGapMs,
          nightEnd - new Date(asc[asc.length - 1].fedAt),
        );
      }

      const hrs = +(maxGapMs / 3_600_000).toFixed(1);   // 1 decimal

      /* hide current (still unfolding) day */
      const todayStart = startOfDay(new Date());
      sleepHours.push(date.getTime() === todayStart.getTime() ? null : hrs);
    }
  });

  /* ----------------------------------------------------------------
   *  Render
   * ---------------------------------------------------------------- */
  return (
    <>
      <Header />

      {err && <p style={{ color: "#c00", padding: "0 1rem" }}>{err}</p>}

      <main>
        {labels.length > 0 && (
          <>
            {/* stacked ml per day */}
            <AllDaysChart
              labels={labels}
              stacks={stacks}
              recommended={recommended}
            />

            {/* feeds-per-day bar chart */}
            <FeedCountChart
              labels={labels}
              counts={feedCounts}
            />

            {/* longest sleep-time curve */}
            <NightGapChart
              labels={labels}
              gaps={sleepHours}
            />
          </>
        )}

        {/* per-day collapsible cards */}
        {ordered.map(({ dayStr, date, rows }) => (
          <DayCard
            key={dayStr}
            date={date}
            feeds={rows}
            recommended={
              recs.find(
                r => r.ageDays === differenceInCalendarDays(date, birthDay),
              )?.totalMl ?? 0
            }
            onUpdate={(id, p) =>
              api.updateFeed(id, p)
                 .then(() =>
                   setData(d => ({
                     ...d,
                     [dayStr]: {
                       ...d[dayStr],
                       rows: d[dayStr].rows.map(r =>
                         r.id === id ? { ...r, ...p } : r,
                       ),
                     },
                   })),
                 )
                 .catch(e => setErr(e.message))
            }
            onDelete={id =>
              api.deleteFeed(id)
                 .then(() =>
                   setData(d => ({
                     ...d,
                     [dayStr]: {
                       ...d[dayStr],
                       rows: d[dayStr].rows.filter(r => r.id !== id),
                     },
                   })),
                 )
                 .catch(e => setErr(e.message))
            }
          />
        ))}

        {/* pagination control */}
        <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
          {loading ? (
            <p>Loading…</p>
          ) : done ? (
            <p>
              <em>End of timeline</em>
            </p>
          ) : (
            <button
              className="btn-light"
              onClick={() => setPage(p => p + 1)}
            >
              Next {DAYS_PER_PAGE} days →
            </button>
          )}
        </div>
      </main>
    </>
  );
}
