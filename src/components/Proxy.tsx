import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Zap, AlertTriangle, ArrowLeft, Settings, Bug } from 'lucide-react';
import type { ProxyProps, ProxyLogEntry } from './Proxy/types';
import { proxyLogger, encodeUVUrl } from './Proxy/utils/proxyLogger';
import { ProxyDebugDrawer } from './Proxy/components/ProxyDebugDrawer';
import { ProxySettingsModal } from './Proxy/components/ProxySettingsModal';
import { ProxyViewer } from './Proxy/components/ProxyViewer';

export const Proxy: React.FC<ProxyProps> = ({ 
  onBack,
  transportType,
  serverUrl,
  onUpdateConfig
}) => {
  const [url, setUrl] = useState('');
  const [isProxying, setIsProxying] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<ProxyLogEntry[]>([]);
  const [swStatus, setSwStatus] = useState<string>('checking...');

  // Safe subscription to proxy logger & console bridge
  useEffect(() => {
    const unsubBridge = proxyLogger.attachConsoleBridge();
    const unsubLogs = proxyLogger.subscribe((logs) => setDebugLogs(logs));
    return () => {
      unsubBridge();
      unsubLogs();
    };
  }, []);

  // Monitor service worker registration status
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
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

  const launchTarget = (targetUrl: string) => {
    setError(null);
    let finalUrl = targetUrl.trim();

    if (!finalUrl.includes('.') || finalUrl.includes(' ')) {
      finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(finalUrl)}`;
    } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      const parsedUrl = new URL(finalUrl);
      if (parsedUrl.hostname === 'facebook.com' || parsedUrl.hostname === 'www.facebook.com') {
        parsedUrl.hostname = 'm.facebook.com';
        finalUrl = parsedUrl.toString();
      }
    } catch {
      // ignore URL parsing error
    }

    try {
      const encodedUrl = encodeUVUrl(finalUrl);
      setUrl(finalUrl);
      setProxyUrl(`/uv/service/${encodedUrl}`);
      setIsProxying(true);
    } catch {
      setError('Failed to encode URL.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    launchTarget(url);
  };

  if (isProxying) {
    return (
      <>
        <ProxyViewer
          url={url}
          proxyUrl={proxyUrl}
          onClose={() => {
            setIsProxying(false);
            setProxyUrl('');
          }}
          onOpenDebug={() => setShowDebug(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
        <ProxySettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          initialType={transportType}
          initialUrl={serverUrl}
          onSaveConfig={onUpdateConfig}
        />
        <ProxyDebugDrawer
          isOpen={showDebug}
          onClose={() => setShowDebug(false)}
          transportType={transportType}
          serverUrl={serverUrl}
          swStatus={swStatus}
          logs={debugLogs}
        />
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
      <ProxySettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        initialType={transportType}
        initialUrl={serverUrl}
        onSaveConfig={onUpdateConfig}
      />
      <ProxyDebugDrawer
        isOpen={showDebug}
        onClose={() => setShowDebug(false)}
        transportType={transportType}
        serverUrl={serverUrl}
        swStatus={swStatus}
        logs={debugLogs}
      />
    </div>
  );
};

export default Proxy;
