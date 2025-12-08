// ============================================================
// MSW SERVER - Mock Service Worker server setup for tests
// ============================================================

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the server instance with default handlers
export const server = setupServer(...handlers);

// Export for test setup
export { handlers };

// Helper to reset handlers between tests
export const resetHandlers = () => server.resetHandlers();

// Helper to add runtime handlers
export const addHandler = (...customHandlers: Parameters<typeof server.use>) => {
  server.use(...customHandlers);
};

export default server;
