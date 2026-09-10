import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import type { TransportType } from '../types';

interface ProxySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: TransportType;
  initialUrl: string;
  onSaveConfig: (type: TransportType, url: string) => Promise<void>;
}

export const ProxySettingsModal: React.FC<ProxySettingsModalProps> = ({
  isOpen,
  onClose,
  initialType,
  initialUrl,
  onSaveConfig
}) => {
  const [localType, setLocalType] = useState<TransportType>(initialType);
  const [localUrl, setLocalUrl] = useState(initialUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setLocalType(initialType);
    setLocalUrl(initialUrl);
  }, [initialType, initialUrl, isOpen]);

  if (!isOpen) return null;

  const selectPreset = (type: TransportType, url: string) => {
    setLocalType(type);
    setLocalUrl(url);
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
      await onSaveConfig(localType, formattedUrl);
      setLocalUrl(formattedUrl);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update configuration.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('This will clear all saved settings and reload the page. Continue?')) return;
    localStorage.clear();
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.unregister();
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const k of keys) await caches.delete(k);
    }
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
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
            onClick={handleResetAll}
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
