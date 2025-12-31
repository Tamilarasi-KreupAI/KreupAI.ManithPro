// @ts-nocheck
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// 8.1.1 TWO-FACTOR AUTHENTICATION
// ============================================================================

// Get 2FA status for current user
export const get2FAStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId },
      select: {
        enabled: true,
        method: true,
        verifiedAt: true,
        totpVerified: true,
        phoneVerified: true,
        emailVerified: true,
        backupCodesUsed: true,
        backupCodesGenerated: true,
        recoveryEmail: true,
        recoveryPhone: true,
      },
    });

    res.json({
      enabled: twoFactorAuth?.enabled || false,
      method: twoFactorAuth?.method || null,
      verifiedAt: twoFactorAuth?.verifiedAt,
      methods: {
        totp: twoFactorAuth?.totpVerified || false,
        sms: twoFactorAuth?.phoneVerified || false,
        email: twoFactorAuth?.emailVerified || false,
      },
      backupCodes: {
        used: twoFactorAuth?.backupCodesUsed || 0,
        generatedAt: twoFactorAuth?.backupCodesGenerated,
      },
      recovery: {
        email: twoFactorAuth?.recoveryEmail ? '***@***' : null,
        phone: twoFactorAuth?.recoveryPhone ? '***-****' : null,
      },
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
};

// Enable/Setup 2FA
export const setup2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { method } = req.body; // TOTP, SMS, EMAIL

    // Generate TOTP secret (mock)
    const totpSecret = method === 'TOTP' ? 'MOCK_SECRET_' + Date.now() : null;

    const twoFactorAuth = await prisma.twoFactorAuth.upsert({
      where: { userId },
      update: {
        method,
        totpSecret: totpSecret,
      },
      create: {
        userId,
        method,
        totpSecret,
      },
    });

    res.json({
      message: '2FA setup initiated',
      method,
      // Mock QR code data for TOTP
      qrCode: method === 'TOTP' ? `otpauth://totp/KreupAI:user?secret=${totpSecret}` : null,
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
};

// Verify 2FA code
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { code, method } = req.body;

    // Mock verification (in production, validate actual TOTP/SMS code)
    const isValid = code?.length === 6;

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    const twoFactorAuth = await prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        enabled: true,
        verifiedAt: new Date(),
        totpVerified: method === 'TOTP' ? true : undefined,
        phoneVerified: method === 'SMS' ? true : undefined,
        emailVerified: method === 'EMAIL' ? true : undefined,
      },
    });

    res.json({
      message: '2FA verified and enabled',
      enabled: true,
      method: twoFactorAuth.method,
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
};

// Disable 2FA
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { password, code } = req.body;

    // Mock password verification
    if (!password) {
      return res.status(400).json({ error: 'Password required to disable 2FA' });
    }

    await prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        enabled: false,
        verifiedAt: null,
      },
    });

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
};

// Generate backup codes
export const generateBackupCodes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    // Generate 10 backup codes (mock)
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    await prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        backupCodes: codes.map(c => c), // In production, hash these
        backupCodesUsed: 0,
        backupCodesGenerated: new Date(),
      },
    });

    res.json({
      message: 'Backup codes generated',
      codes,
      warning: 'Store these codes securely. They will not be shown again.',
    });
  } catch (error) {
    console.error('Error generating backup codes:', error);
    res.status(500).json({ error: 'Failed to generate backup codes' });
  }
};

// ============================================================================
// 8.1.2, 8.1.3 SSO INTEGRATION
// ============================================================================

// Create SSO provider
export const createSSOProvider = async (req: Request, res: Response) => {
  try {
    const {
      name,
      type, // SAML, OAUTH2, OIDC
      provider, // google, microsoft, okta, custom
      organizationId,
      // SAML config
      samlEntityId,
      samlSsoUrl,
      samlCertificate,
      samlLogoutUrl,
      // OAuth/OIDC config
      clientId,
      clientSecret,
      authorizationUrl,
      tokenUrl,
      userInfoUrl,
      scopes,
      callbackUrl,
      // Microsoft specific
      tenantId,
      // Okta specific
      oktaDomain,
      // Settings
      attributeMapping,
      allowedDomains,
      autoCreateUsers,
      defaultRole,
    } = req.body;

    const ssoProvider = await prisma.sSOProvider.create({
      data: {
        name,
        type,
        provider,
        organizationId,
        samlEntityId,
        samlSsoUrl,
        samlCertificate,
        samlLogoutUrl,
        clientId,
        clientSecret,
        authorizationUrl,
        tokenUrl,
        userInfoUrl,
        scopes: scopes || [],
        callbackUrl,
        tenantId,
        oktaDomain,
        attributeMapping,
        allowedDomains: allowedDomains || [],
        autoCreateUsers: autoCreateUsers || false,
        defaultRole: defaultRole || 'CANDIDATE',
      },
    });

    res.status(201).json(ssoProvider);
  } catch (error) {
    console.error('Error creating SSO provider:', error);
    res.status(500).json({ error: 'Failed to create SSO provider' });
  }
};

