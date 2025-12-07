// ============================================================
// MSW BROWSER - Mock Service Worker browser setup for development
// ============================================================

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create the worker instance
export const worker = setupWorker(...handlers);

// Helper to start in development
export const startMockServiceWorker = async () => {
  if (process.env.NODE_ENV === 'development') {
    return worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  }
};

export default worker;
