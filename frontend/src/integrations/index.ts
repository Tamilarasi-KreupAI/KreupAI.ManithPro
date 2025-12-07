// ============================================================
// INTEGRATIONS MODULE - Main Entry Point
// ============================================================

// Base classes and utilities
export {
  BaseIntegrationService,
  registerIntegration,
  getIntegrationService,
  getRegisteredIntegrations,
  integrationEvents,
} from './base';

// Types
export * from './types';

// OAuth
export * from './oauth';

// Calendar
export * from './calendar';

// Communication
export * from './communication';

// AI/ML
export * from './ai';

// Job Boards
export * from './jobboards';

// Payment
export * from './payment';
