import React, { useEffect, useState } from "react";
import {
  startOfDay,
  addDays,
  format,
  differenceInCalendarDays,
} from "date-fns";

import Header        from "../../../components/Header.jsx";
import api           from "../api.js";
import DayCard       from "../components/DayCard.jsx";
import AllDaysChart  from "../components/AllDaysChart.jsx";

const FEED_TYPES    = [
  "BREAST_DIRECT",
  "BREAST_BOTTLE",
  "FORMULA_PUMP",
  "FORMULA_BOTTLE",
];
const DAYS_PER_PAGE = 50;

const rt       = window.__ENV__ || {};
const birthTs  = rt.birthTs ? new Date(rt.birthTs) : null;

const birthDay = birthTs ? startOfDay(birthTs) : startOfDay(new Date());
const today    = startOfDay(new Date());

export default function MilkingHistory() {
  const [page,         setPage]  = useState(0);
  const [recs,         setRecs]  = useState([]);
  const [feedsByDay,   setData]  = useState({});
  const [err,          setErr]   = useState("");
  const [loading,      setLoading] = useState(false);
  const [done,         setDone]  = useState(false);

  /* recommendations once */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
  }, []);

  /* paged loader birth→today */
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
          api
            .listFeeds(dayStr)
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
  }, [page, done]);

  /* build arrays for multi-day chart */
  const ordered = Object.values(feedsByDay)
                         .sort((a, b) => b.date - a.date);   // newest first

  const labels      = [];
  const recommended = [];
  const stacks      = Object.fromEntries(FEED_TYPES.map(t => [t, []]));

  ordered.forEach(({ date, rows }) => {
    labels.push(format(date, "d LLL"));
    const age = differenceInCalendarDays(date, birthDay);
    recommended.push(recs.find(r => r.ageDays === age)?.totalMl ?? 0);

    const sums = Object.fromEntries(FEED_TYPES.map(t => [t, 0]));
    rows.forEach(f => { sums[f.feedingType] += f.amountMl; });
    FEED_TYPES.forEach(t => stacks[t].push(sums[t]));
  });

  return (
    <>
      <Header />

      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        {/* big timeline chart stays unchanged */}
        {labels.length > 0 && (
          <AllDaysChart
            labels={labels}
            stacks={stacks}
            recommended={recommended}
          />
        )}

        {ordered.map(({ dayStr, date, rows }) => (
          <DayCard
            key={dayStr}
            date={date}
            feeds={rows}
            /* pass that day’s recommendation for the per-day chart */
            recommended={
              recs.find(
                r => r.ageDays === differenceInCalendarDays(date, birthDay)
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
                         r.id === id ? { ...r, ...p } : r
                       ),
                     },
                   }))
                 )
                 .catch(e => setErr(e.message))
            }
            onDelete={(id) =>
              api.deleteFeed(id)
                 .then(() =>
                   setData(d => ({
                     ...d,
                     [dayStr]: {
                       ...d[dayStr],
                       rows: d[dayStr].rows.filter(r => r.id !== id),
                     },
                   }))
                 )
                 .catch(e => setErr(e.message))
            }
          />
        ))}

        <div style={{ textAlign:"center", margin:"1.5rem 0" }}>
          {loading ? (
            <p>Loading…</p>
          ) : done ? (
            <p><em>End of timeline</em></p>
          ) : (
            <button className="btn-light" onClick={() => setPage(p => p + 1)}>
              Next {DAYS_PER_PAGE} days →
            </button>
          )}
        </div>
      </main>
    </>
  );
}
