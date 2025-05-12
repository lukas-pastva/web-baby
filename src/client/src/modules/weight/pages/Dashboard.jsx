import React, { useEffect, useState, useMemo } from "react";
import { startOfToday } from "date-fns";
import Header        from "../../../components/Header.jsx";
import api           from "../api.js";
import WeightForm    from "../components/WeightForm.jsx";
import WeightTable   from "../components/WeightTable.jsx";
import WeightChart   from "../components/WeightChart.jsx";

export default function WeightDashboard() {
  const [weights,setWeights] = useState([]);
  const [err,setErr]         = useState("");

  const reload = ()=> api.listWeights().then(setWeights).catch(e=>setErr(e.message));
  useEffect(reload,[]);

  const handleSave   = p   => api.insertWeight(p).then(reload).catch(e=>setErr(e.message));
  const handleUpdate = (id,p)=>api.updateWeight(id,p).then(reload).catch(e=>setErr(e.message));
  const handleDelete = id  => api.deleteWeight(id)  .then(reload).catch(e=>setErr(e.message));

  const {labels,series} = useMemo(()=>{
    const sorted=[...weights].sort((a,b)=>a.measuredAt<b.measuredAt?-1:1);
    return { labels:sorted.map(w=>w.measuredAt), series:sorted.map(w=>w.weightGrams) };
  },[weights]);

  return (
    <>
      <Header />

      {err && <p style={{color:"#c00",padding:"0 1rem"}}>{err}</p>}

      <main>
        <WeightForm onSave={handleSave} defaultDate={startOfToday()}/>
        <WeightChart labels={labels} weights={series}/>
        <WeightTable rows={weights} onUpdate={handleUpdate} onDelete={handleDelete}/>
      </main>
    </>
  );
}
