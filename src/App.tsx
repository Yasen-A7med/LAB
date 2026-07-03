import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Shield, Zap, X, AlertTriangle } from 'lucide-react';

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

const BARE_SERVERS = [
  'https://tomp.app/',
  'https://bare.benroberts.dev/',
  'https://bare.astroid.wtf/',
  'https://uv.student-portal.xyz/bare/'
];

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isProxying, setIsProxying] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    registerSW();
  }, []);

  const registerSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        // We select a random bare server from the list for basic load balancing/failover
        const bareServer = BARE_SERVERS[Math.floor(Math.random() * BARE_SERVERS.length)];

        // Inject the selected bare server into the global config before registration
        // @ts-ignore
        window.__uv$config = {
          // @ts-ignore
          ...window.__uv$config,
          bare: bareServer
        };

        await navigator.serviceWorker.register('/uv/sw.js', {
          scope: '/uv/service/',
        });
        console.log('UV Service Worker registered with bare:', bareServer);
      } catch (err) {
        console.error('UV Service Worker registration failed:', err);
        setError('Failed to initialize proxy engine.');
      }
    } else {
      setError('Your browser does not support Service Workers.');
    }
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

  if (isProxying) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black z-50 flex flex-col">
        <div className="bg-[#0a0a0a] border-b border-[#00f2ff]/20 p-2 flex items-center justify-between">
          <div className="flex items-center gap-4 px-4 overflow-hidden">
            <span className="text-[#00f2ff] font-bold text-sm truncate max-w-[200px] md:max-w-md">
              {url}
            </span>
          </div>
          <button
            onClick={closeProxy}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            title="Close Proxy"
          >
            <X size={20} />
          </button>
        </div>
        <iframe
          ref={iframeRef}
          src={proxyUrl}
          className="flex-1 w-full border-none bg-white"
          title="Proxy Content"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f2ff]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />

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
                className="w-full bg-transparent border-none outline-none text-lg py-4 pr-4 text-white placeholder-gray-600 font-medium"
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

      {/* Footer */}
      <footer className="mt-20 text-gray-600 text-sm flex gap-8 z-10">
        <a href="#" className="hover:text-[#00f2ff] transition-colors font-medium">Terms</a>
        <a href="#" className="hover:text-[#00f2ff] transition-colors font-medium">Privacy</a>
        <a href="#" className="hover:text-[#00f2ff] transition-colors font-medium">GitHub</a>
      </footer>
    </div>
  );
};

export default App;
