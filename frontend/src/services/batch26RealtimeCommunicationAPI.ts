import axios from 'axios';
import type {
  UserPresence,
  PresencePreferences,
  RealtimeNotification,
  Conversation,
  ConversationParticipant,
  Message,
  MessageReaction,
  MessageAttachment,
  MessageTemplate,
  ScheduledMessage,
  TypingIndicator,
  EmailFallbackConfig,
  CommunicationStats,
  ConversationType,
  PresenceStatus,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = true;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPresence: Record<string, UserPresence> = {
  'user-1': {
    id: 'pres-1',
    userId: 'user-1',
    status: 'ONLINE',
    customStatus: 'Available',
    lastSeen: new Date().toISOString(),
    currentPage: '/dashboard',
    deviceType: 'DESKTOP',
    autoAway: true,
    autoAwayMinutes: 5,
    showPresence: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  'user-2': {
    id: 'pres-2',
    userId: 'user-2',
    status: 'AWAY',
    lastSeen: new Date(Date.now() - 10 * 60000).toISOString(),
    autoAway: true,
    autoAwayMinutes: 5,
    showPresence: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  'user-3': {
    id: 'pres-3',
    userId: 'user-3',
    status: 'OFFLINE',
    lastSeen: new Date(Date.now() - 60 * 60000).toISOString(),
    autoAway: true,
    autoAwayMinutes: 5,
    showPresence: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
};

const mockNotifications: RealtimeNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'MESSAGE',
    title: 'New Message',
    body: 'John Smith sent you a message',
    icon: 'message',
    entityType: 'CONVERSATION',
    entityId: 'conv-1',
    actionUrl: '/messages/conv-1',
    priority: 'NORMAL',
    sound: true,
    vibrate: true,
    persistent: false,
    isDelivered: true,
    deliveredAt: '2024-02-25T10:00:00Z',
    isRead: false,
    isDismissed: false,
    createdAt: '2024-02-25T10:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'APPLICATION',
    title: 'New Application',
    body: 'A new candidate applied for Senior Developer',
    priority: 'HIGH',
    sound: true,
    vibrate: true,
    persistent: false,
    isDelivered: true,
    isRead: true,
    readAt: '2024-02-25T09:30:00Z',
    isDismissed: false,
    createdAt: '2024-02-25T09:00:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'INTERVIEW',
    title: 'Interview Reminder',
    body: 'Interview with Jane Doe in 15 minutes',
    priority: 'URGENT',
    sound: true,
    vibrate: true,
    persistent: true,
    isDelivered: true,
    isRead: false,
    isDismissed: false,
    createdAt: '2024-02-25T08:45:00Z',
  },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'DIRECT',
    isArchived: false,
    isMuted: false,
    allowReactions: true,
    allowAttachments: true,
    isPublic: false,
    lastMessageAt: '2024-02-25T10:00:00Z',
    messageCount: 25,
    createdBy: 'user-1',
    createdAt: '2024-02-01T00:00:00Z',
    participants: [
      { id: 'part-1', conversationId: 'conv-1', userId: 'user-1', userName: 'You', role: 'OWNER', isActive: true, isMuted: false, isPinned: true, unreadCount: 0, notifyOnMessage: true, notifyOnMention: true, joinedAt: '2024-02-01T00:00:00Z' },
      { id: 'part-2', conversationId: 'conv-1', userId: 'user-2', userName: 'John Smith', role: 'MEMBER', isActive: true, isMuted: false, isPinned: false, unreadCount: 2, notifyOnMessage: true, notifyOnMention: true, joinedAt: '2024-02-01T00:00:00Z' },
    ],
  },
  {
    id: 'conv-2',
    type: 'GROUP',
    name: 'Engineering Team',
    description: 'Discussion for engineering team',
    isArchived: false,
    isMuted: false,
    allowReactions: true,
    allowAttachments: true,
    isPublic: false,
    lastMessageAt: '2024-02-24T18:00:00Z',
    messageCount: 150,
    createdBy: 'user-1',
    createdAt: '2024-01-15T00:00:00Z',
    participants: [
      { id: 'part-3', conversationId: 'conv-2', userId: 'user-1', userName: 'You', role: 'OWNER', isActive: true, isMuted: false, isPinned: false, unreadCount: 5, notifyOnMessage: true, notifyOnMention: true, joinedAt: '2024-01-15T00:00:00Z' },
      { id: 'part-4', conversationId: 'conv-2', userId: 'user-2', userName: 'John Smith', role: 'ADMIN', isActive: true, isMuted: false, isPinned: false, unreadCount: 0, notifyOnMessage: true, notifyOnMention: true, joinedAt: '2024-01-15T00:00:00Z' },
      { id: 'part-5', conversationId: 'conv-2', userId: 'user-3', userName: 'Jane Doe', role: 'MEMBER', isActive: true, isMuted: false, isPinned: false, unreadCount: 3, notifyOnMessage: true, notifyOnMention: true, joinedAt: '2024-01-16T00:00:00Z' },
    ],
  },
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-2',
    senderName: 'John Smith',
    type: 'TEXT',
    content: 'Hey, do you have time to review the candidate profile?',
    threadCount: 0,
    status: 'READ',
    createdAt: '2024-02-25T09:55:00Z',
    attachments: [],
    reactions: [],
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-1',
    senderName: 'You',
    type: 'TEXT',
    content: 'Sure, let me take a look. Which position is it for?',
    threadCount: 0,
    status: 'DELIVERED',
    createdAt: '2024-02-25T09:57:00Z',
    attachments: [],
    reactions: [{ id: 'react-1', messageId: 'msg-2', userId: 'user-2', emoji: '👍', createdAt: '2024-02-25T09:58:00Z' }],
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-2',
    senderName: 'John Smith',
    type: 'TEXT',
    content: 'It\'s for the Senior Frontend Developer role. The candidate has 5 years of React experience.',
    threadCount: 0,
    status: 'SENT',
    createdAt: '2024-02-25T10:00:00Z',
    attachments: [],
    reactions: [],
  },
];

