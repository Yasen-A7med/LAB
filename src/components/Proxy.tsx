import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, Shield, Zap, X, AlertTriangle, ArrowLeft, Settings, Check, Bug, Copy, CheckCircle } from 'lucide-react';

interface ProxyProps {
  onBack: () => void;
  transportType: 'wisp' | 'bare';
  serverUrl: string;
  onUpdateConfig: (type: 'wisp' | 'bare', url: string) => Promise<void>;
}

// UV Encoding function (XOR)
function encodeUVUrl(url: string): string {
  if (!url) return '';
  return encodeURIComponent(
    url
      .split('')
      .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char))
      .join('')
  );
}

const Proxy: React.FC<ProxyProps> = ({ 
  onBack,
  transportType,
  serverUrl,
  onUpdateConfig
}) => {
  const [url, setUrl] = useState('');
  const [isProxying, setIsProxying] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Settings states inside Proxy
  const [showSettings, setShowSettings] = useState(false);
  const [localType, setLocalType] = useState<'wisp' | 'bare'>(transportType);
  const [localUrl, setLocalUrl] = useState(serverUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Debug panel state
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<{time: string, type: string, msg: string}[]>([]);
  const [copied, setCopied] = useState(false);
  const [swStatus, setSwStatus] = useState<string>('checking...');

  // Check actual SW registration status
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setSwStatus('Not supported');
      return;
    }
    const checkSW = async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      const uvReg = regs.find(r => r.scope.includes('/uv/service'));
      if (uvReg) {
        const sw = uvReg.active || uvReg.installing || uvReg.waiting;
        setSwStatus(sw ? `${sw.state} ✓` : 'Registered (no worker)');
      } else {
        setSwStatus('Not registered ✗');
      }
    };
    checkSW();
    const interval = setInterval(checkSW, 3000);
    return () => clearInterval(interval);
  }, []);

  // Capture console logs related to UV/proxy
  useEffect(() => {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    const addLog = (type: string, args: any[]) => {
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      if (msg.includes('UV ') || msg.includes('Transport') || msg.includes('Bare') || msg.includes('bare') || msg.includes('wisp') || msg.includes('Wisp') || msg.includes('bare-mux') || msg.includes('setup') || msg.includes('WebSocket')) {
        setDebugLogs(prev => [...prev.slice(-100), { time: new Date().toLocaleTimeString(), type, msg }]);
      }
    };
    console.log = (...args: any[]) => { origLog(...args); addLog('log', args); };
    console.warn = (...args: any[]) => { origWarn(...args); addLog('warn', args); };
    console.error = (...args: any[]) => { origError(...args); addLog('error', args); };
    return () => { console.log = origLog; console.warn = origWarn; console.error = origError; };
  }, []);

  const getDebugInfo = () => {
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      transport: {
        currentType: transportType,
        currentUrl: serverUrl,
        lastWorking: localStorage.getItem('proxy_last_working_transport') || 'not set',
        savedType: localStorage.getItem('proxy_transport_type') || 'not set',
        savedUrl: localStorage.getItem('proxy_server_url') || 'not set',
      },
      serviceWorker: {
        supported: 'serviceWorker' in navigator,
        controller: navigator.serviceWorker?.controller ? 'active' : 'none',
      },
      logs: debugLogs,
    };
    return JSON.stringify(info, null, 2);
  };

  const copyDebugInfo = () => {
    navigator.clipboard.writeText(getDebugInfo()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderDebugPanel = () => {
    if (!showDebug) return null;
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-w-lg max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl relative text-white flex flex-col">
          <button
            onClick={() => setShowDebug(false)}
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
                {localStorage.getItem('proxy_last_working_transport') || '—'}
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
                {'WebSocket' in window
                  ? <span className="text-green-400">Supported</span>
                  : <span className="text-red-400">Blocked</span>}
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">Connection Logs</div>
          <div className="flex-1 overflow-y-auto bg-black/50 rounded-xl p-3 mb-4 font-mono text-[11px] space-y-1 min-h-[120px] max-h-[200px]">
            {debugLogs.length === 0 ? (
              <div className="text-gray-600 italic">No logs yet. Reload the page to see connection diagnostics.</div>
            ) : (
              debugLogs.map((log, i) => (
                <div key={i} className={`${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
                }`}>
                  <span className="text-gray-600">[{log.time}]</span> {log.msg}
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    let formattedUrl = localUrl.trim();
    if (localType === 'wisp') {
      if (formattedUrl.startsWith('http://') || formattedUrl.startsWith('https://')) {
        setSaveError('Wisp transport requires a WebSocket URL (ws:// or wss://)');
        setIsSaving(false);
        return;
      }
      if (!formattedUrl.startsWith('ws://') && !formattedUrl.startsWith('wss://')) {
        formattedUrl = 'wss://' + formattedUrl;
      }
    } else {
      if (formattedUrl.startsWith('ws://') || formattedUrl.startsWith('wss://')) {
        setSaveError('Bare transport requires an HTTP URL (http:// or https://)');
        setIsSaving(false);
        return;
      }
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }
    }

    try {
      await onUpdateConfig(localType, formattedUrl);
      setLocalUrl(formattedUrl);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSettings(false);
      }, 1000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectPreset = (type: 'wisp' | 'bare', url: string) => {
    setLocalType(type);
    setLocalUrl(url);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url) return;

    let targetUrl = url.trim();

    // Simple search engine logic if not a valid URL
    if (!targetUrl.includes('.') || targetUrl.includes(' ')) {
      targetUrl = `https://duckduckgo.com/?q=${encodeURIComponent(targetUrl)}`;
    } else {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
    }

    try {
      const parsedUrl = new URL(targetUrl);
      if (parsedUrl.hostname === 'facebook.com' || parsedUrl.hostname === 'www.facebook.com') {
        parsedUrl.hostname = 'm.facebook.com';
        targetUrl = parsedUrl.toString();
      }
    } catch (err) {}

    try {
      const encodedUrl = encodeUVUrl(targetUrl);
      setProxyUrl(`/uv/service/${encodedUrl}`);
      setIsProxying(true);
    } catch (err) {
      setError('Failed to encode URL.');
    }
  };

  const launchTarget = (targetUrl: string) => {
    setError(null);
    setUrl(targetUrl);
    try {
      const encodedUrl = encodeUVUrl(targetUrl);
      setProxyUrl(`/uv/service/${encodedUrl}`);
      setIsProxying(true);
    } catch (err) {
      setError('Failed to encode URL.');
    }
  };

  const closeProxy = () => {
    setIsProxying(false);
    setProxyUrl('');
  };

  const renderSettingsModal = () => {
    if (!showSettings) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative text-white">
          <button
            onClick={() => setShowSettings(false)}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>

          <h3 className="text-2xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#7000ff]">
            Proxy Configuration
          </h3>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Transport Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => selectPreset('wisp', 'wss://nebulaproxy.io/wisp/')}
                  className={`py-3 px-4 rounded-xl border font-bold transition-all ${
                    localType === 'wisp'
                      ? 'bg-[#00f2ff]/10 border-[#00f2ff] text-[#00f2ff]'
                      : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Wisp (WebSockets)
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset('bare', 'https://bare.z1g.top/')}
                  className={`py-3 px-4 rounded-xl border font-bold transition-all ${
                    localType === 'bare'
                      ? 'bg-[#7000ff]/10 border-[#7000ff] text-[#7000ff]'
                      : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Bare (HTTP)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Preset Servers</label>
              <div className="flex flex-wrap gap-2">
                {localType === 'wisp' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setLocalUrl('wss://nebulaproxy.io/wisp/')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        localUrl === 'wss://nebulaproxy.io/wisp/'
                          ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]'
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Nebula (Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalUrl('wss://anura.pro/wisp/')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        localUrl === 'wss://anura.pro/wisp/'
                          ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]'
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Anura
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalUrl('wss://wisp.mercurywork.shop/')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        localUrl === 'wss://wisp.mercurywork.shop/'
                          ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]'
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Mercury Workshop
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setLocalUrl('https://bare.z1g.top/')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        localUrl === 'https://bare.z1g.top/'
                          ? 'bg-[#7000ff]/10 border-[#7000ff]/30 text-[#7000ff]'
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      z1g
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Server URL</label>
              <input
                type="text"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                placeholder={localType === 'wisp' ? 'wss://...' : 'https://...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00f2ff]/50 transition-colors"
                required
              />
            </div>

            {saveError && <div className="text-red-400 text-xs font-medium">{saveError}</div>}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] hover:brightness-110 active:scale-95 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isSaving ? (
                <span>Applying...</span>
              ) : saveSuccess ? (
                <>
                  <Check size={18} />
                  <span>Configuration Saved!</span>
                </>
              ) : (
                <span>Save Config</span>
              )}
            </button>

            <button
              type="button"
              onClick={async () => {
                if (!confirm('This will clear all saved settings and reload the page. Continue?')) return;
                localStorage.clear();
                const regs = await navigator.serviceWorker.getRegistrations();
                for (const r of regs) await r.unregister();
                if ('caches' in window) {
                  const keys = await caches.keys();
                  for (const k of keys) await caches.delete(k);
                }
                window.location.reload();
              }}
              className="w-full py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 active:scale-95 text-red-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle size={16} />
              <span>Reset All Data</span>
            </button>
          </form>
        </div>
      </div>
    );
  };

  if (isProxying) {
    return (
      <>
        <div className="fixed inset-0 w-full h-full bg-black z-50 flex flex-col">
          <div className="bg-[#0a0a0a] border-b border-[#00f2ff]/20 px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 overflow-hidden min-w-0 flex-1">
              <span className="text-[#00f2ff] font-bold text-xs sm:text-sm truncate">
                {url}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => setShowDebug(true)}
                className="p-2.5 sm:p-2 hover:bg-yellow-500/10 active:bg-yellow-500/10 rounded-full transition-colors text-gray-400 hover:text-yellow-400 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Diagnostics"
              >
                <Bug size={18} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 sm:p-2 hover:bg-white/10 active:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Proxy Settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={closeProxy}
                className="p-2.5 sm:p-2 hover:bg-white/10 active:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Close Proxy"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <iframe
            ref={iframeRef}
            src={proxyUrl}
            className="flex-1 w-full border-none bg-white"
            title="Proxy Content"
          />
        </div>
        {renderSettingsModal()}
        {renderDebugPanel()}
      </>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#050505] text-white flex flex-col items-center justify-center px-4 sm:px-6 py-20 sm:py-6 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[50%] h-[60%] sm:h-[50%] bg-[#00f2ff]/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] sm:right-[20%] w-[60%] sm:w-[50%] h-[60%] sm:h-[50%] bg-[#7000ff]/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-[#0a0a0a] hover:bg-white/5 active:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all duration-200 min-h-[44px]"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Dashboard</span>
        </button>
      </div>

      {/* Settings & Debug Buttons */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex gap-2">
        <button
          onClick={() => setShowDebug(true)}
          className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 bg-[#0a0a0a] hover:bg-yellow-500/10 active:bg-yellow-500/10 border border-white/10 rounded-xl text-gray-400 hover:text-yellow-400 transition-all duration-200"
          title="Diagnostics"
        >
          <Bug size={18} />
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 bg-[#0a0a0a] hover:bg-white/5 active:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
          title="Proxy Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      <main className="w-full max-w-3xl flex flex-col items-center gap-8 sm:gap-12 z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00f2ff] blur-[20px] sm:blur-[25px] opacity-30 animate-pulse" />
            <Globe size={60} className="text-[#00f2ff] relative sm:hidden" />
            <Globe size={80} className="text-[#00f2ff] relative hidden sm:block" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-white to-[#7000ff]">
            WEB<span className="text-white">PROXY</span>
          </h1>
          <p className="text-gray-400 max-w-md text-[13px] sm:text-sm md:text-lg leading-relaxed px-2 sm:px-0">
            Universal Web Emulator. Bypass ISP blocks for <span className="text-white font-semibold">YouTube</span>, <span className="text-white font-semibold">Facebook</span>, and beyond.
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="w-full">
          <form onSubmit={handleSearch} className="w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] rounded-2xl blur-md opacity-20 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center p-2 shadow-2xl overflow-hidden gap-2 sm:gap-0">
              <div className="flex items-center flex-1">
                <div className="px-3 sm:px-4 text-gray-500">
                  <Search size={20} className="sm:hidden" />
                  <Search size={24} className="hidden sm:block" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL or search..."
                  className="w-full bg-transparent border-none outline-none text-base sm:text-lg py-3 sm:py-4 pr-3 sm:pr-4 text-white placeholder-gray-600 font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-[#00f2ff] to-[#7000ff] hover:brightness-110 active:scale-[0.98] text-white font-bold py-3 sm:py-3 px-8 sm:px-10 rounded-xl transition-all duration-200 shadow-lg shadow-[#00f2ff]/10 min-h-[44px] text-sm sm:text-base"
              >
                GO
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-red-400 text-xs sm:text-sm font-medium">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => launchTarget('https://m.facebook.com')}
              className="px-3.5 py-1.5 rounded-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Facebook</span>
            </button>
            <button
              onClick={() => launchTarget('https://www.youtube.com')}
              className="px-3.5 py-1.5 rounded-full bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>YouTube</span>
            </button>
            <button
              onClick={() => launchTarget('https://www.google.com')}
              className="px-3.5 py-1.5 rounded-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Google</span>
            </button>
            <button
              onClick={() => launchTarget('https://duckduckgo.com')}
              className="px-3.5 py-1.5 rounded-full bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>DuckDuckGo</span>
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
          <div className="bg-[#0a0a0a] border border-white/5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-[#00f2ff]/30 active:border-[#00f2ff]/30 transition-all duration-300 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00f2ff]/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Zap size={22} className="text-[#00f2ff]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">Stream HD</h3>
            <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed">Full support for YouTube and Facebook video streaming.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-[#7000ff]/30 active:border-[#7000ff]/30 transition-all duration-300 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7000ff]/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Shield size={22} className="text-[#7000ff]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">Encrypted</h3>
            <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed">XOR-based URL obfuscation to hide browsing intent.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-white/20 active:border-white/20 transition-all duration-300 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Globe size={22} className="text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">No CORS</h3>
            <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed">Seamless loading of complex dynamic SPA applications.</p>
          </div>
        </div>
      </main>

      {/* Settings & Debug Modal overlays */}
      {renderSettingsModal()}
      {renderDebugPanel()}
    </div>
  );
};

export default Proxy;
