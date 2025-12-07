// ============================================================
// LOGGING & OBSERVABILITY - Structured logging and analytics
// ============================================================

// ============================================
// Types
// ============================================
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: Record<string, unknown>;
  tags?: string[];
  userId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  console: boolean;
  remote: boolean;
  remoteUrl?: string;
  batchSize: number;
  flushInterval: number;
  includeTimestamp: boolean;
  includeContext: boolean;
  contextPath?: string;
}

export interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// ============================================
// Log Level Priorities
// ============================================
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

// ============================================
// Default Configuration
// ============================================
const defaultConfig: LoggerConfig = {
  level: import.meta.env.MODE === 'production' ? 'warn' : 'debug',
  enabled: true,
  console: true,
  remote: import.meta.env.MODE === 'production',
  batchSize: 50,
  flushInterval: 10000,
  includeTimestamp: true,
  includeContext: true,
};

// ============================================
// Logger Class
// ============================================
class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;
  private context: string = 'App';
  private userId?: string;
  private sessionId: string;
  private traceId?: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateId();

    if (this.config.remote && this.config.enabled) {
      this.scheduleFlush();
    }
  }

  // ============================================
  // Configuration
  // ============================================

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setContext(context: string): void {
    this.context = context;
  }

  setUser(userId: string): void {
    this.userId = userId;
  }

  setTraceId(traceId: string): void {
    this.traceId = traceId;
  }

  // ============================================
  // Logging Methods
  // ============================================

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  fatal(message: string, data?: Record<string, unknown>): void {
    this.log('fatal', message, data);
    // Flush immediately for fatal errors
    this.flush();
  }

  // ============================================
  // Core Log Method
  // ============================================

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    // Check log level
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: this.config.includeContext ? this.context : undefined,
      data,
      userId: this.userId,
      sessionId: this.sessionId,
      traceId: this.traceId,
      spanId: this.generateId(),
    };

    // Console output
    if (this.config.console) {
      this.logToConsole(entry);
    }

    // Buffer for remote logging
    if (this.config.remote) {
      this.buffer.push(entry);

      if (this.buffer.length >= this.config.batchSize) {
        this.flush();
      }
    }
  }

  // ============================================
  // Console Output
  // ============================================

  private logToConsole(entry: LogEntry): void {
    const { level, message, context, data, timestamp } = entry;

    const prefix = this.config.includeTimestamp
      ? `[${timestamp.toISOString()}]`
      : '';
    const contextStr = context ? `[${context}]` : '';
    const fullMessage = `${prefix}${contextStr} ${message}`;

    const styles: Record<LogLevel, string> = {
      debug: 'color: #6B7280',
      info: 'color: #3B82F6',
      warn: 'color: #F59E0B',
      error: 'color: #EF4444',
      fatal: 'color: #DC2626; font-weight: bold',
    };

    switch (level) {
      case 'debug':
        console.debug(`%c${fullMessage}`, styles.debug, data);
        break;
      case 'info':
        console.info(`%c${fullMessage}`, styles.info, data);
        break;
      case 'warn':
        console.warn(`%c${fullMessage}`, styles.warn, data);
        break;
      case 'error':
        console.error(`%c${fullMessage}`, styles.error, data);
        break;
      case 'fatal':
        console.error(`%c[FATAL] ${fullMessage}`, styles.fatal, data);
        break;
    }
  }

  // ============================================
  // Remote Logging
  // ============================================

  private scheduleFlush(): void {
    if (this.flushTimeout) return;

    this.flushTimeout = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.config.remoteUrl) return;

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: entries }),
        keepalive: true,
      });
    } catch (error) {
      // Re-add to buffer on failure
      this.buffer.unshift(...entries);
      console.error('Failed to flush logs:', error);
    }
  }

  // ============================================
  // Child Logger
  // ============================================

  child(context: string): Logger {
    const child = new Logger(this.config);
    child.context = `${this.context}:${context}`;
    child.userId = this.userId;
    child.sessionId = this.sessionId;
    child.traceId = this.traceId;
    return child;
  }

  // ============================================
  // Utility
  // ============================================

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

// ============================================
// Analytics Tracker
// ============================================
class Analytics {
  private enabled: boolean;
  private buffer: AnalyticsEvent[] = [];
  private flushInterval: number = 10000;
  private userId?: string;
  private sessionId: string;
  private remoteUrl?: string;

