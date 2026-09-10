import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, Download, RefreshCw, Globe } from 'lucide-react';
import type { QRCodeItem, ScanLog } from '../../types/qr';
import { fetchScanLogs } from '../../lib/supabase';
import { InsightsMetricsCards } from './components/InsightsMetricsCards';
import { InsightsTrendChart } from './components/InsightsTrendChart';
import { InsightsDeviceBreakdown } from './components/InsightsDeviceBreakdown';
import { InsightsLogsTable } from './components/InsightsLogsTable';

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
  const [hoveredBar, setHoveredBar] = useState<{ day: string; count: number; date: string; dateStr: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!item) return;
    setLoading(true);
    const data = await fetchScanLogs(item.id);
    setLogs(data);
    setLoading(false);
  }, [item]);

  useEffect(() => {
    if (isOpen && item) {
      loadData();
    }
  }, [isOpen, item, loadData]);

  if (!item) return null;

  // Aggregate stats
  const totalScans = Math.max(item.scans || 0, logs.length);
  const now = new Date();

  const last24h = logs.filter((l) => {
    const time = new Date(l.scanned_at).getTime();
    return now.getTime() - time <= 24 * 60 * 60 * 1000;
  }).length;

  const last7DaysCount = logs.filter((l) => {
    const time = new Date(l.scanned_at).getTime();
    return now.getTime() - time <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const deviceCounts: { Mobile: number; Desktop: number; Tablet: number } = { Mobile: 0, Desktop: 0, Tablet: 0 };
  logs.forEach((l) => {
    const d = l.device_type || 'Desktop';
    if (d in deviceCounts) {
      deviceCounts[d as keyof typeof deviceCounts]++;
    } else {
      deviceCounts.Desktop++;
    }
  });

  const topDevice: 'Mobile' | 'Desktop' | 'Tablet' = (Object.keys(deviceCounts) as Array<keyof typeof deviceCounts>).reduce(
    (a, b) => (deviceCounts[a] >= deviceCounts[b] ? a : b),
    'Desktop'
  );

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d0e16] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto z-10 text-white custom-scrollbar flex flex-col gap-6"
          >
            {/* Header Bar */}
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

            {/* Key Metrics Cards */}
            <InsightsMetricsCards
              totalScans={totalScans}
              last24h={last24h}
              last7DaysCount={last7DaysCount}
              topDevice={topDevice}
            />

            {/* 7-Day Velocity Chart & Device Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <InsightsTrendChart
                dailySeries={dailySeries}
                maxDailyCount={maxDailyCount}
                hoveredBar={hoveredBar}
                onHoverBar={setHoveredBar}
              />
              <InsightsDeviceBreakdown
                deviceCounts={deviceCounts}
                totalLogsCount={logs.length}
              />
            </div>

            {/* Scan Logs Table */}
            <InsightsLogsTable
              logs={logs}
              loading={loading}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
