-- ============================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- (Fully consistent with init migration)
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_users_role_created"
ON "users" ("role", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_users_location"
ON "users" ("location");

CREATE INDEX IF NOT EXISTS "idx_users_skills"
ON "users" USING GIN ("skills");

CREATE INDEX IF NOT EXISTS "idx_users_search"
ON "users" USING GIN (
  to_tsvector(
    'english',
    COALESCE("firstName", '') || ' ' ||
    COALESCE("lastName", '') || ' ' ||
    COALESCE("email", '')
  )
);

-- ============================================================
-- JOBS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_jobs_status_created"
ON "jobs" ("status", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_jobs_type"
ON "jobs" ("type");

CREATE INDEX IF NOT EXISTS "idx_jobs_company"
ON "jobs" ("companyName");

CREATE INDEX IF NOT EXISTS "idx_jobs_location"
ON "jobs" ("location");

CREATE INDEX IF NOT EXISTS "idx_jobs_salary_range"
ON "jobs" ("salaryMin", "salaryMax");

CREATE INDEX IF NOT EXISTS "idx_jobs_skills"
ON "jobs" USING GIN ("skills");

CREATE INDEX IF NOT EXISTS "idx_jobs_search"
ON "jobs" USING GIN (
  to_tsvector(
    'english',
    COALESCE("title", '') || ' ' ||
    COALESCE("description", '') || ' ' ||
    COALESCE("companyName", '')
  )
);

-- ============================================================
-- APPLICATIONS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_applications_job_status_created"
ON "applications" ("jobId", "status", "appliedAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_applications_candidate_status_created"
ON "applications" ("candidateId", "status", "appliedAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_applications_status"
ON "applications" ("status");

-- ============================================================
-- SAVED JOBS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_saved_jobs_user_created"
ON "saved_jobs" ("userId", "savedAt" DESC);

-- ============================================================
-- INTERVIEWS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_interviews_status_scheduled"
ON "interviews" ("status", "scheduledAt");

CREATE INDEX IF NOT EXISTS "idx_interviews_application"
ON "interviews" ("applicationId");

CREATE INDEX IF NOT EXISTS "idx_interviews_scheduler"
ON "interviews" ("scheduledById", "scheduledAt");

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_messages_thread"
ON "messages" ("senderId", "receiverId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_messages_application"
ON "messages" ("applicationId", "createdAt" DESC)
WHERE "applicationId" IS NOT NULL;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_notifications_user_read"
ON "notifications" ("userId", "isRead");

CREATE INDEX IF NOT EXISTS "idx_notifications_created"
ON "notifications" ("createdAt" DESC);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_audit_logs_user"
ON "audit_logs" ("userId");

CREATE INDEX IF NOT EXISTS "idx_audit_logs_entity"
ON "audit_logs" ("entity", "entityId");

CREATE INDEX IF NOT EXISTS "idx_audit_logs_created"
ON "audit_logs" ("createdAt" DESC);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_subscriptions_status"
ON "subscriptions" ("status");

CREATE INDEX IF NOT EXISTS "idx_subscriptions_user"
ON "subscriptions" ("userId");

CREATE INDEX IF NOT EXISTS "idx_subscriptions_enddate"
ON "subscriptions" ("endDate");

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_payments_status"
ON "payments" ("status");

CREATE INDEX IF NOT EXISTS "idx_payments_created"
ON "payments" ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_payments_subscription"
ON "payments" ("subscriptionId");

-- ============================================================
-- INVOICES
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_invoices_status"
ON "invoices" ("status");

CREATE INDEX IF NOT EXISTS "idx_invoices_created"
ON "invoices" ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_invoices_subscription"
ON "invoices" ("subscriptionId");

-- ============================================================
-- ERROR LOGS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_error_logs_level"
ON "error_logs" ("level");

CREATE INDEX IF NOT EXISTS "idx_error_logs_resolved"
ON "error_logs" ("resolved");

CREATE INDEX IF NOT EXISTS "idx_error_logs_created"
ON "error_logs" ("createdAt" DESC);

-- ============================================================
-- SYSTEM CONFIGS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_system_configs_category"
ON "system_configs" ("category");

CREATE INDEX IF NOT EXISTS "idx_system_configs_public"
ON "system_configs" ("isPublic");

-- ============================================================
-- STATISTICS
-- ============================================================

ANALYZE "users";
ANALYZE "jobs";
ANALYZE "applications";
ANALYZE "saved_jobs";
ANALYZE "interviews";
ANALYZE "messages";
ANALYZE "notifications";
ANALYZE "audit_logs";
ANALYZE "subscriptions";
ANALYZE "payments";
ANALYZE "invoices";
ANALYZE "error_logs";
ANALYZE "system_configs";
