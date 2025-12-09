/**
 * Verification Integration Module
 *
 * Unified verification services for background checks,
 * identity verification, and credential validation
 */

import LinkedInService, { getLinkedIn, initLinkedIn, VerificationResult as LinkedInVerificationResult } from './linkedin';
import CheckrService, { getCheckr, initCheckr, CheckrReport, CheckrCandidate } from './checkr';

// Re-export types
export * from './linkedin';
export * from './checkr';

// Verification status enum
export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

// Verification type enum
export enum VerificationType {
  IDENTITY = 'identity',
  EMAIL = 'email',
  PHONE = 'phone',
  LINKEDIN = 'linkedin',
  BACKGROUND_CHECK = 'background_check',
  EDUCATION = 'education',
  EMPLOYMENT = 'employment',
  PROFESSIONAL_LICENSE = 'professional_license',
  REFERENCE = 'reference',
}

// Unified verification result
export interface VerificationResult {
  type: VerificationType;
  status: VerificationStatus;
  verified: boolean;
  score?: number;
  details?: Record<string, any>;
  discrepancies?: string[];
  verifiedAt?: Date;
  expiresAt?: Date;
  error?: string;
}

/**
 * Unified Verification Service
 */
class VerificationService {
  /**
   * Verify LinkedIn profile
   */
  async verifyLinkedIn(
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
      }>;
      education?: Array<{
        school: string;
        degree?: string;
        fieldOfStudy?: string;
        graduationYear?: number;
      }>;
    }
  ): Promise<VerificationResult> {
    try {
      const linkedin = getLinkedIn();
      const result = await linkedin.verifyProfile(accessToken, candidateData);

      return {
        type: VerificationType.LINKEDIN,
        status: result.verified ? VerificationStatus.COMPLETED : VerificationStatus.FAILED,
        verified: result.verified,
        score: result.matchScore,
        discrepancies: result.discrepancies,
        details: {
          linkedInProfile: result.linkedInProfile,
        },
        verifiedAt: result.verifiedAt,
      };
    } catch (error: any) {
      return {
        type: VerificationType.LINKEDIN,
        status: VerificationStatus.FAILED,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Initiate background check
   */
  async initiateBackgroundCheck(
    candidateData: {
      email: string;
      firstName: string;
      lastName: string;
      middleName?: string;
      phone?: string;
      dateOfBirth?: string;
      ssn?: string;
      zipcode?: string;
    },
    packageType?: string,
    useSelfService: boolean = true
  ): Promise<VerificationResult> {
    try {
      const checkr = getCheckr();
      const result = await checkr.initiateBackgroundCheck(
        {
          email: candidateData.email,
          first_name: candidateData.firstName,
          last_name: candidateData.lastName,
          middle_name: candidateData.middleName,
          phone: candidateData.phone,
          dob: candidateData.dateOfBirth,
          ssn: candidateData.ssn,
          zipcode: candidateData.zipcode,
        },
        packageType as any,
        useSelfService
      );

      if (!result.success) {
        return {
          type: VerificationType.BACKGROUND_CHECK,
          status: VerificationStatus.FAILED,
          verified: false,
          error: result.error,
        };
      }

      return {
        type: VerificationType.BACKGROUND_CHECK,
        status: VerificationStatus.PENDING,
        verified: false,
        details: {
          candidateId: result.data?.candidate?.id,
          invitationId: result.data?.invitation?.id,
          invitationUrl: result.data?.invitation?.invitation_url,
          reportId: result.data?.report?.id,
        },
      };
    } catch (error: any) {
      return {
        type: VerificationType.BACKGROUND_CHECK,
        status: VerificationStatus.FAILED,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Check background check status
   */
  async getBackgroundCheckStatus(reportId: string): Promise<VerificationResult> {
    try {
      const checkr = getCheckr();
      const result = await checkr.getReport(reportId);

      if (!result.success || !result.data) {
        return {
          type: VerificationType.BACKGROUND_CHECK,
          status: VerificationStatus.FAILED,
          verified: false,
          error: result.error,
        };
      }

      const report = result.data;
      const statusMap: Record<string, VerificationStatus> = {
        pending: VerificationStatus.IN_PROGRESS,
        clear: VerificationStatus.COMPLETED,
        consider: VerificationStatus.COMPLETED,
        suspended: VerificationStatus.FAILED,
        dispute: VerificationStatus.IN_PROGRESS,
      };

      return {
        type: VerificationType.BACKGROUND_CHECK,
        status: statusMap[report.status] || VerificationStatus.IN_PROGRESS,
        verified: report.status === 'clear',
        details: {
          reportId: report.id,
          status: report.status,
          package: report.package,
          completedAt: report.completed_at,
          turnaroundTime: report.turnaround_time,
          adjudication: report.adjudication,
        },
        verifiedAt: report.completed_at ? new Date(report.completed_at) : undefined,
      };
    } catch (error: any) {
      return {
        type: VerificationType.BACKGROUND_CHECK,
        status: VerificationStatus.FAILED,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Send email verification code
   */
  async sendEmailVerification(
    email: string,
    userName: string
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    try {
      const { getEmailService } = await import('../email');
      const emailService = getEmailService();

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?code=${code}&email=${encodeURIComponent(email)}`;

      const result = await emailService.sendEmailVerification({
        email,
        userName,
        verificationCode: code,
        verificationUrl,
        expiresIn: '24 hours',
      });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true, code };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send reference request
   */
  async sendReferenceRequest(data: {
    referenceEmail: string;
    referenceName: string;
    candidateName: string;
    companyName: string;
    jobTitle: string;
    relationship: string;
    referenceFormUrl: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { getEmailService } = await import('../email');
      const emailService = getEmailService();

      const result = await emailService.sendReferenceRequest(data);

      return { success: result.success, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify phone number (placeholder for Twilio integration)
   */
  async verifyPhone(
    phoneNumber: string,
    code: string
  ): Promise<VerificationResult> {
    // TODO: Implement Twilio Verify API integration
    return {
      type: VerificationType.PHONE,
      status: VerificationStatus.PENDING,
      verified: false,
      error: 'Phone verification not yet implemented',
    };
  }

  /**
   * Verify professional license (placeholder)
   */
  async verifyProfessionalLicense(
    licenseType: string,
    licenseNumber: string,
    state: string
  ): Promise<VerificationResult> {
    // TODO: Implement license verification API integration
    return {
      type: VerificationType.PROFESSIONAL_LICENSE,
      status: VerificationStatus.PENDING,
      verified: false,
      error: 'Professional license verification not yet implemented',
    };
  }
}

// Singleton instance
let verificationService: VerificationService | null = null;

export function getVerificationService(): VerificationService {
  if (!verificationService) {
    verificationService = new VerificationService();
  }
  return verificationService;
}

// Re-exports
export { LinkedInService, CheckrService };
export { getLinkedIn, initLinkedIn } from './linkedin';
export { getCheckr, initCheckr } from './checkr';

export default VerificationService;
