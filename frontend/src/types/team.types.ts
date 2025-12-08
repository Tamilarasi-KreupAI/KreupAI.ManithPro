// ============================================================
// TEAM TYPES - Hiring team management and collaboration
// ============================================================

import { TimestampedRecord } from './common.types';

// Team Role
export type TeamRole = 'owner' | 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | 'viewer';

// Permission
export type Permission =
  | 'jobs:create'
  | 'jobs:edit'
  | 'jobs:delete'
  | 'jobs:publish'
  | 'applications:view'
  | 'applications:edit'
  | 'applications:move'
  | 'applications:reject'
  | 'applications:offer'
  | 'interviews:schedule'
  | 'interviews:conduct'
  | 'interviews:feedback'
  | 'candidates:view'
  | 'candidates:contact'
  | 'candidates:export'
  | 'reports:view'
  | 'reports:create'
  | 'settings:manage'
  | 'team:manage';

// Hiring Team
export interface HiringTeam extends TimestampedRecord {
  id: string;
  name: string;
  description?: string;
  department?: string;
  members: TeamMember[];
  jobs: string[];
  settings: TeamSettings;
  isActive: boolean;
}

// Team Member
export interface TeamMember extends TimestampedRecord {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  permissions: Permission[];
  isActive: boolean;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    title?: string;
  };
}

// Team Settings
export interface TeamSettings {
  allowSelfAssignment: boolean;
  requireFeedback: boolean;
  feedbackDeadline: number; // hours
  defaultInterviewers: string[];
  notifyOnNewApplication: boolean;
  notifyOnStageChange: boolean;
  autoAssignmentEnabled: boolean;
  autoAssignmentRules?: AutoAssignmentRule[];
}

// Auto Assignment Rule
export interface AutoAssignmentRule {
  id: string;
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'in';
    value: string | string[];
  };
  assignTo: string[];
  priority: number;
}

// Team Invitation
export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  permissions: Permission[];
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  createdAt: string;
}

// Workload
export interface Workload {
  userId: string;
  name: string;
  metrics: {
    activeApplications: number;
    pendingReviews: number;
    scheduledInterviews: number;
    pendingFeedback: number;
    openRequisitions: number;
  };
  capacity: number;
  utilizationRate: number;
  trend: { date: string; applications: number }[];
}

// Coverage Schedule
export interface CoverageSchedule {
  id: string;
  teamId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  assignedMembers: string[];
  isActive: boolean;
}

// ============================================
// Collaborative Evaluation
// ============================================

// Scorecard Template
export interface ScorecardTemplate {
  id: string;
  name: string;
  description?: string;
  teamId?: string;
  jobId?: string;
  interviewType?: string;
  sections: ScorecardSection[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Scorecard Section
export interface ScorecardSection {
  id: string;
  name: string;
  description?: string;
  weight: number;
  criteria: ScorecardCriterion[];
  order: number;
}

// Scorecard Criterion
export interface ScorecardCriterion {
  id: string;
  name: string;
  description?: string;
  type: 'rating' | 'yes_no' | 'text';
  maxRating?: number;
  isRequired: boolean;
  order: number;
}

// Evaluation
export interface Evaluation extends TimestampedRecord {
  id: string;
  applicationId: string;
  evaluatorId: string;
  scorecardId?: string;
  interviewId?: string;
  scores: EvaluationScore[];
  overallRating?: number;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire' | 'undecided';
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  isBlind: boolean;
  isSubmitted: boolean;
  submittedAt?: string;
}

// Evaluation Score
export interface EvaluationScore {
  criterionId: string;
  rating?: number;
  value?: string;
  notes?: string;
}

// Feedback Aggregation
export interface FeedbackAggregation {
  applicationId: string;
  totalEvaluations: number;
  submittedCount: number;
  averageRating: number;
  recommendations: Record<string, number>;
  criteriaAverages: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  consensusReached: boolean;
  suggestedDecision?: string;
}

// Calibration Session
export interface CalibrationSession extends TimestampedRecord {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  applications: string[];
  participants: string[];
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  outcomes?: CalibrationOutcome[];
  notes?: string;
}

// Calibration Outcome
export interface CalibrationOutcome {
  applicationId: string;
  originalDecision?: string;
  calibratedDecision: string;
  adjustments: string[];
  consensus: boolean;
}

// Decision Vote
export interface DecisionVote {
  id: string;
  applicationId: string;
  voterId: string;
  vote: 'hire' | 'no_hire' | 'needs_discussion';
  confidence: number;
  reasoning?: string;
  createdAt: string;
}

// Decision Summary
export interface DecisionSummary {
  applicationId: string;
  totalVotes: number;
  hireVotes: number;
  noHireVotes: number;
  discussionVotes: number;
  averageConfidence: number;
  consensusReached: boolean;
  finalDecision?: string;
  decidedBy?: string;
  decidedAt?: string;
}

// ============================================
// Activity & Audit
// ============================================

// Activity Log
export interface ActivityLog extends TimestampedRecord {
  id: string;
  userId: string;
  action: string;
  entityType: 'application' | 'job' | 'interview' | 'candidate' | 'team' | 'user';
  entityId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Audit Trail
export interface AuditTrail extends TimestampedRecord {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}
