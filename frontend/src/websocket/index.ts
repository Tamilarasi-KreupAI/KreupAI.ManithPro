// ============================================================
// WEBSOCKET MODULE - Main Entry Point
// ============================================================

// Socket Client
export {
  SocketClient,
  getSocketClient,
  resetSocketClient,
} from './socket';

export type {
  SocketConfig,
  SocketState,
  SocketEventCallback,
} from './socket';

// Events
export {
  SOCKET_EVENTS,
  CONNECTION_EVENTS,
  AUTH_EVENTS,
  NOTIFICATION_EVENTS,
  MESSAGE_EVENTS,
  APPLICATION_EVENTS,
  INTERVIEW_EVENTS,
  JOB_EVENTS,
  PRESENCE_EVENTS,
  COLLABORATION_EVENTS,
  ROOM_EVENTS,
  SYSTEM_EVENTS,
  ROOM_PREFIXES,
  createRoomName,
  parseRoomName,
} from './events';

export type {
  NotificationPayload,
  MessagePayload,
  TypingPayload,
  ApplicationStatusPayload,
  InterviewPayload,
  PresencePayload,
  CollaborationPayload,
  RoomPayload,
  SystemPayload,
} from './events';

// Hooks
export * from './hooks';

// Components
export * from './components';
