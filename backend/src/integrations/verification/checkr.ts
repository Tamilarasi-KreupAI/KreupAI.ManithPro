// @ts-nocheck
/**
 * Checkr Background Check Integration
 *
 * Production-ready integration with Checkr for background screening
 * Supports candidate creation, report ordering, and webhook handling
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

// Types
export interface CheckrConfig {
  apiKey: string;
  webhookSecret?: string;
  sandbox?: boolean;
}

export interface CheckrCandidate {
  id?: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  phone?: string;
  dob?: string; // YYYY-MM-DD
  ssn?: string;
  driver_license_number?: string;
  driver_license_state?: string;
  zipcode?: string;
  copy_requested?: boolean;
  custom_id?: string;
}

export interface CheckrAddress {
  addressable_id?: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipcode: string;
  country?: string;
}

export type CheckrPackage =
  | 'tasker_standard'
  | 'tasker_pro'
  | 'driver_standard'
  | 'driver_pro'
  | 'basic_criminal'
  | 'pro_criminal'
  | 'standard_criminal'
  | 'professional';

export type CheckrReportStatus =
  | 'pending'
  | 'clear'
  | 'consider'
  | 'suspended'
  | 'dispute';

export interface CheckrReport {
  id: string;
  object: 'report';
  uri: string;
  status: CheckrReportStatus;
  package: CheckrPackage;
  created_at: string;
  completed_at?: string;
  turnaround_time?: number;
  candidate_id: string;
  ssn_trace_id?: string;
  sex_offender_search_id?: string;
  national_criminal_search_id?: string;
  county_criminal_search_ids?: string[];
  motor_vehicle_report_id?: string;
  federal_criminal_search_id?: string;
  adjudication?: 'engaged' | 'pre_adverse_action' | 'adverse_action';
}

export interface CheckrInvitation {
  id: string;
  object: 'invitation';
  uri: string;
  status: 'pending' | 'completed' | 'expired';
  invitation_url: string;
  created_at: string;
  completed_at?: string;
  expires_at: string;
  package: CheckrPackage;
  candidate_id?: string;
}

export interface WebhookEvent {
  id: string;
  object: 'event';
  type: string;
  created_at: string;
  data: {
    object: CheckrReport | CheckrCandidate | CheckrInvitation;
  };
}

export interface CheckrResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class CheckrService {
  private client: AxiosInstance;
  private webhookSecret?: string;

  constructor(config: CheckrConfig) {
    this.webhookSecret = config.webhookSecret;

    const baseURL = config.sandbox
      ? 'https://api.checkr-staging.com/v1'
      : 'https://api.checkr.com/v1';

    this.client = axios.create({
      baseURL,
      auth: {
        username: config.apiKey,
        password: '',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new candidate
   */
  async createCandidate(candidate: CheckrCandidate): Promise<CheckrResponse<CheckrCandidate>> {
    try {
      const response = await this.client.post('/candidates', candidate);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Checkr create candidate error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Get candidate by ID
   */
  async getCandidate(candidateId: string): Promise<CheckrResponse<CheckrCandidate>> {
    try {
      const response = await this.client.get(`/candidates/${candidateId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Create a background check report for a candidate
   */
  async createReport(
    candidateId: string,
    packageType: CheckrPackage,
    options?: {
      work_locations?: CheckrAddress[];
      node?: string;
      geo_ids?: string[];
    }
  ): Promise<CheckrResponse<CheckrReport>> {
    try {
      const response = await this.client.post('/reports', {
        candidate_id: candidateId,
        package: packageType,
        ...options,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Checkr create report error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Get report by ID
   */
  async getReport(reportId: string): Promise<CheckrResponse<CheckrReport>> {
    try {
      const response = await this.client.get(`/reports/${reportId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Create an invitation for candidate self-service
   * Sends an email to the candidate to complete their background check
   */
  async createInvitation(
    candidateId: string,
    packageType: CheckrPackage,
    options?: {
      node?: string;
      work_locations?: CheckrAddress[];
    }
  ): Promise<CheckrResponse<CheckrInvitation>> {
    try {
      const response = await this.client.post('/invitations', {
        candidate_id: candidateId,
        package: packageType,
        ...options,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Checkr create invitation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Get invitation by ID
   */
  async getInvitation(invitationId: string): Promise<CheckrResponse<CheckrInvitation>> {
    try {
      const response = await this.client.get(`/invitations/${invitationId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(invitationId: string): Promise<CheckrResponse<void>> {
    try {
      await this.client.delete(`/invitations/${invitationId}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Initiate adverse action process
   */
  async createAdverseAction(
    reportId: string,
    options: {
      post_notice_scheduled_at?: string;
      adverse_item_ids: string[];
      individualized_assessment_engaged?: boolean;
    }
  ): Promise<CheckrResponse<any>> {
    try {
      const response = await this.client.post(`/reports/${reportId}/adverse_actions`, options);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * List all screenings for a report
   */
  async getScreenings(reportId: string): Promise<CheckrResponse<any[]>> {
    try {
      const response = await this.client.get(`/reports/${reportId}/screenings`);
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('Webhook secret not configured, skipping verification');
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Parse webhook event
   */
  parseWebhookEvent(payload: string): WebhookEvent | null {
    try {
      return JSON.parse(payload) as WebhookEvent;
    } catch (error) {
      console.error('Failed to parse Checkr webhook:', error);
      return null;
    }
  }

  /**
   * Get recommended package based on position type
   */
  getRecommendedPackage(positionType: string): CheckrPackage {
    const packageMap: Record<string, CheckrPackage> = {
      driver: 'driver_pro',
      delivery: 'driver_standard',
      contractor: 'tasker_standard',
      professional: 'professional',
      executive: 'professional',
      default: 'standard_criminal',
    };

    return packageMap[positionType.toLowerCase()] || packageMap.default;
  }

  /**
   * Create a complete background check flow
   * Creates candidate and initiates report in one call
   */
  async initiateBackgroundCheck(
    candidateData: CheckrCandidate,
    packageType?: CheckrPackage,
    useSelfService: boolean = true
  ): Promise<CheckrResponse<{
    candidate: CheckrCandidate;
    invitation?: CheckrInvitation;
    report?: CheckrReport;
  }>> {
    try {
      // Create candidate
      const candidateResult = await this.createCandidate(candidateData);
      if (!candidateResult.success || !candidateResult.data?.id) {
        return {
          success: false,
          error: candidateResult.error || 'Failed to create candidate',
        };
      }

      const candidate = candidateResult.data;
      const pkg = packageType || 'standard_criminal';

      if (useSelfService) {
        // Create invitation for self-service
        const invitationResult = await this.createInvitation(candidate.id!, pkg);
        if (!invitationResult.success) {
          return {
            success: false,
            error: invitationResult.error,
          };
        }

        return {
          success: true,
          data: {
            candidate,
            invitation: invitationResult.data,
          },
        };
      } else {
        // Create report directly (requires SSN and other PII)
        const reportResult = await this.createReport(candidate.id!, pkg);
        if (!reportResult.success) {
          return {
            success: false,
            error: reportResult.error,
          };
        }

        return {
          success: true,
          data: {
            candidate,
            report: reportResult.data,
          },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Singleton instance
let checkrInstance: CheckrService | null = null;

export function initCheckr(config: CheckrConfig): CheckrService {
  checkrInstance = new CheckrService(config);
  return checkrInstance;
}

export function getCheckr(): CheckrService {
  if (!checkrInstance) {
    const apiKey = process.env.CHECKR_API_KEY;
    if (!apiKey) {
      throw new Error('CHECKR_API_KEY environment variable is required');
    }

    checkrInstance = new CheckrService({
      apiKey,
      webhookSecret: process.env.CHECKR_WEBHOOK_SECRET,
      sandbox: process.env.NODE_ENV !== 'production',
    });
  }
  return checkrInstance;
}

export default CheckrService;
