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
import NightGapChart     from "../components/NightGapChart.jsx";   // 👈 NEW
import { loadConfig }    from "../../../config.js";
import { ORDER as FEED_TYPES } from "../../../feedTypes.js";

const DAYS_PER_PAGE = 50;

export default function MilkingHistory() {
  const { birthTs: birthTsRaw } = loadConfig();
  const birthDay = birthTsRaw ? startOfDay(new Date(birthTsRaw))
                              : startOfDay(new Date());
  const today    = startOfDay(new Date());

  const [page,         setPage]   = useState(0);
  const [recs,         setRecs]   = useState([]);
  const [feedsByDay,   setData]   = useState({});
  const [err,          setErr]    = useState("");
  const [loading,      setLoading] = useState(false);
  const [done,         setDone]   = useState(false);

  /* ---- once: recommendation table -------------------------------- */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* ---- paged loader birth → today -------------------------------- */
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
      setData(prev => Object.fromEntries([
        ...Object.entries(prev),
        ...res.map(r => [r.dayStr, r]),
      ]));
      setLoading(false);
    })();
  }, [page, done, birthDay, today]);

  /* ---- build arrays for the timeline charts ---------------------- */
  const ordered = Object.values(feedsByDay)
                        .sort((a, b) => b.date - a.date);  // newest first

  const labels       = [];
  const recommended  = [];
  const feedCounts   = [];
  const nightGaps    = [];                                // 👈 NEW
  const stacks       = Object.fromEntries(FEED_TYPES.map(t => [t, []]));

  ordered.forEach(({ date, rows }) => {
    labels.push(format(date, "d LLL"));

    /* recommendation for this age */
    const age = differenceInCalendarDays(date, birthDay);
    recommended.push(
      recs.find(r => r.ageDays === age)?.totalMl ?? 0,
    );

    /* number of feeds */
    feedCounts.push(rows.length);

    /* sum ml per feed-type (stack chart) */
    const sums = Object.fromEntries(FEED_TYPES.map(t => [t, 0]));
    rows.forEach(f => { sums[f.feedingType] += f.amountMl; });
    FEED_TYPES.forEach(t => stacks[t].push(sums[t]));

    /* ---------- longest gap without feeds (hours) ---------------- */
    const dayStart = startOfDay(date);
    const dayEnd   = addDays(dayStart, 1);
    let maxGapMs   = rows.length === 0 ? (dayEnd - dayStart) : 0;

    if (rows.length > 0) {
      const feedsAsc = [...rows].sort((a, b) =>
        new Date(a.fedAt) - new Date(b.fedAt),
      );

      /* gap from day start to first feed */
      maxGapMs = Math.max(maxGapMs, new Date(feedsAsc[0].fedAt) - dayStart);

      /* gaps between successive feeds */
      for (let i = 1; i < feedsAsc.length; i++) {
        const gap = new Date(feedsAsc[i].fedAt) - new Date(feedsAsc[i - 1].fedAt);
        if (gap > maxGapMs) maxGapMs = gap;
      }

      /* gap from last feed to day end */
      maxGapMs = Math.max(
        maxGapMs,
        dayEnd - new Date(feedsAsc[feedsAsc.length - 1].fedAt),
      );
    }

    nightGaps.push(+((maxGapMs / 3_600_000).toFixed(1))); // hours → 1-dp
  });

  /* ---- UI -------------------------------------------------------- */
  return (
    <>
      <Header />

      {err && <p style={{ color: "#c00", padding: "0 1rem" }}>{err}</p>}

      <main>
        {labels.length > 0 && (
          <>
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

            {/* NEW – longest gap chart */}
            <NightGapChart
              labels={labels}
              gaps={nightGaps}
            />
          </>
        )}

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
