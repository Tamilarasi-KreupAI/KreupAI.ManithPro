// ============================================================
// JOB TYPES - Job listings and related types
// ============================================================

import { JobType, JobStatus, TimestampedRecord, FilterBase } from './common.types';

// Job Interface
export interface Job extends TimestampedRecord {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: JobType;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  benefits: string[];
  skills: string[];
  experience?: string;
  education?: string;
  status: JobStatus;
  positions: number;
  deadline?: string;
  companyName: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyLogo?: string;
  companySize?: string;
  companyIndustry?: string;
  postedById: string;
  postedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    applications: number;
  };
}

// Company
export interface Company {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  size?: string;
  industry?: string;
  totalJobs?: number;
  openJobs?: number;
}

// Saved Job
export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
  job: Job;
}

// Job Filters
export interface JobFilters extends FilterBase {
  status?: JobStatus;
  type?: JobType | JobType[];
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  experience?: string;
  companyName?: string;
  industry?: string;
  postedAfter?: string;
  postedBefore?: string;
}

// Job Stats
export interface JobStats {
  totalViews: number;
  uniqueViews: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  viewsOverTime: { date: string; views: number }[];
  applicationsOverTime: { date: string; applications: number }[];
  topSources: { source: string; count: number }[];
  averageTimeToApply: number;
}

// Job Create/Update
export interface JobCreateRequest {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: JobType;
  salaryMin?: number;
  salaryMax?: number;
  benefits?: string[];
  skills: string[];
  experience?: string;
  education?: string;
  positions?: number;
  deadline?: string;
}

export interface JobUpdateRequest extends Partial<JobCreateRequest> {
  status?: JobStatus;
}

// Job Template
export interface JobTemplate {
  id: string;
  name: string;
  description?: string;
  template: Partial<Job>;
  category?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}
