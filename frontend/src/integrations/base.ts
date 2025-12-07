// ============================================================
// BASE INTEGRATION SERVICE - Abstract base class for integrations
// ============================================================

import type { IntegrationConfig, IntegrationError, IntegrationStatus } from './types';

// ============================================
// Base Integration Service
// ============================================
export abstract class BaseIntegrationService {
  protected config: IntegrationConfig;
  protected baseUrl: string;

  constructor(config: Partial<IntegrationConfig>) {
    this.config = {
      id: '',
      name: '',
      description: '',
      icon: '',
      category: 'oauth',
      status: 'disconnected',
      ...config,
    };
    this.baseUrl = '/api/v1/integrations';
  }

  // Abstract methods to implement
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract isConnected(): boolean;
  abstract refresh(): Promise<void>;

  // Get integration status
  getStatus(): IntegrationStatus {
    return this.config.status;
  }

  // Get integration config
  getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  // Update status
  protected setStatus(status: IntegrationStatus): void {
    this.config.status = status;
  }

  // Create integration error
  protected createError(
    code: string,
    message: string,
    retryable = false,
    details?: Record<string, unknown>
  ): IntegrationError {
    return { code, message, retryable, details };
  }

  // Make authenticated API request
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw this.createError(
        error.code || 'REQUEST_FAILED',
        error.message || `Request failed with status ${response.status}`,
        response.status >= 500
      );
    }

    return response.json();
  }
}

// ============================================
// Integration Service Factory
// ============================================
export type IntegrationServiceConstructor = new (
  config?: Partial<IntegrationConfig>
) => BaseIntegrationService;

const integrationRegistry = new Map<string, IntegrationServiceConstructor>();

export const registerIntegration = (
  id: string,
  service: IntegrationServiceConstructor
): void => {
  integrationRegistry.set(id, service);
};

export const getIntegrationService = (
  id: string,
  config?: Partial<IntegrationConfig>
): BaseIntegrationService | null => {
  const ServiceClass = integrationRegistry.get(id);
  if (!ServiceClass) return null;
  return new ServiceClass(config);
};

export const getRegisteredIntegrations = (): string[] => {
  return Array.from(integrationRegistry.keys());
};

// ============================================
// Integration Event Emitter
// ============================================
type IntegrationEventType =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'refreshed'
  | 'statusChanged';

type IntegrationEventHandler = (data: {
  integrationId: string;
  status: IntegrationStatus;
  error?: IntegrationError;
}) => void;

class IntegrationEventEmitter {
  private handlers = new Map<IntegrationEventType, Set<IntegrationEventHandler>>();

  on(event: IntegrationEventType, handler: IntegrationEventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: IntegrationEventType, handler: IntegrationEventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit(
    event: IntegrationEventType,
    data: {
      integrationId: string;
      status: IntegrationStatus;
      error?: IntegrationError;
    }
  ): void {
    this.handlers.get(event)?.forEach((handler) => handler(data));
  }
}

export const integrationEvents = new IntegrationEventEmitter();
