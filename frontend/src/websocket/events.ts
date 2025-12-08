// ============================================================
// WEBSOCKET EVENTS - Event constants for real-time features
// ============================================================

// ============================================
// Connection Events
// ============================================
export const CONNECTION_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECT_FAILED: 'reconnect_failed',
} as const;

// ============================================
// Authentication Events
// ============================================
export const AUTH_EVENTS = {
  AUTHENTICATE: 'auth:authenticate',
  AUTHENTICATED: 'auth:authenticated',
  AUTHENTICATION_ERROR: 'auth:error',
  TOKEN_REFRESH: 'auth:token_refresh',
  SESSION_EXPIRED: 'auth:session_expired',
} as const;

// ============================================
// Notification Events
// ============================================
export const NOTIFICATION_EVENTS = {
  NEW: 'notification:new',
  READ: 'notification:read',
  READ_ALL: 'notification:read_all',
  DELETE: 'notification:delete',
  COUNT_UPDATE: 'notification:count_update',
} as const;

// ============================================
// Message Events
// ============================================
export const MESSAGE_EVENTS = {
  NEW: 'message:new',
  SENT: 'message:sent',
  DELIVERED: 'message:delivered',
  READ: 'message:read',
  TYPING_START: 'message:typing_start',
  TYPING_STOP: 'message:typing_stop',
  DELETE: 'message:delete',
  EDIT: 'message:edit',
  REACTION: 'message:reaction',
} as const;

// ============================================
// Application Events
// ============================================
export const APPLICATION_EVENTS = {
  NEW: 'application:new',
  STATUS_CHANGED: 'application:status_changed',
  NOTE_ADDED: 'application:note_added',
  SCORE_UPDATED: 'application:score_updated',
  ASSIGNED: 'application:assigned',
  WITHDRAWN: 'application:withdrawn',
} as const;

// ============================================
// Interview Events
// ============================================
export const INTERVIEW_EVENTS = {
  SCHEDULED: 'interview:scheduled',
  RESCHEDULED: 'interview:rescheduled',
  CANCELLED: 'interview:cancelled',
  REMINDER: 'interview:reminder',
  STARTED: 'interview:started',
  ENDED: 'interview:ended',
  FEEDBACK_SUBMITTED: 'interview:feedback_submitted',
  SCORECARD_UPDATED: 'interview:scorecard_updated',
} as const;

// ============================================
// Job Events
// ============================================
export const JOB_EVENTS = {
  CREATED: 'job:created',
  UPDATED: 'job:updated',
  PUBLISHED: 'job:published',
  CLOSED: 'job:closed',
  ARCHIVED: 'job:archived',
  APPLICANT_COUNT_UPDATE: 'job:applicant_count_update',
} as const;

// ============================================
// Presence Events
// ============================================
export const PRESENCE_EVENTS = {
  USER_ONLINE: 'presence:user_online',
  USER_OFFLINE: 'presence:user_offline',
  USER_AWAY: 'presence:user_away',
  USER_BUSY: 'presence:user_busy',
  STATUS_CHANGED: 'presence:status_changed',
  GET_ONLINE_USERS: 'presence:get_online_users',
  ONLINE_USERS_LIST: 'presence:online_users_list',
} as const;

// ============================================
// Collaboration Events
// ============================================
export const COLLABORATION_EVENTS = {
  COMMENT_NEW: 'collaboration:comment_new',
  COMMENT_EDIT: 'collaboration:comment_edit',
  COMMENT_DELETE: 'collaboration:comment_delete',
  MENTION: 'collaboration:mention',
  SCORE_SUBMITTED: 'collaboration:score_submitted',
  DOCUMENT_SHARED: 'collaboration:document_shared',
  VIEWING_START: 'collaboration:viewing_start',
  VIEWING_STOP: 'collaboration:viewing_stop',
} as const;

// ============================================
// Room Events (for channel management)
// ============================================
export const ROOM_EVENTS = {
  JOIN: 'room:join',
  LEAVE: 'room:leave',
  JOINED: 'room:joined',
  LEFT: 'room:left',
  ERROR: 'room:error',
} as const;

// ============================================
// System Events
// ============================================
export const SYSTEM_EVENTS = {
  MAINTENANCE_START: 'system:maintenance_start',
  MAINTENANCE_END: 'system:maintenance_end',
  VERSION_UPDATE: 'system:version_update',
  BROADCAST: 'system:broadcast',
  ERROR: 'system:error',
} as const;

// ============================================
// All Events (combined)
// ============================================
export const SOCKET_EVENTS = {
  CONNECTION: CONNECTION_EVENTS,
  AUTH: AUTH_EVENTS,
  NOTIFICATION: NOTIFICATION_EVENTS,
  MESSAGE: MESSAGE_EVENTS,
  APPLICATION: APPLICATION_EVENTS,
  INTERVIEW: INTERVIEW_EVENTS,
  JOB: JOB_EVENTS,
  PRESENCE: PRESENCE_EVENTS,
  COLLABORATION: COLLABORATION_EVENTS,
  ROOM: ROOM_EVENTS,
  SYSTEM: SYSTEM_EVENTS,
} as const;

// ============================================
// Event Payload Types
// ============================================
export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}

export interface MessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  createdAt: string;
  readBy?: string[];
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  userName: string;
}

export interface ApplicationStatusPayload {
  applicationId: string;
  jobId: string;
  candidateId: string;
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
  updatedAt: string;
}

export interface InterviewPayload {
  interviewId: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  type: string;
  scheduledAt: string;
  duration: number;
  interviewers: Array<{
    id: string;
    name: string;
  }>;
}

export interface PresencePayload {
  userId: string;
  userName: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}

export interface CollaborationPayload {
  entityType: 'application' | 'interview' | 'job' | 'candidate';
  entityId: string;
  userId: string;
  userName: string;
  action: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface RoomPayload {
  room: string;
  userId?: string;
  users?: string[];
}

export interface SystemPayload {
  type: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

// ============================================
// Room Name Helpers
// ============================================
export const ROOM_PREFIXES = {
  USER: 'user',
  COMPANY: 'company',
  JOB: 'job',
  APPLICATION: 'application',
  INTERVIEW: 'interview',
  CONVERSATION: 'conversation',
} as const;

export const createRoomName = (prefix: keyof typeof ROOM_PREFIXES, id: string): string => {
  return `${ROOM_PREFIXES[prefix]}:${id}`;
};

export const parseRoomName = (room: string): { prefix: string; id: string } | null => {
  const parts = room.split(':');
  if (parts.length !== 2) return null;
  return { prefix: parts[0], id: parts[1] };
};
