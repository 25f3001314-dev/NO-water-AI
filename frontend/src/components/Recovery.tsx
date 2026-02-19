import React, { useEffect, useState } from 'react'
import { getHeatRecovery } from '../api'
import './component.css'

export default function Recovery(){
  const [data, setData] = useState<any>(null)
  useEffect(()=>{
    let mounted=true
    getHeatRecovery().then(d=>{ if(mounted) setData(d) })
    const id = setInterval(()=> getHeatRecovery().then(d=>{ if(mounted) setData(d) }), 8000)
    return ()=>{ mounted=false; clearInterval(id)}
  },[])
  return (
    <div className="page recovery">
      <div className="flow card">
        <div className="server">Server Heat</div>
        <div className="wave">~ liquid flow ~</div>
        <div className="panel">Solar Panel</div>
      </div>
      <div className="charts card">
        <h3>Recovery Metrics</h3>
        <pre>{JSON.stringify(data,null,2)}</pre>
      </div>
    </div>
  )
}
