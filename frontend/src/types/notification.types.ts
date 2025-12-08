// ============================================================
// NOTIFICATION TYPES - Notifications and messaging
// ============================================================

import { TimestampedRecord } from './common.types';

// Notification Type
export type NotificationType =
  | 'application_received'
  | 'application_updated'
  | 'application_status_changed'
  | 'interview_scheduled'
  | 'interview_reminder'
  | 'interview_completed'
  | 'feedback_received'
  | 'offer_sent'
  | 'offer_accepted'
  | 'offer_declined'
  | 'message_received'
  | 'mention'
  | 'task_assigned'
  | 'deadline_approaching'
  | 'system'
  | 'info'
  | 'warning'
  | 'error';

// Notification Priority
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Notification Channel
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push' | 'slack' | 'teams';

// Notification
export interface Notification extends TimestampedRecord {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  link?: string;
  isRead: boolean;
  readAt?: string;
  isArchived: boolean;
  archivedAt?: string;
  expiresAt?: string;
  channels: NotificationChannel[];
  sentVia: NotificationChannel[];
  groupId?: string;
  actionRequired?: boolean;
  actions?: NotificationAction[];
}

// Notification Action
export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
  url?: string;
}

// Notification Preferences
export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  slackEnabled: boolean;
  teamsEnabled: boolean;
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'never';
  digestTime?: string;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  channels: {
    [key in NotificationType]?: {
      enabled: boolean;
      channels: NotificationChannel[];
    };
  };
  updatedAt: string;
}

// Push Subscription
export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

// Notification Filters
export interface NotificationFilters {
  type?: NotificationType | NotificationType[];
  priority?: NotificationPriority | NotificationPriority[];
  isRead?: boolean;
  isArchived?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// Notification Group
export interface NotificationGroup {
  id: string;
  type: NotificationType;
  count: number;
  latestNotification: Notification;
  notifications: Notification[];
}

// ============================================
// Messaging Types
// ============================================

// Conversation
export interface Conversation extends TimestampedRecord {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  mutedUntil?: string;
}

// Conversation Participant
export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastReadAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

// Message
export interface Message extends TimestampedRecord {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'file' | 'image' | 'system';
  content: string;
  attachments?: MessageAttachment[];
  replyTo?: string;
  reactions?: MessageReaction[];
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  readBy: string[];
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

// Message Attachment
export interface MessageAttachment {
  id: string;
  messageId: string;
  type: 'file' | 'image' | 'video' | 'audio' | 'document';
  name: string;
  url: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

// Message Reaction
export interface MessageReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

// Message Template
export interface MessageTemplate {
  id: string;
  name: string;
  subject?: string;
  content: string;
  type: 'email' | 'sms' | 'chat';
  category: string;
  variables: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Scheduled Message
export interface ScheduledMessage {
  id: string;
  conversationId?: string;
  recipientId?: string;
  recipientEmail?: string;
  channel: NotificationChannel;
  templateId?: string;
  subject?: string;
  content: string;
  scheduledAt: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: string;
  error?: string;
  createdAt: string;
}

// ============================================
// Real-Time Types
// ============================================

// User Presence
export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeenAt: string;
  currentActivity?: string;
  statusMessage?: string;
}

// Typing Indicator
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

// WebSocket Event
export interface WebSocketEvent {
  type: string;
  payload: unknown;
  timestamp: string;
  userId?: string;
}
