import React, { useState } from 'react';

const Login = ({ setIsLoggedIn }) => {
  const [company, setCompany] = useState('');
  const [rank, setRank] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Dummy check: company="TechCorp", rank="Engineer", pass="123"
    if (company === 'TechCorp' && rank === 'Engineer' && password === '123') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
      <div className="bg-black/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold mb-8 text-center">Jal-Drishti Login</h2>
        <input type="text" placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full p-4 mb-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50" />
        <input type="text" placeholder="Rank in Company" value={rank} onChange={(e) => setRank(e.target.value)} className="w-full p-4 mb-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 mb-8 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50" />
        <button onClick={handleLogin} className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700">Login</button>
      </div>
    </div>
  );
};

export default Login;
