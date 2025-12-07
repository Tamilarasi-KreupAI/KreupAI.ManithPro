// Batch 33-36: Platform Integrations API Services (10.1-10.4)
import api from './api';

// ==========================================
// Batch 33: HR & Payroll Integrations API (10.1)
// ==========================================

const HR_BASE_URL = '/api/hr-integrations';

export const hrIntegrationsAPI = {
  // Get all HR integrations
  getIntegrations: async (params?: { provider?: string; status?: string }) => {
    const response = await api.get(`${HR_BASE_URL}/integrations`, { params });
    return response.data;
  },

  // Get specific integration
  getIntegration: async (integrationId: string) => {
    const response = await api.get(`${HR_BASE_URL}/integrations/${integrationId}`);
    return response.data;
  },

  // Create integration
  createIntegration: async (data: {
    name: string;
    provider: string;
    integrationType?: string;
    authType: string;
    connectionSettings?: Record<string, unknown>;
    syncFrequency?: string;
  }) => {
    const response = await api.post(`${HR_BASE_URL}/integrations`, data);
    return response.data;
  },

  // Update integration
  updateIntegration: async (integrationId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${HR_BASE_URL}/integrations/${integrationId}`, data);
    return response.data;
  },

  // Delete integration
  deleteIntegration: async (integrationId: string) => {
    const response = await api.delete(`${HR_BASE_URL}/integrations/${integrationId}`);
    return response.data;
  },

  // Test connection
  testConnection: async (integrationId: string) => {
    const response = await api.post(`${HR_BASE_URL}/integrations/${integrationId}/test`);
    return response.data;
  },

  // Trigger sync
  triggerSync: async (integrationId: string, data?: { syncType?: string; direction?: string }) => {
    const response = await api.post(`${HR_BASE_URL}/integrations/${integrationId}/sync`, data);
    return response.data;
  },

  // Get sync logs
  getSyncLogs: async (integrationId: string, params?: { limit?: number }) => {
    const response = await api.get(`${HR_BASE_URL}/integrations/${integrationId}/sync-logs`, { params });
    return response.data;
  },

  // Get field mapping
  getFieldMapping: async (integrationId: string) => {
    const response = await api.get(`${HR_BASE_URL}/integrations/${integrationId}/mapping`);
    return response.data;
  },

  // Get providers
  getProviders: async () => {
    const response = await api.get(`${HR_BASE_URL}/providers`);
    return response.data;
  },

  // Get dashboard
  getDashboard: async () => {
    const response = await api.get(`${HR_BASE_URL}/dashboard`);
    return response.data;
  },
};

// ==========================================
// Batch 34: Communication Integrations API (10.2)
// ==========================================

const COMM_BASE_URL = '/api/communication-integrations';

export const communicationAPI = {
  // Get integrations
  getIntegrations: async (params?: { platform?: string; status?: string }) => {
    const response = await api.get(`${COMM_BASE_URL}/integrations`, { params });
    return response.data;
  },

  // Get specific integration
  getIntegration: async (integrationId: string) => {
    const response = await api.get(`${COMM_BASE_URL}/integrations/${integrationId}`);
    return response.data;
  },

  // Create integration
  createIntegration: async (data: {
    name: string;
    platform: string;
    integrationType?: string;
    authType: string;
    connectionSettings?: Record<string, unknown>;
  }) => {
    const response = await api.post(`${COMM_BASE_URL}/integrations`, data);
    return response.data;
  },

  // Update integration
  updateIntegration: async (integrationId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${COMM_BASE_URL}/integrations/${integrationId}`, data);
    return response.data;
  },

  // Delete integration
  deleteIntegration: async (integrationId: string) => {
    const response = await api.delete(`${COMM_BASE_URL}/integrations/${integrationId}`);
    return response.data;
  },

  // Test integration
  testIntegration: async (integrationId: string) => {
    const response = await api.post(`${COMM_BASE_URL}/integrations/${integrationId}/test`);
    return response.data;
  },

  // Send test message
  sendTestMessage: async (integrationId: string, data: { channel: string; message: string }) => {
    const response = await api.post(`${COMM_BASE_URL}/integrations/${integrationId}/test-message`, data);
    return response.data;
  },

  // Get templates
  getTemplates: async (params?: { templateType?: string; platform?: string }) => {
    const response = await api.get(`${COMM_BASE_URL}/templates`, { params });
    return response.data;
  },

  // Create template
  createTemplate: async (data: {
    name: string;
    templateType: string;
    platform?: string;
    eventType?: string;
    subject?: string;
    content: string;
    variables?: string[];
  }) => {
    const response = await api.post(`${COMM_BASE_URL}/templates`, data);
    return response.data;
  },

  // Get notification settings
  getNotificationSettings: async () => {
    const response = await api.get(`${COMM_BASE_URL}/settings/notifications`);
    return response.data;
  },

  // Get platforms
  getPlatforms: async () => {
    const response = await api.get(`${COMM_BASE_URL}/platforms`);
    return response.data;
  },

  // Get dashboard
  getDashboard: async () => {
    const response = await api.get(`${COMM_BASE_URL}/dashboard`);
    return response.data;
  },
};

