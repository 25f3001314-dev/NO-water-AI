import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    console.log('🚀 Jal-Drishti Demo Mode - Direct Dashboard Access');

    // Simulate authentication delay
    setTimeout(() => {
      const mockUser = {
        username: username || 'admin',
        company: 'Jal-Drishti',
        role: 'Officer'
      };

      localStorage.setItem('auth_token', 'jal-drishti-demo-token-2024');
      localStorage.setItem('user_info', JSON.stringify(mockUser));
      
      console.log('✅ Login Success - Dashboard Ready!');
      onLoginSuccess({ token: 'demo-token', user: mockUser });
      
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_50%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.12),transparent_50%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-2 text-cyan-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Officer Login - Jal-Drishti</h2>
            <p className="text-xs text-slate-400">Enterprise AI Climate & Water Control Center</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Officer Username</label>
            <input
              type="text"
              placeholder="Enter officer username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {loading ? 'Authenticating Officer...' : 'Enter Control Center'}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">Demo officer credential: admin / admin123</p>
      </div>
    </div>
  );
};

export default Login;
