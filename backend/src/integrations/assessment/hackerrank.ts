// @ts-nocheck
/**
 * HackerRank Integration
 *
 * Integration with HackerRank for Work for technical assessments,
 * coding tests, and interview scheduling
 */

// Types
export interface HackerRankConfig {
  apiKey: string;
  apiSecret?: string;
  environment?: 'production' | 'sandbox';
}

export interface CreateTestData {
  name: string;
  duration: number; // in minutes
  questions?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  skills?: string[];
  instructions?: string;
  passingScore?: number;
  randomizeQuestions?: boolean;
  preventCopyPaste?: boolean;
  webcamProctoring?: boolean;
}

export interface InviteCandidateData {
  testId: string;
  email: string;
  name: string;
  sendEmail?: boolean;
  expiresAt?: Date;
  metadata?: Record<string, string>;
}

export interface TestResult {
  id: string;
  testId: string;
  candidateEmail: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  score?: number;
  maxScore?: number;
  percentile?: number;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  reportUrl?: string;
  plagiarismScore?: number;
  questionResults?: Array<{
    questionId: string;
    questionName: string;
    score: number;
    maxScore: number;
    timeSpent: number; // in seconds
    language?: string;
  }>;
}

export interface HackerRankTest {
  id: string;
  name: string;
  slug: string;
  duration: number;
  questionsCount: number;
  createdAt: Date;
  status: 'draft' | 'active' | 'archived';
  url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class HackerRankService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: HackerRankConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl =
      config.environment === 'sandbox'
        ? 'https://www.hackerrank.com/x/api/v3'
        : 'https://www.hackerrank.com/x/api/v3';
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: error.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const result = await response.json();
      return { success: true, data: result.data || result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== TESTS ====================

  /**
   * Create a new test
   */
  async createTest(data: CreateTestData): Promise<ApiResponse<HackerRankTest>> {
    return this.request<HackerRankTest>('POST', '/tests', {
      name: data.name,
      duration: data.duration,
      questions: data.questions,
      difficulty: data.difficulty,
      skills: data.skills,
      instructions: data.instructions,
      cutoff_score: data.passingScore,
      shuffle_questions: data.randomizeQuestions,
      copy_paste_disabled: data.preventCopyPaste,
      webcam_proctoring: data.webcamProctoring,
    });
  }

  /**
   * Get test by ID
   */
  async getTest(testId: string): Promise<ApiResponse<HackerRankTest>> {
    return this.request<HackerRankTest>('GET', `/tests/${testId}`);
  }

  /**
   * List all tests
   */
  async listTests(options?: {
    status?: 'draft' | 'active' | 'archived';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<HackerRankTest[]>> {
    const params = new URLSearchParams();
    if (options?.status) params.append('state', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<HackerRankTest[]>('GET', `/tests${query}`);
  }

  /**
   * Update test
   */
  async updateTest(
    testId: string,
    data: Partial<CreateTestData>
  ): Promise<ApiResponse<HackerRankTest>> {
    return this.request<HackerRankTest>('PUT', `/tests/${testId}`, data);
  }

  /**
   * Archive test
   */
  async archiveTest(testId: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/tests/${testId}`);
  }

  // ==================== CANDIDATES ====================

  /**
   * Invite candidate to take a test
   */
  async inviteCandidate(data: InviteCandidateData): Promise<
    ApiResponse<{
      id: string;
      testUrl: string;
      invitationId: string;
    }>
  > {
    return this.request('POST', `/tests/${data.testId}/candidates`, {
      email: data.email,
      full_name: data.name,
      send_email: data.sendEmail ?? true,
      force: true,
      test_finish_url: data.metadata?.callbackUrl,
    });
  }

  /**
   * Get candidate result for a test
   */
  async getCandidateResult(
    testId: string,
    candidateEmail: string
  ): Promise<ApiResponse<TestResult>> {
    const result = await this.request<any>(
      'GET',
      `/tests/${testId}/candidates?email=${encodeURIComponent(candidateEmail)}`
    );

    if (!result.success || !result.data?.[0]) {
      return { success: false, error: result.error || 'Candidate not found' };
    }

    const candidate = result.data[0];
    return {
      success: true,
      data: this.mapCandidateResult(candidate, testId),
    };
  }

  /**
   * List all candidates for a test
   */
  async listCandidates(
    testId: string,
    options?: {
      status?: 'pending' | 'in_progress' | 'completed' | 'expired';
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<TestResult[]>> {
    const params = new URLSearchParams();
    if (options?.status) params.append('state', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await this.request<any[]>('GET', `/tests/${testId}/candidates${query}`);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      data: result.data?.map(c => this.mapCandidateResult(c, testId)) || [],
    };
  }

  /**
   * Resend invitation to candidate
   */
  async resendInvitation(testId: string, candidateEmail: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', `/tests/${testId}/candidates/resend`, {
      email: candidateEmail,
    });
  }

  /**
   * Extend candidate deadline
   */
  async extendDeadline(
    testId: string,
    candidateEmail: string,
    newDeadline: Date
  ): Promise<ApiResponse<void>> {
    return this.request<void>('PUT', `/tests/${testId}/candidates/extend`, {
      email: candidateEmail,
      end_date: newDeadline.toISOString(),
    });
  }

  // ==================== QUESTIONS ====================

  /**
   * List available questions
   */
  async listQuestions(options?: {
    type?: 'coding' | 'mcq' | 'subjective' | 'database';
    difficulty?: 'easy' | 'medium' | 'hard';
    skills?: string[];
    limit?: number;
  }): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        type: string;
        difficulty: string;
        skills: string[];
      }>
    >
  > {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.difficulty) params.append('difficulty', options.difficulty);
    if (options?.skills) params.append('skills', options.skills.join(','));
    if (options?.limit) params.append('limit', options.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request('GET', `/questions${query}`);
  }

  // ==================== REPORTS ====================

  /**
   * Get detailed report for a candidate
   */
  async getCandidateReport(
    testId: string,
    candidateId: string
  ): Promise<ApiResponse<{
    summary: TestResult;
    codePlayback?: string;
    answers: Array<{
      questionId: string;
      code?: string;
      language?: string;
      testCases?: Array<{
        name: string;
        passed: boolean;
        expected: string;
        actual: string;
      }>;
    }>;
  }>> {
    return this.request('GET', `/tests/${testId}/candidates/${candidateId}/report`);
  }

  /**
   * Get PDF report URL
   */
  async getReportPDF(testId: string, candidateId: string): Promise<ApiResponse<{ url: string }>> {
    return this.request('GET', `/tests/${testId}/candidates/${candidateId}/pdf`);
  }

  // ==================== HELPER METHODS ====================

  private mapCandidateResult(candidate: any, testId: string): TestResult {
    return {
      id: candidate.id,
      testId,
      candidateEmail: candidate.email,
      status: this.mapStatus(candidate.status || candidate.attempt_state),
      score: candidate.score,
      maxScore: candidate.max_score,
      percentile: candidate.percentile,
      startedAt: candidate.attempt_starttime
        ? new Date(candidate.attempt_starttime)
        : undefined,
      completedAt: candidate.attempt_endtime
        ? new Date(candidate.attempt_endtime)
        : undefined,
      duration: candidate.time_taken,
      reportUrl: candidate.pdf_url,
      plagiarismScore: candidate.plagiarism_score,
      questionResults: candidate.questions?.map((q: any) => ({
        questionId: q.id,
        questionName: q.name,
        score: q.score,
        maxScore: q.max_score,
        timeSpent: q.time_taken,
        language: q.language,
      })),
    };
  }

  private mapStatus(
    status: string
  ): 'pending' | 'in_progress' | 'completed' | 'expired' {
    const statusMap: Record<string, 'pending' | 'in_progress' | 'completed' | 'expired'> = {
      not_started: 'pending',
      invited: 'pending',
      in_progress: 'in_progress',
      started: 'in_progress',
      completed: 'completed',
      submitted: 'completed',
      expired: 'expired',
    };
    return statusMap[status?.toLowerCase()] || 'pending';
  }
}

// Singleton instance
let hackerRankInstance: HackerRankService | null = null;

export function initHackerRank(config: HackerRankConfig): HackerRankService {
  hackerRankInstance = new HackerRankService(config);
  return hackerRankInstance;
}

export function getHackerRank(): HackerRankService {
  if (!hackerRankInstance) {
    const apiKey = process.env.HACKERRANK_API_KEY;
    if (!apiKey) {
      throw new Error('HACKERRANK_API_KEY environment variable is required');
    }

    hackerRankInstance = new HackerRankService({
      apiKey,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    });
  }
  return hackerRankInstance;
}

export default HackerRankService;
