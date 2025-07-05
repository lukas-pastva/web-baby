import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  startOfDay,
  format,
  addDays,
  subDays,
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

/* how many days to fetch in one “page” of the timeline */
const DAYS_PER_PAGE = 50;                      // list paging size

export default function MilkingHistory() {
  /* -------------------------------------------------------------- */
  /*  Birth & config                                                */
  /* -------------------------------------------------------------- */
  const { birthTs: birthTsRaw } = loadConfig();
  const birthDay = birthTsRaw ? startOfDay(new Date(birthTsRaw))
                              : startOfDay(new Date());
  const today    = startOfDay(new Date());

  /* -------------------------------------------------------------- */
  /*  State                                                         */
  /* -------------------------------------------------------------- */
  const [recs,      setRecs     ] = useState([]);
  const [summary,   setSummary  ] = useState([]);          // immutable – for charts
  const [err,       setErr      ] = useState("");

  /* paged feed-data for the collapsible DayCards */
  const [page,      setPage     ] = useState(0);           // 0 = newest DAYS_PER_PAGE days
  const [feedsByDay,setFeeds    ] = useState({});
  const [loading,   setLoading  ] = useState(false);
  const [done,      setDone     ] = useState(false);

  const sentinel = useRef(null);

  /* -------------------------------------------------------------- */
  /*  Fetch immutable tables once                                   */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    api.listRecs().then(setRecs).catch(e => setErr(e.message));
    api.listDaySummaries().then(setSummary).catch(e => setErr(e.message));
  }, []);

  /* -------------------------------------------------------------- */
  /*  Progressive loader – **sequential** fetch to avoid 50 parallel
      requests exhausting Chrome’s connection/memory pool           */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (done) return;

    (async () => {
      setLoading(true);

      const batch = {};

      for (let i = 0; i < DAYS_PER_PAGE; i++) {
        const offset = page * DAYS_PER_PAGE + i;
        const date   = subDays(today, offset);             // newest-first

        /* reached the birth date? stop paging */
        if (date < birthDay) {
          setDone(true);
          break;
        }

        const dayStr = format(date, "yyyy-MM-dd");

        try {
          /* ⬇️  sequential await – one network request at a time */
          const rows = await api.listFeeds(dayStr);
          batch[dayStr] = { dayStr, date, rows };
        } catch {
          /* silent fail → empty day */
          batch[dayStr] = { dayStr, date, rows: [] };
        }
      }

      /* merge the freshly fetched slice */
      setFeeds(prev => ({ ...prev, ...batch }));
      setLoading(false);
    })();
  }, [page, done, today, birthDay]);

  /* IntersectionObserver – advance page when sentinel enters view */
  useEffect(() => {
    if (done) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "300px" },
    );

    if (sentinel.current) io.observe(sentinel.current);
    return () => io.disconnect();
  }, [done, loading]);

  /* -------------------------------------------------------------- */
  /*  Build chart arrays from the **full** summary                  */
  /* -------------------------------------------------------------- */
  const {
    labels, stacks, feedCounts, sleepHours, recommended,
  } = useMemo(() => {
    if (summary.length === 0) {
      return {
        labels      : [],
        stacks      : Object.fromEntries(FEED_TYPES.map(t => [t, []])),
        feedCounts  : [],
        sleepHours  : [],
        recommended : [],
      };
    }

    const L  = [];
    const FC = [];
    const SH = [];
    const R  = [];
    const ST = Object.fromEntries(FEED_TYPES.map(t => [t, []]));

    summary
      .slice()                       // newest → oldest
      .sort((a, b) => new Date(b.day) - new Date(a.day))
      .forEach(({ day, totalsByType, feedCount, sleepHours }) => {
        const dt = new Date(day);

        L.push(format(dt, "d LLL"));     // label
        FC.push(feedCount);
        SH.push(sleepHours);

        FEED_TYPES.forEach(t =>
          ST[t].push(totalsByType[t] || 0),
        );

        /* age-based recommendation (may be 0 if unknown) */
        const ageDays = differenceInCalendarDays(dt, birthDay);
        const row     = recs.find(r => r.ageDays === ageDays);
        R.push(row?.totalMl ?? 0);
      });

    return { labels:L, stacks:ST, feedCounts:FC, sleepHours:SH, recommended:R };
  }, [summary, recs, birthDay]);

  /* -------------------------------------------------------------- */
  /*  Render                                                        */
  /* -------------------------------------------------------------- */
  const orderedCards = Object.values(feedsByDay)
    .sort((a, b) => b.date - a.date);     // newest first

  return (
    <>
      <Header />

      {err && <p style={{ color: "#c00", padding: "0 1rem" }}>{err}</p>}

      <main>
        {/* ---------- timeline charts (always full) ---------- */}
        {labels.length > 0 && (
          <>
            <AllDaysChart labels={labels} stacks={stacks} recommended={recommended} />
            <FeedCountChart labels={labels} counts={feedCounts} />
            <NightGapChart  labels={labels} gaps={sleepHours} />
          </>
        )}

        {/* ---------- collapsible day cards (paged) ---------- */}
        {orderedCards.map(({ dayStr, date, rows }) => (
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
                   setFeeds((d) => ({
                     ...d,
                     [dayStr]: {
                       ...d[dayStr],
                       rows: d[dayStr].rows.map((r) =>
                         r.id === id ? { ...r, ...p } : r,
                       ),
                     },
                   })),
                 )
                 .catch((e) => setErr(e.message))
            }
            onDelete={(id) =>
              api.deleteFeed(id)
                 .then(() =>
                   setFeeds((d) => ({
                     ...d,
                     [dayStr]: {
                       ...d[dayStr],
                       rows: d[dayStr].rows.filter((r) => r.id !== id),
                     },
                   })),
                 )
                 .catch((e) => setErr(e.message))
            }
          />
        ))}

        {/* sentinel for infinite scroll */}
        <div ref={sentinel} style={{ height: 1 }}></div>

        {/* status */}
        {loading && <p style={{ textAlign:"center" }}>Loading…</p>}
        {done && !loading && (
          <p style={{ textAlign:"center" }}><em>Start of timeline</em></p>
        )}
      </main>
    </>
  );
}
