// Batch 36: Developer Tools & API Routes (10.4.1-10.4.8)
import { Router } from 'express';
import * as devController from '../controllers/batch36DeveloperTools.controller';

const router = Router();

// ==========================================
// API Key Routes
// ==========================================

// Get all API keys
router.get('/api-keys', devController.getAPIKeys);

// Create API key
router.post('/api-keys', devController.createAPIKey);

// Update API key
router.put('/api-keys/:keyId', devController.updateAPIKey);

// Revoke API key
router.delete('/api-keys/:keyId', devController.revokeAPIKey);

// Get API key usage
router.get('/api-keys/:keyId/usage', devController.getAPIKeyUsage);

// ==========================================
// Webhook Routes
// ==========================================

// Get webhooks
router.get('/webhooks', devController.getWebhooks);

// Create webhook
router.post('/webhooks', devController.createWebhook);

// Update webhook
router.put('/webhooks/:webhookId', devController.updateWebhook);

// Delete webhook
router.delete('/webhooks/:webhookId', devController.deleteWebhook);

// Test webhook
router.post('/webhooks/:webhookId/test', devController.testWebhook);

// Get webhook deliveries
router.get('/webhooks/:webhookId/deliveries', devController.getWebhookDeliveries);

// Retry webhook delivery
router.post('/deliveries/:deliveryId/retry', devController.retryWebhookDelivery);

// ==========================================
// Automation Integration Routes
// ==========================================

// Get automation integrations
router.get('/automations', devController.getAutomationIntegrations);

// ==========================================
// Developer Resources Routes
// ==========================================

// Get available events
router.get('/events', devController.getAvailableEvents);

// Get API scopes
router.get('/scopes', devController.getAPIScopes);

// Get API documentation
router.get('/docs', devController.getAPIDocumentation);

// Get developer portal dashboard
router.get('/dashboard', devController.getDeveloperPortalDashboard);

export default router;
