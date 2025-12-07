// Batch 37-39: Workflow Automation API Services (11.1-11.3)
import api from './api';

const BASE_URL = '/api/workflow-automation';

// ==========================================
// Batch 37: Automation Engine API (11.1)
// ==========================================

export const automationsAPI = {
  // Get all workflow automations
  getAutomations: async (params?: { status?: string; triggerType?: string; category?: string; isActive?: boolean }) => {
    const response = await api.get(`${BASE_URL}/automations`, { params });
    return response.data;
  },

  // Get single automation
  getAutomation: async (automationId: string) => {
    const response = await api.get(`${BASE_URL}/automations/${automationId}`);
    return response.data;
  },

  // Create automation
  createAutomation: async (data: {
    name: string;
    description?: string;
    category?: string;
    triggerType: string;
    triggerEvent?: string;
    triggerSchedule?: string;
    triggerConditions?: Record<string, unknown>;
    steps: Array<{ action: string; params?: Record<string, unknown> }>;
    conditionalLogic?: Record<string, unknown>;
    delayEnabled?: boolean;
    delayDuration?: number;
    delayType?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/automations`, data);
    return response.data;
  },

  // Update automation
  updateAutomation: async (automationId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/automations/${automationId}`, data);
    return response.data;
  },

  // Delete automation
  deleteAutomation: async (automationId: string) => {
    const response = await api.delete(`${BASE_URL}/automations/${automationId}`);
    return response.data;
  },

  // Toggle activation
  toggleAutomation: async (automationId: string, isActive: boolean) => {
    const response = await api.post(`${BASE_URL}/automations/${automationId}/toggle`, { isActive });
    return response.data;
  },

  // Execute manually
  executeAutomation: async (automationId: string, contextData?: Record<string, unknown>) => {
    const response = await api.post(`${BASE_URL}/automations/${automationId}/execute`, { contextData });
    return response.data;
  },

  // Get executions
  getExecutions: async (automationId: string, params?: { status?: string; limit?: number }) => {
    const response = await api.get(`${BASE_URL}/automations/${automationId}/executions`, { params });
    return response.data;
  },
};

export const templatesAPI = {
  // Get templates
  getTemplates: async (params?: { category?: string; isFeatured?: boolean }) => {
    const response = await api.get(`${BASE_URL}/templates`, { params });
    return response.data;
  },

  // Create from template
  createFromTemplate: async (templateId: string, data: { name: string; configuration?: Record<string, unknown> }) => {
    const response = await api.post(`${BASE_URL}/templates/${templateId}/create`, data);
    return response.data;
  },
};

export const triggersAPI = {
  // Get trigger events
  getEvents: async () => {
    const response = await api.get(`${BASE_URL}/trigger-events`);
    return response.data;
  },

  // Get available actions
  getActions: async () => {
    const response = await api.get(`${BASE_URL}/actions`);
    return response.data;
  },
};

// ==========================================
// Scheduled Jobs API
// ==========================================