const mockTemplates: MessageTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Interview Confirmation',
    shortcut: '/confirm',
    category: 'FOLLOWUP',
    content: 'Hi {{candidateName}}, your interview for {{position}} has been confirmed for {{date}} at {{time}}. Looking forward to speaking with you!',
    variables: [
      { name: 'candidateName', placeholder: 'Candidate Name' },
      { name: 'position', placeholder: 'Job Position' },
      { name: 'date', placeholder: 'Interview Date' },
      { name: 'time', placeholder: 'Interview Time' },
    ],
    usageCount: 45,
    lastUsedAt: '2024-02-24T14:00:00Z',
    isShared: true,
    isActive: true,
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-2',
    name: 'Thank You After Interview',
    shortcut: '/thanks',
    category: 'FOLLOWUP',
    content: 'Thank you for taking the time to interview with us today. We enjoyed learning about your experience and will be in touch soon with next steps.',
    usageCount: 32,
    isShared: true,
    isActive: true,
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tmpl-3',
    name: 'Quick Greeting',
    shortcut: '/hi',
    category: 'GREETING',
    content: 'Hi! How can I help you today?',
    usageCount: 120,
    isShared: false,
    isActive: true,
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockScheduledMessages: ScheduledMessage[] = [
  {
    id: 'sched-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    type: 'TEXT',
    content: 'Just a reminder about our meeting tomorrow at 10 AM.',
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    timezone: 'America/New_York',
    status: 'PENDING',
    isRecurring: false,
    createdAt: '2024-02-25T08:00:00Z',
  },
];

const mockStats: CommunicationStats = {
  totalConversations: 12,
  unreadMessages: 8,
  totalMessagesSent: 256,
  pendingScheduled: 3,
  availableTemplates: 15,
};

// ============================================================================
// 7.1.1-7.1.2 PRESENCE API
// ============================================================================

