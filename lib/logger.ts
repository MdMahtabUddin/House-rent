// lib/logger.ts

export type LogEntry = {
  timestamp: string;
  type: 'error' | 'warn' | 'info';
  message: string;
};

// Use global to persist logs across Next.js HMR
const globalAny = global as any;
if (!globalAny.appLogs) {
  globalAny.appLogs = [];
}

const addLog = (type: 'error' | 'warn' | 'info', args: any[]) => {
  try {
    const message = args.map(a => {
      if (a instanceof Error) return a.stack || a.message;
      if (typeof a === 'object') return JSON.stringify(a);
      return String(a);
    }).join(' ');
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
    };
    globalAny.appLogs.unshift(entry); // Add to beginning
    
    // Keep only the last 100 logs
    if (globalAny.appLogs.length > 100) {
      globalAny.appLogs.pop();
    }
  } catch (e) {
    // Ignore stringify errors
  }
};

// Initialize only once
if (!globalAny.loggerInitialized) {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    addLog('error', args);
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    addLog('warn', args);
    originalWarn.apply(console, args);
  };
  
  globalAny.loggerInitialized = true;
}

export const getLogs = (): LogEntry[] => {
  return globalAny.appLogs || [];
};

export const clearLogs = () => {
  globalAny.appLogs = [];
};
