import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError } from 'axios';
import {
  AppError,
  ErrorCode,
  handleError,
  formatValidationErrors,
  tryCatch,
  withRetry,
} from '../errorHandler';

// Mock the stores
vi.mock('../../store/uiStore', () => ({
  useUIStore: {
    getState: vi.fn(() => ({
      addToast: vi.fn(),
    })),
  },
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      logout: vi.fn(),
    })),
  },
}));

// Import mocked stores
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

describe('AppError', () => {
  it('creates error with code and default message', () => {
    const error = new AppError(ErrorCode.NOT_FOUND);

    expect(error.code).toBe(ErrorCode.NOT_FOUND);
    expect(error.message).toBe('The requested resource was not found.');
  });

  it('creates error with custom message', () => {
    const error = new AppError(ErrorCode.NOT_FOUND, 'User not found');

    expect(error.message).toBe('User not found');
  });

  it('creates error with status code', () => {
    const error = new AppError(ErrorCode.NOT_FOUND, 'Not found', 404);

    expect(error.statusCode).toBe(404);
  });

  it('creates error with details', () => {
    const details = { email: ['Invalid email format'] };
    const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', 400, details);

    expect(error.details).toEqual(details);
  });

  describe('fromAxiosError', () => {
    it('creates AppError from network error', () => {
      const axiosError = {
        code: 'ERR_NETWORK',
        response: undefined,
      } as AxiosError;

      const error = AppError.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('creates AppError from timeout error', () => {
      const axiosError = {
        code: 'ECONNABORTED',
        response: undefined,
      } as AxiosError;

      const error = AppError.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.TIMEOUT);
    });

    it('creates AppError from 401 response', () => {
      const axiosError = {
        response: {
          status: 401,
          data: {},
        },
      } as AxiosError;

      const error = AppError.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
    });

    it('creates AppError from 404 response', () => {
      const axiosError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' },
        },
      } as AxiosError;

      const error = AppError.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('Resource not found');
    });

    it('uses API-provided error code', () => {
      const axiosError = {
        response: {
          status: 400,
          data: { code: 'ALREADY_EXISTS', message: 'User exists' },
        },
      } as AxiosError;

      const error = AppError.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.ALREADY_EXISTS);
    });

    it('maps 429 to RATE_LIMITED', () => {
      const axiosError = {
        response: {
          status: 429,
          data: {},
        },
      } as AxiosError;

      const error = AppError.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.RATE_LIMITED);
    });

    it('maps 500 to INTERNAL_ERROR', () => {
      const axiosError = {
        response: {
          status: 500,
          data: {},
        },
      } as AxiosError;

      const error = AppError.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('maps 503 to SERVICE_UNAVAILABLE', () => {
      const axiosError = {
        response: {
          status: 503,
          data: {},
        },
      } as AxiosError;

      const error = AppError.fromAxiosError(axiosError);

      expect(error.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
    });
  });
});