export const presenceAPI = {
  update: async (data: Partial<UserPresence>): Promise<UserPresence> => {
    if (USE_MOCK) {
      const userId = 'user-1';
      mockPresence[userId] = { ...mockPresence[userId], ...data, lastSeen: new Date().toISOString() };
      return mockPresence[userId];
    }
    const response = await axios.put(`${API_URL}/realtime/presence`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  get: async (userId: string): Promise<UserPresence> => {
    if (USE_MOCK) {
      return mockPresence[userId] || { userId, status: 'OFFLINE' as PresenceStatus, lastSeen: null, autoAway: true, autoAwayMinutes: 5, showPresence: true };
    }
    const response = await axios.get(`${API_URL}/realtime/presence/${userId}`, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getBulk: async (userIds: string[]): Promise<Record<string, UserPresence>> => {
    if (USE_MOCK) {
      const result: Record<string, UserPresence> = {};
      userIds.forEach(id => {
        result[id] = mockPresence[id] || { userId: id, status: 'OFFLINE' as PresenceStatus };
      });
      return result;
    }
    const response = await axios.post(`${API_URL}/realtime/presence/bulk`, { userIds }, { headers: getAuthHeaders() });
    return response.data.data;
  },

  updatePreferences: async (data: PresencePreferences): Promise<UserPresence> => {
    if (USE_MOCK) {
      const userId = 'user-1';
      mockPresence[userId] = { ...mockPresence[userId], ...data };
      return mockPresence[userId];
    }
    const response = await axios.put(`${API_URL}/realtime/presence/preferences`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 7.1.3 NOTIFICATIONS API
// ============================================================================

export const notificationsAPI = {
  getAll: async (params?: { type?: string; isRead?: boolean; page?: number; limit?: number }): Promise<{ notifications: RealtimeNotification[]; unreadCount: number }> => {
    if (USE_MOCK) {
      let notifications = [...mockNotifications];
      if (params?.type) notifications = notifications.filter(n => n.type === params.type);
      if (params?.isRead !== undefined) notifications = notifications.filter(n => n.isRead === params.isRead);
      return { notifications, unreadCount: notifications.filter(n => !n.isRead).length };
    }
    const response = await axios.get(`${API_URL}/realtime/notifications`, { params, headers: getAuthHeaders() });
    return { notifications: response.data.data, unreadCount: response.data.unreadCount };
  },

  markRead: async (id: string): Promise<RealtimeNotification> => {
    if (USE_MOCK) {
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
      }
      return notification!;
    }
    const response = await axios.patch(`${API_URL}/realtime/notifications/${id}/read`, {}, { headers: getAuthHeaders() });
    return response.data.data;
  },

  markAllRead: async (): Promise<void> => {
    if (USE_MOCK) {
      mockNotifications.forEach(n => {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      });
      return;
    }
    await axios.patch(`${API_URL}/realtime/notifications/read-all`, {}, { headers: getAuthHeaders() });
  },

  dismiss: async (id: string): Promise<RealtimeNotification> => {
    if (USE_MOCK) {
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) {
        notification.isDismissed = true;
        notification.dismissedAt = new Date().toISOString();
      }
      return notification!;
    }
    const response = await axios.patch(`${API_URL}/realtime/notifications/${id}/dismiss`, {}, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 7.2.1-7.2.2 CONVERSATIONS API
// ============================================================================

export const conversationsAPI = {
  create: async (data: { type?: ConversationType; name?: string; participantIds?: string[] }): Promise<Conversation> => {
    if (USE_MOCK) {
      const conversation: Conversation = {
        id: `conv-${Date.now()}`,
        type: data.type || 'DIRECT',
        name: data.name,
        isArchived: false,
        isMuted: false,
        allowReactions: true,
        allowAttachments: true,
        isPublic: false,
        messageCount: 0,
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        participants: [],
      };
      return conversation;
    }
    const response = await axios.post(`${API_URL}/realtime/conversations`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAll: async (params?: { type?: string; isArchived?: boolean }): Promise<Conversation[]> => {
    if (USE_MOCK) {
      let conversations = [...mockConversations];
      if (params?.type) conversations = conversations.filter(c => c.type === params.type);
      if (params?.isArchived !== undefined) conversations = conversations.filter(c => c.isArchived === params.isArchived);
      return conversations;
    }
    const response = await axios.get(`${API_URL}/realtime/conversations`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  getById: async (id: string): Promise<Conversation> => {
    if (USE_MOCK) {
      const conversation = mockConversations.find(c => c.id === id);
      if (!conversation) throw new Error('Conversation not found');
      return conversation;
    }
    const response = await axios.get(`${API_URL}/realtime/conversations/${id}`, { headers: getAuthHeaders() });
    return response.data.data;
  },

  update: async (id: string, data: Partial<Conversation>): Promise<Conversation> => {
    if (USE_MOCK) {
      const conversation = mockConversations.find(c => c.id === id);
      if (!conversation) throw new Error('Conversation not found');
      return { ...conversation, ...data };
    }
    const response = await axios.put(`${API_URL}/realtime/conversations/${id}`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  addParticipant: async (conversationId: string, userId: string, role?: string): Promise<ConversationParticipant> => {
    if (USE_MOCK) {
      return {
        id: `part-${Date.now()}`,
        conversationId,
        userId,
        role: (role || 'MEMBER') as any,
        isActive: true,
        isMuted: false,
        isPinned: false,
        unreadCount: 0,
        notifyOnMessage: true,
        notifyOnMention: true,
        joinedAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_URL}/realtime/conversations/${conversationId}/participants`, { userId, role }, { headers: getAuthHeaders() });
    return response.data.data;
  },

  removeParticipant: async (conversationId: string, participantId: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_URL}/realtime/conversations/${conversationId}/participants/${participantId}`, { headers: getAuthHeaders() });
  },

  updateSettings: async (conversationId: string, settings: Partial<ConversationParticipant>): Promise<void> => {
    if (USE_MOCK) return;
    await axios.put(`${API_URL}/realtime/conversations/${conversationId}/settings`, settings, { headers: getAuthHeaders() });
  },
};

// ============================================================================
// 7.2.1 MESSAGES API
// ============================================================================

export const messagesAPI = {
  send: async (data: { conversationId: string; type?: string; content: string; replyToId?: string }): Promise<Message> => {
    if (USE_MOCK) {
      const message: Message = {
        id: `msg-${Date.now()}`,
        conversationId: data.conversationId,
        senderId: 'user-1',
        senderName: 'You',
        type: (data.type || 'TEXT') as any,
        content: data.content,
        replyToId: data.replyToId,
        threadCount: 0,
        status: 'SENT',
        createdAt: new Date().toISOString(),
        attachments: [],
        reactions: [],
      };
      mockMessages.push(message);
      return message;
    }
    const response = await axios.post(`${API_URL}/realtime/messages`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getByConversation: async (conversationId: string, params?: { before?: string; after?: string; limit?: number }): Promise<Message[]> => {
    if (USE_MOCK) {
      return mockMessages.filter(m => m.conversationId === conversationId);
    }
    const response = await axios.get(`${API_URL}/realtime/conversations/${conversationId}/messages`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  edit: async (id: string, content: string): Promise<Message> => {
    if (USE_MOCK) {
      const message = mockMessages.find(m => m.id === id);
      if (message) {
        message.content = content;
        message.editedAt = new Date().toISOString();
      }
      return message!;
    }
    const response = await axios.put(`${API_URL}/realtime/messages/${id}`, { content }, { headers: getAuthHeaders() });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const idx = mockMessages.findIndex(m => m.id === id);
      if (idx > -1) mockMessages.splice(idx, 1);
      return;
    }
    await axios.delete(`${API_URL}/realtime/messages/${id}`, { headers: getAuthHeaders() });
  },

  markRead: async (conversationId: string, lastMessageId: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.patch(`${API_URL}/realtime/conversations/${conversationId}/read`, { lastMessageId }, { headers: getAuthHeaders() });
  },

  addReaction: async (messageId: string, emoji: string): Promise<MessageReaction> => {
    if (USE_MOCK) {
      const reaction: MessageReaction = {
        id: `react-${Date.now()}`,
        messageId,
        userId: 'user-1',
        emoji,
        createdAt: new Date().toISOString(),
      };
      return reaction;
    }
    const response = await axios.post(`${API_URL}/realtime/messages/${messageId}/reactions`, { emoji }, { headers: getAuthHeaders() });
    return response.data.data;
  },

  removeReaction: async (messageId: string, emoji: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_URL}/realtime/messages/${messageId}/reactions/${emoji}`, { headers: getAuthHeaders() });
  },

  search: async (params: { query?: string; conversationId?: string; senderId?: string }): Promise<Message[]> => {
    if (USE_MOCK) {
      let messages = [...mockMessages];
      if (params.query) messages = messages.filter(m => m.content?.toLowerCase().includes(params.query!.toLowerCase()));
      if (params.conversationId) messages = messages.filter(m => m.conversationId === params.conversationId);
      if (params.senderId) messages = messages.filter(m => m.senderId === params.senderId);
      return messages;
    }
    const response = await axios.get(`${API_URL}/realtime/search`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 7.2.3 TEMPLATES API
// ============================================================================

export const templatesAPI = {
  create: async (data: Partial<MessageTemplate>): Promise<MessageTemplate> => {
    if (USE_MOCK) {
      const template: MessageTemplate = {
        ...data,
        id: `tmpl-${Date.now()}`,
        usageCount: 0,
        isActive: true,
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
      } as MessageTemplate;
      mockTemplates.push(template);
      return template;
    }
    const response = await axios.post(`${API_URL}/realtime/templates`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAll: async (params?: { category?: string }): Promise<MessageTemplate[]> => {
    if (USE_MOCK) {
      let templates = [...mockTemplates];
      if (params?.category) templates = templates.filter(t => t.category === params.category);
      return templates;
    }
    const response = await axios.get(`${API_URL}/realtime/templates`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  use: async (id: string): Promise<MessageTemplate> => {
    if (USE_MOCK) {
      const template = mockTemplates.find(t => t.id === id);
      if (template) {
        template.usageCount++;
        template.lastUsedAt = new Date().toISOString();
      }
      return template!;
    }
    const response = await axios.post(`${API_URL}/realtime/templates/${id}/use`, {}, { headers: getAuthHeaders() });
    return response.data.data;
  },

  update: async (id: string, data: Partial<MessageTemplate>): Promise<MessageTemplate> => {
    if (USE_MOCK) {
      const template = mockTemplates.find(t => t.id === id);
      if (!template) throw new Error('Template not found');
      return { ...template, ...data };
    }
    const response = await axios.put(`${API_URL}/realtime/templates/${id}`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const idx = mockTemplates.findIndex(t => t.id === id);
      if (idx > -1) mockTemplates.splice(idx, 1);
      return;
    }
    await axios.delete(`${API_URL}/realtime/templates/${id}`, { headers: getAuthHeaders() });
  },
};

// ============================================================================
// 7.2.4 SCHEDULED MESSAGES API
// ============================================================================

export const scheduledMessagesAPI = {
  schedule: async (data: Partial<ScheduledMessage>): Promise<ScheduledMessage> => {
    if (USE_MOCK) {
      const scheduled: ScheduledMessage = {
        ...data,
        id: `sched-${Date.now()}`,
        senderId: 'user-1',
        status: 'PENDING',
        isRecurring: data.isRecurring || false,
        createdAt: new Date().toISOString(),
      } as ScheduledMessage;
      mockScheduledMessages.push(scheduled);
      return scheduled;
    }
    const response = await axios.post(`${API_URL}/realtime/scheduled`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAll: async (params?: { conversationId?: string; status?: string }): Promise<ScheduledMessage[]> => {
    if (USE_MOCK) {
      let messages = [...mockScheduledMessages];
      if (params?.conversationId) messages = messages.filter(m => m.conversationId === params.conversationId);
      if (params?.status) messages = messages.filter(m => m.status === params.status);
      return messages;
    }
    const response = await axios.get(`${API_URL}/realtime/scheduled`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  cancel: async (id: string): Promise<ScheduledMessage> => {
    if (USE_MOCK) {
      const message = mockScheduledMessages.find(m => m.id === id);
      if (message) message.status = 'CANCELLED';
      return message!;
    }
    const response = await axios.patch(`${API_URL}/realtime/scheduled/${id}/cancel`, {}, { headers: getAuthHeaders() });
    return response.data.data;
  },

  update: async (id: string, data: Partial<ScheduledMessage>): Promise<ScheduledMessage> => {
    if (USE_MOCK) {
      const message = mockScheduledMessages.find(m => m.id === id);
      if (!message) throw new Error('Scheduled message not found');
      return { ...message, ...data };
    }
    const response = await axios.put(`${API_URL}/realtime/scheduled/${id}`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 7.1.5 TYPING INDICATORS API
// ============================================================================

export const typingAPI = {
  setTyping: async (conversationId: string, isTyping: boolean): Promise<void> => {
    if (USE_MOCK) return;
    await axios.post(`${API_URL}/realtime/typing`, { conversationId, isTyping }, { headers: getAuthHeaders() });
  },

  getTyping: async (conversationId: string): Promise<TypingIndicator[]> => {
    if (USE_MOCK) return [];
    const response = await axios.get(`${API_URL}/realtime/conversations/${conversationId}/typing`, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 7.2.8 EMAIL FALLBACK API
// ============================================================================

export const emailFallbackAPI = {
  getConfig: async (): Promise<EmailFallbackConfig> => {
    if (USE_MOCK) {
      return {
        id: 'fallback-1',
        userId: 'user-1',
        enabled: true,
        offlineMinutes: 15,
        digestMode: false,
        digestIntervalHours: 4,
        includeContent: true,
        includeSender: true,
        maxEmailsPerDay: 50,
        emailsSentToday: 3,
        createdAt: '2024-01-01T00:00:00Z',
      };
    }
    const response = await axios.get(`${API_URL}/realtime/email-fallback`, { headers: getAuthHeaders() });
    return response.data.data;
  },

  updateConfig: async (data: Partial<EmailFallbackConfig>): Promise<EmailFallbackConfig> => {
    if (USE_MOCK) {
      return { ...data, id: 'fallback-1', userId: 'user-1' } as EmailFallbackConfig;
    }
    const response = await axios.put(`${API_URL}/realtime/email-fallback`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// STATS API
// ============================================================================

export const communicationStatsAPI = {
  getStats: async (): Promise<CommunicationStats> => {
    if (USE_MOCK) return mockStats;
    const response = await axios.get(`${API_URL}/realtime/stats`, { headers: getAuthHeaders() });
    return response.data.data;
  },
};