// ==========================================
// Batch 35: Job Boards Integrations API (10.3)
// ==========================================

const JOB_BOARD_BASE_URL = '/api/job-boards';

export const jobBoardsAPI = {
  // Get integrations
  getIntegrations: async (params?: { platform?: string; status?: string }) => {
    const response = await api.get(`${JOB_BOARD_BASE_URL}/integrations`, { params });
    return response.data;
  },

  // Get specific integration
  getIntegration: async (integrationId: string) => {
    const response = await api.get(`${JOB_BOARD_BASE_URL}/integrations/${integrationId}`);
    return response.data;
  },

  // Create integration
  createIntegration: async (data: {
    name: string;
    platform: string;
    authType: string;
    autoPostEnabled?: boolean;
    connectionSettings?: Record<string, unknown>;
  }) => {
    const response = await api.post(`${JOB_BOARD_BASE_URL}/integrations`, data);
    return response.data;
  },

  // Update integration
  updateIntegration: async (integrationId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${JOB_BOARD_BASE_URL}/integrations/${integrationId}`, data);
    return response.data;
  },

  // Delete integration
  deleteIntegration: async (integrationId: string) => {
    const response = await api.delete(`${JOB_BOARD_BASE_URL}/integrations/${integrationId}`);
    return response.data;
  },

  // Test connection
  testConnection: async (integrationId: string) => {
    const response = await api.post(`${JOB_BOARD_BASE_URL}/integrations/${integrationId}/test`);
    return response.data;
  },

  // Get postings
  getPostings: async (integrationId: string, params?: { status?: string; jobId?: string }) => {
    const response = await api.get(`${JOB_BOARD_BASE_URL}/integrations/${integrationId}/postings`, { params });
    return response.data;
  },

  // Post job
  postJob: async (integrationId: string, data: {
    jobId: string;
    isSponsored?: boolean;
    budget?: number;
    expiresAt?: string;
  }) => {
    const response = await api.post(`${JOB_BOARD_BASE_URL}/integrations/${integrationId}/postings`, data);
    return response.data;
  },

  // Close posting
  closePosting: async (postingId: string) => {
    const response = await api.post(`${JOB_BOARD_BASE_URL}/postings/${postingId}/close`);
    return response.data;
  },

  // Get performance
  getPerformance: async (integrationId: string, params?: { dateRange?: string }) => {
    const response = await api.get(`${JOB_BOARD_BASE_URL}/integrations/${integrationId}/performance`, { params });
    return response.data;
  },

  // Get source comparison
  getSourceComparison: async () => {
    const response = await api.get(`${JOB_BOARD_BASE_URL}/analytics/source-comparison`);
    return response.data;
  },

  // Get available boards
  getBoards: async () => {
    const response = await api.get(`${JOB_BOARD_BASE_URL}/boards`);
    return response.data;
  },

  // Get dashboard
  getDashboard: async () => {
    const response = await api.get(`${JOB_BOARD_BASE_URL}/dashboard`);
    return response.data;
  },
};

// ==========================================
// Batch 36: Developer Tools API (10.4)
// ==========================================

const DEV_BASE_URL = '/api/developer';

export const developerToolsAPI = {
  // API Keys
  getAPIKeys: async (params?: { isActive?: boolean; environment?: string }) => {
    const response = await api.get(`${DEV_BASE_URL}/api-keys`, { params });
    return response.data;
  },

  createAPIKey: async (data: {
    name: string;
    scopes: string[];
    rateLimit?: number;
    environment?: string;
    expiresAt?: string;
    allowedIPs?: string[];
    description?: string;
  }) => {
    const response = await api.post(`${DEV_BASE_URL}/api-keys`, data);
    return response.data;
  },

  updateAPIKey: async (keyId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${DEV_BASE_URL}/api-keys/${keyId}`, data);
    return response.data;
  },

  revokeAPIKey: async (keyId: string) => {
    const response = await api.delete(`${DEV_BASE_URL}/api-keys/${keyId}`);
    return response.data;
  },

  getAPIKeyUsage: async (keyId: string, params?: { period?: string }) => {
    const response = await api.get(`${DEV_BASE_URL}/api-keys/${keyId}/usage`, { params });
    return response.data;
  },

  // Webhooks
  getWebhooks: async (params?: { isActive?: boolean }) => {
    const response = await api.get(`${DEV_BASE_URL}/webhooks`, { params });
    return response.data;
  },

  createWebhook: async (data: {
    name: string;
    url: string;
    events: string[];
    headers?: Record<string, string>;
    retryPolicy?: { maxRetries: number; retryInterval: number };
  }) => {
    const response = await api.post(`${DEV_BASE_URL}/webhooks`, data);
    return response.data;
  },

  updateWebhook: async (webhookId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${DEV_BASE_URL}/webhooks/${webhookId}`, data);
    return response.data;
  },

  deleteWebhook: async (webhookId: string) => {
    const response = await api.delete(`${DEV_BASE_URL}/webhooks/${webhookId}`);
    return response.data;
  },

  testWebhook: async (webhookId: string) => {
    const response = await api.post(`${DEV_BASE_URL}/webhooks/${webhookId}/test`);
    return response.data;
  },

  getWebhookDeliveries: async (webhookId: string, params?: { status?: string; limit?: number }) => {
    const response = await api.get(`${DEV_BASE_URL}/webhooks/${webhookId}/deliveries`, { params });
    return response.data;
  },

  retryDelivery: async (deliveryId: string) => {
    const response = await api.post(`${DEV_BASE_URL}/deliveries/${deliveryId}/retry`);
    return response.data;
  },

  // Automation integrations
  getAutomationIntegrations: async (params?: { platform?: string; isActive?: boolean }) => {
    const response = await api.get(`${DEV_BASE_URL}/automations`, { params });
    return response.data;
  },

  // Developer resources
  getAvailableEvents: async () => {
    const response = await api.get(`${DEV_BASE_URL}/events`);
    return response.data;
  },

  getAPIScopes: async () => {
    const response = await api.get(`${DEV_BASE_URL}/scopes`);
    return response.data;
  },

  getDocumentation: async () => {
    const response = await api.get(`${DEV_BASE_URL}/docs`);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get(`${DEV_BASE_URL}/dashboard`);
    return response.data;
  },
};

// Export all APIs
export default {
  hr: hrIntegrationsAPI,
  communication: communicationAPI,
  jobBoards: jobBoardsAPI,
  developer: developerToolsAPI,
};
