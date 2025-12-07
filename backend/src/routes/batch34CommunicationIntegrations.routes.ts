// Batch 34: Communication Platform Integrations Routes (10.2.1-10.2.6)
import { Router } from 'express';
import * as commController from '../controllers/batch34CommunicationIntegrations.controller';

const router = Router();

// ==========================================
// Communication Integration Routes
// ==========================================

// Get all communication integrations
router.get('/integrations', commController.getCommunicationIntegrations);

// Get specific integration
router.get('/integrations/:integrationId', commController.getCommunicationIntegration);

// Create communication integration
router.post('/integrations', commController.createCommunicationIntegration);

// Update communication integration
router.put('/integrations/:integrationId', commController.updateCommunicationIntegration);

// Delete communication integration
router.delete('/integrations/:integrationId', commController.deleteCommunicationIntegration);

// Test communication integration
router.post('/integrations/:integrationId/test', commController.testCommunicationIntegration);

// Send test message
router.post('/integrations/:integrationId/test-message', commController.sendTestMessage);

// ==========================================
// Message Template Routes
// ==========================================

// Get message templates
router.get('/templates', commController.getMessageTemplates);

// Create message template
router.post('/templates', commController.createMessageTemplate);

// Update message template
router.put('/templates/:templateId', commController.updateMessageTemplate);

// Delete message template
router.delete('/templates/:templateId', commController.deleteMessageTemplate);

// Preview message template
router.post('/templates/:templateId/preview', commController.previewMessageTemplate);

// ==========================================
// Notification Settings Routes
// ==========================================

// Get notification settings
router.get('/settings/notifications', commController.getNotificationSettings);

// Update notification settings
router.put('/settings/notifications', commController.updateNotificationSettings);

// ==========================================
// Platform & Dashboard Routes
// ==========================================

// Get available platforms
router.get('/platforms', commController.getAvailablePlatforms);

// Get communication dashboard
router.get('/dashboard', commController.getCommunicationDashboard);

export default router;
