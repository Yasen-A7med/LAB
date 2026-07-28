import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import UltraProxy from './components/UltraProxy';
import DeciTask from './components/DeciTask';
import Thanawya from './components/Thanawya';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ultraproxy' | 'decitask' | 'thanawya'>(() => {
    if (window.location.pathname === '/ultraproxy') return 'ultraproxy';
    if (window.location.pathname === '/decitask' || window.location.pathname === '/deci') return 'decitask';
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
      } else if (window.location.pathname === '/decitask' || window.location.pathname === '/deci') {
        setCurrentView('decitask');
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
        const userUrl = localStorage.getItem('ultraproxy_server_url') || 'wss://nebulaproxy.io/wisp/';

        if (type === 'wisp') {
          // Check if we previously determined that Wisp doesn't work on this device
          const lastWorkingTransport = localStorage.getItem('ultraproxy_last_working_transport');
          
          if (lastWorkingTransport === 'bare') {
            // Previous session found that WebSocket is blocked — go straight to Bare
            const bareUrl = `${window.location.origin}/api/bare/`;
            console.log(`UV Using cached Bare transport (WebSocket previously blocked): ${bareUrl}`);
            await connection.setTransport('/bare/index.mjs', [bareUrl]);
            console.log(`UV Transport initialized: bare -> ${bareUrl}`);
            setTransportType('bare');
            setServerUrl(bareUrl);
          } else {
            // Wisp servers to try in order (user's choice first, then fallbacks)
            const FALLBACK_WISPS = [
              'wss://nebulaproxy.io/wisp/',
              'wss://anura.pro/wisp/',
              'wss://wisp.mercurywork.shop/',
              'wss://wisp.incognito.surf/',
            ];
            const servers = [userUrl, ...FALLBACK_WISPS.filter(s => s !== userUrl)];
            
            // Test WebSocket connectivity with shorter timeout
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
              console.log(`UV Testing wisp server: ${server}...`);
              const ok = await testWisp(server);
              if (ok) {
                await connection.setTransport('/epoxy/index.mjs', [{ wisp: server }]);
                console.log(`UV Transport initialized: wisp -> ${server}`);
                localStorage.setItem('ultraproxy_last_working_transport', 'wisp');
                foundWisp = true;
                break;
              } else {
                console.warn(`UV Wisp server FAILED: ${server}, trying next...`);
              }
            }

            // If ALL Wisp servers failed (WebSocket blocked), fall back to local Bare server
            if (!foundWisp) {
              const bareUrl = `${window.location.origin}/api/bare/`;
              console.log(`UV All Wisp servers failed! Falling back to Bare: ${bareUrl}`);
              await connection.setTransport('/bare/index.mjs', [bareUrl]);
              console.log(`UV Transport initialized: bare -> ${bareUrl}`);
              setTransportType('bare');
              setServerUrl(bareUrl);
              // Remember this for next time
              localStorage.setItem('ultraproxy_last_working_transport', 'bare');
            }
          }
        } else {
          await connection.setTransport('/bare/index.mjs', [userUrl]);
          console.log(`UV Transport initialized: bare -> ${userUrl}`);
        }

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
    } else if (id === 'thanawya') {
      window.history.pushState({}, '', '/thanawya');
      setCurrentView('thanawya');
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
      {currentView === 'thanawya' && (
        <Thanawya 
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default App;
