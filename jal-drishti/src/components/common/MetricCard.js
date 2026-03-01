import React from 'react';
import StatusBadge from './StatusBadge';

const MetricCard = ({ title, value, helper, status, children }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition duration-300 hover:border-cyan-500/40">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm text-slate-400">{title}</p>
        {status && <StatusBadge value={status} />}
      </div>
      <p className="text-2xl font-semibold text-slate-100">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
      {children}
    </div>
  );
};

export default MetricCard;
