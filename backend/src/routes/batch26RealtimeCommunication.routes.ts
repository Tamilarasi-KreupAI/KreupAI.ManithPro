import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  // Presence (7.1.1-7.1.2)
  updatePresence,
  getUserPresence,
  getBulkPresence,
  updatePresencePreferences,

  // Connections (7.1.1)
  registerConnection,
  disconnectConnection,
  subscribeToChannels,

  // Notifications (7.1.3)
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,

  // Conversations (7.2.1-7.2.2)
  createConversation,
  getConversations,
  getConversationById,
  updateConversation,
  addParticipant,
  removeParticipant,
  updateParticipantSettings,

  // Messages (7.2.1)
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  markMessagesRead,
  addReaction,
  removeReaction,

  // Templates (7.2.3)
  createMessageTemplate,
  getMessageTemplates,
  useMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,

  // Scheduled Messages (7.2.4)
  scheduleMessage,
  getScheduledMessages,
  cancelScheduledMessage,
  updateScheduledMessage,

  // Search (7.2.5)
  searchMessages,

  // Attachments (7.2.6)
  uploadAttachment,

  // Typing (7.1.5)
  setTypingIndicator,
  getTypingIndicators,

  // Email Fallback (7.2.8)
  getEmailFallbackConfig,
  updateEmailFallbackConfig,

  // Stats
  getCommunicationStats,
} from '../controllers/batch26RealtimeCommunication.controller';

const router = Router();

// ============================================================================
// 7.1.1-7.1.2 PRESENCE ROUTES
// ============================================================================

// Update presence
router.put(
  '/presence',
  authenticate,
  updatePresence
);

// Get user presence
router.get(
  '/presence/:userId',
  authenticate,
  getUserPresence
);

// Get bulk presence
router.post(
  '/presence/bulk',
  authenticate,
  getBulkPresence
);

// Update presence preferences
router.put(
  '/presence/preferences',
  authenticate,
  updatePresencePreferences
);

// ============================================================================
// 7.1.1 CONNECTION ROUTES
// ============================================================================

// Register connection
router.post(
  '/connections',
  authenticate,
  registerConnection
);

// Disconnect
router.delete(
  '/connections/:socketId',
  authenticate,
  disconnectConnection
);

// Subscribe to channels
router.put(
  '/connections/:socketId/channels',
  authenticate,
  subscribeToChannels
);

// ============================================================================
// 7.1.3 NOTIFICATION ROUTES
// ============================================================================

// Create notification (internal use)
router.post(
  '/notifications',
  authenticate,
  createNotification
);

// Get notifications
router.get(
  '/notifications',
  authenticate,
  getNotifications
);

// Mark notification read
router.patch(
  '/notifications/:id/read',
  authenticate,
  markNotificationRead
);

// Mark all notifications read
router.patch(
  '/notifications/read-all',
  authenticate,
  markAllNotificationsRead
);

// Dismiss notification
router.patch(
  '/notifications/:id/dismiss',
  authenticate,
  dismissNotification
);

// ============================================================================
// 7.2.1-7.2.2 CONVERSATION ROUTES
// ============================================================================

// Create conversation
router.post(
  '/conversations',
  authenticate,
  createConversation
);

// Get conversations
router.get(
  '/conversations',
  authenticate,
  getConversations
);

// Get conversation by ID
router.get(
  '/conversations/:id',
  authenticate,
  getConversationById
);

// Update conversation
router.put(
  '/conversations/:id',
  authenticate,
  updateConversation
);

// Add participant
router.post(
  '/conversations/:id/participants',
  authenticate,
  addParticipant
);

// Remove participant
router.delete(
  '/conversations/:id/participants/:participantId',
  authenticate,
  removeParticipant
);

// Update participant settings
router.put(
  '/conversations/:conversationId/settings',
  authenticate,
  updateParticipantSettings
);

// ============================================================================
// 7.2.1 MESSAGE ROUTES
// ============================================================================

// Send message
router.post(
  '/messages',
  authenticate,
  sendMessage
);

// Get messages
router.get(
  '/conversations/:conversationId/messages',
  authenticate,
  getMessages
);

// Edit message
router.put(
  '/messages/:id',
  authenticate,
  editMessage
);

// Delete message
router.delete(
  '/messages/:id',
  authenticate,
  deleteMessage
);

// Mark messages read
router.patch(
  '/conversations/:conversationId/read',
  authenticate,
  markMessagesRead
);

// Add reaction
router.post(
  '/messages/:messageId/reactions',
  authenticate,
  addReaction
);

// Remove reaction
router.delete(
  '/messages/:messageId/reactions/:emoji',
  authenticate,
  removeReaction
);

// ============================================================================
// 7.2.3 TEMPLATE ROUTES
// ============================================================================

// Create template
router.post(
  '/templates',
  authenticate,
  createMessageTemplate
);

// Get templates
router.get(
  '/templates',
  authenticate,
  getMessageTemplates
);

// Use template
router.post(
  '/templates/:id/use',
  authenticate,
  useMessageTemplate
);

// Update template
router.put(
  '/templates/:id',
  authenticate,
  updateMessageTemplate
);

// Delete template
router.delete(
  '/templates/:id',
  authenticate,
  deleteMessageTemplate
);

// ============================================================================
// 7.2.4 SCHEDULED MESSAGE ROUTES
// ============================================================================

// Schedule message
router.post(
  '/scheduled',
  authenticate,
  scheduleMessage
);

// Get scheduled messages
router.get(
  '/scheduled',
  authenticate,
  getScheduledMessages
);

// Cancel scheduled message
router.patch(
  '/scheduled/:id/cancel',
  authenticate,
  cancelScheduledMessage
);

// Update scheduled message
router.put(
  '/scheduled/:id',
  authenticate,
  updateScheduledMessage
);

// ============================================================================
// 7.2.5 SEARCH ROUTES
// ============================================================================

// Search messages
router.get(
  '/search',
  authenticate,
  searchMessages
);

// ============================================================================
// 7.2.6 ATTACHMENT ROUTES
// ============================================================================

// Upload attachment
router.post(
  '/attachments',
  authenticate,
  uploadAttachment
);

// ============================================================================
// 7.1.5 TYPING INDICATOR ROUTES
// ============================================================================

// Set typing indicator
router.post(
  '/typing',
  authenticate,
  setTypingIndicator
);

// Get typing indicators
router.get(
  '/conversations/:conversationId/typing',
  authenticate,
  getTypingIndicators
);

// ============================================================================
// 7.2.8 EMAIL FALLBACK ROUTES
// ============================================================================

// Get email fallback config
router.get(
  '/email-fallback',
  authenticate,
  getEmailFallbackConfig
);

// Update email fallback config
router.put(
  '/email-fallback',
  authenticate,
  updateEmailFallbackConfig
);

// ============================================================================
// STATS ROUTES
// ============================================================================

// Get communication stats
router.get(
  '/stats',
  authenticate,
  getCommunicationStats
);

export default router;
