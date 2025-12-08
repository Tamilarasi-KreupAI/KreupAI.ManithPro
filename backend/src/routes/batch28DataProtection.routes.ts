// Batch 28: Data Protection Routes (8.2.1-8.2.8)
import { Router } from 'express';
import * as dataProtectionController from '../controllers/batch28DataProtection.controller';

const router = Router();

// ==========================================
// 8.2.1 Encryption Key Management Routes
// ==========================================

// Get all encryption keys
router.get('/encryption-keys', dataProtectionController.getEncryptionKeys);

// Get specific encryption key
router.get('/encryption-keys/:keyId', dataProtectionController.getEncryptionKey);

// Create new encryption key
router.post('/encryption-keys', dataProtectionController.createEncryptionKey);

// Update encryption key
router.put('/encryption-keys/:keyId', dataProtectionController.updateEncryptionKey);

// Rotate encryption key
router.post('/encryption-keys/:keyId/rotate', dataProtectionController.rotateEncryptionKey);

// Revoke encryption key
router.post('/encryption-keys/:keyId/revoke', dataProtectionController.revokeEncryptionKey);

// Get key rotation schedules
router.get('/key-rotation-schedules', dataProtectionController.getKeyRotationSchedules);

// Create key rotation schedule
router.post('/key-rotation-schedules', dataProtectionController.createKeyRotationSchedule);

// Update key rotation schedule
router.put('/key-rotation-schedules/:scheduleId', dataProtectionController.updateKeyRotationSchedule);

// Delete key rotation schedule
router.delete('/key-rotation-schedules/:scheduleId', dataProtectionController.deleteKeyRotationSchedule);

// ==========================================
// 8.2.2 TLS Configuration Routes
// ==========================================

// Get TLS configuration
router.get('/tls-config', dataProtectionController.getTLSConfig);

// Update TLS configuration
router.put('/tls-config', dataProtectionController.updateTLSConfig);

// Get TLS certificate info
router.get('/tls-certificate', dataProtectionController.getTLSCertificateInfo);

// Renew TLS certificate
router.post('/tls-certificate/renew', dataProtectionController.renewTLSCertificate);

// ==========================================
// 8.2.3 PII Detection Routes
// ==========================================

// Get PII detection configurations
router.get('/pii-detection/configs', dataProtectionController.getPIIDetectionConfigs);

// Get specific PII detection configuration
router.get('/pii-detection/configs/:configId', dataProtectionController.getPIIDetectionConfig);

// Create PII detection configuration
router.post('/pii-detection/configs', dataProtectionController.createPIIDetectionConfig);

// Update PII detection configuration
router.put('/pii-detection/configs/:configId', dataProtectionController.updatePIIDetectionConfig);

// Delete PII detection configuration
router.delete('/pii-detection/configs/:configId', dataProtectionController.deletePIIDetectionConfig);

// Scan content for PII
router.post('/pii-detection/scan', dataProtectionController.scanForPII);

// Mask PII in content
router.post('/pii-detection/mask', dataProtectionController.maskPII);

// Get PII detection logs
router.get('/pii-detection/logs', dataProtectionController.getPIIDetectionLogs);

// ==========================================
// 8.2.4 Data Anonymization Routes
// ==========================================

// Get anonymization rules
router.get('/anonymization/rules', dataProtectionController.getAnonymizationRules);

// Get specific anonymization rule
router.get('/anonymization/rules/:ruleId', dataProtectionController.getAnonymizationRule);

// Create anonymization rule
router.post('/anonymization/rules', dataProtectionController.createAnonymizationRule);

// Update anonymization rule
router.put('/anonymization/rules/:ruleId', dataProtectionController.updateAnonymizationRule);

// Delete anonymization rule
router.delete('/anonymization/rules/:ruleId', dataProtectionController.deleteAnonymizationRule);

// Get anonymization jobs
router.get('/anonymization/jobs', dataProtectionController.getAnonymizationJobs);

// Create anonymization job
router.post('/anonymization/jobs', dataProtectionController.createAnonymizationJob);

// Get anonymization job status
router.get('/anonymization/jobs/:jobId', dataProtectionController.getAnonymizationJobStatus);

// Cancel anonymization job
router.post('/anonymization/jobs/:jobId/cancel', dataProtectionController.cancelAnonymizationJob);

// Anonymize data inline
router.post('/anonymization/anonymize', dataProtectionController.anonymizeData);

// ==========================================
// 8.2.5 Secure File Storage Routes
// ==========================================

