import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import UltraProxy from './components/UltraProxy';

const WISP_SERVERS = [
  'wss://wisp.mercurywork.shop/'
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
        const wispServer = WISP_SERVERS[Math.floor(Math.random() * WISP_SERVERS.length)];

        await navigator.serviceWorker.register('/uv/sw.js', {
          scope: '/uv/service/',
        });

        // Initialize BareMux for UV v3
        const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
        const connection = new BareMuxConnection('/baremux/worker.js');
        await connection.setTransport('/epoxy/index.mjs', [{ wisp: wispServer }]);

        console.log('UV Service Worker registered with Wisp:', wispServer);
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
