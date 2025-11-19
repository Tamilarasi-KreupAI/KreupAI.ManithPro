// Job Posting Management Service
// Handles job posting creation, editing, publishing, and lifecycle management

export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
export type WorkLocation = 'REMOTE' | 'ONSITE' | 'HYBRID';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  status: JobStatus;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  workLocation: WorkLocation;
  location?: string; // City, State or Country
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  skills: string[];
  benefits: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  applicationDeadline?: string;
  openings: number;
  recruiterIds: string[];
  hiringManagerId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
  views: number;
  applications: number;
  templateId?: string;
}

export interface JobTemplate {
  id: string;
  name: string;
  description: string;
  department: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  workLocation: WorkLocation;
  descriptionTemplate: string;
  responsibilitiesTemplate: string[];
  requirementsTemplate: string[];
  niceToHaveTemplate: string[];
  skillsTemplate: string[];
  benefitsTemplate: string[];
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

export interface JobFilters {
  statuses?: JobStatus[];
  departments?: string[];
  employmentTypes?: EmploymentType[];
  experienceLevels?: ExperienceLevel[];
  workLocations?: WorkLocation[];
  recruiterId?: string;
  searchQuery?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface JobStats {
  total: number;
  byStatus: Record<JobStatus, number>;
  byDepartment: Record<string, number>;
  totalApplications: number;
  totalViews: number;
  avgApplicationsPerJob: number;
  avgTimeToFill: number; // in days
  recentlyPosted: number; // last 7 days
}

class JobService {
  private static instance: JobService;
  private apiBase = '/api/jobs';

  private constructor() {}

  public static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService();
    }
    return JobService.instance;
  }

