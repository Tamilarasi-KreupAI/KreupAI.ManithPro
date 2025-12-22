// ============================================================
// COMMON TYPES - Shared types and enums used across domains
// ============================================================

// User Roles
export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN' | 'B2B' | 'CLIENT' | 'VENDOR';

// Job Types
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';

// Job Status
export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

// Application Status
export type ApplicationStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'WITHDRAWN';

// Verification Status
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

// Integration Status
export type IntegrationStatus = 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'EXPIRED';

// Skill Proficiency Levels
export type SkillProficiencyLevel = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

// Employment Types
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'APPRENTICESHIP' | 'SELF_EMPLOYED';

// Trust Score Tier
export type TrustScoreTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'unverified';

// Verification Request Status
export type VerificationRequestStatus = 'PENDING' | 'SENT' | 'COMPLETED' | 'EXPIRED' | 'DECLINED' | 'FAILED';

// Reference Request Status
export type ReferenceRequestStatus = 'PENDING' | 'SENT' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED' | 'EXPIRED';

// Endorsement Request Status
export type EndorsementRequestStatus = 'PENDING' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

// Endorser Relationship
export type EndorserRelationship = 'colleague' | 'manager' | 'direct_report' | 'client' | 'mentor' | 'mentee';

// Reference Relationship
export type ReferenceRelationship = 'direct_manager' | 'skip_level_manager' | 'hr' | 'team_lead' | 'cto' | 'ceo';

// Platform Types
export type DesignPlatformType = 'behance' | 'dribbble';
export type BlogPlatformType = 'medium' | 'devto' | 'hashnode';
export type CodingPlatformType = 'leetcode' | 'hackerrank' | 'codeforces' | 'codechef';
export type OnlineCoursePlatform = 'coursera' | 'udemy' | 'edx' | 'pluralsight' | 'linkedin_learning';
export type AcademicPlatform = 'google_scholar' | 'researchgate' | 'orcid' | 'academia';
export type PortfolioLinkType = 'portfolio' | 'project' | 'blog' | 'social' | 'video' | 'document' | 'other';
export type KaggleTier = 'Grandmaster' | 'Master' | 'Expert' | 'Contributor' | 'Novice';

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Response
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Filter Base
export interface FilterBase {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Date Range
export interface DateRange {
  start: string;
  end: string;
}

// Generic Record with Timestamps
export interface TimestampedRecord {
  createdAt: string;
  updatedAt: string;
}

// Display Order
export interface DisplayOrderable {
  displayOrder: number;
}
