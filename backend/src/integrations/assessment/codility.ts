/**
 * Codility Integration
 *
 * Integration with Codility for technical assessments,
 * coding challenges, and candidate evaluation
 */

// Types
export interface CodilityConfig {
  apiToken: string;
  baseUrl?: string;
}

export interface CreateTestData {
  name: string;
  tasks: string[]; // Task IDs
  duration?: number; // in minutes (optional, calculated from tasks)
  intro?: string;
  closingMessage?: string;
  showTaskFeedback?: boolean;
  allowPractice?: boolean;
}

export interface InviteCandidateData {
  sessionId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  sendInvitation?: boolean;
  expiresAt?: Date;
  customFields?: Record<string, string>;
}

export interface CodilitySession {
  id: string;
  name: string;
  status: 'active' | 'closed' | 'draft';
  tasksCount: number;
  duration: number;
  createdAt: Date;
  publicUrl?: string;
}

export interface CodilityResult {
  id: string;
  sessionId: string;
  candidateEmail: string;
  candidateName?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  score?: number;
  maxScore: number;
  percentile?: number;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  reportUrl?: string;
  similarity?: number; // plagiarism detection
  taskResults?: Array<{
    taskId: string;
    taskName: string;
    score: number;
    maxScore: number;
    correctness: number;
    performance: number;
    timeSpent: number; // in seconds
    language?: string;
  }>;
}

