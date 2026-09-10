import React from 'react';
import { Layers, Smartphone, Monitor, Tablet } from 'lucide-react';

interface InsightsDeviceBreakdownProps {
  deviceCounts: { Mobile: number; Desktop: number; Tablet: number };
  totalLogsCount: number;
}

export const InsightsDeviceBreakdown: React.FC<InsightsDeviceBreakdownProps> = ({
  deviceCounts,
  totalLogsCount
}) => {
  const mobilePct = totalLogsCount > 0 ? Math.round((deviceCounts.Mobile / totalLogsCount) * 100) : 0;
  const desktopPct = totalLogsCount > 0 ? Math.round((deviceCounts.Desktop / totalLogsCount) * 100) : 0;
  const tabletPct = totalLogsCount > 0 ? Math.round((deviceCounts.Tablet / totalLogsCount) * 100) : 0;

  return (
    <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Layers size={16} className="text-emerald-400" />
          Device Distribution
        </h4>

        <div className="flex flex-col gap-3">
          {/* Mobile */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 text-gray-300">
                <Smartphone size={13} className="text-cyan-400" /> Mobile
              </span>
              <span className="font-semibold text-cyan-400">{mobilePct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all"
                style={{ width: `${mobilePct}%` }}
              />
            </div>
          </div>

          {/* Desktop */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 text-gray-300">
                <Monitor size={13} className="text-emerald-400" /> Desktop
              </span>
              <span className="font-semibold text-emerald-400">{desktopPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${desktopPct}%` }}
              />
            </div>
          </div>

          {/* Tablet */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 text-gray-300">
                <Tablet size={13} className="text-violet-400" /> Tablet
              </span>
              <span className="font-semibold text-violet-400">{tabletPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-violet-400 rounded-full transition-all"
                style={{ width: `${tabletPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 text-[11px] text-gray-500">
        Analytics logged in real-time
      </div>
    </div>
  );
};
