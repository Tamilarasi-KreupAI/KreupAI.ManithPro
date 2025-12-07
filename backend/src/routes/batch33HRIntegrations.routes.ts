// Batch 33: HR & Payroll Integrations Routes (10.1.1-10.1.7)
import { Router } from 'express';
import * as hrController from '../controllers/batch33HRIntegrations.controller';

const router = Router();

// ==========================================
// HR Integration Routes
// ==========================================

// Get all HR integrations
router.get('/integrations', hrController.getHRIntegrations);

// Get specific HR integration
router.get('/integrations/:integrationId', hrController.getHRIntegration);

// Create HR integration
router.post('/integrations', hrController.createHRIntegration);

// Update HR integration
router.put('/integrations/:integrationId', hrController.updateHRIntegration);

// Delete HR integration
router.delete('/integrations/:integrationId', hrController.deleteHRIntegration);

// Test HR integration connection
router.post('/integrations/:integrationId/test', hrController.testHRConnection);

// ==========================================
// Sync Routes
// ==========================================

// Trigger sync
router.post('/integrations/:integrationId/sync', hrController.triggerSync);

// Get sync logs
router.get('/integrations/:integrationId/sync-logs', hrController.getSyncLogs);

// Get sync log details
router.get('/sync-logs/:logId', hrController.getSyncLogDetails);

// ==========================================
// Field Mapping Routes
// ==========================================

// Get field mapping
router.get('/integrations/:integrationId/mapping', hrController.getFieldMapping);

// Update field mapping
router.put('/integrations/:integrationId/mapping', hrController.updateFieldMapping);

// ==========================================
// Provider & Dashboard Routes
// ==========================================

// Get available providers
router.get('/providers', hrController.getAvailableProviders);

// Get HR integrations dashboard
router.get('/dashboard', hrController.getHRIntegrationsDashboard);

export default router;
