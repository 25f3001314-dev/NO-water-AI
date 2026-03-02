import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Clock3, Droplets, LogOut, ShieldCheck } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const AppShell = ({ now, user, onLogout, children }) => {
  const navItems = [
    { to: '/control-center', label: 'Climate Control Center' },
    { to: '/chip-cooling-research', label: 'Chip Cooling Research' },
    { to: '/heat-reuse-solar-impact', label: 'Heat Reuse & Solar Impact' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-300">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-wide text-cyan-300 md:text-base">
                  AI-Driven Climate & Water Optimized Cloud Architecture (India)
                </h1>
                <p className="text-xs text-slate-400">Jal-Drishti Enterprise Control Room</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
                <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
                {now.toLocaleString('en-IN', { hour12: false })}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
                <Activity className="h-3.5 w-3.5 text-emerald-300" />
                <StatusBadge value="Active" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                Officer: {user?.username}
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg border px-3 py-2 text-sm transition ${
                    isActive
                      ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
};

export default AppShell;