describe('handleError', () => {
  const mockAddToast = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUIStore.getState as any).mockReturnValue({ addToast: mockAddToast });
    (useAuthStore.getState as any).mockReturnValue({ logout: mockLogout });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/dashboard', href: '' },
      writable: true,
    });
  });

  it('returns AppError unchanged', () => {
    const error = new AppError(ErrorCode.NOT_FOUND);
    const result = handleError(error, false);

    expect(result).toBe(error);
  });

  it('converts AxiosError to AppError', () => {
    const axiosError = {
      response: { status: 404, data: {} },
    } as AxiosError;

    const result = handleError(axiosError, false);

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('converts generic Error to AppError', () => {
    const error = new Error('Something went wrong');
    const result = handleError(error, false);

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN);
    expect(result.message).toBe('Something went wrong');
  });

  it('handles non-Error objects', () => {
    const result = handleError('string error', false);

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN);
  });

  it('shows toast for errors when showToast is true', () => {
    const error = new AppError(ErrorCode.NOT_FOUND);
    handleError(error, true);

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Not Found',
      message: error.message,
    });
  });

  it('does not show toast when showToast is false', () => {
    const error = new AppError(ErrorCode.NOT_FOUND);
    handleError(error, false);

    expect(mockAddToast).not.toHaveBeenCalled();
  });

  it('logs out user on UNAUTHORIZED error', () => {
    const error = new AppError(ErrorCode.UNAUTHORIZED);
    handleError(error, false);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('logs out user on SESSION_EXPIRED error', () => {
    const error = new AppError(ErrorCode.SESSION_EXPIRED);
    handleError(error, false);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('logs out user on INVALID_TOKEN error', () => {
    const error = new AppError(ErrorCode.INVALID_TOKEN);
    handleError(error, false);

    expect(mockLogout).toHaveBeenCalled();
  });
});

describe('formatValidationErrors', () => {
  it('returns empty object for undefined details', () => {
    expect(formatValidationErrors(undefined)).toEqual({});
  });

  it('returns empty object for empty details', () => {
    expect(formatValidationErrors({})).toEqual({});
  });

  it('extracts first error message for each field', () => {
    const details = {
      email: ['Invalid email', 'Already taken'],
      password: ['Too short', 'Missing number'],
    };

    const result = formatValidationErrors(details);

    expect(result).toEqual({
      email: 'Invalid email',
      password: 'Too short',
    });
  });

  it('uses default message for empty array', () => {
    const details = {
      email: [],
    };

    const result = formatValidationErrors(details);

    expect(result).toEqual({
      email: 'Invalid value',
    });
  });
});

describe('tryCatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUIStore.getState as any).mockReturnValue({ addToast: vi.fn() });
    (useAuthStore.getState as any).mockReturnValue({ logout: vi.fn() });
  });

  it('returns data on success', async () => {
    const fn = async () => 'result';
    const { data, error } = await tryCatch(fn);

    expect(data).toBe('result');
    expect(error).toBeNull();
  });

  it('returns error on failure', async () => {
    const fn = async () => {
      throw new Error('Failed');
    };
    const { data, error } = await tryCatch(fn, { showToast: false });

    expect(data).toBeNull();
    expect(error).toBeInstanceOf(AppError);
  });

  it('calls onError callback on failure', async () => {
    const onError = vi.fn();
    const fn = async () => {
      throw new Error('Failed');
    };

    await tryCatch(fn, { showToast: false, onError });

    expect(onError).toHaveBeenCalled();
  });

  it('shows toast by default on failure', async () => {
    const mockAddToast = vi.fn();
    (useUIStore.getState as any).mockReturnValue({ addToast: mockAddToast });

    const fn = async () => {
      throw new Error('Failed');
    };

    await tryCatch(fn);

    expect(mockAddToast).toHaveBeenCalled();
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const resultPromise = withRetry(fn);
    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('First fail'))
      .mockRejectedValueOnce(new Error('Second fail'))
      .mockResolvedValue('success');

    const resultPromise = withRetry(fn, { maxRetries: 3, delay: 100 });

    // Process first retry
    await vi.advanceTimersByTimeAsync(100);
    // Process second retry
    await vi.advanceTimersByTimeAsync(200);

    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

    const resultPromise = withRetry(fn, { maxRetries: 2, delay: 100 });

    // Process retries
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);

    await expect(resultPromise).rejects.toThrow('Always fails');
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('does not retry on non-retryable errors', async () => {
    const error = new AppError(ErrorCode.UNAUTHORIZED);
    const fn = vi.fn().mockRejectedValue(error);

    const resultPromise = withRetry(fn, { maxRetries: 3 });

    await expect(resultPromise).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('uses exponential backoff when enabled', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const resultPromise = withRetry(fn, {
      maxRetries: 3,
      delay: 100,
      backoff: true,
    });

    // First retry after 100ms
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(2);

    // Second retry after 200ms (100 * 2^1)
    await vi.advanceTimersByTimeAsync(200);
    expect(fn).toHaveBeenCalledTimes(3);

    const result = await resultPromise;
    expect(result).toBe('success');
  });

  it('only retries on specified error codes', async () => {
    const networkError = new AppError(ErrorCode.NETWORK_ERROR);
    const notFoundError = new AppError(ErrorCode.NOT_FOUND);

    const fn = vi
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(notFoundError);

    const resultPromise = withRetry(fn, {
      maxRetries: 3,
      delay: 100,
      retryOn: [ErrorCode.NETWORK_ERROR],
    });

    await vi.advanceTimersByTimeAsync(100);

    await expect(resultPromise).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