  constructor() {
    this.enabled = import.meta.env.MODE === 'production';
    this.sessionId = this.generateId();

    if (this.enabled) {
      setInterval(() => this.flush(), this.flushInterval);

      // Flush on page unload
      window.addEventListener('beforeunload', () => this.flush());
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
    }
  }

  configure(options: { enabled?: boolean; remoteUrl?: string }): void {
    if (options.enabled !== undefined) this.enabled = options.enabled;
    if (options.remoteUrl) this.remoteUrl = options.remoteUrl;
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    this.userId = userId;
    this.track('user_identified', 'identity', traits);
  }

  track(
    name: string,
    category: string,
    properties?: Record<string, unknown>
  ): void {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name,
      category,
      properties,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.buffer.push(event);

    // Log to console in development
    if (import.meta.env.MODE !== 'production') {
      console.log('[Analytics]', name, properties);
    }
  }

  // Convenience methods
  page(name: string, properties?: Record<string, unknown>): void {
    this.track('page_view', 'navigation', { page: name, ...properties });
  }

  click(element: string, properties?: Record<string, unknown>): void {
    this.track('click', 'interaction', { element, ...properties });
  }

  search(query: string, results: number): void {
    this.track('search', 'engagement', { query, results });
  }

  conversion(name: string, value?: number): void {
    this.track('conversion', 'business', { conversion: name, value });
  }

  timing(name: string, duration: number, category = 'performance'): void {
    this.track('timing', category, { name, duration });
  }

  error(message: string, stack?: string): void {
    this.track('error', 'error', { message, stack });
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.remoteUrl) return;

    const events = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.remoteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true,
      });
    } catch {
      // Re-add to buffer on failure
      this.buffer.unshift(...events);
    }
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

// ============================================
// Performance Observer
// ============================================
class PerformanceTracker {
  private marks = new Map<string, number>();

  mark(name: string): void {
    this.marks.set(name, performance.now());
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const end = endMark ? this.marks.get(endMark) : performance.now();
    const start = this.marks.get(startMark);

    if (!start || !end) {
      console.warn(`Mark not found: ${!start ? startMark : endMark}`);
      return 0;
    }

    const duration = end - start;

    try {
      performance.measure(name, startMark, endMark);
    } catch {
      // Fallback for unsupported browsers
    }

    return duration;
  }

  clearMarks(): void {
    this.marks.clear();
    performance.clearMarks();
  }

  getResourceTimings(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }

  getNavigationTiming(): PerformanceNavigationTiming | null {
    const entries = performance.getEntriesByType('navigation');
    return entries[0] as PerformanceNavigationTiming | null;
  }

  getMemoryInfo(): { usedJSHeapSize: number; totalJSHeapSize: number } | null {
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    if (!memory) return null;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
    };
  }

  observeLongTasks(callback: (duration: number) => void): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry.duration);
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // Long task observer not supported
    }
  }
}

// ============================================
// Request Tracing
// ============================================
export function createTraceContext(): {
  traceId: string;
  spanId: string;
  headers: Record<string, string>;
} {
  const traceId = generateTraceId();
  const spanId = generateSpanId();

  return {
    traceId,
    spanId,
    headers: {
      'X-Trace-ID': traceId,
      'X-Span-ID': spanId,
    },
  };
}

function generateTraceId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSpanId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// Feature Flags
// ============================================
class FeatureFlags {
  private flags = new Map<string, boolean>();
  private overrides = new Map<string, boolean>();

  async load(): Promise<void> {
    try {
      const response = await fetch('/api/v1/feature-flags');
      const data = await response.json();

      for (const [key, value] of Object.entries(data.flags || {})) {
        this.flags.set(key, value as boolean);
      }
    } catch {
      console.warn('Failed to load feature flags');
    }
  }

  isEnabled(flag: string, defaultValue = false): boolean {
    // Check overrides first (for testing)
    if (this.overrides.has(flag)) {
      return this.overrides.get(flag)!;
    }

    return this.flags.get(flag) ?? defaultValue;
  }

  override(flag: string, value: boolean): void {
    this.overrides.set(flag, value);
  }

  clearOverrides(): void {
    this.overrides.clear();
  }
}

// ============================================
// Singleton Exports
// ============================================
export const logger = new Logger();
export const analytics = new Analytics();
export const performanceTracker = new PerformanceTracker();
export const featureFlags = new FeatureFlags();

export default {
  logger,
  analytics,
  performanceTracker,
  featureFlags,
  createTraceContext,
};
