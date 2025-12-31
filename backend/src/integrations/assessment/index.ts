// @ts-nocheck
/**
 * Assessment Integration Module
 *
 * Unified assessment service supporting multiple providers
 * for technical evaluations and coding challenges
 */

import HackerRankService, { getHackerRank, initHackerRank, TestResult as HackerRankResult } from './hackerrank';
import CodilityService, { getCodility, initCodility, CodilityResult } from './codility';

// Re-export types
export * from './hackerrank';
export * from './codility';

export type AssessmentProvider = 'hackerrank' | 'codility';

export enum AssessmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export interface UnifiedAssessmentResult {
  provider: AssessmentProvider;
  testId: string;
  candidateEmail: string;
  candidateName?: string;
  status: AssessmentStatus;
  score?: number;
  maxScore: number;
  percentage?: number;
  percentile?: number;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  reportUrl?: string;
  plagiarismScore?: number;
  taskResults?: Array<{
    taskId: string;
    taskName: string;
    score: number;
    maxScore: number;
    timeSpent: number;
    language?: string;
  }>;
}

export interface CreateAssessmentOptions {
  provider: AssessmentProvider;
  name: string;
  tasks?: string[];
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  skills?: string[];
  instructions?: string;
  passingScore?: number;
}

export interface InviteCandidateOptions {
  provider: AssessmentProvider;
  testId: string;
  email: string;
  name: string;
  sendEmail?: boolean;
  expiresAt?: Date;
  metadata?: Record<string, string>;
}

/**
 * Unified Assessment Service
 */
