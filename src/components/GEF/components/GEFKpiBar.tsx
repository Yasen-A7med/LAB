import React from 'react';
import type { TargetEntity } from '../types';

interface GEFKpiBarProps {
  targets: TargetEntity[];
}

export const GEFKpiBar: React.FC<GEFKpiBarProps> = ({ targets }) => {
  const total = targets.length;
  const academies = targets.filter(t => t.category === 'Catwalk Academy & Runway Training').length;
  const boutiques = targets.filter(t => t.category === 'Boutique Modeling Agency').length;
  const casting = targets.filter(t => t.category === 'Casting Agency & Talent Hub').length;
  const agreed = targets.filter(t => t.status === 'Agreed').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md">
        <div className="text-2xl font-extrabold text-white">{total}</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">Total Targets</div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-md">
        <div className="text-2xl font-extrabold text-amber-400">{academies}</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">Catwalk Academies</div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-md">
        <div className="text-2xl font-extrabold text-emerald-400">{boutiques}</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">Boutique Agencies</div>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 backdrop-blur-md">
        <div className="text-2xl font-extrabold text-blue-400">{casting}</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-1">Casting & Youth Hubs</div>
      </div>

      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-md col-span-2 sm:col-span-1">
        <div className="text-2xl font-extrabold text-emerald-300 flex items-center gap-2">
          <span>{agreed}</span>
          {agreed > 0 && <span className="text-base animate-bounce">🎉</span>}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80 mt-1">Confirmed Partners</div>
      </div>
    </div>
  );
};
