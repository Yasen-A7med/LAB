import React from 'react';
import { Activity, TrendingUp, Clock, Calendar, Smartphone, Tablet, Monitor } from 'lucide-react';

interface InsightsMetricsCardsProps {
  totalScans: number;
  last24h: number;
  last7DaysCount: number;
  topDevice: 'Mobile' | 'Desktop' | 'Tablet';
}

export const InsightsMetricsCards: React.FC<InsightsMetricsCardsProps> = ({
  totalScans,
  last24h,
  last7DaysCount,
  topDevice
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Card 1: Total Scans */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Total Scans</span>
          <Activity size={15} className="text-cyan-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white">
          {totalScans}
        </div>
        <div className="text-[11px] text-cyan-400 font-medium mt-1 flex items-center gap-1">
          <TrendingUp size={12} />
          <span>Lifetime volume</span>
        </div>
      </div>

      {/* Card 2: Last 24 Hours */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Last 24 Hours</span>
          <Clock size={15} className="text-emerald-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
          {last24h}
        </div>
        <div className="text-[11px] text-gray-400 font-light mt-1">
          Recent interactions
        </div>
      </div>

      {/* Card 3: 7 Days Count */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Last 7 Days</span>
          <Calendar size={15} className="text-violet-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white">
          {last7DaysCount}
        </div>
        <div className="text-[11px] text-gray-400 font-light mt-1">
          Weekly activity
        </div>
      </div>

      {/* Card 4: Top Device */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Top Device</span>
          {topDevice === 'Mobile' ? (
            <Smartphone size={15} className="text-amber-400" />
          ) : topDevice === 'Tablet' ? (
            <Tablet size={15} className="text-amber-400" />
          ) : (
            <Monitor size={15} className="text-amber-400" />
          )}
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-amber-400 truncate">
          {topDevice}
        </div>
        <div className="text-[11px] text-gray-400 font-light mt-1">
          Most active origin
        </div>
      </div>
    </div>
  );
};