export const scheduledJobsAPI = {
  // Get jobs
  getJobs: async (params?: { status?: string; jobType?: string }) => {
    const response = await api.get(`${BASE_URL}/scheduled-jobs`, { params });
    return response.data;
  },

  // Create job
  createJob: async (data: {
    name: string;
    description?: string;
    jobType: string;
    schedule: string;
    timezone?: string;
    configuration?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
  }) => {
    const response = await api.post(`${BASE_URL}/scheduled-jobs`, data);
    return response.data;
  },

  // Update job
  updateJob: async (jobId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/scheduled-jobs/${jobId}`, data);
    return response.data;
  },

  // Delete job
  deleteJob: async (jobId: string) => {
    const response = await api.delete(`${BASE_URL}/scheduled-jobs/${jobId}`);
    return response.data;
  },

  // Run now
  runNow: async (jobId: string) => {
    const response = await api.post(`${BASE_URL}/scheduled-jobs/${jobId}/run`);
    return response.data;
  },
};

// ==========================================
// Bulk Actions API
// ==========================================

export const bulkActionsAPI = {
  // Get actions
  getActions: async (params?: { status?: string; actionType?: string }) => {
    const response = await api.get(`${BASE_URL}/bulk-actions`, { params });
    return response.data;
  },

  // Create action
  createAction: async (data: {
    name?: string;
    actionType: string;
    targetType: string;
    targetIds: string[];
    actionData: Record<string, unknown>;
    filters?: Record<string, unknown>;
  }) => {
    const response = await api.post(`${BASE_URL}/bulk-actions`, data);
    return response.data;
  },

  // Get status
  getStatus: async (actionId: string) => {
    const response = await api.get(`${BASE_URL}/bulk-actions/${actionId}/status`);
    return response.data;
  },

  // Cancel action
  cancelAction: async (actionId: string) => {
    const response = await api.post(`${BASE_URL}/bulk-actions/${actionId}/cancel`);
    return response.data;
  },
};

// ==========================================
// Batch 39: Approval Workflows API (11.3)
// ==========================================

export const approvalWorkflowsAPI = {
  // Get workflows
  getWorkflows: async (params?: { workflowType?: string; isActive?: boolean }) => {
    const response = await api.get(`${BASE_URL}/approval-workflows`, { params });
    return response.data;
  },

  // Get single workflow
  getWorkflow: async (workflowId: string) => {
    const response = await api.get(`${BASE_URL}/approval-workflows/${workflowId}`);
    return response.data;
  },

  // Create workflow
  createWorkflow: async (data: {
    name: string;
    description?: string;
    workflowType: string;
    steps: Array<{
      step: number;
      name: string;
      approverType: string;
      approverId?: string;
      approverRole?: string;
      condition?: string;
    }>;
    escalationRules?: Record<string, unknown>;
    requireAllApprovers?: boolean;
    allowParallelApproval?: boolean;
    timeoutHours?: number;
    delegationEnabled?: boolean;
  }) => {
    const response = await api.post(`${BASE_URL}/approval-workflows`, data);
    return response.data;
  },

  // Update workflow
  updateWorkflow: async (workflowId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/approval-workflows/${workflowId}`, data);
    return response.data;
  },

  // Delete workflow
  deleteWorkflow: async (workflowId: string) => {
    const response = await api.delete(`${BASE_URL}/approval-workflows/${workflowId}`);
    return response.data;
  },
};

export const approvalRequestsAPI = {
  // Get requests
  getRequests: async (params?: { status?: string; requestType?: string; requestedBy?: string }) => {
    const response = await api.get(`${BASE_URL}/approval-requests`, { params });
    return response.data;
  },

  // Get my pending approvals
  getMyPending: async () => {
    const response = await api.get(`${BASE_URL}/approval-requests/my-pending`);
    return response.data;
  },

  // Submit request
  submitRequest: async (data: {
    workflowId: string;
    requestType: string;
    title: string;
    description?: string;
    requestData: Record<string, unknown>;
    priority?: string;
    attachments?: Array<Record<string, unknown>>;
  }) => {
    const response = await api.post(`${BASE_URL}/approval-requests`, data);
    return response.data;
  },

  // Approve
  approve: async (requestId: string, data?: { comments?: string; conditions?: Record<string, unknown> }) => {
    const response = await api.post(`${BASE_URL}/approval-requests/${requestId}/approve`, data);
    return response.data;
  },

  // Reject
  reject: async (requestId: string, reason: string) => {
    const response = await api.post(`${BASE_URL}/approval-requests/${requestId}/reject`, { reason });
    return response.data;
  },

  // Delegate
  delegate: async (requestId: string, delegateTo: string, reason?: string) => {
    const response = await api.post(`${BASE_URL}/approval-requests/${requestId}/delegate`, { delegateTo, reason });
    return response.data;
  },
};

export const approvalAnalyticsAPI = {
  // Get analytics
  getAnalytics: async (params?: { workflowType?: string; dateRange?: string }) => {
    const response = await api.get(`${BASE_URL}/approval-analytics`, { params });
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
  automations: automationsAPI,
  templates: templatesAPI,
  triggers: triggersAPI,
  scheduledJobs: scheduledJobsAPI,
  bulkActions: bulkActionsAPI,
  approvalWorkflows: approvalWorkflowsAPI,
  approvalRequests: approvalRequestsAPI,
  approvalAnalytics: approvalAnalyticsAPI,
  dashboard: dashboardAPI,
};
