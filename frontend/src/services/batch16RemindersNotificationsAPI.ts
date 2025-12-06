import axios from 'axios';
import {
  ReminderSchedule,
  NotificationChannel,
  ReminderNotification,
  PushSubscription,
  ConfirmationRequest,
  PrepMaterial,
  PrepMaterialDelivery,
  NotificationPreference,
  NotificationStats,
  CreateReminderScheduleInput,
  UpsertNotificationChannelInput,
  ScheduleReminderInput,
  CreateConfirmationRequestInput,
  ConfirmationResponseInput,
  CreatePrepMaterialInput,
  SchedulePrepDeliveryInput,
  UpdateNotificationPreferencesInput,
  RegisterPushSubscriptionInput,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Axios instance with auth
const api = axios.create({
  baseURL: `${API_BASE}/reminders`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// MOCK DATA
// ============================================

const mockReminderSchedules: ReminderSchedule[] = [
  {
    id: 'rs-1',
    userId: 'user-1',
    name: 'Standard Interview Reminder',
    description: 'Default reminder schedule for all interviews',
    isDefault: true,
    isActive: true,
    reminderTimes: [1440, 60, 15], // 24h, 1h, 15min
    eventTypes: ['INTERVIEW', 'SCREENING', 'TECHNICAL'],
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    pushEnabled: true,
    scope: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockNotificationChannels: NotificationChannel[] = [
  {
    id: 'nc-1',
    userId: 'user-1',
    channelType: 'EMAIL',
    isEnabled: true,
    isPrimary: true,
    emailAddress: 'user@example.com',
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    phoneVerified: false,
    whatsappVerified: false,
    whatsappOptIn: false,
    pushEnabled: true,
    quietHoursEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nc-2',
    userId: 'user-1',
    channelType: 'PUSH',
    isEnabled: true,
    isPrimary: false,
    emailVerified: false,
    phoneVerified: false,
    whatsappVerified: false,
    whatsappOptIn: false,
    pushEnabled: true,
    pushPlatform: 'WEB',
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockReminders: ReminderNotification[] = [
  {
    id: 'rem-1',
    userId: 'user-1',
    interviewId: 'int-1',
    reminderType: 'PRE_INTERVIEW',
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    minutesBefore: 1440,
    status: 'PENDING',
    retryCount: 0,
    maxRetries: 3,
    channel: 'EMAIL',
    subject: 'Interview Reminder: Software Engineer Position',
    body: 'Your interview is scheduled for tomorrow at 2:00 PM.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockConfirmationRequests: ConfirmationRequest[] = [
  {
    id: 'conf-1',
    recipientId: 'candidate-1',
    senderId: 'recruiter-1',
    interviewId: 'int-1',
    requestType: 'ATTENDANCE',
    message: 'Please confirm your attendance for the upcoming interview.',
    token: 'token-123-456',
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    suggestReschedule: false,
    notificationsSent: 1,
    lastNotificationAt: new Date().toISOString(),
    channelsUsed: ['EMAIL'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockPrepMaterials: PrepMaterial[] = [
  {
    id: 'prep-1',
    createdById: 'recruiter-1',
    title: 'Company Overview',
    description: 'Learn about our company culture, mission, and values.',
    materialType: 'DOCUMENT',
    content: 'Welcome to our company...',
    category: 'COMPANY_INFO',
    tags: ['culture', 'about-us'],
    forInterviewTypes: ['SCREENING', 'FINAL'],
    forJobIds: [],
    forDepartments: [],
    isPublic: true,
    isActive: true,
    sendAutomatically: true,
    hoursBefore: 24,
    viewCount: 150,
    downloadCount: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prep-2',
    createdById: 'recruiter-1',
    title: 'Technical Interview Tips',
    description: 'Tips for succeeding in our technical interviews.',
    materialType: 'GUIDE',
    externalUrl: 'https://example.com/tech-tips',
    category: 'INTERVIEW_TIPS',
    tags: ['technical', 'tips'],
    forInterviewTypes: ['TECHNICAL'],
    forJobIds: [],
    forDepartments: ['Engineering'],
    isPublic: true,
    isActive: true,
    sendAutomatically: true,
    hoursBefore: 48,
    viewCount: 89,
    downloadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockNotificationPrefs: NotificationPreference = {
  id: 'pref-1',
  userId: 'user-1',
  notificationsEnabled: true,
  digestMode: 'INSTANT',
  emailEnabled: true,
  smsEnabled: false,
  whatsappEnabled: false,
  pushEnabled: true,
  inAppEnabled: true,
  interviewReminders: true,
  applicationUpdates: true,
  messageAlerts: true,
  jobAlerts: true,
  systemAnnouncements: true,
  marketingEmails: false,
  defaultReminderTimes: [1440, 60, 15],
  confirmationRequests: true,
  prepMaterialDelivery: true,
  quietHoursEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// REMINDER SCHEDULES API
// ============================================

export const reminderScheduleAPI = {
  create: async (data: CreateReminderScheduleInput): Promise<ReminderSchedule> => {
    if (USE_MOCK) {
      const newSchedule: ReminderSchedule = {
        id: `rs-${Date.now()}`,
        userId: 'user-1',
        ...data,
        isDefault: data.isDefault || false,
        isActive: true,
        reminderTimes: data.reminderTimes || [1440, 60, 15],
        eventTypes: data.eventTypes || [],
        emailEnabled: data.emailEnabled !== false,
        smsEnabled: data.smsEnabled || false,
        whatsappEnabled: data.whatsappEnabled || false,
        pushEnabled: data.pushEnabled !== false,
        scope: data.scope || 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockReminderSchedules.push(newSchedule);
      return newSchedule;
    }
    const response = await api.post('/reminder-schedules', data);
    return response.data;
  },

  getAll: async (): Promise<ReminderSchedule[]> => {
    if (USE_MOCK) return mockReminderSchedules;
    const response = await api.get('/reminder-schedules');
    return response.data;
  },

  update: async (id: string, data: Partial<CreateReminderScheduleInput>): Promise<ReminderSchedule> => {
    if (USE_MOCK) {
      const idx = mockReminderSchedules.findIndex(s => s.id === id);
      if (idx >= 0) {
        mockReminderSchedules[idx] = { ...mockReminderSchedules[idx], ...data, updatedAt: new Date().toISOString() };
        return mockReminderSchedules[idx];
      }
      throw new Error('Schedule not found');
    }
    const response = await api.patch(`/reminder-schedules/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const idx = mockReminderSchedules.findIndex(s => s.id === id);
      if (idx >= 0) mockReminderSchedules.splice(idx, 1);
      return;
    }
    await api.delete(`/reminder-schedules/${id}`);
  },
};

// ============================================
// NOTIFICATION CHANNELS API
// ============================================

export const notificationChannelAPI = {
  getAll: async (): Promise<NotificationChannel[]> => {
    if (USE_MOCK) return mockNotificationChannels;
    const response = await api.get('/channels');
    return response.data;
  },

  upsert: async (data: UpsertNotificationChannelInput): Promise<NotificationChannel> => {
    if (USE_MOCK) {
      const idx = mockNotificationChannels.findIndex(c => c.channelType === data.channelType);
      const channel: NotificationChannel = {
        id: idx >= 0 ? mockNotificationChannels[idx].id : `nc-${Date.now()}`,
        userId: 'user-1',
        channelType: data.channelType,
        isEnabled: data.isEnabled !== false,
        isPrimary: data.isPrimary || false,
        emailAddress: data.emailAddress,
        emailVerified: false,
        phoneNumber: data.phoneNumber,
        phoneCountryCode: data.phoneCountryCode,
        phoneVerified: false,
        whatsappNumber: data.whatsappNumber,
        whatsappVerified: false,
        whatsappOptIn: false,
        pushToken: data.pushToken,
        pushPlatform: data.pushPlatform,
        pushEnabled: true,
        quietHoursEnabled: data.quietHoursEnabled || false,
        quietHoursStart: data.quietHoursStart,
        quietHoursEnd: data.quietHoursEnd,
        timezone: data.timezone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        mockNotificationChannels[idx] = channel;
      } else {
        mockNotificationChannels.push(channel);
      }
      return channel;
    }
    const response = await api.put('/channels', data);
    return response.data;
  },

  verify: async (channelType: string, verificationCode: string): Promise<{ success: boolean; channel: NotificationChannel }> => {
    if (USE_MOCK) {
      const channel = mockNotificationChannels.find(c => c.channelType === channelType);
      if (channel) {
        if (channelType === 'EMAIL') channel.emailVerified = true;
        if (channelType === 'SMS') channel.phoneVerified = true;
        if (channelType === 'WHATSAPP') channel.whatsappVerified = true;
        return { success: true, channel };
      }
      throw new Error('Channel not found');
    }
    const response = await api.post(`/channels/${channelType}/verify`, { verificationCode });
    return response.data;
  },

  sendVerificationCode: async (channelType: string): Promise<{ success: boolean; expiresIn: number }> => {
    if (USE_MOCK) {
      return { success: true, expiresIn: 600 };
    }
    const response = await api.post(`/channels/${channelType}/send-code`);
    return response.data;
  },
};

// ============================================
// REMINDERS API
// ============================================

export const reminderAPI = {
  getUpcoming: async (status?: string, limit?: number): Promise<ReminderNotification[]> => {
    if (USE_MOCK) return mockReminders.filter(r => !status || r.status === status);
    const response = await api.get('/reminders', { params: { status, limit } });
    return response.data;
  },

  schedule: async (data: ScheduleReminderInput): Promise<ReminderNotification> => {
    if (USE_MOCK) {
      const reminder: ReminderNotification = {
        id: `rem-${Date.now()}`,
        userId: 'user-1',
        ...data,
        status: 'PENDING',
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockReminders.push(reminder);
      return reminder;
    }
    const response = await api.post('/reminders', data);
    return response.data;
  },

  cancel: async (id: string): Promise<ReminderNotification> => {
    if (USE_MOCK) {
      const reminder = mockReminders.find(r => r.id === id);
      if (reminder) reminder.status = 'CANCELLED';
      return reminder!;
    }
    const response = await api.patch(`/reminders/${id}/cancel`);
    return response.data;
  },

  getHistory: async (page?: number, limit?: number): Promise<{ reminders: ReminderNotification[]; total: number }> => {
    if (USE_MOCK) {
      return { reminders: mockReminders.filter(r => r.status !== 'PENDING'), total: 1 };
    }
    const response = await api.get('/reminders/history', { params: { page, limit } });
    return response.data;
  },
};

// ============================================
// PUSH SUBSCRIPTIONS API
// ============================================

export const pushAPI = {
  subscribe: async (data: RegisterPushSubscriptionInput): Promise<PushSubscription> => {
    if (USE_MOCK) {
      const sub: PushSubscription = {
        id: `push-${Date.now()}`,
        userId: 'user-1',
        ...data,
        platform: data.platform || 'WEB',
        isActive: true,
        failedAttempts: 0,
        interviewReminders: true,
        applicationUpdates: true,
        messageNotifications: true,
        systemAlerts: true,
        subscribedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return sub;
    }
    const response = await api.post('/push/subscribe', data);
    return response.data;
  },

  getSubscriptions: async (): Promise<PushSubscription[]> => {
    if (USE_MOCK) return [];
    const response = await api.get('/push/subscriptions');
    return response.data;
  },

  unsubscribe: async (endpoint: string): Promise<void> => {
    if (USE_MOCK) return;
    await api.post('/push/unsubscribe', { endpoint });
  },
};

// ============================================
// CONFIRMATION REQUESTS API
// ============================================

export const confirmationAPI = {
  create: async (data: CreateConfirmationRequestInput): Promise<ConfirmationRequest> => {
    if (USE_MOCK) {
      const request: ConfirmationRequest = {
        id: `conf-${Date.now()}`,
        senderId: 'user-1',
        ...data,
        requestType: data.requestType || 'ATTENDANCE',
        token: `token-${Date.now()}`,
        expiresAt: new Date(Date.now() + (data.expiresInHours || 48) * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        suggestReschedule: false,
        notificationsSent: 1,
        lastNotificationAt: new Date().toISOString(),
        channelsUsed: ['EMAIL'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockConfirmationRequests.push(request);
      return request;
    }
    const response = await api.post('/confirmations', data);
    return response.data;
  },

  getAll: async (type?: 'sent' | 'received', status?: string): Promise<ConfirmationRequest[]> => {
    if (USE_MOCK) return mockConfirmationRequests;
    const response = await api.get('/confirmations', { params: { type, status } });
    return response.data;
  },

  respond: async (token: string, data: ConfirmationResponseInput): Promise<ConfirmationRequest> => {
    if (USE_MOCK) {
      const request = mockConfirmationRequests.find(r => r.token === token);
      if (request) {
        request.status = data.response === 'confirm' ? 'CONFIRMED' : 'DECLINED';
        request.respondedAt = new Date().toISOString();
        request.responseMessage = data.responseMessage;
      }
      return request!;
    }
    const response = await api.post(`/confirmations/${token}/respond`, data);
    return response.data;
  },

  resend: async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      const request = mockConfirmationRequests.find(r => r.id === id);
      if (request) {
        request.notificationsSent++;
        request.lastNotificationAt = new Date().toISOString();
      }
      return { success: true };
    }
    const response = await api.post(`/confirmations/${id}/resend`);
    return response.data;
  },
};

// ============================================
// PREP MATERIALS API
// ============================================

export const prepMaterialAPI = {
  create: async (data: CreatePrepMaterialInput): Promise<PrepMaterial> => {
    if (USE_MOCK) {
      const material: PrepMaterial = {
        id: `prep-${Date.now()}`,
        createdById: 'user-1',
        ...data,
        tags: data.tags || [],
        forInterviewTypes: data.forInterviewTypes || [],
        forJobIds: data.forJobIds || [],
        forDepartments: data.forDepartments || [],
        isPublic: data.isPublic || false,
        isActive: true,
        sendAutomatically: data.sendAutomatically !== false,
        hoursBefore: data.hoursBefore || 24,
        viewCount: 0,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPrepMaterials.push(material);
      return material;
    }
    const response = await api.post('/prep-materials', data);
    return response.data;
  },

  getAll: async (filters?: { category?: string; materialType?: string; isActive?: boolean }): Promise<PrepMaterial[]> => {
    if (USE_MOCK) {
      return mockPrepMaterials.filter(m => {
        if (filters?.category && m.category !== filters.category) return false;
        if (filters?.materialType && m.materialType !== filters.materialType) return false;
        if (filters?.isActive !== undefined && m.isActive !== filters.isActive) return false;
        return true;
      });
    }
    const response = await api.get('/prep-materials', { params: filters });
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePrepMaterialInput>): Promise<PrepMaterial> => {
    if (USE_MOCK) {
      const idx = mockPrepMaterials.findIndex(m => m.id === id);
      if (idx >= 0) {
        mockPrepMaterials[idx] = { ...mockPrepMaterials[idx], ...data, updatedAt: new Date().toISOString() };
        return mockPrepMaterials[idx];
      }
      throw new Error('Material not found');
    }
    const response = await api.patch(`/prep-materials/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const idx = mockPrepMaterials.findIndex(m => m.id === id);
      if (idx >= 0) mockPrepMaterials.splice(idx, 1);
      return;
    }
    await api.delete(`/prep-materials/${id}`);
  },
};

// ============================================
// PREP DELIVERIES API
// ============================================

export const prepDeliveryAPI = {
  schedule: async (data: SchedulePrepDeliveryInput): Promise<PrepMaterialDelivery> => {
    if (USE_MOCK) {
      const delivery: PrepMaterialDelivery = {
        id: `del-${Date.now()}`,
        ...data,
        deliveryMethod: data.deliveryMethod || 'EMAIL',
        status: 'PENDING',
        openCount: 0,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return delivery;
    }
    const response = await api.post('/prep-deliveries', data);
    return response.data;
  },

  getAll: async (filters?: { status?: string; interviewId?: string }): Promise<PrepMaterialDelivery[]> => {
    if (USE_MOCK) return [];
    const response = await api.get('/prep-deliveries', { params: filters });
    return response.data;
  },

  markViewed: async (id: string): Promise<PrepMaterialDelivery> => {
    if (USE_MOCK) {
      return {
        id,
        materialId: 'prep-1',
        recipientId: 'user-1',
        deliveryMethod: 'EMAIL',
        scheduledFor: new Date().toISOString(),
        status: 'VIEWED',
        viewedAt: new Date().toISOString(),
        openCount: 1,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await api.patch(`/prep-deliveries/${id}/viewed`);
    return response.data;
  },

  submitFeedback: async (id: string, data: { helpfulRating: number; feedbackText?: string }): Promise<PrepMaterialDelivery> => {
    if (USE_MOCK) {
      return {
        id,
        materialId: 'prep-1',
        recipientId: 'user-1',
        deliveryMethod: 'EMAIL',
        scheduledFor: new Date().toISOString(),
        status: 'VIEWED',
        openCount: 1,
        downloadCount: 0,
        helpfulRating: data.helpfulRating,
        feedbackText: data.feedbackText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await api.post(`/prep-deliveries/${id}/feedback`, data);
    return response.data;
  },
};

// ============================================
// NOTIFICATION PREFERENCES API
// ============================================

export const notificationPrefsAPI = {
  get: async (): Promise<NotificationPreference> => {
    if (USE_MOCK) return mockNotificationPrefs;
    const response = await api.get('/preferences');
    return response.data;
  },

  update: async (data: UpdateNotificationPreferencesInput): Promise<NotificationPreference> => {
    if (USE_MOCK) {
      Object.assign(mockNotificationPrefs, data, { updatedAt: new Date().toISOString() });
      return mockNotificationPrefs;
    }
    const response = await api.put('/preferences', data);
    return response.data;
  },

  unsubscribeAll: async (reason?: string): Promise<void> => {
    if (USE_MOCK) {
      mockNotificationPrefs.notificationsEnabled = false;
      mockNotificationPrefs.emailEnabled = false;
      mockNotificationPrefs.smsEnabled = false;
      mockNotificationPrefs.whatsappEnabled = false;
      mockNotificationPrefs.pushEnabled = false;
      return;
    }
    await api.post('/unsubscribe', { reason });
  },
};

// ============================================
// UTILITY API
// ============================================

export const notificationUtilAPI = {
  sendTest: async (channel: string, type: string): Promise<{ success: boolean; sentAt: string }> => {
    if (USE_MOCK) {
      return { success: true, sentAt: new Date().toISOString() };
    }
    const response = await api.post('/test', { channel, type });
    return response.data;
  },

  getStats: async (startDate?: string, endDate?: string): Promise<NotificationStats> => {
    if (USE_MOCK) {
      return {
        total: { sent: 150, delivered: 145, failed: 5, opened: 120 },
        deliveryRate: '96.67',
        openRate: '82.76',
        byChannel: { EMAIL: 100, PUSH: 45, SMS: 5 },
      };
    }
    const response = await api.get('/stats', { params: { startDate, endDate } });
    return response.data;
  },
};
