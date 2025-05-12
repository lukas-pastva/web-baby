import React, { useEffect, useState } from "react";
import {
  startOfDay, addDays, format, differenceInCalendarDays,
} from "date-fns";
import Header        from "../../../components/Header.jsx";
import api           from "../api.js";
import DayCard       from "../components/DayCard.jsx";
import AllDaysChart  from "../components/AllDaysChart.jsx";

const rt        = window.__ENV__ || {};
const birthDay  = rt.birthTs ? startOfDay(new Date(rt.birthTs)) : startOfDay(new Date());
const today     = startOfDay(new Date());
const PAGE      = 50;

export default function MilkingHistory() {
  const [page,setPage]       = useState(0);
  const [recs,setRecs]       = useState([]);
  const [feedsByDay,setData] = useState({});
  const [err,setErr]         = useState("");
  const [loading,setLoading] = useState(false);
  const [done,setDone]       = useState(false);

  useEffect(()=>{ api.listRecs().then(setRecs).catch(e=>setErr(e.message)); },[]);

  useEffect(()=>{
    if(done)return;
    (async()=>{
      setLoading(true);
      const batch = [];
      for(let i=0;i<PAGE;i++){
        const offset = page*PAGE+i;
        const date   = addDays(birthDay,offset);
        if(date>today){ setDone(true); break; }
        const day = format(date,"yyyy-MM-dd");
        batch.push(api.listFeeds(day).then(rows=>({day,date,rows})).catch(()=>({day,date,rows:[]})));
      }
      const res = await Promise.all(batch);
      setData(prev=>Object.fromEntries([...Object.entries(prev),...res.map(r=>[r.day,r])]));
      setLoading(false);
    })();
  },[page,done]);

  const recForAge = (age) => recs.find(r=>r.ageDays===age)?.totalMl ?? 0;

  const refresh = async(day)=>{
    const rows = await api.listFeeds(day).catch(()=>null);
    if(rows) setData(prev=>({...prev,[day]:{...prev[day],rows}}));
  };

  const ordered = Object.values(feedsByDay).sort((a,b)=>b.date-a.date);
  const labels = [], recommended = [], actual = [];
  ordered.forEach(({date,rows})=>{
    labels.push(format(date,"d LLL"));
    const age = differenceInCalendarDays(date,birthDay);
    recommended.push(recForAge(age));
    actual.push(rows.reduce((s,f)=>s+f.amountMl,0));
  });

  return (
    <>
      <Header />

      {err && <p style={{color:"#c00",padding:"0 1rem"}}>{err}</p>}

      <main>
        {labels.length>0 &&
          <AllDaysChart labels={labels} recommended={recommended} actual={actual}/>}
        {ordered.map(({day,date,rows})=>(
          <DayCard key={day} date={date} feeds={rows}
            onUpdate={(id,p)=>api.updateFeed(id,p).then(()=>refresh(day))}
            onDelete={ id   =>api.deleteFeed(id)   .then(()=>refresh(day))}/>
        ))}

        <div style={{textAlign:"center",margin:"1.5rem 0"}}>
          {loading ? <p>Loading…</p>
            : done ? <p><em>End of timeline</em></p>
            : <button className="btn-light" onClick={()=>setPage(page+1)}>Next&nbsp;{PAGE}&nbsp;days →</button>}
        </div>
      </main>
    </>
  );
}
