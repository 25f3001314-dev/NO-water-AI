import React from 'react';

const STATUS_STYLES = {
  optimal: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  active: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
  'high cost': 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  critical: 'bg-red-500/15 text-red-300 border-red-500/40'
};

const StatusBadge = ({ value = 'Active' }) => {
  const key = String(value).toLowerCase();
  const style = STATUS_STYLES[key] || STATUS_STYLES.active;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${style}`}>
      {value}
    </span>
  );
};

export default StatusBadge;
