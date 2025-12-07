import { AxiosError } from 'axios';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

// ============================================================
// ERROR HANDLER - Centralized error handling utilities
// ============================================================

// Standard API error response structure
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// Error codes
export enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Unknown
  UNKNOWN = 'UNKNOWN',
}

// User-friendly error messages
const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'You need to log in to access this resource.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.INVALID_TOKEN]: 'Invalid authentication token. Please log in again.',
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_INPUT]: 'The provided data is invalid.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.CONFLICT]: 'This resource has been modified. Please refresh and try again.',
  [ErrorCode.ALREADY_EXISTS]: 'A resource with this information already exists.',
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again later.',
  [ErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your internet connection.',
  [ErrorCode.TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorCode.UNKNOWN]: 'An unexpected error occurred.',
};

// Custom error class
export class AppError extends Error {
  code: ErrorCode;
  statusCode?: number;
  details?: Record<string, string[]>;

  constructor(
    code: ErrorCode,
    message?: string,
    statusCode?: number,
    details?: Record<string, string[]>
  ) {
    super(message || errorMessages[code]);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static fromAxiosError(error: AxiosError<APIError>): AppError {
    if (!error.response) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        return new AppError(ErrorCode.TIMEOUT);
      }
      return new AppError(ErrorCode.NETWORK_ERROR);
    }

    const { status, data } = error.response;
    const code = mapStatusToErrorCode(status, data?.code);
    const message = data?.message || errorMessages[code];

    return new AppError(code, message, status, data?.details);
  }
}

// Map HTTP status to error code
function mapStatusToErrorCode(status: number, apiCode?: string): ErrorCode {
  // Use API-provided code if available
  if (apiCode && Object.values(ErrorCode).includes(apiCode as ErrorCode)) {
    return apiCode as ErrorCode;
  }

  // Map by status code
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 422:
      return ErrorCode.INVALID_INPUT;
    case 429:
      return ErrorCode.RATE_LIMITED;
    case 500:
      return ErrorCode.INTERNAL_ERROR;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ErrorCode.UNKNOWN;
  }
}

// Handle error with UI feedback
export function handleError(error: unknown, showToast = true): AppError {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof AxiosError) {
    appError = AppError.fromAxiosError(error);
  } else if (error instanceof Error) {
    appError = new AppError(ErrorCode.UNKNOWN, error.message);
  } else {
    appError = new AppError(ErrorCode.UNKNOWN);
  }

  // Log error
  console.error('[Error]', {
    code: appError.code,
    message: appError.message,
    statusCode: appError.statusCode,
    details: appError.details,
    original: error,
  });

  // Handle auth errors
  if (
    appError.code === ErrorCode.UNAUTHORIZED ||
    appError.code === ErrorCode.SESSION_EXPIRED ||
    appError.code === ErrorCode.INVALID_TOKEN
  ) {
    useAuthStore.getState().logout();

    if (showToast) {
      useUIStore.getState().addToast({
        type: 'error',
        title: 'Session Expired',
        message: 'Please log in again to continue.',
      });
    }

    // Redirect to login
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }

    return appError;
  }

  // Show toast for other errors
  if (showToast) {
    const title = getErrorTitle(appError.code);
    useUIStore.getState().addToast({
      type: 'error',
      title,
      message: appError.message,
    });
  }

  return appError;
}

// Get user-friendly error title
function getErrorTitle(code: ErrorCode): string {
  switch (code) {
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.SESSION_EXPIRED:
    case ErrorCode.INVALID_TOKEN:
      return 'Authentication Error';
    case ErrorCode.FORBIDDEN:
      return 'Access Denied';
    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.INVALID_INPUT:
      return 'Validation Error';
    case ErrorCode.NOT_FOUND:
      return 'Not Found';
    case ErrorCode.CONFLICT:
    case ErrorCode.ALREADY_EXISTS:
      return 'Conflict';
    case ErrorCode.RATE_LIMITED:
      return 'Rate Limited';
    case ErrorCode.NETWORK_ERROR:
    case ErrorCode.TIMEOUT:
      return 'Network Error';
    default:
      return 'Error';
  }
}

// Format validation errors for forms
export function formatValidationErrors(
  details?: Record<string, string[]>
): Record<string, string> {
  if (!details) return {};

  const errors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(details)) {
    errors[field] = messages[0] || 'Invalid value';
  }
  return errors;
}

// Try-catch wrapper for async functions
export async function tryCatch<T>(
  fn: () => Promise<T>,
  options?: {
    showToast?: boolean;
    onError?: (error: AppError) => void;
  }
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error, options?.showToast ?? true);
    options?.onError?.(appError);
    return { data: null, error: appError };
  }
}

// Retry helper for failed operations
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    retryOn?: ErrorCode[];
  }
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = true, retryOn } = options || {};

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt < maxRetries) {
        const appError =
          error instanceof AppError
            ? error
            : error instanceof AxiosError
              ? AppError.fromAxiosError(error)
              : null;

        // Don't retry certain errors
        if (appError) {
          const nonRetryable = [
            ErrorCode.UNAUTHORIZED,
            ErrorCode.FORBIDDEN,
            ErrorCode.VALIDATION_ERROR,
            ErrorCode.NOT_FOUND,
          ];

          if (retryOn && !retryOn.includes(appError.code)) {
            throw appError;
          }

          if (!retryOn && nonRetryable.includes(appError.code)) {
            throw appError;
          }
        }

        // Wait before retry
        const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

// Report error to external service (placeholder)
export function reportError(error: Error | AppError, context?: Record<string, unknown>): void {
  // In production, integrate with error reporting service like Sentry
  // Example:
  // Sentry.captureException(error, {
  //   extra: {
  //     ...context,
  //     code: error instanceof AppError ? error.code : undefined,
  //   },
  // });

  console.error('[Error Reporter]', {
    error,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  });
}
