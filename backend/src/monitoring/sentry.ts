import * as Sentry from '@sentry/node';
import { Application, Request, Response, NextFunction } from 'express';

// ============================================================
// SENTRY ERROR MONITORING
// ============================================================
//
// This module configures Sentry for error tracking and
// performance monitoring in the backend application.
//
// Features:
// - Automatic error capture
// - Performance tracing
// - User context
// - Custom breadcrumbs
// - Release tracking
// ============================================================

// ============================================================
// CONFIGURATION
// ============================================================

const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';
const sentryDsn = process.env.SENTRY_DSN;

export interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initSentry(app: Application, config?: SentryConfig): void {
  if (!sentryDsn && !config?.dsn) {
    console.info('⚠️ Sentry DSN not configured, error tracking disabled');
    return;
  }

  const dsn = config?.dsn || sentryDsn;
  const environment = config?.environment || process.env.NODE_ENV || 'development';
  const release = config?.release || process.env.APP_VERSION || '1.0.0';

  Sentry.init({
    dsn,
    environment,
    release: `manithpro-backend@${release}`,

    // Performance Monitoring
    tracesSampleRate: config?.tracesSampleRate ?? (isProduction ? 0.1 : 1.0),

    // Error sampling
    sampleRate: config?.sampleRate ?? 1.0,

    // Integrations
    integrations: [
      // HTTP integration for tracing
      Sentry.httpIntegration({ tracing: true }),
      // Express integration
      Sentry.expressIntegration({ app }),
      // Prisma integration (if available)
      Sentry.prismaIntegration(),
    ],

    // Before send hook
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (!isProduction && !isStaging && !process.env.SENTRY_DEBUG) {
        return null;
      }

      // Filter out certain errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send expected errors
        if (error.message.includes('Invalid credentials') ||
            error.message.includes('Not found') ||
            error.message.includes('Unauthorized')) {
          return null;
        }
      }

      return event;
    },

    // Before breadcrumb hook
    beforeBreadcrumb(breadcrumb) {
      // Filter sensitive data from breadcrumbs
      if (breadcrumb.category === 'http' && breadcrumb.data) {
        // Remove sensitive headers
        if (breadcrumb.data.headers) {
          const headers = { ...breadcrumb.data.headers };
          delete headers.authorization;
          delete headers.cookie;
          breadcrumb.data.headers = headers;
        }

        // Remove sensitive body data
        if (breadcrumb.data.body) {
          breadcrumb.data.body = '[FILTERED]';
        }
      }

      return breadcrumb;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Network errors
      'Network request failed',
      'Failed to fetch',
      'NetworkError',
      // Client errors
      'Request aborted',
      'ECONNRESET',
      'ETIMEDOUT',
    ],
  });

  // Add Sentry request handler (must be first middleware)
  app.use(Sentry.expressRequestHandler());

  // Add Sentry tracing handler
  app.use(Sentry.expressTracingHandler());

  console.info('✅ Sentry error tracking initialized');
}

// ============================================================
// ERROR HANDLER
// ============================================================

export function sentryErrorHandler(): (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void {
  return Sentry.expressErrorHandler();
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Set user context for Sentry
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  role?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture exception with context
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id: string; email?: string };
  }
): string {
  return Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): string {
  return Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(
  name: string,
  op: string
): ReturnType<typeof Sentry.startInactiveSpan> {
  return Sentry.startInactiveSpan({
    name,
    op,
  });
}

/**
 * Wrap async function with error capture
 */
export function withSentry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  transactionName?: string
): T {
  return (async (...args: Parameters<T>) => {
    const span = transactionName ? startTransaction(transactionName, 'function') : null;

    try {
      const result = await fn(...args);
      span?.end();
      return result;
    } catch (error) {
      captureException(error as Error);
      span?.end();
      throw error;
    }
  }) as T;
}

// ============================================================
// EXPRESS MIDDLEWARE
// ============================================================

/**
 * Middleware to set user context from authenticated request
 */
export function sentryUserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const user = (req as any).user;

  if (user) {
    setUserContext({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  next();
}

/**
 * Middleware to add request breadcrumb
 */
export function sentryBreadcrumbMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  addBreadcrumb(
    `${req.method} ${req.path}`,
    'http',
    'info',
    {
      url: req.originalUrl,
      method: req.method,
      query: req.query,
    }
  );

  next();
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  initSentry,
  sentryErrorHandler,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  captureException,
  captureMessage,
  startTransaction,
  withSentry,
  sentryUserMiddleware,
  sentryBreadcrumbMiddleware,
};