export interface CodilityTask {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  skills: string[];
  duration: number;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class CodilityService {
  private apiToken: string;
  private baseUrl: string;

  constructor(config: CodilityConfig) {
    this.apiToken = config.apiToken;
    this.baseUrl = config.baseUrl || 'https://codility.com/api/v1';
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
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: error.message || error.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== SESSIONS (TESTS) ====================

  /**
   * Create a new test session
   */
  async createSession(data: CreateTestData): Promise<ApiResponse<CodilitySession>> {
    return this.request<CodilitySession>('POST', '/sessions', {
      name: data.name,
      task_ids: data.tasks,
      time_limit: data.duration,
      intro_text: data.intro,
      closing_text: data.closingMessage,
      show_task_feedback: data.showTaskFeedback ?? false,
      practice_mode: data.allowPractice ?? false,
    });
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<ApiResponse<CodilitySession>> {
    const result = await this.request<any>('GET', `/sessions/${sessionId}`);
    if (!result.success) return result;

    return {
      success: true,
      data: this.mapSession(result.data),
    };
  }

  /**
   * List all sessions
   */
  async listSessions(options?: {
    status?: 'active' | 'closed' | 'draft';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<CodilitySession[]>> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await this.request<any[]>('GET', `/sessions${query}`);

    if (!result.success) return result as ApiResponse<CodilitySession[]>;

    return {
      success: true,
      data: result.data?.map(s => this.mapSession(s)) || [],
    };
  }

  /**
   * Update session
   */
  async updateSession(
    sessionId: string,
    data: Partial<CreateTestData>
  ): Promise<ApiResponse<CodilitySession>> {
    const result = await this.request<any>('PUT', `/sessions/${sessionId}`, {
      name: data.name,
      task_ids: data.tasks,
      time_limit: data.duration,
      intro_text: data.intro,
      closing_text: data.closingMessage,
    });

    if (!result.success) return result;
    return { success: true, data: this.mapSession(result.data) };
  }

  /**
   * Close a session
   */
  async closeSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', `/sessions/${sessionId}/close`);
  }

  /**
   * Reopen a session
   */
  async reopenSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', `/sessions/${sessionId}/reopen`);
  }

  /**
   * Get public test link
   */
  async getPublicLink(sessionId: string): Promise<ApiResponse<{ url: string }>> {
    const result = await this.request<any>('GET', `/sessions/${sessionId}/public_link`);
    if (!result.success) return result;
    return { success: true, data: { url: result.data.url } };
  }

  // ==================== CANDIDATES ====================

  /**
   * Invite candidate to a session
   */
  async inviteCandidate(data: InviteCandidateData): Promise<
    ApiResponse<{
      ticketId: string;
      testUrl: string;
    }>
  > {
    const result = await this.request<any>('POST', `/sessions/${data.sessionId}/tickets`, {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      send_invitation: data.sendInvitation ?? true,
      deadline: data.expiresAt?.toISOString(),
      custom_fields: data.customFields,
    });

    if (!result.success) return result;

    return {
      success: true,
      data: {
        ticketId: result.data.id,
        testUrl: result.data.url,
      },
    };
  }

  /**
   * Get candidate result
   */
  async getCandidateResult(ticketId: string): Promise<ApiResponse<CodilityResult>> {
    const result = await this.request<any>('GET', `/tickets/${ticketId}`);
    if (!result.success) return result;

    return {
      success: true,
      data: this.mapResult(result.data),
    };
  }

  /**
   * List candidates for a session
   */
  async listCandidates(
    sessionId: string,
    options?: {
      status?: 'pending' | 'started' | 'completed';
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<CodilityResult[]>> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await this.request<any[]>('GET', `/sessions/${sessionId}/tickets${query}`);

    if (!result.success) return result as ApiResponse<CodilityResult[]>;

    return {
      success: true,
      data: result.data?.map(r => this.mapResult(r)) || [],
    };
  }

  /**
   * Resend invitation
   */
  async resendInvitation(ticketId: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', `/tickets/${ticketId}/resend`);
  }

  /**
   * Extend deadline
   */
  async extendDeadline(ticketId: string, newDeadline: Date): Promise<ApiResponse<void>> {
    return this.request<void>('PUT', `/tickets/${ticketId}`, {
      deadline: newDeadline.toISOString(),
    });
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(ticketId: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/tickets/${ticketId}`);
  }

  // ==================== TASKS ====================

  /**
   * List available tasks
   */
  async listTasks(options?: {
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    category?: string;
    skills?: string[];
    limit?: number;
  }): Promise<ApiResponse<CodilityTask[]>> {
    const params = new URLSearchParams();
    if (options?.difficulty) params.append('difficulty', options.difficulty);
    if (options?.category) params.append('category', options.category);
    if (options?.skills) params.append('skills', options.skills.join(','));
    if (options?.limit) params.append('limit', options.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await this.request<any[]>('GET', `/tasks${query}`);

    if (!result.success) return result as ApiResponse<CodilityTask[]>;

    return {
      success: true,
      data: result.data?.map(t => this.mapTask(t)) || [],
    };
  }

  /**
   * Get task details
   */
  async getTask(taskId: string): Promise<ApiResponse<CodilityTask>> {
    const result = await this.request<any>('GET', `/tasks/${taskId}`);
    if (!result.success) return result;

    return {
      success: true,
      data: this.mapTask(result.data),
    };
  }

  /**
   * List task categories
   */
  async listCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('GET', '/tasks/categories');
  }

  /**
   * List available skills
   */
  async listSkills(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('GET', '/tasks/skills');
  }

  // ==================== REPORTS ====================

  /**
   * Get detailed report
   */
  async getDetailedReport(ticketId: string): Promise<
    ApiResponse<{
      summary: CodilityResult;
      codeSnapshots?: Array<{
        taskId: string;
        code: string;
        language: string;
        timestamp: Date;
      }>;
      testCaseResults?: Array<{
        taskId: string;
        testCases: Array<{
          name: string;
          passed: boolean;
          hidden: boolean;
        }>;
      }>;
    }>
  > {
    return this.request('GET', `/tickets/${ticketId}/report`);
  }

  /**
   * Get PDF report URL
   */
  async getPDFReport(ticketId: string): Promise<ApiResponse<{ url: string }>> {
    return this.request('GET', `/tickets/${ticketId}/pdf`);
  }

  /**
   * Get similarity report (plagiarism detection)
   */
  async getSimilarityReport(
    sessionId: string
  ): Promise<
    ApiResponse<
      Array<{
        ticketId: string;
        candidateEmail: string;
        similarityScore: number;
        similarTo?: string[];
      }>
    >
  > {
    return this.request('GET', `/sessions/${sessionId}/similarity`);
  }

  // ==================== HELPER METHODS ====================

  private mapSession(data: any): CodilitySession {
    return {
      id: data.id,
      name: data.name,
      status: data.status || 'active',
      tasksCount: data.tasks_count || data.task_ids?.length || 0,
      duration: data.time_limit || 0,
      createdAt: new Date(data.created_at),
      publicUrl: data.public_url,
    };
  }

  private mapResult(data: any): CodilityResult {
    return {
      id: data.id,
      sessionId: data.session_id,
      candidateEmail: data.email,
      candidateName: data.first_name
        ? `${data.first_name} ${data.last_name || ''}`.trim()
        : undefined,
      status: this.mapStatus(data.status),
      score: data.result,
      maxScore: data.max_result || 100,
      percentile: data.percentile,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      duration: data.time_taken,
      reportUrl: data.report_url,
      similarity: data.similarity_score,
      taskResults: data.task_results?.map((t: any) => ({
        taskId: t.task_id,
        taskName: t.task_name,
        score: t.result,
        maxScore: t.max_result,
        correctness: t.correctness,
        performance: t.performance,
        timeSpent: t.time_taken,
        language: t.language,
      })),
    };
  }

  private mapTask(data: any): CodilityTask {
    return {
      id: data.id,
      name: data.name,
      difficulty: data.difficulty || 'medium',
      category: data.category,
      skills: data.skills || [],
      duration: data.time_limit || 30,
      description: data.description,
    };
  }

  private mapStatus(
    status: string
  ): 'pending' | 'in_progress' | 'completed' | 'expired' {
    const statusMap: Record<string, 'pending' | 'in_progress' | 'completed' | 'expired'> = {
      invited: 'pending',
      pending: 'pending',
      started: 'in_progress',
      in_progress: 'in_progress',
      completed: 'completed',
      finished: 'completed',
      expired: 'expired',
    };
    return statusMap[status?.toLowerCase()] || 'pending';
  }
}

// Singleton instance
let codilityInstance: CodilityService | null = null;

export function initCodility(config: CodilityConfig): CodilityService {
  codilityInstance = new CodilityService(config);
  return codilityInstance;
}

export function getCodility(): CodilityService {
  if (!codilityInstance) {
    const apiToken = process.env.CODILITY_API_TOKEN;
    if (!apiToken) {
      throw new Error('CODILITY_API_TOKEN environment variable is required');
    }

    codilityInstance = new CodilityService({ apiToken });
  }
  return codilityInstance;
}

export default CodilityService;
