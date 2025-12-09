import { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// ============================================================
// SECURITY MIDDLEWARE CONFIGURATION
// ============================================================
//
// This module provides comprehensive security middleware for
// the Express application including:
// - Helmet (security headers)
// - CORS configuration
// - Rate limiting
// - Request validation
// - XSS protection
// ============================================================

// ============================================================
// ENVIRONMENT CONFIGURATION
// ============================================================

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Allowed origins for CORS
const getAllowedOrigins = (): string[] => {
  const origins = process.env.CORS_ORIGINS?.split(',') || [];

  if (isDevelopment) {
    return [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      ...origins,
    ];
  }

  return origins;
};

// ============================================================
// HELMET CONFIGURATION
// ============================================================

export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ["'self'", 'blob:'],
      formAction: ["'self'"],
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },
  // Cross-Origin settings
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: true },
  // Frameguard - prevent clickjacking
  frameguard: { action: 'deny' },
  // Hide X-Powered-By header
  hidePoweredBy: true,
  // HSTS - HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // IE No Open
  ieNoOpen: true,
  // No Sniff - prevent MIME type sniffing
  noSniff: true,
  // Origin Agent Cluster
  originAgentCluster: true,
  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // XSS Filter
  xssFilter: true,
});

// ============================================================
// CORS CONFIGURATION
// ============================================================

export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (isDevelopment) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  maxAge: 86400, // 24 hours
});

// ============================================================
// RATE LIMITING
// ============================================================

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // Limit each IP
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/ready';
  },
});

// Strict rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 100, // 5 login attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again after 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Please try again after an hour.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProduction ? 50 : 500, // 50 uploads per hour
  message: {
    error: 'Too many uploads',
    message: 'You have reached the upload limit. Please try again later.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================
// SLOW DOWN MIDDLEWARE
// ============================================================

// Gradually slow down responses after threshold
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: isProduction ? 50 : 500, // Start slowing after 50 requests
  delayMs: (hits) => hits * 100, // Add 100ms delay per request above threshold
  maxDelayMs: 5000, // Maximum delay of 5 seconds
});

// ============================================================
// REQUEST VALIDATION
// ============================================================

// Validate Content-Type for POST/PUT/PATCH requests
export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const methodsRequiringBody = ['POST', 'PUT', 'PATCH'];

  if (methodsRequiringBody.includes(req.method)) {
    const contentType = req.headers['content-type'];

    // Allow requests without body
    if (!req.body || Object.keys(req.body).length === 0) {
      return next();
    }

    // Validate content type
    if (!contentType) {
      res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type header is required',
      });
      return;
    }

    const allowedTypes = [
      'application/json',
      'multipart/form-data',
      'application/x-www-form-urlencoded',
    ];

    const isValid = allowedTypes.some((type) => contentType.includes(type));

    if (!isValid) {
      res.status(415).json({
        error: 'Unsupported Media Type',
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
      });
      return;
    }
  }

  next();
};

// Request ID middleware
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = req.headers['x-request-id']?.toString() ||
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);

  next();
};

// ============================================================
// SQL INJECTION PROTECTION
// ============================================================

const sqlInjectionPatterns = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /(\%3D)|(=)[^\n]*(\%27)|(\')|(\-\-)|(\%3B)|(;)/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  /UNION(\s+)ALL(\s+)SELECT/i,
];

export const sqlInjectionProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const checkValue = (value: unknown): boolean => {
    if (typeof value === 'string') {
      return sqlInjectionPatterns.some((pattern) => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const isSuspicious =
    checkValue(req.query) ||
    checkValue(req.body) ||
    checkValue(req.params);

  if (isSuspicious) {
    console.warn('Potential SQL injection attempt detected:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid characters detected in request',
    });
    return;
  }

  next();
};

// ============================================================
// XSS PROTECTION
// ============================================================

const xssPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

export const xssProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const checkValue = (value: unknown): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some((pattern) => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const isSuspicious =
    checkValue(req.query) ||
    checkValue(req.body) ||
    checkValue(req.params);

  if (isSuspicious) {
    console.warn('Potential XSS attempt detected:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    res.status(400).json({
      error: 'Bad Request',
      message: 'Potentially malicious content detected',
    });
    return;
  }

  next();
};

// ============================================================
// APPLY ALL SECURITY MIDDLEWARE
// ============================================================

export function applySecurityMiddleware(app: Application): void {
  // Request ID (must be first)
  app.use(requestId);

  // Helmet security headers
  app.use(helmetConfig);

  // CORS
  app.use(corsConfig);

  // Rate limiting
  app.use('/api', apiRateLimiter);
  app.use('/api/auth/login', authRateLimiter);
  app.use('/api/auth/register', authRateLimiter);
  app.use('/api/auth/forgot-password', passwordResetLimiter);
  app.use('/api/upload', uploadRateLimiter);

  // Speed limiting
  app.use('/api', speedLimiter);

  // Content validation
  app.use(validateContentType);

  // Security checks
  app.use(sqlInjectionProtection);
  app.use(xssProtection);

  console.info('✅ Security middleware configured');
}

export default {
  helmetConfig,
  corsConfig,
  apiRateLimiter,
  authRateLimiter,
  passwordResetLimiter,
  uploadRateLimiter,
  speedLimiter,
  validateContentType,
  requestId,
  sqlInjectionProtection,
  xssProtection,
  applySecurityMiddleware,
};