// Get secure files
router.get('/secure-files', dataProtectionController.getSecureFiles);

// Get specific secure file metadata
router.get('/secure-files/:fileId', dataProtectionController.getSecureFile);

// Upload secure file
router.post('/secure-files', dataProtectionController.uploadSecureFile);

// Download secure file
router.get('/secure-files/:fileId/download', dataProtectionController.downloadSecureFile);

// Update secure file metadata
router.put('/secure-files/:fileId', dataProtectionController.updateSecureFile);

// Delete secure file
router.delete('/secure-files/:fileId', dataProtectionController.deleteSecureFile);

// Get file access logs
router.get('/secure-files/:fileId/access-logs', dataProtectionController.getFileAccessLogs);

// Share secure file
router.post('/secure-files/:fileId/share', dataProtectionController.shareSecureFile);

// Revoke file share
router.delete('/secure-files/:fileId/share/:shareId', dataProtectionController.revokeFileShare);

// ==========================================
// 8.2.6 Data Residency Routes
// ==========================================

// Get data residency configurations
router.get('/data-residency', dataProtectionController.getDataResidencyConfigs);

// Get specific data residency configuration
router.get('/data-residency/:configId', dataProtectionController.getDataResidencyConfig);

// Create data residency configuration
router.post('/data-residency', dataProtectionController.createDataResidencyConfig);

// Update data residency configuration
router.put('/data-residency/:configId', dataProtectionController.updateDataResidencyConfig);

// Delete data residency configuration
router.delete('/data-residency/:configId', dataProtectionController.deleteDataResidencyConfig);

// Validate data residency compliance
router.post('/data-residency/validate', dataProtectionController.validateDataResidency);

// Get available regions
router.get('/data-residency/regions', dataProtectionController.getAvailableRegions);

// ==========================================
// 8.2.7 Backup & Recovery Routes
// ==========================================

// Get backup configurations
router.get('/backup/configs', dataProtectionController.getBackupConfigs);

// Get specific backup configuration
router.get('/backup/configs/:configId', dataProtectionController.getBackupConfig);

// Create backup configuration
router.post('/backup/configs', dataProtectionController.createBackupConfig);

// Update backup configuration
router.put('/backup/configs/:configId', dataProtectionController.updateBackupConfig);

// Delete backup configuration
router.delete('/backup/configs/:configId', dataProtectionController.deleteBackupConfig);

// Get backups
router.get('/backups', dataProtectionController.getBackups);

// Trigger manual backup
router.post('/backups', dataProtectionController.triggerBackup);

// Get backup details
router.get('/backups/:backupId', dataProtectionController.getBackup);

// Delete backup
router.delete('/backups/:backupId', dataProtectionController.deleteBackup);

// Verify backup integrity
router.post('/backups/:backupId/verify', dataProtectionController.verifyBackup);

// Download backup
router.get('/backups/:backupId/download', dataProtectionController.downloadBackup);

// Get restore jobs
router.get('/restore-jobs', dataProtectionController.getRestoreJobs);

// Create restore job
router.post('/restore-jobs', dataProtectionController.createRestoreJob);

// Get restore job status
router.get('/restore-jobs/:jobId', dataProtectionController.getRestoreJobStatus);

// Cancel restore job
router.post('/restore-jobs/:jobId/cancel', dataProtectionController.cancelRestoreJob);

// ==========================================
// 8.2.8 Key Lifecycle Management Routes
// ==========================================

// Get key lifecycle events
router.get('/key-lifecycle/events', dataProtectionController.getKeyLifecycleEvents);

// Get key usage analytics
router.get('/key-lifecycle/analytics', dataProtectionController.getKeyUsageAnalytics);

// Schedule key retirement
router.post('/encryption-keys/:keyId/schedule-retirement', dataProtectionController.scheduleKeyRetirement);

// Export key (wrapped)
router.post('/encryption-keys/:keyId/export', dataProtectionController.exportWrappedKey);

// Import key
router.post('/encryption-keys/import', dataProtectionController.importKey);

// ==========================================
// Data Protection Audit & Stats Routes
// ==========================================

// Get data protection audit logs
router.get('/audit-logs', dataProtectionController.getDataProtectionAuditLogs);

// Get data protection statistics
router.get('/stats', dataProtectionController.getDataProtectionStats);

// Get data protection dashboard
router.get('/dashboard', dataProtectionController.getDataProtectionDashboard);

// Run compliance check
router.post('/compliance-check', dataProtectionController.runComplianceCheck);

export default router;
