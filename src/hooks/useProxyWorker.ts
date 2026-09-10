import { useState, useEffect, useCallback } from 'react';

export type ProxyTransportType = 'wisp' | 'bare';

interface UseProxyWorkerReturn {
  swRegistered: boolean;
  transportType: ProxyTransportType;
  serverUrl: string;
  updateTransportConfig: (type: ProxyTransportType, url: string) => Promise<void>;
}

const FALLBACK_WISPS = [
  'wss://nebulaproxy.io/wisp/',
  'wss://anura.pro/wisp/',
  'wss://wisp.mercurywork.shop/',
  'wss://wisp.incognito.surf/',
];

/**
 * Tests websocket connectivity to a Wisp server with timeout.
 */
function testWisp(url: string, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(url);
      const timer = setTimeout(() => {
        try { ws.close(); } catch { /* ignore */ }
        resolve(false);
      }, timeoutMs);

      ws.onopen = () => {
        clearTimeout(timer);
        try { ws.close(); } catch { /* ignore */ }
        resolve(true);
      };

      ws.onerror = () => {
        clearTimeout(timer);
        try { ws.close(); } catch { /* ignore */ }
        resolve(false);
      };

      ws.onclose = () => {
        clearTimeout(timer);
        resolve(false);
      };
    } catch {
      resolve(false);
    }
  });
}

/**
 * Custom hook to initialize Ultraviolet (UV) Service Worker and BareMux transport.
 */
export function useProxyWorker(): UseProxyWorkerReturn {
  const [swRegistered, setSwRegistered] = useState(false);
  const [transportType, setTransportType] = useState<ProxyTransportType>(() => {
    return (localStorage.getItem('proxy_transport_type') as ProxyTransportType) || 'wisp';
  });
  const [serverUrl, setServerUrl] = useState<string>(() => {
    return localStorage.getItem('proxy_server_url') || 'wss://nebulaproxy.io/wisp/';
  });

  const registerSW = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/uv/sw.js', {
        scope: '/uv/service/',
      });

      if (!registration.active) {
        await new Promise<void>((resolve) => {
          const sw = registration.installing || registration.waiting;
          if (!sw) {
            resolve();
            return;
          }
          sw.addEventListener('statechange', () => {
            if (sw.state === 'activated') resolve();
          });
        });
      }

      const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
      const connection = new BareMuxConnection('/baremux/worker.js');

      const savedType = localStorage.getItem('proxy_transport_type') || 'wisp';
      const userUrl = localStorage.getItem('proxy_server_url') || 'wss://nebulaproxy.io/wisp/';

      if (savedType === 'wisp') {
        const lastWorking = localStorage.getItem('proxy_last_working_transport');

        if (lastWorking === 'bare') {
          const bareUrl = `${window.location.origin}/api/bare/`;
          await connection.setTransport('/bare/index.mjs', [bareUrl]);
          setTransportType('bare');
          setServerUrl(bareUrl);
        } else {
          const servers = [userUrl, ...FALLBACK_WISPS.filter((s) => s !== userUrl)];
          let foundWisp = false;

          for (const server of servers) {
            const ok = await testWisp(server);
            if (ok) {
              await connection.setTransport('/epoxy/index.mjs', [{ wisp: server }]);
              localStorage.setItem('proxy_last_working_transport', 'wisp');
              foundWisp = true;
              break;
            }
          }

          if (!foundWisp) {
            const bareUrl = `${window.location.origin}/api/bare/`;
            await connection.setTransport('/bare/index.mjs', [bareUrl]);
            setTransportType('bare');
            setServerUrl(bareUrl);
            localStorage.setItem('proxy_last_working_transport', 'bare');
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
  }, []);

  const updateTransportConfig = useCallback(async (type: ProxyTransportType, url: string) => {
    try {
      const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
      const connection = new BareMuxConnection('/baremux/worker.js');

      if (type === 'wisp') {
        await connection.setTransport('/epoxy/index.mjs', [{ wisp: url }]);
      } else {
        await connection.setTransport('/bare/index.mjs', [url]);
      }

      localStorage.setItem('proxy_transport_type', type);
      localStorage.setItem('proxy_server_url', url);
      setTransportType(type);
      setServerUrl(url);
    } catch (err) {
      console.error('Failed to update transport:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    registerSW();
  }, [registerSW]);

  return {
    swRegistered,
    transportType,
    serverUrl,
    updateTransportConfig,
  };
}
