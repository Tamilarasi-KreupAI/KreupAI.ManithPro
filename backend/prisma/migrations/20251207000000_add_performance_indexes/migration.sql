-- ============================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ============================================================
-- This migration adds additional indexes to improve query performance
-- for common access patterns identified in the application.
--
-- Best Practices Applied:
-- 1. Composite indexes for frequently filtered/sorted columns
-- 2. Partial indexes for status-based queries
-- 3. GIN indexes for array/full-text search
-- 4. Covering indexes for frequently accessed columns
-- ============================================================

-- ============================================================
-- USER INDEXES
-- ============================================================

-- Index for active user lookups (most common query pattern)
CREATE INDEX IF NOT EXISTS "idx_user_active_email"
ON "User" (email)
WHERE "isActive" = true;

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS "idx_user_role_created"
ON "User" (role, "createdAt" DESC);

-- Index for user search
CREATE INDEX IF NOT EXISTS "idx_user_search"
ON "User" USING GIN (
  to_tsvector('english', COALESCE("firstName", '') || ' ' || COALESCE("lastName", '') || ' ' || COALESCE(email, ''))
);

-- ============================================================
-- JOB INDEXES
-- ============================================================

-- Composite index for job listing queries (status + created date)
CREATE INDEX IF NOT EXISTS "idx_job_status_created_desc"
ON "Job" (status, "createdAt" DESC);

-- Index for open jobs only (partial index - most common filter)
CREATE INDEX IF NOT EXISTS "idx_job_open"
ON "Job" ("createdAt" DESC)
WHERE status = 'OPEN';

-- Index for job search by company
CREATE INDEX IF NOT EXISTS "idx_job_company_status"
ON "Job" ("companyName", status);

-- Index for location-based job search
CREATE INDEX IF NOT EXISTS "idx_job_location"
ON "Job" (location)
WHERE status = 'OPEN';

-- Index for salary range queries
CREATE INDEX IF NOT EXISTS "idx_job_salary_range"
ON "Job" ("salaryMin", "salaryMax")
WHERE status = 'OPEN';

-- Index for department filtering
CREATE INDEX IF NOT EXISTS "idx_job_department_status"
ON "Job" (department, status);

-- GIN index for skills array search
CREATE INDEX IF NOT EXISTS "idx_job_skills"
ON "Job" USING GIN (skills);

-- Full-text search index for job content
CREATE INDEX IF NOT EXISTS "idx_job_search"
ON "Job" USING GIN (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE("companyName", ''))
);

-- ============================================================
-- APPLICATION INDEXES
-- ============================================================

-- Composite index for application pipeline queries
CREATE INDEX IF NOT EXISTS "idx_application_job_status"
ON "Application" ("jobId", status, "createdAt" DESC);

-- Index for candidate's applications
CREATE INDEX IF NOT EXISTS "idx_application_candidate_status"
ON "Application" ("candidateId", status, "createdAt" DESC);

-- Index for recent applications (screening/review)
CREATE INDEX IF NOT EXISTS "idx_application_screening"
ON "Application" ("createdAt" DESC)
WHERE status IN ('APPLIED', 'SCREENING');

-- Index for applications pending interview
CREATE INDEX IF NOT EXISTS "idx_application_interview"
ON "Application" ("jobId", "createdAt" DESC)
WHERE status = 'INTERVIEW';

-- Index for offer management
CREATE INDEX IF NOT EXISTS "idx_application_offer"
ON "Application" ("updatedAt" DESC)
WHERE status = 'OFFER';

-- ============================================================
-- INTERVIEW INDEXES
-- ============================================================

-- Index for upcoming interviews (most common query)
CREATE INDEX IF NOT EXISTS "idx_interview_upcoming"
ON "Interview" ("scheduledAt")
WHERE status = 'SCHEDULED' AND "scheduledAt" > NOW();

-- Index for interviewer's schedule
CREATE INDEX IF NOT EXISTS "idx_interview_scheduler"
ON "Interview" ("scheduledById", "scheduledAt");

-- Index for application's interviews
CREATE INDEX IF NOT EXISTS "idx_interview_application_status"
ON "Interview" ("applicationId", status);

-- Composite index for calendar views
CREATE INDEX IF NOT EXISTS "idx_interview_calendar"
ON "Interview" ("scheduledAt", status, type);

