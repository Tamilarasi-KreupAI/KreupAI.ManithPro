// ============================================================
// SECURITY UTILITIES - XSS protection, CSRF, validation
// ============================================================

// ============================================
// XSS Protection
// ============================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char]);
}

/**
 * Sanitize user input for safe HTML display
 */
export function sanitizeInput(input: string): string {
  // Remove script tags and event handlers
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');

  // Escape remaining HTML
  return escapeHtml(sanitized);
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();

  // Check for dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return 'about:blank';
  }

  // Only allow http, https, mailto, tel protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', '/'];
  const hasAllowedProtocol = allowedProtocols.some(
    (protocol) => trimmed.startsWith(protocol) || !trimmed.includes(':')
  );

  return hasAllowedProtocol ? url : 'about:blank';
}

/**
 * Create a safe HTML string from template
 */
export function safeHtml(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return strings.reduce((result, str, i) => {
    const value = values[i - 1];
    const escaped = typeof value === 'string' ? escapeHtml(value) : String(value ?? '');
    return result + escaped + str;
  });
}

// ============================================
// CSRF Protection
// ============================================

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Get CSRF token from cookie
 */
export function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSRF token in cookie
 */
export function setCsrfToken(token?: string): string {
  const csrfToken = token || generateCsrfToken();

  document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(csrfToken)}; path=/; SameSite=Strict; Secure`;

  return csrfToken;
}

/**
 * Get CSRF headers for fetch requests
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { [CSRF_HEADER_NAME]: token } : {};
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  const storedToken = getCsrfToken();
  return storedToken !== null && storedToken === token;
}

// ============================================
// Input Validation
// ============================================

export interface ValidationRule {
  test: (value: unknown) => boolean;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Common validation rules
 */
export const validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      return value.length <= max;
    },
    message: message || `Must be no more than ${max} characters`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      return regex.test(value);
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    test: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    test: (value) => {
      const num = Number(value);
      return !isNaN(num) && num <= max;
    },
    message: message || `Must be no more than ${max}`,
  }),

  url: (message = 'Invalid URL'): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  phone: (message = 'Invalid phone number'): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      // E.164 format or common formats
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    },
    message,
  }),

  password: (message = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      return value.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
    },
    message,
  }),

  alphanumeric: (message = 'Only letters and numbers allowed'): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      return /^[a-zA-Z0-9]+$/.test(value);
    },
    message,
  }),

  noHtml: (message = 'HTML tags are not allowed'): ValidationRule => ({
    test: (value) => {
      if (typeof value !== 'string') return false;
      return !/<[^>]*>/g.test(value);
    },
    message,
  }),

  custom: (test: (value: unknown) => boolean, message: string): ValidationRule => ({
    test,
    message,
  }),
};

/**
 * Validate a value against multiple rules
 */
export function validate(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.test(value)) {
      errors.push(rule.message);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an object against a schema
 */
export function validateSchema<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): Record<keyof T, ValidationResult> & { isValid: boolean } {
  const results = {} as Record<keyof T, ValidationResult>;
  let isValid = true;

  for (const key of Object.keys(schema) as Array<keyof T>) {
    const result = validate(data[key], schema[key]);
    results[key] = result;
    if (!result.valid) isValid = false;
  }

  return { ...results, isValid };
}

// ============================================
// Content Security Policy
// ============================================

export interface CSPDirectives {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  fontSrc?: string[];
  connectSrc?: string[];
  frameSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  workerSrc?: string[];
  manifestSrc?: string[];
  baseUri?: string[];
  formAction?: string[];
  frameAncestors?: string[];
  upgradeInsecureRequests?: boolean;
  blockAllMixedContent?: boolean;
}

/**
 * Build CSP header string from directives
 */
export function buildCSP(directives: CSPDirectives): string {
  const parts: string[] = [];

  const directiveMap: Record<string, keyof CSPDirectives> = {
    'default-src': 'defaultSrc',
    'script-src': 'scriptSrc',
    'style-src': 'styleSrc',
    'img-src': 'imgSrc',
    'font-src': 'fontSrc',
    'connect-src': 'connectSrc',
    'frame-src': 'frameSrc',
    'object-src': 'objectSrc',
    'media-src': 'mediaSrc',
    'worker-src': 'workerSrc',
    'manifest-src': 'manifestSrc',
    'base-uri': 'baseUri',
    'form-action': 'formAction',
    'frame-ancestors': 'frameAncestors',
  };

  for (const [header, key] of Object.entries(directiveMap)) {
    const value = directives[key];
    if (Array.isArray(value) && value.length > 0) {
      parts.push(`${header} ${value.join(' ')}`);
    }
  }

  if (directives.upgradeInsecureRequests) {
    parts.push('upgrade-insecure-requests');
  }

  if (directives.blockAllMixedContent) {
    parts.push('block-all-mixed-content');
  }

  return parts.join('; ');
}

/**
 * Default CSP for the application
 */
export const defaultCSP: CSPDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  connectSrc: ["'self'", 'https://api.example.com'],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  upgradeInsecureRequests: true,
};

// ============================================
// Rate Limiting (Client-side)
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Check if request is rate limited
 */
export function isRateLimited(
  key: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return false;
  }

  if (entry.count >= config.maxRequests) {
    return true;
  }

  entry.count++;
  return false;
}

/**
 * Get remaining requests for a key
 */
export function getRateLimitRemaining(
  key: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): number {
  const entry = rateLimitStore.get(key);

  if (!entry || Date.now() > entry.resetAt) {
    return config.maxRequests;
  }

  return Math.max(0, config.maxRequests - entry.count);
}

// ============================================
// Secure Storage
// ============================================

const ENCRYPTION_KEY = 'app_secure_storage_key';

/**
 * Simple obfuscation for sensitive localStorage data
 * Note: This is NOT true encryption, just obfuscation for casual inspection
 */
export const secureStorage = {
  setItem(key: string, value: unknown): void {
    try {
      const data = JSON.stringify(value);
      const encoded = btoa(encodeURIComponent(data));
      localStorage.setItem(`secure_${key}`, encoded);
    } catch (error) {
      console.error('Failed to save secure item:', error);
    }
  },

  getItem<T>(key: string): T | null {
    try {
      const encoded = localStorage.getItem(`secure_${key}`);
      if (!encoded) return null;
      const data = decodeURIComponent(atob(encoded));
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(`secure_${key}`);
  },

  clear(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('secure_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};

// ============================================
// Exports
// ============================================

export default {
  // XSS
  escapeHtml,
  sanitizeInput,
  sanitizeUrl,
  safeHtml,

  // CSRF
  getCsrfToken,
  setCsrfToken,
  getCsrfHeaders,
  validateCsrfToken,

  // Validation
  validators,
  validate,
  validateSchema,

  // CSP
  buildCSP,
  defaultCSP,

  // Rate Limiting
  isRateLimited,
  getRateLimitRemaining,

  // Secure Storage
  secureStorage,
};
