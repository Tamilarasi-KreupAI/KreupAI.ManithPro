// ============================================================
// WEBSOCKET HOOKS - Barrel Export
// ============================================================

export {
  useSocket,
  useSocketEvent,
  useSocketRoom,
} from './useSocket';

export type {
  UseSocketOptions,
  UseSocketReturn,
  UseSocketEventOptions,
  UseSocketRoomOptions,
} from './useSocket';

export {
  usePresence,
  useUserPresence,
} from './usePresence';

export type {
  PresenceStatus,
  UserPresence,
  UsePresenceOptions,
  UsePresenceReturn,
} from './usePresence';

export {
  useNotifications,
  useNotificationSound,
} from './useNotifications';

export type {
  NotificationType,
  Notification,
  UseNotificationsOptions,
  UseNotificationsReturn,
  UseNotificationSoundOptions,
} from './useNotifications';

export {
  useTyping,
  useTypingInput,
} from './useTyping';

export type {
  TypingUser,
  UseTypingOptions,
  UseTypingReturn,
  UseTypingInputOptions,
} from './useTyping';
