// ============================================================
// API OPTIMIZATION - Request batching, retries, and optimization
// ============================================================

import { getCsrfHeaders } from '../security';
import { cacheManager } from './cache';

// ============================================
// Types
// ============================================
export interface RequestConfig extends RequestInit {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: {
    enabled: boolean;
    ttl?: number;
    key?: string;
  };
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
  duration: number;
}

export interface BatchRequest {
  id: string;
  url: string;
  method: string;
  body?: unknown;
}

export interface BatchResponse {
  id: string;
  status: number;
  data: unknown;
  error?: string;
}

// ============================================
// Default Configuration
// ============================================
const defaultConfig: Required<Omit<RequestConfig, keyof RequestInit>> = {
  baseURL: '/api/v1',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  cache: { enabled: false },
};

// ============================================
// API Client Class
// ============================================
class ApiClient {
  private config: Required<Omit<RequestConfig, keyof RequestInit>>;
  private pendingRequests = new Map<string, Promise<ApiResponse>>();
  private batchQueue: Array<{
    request: BatchRequest;
    resolve: (value: BatchResponse) => void;
    reject: (error: Error) => void;
  }> = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config: Partial<RequestConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // ============================================
  // HTTP Methods
  // ============================================

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  // ============================================
  // Core Request Method
  // ============================================

  async request<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const mergedConfig = {
      ...this.config,
      ...config,
      cache: { ...this.config.cache, ...config.cache },
    };

    const fullUrl = this.buildUrl(url, mergedConfig.baseURL);
    const cacheKey = mergedConfig.cache?.key || this.getCacheKey(fullUrl, config);

    // Check cache first (only for GET requests)
    if (mergedConfig.cache?.enabled && config.method === 'GET') {
      const cached = await cacheManager.get<ApiResponse<T>>(cacheKey);
      if (cached) {
        return { ...cached, duration: 0 };
      }
    }

    // Dedupe concurrent identical requests
    const requestKey = this.getRequestKey(fullUrl, config);
    const pending = this.pendingRequests.get(requestKey);
    if (pending) {
      return pending as Promise<ApiResponse<T>>;
    }

    const requestPromise = this.executeRequest<T>(fullUrl, mergedConfig);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const response = await requestPromise;

      // Cache successful GET responses
      if (mergedConfig.cache?.enabled && config.method === 'GET' && response.status < 400) {
        await cacheManager.set(cacheKey, response, {
          ttl: mergedConfig.cache.ttl,
          storage: 'memory',
        });
      }

      return response;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  // ============================================
  // Request Execution with Retry
  // ============================================

  private async executeRequest<T>(
    url: string,
    config: Required<Omit<RequestConfig, keyof RequestInit>> & RequestInit
  ): Promise<ApiResponse<T>> {
    const { timeout, retries, retryDelay, ...fetchConfig } = config;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = performance.now();

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchConfig,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...getCsrfHeaders(),
            ...fetchConfig.headers,
          },
          credentials: 'include',
        });

        clearTimeout(timeoutId);

        const duration = performance.now() - startTime;
        const data = await this.parseResponse<T>(response);

        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new ApiError(
            (data as { message?: string })?.message || response.statusText,
            response.status,
            data
          );
        }

        // Retry server errors (5xx)
        if (response.status >= 500) {
          throw new ApiError(
            (data as { message?: string })?.message || response.statusText,
            response.status,
            data
          );
        }

        return {
          data,
          status: response.status,
          headers: response.headers,
          duration,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry aborted requests or client errors
        if (
          error instanceof DOMException && error.name === 'AbortError' ||
          error instanceof ApiError && error.status < 500
        ) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await this.delay(retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  // ============================================
  // Batch Requests
  // ============================================

  async batch<T>(request: Omit<BatchRequest, 'id'>): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `batch_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      this.batchQueue.push({
        request: { ...request, id },
        resolve: (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.data as T);
          }
        },
        reject,
      });

      this.scheduleBatchFlush();
    });
  }

  private scheduleBatchFlush(): void {
    if (this.batchTimeout) return;

    this.batchTimeout = setTimeout(() => {
      this.flushBatch();
      this.batchTimeout = null;
    }, 10); // Batch requests within 10ms window
  }

  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    // If only one request, don't batch
    if (batch.length === 1) {
      const { request, resolve, reject } = batch[0];
      try {
        const response = await this.request(request.url, {
          method: request.method,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });
        resolve({ id: request.id, status: response.status, data: response.data });
      } catch (error) {
        reject(error as Error);
      }
      return;
    }

    // Send batch request
    try {
      const response = await this.post<BatchResponse[]>('/batch', {
        requests: batch.map((b) => b.request),
      });

      const responseMap = new Map(response.data.map((r) => [r.id, r]));

      for (const { request, resolve, reject } of batch) {
        const result = responseMap.get(request.id);
        if (result) {
          resolve(result);
        } else {
          reject(new Error('No response for batch request'));
        }
      }
    } catch (error) {
      // If batch fails, reject all requests
      for (const { reject } of batch) {
        reject(error as Error);
      }
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private buildUrl(path: string, baseURL?: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${baseURL || ''}${path}`;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    if (contentType?.includes('text/')) {
      return response.text() as unknown as T;
    }

    return response.blob() as unknown as T;
  }

  private getCacheKey(url: string, config: RequestConfig): string {
    const params = config.body ? JSON.stringify(config.body) : '';
    return `api:${config.method || 'GET'}:${url}:${params}`;
  }

  private getRequestKey(url: string, config: RequestConfig): string {
    return `${config.method || 'GET'}:${url}:${JSON.stringify(config.body || '')}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================
// API Error Class
// ============================================
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ============================================
// Request Interceptors
// ============================================
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
type ErrorInterceptor = (error: Error) => Error | Promise<Error>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

export const interceptors = {
  request: {
    use(interceptor: RequestInterceptor): number {
      return requestInterceptors.push(interceptor) - 1;
    },
    eject(index: number): void {
      requestInterceptors.splice(index, 1);
    },
  },
  response: {
    use(interceptor: ResponseInterceptor): number {
      return responseInterceptors.push(interceptor) - 1;
    },
    eject(index: number): void {
      responseInterceptors.splice(index, 1);
    },
  },
  error: {
    use(interceptor: ErrorInterceptor): number {
      return errorInterceptors.push(interceptor) - 1;
    },
    eject(index: number): void {
      errorInterceptors.splice(index, 1);
    },
  },
};

// ============================================
// Request Queue for Concurrency Control
// ============================================
class RequestQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 6) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const fn = this.queue.shift()!;

    try {
      await fn();
    } finally {
      this.running--;
      this.process();
    }
  }
}

// ============================================
// Debounced Request Helper
// ============================================
export function debouncedRequest<T>(
  fn: () => Promise<T>,
  delay: number
): () => Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let pending: Promise<T> | null = null;
  let resolve: ((value: T) => void) | null = null;
  let reject: ((error: Error) => void) | null = null;

  return () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (!pending) {
      pending = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
    }

    timeout = setTimeout(async () => {
      try {
        const result = await fn();
        resolve?.(result);
      } catch (error) {
        reject?.(error as Error);
      } finally {
        pending = null;
        resolve = null;
        reject = null;
      }
    }, delay);

    return pending;
  };
}

// ============================================
// Singleton Exports
// ============================================
export const apiClient = new ApiClient();
export const requestQueue = new RequestQueue();

export default apiClient;
