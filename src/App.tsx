import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import UltraProxy from './components/UltraProxy';
import Thanawya from './components/Thanawya';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ultraproxy' | 'thanawya'>(() => {
    if (window.location.pathname === '/ultraproxy') return 'ultraproxy';
    if (window.location.pathname === '/thanawya') return 'thanawya';
    return 'dashboard';
  });
  const [swRegistered, setSwRegistered] = useState(false);
  const [transportType, setTransportType] = useState<'wisp' | 'bare'>(() => {
    return (localStorage.getItem('ultraproxy_transport_type') as 'wisp' | 'bare') || 'wisp';
  });
  const [serverUrl, setServerUrl] = useState<string>(() => {
    return localStorage.getItem('ultraproxy_server_url') || 'wss://nebulaproxy.io/wisp/';
  });

  useEffect(() => {
    registerSW();

    const handlePopState = () => {
      if (window.location.pathname === '/ultraproxy') {
        setCurrentView('ultraproxy');
      } else if (window.location.pathname === '/thanawya') {
        setCurrentView('thanawya');
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

        if (!registration.active) {
          await new Promise<void>((resolve) => {
            const sw = registration.installing || registration.waiting;
            if (!sw) { resolve(); return; }
            sw.addEventListener('statechange', () => {
              if (sw.state === 'activated') resolve();
            });
          });
        }

        const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
        const connection = new BareMuxConnection('/baremux/worker.js');
        
        const type = localStorage.getItem('ultraproxy_transport_type') || 'wisp';
        const userUrl = localStorage.getItem('ultraproxy_server_url') || 'wss://nebulaproxy.io/wisp/';

        if (type === 'wisp') {
          const lastWorkingTransport = localStorage.getItem('ultraproxy_last_working_transport');
          
          if (lastWorkingTransport === 'bare') {
            const bareUrl = `${window.location.origin}/api/bare/`;
            await connection.setTransport('/bare/index.mjs', [bareUrl]);
            setTransportType('bare');
            setServerUrl(bareUrl);
          } else {
            const FALLBACK_WISPS = [
              'wss://nebulaproxy.io/wisp/',
              'wss://anura.pro/wisp/',
              'wss://wisp.mercurywork.shop/',
              'wss://wisp.incognito.surf/',
            ];
            const servers = [userUrl, ...FALLBACK_WISPS.filter(s => s !== userUrl)];
            
            const testWisp = (url: string, timeoutMs = 3000): Promise<boolean> => {
              return new Promise((resolve) => {
                try {
                  const ws = new WebSocket(url);
                  const timer = setTimeout(() => { 
                    try { ws.close(); } catch(e) {}
                    resolve(false); 
                  }, timeoutMs);
                  ws.onopen = () => { 
                    clearTimeout(timer); 
                    ws.close(); 
                    resolve(true); 
                  };
                  ws.onerror = () => { 
                    clearTimeout(timer); 
                    try { ws.close(); } catch(e) {}
                    resolve(false); 
                  };
                  ws.onclose = () => {
                    clearTimeout(timer);
                    resolve(false);
                  };
                } catch(e) {
                  resolve(false);
                }
              });
            };

            let foundWisp = false;
            for (const server of servers) {
              const ok = await testWisp(server);
              if (ok) {
                await connection.setTransport('/epoxy/index.mjs', [{ wisp: server }]);
                localStorage.setItem('ultraproxy_last_working_transport', 'wisp');
                foundWisp = true;
                break;
              }
            }

            if (!foundWisp) {
              const bareUrl = `${window.location.origin}/api/bare/`;
              await connection.setTransport('/bare/index.mjs', [bareUrl]);
              setTransportType('bare');
              setServerUrl(bareUrl);
              localStorage.setItem('ultraproxy_last_working_transport', 'bare');
            }
          }
        } else {
          await connection.setTransport('/bare/index.mjs', [userUrl]);
        }

        setSwRegistered(true);
      } catch (err) {
        console.error('UV setup failed:', err);
        setSwRegistered(true);
      }
    }
  };

  const updateTransportConfig = async (type: 'wisp' | 'bare', url: string) => {
    try {
      const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
      const connection = new BareMuxConnection('/baremux/worker.js');
      if (type === 'wisp') {
        await connection.setTransport('/epoxy/index.mjs', [{ wisp: url }]);
      } else {
        await connection.setTransport('/bare/index.mjs', [url]);
      }
      localStorage.setItem('ultraproxy_transport_type', type);
      localStorage.setItem('ultraproxy_server_url', url);
      setTransportType(type);
      setServerUrl(url);
    } catch (err) {
      console.error('Failed to update transport:', err);
      throw err;
    }
  };

  const handleLaunch = (id: string) => {
    if (id === 'ultraproxy') {
      window.open('/ultraproxy', '_blank');
    } else if (id === 'thanawya') {
      window.open('/thanawya', '_blank');
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
      {currentView === 'thanawya' && (
        <Thanawya 
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default App;
