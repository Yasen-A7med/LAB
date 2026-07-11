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

        // Wait for the SW to become active (don't use navigator.serviceWorker.ready
        // because it only resolves when the SW controls THIS page, and our scope
        // is /uv/service/ which doesn't include / or /ultraproxy)
        if (!registration.active) {
          await new Promise<void>((resolve) => {
            const sw = registration.installing || registration.waiting;
            if (!sw) { resolve(); return; }
            sw.addEventListener('statechange', () => {
              if (sw.state === 'activated') resolve();
            });
          });
        }

        // Initialize BareMux transport
        const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
        const connection = new BareMuxConnection('/baremux/worker.js');
        
        const type = localStorage.getItem('ultraproxy_transport_type') || 'wisp';
        const url = localStorage.getItem('ultraproxy_server_url') || 'wss://wisp.mercurywork.shop/';

        if (type === 'wisp') {
          await connection.setTransport('/epoxy/index.mjs', [{ wisp: url }]);
        } else {
          await connection.setTransport('/bare/index.mjs', [url]);
        }

        console.log(`UV Transport initialized: ${type} -> ${url}`);
        setSwRegistered(true);
      } catch (err) {
        console.error('UV setup failed:', err);
        setSwRegistered(true); // Allow UI even if transport fails
      }
    } else {
      console.warn('Service Workers not supported');
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
