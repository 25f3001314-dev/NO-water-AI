import React, { useEffect, useState } from 'react'
import { getDashboardData } from '../api'
import './component.css'

export default function Dashboard(){
  const [data, setData] = useState<any>(null)
  const [alert, setAlert] = useState(false)

  useEffect(()=>{
    let mounted = true
    const fetcher = async ()=>{
      try{
        const d = await getDashboardData()
        if(!mounted) return
        setData(d)
        if(d && d.tasks && d.tasks>50) setAlert(true)
      }catch(e){ }
    }
    fetcher()
    const id = setInterval(fetcher,7000)
    return ()=>{ mounted=false; clearInterval(id)}
  },[])

  return (
    <div className={`page dashboard ${alert? 'alert':''}`}>
      <div className="hamburger">☰</div>
      <div className="map card">
        <div className="map-visual">Interactive Map (glowing dots)</div>
      </div>
      <div className="metrics">
        <div className="metric">Temp: <strong>{data?.temp ?? '—'}°C</strong></div>
        <div className="metric">Load: <strong>{data?.server_load ?? '—'}%</strong></div>
        <div className="metric">Tasks: <strong>{data?.tasks ?? '—'}</strong></div>
      </div>
    </div>
  )
}
