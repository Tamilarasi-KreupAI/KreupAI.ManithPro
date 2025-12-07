import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // 2FA (8.1.1)
  get2FAStatus,
  setup2FA,
  verify2FA,
  disable2FA,
  generateBackupCodes,

  // SSO (8.1.2, 8.1.3)
  createSSOProvider,
  getSSOProviders,
  getSSOProviderById,
  updateSSOProvider,
  deleteSSOProvider,
  initiateSSOLogin,
  handleSSOCallback,

  // Password Policies (8.1.4)
  getPasswordPolicy,
  upsertPasswordPolicy,
  validatePassword,

  // Session Management (8.1.5)
  getActiveSessions,
  createSession,
  terminateSession,
  terminateAllOtherSessions,
  getSessionSettings,
  updateSessionSettings,

  // IP Whitelisting (8.1.6)
  createIPWhitelist,
  getIPWhitelists,
  updateIPWhitelist,
  deleteIPWhitelist,
  checkIPAccess,

  // Trusted Devices (8.1.7)
  getTrustedDevices,
  trustDevice,
  revokeDeviceTrust,
  revokeAllDevices,

  // Login Anomaly Detection (8.1.8)
  recordLoginAttempt,
  getLoginAttempts,
  getAnomalyConfig,
  updateAnomalyConfig,

  // API Key Management (8.1.9)
  createAPIKey,
  getAPIKeys,
  updateAPIKey,
  revokeAPIKey,
  getAPIKeyUsage,

  // RBAC (8.1.10)
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  createPermission,
  getPermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  assignRoleToUser,
  getUserRoles,
  removeRoleFromUser,
  checkUserPermission,

  // ABAC (8.1.11)
  createABACPolicy,
  getABACPolicies,
  updateABACPolicy,
  deleteABACPolicy,
  evaluateABACPolicy,
  createABACAttribute,
  getABACAttributes,

  // Audit Logs
  createAuditLog,
  getAuditLogs,
  getSecurityStats,
} from '../controllers/batch27AuthenticationAccess.controller';

const router = Router();

// ============================================================================
// 8.1.1 TWO-FACTOR AUTHENTICATION ROUTES
// ============================================================================

// Get 2FA status
router.get(
  '/2fa/status',
  authenticate,
  get2FAStatus
);

// Setup 2FA
router.post(
  '/2fa/setup',
  authenticate,
  setup2FA
);

// Verify 2FA code
router.post(
  '/2fa/verify',
  authenticate,
  verify2FA
);

// Disable 2FA
router.post(
  '/2fa/disable',
  authenticate,
  disable2FA
);

// Generate backup codes
router.post(
  '/2fa/backup-codes',
  authenticate,
  generateBackupCodes
);

// ============================================================================
// 8.1.2, 8.1.3 SSO INTEGRATION ROUTES
// ============================================================================

// Create SSO provider
router.post(
  '/sso/providers',
  authenticate,
  authorize('ADMIN'),
  createSSOProvider
);

// Get SSO providers
router.get(
  '/sso/providers',
  authenticate,
  authorize('ADMIN'),
  getSSOProviders
);

// Get SSO provider by ID
router.get(
  '/sso/providers/:id',
  authenticate,
  authorize('ADMIN'),
  getSSOProviderById
);

// Update SSO provider
router.put(
  '/sso/providers/:id',
  authenticate,
  authorize('ADMIN'),
  updateSSOProvider
);

// Delete SSO provider
router.delete(
  '/sso/providers/:id',
  authenticate,
  authorize('ADMIN'),
  deleteSSOProvider
);

// Initiate SSO login (public)
router.get(
  '/sso/login/:providerId',
  initiateSSOLogin
);

// Handle SSO callback (public)
router.post(
  '/sso/callback/:providerId',
  handleSSOCallback
);

// ============================================================================
// 8.1.4 PASSWORD POLICY ROUTES
// ============================================================================

// Get password policy
router.get(
  '/password-policy',
  authenticate,
  getPasswordPolicy
);

// Create/Update password policy
router.post(
  '/password-policy',
  authenticate,
  authorize('ADMIN'),
  upsertPasswordPolicy
);

// Validate password against policy
router.post(
  '/password-policy/validate',
  validatePassword
);

// ============================================================================
// 8.1.5 SESSION MANAGEMENT ROUTES
// ============================================================================

// Get active sessions
router.get(
  '/sessions',
  authenticate,
  getActiveSessions
);

// Create session (internal)
router.post(
  '/sessions',
  createSession
);

// Terminate specific session
router.delete(
  '/sessions/:sessionId',
  authenticate,
  terminateSession
);

// Terminate all other sessions
router.post(
  '/sessions/terminate-others',
  authenticate,
  terminateAllOtherSessions
);

// Get session settings
router.get(
  '/session-settings',
  authenticate,
  getSessionSettings
);

// Update session settings
router.put(
  '/session-settings',
  authenticate,
  authorize('ADMIN'),
  updateSessionSettings
);

// ============================================================================
// 8.1.6 IP WHITELISTING ROUTES
// ============================================================================

// Create IP whitelist rule
router.post(
  '/ip-whitelist',
  authenticate,
  authorize('ADMIN'),
  createIPWhitelist
);

