// ============================================================
// KREUPAI MANITHPRO - TYPE DEFINITIONS
// ============================================================
// This file serves as the barrel export for all type definitions.
// Types are organized into domain-specific modules for better
// maintainability and code organization.
// ============================================================

// ============================================
// COMMON TYPES
// ============================================
export type {
  UserRole,
  JobType,
  JobStatus,
  ApplicationStatus,
  VerificationStatus,
  IntegrationStatus,
  SkillProficiencyLevel,
  EmploymentType,
  TrustScoreTier,
  VerificationRequestStatus,
  ReferenceRequestStatus,
  EndorsementRequestStatus,
  EndorserRelationship,
  ReferenceRelationship,
  DesignPlatformType,
  BlogPlatformType,
  CodingPlatformType,
  OnlineCoursePlatform,
  AcademicPlatform,
  PortfolioLinkType,
  KaggleTier,
  PaginationMeta,
  PaginatedResponse,
  APIResponse,
  FilterBase,
  DateRange,
  TimestampedRecord,
  DisplayOrderable,
} from './common.types';

// ============================================
// AUTH TYPES
// ============================================
export type {
  User,
  AuthResponse,
  Session,
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  TwoFactorAuth,
  TwoFactorSetup,
  TwoFactorVerifyRequest,
  SSOConfig,
  PasswordPolicy,
  SessionSettings,
  TrustedDevice,
  IPWhitelistEntry,
  LoginAnomaly,
  APIKey,
} from './auth.types';

// ============================================
// JOB TYPES
// ============================================
export type {
  Job,
  Company,
  SavedJob,
  JobFilters,
  JobStats,
  JobCreateRequest,
  JobUpdateRequest,
  JobTemplate,
} from './job.types';

// ============================================
// APPLICATION TYPES
// ============================================
export type {
  Application,
  ApplicationFilters,
  ApplicationCreateRequest,
  ApplicationUpdateRequest,
  ApplicationTimelineEvent,
  PipelineStage,
  DashboardStats,
  ApplicationBulkAction,
  ApplicationSource,
  ApplicationScore,
} from './application.types';

// ============================================
// CANDIDATE TYPES
// ============================================
export type {
  CandidateProfile,
  WorkExperience,
  Education,
  Certification,
  CandidateSkill,
  SkillEndorsement,
  Project,
  Achievement,
  ProfileCompleteness,
  SkillsMatrix,
  ExperienceTimelineSummary,
  PortfolioSummary,
  CustomPortfolioLink,
} from './candidate.types';

// ============================================
// INTEGRATION TYPES
// ============================================
export type {
  // GitHub
  GithubProfile,
  GithubRepository,
  // LinkedIn
  LinkedInProfile,
  LinkedInPosition,
  LinkedInEducation,
  LinkedInCertification,
  LinkedInSkill,
  // Stack Overflow
  StackOverflowProfile,
  StackOverflowTag,
  StackOverflowAnswer,
  StackOverflowQuestion,
  // GitLab
  GitLabProfile,
  GitLabLanguage,
  GitLabProject,
  GitLabGroup,
  // Design Portfolio
  DesignPortfolio,
  DesignProject,
  DesignProjectImage,
  // Blog Platform
  BlogPlatform,
  BlogTag,
  BlogPost,
  BlogPublication,
  // Kaggle
  KaggleProfile,
  KaggleCompetition,
  KaggleNotebook,
  // Coding Platform
  CodingPlatformProfile,
  CodingBadge,
  LanguageStat,
  CodingSkill,
  CodingSubmission,
  CodingContest,
  CodingCertificate,
  // Online Courses
  OnlineCourseProfile,
  Specialization,
  OnlineCourse,
  // Academic
  AcademicProfile,
  CoAuthor,
  Publication,
  // Status
  IntegrationStatusResponse,
} from './integration.types';

// ============================================
// INTERVIEW TYPES
// ============================================
export type {
  InterviewStatus,
  InterviewType,
  VideoRoomStatus,
  VideoQuality,
  ParticipantRole,
  ParticipantStatus,
  Interview,
  InterviewParticipant,
  InterviewFeedback,
  InterviewScheduleRequest,
  InterviewRescheduleRequest,
  InterviewCalendarEvent,
  VideoRoom,
  VideoParticipant,
  VideoRoomSettings,
  VideoRecording,
  InterviewScorecard,
  ScorecardSection,
  ScorecardCriterion,
  ScorecardTemplate as InterviewScorecardTemplate,
  InterviewAvailability,
  AvailableTimeSlot,
  InterviewPrepMaterial,
} from './interview.types';

// ============================================
// ANALYTICS TYPES
// ============================================
export type {
  FunnelAnalytics,
  FunnelStage,
  ConversionRate,
  DropOffPoint,
  TimeToHireAnalytics,
  CostPerHireAnalytics,
  SourceEffectiveness,
  SourceMetric,
  RecruiterPerformance,
  PipelineHealth,
  DashboardWidget,
  Dashboard,
  DashboardFilter,
  ScheduledReport,
  HiringSuccessPrediction,
  PredictionFactor,
  OfferAcceptancePrediction,
  RetentionRiskScore,
  RiskFactor,
  SalaryMarketData,
  TalentPoolAnalysis,
  SkillsDemandTrends,
  SkillDemand,
  DiversityAnalytics,
  DemographicBreakdown,
  DiversityGoal,
  AnalyticsReport,
  ReportExport,
} from './analytics.types';

// ============================================
// NOTIFICATION TYPES
// ============================================
export type {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  Notification,
  NotificationAction,
  NotificationPreferences,
  PushSubscription,
  NotificationFilters,
  NotificationGroup,
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  MessageReaction,
  MessageTemplate,
  ScheduledMessage,
  UserPresence,
  TypingIndicator,
  WebSocketEvent,
} from './notification.types';

// ============================================
// TEAM TYPES
// ============================================
export type {
  TeamRole,
  Permission,
  HiringTeam,
  TeamMember,
  TeamSettings,
  AutoAssignmentRule,
  TeamInvitation,
  Workload,
  CoverageSchedule,
  ScorecardTemplate,
  Evaluation,
  EvaluationScore,
  FeedbackAggregation,
  CalibrationSession,
  CalibrationOutcome,
  DecisionVote,
  DecisionSummary,
  ActivityLog,
  AuditTrail,
} from './team.types';
