import React from 'react';

const SectionCard = ({ title, subtitle, rightContent, children, className = '' }) => {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/20 backdrop-blur ${className}`}>
      {(title || subtitle || rightContent) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
          {rightContent}
        </div>
      )}
      {children}
    </section>
  );
};

export default SectionCard;