// Get SSO providers
export const getSSOProviders = async (req: Request, res: Response) => {
  try {
    const { organizationId, type, isEnabled } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (type) where.type = type;
    if (isEnabled !== undefined) where.isEnabled = isEnabled === 'true';

    const providers = await prisma.sSOProvider.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        provider: true,
        isEnabled: true,
        isDefault: true,
        allowedDomains: true,
        autoCreateUsers: true,
        defaultRole: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(providers);
  } catch (error) {
    console.error('Error getting SSO providers:', error);
    res.status(500).json({ error: 'Failed to get SSO providers' });
  }
};

// Get SSO provider by ID
export const getSSOProviderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const provider = await prisma.sSOProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      return res.status(404).json({ error: 'SSO provider not found' });
    }

    // Mask sensitive data
    res.json({
      ...provider,
      clientSecret: provider.clientSecret ? '********' : null,
      samlCertificate: provider.samlCertificate ? '[CERTIFICATE]' : null,
    });
  } catch (error) {
    console.error('Error getting SSO provider:', error);
    res.status(500).json({ error: 'Failed to get SSO provider' });
  }
};

// Update SSO provider
export const updateSSOProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const provider = await prisma.sSOProvider.update({
      where: { id },
      data: updates,
    });

    res.json(provider);
  } catch (error) {
    console.error('Error updating SSO provider:', error);
    res.status(500).json({ error: 'Failed to update SSO provider' });
  }
};

// Delete SSO provider
export const deleteSSOProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.sSOProvider.delete({
      where: { id },
    });

    res.json({ message: 'SSO provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting SSO provider:', error);
    res.status(500).json({ error: 'Failed to delete SSO provider' });
  }
};

// Initiate SSO login
export const initiateSSOLogin = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    const provider = await prisma.sSOProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider || !provider.isEnabled) {
      return res.status(404).json({ error: 'SSO provider not found or disabled' });
    }

    // Generate authorization URL based on provider type
    let authUrl: string;
    if (provider.type === 'OAUTH2' || provider.type === 'OIDC') {
      const params = new URLSearchParams({
        client_id: provider.clientId || '',
        redirect_uri: provider.callbackUrl || '',
        response_type: 'code',
        scope: provider.scopes?.join(' ') || '',
        state: 'mock_state_' + Date.now(),
      });
      authUrl = `${provider.authorizationUrl}?${params.toString()}`;
    } else {
      // SAML
      authUrl = provider.samlSsoUrl || '';
    }

    res.json({
      redirectUrl: authUrl,
      provider: provider.name,
      type: provider.type,
    });
  } catch (error) {
    console.error('Error initiating SSO login:', error);
    res.status(500).json({ error: 'Failed to initiate SSO login' });
  }
};

// Handle SSO callback
export const handleSSOCallback = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const { code, state, SAMLResponse } = req.body;

    const provider = await prisma.sSOProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return res.status(404).json({ error: 'SSO provider not found' });
    }

    // Mock token exchange and user info
    const mockUserInfo = {
      email: 'sso.user@example.com',
      firstName: 'SSO',
      lastName: 'User',
      sub: 'mock_sso_id_' + Date.now(),
    };

    // Create SSO session
    const session = await prisma.sSOSession.create({
      data: {
        userId: 'mock_user_id',
        providerId: provider.id,
        ssoSessionId: mockUserInfo.sub,
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        accessTokenExpiry: new Date(Date.now() + 3600000),
        refreshTokenExpiry: new Date(Date.now() + 86400000 * 30),
      },
    });

    res.json({
      message: 'SSO login successful',
      user: mockUserInfo,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error handling SSO callback:', error);
    res.status(500).json({ error: 'Failed to handle SSO callback' });
  }
};

// ============================================================================
// 8.1.4 PASSWORD POLICIES
// ============================================================================

// Get password policy
export const getPasswordPolicy = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;

    const policy = await prisma.passwordPolicy.findFirst({
      where: {
        OR: [
          { organizationId: organizationId as string },
          { organizationId: null, isActive: true },
        ],
      },
      orderBy: { organizationId: 'desc' }, // Org-specific takes precedence
    });

    if (!policy) {
      // Return default policy
      return res.json({
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxPasswordAgeDays: 90,
        passwordHistoryCount: 5,
        maxFailedAttempts: 5,
        lockoutDurationMins: 30,
      });
    }

    res.json(policy);
  } catch (error) {
    console.error('Error getting password policy:', error);
    res.status(500).json({ error: 'Failed to get password policy' });
  }
};