-- ============================================================
-- MESSAGE INDEXES
-- ============================================================

-- Index for conversation threads
CREATE INDEX IF NOT EXISTS "idx_message_conversation"
ON "Message" ("senderId", "receiverId", "createdAt" DESC);

-- Index for unread messages
CREATE INDEX IF NOT EXISTS "idx_message_unread"
ON "Message" ("receiverId", "createdAt" DESC)
WHERE "isRead" = false;

-- Index for application-related messages
CREATE INDEX IF NOT EXISTS "idx_message_application"
ON "Message" ("applicationId", "createdAt" DESC)
WHERE "applicationId" IS NOT NULL;

-- ============================================================
-- NOTIFICATION INDEXES
-- ============================================================

-- Index for user's unread notifications
CREATE INDEX IF NOT EXISTS "idx_notification_user_unread"
ON "Notification" ("userId", "createdAt" DESC)
WHERE "isRead" = false;

-- Index for notification type filtering
CREATE INDEX IF NOT EXISTS "idx_notification_user_type"
ON "Notification" ("userId", type, "createdAt" DESC);

-- ============================================================
-- CANDIDATE PROFILE INDEXES
-- ============================================================

-- GIN index for skills-based candidate search
CREATE INDEX IF NOT EXISTS "idx_candidate_skills"
ON "CandidateProfile" USING GIN (skills);

-- Index for candidate search by experience
CREATE INDEX IF NOT EXISTS "idx_candidate_experience"
ON "CandidateProfile" ("experienceYears" DESC, "isOpenToWork");

-- Index for location-based candidate search
CREATE INDEX IF NOT EXISTS "idx_candidate_location"
ON "CandidateProfile" (location)
WHERE "isOpenToWork" = true;

-- Full-text search for candidate profiles
CREATE INDEX IF NOT EXISTS "idx_candidate_search"
ON "CandidateProfile" USING GIN (
  to_tsvector('english', COALESCE(headline, '') || ' ' || COALESCE(summary, ''))
);

-- ============================================================
-- SAVED JOB INDEXES
-- ============================================================

-- Index for user's saved jobs
CREATE INDEX IF NOT EXISTS "idx_savedjob_user_created"
ON "SavedJob" ("userId", "createdAt" DESC);

-- ============================================================
-- AUDIT LOG INDEXES
-- ============================================================

-- Index for entity-based audit trail
CREATE INDEX IF NOT EXISTS "idx_auditlog_entity"
ON "AuditLog" (entity, "entityId", "createdAt" DESC);

-- Index for user activity audit
CREATE INDEX IF NOT EXISTS "idx_auditlog_user_action"
ON "AuditLog" ("userId", action, "createdAt" DESC);

-- Index for date-range audit queries
CREATE INDEX IF NOT EXISTS "idx_auditlog_created"
ON "AuditLog" ("createdAt" DESC);

-- ============================================================
-- SESSION INDEXES
-- ============================================================

-- Index for active sessions
CREATE INDEX IF NOT EXISTS "idx_session_user_active"
ON "UserSession" ("userId", "expiresAt")
WHERE "isActive" = true;

-- Index for session expiry cleanup
CREATE INDEX IF NOT EXISTS "idx_session_expires"
ON "UserSession" ("expiresAt")
WHERE "isActive" = true;

-- ============================================================
-- ANALYTICS HELPER INDEXES
-- ============================================================

-- Index for daily application counts
CREATE INDEX IF NOT EXISTS "idx_application_daily"
ON "Application" (DATE("createdAt"), status);

-- Index for job posting trends
CREATE INDEX IF NOT EXISTS "idx_job_daily"
ON "Job" (DATE("createdAt"), status);

-- ============================================================
-- VERIFICATION INDEXES
-- ============================================================

-- Index for pending verifications
CREATE INDEX IF NOT EXISTS "idx_verification_pending"
ON "VerifiedBadge" ("userId", "verifiedAt")
WHERE "verifiedAt" IS NULL;

-- ============================================================
-- STATISTICS UPDATE
-- ============================================================

-- Update table statistics for query planner
ANALYZE "User";
ANALYZE "Job";
ANALYZE "Application";
ANALYZE "Interview";
ANALYZE "Message";
ANALYZE "Notification";
ANALYZE "CandidateProfile";
ANALYZE "SavedJob";
ANALYZE "AuditLog";
