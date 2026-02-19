import React, { useEffect, useState } from 'react';
import './styles.css';

export default function Dashboard(){
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    let mounted = true
    const load = async ()=>{
      try{
        const res = await fetch('/api/dashboard')
        const j = await res.json()
        if(mounted) setData(j)
      }catch(e){
        if(mounted) setData({error: 'failed'})
      }
    }
    load()
    const t = setInterval(load, 8000)
    return ()=>{ mounted=false; clearInterval(t) }
  },[])

  return (
    <div className="page">
      <div className="grid">
        <section className="card glass map-card neon-blue">
          <h3>Global Task Migration Map</h3>
          <div className="map-placeholder">
            {/* simple glowing map placeholder */}
            <div className="map-blob" />
          </div>
        </section>

        <aside className="card glass stats">
          <h3>Metrics</h3>
          <div className="metric">
            <div className="k">Vulnerability</div>
            <div className="v neon-orange">{data?.vuln_score ?? '—'}</div>
          </div>
          <div className="metric">
            <div className="k">AQI</div>
            <div className="v neon-green">{data?.aqi ?? '—'}</div>
          </div>
          <div className="metric">
            <div className="k">Cooling (kW)</div>
            <div className="v neon-blue">{data?.cooling ?? '—'}</div>
          </div>
          <div style={{marginTop:12}}>
            <button className="btn">Migrate Tasks</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
