/**
 * Verification Service
 * Handles email and phone verification for user trust and social proof
 */

export type VerificationType = 'EMAIL' | 'PHONE' | 'LINKEDIN' | 'GITHUB' | 'IDENTITY';

export interface VerificationStatus {
  type: VerificationType;
  isVerified: boolean;
  verifiedAt?: Date;
  expiresAt?: Date;
}

export interface UserVerifications {
  userId: string;
  email: VerificationStatus;
  phone: VerificationStatus;
  linkedin?: VerificationStatus;
  github?: VerificationStatus;
  identity?: VerificationStatus;
  trustScore: number; // 0-100
  lastUpdated: Date;
}

class VerificationService {
  private static instance: VerificationService;
  private verificationsCache: Map<string, UserVerifications> = new Map();

  private constructor() {}

  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  /**
   * Send email verification code
   */
  async sendEmailVerification(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/verification/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || 'Verification email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send verification email',
      };
    }
  }

  /**
   * Verify email with code
   */
  async verifyEmail(code: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/verification/email/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update cache
        this.invalidateCache(data.userId);
      }

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Email verified successfully' : 'Invalid verification code'),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify email',
      };
    }
  }

  /**
   * Send phone verification code via SMS
   */
  async sendPhoneVerification(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/verification/phone/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || 'Verification code sent via SMS',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send verification code',
      };
    }
  }

  /**
   * Verify phone with code
   */
  async verifyPhone(code: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/verification/phone/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update cache
        this.invalidateCache(data.userId);
      }

      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Phone verified successfully' : 'Invalid verification code'),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify phone',
      };
    }
  }

  /**
   * Get user verification status
   */
  async getUserVerifications(userId: string): Promise<UserVerifications | null> {
    // Check cache first
    if (this.verificationsCache.has(userId)) {
      return this.verificationsCache.get(userId)!;
    }

    try {
      const response = await fetch(`/api/verification/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const verifications: UserVerifications = {
        userId: data.userId,
        email: {
          type: 'EMAIL',
          isVerified: data.emailVerified,
          verifiedAt: data.emailVerifiedAt ? new Date(data.emailVerifiedAt) : undefined,
        },
        phone: {
          type: 'PHONE',
          isVerified: data.phoneVerified,
          verifiedAt: data.phoneVerifiedAt ? new Date(data.phoneVerifiedAt) : undefined,
        },
        linkedin: data.linkedinVerified ? {
          type: 'LINKEDIN',
          isVerified: true,
          verifiedAt: new Date(data.linkedinVerifiedAt),
        } : undefined,
        github: data.githubVerified ? {
          type: 'GITHUB',
          isVerified: true,
          verifiedAt: new Date(data.githubVerifiedAt),
        } : undefined,
        identity: data.identityVerified ? {
          type: 'IDENTITY',
          isVerified: true,
          verifiedAt: new Date(data.identityVerifiedAt),
        } : undefined,
        trustScore: this.calculateTrustScore(data),
        lastUpdated: new Date(),
      };

      // Cache the result
      this.verificationsCache.set(userId, verifications);

      return verifications;
    } catch (error) {
      console.error('Failed to fetch user verifications:', error);
      return null;
    }
  }

  /**
   * Calculate trust score based on verifications
   */
  private calculateTrustScore(data: any): number {
    let score = 0;

    // Email verification: 20 points
    if (data.emailVerified) score += 20;

    // Phone verification: 20 points
    if (data.phoneVerified) score += 20;

    // LinkedIn verification: 15 points
    if (data.linkedinVerified) score += 15;

    // GitHub verification: 15 points
    if (data.githubVerified) score += 15;

    // Identity verification: 30 points
    if (data.identityVerified) score += 30;

    return score;
  }

  /**
   * Initiate LinkedIn OAuth verification
   */
  async verifyLinkedIn(): Promise<{ authUrl: string }> {
    try {
      const response = await fetch('/api/verification/linkedin/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      return { authUrl: data.authUrl };
    } catch (error) {
      throw new Error('Failed to initiate LinkedIn verification');
    }
  }

  /**
   * Initiate GitHub OAuth verification
   */
  async verifyGitHub(): Promise<{ authUrl: string }> {
    try {
      const response = await fetch('/api/verification/github/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      return { authUrl: data.authUrl };
    } catch (error) {
      throw new Error('Failed to initiate GitHub verification');
    }
  }

  /**
   * Clear cache for a user
   */
  private invalidateCache(userId: string): void {
    this.verificationsCache.delete(userId);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.verificationsCache.clear();
  }
}

export const verificationService = VerificationService.getInstance();
