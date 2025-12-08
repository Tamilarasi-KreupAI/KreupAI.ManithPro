// Batch 46-49: Technical Infrastructure Routes (14.1-14.4)
import { Router } from 'express';
import * as infraController from '../controllers/batch46_49TechnicalInfra.controller';

const router = Router();

// ==========================================
// Batch 46: API Infrastructure Routes (14.1)
// ==========================================

// API Keys
router.get('/api-keys', infraController.getAPIKeys);
router.post('/api-keys', infraController.createAPIKey);
router.delete('/api-keys/:keyId', infraController.revokeAPIKey);

// Rate Limiting
router.get('/rate-limits', infraController.getRateLimitRules);
router.post('/rate-limits', infraController.createRateLimitRule);

// Cache
router.get('/cache/stats', infraController.getCacheStats);
router.post('/cache/clear', infraController.clearCache);

// API Documentation
router.get('/docs', infraController.getAPIDocumentation);

// Webhooks
router.get('/webhooks', infraController.getWebhooks);
router.post('/webhooks', infraController.createWebhook);
router.put('/webhooks/:webhookId', infraController.updateWebhook);
router.delete('/webhooks/:webhookId', infraController.deleteWebhook);
router.get('/webhooks/:webhookId/deliveries', infraController.getWebhookDeliveries);
router.post('/webhooks/deliveries/:deliveryId/retry', infraController.retryWebhookDelivery);

// ==========================================
// Batch 47: Testing & Quality Routes (14.2)
// ==========================================

// Test Suites
router.get('/test-suites', infraController.getTestSuites);
router.get('/test-suites/:suiteId', infraController.getTestSuite);
router.post('/test-suites/:suiteId/run', infraController.runTestSuite);

// Test Runs
router.get('/test-runs', infraController.getTestRuns);

// Test Cases
router.get('/test-cases', infraController.getTestCases);

// Code Quality
router.get('/code-quality', infraController.getCodeQualityReports);
router.post('/code-quality/run', infraController.runCodeQualityCheck);

// CI Pipelines
router.get('/pipelines', infraController.getCIPipelines);
router.post('/pipelines/:pipelineId/trigger', infraController.triggerPipeline);

// ==========================================
// Batch 48: Monitoring & Logging Routes (14.3)
// ==========================================

// System Metrics
router.get('/metrics', infraController.getSystemMetrics);
router.get('/metrics/:metricName/history', infraController.getMetricHistory);

// Error Logs
router.get('/errors', infraController.getErrorLogs);
router.post('/errors/:errorId/resolve', infraController.resolveError);

// Audit Logs
router.get('/audit-logs', infraController.getAuditLogs);

// Performance Traces
router.get('/traces', infraController.getPerformanceTraces);

// Alert Rules
router.get('/alerts/rules', infraController.getAlertRules);
router.post('/alerts/rules', infraController.createAlertRule);

// Alert Incidents
router.get('/alerts/incidents', infraController.getAlertIncidents);
router.post('/alerts/incidents/:incidentId/acknowledge', infraController.acknowledgeIncident);
router.post('/alerts/incidents/:incidentId/resolve', infraController.resolveIncident);

// ==========================================
// Batch 49: DevOps & Deployment Routes (14.4)
// ==========================================

// Deployments
router.get('/deployments', infraController.getDeployments);
router.post('/deployments', infraController.createDeployment);
router.post('/deployments/:deploymentId/rollback', infraController.rollbackDeployment);

// Environments
router.get('/environments', infraController.getEnvironments);
router.get('/environments/:envId', infraController.getEnvironment);

// Feature Flags
router.get('/feature-flags', infraController.getFeatureFlags);
router.post('/feature-flags', infraController.createFeatureFlag);
router.put('/feature-flags/:flagId', infraController.updateFeatureFlag);

// Service Health
router.get('/health/services', infraController.getServiceHealth);

// Backups
router.get('/backups', infraController.getBackups);
router.post('/backups', infraController.createBackup);
router.post('/backups/:backupId/restore', infraController.restoreBackup);

// Dashboard
router.get('/dashboard', infraController.getTechnicalDashboard);

export default router;
