import type { ProxyLogEntry } from '../types';

class ProxyLogger {
  private logs: ProxyLogEntry[] = [];
  private listeners: Set<(logs: ProxyLogEntry[]) => void> = new Set();
  private maxLogs = 100;
  private isTapped = false;
  private origLog: typeof console.log | null = null;
  private origWarn: typeof console.warn | null = null;
  private origError: typeof console.error | null = null;

  public log(type: 'log' | 'warn' | 'error', msg: string): void {
    const entry: ProxyLogEntry = {
      time: new Date().toLocaleTimeString(),
      type,
      msg
    };
    this.logs = [...this.logs.slice(-this.maxLogs + 1), entry];
    this.notify();
  }

  public getLogs(): ProxyLogEntry[] {
    return this.logs;
  }

  public clear(): void {
    this.logs = [];
    this.notify();
  }

  public subscribe(listener: (logs: ProxyLogEntry[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.logs);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.logs));
  }

  /**
   * Safely captures relevant proxy network keywords from console calls
   * without breaking native console output.
   */
  public attachConsoleBridge(): () => void {
    if (this.isTapped || typeof window === 'undefined') {
      return () => {};
    }

    this.isTapped = true;
    this.origLog = console.log;
    this.origWarn = console.warn;
    this.origError = console.error;

    const keywords = ['UV ', 'Transport', 'Bare', 'bare', 'wisp', 'Wisp', 'bare-mux', 'setup', 'WebSocket'];
    const shouldCapture = (args: unknown[]): boolean => {
      const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      return keywords.some(kw => text.includes(kw));
    };

    console.log = (...args: unknown[]) => {
      this.origLog?.(...args);
      if (shouldCapture(args)) {
        this.log('log', args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      }
    };

    console.warn = (...args: unknown[]) => {
      this.origWarn?.(...args);
      if (shouldCapture(args)) {
        this.log('warn', args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      }
    };

    console.error = (...args: unknown[]) => {
      this.origError?.(...args);
      if (shouldCapture(args)) {
        this.log('error', args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      }
    };

    return () => {
      if (this.origLog) console.log = this.origLog;
      if (this.origWarn) console.warn = this.origWarn;
      if (this.origError) console.error = this.origError;
      this.isTapped = false;
    };
  }
}

export const proxyLogger = new ProxyLogger();

/**
 * Ultraviolet XOR-based URL encoding utility.
 */
export function encodeUVUrl(url: string): string {
  if (!url) return '';
  return encodeURIComponent(
    url
      .split('')
      .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char))
      .join('')
  );
}
