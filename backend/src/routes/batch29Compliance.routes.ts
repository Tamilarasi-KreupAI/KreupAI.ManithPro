// Batch 29: Compliance Features Routes (8.3.1-8.3.11)
import { Router } from 'express';
import * as complianceController from '../controllers/batch29Compliance.controller';

const router = Router();

// ==========================================
// 8.3.1 GDPR Compliance Suite Routes
// ==========================================

// Get GDPR consents
router.get('/gdpr/consents', complianceController.getGDPRConsents);

// Record GDPR consent
router.post('/gdpr/consents', complianceController.recordGDPRConsent);

// Revoke GDPR consent
router.post('/gdpr/consents/:consentId/revoke', complianceController.revokeGDPRConsent);

// Export user data (GDPR data export)
router.post('/gdpr/export/:userId', complianceController.exportUserData);

// ==========================================
// 8.3.2 CCPA Compliance Routes
// ==========================================

// Get CCPA requests
router.get('/ccpa/requests', complianceController.getCCPARequests);

// Create CCPA request
router.post('/ccpa/requests', complianceController.createCCPARequest);

// Update CCPA request
router.put('/ccpa/requests/:requestId', complianceController.updateCCPARequest);

// Verify CCPA request
router.post('/ccpa/requests/:requestId/verify', complianceController.verifyCCPARequest);

// Complete CCPA request
router.post('/ccpa/requests/:requestId/complete', complianceController.completeCCPARequest);

// ==========================================
// 8.3.3 EEOC/OFCCP Reporting Routes
// ==========================================

// Get EEOC reports
router.get('/eeoc/reports', complianceController.getEEOCReports);

// Generate EEOC report
router.post('/eeoc/reports', complianceController.generateEEOCReport);

// Submit EEOC report
router.post('/eeoc/reports/:reportId/submit', complianceController.submitEEOCReport);

// ==========================================
// 8.3.4 Data Retention Policies Routes
// ==========================================

// Get retention policies
router.get('/retention/policies', complianceController.getRetentionPolicies);

// Create retention policy
router.post('/retention/policies', complianceController.createRetentionPolicy);

// Update retention policy
router.put('/retention/policies/:policyId', complianceController.updateRetentionPolicy);

// Enforce retention policy
router.post('/retention/policies/:policyId/enforce', complianceController.enforceRetentionPolicy);

// ==========================================
// 8.3.5 Right to be Forgotten Routes
// ==========================================

// Get deletion requests
router.get('/deletion/requests', complianceController.getDeletionRequests);

// Create deletion request
router.post('/deletion/requests', complianceController.createDeletionRequest);

// Verify deletion request
router.post('/deletion/requests/:requestId/verify', complianceController.verifyDeletionRequest);

// Execute deletion request
router.post('/deletion/requests/:requestId/execute', complianceController.executeDeletionRequest);

// ==========================================
// 8.3.6 Consent Management Routes
// ==========================================

// Get consent policies
router.get('/consent/policies', complianceController.getConsentPolicies);

// Create consent policy
router.post('/consent/policies', complianceController.createConsentPolicy);

// Get user consents
router.get('/consent/users/:userId', complianceController.getUserConsents);

// Update user consent
router.put('/consent/users/:userId/policies/:policyId', complianceController.updateUserConsent);

// ==========================================
// 8.3.7 Data Subject Access Requests (DSAR) Routes
// ==========================================

// Get DSARs
router.get('/dsar', complianceController.getDSARs);

// Create DSAR
router.post('/dsar', complianceController.createDSAR);

// Update DSAR
router.put('/dsar/:requestId', complianceController.updateDSAR);

// Respond to DSAR
router.post('/dsar/:requestId/respond', complianceController.respondToDSAR);

// ==========================================
// 8.3.8 Audit Trail Routes
// ==========================================

// Get compliance audit logs
router.get('/audit/logs', complianceController.getComplianceAuditLogs);

// Create compliance audit log
router.post('/audit/logs', complianceController.createComplianceAuditLog);

// Export audit logs
router.post('/audit/logs/export', complianceController.exportAuditLogs);

// ==========================================
// 8.3.9 Compliance Dashboards Routes
// ==========================================

// Get compliance metrics
router.get('/metrics', complianceController.getComplianceMetrics);

// Get compliance dashboard
router.get('/dashboard', complianceController.getComplianceDashboard);

// ==========================================
// 8.3.10 Bias Auditing Routes
// ==========================================

// Get bias audit reports
router.get('/bias/reports', complianceController.getBiasAuditReports);

// Generate bias audit report
router.post('/bias/reports', complianceController.generateBiasAuditReport);

// Get specific bias audit report
router.get('/bias/reports/:reportId', complianceController.getBiasAuditReport);

// ==========================================
// 8.3.11 SOC 2 Readiness Routes
// ==========================================

// Get SOC 2 controls
router.get('/soc2/controls', complianceController.getSOC2Controls);

// Update SOC 2 control
router.put('/soc2/controls/:controlId', complianceController.updateSOC2Control);

// Add evidence to SOC 2 control
router.post('/soc2/controls/:controlId/evidence', complianceController.addSOC2Evidence);

// Get SOC 2 audits
router.get('/soc2/audits', complianceController.getSOC2Audits);

// Create SOC 2 audit
router.post('/soc2/audits', complianceController.createSOC2Audit);

// Get SOC 2 readiness score
router.get('/soc2/readiness', complianceController.getSOC2ReadinessScore);

// ==========================================
// Compliance Statistics Route
// ==========================================

// Get overall compliance statistics
router.get('/stats', complianceController.getComplianceStats);

export default router;
