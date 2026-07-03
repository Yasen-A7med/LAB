import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import UltraProxy from './components/UltraProxy';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ultraproxy'>('dashboard');
  const [swRegistered, setSwRegistered] = useState(false);
  const [transportType, setTransportType] = useState<'wisp' | 'bare'>(() => {
    return (localStorage.getItem('ultraproxy_transport_type') as 'wisp' | 'bare') || 'wisp';
  });
  const [serverUrl, setServerUrl] = useState<string>(() => {
    return localStorage.getItem('ultraproxy_server_url') || 'wss://wisp.mercurywork.shop/';
  });

  useEffect(() => {
    registerSW();
  }, []);

  const registerSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/uv/sw.js', {
          scope: '/uv/service/',
        });

        // Initialize BareMux for UV v3 using absolute URLs
        const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
        const workerUrl = new URL('/baremux/worker.js', window.location.href).toString();
        const connection = new BareMuxConnection(workerUrl);
        
        const type = localStorage.getItem('ultraproxy_transport_type') || 'wisp';
        const url = localStorage.getItem('ultraproxy_server_url') || 'wss://wisp.mercurywork.shop/';

        if (type === 'wisp') {
          const epoxyUrl = new URL('/epoxy/index.mjs', window.location.href).toString();
          await connection.setTransport(epoxyUrl, [{ wisp: url }]);
        } else {
          const bareUrl = new URL('/bare/index.mjs', window.location.href).toString();
          await connection.setTransport(bareUrl, [url]);
        }

        console.log(`UV Service Worker registered with ${type} transport:`, url);
        setSwRegistered(true);
      } catch (err) {
        console.error('UV Service Worker registration failed:', err);
      }
    } else {
      console.warn('Your browser does not support Service Workers.');
    }
  };

  const updateTransportConfig = async (type: 'wisp' | 'bare', url: string) => {
    try {
      const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
      const workerUrl = new URL('/baremux/worker.js', window.location.href).toString();
      const connection = new BareMuxConnection(workerUrl);
      if (type === 'wisp') {
        const epoxyUrl = new URL('/epoxy/index.mjs', window.location.href).toString();
        await connection.setTransport(epoxyUrl, [{ wisp: url }]);
      } else {
        const bareUrl = new URL('/bare/index.mjs', window.location.href).toString();
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
      setCurrentView('ultraproxy');
    }
  };

  return (
    <>
      {currentView === 'dashboard' ? (
        <Dashboard 
          onLaunch={handleLaunch} 
          swRegistered={swRegistered} 
        />
      ) : (
        <UltraProxy 
          onBack={() => setCurrentView('dashboard')} 
          transportType={transportType}
          serverUrl={serverUrl}
          onUpdateConfig={updateTransportConfig}
        />
      )}
    </>
  );
};

export default App;
