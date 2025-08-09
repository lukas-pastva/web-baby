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

import weightApi         from "../../weight/api.js";
import heightApi         from "../../height/api.js";
import { WHO_MEDIAN_KG } from "../../weight/whoMedian.js";
import { medianLengthCm as whoHeightCm } from "../../height/whoLength.js";

/* how many days to fetch in one “page” of the timeline */
const DAYS_PER_PAGE = 50;                      // list paging size

/* WHO helpers */
function lerp(a,b,t){ return a + (b-a)*t; }
function whoWeightKg(sex, ageDays){
  const arr = WHO_MEDIAN_KG[sex] || WHO_MEDIAN_KG.girl;
  const m   = ageDays / 30.4375;
  const i   = Math.floor(m);
  const j   = Math.min(i+1, 12);
  const t   = m - i;
  return lerp(arr[i], arr[j], t);
}
function clamp(x,lo,hi){ return Math.max(lo, Math.min(hi, x)); }

/* expected from birth (kept in sync with Weight page/server) */
function expectedWeightFromBirth(birthGrams, sex, ageDays){
  if (!birthGrams) birthGrams = 3500;
  if (ageDays <= 3){
    return Math.round(birthGrams * (1 - 0.07 * (ageDays / 3)));
  }
  const who = whoWeightKg(sex, ageDays) * 1000;
  if (ageDays <= 15){
    const t = (ageDays - 3) / 12;
    const blended = birthGrams * (0.93 * (1 - t) + (who / birthGrams) * t);
    return Math.round(blended);
  }
  return Math.round(who);
}

/* ml-per-kg curve by age (same as server) */
function mlPerKg(aDays){
  if (aDays <= 30) return 150;
  if (aDays <= 90)  return Math.round(150 + ((aDays - 30) / 60) * (140 - 150));
  if (aDays <= 180) return Math.round(140 + ((aDays - 90) / 90) * (115 - 140));
  const t = Math.min(1, (aDays - 180) / 185);
  return Math.round(115 + t * (95 - 115));
}

export default function MilkingHistory() {
  /* -------------------------------------------------------------- */
  /*  Birth & config                                                */
  /* -------------------------------------------------------------- */
  const {
    birthTs: birthTsRaw,
    birthWeightGrams,
    theme,
  } = loadConfig();
  const sex      = theme === "boy" ? "boy" : "girl";
  const birthDay = birthTsRaw ? startOfDay(new Date(birthTsRaw))
                              : startOfDay(new Date());
  const today    = startOfDay(new Date());
  const birthW   = Number.isFinite(birthWeightGrams) ? birthWeightGrams : 3500;

  /* -------------------------------------------------------------- */
  /*  State                                                         */
  /* -------------------------------------------------------------- */
  const [recs,      setRecs     ] = useState([]);
  const [summary,   setSummary  ] = useState([]);          // immutable – for charts
  const [weights,   setWeights  ] = useState([]);
  const [heights,   setHeights  ] = useState([]);
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
    weightApi.listWeights().then(setWeights).catch(()=>setWeights([]));
    heightApi.listHeights().then(setHeights).catch(()=>setHeights([]));
  }, []);

  /* -------------------------------------------------------------- */
  /*  Progressive loader for paged day-cards                        */
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

  /* helper: estimate weight/height for an arbitrary day using the closest record scaled by WHO ratios */
  const estimateForDay = useMemo(() => {
    /* index weight/height rows by date for quick nearest lookup */
    const W = [...weights].sort((a,b)=>new Date(a.measuredAt)-new Date(b.measuredAt));
    const H = [...heights].sort((a,b)=>new Date(a.measuredAt)-new Date(b.measuredAt));

    function ageDaysOf(dt){ return differenceInCalendarDays(dt, birthDay); }

    return function(dt){
      const ad = ageDaysOf(dt);

      // weight
      let w = expectedWeightFromBirth(birthW, sex, ad); // fallback
      const pastW = [...W].filter(r => new Date(r.measuredAt) <= dt).pop();
      const futureW = W.find(r => new Date(r.measuredAt) >= dt);
      if (pastW || futureW){
        const ref = pastW || futureW;
        const ageRef = ageDaysOf(new Date(ref.measuredAt));
        const ratio = whoWeightKg(sex, ad) / whoWeightKg(sex, ageRef);
        w = Math.round(ref.weightGrams * ratio);
      }

      // height
      let h = whoHeightCm(sex, ad);
      const pastH = [...H].filter(r => new Date(r.measuredAt) <= dt).pop();
      const futureH = H.find(r => new Date(r.measuredAt) >= dt);
      if (pastH || futureH){
        const ref = pastH || futureH;
        const ageRef = ageDaysOf(new Date(ref.measuredAt));
        const ratio = whoHeightCm(sex, ad) / whoHeightCm(sex, ageRef);
        h = +(ref.heightCm * ratio).toFixed(1);
      }

      return { w, h, ad };
    };
  }, [weights, heights, birthDay, birthW, sex]);

  /* -------------------------------------------------------------- */
  /*  Build chart arrays from the **full** summary                  */
  /* -------------------------------------------------------------- */
  const {
    labels, stacks, feedCounts, sleepHours, recommendedWho, recommendedPersonal, personalByDate,
  } = useMemo(() => {
    if (summary.length === 0) {
      return {
        labels      : [],
        stacks      : Object.fromEntries(FEED_TYPES.map(t => [t, []])),
        feedCounts  : [],
        sleepHours  : [],
        recommendedWho: [],
        recommendedPersonal: [],
        personalByDate: {},
      };
    }

    const L  = [];
    const FC = [];
    const SH = [];
    const Rwho = [];
    const Rper = [];
    const ST = Object.fromEntries(FEED_TYPES.map(t => [t, []]));
    const perMap = {};

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

        /* WHO generic recommendation by age */
        const ageDays = differenceInCalendarDays(dt, birthDay);
        const row     = recs.find(r => r.ageDays === ageDays);
        Rwho.push(row?.totalMl ?? 0);

        /* Personalized for that day */
        const { w, h, ad } = estimateForDay(dt);
        const base = Math.round((w/1000) * mlPerKg(ad));
        const expWkg = expectedWeightFromBirth(birthW, sex, ad) / 1000;
        const expHcm = whoHeightCm(sex, ad);
        const weightAdj = clamp((w/1000) / Math.max(0.001, expWkg), 0.85, 1.20);
        const heightAdj = expHcm > 0 ? clamp(1 + 0.5 * (h/expHcm - 1), 0.90, 1.10) : 1.0;
        const totalMl   = Math.round(base * weightAdj * heightAdj);

        Rper.push(totalMl);
        perMap[day] = totalMl;
      });

    return { labels:L, stacks:ST, feedCounts:FC, sleepHours:SH, recommendedWho:Rwho, recommendedPersonal:Rper, personalByDate: perMap };
  }, [summary, recs, birthDay, estimateForDay, birthW, sex]);

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
            <AllDaysChart
              labels={labels}
              stacks={stacks}
              recommendedWho={recommendedWho}
              recommendedPersonal={recommendedPersonal}
            />
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
            recommended={personalByDate[dayStr] ?? 0}
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
