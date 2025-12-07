// ============================================================
// OAUTH PROVIDERS - Provider-specific OAuth implementations
// ============================================================

import { OAuthService, OAUTH_CONFIGS } from './OAuthService';
import { registerIntegration } from '../base';
import type { IntegrationConfig, OAuthUserInfo, OAuthConfig } from '../types';

// ============================================
// Environment Configuration
// ============================================
const getEnvConfig = () => ({
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  linkedinClientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
  microsoftClientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/auth/callback`,
});

// ============================================
// Google OAuth Provider
// ============================================
export class GoogleOAuthService extends OAuthService {
  constructor(config?: Partial<IntegrationConfig>) {
    const envConfig = getEnvConfig();
    const oauthConfig: OAuthConfig = {
      ...OAUTH_CONFIGS.google,
      clientId: envConfig.googleClientId,
      redirectUri: envConfig.redirectUri,
    };

    super(
      {
        id: 'google',
        name: 'Google',
        description: 'Sign in with Google and access Google Calendar',
        icon: 'google',
        ...config,
      },
      oauthConfig
    );
  }

  protected mapUserInfo(data: Record<string, unknown>): OAuthUserInfo {
    return {
      id: String(data.id || data.sub || ''),
      email: String(data.email || ''),
      name: String(data.name || ''),
      picture: String(data.picture || ''),
      provider: 'google',
      raw: data,
    };
  }
}

// ============================================
// GitHub OAuth Provider
// ============================================
export class GitHubOAuthService extends OAuthService {
  constructor(config?: Partial<IntegrationConfig>) {
    const envConfig = getEnvConfig();
    const oauthConfig: OAuthConfig = {
      ...OAUTH_CONFIGS.github,
      clientId: envConfig.githubClientId,
      redirectUri: envConfig.redirectUri,
    };

    super(
      {
        id: 'github',
        name: 'GitHub',
        description: 'Sign in with GitHub',
        icon: 'github',
        ...config,
      },
      oauthConfig
    );
  }

  protected mapUserInfo(data: Record<string, unknown>): OAuthUserInfo {
    return {
      id: String(data.id || ''),
      email: String(data.email || ''),
      name: String(data.name || data.login || ''),
      picture: String(data.avatar_url || ''),
      provider: 'github',
      raw: data,
    };
  }

  // GitHub-specific: Get user's emails
  async getEmails(): Promise<Array<{ email: string; primary: boolean; verified: boolean }>> {
    if (!this.isConnected()) {
      throw this.createError('NOT_CONNECTED', 'Not connected to GitHub', false);
    }

    return this.request('/oauth/github/emails');
  }

  // GitHub-specific: Get user's repositories
  async getRepositories(): Promise<
    Array<{
      id: number;
      name: string;
      full_name: string;
      private: boolean;
      html_url: string;
    }>
  > {
    if (!this.isConnected()) {
      throw this.createError('NOT_CONNECTED', 'Not connected to GitHub', false);
    }

    return this.request('/oauth/github/repos');
  }
}

// ============================================
// LinkedIn OAuth Provider
// ============================================
export class LinkedInOAuthService extends OAuthService {
  constructor(config?: Partial<IntegrationConfig>) {
    const envConfig = getEnvConfig();
    const oauthConfig: OAuthConfig = {
      ...OAUTH_CONFIGS.linkedin,
      clientId: envConfig.linkedinClientId,
      redirectUri: envConfig.redirectUri,
    };

    super(
      {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Sign in with LinkedIn and import profile',
        icon: 'linkedin',
        ...config,
      },
      oauthConfig
    );
  }

  protected mapUserInfo(data: Record<string, unknown>): OAuthUserInfo {
    const firstName = (data.firstName as Record<string, unknown>)?.localized?.en_US as string || '';
    const lastName = (data.lastName as Record<string, unknown>)?.localized?.en_US as string || '';

    return {
      id: String(data.id || ''),
      email: '', // LinkedIn requires separate API call for email
      name: `${firstName} ${lastName}`.trim(),
      picture: (data.profilePicture as Record<string, unknown>)?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier as string || '',
      provider: 'linkedin',
      raw: data,
    };
  }

  // LinkedIn-specific: Get user's email (requires separate API call)
  async getEmail(): Promise<string> {
    if (!this.isConnected()) {
      throw this.createError('NOT_CONNECTED', 'Not connected to LinkedIn', false);
    }

    const response = await this.request<{
      elements: Array<{ 'handle~': { emailAddress: string } }>;
    }>('/oauth/linkedin/email');

    return response.elements?.[0]?.['handle~']?.emailAddress || '';
  }

  // LinkedIn-specific: Get user's profile with additional fields
  async getFullProfile(): Promise<Record<string, unknown>> {
    if (!this.isConnected()) {
      throw this.createError('NOT_CONNECTED', 'Not connected to LinkedIn', false);
    }

    return this.request('/oauth/linkedin/profile');
  }
}

// ============================================
// Microsoft OAuth Provider
// ============================================
export class MicrosoftOAuthService extends OAuthService {
  constructor(config?: Partial<IntegrationConfig>) {
    const envConfig = getEnvConfig();
    const oauthConfig: OAuthConfig = {
      ...OAUTH_CONFIGS.microsoft,
      clientId: envConfig.microsoftClientId,
      redirectUri: envConfig.redirectUri,
    };

    super(
      {
        id: 'microsoft',
        name: 'Microsoft',
        description: 'Sign in with Microsoft and access Outlook Calendar',
        icon: 'microsoft',
        ...config,
      },
      oauthConfig
    );
  }

  protected mapUserInfo(data: Record<string, unknown>): OAuthUserInfo {
    return {
      id: String(data.id || ''),
      email: String(data.mail || data.userPrincipalName || ''),
      name: String(data.displayName || ''),
      picture: '', // Microsoft requires separate API call for photo
      provider: 'microsoft',
      raw: data,
    };
  }

  // Microsoft-specific: Get user's profile photo
  async getProfilePhoto(): Promise<string | null> {
    if (!this.isConnected()) {
      throw this.createError('NOT_CONNECTED', 'Not connected to Microsoft', false);
    }

    try {
      const response = await this.request<{ photoUrl: string }>('/oauth/microsoft/photo');
      return response.photoUrl;
    } catch {
      return null;
    }
  }
}

// ============================================
// Register Providers
// ============================================
registerIntegration('google', GoogleOAuthService);
registerIntegration('github', GitHubOAuthService);
registerIntegration('linkedin', LinkedInOAuthService);
registerIntegration('microsoft', MicrosoftOAuthService);

// ============================================
// Export
// ============================================
export const oauthProviders = {
  google: GoogleOAuthService,
  github: GitHubOAuthService,
  linkedin: LinkedInOAuthService,
  microsoft: MicrosoftOAuthService,
};

export default oauthProviders;
