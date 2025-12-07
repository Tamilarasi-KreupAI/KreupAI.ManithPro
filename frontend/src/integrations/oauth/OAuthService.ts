// ============================================================
// OAUTH SERVICE - OAuth 2.0 authentication service
// ============================================================

import { BaseIntegrationService, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  OAuthConfig,
  OAuthTokens,
  OAuthUserInfo,
  OAuthProvider,
  IntegrationError,
} from '../types';

// ============================================
// OAuth Service
// ============================================
export class OAuthService extends BaseIntegrationService {
  protected oauthConfig: OAuthConfig;
  protected tokens: OAuthTokens | null = null;
  protected userInfo: OAuthUserInfo | null = null;
  private tokenRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    config: Partial<IntegrationConfig>,
    oauthConfig: OAuthConfig
  ) {
    super({
      ...config,
      category: 'oauth',
    });
    this.oauthConfig = oauthConfig;
  }

  // ============================================
  // Connection Methods
  // ============================================

  async connect(): Promise<void> {
    try {
      // Build authorization URL
      const authUrl = this.buildAuthorizationUrl();

      // Open popup for OAuth flow
      const popup = this.openAuthPopup(authUrl);

      // Wait for callback
      const code = await this.waitForAuthCode(popup);

      // Exchange code for tokens
      this.tokens = await this.exchangeCodeForTokens(code);

      // Get user info
      if (this.oauthConfig.userInfoUrl) {
        this.userInfo = await this.fetchUserInfo();
      }

      // Schedule token refresh
      this.scheduleTokenRefresh();

      // Update status
      this.setStatus('connected');
      this.config.connectedAt = new Date();

      // Emit event
      integrationEvents.emit('connected', {
        integrationId: this.config.id,
        status: 'connected',
      });
    } catch (error) {
      this.setStatus('error');
      const integrationError = error as IntegrationError;
      integrationEvents.emit('error', {
        integrationId: this.config.id,
        status: 'error',
        error: integrationError,
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Revoke tokens if possible
      if (this.tokens?.accessToken) {
        await this.revokeTokens();
      }

      // Clear state
      this.tokens = null;
      this.userInfo = null;
      this.clearTokenRefreshTimeout();

      // Update status
      this.setStatus('disconnected');

      // Emit event
      integrationEvents.emit('disconnected', {
        integrationId: this.config.id,
        status: 'disconnected',
      });
    } catch (error) {
      // Still disconnect locally even if revoke fails
      this.tokens = null;
      this.userInfo = null;
      this.setStatus('disconnected');
      throw error;
    }
  }

  isConnected(): boolean {
    return (
      this.config.status === 'connected' &&
      this.tokens !== null &&
      new Date() < this.tokens.expiresAt
    );
  }

  async refresh(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      throw this.createError(
        'NO_REFRESH_TOKEN',
        'No refresh token available',
        false
      );
    }

    try {
      const newTokens = await this.refreshAccessToken();
      this.tokens = newTokens;
      this.scheduleTokenRefresh();

      integrationEvents.emit('refreshed', {
        integrationId: this.config.id,
        status: 'connected',
      });
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  // ============================================
  // Token Management
  // ============================================

  getAccessToken(): string | null {
    if (!this.isConnected()) return null;
    return this.tokens?.accessToken ?? null;
  }

  getTokens(): OAuthTokens | null {
    return this.tokens ? { ...this.tokens } : null;
  }

  getUserInfo(): OAuthUserInfo | null {
    return this.userInfo ? { ...this.userInfo } : null;
  }

  // ============================================
  // Private Methods
  // ============================================

  private buildAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.oauthConfig.clientId,
      redirect_uri: this.oauthConfig.redirectUri,
      response_type: 'code',
      scope: this.oauthConfig.scopes.join(' '),
      state: this.generateState(),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${this.oauthConfig.authorizationUrl}?${params.toString()}`;
  }

  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const state = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');
    sessionStorage.setItem('oauth_state', state);
    return state;
  }

  private openAuthPopup(url: string): Window {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    if (!popup) {
      throw this.createError(
        'POPUP_BLOCKED',
        'Please allow popups for this site',
        true
      );
    }

    return popup;
  }

  private waitForAuthCode(popup: Window): Promise<string> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkInterval);
            reject(
              this.createError(
                'POPUP_CLOSED',
                'Authentication cancelled',
                true
              )
            );
            return;
          }

          // Check if we're back to our domain
          if (
            popup.location.origin === window.location.origin &&
            popup.location.pathname === '/auth/callback'
          ) {
            clearInterval(checkInterval);

            const params = new URLSearchParams(popup.location.search);
            const code = params.get('code');
            const state = params.get('state');
            const error = params.get('error');

            popup.close();

            if (error) {
              reject(
                this.createError(
                  'OAUTH_ERROR',
                  params.get('error_description') || error,
                  true
                )
              );
              return;
            }

            // Verify state
            const storedState = sessionStorage.getItem('oauth_state');
            sessionStorage.removeItem('oauth_state');

            if (state !== storedState) {
              reject(
                this.createError(
                  'STATE_MISMATCH',
                  'Invalid OAuth state',
                  false
                )
              );
              return;
            }

            if (!code) {
              reject(
                this.createError(
                  'NO_CODE',
                  'No authorization code received',
                  true
                )
              );
              return;
            }

            resolve(code);
          }
        } catch {
          // Cross-origin errors are expected while on OAuth provider's domain
        }
      }, 500);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!popup.closed) popup.close();
        reject(
          this.createError(
            'TIMEOUT',
            'Authentication timed out',
            true
          )
        );
      }, 5 * 60 * 1000);
    });
  }

  private async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    const response = await this.request<{
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
      scope?: string;
    }>(`/oauth/${this.config.id}/token`, {
      method: 'POST',
      body: JSON.stringify({
        code,
        redirect_uri: this.oauthConfig.redirectUri,
      }),
    });

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      expiresAt: new Date(Date.now() + response.expires_in * 1000),
      tokenType: response.token_type,
      scope: response.scope,
    };
  }

  private async refreshAccessToken(): Promise<OAuthTokens> {
    const response = await this.request<{
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
      scope?: string;
    }>(`/oauth/${this.config.id}/refresh`, {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: this.tokens?.refreshToken,
      }),
    });

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token || this.tokens?.refreshToken,
      expiresIn: response.expires_in,
      expiresAt: new Date(Date.now() + response.expires_in * 1000),
      tokenType: response.token_type,
      scope: response.scope,
    };
  }

  private async fetchUserInfo(): Promise<OAuthUserInfo> {
    const response = await this.request<Record<string, unknown>>(
      `/oauth/${this.config.id}/userinfo`
    );

    // Map provider-specific response to standard format
    return this.mapUserInfo(response);
  }

  protected mapUserInfo(data: Record<string, unknown>): OAuthUserInfo {
    // Override in provider-specific implementations
    return {
      id: String(data.id || data.sub || ''),
      email: String(data.email || ''),
      name: String(data.name || ''),
      picture: data.picture as string | undefined,
      provider: this.config.id,
      raw: data,
    };
  }

  private async revokeTokens(): Promise<void> {
    await this.request(`/oauth/${this.config.id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({
        token: this.tokens?.accessToken,
      }),
    });
  }

  private scheduleTokenRefresh(): void {
    this.clearTokenRefreshTimeout();

    if (!this.tokens) return;

    // Refresh 5 minutes before expiry
    const refreshAt = this.tokens.expiresAt.getTime() - 5 * 60 * 1000;
    const delay = refreshAt - Date.now();

    if (delay > 0) {
      this.tokenRefreshTimeout = setTimeout(() => {
        this.refresh().catch((error) => {
          console.error('Token refresh failed:', error);
        });
      }, delay);
    }
  }

  private clearTokenRefreshTimeout(): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
  }
}

// ============================================
// OAuth Provider Configs
// ============================================
export const OAUTH_CONFIGS: Record<OAuthProvider, Omit<OAuthConfig, 'clientId' | 'clientSecret' | 'redirectUri'>> = {
  google: {
    scopes: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  },
  github: {
    scopes: ['user:email', 'read:user'],
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
  },
  linkedin: {
    scopes: ['r_liteprofile', 'r_emailaddress'],
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/me',
  },
  microsoft: {
    scopes: [
      'openid',
      'email',
      'profile',
      'offline_access',
      'Calendars.ReadWrite',
      'User.Read',
    ],
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
  },
};

export default OAuthService;
