import React, { useEffect, useState } from 'react';
import './styles.css';

export default function Thermal(){
  const [data, setData] = useState<any>(null)
  const [typing, setTyping] = useState('')

  useEffect(()=>{
    let mounted = true
    const load = async ()=>{
      try{
        const res = await fetch('/api/chip-thermal')
        const j = await res.json()
        if(mounted) setData(j)
        // simulate Gemini typing
        const text = j?.gemini_report || 'Awaiting analysis...'
        let i=0
        setTyping('')
        const t = setInterval(()=>{
          i++
          setTyping(text.slice(0,i))
          if(i>=text.length) clearInterval(t)
        }, 30)
      }catch(e){ if(mounted) setData({error:'fail'}) }
    }
    load()
    const iv = setInterval(load, 6000)
    return ()=>{ mounted=false; clearInterval(iv) }
  },[])

  return (
    <div className="page">
      <div className="grid-2">
        <section className="card glass neon-orange">
          <h3>Chip Thermal</h3>
          <div className="chip-heatmap">
            <div className="chip-core" style={{background: data && data.temperature>75 ? 'radial-gradient(circle,#ff5f1f,#330000)' : 'radial-gradient(circle,#1fb6ff,#001022)'}} />
          </div>
          <div className="meta">Temp: <strong>{data?.temperature ?? '—'}°C</strong></div>
          <div className="meta">Fan: {data?.fan_speed ?? '—'}</div>
        </section>

        <aside className="card glass ai-report neon-green">
          <h3>AI Analysis</h3>
          <pre className="typing">{typing}</pre>
          <div className="status">Status: {data?.status ?? '—'}</div>
        </aside>
      </div>
    </div>
  )
}
