// Batch 40-42: Mobile & Accessibility Routes (12.1-12.3)
import { Router } from 'express';
import * as mobileController from '../controllers/batch40_42MobileAccessibility.controller';

const router = Router();

// ==========================================
// Batch 40: Mobile Applications Routes (12.1)
// ==========================================

// Device management
router.get('/devices', mobileController.getMobileDevices);
router.post('/devices', mobileController.registerDevice);
router.put('/devices/:deviceId', mobileController.updateDevice);
router.delete('/devices/:deviceId', mobileController.deleteDevice);
router.put('/devices/:deviceId/push-settings', mobileController.updatePushSettings);
router.post('/devices/:deviceId/biometric', mobileController.enableBiometric);

// Push notifications
router.get('/push-notifications', mobileController.getPushNotifications);
router.post('/push-notifications', mobileController.sendPushNotification);
router.post('/push-notifications/:notificationId/read', mobileController.markNotificationRead);

// App config
router.get('/app-config', mobileController.getMobileAppConfig);
router.put('/app-config', mobileController.updateMobileAppConfig);

// Offline sync
router.get('/sync-queue/:deviceId', mobileController.getOfflineSyncQueue);
router.post('/sync-queue/:deviceId/process', mobileController.processSyncQueue);

// ==========================================
// Batch 41: PWA Routes (12.2)
// ==========================================

// PWA config
router.get('/pwa/config', mobileController.getPWAConfig);
router.put('/pwa/config', mobileController.updatePWAConfig);

// Web push
router.get('/pwa/subscriptions', mobileController.getWebPushSubscriptions);
router.post('/pwa/subscribe', mobileController.subscribeWebPush);
router.delete('/pwa/subscriptions/:subscriptionId', mobileController.unsubscribeWebPush);
router.post('/pwa/push', mobileController.sendWebPush);

// Service worker
router.get('/pwa/service-worker/status', mobileController.getServiceWorkerStatus);

// ==========================================
// Batch 42: Accessibility Routes (12.3)
// ==========================================

// User settings
router.get('/accessibility/settings', mobileController.getAccessibilitySettings);
router.put('/accessibility/settings', mobileController.updateAccessibilitySettings);
router.post('/accessibility/settings/reset', mobileController.resetAccessibilitySettings);

// Presets
router.get('/accessibility/presets', mobileController.getAccessibilityPresets);
router.post('/accessibility/presets/:presetId/apply', mobileController.applyAccessibilityPreset);

// Audits
router.get('/accessibility/audits', mobileController.getAccessibilityAudits);
router.post('/accessibility/audits', mobileController.runAccessibilityAudit);

// Dashboards
router.get('/accessibility/dashboard', mobileController.getAccessibilityDashboard);
router.get('/dashboard', mobileController.getMobileAccessibilityDashboard);

export default router;
