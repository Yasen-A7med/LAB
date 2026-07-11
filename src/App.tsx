import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import UltraProxy from './components/UltraProxy';
import DeciTask from './components/DeciTask';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ultraproxy' | 'decitask'>(() => {
    if (window.location.pathname === '/ultraproxy') return 'ultraproxy';
    if (window.location.pathname === '/decitask' || window.location.pathname === '/deci') return 'decitask';
    return 'dashboard';
  });
  const [swRegistered, setSwRegistered] = useState(false);
  const [transportType, setTransportType] = useState<'wisp' | 'bare'>(() => {
    return (localStorage.getItem('ultraproxy_transport_type') as 'wisp' | 'bare') || 'wisp';
  });
  const [serverUrl, setServerUrl] = useState<string>(() => {
    return localStorage.getItem('ultraproxy_server_url') || 'wss://wisp.mercurywork.shop/';
  });

  useEffect(() => {
    registerSW();

    const handlePopState = () => {
      if (window.location.pathname === '/ultraproxy') {
        setCurrentView('ultraproxy');
      } else if (window.location.pathname === '/decitask' || window.location.pathname === '/deci') {
        setCurrentView('decitask');
      } else {
        setCurrentView('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const registerSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/uv/sw.js', {
          scope: '/uv/service/',
        });
        await registration.update();
        await navigator.serviceWorker.ready;

        // Initialize BareMux for UV v3 using absolute URLs
        const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
        const workerUrl = '/baremux/worker.js';
        const connection = new BareMuxConnection(workerUrl);
        
        const type = localStorage.getItem('ultraproxy_transport_type') || 'wisp';
        const url = localStorage.getItem('ultraproxy_server_url') || 'wss://wisp.mercurywork.shop/';

        if (type === 'wisp') {
          const epoxyUrl = '/epoxy/index.mjs';
          await connection.setTransport(epoxyUrl, [{ wisp: url }]);
        } else {
          const bareUrl = '/bare/index.mjs';
          await connection.setTransport(bareUrl, [url]);
        }

        console.log(`UV Service Worker registered with ${type} transport:`, url);
        setSwRegistered(true);
      } catch (err) {
        console.error('UV Service Worker registration failed:', err);
        // Still mark as registered if the SW itself is active, even if transport failed
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          if (regs.some(r => r.active)) {
            console.warn('SW is active but transport setup failed. Proxy may not work.');
            setSwRegistered(true);
          }
        } catch {}
      }
    } else {
      console.warn('Your browser does not support Service Workers.');
    }
  };

  const updateTransportConfig = async (type: 'wisp' | 'bare', url: string) => {
    try {
      const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
      const workerUrl = '/baremux/worker.js';
      const connection = new BareMuxConnection(workerUrl);
      if (type === 'wisp') {
        const epoxyUrl = '/epoxy/index.mjs';
        await connection.setTransport(epoxyUrl, [{ wisp: url }]);
      } else {
        const bareUrl = '/bare/index.mjs';
        await connection.setTransport(bareUrl, [url]);
      }
      localStorage.setItem('ultraproxy_transport_type', type);
      localStorage.setItem('ultraproxy_server_url', url);
      setTransportType(type);
      setServerUrl(url);
      console.log(`Transport switched to ${type}: ${url}`);
    } catch (err) {
      console.error('Failed to update transport:', err);
      throw err;
    }
  };

  const handleLaunch = (id: string) => {
    if (id === 'ultraproxy') {
      window.open('/ultraproxy', '_blank');
    } else if (id === 'decitask') {
      window.history.pushState({}, '', '/decitask');
      setCurrentView('decitask');
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('dashboard');
  };

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard 
          onLaunch={handleLaunch} 
          swRegistered={swRegistered} 
        />
      )}
      {currentView === 'ultraproxy' && (
        <UltraProxy 
          onBack={handleBack} 
          transportType={transportType}
          serverUrl={serverUrl}
          onUpdateConfig={updateTransportConfig}
        />
      )}
      {currentView === 'decitask' && (
        <DeciTask 
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default App;
