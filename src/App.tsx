import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import UltraProxy from './components/UltraProxy';

const BARE_SERVERS = [
  'https://tomp.app/',
  'https://bare.benroberts.dev/',
  'https://bare.astroid.wtf/',
  'https://uv.student-portal.xyz/bare/'
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ultraproxy'>('dashboard');
  const [swRegistered, setSwRegistered] = useState(false);

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
        setSwRegistered(true);
      } catch (err) {
        console.error('UV Service Worker registration failed:', err);
      }
    } else {
      console.warn('Your browser does not support Service Workers.');
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
        />
      )}
    </>
  );
};

export default App;
