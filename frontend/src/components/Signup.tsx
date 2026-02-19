import React from 'react'
import './component.css'

export default function Signup({onEnter}:{onEnter:()=>void}){
  return (
    <div className="page signup">
      <div className="glass">
        <h2 className="neon">💧 Jal-Drishti Officer Access</h2>
        <p className="muted">Officer Signup — Premium Entrance</p>
        <div className="form">
          <input placeholder="Officer ID" className="input" />
          <input placeholder="Department" className="input" />
          <div className="biometric">
            <div className="scan">🔒</div>
            <div>Biometric Access</div>
          </div>
          <button className="enter" onClick={onEnter}>Enter System</button>
        </div>
      </div>
    </div>
  )
}
