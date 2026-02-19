import React, { useEffect, useState } from 'react';
import './styles.css';

export default function Recovery(){
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    let mounted = true
    const load = async ()=>{
      try{
        const res = await fetch('/api/heat-recovery')
        const j = await res.json()
        if(mounted) setData(j)
      }catch(e){ if(mounted) setData({error:'fail'}) }
    }
    load()
    const t = setInterval(load, 8000)
    return ()=>{ mounted=false; clearInterval(t) }
  },[])

  return (
    <div className="page center">
      <div className="card glass flow-card neon-blue">
        <h3>Waste Heat Recovery</h3>
        <div className="flow-visual">
          <div className="flow-source" />
          <div className="flow-path" />
          <div className="flow-target" />
        </div>
        <div className="metrics">
          <div>Efficiency: <strong>{data?.efficiency ?? '—'}</strong></div>
          <div>Output (kW): <strong>{data?.output_kw ?? '—'}</strong></div>
          <div>Homes Supplied: <strong>{data?.homes_supplied ?? '—'}</strong></div>
        </div>
      </div>
    </div>
  )
}
