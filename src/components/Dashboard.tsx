import React, { useState } from 'react';
import { 
  Globe, 
  Layers, 
  Zap, 
  Shield, 
  ChevronRight,
  Wifi,
  Settings,
  X,
  Check
} from 'lucide-react';

interface DashboardProps {
  onLaunch: (id: string) => void;
  swRegistered: boolean;
  transportType: 'wisp' | 'bare';
  serverUrl: string;
  onUpdateConfig: (type: 'wisp' | 'bare', url: string) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onLaunch, 
  swRegistered,
  transportType,
  serverUrl,
  onUpdateConfig
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [localType, setLocalType] = useState<'wisp' | 'bare'>(transportType);
  const [localUrl, setLocalUrl] = useState(serverUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await onUpdateConfig(localType, localUrl.trim());
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSettings(false);
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectPreset = (type: 'wisp' | 'bare', url: string) => {
    setLocalType(type);
    setLocalUrl(url);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-cyan-500/30 relative overflow-hidden flex flex-col">
      {/* 
        Ultra-Premium Ambient Background 
        Subtle, slow-moving glowing orbs for a dynamic, alive feel without being distracting.
      */}
      <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[10%] right-[20%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />

      {/* Minimalist Header */}
      <header className="relative z-30 w-full px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 p-[1px] transition-transform duration-500 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <div className="w-full h-full bg-[#050505] rounded-2xl flex items-center justify-center backdrop-blur-xl">
              <Layers size={22} className="text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-white leading-none">
              Yashoo <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Lab.</span>
            </span>
            <span className="text-xs text-gray-500 font-medium tracking-widest uppercase mt-1">Project Sandbox</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Settings Trigger */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300 text-gray-400 hover:text-white"
            title="Proxy Settings"
          >
            <Settings size={20} />
          </button>

          {/* Status Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              {swRegistered ? (
                <>
                  <span className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                </>
              ) : (
                <span className="relative w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${swRegistered ? 'text-emerald-400' : 'text-amber-500'}`}>
              {swRegistered ? 'Engine Online' : 'Initializing'}
            </span>
          </div>

          <a 
            href="https://github.com/Yasen-A7med/LAB" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300 text-gray-400 hover:text-white"
            aria-label="GitHub Repository"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Content - Centerpiece Project Showcase */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex items-center justify-center relative z-20 pb-20">
        <div className="w-full flex flex-col items-center">
          
          <div className="mb-12 text-center max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
              Welcome to the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">Digital Frontline.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed">
              Experience our flagship web experiment. A seamless, high-performance universal web emulator built for unrestricted access.
            </p>
          </div>

          {/* Featured Project Card */}
          <div className="relative group w-full max-w-3xl">
            {/* Animated Glow Behind Card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />
            
            {/* Card Body */}
            <div className="relative w-full bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 md:p-12 overflow-hidden shadow-2xl transition-transform duration-500 hover:-translate-y-2">
              
              {/* Internal decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
                
                {/* Icon/Visual Area */}
                <div className="shrink-0 relative">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-900/40 to-violet-900/40 border border-white/10 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <Globe size={40} className="text-cyan-400 group-hover:text-white transition-colors duration-500" />
                  </div>
                  {swRegistered && (
                    <div className="absolute -bottom-3 -right-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                      <Wifi size={12} className="text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live</span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                      UltraProxy
                    </h2>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                      Core Engine
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8 font-light">
                    A highly advanced, XOR-obfuscated universal web emulator. Bypass ISP restrictions seamlessly while maintaining full support for complex dynamic applications and HD media streaming.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mb-10">
                    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                      <div className="p-1.5 rounded-md bg-white/5"><Zap size={14} className="text-cyan-400" /></div>
                      Zero CORS
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                      <div className="p-1.5 rounded-md bg-white/5"><Shield size={14} className="text-violet-400" /></div>
                      Encrypted Traffic
                    </div>
                  </div>

                  <button
                    onClick={() => onLaunch('ultraproxy')}
                    className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold text-lg rounded-2xl overflow-hidden transition-transform active:scale-95"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-300 to-violet-300 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 flex items-center gap-2">
                      Launch Environment
                      <ChevronRight size={20} className="transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
              Proxy Configuration
            </h3>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Transport Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => selectPreset('wisp', 'wss://wisp.mercurywork.shop/')}
                    className={`py-3 px-4 rounded-xl border font-bold transition-all ${
                      localType === 'wisp'
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400'
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
                        ? 'bg-violet-500/10 border-violet-400 text-violet-400'
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
                        onClick={() => setLocalUrl('wss://wisp.mercurywork.shop/')}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          localUrl === 'wss://wisp.mercurywork.shop/'
                            ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400'
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
                            ? 'bg-violet-500/10 border-violet-400/30 text-violet-400'
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        z1g
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocalUrl('https://bare.benroberts.dev/')}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          localUrl === 'https://bare.benroberts.dev/'
                            ? 'bg-violet-500/10 border-violet-400/30 text-violet-400'
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        Ben Roberts
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400/50 transition-colors"
                  required
                />
              </div>

              {error && <div className="text-red-400 text-xs font-medium">{error}</div>}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-gradient-to-r from-cyan-400 to-violet-500 hover:brightness-110 active:scale-95 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
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
      )}
    </div>
  );
};

export default Dashboard;