// Create/Update password policy
export const upsertPasswordPolicy = async (req: Request, res: Response) => {
  try {
    const {
      organizationId,
      minLength,
      maxLength,
      requireUppercase,
      requireLowercase,
      requireNumbers,
      requireSpecialChars,
      specialCharsAllowed,
      passwordHistoryCount,
      maxPasswordAgeDays,
      minPasswordAgeDays,
      warnBeforeExpireDays,
      maxFailedAttempts,
      lockoutDurationMins,
      resetCounterAfterMins,
      preventCommonPasswords,
      preventUserInfoInPwd,
    } = req.body;

    const policy = await prisma.passwordPolicy.upsert({
      where: {
        organizationId: organizationId || 'global',
      },
      update: {
        minLength,
        maxLength,
        requireUppercase,
        requireLowercase,
        requireNumbers,
        requireSpecialChars,
        specialCharsAllowed,
        passwordHistoryCount,
        maxPasswordAgeDays,
        minPasswordAgeDays,
        warnBeforeExpireDays,
        maxFailedAttempts,
        lockoutDurationMins,
        resetCounterAfterMins,
        preventCommonPasswords,
        preventUserInfoInPwd,
      },
      create: {
        organizationId,
        minLength: minLength || 8,
        maxLength: maxLength || 128,
        requireUppercase: requireUppercase ?? true,
        requireLowercase: requireLowercase ?? true,
        requireNumbers: requireNumbers ?? true,
        requireSpecialChars: requireSpecialChars ?? true,
        specialCharsAllowed: specialCharsAllowed || '!@#$%^&*()_+-=[]{}|;:,.<>?',
        passwordHistoryCount: passwordHistoryCount || 5,
        maxPasswordAgeDays: maxPasswordAgeDays || 90,
        minPasswordAgeDays: minPasswordAgeDays || 1,
        warnBeforeExpireDays: warnBeforeExpireDays || 14,
        maxFailedAttempts: maxFailedAttempts || 5,
        lockoutDurationMins: lockoutDurationMins || 30,
        resetCounterAfterMins: resetCounterAfterMins || 60,
        preventCommonPasswords: preventCommonPasswords ?? true,
        preventUserInfoInPwd: preventUserInfoInPwd ?? true,
      },
    });

    res.json(policy);
  } catch (error) {
    console.error('Error upserting password policy:', error);
    res.status(500).json({ error: 'Failed to save password policy' });
  }
};

