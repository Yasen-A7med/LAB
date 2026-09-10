import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface DailySeriesItem {
  day: string;
  date: string;
  count: number;
  dateStr: string;
}

interface InsightsTrendChartProps {
  dailySeries: DailySeriesItem[];
  maxDailyCount: number;
  hoveredBar: DailySeriesItem | null;
  onHoverBar: (item: DailySeriesItem | null) => void;
}

export const InsightsTrendChart: React.FC<InsightsTrendChartProps> = ({
  dailySeries,
  maxDailyCount,
  hoveredBar,
  onHoverBar
}) => {
  return (
    <div className="lg:col-span-2 p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" />
            Scan Activity (Last 7 Days)
          </h4>
          <p className="text-[11px] text-gray-400 font-light">Hover over bars to inspect daily metrics</p>
        </div>
        {hoveredBar && (
          <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            {hoveredBar.date}: {hoveredBar.count} scan{hoveredBar.count !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* SVG / Animated Bars */}
      <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 relative">
        {dailySeries.map((s, idx) => {
          const heightPercent = Math.max((s.count / maxDailyCount) * 100, 8);
          return (
            <div
              key={idx}
              onMouseEnter={() => onHoverBar(s)}
              onMouseLeave={() => onHoverBar(null)}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
            >
              <div className="w-full max-w-[36px] bg-white/[0.04] rounded-xl h-full flex items-end overflow-hidden p-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="w-full rounded-lg bg-gradient-to-t from-cyan-600 via-cyan-400 to-emerald-400 group-hover:brightness-125 transition-all"
                />
              </div>

              <span className="text-[11px] text-gray-400 font-mono mt-2 group-hover:text-cyan-300 transition-colors">
                {s.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
