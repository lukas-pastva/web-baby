import React, { useEffect, useState } from "react";
import {
  startOfDay, addDays, format, differenceInCalendarDays,
} from "date-fns";
import Header        from "../../../components/Header.jsx";
import api           from "../api.js";
import DayCard       from "../components/DayCard.jsx";
import AllDaysChart  from "../components/AllDaysChart.jsx";

const DAYS_PER_PAGE = 50;
const rt            = window.__ENV__ || {};
const birthTs       = rt.birthTs ? new Date(rt.birthTs) : null;

const birthDay = birthTs ? startOfDay(birthTs) : startOfDay(new Date());
const today    = startOfDay(new Date());

export default function MilkingHistory() {
  const [page, setPage]       = useState(0);
  const [recs, setRecs]       = useState([]);
  const [feedsByDay, setData] = useState({});
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  useEffect(() => { api.listRecs().then(setRecs).catch(e => setErr(e.message)); }, []);

  /* paged fetch birth → today */
  useEffect(() => {
    if (done) return;
    (async () => {
      setLoading(true);
      const batch = [];
      for (let i = 0; i < DAYS_PER_PAGE; i++) {
        const offset = page * DAYS_PER_PAGE + i;
        const date   = addDays(birthDay, offset);
        if (date > today) { setDone(true); break; }
        const day = format(date, "yyyy-MM-dd");
        batch.push(
          api.listFeeds(day)
             .then(rows => ({ day, date, rows }))
             .catch(()  => ({ day, date, rows: [] }))
        );
      }
      const res = await Promise.all(batch);
      setData(prev => Object.fromEntries([
        ...Object.entries(prev), ...res.map(r => [r.day, r]),
      ]));
      setLoading(false);
    })();
  }, [page, done]);

  /* helper – ml recommendation for given age */
  const recForAge = age => recs.find(r => r.ageDays === age)?.totalMl ?? 0;

  /* arrays (newest → oldest) */
  const ordered = Object.values(feedsByDay).sort((a, b) => b.date - a.date);

  const labels       = [];
  const recommended  = [];
  const byType       = { BREAST_DIRECT: [], BREAST_BOTTLE: [], FORMULA_PUMP: [], FORMULA_BOTTLE: [] };

  ordered.forEach(({ date, rows }) => {
    labels.push(format(date, "d LLL"));
    const ageDays = differenceInCalendarDays(date, birthDay);
    recommended.push(recForAge(ageDays));

    const tmp = { BREAST_DIRECT:0, BREAST_BOTTLE:0, FORMULA_PUMP:0, FORMULA_BOTTLE:0 };
    rows.forEach(r => { tmp[r.feedingType] += r.amountMl; });
    Object.keys(byType).forEach(t => byType[t].push(tmp[t]));
  });

  return (
    <>
      <Header showMeta={false} />
      {err && <p style={{ color:"#c00", padding:"0 1rem" }}>{err}</p>}

      <main>
        {labels.length > 0 && (
          <AllDaysChart
            labels={labels}
            recommended={recommended}
            byType={byType}
          />
        )}

        {ordered.map(({ day, date, rows }) => (
          <DayCard
            key={day}
            date={date}
            feeds={rows}
            onUpdate={(id, p) => api.updateFeed(id, p).then(() => api.listFeeds(day).then(r => setData(prev => ({ ...prev, [day]: { ...prev[day], rows:r } }))))}
            onDelete={id     => api.deleteFeed(id)      .then(() => api.listFeeds(day).then(r => setData(prev => ({ ...prev, [day]: { ...prev[day], rows:r } }))))}
          />
        ))}

        <div style={{ textAlign:"center", margin:"1.5rem 0" }}>
          {loading ? (
            <p>Loading…</p>
          ) : done ? (
            <p><em>End of timeline</em></p>
          ) : (
            <button className="btn-light" onClick={() => setPage(page + 1)}>
              Next&nbsp;{DAYS_PER_PAGE}&nbsp;days →
            </button>
          )}
        </div>
      </main>
    </>
  );
}
