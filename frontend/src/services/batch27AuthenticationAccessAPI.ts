import axios from 'axios';
import {
  TwoFactorStatus,
  TwoFactorSetupResponse,
  TwoFactorMethod,
  BackupCodesResponse,
  SSOProvider,
  SSOLoginResponse,
  PasswordPolicy,
  PasswordValidationResult,
  UserSession,
  SessionSettings,
  IPWhitelist,
  IPAccessCheckResult,
  TrustedDevice,
  LoginAttempt,
  LoginAnomalyConfig,
  LoginAttemptResult,
  APIKey,
  APIKeyCreateResponse,
  APIKeyUsageLog,
  APIKeyUsageStats,
  RBACRole,
  Permission,
  RolePermission,
  UserRoleAssignment,
  PermissionCheckResult,
  ABACPolicy,
  ABACAttribute,
  ABACEvaluationResult,
  SecurityAuditLog,
  SecurityStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = true;

// ============================================================================
// MOCK DATA
// ============================================================================

const mockTwoFactorStatus: TwoFactorStatus = {
  enabled: true,
  method: 'TOTP',
  verifiedAt: new Date().toISOString(),
  methods: {
    totp: true,
    sms: false,
    email: true,
  },
  backupCodes: {
    used: 2,
    generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  recovery: {
    email: 'j***@example.com',
    phone: null,
  },
};

const mockSSOProviders: SSOProvider[] = [
  {
    id: 'sso-1',
    name: 'Google Workspace',
    type: 'OIDC',
    provider: 'google',
    isEnabled: true,
    isDefault: true,
    clientId: 'google-client-id',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['openid', 'email', 'profile'],
    allowedDomains: ['example.com'],
    autoCreateUsers: true,
    defaultRole: 'CANDIDATE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sso-2',
    name: 'Microsoft Azure AD',
    type: 'OAUTH2',
    provider: 'microsoft',
    isEnabled: true,
    isDefault: false,
    clientId: 'azure-client-id',
    tenantId: 'azure-tenant-id',
    authorizationUrl: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token',
    scopes: ['openid', 'email', 'profile'],
    autoCreateUsers: false,
    createdAt: new Date().toISOString(),
  },
];

const mockPasswordPolicy: PasswordPolicy = {
  id: 'policy-1',
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialCharsAllowed: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  passwordHistoryCount: 5,
  maxPasswordAgeDays: 90,
  minPasswordAgeDays: 1,
  warnBeforeExpireDays: 14,
  maxFailedAttempts: 5,
  lockoutDurationMins: 30,
  resetCounterAfterMins: 60,
  preventCommonPasswords: true,
  preventUserInfoInPwd: true,
  isActive: true,
};

const mockSessions: UserSession[] = [
  {
    id: 'sess-1',
    userId: 'user-1',
    sessionToken: '***',
    deviceType: 'desktop',
    deviceName: 'MacBook Pro',
    browser: 'Chrome',
    browserVersion: '120.0',
    operatingSystem: 'macOS',
    osVersion: '14.0',
    ipAddress: '192.168.1.100',
    country: 'United States',
    city: 'San Francisco',
    isActive: true,
    isCurrent: true,
    lastActivityAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    isTrusted: true,
    riskScore: 0,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sess-2',
    userId: 'user-1',
    sessionToken: '***',
    deviceType: 'mobile',
    deviceName: 'iPhone 15',
    browser: 'Safari',
    browserVersion: '17.0',
    operatingSystem: 'iOS',
    osVersion: '17.0',
    ipAddress: '192.168.1.101',
    country: 'United States',
    city: 'San Francisco',
    isActive: true,
    isCurrent: false,
    lastActivityAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    isTrusted: true,
    riskScore: 10,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const mockTrustedDevices: TrustedDevice[] = [
  {
    id: 'dev-1',
    userId: 'user-1',
    deviceFingerprint: '***',
    deviceName: 'MacBook Pro',
    deviceType: 'desktop',
    browser: 'Chrome',
    browserVersion: '120.0',
    operatingSystem: 'macOS',
    osVersion: '14.0',
    isTrusted: true,
    trustLevel: 'HIGH',
    verificationMethod: '2fa',
    lastUsedAt: new Date().toISOString(),
    lastIpAddress: '192.168.1.100',
    autoRenew: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dev-2',
    userId: 'user-1',
    deviceFingerprint: '***',
    deviceName: 'iPhone 15',
    deviceType: 'mobile',
    browser: 'Safari',
    browserVersion: '17.0',
    operatingSystem: 'iOS',
    osVersion: '17.0',
    isTrusted: true,
    trustLevel: 'STANDARD',
    verificationMethod: 'email',
    lastUsedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    lastIpAddress: '192.168.1.101',
    autoRenew: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockLoginAttempts: LoginAttempt[] = [
  {
    id: 'login-1',
    userId: 'user-1',
    email: 'john.doe@example.com',
    success: true,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    country: 'United States',
    city: 'San Francisco',
    riskScore: 0,
    isAnomaly: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'login-2',
    email: 'john.doe@example.com',
    success: false,
    failureReason: 'invalid_password',
    ipAddress: '203.0.113.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    country: 'Unknown',
    riskScore: 45,
    riskFactors: ['new_location', 'new_device'],
    isAnomaly: true,
    anomalyType: 'new_location',
    actionTaken: 'challenged',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const mockAPIKeys: APIKey[] = [
  {
    id: 'key-1',
    userId: 'user-1',
    name: 'Production Integration',
    description: 'API key for production environment',
    keyPrefix: 'kp_abc1',
    lastFourChars: 'xyz9',
    scopes: ['read:jobs', 'read:applications', 'write:applications'],
    allowedIPs: ['192.168.1.0/24'],
    rateLimit: 1000,
    rateLimitWindow: 3600,
    isActive: true,
    lastUsedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastUsedIP: '192.168.1.50',
    totalRequests: 15420,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'key-2',
    userId: 'user-1',
    name: 'Development Testing',
    description: 'API key for development',
    keyPrefix: 'kp_dev2',
    lastFourChars: 'abc1',
    scopes: ['read:jobs'],
    rateLimit: 100,
    rateLimitWindow: 3600,
    isActive: true,
    totalRequests: 543,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockRoles: RBACRole[] = [
  {
    id: 'role-1',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access',
    level: 100,
    isSystem: true,
    isActive: true,
    _count: { userRoles: 3 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role-2',
    name: 'recruiter',
    displayName: 'Recruiter',
    description: 'Access to recruitment features',
    level: 50,
    isSystem: true,
    isActive: true,
    _count: { userRoles: 25 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role-3',
    name: 'hiring_manager',
    displayName: 'Hiring Manager',
    description: 'Access to hiring team features',
    level: 40,
    isSystem: false,
    isActive: true,
    _count: { userRoles: 15 },
    createdAt: new Date().toISOString(),
  },
];

const mockPermissions: Permission[] = [
  { id: 'perm-1', name: 'jobs:create', displayName: 'Create Jobs', category: 'jobs', resource: 'jobs', action: 'create', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'perm-2', name: 'jobs:read', displayName: 'View Jobs', category: 'jobs', resource: 'jobs', action: 'read', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'perm-3', name: 'jobs:update', displayName: 'Edit Jobs', category: 'jobs', resource: 'jobs', action: 'update', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'perm-4', name: 'jobs:delete', displayName: 'Delete Jobs', category: 'jobs', resource: 'jobs', action: 'delete', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'perm-5', name: 'applications:read', displayName: 'View Applications', category: 'applications', resource: 'applications', action: 'read', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'perm-6', name: 'applications:update', displayName: 'Update Applications', category: 'applications', resource: 'applications', action: 'update', isSystem: true, createdAt: new Date().toISOString() },
  { id: 'perm-7', name: 'users:manage', displayName: 'Manage Users', category: 'users', resource: 'users', action: 'manage', isSystem: true, createdAt: new Date().toISOString() },
];

const mockABACPolicies: ABACPolicy[] = [
  {
    id: 'policy-1',
    name: 'Department Access Control',
    description: 'Users can only access resources in their department',
    priority: 10,
    targetResource: 'jobs',
    targetAction: 'read',
    conditions: {
      all: [
        { attribute: 'user.department', operator: 'eq', value: '${resource.department}' },
      ],
    },
    effect: 'ALLOW',
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'policy-2',
    name: 'Business Hours Only',
    description: 'Certain actions only allowed during business hours',
    priority: 5,
    targetResource: 'applications',
    targetAction: 'update',
    conditions: {
      all: [
        { attribute: 'time.hour', operator: 'between', value: [9, 17] },
        { attribute: 'time.dayOfWeek', operator: 'in', value: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      ],
    },
    effect: 'ALLOW',
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
];

const mockAuditLogs: SecurityAuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-1',
    eventType: 'login',
    eventCategory: 'authentication',
    eventAction: 'success',
    description: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    riskLevel: 'LOW',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'log-2',
    userId: 'user-1',
    eventType: '2fa_enable',
    eventCategory: 'authentication',
    eventAction: 'success',
    description: 'Two-factor authentication enabled',
    ipAddress: '192.168.1.100',
    riskLevel: 'LOW',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-3',
    eventType: 'login',
    eventCategory: 'authentication',
    eventAction: 'failure',
    description: 'Failed login attempt from suspicious location',
    ipAddress: '203.0.113.50',
    riskLevel: 'HIGH',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const mockSecurityStats: SecurityStats = {
  twoFactorAuth: { enabledUsers: 156 },
  sessions: { active: 342 },
  loginAttempts: { last24h: 1250, anomalies24h: 8 },
  apiKeys: { active: 45 },
  rbac: { roles: 12, permissions: 48 },
  auditLogs: { highRiskLast7d: 23 },
};

// ============================================================================
// TWO-FACTOR AUTHENTICATION API
// ============================================================================

export const twoFactorAPI = {
  getStatus: async (): Promise<TwoFactorStatus> => {
    if (USE_MOCK) return mockTwoFactorStatus;
    const response = await axios.get(`${API_BASE_URL}/security/2fa/status`);
    return response.data;
  },

  setup: async (method: TwoFactorMethod): Promise<TwoFactorSetupResponse> => {
    if (USE_MOCK) {
      return {
        message: '2FA setup initiated',
        method,
        qrCode: method === 'TOTP' ? 'otpauth://totp/KreupAI:user?secret=MOCKSECRET' : undefined,
        requiresVerification: true,
      };
    }
    const response = await axios.post(`${API_BASE_URL}/security/2fa/setup`, { method });
    return response.data;
  },

  verify: async (code: string, method: TwoFactorMethod): Promise<{ enabled: boolean }> => {
    if (USE_MOCK) return { enabled: true };
    const response = await axios.post(`${API_BASE_URL}/security/2fa/verify`, { code, method });
    return response.data;
  },

  disable: async (password: string, code?: string): Promise<{ message: string }> => {
    if (USE_MOCK) return { message: '2FA disabled successfully' };
    const response = await axios.post(`${API_BASE_URL}/security/2fa/disable`, { password, code });
    return response.data;
  },

  generateBackupCodes: async (): Promise<BackupCodesResponse> => {
    if (USE_MOCK) {
      return {
        message: 'Backup codes generated',
        codes: ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 'PQR678', 'STU901', 'VWX234', 'YZA567', 'BCD890'],
        warning: 'Store these codes securely. They will not be shown again.',
      };
    }
    const response = await axios.post(`${API_BASE_URL}/security/2fa/backup-codes`);
    return response.data;
  },
};

// ============================================================================
// SSO API
// ============================================================================

export const ssoAPI = {
  getProviders: async (): Promise<SSOProvider[]> => {
    if (USE_MOCK) return mockSSOProviders;
    const response = await axios.get(`${API_BASE_URL}/security/sso/providers`);
    return response.data;
  },

  getProvider: async (id: string): Promise<SSOProvider> => {
    if (USE_MOCK) return mockSSOProviders.find(p => p.id === id) || mockSSOProviders[0];
    const response = await axios.get(`${API_BASE_URL}/security/sso/providers/${id}`);
    return response.data;
  },

  createProvider: async (data: Partial<SSOProvider>): Promise<SSOProvider> => {
    if (USE_MOCK) {
      return { ...mockSSOProviders[0], ...data, id: `sso-${Date.now()}` };
    }
    const response = await axios.post(`${API_BASE_URL}/security/sso/providers`, data);
    return response.data;
  },

  updateProvider: async (id: string, data: Partial<SSOProvider>): Promise<SSOProvider> => {
    if (USE_MOCK) {
      const provider = mockSSOProviders.find(p => p.id === id);
      return { ...provider!, ...data };
    }
    const response = await axios.put(`${API_BASE_URL}/security/sso/providers/${id}`, data);
    return response.data;
  },

  deleteProvider: async (id: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/security/sso/providers/${id}`);
  },

  initiateLogin: async (providerId: string): Promise<SSOLoginResponse> => {
    if (USE_MOCK) {
      return {
        redirectUrl: 'https://accounts.google.com/o/oauth2/v2/auth?mock=true',
        provider: 'Google Workspace',
        type: 'OIDC',
      };
    }
    const response = await axios.get(`${API_BASE_URL}/security/sso/login/${providerId}`);
    return response.data;
  },
};

// ============================================================================
// PASSWORD POLICY API
// ============================================================================

export const passwordPolicyAPI = {
  getPolicy: async (organizationId?: string): Promise<PasswordPolicy> => {
    if (USE_MOCK) return mockPasswordPolicy;
    const response = await axios.get(`${API_BASE_URL}/security/password-policy`, { params: { organizationId } });
    return response.data;
  },

  updatePolicy: async (data: Partial<PasswordPolicy>): Promise<PasswordPolicy> => {
    if (USE_MOCK) return { ...mockPasswordPolicy, ...data };
    const response = await axios.post(`${API_BASE_URL}/security/password-policy`, data);
    return response.data;
  },

  validatePassword: async (password: string, organizationId?: string): Promise<PasswordValidationResult> => {
    if (USE_MOCK) {
      const errors: string[] = [];
      if (password.length < 12) errors.push('Password must be at least 12 characters');
      if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
      if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
      if (!/\d/.test(password)) errors.push('Must contain number');
      if (!/[!@#$%^&*]/.test(password)) errors.push('Must contain special character');

      let strength: 'weak' | 'fair' | 'strong' | 'very_strong' = 'weak';
      if (errors.length === 0) strength = 'very_strong';
      else if (errors.length <= 1) strength = 'strong';
      else if (errors.length <= 2) strength = 'fair';

      return { isValid: errors.length === 0, errors, strength };
    }
    const response = await axios.post(`${API_BASE_URL}/security/password-policy/validate`, { password, organizationId });
    return response.data;
  },
};

// ============================================================================
// SESSION MANAGEMENT API
// ============================================================================

export const sessionsAPI = {
  getActiveSessions: async (): Promise<UserSession[]> => {
    if (USE_MOCK) return mockSessions;
    const response = await axios.get(`${API_BASE_URL}/security/sessions`);
    return response.data;
  },

  terminateSession: async (sessionId: string, reason?: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/security/sessions/${sessionId}`, { data: { reason } });
  },

  terminateAllOthers: async (): Promise<{ count: number }> => {
    if (USE_MOCK) return { count: 1 };
    const response = await axios.post(`${API_BASE_URL}/security/sessions/terminate-others`);
    return response.data;
  },

  getSettings: async (): Promise<SessionSettings> => {
    if (USE_MOCK) {
      return {
        sessionTimeoutMins: 30,
        idleTimeoutMins: 15,
        absoluteTimeoutHours: 24,
        maxConcurrentSessions: 5,
        singleSessionOnly: false,
        terminateOldest: true,
        allowRememberMe: true,
        rememberMeDays: 30,
      };
    }
    const response = await axios.get(`${API_BASE_URL}/security/session-settings`);
    return response.data;
  },

  updateSettings: async (data: Partial<SessionSettings>): Promise<SessionSettings> => {
    if (USE_MOCK) return data as SessionSettings;
    const response = await axios.put(`${API_BASE_URL}/security/session-settings`, data);
    return response.data;
  },
};

// ============================================================================
// IP WHITELISTING API
// ============================================================================

export const ipWhitelistAPI = {
  getRules: async (): Promise<IPWhitelist[]> => {
    if (USE_MOCK) {
      return [
        {
          id: 'ip-1',
          name: 'Office Network',
          description: 'Main office IP range',
          cidrBlock: '192.168.1.0/24',
          appliesToAll: true,
          isEnabled: true,
          enforcementMode: 'BLOCK',
          createdAt: new Date().toISOString(),
        },
      ];
    }
    const response = await axios.get(`${API_BASE_URL}/security/ip-whitelist`);
    return response.data;
  },

  createRule: async (data: Partial<IPWhitelist>): Promise<IPWhitelist> => {
    if (USE_MOCK) return { ...data, id: `ip-${Date.now()}` } as IPWhitelist;
    const response = await axios.post(`${API_BASE_URL}/security/ip-whitelist`, data);
    return response.data;
  },

  updateRule: async (id: string, data: Partial<IPWhitelist>): Promise<IPWhitelist> => {
    if (USE_MOCK) return { id, ...data } as IPWhitelist;
    const response = await axios.put(`${API_BASE_URL}/security/ip-whitelist/${id}`, data);
    return response.data;
  },

  deleteRule: async (id: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/security/ip-whitelist/${id}`);
  },

  checkAccess: async (ipAddress: string): Promise<IPAccessCheckResult> => {
    if (USE_MOCK) return { allowed: true, matchedRule: 'Office Network' };
    const response = await axios.post(`${API_BASE_URL}/security/ip-whitelist/check`, { ipAddress });
    return response.data;
  },
};

// ============================================================================
// TRUSTED DEVICES API
// ============================================================================

export const devicesAPI = {
  getTrustedDevices: async (): Promise<TrustedDevice[]> => {
    if (USE_MOCK) return mockTrustedDevices;
    const response = await axios.get(`${API_BASE_URL}/security/devices`);
    return response.data;
  },

  trustDevice: async (data: Partial<TrustedDevice>): Promise<{ deviceId: string }> => {
    if (USE_MOCK) return { deviceId: `dev-${Date.now()}` };
    const response = await axios.post(`${API_BASE_URL}/security/devices/trust`, data);
    return response.data;
  },

  revokeDevice: async (deviceId: string, reason?: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/security/devices/${deviceId}`, { data: { reason } });
  },

  revokeAllDevices: async (): Promise<{ count: number }> => {
    if (USE_MOCK) return { count: mockTrustedDevices.length };
    const response = await axios.post(`${API_BASE_URL}/security/devices/revoke-all`);
    return response.data;
  },
};

// ============================================================================
// LOGIN ANOMALY DETECTION API
// ============================================================================

export const anomalyAPI = {
  getLoginAttempts: async (params?: {
    userId?: string;
    isAnomaly?: boolean;
    limit?: number;
  }): Promise<LoginAttempt[]> => {
    if (USE_MOCK) {
      if (params?.isAnomaly) return mockLoginAttempts.filter(a => a.isAnomaly);
      return mockLoginAttempts;
    }
    const response = await axios.get(`${API_BASE_URL}/security/login-attempts`, { params });
    return response.data;
  },

  recordAttempt: async (data: Partial<LoginAttempt>): Promise<LoginAttemptResult> => {
    if (USE_MOCK) {
      return {
        id: `login-${Date.now()}`,
        riskScore: 0,
        isAnomaly: false,
      };
    }
    const response = await axios.post(`${API_BASE_URL}/security/login-attempts`, data);
    return response.data;
  },

  getConfig: async (): Promise<LoginAnomalyConfig> => {
    if (USE_MOCK) {
      return {
        enableAnomalyDetection: true,
        enableImpossibleTravel: true,
        enableNewLocationAlert: true,
        enableNewDeviceAlert: true,
        enableBruteForceDetect: true,
        maxTravelSpeedKmh: 1000,
        anomalyAction: 'CHALLENGE',
        alertAdmins: true,
        alertUser: true,
        modelSensitivity: 'MEDIUM',
        learningPeriodDays: 30,
      };
    }
    const response = await axios.get(`${API_BASE_URL}/security/anomaly-config`);
    return response.data;
  },

  updateConfig: async (data: Partial<LoginAnomalyConfig>): Promise<LoginAnomalyConfig> => {
    if (USE_MOCK) return data as LoginAnomalyConfig;
    const response = await axios.put(`${API_BASE_URL}/security/anomaly-config`, data);
    return response.data;
  },
};

// ============================================================================
// API KEY MANAGEMENT API
// ============================================================================

export const apiKeysAPI = {
  getKeys: async (): Promise<APIKey[]> => {
    if (USE_MOCK) return mockAPIKeys;
    const response = await axios.get(`${API_BASE_URL}/security/api-keys`);
    return response.data;
  },

  createKey: async (data: {
    name: string;
    description?: string;
    scopes?: string[];
    expiresAt?: string;
  }): Promise<APIKeyCreateResponse> => {
    if (USE_MOCK) {
      return {
        id: `key-${Date.now()}`,
        name: data.name,
        key: 'kp_' + Array.from({ length: 32 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36))).join(''),
        keyPrefix: 'kp_abc1',
        lastFourChars: 'xyz9',
        scopes: data.scopes,
        expiresAt: data.expiresAt,
        warning: 'Store this key securely. It will not be shown again.',
      };
    }
    const response = await axios.post(`${API_BASE_URL}/security/api-keys`, data);
    return response.data;
  },

  updateKey: async (id: string, data: Partial<APIKey>): Promise<void> => {
    if (USE_MOCK) return;
    await axios.put(`${API_BASE_URL}/security/api-keys/${id}`, data);
  },

  revokeKey: async (id: string, reason?: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/security/api-keys/${id}`, { data: { reason } });
  },

  getUsage: async (id: string): Promise<{ usage: APIKeyUsageLog[]; stats: APIKeyUsageStats[] }> => {
    if (USE_MOCK) {
      return {
        usage: [],
        stats: [
          { endpoint: '/api/jobs', _count: 5000, _avg: { responseTimeMs: 45 } },
          { endpoint: '/api/applications', _count: 3500, _avg: { responseTimeMs: 62 } },
        ],
      };
    }
    const response = await axios.get(`${API_BASE_URL}/security/api-keys/${id}/usage`);
    return response.data;
  },
};

// ============================================================================
// RBAC API
// ============================================================================

export const rbacAPI = {
  // Roles
  getRoles: async (): Promise<RBACRole[]> => {
    if (USE_MOCK) return mockRoles;
    const response = await axios.get(`${API_BASE_URL}/security/roles`);
    return response.data;
  },

  createRole: async (data: Partial<RBACRole>): Promise<RBACRole> => {
    if (USE_MOCK) return { ...mockRoles[0], ...data, id: `role-${Date.now()}` };
    const response = await axios.post(`${API_BASE_URL}/security/roles`, data);
    return response.data;
  },

  updateRole: async (id: string, data: Partial<RBACRole>): Promise<RBACRole> => {
    if (USE_MOCK) return { ...mockRoles[0], ...data };
    const response = await axios.put(`${API_BASE_URL}/security/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/security/roles/${id}`);
  },

  // Permissions
  getPermissions: async (category?: string): Promise<Permission[]> => {
    if (USE_MOCK) {
      if (category) return mockPermissions.filter(p => p.category === category);
      return mockPermissions;
    }
    const response = await axios.get(`${API_BASE_URL}/security/permissions`, { params: { category } });
    return response.data;
  },

  createPermission: async (data: Partial<Permission>): Promise<Permission> => {
    if (USE_MOCK) return { ...mockPermissions[0], ...data, id: `perm-${Date.now()}` };
    const response = await axios.post(`${API_BASE_URL}/security/permissions`, data);
    return response.data;
  },

  // Role-Permission assignments
  assignPermission: async (roleId: string, permissionId: string, grantType?: 'ALLOW' | 'DENY'): Promise<RolePermission> => {
    if (USE_MOCK) {
      return {
        id: `rp-${Date.now()}`,
        roleId,
        permissionId,
        grantType: grantType || 'ALLOW',
        createdAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/security/role-permissions`, { roleId, permissionId, grantType });
    return response.data;
  },

  removePermission: async (roleId: string, permissionId: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/security/roles/${roleId}/permissions/${permissionId}`);
  },

  // User roles
  getUserRoles: async (userId: string): Promise<UserRoleAssignment[]> => {
    if (USE_MOCK) {
      return [
        {
          id: 'ur-1',
          userId,
          roleId: 'role-2',
          role: mockRoles[1],
          startsAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];
    }
    const response = await axios.get(`${API_BASE_URL}/security/users/${userId}/roles`);
    return response.data;
  },

  assignRole: async (userId: string, roleId: string, expiresAt?: string): Promise<UserRoleAssignment> => {
    if (USE_MOCK) {
      return {
        id: `ur-${Date.now()}`,
        userId,
        roleId,
        startsAt: new Date().toISOString(),
        expiresAt,
        createdAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/security/user-roles`, { userId, roleId, expiresAt });
    return response.data;
  },

  removeRole: async (userId: string, roleId: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/security/users/${userId}/roles/${roleId}`);
  },

  checkPermission: async (userId: string, permission: string, resourceId?: string): Promise<PermissionCheckResult> => {
    if (USE_MOCK) return { allowed: true, source: 'role' };
    const response = await axios.post(`${API_BASE_URL}/security/check-permission`, { userId, permission, resourceId });
    return response.data;
  },
};

// ============================================================================
// ABAC API
// ============================================================================

export const abacAPI = {
  getPolicies: async (): Promise<ABACPolicy[]> => {
    if (USE_MOCK) return mockABACPolicies;
    const response = await axios.get(`${API_BASE_URL}/security/abac/policies`);
    return response.data;
  },

  createPolicy: async (data: Partial<ABACPolicy>): Promise<ABACPolicy> => {
    if (USE_MOCK) return { ...mockABACPolicies[0], ...data, id: `policy-${Date.now()}` };
    const response = await axios.post(`${API_BASE_URL}/security/abac/policies`, data);
    return response.data;
  },

  updatePolicy: async (id: string, data: Partial<ABACPolicy>): Promise<ABACPolicy> => {
    if (USE_MOCK) return { ...mockABACPolicies[0], ...data };
    const response = await axios.put(`${API_BASE_URL}/security/abac/policies/${id}`, data);
    return response.data;
  },

  deletePolicy: async (id: string): Promise<void> => {
    if (USE_MOCK) return;
    await axios.delete(`${API_BASE_URL}/security/abac/policies/${id}`);
  },

  evaluate: async (resource: string, action: string, context: Record<string, any>): Promise<ABACEvaluationResult> => {
    if (USE_MOCK) return { allowed: true, matchedPolicy: 'Department Access Control', effect: 'ALLOW' };
    const response = await axios.post(`${API_BASE_URL}/security/abac/evaluate`, { resource, action, context });
    return response.data;
  },

  getAttributes: async (category?: string): Promise<ABACAttribute[]> => {
    if (USE_MOCK) {
      return [
        { id: 'attr-1', name: 'user.department', displayName: 'User Department', category: 'user', dataType: 'string', source: 'database', createdAt: new Date().toISOString() },
        { id: 'attr-2', name: 'user.role', displayName: 'User Role', category: 'user', dataType: 'string', source: 'jwt', createdAt: new Date().toISOString() },
        { id: 'attr-3', name: 'time.hour', displayName: 'Current Hour', category: 'environment', dataType: 'number', source: 'computed', createdAt: new Date().toISOString() },
      ];
    }
    const response = await axios.get(`${API_BASE_URL}/security/abac/attributes`, { params: { category } });
    return response.data;
  },

  createAttribute: async (data: Partial<ABACAttribute>): Promise<ABACAttribute> => {
    if (USE_MOCK) return { ...data, id: `attr-${Date.now()}` } as ABACAttribute;
    const response = await axios.post(`${API_BASE_URL}/security/abac/attributes`, data);
    return response.data;
  },
};

// ============================================================================
// AUDIT LOGS API
// ============================================================================

export const auditLogsAPI = {
  getLogs: async (params?: {
    userId?: string;
    eventType?: string;
    riskLevel?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: SecurityAuditLog[]; total: number }> => {
    if (USE_MOCK) {
      let logs = mockAuditLogs;
      if (params?.riskLevel) logs = logs.filter(l => l.riskLevel === params.riskLevel);
      return { logs, total: logs.length };
    }
    const response = await axios.get(`${API_BASE_URL}/security/audit-logs`, { params });
    return response.data;
  },

  getStats: async (): Promise<SecurityStats> => {
    if (USE_MOCK) return mockSecurityStats;
    const response = await axios.get(`${API_BASE_URL}/security/stats`);
    return response.data;
  },
};

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export const securityAPI = {
  twoFactor: twoFactorAPI,
  sso: ssoAPI,
  passwordPolicy: passwordPolicyAPI,
  sessions: sessionsAPI,
  ipWhitelist: ipWhitelistAPI,
  devices: devicesAPI,
  anomaly: anomalyAPI,
  apiKeys: apiKeysAPI,
  rbac: rbacAPI,
  abac: abacAPI,
  auditLogs: auditLogsAPI,
};

export default securityAPI;
