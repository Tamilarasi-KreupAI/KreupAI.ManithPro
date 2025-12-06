import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Reminder Schedules (3.3.1, 3.3.6)
  createReminderSchedule,
  getReminderSchedules,
  updateReminderSchedule,
  deleteReminderSchedule,
  // Notification Channels (3.3.2, 3.3.3, 3.3.4)
  getNotificationChannels,
  upsertNotificationChannel,
  verifyChannel,
  sendVerificationCode,
  // Reminder Notifications
  getUpcomingReminders,
  scheduleReminder,
  cancelReminder,
  getReminderHistory,
  // Push Subscriptions (3.3.4)
  registerPushSubscription,
  getPushSubscriptions,
  unregisterPushSubscription,
  // Confirmation Requests (3.3.7)
  createConfirmationRequest,
  getConfirmationRequests,
  respondToConfirmation,
  resendConfirmation,
  // Prep Materials (3.3.8)
  createPrepMaterial,
  getPrepMaterials,
  updatePrepMaterial,
  deletePrepMaterial,
  schedulePrepDelivery,
  getPrepDeliveries,
  markPrepViewed,
  submitPrepFeedback,
  // Notification Preferences
  getNotificationPreferences,
  updateNotificationPreferences,
  unsubscribeAll,
  // Utilities
  sendTestNotification,
  getNotificationStats,
} from '../controllers/batch16RemindersNotifications.controller';

const router = Router();

// ============================================
// REMINDER SCHEDULES (3.3.1, 3.3.6)
// ============================================

router.post('/reminder-schedules', authenticate, createReminderSchedule);
router.get('/reminder-schedules', authenticate, getReminderSchedules);
router.patch('/reminder-schedules/:id', authenticate, updateReminderSchedule);
router.delete('/reminder-schedules/:id', authenticate, deleteReminderSchedule);

// ============================================
// NOTIFICATION CHANNELS (3.3.2, 3.3.3, 3.3.4)
// ============================================

router.get('/channels', authenticate, getNotificationChannels);
router.put('/channels', authenticate, upsertNotificationChannel);
router.post('/channels/:channelType/verify', authenticate, verifyChannel);
router.post('/channels/:channelType/send-code', authenticate, sendVerificationCode);

// ============================================
// REMINDER NOTIFICATIONS
// ============================================

router.get('/reminders', authenticate, getUpcomingReminders);
router.post('/reminders', authenticate, scheduleReminder);
router.patch('/reminders/:id/cancel', authenticate, cancelReminder);
router.get('/reminders/history', authenticate, getReminderHistory);

// ============================================
// PUSH SUBSCRIPTIONS (3.3.4)
// ============================================

router.post('/push/subscribe', authenticate, registerPushSubscription);
router.get('/push/subscriptions', authenticate, getPushSubscriptions);
router.post('/push/unsubscribe', authenticate, unregisterPushSubscription);

// ============================================
// CONFIRMATION REQUESTS (3.3.7)
// ============================================

router.post('/confirmations', authenticate, authorize('RECRUITER', 'ADMIN'), createConfirmationRequest);
router.get('/confirmations', authenticate, getConfirmationRequests);
router.post('/confirmations/:token/respond', respondToConfirmation); // Public endpoint with token
router.post('/confirmations/:id/resend', authenticate, authorize('RECRUITER', 'ADMIN'), resendConfirmation);

// ============================================
// PREP MATERIALS (3.3.8)
// ============================================

router.post('/prep-materials', authenticate, authorize('RECRUITER', 'ADMIN'), createPrepMaterial);
router.get('/prep-materials', authenticate, getPrepMaterials);
router.patch('/prep-materials/:id', authenticate, authorize('RECRUITER', 'ADMIN'), updatePrepMaterial);
router.delete('/prep-materials/:id', authenticate, authorize('RECRUITER', 'ADMIN'), deletePrepMaterial);

// Prep Material Deliveries
router.post('/prep-deliveries', authenticate, authorize('RECRUITER', 'ADMIN'), schedulePrepDelivery);
router.get('/prep-deliveries', authenticate, getPrepDeliveries);
router.patch('/prep-deliveries/:id/viewed', authenticate, markPrepViewed);
router.post('/prep-deliveries/:id/feedback', authenticate, submitPrepFeedback);

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

router.get('/preferences', authenticate, getNotificationPreferences);
router.put('/preferences', authenticate, updateNotificationPreferences);
router.post('/unsubscribe', authenticate, unsubscribeAll);

// ============================================
// UTILITIES
// ============================================

router.post('/test', authenticate, sendTestNotification);
router.get('/stats', authenticate, getNotificationStats);

export default router;
