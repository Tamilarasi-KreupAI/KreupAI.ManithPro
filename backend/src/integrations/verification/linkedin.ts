/**
 * LinkedIn Verification Integration
 *
 * Verifies candidate profiles against LinkedIn data
 * Supports OAuth flow and profile comparison
 */

import axios, { AxiosInstance } from 'axios';

// Types
export interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface LinkedInTokens {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  headline?: string;
  vanityName?: string;
  publicProfileUrl?: string;
}

export interface LinkedInPosition {
  title: string;
  companyName: string;
  companyId?: string;
  startDate: { year: number; month?: number };
  endDate?: { year: number; month?: number };
  current: boolean;
  description?: string;
  location?: string;
}

export interface LinkedInEducation {
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: { year: number };
  endDate?: { year: number };
}

export interface LinkedInFullProfile extends LinkedInProfile {
  positions: LinkedInPosition[];
  educations: LinkedInEducation[];
  skills: string[];
}

export interface VerificationResult {
  verified: boolean;
  matchScore: number; // 0-100
  discrepancies: string[];
  linkedInProfile?: LinkedInFullProfile;
  verifiedAt: Date;
}

class LinkedInService {
  private client: AxiosInstance;
  private config: LinkedInConfig;

  constructor(config: LinkedInConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://api.linkedin.com/v2',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string, scopes?: string[]): string {
    const defaultScopes = ['openid', 'profile', 'email', 'w_member_social'];
    const scopeString = (scopes || defaultScopes).join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
      scope: scopeString,
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<LinkedInTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    });

    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
      refreshToken: response.data.refresh_token,
      refreshTokenExpiresIn: response.data.refresh_token_expires_in,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<LinkedInTokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
      refreshToken: response.data.refresh_token,
      refreshTokenExpiresIn: response.data.refresh_token_expires_in,
    };
  }

  /**
   * Get basic profile information
   */
  async getProfile(accessToken: string): Promise<LinkedInProfile> {
    this.setAccessToken(accessToken);

    // Get basic profile using OpenID Connect
    const profileResponse = await this.client.get('/userinfo');

    return {
      id: profileResponse.data.sub,
      firstName: profileResponse.data.given_name,
      lastName: profileResponse.data.family_name,
      email: profileResponse.data.email,
      profilePicture: profileResponse.data.picture,
    };
  }

  /**
   * Get full profile with positions and education
   * Note: Requires appropriate LinkedIn API permissions
   */
  async getFullProfile(accessToken: string): Promise<LinkedInFullProfile> {
    this.setAccessToken(accessToken);

    const basicProfile = await this.getProfile(accessToken);

    // Get positions (work experience)
    let positions: LinkedInPosition[] = [];
    try {
      const positionsResponse = await this.client.get('/me', {
        params: {
          projection: '(positions)',
        },
      });
      positions = this.parsePositions(positionsResponse.data.positions?.values || []);
    } catch (error) {
      console.warn('Could not fetch LinkedIn positions:', error);
    }

    // Get educations
    let educations: LinkedInEducation[] = [];
    try {
      const educationsResponse = await this.client.get('/me', {
        params: {
          projection: '(educations)',
        },
      });
      educations = this.parseEducations(educationsResponse.data.educations?.values || []);
    } catch (error) {
      console.warn('Could not fetch LinkedIn educations:', error);
    }

    // Get skills
    let skills: string[] = [];
    try {
      const skillsResponse = await this.client.get('/me', {
        params: {
          projection: '(skills)',
        },
      });
      skills = (skillsResponse.data.skills?.values || []).map((s: any) => s.name);
    } catch (error) {
      console.warn('Could not fetch LinkedIn skills:', error);
    }

    return {
      ...basicProfile,
      positions,
      educations,
      skills,
    };
  }

  /**
   * Verify candidate profile against LinkedIn data
   */
  async verifyProfile(
    accessToken: string,
    candidateData: {
      firstName: string;
      lastName: string;
      email?: string;
      workHistory?: Array<{
        title: string;
        company: string;
        startDate: Date;
        endDate?: Date;
        current?: boolean;
      }>;
      education?: Array<{
        school: string;
        degree?: string;
        fieldOfStudy?: string;
        graduationYear?: number;
      }>;
    }
  ): Promise<VerificationResult> {
    const linkedInProfile = await this.getFullProfile(accessToken);
    const discrepancies: string[] = [];
    let matchScore = 100;

    // Verify name
    const nameMatch =
      this.normalizeString(candidateData.firstName) === this.normalizeString(linkedInProfile.firstName) &&
      this.normalizeString(candidateData.lastName) === this.normalizeString(linkedInProfile.lastName);

    if (!nameMatch) {
      discrepancies.push(`Name mismatch: ${candidateData.firstName} ${candidateData.lastName} vs ${linkedInProfile.firstName} ${linkedInProfile.lastName}`);
      matchScore -= 20;
    }

    // Verify email (if available)
    if (candidateData.email && linkedInProfile.email) {
      if (candidateData.email.toLowerCase() !== linkedInProfile.email.toLowerCase()) {
        discrepancies.push(`Email mismatch: ${candidateData.email} vs ${linkedInProfile.email}`);
        matchScore -= 10;
      }
    }

    // Verify work history
    if (candidateData.workHistory?.length && linkedInProfile.positions.length) {
      const workDiscrepancies = this.compareWorkHistory(candidateData.workHistory, linkedInProfile.positions);
      discrepancies.push(...workDiscrepancies);
      matchScore -= workDiscrepancies.length * 10;
    }

    // Verify education
    if (candidateData.education?.length && linkedInProfile.educations.length) {
      const eduDiscrepancies = this.compareEducation(candidateData.education, linkedInProfile.educations);
      discrepancies.push(...eduDiscrepancies);
      matchScore -= eduDiscrepancies.length * 5;
    }

    return {
      verified: matchScore >= 70,
      matchScore: Math.max(0, matchScore),
      discrepancies,
      linkedInProfile,
      verifiedAt: new Date(),
    };
  }

  private setAccessToken(accessToken: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  private normalizeString(str: string): string {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private parsePositions(positions: any[]): LinkedInPosition[] {
    return positions.map(p => ({
      title: p.title,
      companyName: p.company?.name || '',
      companyId: p.company?.id,
      startDate: p.startDate || { year: 0 },
      endDate: p.endDate,
      current: p.isCurrent || !p.endDate,
      description: p.description,
      location: p.location?.name,
    }));
  }

  private parseEducations(educations: any[]): LinkedInEducation[] {
    return educations.map(e => ({
      schoolName: e.school?.name || e.schoolName || '',
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      startDate: e.startDate,
      endDate: e.endDate,
    }));
  }

  private compareWorkHistory(
    candidateWork: Array<{ title: string; company: string; startDate: Date; endDate?: Date }>,
    linkedInPositions: LinkedInPosition[]
  ): string[] {
    const discrepancies: string[] = [];

    for (const work of candidateWork) {
      const matchingPosition = linkedInPositions.find(
        p =>
          this.normalizeString(p.companyName).includes(this.normalizeString(work.company)) ||
          this.normalizeString(work.company).includes(this.normalizeString(p.companyName))
      );

      if (!matchingPosition) {
        discrepancies.push(`Work experience at "${work.company}" not found on LinkedIn`);
      } else {
        // Check title similarity
        if (!this.isSimilar(work.title, matchingPosition.title)) {
          discrepancies.push(`Title mismatch at ${work.company}: "${work.title}" vs "${matchingPosition.title}"`);
        }

        // Check dates (allow 1 month variance)
        const candidateStartYear = work.startDate.getFullYear();
        const linkedInStartYear = matchingPosition.startDate.year;
        if (Math.abs(candidateStartYear - linkedInStartYear) > 1) {
          discrepancies.push(`Start date mismatch at ${work.company}: ${candidateStartYear} vs ${linkedInStartYear}`);
        }
      }
    }

    return discrepancies;
  }

  private compareEducation(
    candidateEdu: Array<{ school: string; degree?: string; fieldOfStudy?: string; graduationYear?: number }>,
    linkedInEdu: LinkedInEducation[]
  ): string[] {
    const discrepancies: string[] = [];

    for (const edu of candidateEdu) {
      const matchingEdu = linkedInEdu.find(
        e =>
          this.normalizeString(e.schoolName).includes(this.normalizeString(edu.school)) ||
          this.normalizeString(edu.school).includes(this.normalizeString(e.schoolName))
      );

      if (!matchingEdu) {
        discrepancies.push(`Education at "${edu.school}" not found on LinkedIn`);
      }
    }

    return discrepancies;
  }

  private isSimilar(str1: string, str2: string): boolean {
    const normalized1 = this.normalizeString(str1);
    const normalized2 = this.normalizeString(str2);
    return normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }
}

// Singleton instance
let linkedInInstance: LinkedInService | null = null;

export function initLinkedIn(config: LinkedInConfig): LinkedInService {
  linkedInInstance = new LinkedInService(config);
  return linkedInInstance;
}

export function getLinkedIn(): LinkedInService {
  if (!linkedInInstance) {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('LinkedIn configuration is incomplete');
    }

    linkedInInstance = new LinkedInService({ clientId, clientSecret, redirectUri });
  }
  return linkedInInstance;
}

export default LinkedInService;
