-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'VENDOR';
ALTER TYPE "UserRole" ADD VALUE 'CLIENT';

-- DropIndex
DROP INDEX "candidate_profiles_completenessScore_idx";

-- DropIndex
DROP INDEX "candidate_profiles_isPublic_idx";

-- DropIndex
DROP INDEX "candidate_profiles_userId_idx";

-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "proposal_id" INTEGER;

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiter_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "companySize" TEXT,
    "industry" TEXT,
    "companyDescription" TEXT,
    "title" TEXT,
    "department" TEXT,
    "yearsOfExperience" INTEGER NOT NULL DEFAULT 0,
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hiringRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activeJobs" INTEGER NOT NULL DEFAULT 0,
    "totalHires" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiter_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "vendorUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultants" (
    "id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "skills" TEXT[],
    "experience_years" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" SERIAL NOT NULL,
    "requirement_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "consultant_id" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    "submitted_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirements" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "required_count" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encryption_keys" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "keyType" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'AES-256-GCM',
    "encryptedKeyMaterial" TEXT NOT NULL,
    "keyCheckValue" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousKeyId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "purpose" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedOperations" TEXT[] DEFAULT ARRAY['encrypt', 'decrypt']::TEXT[],
    "isHSMKey" BOOLEAN NOT NULL DEFAULT false,
    "hsmProvider" TEXT,
    "hsmKeyId" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encryption_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_rotation_schedules" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "rotationIntervalDays" INTEGER NOT NULL DEFAULT 90,
    "nextRotationAt" TIMESTAMP(3),
    "lastRotatedAt" TIMESTAMP(3),
    "notifyBeforeDays" INTEGER NOT NULL DEFAULT 14,
    "notifyEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "autoRotate" BOOLEAN NOT NULL DEFAULT false,
    "autoRevokeOldDays" INTEGER,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_rotation_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pii_detection_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "scanFrequency" TEXT NOT NULL DEFAULT 'REALTIME',
    "detectEmail" BOOLEAN NOT NULL DEFAULT true,
    "detectPhone" BOOLEAN NOT NULL DEFAULT true,
    "detectSSN" BOOLEAN NOT NULL DEFAULT true,
    "detectCreditCard" BOOLEAN NOT NULL DEFAULT true,
    "detectAddress" BOOLEAN NOT NULL DEFAULT true,
    "customPatterns" JSONB,
    "defaultAction" TEXT NOT NULL DEFAULT 'MASK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pii_detection_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pii_detection_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceLocation" TEXT,
    "piiType" TEXT NOT NULL,
    "piiCount" INTEGER NOT NULL DEFAULT 1,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "actionTaken" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pii_detection_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anonymization_rules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetTable" TEXT NOT NULL,
    "targetColumn" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "methodConfig" JSONB,
    "conditions" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anonymization_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anonymization_jobs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "jobType" TEXT NOT NULL,
    "targetEnvironment" TEXT,
    "includeTables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludeTables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ruleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "cronExpression" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anonymization_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secure_files" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "uploadedBy" TEXT,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "storageProvider" TEXT NOT NULL DEFAULT 'LOCAL',
    "storagePath" TEXT NOT NULL,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "encryptionKeyId" TEXT,
    "encryptionAlgorithm" TEXT,
    "checksum" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'INTERNAL',
    "accessLevel" TEXT NOT NULL DEFAULT 'OWNER',
    "allowedUsers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "containsPII" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deleteReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secure_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_access_logs" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_residency_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "primaryRegion" TEXT NOT NULL DEFAULT 'us-east-1',
    "primaryProvider" TEXT NOT NULL DEFAULT 'aws',
    "secondaryRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enableReplication" BOOLEAN NOT NULL DEFAULT false,
    "replicationMode" TEXT,
    "gdprCompliant" BOOLEAN NOT NULL DEFAULT false,
    "ccpaCompliant" BOOLEAN NOT NULL DEFAULT false,
    "dataCategories" JSONB,
    "allowCrossBorderTransfer" BOOLEAN NOT NULL DEFAULT true,
    "requiredCertifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_residency_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "backupType" TEXT NOT NULL DEFAULT 'FULL',
    "includeTables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludeTables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "includeFiles" BOOLEAN NOT NULL DEFAULT true,
    "schedule" TEXT,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "maxBackups" INTEGER NOT NULL DEFAULT 10,
    "storageProvider" TEXT,
    "storagePath" TEXT,
    "storageRegion" TEXT,
    "encryptBackups" BOOLEAN NOT NULL DEFAULT true,
    "encryptionKeyId" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnSuccess" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" TEXT NOT NULL,
    "configId" TEXT,
    "organizationId" TEXT,
    "backupType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "triggeredBy" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "sizeBytes" BIGINT,
    "compressedSizeBytes" BIGINT,
    "recordCount" INTEGER,
    "storagePath" TEXT,
    "checksum" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "encryptionKeyId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationResult" JSONB,
    "expiresAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restore_jobs" (
    "id" TEXT NOT NULL,
    "backupId" TEXT NOT NULL,
    "organizationId" TEXT,
    "restoreType" TEXT NOT NULL DEFAULT 'FULL',
    "targetEnvironment" TEXT,
    "includeTables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludeTables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pointInTime" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "recordsRestored" INTEGER,
    "validateAfterRestore" BOOLEAN NOT NULL DEFAULT true,
    "validationResult" JSONB,
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restore_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tls_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "minVersion" TEXT NOT NULL DEFAULT '1.2',
    "preferredVersion" TEXT NOT NULL DEFAULT '1.3',
    "allowedCipherSuites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disabledCipherSuites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hstsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "hstsMaxAge" INTEGER NOT NULL DEFAULT 31536000,
    "hstsIncludeSubdomains" BOOLEAN NOT NULL DEFAULT true,
    "hstsPreload" BOOLEAN NOT NULL DEFAULT false,
    "enableCertTransparency" BOOLEAN NOT NULL DEFAULT true,
    "enableOCSPStapling" BOOLEAN NOT NULL DEFAULT true,
    "clientCertRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tls_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_protection_audit_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "eventType" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_protection_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hiring_success_predictions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "successProbability" DOUBLE PRECISION NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "predictionGrade" TEXT NOT NULL,
    "skillMatchScore" DOUBLE PRECISION NOT NULL,
    "experienceMatchScore" DOUBLE PRECISION NOT NULL,
    "cultureFitScore" DOUBLE PRECISION NOT NULL,
    "motivationScore" DOUBLE PRECISION NOT NULL,
    "stabilityScore" DOUBLE PRECISION NOT NULL,
    "overallRiskLevel" TEXT NOT NULL,
    "riskFactors" JSONB,
    "positiveSignals" JSONB,
    "negativeSignals" JSONB,
    "actualOutcome" TEXT,
    "outcomeNotes" TEXT,
    "outcomeRecordedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hiring_success_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_to_hire_forecasts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "predictedDays" INTEGER NOT NULL,
    "confidenceInterval" JSONB,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "sourcingDays" INTEGER NOT NULL,
    "screeningDays" INTEGER NOT NULL,
    "interviewingDays" INTEGER NOT NULL,
    "offerDays" INTEGER NOT NULL,
    "closingDays" INTEGER NOT NULL,
    "roleComplexity" TEXT NOT NULL,
    "marketCompetition" TEXT NOT NULL,
    "compensationCompetitiveness" TEXT NOT NULL,
    "locationDifficulty" TEXT NOT NULL,
    "predictedBottlenecks" JSONB,
    "bottleneckRisk" TEXT NOT NULL,
    "actualDays" INTEGER,
    "hiredAt" TIMESTAMP(3),
    "variance" INTEGER,
    "forecastedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_to_hire_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_acceptance_predictions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "offerId" TEXT,
    "acceptanceProbability" DOUBLE PRECISION NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "predictionGrade" TEXT NOT NULL,
    "compensationFit" DOUBLE PRECISION NOT NULL,
    "roleFit" DOUBLE PRECISION NOT NULL,
    "locationFit" DOUBLE PRECISION NOT NULL,
    "cultureFit" DOUBLE PRECISION NOT NULL,
    "growthOpportunityFit" DOUBLE PRECISION NOT NULL,
    "workLifeBalanceFit" DOUBLE PRECISION NOT NULL,
    "competingOfferRisk" DOUBLE PRECISION NOT NULL,
    "counterofferRisk" DOUBLE PRECISION NOT NULL,
    "timingRisk" DOUBLE PRECISION NOT NULL,
    "engagementLevel" TEXT NOT NULL,
    "responseTimeTrend" TEXT NOT NULL,
    "marketRateComparison" TEXT NOT NULL,
    "improvementSuggestions" JSONB,
    "actualDecision" TEXT,
    "rejectionReason" TEXT,
    "decisionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_acceptance_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention_risk_scores" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "retentionProbability6Mo" DOUBLE PRECISION NOT NULL,
    "retentionProbability1Yr" DOUBLE PRECISION NOT NULL,
    "retentionProbability2Yr" DOUBLE PRECISION NOT NULL,
    "predictedTenure" INTEGER NOT NULL,
    "overallRiskLevel" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "jobHoppingIndicator" DOUBLE PRECISION NOT NULL,
    "tenureConsistency" DOUBLE PRECISION NOT NULL,
    "careerProgressionFit" DOUBLE PRECISION NOT NULL,
    "compensationSatisfaction" DOUBLE PRECISION NOT NULL,
    "growthOpportunityMatch" DOUBLE PRECISION NOT NULL,
    "redFlags" JSONB,
    "yellowFlags" JSONB,
    "positiveIndicators" JSONB,
    "retentionStrategies" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retention_risk_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_predictions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "predictedPerformance" TEXT NOT NULL,
    "performanceScore" INTEGER NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "technicalPerformance" DOUBLE PRECISION NOT NULL,
    "collaborationScore" DOUBLE PRECISION NOT NULL,
    "leadershipPotential" DOUBLE PRECISION NOT NULL,
    "adaptabilityScore" DOUBLE PRECISION NOT NULL,
    "innovationScore" DOUBLE PRECISION NOT NULL,
    "executionScore" DOUBLE PRECISION NOT NULL,
    "expectedRampUpMonths" INTEGER NOT NULL,
    "rampUpConfidence" DOUBLE PRECISION NOT NULL,
    "growthPotentialLevel" TEXT NOT NULL,
    "performanceRisks" JSONB,
    "developmentNeeds" JSONB,
    "supportRequirements" JSONB,
    "predictionFactors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_availability_analyses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT,
    "roleTitle" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industry" TEXT,
    "availabilityScore" INTEGER NOT NULL,
    "difficultyLevel" TEXT NOT NULL,
    "estimatedCandidatePool" INTEGER NOT NULL,
    "talentSupply" TEXT NOT NULL,
    "hiringDemand" TEXT NOT NULL,
    "supplyDemandRatio" DOUBLE PRECISION NOT NULL,
    "competitorActivity" TEXT NOT NULL,
    "competingOpenings" INTEGER NOT NULL,
    "salaryTrend" TEXT NOT NULL,
    "marketSalaryMin" DOUBLE PRECISION,
    "marketSalaryMax" DOUBLE PRECISION,
    "marketSalaryMedian" DOUBLE PRECISION,
    "scarcestSkills" JSONB,
    "commonSkills" JSONB,
    "sourcingRecommendations" JSONB,
    "compensationGuidance" JSONB,
    "timelineExpectation" INTEGER NOT NULL,
    "dataFreshness" TIMESTAMP(3) NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_availability_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_trend_predictions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "industry" TEXT,
    "currentMedian" DOUBLE PRECISION NOT NULL,
    "currentMin" DOUBLE PRECISION NOT NULL,
    "currentMax" DOUBLE PRECISION NOT NULL,
    "currentPercentile25" DOUBLE PRECISION NOT NULL,
    "currentPercentile75" DOUBLE PRECISION NOT NULL,
    "prediction3Mo" JSONB,
    "prediction6Mo" JSONB,
    "prediction1Yr" JSONB,
    "trendDirection" TEXT NOT NULL,
    "annualGrowthRate" DOUBLE PRECISION NOT NULL,
    "volatility" TEXT NOT NULL,
    "demandImpact" DOUBLE PRECISION NOT NULL,
    "supplyImpact" DOUBLE PRECISION NOT NULL,
    "economicImpact" DOUBLE PRECISION NOT NULL,
    "technologyImpact" DOUBLE PRECISION NOT NULL,
    "industryComparison" JSONB,
    "locationComparison" JSONB,
    "experienceProgression" JSONB,
    "competitiveRange" JSONB,
    "predictedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_trend_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_health_predictions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "currentCandidates" INTEGER NOT NULL,
    "byStage" JSONB,
    "stageConversions" JSONB,
    "overallHealthScore" INTEGER NOT NULL,
    "healthGrade" TEXT NOT NULL,
    "healthTrend" TEXT NOT NULL,
    "predictedHires" INTEGER NOT NULL,
    "predictedDropouts" INTEGER NOT NULL,
    "fillProbability" DOUBLE PRECISION NOT NULL,
    "timeToFill" INTEGER NOT NULL,
    "bottleneckStages" JSONB,
    "stageRisks" JSONB,
    "conversionConcerns" JSONB,
    "candidateGap" INTEGER NOT NULL,
    "qualityGap" DOUBLE PRECISION NOT NULL,
    "averageTimeInStage" JSONB,
    "velocityTrend" TEXT NOT NULL,
    "stalledCandidates" INTEGER NOT NULL,
    "urgentActions" JSONB,
    "sourcingNeeds" JSONB,
    "processImprovements" JSONB,
    "weeklyForecast" JSONB,
    "hireByDateProbability" JSONB,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipeline_health_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_model_configs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "featureWeights" JSONB,
    "actionThresholds" JSONB,
    "alertThresholds" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_model_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_audit_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "predictedValue" DOUBLE PRECISION,
    "actualValue" DOUBLE PRECISION,
    "wasAccurate" BOOLEAN,
    "accuracyScore" DOUBLE PRECISION,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "recommendationScore" INTEGER NOT NULL,
    "recommendationRank" INTEGER NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "skillMatch" DOUBLE PRECISION NOT NULL,
    "experienceMatch" DOUBLE PRECISION NOT NULL,
    "locationMatch" DOUBLE PRECISION NOT NULL,
    "salaryMatch" DOUBLE PRECISION NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobCompany" TEXT NOT NULL,
    "jobLocation" TEXT NOT NULL,
    "matchReasons" JSONB,
    "highlightedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "growthOpportunities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "viewedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "savedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "dismissReason" TEXT,
    "feedbackRating" INTEGER,
    "feedbackComment" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "recruiterId" TEXT,
    "recommendationScore" INTEGER NOT NULL,
    "recommendationRank" INTEGER NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "overallMatch" DOUBLE PRECISION NOT NULL,
    "skillMatch" DOUBLE PRECISION NOT NULL,
    "experienceMatch" DOUBLE PRECISION NOT NULL,
    "candidateName" TEXT NOT NULL,
    "candidateTitle" TEXT NOT NULL,
    "candidateLocation" TEXT NOT NULL,
    "candidateExperience" INTEGER NOT NULL,
    "candidateSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "matchReasons" JSONB,
    "standoutFactors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "viewedAt" TIMESTAMP(3),
    "shortlistedAt" TIMESTAMP(3),
    "contactedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "similar_candidate_matches" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sourceCandidateId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "similarCandidateId" TEXT NOT NULL,
    "overallSimilarity" DOUBLE PRECISION NOT NULL,
    "skillSimilarity" DOUBLE PRECISION NOT NULL,
    "experienceSimilarity" DOUBLE PRECISION NOT NULL,
    "backgroundSimilarity" DOUBLE PRECISION NOT NULL,
    "sharedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyDifferences" JSONB,
    "additionalStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "forJobId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "actionTaken" TEXT,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "similar_candidate_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passive_candidate_profiles" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "isPassive" BOOLEAN NOT NULL DEFAULT true,
    "passiveScore" INTEGER NOT NULL,
    "jobSearchActivity" TEXT NOT NULL,
    "profileUpdateFrequency" TEXT NOT NULL,
    "responseToOutreach" TEXT NOT NULL,
    "openToOpportunities" BOOLEAN NOT NULL DEFAULT false,
    "matchingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conversionLikelihood" DOUBLE PRECISION NOT NULL,
    "conversionFactors" JSONB,
    "timesContacted" INTEGER NOT NULL DEFAULT 0,
    "lastContactedAt" TIMESTAMP(3),
    "identifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passive_candidate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_up_recommendations" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "targetJobId" TEXT,
    "targetRoleTitle" TEXT NOT NULL,
    "currentSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentLevel" TEXT NOT NULL,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skillRecommendations" JSONB,
    "prioritySkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "quickWins" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "longTermGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedCourses" JSONB,
    "estimatedTimeToReady" INTEGER NOT NULL,
    "salaryImpact" JSONB,
    "jobOpportunityImpact" INTEGER NOT NULL,
    "skillsAcquired" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "lastProgressUpdate" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_up_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "re_engagement_suggestions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "previousJobId" TEXT,
    "previousApplicationDate" TIMESTAMP(3),
    "previousOutcome" TEXT NOT NULL,
    "reEngagementScore" INTEGER NOT NULL,
    "reEngagementReasons" JSONB,
    "currentFitScore" DOUBLE PRECISION NOT NULL,
    "previousFitScore" DOUBLE PRECISION NOT NULL,
    "fitImprovement" DOUBLE PRECISION NOT NULL,
    "newSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "newCertifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "careerProgression" TEXT,
    "suggestedOutreach" TEXT,
    "talkingPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "actionNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "re_engagement_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_panel_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "interviewRound" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "interviewerName" TEXT NOT NULL,
    "interviewerTitle" TEXT NOT NULL,
    "interviewerDepartment" TEXT NOT NULL,
    "recommendationScore" INTEGER NOT NULL,
    "recommendationRank" INTEGER NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "matchReasons" JSONB,
    "relevantExpertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interviewerRating" DOUBLE PRECISION,
    "feedbackQuality" DOUBLE PRECISION,
    "availabilityScore" DOUBLE PRECISION,
    "suggestedFocusAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedDuration" INTEGER NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "selectedAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_panel_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sourcing_channel_recommendations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT,
    "roleTitle" TEXT NOT NULL,
    "roleLevel" TEXT NOT NULL,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT NOT NULL,
    "industry" TEXT,
    "channelName" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "recommendationScore" INTEGER NOT NULL,
    "recommendationRank" INTEGER NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "expectedCandidates" INTEGER NOT NULL,
    "expectedQuality" DOUBLE PRECISION NOT NULL,
    "expectedCost" DOUBLE PRECISION NOT NULL,
    "expectedTimeToHire" INTEGER NOT NULL,
    "historicalSuccessRate" DOUBLE PRECISION,
    "channelStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bestFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pastHiresFromChannel" INTEGER NOT NULL DEFAULT 0,
    "suggestedActions" JSONB,
    "budgetRecommendation" DOUBLE PRECISION,
    "dataFreshness" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sourcing_channel_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_feedback" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "rating" INTEGER,
    "wasHelpful" BOOLEAN,
    "wasAccurate" BOOLEAN,
    "feedbackText" TEXT,
    "actionTaken" TEXT,
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_configs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "weights" JSONB,
    "thresholds" JSONB,
    "filters" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendation_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hiring_teams" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "teamType" TEXT NOT NULL DEFAULT 'STANDARD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "leadRecruiterId" TEXT NOT NULL,
    "hiringManagerId" TEXT,
    "settings" JSONB,
    "notificationPrefs" JSONB,
    "totalCandidates" INTEGER NOT NULL DEFAULT 0,
    "totalInterviews" INTEGER NOT NULL DEFAULT 0,
    "totalHires" INTEGER NOT NULL DEFAULT 0,
    "avgTimeToHire" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hiring_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hiring_team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT,
    "permissionLevel" TEXT NOT NULL DEFAULT 'VIEWER',
    "canViewCandidates" BOOLEAN NOT NULL DEFAULT true,
    "canEditCandidates" BOOLEAN NOT NULL DEFAULT false,
    "canScheduleInterviews" BOOLEAN NOT NULL DEFAULT false,
    "canSubmitFeedback" BOOLEAN NOT NULL DEFAULT true,
    "canMakeDecisions" BOOLEAN NOT NULL DEFAULT false,
    "canManageTeam" BOOLEAN NOT NULL DEFAULT false,
    "canAccessReports" BOOLEAN NOT NULL DEFAULT false,
    "customPermissions" JSONB,
    "expertiseAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interviewTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maxInterviewsPerWeek" INTEGER,
    "currentInterviewLoad" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "addedById" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hiring_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_panels" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "teamId" TEXT,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "roundType" TEXT NOT NULL,
    "panelMembers" JSONB,
    "minPanelSize" INTEGER NOT NULL DEFAULT 1,
    "maxPanelSize" INTEGER NOT NULL DEFAULT 5,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "format" TEXT NOT NULL DEFAULT 'VIDEO',
    "location" TEXT,
    "videoLink" TEXT,
    "scorecardTemplateId" TEXT,
    "passingScore" DOUBLE PRECISION,
    "requireUnanimous" BOOLEAN NOT NULL DEFAULT false,
    "schedulingMode" TEXT NOT NULL DEFAULT 'MANUAL',
    "bufferTime" INTEGER NOT NULL DEFAULT 15,
    "allowWeekends" BOOLEAN NOT NULL DEFAULT false,
    "timeSlotPreferences" JSONB,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_panels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_workloads" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "scheduledInterviews" INTEGER NOT NULL DEFAULT 0,
    "completedInterviews" INTEGER NOT NULL DEFAULT 0,
    "pendingFeedback" INTEGER NOT NULL DEFAULT 0,
    "candidatesAssigned" INTEGER NOT NULL DEFAULT 0,
    "avgInterviewsPerDay" DOUBLE PRECISION,
    "peakDay" TIMESTAMP(3),
    "peakInterviews" INTEGER,
    "maxCapacity" INTEGER,
    "currentLoad" INTEGER,
    "availableCapacity" INTEGER,
    "utilizationPercentage" DOUBLE PRECISION,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_workloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coverage_schedules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "primaryUserId" TEXT NOT NULL,
    "coveringUserId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "coverageType" TEXT NOT NULL DEFAULT 'FULL',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "coveredResponsibilities" JSONB,
    "excludedResponsibilities" JSONB,
    "handoffNotes" TEXT,
    "handoffDocuments" JSONB,
    "handoffCompletedAt" TIMESTAMP(3),
    "notifyStakeholders" BOOLEAN NOT NULL DEFAULT true,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coverage_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_performances" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "candidatesSourced" INTEGER NOT NULL DEFAULT 0,
    "candidatesScreened" INTEGER NOT NULL DEFAULT 0,
    "interviewsScheduled" INTEGER NOT NULL DEFAULT 0,
    "interviewsCompleted" INTEGER NOT NULL DEFAULT 0,
    "offersExtended" INTEGER NOT NULL DEFAULT 0,
    "offersAccepted" INTEGER NOT NULL DEFAULT 0,
    "hiresMade" INTEGER NOT NULL DEFAULT 0,
    "avgTimeToHire" DOUBLE PRECISION,
    "avgTimeToOffer" DOUBLE PRECISION,
    "pipelineVelocity" DOUBLE PRECISION,
    "sourcingEfficiency" DOUBLE PRECISION,
    "interviewToOfferRate" DOUBLE PRECISION,
    "offerAcceptanceRate" DOUBLE PRECISION,
    "qualityOfHire" DOUBLE PRECISION,
    "diversityMetrics" JSONB,
    "benchmarkComparison" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hiring_manager_dashboards" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "widgets" JSONB,
    "layout" JSONB,
    "defaultFilters" JSONB,
    "savedFilters" JSONB,
    "refreshRate" INTEGER NOT NULL DEFAULT 300,
    "theme" TEXT NOT NULL DEFAULT 'LIGHT',
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hiring_manager_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_activity_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "previousState" JSONB,
    "newState" JSONB,
    "metadata" JSONB,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_verifications" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "responseId" TEXT,
    "claimText" TEXT NOT NULL,
    "claimType" TEXT NOT NULL DEFAULT 'TECHNICAL_FACT',
    "claimContext" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "accuracyScore" DOUBLE PRECISION,
    "confidenceLevel" DOUBLE PRECISION,
    "supportingEvidence" JSONB,
    "contradictingInfo" JSONB,
    "technicalDepth" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "relevanceToRole" DOUBLE PRECISION,
    "potentialIssues" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exaggerationRisk" DOUBLE PRECISION,
    "followUpQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technical_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "red_flag_alerts" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "flagType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggerText" TEXT,
    "triggerTimestamp" TIMESTAMP(3),
    "confidence" DOUBLE PRECISION,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "followUpQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "disposition" TEXT,
    "reviewNotes" TEXT,
    "isFalsePositive" BOOLEAN NOT NULL DEFAULT false,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "red_flag_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_summaries" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "detailedSummary" TEXT,
    "bulletPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "overallScore" DOUBLE PRECISION,
    "scoreBreakdown" JSONB,
    "ranking" TEXT,
    "topStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "areasOfConcern" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uniqueQualities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technicalSkills" JSONB,
    "softSkills" JSONB,
    "skillGaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "culturalFitScore" DOUBLE PRECISION,
    "culturalFitNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relevantExperience" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notableAchievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceGaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hiringRecommendation" TEXT,
    "recommendationReason" TEXT,
    "nextSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedInterviewers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "followUpQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "areasToProbe" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_highlights" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "highlightType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "transcript" TEXT,
    "startTime" INTEGER,
    "endTime" INTEGER,
    "duration" INTEGER,
    "importance" TEXT NOT NULL DEFAULT 'MEDIUM',
    "relevanceScore" DOUBLE PRECISION,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiInsight" TEXT,
    "sentiment" TEXT,
    "keyTakeaway" TEXT,
    "isBookmarked" BOOLEAN NOT NULL DEFAULT false,
    "bookmarkedById" TEXT,
    "bookmarkNotes" TEXT,
    "sharedWith" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_comparisons" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "comparisonName" TEXT NOT NULL,
    "candidateIds" TEXT[],
    "interviewIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primaryCandidateId" TEXT,
    "createdById" TEXT NOT NULL,
    "criteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weights" JSONB,
    "overallRanking" JSONB,
    "scores" JSONB,
    "strengthsComparison" JSONB,
    "weaknessesComparison" JSONB,
    "topRecommendation" TEXT,
    "recommendationReason" TEXT,
    "orderOfPreference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyDifferentiators" JSONB,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sharedWith" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sharedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_knowledge" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "contentFormat" TEXT NOT NULL DEFAULT 'TEXT',
    "sourceUrl" TEXT,
    "filePath" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "allowedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "extractedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extractedKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summaryText" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_specific_knowledge" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "roleTitle" TEXT NOT NULL,
    "department" TEXT,
    "seniorityLevel" TEXT,
    "teamName" TEXT,
    "teamSize" INTEGER,
    "teamDescription" TEXT,
    "reportingTo" TEXT,
    "directReports" INTEGER,
    "teamDynamics" TEXT,
    "requiredSkills" JSONB,
    "preferredSkills" JSONB,
    "technicalStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "toolsUsed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dailyResponsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "projectTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "collaboratesWithTeams" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meetingCadence" TEXT,
    "currentChallenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "growthOpportunities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "successMetrics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "domainKnowledge" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industrySpecifics" TEXT,
    "complianceRequirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_specific_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_playbooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "roleTitle" TEXT,
    "department" TEXT,
    "seniorityLevel" TEXT,
    "interviewType" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "sections" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "questionSequence" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "requiredQuestions" JSONB,
    "optionalQuestions" JSONB,
    "followUpBank" JSONB,
    "evaluationCriteria" JSONB,
    "scoringGuide" JSONB,
    "mustPassCriteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "redFlagIndicators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "greenFlagIndicators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interviewerTips" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "openingScript" TEXT,
    "closingScript" TEXT,
    "transitionPhrases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timeBreakdown" JSONB,
    "paceGuidance" TEXT,
    "notesTakingTemplate" JSONB,
    "feedbackFormTemplate" JSONB,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_playbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "best_practices" (
    "id" TEXT NOT NULL,
    "practiceType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detailedExplanation" TEXT,
    "exampleScenario" TEXT,
    "goodExample" TEXT,
    "badExample" TEXT,
    "applicableRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableSeniorityLevels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableInterviewTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dosList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dontsList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commonMistakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceReference" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingsCount" INTEGER NOT NULL DEFAULT 0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "best_practices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_intelligence" (
    "id" TEXT NOT NULL,
    "competitorName" TEXT NOT NULL,
    "competitorWebsite" TEXT,
    "industry" TEXT,
    "ourCompany" TEXT,
    "competitorSize" TEXT,
    "marketPosition" TEXT,
    "intelligenceType" TEXT,
    "salaryRanges" JSONB,
    "bonusStructure" TEXT,
    "equityOfferings" TEXT,
    "benefitsOffered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uniquePerks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefitComparison" JSONB,
    "cultureHighlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workArrangement" TEXT,
    "glassdoorRating" DOUBLE PRECISION,
    "reviewSummary" TEXT,
    "techStackUsed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recentTechAdoptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hiringVelocity" TEXT,
    "openPositionsCount" INTEGER,
    "talentFocusAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hiringChallenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "talentPoolOverlap" DOUBLE PRECISION,
    "poachingRisk" TEXT,
    "retentionStrategies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "strengthsVsUs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknessesVsUs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "opportunities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "threats" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dataSource" TEXT,
    "dataConfidence" TEXT NOT NULL DEFAULT 'MEDIUM',
    "lastVerified" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dynamic_faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "questionVariants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "questionCategory" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "shortAnswer" TEXT,
    "detailedAnswer" TEXT,
    "applicableRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableDepartments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableJobIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "useAIGeneration" BOOLEAN NOT NULL DEFAULT false,
    "aiGeneratedAnswer" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "sourceReference" TEXT,
    "relatedFAQIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "showToCandidates" BOOLEAN NOT NULL DEFAULT true,
    "showToInterviewers" BOOLEAN NOT NULL DEFAULT true,
    "timesAsked" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dynamic_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feedback_learning" (
    "id" TEXT NOT NULL,
    "feedbackType" TEXT NOT NULL,
    "sourceEntityType" TEXT NOT NULL,
    "sourceEntityId" TEXT,
    "originalAIOutput" JSONB,
    "aiConfidence" DOUBLE PRECISION,
    "feedbackById" TEXT,
    "feedbackRating" DOUBLE PRECISION,
    "isAccurate" BOOLEAN,
    "accuracyPercentage" DOUBLE PRECISION,
    "corrections" JSONB,
    "correctedFields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "correctionNotes" TEXT,
    "errorType" TEXT,
    "impactLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "shouldTrainOn" BOOLEAN NOT NULL DEFAULT true,
    "relatedPatterns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedImprovement" TEXT,
    "isProcessedForTraining" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "wasAddressed" BOOLEAN NOT NULL DEFAULT false,
    "addressedAt" TIMESTAMP(3),
    "addressedNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_feedback_learning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_evaluation_criteria" (
    "id" TEXT NOT NULL,
    "companyName" TEXT,
    "department" TEXT,
    "roleTitle" TEXT,
    "jobId" TEXT,
    "criterionName" TEXT NOT NULL,
    "criterionCode" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "isKnockout" BOOLEAN NOT NULL DEFAULT false,
    "scoringType" TEXT NOT NULL DEFAULT 'NUMERIC',
    "minScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "passingScore" DOUBLE PRECISION,
    "scoringRubric" JSONB,
    "behavioralIndicators" JSONB,
    "positiveIndicators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "negativeIndicators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "questionSuggestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiEvaluationPrompt" TEXT,
    "aiKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiIgnoreKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industryBenchmark" DOUBLE PRECISION,
    "internalBenchmark" DOUBLE PRECISION,
    "topPerformerThreshold" DOUBLE PRECISION,
    "idealResponse" TEXT,
    "acceptableResponse" TEXT,
    "poorResponse" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_evaluation_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_rooms" (
    "id" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "roomType" TEXT NOT NULL DEFAULT 'INTERVIEW',
    "interviewId" TEXT,
    "jobId" TEXT,
    "applicationId" TEXT,
    "hostId" TEXT NOT NULL,
    "coHostIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "participantIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scheduledStartTime" TIMESTAMP(3),
    "scheduledEndTime" TIMESTAMP(3),
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "duration" INTEGER,
    "maxParticipants" INTEGER NOT NULL DEFAULT 10,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "waitingRoomEnabled" BOOLEAN NOT NULL DEFAULT true,
    "recordingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "transcriptionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "chatEnabled" BOOLEAN NOT NULL DEFAULT true,
    "screenShareEnabled" BOOLEAN NOT NULL DEFAULT true,
    "whiteboardEnabled" BOOLEAN NOT NULL DEFAULT false,
    "codeEditorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_participants" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "totalDuration" INTEGER,
    "isAudioEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isVideoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isScreenSharing" BOOLEAN NOT NULL DEFAULT false,
    "raisedHand" BOOLEAN NOT NULL DEFAULT false,
    "deviceInfo" JSONB,
    "networkQuality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "scope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accountEmail" TEXT,
    "accountId" TEXT,
    "accountName" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "defaultSettings" JSONB,
    "lastSyncAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_meetings" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalMeetingId" TEXT NOT NULL,
    "meetingUrl" TEXT NOT NULL,
    "joinUrl" TEXT,
    "hostUrl" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledStartTime" TIMESTAMP(3) NOT NULL,
    "scheduledEndTime" TIMESTAMP(3),
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "timezone" TEXT,
    "hostEmail" TEXT NOT NULL,
    "attendeeEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interviewId" TEXT,
    "jobId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "waitingRoom" BOOLEAN NOT NULL DEFAULT true,
    "recordingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "muteOnEntry" BOOLEAN NOT NULL DEFAULT true,
    "recordingUrl" TEXT,
    "transcriptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_recordings" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "recordingType" TEXT NOT NULL DEFAULT 'FULL',
    "fileUrl" TEXT,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "duration" INTEGER,
    "format" TEXT,
    "resolution" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "thumbnailUrl" TEXT,
    "transcriptUrl" TEXT,
    "consentObtained" BOOLEAN NOT NULL DEFAULT false,
    "consentTimestamp" TIMESTAMP(3),
    "retentionDate" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_transcriptions" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "recordingId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "segments" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "fullText" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "speakerCount" INTEGER,
    "averageConfidence" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "exportUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_transcriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_backgrounds" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'CUSTOM',
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "color" TEXT,
    "blurIntensity" INTEGER,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_backgrounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whiteboard_sessions" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "canvasWidth" INTEGER NOT NULL DEFAULT 1920,
    "canvasHeight" INTEGER NOT NULL DEFAULT 1080,
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "elements" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "availableTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "snapshotUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboard_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_editor_sessions" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "problemStatement" TEXT,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "initialCode" TEXT,
    "currentCode" TEXT,
    "solutionCode" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'vs-dark',
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "tabSize" INTEGER NOT NULL DEFAULT 2,
    "autoComplete" BOOLEAN NOT NULL DEFAULT true,
    "syntaxHighlighting" BOOLEAN NOT NULL DEFAULT true,
    "testCases" JSONB,
    "lastExecutionResult" JSONB,
    "timeLimit" INTEGER,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_editor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_chat_messages" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "recipientId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "editedAt" TIMESTAMP(3),
    "reactions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_timers" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "timerType" TEXT NOT NULL DEFAULT 'COUNTDOWN',
    "name" TEXT,
    "totalDuration" INTEGER NOT NULL,
    "remainingTime" INTEGER,
    "currentSection" INTEGER NOT NULL DEFAULT 0,
    "sections" JSONB,
    "alertTimes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "status" TEXT NOT NULL DEFAULT 'READY',
    "startedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "visibleToAll" BOOLEAN NOT NULL DEFAULT true,
    "visibleToRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_timers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_way_interviews" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "applicationId" TEXT,
    "candidateId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "questions" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "totalTimeLimit" INTEGER,
    "allowRetakes" BOOLEAN NOT NULL DEFAULT true,
    "maxRetakesPerQuestion" INTEGER NOT NULL DEFAULT 2,
    "showQuestionPreview" BOOLEAN NOT NULL DEFAULT true,
    "previewDuration" INTEGER,
    "thinkTimePerQuestion" INTEGER,
    "answerTimePerQuestion" INTEGER,
    "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "overallScore" DOUBLE PRECISION,
    "overallFeedback" TEXT,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_way_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_way_responses" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionId" TEXT,
    "questionIndex" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "videoPath" TEXT,
    "videoDuration" INTEGER,
    "thumbnailUrl" TEXT,
    "transcriptText" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "thinkTimeUsed" INTEGER,
    "answerTimeUsed" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rating" DOUBLE PRECISION,
    "reviewerNotes" TEXT,
    "aiScore" DOUBLE PRECISION,
    "aiAnalysis" JSONB,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_way_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "resumes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "recruiter_profiles_userId_key" ON "recruiter_profiles"("userId");

-- CreateIndex
CREATE INDEX "idx_consultants_status" ON "consultants"("status");

-- CreateIndex
CREATE INDEX "idx_consultants_vendor" ON "consultants"("vendor_id");

-- CreateIndex
CREATE INDEX "idx_proposals_requirement" ON "proposals"("requirement_id");

-- CreateIndex
CREATE INDEX "idx_proposals_vendor" ON "proposals"("vendor_id");

-- CreateIndex
CREATE INDEX "idx_requirements_client" ON "requirements"("client_id");

-- CreateIndex
CREATE INDEX "idx_requirements_status" ON "requirements"("status");

-- CreateIndex
CREATE UNIQUE INDEX "key_rotation_schedules_keyId_key" ON "key_rotation_schedules"("keyId");

-- CreateIndex
CREATE UNIQUE INDEX "pii_detection_configs_organizationId_key" ON "pii_detection_configs"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "data_residency_configs_organizationId_key" ON "data_residency_configs"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tls_configs_organizationId_key" ON "tls_configs"("organizationId");

-- CreateIndex
CREATE INDEX "hiring_success_predictions_companyId_idx" ON "hiring_success_predictions"("companyId");

-- CreateIndex
CREATE INDEX "hiring_success_predictions_jobId_idx" ON "hiring_success_predictions"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "hiring_success_predictions_candidateId_jobId_key" ON "hiring_success_predictions"("candidateId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "time_to_hire_forecasts_jobId_key" ON "time_to_hire_forecasts"("jobId");

-- CreateIndex
CREATE INDEX "time_to_hire_forecasts_companyId_idx" ON "time_to_hire_forecasts"("companyId");

-- CreateIndex
CREATE INDEX "offer_acceptance_predictions_companyId_idx" ON "offer_acceptance_predictions"("companyId");

-- CreateIndex
CREATE INDEX "offer_acceptance_predictions_jobId_idx" ON "offer_acceptance_predictions"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "offer_acceptance_predictions_candidateId_jobId_key" ON "offer_acceptance_predictions"("candidateId", "jobId");

-- CreateIndex
CREATE INDEX "retention_risk_scores_companyId_idx" ON "retention_risk_scores"("companyId");

-- CreateIndex
CREATE INDEX "retention_risk_scores_jobId_idx" ON "retention_risk_scores"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "retention_risk_scores_candidateId_jobId_key" ON "retention_risk_scores"("candidateId", "jobId");

-- CreateIndex
CREATE INDEX "performance_predictions_companyId_idx" ON "performance_predictions"("companyId");

-- CreateIndex
CREATE INDEX "performance_predictions_jobId_idx" ON "performance_predictions"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "performance_predictions_candidateId_jobId_key" ON "performance_predictions"("candidateId", "jobId");

-- CreateIndex
CREATE INDEX "market_availability_analyses_companyId_idx" ON "market_availability_analyses"("companyId");

-- CreateIndex
CREATE INDEX "market_availability_analyses_roleTitle_idx" ON "market_availability_analyses"("roleTitle");

-- CreateIndex
CREATE INDEX "salary_trend_predictions_companyId_idx" ON "salary_trend_predictions"("companyId");

-- CreateIndex
CREATE INDEX "salary_trend_predictions_roleTitle_idx" ON "salary_trend_predictions"("roleTitle");

-- CreateIndex
CREATE INDEX "pipeline_health_predictions_companyId_idx" ON "pipeline_health_predictions"("companyId");

-- CreateIndex
CREATE INDEX "pipeline_health_predictions_jobId_idx" ON "pipeline_health_predictions"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "prediction_model_configs_companyId_modelType_key" ON "prediction_model_configs"("companyId", "modelType");

-- CreateIndex
CREATE INDEX "prediction_audit_logs_companyId_idx" ON "prediction_audit_logs"("companyId");

-- CreateIndex
CREATE INDEX "prediction_audit_logs_predictionType_idx" ON "prediction_audit_logs"("predictionType");

-- CreateIndex
CREATE INDEX "job_recommendations_companyId_idx" ON "job_recommendations"("companyId");

-- CreateIndex
CREATE INDEX "job_recommendations_candidateId_idx" ON "job_recommendations"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_recommendations_companyId_idx" ON "candidate_recommendations"("companyId");

-- CreateIndex
CREATE INDEX "candidate_recommendations_jobId_idx" ON "candidate_recommendations"("jobId");

-- CreateIndex
CREATE INDEX "similar_candidate_matches_companyId_idx" ON "similar_candidate_matches"("companyId");

-- CreateIndex
CREATE INDEX "similar_candidate_matches_sourceCandidateId_idx" ON "similar_candidate_matches"("sourceCandidateId");

-- CreateIndex
CREATE UNIQUE INDEX "passive_candidate_profiles_companyId_candidateId_key" ON "passive_candidate_profiles"("companyId", "candidateId");

-- CreateIndex
CREATE INDEX "skill_up_recommendations_candidateId_idx" ON "skill_up_recommendations"("candidateId");

-- CreateIndex
CREATE INDEX "re_engagement_suggestions_companyId_idx" ON "re_engagement_suggestions"("companyId");

-- CreateIndex
CREATE INDEX "re_engagement_suggestions_jobId_idx" ON "re_engagement_suggestions"("jobId");

-- CreateIndex
CREATE INDEX "interview_panel_recommendations_companyId_idx" ON "interview_panel_recommendations"("companyId");

-- CreateIndex
CREATE INDEX "interview_panel_recommendations_jobId_idx" ON "interview_panel_recommendations"("jobId");

-- CreateIndex
CREATE INDEX "sourcing_channel_recommendations_companyId_idx" ON "sourcing_channel_recommendations"("companyId");

-- CreateIndex
CREATE INDEX "sourcing_channel_recommendations_roleTitle_idx" ON "sourcing_channel_recommendations"("roleTitle");

-- CreateIndex
CREATE INDEX "recommendation_feedback_companyId_idx" ON "recommendation_feedback"("companyId");

-- CreateIndex
CREATE INDEX "recommendation_feedback_recommendationType_idx" ON "recommendation_feedback"("recommendationType");

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_configs_companyId_recommendationType_key" ON "recommendation_configs"("companyId", "recommendationType");

-- CreateIndex
CREATE INDEX "hiring_teams_companyId_idx" ON "hiring_teams"("companyId");

-- CreateIndex
CREATE INDEX "hiring_teams_jobId_idx" ON "hiring_teams"("jobId");

-- CreateIndex
CREATE INDEX "hiring_teams_status_idx" ON "hiring_teams"("status");

-- CreateIndex
CREATE INDEX "hiring_team_members_teamId_idx" ON "hiring_team_members"("teamId");

-- CreateIndex
CREATE INDEX "hiring_team_members_userId_idx" ON "hiring_team_members"("userId");

-- CreateIndex
CREATE INDEX "hiring_team_members_companyId_idx" ON "hiring_team_members"("companyId");

-- CreateIndex
CREATE INDEX "interview_panels_companyId_idx" ON "interview_panels"("companyId");

-- CreateIndex
CREATE INDEX "interview_panels_teamId_idx" ON "interview_panels"("teamId");

-- CreateIndex
CREATE INDEX "interview_panels_jobId_idx" ON "interview_panels"("jobId");

-- CreateIndex
CREATE INDEX "team_workloads_companyId_idx" ON "team_workloads"("companyId");

-- CreateIndex
CREATE INDEX "team_workloads_teamId_idx" ON "team_workloads"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_workloads_teamId_userId_periodStart_periodEnd_key" ON "team_workloads"("teamId", "userId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "coverage_schedules_companyId_idx" ON "coverage_schedules"("companyId");

-- CreateIndex
CREATE INDEX "coverage_schedules_teamId_idx" ON "coverage_schedules"("teamId");

-- CreateIndex
CREATE INDEX "coverage_schedules_primaryUserId_idx" ON "coverage_schedules"("primaryUserId");

-- CreateIndex
CREATE INDEX "team_performances_companyId_idx" ON "team_performances"("companyId");

-- CreateIndex
CREATE INDEX "team_performances_teamId_idx" ON "team_performances"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_performances_teamId_periodType_periodStart_key" ON "team_performances"("teamId", "periodType", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "hiring_manager_dashboards_companyId_userId_key" ON "hiring_manager_dashboards"("companyId", "userId");

-- CreateIndex
CREATE INDEX "team_activity_logs_companyId_idx" ON "team_activity_logs"("companyId");

-- CreateIndex
CREATE INDEX "team_activity_logs_teamId_idx" ON "team_activity_logs"("teamId");

-- CreateIndex
CREATE INDEX "team_activity_logs_userId_idx" ON "team_activity_logs"("userId");

-- CreateIndex
CREATE INDEX "technical_verifications_interviewId_idx" ON "technical_verifications"("interviewId");

-- CreateIndex
CREATE INDEX "technical_verifications_verificationStatus_idx" ON "technical_verifications"("verificationStatus");

-- CreateIndex
CREATE INDEX "red_flag_alerts_interviewId_idx" ON "red_flag_alerts"("interviewId");

-- CreateIndex
CREATE INDEX "red_flag_alerts_severity_idx" ON "red_flag_alerts"("severity");

-- CreateIndex
CREATE INDEX "red_flag_alerts_isReviewed_idx" ON "red_flag_alerts"("isReviewed");

-- CreateIndex
CREATE INDEX "interview_summaries_interviewId_idx" ON "interview_summaries"("interviewId");

-- CreateIndex
CREATE INDEX "interview_summaries_candidateId_idx" ON "interview_summaries"("candidateId");

-- CreateIndex
CREATE INDEX "interview_summaries_hiringRecommendation_idx" ON "interview_summaries"("hiringRecommendation");

-- CreateIndex
CREATE INDEX "interview_highlights_interviewId_idx" ON "interview_highlights"("interviewId");

-- CreateIndex
CREATE INDEX "interview_highlights_highlightType_idx" ON "interview_highlights"("highlightType");

-- CreateIndex
CREATE INDEX "interview_highlights_importance_idx" ON "interview_highlights"("importance");

-- CreateIndex
CREATE INDEX "candidate_comparisons_jobId_idx" ON "candidate_comparisons"("jobId");

-- CreateIndex
CREATE INDEX "candidate_comparisons_createdById_idx" ON "candidate_comparisons"("createdById");

-- CreateIndex
CREATE INDEX "candidate_comparisons_status_idx" ON "candidate_comparisons"("status");

-- CreateIndex
CREATE INDEX "company_knowledge_companyName_idx" ON "company_knowledge"("companyName");

-- CreateIndex
CREATE INDEX "company_knowledge_documentType_idx" ON "company_knowledge"("documentType");

-- CreateIndex
CREATE INDEX "company_knowledge_category_idx" ON "company_knowledge"("category");

-- CreateIndex
CREATE INDEX "company_knowledge_isActive_idx" ON "company_knowledge"("isActive");

-- CreateIndex
CREATE INDEX "role_specific_knowledge_jobId_idx" ON "role_specific_knowledge"("jobId");

-- CreateIndex
CREATE INDEX "role_specific_knowledge_roleTitle_idx" ON "role_specific_knowledge"("roleTitle");

-- CreateIndex
CREATE INDEX "role_specific_knowledge_department_idx" ON "role_specific_knowledge"("department");

-- CreateIndex
CREATE INDEX "role_specific_knowledge_isActive_idx" ON "role_specific_knowledge"("isActive");

-- CreateIndex
CREATE INDEX "interview_playbooks_roleTitle_idx" ON "interview_playbooks"("roleTitle");

-- CreateIndex
CREATE INDEX "interview_playbooks_interviewType_idx" ON "interview_playbooks"("interviewType");

-- CreateIndex
CREATE INDEX "interview_playbooks_isTemplate_idx" ON "interview_playbooks"("isTemplate");

-- CreateIndex
CREATE INDEX "interview_playbooks_isActive_idx" ON "interview_playbooks"("isActive");

-- CreateIndex
CREATE INDEX "best_practices_practiceType_idx" ON "best_practices"("practiceType");

-- CreateIndex
CREATE INDEX "best_practices_category_idx" ON "best_practices"("category");

-- CreateIndex
CREATE INDEX "best_practices_isVerified_idx" ON "best_practices"("isVerified");

-- CreateIndex
CREATE INDEX "best_practices_isActive_idx" ON "best_practices"("isActive");

-- CreateIndex
CREATE INDEX "competitor_intelligence_competitorName_idx" ON "competitor_intelligence"("competitorName");

-- CreateIndex
CREATE INDEX "competitor_intelligence_industry_idx" ON "competitor_intelligence"("industry");

-- CreateIndex
CREATE INDEX "competitor_intelligence_isActive_idx" ON "competitor_intelligence"("isActive");

-- CreateIndex
CREATE INDEX "dynamic_faqs_questionCategory_idx" ON "dynamic_faqs"("questionCategory");

-- CreateIndex
CREATE INDEX "dynamic_faqs_showToCandidates_idx" ON "dynamic_faqs"("showToCandidates");

-- CreateIndex
CREATE INDEX "dynamic_faqs_showToInterviewers_idx" ON "dynamic_faqs"("showToInterviewers");

-- CreateIndex
CREATE INDEX "dynamic_faqs_isActive_idx" ON "dynamic_faqs"("isActive");

-- CreateIndex
CREATE INDEX "ai_feedback_learning_feedbackType_idx" ON "ai_feedback_learning"("feedbackType");

-- CreateIndex
CREATE INDEX "ai_feedback_learning_sourceEntityType_idx" ON "ai_feedback_learning"("sourceEntityType");

-- CreateIndex
CREATE INDEX "ai_feedback_learning_isProcessedForTraining_idx" ON "ai_feedback_learning"("isProcessedForTraining");

-- CreateIndex
CREATE INDEX "custom_evaluation_criteria_companyName_idx" ON "custom_evaluation_criteria"("companyName");

-- CreateIndex
CREATE INDEX "custom_evaluation_criteria_category_idx" ON "custom_evaluation_criteria"("category");

-- CreateIndex
CREATE INDEX "custom_evaluation_criteria_roleTitle_idx" ON "custom_evaluation_criteria"("roleTitle");

-- CreateIndex
CREATE INDEX "custom_evaluation_criteria_jobId_idx" ON "custom_evaluation_criteria"("jobId");

-- CreateIndex
CREATE INDEX "custom_evaluation_criteria_isTemplate_idx" ON "custom_evaluation_criteria"("isTemplate");

-- CreateIndex
CREATE INDEX "custom_evaluation_criteria_isActive_idx" ON "custom_evaluation_criteria"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "video_rooms_roomCode_key" ON "video_rooms"("roomCode");

-- CreateIndex
CREATE INDEX "video_rooms_roomCode_idx" ON "video_rooms"("roomCode");

-- CreateIndex
CREATE INDEX "video_rooms_hostId_idx" ON "video_rooms"("hostId");

-- CreateIndex
CREATE INDEX "video_rooms_status_idx" ON "video_rooms"("status");

-- CreateIndex
CREATE INDEX "video_rooms_interviewId_idx" ON "video_rooms"("interviewId");

-- CreateIndex
CREATE INDEX "video_participants_roomId_idx" ON "video_participants"("roomId");

-- CreateIndex
CREATE INDEX "video_participants_userId_idx" ON "video_participants"("userId");

-- CreateIndex
CREATE INDEX "video_participants_status_idx" ON "video_participants"("status");

-- CreateIndex
CREATE INDEX "video_integrations_userId_idx" ON "video_integrations"("userId");

-- CreateIndex
CREATE INDEX "video_integrations_platform_idx" ON "video_integrations"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "video_integrations_userId_platform_key" ON "video_integrations"("userId", "platform");

-- CreateIndex
CREATE INDEX "external_meetings_integrationId_idx" ON "external_meetings"("integrationId");

-- CreateIndex
CREATE INDEX "external_meetings_externalMeetingId_idx" ON "external_meetings"("externalMeetingId");

-- CreateIndex
CREATE INDEX "external_meetings_interviewId_idx" ON "external_meetings"("interviewId");

-- CreateIndex
CREATE INDEX "external_meetings_status_idx" ON "external_meetings"("status");

-- CreateIndex
CREATE INDEX "video_recordings_roomId_idx" ON "video_recordings"("roomId");

-- CreateIndex
CREATE INDEX "video_recordings_processingStatus_idx" ON "video_recordings"("processingStatus");

-- CreateIndex
CREATE INDEX "live_transcriptions_roomId_idx" ON "live_transcriptions"("roomId");

-- CreateIndex
CREATE INDEX "live_transcriptions_status_idx" ON "live_transcriptions"("status");

-- CreateIndex
CREATE INDEX "virtual_backgrounds_userId_idx" ON "virtual_backgrounds"("userId");

-- CreateIndex
CREATE INDEX "virtual_backgrounds_category_idx" ON "virtual_backgrounds"("category");

-- CreateIndex
CREATE INDEX "virtual_backgrounds_isSystem_idx" ON "virtual_backgrounds"("isSystem");

-- CreateIndex
CREATE INDEX "whiteboard_sessions_roomId_idx" ON "whiteboard_sessions"("roomId");

-- CreateIndex
CREATE INDEX "whiteboard_sessions_isActive_idx" ON "whiteboard_sessions"("isActive");

-- CreateIndex
CREATE INDEX "code_editor_sessions_roomId_idx" ON "code_editor_sessions"("roomId");

-- CreateIndex
CREATE INDEX "code_editor_sessions_language_idx" ON "code_editor_sessions"("language");

-- CreateIndex
CREATE INDEX "video_chat_messages_roomId_idx" ON "video_chat_messages"("roomId");

-- CreateIndex
CREATE INDEX "video_chat_messages_senderId_idx" ON "video_chat_messages"("senderId");

-- CreateIndex
CREATE INDEX "video_chat_messages_isPrivate_idx" ON "video_chat_messages"("isPrivate");

-- CreateIndex
CREATE INDEX "interview_timers_roomId_idx" ON "interview_timers"("roomId");

-- CreateIndex
CREATE INDEX "interview_timers_status_idx" ON "interview_timers"("status");

-- CreateIndex
CREATE INDEX "one_way_interviews_jobId_idx" ON "one_way_interviews"("jobId");

-- CreateIndex
CREATE INDEX "one_way_interviews_candidateId_idx" ON "one_way_interviews"("candidateId");

-- CreateIndex
CREATE INDEX "one_way_interviews_recruiterId_idx" ON "one_way_interviews"("recruiterId");

-- CreateIndex
CREATE INDEX "one_way_interviews_status_idx" ON "one_way_interviews"("status");

-- CreateIndex
CREATE INDEX "one_way_responses_interviewId_idx" ON "one_way_responses"("interviewId");

-- CreateIndex
CREATE INDEX "one_way_responses_questionIndex_idx" ON "one_way_responses"("questionIndex");

-- CreateIndex
CREATE INDEX "one_way_responses_status_idx" ON "one_way_responses"("status");

-- CreateIndex
CREATE INDEX "idx_interviews_proposal" ON "interviews"("proposal_id");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiter_profiles" ADD CONSTRAINT "recruiter_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "consultants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "key_rotation_schedules" ADD CONSTRAINT "key_rotation_schedules_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "encryption_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_access_logs" ADD CONSTRAINT "file_access_logs_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "secure_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_configId_fkey" FOREIGN KEY ("configId") REFERENCES "backup_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restore_jobs" ADD CONSTRAINT "restore_jobs_backupId_fkey" FOREIGN KEY ("backupId") REFERENCES "backups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_summaries" ADD CONSTRAINT "interview_summaries_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_summaries" ADD CONSTRAINT "interview_summaries_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_comparisons" ADD CONSTRAINT "candidate_comparisons_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_comparisons" ADD CONSTRAINT "candidate_comparisons_primaryCandidateId_fkey" FOREIGN KEY ("primaryCandidateId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_participants" ADD CONSTRAINT "video_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "video_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_meetings" ADD CONSTRAINT "external_meetings_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "video_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_recordings" ADD CONSTRAINT "video_recordings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "video_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_transcriptions" ADD CONSTRAINT "live_transcriptions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "video_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_chat_messages" ADD CONSTRAINT "video_chat_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "video_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_way_responses" ADD CONSTRAINT "one_way_responses_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "one_way_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
