import React, { useEffect, useState } from 'react'
import { getChipThermal } from '../api'
import './component.css'

export default function Thermal(){
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    let mounted = true
    const fetcher = async ()=>{
      try{ const d = await getChipThermal(); if(!mounted) return; setData(d)}catch(e){}
    }
    fetcher()
    const id = setInterval(fetcher,5000)
    return ()=>{ mounted=false; clearInterval(id)}
  },[])

  return (
    <div className="page thermal">
      <div className="chip card">
        <svg width="240" height="240" viewBox="0 0 200 200">
          <rect x="20" y="20" width="160" height="160" rx="20" fill="url(#g)" stroke="#ff9a3c" strokeWidth="4" />
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#ff9a3c" />
              <stop offset="100%" stopColor="#ff0033" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="ai card">
        <h3>AI Commentary</h3>
        <div className="comment">{data?.gemini_report ?? 'Awaiting analysis...'}</div>
        <div className="stats">Temp: {data?.temperature ?? '—'}°C</div>
      </div>
    </div>
  )
}