  // Create new job posting
  async createJob(jobData: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'applications'>): Promise<JobPosting> {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) throw new Error('Failed to create job posting');
      return await response.json();
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw error;
    }
  }

  // Update existing job posting
  async updateJob(id: string, jobData: Partial<JobPosting>): Promise<JobPosting> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) throw new Error('Failed to update job posting');
      return await response.json();
    } catch (error) {
      console.error('Error updating job posting:', error);
      throw error;
    }
  }

  // Get all job postings with optional filtering
  async getJobs(filters?: JobFilters): Promise<JobPosting[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.statuses) params.append('statuses', filters.statuses.join(','));
        if (filters.departments) params.append('departments', filters.departments.join(','));
        if (filters.employmentTypes) params.append('employmentTypes', filters.employmentTypes.join(','));
        if (filters.experienceLevels) params.append('experienceLevels', filters.experienceLevels.join(','));
        if (filters.workLocations) params.append('workLocations', filters.workLocations.join(','));
        if (filters.recruiterId) params.append('recruiterId', filters.recruiterId);
        if (filters.searchQuery) params.append('q', filters.searchQuery);
        if (filters.dateRange) {
          params.append('dateFrom', filters.dateRange.from);
          params.append('dateTo', filters.dateRange.to);
        }
      }

      const response = await fetch(`${this.apiBase}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return this.getMockJobs();
    }
  }

  // Get single job posting
  async getJob(id: string): Promise<JobPosting | null> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch job');
      return await response.json();
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }

  // Delete job posting
  async deleteJob(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete job');
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Change job status
  async changeJobStatus(id: string, status: JobStatus): Promise<JobPosting> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to change job status');
      return await response.json();
    } catch (error) {
      console.error('Error changing job status:', error);
      throw error;
    }
  }

  // Publish job (DRAFT -> ACTIVE)
  async publishJob(id: string): Promise<JobPosting> {
    return this.changeJobStatus(id, 'ACTIVE');
  }

  // Pause job
  async pauseJob(id: string): Promise<JobPosting> {
    return this.changeJobStatus(id, 'PAUSED');
  }

  // Close job
  async closeJob(id: string): Promise<JobPosting> {
    return this.changeJobStatus(id, 'CLOSED');
  }

  // Duplicate job posting
  async duplicateJob(id: string): Promise<JobPosting> {
    try {
      const response = await fetch(`${this.apiBase}/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to duplicate job');
      return await response.json();
    } catch (error) {
      console.error('Error duplicating job:', error);
      throw error;
    }
  }

  // Get job statistics
  async getJobStats(): Promise<JobStats> {
    try {
      const response = await fetch(`${this.apiBase}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch job stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching job stats:', error);
      return this.getMockStats();
    }
  }

  // Template Management

  // Get all templates
  async getTemplates(): Promise<JobTemplate[]> {
    try {
      const response = await fetch(`${this.apiBase}/templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch templates');
      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.getMockTemplates();
    }
  }

  // Create template from job
  async createTemplate(templateData: Omit<JobTemplate, 'id' | 'createdAt' | 'usageCount'>): Promise<JobTemplate> {
    try {
      const response = await fetch(`${this.apiBase}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) throw new Error('Failed to create template');
      return await response.json();
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Create job from template
  async createJobFromTemplate(templateId: string, overrides?: Partial<JobPosting>): Promise<JobPosting> {
    try {
      const response = await fetch(`${this.apiBase}/templates/${templateId}/create-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(overrides || {}),
      });

      if (!response.ok) throw new Error('Failed to create job from template');
      return await response.json();
    } catch (error) {
      console.error('Error creating job from template:', error);
      throw error;
    }
  }

  // Delete template
  async deleteTemplate(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete template');
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  // Helper: Get status label
  getStatusLabel(status: JobStatus): string {
    const labels: Record<JobStatus, string> = {
      DRAFT: 'Draft',
      ACTIVE: 'Active',
      PAUSED: 'Paused',
      CLOSED: 'Closed',
      ARCHIVED: 'Archived',
    };
    return labels[status];
  }

  // Helper: Get status color
  getStatusColor(status: JobStatus): string {
    const colors: Record<JobStatus, string> = {
      DRAFT: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      ACTIVE: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
      PAUSED: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      CLOSED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
      ARCHIVED: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    };
    return colors[status];
  }

  // Helper: Format salary range
  formatSalaryRange(salaryRange?: { min: number; max: number; currency: string }): string {
    if (!salaryRange) return 'Salary not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salaryRange.currency,
      minimumFractionDigits: 0,
    });
    return `${formatter.format(salaryRange.min)} - ${formatter.format(salaryRange.max)}`;
  }

  // Mock data for development
  private getMockJobs(): JobPosting[] {
    return [
      {
        id: 'job-1',
        title: 'Senior Frontend Developer',
        department: 'Engineering',
        status: 'ACTIVE',
        employmentType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        workLocation: 'HYBRID',
        location: 'San Francisco, CA',
        description: 'We are looking for a talented Senior Frontend Developer to join our team...',
        responsibilities: [
          'Build and maintain high-quality React applications',
          'Collaborate with design and backend teams',
          'Mentor junior developers',
        ],
        requirements: [
          '5+ years of React development experience',
          'Strong TypeScript skills',
          'Experience with modern frontend tools',
        ],
        niceToHave: [
          'Experience with Next.js',
          'GraphQL knowledge',
        ],
        skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
        benefits: ['Health Insurance', '401k', 'Remote Work', 'Unlimited PTO'],
        salaryRange: {
          min: 120000,
          max: 180000,
          currency: 'USD',
        },
        openings: 2,
        recruiterIds: ['rec-1'],
        createdBy: 'user-1',
        createdAt: '2025-01-10',
        updatedAt: '2025-01-15',
        publishedAt: '2025-01-12',
        views: 1250,
        applications: 45,
      },
    ];
  }

  private getMockStats(): JobStats {
    return {
      total: 25,
      byStatus: {
        DRAFT: 5,
        ACTIVE: 12,
        PAUSED: 3,
        CLOSED: 4,
        ARCHIVED: 1,
      },
      byDepartment: {
        Engineering: 15,
        Marketing: 5,
        Sales: 3,
        Design: 2,
      },
      totalApplications: 450,
      totalViews: 12500,
      avgApplicationsPerJob: 18,
      avgTimeToFill: 35,
      recentlyPosted: 3,
    };
  }

  private getMockTemplates(): JobTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Software Engineer Template',
        description: 'Standard template for software engineering roles',
        department: 'Engineering',
        employmentType: 'FULL_TIME',
        experienceLevel: 'MID',
        workLocation: 'HYBRID',
        descriptionTemplate: 'We are seeking a talented Software Engineer...',
        responsibilitiesTemplate: [
          'Design and develop software solutions',
          'Collaborate with cross-functional teams',
          'Write clean, maintainable code',
        ],
        requirementsTemplate: [
          'Bachelor\'s degree in Computer Science or related field',
          'Experience with modern programming languages',
          'Strong problem-solving skills',
        ],
        niceToHaveTemplate: [
          'Experience with cloud platforms',
          'Open source contributions',
        ],
        skillsTemplate: ['JavaScript', 'Python', 'Git'],
        benefitsTemplate: ['Health Insurance', '401k', 'Professional Development'],
        createdBy: 'user-1',
        createdAt: '2025-01-01',
        usageCount: 12,
      },
    ];
  }
}

export const jobService = JobService.getInstance();
