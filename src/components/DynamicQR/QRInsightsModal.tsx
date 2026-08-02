import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BarChart2,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Clock,
  Download,
  RefreshCw,
  Globe,
  Loader2,
  Activity,
  Layers,
} from 'lucide-react';
import type { QRCodeItem, ScanLog } from '../../types/qr';
import { fetchScanLogs } from '../../lib/supabase';

interface QRInsightsModalProps {
  isOpen: boolean;
  item: QRCodeItem | null;
  onClose: () => void;
}

export const QRInsightsModal: React.FC<QRInsightsModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<{ day: string; count: number; date: string } | null>(null);

  const loadData = async () => {
    if (!item) return;
    setLoading(true);
    const data = await fetchScanLogs(item.id);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && item) {
      loadData();
    }
  }, [isOpen, item]);

  if (!item) return null;

  // Compute analytics
  const totalScans = Math.max(item.scans || 0, logs.length);
  const now = new Date();

  // Scans in last 24h
  const last24h = logs.filter((l) => {
    const time = new Date(l.scanned_at).getTime();
    return now.getTime() - time <= 24 * 60 * 60 * 1000;
  }).length;

  // Scans in last 7 days
  const last7DaysLogs = logs.filter((l) => {
    const time = new Date(l.scanned_at).getTime();
    return now.getTime() - time <= 7 * 24 * 60 * 60 * 1000;
  });
  const last7DaysCount = last7DaysLogs.length;

  // Device Breakdown
  const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
  logs.forEach((l) => {
    const d = l.device_type || 'Desktop';
    if (deviceCounts[d] !== undefined) {
      deviceCounts[d]++;
    } else {
      deviceCounts.Desktop++;
    }
  });

  const topDevice = (Object.keys(deviceCounts) as Array<keyof typeof deviceCounts>).reduce(
    (a, b) => (deviceCounts[a] >= deviceCounts[b] ? a : b),
    'Desktop'
  );

  // Generate 7-day daily series data
  const dailySeries = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const count = logs.filter((l) => l.scanned_at.startsWith(dateStr)).length;
    return { day: dayLabel, date: formattedDate, count, dateStr };
  });

  const maxDailyCount = Math.max(...dailySeries.map((s) => s.count), 1);

  // Export CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Scan ID', 'Timestamp', 'Device', 'Browser', 'OS', 'Referrer'];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.scanned_at).toLocaleString(),
      l.device_type,
      l.browser,
      l.os,
      l.referrer || 'Direct',
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_${item.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d0e16] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto z-10 text-white custom-scrollbar flex flex-col gap-6"
          >
            {/* ──────── Header Bar ──────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <BarChart2 size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono">
                      /r/{item.id}
                    </span>
                  </div>
                  <a
                    href={item.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-emerald-400 flex items-center gap-1 mt-0.5 truncate max-w-md"
                  >
                    <Globe size={11} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{item.target_url}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={loadData}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Refresh analytics data"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={logs.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                  title="Export Scan Logs CSV"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ──────── Key Metrics Cards Grid ──────── */}
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

              {/* Card 2: Today Scans */}
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

              {/* Card 4: Primary Device */}
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

            {/* ──────── 7-Day Velocity Chart & Device Breakdown ──────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Scan Trend Chart (Spans 2 cols) */}
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

                {/* SVG Animated Chart */}
                <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 relative">
                  {dailySeries.map((s, idx) => {
                    const heightPercent = Math.max((s.count / maxDailyCount) * 100, 8);
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredBar(s)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        {/* Bar Container */}
                        <div className="w-full max-w-[36px] bg-white/[0.04] rounded-xl h-full flex items-end overflow-hidden p-1">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                            className="w-full rounded-lg bg-gradient-to-t from-cyan-600 via-cyan-400 to-emerald-400 group-hover:brightness-125 transition-all"
                          />
                        </div>

                        {/* Label */}
                        <span className="text-[11px] text-gray-400 font-mono mt-2 group-hover:text-cyan-300 transition-colors">
                          {s.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Device Breakdown */}
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
                        <span className="font-semibold text-cyan-400">
                          {logs.length > 0
                            ? Math.round((deviceCounts.Mobile / logs.length) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full transition-all"
                          style={{
                            width: `${
                              logs.length > 0
                                ? (deviceCounts.Mobile / logs.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Desktop */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <Monitor size={13} className="text-emerald-400" /> Desktop
                        </span>
                        <span className="font-semibold text-emerald-400">
                          {logs.length > 0
                            ? Math.round((deviceCounts.Desktop / logs.length) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all"
                          style={{
                            width: `${
                              logs.length > 0
                                ? (deviceCounts.Desktop / logs.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Tablet */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <Tablet size={13} className="text-violet-400" /> Tablet
                        </span>
                        <span className="font-semibold text-violet-400">
                          {logs.length > 0
                            ? Math.round((deviceCounts.Tablet / logs.length) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-violet-400 rounded-full transition-all"
                          style={{
                            width: `${
                              logs.length > 0
                                ? (deviceCounts.Tablet / logs.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 text-[11px] text-gray-500">
                  Analytics logged in real-time
                </div>
              </div>
            </div>

            {/* ──────── Scan Log Table / Activity Timeline ──────── */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock size={16} className="text-cyan-400" />
                  Recent Scan History Logs
                </h4>
                <span className="text-xs text-gray-400 font-mono">
                  {logs.length} total entries
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-cyan-400" />
                  <span>Loading scan logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <div className="text-xs text-gray-400">
                    No individual scan logs recorded yet. Scan or visit the QR short link to see real-time log activity!
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/10 sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="py-2.5 px-4">Timestamp</th>
                          <th className="py-2.5 px-4">Device</th>
                          <th className="py-2.5 px-4">Browser</th>
                          <th className="py-2.5 px-4">OS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        {logs.slice(0, 30).map((log) => {
                          const dateFormatted = new Date(log.scanned_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          return (
                            <tr key={log.id} className="hover:bg-white/[0.04] transition-colors">
                              <td className="py-2.5 px-4 font-mono text-cyan-300">{dateFormatted}</td>
                              <td className="py-2.5 px-4 font-medium flex items-center gap-1.5">
                                {log.device_type === 'Mobile' ? (
                                  <Smartphone size={13} className="text-cyan-400" />
                                ) : log.device_type === 'Tablet' ? (
                                  <Tablet size={13} className="text-violet-400" />
                                ) : (
                                  <Monitor size={13} className="text-emerald-400" />
                                )}
                                <span>{log.device_type}</span>
                              </td>
                              <td className="py-2.5 px-4">{log.browser}</td>
                              <td className="py-2.5 px-4 text-gray-400">{log.os}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
