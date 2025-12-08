// ============================================================
// MONITORING & ERROR TRACKING - Application observability
// ============================================================

// ============================================
// Types
// ============================================
export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  breadcrumbs?: Breadcrumb[];
}

export type ErrorType =
  | 'javascript'
  | 'network'
  | 'resource'
  | 'promise'
  | 'react'
  | 'custom';

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

export interface Breadcrumb {
  type: 'navigation' | 'click' | 'xhr' | 'fetch' | 'console' | 'user' | 'custom';
  category: string;
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface MonitoringConfig {
  enabled: boolean;
  dsn?: string;
  environment: string;
  release?: string;
  sampleRate: number;
  maxBreadcrumbs: number;
  beforeSend?: (report: ErrorReport) => ErrorReport | null;
  ignoreErrors?: Array<string | RegExp>;
}

// ============================================
// Default Configuration
// ============================================
const defaultConfig: MonitoringConfig = {
  enabled: true,
  environment: import.meta.env.MODE || 'development',
  sampleRate: 1.0,
  maxBreadcrumbs: 100,
  ignoreErrors: [
    'ResizeObserver loop',
    'Script error',
    'Non-Error promise rejection',
  ],
};

// ============================================
// Error Monitor Class
// ============================================
class ErrorMonitor {
  private config: MonitoringConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private userId?: string;
  private sessionId: string;
  private errorQueue: ErrorReport[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();

    if (this.config.enabled && typeof window !== 'undefined') {
      this.setupGlobalHandlers();
      this.setupBreadcrumbTracking();
    }
  }

  // ============================================
  // Configuration
  // ============================================

  configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setUser(userId: string): void {
    this.userId = userId;
  }

  clearUser(): void {
    this.userId = undefined;
  }

  // ============================================
  // Error Capture
  // ============================================

  captureError(
    error: Error | string,
    options: {
      type?: ErrorType;
      severity?: ErrorSeverity;
      metadata?: Record<string, unknown>;
    } = {}
  ): string {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    const report = this.createErrorReport(errorObj, {
      type: options.type || 'custom',
      severity: options.severity || 'error',
      metadata: options.metadata,
    });

    return this.processReport(report);
  }

  captureMessage(
    message: string,
    severity: ErrorSeverity = 'info',
    metadata?: Record<string, unknown>
  ): string {
    const report = this.createErrorReport(new Error(message), {
      type: 'custom',
      severity,
      metadata,
    });

    return this.processReport(report);
  }

  // ============================================
  // Breadcrumbs
  // ============================================

  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const crumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date(),
    };

    this.breadcrumbs.push(crumb);

    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  // ============================================
  // Performance Tracking
  // ============================================

  trackMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date(),
    };

    this.sendMetric(fullMetric);
  }

  trackTiming(name: string, duration: number, tags?: Record<string, string>): void {
    this.trackMetric({
      name,
      value: duration,
      unit: 'ms',
      tags,
    });
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();

    return fn().finally(() => {
      const duration = performance.now() - start;
      this.trackTiming(name, duration);
    });
  }

  // ============================================
  // Web Vitals
  // ============================================

  trackWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    this.observeLCP();

    // First Input Delay
    this.observeFID();

    // Cumulative Layout Shift
    this.observeCLS();

    // Time to First Byte
    this.trackTTFB();

    // First Contentful Paint
    this.trackFCP();
  }

  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };

        if (lastEntry) {
          this.trackMetric({
            name: 'lcp',
            value: lastEntry.startTime,
            unit: 'ms',
            tags: { vital: 'web-vital' },
          });
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Observer not supported
    }
  }

  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        for (const entry of entries) {
          const fidEntry = entry as PerformanceEventTiming;
          this.trackMetric({
            name: 'fid',
            value: fidEntry.processingStart - fidEntry.startTime,
            unit: 'ms',
            tags: { vital: 'web-vital' },
          });
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
    } catch {
      // Observer not supported
    }
  }

  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });

      // Report CLS on page hide
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.trackMetric({
            name: 'cls',
            value: clsValue,
            unit: 'score',
            tags: { vital: 'web-vital' },
          });
        }
      });
    } catch {
      // Observer not supported
    }
  }

  private trackTTFB(): void {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navEntry) {
      this.trackMetric({
        name: 'ttfb',
        value: navEntry.responseStart - navEntry.requestStart,
        unit: 'ms',
        tags: { vital: 'web-vital' },
      });
    }
  }

  private trackFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            this.trackMetric({
              name: 'fcp',
              value: entry.startTime,
              unit: 'ms',
              tags: { vital: 'web-vital' },
            });
          }
        }
      });

      observer.observe({ type: 'paint', buffered: true });
    } catch {
      // Observer not supported
    }
  }

  // ============================================
  // Private Methods
  // ============================================

  private setupGlobalHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      if (this.shouldIgnoreError(event.message)) return;

      const report = this.createErrorReport(event.error || new Error(event.message), {
        type: 'javascript',
        severity: 'error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });

      this.processReport(report);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      if (this.shouldIgnoreError(error.message)) return;

      const report = this.createErrorReport(error, {
        type: 'promise',
        severity: 'error',
      });

      this.processReport(report);
    });
  }

  private setupBreadcrumbTracking(): void {
    // Track navigation
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      this.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        message: `Navigate to ${args[2]}`,
        data: { url: args[2] },
      });
      return originalPushState.apply(history, args);
    };

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName?.toLowerCase();
      const text = target.textContent?.slice(0, 50);

      this.addBreadcrumb({
        type: 'click',
        category: 'ui',
        message: `Click on ${tagName}`,
        data: {
          tagName,
          text,
          id: target.id,
          className: target.className,
        },
      });
    }, { capture: true, passive: true });

    // Track fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const method = (args[1]?.method || 'GET').toUpperCase();

      this.addBreadcrumb({
        type: 'fetch',
        category: 'http',
        message: `${method} ${url}`,
        data: { url, method },
      });

      try {
        const response = await originalFetch.apply(window, args);

        this.addBreadcrumb({
          type: 'fetch',
          category: 'http',
          message: `${method} ${url} [${response.status}]`,
          data: { url, method, status: response.status },
        });

        return response;
      } catch (error) {
        this.addBreadcrumb({
          type: 'fetch',
          category: 'http',
          message: `${method} ${url} [failed]`,
          data: { url, method, error: (error as Error).message },
        });
        throw error;
      }
    };

    // Track console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.addBreadcrumb({
        type: 'console',
        category: 'console',
        message: args.map(String).join(' ').slice(0, 200),
      });
      originalConsoleError.apply(console, args);
    };
  }

  private createErrorReport(
    error: Error,
    options: {
      type: ErrorType;
      severity: ErrorSeverity;
      metadata?: Record<string, unknown>;
    }
  ): ErrorReport {
    return {
      id: this.generateId(),
      message: error.message,
      stack: error.stack,
      type: options.type,
      severity: options.severity,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: options.metadata,
      breadcrumbs: [...this.breadcrumbs],
    };
  }

  private processReport(report: ErrorReport): string {
    // Apply beforeSend hook
    if (this.config.beforeSend) {
      const processed = this.config.beforeSend(report);
      if (!processed) return report.id;
      report = processed;
    }

    // Sample rate check
    if (Math.random() > this.config.sampleRate) {
      return report.id;
    }

    // Queue for sending
    this.errorQueue.push(report);
    this.scheduleFlush();

    return report.id;
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) return;

    this.flushTimeout = setTimeout(() => {
      this.flush();
      this.flushTimeout = null;
    }, 1000);
  }

  private async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const reports = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendReports(reports);
    } catch (error) {
      // Re-queue failed reports
      this.errorQueue.unshift(...reports);
      console.error('Failed to send error reports:', error);
    }
  }

  private async sendReports(reports: ErrorReport[]): Promise<void> {
    if (!this.config.dsn) {
      // Log to console in development
      for (const report of reports) {
        console.groupCollapsed(`[Error Monitor] ${report.message}`);
        console.log('Report:', report);
        console.groupEnd();
      }
      return;
    }

    await fetch(this.config.dsn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reports }),
    });
  }

  private async sendMetric(metric: PerformanceMetric): Promise<void> {
    if (!this.config.dsn) {
      console.log('[Metric]', metric.name, metric.value, metric.unit);
      return;
    }

    try {
      await fetch(`${this.config.dsn}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch {
      // Silently fail for metrics
    }
  }

  private shouldIgnoreError(message: string): boolean {
    return this.config.ignoreErrors?.some((pattern) => {
      if (typeof pattern === 'string') {
        return message.includes(pattern);
      }
      return pattern.test(message);
    }) || false;
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateSessionId(): string {
    const stored = sessionStorage.getItem('monitoring_session_id');
    if (stored) return stored;

    const id = this.generateId();
    sessionStorage.setItem('monitoring_session_id', id);
    return id;
  }
}

// ============================================
// React Error Boundary Integration
// ============================================
export function captureReactError(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  errorMonitor.captureError(error, {
    type: 'react',
    severity: 'error',
    metadata: {
      componentStack: errorInfo.componentStack,
    },
  });
}

// ============================================
// Singleton Export
// ============================================
export const errorMonitor = new ErrorMonitor();

export default errorMonitor;
