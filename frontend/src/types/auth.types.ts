// ============================================================
// AUTH TYPES - Authentication, sessions, and user types
// ============================================================

import { UserRole, TimestampedRecord } from './common.types';

// User Interface
export interface User extends TimestampedRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
  education?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
}

// Auth Response
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Session
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  lastActiveAt: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  isValid: boolean;
}

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Register Request
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

// Password Reset Request
export interface PasswordResetRequest {
  email: string;
}

// Password Reset Confirm
export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

// Change Password Request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Two-Factor Authentication
export interface TwoFactorAuth {
  id: string;
  userId: string;
  isEnabled: boolean;
  method: 'totp' | 'sms' | 'email';
  phoneNumber?: string;
  backupCodes?: string[];
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// TwoFactorSetup
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// TwoFactorVerify
export interface TwoFactorVerifyRequest {
  code: string;
  method?: 'totp' | 'backup';
}

// SSO Configuration
export interface SSOConfig {
  id: string;
  provider: 'google' | 'microsoft' | 'okta' | 'saml';
  clientId: string;
  tenantId?: string;
  domain?: string;
  isEnabled: boolean;
  autoProvision: boolean;
  defaultRole?: UserRole;
  allowedDomains: string[];
  metadata?: Record<string, unknown>;
}

// Password Policy
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // number of previous passwords to check
  lockoutThreshold: number;
  lockoutDuration: number; // minutes
}

// Session Settings
export interface SessionSettings {
  maxSessions: number;
  sessionTimeout: number; // minutes
  extendOnActivity: boolean;
  requireReauthFor: string[];
  trustedDevicesEnabled: boolean;
  ipWhitelistEnabled: boolean;
}

// Trusted Device
export interface TrustedDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
  isTrusted: boolean;
}

// IP Whitelist Entry
export interface IPWhitelistEntry {
  id: string;
  organizationId?: string;
  userId?: string;
  ipAddress: string;
  ipRange?: string;
  label?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

// Login Anomaly
export interface LoginAnomaly {
  id: string;
  userId: string;
  sessionId?: string;
  anomalyType: 'unusual_location' | 'unusual_device' | 'unusual_time' | 'impossible_travel' | 'multiple_failures';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  ipAddress: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  actionTaken?: string;
  createdAt: string;
}

// API Key
export interface APIKey {
  id: string;
  userId?: string;
  organizationId?: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  scopes: string[];
  rateLimit?: number;
  rateLimitWindow?: number;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}
