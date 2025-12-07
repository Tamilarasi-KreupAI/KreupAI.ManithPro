import { Request, Response, NextFunction, Application } from 'express';

// ============================================================
// LOGGING MIDDLEWARE
// ============================================================
//
// This module provides comprehensive logging for the Express
// application including:
// - Request/Response logging
// - Error logging
// - Performance metrics
// - Structured logging format
// ============================================================

// ============================================================
// TYPES
// ============================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

// ============================================================
// LOGGER CLASS
// ============================================================

class Logger {
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly logLevel: LogLevel;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || (this.isProduction ? 'info' : 'debug');
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatLog(entry: LogEntry): string {
    if (this.isProduction) {
      // JSON format for production (easier to parse)
      return JSON.stringify(entry);
    }

    // Pretty format for development
    const { timestamp, level, message, requestId, method, path, statusCode, duration, error } = entry;
    const parts: string[] = [];

    // Timestamp
    parts.push(`[${timestamp}]`);

    // Level with color
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    };
    parts.push(`${colors[level]}${level.toUpperCase()}\x1b[0m`);

    // Request info
    if (method && path) {
      parts.push(`${method} ${path}`);
    }

    // Status code with color
    if (statusCode) {
      const statusColor = statusCode >= 500 ? '\x1b[31m' : statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
      parts.push(`${statusColor}${statusCode}\x1b[0m`);
    }

    // Duration
    if (duration !== undefined) {
      const durationColor = duration > 1000 ? '\x1b[31m' : duration > 500 ? '\x1b[33m' : '\x1b[32m';
      parts.push(`${durationColor}${duration}ms\x1b[0m`);
    }

    // Message
    parts.push(message);

    // Request ID
    if (requestId) {
      parts.push(`[${requestId}]`);
    }

    // Error details
    if (error) {
      parts.push(`\n  Error: ${error.name}: ${error.message}`);
      if (error.stack && !this.isProduction) {
        parts.push(`\n  Stack: ${error.stack}`);
      }
    }

    return parts.join(' ');
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formatted = this.formatLog(entry);

    switch (entry.level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      metadata,
    });
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      metadata,
    });
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      metadata,
    });
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      metadata,
    });
  }

  request(entry: Omit<LogEntry, 'timestamp' | 'level'>): void {
    const level: LogLevel = (entry.statusCode ?? 200) >= 500
      ? 'error'
      : (entry.statusCode ?? 200) >= 400
        ? 'warn'
        : 'info';

    this.log({
      ...entry,
      timestamp: new Date().toISOString(),
      level,
    });
  }
}

export const logger = new Logger();

// ============================================================
// REQUEST LOGGING MIDDLEWARE
// ============================================================

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      requestId?: string;
    }
  }
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Record start time
  req.startTime = Date.now();
  req.requestId = req.headers['x-request-id']?.toString();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());

    // Skip logging for health checks in production
    if (process.env.NODE_ENV === 'production' &&
        (req.path === '/health' || req.path === '/ready')) {
      return;
    }

    logger.request({
      message: 'Request completed',
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: (req as any).user?.id,
      ip: req.ip || req.headers['x-forwarded-for']?.toString(),
      userAgent: req.headers['user-agent'],
      metadata: {
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        contentLength: res.get('Content-Length'),
      },
    });
  });

  next();
};

// ============================================================
// ERROR LOGGING MIDDLEWARE
// ============================================================

export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const duration = Date.now() - (req.startTime || Date.now());

  logger.error('Request error', err, {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    duration,
    userId: (req as any).user?.id,
    ip: req.ip,
    body: process.env.NODE_ENV !== 'production' ? req.body : undefined,
  });

  next(err);
};

// ============================================================
// APPLY LOGGING MIDDLEWARE
// ============================================================

export function applyLoggingMiddleware(app: Application): void {
  app.use(requestLogger);

  logger.info('✅ Logging middleware configured');
}

export default {
  logger,
  requestLogger,
  errorLogger,
  applyLoggingMiddleware,
};
