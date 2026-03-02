import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { configService } from './services/configService';
import AppShell from './components/layout/AppShell';
import ChipCooling from './pages/ChipCooling';
import Dashboard from './pages/Dashboard';
import HeatRecovery from './pages/HeatRecovery';
import Login from './pages/Login';

function App() {
  const [sessionToken, setSessionToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Initialize config service at app startup
    (async () => {
      await configService.initialize();
      console.log('✅ App: ConfigService initialized');
    })();

    const token = localStorage.getItem('auth_token') || '';
    const rawUser = localStorage.getItem('user_info');

    if (token && rawUser) {
      setSessionToken(token);
      setUserInfo(JSON.parse(rawUser));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = ({ token, user }) => {
    setSessionToken(token);
    setUserInfo(user);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      try {
        const apiUrl = configService.get('REACT_APP_API_URL') || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setSessionToken('');
    setUserInfo(null);
  };

  const isAuthenticated = Boolean(sessionToken && userInfo);
  const isOfficer = String(userInfo?.role || '').toLowerCase() === 'officer';

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      ) : !isOfficer ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <h2 className="text-xl font-semibold text-red-300">Officer Access Required</h2>
            <p className="mt-2 text-sm text-slate-300">
              Only officer accounts can access the Jal-Drishti enterprise dashboard.
            </p>
            <button
              onClick={handleLogout}
              className="mt-5 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/25"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <AppShell now={now} user={userInfo} onLogout={handleLogout}>
          <Routes>
            <Route path="/control-center" element={<Dashboard />} />
            <Route path="/chip-cooling-research" element={<ChipCooling />} />
            <Route path="/heat-reuse-solar-impact" element={<HeatRecovery />} />
            <Route path="/dashboard" element={<Navigate to="/control-center" replace />} />
            <Route path="/chip-cooling" element={<Navigate to="/chip-cooling-research" replace />} />
            <Route path="/heat-recovery" element={<Navigate to="/heat-reuse-solar-impact" replace />} />
            <Route path="*" element={<Navigate to="/control-center" replace />} />
          </Routes>
        </AppShell>
      )}
    </Router>
  );
}

export default App;
