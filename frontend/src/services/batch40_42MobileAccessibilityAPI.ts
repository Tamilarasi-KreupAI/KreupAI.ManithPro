// Batch 40-42: Mobile & Accessibility API Services (12.1-12.3)
import api from './api';

const BASE_URL = '/api/mobile';

// ==========================================
// Batch 40: Mobile Applications API (12.1)
// ==========================================

export const devicesAPI = {
  // Get devices
  getDevices: async (params?: { platform?: string; isActive?: boolean }) => {
    const response = await api.get(`${BASE_URL}/devices`, { params });
    return response.data;
  },

  // Register device
  registerDevice: async (data: {
    deviceId: string;
    platform: string;
    deviceName?: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
    pushToken?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/devices`, data);
    return response.data;
  },

  // Update device
  updateDevice: async (deviceId: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/devices/${deviceId}`, data);
    return response.data;
  },

  // Delete device
  deleteDevice: async (deviceId: string) => {
    const response = await api.delete(`${BASE_URL}/devices/${deviceId}`);
    return response.data;
  },

  // Update push settings
  updatePushSettings: async (deviceId: string, data: {
    pushEnabled?: boolean;
    pushCategories?: string[];
    pushToken?: string;
  }) => {
    const response = await api.put(`${BASE_URL}/devices/${deviceId}/push-settings`, data);
    return response.data;
  },

  // Enable biometric
  enableBiometric: async (deviceId: string, data: {
    biometricType: string;
    biometricToken?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/devices/${deviceId}/biometric`, data);
    return response.data;
  },
};

export const pushNotificationsAPI = {
  // Get notifications
  getNotifications: async (params?: { status?: string; type?: string; limit?: number }) => {
    const response = await api.get(`${BASE_URL}/push-notifications`, { params });
    return response.data;
  },

  // Send notification
  sendNotification: async (data: {
    userId?: string;
    deviceId?: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    notificationType: string;
    priority?: string;
    scheduledFor?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/push-notifications`, data);
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    const response = await api.post(`${BASE_URL}/push-notifications/${notificationId}/read`);
    return response.data;
  },
};

export const appConfigAPI = {
  // Get config
  getConfig: async (platform?: string) => {
    const response = await api.get(`${BASE_URL}/app-config`, { params: { platform } });
    return response.data;
  },

  // Update config
  updateConfig: async (data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/app-config`, data);
    return response.data;
  },
};

export const offlineSyncAPI = {
  // Get sync queue
  getQueue: async (deviceId: string, status?: string) => {
    const response = await api.get(`${BASE_URL}/sync-queue/${deviceId}`, { params: { status } });
    return response.data;
  },

  // Process queue
  processQueue: async (deviceId: string, items: Array<Record<string, unknown>>) => {
    const response = await api.post(`${BASE_URL}/sync-queue/${deviceId}/process`, { items });
    return response.data;
  },
};

// ==========================================
// Batch 41: PWA API (12.2)
// ==========================================

export const pwaAPI = {
  // Get config
  getConfig: async () => {
    const response = await api.get(`${BASE_URL}/pwa/config`);
    return response.data;
  },

  // Update config
  updateConfig: async (data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/pwa/config`, data);
    return response.data;
  },

  // Get subscriptions
  getSubscriptions: async () => {
    const response = await api.get(`${BASE_URL}/pwa/subscriptions`);
    return response.data;
  },

  // Subscribe
  subscribe: async (data: {
    endpoint: string;
    p256dh: string;
    auth: string;
    browserName?: string;
    browserVersion?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/pwa/subscribe`, data);
    return response.data;
  },

  // Unsubscribe
  unsubscribe: async (subscriptionId: string) => {
    const response = await api.delete(`${BASE_URL}/pwa/subscriptions/${subscriptionId}`);
    return response.data;
  },

  // Send web push
  sendPush: async (data: {
    userId?: string;
    subscriptionId?: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    icon?: string;
    badge?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/pwa/push`, data);
    return response.data;
  },

  // Get service worker status
  getServiceWorkerStatus: async () => {
    const response = await api.get(`${BASE_URL}/pwa/service-worker/status`);
    return response.data;
  },
};

// ==========================================
// Batch 42: Accessibility API (12.3)
// ==========================================

export const accessibilityAPI = {
  // Get settings
  getSettings: async () => {
    const response = await api.get(`${BASE_URL}/accessibility/settings`);
    return response.data;
  },

  // Update settings
  updateSettings: async (data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`${BASE_URL}/accessibility/settings`, data);
    return response.data;
  },

  // Reset settings
  resetSettings: async () => {
    const response = await api.post(`${BASE_URL}/accessibility/settings/reset`);
    return response.data;
  },

  // Get presets
  getPresets: async () => {
    const response = await api.get(`${BASE_URL}/accessibility/presets`);
    return response.data;
  },

  // Apply preset
  applyPreset: async (presetId: string) => {
    const response = await api.post(`${BASE_URL}/accessibility/presets/${presetId}/apply`);
    return response.data;
  },

  // Get audits
  getAudits: async (params?: { pageUrl?: string; minScore?: number }) => {
    const response = await api.get(`${BASE_URL}/accessibility/audits`, { params });
    return response.data;
  },

  // Run audit
  runAudit: async (data: { pageUrl: string; standard?: string }) => {
    const response = await api.post(`${BASE_URL}/accessibility/audits`, data);
    return response.data;
  },

  // Get accessibility dashboard
  getDashboard: async () => {
    const response = await api.get(`${BASE_URL}/accessibility/dashboard`);
    return response.data;
  },
};

// Main dashboard
export const dashboardAPI = {
  getDashboard: async () => {
    const response = await api.get(`${BASE_URL}/dashboard`);
    return response.data;
  },
};

// Export all APIs
export default {
  devices: devicesAPI,
  pushNotifications: pushNotificationsAPI,
  appConfig: appConfigAPI,
  offlineSync: offlineSyncAPI,
  pwa: pwaAPI,
  accessibility: accessibilityAPI,
  dashboard: dashboardAPI,
};
