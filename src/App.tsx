import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Shield, Zap, X } from 'lucide-react';

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

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isProxying, setIsProxying] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/uv/service/',
      }).then(() => {
        console.log('UV Service Worker registered');
      }).catch((err) => {
        console.error('UV Service Worker registration failed:', err);
      });
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const encodedUrl = encodeUVUrl(targetUrl);
    setProxyUrl(`/uv/service/${encodedUrl}`);
    setIsProxying(true);
  };

  const closeProxy = () => {
    setIsProxying(false);
    setProxyUrl('');
  };

  if (isProxying) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black z-50 flex flex-col">
        <div className="bg-[#0a0a0a] border-b border-[#00f2ff]/20 p-2 flex items-center justify-between">
          <div className="flex items-center gap-4 px-4 overflow-hidden">
            <span className="text-[#00f2ff] font-bold text-sm truncate">
              {url}
            </span>
          </div>
          <button
            onClick={closeProxy}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <iframe
          ref={iframeRef}
          src={proxyUrl}
          className="flex-1 w-full border-none"
          title="Proxy Content"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f2ff]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7000ff]/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-3xl flex flex-col items-center gap-12 z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00f2ff] blur-[20px] opacity-20 animate-pulse" />
            <Globe size={64} className="text-[#00f2ff] relative" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#7000ff]">
            ULTRA<span className="text-white">PROXY</span>
          </h1>
          <p className="text-gray-400 text-center max-w-md text-sm md:text-base">
            Universal Web Proxy. Bypassing ISP blocks with neon speed.
          </p>
        </div>

        {/* Search Bar Section */}
        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ff] to-[#7000ff] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center p-2 shadow-2xl">
            <div className="px-4 text-gray-500">
              <Search size={24} />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to browse freely..."
              className="w-full bg-transparent border-none outline-none text-lg py-3 pr-4 text-white placeholder-gray-600"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#00f2ff] to-[#7000ff] hover:scale-105 active:scale-95 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200"
            >
              GO
            </button>
          </div>
        </form>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl hover:border-[#00f2ff]/30 transition-colors">
            <Zap size={24} className="text-[#00f2ff] mb-4" />
            <h3 className="font-bold mb-2">High Speed</h3>
            <p className="text-sm text-gray-500">Optimized for HD video streaming and SPA applications.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl hover:border-[#7000ff]/30 transition-colors">
            <Shield size={24} className="text-[#7000ff] mb-4" />
            <h3 className="font-bold mb-2">Secure</h3>
            <p className="text-sm text-gray-500">Interception via Ultraviolet Service Worker technology.</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-colors">
            <Globe size={24} className="text-white mb-4" />
            <h3 className="font-bold mb-2">Universal</h3>
            <p className="text-sm text-gray-500">Full support for YouTube, Facebook, and complex dynamic sites.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 text-gray-600 text-sm flex gap-6">
        <a href="#" className="hover:text-[#00f2ff] transition-colors">Terms</a>
        <a href="#" className="hover:text-[#00f2ff] transition-colors">Privacy</a>
        <a href="#" className="hover:text-[#00f2ff] transition-colors">Github</a>
      </footer>
    </div>
  );
};

export default App;
