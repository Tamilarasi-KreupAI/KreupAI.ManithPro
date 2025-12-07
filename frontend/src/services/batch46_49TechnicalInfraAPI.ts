// Batch 46-49: Technical Infrastructure API Services (14.1-14.4)
import api from './api';

const BASE_URL = '/api/infrastructure';

// ==========================================
// Batch 46: API Infrastructure API (14.1)
// ==========================================

export const apiKeysAPI = {
  // Get API keys
  getKeys: async () => {
    const response = await api.get(`${BASE_URL}/api-keys`);
    return response.data;
  },

  // Create API key
  createKey: async (data: {
    name: string;
    description?: string;
    scopes: string[];
    rateLimit?: number;
    dailyLimit?: number;
    expiresAt?: string;
    ipWhitelist?: string[];
  }) => {
    const response = await api.post(`${BASE_URL}/api-keys`, data);
    return response.data;
  },

  // Revoke API key
  revokeKey: async (keyId: string) => {
    const response = await api.delete(`${BASE_URL}/api-keys/${keyId}`);
    return response.data;
  },
};

export const rateLimitsAPI = {
  // Get rate limit rules
  getRules: async () => {
    const response = await api.get(`${BASE_URL}/rate-limits`);
    return response.data;
  },

  // Create rate limit rule
  createRule: async (data: {
    name: string;
    ruleType: string;
    requestsPerMinute?: number;
    requestsPerHour?: number;
    endpoint?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/rate-limits`, data);
    return response.data;
  },
};

export const cacheAPI = {
  // Get cache stats
  getStats: async () => {
    const response = await api.get(`${BASE_URL}/cache/stats`);
    return response.data;
  },

  // Clear cache
  clear: async (data?: { namespace?: string; tags?: string[] }) => {
    const response = await api.post(`${BASE_URL}/cache/clear`, data || {});
    return response.data;
  },
};

export const docsAPI = {
  // Get API documentation
  getDocs: async () => {
    const response = await api.get(`${BASE_URL}/docs`);
    return response.data;
  },
};

export const webhooksAPI = {
  // Get webhooks
  getWebhooks: async () => {
    const response = await api.get(`${BASE_URL}/webhooks`);
    return response.data;
  },

  // Create webhook
  createWebhook: async (data: {
    name: string;
    url: string;
    events: string[];
    description?: string;
    maxRetries?: number;
    timeoutMs?: number;
  }) => {
    const response = await api.post(`${BASE_URL}/webhooks`, data);
    return response.data;
  },

  // Update webhook
  updateWebhook: async (webhookId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/webhooks/${webhookId}`, data);
    return response.data;
  },

  // Delete webhook
  deleteWebhook: async (webhookId: string) => {
    const response = await api.delete(`${BASE_URL}/webhooks/${webhookId}`);
    return response.data;
  },

  // Get deliveries
  getDeliveries: async (webhookId: string) => {
    const response = await api.get(`${BASE_URL}/webhooks/${webhookId}/deliveries`);
    return response.data;
  },

  // Retry delivery
  retryDelivery: async (deliveryId: string) => {
    const response = await api.post(`${BASE_URL}/webhooks/deliveries/${deliveryId}/retry`);
    return response.data;
  },
};

// ==========================================
// Batch 47: Testing & Quality API (14.2)
// ==========================================

export const testSuitesAPI = {
  // Get test suites
  getSuites: async () => {
    const response = await api.get(`${BASE_URL}/test-suites`);
    return response.data;
  },

  // Get single suite
  getSuite: async (suiteId: string) => {
    const response = await api.get(`${BASE_URL}/test-suites/${suiteId}`);
    return response.data;
  },

  // Run test suite
  runSuite: async (suiteId: string) => {
    const response = await api.post(`${BASE_URL}/test-suites/${suiteId}/run`);
    return response.data;
  },
};

export const testRunsAPI = {
  // Get test runs
  getRuns: async (params?: { suiteId?: string; status?: string }) => {
    const response = await api.get(`${BASE_URL}/test-runs`, { params });
    return response.data;
  },
};

export const testCasesAPI = {
  // Get test cases
  getCases: async (params?: { suiteId?: string; priority?: string }) => {
    const response = await api.get(`${BASE_URL}/test-cases`, { params });
    return response.data;
  },
};

export const codeQualityAPI = {
  // Get reports
  getReports: async (params?: { reportType?: string; branch?: string }) => {
    const response = await api.get(`${BASE_URL}/code-quality`, { params });
    return response.data;
  },

  // Run check
  runCheck: async (data: { reportType: string; branch?: string; targetPath?: string }) => {
    const response = await api.post(`${BASE_URL}/code-quality/run`, data);
    return response.data;
  },
};

export const pipelinesAPI = {
  // Get pipelines
  getPipelines: async () => {
    const response = await api.get(`${BASE_URL}/pipelines`);
    return response.data;
  },

  // Trigger pipeline
  trigger: async (pipelineId: string) => {
    const response = await api.post(`${BASE_URL}/pipelines/${pipelineId}/trigger`);
    return response.data;
  },
};

// ==========================================
// Batch 48: Monitoring & Logging API (14.3)
// ==========================================

export const metricsAPI = {
  // Get system metrics
  getMetrics: async () => {
    const response = await api.get(`${BASE_URL}/metrics`);
    return response.data;
  },

  // Get metric history
  getHistory: async (metricName: string, params?: { period?: string; interval?: string }) => {
    const response = await api.get(`${BASE_URL}/metrics/${metricName}/history`, { params });
    return response.data;
  },
};