class AssessmentService {
  /**
   * Create a new assessment
   */
  async createAssessment(options: CreateAssessmentOptions): Promise<{
    success: boolean;
    testId?: string;
    testUrl?: string;
    error?: string;
  }> {
    try {
      if (options.provider === 'hackerrank') {
        const hr = getHackerRank();
        const result = await hr.createTest({
          name: options.name,
          duration: options.duration || 60,
          questions: options.tasks,
          difficulty: options.difficulty,
          skills: options.skills,
          instructions: options.instructions,
          passingScore: options.passingScore,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          testId: result.data?.id,
          testUrl: result.data?.url,
        };
      } else {
        const codility = getCodility();
        const result = await codility.createSession({
          name: options.name,
          tasks: options.tasks || [],
          duration: options.duration,
          intro: options.instructions,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        const linkResult = await codility.getPublicLink(result.data!.id);

        return {
          success: true,
          testId: result.data?.id,
          testUrl: linkResult.data?.url,
        };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Invite candidate to take an assessment
   */
  async inviteCandidate(options: InviteCandidateOptions): Promise<{
    success: boolean;
    invitationId?: string;
    testUrl?: string;
    error?: string;
  }> {
    try {
      if (options.provider === 'hackerrank') {
        const hr = getHackerRank();
        const result = await hr.inviteCandidate({
          testId: options.testId,
          email: options.email,
          name: options.name,
          sendEmail: options.sendEmail,
          expiresAt: options.expiresAt,
          metadata: options.metadata,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          invitationId: result.data?.invitationId,
          testUrl: result.data?.testUrl,
        };
      } else {
        const codility = getCodility();
        const [firstName, ...lastNameParts] = options.name.split(' ');
        const lastName = lastNameParts.join(' ');

        const result = await codility.inviteCandidate({
          sessionId: options.testId,
          email: options.email,
          firstName,
          lastName,
          sendInvitation: options.sendEmail,
          expiresAt: options.expiresAt,
          customFields: options.metadata,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          invitationId: result.data?.ticketId,
          testUrl: result.data?.testUrl,
        };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get assessment result
   */
  async getResult(
    provider: AssessmentProvider,
    testId: string,
    candidateEmailOrId: string
  ): Promise<{
    success: boolean;
    result?: UnifiedAssessmentResult;
    error?: string;
  }> {
    try {
      if (provider === 'hackerrank') {
        const hr = getHackerRank();
        const result = await hr.getCandidateResult(testId, candidateEmailOrId);

        if (!result.success || !result.data) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          result: this.mapHackerRankResult(result.data),
        };
      } else {
        const codility = getCodility();
        const result = await codility.getCandidateResult(candidateEmailOrId);

        if (!result.success || !result.data) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          result: this.mapCodilityResult(result.data),
        };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List candidates for an assessment
   */
  async listCandidates(
    provider: AssessmentProvider,
    testId: string,
    options?: {
      status?: AssessmentStatus;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    results?: UnifiedAssessmentResult[];
    error?: string;
  }> {
    try {
      if (provider === 'hackerrank') {
        const hr = getHackerRank();
        const result = await hr.listCandidates(testId, {
          status: options?.status as any,
          limit: options?.limit,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          results: result.data?.map(r => this.mapHackerRankResult(r)) || [],
        };
      } else {
        const codility = getCodility();
        const result = await codility.listCandidates(testId, {
          status: options?.status === AssessmentStatus.IN_PROGRESS ? 'started' : options?.status as any,
          limit: options?.limit,
        });

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          results: result.data?.map(r => this.mapCodilityResult(r)) || [],
        };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Resend invitation
   */
  async resendInvitation(
    provider: AssessmentProvider,
    testId: string,
    candidateEmailOrId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (provider === 'hackerrank') {
        const hr = getHackerRank();
        const result = await hr.resendInvitation(testId, candidateEmailOrId);
        return { success: result.success, error: result.error };
      } else {
        const codility = getCodility();
        const result = await codility.resendInvitation(candidateEmailOrId);
        return { success: result.success, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get available assessment providers
   */
  getAvailableProviders(): AssessmentProvider[] {
    const providers: AssessmentProvider[] = [];

    if (process.env.HACKERRANK_API_KEY) {
      providers.push('hackerrank');
    }

    if (process.env.CODILITY_API_TOKEN) {
      providers.push('codility');
    }

    return providers;
  }

  /**
   * Get report URL
   */
  async getReportUrl(
    provider: AssessmentProvider,
    testId: string,
    candidateId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (provider === 'hackerrank') {
        const hr = getHackerRank();
        const result = await hr.getReportPDF(testId, candidateId);
        return { success: result.success, url: result.data?.url, error: result.error };
      } else {
        const codility = getCodility();
        const result = await codility.getPDFReport(candidateId);
        return { success: result.success, url: result.data?.url, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== HELPER METHODS ====================

  private mapHackerRankResult(result: HackerRankResult): UnifiedAssessmentResult {
    const percentage = result.score && result.maxScore
      ? Math.round((result.score / result.maxScore) * 100)
      : undefined;

    return {
      provider: 'hackerrank',
      testId: result.testId,
      candidateEmail: result.candidateEmail,
      status: result.status as AssessmentStatus,
      score: result.score,
      maxScore: result.maxScore || 100,
      percentage,
      percentile: result.percentile,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      duration: result.duration,
      reportUrl: result.reportUrl,
      plagiarismScore: result.plagiarismScore,
      taskResults: result.questionResults?.map(q => ({
        taskId: q.questionId,
        taskName: q.questionName,
        score: q.score,
        maxScore: q.maxScore,
        timeSpent: q.timeSpent,
        language: q.language,
      })),
    };
  }

  private mapCodilityResult(result: CodilityResult): UnifiedAssessmentResult {
    const percentage = result.score !== undefined
      ? Math.round((result.score / result.maxScore) * 100)
      : undefined;

    return {
      provider: 'codility',
      testId: result.sessionId,
      candidateEmail: result.candidateEmail,
      candidateName: result.candidateName,
      status: result.status as AssessmentStatus,
      score: result.score,
      maxScore: result.maxScore,
      percentage,
      percentile: result.percentile,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      duration: result.duration,
      reportUrl: result.reportUrl,
      plagiarismScore: result.similarity,
      taskResults: result.taskResults,
    };
  }
}

// Singleton instance
let assessmentService: AssessmentService | null = null;

export function getAssessmentService(): AssessmentService {
  if (!assessmentService) {
    assessmentService = new AssessmentService();
  }
  return assessmentService;
}

// Re-exports
export { HackerRankService, CodilityService };
export { getHackerRank, initHackerRank } from './hackerrank';
export { getCodility, initCodility } from './codility';

export default AssessmentService;
