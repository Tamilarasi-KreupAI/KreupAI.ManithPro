// ============================================================
// JOB BOARD SERVICE - Job board posting and syndication
// ============================================================

import { BaseIntegrationService, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  JobBoardPosting,
  JobBoard,
  JobBoardPostingStatus,
  JobBoardSyncResult,
  IntegrationError,
} from '../types';

// ============================================
// Job Posting Types
// ============================================
export interface JobPostingData {
  id: string;
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  department?: string;
  location: string;
  locationType: 'remote' | 'onsite' | 'hybrid';
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: 'hourly' | 'monthly' | 'yearly';
  showSalary?: boolean;
  benefits?: string[];
  skills?: string[];
  applicationUrl?: string;
  applicationEmail?: string;
  companyName: string;
  companyDescription?: string;
  companyLogo?: string;
  companyWebsite?: string;
  expiresAt?: Date;
}

export interface JobBoardConfiguration {
  board: JobBoard;
  enabled: boolean;
  apiKey?: string;
  companyId?: string;
  defaultSettings?: {
    autoPost?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number; // days
    premiumListing?: boolean;
    sponsoredPost?: boolean;
  };
}

// ============================================
// Job Board Service
// ============================================
export class JobBoardService extends BaseIntegrationService {
  private configurations: Map<JobBoard, JobBoardConfiguration> = new Map();
  private postings: Map<string, JobBoardPosting[]> = new Map();

  constructor(config?: Partial<IntegrationConfig>) {
    super({
      id: 'jobboards',
      name: 'Job Boards',
      description: 'Post jobs to multiple job boards',
      icon: 'briefcase',
      category: 'jobboard',
      ...config,
    });
  }

