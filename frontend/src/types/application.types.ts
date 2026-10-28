// ============================================================
// APPLICATION TYPES - Job applications and related types
// ============================================================

import { ApplicationStatus, JobType, TimestampedRecord, FilterBase } from './common.types';
import { User } from './auth.types';

// Application Interface
export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  resume: string;
  coverLetter?: string;
  status: ApplicationStatus;
  notes?: string;
  appliedAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    location: string;
    type: JobType;
  };
  candidate?: User;
}

// Application Filters
export interface ApplicationFilters extends FilterBase {
  status?: ApplicationStatus | ApplicationStatus[];
  jobId?: string;
  candidateId?: string;
  appliedAfter?: string;
  appliedBefore?: string;
  source?: string;
  tags?: string[];
}

// Application Create Request
export interface ApplicationCreateRequest {
  jobId: string;
  resume: string | File;
  coverLetter?: string;
}

// Application Update Request
export interface ApplicationUpdateRequest {
  status?: ApplicationStatus;
  notes?: string;
  tags?: string[];
}

// Application Timeline Event
export interface ApplicationTimelineEvent {
  id: string;
  applicationId: string;
  type: 'status_change' | 'note_added' | 'email_sent' | 'interview_scheduled' | 'feedback_received' | 'document_uploaded';
  title: string;
  description?: string;
  oldValue?: string;
  newValue?: string;
  performedBy?: {
    id: string;
    name: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Pipeline Stage
export interface PipelineStage {
  id: string;
  name: string;
  status: ApplicationStatus;
  order: number;
  color?: string;
  count: number;
  applications?: Application[];
}

// Dashboard Stats
export interface DashboardStats {
  totalJobs?: number;
  openJobs?: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications?: number;
  recentApplications: Application[];
  avgTimeToHire?: number;
  timeToHire?: number;
  responseRate?: number;
}

// Application Bulk Action
export interface ApplicationBulkAction {
  applicationIds: string[];
  action: 'update_status' | 'add_tag' | 'remove_tag' | 'assign' | 'archive' | 'delete';
  payload?: {
    status?: ApplicationStatus;
    tag?: string;
    assigneeId?: string;
  };
}

// Application Source
export interface ApplicationSource {
  id: string;
  name: string;
  type: 'job_board' | 'referral' | 'career_site' | 'social' | 'agency' | 'direct' | 'other';
  count: number;
  percentage: number;
}

// Application Score
export interface ApplicationScore {
  id: string;
  applicationId: string;
  scoreType: 'ai' | 'manual' | 'assessment';
  overallScore: number;
  breakdown?: Record<string, number>;
  notes?: string;
  scoredBy?: string;
  scoredAt: string;
}
