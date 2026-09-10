import React from 'react';
import { Clock, Loader2, Smartphone, Tablet, Monitor } from 'lucide-react';
import type { ScanLog } from '../../../types/qr';

interface InsightsLogsTableProps {
  logs: ScanLog[];
  loading: boolean;
}

export const InsightsLogsTable: React.FC<InsightsLogsTableProps> = ({
  logs,
  loading
}) => {
  return (
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
  );
};