  async connect(): Promise<void> {
    try {
      // Load saved configurations
      const response = await this.request<{
        configurations: Array<JobBoardConfiguration>;
      }>('/jobboards/configurations');

      response.configurations.forEach((config) => {
        this.configurations.set(config.board, config);
      });

      this.setStatus('connected');
      this.config.connectedAt = new Date();

      integrationEvents.emit('connected', {
        integrationId: this.config.id,
        status: 'connected',
      });
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.configurations.clear();
    this.setStatus('disconnected');

    integrationEvents.emit('disconnected', {
      integrationId: this.config.id,
      status: 'disconnected',
    });
  }

  isConnected(): boolean {
    return this.config.status === 'connected';
  }

  async refresh(): Promise<void> {
    await this.connect();
  }

  // ============================================
  // Configuration Methods
  // ============================================

  async configureBoard(config: JobBoardConfiguration): Promise<void> {
    await this.request('/jobboards/configurations', {
      method: 'POST',
      body: JSON.stringify(config),
    });

    this.configurations.set(config.board, config);
  }

  async removeBoard(board: JobBoard): Promise<void> {
    await this.request(`/jobboards/configurations/${board}`, {
      method: 'DELETE',
    });

    this.configurations.delete(board);
  }

  getBoardConfiguration(board: JobBoard): JobBoardConfiguration | undefined {
    return this.configurations.get(board);
  }

  getConfiguredBoards(): JobBoard[] {
    return Array.from(this.configurations.keys()).filter(
      (board) => this.configurations.get(board)?.enabled
    );
  }

  // ============================================
  // Posting Methods
  // ============================================

  async postJob(
    jobData: JobPostingData,
    boards?: JobBoard[]
  ): Promise<JobBoardPosting[]> {
    const targetBoards = boards || this.getConfiguredBoards();
    const results: JobBoardPosting[] = [];

    for (const board of targetBoards) {
      try {
        const posting = await this.postToBoard(jobData, board);
        results.push(posting);
      } catch (error) {
        results.push({
          id: `${jobData.id}-${board}`,
          jobId: jobData.id,
          board,
          status: 'error',
          error: error as IntegrationError,
        });
      }
    }

    // Cache postings
    this.postings.set(jobData.id, results);

    return results;
  }

  private async postToBoard(
    jobData: JobPostingData,
    board: JobBoard
  ): Promise<JobBoardPosting> {
    const config = this.configurations.get(board);

    if (!config?.enabled) {
      throw this.createError(
        'BOARD_NOT_CONFIGURED',
        `Job board ${board} is not configured or enabled`,
        false
      );
    }

    // Format job data for specific board
    const formattedData = this.formatJobForBoard(jobData, board);

    const response = await this.request<{
      id: string;
      externalId: string;
      status: string;
      url: string;
      expiresAt: string;
    }>(`/jobboards/${board}/post`, {
      method: 'POST',
      body: JSON.stringify(formattedData),
    });

    return {
      id: response.id,
      jobId: jobData.id,
      board,
      externalId: response.externalId,
      status: response.status as JobBoardPostingStatus,
      url: response.url,
      postedAt: new Date(),
      expiresAt: response.expiresAt ? new Date(response.expiresAt) : undefined,
    };
  }

  async updatePosting(
    postingId: string,
    jobData: Partial<JobPostingData>
  ): Promise<JobBoardPosting> {
    const response = await this.request<{
      id: string;
      board: JobBoard;
      externalId: string;
      status: string;
      url: string;
    }>(`/jobboards/postings/${postingId}`, {
      method: 'PATCH',
      body: JSON.stringify(jobData),
    });

    return {
      id: response.id,
      jobId: jobData.id || '',
      board: response.board,
      externalId: response.externalId,
      status: response.status as JobBoardPostingStatus,
      url: response.url,
    };
  }

  async pausePosting(postingId: string): Promise<JobBoardPosting> {
    const response = await this.request<JobBoardPosting>(
      `/jobboards/postings/${postingId}/pause`,
      { method: 'POST' }
    );
    return response;
  }

  async resumePosting(postingId: string): Promise<JobBoardPosting> {
    const response = await this.request<JobBoardPosting>(
      `/jobboards/postings/${postingId}/resume`,
      { method: 'POST' }
    );
    return response;
  }

  async closePosting(postingId: string): Promise<JobBoardPosting> {
    const response = await this.request<JobBoardPosting>(
      `/jobboards/postings/${postingId}/close`,
      { method: 'POST' }
    );
    return response;
  }

  async deletePosting(postingId: string): Promise<void> {
    await this.request(`/jobboards/postings/${postingId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Query Methods
  // ============================================

  async getPostings(jobId: string): Promise<JobBoardPosting[]> {
    const response = await this.request<{ postings: JobBoardPosting[] }>(
      `/jobboards/jobs/${jobId}/postings`
    );
    return response.postings;
  }

  async getPostingStatus(postingId: string): Promise<JobBoardPosting> {
    const response = await this.request<JobBoardPosting>(
      `/jobboards/postings/${postingId}`
    );
    return response;
  }

  async getPostingAnalytics(postingId: string): Promise<{
    views: number;
    clicks: number;
    applications: number;
    conversionRate: number;
  }> {
    const response = await this.request<{
      views: number;
      clicks: number;
      applications: number;
    }>(`/jobboards/postings/${postingId}/analytics`);

    return {
      ...response,
      conversionRate:
        response.views > 0
          ? (response.applications / response.views) * 100
          : 0,
    };
  }

  // ============================================
  // Sync Methods
  // ============================================

  async syncAllBoards(): Promise<JobBoardSyncResult[]> {
    const results: JobBoardSyncResult[] = [];

    for (const board of this.getConfiguredBoards()) {
      try {
        const result = await this.syncBoard(board);
        results.push(result);
      } catch (error) {
        results.push({
          board,
          synced: 0,
          errors: [error as IntegrationError],
          lastSyncAt: new Date(),
        });
      }
    }

    return results;
  }

  async syncBoard(board: JobBoard): Promise<JobBoardSyncResult> {
    const response = await this.request<{
      synced: number;
      errors: IntegrationError[];
    }>(`/jobboards/${board}/sync`, { method: 'POST' });

    return {
      board,
      synced: response.synced,
      errors: response.errors,
      lastSyncAt: new Date(),
    };
  }

  // ============================================
  // Board-Specific Formatting
  // ============================================

  private formatJobForBoard(
    jobData: JobPostingData,
    board: JobBoard
  ): Record<string, unknown> {
    const baseData = {
      title: jobData.title,
      description: this.formatDescription(jobData, board),
      location: jobData.location,
      company: {
        name: jobData.companyName,
        description: jobData.companyDescription,
        logo: jobData.companyLogo,
        website: jobData.companyWebsite,
      },
    };

    switch (board) {
      case 'indeed':
        return this.formatForIndeed(jobData, baseData);
      case 'linkedin':
        return this.formatForLinkedIn(jobData, baseData);
      case 'glassdoor':
        return this.formatForGlassdoor(jobData, baseData);
      case 'ziprecruiter':
        return this.formatForZipRecruiter(jobData, baseData);
      case 'google_jobs':
        return this.formatForGoogleJobs(jobData, baseData);
      default:
        return baseData;
    }
  }

  private formatDescription(jobData: JobPostingData, board: JobBoard): string {
    let description = jobData.description;

    if (jobData.responsibilities?.length) {
      description += '\n\nResponsibilities:\n';
      description += jobData.responsibilities.map((r) => `• ${r}`).join('\n');
    }

    if (jobData.requirements?.length) {
      description += '\n\nRequirements:\n';
      description += jobData.requirements.map((r) => `• ${r}`).join('\n');
    }

    if (jobData.benefits?.length) {
      description += '\n\nBenefits:\n';
      description += jobData.benefits.map((b) => `• ${b}`).join('\n');
    }

    // Board-specific length limits
    const maxLength = board === 'linkedin' ? 2000 : 4000;
    if (description.length > maxLength) {
      description = description.substring(0, maxLength - 3) + '...';
    }

    return description;
  }

  private formatForIndeed(
    jobData: JobPostingData,
    baseData: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      ...baseData,
      jobtype: this.mapEmploymentType(jobData.employmentType, 'indeed'),
      remotetype: jobData.locationType === 'remote' ? 'Fully Remote' : undefined,
      salary: jobData.showSalary && jobData.salaryMin
        ? {
            min: jobData.salaryMin,
            max: jobData.salaryMax,
            currency: jobData.salaryCurrency || 'USD',
            period: jobData.salaryPeriod || 'yearly',
          }
        : undefined,
      educationrequirements: this.mapExperienceLevel(jobData.experienceLevel),
      experiencerequirements: jobData.experienceLevel,
    };
  }

  private formatForLinkedIn(
    jobData: JobPostingData,
    baseData: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      ...baseData,
      employmentStatus: this.mapEmploymentType(jobData.employmentType, 'linkedin'),
      workplaceType: this.mapLocationType(jobData.locationType, 'linkedin'),
      seniorityLevel: this.mapExperienceLevel(jobData.experienceLevel),
      industries: jobData.department ? [jobData.department] : undefined,
      skills: jobData.skills,
      applyMethod: jobData.applicationUrl
        ? { externalUrl: jobData.applicationUrl }
        : undefined,
    };
  }

  private formatForGlassdoor(
    jobData: JobPostingData,
    baseData: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      ...baseData,
      employmentType: this.mapEmploymentType(jobData.employmentType, 'glassdoor'),
      remote: jobData.locationType === 'remote',
      salaryEstimate: jobData.showSalary && jobData.salaryMin
        ? {
            payPeriod: jobData.salaryPeriod?.toUpperCase() || 'ANNUAL',
            payLow: jobData.salaryMin,
            payHigh: jobData.salaryMax,
            currency: jobData.salaryCurrency || 'USD',
          }
        : undefined,
    };
  }

  private formatForZipRecruiter(
    jobData: JobPostingData,
    baseData: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      ...baseData,
      job_type: this.mapEmploymentType(jobData.employmentType, 'ziprecruiter'),
      remote_type: jobData.locationType,
      compensation: jobData.showSalary && jobData.salaryMin
        ? {
            salary_min: jobData.salaryMin,
            salary_max: jobData.salaryMax,
            salary_type: jobData.salaryPeriod || 'yearly',
          }
        : undefined,
      experience_level: jobData.experienceLevel,
    };
  }

  private formatForGoogleJobs(
    jobData: JobPostingData,
    baseData: Record<string, unknown>
  ): Record<string, unknown> {
    // Schema.org JobPosting format
    return {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: jobData.title,
      description: baseData.description,
      datePosted: new Date().toISOString(),
      validThrough: jobData.expiresAt?.toISOString(),
      employmentType: this.mapEmploymentType(jobData.employmentType, 'google_jobs'),
      hiringOrganization: {
        '@type': 'Organization',
        name: jobData.companyName,
        sameAs: jobData.companyWebsite,
        logo: jobData.companyLogo,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: jobData.location,
        },
      },
      jobLocationType: jobData.locationType === 'remote' ? 'TELECOMMUTE' : undefined,
      baseSalary: jobData.showSalary && jobData.salaryMin
        ? {
            '@type': 'MonetaryAmount',
            currency: jobData.salaryCurrency || 'USD',
            value: {
              '@type': 'QuantitativeValue',
              minValue: jobData.salaryMin,
              maxValue: jobData.salaryMax,
              unitText: jobData.salaryPeriod?.toUpperCase() || 'YEAR',
            },
          }
        : undefined,
      skills: jobData.skills?.join(', '),
      qualifications: jobData.requirements?.join('. '),
      responsibilities: jobData.responsibilities?.join('. '),
    };
  }

  private mapEmploymentType(
    type: string,
    board: JobBoard
  ): string {
    const mappings: Record<JobBoard, Record<string, string>> = {
      indeed: {
        full_time: 'fulltime',
        part_time: 'parttime',
        contract: 'contract',
        internship: 'internship',
        temporary: 'temporary',
      },
      linkedin: {
        full_time: 'FULL_TIME',
        part_time: 'PART_TIME',
        contract: 'CONTRACT',
        internship: 'INTERNSHIP',
        temporary: 'TEMPORARY',
      },
      glassdoor: {
        full_time: 'FULLTIME',
        part_time: 'PARTTIME',
        contract: 'CONTRACT',
        internship: 'INTERN',
        temporary: 'TEMPORARY',
      },
      ziprecruiter: {
        full_time: 'full_time',
        part_time: 'part_time',
        contract: 'contract',
        internship: 'internship',
        temporary: 'temporary',
      },
      google_jobs: {
        full_time: 'FULL_TIME',
        part_time: 'PART_TIME',
        contract: 'CONTRACTOR',
        internship: 'INTERN',
        temporary: 'TEMPORARY',
      },
    };

    return mappings[board]?.[type] || type;
  }

  private mapLocationType(type: string, board: JobBoard): string {
    if (board === 'linkedin') {
      switch (type) {
        case 'remote':
          return 'REMOTE';
        case 'hybrid':
          return 'HYBRID';
        default:
          return 'ON_SITE';
      }
    }
    return type;
  }

  private mapExperienceLevel(level: string): string {
    const mapping: Record<string, string> = {
      entry: 'Entry level',
      mid: 'Mid-Senior level',
      senior: 'Senior',
      lead: 'Director',
      executive: 'Executive',
    };
    return mapping[level] || level;
  }
}

export default JobBoardService;
