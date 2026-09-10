import React, { useState } from 'react';
import { Bug, X, Copy, CheckCircle } from 'lucide-react';
import type { TransportType, ProxyLogEntry } from '../types';

interface ProxyDebugDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transportType: TransportType;
  serverUrl: string;
  swStatus: string;
  logs: ProxyLogEntry[];
}

export const ProxyDebugDrawer: React.FC<ProxyDebugDrawerProps> = ({
  isOpen,
  onClose,
  transportType,
  serverUrl,
  swStatus,
  logs
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const lastWorking = localStorage.getItem('proxy_last_working_transport') || 'not set';
  const savedType = localStorage.getItem('proxy_transport_type') || 'not set';
  const savedUrl = localStorage.getItem('proxy_server_url') || 'not set';

  const getDebugInfo = () => {
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      transport: {
        currentType: transportType,
        currentUrl: serverUrl,
        lastWorking,
        savedType,
        savedUrl
      },
      serviceWorker: {
        supported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
        controller: typeof navigator !== 'undefined' && navigator.serviceWorker?.controller ? 'active' : 'none'
      },
      logs
    };
    return JSON.stringify(info, null, 2);
  };

  const copyDebugInfo = () => {
    navigator.clipboard.writeText(getDebugInfo()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl relative text-white flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center gap-2">
          <Bug size={20} /> Diagnostics
        </h3>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Active Transport</div>
            <div className={`text-sm font-bold ${(localStorage.getItem('proxy_last_working_transport') || transportType) === 'bare' ? 'text-purple-400' : 'text-cyan-400'}`}>
              {(localStorage.getItem('proxy_last_working_transport') || transportType).toUpperCase()}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Last Working</div>
            <div className="text-sm font-bold text-green-400">
              {lastWorking !== 'not set' ? lastWorking : '—'}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 col-span-2">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Server URL</div>
            <div className="text-xs font-mono text-gray-300 break-all">{serverUrl}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-[10px] text-gray-500 uppercase font-bold">Service Worker</div>
            <div className={`text-sm font-bold ${swStatus.includes('✓') || swStatus.includes('activated') ? 'text-green-400' : 'text-red-400'}`}>
              {swStatus}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-[10px] text-gray-500 uppercase font-bold">WebSocket</div>
            <div className="text-sm font-bold">
              {typeof window !== 'undefined' && 'WebSocket' in window
                ? <span className="text-green-400">Supported</span>
                : <span className="text-red-400">Blocked</span>}
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Connection Logs</div>
        <div className="flex-1 overflow-y-auto bg-black/50 rounded-xl p-3 mb-4 font-mono text-[11px] space-y-1 min-h-[120px] max-h-[200px]">
          {logs.length === 0 ? (
            <div className="text-gray-600 italic">No logs yet. Reload the page to see connection diagnostics.</div>
          ) : (
            logs.map((item, i) => (
              <div key={i} className={`${
                item.type === 'error' ? 'text-red-400' :
                item.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
              }`}>
                <span className="text-gray-600">[{item.time}]</span> {item.msg}
              </div>
            ))
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={copyDebugInfo}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:brightness-110 active:scale-95 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-black"
        >
          {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy Full Debug Info</>}
        </button>
      </div>
    </div>
  );
};
