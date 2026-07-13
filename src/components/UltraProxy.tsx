import React, { useState, useRef } from 'react';
import { Search, Globe, Shield, Zap, X, AlertTriangle, ArrowLeft, Settings, Check } from 'lucide-react';

interface UltraProxyProps {
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

const UltraProxy: React.FC<UltraProxyProps> = ({ 
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

  // Settings states inside UltraProxy
  const [showSettings, setShowSettings] = useState(false);
  const [localType, setLocalType] = useState<'wisp' | 'bare'>(transportType);
  const [localUrl, setLocalUrl] = useState(serverUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
    } else {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
    }

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
                  onClick={() => selectPreset('wisp', 'wss://anura.pro/wisp/')}
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
                      onClick={() => setLocalUrl('wss://anura.pro/wisp/')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        localUrl === 'wss://anura.pro/wisp/'
                          ? 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff]'
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Anura (Recommended)
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
          </form>
        </div>
      </div>
    );
  };

  if (isProxying) {
    return (
      <>
        <div className="fixed inset-0 w-full h-full bg-black z-50 flex flex-col">
          <div className="bg-[#0a0a0a] border-b border-[#00f2ff]/20 p-2 flex items-center justify-between">
            <div className="flex items-center gap-4 px-4 overflow-hidden">
              <span className="text-[#00f2ff] font-bold text-sm truncate max-w-[200px] md:max-w-md">
                {url}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                title="Proxy Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={closeProxy}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                title="Close Proxy"
              >
                <X size={20} />
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
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f2ff]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[50%] h-[50%] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Settings Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center justify-center w-10 h-10 bg-[#0a0a0a] hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
          title="Proxy Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      <main className="w-full max-w-3xl flex flex-col items-center gap-12 z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00f2ff] blur-[25px] opacity-30 animate-pulse" />
            <Globe size={80} className="text-[#00f2ff] relative" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-white to-[#7000ff]">
            ULTRA<span className="text-white">PROXY</span>
          </h1>
          <p className="text-gray-400 max-w-md text-sm md:text-lg leading-relaxed">
            Universal Web Emulator. Bypass ISP blocks for <span className="text-white font-semibold">YouTube</span>, <span className="text-white font-semibold">Facebook</span>, and beyond.
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="w-full">
          <form onSubmit={handleSearch} className="w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] rounded-2xl blur-md opacity-20 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center p-2 shadow-2xl overflow-hidden">
              <div className="px-4 text-gray-500">
                <Search size={24} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL or search freely..."
                className="w-full bg-transparent border-none outline-none text-lg py-4 pr-4 text-white placeholder-gray-600 font-medium animate-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#00f2ff] to-[#7000ff] hover:brightness-110 active:scale-95 text-white font-bold py-3 px-10 rounded-xl transition-all duration-200 shadow-lg shadow-[#00f2ff]/10"
              >
                GO
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-400 text-sm font-medium">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl hover:border-[#00f2ff]/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-[#00f2ff]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={28} className="text-[#00f2ff]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Stream HD</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Full support for YouTube and Facebook video streaming.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl hover:border-[#7000ff]/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-[#7000ff]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield size={28} className="text-[#7000ff]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Encrypted</h3>
            <p className="text-sm text-gray-500 leading-relaxed">XOR-based URL obfuscation to hide browsing intent.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl hover:border-white/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">No CORS</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Seamless loading of complex dynamic SPA applications.</p>
          </div>
        </div>
      </main>

      {/* Settings Modal overlay inside UltraProxy */}
      {renderSettingsModal()}
    </div>
  );
};

export default UltraProxy;
