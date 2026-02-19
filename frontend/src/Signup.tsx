import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

export default function Signup({ onComplete }: { onComplete?: () => void }){
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const submit = (e:any)=>{
    e.preventDefault();
    if(onComplete) onComplete();
    navigate('/dashboard');
  }

  return (
    <div className="page center">
      <form className="glass card form" onSubmit={submit}>
        <h2 className="neon-blue">Officer Login</h2>
        <input className="input" placeholder="Officer ID" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Password" type="password" />
        <button className="btn neon-btn" type="submit">Enter</button>
      </form>
    </div>
  )
}