// Validate password against policy
export const validatePassword = async (req: Request, res: Response) => {
  try {
    const { password, organizationId } = req.body;

    const policy = await prisma.passwordPolicy.findFirst({
      where: {
        OR: [
          { organizationId },
          { organizationId: null, isActive: true },
        ],
      },
      orderBy: { organizationId: 'desc' },
    });

    const errors: string[] = [];
    const minLength = policy?.minLength || 8;
    const maxLength = policy?.maxLength || 128;

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters`);
    }
    if (password.length > maxLength) {
      errors.push(`Password must not exceed ${maxLength} characters`);
    }
    if (policy?.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (policy?.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (policy?.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (policy?.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    res.json({
      isValid: errors.length === 0,
      errors,
      strength: calculatePasswordStrength(password),
    });
  } catch (error) {
    console.error('Error validating password:', error);
    res.status(500).json({ error: 'Failed to validate password' });
  }
};

function calculatePasswordStrength(password: string): string {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  if (score <= 6) return 'strong';
  return 'very_strong';
}

// ============================================================================
// 8.1.5 SESSION MANAGEMENT
// ============================================================================

// Get active sessions
export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivityAt: 'desc' },
    });

    res.json(sessions.map(s => ({
      ...s,
      sessionToken: '***', // Don't expose token
      isCurrent: s.sessionToken === (req as any).sessionToken,
    })));
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({ error: 'Failed to get active sessions' });
  }
};

// Create session (internal use)
export const createSession = async (req: Request, res: Response) => {
  try {
    const { userId, deviceInfo, ipAddress, userAgent } = req.body;

    // Get session settings
    const settings = await prisma.sessionSettings.findFirst({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: { userId: 'desc' },
    });

    const maxConcurrent = settings?.maxConcurrentSessions || 5;

    // Check concurrent session limit
    const activeSessions = await prisma.userSession.count({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeSessions >= maxConcurrent) {
      if (settings?.terminateOldest) {
        // Terminate oldest session
        const oldest = await prisma.userSession.findFirst({
          where: { userId, isActive: true },
          orderBy: { createdAt: 'asc' },
        });
        if (oldest) {
          await prisma.userSession.update({
            where: { id: oldest.id },
            data: {
              isActive: false,
              terminatedAt: new Date(),
              terminatedReason: 'new_session_limit',
            },
          });
        }
      } else {
        return res.status(400).json({ error: 'Maximum concurrent sessions reached' });
      }
    }

    const sessionTimeoutMins = settings?.sessionTimeoutMins || 30;

    const session = await prisma.userSession.create({
      data: {
        userId,
        sessionToken: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        deviceType: deviceInfo?.type,
        deviceName: deviceInfo?.name,
        browser: deviceInfo?.browser,
        browserVersion: deviceInfo?.browserVersion,
        operatingSystem: deviceInfo?.os,
        osVersion: deviceInfo?.osVersion,
        ipAddress,
        expiresAt: new Date(Date.now() + sessionTimeoutMins * 60 * 1000),
      },
    });

    res.status(201).json({
      sessionId: session.id,
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

// Terminate session
export const terminateSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId, // Ensure user owns the session
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        terminatedAt: new Date(),
        terminatedReason: reason || 'user_terminated',
      },
    });

    res.json({ message: 'Session terminated successfully' });
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({ error: 'Failed to terminate session' });
  }
};

// Terminate all other sessions
export const terminateAllOtherSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const currentToken = (req as any).sessionToken;

    const result = await prisma.userSession.updateMany({
      where: {
        userId,
        isActive: true,
        NOT: { sessionToken: currentToken },
      },
      data: {
        isActive: false,
        terminatedAt: new Date(),
        terminatedReason: 'user_terminated_all',
      },
    });

    res.json({
      message: 'All other sessions terminated',
      count: result.count,
    });
  } catch (error) {
    console.error('Error terminating sessions:', error);
    res.status(500).json({ error: 'Failed to terminate sessions' });
  }
};

// Get/Update session settings
export const getSessionSettings = async (req: Request, res: Response) => {
  try {
    const { userId, organizationId } = req.query;

    const settings = await prisma.sessionSettings.findFirst({
      where: {
        OR: [
          { userId: userId as string },
          { organizationId: organizationId as string },
          { userId: null, organizationId: null },
        ],
      },
      orderBy: [{ userId: 'desc' }, { organizationId: 'desc' }],
    });

    res.json(settings || {
      sessionTimeoutMins: 30,
      idleTimeoutMins: 15,
      absoluteTimeoutHours: 24,
      maxConcurrentSessions: 5,
      singleSessionOnly: false,
      allowRememberMe: true,
      rememberMeDays: 30,
    });
  } catch (error) {
    console.error('Error getting session settings:', error);
    res.status(500).json({ error: 'Failed to get session settings' });
  }
};

export const updateSessionSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const { userId, organizationId } = updates;

    const settings = await prisma.sessionSettings.upsert({
      where: {
        userId: userId || undefined,
        organizationId: organizationId || undefined,
      },
      update: updates,
      create: updates,
    });

    res.json(settings);
  } catch (error) {
    console.error('Error updating session settings:', error);
    res.status(500).json({ error: 'Failed to update session settings' });
  }
};

// ============================================================================
// 8.1.6 IP WHITELISTING
// ============================================================================

// Create IP whitelist rule
export const createIPWhitelist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      name,
      description,
      ipAddress,
      ipRangeStart,
      ipRangeEnd,
      cidrBlock,
      organizationId,
      appliesToAll,
      appliesToRoles,
      appliesToUsers,
      enforcementMode,
      activeStartTime,
      activeEndTime,
      activeDays,
    } = req.body;

    const whitelist = await prisma.iPWhitelist.create({
      data: {
        name,
        description,
        ipAddress,
        ipRangeStart,
        ipRangeEnd,
        cidrBlock,
        organizationId,
        appliesToAll: appliesToAll ?? true,
        appliesToRoles: appliesToRoles || [],
        appliesToUsers: appliesToUsers || [],
        enforcementMode: enforcementMode || 'BLOCK',
        activeStartTime,
        activeEndTime,
        activeDays: activeDays || [],
        createdBy: userId,
      },
    });

    res.status(201).json(whitelist);
  } catch (error) {
    console.error('Error creating IP whitelist:', error);
    res.status(500).json({ error: 'Failed to create IP whitelist' });
  }
};

// Get IP whitelist rules
export const getIPWhitelists = async (req: Request, res: Response) => {
  try {
    const { organizationId, isEnabled } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (isEnabled !== undefined) where.isEnabled = isEnabled === 'true';

    const whitelists = await prisma.iPWhitelist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(whitelists);
  } catch (error) {
    console.error('Error getting IP whitelists:', error);
    res.status(500).json({ error: 'Failed to get IP whitelists' });
  }
};

// Update IP whitelist rule
export const updateIPWhitelist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const whitelist = await prisma.iPWhitelist.update({
      where: { id },
      data: updates,
    });

    res.json(whitelist);
  } catch (error) {
    console.error('Error updating IP whitelist:', error);
    res.status(500).json({ error: 'Failed to update IP whitelist' });
  }
};

// Delete IP whitelist rule
export const deleteIPWhitelist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.iPWhitelist.delete({
      where: { id },
    });

    res.json({ message: 'IP whitelist rule deleted' });
  } catch (error) {
    console.error('Error deleting IP whitelist:', error);
    res.status(500).json({ error: 'Failed to delete IP whitelist' });
  }
};

// Check if IP is allowed
export const checkIPAccess = async (req: Request, res: Response) => {
  try {
    const { ipAddress, userId, role } = req.body;

    const whitelists = await prisma.iPWhitelist.findMany({
      where: { isEnabled: true },
    });

    if (whitelists.length === 0) {
      return res.json({ allowed: true, reason: 'No IP restrictions configured' });
    }

    // Check if IP matches any whitelist rule
    for (const rule of whitelists) {
      if (rule.ipAddress === ipAddress) {
        return res.json({ allowed: true, matchedRule: rule.name });
      }
      // Additional CIDR and range checks would go here
    }

    res.json({
      allowed: false,
      reason: 'IP not in whitelist',
      enforcementMode: whitelists[0].enforcementMode,
    });
  } catch (error) {
    console.error('Error checking IP access:', error);
    res.status(500).json({ error: 'Failed to check IP access' });
  }
};

// ============================================================================
// 8.1.7 TRUSTED DEVICES
// ============================================================================

// Get trusted devices
export const getTrustedDevices = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const devices = await prisma.trustedDevice.findMany({
      where: {
        userId,
        isTrusted: true,
        OR: [
          { revokedAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    res.json(devices.map(d => ({
      ...d,
      deviceFingerprint: '***', // Don't expose fingerprint
    })));
  } catch (error) {
    console.error('Error getting trusted devices:', error);
    res.status(500).json({ error: 'Failed to get trusted devices' });
  }
};

// Trust a device
export const trustDevice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      deviceFingerprint,
      deviceName,
      deviceType,
      browser,
      browserVersion,
      operatingSystem,
      osVersion,
      trustLevel,
      verificationMethod,
    } = req.body;

    const device = await prisma.trustedDevice.upsert({
      where: {
        userId_deviceFingerprint: {
          userId,
          deviceFingerprint,
        },
      },
      update: {
        isTrusted: true,
        trustLevel: trustLevel || 'STANDARD',
        verificationMethod,
        lastUsedAt: new Date(),
        revokedAt: null,
        revokedReason: null,
      },
      create: {
        userId,
        deviceFingerprint,
        deviceName,
        deviceType,
        browser,
        browserVersion,
        operatingSystem,
        osVersion,
        trustLevel: trustLevel || 'STANDARD',
        verificationMethod,
      },
    });

    res.json({
      message: 'Device trusted successfully',
      deviceId: device.id,
    });
  } catch (error) {
    console.error('Error trusting device:', error);
    res.status(500).json({ error: 'Failed to trust device' });
  }
};

// Revoke device trust
export const revokeDeviceTrust = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { deviceId } = req.params;
    const { reason } = req.body;

    const device = await prisma.trustedDevice.updateMany({
      where: {
        id: deviceId,
        userId,
      },
      data: {
        isTrusted: false,
        revokedAt: new Date(),
        revokedReason: reason || 'user_revoked',
      },
    });

    if (device.count === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ message: 'Device trust revoked' });
  } catch (error) {
    console.error('Error revoking device trust:', error);
    res.status(500).json({ error: 'Failed to revoke device trust' });
  }
};

// Revoke all devices
export const revokeAllDevices = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const result = await prisma.trustedDevice.updateMany({
      where: { userId, isTrusted: true },
      data: {
        isTrusted: false,
        revokedAt: new Date(),
        revokedReason: 'user_revoked_all',
      },
    });

    res.json({
      message: 'All devices revoked',
      count: result.count,
    });
  } catch (error) {
    console.error('Error revoking all devices:', error);
    res.status(500).json({ error: 'Failed to revoke all devices' });
  }
};

// ============================================================================
// 8.1.8 LOGIN ANOMALY DETECTION
// ============================================================================

// Record login attempt
export const recordLoginAttempt = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      email,
      success,
      failureReason,
      ipAddress,
      userAgent,
      deviceFingerprint,
      location,
    } = req.body;

    // Calculate risk score and detect anomalies
    const { riskScore, isAnomaly, anomalyType, riskFactors } = await detectLoginAnomaly({
      userId,
      email,
      ipAddress,
      location,
    });

    const attempt = await prisma.loginAttempt.create({
      data: {
        userId,
        email,
        success,
        failureReason,
        ipAddress,
        userAgent,
        deviceFingerprint,
        country: location?.country,
        region: location?.region,
        city: location?.city,
        latitude: location?.latitude,
        longitude: location?.longitude,
        riskScore,
        riskFactors,
        isAnomaly,
        anomalyType,
        actionTaken: isAnomaly ? 'challenged' : 'allowed',
      },
    });

    res.status(201).json({
      id: attempt.id,
      riskScore,
      isAnomaly,
      anomalyType,
      actionRequired: isAnomaly ? 'verify_identity' : null,
    });
  } catch (error) {
    console.error('Error recording login attempt:', error);
    res.status(500).json({ error: 'Failed to record login attempt' });
  }
};

async function detectLoginAnomaly(data: {
  userId?: string;
  email: string;
  ipAddress: string;
  location?: any;
}): Promise<{
  riskScore: number;
  isAnomaly: boolean;
  anomalyType: string | null;
  riskFactors: string[];
}> {
  const riskFactors: string[] = [];
  let riskScore = 0;

  if (data.userId) {
    // Check for new location
    const recentAttempts = await prisma.loginAttempt.findMany({
      where: {
        userId: data.userId,
        success: true,
        createdAt: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      take: 10,
    });

    const knownCountries = new Set(recentAttempts.map(a => a.country));
    if (data.location?.country && !knownCountries.has(data.location.country)) {
      riskFactors.push('new_country');
      riskScore += 30;
    }

    // Check for impossible travel
    const lastAttempt = recentAttempts[0];
    if (lastAttempt && data.location?.latitude && lastAttempt.latitude) {
      const timeDiff = (Date.now() - lastAttempt.createdAt.getTime()) / 3600000; // hours
      const distance = calculateDistance(
        lastAttempt.latitude,
        lastAttempt.longitude || 0,
        data.location.latitude,
        data.location.longitude || 0
      );
      const speed = distance / timeDiff; // km/h

      if (speed > 1000) {
        riskFactors.push('impossible_travel');
        riskScore += 50;
      }
    }
  }

  // Check for suspicious IP patterns
  const recentFailures = await prisma.loginAttempt.count({
    where: {
      ipAddress: data.ipAddress,
      success: false,
      createdAt: { gt: new Date(Date.now() - 3600000) },
    },
  });

  if (recentFailures >= 5) {
    riskFactors.push('brute_force_suspected');
    riskScore += 40;
  }

  return {
    riskScore: Math.min(riskScore, 100),
    isAnomaly: riskScore >= 50,
    anomalyType: riskFactors.length > 0 ? riskFactors[0] : null,
    riskFactors,
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get login attempts
export const getLoginAttempts = async (req: Request, res: Response) => {
  try {
    const { userId, email, isAnomaly, startDate, endDate, limit = 50 } = req.query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (email) where.email = email;
    if (isAnomaly !== undefined) where.isAnomaly = isAnomaly === 'true';
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const attempts = await prisma.loginAttempt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(attempts);
  } catch (error) {
    console.error('Error getting login attempts:', error);
    res.status(500).json({ error: 'Failed to get login attempts' });
  }
};

// Get/Update anomaly detection config
export const getAnomalyConfig = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;

    const config = await prisma.loginAnomalyConfig.findFirst({
      where: {
        OR: [
          { organizationId: organizationId as string },
          { organizationId: null },
        ],
      },
      orderBy: { organizationId: 'desc' },
    });

    res.json(config || {
      enableAnomalyDetection: true,
      enableImpossibleTravel: true,
      enableNewLocationAlert: true,
      enableNewDeviceAlert: true,
      enableBruteForceDetect: true,
      anomalyAction: 'CHALLENGE',
    });
  } catch (error) {
    console.error('Error getting anomaly config:', error);
    res.status(500).json({ error: 'Failed to get anomaly config' });
  }
};

export const updateAnomalyConfig = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const { organizationId } = updates;

    const config = await prisma.loginAnomalyConfig.upsert({
      where: {
        organizationId: organizationId || 'global',
      },
      update: updates,
      create: updates,
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating anomaly config:', error);
    res.status(500).json({ error: 'Failed to update anomaly config' });
  }
};

// ============================================================================
// 8.1.9 API KEY MANAGEMENT
// ============================================================================

// Create API key
export const createAPIKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      name,
      description,
      scopes,
      allowedEndpoints,
      allowedIPs,
      rateLimit,
      rateLimitWindow,
      expiresAt,
      organizationId,
    } = req.body;

    // Generate API key
    const fullKey = 'kp_' + Array.from({ length: 32 }, () =>
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(
        Math.floor(Math.random() * 62)
      )
    ).join('');

    const apiKey = await prisma.aPIKey.create({
      data: {
        userId,
        organizationId,
        name,
        description,
        keyPrefix: fullKey.substring(0, 7),
        keyHash: fullKey, // In production, hash this
        lastFourChars: fullKey.slice(-4),
        scopes: scopes || [],
        allowedEndpoints: allowedEndpoints || [],
        allowedIPs: allowedIPs || [],
        rateLimit: rateLimit || 1000,
        rateLimitWindow: rateLimitWindow || 3600,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      key: fullKey, // Only shown once!
      keyPrefix: apiKey.keyPrefix,
      lastFourChars: apiKey.lastFourChars,
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt,
      warning: 'Store this key securely. It will not be shown again.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
};

// Get API keys
export const getAPIKeys = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { organizationId, isActive } = req.query;

    const where: any = { userId };
    if (organizationId) where.organizationId = organizationId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const keys = await prisma.aPIKey.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        keyPrefix: true,
        lastFourChars: true,
        scopes: true,
        allowedEndpoints: true,
        allowedIPs: true,
        rateLimit: true,
        isActive: true,
        expiresAt: true,
        lastUsedAt: true,
        lastUsedIP: true,
        totalRequests: true,
        createdAt: true,
        revokedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(keys);
  } catch (error) {
    console.error('Error getting API keys:', error);
    res.status(500).json({ error: 'Failed to get API keys' });
  }
};

// Update API key
export const updateAPIKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.keyHash;
    delete updates.keyPrefix;
    delete updates.lastFourChars;
    delete updates.userId;

    const key = await prisma.aPIKey.updateMany({
      where: { id, userId },
      data: updates,
    });

    if (key.count === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ message: 'API key updated' });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
};

// Revoke API key
export const revokeAPIKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    const key = await prisma.aPIKey.updateMany({
      where: { id, userId },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy: userId,
        revokedReason: reason || 'user_revoked',
      },
    });

    if (key.count === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ message: 'API key revoked' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
};

// Get API key usage
export const getAPIKeyUsage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const where: any = { apiKeyId: id };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const usage = await prisma.aPIKeyUsageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    // Aggregate stats
    const stats = await prisma.aPIKeyUsageLog.groupBy({
      by: ['endpoint'],
      where: { apiKeyId: id },
      _count: true,
      _avg: { responseTimeMs: true },
    });

    res.json({ usage, stats });
  } catch (error) {
    console.error('Error getting API key usage:', error);
    res.status(500).json({ error: 'Failed to get API key usage' });
  }
};

// ============================================================================
// 8.1.10 ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================================

// Create role
export const createRole = async (req: Request, res: Response) => {
  try {
    const {
      name,
      displayName,
      description,
      level,
      parentRoleId,
      organizationId,
    } = req.body;

    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description,
        level: level || 0,
        parentRoleId,
        organizationId,
      },
    });

    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// Get roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const { organizationId, isActive } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const roles = await prisma.role.findMany({
      where,
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { userRoles: true } },
      },
      orderBy: { level: 'desc' },
    });

    res.json(roles);
  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({ error: 'Failed to get roles' });
  }
};

// Update role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const role = await prisma.role.update({
      where: { id },
      data: updates,
    });

    res.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// Delete role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if role is in use
    const usersWithRole = await prisma.userRole.count({
      where: { roleId: id },
    });

    if (usersWithRole > 0) {
      return res.status(400).json({
        error: 'Cannot delete role that is assigned to users',
        usersCount: usersWithRole,
      });
    }

    await prisma.role.delete({
      where: { id },
    });

    res.json({ message: 'Role deleted' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};

// Create permission
export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name, displayName, description, category, resource, action } = req.body;

    const permission = await prisma.permission.create({
      data: {
        name,
        displayName,
        description,
        category,
        resource,
        action,
      },
    });

    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
};

// Get permissions
export const getPermissions = async (req: Request, res: Response) => {
  try {
    const { category, resource } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (resource) where.resource = resource;

    const permissions = await prisma.permission.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    res.json(permissions);
  } catch (error) {
    console.error('Error getting permissions:', error);
    res.status(500).json({ error: 'Failed to get permissions' });
  }
};

// Assign permission to role
export const assignPermissionToRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId, grantType, conditions } = req.body;

    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
        grantType: grantType || 'ALLOW',
        conditions,
      },
    });

    res.status(201).json(rolePermission);
  } catch (error) {
    console.error('Error assigning permission:', error);
    res.status(500).json({ error: 'Failed to assign permission' });
  }
};

// Remove permission from role
export const removePermissionFromRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId } = req.params;

    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });

    res.json({ message: 'Permission removed from role' });
  } catch (error) {
    console.error('Error removing permission:', error);
    res.status(500).json({ error: 'Failed to remove permission' });
  }
};

// Assign role to user
export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const assignerId = (req as any).user?.id;
    const { userId, roleId, organizationId, departmentId, expiresAt } = req.body;

    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
        organizationId,
        departmentId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        assignedBy: assignerId,
      },
    });

    res.status(201).json(userRole);
  } catch (error) {
    console.error('Error assigning role to user:', error);
    res.status(500).json({ error: 'Failed to assign role to user' });
  }
};

// Get user roles
export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const roles = await prisma.userRole.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    res.json(roles);
  } catch (error) {
    console.error('Error getting user roles:', error);
    res.status(500).json({ error: 'Failed to get user roles' });
  }
};

// Remove role from user
export const removeRoleFromUser = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.params;

    await prisma.userRole.deleteMany({
      where: { userId, roleId },
    });

    res.json({ message: 'Role removed from user' });
  } catch (error) {
    console.error('Error removing role from user:', error);
    res.status(500).json({ error: 'Failed to remove role from user' });
  }
};

// Check user permission
export const checkUserPermission = async (req: Request, res: Response) => {
  try {
    const { userId, permission, resourceId } = req.body;

    // Get user roles
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                permission: { name: permission },
              },
              include: { permission: true },
            },
          },
        },
      },
    });

    // Check user overrides
    const override = await prisma.userPermissionOverride.findFirst({
      where: {
        userId,
        permission: { name: permission },
        OR: [
          { resourceId: null },
          { resourceId },
        ],
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (override) {
      return res.json({
        allowed: override.grantType === 'ALLOW',
        source: 'user_override',
      });
    }

    // Check role permissions
    const hasPermission = userRoles.some(ur =>
      ur.role.permissions.some(p =>
        p.permission.name === permission && p.grantType === 'ALLOW'
      )
    );

    res.json({
      allowed: hasPermission,
      source: hasPermission ? 'role' : null,
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: 'Failed to check permission' });
  }
};

// ============================================================================
// 8.1.11 ATTRIBUTE-BASED ACCESS CONTROL (ABAC)
// ============================================================================

// Create ABAC policy
export const createABACPolicy = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      name,
      description,
      priority,
      targetResource,
      targetAction,
      conditions,
      effect,
      organizationId,
    } = req.body;

    const policy = await prisma.aBACPolicy.create({
      data: {
        name,
        description,
        priority: priority || 0,
        targetResource,
        targetAction,
        conditions,
        effect: effect || 'ALLOW',
        organizationId,
        createdBy: userId,
      },
    });

    res.status(201).json(policy);
  } catch (error) {
    console.error('Error creating ABAC policy:', error);
    res.status(500).json({ error: 'Failed to create ABAC policy' });
  }
};

// Get ABAC policies
export const getABACPolicies = async (req: Request, res: Response) => {
  try {
    const { organizationId, targetResource, isEnabled } = req.query;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (targetResource) where.targetResource = targetResource;
    if (isEnabled !== undefined) where.isEnabled = isEnabled === 'true';

    const policies = await prisma.aBACPolicy.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(policies);
  } catch (error) {
    console.error('Error getting ABAC policies:', error);
    res.status(500).json({ error: 'Failed to get ABAC policies' });
  }
};

// Update ABAC policy
export const updateABACPolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const policy = await prisma.aBACPolicy.update({
      where: { id },
      data: updates,
    });

    res.json(policy);
  } catch (error) {
    console.error('Error updating ABAC policy:', error);
    res.status(500).json({ error: 'Failed to update ABAC policy' });
  }
};

// Delete ABAC policy
export const deleteABACPolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.aBACPolicy.delete({
      where: { id },
    });

    res.json({ message: 'ABAC policy deleted' });
  } catch (error) {
    console.error('Error deleting ABAC policy:', error);
    res.status(500).json({ error: 'Failed to delete ABAC policy' });
  }
};

// Evaluate ABAC policy
export const evaluateABACPolicy = async (req: Request, res: Response) => {
  try {
    const { resource, action, context } = req.body;

    // Get applicable policies
    const policies = await prisma.aBACPolicy.findMany({
      where: {
        targetResource: resource,
        OR: [
          { targetAction: action },
          { targetAction: '*' },
          { targetAction: null },
        ],
        isEnabled: true,
      },
      orderBy: { priority: 'desc' },
    });

    // Evaluate policies in priority order
    for (const policy of policies) {
      const conditionsMet = evaluateConditions(policy.conditions as any, context);

      if (conditionsMet) {
        return res.json({
          allowed: policy.effect === 'ALLOW',
          matchedPolicy: policy.name,
          effect: policy.effect,
        });
      }
    }

    // No matching policy = deny by default
    res.json({
      allowed: false,
      matchedPolicy: null,
      reason: 'No matching policy found',
    });
  } catch (error) {
    console.error('Error evaluating ABAC policy:', error);
    res.status(500).json({ error: 'Failed to evaluate ABAC policy' });
  }
};

function evaluateConditions(conditions: any, context: any): boolean {
  if (!conditions) return true;

  if (conditions.all) {
    return conditions.all.every((c: any) => evaluateCondition(c, context));
  }
  if (conditions.any) {
    return conditions.any.some((c: any) => evaluateCondition(c, context));
  }
  if (conditions.none) {
    return !conditions.none.some((c: any) => evaluateCondition(c, context));
  }

  return evaluateCondition(conditions, context);
}

function evaluateCondition(condition: any, context: any): boolean {
  const { attribute, operator, value } = condition;
  const actualValue = getNestedValue(context, attribute);

  switch (operator) {
    case 'eq': return actualValue === value;
    case 'neq': return actualValue !== value;
    case 'gt': return actualValue > value;
    case 'gte': return actualValue >= value;
    case 'lt': return actualValue < value;
    case 'lte': return actualValue <= value;
    case 'in': return Array.isArray(value) && value.includes(actualValue);
    case 'contains': return String(actualValue).includes(value);
    case 'between': return actualValue >= value[0] && actualValue <= value[1];
    default: return false;
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

// ABAC attribute definitions
export const createABACAttribute = async (req: Request, res: Response) => {
  try {
    const { name, displayName, description, category, dataType, source, sourcePath, allowedValues } = req.body;

    const attribute = await prisma.aBACAttribute.create({
      data: {
        name,
        displayName,
        description,
        category,
        dataType,
        source,
        sourcePath,
        allowedValues,
      },
    });

    res.status(201).json(attribute);
  } catch (error) {
    console.error('Error creating ABAC attribute:', error);
    res.status(500).json({ error: 'Failed to create ABAC attribute' });
  }
};

export const getABACAttributes = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const where: any = {};
    if (category) where.category = category;

    const attributes = await prisma.aBACAttribute.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    res.json(attributes);
  } catch (error) {
    console.error('Error getting ABAC attributes:', error);
    res.status(500).json({ error: 'Failed to get ABAC attributes' });
  }
};

// ============================================================================
// SECURITY AUDIT LOGS
// ============================================================================

// Create audit log entry
export const createAuditLog = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      eventType,
      eventCategory,
      eventAction,
      description,
      details,
      targetType,
      targetId,
      ipAddress,
      userAgent,
      sessionId,
      riskLevel,
    } = req.body;

    const log = await prisma.securityAuditLog.create({
      data: {
        userId,
        eventType,
        eventCategory,
        eventAction,
        description,
        details,
        targetType,
        targetId,
        ipAddress,
        userAgent,
        sessionId,
        riskLevel: riskLevel || 'LOW',
      },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
};

// Get audit logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      eventType,
      eventCategory,
      riskLevel,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = req.query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (eventType) where.eventType = eventType;
    if (eventCategory) where.eventCategory = eventCategory;
    if (riskLevel) where.riskLevel = riskLevel;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [logs, total] = await Promise.all([
      prisma.securityAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.securityAuditLog.count({ where }),
    ]);

    res.json({ logs, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
};

// Get security stats
export const getSecurityStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers2FA,
      activeSessionsCount,
      loginAttempts24h,
      anomalies24h,
      activeAPIKeys,
      rolesCount,
      permissionsCount,
      highRiskLogs,
    ] = await Promise.all([
      prisma.twoFactorAuth.count({ where: { enabled: true } }),
      prisma.userSession.count({ where: { isActive: true, expiresAt: { gt: now } } }),
      prisma.loginAttempt.count({ where: { createdAt: { gte: last24h } } }),
      prisma.loginAttempt.count({ where: { isAnomaly: true, createdAt: { gte: last24h } } }),
      prisma.aPIKey.count({ where: { isActive: true } }),
      prisma.role.count({ where: { isActive: true } }),
      prisma.permission.count(),
      prisma.securityAuditLog.count({ where: { riskLevel: 'HIGH', createdAt: { gte: last7d } } }),
    ]);

    res.json({
      twoFactorAuth: {
        enabledUsers: totalUsers2FA,
      },
      sessions: {
        active: activeSessionsCount,
      },
      loginAttempts: {
        last24h: loginAttempts24h,
        anomalies24h,
      },
      apiKeys: {
        active: activeAPIKeys,
      },
      rbac: {
        roles: rolesCount,
        permissions: permissionsCount,
      },
      auditLogs: {
        highRiskLast7d: highRiskLogs,
      },
    });
  } catch (error) {
    console.error('Error getting security stats:', error);
    res.status(500).json({ error: 'Failed to get security stats' });
  }
};
