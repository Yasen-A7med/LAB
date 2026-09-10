export type TransportType = 'wisp' | 'bare';

export interface ProxyProps {
  onBack: () => void;
  transportType: TransportType;
  serverUrl: string;
  onUpdateConfig: (type: TransportType, url: string) => Promise<void>;
}

export interface ProxyLogEntry {
  time: string;
  type: 'log' | 'warn' | 'error';
  msg: string;
}

export interface ProxyDebugInfo {
  timestamp: string;
  userAgent: string;
  transport: {
    currentType: TransportType;
    currentUrl: string;
    lastWorking: string;
    savedType: string;
    savedUrl: string;
  };
  serviceWorker: {
    supported: boolean;
    controller: string;
  };
  logs: ProxyLogEntry[];
}