// Get IP whitelist rules
router.get(
  '/ip-whitelist',
  authenticate,
  authorize('ADMIN'),
  getIPWhitelists
);

// Update IP whitelist rule
router.put(
  '/ip-whitelist/:id',
  authenticate,
  authorize('ADMIN'),
  updateIPWhitelist
);

// Delete IP whitelist rule
router.delete(
  '/ip-whitelist/:id',
  authenticate,
  authorize('ADMIN'),
  deleteIPWhitelist
);

// Check IP access
router.post(
  '/ip-whitelist/check',
  checkIPAccess
);

// ============================================================================
// 8.1.7 TRUSTED DEVICES ROUTES
// ============================================================================

// Get trusted devices
router.get(
  '/devices',
  authenticate,
  getTrustedDevices
);

// Trust a device
router.post(
  '/devices/trust',
  authenticate,
  trustDevice
);

// Revoke device trust
router.delete(
  '/devices/:deviceId',
  authenticate,
  revokeDeviceTrust
);

// Revoke all devices
router.post(
  '/devices/revoke-all',
  authenticate,
  revokeAllDevices
);

// ============================================================================
// 8.1.8 LOGIN ANOMALY DETECTION ROUTES
// ============================================================================

// Record login attempt
router.post(
  '/login-attempts',
  recordLoginAttempt
);

// Get login attempts
router.get(
  '/login-attempts',
  authenticate,
  authorize('ADMIN'),
  getLoginAttempts
);

// Get anomaly detection config
router.get(
  '/anomaly-config',
  authenticate,
  authorize('ADMIN'),
  getAnomalyConfig
);

// Update anomaly detection config
router.put(
  '/anomaly-config',
  authenticate,
  authorize('ADMIN'),
  updateAnomalyConfig
);

// ============================================================================
// 8.1.9 API KEY MANAGEMENT ROUTES
// ============================================================================

// Create API key
router.post(
  '/api-keys',
  authenticate,
  createAPIKey
);

// Get API keys
router.get(
  '/api-keys',
  authenticate,
  getAPIKeys
);

// Update API key
router.put(
  '/api-keys/:id',
  authenticate,
  updateAPIKey
);

// Revoke API key
router.delete(
  '/api-keys/:id',
  authenticate,
  revokeAPIKey
);

// Get API key usage
router.get(
  '/api-keys/:id/usage',
  authenticate,
  getAPIKeyUsage
);

// ============================================================================
// 8.1.10 RBAC ROUTES
// ============================================================================

// Roles
router.post(
  '/roles',
  authenticate,
  authorize('ADMIN'),
  createRole
);

router.get(
  '/roles',
  authenticate,
  getRoles
);

router.put(
  '/roles/:id',
  authenticate,
  authorize('ADMIN'),
  updateRole
);

router.delete(
  '/roles/:id',
  authenticate,
  authorize('ADMIN'),
  deleteRole
);

// Permissions
router.post(
  '/permissions',
  authenticate,
  authorize('ADMIN'),
  createPermission
);

router.get(
  '/permissions',
  authenticate,
  getPermissions
);

// Role-Permission assignments
router.post(
  '/role-permissions',
  authenticate,
  authorize('ADMIN'),
  assignPermissionToRole
);

router.delete(
  '/roles/:roleId/permissions/:permissionId',
  authenticate,
  authorize('ADMIN'),
  removePermissionFromRole
);

// User-Role assignments
router.post(
  '/user-roles',
  authenticate,
  authorize('ADMIN'),
  assignRoleToUser
);

router.get(
  '/users/:userId/roles',
  authenticate,
  getUserRoles
);

router.delete(
  '/users/:userId/roles/:roleId',
  authenticate,
  authorize('ADMIN'),
  removeRoleFromUser
);

// Permission checking
router.post(
  '/check-permission',
  authenticate,
  checkUserPermission
);

// ============================================================================
// 8.1.11 ABAC ROUTES
// ============================================================================

// ABAC Policies
router.post(
  '/abac/policies',
  authenticate,
  authorize('ADMIN'),
  createABACPolicy
);

router.get(
  '/abac/policies',
  authenticate,
  authorize('ADMIN'),
  getABACPolicies
);

router.put(
  '/abac/policies/:id',
  authenticate,
  authorize('ADMIN'),
  updateABACPolicy
);

router.delete(
  '/abac/policies/:id',
  authenticate,
  authorize('ADMIN'),
  deleteABACPolicy
);

// Evaluate ABAC policy
router.post(
  '/abac/evaluate',
  authenticate,
  evaluateABACPolicy
);

// ABAC Attributes
router.post(
  '/abac/attributes',
  authenticate,
  authorize('ADMIN'),
  createABACAttribute
);

router.get(
  '/abac/attributes',
  authenticate,
  getABACAttributes
);

// ============================================================================
// AUDIT LOG ROUTES
// ============================================================================

// Create audit log entry
router.post(
  '/audit-logs',
  createAuditLog
);

// Get audit logs
router.get(
  '/audit-logs',
  authenticate,
  authorize('ADMIN'),
  getAuditLogs
);

// ============================================================================
// SECURITY STATS
// ============================================================================

// Get security overview stats
router.get(
  '/stats',
  authenticate,
  authorize('ADMIN'),
  getSecurityStats
);

export default router;