export const errorsAPI = {
  // Get error logs
  getErrors: async (params?: { severity?: string; status?: string; limit?: number }) => {
    const response = await api.get(`${BASE_URL}/errors`, { params });
    return response.data;
  },

  // Resolve error
  resolveError: async (errorId: string, resolution: string) => {
    const response = await api.post(`${BASE_URL}/errors/${errorId}/resolve`, { resolution });
    return response.data;
  },
};

export const auditLogsAPI = {
  // Get audit logs
  getLogs: async (params?: { action?: string; resourceType?: string; userId?: string; limit?: number }) => {
    const response = await api.get(`${BASE_URL}/audit-logs`, { params });
    return response.data;
  },
};

export const tracesAPI = {
  // Get performance traces
  getTraces: async (params?: { service?: string; operationType?: string; limit?: number }) => {
    const response = await api.get(`${BASE_URL}/traces`, { params });
    return response.data;
  },
};

export const alertsAPI = {
  // Get alert rules
  getRules: async () => {
    const response = await api.get(`${BASE_URL}/alerts/rules`);
    return response.data;
  },

  // Create alert rule
  createRule: async (data: {
    name: string;
    metricName: string;
    condition: string;
    threshold: number;
    severity: string;
    channels: string[];
  }) => {
    const response = await api.post(`${BASE_URL}/alerts/rules`, data);
    return response.data;
  },

  // Get incidents
  getIncidents: async (params?: { status?: string; severity?: string }) => {
    const response = await api.get(`${BASE_URL}/alerts/incidents`, { params });
    return response.data;
  },

  // Acknowledge incident
  acknowledgeIncident: async (incidentId: string) => {
    const response = await api.post(`${BASE_URL}/alerts/incidents/${incidentId}/acknowledge`);
    return response.data;
  },

  // Resolve incident
  resolveIncident: async (incidentId: string) => {
    const response = await api.post(`${BASE_URL}/alerts/incidents/${incidentId}/resolve`);
    return response.data;
  },
};

// ==========================================
// Batch 49: DevOps & Deployment API (14.4)
// ==========================================

export const deploymentsAPI = {
  // Get deployments
  getDeployments: async (params?: { environment?: string; status?: string }) => {
    const response = await api.get(`${BASE_URL}/deployments`, { params });
    return response.data;
  },

  // Create deployment
  createDeployment: async (data: {
    version: string;
    environment: string;
    branch?: string;
    commit?: string;
    notes?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/deployments`, data);
    return response.data;
  },

  // Rollback deployment
  rollback: async (deploymentId: string) => {
    const response = await api.post(`${BASE_URL}/deployments/${deploymentId}/rollback`);
    return response.data;
  },
};

export const environmentsAPI = {
  // Get environments
  getEnvironments: async () => {
    const response = await api.get(`${BASE_URL}/environments`);
    return response.data;
  },

  // Get single environment
  getEnvironment: async (envId: string) => {
    const response = await api.get(`${BASE_URL}/environments/${envId}`);
    return response.data;
  },
};

export const featureFlagsAPI = {
  // Get feature flags
  getFlags: async () => {
    const response = await api.get(`${BASE_URL}/feature-flags`);
    return response.data;
  },

  // Create feature flag
  createFlag: async (data: {
    key: string;
    name: string;
    description?: string;
    flagType: string;
    defaultValue: unknown;
    isEnabled?: boolean;
    rolloutPercentage?: number;
  }) => {
    const response = await api.post(`${BASE_URL}/feature-flags`, data);
    return response.data;
  },

  // Update feature flag
  updateFlag: async (flagId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/feature-flags/${flagId}`, data);
    return response.data;
  },
};

export const serviceHealthAPI = {
  // Get service health
  getServices: async () => {
    const response = await api.get(`${BASE_URL}/health/services`);
    return response.data;
  },
};

export const backupsAPI = {
  // Get backups
  getBackups: async (params?: { source?: string; status?: string }) => {
    const response = await api.get(`${BASE_URL}/backups`, { params });
    return response.data;
  },

  // Create backup
  createBackup: async (data: { backupType: string; source: string; name?: string }) => {
    const response = await api.post(`${BASE_URL}/backups`, data);
    return response.data;
  },

  // Restore backup
  restore: async (backupId: string) => {
    const response = await api.post(`${BASE_URL}/backups/${backupId}/restore`);
    return response.data;
  },
};

// Dashboard
export const dashboardAPI = {
  getDashboard: async () => {
    const response = await api.get(`${BASE_URL}/dashboard`);
    return response.data;
  },
};

// Export all APIs
export default {
  apiKeys: apiKeysAPI,
  rateLimits: rateLimitsAPI,
  cache: cacheAPI,
  docs: docsAPI,
  webhooks: webhooksAPI,
  testSuites: testSuitesAPI,
  testRuns: testRunsAPI,
  testCases: testCasesAPI,
  codeQuality: codeQualityAPI,
  pipelines: pipelinesAPI,
  metrics: metricsAPI,
  errors: errorsAPI,
  auditLogs: auditLogsAPI,
  traces: tracesAPI,
  alerts: alertsAPI,
  deployments: deploymentsAPI,
  environments: environmentsAPI,
  featureFlags: featureFlagsAPI,
  serviceHealth: serviceHealthAPI,
  backups: backupsAPI,
  dashboard: dashboardAPI,
};
