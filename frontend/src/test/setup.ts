// ============================================================
// TEST SETUP - Jest and Testing Library configuration
// ============================================================

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// ============================================
// Cleanup after each test
// ============================================
afterEach(() => {
  cleanup();
});

// ============================================
// Mock window.matchMedia
// ============================================
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ============================================
// Mock ResizeObserver
// ============================================
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// ============================================
// Mock IntersectionObserver
// ============================================
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// ============================================
// Mock scrollTo
// ============================================
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// ============================================
// Mock localStorage
// ============================================
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// ============================================
// Mock sessionStorage
// ============================================
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// ============================================
// Mock Notification API
// ============================================
Object.defineProperty(window, 'Notification', {
  value: class MockNotification {
    static permission = 'granted';
    static requestPermission = vi.fn().mockResolvedValue('granted');

    title: string;
    options?: NotificationOptions;

    constructor(title: string, options?: NotificationOptions) {
      this.title = title;
      this.options = options;
    }

    close = vi.fn();
    onclick: (() => void) | null = null;
  },
});

// ============================================
// Mock URL.createObjectURL
// ============================================
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mock-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
});

// ============================================
// Mock crypto.randomUUID
// ============================================
Object.defineProperty(crypto, 'randomUUID', {
  value: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).slice(2, 9)),
});

// ============================================
// Console error/warning suppression for specific messages
// ============================================
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: unknown[]) => {
  // Suppress React Router future flag warnings
  if (
    typeof args[0] === 'string' &&
    args[0].includes('React Router Future Flag Warning')
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args: unknown[]) => {
  // Suppress specific warnings in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('componentWillReceiveProps') ||
      args[0].includes('componentWillUpdate'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// ============================================
// Global test utilities
// ============================================
declare global {
  // Add any global test utilities here
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
