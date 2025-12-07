// Batch 43-45: Enterprise Administration API Services (13.1-13.3)
import api from './api';

const BASE_URL = '/api/admin-enterprise';

// ==========================================
// Batch 43: Multi-Tenant & Organization API (13.1)
// ==========================================

export const tenantsAPI = {
  // Get all tenants
  getTenants: async (params?: { status?: string; plan?: string }) => {
    const response = await api.get(`${BASE_URL}/tenants`, { params });
    return response.data;
  },

  // Get single tenant
  getTenant: async (tenantId: string) => {
    const response = await api.get(`${BASE_URL}/tenants/${tenantId}`);
    return response.data;
  },

  // Create tenant
  createTenant: async (data: {
    name: string;
    slug: string;
    domain?: string;
    plan: string;
    maxUsers?: number;
    maxJobs?: number;
    storageLimit?: number;
    dataRegion?: string;
    settings?: Record<string, unknown>;
    features?: Record<string, boolean>;
  }) => {
    const response = await api.post(`${BASE_URL}/tenants`, data);
    return response.data;
  },

  // Update tenant
  updateTenant: async (tenantId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/tenants/${tenantId}`, data);
    return response.data;
  },
};

export const organizationsAPI = {
  // Get all organizations
  getOrganizations: async (params?: { tenantId?: string; type?: string; parentId?: string }) => {
    const response = await api.get(`${BASE_URL}/organizations`, { params });
    return response.data;
  },

  // Get single organization
  getOrganization: async (orgId: string) => {
    const response = await api.get(`${BASE_URL}/organizations/${orgId}`);
    return response.data;
  },

  // Create organization
  createOrganization: async (data: {
    tenantId: string;
    name: string;
    type: string;
    parentId?: string;
    code?: string;
    headId?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/organizations`, data);
    return response.data;
  },

  // Update organization
  updateOrganization: async (orgId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/organizations/${orgId}`, data);
    return response.data;
  },
};

export const costCentersAPI = {
  // Get cost centers
  getCostCenters: async (params?: { organizationId?: string; isActive?: boolean }) => {
    const response = await api.get(`${BASE_URL}/cost-centers`, { params });
    return response.data;
  },
};

export const departmentsAPI = {
  // Get departments
  getDepartments: async (params?: { parentId?: string; level?: number }) => {
    const response = await api.get(`${BASE_URL}/departments`, { params });
    return response.data;
  },
};

// ==========================================
// Batch 44: User & License Management API (13.2)
// ==========================================

export const licensesAPI = {
  // Get licenses
  getLicenses: async (params?: { licenseType?: string; isActive?: boolean }) => {
    const response = await api.get(`${BASE_URL}/licenses`, { params });
    return response.data;
  },

  // Allocate license
  allocateLicense: async (licenseId: string, data: { userId: string; expiresAt?: string }) => {
    const response = await api.post(`${BASE_URL}/licenses/${licenseId}/allocate`, data);
    return response.data;
  },

  // Revoke license allocation
  revokeAllocation: async (allocationId: string) => {
    const response = await api.delete(`${BASE_URL}/licenses/allocations/${allocationId}`);
    return response.data;
  },
};

export const rolesAPI = {
  // Get role templates
  getTemplates: async (params?: { category?: string }) => {
    const response = await api.get(`${BASE_URL}/role-templates`, { params });
    return response.data;
  },

  // Get custom roles
  getCustomRoles: async (params?: { isActive?: boolean }) => {
    const response = await api.get(`${BASE_URL}/custom-roles`, { params });
    return response.data;
  },

  // Create custom role
  createCustomRole: async (data: {
    name: string;
    description?: string;
    baseTemplateId?: string;
    permissions: string[];
    restrictions?: string[];
    dataAccess: string;
  }) => {
    const response = await api.post(`${BASE_URL}/custom-roles`, data);
    return response.data;
  },
};

export const accessReviewsAPI = {
  // Get access reviews
  getReviews: async (params?: { status?: string; reviewType?: string }) => {
    const response = await api.get(`${BASE_URL}/access-reviews`, { params });
    return response.data;
  },

  // Create access review
  createReview: async (data: {
    name: string;
    description?: string;
    reviewType: string;
    scope: string;
    reviewerId: string;
    dueDate: string;
  }) => {
    const response = await api.post(`${BASE_URL}/access-reviews`, data);
    return response.data;
  },
};

export const activityLogsAPI = {
  // Get user activity logs
  getLogs: async (params?: {
    userId?: string;
    action?: string;
    resourceType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    const response = await api.get(`${BASE_URL}/activity-logs`, { params });
    return response.data;
  },
};

// ==========================================
// Batch 45: Billing & Subscriptions API (13.3)
// ==========================================

export const subscriptionAPI = {
  // Get subscription
  getSubscription: async () => {
    const response = await api.get(`${BASE_URL}/subscription`);
    return response.data;
  },

  // Update subscription
  updateSubscription: async (data: {
    planTier?: string;
    billingCycle?: string;
    paymentMethodId?: string;
  }) => {
    const response = await api.put(`${BASE_URL}/subscription`, data);
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (data: { reason: string; cancelAtPeriodEnd?: boolean }) => {
    const response = await api.post(`${BASE_URL}/subscription/cancel`, data);
    return response.data;
  },
};

export const invoicesAPI = {
  // Get invoices
  getInvoices: async (params?: { status?: string; startDate?: string; endDate?: string }) => {
    const response = await api.get(`${BASE_URL}/invoices`, { params });
    return response.data;
  },
};

export const usageAPI = {
  // Get usage records
  getUsage: async (params?: { metricName?: string; periodStart?: string; periodEnd?: string }) => {
    const response = await api.get(`${BASE_URL}/usage`, { params });
    return response.data;
  },

  // Get quotas
  getQuotas: async () => {
    const response = await api.get(`${BASE_URL}/quotas`);
    return response.data;
  },
};

export const contractsAPI = {
  // Get enterprise contracts
  getContracts: async (params?: { status?: string }) => {
    const response = await api.get(`${BASE_URL}/contracts`, { params });
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
  tenants: tenantsAPI,
  organizations: organizationsAPI,
  costCenters: costCentersAPI,
  departments: departmentsAPI,
  licenses: licensesAPI,
  roles: rolesAPI,
  accessReviews: accessReviewsAPI,
  activityLogs: activityLogsAPI,
  subscription: subscriptionAPI,
  invoices: invoicesAPI,
  usage: usageAPI,
  contracts: contractsAPI,
  dashboard: dashboardAPI,
};
