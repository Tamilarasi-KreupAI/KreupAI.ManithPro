-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SkillProficiencyLevel" AS ENUM ('BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'APPRENTICESHIP', 'SELF_EMPLOYED');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('PENDING', 'CONNECTED', 'DISCONNECTED', 'ERROR', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VerificationRequestStatus" AS ENUM ('PENDING', 'SENT', 'COMPLETED', 'EXPIRED', 'DECLINED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReferenceRequestStatus" AS ENUM ('PENDING', 'SENT', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EndorsementRequestStatus" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BackgroundCheckType" AS ENUM ('BASIC', 'STANDARD', 'COMPREHENSIVE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChallengeSubmissionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'GRADING', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuizDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "LiveCodingSessionStatus" AS ENUM ('SCHEDULED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ProjectSubmissionStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ExternalAssessmentProvider" AS ENUM ('HACKERRANK', 'CODESIGNAL', 'LEETCODE', 'CODILITY', 'TESTGORILLA', 'TOGGL_HIRE', 'OTHER');

-- CreateEnum
CREATE TYPE "SoftSkillCategory" AS ENUM ('PERSONALITY', 'SITUATIONAL_JUDGMENT', 'EMOTIONAL_INTELLIGENCE', 'LEADERSHIP', 'TEAMWORK', 'COMMUNICATION', 'PROBLEM_SOLVING', 'ADAPTABILITY');

-- CreateEnum
CREATE TYPE "LanguageTestType" AS ENUM ('SPEAKING', 'WRITING', 'READING', 'LISTENING', 'COMPREHENSIVE');

-- CreateEnum
CREATE TYPE "DomainCategory" AS ENUM ('FINANCE', 'HEALTHCARE', 'LEGAL', 'TECHNOLOGY', 'MARKETING', 'SALES', 'HR', 'OPERATIONS', 'ENGINEERING', 'DATA_SCIENCE', 'CYBERSECURITY', 'COMPLIANCE', 'OTHER');

-- DropIndex
DROP INDEX "idx_applications_candidate_status_created";

-- DropIndex
DROP INDEX "idx_applications_job_status_created";

-- DropIndex
DROP INDEX "idx_audit_logs_created";

-- DropIndex
DROP INDEX "idx_error_logs_created";

-- DropIndex
DROP INDEX "idx_interviews_application";

-- DropIndex
DROP INDEX "idx_interviews_scheduler";

-- DropIndex
DROP INDEX "idx_invoices_created";

-- DropIndex
DROP INDEX "idx_jobs_location";

-- DropIndex
DROP INDEX "idx_jobs_salary_range";

-- DropIndex
DROP INDEX "idx_jobs_skills";

-- DropIndex
DROP INDEX "idx_jobs_status_created";

-- DropIndex
DROP INDEX "idx_messages_thread";

-- DropIndex
DROP INDEX "idx_notifications_created";

-- DropIndex
DROP INDEX "idx_payments_created";

-- DropIndex
DROP INDEX "idx_saved_jobs_user_created";

-- DropIndex
DROP INDEX "idx_users_location";

-- DropIndex
DROP INDEX "idx_users_role_created";

-- DropIndex
DROP INDEX "idx_users_skills";

-- CreateTable
CREATE TABLE "candidate_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "languages" JSONB,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "preferredLocation" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "remotePreference" TEXT,
    "expectedSalary" DOUBLE PRECISION,
    "expectedSalaryCurrency" TEXT DEFAULT 'USD',
    "noticePeriod" TEXT,
    "availableFrom" TIMESTAMP(3),
    "jobTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completenessScore" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedSection" TEXT,
    "website" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "stackoverflow" TEXT,
    "dribbble" TEXT,
    "behance" TEXT,
    "medium" TEXT,
    "kaggle" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "showSalaryExpectation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_experiences" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "companyWebsite" TEXT,
    "companyLinkedin" TEXT,
    "companySize" TEXT,
    "industry" TEXT,
    "title" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "department" TEXT,
    "location" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "referenceEmail" TEXT,
    "teamSize" INTEGER,
    "budget" DOUBLE PRECISION,
    "revenue" DOUBLE PRECISION,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "institutionLogo" TEXT,
    "institutionWebsite" TEXT,
    "institutionLocation" TEXT,
    "institutionType" TEXT,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "specialization" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isOngoing" BOOLEAN NOT NULL DEFAULT false,
    "grade" TEXT,
    "gradeScale" TEXT,
    "activities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "thesis" TEXT,
    "thesisDescription" TEXT,
    "courseProjects" JSONB,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "certificateUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "organizationLogo" TEXT,
    "organizationWebsite" TEXT,
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "doesNotExpire" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "subcategory" TEXT,
    "proficiencyLevel" INTEGER NOT NULL DEFAULT 5,
    "proficiencyLabel" "SkillProficiencyLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "yearsOfExperience" DOUBLE PRECISION,
    "lastUsed" TIMESTAMP(3),
    "projects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "endorsementCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_endorsements" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "endorserId" TEXT NOT NULL,
    "endorserName" TEXT NOT NULL,
    "endorserTitle" TEXT,
    "endorserCompany" TEXT,
    "endorserLinkedin" TEXT,
    "relationship" TEXT,
    "comment" TEXT,
    "rating" INTEGER,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_endorsements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "projectType" TEXT,
    "status" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isOngoing" BOOLEAN NOT NULL DEFAULT false,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "frameworks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "repositoryUrl" TEXT,
    "liveUrl" TEXT,
    "demoUrl" TEXT,
    "documentationUrl" TEXT,
    "thumbnailUrl" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "role" TEXT,
    "teamSize" INTEGER,
    "contributions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "impact" TEXT,
    "users" INTEGER,
    "downloads" INTEGER,
    "stars" INTEGER,
    "forks" INTEGER,
    "workExperienceId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "badgeIcon" TEXT,
    "badgeColor" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "currentProgress" INTEGER NOT NULL DEFAULT 0,
    "targetProgress" INTEGER NOT NULL DEFAULT 1,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "earnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_versions" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "versionLabel" TEXT,
    "profileSnapshot" JSONB NOT NULL,
    "changes" JSONB,
    "changeSummary" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_profiles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "profileUrl" TEXT NOT NULL,
    "bio" TEXT,
    "company" TEXT,
    "location" TEXT,
    "blog" TEXT,
    "email" TEXT,
    "publicRepos" INTEGER NOT NULL DEFAULT 0,
    "privateRepos" INTEGER NOT NULL DEFAULT 0,
    "totalStars" INTEGER NOT NULL DEFAULT 0,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "gists" INTEGER NOT NULL DEFAULT 0,
    "totalContributions" INTEGER NOT NULL DEFAULT 0,
    "contributionsLastYear" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "topLanguages" JSONB,
    "pinnedRepos" JSONB,
    "recentActivity" JSONB,
    "contributionGraph" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_repositories" (
    "id" TEXT NOT NULL,
    "githubProfileId" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "languages" JSONB,
    "htmlUrl" TEXT NOT NULL,
    "cloneUrl" TEXT,
    "homepage" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "watchers" INTEGER NOT NULL DEFAULT 0,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER NOT NULL DEFAULT 0,
    "hasWiki" BOOLEAN NOT NULL DEFAULT false,
    "hasPages" BOOLEAN NOT NULL DEFAULT false,
    "hasProjects" BOOLEAN NOT NULL DEFAULT false,
    "hasDiscussions" BOOLEAN NOT NULL DEFAULT false,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isForked" BOOLEAN NOT NULL DEFAULT false,
    "isFork" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "contributionCount" INTEGER NOT NULL DEFAULT 0,
    "lastContributionAt" TIMESTAMP(3),
    "role" TEXT,
    "isShowcased" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pushedAt" TIMESTAMP(3),

    CONSTRAINT "github_repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linkedin_profiles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "linkedInId" TEXT NOT NULL,
    "vanityName" TEXT,
    "profileUrl" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "headline" TEXT,
    "summary" TEXT,
    "profilePicture" TEXT,
    "backgroundImage" TEXT,
    "location" TEXT,
    "country" TEXT,
    "currentCompany" TEXT,
    "currentTitle" TEXT,
    "industry" TEXT,
    "connections" INTEGER NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "positions" JSONB,
    "education" JSONB,
    "certifications" JSONB,
    "skills" JSONB,
    "recommendations" JSONB,
    "honors" JSONB,
    "publications" JSONB,
    "patents" JSONB,
    "courses" JSONB,
    "projects" JSONB,
    "volunteerExperiences" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "importWorkHistory" BOOLEAN NOT NULL DEFAULT true,
    "importEducation" BOOLEAN NOT NULL DEFAULT true,
    "importSkills" BOOLEAN NOT NULL DEFAULT true,
    "importCertifications" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linkedin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "targetValue" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 10,
    "badgeIcon" TEXT,
    "badgeColor" TEXT,
    "tier" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stackoverflow_profiles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "stackOverflowId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "websiteUrl" TEXT,
    "location" TEXT,
    "aboutMe" TEXT,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "goldBadges" INTEGER NOT NULL DEFAULT 0,
    "silverBadges" INTEGER NOT NULL DEFAULT 0,
    "bronzeBadges" INTEGER NOT NULL DEFAULT 0,
    "totalBadges" INTEGER NOT NULL DEFAULT 0,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "answerCount" INTEGER NOT NULL DEFAULT 0,
    "acceptedAnswerCount" INTEGER NOT NULL DEFAULT 0,
    "upVotes" INTEGER NOT NULL DEFAULT 0,
    "downVotes" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "topTags" JSONB,
    "topAnswers" JSONB,
    "creationDate" TIMESTAMP(3),
    "lastAccessDate" TIMESTAMP(3),
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stackoverflow_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notion_portfolios" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "workspaceName" TEXT,
    "workspaceIcon" TEXT,
    "notionUserId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "avatarUrl" TEXT,
    "portfolioPages" JSONB,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "botId" TEXT,
    "importedDatabases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "autoImportPages" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notion_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gitlab_profiles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "gitlabId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "webUrl" TEXT NOT NULL,
    "email" TEXT,
    "bio" TEXT,
    "company" TEXT,
    "location" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "publicRepos" INTEGER NOT NULL DEFAULT 0,
    "privateRepos" INTEGER NOT NULL DEFAULT 0,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "starredProjects" INTEGER NOT NULL DEFAULT 0,
    "totalCommits" INTEGER NOT NULL DEFAULT 0,
    "totalMergeRequests" INTEGER NOT NULL DEFAULT 0,
    "totalIssues" INTEGER NOT NULL DEFAULT 0,
    "contributionCalendar" JSONB,
    "topLanguages" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gitlab_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gitlab_projects" (
    "id" TEXT NOT NULL,
    "gitlabProfileId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameWithNamespace" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "description" TEXT,
    "webUrl" TEXT NOT NULL,
    "starCount" INTEGER NOT NULL DEFAULT 0,
    "forksCount" INTEGER NOT NULL DEFAULT 0,
    "openIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "languages" JSONB,
    "visibility" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isShowcased" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "lastActivityAt" TIMESTAMP(3),

    CONSTRAINT "gitlab_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_portfolios" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "profileUrl" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "appreciations" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredProjects" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_platforms" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "profileUrl" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "articleCount" INTEGER NOT NULL DEFAULT 0,
    "totalReactions" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "topTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "articles" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "apiKey" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kaggle_profiles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "kaggleId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "profileUrl" TEXT NOT NULL,
    "bio" TEXT,
    "location" TEXT,
    "occupation" TEXT,
    "organization" TEXT,
    "tier" TEXT,
    "competitionTier" TEXT,
    "datasetTier" TEXT,
    "notebookTier" TEXT,
    "discussionTier" TEXT,
    "competitionRanking" INTEGER,
    "datasetRanking" INTEGER,
    "notebookRanking" INTEGER,
    "discussionRanking" INTEGER,
    "competitionCount" INTEGER NOT NULL DEFAULT 0,
    "datasetCount" INTEGER NOT NULL DEFAULT 0,
    "notebookCount" INTEGER NOT NULL DEFAULT 0,
    "discussionCount" INTEGER NOT NULL DEFAULT 0,
    "totalMedals" INTEGER NOT NULL DEFAULT 0,
    "goldMedals" INTEGER NOT NULL DEFAULT 0,
    "silverMedals" INTEGER NOT NULL DEFAULT 0,
    "bronzeMedals" INTEGER NOT NULL DEFAULT 0,
    "achievements" JSONB,
    "topCompetitions" JSONB,
    "featuredNotebooks" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "showOnProfile" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kaggle_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_platform_profiles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "profileUrl" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "globalRank" INTEGER,
    "countryRank" INTEGER,
    "rating" INTEGER,
    "maxRating" INTEGER,
    "percentile" DOUBLE PRECISION,
    "totalSolved" INTEGER NOT NULL DEFAULT 0,
    "easySolved" INTEGER NOT NULL DEFAULT 0,
    "mediumSolved" INTEGER NOT NULL DEFAULT 0,
    "hardSolved" INTEGER NOT NULL DEFAULT 0,
    "acceptanceRate" DOUBLE PRECISION,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "contestsAttended" INTEGER NOT NULL DEFAULT 0,
    "badges" JSONB,
    "totalBadges" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "maxStreak" INTEGER NOT NULL DEFAULT 0,
    "totalActiveDays" INTEGER NOT NULL DEFAULT 0,
    "languageStats" JSONB,
    "topSkills" JSONB,
    "recentSubmissions" JSONB,
    "contestHistory" JSONB,
    "hackerRankCertificates" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "apiKey" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "showOnProfile" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_platform_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_course_profiles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformUserId" TEXT,
    "username" TEXT,
    "displayName" TEXT,
    "profileUrl" TEXT,
    "avatarUrl" TEXT,
    "totalCourses" INTEGER NOT NULL DEFAULT 0,
    "completedCourses" INTEGER NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION,
    "certificationsEarned" INTEGER NOT NULL DEFAULT 0,
    "specializations" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "apiKey" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "showOnProfile" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_course_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_courses" (
    "id" TEXT NOT NULL,
    "courseProfileId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT,
    "platformCourseUrl" TEXT,
    "thumbnailUrl" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "duration" TEXT,
    "durationHours" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "enrolledAt" TIMESTAMP(3),
    "progress" DOUBLE PRECISION,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "grade" TEXT,
    "gradeNumeric" DOUBLE PRECISION,
    "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
    "certificateId" TEXT,
    "certificateUrl" TEXT,
    "certificateImageUrl" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verificationUrl" TEXT,
    "isShowcased" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_profiles" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "displayName" TEXT,
    "affiliation" TEXT,
    "department" TEXT,
    "position" TEXT,
    "email" TEXT,
    "website" TEXT,
    "bio" TEXT,
    "totalPublications" INTEGER NOT NULL DEFAULT 0,
    "totalCitations" INTEGER NOT NULL DEFAULT 0,
    "hIndex" INTEGER,
    "i10Index" INTEGER,
    "citationsLastYear" INTEGER,
    "researchInterests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coAuthors" JSONB,
    "featuredPublications" JSONB,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "accessToken" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "syncError" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "showOnProfile" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "academicProfileId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "publicationType" TEXT,
    "venue" TEXT,
    "publisher" TEXT,
    "volume" TEXT,
    "issue" TEXT,
    "pages" TEXT,
    "year" INTEGER,
    "doi" TEXT,
    "arxivId" TEXT,
    "pubmedId" TEXT,
    "url" TEXT,
    "pdfUrl" TEXT,
    "authors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authorPosition" INTEGER,
    "citations" INTEGER NOT NULL DEFAULT 0,
    "citationsLastYear" INTEGER,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isShowcased" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_portfolio_links" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "linkType" TEXT,
    "platform" TEXT,
    "siteName" TEXT,
    "favicon" TEXT,
    "thumbnailUrl" TEXT,
    "previewImage" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "embedUrl" TEXT,
    "duration" TEXT,
    "viewCount" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "showPreview" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "isAccessible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_portfolio_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_domain_verifications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "workExperienceId" TEXT,
    "workEmail" TEXT NOT NULL,
    "emailDomain" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "verificationCode" TEXT,
    "verificationToken" TEXT,
    "verificationStatus" "VerificationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "domainInfo" JSONB,
    "mxRecordValid" BOOLEAN,
    "domainCreatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "codeSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_domain_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linkedin_employment_verifications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "workExperienceId" TEXT NOT NULL,
    "linkedInProfileId" TEXT,
    "claimedCompanyName" TEXT NOT NULL,
    "claimedTitle" TEXT NOT NULL,
    "claimedStartDate" TIMESTAMP(3) NOT NULL,
    "claimedEndDate" TIMESTAMP(3),
    "claimedIsCurrent" BOOLEAN NOT NULL DEFAULT false,
    "linkedInCompanyName" TEXT,
    "linkedInTitle" TEXT,
    "linkedInStartDate" TIMESTAMP(3),
    "linkedInEndDate" TIMESTAMP(3),
    "linkedInIsCurrent" BOOLEAN,
    "companyNameMatch" TEXT,
    "titleMatch" TEXT,
    "dateMatch" TEXT,
    "overallMatch" TEXT,
    "matchScore" DOUBLE PRECISION,
    "matchDetails" JSONB,
    "verificationStatus" "VerificationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationError" TEXT,
    "needsManualReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linkedin_employment_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_endorsements" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "requestId" TEXT,
    "requestStatus" "EndorsementRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestSentAt" TIMESTAMP(3),
    "requestExpiresAt" TIMESTAMP(3),
    "requestMessage" TEXT,
    "endorserEmail" TEXT NOT NULL,
    "endorserName" TEXT NOT NULL,
    "endorserTitle" TEXT,
    "endorserCompany" TEXT,
    "endorserLinkedIn" TEXT,
    "endorserPhone" TEXT,
    "endorserAvatar" TEXT,
    "relationship" TEXT NOT NULL,
    "workedTogetherFrom" TIMESTAMP(3),
    "workedTogetherTo" TIMESTAMP(3),
    "workedAtCompany" TEXT,
    "sharedProjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "endorsementTitle" TEXT,
    "endorsementText" TEXT,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "areasOfExpertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skillEndorsements" JSONB,
    "overallRating" INTEGER,
    "workQualityRating" INTEGER,
    "collaborationRating" INTEGER,
    "communicationRating" INTEGER,
    "leadershipRating" INTEGER,
    "technicalSkillsRating" INTEGER,
    "reliabilityRating" INTEGER,
    "wouldWorkAgain" BOOLEAN,
    "wouldRecommend" BOOLEAN,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verificationToken" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "showOnProfile" BOOLEAN NOT NULL DEFAULT true,
    "anonymizeEndorser" BOOLEAN NOT NULL DEFAULT false,
    "endorsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peer_endorsements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_references" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "workExperienceId" TEXT,
    "requestId" TEXT,
    "requestStatus" "ReferenceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestSentAt" TIMESTAMP(3),
    "requestExpiresAt" TIMESTAMP(3),
    "requestMessage" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "referenceEmail" TEXT NOT NULL,
    "referenceName" TEXT NOT NULL,
    "referenceTitle" TEXT,
    "referenceCompany" TEXT,
    "referencePhone" TEXT,
    "referenceLinkedIn" TEXT,
    "referenceAvatar" TEXT,
    "referenceRelationship" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "candidateTitle" TEXT NOT NULL,
    "employmentStartDate" TIMESTAMP(3),
    "employmentEndDate" TIMESTAMP(3),
    "wasDirectReport" BOOLEAN,
    "reportingDuration" TEXT,
    "overallPerformance" INTEGER,
    "technicalCompetence" INTEGER,
    "communicationSkills" INTEGER,
    "teamworkCollaboration" INTEGER,
    "problemSolving" INTEGER,
    "leadership" INTEGER,
    "initiative" INTEGER,
    "reliability" INTEGER,
    "adaptability" INTEGER,
    "keyStrengths" TEXT,
    "areasForImprovement" TEXT,
    "majorAccomplishments" TEXT,
    "reasonForLeaving" TEXT,
    "additionalComments" TEXT,
    "eligibleForRehire" TEXT,
    "rehireComments" TEXT,
    "overallRecommendation" TEXT,
    "recommendationText" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verificationToken" TEXT,
    "verificationNotes" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "showOnProfile" BOOLEAN NOT NULL DEFAULT true,
    "anonymizeReference" BOOLEAN NOT NULL DEFAULT false,
    "shareWithEmployers" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_verifications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "verificationProvider" TEXT,
    "verificationEndpoint" TEXT,
    "apiResponse" JSONB,
    "verificationStatus" "VerificationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verifiedName" TEXT,
    "verifiedIssuingOrg" TEXT,
    "verifiedCredentialId" TEXT,
    "verifiedIssueDate" TIMESTAMP(3),
    "verifiedExpirationDate" TIMESTAMP(3),
    "verifiedHolderName" TEXT,
    "verifiedHolderEmail" TEXT,
    "verifiedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nameMatch" TEXT,
    "dateMatch" TEXT,
    "holderMatch" TEXT,
    "overallMatch" TEXT,
    "matchScore" DOUBLE PRECISION,
    "credentialStatus" TEXT,
    "statusCheckedAt" TIMESTAMP(3),
    "badgeUrl" TEXT,
    "badgeImageUrl" TEXT,
    "badgeAssertionId" TEXT,
    "verificationError" TEXT,
    "errorCode" TEXT,
    "lastVerificationAttempt" TIMESTAMP(3),
    "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
    "needsManualReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "autoReverify" BOOLEAN NOT NULL DEFAULT true,
    "nextReverificationAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certification_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_scores" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tier" TEXT,
    "emailVerificationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "linkedInVerificationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "endorsementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certificationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profileCompletenessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verifiedEmails" INTEGER NOT NULL DEFAULT 0,
    "verifiedEmployments" INTEGER NOT NULL DEFAULT 0,
    "endorsementsReceived" INTEGER NOT NULL DEFAULT 0,
    "referencesReceived" INTEGER NOT NULL DEFAULT 0,
    "verifiedCertifications" INTEGER NOT NULL DEFAULT 0,
    "scoreFactors" JSONB,
    "scoreHistory" JSONB,
    "hasVerifiedIdentity" BOOLEAN NOT NULL DEFAULT false,
    "hasVerifiedEmployment" BOOLEAN NOT NULL DEFAULT false,
    "hasEndorsements" BOOLEAN NOT NULL DEFAULT false,
    "hasReferences" BOOLEAN NOT NULL DEFAULT false,
    "hasVerifiedCerts" BOOLEAN NOT NULL DEFAULT false,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_verifications" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "educationId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "grade" TEXT,
    "verificationProvider" TEXT,
    "verificationEndpoint" TEXT,
    "requestId" TEXT,
    "requestStatus" "VerificationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestSentAt" TIMESTAMP(3),
    "requestExpiresAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verifiedInstitution" TEXT,
    "verifiedDegree" TEXT,
    "verifiedFieldOfStudy" TEXT,
    "verifiedStartDate" TIMESTAMP(3),
    "verifiedEndDate" TIMESTAMP(3),
    "verifiedGraduationDate" TIMESTAMP(3),
    "verifiedGrade" TEXT,
    "verifiedHonors" TEXT,
    "degreeConferred" BOOLEAN,
    "institutionMatch" TEXT,
    "degreeMatch" TEXT,
    "dateMatch" TEXT,
    "overallMatch" TEXT,
    "matchScore" DOUBLE PRECISION,
    "apiResponse" JSONB,
    "verificationError" TEXT,
    "errorCode" TEXT,
    "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
    "needsManualReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "transcriptUrl" TEXT,
    "diplomaUrl" TEXT,
    "additionalDocs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_checks" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerCheckId" TEXT,
    "checkType" "BackgroundCheckType" NOT NULL DEFAULT 'STANDARD',
    "packageName" TEXT,
    "includedChecks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requestId" TEXT,
    "status" "BackgroundCheckStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "requestedAt" TIMESTAMP(3),
    "requestedBy" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentGivenAt" TIMESTAMP(3),
    "consentDocument" TEXT,
    "completedChecks" INTEGER NOT NULL DEFAULT 0,
    "totalChecks" INTEGER NOT NULL DEFAULT 0,
    "currentStep" TEXT,
    "overallResult" TEXT,
    "completedAt" TIMESTAMP(3),
    "reportUrl" TEXT,
    "checkResults" JSONB,
    "adjudicationStatus" TEXT,
    "adjudicatedAt" TIMESTAMP(3),
    "adjudicatedBy" TEXT,
    "adjudicationNotes" TEXT,
    "validUntil" TIMESTAMP(3),
    "canBeShared" BOOLEAN NOT NULL DEFAULT true,
    "webhookUrl" TEXT,
    "lastWebhookAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "background_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verified_badges" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeDescription" TEXT,
    "badgeIcon" TEXT,
    "badgeColor" TEXT,
    "verificationSource" TEXT NOT NULL,
    "verificationId" TEXT,
    "verificationType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "showOnProfile" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verified_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supportedLanguages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "defaultLanguage" TEXT NOT NULL DEFAULT 'javascript',
    "problemStatement" TEXT NOT NULL,
    "constraints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "examples" JSONB NOT NULL,
    "sampleTestCases" JSONB NOT NULL,
    "hiddenTestCases" JSONB NOT NULL,
    "totalTestCases" INTEGER NOT NULL DEFAULT 0,
    "starterCode" JSONB NOT NULL,
    "solutionCode" JSONB,
    "timeLimitMinutes" INTEGER NOT NULL DEFAULT 60,
    "maxAttempts" INTEGER,
    "pointsValue" INTEGER NOT NULL DEFAULT 100,
    "autoGrade" BOOLEAN NOT NULL DEFAULT true,
    "partialCredit" BOOLEAN NOT NULL DEFAULT true,
    "memoryLimitMB" INTEGER NOT NULL DEFAULT 256,
    "executionTimeLimitMs" INTEGER NOT NULL DEFAULT 5000,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "totalCompletions" INTEGER NOT NULL DEFAULT 0,
    "avgCompletionTime" DOUBLE PRECISION,
    "avgScore" DOUBLE PRECISION,
    "successRate" DOUBLE PRECISION,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_submissions" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "ChallengeSubmissionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER,
    "testCasesPassed" INTEGER NOT NULL DEFAULT 0,
    "totalTestCases" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "executionTime" DOUBLE PRECISION,
    "memoryUsed" DOUBLE PRECISION,
    "testResults" JSONB,
    "codeQualityScore" DOUBLE PRECISION,
    "complexity" TEXT,
    "linesOfCode" INTEGER,
    "autoFeedback" TEXT,
    "reviewerFeedback" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "plagiarismScore" DOUBLE PRECISION,
    "plagiarismFlags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_quizzes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "passingScore" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT true,
    "shuffleOptions" BOOLEAN NOT NULL DEFAULT true,
    "timeLimitMinutes" INTEGER,
    "showTimer" BOOLEAN NOT NULL DEFAULT true,
    "maxAttempts" INTEGER,
    "cooldownMinutes" INTEGER,
    "showCorrectAnswers" BOOLEAN NOT NULL DEFAULT false,
    "showExplanations" BOOLEAN NOT NULL DEFAULT true,
    "showScoreImmediately" BOOLEAN NOT NULL DEFAULT true,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "totalCompletions" INTEGER NOT NULL DEFAULT 0,
    "avgScore" DOUBLE PRECISION,
    "avgTimeSeconds" DOUBLE PRECISION,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technical_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'multiple_choice',
    "questionText" TEXT NOT NULL,
    "questionCode" TEXT,
    "options" JSONB NOT NULL,
    "correctAnswers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expectedAnswer" TEXT,
    "acceptedVariations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "caseSensitive" BOOLEAN NOT NULL DEFAULT false,
    "explanation" TEXT,
    "references" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "points" INTEGER NOT NULL DEFAULT 1,
    "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skill" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "ChallengeSubmissionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER,
    "score" DOUBLE PRECISION,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "incorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "skippedQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN,
    "passingScore" DOUBLE PRECISION,
    "answers" JSONB NOT NULL,
    "skillBreakdown" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_coding_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "candidateId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "additionalInterviewers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" "LiveCodingSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "supportedLanguages" TEXT[] DEFAULT ARRAY['javascript', 'python', 'java']::TEXT[],
    "template" TEXT,
    "problem" TEXT,
    "testCases" JSONB,
    "meetingUrl" TEXT,
    "meetingProvider" TEXT,
    "roomId" TEXT,
    "currentCode" TEXT,
    "codeHistory" JSONB,
    "chatHistory" JSONB,
    "annotations" JSONB,
    "isRecorded" BOOLEAN NOT NULL DEFAULT false,
    "recordingUrl" TEXT,
    "recordingConsent" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "actualDuration" INTEGER,
    "interviewerNotes" TEXT,
    "technicalScore" INTEGER,
    "communicationScore" INTEGER,
    "problemSolvingScore" INTEGER,
    "overallScore" INTEGER,
    "recommendation" TEXT,
    "feedback" TEXT,
    "jobId" TEXT,
    "applicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_coding_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "take_home_projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "briefDescription" TEXT,
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technicalRequirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deliverables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evaluationCriteria" JSONB,
    "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedHours" INTEGER NOT NULL DEFAULT 8,
    "deadlineDays" INTEGER NOT NULL DEFAULT 7,
    "allowExtension" BOOLEAN NOT NULL DEFAULT true,
    "maxExtensionDays" INTEGER NOT NULL DEFAULT 3,
    "maxSubmissions" INTEGER NOT NULL DEFAULT 1,
    "allowResubmission" BOOLEAN NOT NULL DEFAULT false,
    "submissionFormat" TEXT[] DEFAULT ARRAY['github', 'zip']::TEXT[],
    "starterRepoUrl" TEXT,
    "resourceLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supportContact" TEXT,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "totalAssignments" INTEGER NOT NULL DEFAULT 0,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "avgCompletionHours" DOUBLE PRECISION,
    "avgScore" DOUBLE PRECISION,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "take_home_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_submissions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "extendedDeadline" TIMESTAMP(3),
    "extensionReason" TEXT,
    "status" "ProjectSubmissionStatus" NOT NULL DEFAULT 'ASSIGNED',
    "submissionNumber" INTEGER NOT NULL DEFAULT 1,
    "githubUrl" TEXT,
    "zipFileUrl" TEXT,
    "livePreviewUrl" TEXT,
    "submissionNotes" TEXT,
    "technologiesUsed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "timeSpentHours" DOUBLE PRECISION,
    "reviewerId" TEXT,
    "reviewerName" TEXT,
    "reviewStartedAt" TIMESTAMP(3),
    "reviewCompletedAt" TIMESTAMP(3),
    "overallScore" DOUBLE PRECISION,
    "codeQualityScore" DOUBLE PRECISION,
    "functionalityScore" DOUBLE PRECISION,
    "designScore" DOUBLE PRECISION,
    "documentationScore" DOUBLE PRECISION,
    "creativityScore" DOUBLE PRECISION,
    "criteriaScores" JSONB,
    "reviewFeedback" TEXT,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "improvements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendation" TEXT,
    "plagiarismChecked" BOOLEAN NOT NULL DEFAULT false,
    "plagiarismScore" DOUBLE PRECISION,
    "plagiarismReport" TEXT,
    "jobId" TEXT,
    "applicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_assessments" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "provider" "ExternalAssessmentProvider" NOT NULL,
    "providerUserId" TEXT,
    "providerUsername" TEXT,
    "assessmentId" TEXT NOT NULL,
    "assessmentName" TEXT NOT NULL,
    "assessmentType" TEXT,
    "assessmentUrl" TEXT,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "percentile" DOUBLE PRECISION,
    "rank" INTEGER,
    "level" TEXT,
    "skillScores" JSONB,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verificationData" JSONB,
    "takenAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importSource" TEXT,
    "rawData" JSONB,
    "showOnProfile" BOOLEAN NOT NULL DEFAULT true,
    "featuredScore" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soft_skills_assessments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "category" "SoftSkillCategory" NOT NULL,
    "subcategory" TEXT,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "timeLimitMinutes" INTEGER,
    "isAdaptive" BOOLEAN NOT NULL DEFAULT false,
    "scoringMethod" TEXT NOT NULL DEFAULT 'standard',
    "resultType" TEXT NOT NULL DEFAULT 'profile',
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "avgCompletionMinutes" DOUBLE PRECISION,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soft_skills_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soft_skill_questions" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'likert',
    "questionText" TEXT NOT NULL,
    "scenario" TEXT,
    "options" JSONB NOT NULL,
    "dimensions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "itemsToRank" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scoringKey" JSONB,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soft_skill_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soft_skill_attempts" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ChallengeSubmissionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpentMinutes" INTEGER,
    "responses" JSONB NOT NULL,
    "dimensionScores" JSONB,
    "traitProfile" JSONB,
    "overallProfile" TEXT,
    "interpretation" TEXT,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "developmentAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "consistencyScore" DOUBLE PRECISION,
    "socialDesirabilityScore" DOUBLE PRECISION,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soft_skill_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language_proficiency_tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL,
    "testType" "LanguageTestType" NOT NULL DEFAULT 'COMPREHENSIVE',
    "sections" JSONB NOT NULL,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalTimeMinutes" INTEGER NOT NULL DEFAULT 60,
    "scoringScale" TEXT NOT NULL DEFAULT 'cefr',
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "levelThresholds" JSONB,
    "hasSpeaking" BOOLEAN NOT NULL DEFAULT false,
    "hasWriting" BOOLEAN NOT NULL DEFAULT false,
    "hasListening" BOOLEAN NOT NULL DEFAULT false,
    "hasReading" BOOLEAN NOT NULL DEFAULT true,
    "hasGrammar" BOOLEAN NOT NULL DEFAULT true,
    "hasVocabulary" BOOLEAN NOT NULL DEFAULT true,
    "aiSpeakingEvaluation" BOOLEAN NOT NULL DEFAULT false,
    "aiWritingEvaluation" BOOLEAN NOT NULL DEFAULT false,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "avgScore" DOUBLE PRECISION,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "language_proficiency_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language_questions" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "questionText" TEXT NOT NULL,
    "contextText" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "options" JSONB,
    "rubric" JSONB,
    "sampleAnswer" TEXT,
    "minWords" INTEGER,
    "maxWords" INTEGER,
    "speakingTimeSeconds" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 1,
    "correctAnswer" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "timeLimit" INTEGER,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "language_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language_test_attempts" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ChallengeSubmissionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpentMinutes" INTEGER,
    "sectionsCompleted" JSONB,
    "currentSection" TEXT,
    "responses" JSONB NOT NULL,
    "readingScore" DOUBLE PRECISION,
    "listeningScore" DOUBLE PRECISION,
    "grammarScore" DOUBLE PRECISION,
    "vocabularyScore" DOUBLE PRECISION,
    "writingScore" DOUBLE PRECISION,
    "speakingScore" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION,
    "percentile" DOUBLE PRECISION,
    "level" TEXT,
    "writingFeedback" JSONB,
    "speakingFeedback" JSONB,
    "aiEvaluatedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewerFeedback" TEXT,
    "finalScore" DOUBLE PRECISION,
    "certificateUrl" TEXT,
    "certificateIssuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "language_test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_assessments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "domain" "DomainCategory" NOT NULL,
    "subDomain" TEXT,
    "difficultyLevel" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 30,
    "passingScore" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "totalPoints" INTEGER NOT NULL DEFAULT 100,
    "questionCount" INTEGER NOT NULL DEFAULT 30,
    "randomizeQuestions" BOOLEAN NOT NULL DEFAULT true,
    "showCorrectAnswers" BOOLEAN NOT NULL DEFAULT false,
    "timeLimit" INTEGER,
    "allowPause" BOOLEAN NOT NULL DEFAULT false,
    "providesCertificate" BOOLEAN NOT NULL DEFAULT true,
    "certificateValidDays" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_questions" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT,
    "caseStudy" TEXT,
    "exhibits" JSONB,
    "points" INTEGER NOT NULL DEFAULT 1,
    "partialCreditAllowed" BOOLEAN NOT NULL DEFAULT false,
    "explanation" TEXT,
    "references" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL,
    "topic" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_assessment_attempts" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "pausedAt" TIMESTAMP(3),
    "totalPauseSeconds" INTEGER NOT NULL DEFAULT 0,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "answers" JSONB NOT NULL,
    "flaggedQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rawScore" DOUBLE PRECISION,
    "percentageScore" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "topicScores" JSONB,
    "skillScores" JSONB,
    "percentile" DOUBLE PRECISION,
    "ranking" INTEGER,
    "certificateId" TEXT,
    "certificateUrl" TEXT,
    "certificateExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_assessment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "totalAssessmentsTaken" INTEGER NOT NULL DEFAULT 0,
    "totalAssessmentsPassed" INTEGER NOT NULL DEFAULT 0,
    "overallAverageScore" DOUBLE PRECISION,
    "codingChallenges" JSONB,
    "technicalQuizzes" JSONB,
    "domainAssessments" JSONB,
    "softSkillsTests" JSONB,
    "languageTests" JSONB,
    "skillPerformance" JSONB,
    "averageCompletionTime" INTEGER,
    "fastestCompletion" INTEGER,
    "totalTimeSpent" INTEGER,
    "scoreHistory" JSONB,
    "monthlyProgress" JSONB,
    "percentileRankings" JSONB,
    "industryComparison" JSONB,
    "topStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "areasForImprovement" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendedAssessments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedLearning" JSONB,
    "lastAssessmentAt" TIMESTAMP(3),
    "lastAnalyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_decay_trackers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "lastAssessedAt" TIMESTAMP(3) NOT NULL,
    "lastScore" DOUBLE PRECISION NOT NULL,
    "peakScore" DOUBLE PRECISION NOT NULL,
    "assessmentCount" INTEGER NOT NULL DEFAULT 1,
    "decayRate" DOUBLE PRECISION,
    "currentEstimatedScore" DOUBLE PRECISION,
    "confidenceLevel" DOUBLE PRECISION,
    "refreshDueAt" TIMESTAMP(3),
    "refreshPriority" TEXT,
    "skillCategory" TEXT,
    "relatedAssessments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "scoreHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_decay_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_profile_scores" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "scoreGrade" TEXT NOT NULL,
    "profileCompleteness" DOUBLE PRECISION NOT NULL,
    "experienceDepth" DOUBLE PRECISION NOT NULL,
    "skillsVerification" DOUBLE PRECISION NOT NULL,
    "educationStrength" DOUBLE PRECISION NOT NULL,
    "projectQuality" DOUBLE PRECISION NOT NULL,
    "assessmentPerformance" DOUBLE PRECISION NOT NULL,
    "verificationScore" DOUBLE PRECISION NOT NULL,
    "engagementScore" DOUBLE PRECISION NOT NULL,
    "componentWeights" JSONB NOT NULL,
    "componentDetails" JSONB NOT NULL,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" JSONB,
    "estimatedLevel" TEXT,
    "yearsOfExperience" INTEGER,
    "topIndustries" JSONB,
    "topRoles" JSONB,
    "marketPercentile" DOUBLE PRECISION,
    "salaryEstimate" JSONB,
    "similarProfiles" INTEGER,
    "standoutFactors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scoringVersion" TEXT NOT NULL DEFAULT '1.0',
    "scoringAlgorithm" TEXT NOT NULL DEFAULT 'default',
    "lastScoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_profile_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_fit_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "jobId" TEXT NOT NULL,
    "applicationId" TEXT,
    "overallFitScore" DOUBLE PRECISION NOT NULL,
    "fitCategory" TEXT NOT NULL,
    "skillsMatch" DOUBLE PRECISION NOT NULL,
    "experienceMatch" DOUBLE PRECISION NOT NULL,
    "educationMatch" DOUBLE PRECISION NOT NULL,
    "locationMatch" DOUBLE PRECISION NOT NULL,
    "salaryMatch" DOUBLE PRECISION NOT NULL,
    "senioritylMatch" DOUBLE PRECISION NOT NULL,
    "industryMatch" DOUBLE PRECISION NOT NULL,
    "cultureMatch" DOUBLE PRECISION,
    "matchedSkills" JSONB NOT NULL,
    "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bonusSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceAnalysis" JSONB,
    "relevantExperience" JSONB,
    "requirementMatches" JSONB NOT NULL,
    "knockoutFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "candidateSummary" TEXT,
    "interviewFocus" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "concernFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rankAmongApplicants" INTEGER,
    "percentileAmongApplicants" DOUBLE PRECISION,
    "similarCandidates" INTEGER,
    "scoringVersion" TEXT NOT NULL DEFAULT '1.0',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_fit_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "culture_fit_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "companyId" TEXT,
    "jobId" TEXT,
    "overallCultureScore" DOUBLE PRECISION NOT NULL,
    "fitLevel" TEXT NOT NULL,
    "workStyleAlignment" DOUBLE PRECISION NOT NULL,
    "collaborationStyle" TEXT NOT NULL,
    "communicationStyle" TEXT NOT NULL,
    "decisionMaking" TEXT NOT NULL,
    "feedbackPreference" TEXT NOT NULL,
    "remotePreference" TEXT NOT NULL,
    "workHoursFlexibility" TEXT NOT NULL,
    "meetingTolerance" TEXT NOT NULL,
    "focusTimeNeeds" TEXT NOT NULL,
    "valuesAlignment" DOUBLE PRECISION NOT NULL,
    "topValues" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "matchedValues" JSONB,
    "conflictingValues" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "teamSizePreference" TEXT NOT NULL,
    "leadershipStyle" TEXT NOT NULL,
    "conflictResolution" TEXT NOT NULL,
    "teamRoleArchetype" TEXT NOT NULL,
    "primaryMotivators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "careerPriorities" JSONB,
    "workLifeBalance" DOUBLE PRECISION NOT NULL,
    "preferredCompanySize" TEXT NOT NULL,
    "preferredIndustries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startupReadiness" DOUBLE PRECISION NOT NULL,
    "corporateReadiness" DOUBLE PRECISION NOT NULL,
    "changeAdaptability" DOUBLE PRECISION NOT NULL,
    "ambiguityTolerance" DOUBLE PRECISION NOT NULL,
    "riskTolerance" TEXT NOT NULL,
    "strengthFactors" JSONB,
    "concernFactors" JSONB,
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fitSummary" TEXT,
    "assessmentResponses" JSONB,
    "inferredFromProfile" JSONB,
    "behavioralSignals" JSONB,
    "scoringVersion" TEXT NOT NULL DEFAULT '1.0',
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "culture_fit_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "growth_potential_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "overallGrowthScore" DOUBLE PRECISION NOT NULL,
    "growthTier" TEXT NOT NULL,
    "learningAgility" DOUBLE PRECISION NOT NULL,
    "skillAcquisitionRate" DOUBLE PRECISION NOT NULL,
    "knowledgeRetention" DOUBLE PRECISION NOT NULL,
    "adaptabilityScore" DOUBLE PRECISION NOT NULL,
    "careerProgressionRate" DOUBLE PRECISION NOT NULL,
    "promotionHistory" JSONB,
    "roleComplexityGrowth" DOUBLE PRECISION NOT NULL,
    "responsibilityExpansion" DOUBLE PRECISION NOT NULL,
    "careerMomentum" TEXT NOT NULL,
    "skillGrowthVelocity" DOUBLE PRECISION NOT NULL,
    "techAdoptionSpeed" TEXT NOT NULL,
    "breadthVsDepth" TEXT NOT NULL,
    "emergingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "continuousLearning" DOUBLE PRECISION NOT NULL,
    "recentCertifications" INTEGER NOT NULL,
    "educationRecency" TEXT NOT NULL,
    "learningInvestment" DOUBLE PRECISION NOT NULL,
    "leadershipPotential" DOUBLE PRECISION NOT NULL,
    "managementExperience" JSONB,
    "mentorshipActivities" INTEGER NOT NULL,
    "initiativeTaking" DOUBLE PRECISION NOT NULL,
    "innovationScore" DOUBLE PRECISION NOT NULL,
    "impactEvidence" JSONB,
    "problemSolvingAbility" DOUBLE PRECISION NOT NULL,
    "creativeThinking" DOUBLE PRECISION NOT NULL,
    "achievementDensity" DOUBLE PRECISION NOT NULL,
    "recognitionFrequency" DOUBLE PRECISION NOT NULL,
    "overachievementSignals" JSONB,
    "predictedGrowthPath" JSONB,
    "suggestedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "developmentAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ceilingEstimate" TEXT,
    "growthDrivers" JSONB,
    "growthLimiters" JSONB,
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "potentialSummary" TEXT,
    "linkedinActivity" JSONB,
    "githubActivity" JSONB,
    "learningPlatformData" JSONB,
    "scoringVersion" TEXT NOT NULL DEFAULT '1.0',
    "lastScoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "growth_potential_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_depth_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "overallTechnicalScore" DOUBLE PRECISION NOT NULL,
    "technicalTier" TEXT NOT NULL,
    "codeQualityScore" DOUBLE PRECISION NOT NULL,
    "codeComplexityHandled" TEXT NOT NULL,
    "codingPatterns" JSONB,
    "bestPracticesScore" DOUBLE PRECISION NOT NULL,
    "testingPractices" DOUBLE PRECISION NOT NULL,
    "githubScore" DOUBLE PRECISION,
    "totalContributions" INTEGER,
    "consistencyScore" DOUBLE PRECISION,
    "repositoryQuality" DOUBLE PRECISION,
    "openSourceImpact" JSONB,
    "languageProficiency" JSONB,
    "stackOverflowScore" DOUBLE PRECISION,
    "reputation" INTEGER,
    "answerQuality" DOUBLE PRECISION,
    "topTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "acceptedAnswerRate" DOUBLE PRECISION,
    "helpfulnessScore" DOUBLE PRECISION,
    "projectComplexityScore" DOUBLE PRECISION NOT NULL,
    "architectureExperience" JSONB,
    "systemDesignCapability" DOUBLE PRECISION NOT NULL,
    "scalabilityExperience" JSONB,
    "primaryStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stackDepth" JSONB,
    "stackBreadth" INTEGER NOT NULL,
    "modernTechAdoption" DOUBLE PRECISION NOT NULL,
    "domainExpertise" JSONB,
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industryExperience" JSONB,
    "algorithmProficiency" DOUBLE PRECISION,
    "dataStructureSkills" DOUBLE PRECISION,
    "debuggingAbility" DOUBLE PRECISION NOT NULL,
    "optimizationSkills" DOUBLE PRECISION,
    "technicalLeadership" DOUBLE PRECISION NOT NULL,
    "architectureDecisions" JSONB,
    "mentorshipEvidence" JSONB,
    "codeReviewActivity" DOUBLE PRECISION,
    "relevantCertifications" JSONB,
    "certificationScore" DOUBLE PRECISION NOT NULL,
    "technicalStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technicalGaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technicalSummary" TEXT,
    "marketPercentile" DOUBLE PRECISION,
    "similarProfiles" INTEGER,
    "analyzedRepos" JSONB,
    "analyzedProjects" JSONB,
    "lastGithubSync" TIMESTAMP(3),
    "lastStackOverflowSync" TIMESTAMP(3),
    "scoringVersion" TEXT NOT NULL DEFAULT '1.0',
    "lastScoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technical_depth_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "overallCommScore" DOUBLE PRECISION NOT NULL,
    "communicationTier" TEXT NOT NULL,
    "writtenScore" DOUBLE PRECISION NOT NULL,
    "writingClarity" DOUBLE PRECISION NOT NULL,
    "writingConciseness" DOUBLE PRECISION NOT NULL,
    "grammarAccuracy" DOUBLE PRECISION NOT NULL,
    "professionalTone" DOUBLE PRECISION NOT NULL,
    "structureOrganization" DOUBLE PRECISION NOT NULL,
    "writingSamples" JSONB,
    "vocabularyLevel" TEXT NOT NULL,
    "technicalWriting" DOUBLE PRECISION NOT NULL,
    "persuasiveWriting" DOUBLE PRECISION NOT NULL,
    "verbalScore" DOUBLE PRECISION,
    "articulationClarity" DOUBLE PRECISION,
    "responseStructure" DOUBLE PRECISION,
    "activeListening" DOUBLE PRECISION,
    "questionHandling" DOUBLE PRECISION,
    "interviewCommunication" JSONB,
    "presentationSkills" DOUBLE PRECISION,
    "explanationAbility" DOUBLE PRECISION NOT NULL,
    "technicalExplanation" DOUBLE PRECISION NOT NULL,
    "emailProfessionalism" DOUBLE PRECISION,
    "responsiveness" DOUBLE PRECISION NOT NULL,
    "followUpQuality" DOUBLE PRECISION,
    "negotiationSkills" DOUBLE PRECISION,
    "languageProficiencies" JSONB,
    "primaryLanguage" TEXT NOT NULL DEFAULT 'English',
    "crossCulturalAwareness" DOUBLE PRECISION,
    "collaborationComm" DOUBLE PRECISION NOT NULL,
    "feedbackDelivery" DOUBLE PRECISION,
    "feedbackReception" DOUBLE PRECISION,
    "conflictCommunication" DOUBLE PRECISION,
    "profileWritingQuality" DOUBLE PRECISION NOT NULL,
    "projectDescriptions" DOUBLE PRECISION NOT NULL,
    "experienceArticulation" DOUBLE PRECISION NOT NULL,
    "publicSpeaking" DOUBLE PRECISION,
    "contentCreation" DOUBLE PRECISION,
    "socialMediaProfessionalism" DOUBLE PRECISION,
    "communicationStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "communicationGaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "developmentAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commSummary" TEXT,
    "analyzedDocuments" JSONB,
    "interviewTranscripts" JSONB,
    "emailSamples" INTEGER,
    "scoringVersion" TEXT NOT NULL DEFAULT '1.0',
    "lastScoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reliability_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "overallReliabilityScore" DOUBLE PRECISION NOT NULL,
    "reliabilityTier" TEXT NOT NULL,
    "applicationCompletion" DOUBLE PRECISION NOT NULL,
    "profileCompleteness" DOUBLE PRECISION NOT NULL,
    "documentSubmission" DOUBLE PRECISION NOT NULL,
    "deadlineAdherence" DOUBLE PRECISION NOT NULL,
    "responseRate" DOUBLE PRECISION NOT NULL,
    "averageResponseTime" DOUBLE PRECISION NOT NULL,
    "responseTimeConsistency" DOUBLE PRECISION NOT NULL,
    "responseQuality" DOUBLE PRECISION NOT NULL,
    "interviewAttendance" DOUBLE PRECISION NOT NULL,
    "punctualityScore" DOUBLE PRECISION NOT NULL,
    "rescheduleRate" DOUBLE PRECISION NOT NULL,
    "noShowCount" INTEGER NOT NULL DEFAULT 0,
    "lastMinuteCancellations" INTEGER NOT NULL DEFAULT 0,
    "engagementConsistency" DOUBLE PRECISION NOT NULL,
    "followThroughRate" DOUBLE PRECISION NOT NULL,
    "processAdherence" DOUBLE PRECISION NOT NULL,
    "loginConsistency" DOUBLE PRECISION,
    "profileUpdateFrequency" DOUBLE PRECISION,
    "applicationActivity" JSONB,
    "applicationHistory" JSONB,
    "withdrawalPatterns" JSONB,
    "ghostingIncidents" INTEGER NOT NULL DEFAULT 0,
    "longTermCommitment" DOUBLE PRECISION NOT NULL,
    "jobHoppingRisk" TEXT NOT NULL,
    "averageTenure" DOUBLE PRECISION,
    "careerStability" DOUBLE PRECISION NOT NULL,
    "referenceAvailability" DOUBLE PRECISION,
    "referenceQuality" DOUBLE PRECISION,
    "employerRelationships" TEXT,
    "verificationCompliance" DOUBLE PRECISION NOT NULL,
    "documentAuthenticity" DOUBLE PRECISION,
    "backgroundCheckStatus" TEXT,
    "reliabilityRisks" JSONB,
    "redFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "greenFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reliabilityDrivers" JSONB,
    "concernAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reliabilitySummary" TEXT,
    "reliabilityTrend" TEXT NOT NULL,
    "trendData" JSONB,
    "dataPoints" INTEGER NOT NULL DEFAULT 0,
    "confidenceLevel" TEXT NOT NULL,
    "scoringVersion" TEXT NOT NULL DEFAULT '1.0',
    "lastScoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reliability_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_alignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "jobId" TEXT,
    "expectedSalaryMin" DOUBLE PRECISION,
    "expectedSalaryMax" DOUBLE PRECISION,
    "expectedSalaryCurrency" TEXT NOT NULL DEFAULT 'USD',
    "salaryFlexibility" TEXT NOT NULL,
    "prioritizesEquity" BOOLEAN NOT NULL DEFAULT false,
    "bonusExpectations" DOUBLE PRECISION,
    "benefitsPriority" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "marketSalaryMin" DOUBLE PRECISION NOT NULL,
    "marketSalaryMax" DOUBLE PRECISION NOT NULL,
    "marketSalaryMedian" DOUBLE PRECISION NOT NULL,
    "marketSalaryCurrency" TEXT NOT NULL DEFAULT 'USD',
    "marketPercentile" DOUBLE PRECISION NOT NULL,
    "marketDataSource" TEXT NOT NULL,
    "marketDataDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobBudgetMin" DOUBLE PRECISION,
    "jobBudgetMax" DOUBLE PRECISION,
    "budgetFlexibility" TEXT,
    "alignmentScore" DOUBLE PRECISION NOT NULL,
    "alignmentCategory" TEXT NOT NULL,
    "gapAnalysis" JSONB,
    "baseSalaryAlignment" DOUBLE PRECISION NOT NULL,
    "bonusAlignment" DOUBLE PRECISION,
    "equityAlignment" DOUBLE PRECISION,
    "benefitsValue" DOUBLE PRECISION,
    "totalCompAlignment" DOUBLE PRECISION NOT NULL,
    "locationAdjustment" DOUBLE PRECISION,
    "adjustedExpectation" DOUBLE PRECISION,
    "negotiationRoom" DOUBLE PRECISION,
    "suggestedOffer" DOUBLE PRECISION,
    "counterOfferLikely" BOOLEAN NOT NULL DEFAULT false,
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "negotiationTips" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "alignmentSummary" TEXT,
    "scoringVersion" TEXT NOT NULL DEFAULT '1.0',
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_alignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_compatibilities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "jobId" TEXT,
    "currentCity" TEXT,
    "currentState" TEXT,
    "currentCountry" TEXT NOT NULL,
    "currentTimezone" TEXT,
    "remotePreference" TEXT NOT NULL,
    "hybridDaysInOffice" INTEGER,
    "relocationWilling" BOOLEAN NOT NULL DEFAULT false,
    "relocationLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relocationTimeframe" TEXT,
    "relocationAssistance" BOOLEAN NOT NULL DEFAULT false,
    "travelWillingness" TEXT NOT NULL,
    "maxTravelPercent" INTEGER,
    "internationalTravel" BOOLEAN NOT NULL DEFAULT false,
    "jobLocationType" TEXT,
    "jobCity" TEXT,
    "jobState" TEXT,
    "jobCountry" TEXT,
    "jobTimezone" TEXT,
    "jobTravelRequired" TEXT,
    "overallCompatibility" DOUBLE PRECISION NOT NULL,
    "compatibilityLevel" TEXT NOT NULL,
    "locationMatch" DOUBLE PRECISION NOT NULL,
    "remoteCompatibility" DOUBLE PRECISION NOT NULL,
    "timezoneOverlap" DOUBLE PRECISION NOT NULL,
    "travelCompatibility" DOUBLE PRECISION NOT NULL,
    "relocationFeasibility" DOUBLE PRECISION,
    "distanceToOffice" DOUBLE PRECISION,
    "commuteTime" INTEGER,
    "commuteMethod" TEXT,
    "timezoneOffset" INTEGER,
    "overlapHours" INTEGER,
    "meetingFriendly" BOOLEAN NOT NULL DEFAULT true,
    "candidateCOL" DOUBLE PRECISION,
    "jobLocationCOL" DOUBLE PRECISION,
    "salaryAdjustment" DOUBLE PRECISION,
    "workAuthorization" TEXT,
    "visaType" TEXT,
    "visaExpiry" TIMESTAMP(3),
    "sponsorshipNeeded" BOOLEAN NOT NULL DEFAULT false,
    "compatibilityFactors" JSONB,
    "challenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mitigations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compatibilitySummary" TEXT,
    "scoringVersion" TEXT NOT NULL DEFAULT '1.0',
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_compatibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "di_metrics" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "jobId" TEXT,
    "analysisType" TEXT NOT NULL,
    "genderNeutralityScore" DOUBLE PRECISION,
    "ageNeutralityScore" DOUBLE PRECISION,
    "accessibilityScore" DOUBLE PRECISION,
    "inclusivityScore" DOUBLE PRECISION,
    "flaggedTerms" JSONB,
    "pipelineDiversity" JSONB,
    "sourceChannelDiversity" JSONB,
    "conversionByDemographic" JSONB,
    "scoringBiasAnalysis" JSONB,
    "demographicScoreGaps" JSONB,
    "statParityScore" DOUBLE PRECISION,
    "equalOpportunityScore" DOUBLE PRECISION,
    "industryBenchmarks" JSONB,
    "companyComparison" JSONB,
    "underrepresentedGaps" JSONB,
    "biasAlerts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "improvementActions" JSONB,
    "priorityFixes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eeocCompliant" BOOLEAN NOT NULL DEFAULT true,
    "gdprCompliant" BOOLEAN NOT NULL DEFAULT true,
    "localCompliance" JSONB,
    "overallDIScore" DOUBLE PRECISION NOT NULL,
    "diGrade" TEXT NOT NULL,
    "analyzedBy" TEXT,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "di_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_explanations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "profileId" TEXT,
    "jobId" TEXT,
    "scoreType" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "scoreValue" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "topContributors" JSONB NOT NULL,
    "topDetractors" JSONB NOT NULL,
    "factors" JSONB NOT NULL,
    "factorWeights" JSONB NOT NULL,
    "factorSources" JSONB NOT NULL,
    "percentileRank" DOUBLE PRECISION,
    "similarProfiles" JSONB,
    "benchmarkComparison" JSONB,
    "improvementSuggestions" JSONB,
    "sensitivityAnalysis" JSONB,
    "visualizations" JSONB,
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "algorithmVersion" TEXT NOT NULL,
    "dataPoints" INTEGER NOT NULL,
    "dataQuality" TEXT NOT NULL,
    "limitations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "helpfulRating" INTEGER,
    "feedbackText" TEXT,
    "feedbackDate" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "score_explanations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_calibrations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "calibrationName" TEXT NOT NULL,
    "description" TEXT,
    "scope" TEXT NOT NULL,
    "jobFamilies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "departments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jobIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profileScoreWeights" JSONB,
    "jobFitWeights" JSONB,
    "cultureFitWeights" JSONB,
    "technicalWeights" JSONB,
    "minimumThresholds" JSONB,
    "knockoutCriteria" JSONB,
    "bonusCriteria" JSONB,
    "customRules" JSONB,
    "skillPriorities" JSONB,
    "experienceWeighting" JSONB,
    "benchmarkSource" TEXT,
    "benchmarkData" JSONB,
    "validationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "testResults" JSONB,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "candidatesScored" INTEGER NOT NULL DEFAULT 0,
    "hireCorrelation" DOUBLE PRECISION,
    "retentionCorrelation" DOUBLE PRECISION,
    "performanceCorrelation" DOUBLE PRECISION,
    "isABTest" BOOLEAN NOT NULL DEFAULT false,
    "controlCalibrationId" TEXT,
    "testStartDate" TIMESTAMP(3),
    "testEndDate" TIMESTAMP(3),
    "testResults2" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "changeLog" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "score_calibrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_salary_data" (
    "id" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL,
    "jobFamily" TEXT,
    "seniorityLevel" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "region" TEXT,
    "industry" TEXT,
    "companySize" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "baseSalaryMin" DOUBLE PRECISION NOT NULL,
    "baseSalaryMax" DOUBLE PRECISION NOT NULL,
    "baseSalaryMedian" DOUBLE PRECISION NOT NULL,
    "baseSalaryMean" DOUBLE PRECISION,
    "totalCompMin" DOUBLE PRECISION,
    "totalCompMax" DOUBLE PRECISION,
    "totalCompMedian" DOUBLE PRECISION,
    "bonusMin" DOUBLE PRECISION,
    "bonusMax" DOUBLE PRECISION,
    "bonusMedian" DOUBLE PRECISION,
    "equityMin" DOUBLE PRECISION,
    "equityMax" DOUBLE PRECISION,
    "equityMedian" DOUBLE PRECISION,
    "sampleSize" INTEGER,
    "percentile25" DOUBLE PRECISION,
    "percentile75" DOUBLE PRECISION,
    "percentile90" DOUBLE PRECISION,
    "dataSource" TEXT NOT NULL,
    "dataDate" TIMESTAMP(3) NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "skillsPremiums" JSONB,
    "yoyGrowth" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_salary_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_job_descriptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "department" TEXT,
    "seniorityLevel" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "workMode" TEXT NOT NULL,
    "location" TEXT,
    "requiredSkills" JSONB NOT NULL,
    "preferredSkills" JSONB,
    "yearsExperience" INTEGER,
    "educationLevel" TEXT,
    "companyDescription" TEXT,
    "teamSize" INTEGER,
    "reportingTo" TEXT,
    "generatedTitle" TEXT,
    "generatedSummary" TEXT,
    "generatedResponsibilities" JSONB,
    "generatedRequirements" JSONB,
    "generatedBenefits" JSONB,
    "generatedQualifications" JSONB,
    "fullDescription" TEXT,
    "modelVersion" TEXT NOT NULL,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "generationTimeMs" INTEGER,
    "confidenceScore" DOUBLE PRECISION,
    "readabilityScore" DOUBLE PRECISION,
    "inclusivityScore" DOUBLE PRECISION,
    "seoScore" DOUBLE PRECISION,
    "completenessScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "usedInJobPostings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_job_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_title_suggestions" (
    "id" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL,
    "companyId" TEXT,
    "createdById" TEXT NOT NULL,
    "suggestions" JSONB NOT NULL,
    "recommendedTitle" TEXT NOT NULL,
    "recommendationReason" TEXT,
    "originalTitleIssues" JSONB,
    "keywordAnalysis" JSONB,
    "competitorTitles" JSONB,
    "industryTrends" JSONB,
    "originalSeoScore" DOUBLE PRECISION,
    "originalInclusivityScore" DOUBLE PRECISION,
    "improvedSeoScore" DOUBLE PRECISION,
    "improvedInclusivityScore" DOUBLE PRECISION,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_title_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirements_analyses" (
    "id" TEXT NOT NULL,
    "jobDescriptionId" TEXT,
    "companyId" TEXT,
    "createdById" TEXT NOT NULL,
    "rawRequirements" TEXT NOT NULL,
    "jobTitle" TEXT,
    "industry" TEXT,
    "essentialRequirements" JSONB NOT NULL,
    "niceToHaveRequirements" JSONB NOT NULL,
    "technicalSkills" JSONB,
    "softSkills" JSONB,
    "educationRequirements" JSONB,
    "experienceRequirements" JSONB,
    "certificationRequirements" JSONB,
    "overlyRestrictive" JSONB,
    "potentiallyBiased" JSONB,
    "marketMismatch" JSONB,
    "recommendations" JSONB,
    "essentialCount" INTEGER NOT NULL,
    "niceToHaveCount" INTEGER NOT NULL,
    "restrictiveScore" DOUBLE PRECISION,
    "marketAlignmentScore" DOUBLE PRECISION,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirements_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inclusive_language_checks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "createdById" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "originalContent" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "issues" JSONB NOT NULL,
    "genderBiasIssues" JSONB,
    "ageBiasIssues" JSONB,
    "abilityBiasIssues" JSONB,
    "culturalBiasIssues" JSONB,
    "educationBiasIssues" JSONB,
    "socioeconomicBiasIssues" JSONB,
    "suggestedContent" TEXT,
    "alternativePhrases" JSONB,
    "issueCount" INTEGER NOT NULL,
    "severeIssueCount" INTEGER NOT NULL,
    "moderateIssueCount" INTEGER NOT NULL,
    "minorIssueCount" INTEGER NOT NULL,
    "toneAnalysis" JSONB,
    "readabilityLevel" TEXT,
    "wordCount" INTEGER,
    "modelVersion" TEXT NOT NULL,
    "processingTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inclusive_language_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_range_suggestions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "createdById" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "normalizedTitle" TEXT,
    "location" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "seniorityLevel" TEXT NOT NULL,
    "yearsExperience" INTEGER,
    "requiredSkills" JSONB,
    "industry" TEXT,
    "companySize" TEXT,
    "employmentType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "suggestedMin" DOUBLE PRECISION NOT NULL,
    "suggestedMax" DOUBLE PRECISION NOT NULL,
    "suggestedMidpoint" DOUBLE PRECISION NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "marketPercentile25" DOUBLE PRECISION,
    "marketMedian" DOUBLE PRECISION,
    "marketPercentile75" DOUBLE PRECISION,
    "marketPercentile90" DOUBLE PRECISION,
    "industryComparison" TEXT,
    "locationComparison" TEXT,
    "companyComparison" TEXT,
    "salaryFactors" JSONB,
    "skillPremiums" JSONB,
    "locationAdjustment" DOUBLE PRECISION,
    "recommendations" JSONB,
    "competitivenessScore" DOUBLE PRECISION,
    "dataSources" JSONB,
    "dataFreshness" TEXT,
    "sampleSize" INTEGER,
    "modelVersion" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_range_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_interview_questions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "createdById" TEXT NOT NULL,
    "jobId" TEXT,
    "jobTitle" TEXT NOT NULL,
    "seniorityLevel" TEXT NOT NULL,
    "department" TEXT,
    "requiredSkills" JSONB,
    "competencies" JSONB,
    "interviewRound" TEXT,
    "interviewDuration" INTEGER,
    "questions" JSONB NOT NULL,
    "technicalQuestions" JSONB,
    "behavioralQuestions" JSONB,
    "situationalQuestions" JSONB,
    "cultureFitQuestions" JSONB,
    "problemSolvingQuestions" JSONB,
    "leadershipQuestions" JSONB,
    "totalQuestions" INTEGER NOT NULL,
    "estimatedDuration" INTEGER,
    "difficultyDistribution" JSONB,
    "scoringRubric" JSONB,
    "mustAskQuestions" JSONB,
    "optionalQuestions" JSONB,
    "legalCompliance" BOOLEAN NOT NULL DEFAULT true,
    "complianceNotes" JSONB,
    "avoidedTopics" JSONB,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "feedback" JSONB,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_criteria" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "jobId" TEXT,
    "jobTitle" TEXT NOT NULL,
    "seniorityLevel" TEXT NOT NULL,
    "requiredSkills" JSONB,
    "department" TEXT,
    "knockoutQuestions" JSONB NOT NULL,
    "scoringQuestions" JSONB NOT NULL,
    "mustHaveCriteria" JSONB NOT NULL,
    "preferredCriteria" JSONB,
    "experienceFilters" JSONB,
    "educationFilters" JSONB,
    "locationFilters" JSONB,
    "salaryFilters" JSONB,
    "availabilityFilters" JSONB,
    "totalPossibleScore" INTEGER NOT NULL,
    "passingThreshold" INTEGER NOT NULL,
    "autoAdvanceThreshold" INTEGER,
    "legalCompliance" BOOLEAN NOT NULL DEFAULT true,
    "complianceNotes" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screening_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_summaries" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT,
    "applicationId" TEXT,
    "candidateName" TEXT NOT NULL,
    "candidateTitle" TEXT,
    "executiveSummary" TEXT NOT NULL,
    "strengthsHighlight" JSONB NOT NULL,
    "concernsHighlight" JSONB,
    "uniqueValue" TEXT,
    "roleAlignment" JSONB NOT NULL,
    "experienceRelevance" JSONB,
    "skillMatch" JSONB,
    "cultureIndicators" JSONB,
    "interviewFocus" JSONB,
    "redFlags" JSONB,
    "negotiationInsights" JSONB,
    "yearsExperience" INTEGER,
    "currentCompany" TEXT,
    "educationLevel" TEXT,
    "locationMatch" BOOLEAN,
    "salaryExpectation" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "dataCompleteness" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "modelVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rejection_emails" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "candidateId" TEXT,
    "applicationId" TEXT,
    "candidateName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "rejectionStage" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "subject" TEXT NOT NULL,
    "greeting" TEXT NOT NULL,
    "bodyParagraphs" JSONB NOT NULL,
    "closingParagraph" TEXT NOT NULL,
    "signature" TEXT,
    "fullEmail" TEXT NOT NULL,
    "positiveFeedback" JSONB,
    "constructiveFeedback" JSONB,
    "futureEncouragement" TEXT,
    "toneLevel" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "includesFeedback" BOOLEAN NOT NULL DEFAULT false,
    "includesReapplyInfo" BOOLEAN NOT NULL DEFAULT true,
    "empathyScore" DOUBLE PRECISION,
    "professionalismScore" DOUBLE PRECISION,
    "clarityScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rejection_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_letters" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "applicationId" TEXT,
    "jobId" TEXT,
    "candidateName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "department" TEXT,
    "reportingTo" TEXT,
    "startDate" TIMESTAMP(3),
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "payFrequency" TEXT NOT NULL DEFAULT 'ANNUAL',
    "signingBonus" DOUBLE PRECISION,
    "annualBonus" DOUBLE PRECISION,
    "bonusStructure" TEXT,
    "equityGrant" DOUBLE PRECISION,
    "equityType" TEXT,
    "vestingSchedule" TEXT,
    "cliffPeriod" INTEGER,
    "healthBenefits" JSONB,
    "retirementBenefits" JSONB,
    "ptoPolicy" TEXT,
    "otherBenefits" JSONB,
    "employmentType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "workLocation" TEXT,
    "workSchedule" TEXT,
    "probationPeriod" INTEGER,
    "noticePeriod" INTEGER,
    "openingParagraph" TEXT NOT NULL,
    "compensationSection" TEXT NOT NULL,
    "benefitsSection" TEXT NOT NULL,
    "termsSection" TEXT NOT NULL,
    "closingSection" TEXT NOT NULL,
    "fullLetter" TEXT NOT NULL,
    "contingencies" JSONB,
    "legalDisclosures" JSONB,
    "expirationDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "templateVersion" TEXT,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_ad_variants" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "variantType" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "requirements" JSONB,
    "benefits" JSONB,
    "fullContent" TEXT,
    "changesFromControl" JSONB NOT NULL,
    "changeRationale" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "qualifiedApplications" INTEGER NOT NULL DEFAULT 0,
    "clickThroughRate" DOUBLE PRECISION,
    "applicationRate" DOUBLE PRECISION,
    "qualityRate" DOUBLE PRECISION,
    "trafficPercentage" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "isControl" BOOLEAN NOT NULL DEFAULT false,
    "isWinner" BOOLEAN,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "modelVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_ad_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_ad_tests" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "hypothesis" TEXT,
    "variantCount" INTEGER NOT NULL DEFAULT 2,
    "controlVariantId" TEXT,
    "minSampleSize" INTEGER NOT NULL DEFAULT 100,
    "maxDuration" INTEGER,
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "winningVariantId" TEXT,
    "statisticalSignificance" DOUBLE PRECISION,
    "confidenceLevel" DOUBLE PRECISION,
    "liftPercentage" DOUBLE PRECISION,
    "keyFindings" JSONB,
    "recommendations" JSONB,
    "status" TEXT NOT NULL DEFAULT 'SETUP',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_ad_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_job_analyses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "jobId" TEXT,
    "ourJobTitle" TEXT NOT NULL,
    "ourJobDepartment" TEXT,
    "competitorJobs" JSONB NOT NULL,
    "salaryComparison" JSONB NOT NULL,
    "benefitsComparison" JSONB,
    "requirementsComparison" JSONB,
    "titleComparison" JSONB,
    "competitiveStrengths" JSONB NOT NULL,
    "competitiveWeaknesses" JSONB NOT NULL,
    "marketTrends" JSONB,
    "recommendations" JSONB NOT NULL,
    "overallCompetitivenessScore" DOUBLE PRECISION NOT NULL,
    "salaryCompetitivenessScore" DOUBLE PRECISION,
    "benefitsCompetitivenessScore" DOUBLE PRECISION,
    "requirementsReasonablenessScore" DOUBLE PRECISION,
    "marketPosition" TEXT NOT NULL,
    "competitorCount" INTEGER NOT NULL,
    "dataFreshness" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "competitor_job_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_enhancements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileSection" TEXT NOT NULL,
    "currentContent" TEXT NOT NULL,
    "analysisResults" JSONB NOT NULL,
    "suggestions" JSONB NOT NULL,
    "enhancedContent" TEXT,
    "keyImprovements" JSONB NOT NULL,
    "originalScore" DOUBLE PRECISION NOT NULL,
    "potentialScore" DOUBLE PRECISION NOT NULL,
    "improvementPercentage" DOUBLE PRECISION NOT NULL,
    "clarityImprovements" JSONB,
    "impactImprovements" JSONB,
    "keywordImprovements" JSONB,
    "formattingImprovements" JSONB,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "appliedAt" TIMESTAMP(3),
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_enhancements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_descriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "duration" TEXT,
    "responsibilities" JSONB,
    "technologies" JSONB,
    "achievements" JSONB,
    "generatedSummary" TEXT NOT NULL,
    "generatedBullets" JSONB NOT NULL,
    "impactStatements" JSONB NOT NULL,
    "skillsHighlighted" JSONB NOT NULL,
    "variations" JSONB,
    "toneOptions" JSONB,
    "atsKeywords" JSONB NOT NULL,
    "industryTerms" JSONB,
    "actionVerbs" JSONB NOT NULL,
    "impactScore" DOUBLE PRECISION NOT NULL,
    "clarityScore" DOUBLE PRECISION NOT NULL,
    "atsScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "selectedVariation" TEXT,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills_gap_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetJobId" TEXT,
    "targetJobTitle" TEXT NOT NULL,
    "targetIndustry" TEXT,
    "targetSeniority" TEXT,
    "currentSkills" JSONB NOT NULL,
    "skillLevels" JSONB NOT NULL,
    "requiredSkills" JSONB NOT NULL,
    "missingSkills" JSONB NOT NULL,
    "underDevelopedSkills" JSONB NOT NULL,
    "transferableSkills" JSONB NOT NULL,
    "criticalGaps" JSONB NOT NULL,
    "importantGaps" JSONB NOT NULL,
    "niceToHaveGaps" JSONB NOT NULL,
    "learningPath" JSONB NOT NULL,
    "resourceRecommendations" JSONB NOT NULL,
    "timeEstimates" JSONB NOT NULL,
    "priorityRanking" JSONB NOT NULL,
    "marketDemand" JSONB,
    "salaryImpact" JSONB,
    "competitorAnalysis" JSONB,
    "overallReadiness" DOUBLE PRECISION NOT NULL,
    "technicalReadiness" DOUBLE PRECISION,
    "softSkillReadiness" DOUBLE PRECISION,
    "experienceAlignment" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "modelVersion" TEXT NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_gap_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cover_letters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyDescription" TEXT,
    "jobDescription" TEXT,
    "whyInterested" TEXT,
    "relevantExperience" JSONB,
    "keyAchievements" JSONB,
    "connectionToCompany" TEXT,
    "opening" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "closing" TEXT NOT NULL,
    "fullLetter" TEXT NOT NULL,
    "toneVariations" JSONB,
    "lengthVariations" JSONB,
    "focusVariations" JSONB,
    "keywordsUsed" JSONB NOT NULL,
    "skillsHighlighted" JSONB NOT NULL,
    "achievementsMentioned" JSONB NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "persuasivenessScore" DOUBLE PRECISION NOT NULL,
    "professionalismScore" DOUBLE PRECISION NOT NULL,
    "atsScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "selectedTone" TEXT,
    "selectedLength" TEXT,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cover_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_preps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL,
    "companyInfo" JSONB,
    "recentNews" JSONB,
    "interviewerInfo" JSONB,
    "commonQuestions" JSONB NOT NULL,
    "technicalQuestions" JSONB,
    "behavioralQuestions" JSONB NOT NULL,
    "situationalQuestions" JSONB,
    "companySpecificQuestions" JSONB,
    "sampleAnswers" JSONB NOT NULL,
    "answerFrameworks" JSONB NOT NULL,
    "keyPointsToMention" JSONB NOT NULL,
    "thingsToAvoid" JSONB NOT NULL,
    "questionsForInterviewer" JSONB NOT NULL,
    "questionsToAvoid" JSONB NOT NULL,
    "preparationChecklist" JSONB NOT NULL,
    "dayOfTips" JSONB NOT NULL,
    "commonMistakes" JSONB NOT NULL,
    "bodyLanguageTips" JSONB,
    "practiceHistory" JSONB,
    "feedbackHistory" JSONB,
    "improvementAreas" JSONB,
    "preparednessScore" DOUBLE PRECISION,
    "practiceSessionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "estimatedConfidence" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PREPARING',
    "interviewDate" TIMESTAMP(3),
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_preps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_negotiation_advice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT,
    "location" TEXT NOT NULL,
    "industry" TEXT,
    "currentSalary" DOUBLE PRECISION,
    "yearsExperience" INTEGER NOT NULL,
    "highestEducation" TEXT,
    "relevantCertifications" JSONB,
    "uniqueSkills" JSONB,
    "offeredSalary" DOUBLE PRECISION,
    "offeredBonus" DOUBLE PRECISION,
    "offeredEquity" JSONB,
    "offeredBenefits" JSONB,
    "marketData" JSONB NOT NULL,
    "percentilePosition" DOUBLE PRECISION NOT NULL,
    "marketTrend" TEXT,
    "demandLevel" TEXT,
    "targetSalary" DOUBLE PRECISION NOT NULL,
    "minimumAcceptable" DOUBLE PRECISION NOT NULL,
    "anchorNumber" DOUBLE PRECISION NOT NULL,
    "negotiationRange" JSONB NOT NULL,
    "negotiationScript" JSONB NOT NULL,
    "counterArguments" JSONB NOT NULL,
    "timingAdvice" JSONB NOT NULL,
    "leveragePoints" JSONB NOT NULL,
    "alternativeAsk" JSONB NOT NULL,
    "benefitsNegotiation" JSONB NOT NULL,
    "signingBonusAdvice" JSONB,
    "equityNegotiation" JSONB,
    "riskLevel" TEXT NOT NULL,
    "offerRescindRisk" DOUBLE PRECISION NOT NULL,
    "marketAlternatives" JSONB,
    "finalSalary" DOUBLE PRECISION,
    "finalBonus" DOUBLE PRECISION,
    "finalEquity" JSONB,
    "negotiationOutcome" TEXT,
    "lessonsLearned" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ADVISING',
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_negotiation_advice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_path_advice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentRole" TEXT NOT NULL,
    "currentLevel" TEXT NOT NULL,
    "currentIndustry" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL,
    "currentSkills" JSONB NOT NULL,
    "currentSalary" DOUBLE PRECISION,
    "targetRoles" JSONB NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "targetIndustry" TEXT,
    "targetTimeframe" TEXT NOT NULL,
    "targetSalary" DOUBLE PRECISION,
    "priorities" JSONB NOT NULL,
    "careerPaths" JSONB NOT NULL,
    "recommendedPath" JSONB NOT NULL,
    "milestones" JSONB NOT NULL,
    "skillGaps" JSONB NOT NULL,
    "experienceGaps" JSONB NOT NULL,
    "transitionDifficulty" TEXT NOT NULL,
    "timeToTransition" TEXT NOT NULL,
    "marketDemand" TEXT NOT NULL,
    "salaryProjection" JSONB NOT NULL,
    "riskAssessment" JSONB NOT NULL,
    "immediateActions" JSONB NOT NULL,
    "shortTermActions" JSONB NOT NULL,
    "mediumTermActions" JSONB NOT NULL,
    "longTermActions" JSONB NOT NULL,
    "networkingAdvice" JSONB NOT NULL,
    "successFactors" JSONB NOT NULL,
    "industryTrends" JSONB NOT NULL,
    "alternativePaths" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_path_advice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "learningGoal" TEXT NOT NULL,
    "targetSkills" JSONB NOT NULL,
    "currentLevel" TEXT NOT NULL,
    "preferredFormat" JSONB NOT NULL,
    "timeAvailable" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "courses" JSONB NOT NULL,
    "certifications" JSONB NOT NULL,
    "books" JSONB NOT NULL,
    "tutorials" JSONB NOT NULL,
    "projects" JSONB NOT NULL,
    "communities" JSONB NOT NULL,
    "mentorship" JSONB NOT NULL,
    "learningPath" JSONB NOT NULL,
    "milestones" JSONB NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "priorityOrder" JSONB NOT NULL,
    "courseraLinks" JSONB,
    "udemyLinks" JSONB,
    "linkedinLearning" JSONB,
    "pluralsightLinks" JSONB,
    "youtubeLinks" JSONB,
    "freeResources" JSONB NOT NULL,
    "skillValueIncrease" JSONB NOT NULL,
    "salaryImpact" DOUBLE PRECISION,
    "marketabilityIncrease" TEXT NOT NULL,
    "completedItems" JSONB NOT NULL DEFAULT '[]',
    "currentProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "currentStage" TEXT NOT NULL,
    "stageDetails" JSONB NOT NULL,
    "timeInStage" INTEGER NOT NULL,
    "averageTimeAtStage" INTEGER NOT NULL,
    "competitorCount" INTEGER,
    "rankEstimate" TEXT,
    "strengthsVsField" JSONB NOT NULL,
    "weaknessesVsField" JSONB NOT NULL,
    "advanceProbability" DOUBLE PRECISION NOT NULL,
    "hireProbability" DOUBLE PRECISION NOT NULL,
    "predictionFactors" JSONB NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "immediateActions" JSONB NOT NULL,
    "profileImprovements" JSONB NOT NULL,
    "followUpAdvice" JSONB NOT NULL,
    "interviewTips" JSONB,
    "expectedNextStep" TEXT NOT NULL,
    "expectedTimeline" TEXT NOT NULL,
    "typicalProcessLength" INTEGER NOT NULL,
    "urgencyLevel" TEXT NOT NULL,
    "companyHiringPattern" JSONB NOT NULL,
    "roleCompetitiveness" TEXT NOT NULL,
    "seasonalFactors" JSONB,
    "redFlags" JSONB NOT NULL,
    "positiveSignals" JSONB NOT NULL,
    "dealBreakers" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "portfolioType" TEXT NOT NULL,
    "projectCount" INTEGER NOT NULL,
    "analyzedProjects" JSONB NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "overallGrade" TEXT NOT NULL,
    "strengthAreas" JSONB NOT NULL,
    "improvementAreas" JSONB NOT NULL,
    "standoutProjects" JSONB NOT NULL,
    "visualAppeal" DOUBLE PRECISION NOT NULL,
    "navigation" DOUBLE PRECISION NOT NULL,
    "mobileResponsive" BOOLEAN NOT NULL,
    "loadSpeed" TEXT NOT NULL,
    "accessibilityScore" DOUBLE PRECISION NOT NULL,
    "presentationFeedback" JSONB NOT NULL,
    "projectDescriptions" JSONB NOT NULL,
    "technicalDepth" DOUBLE PRECISION NOT NULL,
    "problemSolving" DOUBLE PRECISION NOT NULL,
    "realWorldImpact" DOUBLE PRECISION NOT NULL,
    "contentFeedback" JSONB NOT NULL,
    "techStackDiversity" DOUBLE PRECISION NOT NULL,
    "codeQuality" DOUBLE PRECISION,
    "documentationQuality" DOUBLE PRECISION,
    "testCoverage" DOUBLE PRECISION,
    "technicalFeedback" JSONB NOT NULL,
    "industryRelevance" DOUBLE PRECISION NOT NULL,
    "trendAlignment" DOUBLE PRECISION NOT NULL,
    "uniqueness" DOUBLE PRECISION NOT NULL,
    "marketFeedback" JSONB NOT NULL,
    "projectFeedback" JSONB NOT NULL,
    "quickWins" JSONB NOT NULL,
    "mediumEffort" JSONB NOT NULL,
    "majorOverhauls" JSONB NOT NULL,
    "prioritizedActions" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parsed_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "rawText" TEXT,
    "fileHash" TEXT,
    "contactInfo" JSONB NOT NULL,
    "summary" TEXT,
    "workExperience" JSONB NOT NULL,
    "education" JSONB NOT NULL,
    "skills" JSONB NOT NULL,
    "certifications" JSONB NOT NULL,
    "projects" JSONB NOT NULL,
    "publications" JSONB,
    "awards" JSONB,
    "languages" JSONB,
    "volunteerWork" JSONB,
    "additionalSections" JSONB,
    "parseConfidence" DOUBLE PRECISION NOT NULL,
    "completenessScore" DOUBLE PRECISION NOT NULL,
    "formatQuality" TEXT NOT NULL,
    "issues" JSONB NOT NULL,
    "companies" JSONB NOT NULL,
    "technologies" JSONB NOT NULL,
    "locations" JSONB NOT NULL,
    "dates" JSONB NOT NULL,
    "urls" JSONB NOT NULL,
    "seniorityLevel" TEXT,
    "industryFocus" JSONB,
    "careerProgression" JSONB,
    "keyAchievements" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PARSED',
    "errorMessage" TEXT,
    "modelVersion" TEXT NOT NULL,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parsed_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_extractions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceText" TEXT NOT NULL,
    "skills" JSONB NOT NULL,
    "skillCategories" JSONB NOT NULL,
    "skillLevels" JSONB NOT NULL,
    "skillRelationships" JSONB NOT NULL,
    "programmingLanguages" JSONB NOT NULL,
    "frameworks" JSONB NOT NULL,
    "databases" JSONB NOT NULL,
    "cloudPlatforms" JSONB NOT NULL,
    "tools" JSONB NOT NULL,
    "methodologies" JSONB NOT NULL,
    "softSkills" JSONB NOT NULL,
    "leadershipSkills" JSONB NOT NULL,
    "communicationSkills" JSONB NOT NULL,
    "domainExpertise" JSONB NOT NULL,
    "certificationSkills" JSONB NOT NULL,
    "coreCompetencies" JSONB NOT NULL,
    "emergingSkills" JSONB NOT NULL,
    "legacySkills" JSONB NOT NULL,
    "rarityScores" JSONB NOT NULL,
    "marketDemand" JSONB NOT NULL,
    "salaryImpact" JSONB NOT NULL,
    "trendingSkills" JSONB NOT NULL,
    "overallConfidence" DOUBLE PRECISION NOT NULL,
    "perSkillConfidence" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_extractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semantic_search_index" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "keywords" JSONB NOT NULL,
    "embedding" JSONB NOT NULL,
    "embeddingModel" TEXT NOT NULL,
    "embeddingDimension" INTEGER NOT NULL,
    "category" TEXT,
    "subcategories" JSONB,
    "tags" JSONB,
    "skills" JSONB,
    "industries" JSONB,
    "locations" JSONB,
    "seniorityLevel" TEXT,
    "experienceYears" INTEGER,
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "remoteEligible" BOOLEAN,
    "contentQuality" DOUBLE PRECISION NOT NULL,
    "freshness" TIMESTAMP(3) NOT NULL,
    "popularity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastIndexed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semantic_search_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_recognitions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceText" TEXT NOT NULL,
    "people" JSONB NOT NULL,
    "organizations" JSONB NOT NULL,
    "locations" JSONB NOT NULL,
    "dates" JSONB NOT NULL,
    "money" JSONB NOT NULL,
    "percentages" JSONB NOT NULL,
    "quantities" JSONB NOT NULL,
    "technologies" JSONB NOT NULL,
    "products" JSONB NOT NULL,
    "platforms" JSONB NOT NULL,
    "languages" JSONB NOT NULL,
    "jobTitles" JSONB NOT NULL,
    "degrees" JSONB NOT NULL,
    "certifications" JSONB NOT NULL,
    "universities" JSONB NOT NULL,
    "industries" JSONB NOT NULL,
    "entityRelationships" JSONB NOT NULL,
    "timeline" JSONB NOT NULL,
    "perEntityConfidence" JSONB NOT NULL,
    "overallConfidence" DOUBLE PRECISION NOT NULL,
    "normalizedEntities" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_recognitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "scope" TEXT,
    "calendarUrl" TEXT,
    "caldavUrl" TEXT,
    "caldavUsername" TEXT,
    "caldavPassword" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "syncDirection" TEXT NOT NULL DEFAULT 'BIDIRECTIONAL',
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "color" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "showInAvailability" BOOLEAN NOT NULL DEFAULT true,
    "externalCalendarId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "meetingLink" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "recurrenceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "visibility" TEXT NOT NULL DEFAULT 'BUSY',
    "externalEventId" TEXT,
    "externalLink" TEXT,
    "interviewId" TEXT,
    "applicationId" TEXT,
    "attendees" JSONB,
    "organizer" JSONB,
    "syncStatus" TEXT NOT NULL DEFAULT 'SYNCED',
    "lastSyncAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_conflicts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "event1Id" TEXT NOT NULL,
    "event2Id" TEXT NOT NULL,
    "event1Title" TEXT NOT NULL,
    "event2Title" TEXT NOT NULL,
    "event1Start" TIMESTAMP(3) NOT NULL,
    "event1End" TIMESTAMP(3) NOT NULL,
    "event2Start" TIMESTAMP(3) NOT NULL,
    "event2End" TIMESTAMP(3) NOT NULL,
    "conflictType" TEXT NOT NULL,
    "overlapMinutes" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNRESOLVED',
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "suggestions" JSONB,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buffer_time_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "beforeMeeting" INTEGER NOT NULL DEFAULT 0,
    "afterMeeting" INTEGER NOT NULL DEFAULT 0,
    "beforeInterview" INTEGER NOT NULL DEFAULT 15,
    "afterInterview" INTEGER NOT NULL DEFAULT 10,
    "includeTravel" BOOLEAN NOT NULL DEFAULT false,
    "defaultTravelTime" INTEGER NOT NULL DEFAULT 30,
    "phoneScreenBuffer" INTEGER NOT NULL DEFAULT 5,
    "videoInterviewBuffer" INTEGER NOT NULL DEFAULT 10,
    "onsiteInterviewBuffer" INTEGER NOT NULL DEFAULT 30,
    "panelInterviewBuffer" INTEGER NOT NULL DEFAULT 15,
    "autoApply" BOOLEAN NOT NULL DEFAULT true,
    "applyToExternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buffer_time_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_hours" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "monday" JSONB NOT NULL,
    "tuesday" JSONB NOT NULL,
    "wednesday" JSONB NOT NULL,
    "thursday" JSONB NOT NULL,
    "friday" JSONB NOT NULL,
    "saturday" JSONB NOT NULL,
    "sunday" JSONB NOT NULL,
    "minNoticeHours" INTEGER NOT NULL DEFAULT 24,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 30,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "slotIncrement" INTEGER NOT NULL DEFAULT 15,
    "lunchStart" TEXT,
    "lunchEnd" TEXT,
    "excludeLunch" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_calendars" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "recurrenceRule" TEXT,
    "type" TEXT NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "blockEntireDay" BOOLEAN NOT NULL DEFAULT true,
    "blockStart" TEXT,
    "blockEnd" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'USER',
    "companyId" TEXT,
    "source" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "meetingType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "location" TEXT,
    "workingHoursId" TEXT,
    "bufferBefore" INTEGER NOT NULL DEFAULT 0,
    "bufferAfter" INTEGER NOT NULL DEFAULT 0,
    "minNotice" INTEGER NOT NULL DEFAULT 24,
    "maxAdvance" INTEGER NOT NULL DEFAULT 30,
    "maxBookingsPerDay" INTEGER,
    "maxBookingsPerWeek" INTEGER,
    "requireConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "autoConfirm" BOOLEAN NOT NULL DEFAULT true,
    "confirmationMessage" TEXT,
    "questions" JSONB,
    "notifyOnBooking" BOOLEAN NOT NULL DEFAULT true,
    "reminderSchedule" JSONB,
    "brandColor" TEXT,
    "logoUrl" TEXT,
    "welcomeMessage" TEXT,
    "jobId" TEXT,
    "applicationId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduling_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling_bookings" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "bookerEmail" TEXT NOT NULL,
    "bookerName" TEXT NOT NULL,
    "bookerPhone" TEXT,
    "bookerTimezone" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "candidateId" TEXT,
    "applicationId" TEXT,
    "interviewId" TEXT,
    "responses" JSONB,
    "meetingLink" TEXT,
    "meetingPassword" TEXT,
    "location" TEXT,
    "confirmationToken" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "remindersSent" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduling_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_slots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "source" TEXT NOT NULL,
    "preferenceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isOptimal" BOOLEAN NOT NULL DEFAULT false,
    "hasConflict" BOOLEAN NOT NULL DEFAULT false,
    "conflictEventId" TEXT,
    "isPanelSlot" BOOLEAN NOT NULL DEFAULT false,
    "panelSessionId" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panel_sessions" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "jobId" TEXT,
    "applicationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULING',
    "minPanelistsRequired" INTEGER NOT NULL DEFAULT 2,
    "requireAllPanelists" BOOLEAN NOT NULL DEFAULT false,
    "schedulingDeadline" TIMESTAMP(3),
    "preferredDates" JSONB,
    "preferredTimeRanges" JSONB,
    "excludedDates" JSONB,
    "scheduledStartTime" TIMESTAMP(3),
    "scheduledEndTime" TIMESTAMP(3),
    "meetingLink" TEXT,
    "location" TEXT,
    "candidateId" TEXT,
    "candidateName" TEXT,
    "candidateEmail" TEXT,
    "invitesSentAt" TIMESTAMP(3),
    "remindersSentAt" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panel_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panel_members" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PANELIST',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "responseStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "availabilitySubmitted" BOOLEAN NOT NULL DEFAULT false,
    "availableSlots" JSONB,
    "preferredSlots" JSONB,
    "unavailableDates" JSONB,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "panel_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timezone_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primaryTimezone" TEXT NOT NULL DEFAULT 'UTC',
    "autoDetect" BOOLEAN NOT NULL DEFAULT true,
    "lastDetectedTimezone" TEXT,
    "lastDetectedAt" TIMESTAMP(3),
    "use24HourFormat" BOOLEAN NOT NULL DEFAULT false,
    "showSecondaryTimezone" BOOLEAN NOT NULL DEFAULT false,
    "secondaryTimezone" TEXT,
    "preferLocalTime" BOOLEAN NOT NULL DEFAULT true,
    "includeTimezoneInInvites" BOOLEAN NOT NULL DEFAULT true,
    "workLocation" TEXT,
    "travelSchedule" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timezone_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_schedules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reminderTimes" JSONB NOT NULL,
    "eventTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailTemplateId" TEXT,
    "smsTemplateId" TEXT,
    "whatsappTemplateId" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_channels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "emailAddress" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "phoneCountryCode" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMP(3),
    "smsCarrier" TEXT,
    "whatsappNumber" TEXT,
    "whatsappVerified" BOOLEAN NOT NULL DEFAULT false,
    "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false,
    "whatsappOptInAt" TIMESTAMP(3),
    "pushToken" TEXT,
    "pushPlatform" TEXT,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "timezone" TEXT,
    "maxPerHour" INTEGER,
    "maxPerDay" INTEGER,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interviewId" TEXT,
    "reminderType" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "minutesBefore" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "channel" TEXT NOT NULL,
    "recipientAddress" TEXT,
    "subject" TEXT,
    "body" TEXT,
    "templateId" TEXT,
    "templateData" JSONB,
    "externalMessageId" TEXT,
    "providerResponse" JSONB,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "interactionData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'WEB',
    "browser" TEXT,
    "browserVersion" TEXT,
    "deviceName" TEXT,
    "deviceModel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastPingAt" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "interviewReminders" BOOLEAN NOT NULL DEFAULT true,
    "applicationUpdates" BOOLEAN NOT NULL DEFAULT true,
    "messageNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confirmation_requests" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL DEFAULT 'ATTENDANCE',
    "message" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "responseMessage" TEXT,
    "declineReason" TEXT,
    "suggestReschedule" BOOLEAN NOT NULL DEFAULT false,
    "suggestedTimes" JSONB,
    "notificationsSent" INTEGER NOT NULL DEFAULT 0,
    "lastNotificationAt" TIMESTAMP(3),
    "channelsUsed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reminderSchedule" JSONB,
    "nextReminderAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "confirmation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prep_materials" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "materialType" TEXT NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT,
    "externalUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "forInterviewTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "forJobIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "forDepartments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sendAutomatically" BOOLEAN NOT NULL DEFAULT true,
    "hoursBefore" INTEGER NOT NULL DEFAULT 24,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prep_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prep_material_deliveries" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "interviewId" TEXT,
    "deliveryMethod" TEXT NOT NULL DEFAULT 'EMAIL',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER,
    "helpfulRating" INTEGER,
    "feedbackText" TEXT,
    "externalMessageId" TEXT,
    "trackingPixelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prep_material_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "digestMode" TEXT NOT NULL DEFAULT 'INSTANT',
    "digestTime" TEXT,
    "digestDay" TEXT,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "interviewReminders" BOOLEAN NOT NULL DEFAULT true,
    "applicationUpdates" BOOLEAN NOT NULL DEFAULT true,
    "messageAlerts" BOOLEAN NOT NULL DEFAULT true,
    "jobAlerts" BOOLEAN NOT NULL DEFAULT true,
    "systemAnnouncements" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "defaultReminderTimes" JSONB,
    "confirmationRequests" BOOLEAN NOT NULL DEFAULT true,
    "prepMaterialDelivery" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "quietHoursTimezone" TEXT,
    "unsubscribedAt" TIMESTAMP(3),
    "unsubscribeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_screening_interviews" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "recruiterId" TEXT,
    "jobId" TEXT,
    "applicationId" TEXT,
    "interviewType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questionFlowId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "completedQuestions" INTEGER NOT NULL DEFAULT 0,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "deadlineExtensions" INTEGER NOT NULL DEFAULT 0,
    "totalTimeLimit" INTEGER,
    "timeRemaining" INTEGER,
    "perQuestionTimeLimit" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'en',
    "accessibilitySettings" JSONB,
    "aiTone" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "aiPersonality" TEXT,
    "enableSmallTalk" BOOLEAN NOT NULL DEFAULT true,
    "overallScore" DOUBLE PRECISION,
    "aiScoreSummary" JSONB,
    "recordingConsent" BOOLEAN NOT NULL DEFAULT false,
    "recordingUrl" TEXT,
    "transcriptUrl" TEXT,
    "inviteToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_screening_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_flows" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "jobId" TEXT,
    "targetRole" TEXT,
    "targetLevel" TEXT,
    "interviewType" TEXT NOT NULL DEFAULT 'VIDEO_ASYNC',
    "supportedLanguages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "estimatedDuration" INTEGER,
    "defaultTimePerQuestion" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "avgCompletionRate" DOUBLE PRECISION,
    "avgScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_questions" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "category" TEXT,
    "translations" JSONB,
    "expectedResponseType" TEXT NOT NULL DEFAULT 'VIDEO',
    "maxResponseDuration" INTEGER,
    "maxResponseLength" INTEGER,
    "allowRetakes" BOOLEAN NOT NULL DEFAULT true,
    "maxRetakes" INTEGER NOT NULL DEFAULT 2,
    "options" JSONB,
    "correctAnswer" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "maxPoints" INTEGER NOT NULL DEFAULT 10,
    "scoringCriteria" JSONB,
    "hint" TEXT,
    "sampleAnswer" TEXT,
    "evaluationGuidelines" TEXT,
    "timeLimit" INTEGER,
    "accessibilityNotes" TEXT,
    "hasAudioDescription" BOOLEAN NOT NULL DEFAULT false,
    "hasSignLanguage" BOOLEAN NOT NULL DEFAULT false,
    "aiFollowUpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiEvaluationPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screening_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_responses" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "responseType" TEXT NOT NULL,
    "textResponse" TEXT,
    "videoUrl" TEXT,
    "audioUrl" TEXT,
    "codeResponse" TEXT,
    "codeLanguage" TEXT,
    "selectedOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER,
    "retakeNumber" INTEGER NOT NULL DEFAULT 0,
    "transcription" TEXT,
    "transcriptionStatus" TEXT,
    "aiScore" DOUBLE PRECISION,
    "aiScoreBreakdown" JSONB,
    "aiSummary" TEXT,
    "aiKeyPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiFeedback" TEXT,
    "aiSentiment" TEXT,
    "aiConfidenceLevel" DOUBLE PRECISION,
    "detectedKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "detectedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "redFlags" JSONB,
    "greenFlags" JSONB,
    "manualScore" DOUBLE PRECISION,
    "manualFeedback" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screening_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_rules" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "triggerQuestionId" TEXT NOT NULL,
    "conditionType" TEXT NOT NULL,
    "conditionValue" JSONB NOT NULL,
    "conditionOperator" TEXT NOT NULL DEFAULT 'EQUALS',
    "actionType" TEXT NOT NULL,
    "followUpQuestionId" TEXT,
    "customFollowUpText" TEXT,
    "additionalQuestionIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "useAIGeneration" BOOLEAN NOT NULL DEFAULT false,
    "aiGenerationPrompt" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_up_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "interviewType" TEXT NOT NULL DEFAULT 'VIDEO_ASYNC',
    "defaultQuestions" JSONB,
    "defaultDuration" INTEGER,
    "defaultTimePerQuestion" INTEGER,
    "aiTone" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "aiPersonality" JSONB,
    "smallTalkEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smallTalkPrompts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supportedLanguages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "defaultAccessibility" JSONB,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "welcomeMessage" TEXT,
    "completionMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screening_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_accessibility_prefs" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "highContrastMode" BOOLEAN NOT NULL DEFAULT false,
    "largeText" BOOLEAN NOT NULL DEFAULT false,
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "captionsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "captionsLanguage" TEXT NOT NULL DEFAULT 'en',
    "audioDescriptions" BOOLEAN NOT NULL DEFAULT false,
    "signLanguageSupport" BOOLEAN NOT NULL DEFAULT false,
    "signLanguageType" TEXT,
    "extraTimePercent" INTEGER NOT NULL DEFAULT 0,
    "pauseAllowed" BOOLEAN NOT NULL DEFAULT false,
    "maxPauseMinutes" INTEGER NOT NULL DEFAULT 5,
    "voiceInputEnabled" BOOLEAN NOT NULL DEFAULT false,
    "keyboardOnlyMode" BOOLEAN NOT NULL DEFAULT false,
    "screenReaderOptimized" BOOLEAN NOT NULL DEFAULT false,
    "screenReaderType" TEXT,
    "simplifiedInstructions" BOOLEAN NOT NULL DEFAULT false,
    "progressIndicator" BOOLEAN NOT NULL DEFAULT true,
    "breakReminders" BOOLEAN NOT NULL DEFAULT false,
    "breakInterval" INTEGER,
    "preferredCommunication" TEXT NOT NULL DEFAULT 'TEXT',
    "accommodationDocs" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_accessibility_prefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_transcriptions" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "responseId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "duration" INTEGER,
    "rawTranscript" TEXT NOT NULL,
    "formattedTranscript" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "detectedLanguage" TEXT,
    "transcriptionEngine" TEXT NOT NULL DEFAULT 'WHISPER',
    "confidence" DOUBLE PRECISION,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "timestamps" JSONB,
    "speakerLabels" JSONB,
    "audioQuality" TEXT,
    "noiseLevel" DOUBLE PRECISION,
    "clarityScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_transcriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_analyses" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "transcriptionId" TEXT,
    "responseId" TEXT,
    "questionId" TEXT,
    "questionText" TEXT,
    "questionType" TEXT,
    "expectedKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "answerText" TEXT NOT NULL,
    "answerLength" INTEGER NOT NULL DEFAULT 0,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completenessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "depthScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clarityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "structureScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "specificityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingElements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scoringCriteria" JSONB,
    "aiReasoning" TEXT,
    "confidenceLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelVersion" TEXT,

    CONSTRAINT "answer_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_detections" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "transcriptionId" TEXT,
    "topics" JSONB NOT NULL,
    "primaryTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secondaryTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" JSONB NOT NULL,
    "technicalKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "softSkillKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industryKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "namedEntities" JSONB,
    "technicalTopics" JSONB,
    "behavioralTopics" JSONB,
    "experienceTopics" JSONB,
    "expectedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coveredExpected" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unexpectedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topicCoverageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topicDepthScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentiment_analyses" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "transcriptionId" TEXT,
    "responseId" TEXT,
    "overallSentiment" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "sentimentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sentimentConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emotions" JSONB,
    "dominantEmotion" TEXT,
    "emotionalVariation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceLevel" TEXT NOT NULL DEFAULT 'MODERATE',
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hesitationMarkers" INTEGER NOT NULL DEFAULT 0,
    "fillerWords" JSONB,
    "enthusiasmScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "passionIndicators" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authenticityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consistencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sentimentTimeline" JSONB,
    "sentimentTrend" TEXT,
    "questionSentiments" JSONB,
    "voiceEnergy" DOUBLE PRECISION,
    "speechPace" TEXT,
    "toneVariation" DOUBLE PRECISION,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentiment_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_analytics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "departmentId" TEXT,
    "recruiterId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "sourced" INTEGER NOT NULL DEFAULT 0,
    "applied" INTEGER NOT NULL DEFAULT 0,
    "screened" INTEGER NOT NULL DEFAULT 0,
    "interviewed" INTEGER NOT NULL DEFAULT 0,
    "offered" INTEGER NOT NULL DEFAULT 0,
    "hired" INTEGER NOT NULL DEFAULT 0,
    "sourceToApply" DOUBLE PRECISION,
    "applyToScreen" DOUBLE PRECISION,
    "screenToInterview" DOUBLE PRECISION,
    "interviewToOffer" DOUBLE PRECISION,
    "offerToHire" DOUBLE PRECISION,
    "overallConversion" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funnel_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_to_hire_metrics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "departmentId" TEXT,
    "recruiterId" TEXT,
    "candidateId" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "jobOpenDate" TIMESTAMP(3) NOT NULL,
    "firstApplyDate" TIMESTAMP(3),
    "firstScreenDate" TIMESTAMP(3),
    "firstInterviewDate" TIMESTAMP(3),
    "offerDate" TIMESTAMP(3),
    "offerAcceptDate" TIMESTAMP(3),
    "timeToFill" INTEGER NOT NULL,
    "timeToHire" INTEGER NOT NULL,
    "timeToScreen" INTEGER,
    "timeToInterview" INTEGER,
    "timeToOffer" INTEGER,
    "timeToAccept" INTEGER,
    "jobType" TEXT,
    "seniorityLevel" TEXT,
    "department" TEXT,
    "location" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_to_hire_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_per_hire_metrics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "departmentId" TEXT,
    "recruiterId" TEXT,
    "candidateId" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "recruiterTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hiringManagerTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interviewerTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adminTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "internalCostTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "jobBoardFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agencyFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advertisingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "backgroundCheckCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assessmentCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "relocationCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "signingBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "travelCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "externalCostTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerHire" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "source" TEXT,
    "department" TEXT,
    "seniorityLevel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_per_hire_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_effectiveness" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceCategory" TEXT NOT NULL,
    "candidatesSourced" INTEGER NOT NULL DEFAULT 0,
    "applicants" INTEGER NOT NULL DEFAULT 0,
    "screened" INTEGER NOT NULL DEFAULT 0,
    "interviewed" INTEGER NOT NULL DEFAULT 0,
    "offers" INTEGER NOT NULL DEFAULT 0,
    "hires" INTEGER NOT NULL DEFAULT 0,
    "avgTimeToHire" DOUBLE PRECISION,
    "avgCostPerHire" DOUBLE PRECISION,
    "avgQualityScore" DOUBLE PRECISION,
    "retentionRate" DOUBLE PRECISION,
    "totalSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerApplicant" DOUBLE PRECISION,
    "costPerHire" DOUBLE PRECISION,
    "roi" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_effectiveness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiter_performance" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "recruiterName" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "jobsHandled" INTEGER NOT NULL DEFAULT 0,
    "candidatesSourced" INTEGER NOT NULL DEFAULT 0,
    "screensCompleted" INTEGER NOT NULL DEFAULT 0,
    "interviewsScheduled" INTEGER NOT NULL DEFAULT 0,
    "offersExtended" INTEGER NOT NULL DEFAULT 0,
    "hiresCompleted" INTEGER NOT NULL DEFAULT 0,
    "avgTimeToFill" DOUBLE PRECISION,
    "avgTimeToHire" DOUBLE PRECISION,
    "avgCostPerHire" DOUBLE PRECISION,
    "fillRate" DOUBLE PRECISION,
    "offerAcceptRate" DOUBLE PRECISION,
    "candidateSatisfaction" DOUBLE PRECISION,
    "hiringManagerSatisfaction" DOUBLE PRECISION,
    "qualityOfHireScore" DOUBLE PRECISION,
    "activePipeline" INTEGER NOT NULL DEFAULT 0,
    "pipelineVelocity" DOUBLE PRECISION,
    "rank" INTEGER,
    "tier" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiter_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_acceptance_metrics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "departmentId" TEXT,
    "recruiterId" TEXT,
    "candidateId" TEXT,
    "offerDate" TIMESTAMP(3) NOT NULL,
    "responseDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "offeredSalary" DOUBLE PRECISION,
    "expectedSalary" DOUBLE PRECISION,
    "salarySatisfaction" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "declineReason" TEXT,
    "declineDetails" TEXT,
    "competitorName" TEXT,
    "competitorOffer" DOUBLE PRECISION,
    "daysToDecision" INTEGER,
    "negotiationRounds" INTEGER NOT NULL DEFAULT 0,
    "department" TEXT,
    "seniorityLevel" TEXT,
    "jobType" TEXT,
    "location" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_acceptance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_velocity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "departmentId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "inSourced" INTEGER NOT NULL DEFAULT 0,
    "inScreening" INTEGER NOT NULL DEFAULT 0,
    "inInterview" INTEGER NOT NULL DEFAULT 0,
    "inOffer" INTEGER NOT NULL DEFAULT 0,
    "hired" INTEGER NOT NULL DEFAULT 0,
    "rejected" INTEGER NOT NULL DEFAULT 0,
    "withdrawn" INTEGER NOT NULL DEFAULT 0,
    "sourcedToScreening" DOUBLE PRECISION,
    "screeningToInterview" DOUBLE PRECISION,
    "interviewToOffer" DOUBLE PRECISION,
    "offerToHire" DOUBLE PRECISION,
    "totalVelocity" DOUBLE PRECISION,
    "candidatesEntered" INTEGER NOT NULL DEFAULT 0,
    "candidatesExited" INTEGER NOT NULL DEFAULT 0,
    "netPipelineChange" INTEGER NOT NULL DEFAULT 0,
    "bottleneckStage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_velocity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_of_hire_metrics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "hireId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "recruiterId" TEXT,
    "hiringManagerId" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "assessmentDate" TIMESTAMP(3),
    "performanceScore30" DOUBLE PRECISION,
    "performanceScore60" DOUBLE PRECISION,
    "performanceScore90" DOUBLE PRECISION,
    "annualPerformance" DOUBLE PRECISION,
    "isRetained" BOOLEAN NOT NULL DEFAULT true,
    "retainedAt30Days" BOOLEAN NOT NULL DEFAULT true,
    "retainedAt90Days" BOOLEAN,
    "retainedAt1Year" BOOLEAN,
    "separationDate" TIMESTAMP(3),
    "separationReason" TEXT,
    "managerSatisfaction" DOUBLE PRECISION,
    "meetingExpectations" TEXT,
    "wouldRehire" BOOLEAN,
    "promotionTimeline" TEXT,
    "culturalFitScore" DOUBLE PRECISION,
    "teamIntegration" DOUBLE PRECISION,
    "timeToProductivity" INTEGER,
    "trainingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "overallQualityScore" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_of_hire_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diversity_analytics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "departmentId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "totalApplicants" INTEGER NOT NULL DEFAULT 0,
    "genderMale" INTEGER NOT NULL DEFAULT 0,
    "genderFemale" INTEGER NOT NULL DEFAULT 0,
    "genderNonBinary" INTEGER NOT NULL DEFAULT 0,
    "genderUndisclosed" INTEGER NOT NULL DEFAULT 0,
    "ethnicityWhite" INTEGER NOT NULL DEFAULT 0,
    "ethnicityBlack" INTEGER NOT NULL DEFAULT 0,
    "ethnicityHispanic" INTEGER NOT NULL DEFAULT 0,
    "ethnicityAsian" INTEGER NOT NULL DEFAULT 0,
    "ethnicityOther" INTEGER NOT NULL DEFAULT 0,
    "ethnicityUndisclosed" INTEGER NOT NULL DEFAULT 0,
    "age18to25" INTEGER NOT NULL DEFAULT 0,
    "age26to35" INTEGER NOT NULL DEFAULT 0,
    "age36to45" INTEGER NOT NULL DEFAULT 0,
    "age46to55" INTEGER NOT NULL DEFAULT 0,
    "age56plus" INTEGER NOT NULL DEFAULT 0,
    "ageUndisclosed" INTEGER NOT NULL DEFAULT 0,
    "veteranYes" INTEGER NOT NULL DEFAULT 0,
    "veteranNo" INTEGER NOT NULL DEFAULT 0,
    "veteranUndisclosed" INTEGER NOT NULL DEFAULT 0,
    "disabilityYes" INTEGER NOT NULL DEFAULT 0,
    "disabilityNo" INTEGER NOT NULL DEFAULT 0,
    "disabilityUndisclosed" INTEGER NOT NULL DEFAULT 0,
    "diversityByStage" JSONB,
    "conversionByGender" JSONB,
    "conversionByEthnicity" JSONB,
    "hiresTotal" INTEGER NOT NULL DEFAULT 0,
    "hiresDiversity" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diversity_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_offer_ratios" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "departmentId" TEXT,
    "recruiterId" TEXT,
    "hiringManagerId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "phoneScreens" INTEGER NOT NULL DEFAULT 0,
    "technicalInterviews" INTEGER NOT NULL DEFAULT 0,
    "onsiteInterviews" INTEGER NOT NULL DEFAULT 0,
    "finalInterviews" INTEGER NOT NULL DEFAULT 0,
    "totalInterviews" INTEGER NOT NULL DEFAULT 0,
    "uniqueCandidatesInterviewed" INTEGER NOT NULL DEFAULT 0,
    "passedScreening" INTEGER NOT NULL DEFAULT 0,
    "passedTechnical" INTEGER NOT NULL DEFAULT 0,
    "passedOnsite" INTEGER NOT NULL DEFAULT 0,
    "offersExtended" INTEGER NOT NULL DEFAULT 0,
    "offersAccepted" INTEGER NOT NULL DEFAULT 0,
    "hires" INTEGER NOT NULL DEFAULT 0,
    "interviewsPerHire" DOUBLE PRECISION,
    "screenPassRate" DOUBLE PRECISION,
    "technicalPassRate" DOUBLE PRECISION,
    "onsitePassRate" DOUBLE PRECISION,
    "offerRate" DOUBLE PRECISION,
    "acceptanceRate" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_offer_ratios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drop_off_analysis" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "departmentId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "sourceToApplyDropOff" INTEGER NOT NULL DEFAULT 0,
    "applyToScreenDropOff" INTEGER NOT NULL DEFAULT 0,
    "screenToInterviewDropOff" INTEGER NOT NULL DEFAULT 0,
    "interviewToOfferDropOff" INTEGER NOT NULL DEFAULT 0,
    "offerToHireDropOff" INTEGER NOT NULL DEFAULT 0,
    "sourceToApplyDropRate" DOUBLE PRECISION,
    "applyToScreenDropRate" DOUBLE PRECISION,
    "screenToInterviewDropRate" DOUBLE PRECISION,
    "interviewToOfferDropRate" DOUBLE PRECISION,
    "offerToHireDropRate" DOUBLE PRECISION,
    "withdrawalReasons" JSONB,
    "rejectionReasons" JSONB,
    "avgDaysBeforeDropOff" JSONB,
    "reEngaged" INTEGER NOT NULL DEFAULT 0,
    "reEngagementRate" DOUBLE PRECISION,
    "worstStage" TEXT,
    "worstDropRate" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drop_off_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_slas" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slaType" TEXT NOT NULL,
    "targetMetric" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "targetUnit" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "applicableJobs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableDepartments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "escalationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "escalationThreshold" INTEGER,
    "escalationRecipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_slas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_tracking" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "slaId" TEXT NOT NULL,
    "jobId" TEXT,
    "candidateId" TEXT,
    "recruiterId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "totalMeasured" INTEGER NOT NULL DEFAULT 0,
    "metSLA" INTEGER NOT NULL DEFAULT 0,
    "missedSLA" INTEGER NOT NULL DEFAULT 0,
    "complianceRate" DOUBLE PRECISION,
    "avgActualTime" DOUBLE PRECISION,
    "minTime" DOUBLE PRECISION,
    "maxTime" DOUBLE PRECISION,
    "medianTime" DOUBLE PRECISION,
    "p90Time" DOUBLE PRECISION,
    "breachDetails" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "escalationsTriggered" INTEGER NOT NULL DEFAULT 0,
    "previousPeriodCompliance" DOUBLE PRECISION,
    "trend" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sla_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_dashboards" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layout" JSONB NOT NULL,
    "widgets" JSONB[],
    "filters" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "lastViewedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trend_analyses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricCategory" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dataPoints" JSONB[],
    "trend" TEXT NOT NULL,
    "trendStrength" DOUBLE PRECISION,
    "forecast" JSONB[],
    "avgValue" DOUBLE PRECISION NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "stdDeviation" DOUBLE PRECISION,
    "yoyChange" DOUBLE PRECISION,
    "momChange" DOUBLE PRECISION,
    "seasonalPattern" TEXT,
    "anomalies" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trend_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_benchmarks" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricCategory" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "p10Value" DOUBLE PRECISION NOT NULL,
    "p25Value" DOUBLE PRECISION NOT NULL,
    "p50Value" DOUBLE PRECISION NOT NULL,
    "p75Value" DOUBLE PRECISION NOT NULL,
    "p90Value" DOUBLE PRECISION NOT NULL,
    "avgValue" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "sampleSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_comparisons" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "comparisonDate" TIMESTAMP(3) NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricCategory" TEXT NOT NULL,
    "orgValue" DOUBLE PRECISION NOT NULL,
    "benchmarkValue" DOUBLE PRECISION NOT NULL,
    "percentile" DOUBLE PRECISION NOT NULL,
    "gap" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmark_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_widgets" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dashboardId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "widgetType" TEXT NOT NULL,
    "chartType" TEXT,
    "dataSource" TEXT NOT NULL,
    "query" JSONB,
    "width" INTEGER NOT NULL DEFAULT 1,
    "height" INTEGER NOT NULL DEFAULT 1,
    "position" JSONB,
    "colors" JSONB,
    "showLegend" BOOLEAN NOT NULL DEFAULT true,
    "showLabels" BOOLEAN NOT NULL DEFAULT true,
    "refreshInterval" INTEGER,
    "lastRefreshed" TIMESTAMP(3),
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_reports" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "reportType" TEXT NOT NULL,
    "templateId" TEXT,
    "format" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "nextRunAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "recipients" TEXT[],
    "ccRecipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "includeComments" BOOLEAN NOT NULL DEFAULT false,
    "filters" JSONB,
    "dateRange" TEXT NOT NULL,
    "customDateStart" TIMESTAMP(3),
    "customDateEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_executions" (
    "id" TEXT NOT NULL,
    "scheduledReportId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "executionTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "pageCount" INTEGER,
    "recipientsSent" TEXT[],
    "deliveryStatus" JSONB,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_export_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "toolType" TEXT NOT NULL,
    "connectionType" TEXT NOT NULL,
    "serverUrl" TEXT,
    "apiKey" TEXT,
    "credentials" JSONB,
    "dataSources" TEXT[],
    "refreshSchedule" TEXT,
    "lastExportAt" TIMESTAMP(3),
    "connectionStatus" TEXT NOT NULL DEFAULT 'pending',
    "lastConnectionTest" TIMESTAMP(3),
    "errorMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bi_export_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_export_logs" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "exportTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "exportType" TEXT NOT NULL,
    "recordsExported" INTEGER,
    "duration" INTEGER,
    "fileSize" INTEGER,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bi_export_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hiring_goals" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goalType" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "departmentId" TEXT,
    "jobId" TEXT,
    "recruiterId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'on_track',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "milestones" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "notifications" JSONB,
    "createdBy" TEXT NOT NULL,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hiring_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_progress" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "cumulativeValue" DOUBLE PRECISION NOT NULL,
    "milestone" TEXT,
    "note" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_views" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "openPositions" INTEGER NOT NULL DEFAULT 0,
    "activeApplicants" INTEGER NOT NULL DEFAULT 0,
    "hiredThisPeriod" INTEGER NOT NULL DEFAULT 0,
    "targetHires" INTEGER,
    "avgTimeToFill" DOUBLE PRECISION,
    "avgTimeToHire" DOUBLE PRECISION,
    "avgCostPerHire" DOUBLE PRECISION,
    "totalHiringBudget" DOUBLE PRECISION,
    "budgetUsed" DOUBLE PRECISION,
    "avgQualityScore" DOUBLE PRECISION,
    "offerAcceptRate" DOUBLE PRECISION,
    "retention90Days" DOUBLE PRECISION,
    "diversityScore" DOUBLE PRECISION,
    "pipelineHealth" JSONB,
    "headcount" INTEGER,
    "attritionRate" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_hiring_metrics" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "managerId" TEXT,
    "managerName" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "positionsOpened" INTEGER NOT NULL DEFAULT 0,
    "positionsFilled" INTEGER NOT NULL DEFAULT 0,
    "positionsClosed" INTEGER NOT NULL DEFAULT 0,
    "avgTimeToFill" DOUBLE PRECISION,
    "avgCostPerHire" DOUBLE PRECISION,
    "avgQualityScore" DOUBLE PRECISION,
    "fillRate" DOUBLE PRECISION,
    "interviewsPerHire" DOUBLE PRECISION,
    "offerAcceptRate" DOUBLE PRECISION,
    "hiringManagerSatisfaction" DOUBLE PRECISION,
    "candidateExperience" DOUBLE PRECISION,
    "trend" TEXT,
    "ranking" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_hiring_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_market_data" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobFamily" TEXT,
    "level" TEXT,
    "location" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "minSalary" DOUBLE PRECISION NOT NULL,
    "maxSalary" DOUBLE PRECISION NOT NULL,
    "medianSalary" DOUBLE PRECISION NOT NULL,
    "percentile25" DOUBLE PRECISION,
    "percentile75" DOUBLE PRECISION,
    "percentile90" DOUBLE PRECISION,
    "bonusMin" DOUBLE PRECISION,
    "bonusMax" DOUBLE PRECISION,
    "bonusMedian" DOUBLE PRECISION,
    "equityMin" DOUBLE PRECISION,
    "equityMax" DOUBLE PRECISION,
    "equityMedian" DOUBLE PRECISION,
    "dataSource" TEXT NOT NULL,
    "sampleSize" INTEGER,
    "confidenceLevel" DOUBLE PRECISION,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "industry" TEXT,
    "companySize" TEXT,
    "trendDirection" TEXT,
    "trendPercentage" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_market_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_pool_analyses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "analysisName" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "targetSkills" JSONB,
    "targetLocations" JSONB,
    "experienceRange" JSONB,
    "educationLevel" TEXT,
    "totalCandidates" INTEGER,
    "qualifiedCandidates" INTEGER,
    "activeJobSeekers" INTEGER,
    "passiveCandidates" INTEGER,
    "skillDistribution" JSONB,
    "locationDistribution" JSONB,
    "experienceDistribution" JSONB,
    "salaryDistribution" JSONB,
    "availabilityScore" DOUBLE PRECISION,
    "competitionLevel" TEXT,
    "avgTimeToHire" DOUBLE PRECISION,
    "recommendations" JSONB,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talent_pool_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_insights" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "competitorName" TEXT NOT NULL,
    "competitorDomain" TEXT,
    "industry" TEXT,
    "companySize" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalJobPostings" INTEGER NOT NULL DEFAULT 0,
    "activeJobPostings" INTEGER NOT NULL DEFAULT 0,
    "closedJobPostings" INTEGER NOT NULL DEFAULT 0,
    "engineeringJobs" INTEGER NOT NULL DEFAULT 0,
    "salesJobs" INTEGER NOT NULL DEFAULT 0,
    "marketingJobs" INTEGER NOT NULL DEFAULT 0,
    "operationsJobs" INTEGER NOT NULL DEFAULT 0,
    "otherJobs" INTEGER NOT NULL DEFAULT 0,
    "avgPostingDuration" DOUBLE PRECISION,
    "hiringVelocity" TEXT,
    "topSkills" JSONB,
    "emergingSkills" JSONB,
    "primaryLocations" JSONB,
    "remoteRatio" DOUBLE PRECISION,
    "avgSalaryRange" JSONB,
    "growthTrend" TEXT,
    "growthRate" DOUBLE PRECISION,
    "source" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_demand_trends" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "skillCategory" TEXT,
    "skillType" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "granularity" TEXT NOT NULL DEFAULT 'monthly',
    "demandScore" DOUBLE PRECISION,
    "mentionCount" INTEGER NOT NULL DEFAULT 0,
    "jobPostingCount" INTEGER NOT NULL DEFAULT 0,
    "growthRate" DOUBLE PRECISION,
    "trendDirection" TEXT,
    "velocityScore" DOUBLE PRECISION,
    "maturityLevel" TEXT,
    "industryDemand" JSONB,
    "locationDemand" JSONB,
    "salaryPremium" DOUBLE PRECISION,
    "avgSalaryWithSkill" DOUBLE PRECISION,
    "relatedSkills" JSONB,
    "substitutes" JSONB,
    "forecastDemand" JSONB,
    "confidenceScore" DOUBLE PRECISION,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_demand_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_intelligence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "locationType" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "timezone" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalTalentPool" INTEGER,
    "activeTalentPool" INTEGER,
    "talenDensity" DOUBLE PRECISION,
    "costOfLiving" DOUBLE PRECISION,
    "avgSalary" DOUBLE PRECISION,
    "salaryIndex" DOUBLE PRECISION,
    "remoteRatio" DOUBLE PRECISION,
    "hybridRatio" DOUBLE PRECISION,
    "onsiteRatio" DOUBLE PRECISION,
    "remoteGrowth" DOUBLE PRECISION,
    "competitorPresence" INTEGER,
    "hiringActivity" TEXT,
    "talentDemand" DOUBLE PRECISION,
    "educationLevel" JSONB,
    "experienceLevel" JSONB,
    "skillAvailability" JSONB,
    "unemploymentRate" DOUBLE PRECISION,
    "techJobGrowth" DOUBLE PRECISION,
    "startupActivity" DOUBLE PRECISION,
    "techInfrastructure" DOUBLE PRECISION,
    "connectivity" DOUBLE PRECISION,
    "recommendations" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_trends" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "industryName" TEXT NOT NULL,
    "industryCode" TEXT,
    "subIndustry" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalHiring" INTEGER,
    "hiringGrowth" DOUBLE PRECISION,
    "hiringVelocity" TEXT,
    "seasonality" JSONB,
    "topRoles" JSONB,
    "emergingRoles" JSONB,
    "decliningRoles" JSONB,
    "topSkills" JSONB,
    "emergingSkills" JSONB,
    "skillGaps" JSONB,
    "avgSalaryGrowth" DOUBLE PRECISION,
    "compensationTrends" JSONB,
    "remoteAdoption" DOUBLE PRECISION,
    "hybridAdoption" DOUBLE PRECISION,
    "workModeShift" JSONB,
    "marketSize" DOUBLE PRECISION,
    "marketGrowth" DOUBLE PRECISION,
    "investmentTrend" JSONB,
    "talentFlow" JSONB,
    "retentionTrends" DOUBLE PRECISION,
    "turnoverRate" DOUBLE PRECISION,
    "outlook" TEXT,
    "predictions" JSONB,
    "confidenceScore" DOUBLE PRECISION,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_intelligence_snapshots" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshotType" TEXT NOT NULL DEFAULT 'daily',
    "salaryIndexChange" DOUBLE PRECISION,
    "talentAvailabilityScore" DOUBLE PRECISION,
    "competitorActivityScore" DOUBLE PRECISION,
    "skillDemandShift" DOUBLE PRECISION,
    "marketHealthScore" DOUBLE PRECISION,
    "topInsights" JSONB,
    "alerts" JSONB,
    "recommendations" JSONB,
    "salaryDataIds" JSONB,
    "talentPoolIds" JSONB,
    "competitorIds" JSONB,
    "skillTrendIds" JSONB,
    "locationIds" JSONB,
    "industryIds" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_intelligence_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_integrations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "integrationType" TEXT NOT NULL DEFAULT 'bidirectional',
    "connectionSettings" JSONB NOT NULL,
    "authType" TEXT NOT NULL,
    "authCredentials" JSONB,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "syncFrequency" TEXT NOT NULL DEFAULT 'hourly',
    "syncSchedule" JSONB,
    "syncPositions" BOOLEAN NOT NULL DEFAULT true,
    "syncCandidates" BOOLEAN NOT NULL DEFAULT true,
    "syncHires" BOOLEAN NOT NULL DEFAULT true,
    "syncEmployees" BOOLEAN NOT NULL DEFAULT false,
    "fieldMapping" JSONB,
    "statusMapping" JSONB,
    "customTransforms" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "errorMessage" TEXT,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "webhookEnabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_sync_logs" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsDeleted" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "warnings" JSONB,
    "summary" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_integrations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "integrationType" TEXT NOT NULL DEFAULT 'notification',
    "connectionSettings" JSONB NOT NULL,
    "authType" TEXT NOT NULL,
    "authCredentials" JSONB,
    "workspaceId" TEXT,
    "defaultChannel" TEXT,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "approvalsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "messagingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "threadingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notificationTypes" JSONB,
    "notificationChannels" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastActivityAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "platform" TEXT,
    "eventType" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "contentHtml" TEXT,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_board_integrations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformSubtype" TEXT,
    "connectionSettings" JSONB NOT NULL,
    "authType" TEXT NOT NULL,
    "authCredentials" JSONB,
    "autoPostEnabled" BOOLEAN NOT NULL DEFAULT false,
    "postingRules" JSONB,
    "defaultBudget" DOUBLE PRECISION,
    "applicationImport" BOOLEAN NOT NULL DEFAULT true,
    "applicationMapping" JSONB,
    "deduplication" BOOLEAN NOT NULL DEFAULT true,
    "companyPageUrl" TEXT,
    "brandingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastSyncAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "totalPostings" INTEGER NOT NULL DEFAULT 0,
    "activePostings" INTEGER NOT NULL DEFAULT 0,
    "totalApplications" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_board_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_board_postings" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "externalId" TEXT,
    "externalUrl" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "postedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "budget" DOUBLE PRECISION,
    "budgetSpent" DOUBLE PRECISION,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "costPerApply" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_board_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "scopes" JSONB NOT NULL,
    "permissions" JSONB,
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "rateLimitPeriod" TEXT NOT NULL DEFAULT 'hour',
    "allowedIPs" JSONB,
    "ipRestricted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'production',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "events" JSONB NOT NULL,
    "eventFilters" JSONB,
    "httpMethod" TEXT NOT NULL DEFAULT 'POST',
    "headers" JSONB,
    "retryPolicy" JSONB,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "lastResponseCode" INTEGER,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalSuccess" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT,
    "payload" JSONB NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "requestUrl" TEXT NOT NULL,
    "requestHeaders" JSONB,
    "requestBody" TEXT,
    "responseCode" INTEGER,
    "responseBody" TEXT,
    "responseHeaders" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deliveredAt" TIMESTAMP(3),
    "duration" INTEGER,
    "errorMessage" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_integrations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "connectionId" TEXT,
    "triggers" JSONB,
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "actions" JSONB,
    "actionCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivityAt" TIMESTAMP(3),
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "queryParams" JSONB,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "clientIP" TEXT,
    "userAgent" TEXT,
    "rateLimitRemaining" INTEGER,
    "rateLimitReset" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_automations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "triggerType" TEXT NOT NULL,
    "triggerEvent" TEXT,
    "triggerSchedule" TEXT,
    "triggerConditions" JSONB,
    "steps" JSONB NOT NULL,
    "conditionalLogic" JSONB,
    "delayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "delayDuration" INTEGER,
    "delayType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecutedAt" TIMESTAMP(3),
    "avgExecutionTime" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "triggerEvent" TEXT,
    "triggerData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "totalSteps" INTEGER NOT NULL,
    "stepsCompleted" INTEGER NOT NULL DEFAULT 0,
    "stepResults" JSONB,
    "errorMessage" TEXT,
    "errorStep" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "contextData" JSONB,
    "outputData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "useCase" TEXT,
    "icon" TEXT,
    "triggerType" TEXT NOT NULL,
    "triggerEvent" TEXT,
    "steps" JSONB NOT NULL,
    "conditionalLogic" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "variables" JSONB,
    "requiredFields" JSONB,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_jobs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "jobType" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "nextRunAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "configuration" JSONB,
    "parameters" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastStatus" TEXT,
    "lastError" TEXT,
    "lastDuration" INTEGER,
    "retryOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryDelay" INTEGER NOT NULL DEFAULT 5,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_actions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetIds" TEXT[],
    "totalCount" INTEGER NOT NULL,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "actionData" JSONB NOT NULL,
    "filters" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "results" JSONB,
    "errors" JSONB,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_workflows" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workflowType" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "escalationRules" JSONB,
    "requireAllApprovers" BOOLEAN NOT NULL DEFAULT false,
    "allowParallelApproval" BOOLEAN NOT NULL DEFAULT false,
    "autoApproveOnTimeout" BOOLEAN NOT NULL DEFAULT false,
    "timeoutHours" INTEGER,
    "delegationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "delegationRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "avgApprovalTime" INTEGER,
    "approvalRate" DOUBLE PRECISION,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "requestData" JSONB NOT NULL,
    "attachments" JSONB,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvalSteps" JSONB NOT NULL,
    "approvedBy" TEXT[],
    "rejectedBy" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "decision" TEXT,
    "decisionNotes" TEXT,
    "conditions" JSONB,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "isEscalated" BOOLEAN NOT NULL DEFAULT false,
    "escalatedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_step_records" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepName" TEXT,
    "approverType" TEXT NOT NULL,
    "approverId" TEXT,
    "approverRole" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "respondedBy" TEXT,
    "respondedAt" TIMESTAMP(3),
    "decision" TEXT,
    "comments" TEXT,
    "delegatedTo" TEXT,
    "delegatedAt" TIMESTAMP(3),
    "delegationReason" TEXT,
    "dueDate" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_step_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceModel" TEXT,
    "osVersion" TEXT,
    "appVersion" TEXT,
    "pushToken" TEXT,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushCategories" TEXT[],
    "biometricEnabled" BOOLEAN NOT NULL DEFAULT false,
    "biometricType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActiveAt" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceTrusted" BOOLEAN NOT NULL DEFAULT false,
    "trustedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "imageUrl" TEXT,
    "notificationType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "actionTaken" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_app_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "platform" TEXT NOT NULL,
    "minVersion" TEXT,
    "currentVersion" TEXT,
    "forceUpdate" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "features" JSONB,
    "featureFlags" JSONB,
    "deepLinkScheme" TEXT,
    "universalLinks" JSONB,
    "offlineEnabled" BOOLEAN NOT NULL DEFAULT true,
    "offlineCacheDays" INTEGER NOT NULL DEFAULT 7,
    "offlineFeatures" TEXT[],
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "crashReportingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_app_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_sync_queue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "syncAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "hasConflict" BOOLEAN NOT NULL DEFAULT false,
    "conflictData" JSONB,
    "resolution" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offline_sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "appName" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "themeColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "icons" JSONB,
    "swVersion" TEXT,
    "cacheVersion" TEXT,
    "cacheStrategies" JSONB,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "vapidPublicKey" TEXT,
    "installPromptEnabled" BOOLEAN NOT NULL DEFAULT true,
    "installBannerDelay" INTEGER NOT NULL DEFAULT 30,
    "offlinePageUrl" TEXT,
    "offlineFallbacks" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pwa_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "web_push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "browserName" TEXT,
    "browserVersion" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categories" TEXT[],
    "lastNotifiedAt" TIMESTAMP(3),
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalDelivered" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "web_push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessibility_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "colorScheme" TEXT NOT NULL DEFAULT 'system',
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "fontFamily" TEXT NOT NULL DEFAULT 'system',
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "underlineLinks" BOOLEAN NOT NULL DEFAULT false,
    "lineSpacing" TEXT NOT NULL DEFAULT 'normal',
    "letterSpacing" TEXT NOT NULL DEFAULT 'normal',
    "textAlignment" TEXT NOT NULL DEFAULT 'left',
    "keyboardNavigation" BOOLEAN NOT NULL DEFAULT true,
    "focusIndicators" BOOLEAN NOT NULL DEFAULT true,
    "skipLinks" BOOLEAN NOT NULL DEFAULT true,
    "screenReaderOptimized" BOOLEAN NOT NULL DEFAULT false,
    "verboseLabels" BOOLEAN NOT NULL DEFAULT false,
    "announceImages" BOOLEAN NOT NULL DEFAULT true,
    "extendedTimeouts" BOOLEAN NOT NULL DEFAULT false,
    "autoPlayMedia" BOOLEAN NOT NULL DEFAULT false,
    "carouselAutoPlay" BOOLEAN NOT NULL DEFAULT false,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "soundVolume" INTEGER NOT NULL DEFAULT 100,
    "speechRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accessibility_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessibility_audits" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "pageTitle" TEXT,
    "auditDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "standard" TEXT NOT NULL DEFAULT 'WCAG21AA',
    "score" DOUBLE PRECISION NOT NULL,
    "passedRules" INTEGER NOT NULL,
    "failedRules" INTEGER NOT NULL,
    "warningRules" INTEGER NOT NULL,
    "manualReviewRules" INTEGER NOT NULL,
    "issues" JSONB NOT NULL,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "seriousCount" INTEGER NOT NULL DEFAULT 0,
    "moderateCount" INTEGER NOT NULL DEFAULT 0,
    "minorCount" INTEGER NOT NULL DEFAULT 0,
    "auditTool" TEXT,
    "toolVersion" TEXT,
    "remediationNotes" TEXT,
    "fixedIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "lastFixedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accessibility_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "settings" JSONB,
    "features" JSONB,
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "maxJobs" INTEGER NOT NULL DEFAULT 10,
    "storageLimit" INTEGER NOT NULL DEFAULT 1024,
    "billingEmail" TEXT,
    "billingAddress" JSONB,
    "stripeCustomerId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "isTrialActive" BOOLEAN NOT NULL DEFAULT false,
    "dataRegion" TEXT NOT NULL DEFAULT 'us-east-1',
    "encryptionKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT NOT NULL DEFAULT 'company',
    "logo" TEXT,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT,
    "settings" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "annualBudget" DOUBLE PRECISION,
    "currentSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "ownerId" TEXT,
    "ownerName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allocatedHeadcount" INTEGER NOT NULL DEFAULT 0,
    "currentHeadcount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT,
    "headId" TEXT,
    "headName" TEXT,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalSeats" INTEGER NOT NULL,
    "usedSeats" INTEGER NOT NULL DEFAULT 0,
    "availableSeats" INTEGER NOT NULL,
    "pricePerSeat" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "features" TEXT[],
    "restrictions" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_allocations" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allocatedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "revokeReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "license_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "permissions" TEXT[],
    "featureAccess" JSONB,
    "restrictions" JSONB,
    "dataAccess" TEXT NOT NULL DEFAULT 'own',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_roles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseTemplateId" TEXT,
    "permissions" TEXT[],
    "featureAccess" JSONB,
    "dataAccess" TEXT NOT NULL DEFAULT 'own',
    "canBeAssigned" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_reviews" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "reviewType" TEXT NOT NULL,
    "targetUsers" TEXT[],
    "targetRoles" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "reviewedItems" INTEGER NOT NULL DEFAULT 0,
    "approvedItems" INTEGER NOT NULL DEFAULT 0,
    "revokedItems" INTEGER NOT NULL DEFAULT 0,
    "results" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "resourceName" TEXT,
    "details" JSONB,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_userId_key" ON "candidate_profiles"("userId");

-- CreateIndex
CREATE INDEX "candidate_profiles_userId_idx" ON "candidate_profiles"("userId");

-- CreateIndex
CREATE INDEX "candidate_profiles_completenessScore_idx" ON "candidate_profiles"("completenessScore");

-- CreateIndex
CREATE INDEX "candidate_profiles_isPublic_idx" ON "candidate_profiles"("isPublic");

-- CreateIndex
CREATE INDEX "work_experiences_profileId_idx" ON "work_experiences"("profileId");

-- CreateIndex
CREATE INDEX "work_experiences_startDate_idx" ON "work_experiences"("startDate");

-- CreateIndex
CREATE INDEX "work_experiences_isCurrent_idx" ON "work_experiences"("isCurrent");

-- CreateIndex
CREATE INDEX "work_experiences_verificationStatus_idx" ON "work_experiences"("verificationStatus");

-- CreateIndex
CREATE INDEX "educations_profileId_idx" ON "educations"("profileId");

-- CreateIndex
CREATE INDEX "educations_startDate_idx" ON "educations"("startDate");

-- CreateIndex
CREATE INDEX "educations_verificationStatus_idx" ON "educations"("verificationStatus");

-- CreateIndex
CREATE INDEX "certifications_profileId_idx" ON "certifications"("profileId");

-- CreateIndex
CREATE INDEX "certifications_issueDate_idx" ON "certifications"("issueDate");

-- CreateIndex
CREATE INDEX "certifications_expirationDate_idx" ON "certifications"("expirationDate");

-- CreateIndex
CREATE INDEX "certifications_verificationStatus_idx" ON "certifications"("verificationStatus");

-- CreateIndex
CREATE INDEX "candidate_skills_profileId_idx" ON "candidate_skills"("profileId");

-- CreateIndex
CREATE INDEX "candidate_skills_category_idx" ON "candidate_skills"("category");

-- CreateIndex
CREATE INDEX "candidate_skills_proficiencyLevel_idx" ON "candidate_skills"("proficiencyLevel");

-- CreateIndex
CREATE INDEX "candidate_skills_isPrimary_idx" ON "candidate_skills"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_skills_profileId_name_key" ON "candidate_skills"("profileId", "name");

-- CreateIndex
CREATE INDEX "skill_endorsements_skillId_idx" ON "skill_endorsements"("skillId");

-- CreateIndex
CREATE INDEX "skill_endorsements_endorserId_idx" ON "skill_endorsements"("endorserId");

-- CreateIndex
CREATE UNIQUE INDEX "skill_endorsements_skillId_endorserId_key" ON "skill_endorsements"("skillId", "endorserId");

-- CreateIndex
CREATE INDEX "projects_profileId_idx" ON "projects"("profileId");

-- CreateIndex
CREATE INDEX "projects_projectType_idx" ON "projects"("projectType");

-- CreateIndex
CREATE INDEX "projects_isFeatured_idx" ON "projects"("isFeatured");

-- CreateIndex
CREATE INDEX "projects_isPublic_idx" ON "projects"("isPublic");

-- CreateIndex
CREATE INDEX "achievements_profileId_idx" ON "achievements"("profileId");

-- CreateIndex
CREATE INDEX "achievements_type_idx" ON "achievements"("type");

-- CreateIndex
CREATE INDEX "achievements_isCompleted_idx" ON "achievements"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_profileId_type_category_key" ON "achievements"("profileId", "type", "category");

-- CreateIndex
CREATE INDEX "profile_versions_profileId_idx" ON "profile_versions"("profileId");

-- CreateIndex
CREATE INDEX "profile_versions_createdAt_idx" ON "profile_versions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "profile_versions_profileId_versionNumber_key" ON "profile_versions"("profileId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "github_profiles_profileId_key" ON "github_profiles"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "github_profiles_githubId_key" ON "github_profiles"("githubId");

-- CreateIndex
CREATE INDEX "github_profiles_profileId_idx" ON "github_profiles"("profileId");

-- CreateIndex
CREATE INDEX "github_profiles_username_idx" ON "github_profiles"("username");

-- CreateIndex
CREATE INDEX "github_profiles_status_idx" ON "github_profiles"("status");

-- CreateIndex
CREATE INDEX "github_repositories_githubProfileId_idx" ON "github_repositories"("githubProfileId");

-- CreateIndex
CREATE INDEX "github_repositories_language_idx" ON "github_repositories"("language");

-- CreateIndex
CREATE INDEX "github_repositories_stars_idx" ON "github_repositories"("stars");

-- CreateIndex
CREATE INDEX "github_repositories_isShowcased_idx" ON "github_repositories"("isShowcased");

-- CreateIndex
CREATE UNIQUE INDEX "github_repositories_githubProfileId_repoId_key" ON "github_repositories"("githubProfileId", "repoId");

-- CreateIndex
CREATE UNIQUE INDEX "linkedin_profiles_profileId_key" ON "linkedin_profiles"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "linkedin_profiles_linkedInId_key" ON "linkedin_profiles"("linkedInId");

-- CreateIndex
CREATE INDEX "linkedin_profiles_profileId_idx" ON "linkedin_profiles"("profileId");

-- CreateIndex
CREATE INDEX "linkedin_profiles_linkedInId_idx" ON "linkedin_profiles"("linkedInId");

-- CreateIndex
CREATE INDEX "linkedin_profiles_status_idx" ON "linkedin_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_definitions_name_key" ON "achievement_definitions"("name");

-- CreateIndex
CREATE INDEX "achievement_definitions_category_idx" ON "achievement_definitions"("category");

-- CreateIndex
CREATE INDEX "achievement_definitions_isActive_idx" ON "achievement_definitions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "stackoverflow_profiles_profileId_key" ON "stackoverflow_profiles"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "stackoverflow_profiles_stackOverflowId_key" ON "stackoverflow_profiles"("stackOverflowId");

-- CreateIndex
CREATE INDEX "stackoverflow_profiles_profileId_idx" ON "stackoverflow_profiles"("profileId");

-- CreateIndex
CREATE INDEX "stackoverflow_profiles_stackOverflowId_idx" ON "stackoverflow_profiles"("stackOverflowId");

-- CreateIndex
CREATE UNIQUE INDEX "notion_portfolios_profileId_key" ON "notion_portfolios"("profileId");

-- CreateIndex
CREATE INDEX "notion_portfolios_profileId_idx" ON "notion_portfolios"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "gitlab_profiles_profileId_key" ON "gitlab_profiles"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "gitlab_profiles_gitlabId_key" ON "gitlab_profiles"("gitlabId");

-- CreateIndex
CREATE INDEX "gitlab_profiles_profileId_idx" ON "gitlab_profiles"("profileId");

-- CreateIndex
CREATE INDEX "gitlab_profiles_username_idx" ON "gitlab_profiles"("username");

-- CreateIndex
CREATE INDEX "gitlab_projects_gitlabProfileId_idx" ON "gitlab_projects"("gitlabProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "gitlab_projects_gitlabProfileId_projectId_key" ON "gitlab_projects"("gitlabProfileId", "projectId");

-- CreateIndex
CREATE INDEX "design_portfolios_profileId_idx" ON "design_portfolios"("profileId");

-- CreateIndex
CREATE INDEX "design_portfolios_platform_idx" ON "design_portfolios"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "design_portfolios_profileId_platform_key" ON "design_portfolios"("profileId", "platform");

-- CreateIndex
CREATE INDEX "blog_platforms_profileId_idx" ON "blog_platforms"("profileId");

-- CreateIndex
CREATE INDEX "blog_platforms_platform_idx" ON "blog_platforms"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "blog_platforms_profileId_platform_key" ON "blog_platforms"("profileId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "kaggle_profiles_profileId_key" ON "kaggle_profiles"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "kaggle_profiles_kaggleId_key" ON "kaggle_profiles"("kaggleId");

-- CreateIndex
CREATE INDEX "kaggle_profiles_profileId_idx" ON "kaggle_profiles"("profileId");

-- CreateIndex
CREATE INDEX "kaggle_profiles_username_idx" ON "kaggle_profiles"("username");

-- CreateIndex
CREATE INDEX "coding_platform_profiles_profileId_idx" ON "coding_platform_profiles"("profileId");

-- CreateIndex
CREATE INDEX "coding_platform_profiles_platform_idx" ON "coding_platform_profiles"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "coding_platform_profiles_profileId_platform_key" ON "coding_platform_profiles"("profileId", "platform");

-- CreateIndex
CREATE INDEX "online_course_profiles_profileId_idx" ON "online_course_profiles"("profileId");

-- CreateIndex
CREATE INDEX "online_course_profiles_platform_idx" ON "online_course_profiles"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "online_course_profiles_profileId_platform_key" ON "online_course_profiles"("profileId", "platform");

-- CreateIndex
CREATE INDEX "online_courses_courseProfileId_idx" ON "online_courses"("courseProfileId");

-- CreateIndex
CREATE INDEX "online_courses_isCompleted_idx" ON "online_courses"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "online_courses_courseProfileId_courseId_key" ON "online_courses"("courseProfileId", "courseId");

-- CreateIndex
CREATE INDEX "academic_profiles_profileId_idx" ON "academic_profiles"("profileId");

-- CreateIndex
CREATE INDEX "academic_profiles_platform_idx" ON "academic_profiles"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "academic_profiles_profileId_platform_key" ON "academic_profiles"("profileId", "platform");

-- CreateIndex
CREATE INDEX "publications_academicProfileId_idx" ON "publications"("academicProfileId");

-- CreateIndex
CREATE INDEX "publications_year_idx" ON "publications"("year");

-- CreateIndex
CREATE INDEX "publications_citations_idx" ON "publications"("citations");

-- CreateIndex
CREATE UNIQUE INDEX "publications_academicProfileId_publicationId_key" ON "publications"("academicProfileId", "publicationId");

-- CreateIndex
CREATE INDEX "custom_portfolio_links_profileId_idx" ON "custom_portfolio_links"("profileId");

-- CreateIndex
CREATE INDEX "custom_portfolio_links_linkType_idx" ON "custom_portfolio_links"("linkType");

-- CreateIndex
CREATE INDEX "custom_portfolio_links_isFeatured_idx" ON "custom_portfolio_links"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "email_domain_verifications_verificationToken_key" ON "email_domain_verifications"("verificationToken");

-- CreateIndex
CREATE INDEX "email_domain_verifications_profileId_idx" ON "email_domain_verifications"("profileId");

-- CreateIndex
CREATE INDEX "email_domain_verifications_emailDomain_idx" ON "email_domain_verifications"("emailDomain");

-- CreateIndex
CREATE INDEX "email_domain_verifications_verificationStatus_idx" ON "email_domain_verifications"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "email_domain_verifications_profileId_workEmail_key" ON "email_domain_verifications"("profileId", "workEmail");

-- CreateIndex
CREATE UNIQUE INDEX "linkedin_employment_verifications_workExperienceId_key" ON "linkedin_employment_verifications"("workExperienceId");

-- CreateIndex
CREATE INDEX "linkedin_employment_verifications_profileId_idx" ON "linkedin_employment_verifications"("profileId");

-- CreateIndex
CREATE INDEX "linkedin_employment_verifications_workExperienceId_idx" ON "linkedin_employment_verifications"("workExperienceId");

-- CreateIndex
CREATE INDEX "linkedin_employment_verifications_verificationStatus_idx" ON "linkedin_employment_verifications"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "peer_endorsements_requestId_key" ON "peer_endorsements"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "peer_endorsements_verificationToken_key" ON "peer_endorsements"("verificationToken");

-- CreateIndex
CREATE INDEX "peer_endorsements_profileId_idx" ON "peer_endorsements"("profileId");

-- CreateIndex
CREATE INDEX "peer_endorsements_endorserEmail_idx" ON "peer_endorsements"("endorserEmail");

-- CreateIndex
CREATE INDEX "peer_endorsements_requestStatus_idx" ON "peer_endorsements"("requestStatus");

-- CreateIndex
CREATE UNIQUE INDEX "manager_references_requestId_key" ON "manager_references"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "manager_references_verificationToken_key" ON "manager_references"("verificationToken");

-- CreateIndex
CREATE INDEX "manager_references_profileId_idx" ON "manager_references"("profileId");

-- CreateIndex
CREATE INDEX "manager_references_workExperienceId_idx" ON "manager_references"("workExperienceId");

-- CreateIndex
CREATE INDEX "manager_references_referenceEmail_idx" ON "manager_references"("referenceEmail");

-- CreateIndex
CREATE INDEX "manager_references_requestStatus_idx" ON "manager_references"("requestStatus");

-- CreateIndex
CREATE UNIQUE INDEX "certification_verifications_certificationId_key" ON "certification_verifications"("certificationId");

-- CreateIndex
CREATE INDEX "certification_verifications_profileId_idx" ON "certification_verifications"("profileId");

-- CreateIndex
CREATE INDEX "certification_verifications_certificationId_idx" ON "certification_verifications"("certificationId");

-- CreateIndex
CREATE INDEX "certification_verifications_verificationStatus_idx" ON "certification_verifications"("verificationStatus");

-- CreateIndex
CREATE INDEX "certification_verifications_isVerified_idx" ON "certification_verifications"("isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "trust_scores_profileId_key" ON "trust_scores"("profileId");

-- CreateIndex
CREATE INDEX "trust_scores_profileId_idx" ON "trust_scores"("profileId");

-- CreateIndex
CREATE INDEX "trust_scores_overallScore_idx" ON "trust_scores"("overallScore");

-- CreateIndex
CREATE INDEX "trust_scores_tier_idx" ON "trust_scores"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "education_verifications_educationId_key" ON "education_verifications"("educationId");

-- CreateIndex
CREATE UNIQUE INDEX "education_verifications_requestId_key" ON "education_verifications"("requestId");

-- CreateIndex
CREATE INDEX "education_verifications_profileId_idx" ON "education_verifications"("profileId");

-- CreateIndex
CREATE INDEX "education_verifications_educationId_idx" ON "education_verifications"("educationId");

-- CreateIndex
CREATE INDEX "education_verifications_requestStatus_idx" ON "education_verifications"("requestStatus");

-- CreateIndex
CREATE UNIQUE INDEX "background_checks_providerCheckId_key" ON "background_checks"("providerCheckId");

-- CreateIndex
CREATE UNIQUE INDEX "background_checks_requestId_key" ON "background_checks"("requestId");

-- CreateIndex
CREATE INDEX "background_checks_profileId_idx" ON "background_checks"("profileId");

-- CreateIndex
CREATE INDEX "background_checks_status_idx" ON "background_checks"("status");

-- CreateIndex
CREATE INDEX "background_checks_provider_idx" ON "background_checks"("provider");

-- CreateIndex
CREATE INDEX "verified_badges_profileId_idx" ON "verified_badges"("profileId");

-- CreateIndex
CREATE INDEX "verified_badges_badgeType_idx" ON "verified_badges"("badgeType");

-- CreateIndex
CREATE UNIQUE INDEX "verified_badges_profileId_badgeType_key" ON "verified_badges"("profileId", "badgeType");

-- CreateIndex
CREATE UNIQUE INDEX "coding_challenges_slug_key" ON "coding_challenges"("slug");

-- CreateIndex
CREATE INDEX "coding_challenges_difficulty_idx" ON "coding_challenges"("difficulty");

-- CreateIndex
CREATE INDEX "coding_challenges_category_idx" ON "coding_challenges"("category");

-- CreateIndex
CREATE INDEX "coding_challenges_status_idx" ON "coding_challenges"("status");

-- CreateIndex
CREATE INDEX "challenge_submissions_challengeId_idx" ON "challenge_submissions"("challengeId");

-- CreateIndex
CREATE INDEX "challenge_submissions_userId_idx" ON "challenge_submissions"("userId");

-- CreateIndex
CREATE INDEX "challenge_submissions_status_idx" ON "challenge_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "technical_quizzes_slug_key" ON "technical_quizzes"("slug");

-- CreateIndex
CREATE INDEX "technical_quizzes_category_idx" ON "technical_quizzes"("category");

-- CreateIndex
CREATE INDEX "technical_quizzes_difficulty_idx" ON "technical_quizzes"("difficulty");

-- CreateIndex
CREATE INDEX "technical_quizzes_status_idx" ON "technical_quizzes"("status");

-- CreateIndex
CREATE INDEX "quiz_questions_quizId_idx" ON "quiz_questions"("quizId");

-- CreateIndex
CREATE INDEX "quiz_questions_questionType_idx" ON "quiz_questions"("questionType");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_idx" ON "quiz_attempts"("quizId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");

-- CreateIndex
CREATE INDEX "quiz_attempts_status_idx" ON "quiz_attempts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "live_coding_sessions_roomId_key" ON "live_coding_sessions"("roomId");

-- CreateIndex
CREATE INDEX "live_coding_sessions_candidateId_idx" ON "live_coding_sessions"("candidateId");

-- CreateIndex
CREATE INDEX "live_coding_sessions_interviewerId_idx" ON "live_coding_sessions"("interviewerId");

-- CreateIndex
CREATE INDEX "live_coding_sessions_status_idx" ON "live_coding_sessions"("status");

-- CreateIndex
CREATE INDEX "live_coding_sessions_scheduledAt_idx" ON "live_coding_sessions"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "take_home_projects_slug_key" ON "take_home_projects"("slug");

-- CreateIndex
CREATE INDEX "take_home_projects_category_idx" ON "take_home_projects"("category");

-- CreateIndex
CREATE INDEX "take_home_projects_difficulty_idx" ON "take_home_projects"("difficulty");

-- CreateIndex
CREATE INDEX "take_home_projects_status_idx" ON "take_home_projects"("status");

-- CreateIndex
CREATE INDEX "project_submissions_projectId_idx" ON "project_submissions"("projectId");

-- CreateIndex
CREATE INDEX "project_submissions_candidateId_idx" ON "project_submissions"("candidateId");

-- CreateIndex
CREATE INDEX "project_submissions_status_idx" ON "project_submissions"("status");

-- CreateIndex
CREATE INDEX "external_assessments_profileId_idx" ON "external_assessments"("profileId");

-- CreateIndex
CREATE INDEX "external_assessments_provider_idx" ON "external_assessments"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "external_assessments_profileId_provider_assessmentId_key" ON "external_assessments"("profileId", "provider", "assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "soft_skills_assessments_slug_key" ON "soft_skills_assessments"("slug");

-- CreateIndex
CREATE INDEX "soft_skills_assessments_category_idx" ON "soft_skills_assessments"("category");

-- CreateIndex
CREATE INDEX "soft_skills_assessments_status_idx" ON "soft_skills_assessments"("status");

-- CreateIndex
CREATE INDEX "soft_skill_questions_assessmentId_idx" ON "soft_skill_questions"("assessmentId");

-- CreateIndex
CREATE INDEX "soft_skill_attempts_assessmentId_idx" ON "soft_skill_attempts"("assessmentId");

-- CreateIndex
CREATE INDEX "soft_skill_attempts_userId_idx" ON "soft_skill_attempts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "language_proficiency_tests_slug_key" ON "language_proficiency_tests"("slug");

-- CreateIndex
CREATE INDEX "language_proficiency_tests_language_idx" ON "language_proficiency_tests"("language");

-- CreateIndex
CREATE INDEX "language_proficiency_tests_testType_idx" ON "language_proficiency_tests"("testType");

-- CreateIndex
CREATE INDEX "language_proficiency_tests_status_idx" ON "language_proficiency_tests"("status");

-- CreateIndex
CREATE INDEX "language_questions_testId_idx" ON "language_questions"("testId");

-- CreateIndex
CREATE INDEX "language_questions_section_idx" ON "language_questions"("section");

-- CreateIndex
CREATE INDEX "language_test_attempts_testId_idx" ON "language_test_attempts"("testId");

-- CreateIndex
CREATE INDEX "language_test_attempts_userId_idx" ON "language_test_attempts"("userId");

-- CreateIndex
CREATE INDEX "language_test_attempts_status_idx" ON "language_test_attempts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "domain_assessments_slug_key" ON "domain_assessments"("slug");

-- CreateIndex
CREATE INDEX "domain_assessments_domain_idx" ON "domain_assessments"("domain");

-- CreateIndex
CREATE INDEX "domain_assessments_isActive_idx" ON "domain_assessments"("isActive");

-- CreateIndex
CREATE INDEX "domain_questions_assessmentId_idx" ON "domain_questions"("assessmentId");

-- CreateIndex
CREATE INDEX "domain_questions_topic_idx" ON "domain_questions"("topic");

-- CreateIndex
CREATE INDEX "domain_assessment_attempts_assessmentId_idx" ON "domain_assessment_attempts"("assessmentId");

-- CreateIndex
CREATE INDEX "domain_assessment_attempts_userId_idx" ON "domain_assessment_attempts"("userId");

-- CreateIndex
CREATE INDEX "domain_assessment_attempts_status_idx" ON "domain_assessment_attempts"("status");

-- CreateIndex
CREATE INDEX "assessment_analytics_profileId_idx" ON "assessment_analytics"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_analytics_userId_key" ON "assessment_analytics"("userId");

-- CreateIndex
CREATE INDEX "skill_decay_trackers_userId_idx" ON "skill_decay_trackers"("userId");

-- CreateIndex
CREATE INDEX "skill_decay_trackers_refreshDueAt_idx" ON "skill_decay_trackers"("refreshDueAt");

-- CreateIndex
CREATE UNIQUE INDEX "skill_decay_trackers_userId_skillName_key" ON "skill_decay_trackers"("userId", "skillName");

-- CreateIndex
CREATE INDEX "ai_profile_scores_userId_idx" ON "ai_profile_scores"("userId");

-- CreateIndex
CREATE INDEX "ai_profile_scores_overallScore_idx" ON "ai_profile_scores"("overallScore");

-- CreateIndex
CREATE UNIQUE INDEX "ai_profile_scores_profileId_key" ON "ai_profile_scores"("profileId");

-- CreateIndex
CREATE INDEX "job_fit_scores_jobId_idx" ON "job_fit_scores"("jobId");

-- CreateIndex
CREATE INDEX "job_fit_scores_overallFitScore_idx" ON "job_fit_scores"("overallFitScore");

-- CreateIndex
CREATE UNIQUE INDEX "job_fit_scores_userId_jobId_key" ON "job_fit_scores"("userId", "jobId");

-- CreateIndex
CREATE INDEX "culture_fit_analyses_userId_idx" ON "culture_fit_analyses"("userId");

-- CreateIndex
CREATE INDEX "culture_fit_analyses_overallCultureScore_idx" ON "culture_fit_analyses"("overallCultureScore");

-- CreateIndex
CREATE UNIQUE INDEX "culture_fit_analyses_profileId_companyId_jobId_key" ON "culture_fit_analyses"("profileId", "companyId", "jobId");

-- CreateIndex
CREATE INDEX "growth_potential_scores_userId_idx" ON "growth_potential_scores"("userId");

-- CreateIndex
CREATE INDEX "growth_potential_scores_overallGrowthScore_idx" ON "growth_potential_scores"("overallGrowthScore");

-- CreateIndex
CREATE UNIQUE INDEX "growth_potential_scores_profileId_key" ON "growth_potential_scores"("profileId");

-- CreateIndex
CREATE INDEX "technical_depth_scores_userId_idx" ON "technical_depth_scores"("userId");

-- CreateIndex
CREATE INDEX "technical_depth_scores_overallTechnicalScore_idx" ON "technical_depth_scores"("overallTechnicalScore");

-- CreateIndex
CREATE UNIQUE INDEX "technical_depth_scores_profileId_key" ON "technical_depth_scores"("profileId");

-- CreateIndex
CREATE INDEX "communication_scores_userId_idx" ON "communication_scores"("userId");

-- CreateIndex
CREATE INDEX "communication_scores_overallCommScore_idx" ON "communication_scores"("overallCommScore");

-- CreateIndex
CREATE UNIQUE INDEX "communication_scores_profileId_key" ON "communication_scores"("profileId");

-- CreateIndex
CREATE INDEX "reliability_scores_userId_idx" ON "reliability_scores"("userId");

-- CreateIndex
CREATE INDEX "reliability_scores_overallReliabilityScore_idx" ON "reliability_scores"("overallReliabilityScore");

-- CreateIndex
CREATE UNIQUE INDEX "reliability_scores_profileId_key" ON "reliability_scores"("profileId");

-- CreateIndex
CREATE INDEX "salary_alignments_userId_idx" ON "salary_alignments"("userId");

-- CreateIndex
CREATE INDEX "salary_alignments_alignmentScore_idx" ON "salary_alignments"("alignmentScore");

-- CreateIndex
CREATE UNIQUE INDEX "salary_alignments_profileId_jobId_key" ON "salary_alignments"("profileId", "jobId");

-- CreateIndex
CREATE INDEX "location_compatibilities_userId_idx" ON "location_compatibilities"("userId");

-- CreateIndex
CREATE INDEX "location_compatibilities_overallCompatibility_idx" ON "location_compatibilities"("overallCompatibility");

-- CreateIndex
CREATE UNIQUE INDEX "location_compatibilities_profileId_jobId_key" ON "location_compatibilities"("profileId", "jobId");

-- CreateIndex
CREATE INDEX "di_metrics_companyId_idx" ON "di_metrics"("companyId");

-- CreateIndex
CREATE INDEX "di_metrics_jobId_idx" ON "di_metrics"("jobId");

-- CreateIndex
CREATE INDEX "di_metrics_overallDIScore_idx" ON "di_metrics"("overallDIScore");

-- CreateIndex
CREATE INDEX "score_explanations_userId_idx" ON "score_explanations"("userId");

-- CreateIndex
CREATE INDEX "score_explanations_scoreType_scoreId_idx" ON "score_explanations"("scoreType", "scoreId");

-- CreateIndex
CREATE INDEX "score_calibrations_companyId_idx" ON "score_calibrations"("companyId");

-- CreateIndex
CREATE INDEX "score_calibrations_isActive_idx" ON "score_calibrations"("isActive");

-- CreateIndex
CREATE INDEX "market_salary_data_normalizedTitle_country_idx" ON "market_salary_data"("normalizedTitle", "country");

-- CreateIndex
CREATE INDEX "market_salary_data_jobFamily_seniorityLevel_idx" ON "market_salary_data"("jobFamily", "seniorityLevel");

-- CreateIndex
CREATE INDEX "generated_job_descriptions_companyId_status_idx" ON "generated_job_descriptions"("companyId", "status");

-- CreateIndex
CREATE INDEX "generated_job_descriptions_createdById_idx" ON "generated_job_descriptions"("createdById");

-- CreateIndex
CREATE INDEX "job_title_suggestions_companyId_idx" ON "job_title_suggestions"("companyId");

-- CreateIndex
CREATE INDEX "requirements_analyses_companyId_idx" ON "requirements_analyses"("companyId");

-- CreateIndex
CREATE INDEX "requirements_analyses_jobDescriptionId_idx" ON "requirements_analyses"("jobDescriptionId");

-- CreateIndex
CREATE INDEX "inclusive_language_checks_companyId_idx" ON "inclusive_language_checks"("companyId");

-- CreateIndex
CREATE INDEX "inclusive_language_checks_contentType_idx" ON "inclusive_language_checks"("contentType");

-- CreateIndex
CREATE INDEX "salary_range_suggestions_companyId_idx" ON "salary_range_suggestions"("companyId");

-- CreateIndex
CREATE INDEX "salary_range_suggestions_normalizedTitle_location_idx" ON "salary_range_suggestions"("normalizedTitle", "location");

-- CreateIndex
CREATE INDEX "generated_interview_questions_companyId_idx" ON "generated_interview_questions"("companyId");

-- CreateIndex
CREATE INDEX "generated_interview_questions_jobId_idx" ON "generated_interview_questions"("jobId");

-- CreateIndex
CREATE INDEX "generated_interview_questions_interviewRound_idx" ON "generated_interview_questions"("interviewRound");

-- CreateIndex
CREATE INDEX "screening_criteria_companyId_idx" ON "screening_criteria"("companyId");

-- CreateIndex
CREATE INDEX "screening_criteria_jobId_idx" ON "screening_criteria"("jobId");

-- CreateIndex
CREATE INDEX "candidate_summaries_companyId_idx" ON "candidate_summaries"("companyId");

-- CreateIndex
CREATE INDEX "candidate_summaries_applicationId_idx" ON "candidate_summaries"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_summaries_candidateId_jobId_key" ON "candidate_summaries"("candidateId", "jobId");

-- CreateIndex
CREATE INDEX "rejection_emails_companyId_idx" ON "rejection_emails"("companyId");

-- CreateIndex
CREATE INDEX "rejection_emails_applicationId_idx" ON "rejection_emails"("applicationId");

-- CreateIndex
CREATE INDEX "offer_letters_companyId_idx" ON "offer_letters"("companyId");

-- CreateIndex
CREATE INDEX "offer_letters_candidateId_idx" ON "offer_letters"("candidateId");

-- CreateIndex
CREATE INDEX "offer_letters_applicationId_idx" ON "offer_letters"("applicationId");

-- CreateIndex
CREATE INDEX "job_ad_variants_companyId_idx" ON "job_ad_variants"("companyId");

-- CreateIndex
CREATE INDEX "job_ad_variants_jobId_idx" ON "job_ad_variants"("jobId");

-- CreateIndex
CREATE INDEX "job_ad_variants_testId_idx" ON "job_ad_variants"("testId");

-- CreateIndex
CREATE INDEX "job_ad_tests_companyId_idx" ON "job_ad_tests"("companyId");

-- CreateIndex
CREATE INDEX "job_ad_tests_jobId_idx" ON "job_ad_tests"("jobId");

-- CreateIndex
CREATE INDEX "competitor_job_analyses_companyId_idx" ON "competitor_job_analyses"("companyId");

-- CreateIndex
CREATE INDEX "competitor_job_analyses_jobId_idx" ON "competitor_job_analyses"("jobId");

-- CreateIndex
CREATE INDEX "profile_enhancements_userId_idx" ON "profile_enhancements"("userId");

-- CreateIndex
CREATE INDEX "profile_enhancements_profileSection_idx" ON "profile_enhancements"("profileSection");

-- CreateIndex
CREATE INDEX "experience_descriptions_userId_idx" ON "experience_descriptions"("userId");

-- CreateIndex
CREATE INDEX "skills_gap_analyses_userId_idx" ON "skills_gap_analyses"("userId");

-- CreateIndex
CREATE INDEX "skills_gap_analyses_targetJobId_idx" ON "skills_gap_analyses"("targetJobId");

-- CreateIndex
CREATE INDEX "cover_letters_userId_idx" ON "cover_letters"("userId");

-- CreateIndex
CREATE INDEX "cover_letters_jobId_idx" ON "cover_letters"("jobId");

-- CreateIndex
CREATE INDEX "interview_preps_userId_idx" ON "interview_preps"("userId");

-- CreateIndex
CREATE INDEX "interview_preps_jobId_idx" ON "interview_preps"("jobId");

-- CreateIndex
CREATE INDEX "salary_negotiation_advice_userId_idx" ON "salary_negotiation_advice"("userId");

-- CreateIndex
CREATE INDEX "salary_negotiation_advice_jobId_idx" ON "salary_negotiation_advice"("jobId");

-- CreateIndex
CREATE INDEX "career_path_advice_userId_idx" ON "career_path_advice"("userId");

-- CreateIndex
CREATE INDEX "learning_recommendations_userId_idx" ON "learning_recommendations"("userId");

-- CreateIndex
CREATE INDEX "learning_recommendations_jobId_idx" ON "learning_recommendations"("jobId");

-- CreateIndex
CREATE INDEX "application_insights_userId_idx" ON "application_insights"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "application_insights_applicationId_key" ON "application_insights"("applicationId");

-- CreateIndex
CREATE INDEX "portfolio_feedback_userId_idx" ON "portfolio_feedback"("userId");

-- CreateIndex
CREATE INDEX "parsed_documents_userId_idx" ON "parsed_documents"("userId");

-- CreateIndex
CREATE INDEX "parsed_documents_fileHash_idx" ON "parsed_documents"("fileHash");

-- CreateIndex
CREATE INDEX "skill_extractions_userId_idx" ON "skill_extractions"("userId");

-- CreateIndex
CREATE INDEX "skill_extractions_sourceType_sourceId_idx" ON "skill_extractions"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "semantic_search_index_userId_idx" ON "semantic_search_index"("userId");

-- CreateIndex
CREATE INDEX "semantic_search_index_entityType_idx" ON "semantic_search_index"("entityType");

-- CreateIndex
CREATE INDEX "semantic_search_index_status_idx" ON "semantic_search_index"("status");

-- CreateIndex
CREATE UNIQUE INDEX "semantic_search_index_entityType_entityId_key" ON "semantic_search_index"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "entity_recognitions_userId_idx" ON "entity_recognitions"("userId");

-- CreateIndex
CREATE INDEX "entity_recognitions_sourceType_sourceId_idx" ON "entity_recognitions"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "calendar_integrations_userId_idx" ON "calendar_integrations"("userId");

-- CreateIndex
CREATE INDEX "calendar_integrations_provider_idx" ON "calendar_integrations"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_integrations_userId_provider_email_key" ON "calendar_integrations"("userId", "provider", "email");

-- CreateIndex
CREATE INDEX "calendar_events_calendarId_idx" ON "calendar_events"("calendarId");

-- CreateIndex
CREATE INDEX "calendar_events_userId_idx" ON "calendar_events"("userId");

-- CreateIndex
CREATE INDEX "calendar_events_startTime_endTime_idx" ON "calendar_events"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "calendar_conflicts_userId_idx" ON "calendar_conflicts"("userId");

-- CreateIndex
CREATE INDEX "calendar_conflicts_status_idx" ON "calendar_conflicts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "buffer_time_settings_userId_key" ON "buffer_time_settings"("userId");

-- CreateIndex
CREATE INDEX "working_hours_userId_idx" ON "working_hours"("userId");

-- CreateIndex
CREATE INDEX "holiday_calendars_userId_idx" ON "holiday_calendars"("userId");

-- CreateIndex
CREATE INDEX "holiday_calendars_date_idx" ON "holiday_calendars"("date");

-- CreateIndex
CREATE INDEX "holiday_calendars_country_region_idx" ON "holiday_calendars"("country", "region");

-- CreateIndex
CREATE UNIQUE INDEX "scheduling_links_slug_key" ON "scheduling_links"("slug");

-- CreateIndex
CREATE INDEX "scheduling_links_userId_idx" ON "scheduling_links"("userId");

-- CreateIndex
CREATE INDEX "scheduling_links_slug_idx" ON "scheduling_links"("slug");

-- CreateIndex
CREATE INDEX "scheduling_bookings_linkId_idx" ON "scheduling_bookings"("linkId");

-- CreateIndex
CREATE INDEX "scheduling_bookings_bookerEmail_idx" ON "scheduling_bookings"("bookerEmail");

-- CreateIndex
CREATE INDEX "scheduling_bookings_startTime_idx" ON "scheduling_bookings"("startTime");

-- CreateIndex
CREATE INDEX "availability_slots_userId_date_idx" ON "availability_slots"("userId", "date");

-- CreateIndex
CREATE INDEX "availability_slots_status_idx" ON "availability_slots"("status");

-- CreateIndex
CREATE INDEX "panel_sessions_organizerId_idx" ON "panel_sessions"("organizerId");

-- CreateIndex
CREATE INDEX "panel_sessions_status_idx" ON "panel_sessions"("status");

-- CreateIndex
CREATE INDEX "panel_members_sessionId_idx" ON "panel_members"("sessionId");

-- CreateIndex
CREATE INDEX "panel_members_userId_idx" ON "panel_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "panel_members_sessionId_userId_key" ON "panel_members"("sessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "timezone_preferences_userId_key" ON "timezone_preferences"("userId");

-- CreateIndex
CREATE INDEX "reminder_schedules_userId_idx" ON "reminder_schedules"("userId");

-- CreateIndex
CREATE INDEX "reminder_schedules_isDefault_idx" ON "reminder_schedules"("isDefault");

-- CreateIndex
CREATE INDEX "reminder_schedules_isActive_idx" ON "reminder_schedules"("isActive");

-- CreateIndex
CREATE INDEX "notification_channels_userId_idx" ON "notification_channels"("userId");

-- CreateIndex
CREATE INDEX "notification_channels_channelType_idx" ON "notification_channels"("channelType");

-- CreateIndex
CREATE UNIQUE INDEX "notification_channels_userId_channelType_key" ON "notification_channels"("userId", "channelType");

-- CreateIndex
CREATE INDEX "reminder_notifications_userId_idx" ON "reminder_notifications"("userId");

-- CreateIndex
CREATE INDEX "reminder_notifications_interviewId_idx" ON "reminder_notifications"("interviewId");

-- CreateIndex
CREATE INDEX "reminder_notifications_status_idx" ON "reminder_notifications"("status");

-- CreateIndex
CREATE INDEX "reminder_notifications_scheduledFor_idx" ON "reminder_notifications"("scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "push_subscriptions_isActive_idx" ON "push_subscriptions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "confirmation_requests_token_key" ON "confirmation_requests"("token");

-- CreateIndex
CREATE INDEX "confirmation_requests_recipientId_idx" ON "confirmation_requests"("recipientId");

-- CreateIndex
CREATE INDEX "confirmation_requests_senderId_idx" ON "confirmation_requests"("senderId");

-- CreateIndex
CREATE INDEX "confirmation_requests_interviewId_idx" ON "confirmation_requests"("interviewId");

-- CreateIndex
CREATE INDEX "confirmation_requests_status_idx" ON "confirmation_requests"("status");

-- CreateIndex
CREATE INDEX "confirmation_requests_token_idx" ON "confirmation_requests"("token");

-- CreateIndex
CREATE INDEX "prep_materials_createdById_idx" ON "prep_materials"("createdById");

-- CreateIndex
CREATE INDEX "prep_materials_materialType_idx" ON "prep_materials"("materialType");

-- CreateIndex
CREATE INDEX "prep_materials_isActive_idx" ON "prep_materials"("isActive");

-- CreateIndex
CREATE INDEX "prep_material_deliveries_materialId_idx" ON "prep_material_deliveries"("materialId");

-- CreateIndex
CREATE INDEX "prep_material_deliveries_recipientId_idx" ON "prep_material_deliveries"("recipientId");

-- CreateIndex
CREATE INDEX "prep_material_deliveries_interviewId_idx" ON "prep_material_deliveries"("interviewId");

-- CreateIndex
CREATE INDEX "prep_material_deliveries_status_idx" ON "prep_material_deliveries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "prep_material_deliveries_materialId_recipientId_interviewId_key" ON "prep_material_deliveries"("materialId", "recipientId", "interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_screening_interviews_inviteToken_key" ON "ai_screening_interviews"("inviteToken");

-- CreateIndex
CREATE INDEX "ai_screening_interviews_candidateId_idx" ON "ai_screening_interviews"("candidateId");

-- CreateIndex
CREATE INDEX "ai_screening_interviews_jobId_idx" ON "ai_screening_interviews"("jobId");

-- CreateIndex
CREATE INDEX "ai_screening_interviews_status_idx" ON "ai_screening_interviews"("status");

-- CreateIndex
CREATE INDEX "ai_screening_interviews_inviteToken_idx" ON "ai_screening_interviews"("inviteToken");

-- CreateIndex
CREATE INDEX "question_flows_createdById_idx" ON "question_flows"("createdById");

-- CreateIndex
CREATE INDEX "question_flows_isActive_idx" ON "question_flows"("isActive");

-- CreateIndex
CREATE INDEX "question_flows_category_idx" ON "question_flows"("category");

-- CreateIndex
CREATE INDEX "screening_questions_flowId_idx" ON "screening_questions"("flowId");

-- CreateIndex
CREATE INDEX "screening_questions_orderIndex_idx" ON "screening_questions"("orderIndex");

-- CreateIndex
CREATE INDEX "screening_responses_interviewId_idx" ON "screening_responses"("interviewId");

-- CreateIndex
CREATE INDEX "screening_responses_questionId_idx" ON "screening_responses"("questionId");

-- CreateIndex
CREATE INDEX "screening_responses_userId_idx" ON "screening_responses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "screening_responses_interviewId_questionId_retakeNumber_key" ON "screening_responses"("interviewId", "questionId", "retakeNumber");

-- CreateIndex
CREATE INDEX "follow_up_rules_flowId_idx" ON "follow_up_rules"("flowId");

-- CreateIndex
CREATE INDEX "follow_up_rules_triggerQuestionId_idx" ON "follow_up_rules"("triggerQuestionId");

-- CreateIndex
CREATE INDEX "screening_templates_category_idx" ON "screening_templates"("category");

-- CreateIndex
CREATE INDEX "screening_templates_isActive_idx" ON "screening_templates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_accessibility_prefs_candidateId_key" ON "candidate_accessibility_prefs"("candidateId");

-- CreateIndex
CREATE INDEX "interview_transcriptions_interviewId_idx" ON "interview_transcriptions"("interviewId");

-- CreateIndex
CREATE INDEX "interview_transcriptions_status_idx" ON "interview_transcriptions"("status");

-- CreateIndex
CREATE INDEX "answer_analyses_interviewId_idx" ON "answer_analyses"("interviewId");

-- CreateIndex
CREATE INDEX "answer_analyses_overallScore_idx" ON "answer_analyses"("overallScore");

-- CreateIndex
CREATE INDEX "topic_detections_interviewId_idx" ON "topic_detections"("interviewId");

-- CreateIndex
CREATE INDEX "sentiment_analyses_interviewId_idx" ON "sentiment_analyses"("interviewId");

-- CreateIndex
CREATE INDEX "sentiment_analyses_overallSentiment_idx" ON "sentiment_analyses"("overallSentiment");

-- CreateIndex
CREATE INDEX "funnel_analytics_organizationId_idx" ON "funnel_analytics"("organizationId");

-- CreateIndex
CREATE INDEX "funnel_analytics_jobId_idx" ON "funnel_analytics"("jobId");

-- CreateIndex
CREATE INDEX "funnel_analytics_periodStart_periodEnd_idx" ON "funnel_analytics"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "time_to_hire_metrics_organizationId_idx" ON "time_to_hire_metrics"("organizationId");

-- CreateIndex
CREATE INDEX "time_to_hire_metrics_hireDate_idx" ON "time_to_hire_metrics"("hireDate");

-- CreateIndex
CREATE INDEX "time_to_hire_metrics_recruiterId_idx" ON "time_to_hire_metrics"("recruiterId");

-- CreateIndex
CREATE INDEX "cost_per_hire_metrics_organizationId_idx" ON "cost_per_hire_metrics"("organizationId");

-- CreateIndex
CREATE INDEX "cost_per_hire_metrics_hireDate_idx" ON "cost_per_hire_metrics"("hireDate");

-- CreateIndex
CREATE INDEX "source_effectiveness_organizationId_idx" ON "source_effectiveness"("organizationId");

-- CreateIndex
CREATE INDEX "source_effectiveness_sourceName_idx" ON "source_effectiveness"("sourceName");

-- CreateIndex
CREATE INDEX "source_effectiveness_periodStart_periodEnd_idx" ON "source_effectiveness"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "recruiter_performance_organizationId_idx" ON "recruiter_performance"("organizationId");

-- CreateIndex
CREATE INDEX "recruiter_performance_recruiterId_idx" ON "recruiter_performance"("recruiterId");

-- CreateIndex
CREATE INDEX "recruiter_performance_periodStart_periodEnd_idx" ON "recruiter_performance"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "offer_acceptance_metrics_organizationId_idx" ON "offer_acceptance_metrics"("organizationId");

-- CreateIndex
CREATE INDEX "offer_acceptance_metrics_status_idx" ON "offer_acceptance_metrics"("status");

-- CreateIndex
CREATE INDEX "offer_acceptance_metrics_offerDate_idx" ON "offer_acceptance_metrics"("offerDate");

-- CreateIndex
CREATE INDEX "pipeline_velocity_organizationId_idx" ON "pipeline_velocity"("organizationId");

-- CreateIndex
CREATE INDEX "pipeline_velocity_jobId_idx" ON "pipeline_velocity"("jobId");

-- CreateIndex
CREATE INDEX "pipeline_velocity_periodStart_periodEnd_idx" ON "pipeline_velocity"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "quality_of_hire_metrics_hireId_key" ON "quality_of_hire_metrics"("hireId");

-- CreateIndex
CREATE INDEX "quality_of_hire_metrics_organizationId_idx" ON "quality_of_hire_metrics"("organizationId");

-- CreateIndex
CREATE INDEX "quality_of_hire_metrics_hireDate_idx" ON "quality_of_hire_metrics"("hireDate");

-- CreateIndex
CREATE INDEX "quality_of_hire_metrics_recruiterId_idx" ON "quality_of_hire_metrics"("recruiterId");

-- CreateIndex
CREATE INDEX "diversity_analytics_organizationId_idx" ON "diversity_analytics"("organizationId");

-- CreateIndex
CREATE INDEX "diversity_analytics_periodStart_periodEnd_idx" ON "diversity_analytics"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "interview_offer_ratios_organizationId_idx" ON "interview_offer_ratios"("organizationId");

-- CreateIndex
CREATE INDEX "interview_offer_ratios_periodStart_periodEnd_idx" ON "interview_offer_ratios"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "drop_off_analysis_organizationId_idx" ON "drop_off_analysis"("organizationId");

-- CreateIndex
CREATE INDEX "drop_off_analysis_periodStart_periodEnd_idx" ON "drop_off_analysis"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "recruitment_slas_organizationId_idx" ON "recruitment_slas"("organizationId");

-- CreateIndex
CREATE INDEX "recruitment_slas_slaType_idx" ON "recruitment_slas"("slaType");

-- CreateIndex
CREATE INDEX "sla_tracking_organizationId_idx" ON "sla_tracking"("organizationId");

-- CreateIndex
CREATE INDEX "sla_tracking_slaId_idx" ON "sla_tracking"("slaId");

-- CreateIndex
CREATE INDEX "sla_tracking_periodStart_periodEnd_idx" ON "sla_tracking"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "executive_dashboards_organizationId_idx" ON "executive_dashboards"("organizationId");

-- CreateIndex
CREATE INDEX "executive_dashboards_createdBy_idx" ON "executive_dashboards"("createdBy");

-- CreateIndex
CREATE INDEX "trend_analyses_organizationId_idx" ON "trend_analyses"("organizationId");

-- CreateIndex
CREATE INDEX "trend_analyses_metricName_idx" ON "trend_analyses"("metricName");

-- CreateIndex
CREATE INDEX "trend_analyses_periodStart_periodEnd_idx" ON "trend_analyses"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "industry_benchmarks_industry_idx" ON "industry_benchmarks"("industry");

-- CreateIndex
CREATE INDEX "industry_benchmarks_metricName_idx" ON "industry_benchmarks"("metricName");

-- CreateIndex
CREATE INDEX "benchmark_comparisons_organizationId_idx" ON "benchmark_comparisons"("organizationId");

-- CreateIndex
CREATE INDEX "benchmark_comparisons_metricName_idx" ON "benchmark_comparisons"("metricName");

-- CreateIndex
CREATE INDEX "dashboard_widgets_organizationId_idx" ON "dashboard_widgets"("organizationId");

-- CreateIndex
CREATE INDEX "dashboard_widgets_dashboardId_idx" ON "dashboard_widgets"("dashboardId");

-- CreateIndex
CREATE INDEX "scheduled_reports_organizationId_idx" ON "scheduled_reports"("organizationId");

-- CreateIndex
CREATE INDEX "scheduled_reports_nextRunAt_idx" ON "scheduled_reports"("nextRunAt");

-- CreateIndex
CREATE INDEX "report_executions_scheduledReportId_idx" ON "report_executions"("scheduledReportId");

-- CreateIndex
CREATE INDEX "report_executions_executionTime_idx" ON "report_executions"("executionTime");

-- CreateIndex
CREATE INDEX "bi_export_configs_organizationId_idx" ON "bi_export_configs"("organizationId");

-- CreateIndex
CREATE INDEX "bi_export_configs_toolType_idx" ON "bi_export_configs"("toolType");

-- CreateIndex
CREATE INDEX "bi_export_logs_configId_idx" ON "bi_export_logs"("configId");

-- CreateIndex
CREATE INDEX "bi_export_logs_exportTime_idx" ON "bi_export_logs"("exportTime");

-- CreateIndex
CREATE INDEX "hiring_goals_organizationId_idx" ON "hiring_goals"("organizationId");

-- CreateIndex
CREATE INDEX "hiring_goals_status_idx" ON "hiring_goals"("status");

-- CreateIndex
CREATE INDEX "hiring_goals_periodEnd_idx" ON "hiring_goals"("periodEnd");

-- CreateIndex
CREATE INDEX "goal_progress_goalId_idx" ON "goal_progress"("goalId");

-- CreateIndex
CREATE INDEX "goal_progress_recordDate_idx" ON "goal_progress"("recordDate");

-- CreateIndex
CREATE INDEX "department_views_organizationId_idx" ON "department_views"("organizationId");

-- CreateIndex
CREATE INDEX "department_views_departmentId_idx" ON "department_views"("departmentId");

-- CreateIndex
CREATE INDEX "department_views_snapshotDate_idx" ON "department_views"("snapshotDate");

-- CreateIndex
CREATE INDEX "team_hiring_metrics_organizationId_idx" ON "team_hiring_metrics"("organizationId");

-- CreateIndex
CREATE INDEX "team_hiring_metrics_teamId_idx" ON "team_hiring_metrics"("teamId");

-- CreateIndex
CREATE INDEX "team_hiring_metrics_periodStart_periodEnd_idx" ON "team_hiring_metrics"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "salary_market_data_organizationId_idx" ON "salary_market_data"("organizationId");

-- CreateIndex
CREATE INDEX "salary_market_data_jobTitle_idx" ON "salary_market_data"("jobTitle");

-- CreateIndex
CREATE INDEX "salary_market_data_location_idx" ON "salary_market_data"("location");

-- CreateIndex
CREATE INDEX "salary_market_data_effectiveDate_idx" ON "salary_market_data"("effectiveDate");

-- CreateIndex
CREATE INDEX "talent_pool_analyses_organizationId_idx" ON "talent_pool_analyses"("organizationId");

-- CreateIndex
CREATE INDEX "talent_pool_analyses_status_idx" ON "talent_pool_analyses"("status");

-- CreateIndex
CREATE INDEX "talent_pool_analyses_analysisType_idx" ON "talent_pool_analyses"("analysisType");

-- CreateIndex
CREATE INDEX "competitor_insights_organizationId_idx" ON "competitor_insights"("organizationId");

-- CreateIndex
CREATE INDEX "competitor_insights_competitorName_idx" ON "competitor_insights"("competitorName");

-- CreateIndex
CREATE INDEX "competitor_insights_periodStart_periodEnd_idx" ON "competitor_insights"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "skill_demand_trends_organizationId_idx" ON "skill_demand_trends"("organizationId");

-- CreateIndex
CREATE INDEX "skill_demand_trends_skillName_idx" ON "skill_demand_trends"("skillName");

-- CreateIndex
CREATE INDEX "skill_demand_trends_skillCategory_idx" ON "skill_demand_trends"("skillCategory");

-- CreateIndex
CREATE INDEX "skill_demand_trends_periodStart_periodEnd_idx" ON "skill_demand_trends"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "location_intelligence_organizationId_idx" ON "location_intelligence"("organizationId");

-- CreateIndex
CREATE INDEX "location_intelligence_locationName_idx" ON "location_intelligence"("locationName");

-- CreateIndex
CREATE INDEX "location_intelligence_country_idx" ON "location_intelligence"("country");

-- CreateIndex
CREATE INDEX "location_intelligence_periodStart_periodEnd_idx" ON "location_intelligence"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "industry_trends_organizationId_idx" ON "industry_trends"("organizationId");

-- CreateIndex
CREATE INDEX "industry_trends_industryName_idx" ON "industry_trends"("industryName");

-- CreateIndex
CREATE INDEX "industry_trends_periodStart_periodEnd_idx" ON "industry_trends"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "market_intelligence_snapshots_organizationId_idx" ON "market_intelligence_snapshots"("organizationId");

-- CreateIndex
CREATE INDEX "market_intelligence_snapshots_snapshotDate_idx" ON "market_intelligence_snapshots"("snapshotDate");

-- CreateIndex
CREATE INDEX "market_intelligence_snapshots_snapshotType_idx" ON "market_intelligence_snapshots"("snapshotType");

-- CreateIndex
CREATE INDEX "hr_integrations_organizationId_idx" ON "hr_integrations"("organizationId");

-- CreateIndex
CREATE INDEX "hr_integrations_provider_idx" ON "hr_integrations"("provider");

-- CreateIndex
CREATE INDEX "hr_integrations_status_idx" ON "hr_integrations"("status");

-- CreateIndex
CREATE INDEX "hr_sync_logs_integrationId_idx" ON "hr_sync_logs"("integrationId");

-- CreateIndex
CREATE INDEX "hr_sync_logs_status_idx" ON "hr_sync_logs"("status");

-- CreateIndex
CREATE INDEX "hr_sync_logs_startedAt_idx" ON "hr_sync_logs"("startedAt");

-- CreateIndex
CREATE INDEX "communication_integrations_organizationId_idx" ON "communication_integrations"("organizationId");

-- CreateIndex
CREATE INDEX "communication_integrations_platform_idx" ON "communication_integrations"("platform");

-- CreateIndex
CREATE INDEX "communication_integrations_status_idx" ON "communication_integrations"("status");

-- CreateIndex
CREATE INDEX "message_templates_organizationId_idx" ON "message_templates"("organizationId");

-- CreateIndex
CREATE INDEX "message_templates_templateType_idx" ON "message_templates"("templateType");

-- CreateIndex
CREATE INDEX "message_templates_platform_idx" ON "message_templates"("platform");

-- CreateIndex
CREATE INDEX "job_board_integrations_organizationId_idx" ON "job_board_integrations"("organizationId");

-- CreateIndex
CREATE INDEX "job_board_integrations_platform_idx" ON "job_board_integrations"("platform");

-- CreateIndex
CREATE INDEX "job_board_integrations_status_idx" ON "job_board_integrations"("status");

-- CreateIndex
CREATE INDEX "job_board_postings_integrationId_idx" ON "job_board_postings"("integrationId");

-- CreateIndex
CREATE INDEX "job_board_postings_jobId_idx" ON "job_board_postings"("jobId");

-- CreateIndex
CREATE INDEX "job_board_postings_status_idx" ON "job_board_postings"("status");

-- CreateIndex
CREATE INDEX "job_board_postings_externalId_idx" ON "job_board_postings"("externalId");

-- CreateIndex
CREATE INDEX "api_keys_organizationId_idx" ON "api_keys"("organizationId");

-- CreateIndex
CREATE INDEX "api_keys_keyPrefix_idx" ON "api_keys"("keyPrefix");

-- CreateIndex
CREATE INDEX "api_keys_isActive_idx" ON "api_keys"("isActive");

-- CreateIndex
CREATE INDEX "webhook_configs_organizationId_idx" ON "webhook_configs"("organizationId");

-- CreateIndex
CREATE INDEX "webhook_configs_isActive_idx" ON "webhook_configs"("isActive");

-- CreateIndex
CREATE INDEX "webhook_deliveries_webhookId_idx" ON "webhook_deliveries"("webhookId");

-- CreateIndex
CREATE INDEX "webhook_deliveries_eventType_idx" ON "webhook_deliveries"("eventType");

-- CreateIndex
CREATE INDEX "webhook_deliveries_status_idx" ON "webhook_deliveries"("status");

-- CreateIndex
CREATE INDEX "webhook_deliveries_createdAt_idx" ON "webhook_deliveries"("createdAt");

-- CreateIndex
CREATE INDEX "automation_integrations_organizationId_idx" ON "automation_integrations"("organizationId");

-- CreateIndex
CREATE INDEX "automation_integrations_platform_idx" ON "automation_integrations"("platform");

-- CreateIndex
CREATE INDEX "automation_integrations_isActive_idx" ON "automation_integrations"("isActive");

-- CreateIndex
CREATE INDEX "api_usage_logs_organizationId_idx" ON "api_usage_logs"("organizationId");

-- CreateIndex
CREATE INDEX "api_usage_logs_apiKeyId_idx" ON "api_usage_logs"("apiKeyId");

-- CreateIndex
CREATE INDEX "api_usage_logs_endpoint_idx" ON "api_usage_logs"("endpoint");

-- CreateIndex
CREATE INDEX "api_usage_logs_timestamp_idx" ON "api_usage_logs"("timestamp");

-- CreateIndex
CREATE INDEX "workflow_automations_organizationId_idx" ON "workflow_automations"("organizationId");

-- CreateIndex
CREATE INDEX "workflow_automations_status_idx" ON "workflow_automations"("status");

-- CreateIndex
CREATE INDEX "workflow_automations_triggerType_idx" ON "workflow_automations"("triggerType");

-- CreateIndex
CREATE INDEX "workflow_automations_triggerEvent_idx" ON "workflow_automations"("triggerEvent");

-- CreateIndex
CREATE INDEX "workflow_automations_isActive_idx" ON "workflow_automations"("isActive");

-- CreateIndex
CREATE INDEX "workflow_executions_workflowId_idx" ON "workflow_executions"("workflowId");

-- CreateIndex
CREATE INDEX "workflow_executions_organizationId_idx" ON "workflow_executions"("organizationId");

-- CreateIndex
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");

-- CreateIndex
CREATE INDEX "workflow_executions_startedAt_idx" ON "workflow_executions"("startedAt");

-- CreateIndex
CREATE INDEX "workflow_templates_category_idx" ON "workflow_templates"("category");

-- CreateIndex
CREATE INDEX "workflow_templates_isPublic_idx" ON "workflow_templates"("isPublic");

-- CreateIndex
CREATE INDEX "workflow_templates_isFeatured_idx" ON "workflow_templates"("isFeatured");

-- CreateIndex
CREATE INDEX "scheduled_jobs_organizationId_idx" ON "scheduled_jobs"("organizationId");

-- CreateIndex
CREATE INDEX "scheduled_jobs_status_idx" ON "scheduled_jobs"("status");

-- CreateIndex
CREATE INDEX "scheduled_jobs_nextRunAt_idx" ON "scheduled_jobs"("nextRunAt");

-- CreateIndex
CREATE INDEX "scheduled_jobs_jobType_idx" ON "scheduled_jobs"("jobType");

-- CreateIndex
CREATE INDEX "bulk_actions_organizationId_idx" ON "bulk_actions"("organizationId");

-- CreateIndex
CREATE INDEX "bulk_actions_status_idx" ON "bulk_actions"("status");

-- CreateIndex
CREATE INDEX "bulk_actions_actionType_idx" ON "bulk_actions"("actionType");

-- CreateIndex
CREATE INDEX "bulk_actions_createdBy_idx" ON "bulk_actions"("createdBy");

-- CreateIndex
CREATE INDEX "approval_workflows_organizationId_idx" ON "approval_workflows"("organizationId");

-- CreateIndex
CREATE INDEX "approval_workflows_workflowType_idx" ON "approval_workflows"("workflowType");

-- CreateIndex
CREATE INDEX "approval_workflows_isActive_idx" ON "approval_workflows"("isActive");

-- CreateIndex
CREATE INDEX "approval_requests_workflowId_idx" ON "approval_requests"("workflowId");

-- CreateIndex
CREATE INDEX "approval_requests_organizationId_idx" ON "approval_requests"("organizationId");

-- CreateIndex
CREATE INDEX "approval_requests_status_idx" ON "approval_requests"("status");

-- CreateIndex
CREATE INDEX "approval_requests_requestedBy_idx" ON "approval_requests"("requestedBy");

-- CreateIndex
CREATE INDEX "approval_requests_requestType_idx" ON "approval_requests"("requestType");

-- CreateIndex
CREATE INDEX "approval_step_records_requestId_idx" ON "approval_step_records"("requestId");

-- CreateIndex
CREATE INDEX "approval_step_records_status_idx" ON "approval_step_records"("status");

-- CreateIndex
CREATE INDEX "approval_step_records_approverId_idx" ON "approval_step_records"("approverId");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_devices_deviceId_key" ON "mobile_devices"("deviceId");

-- CreateIndex
CREATE INDEX "mobile_devices_userId_idx" ON "mobile_devices"("userId");

-- CreateIndex
CREATE INDEX "mobile_devices_organizationId_idx" ON "mobile_devices"("organizationId");

-- CreateIndex
CREATE INDEX "mobile_devices_platform_idx" ON "mobile_devices"("platform");

-- CreateIndex
CREATE INDEX "mobile_devices_isActive_idx" ON "mobile_devices"("isActive");

-- CreateIndex
CREATE INDEX "push_notifications_userId_idx" ON "push_notifications"("userId");

-- CreateIndex
CREATE INDEX "push_notifications_deviceId_idx" ON "push_notifications"("deviceId");

-- CreateIndex
CREATE INDEX "push_notifications_status_idx" ON "push_notifications"("status");

-- CreateIndex
CREATE INDEX "push_notifications_notificationType_idx" ON "push_notifications"("notificationType");

-- CreateIndex
CREATE INDEX "push_notifications_scheduledFor_idx" ON "push_notifications"("scheduledFor");

-- CreateIndex
CREATE INDEX "mobile_app_configs_organizationId_idx" ON "mobile_app_configs"("organizationId");

-- CreateIndex
CREATE INDEX "mobile_app_configs_platform_idx" ON "mobile_app_configs"("platform");

-- CreateIndex
CREATE INDEX "offline_sync_queue_userId_idx" ON "offline_sync_queue"("userId");

-- CreateIndex
CREATE INDEX "offline_sync_queue_deviceId_idx" ON "offline_sync_queue"("deviceId");

-- CreateIndex
CREATE INDEX "offline_sync_queue_status_idx" ON "offline_sync_queue"("status");

-- CreateIndex
CREATE INDEX "offline_sync_queue_entityType_idx" ON "offline_sync_queue"("entityType");

-- CreateIndex
CREATE INDEX "pwa_configs_organizationId_idx" ON "pwa_configs"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "web_push_subscriptions_endpoint_key" ON "web_push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "web_push_subscriptions_userId_idx" ON "web_push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "web_push_subscriptions_organizationId_idx" ON "web_push_subscriptions"("organizationId");

-- CreateIndex
CREATE INDEX "web_push_subscriptions_isActive_idx" ON "web_push_subscriptions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "accessibility_settings_userId_key" ON "accessibility_settings"("userId");

-- CreateIndex
CREATE INDEX "accessibility_settings_organizationId_idx" ON "accessibility_settings"("organizationId");

-- CreateIndex
CREATE INDEX "accessibility_audits_organizationId_idx" ON "accessibility_audits"("organizationId");

-- CreateIndex
CREATE INDEX "accessibility_audits_pageUrl_idx" ON "accessibility_audits"("pageUrl");

-- CreateIndex
CREATE INDEX "accessibility_audits_auditDate_idx" ON "accessibility_audits"("auditDate");

-- CreateIndex
CREATE INDEX "accessibility_audits_score_idx" ON "accessibility_audits"("score");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "tenants_plan_idx" ON "tenants"("plan");

-- CreateIndex
CREATE INDEX "organizations_tenantId_idx" ON "organizations"("tenantId");

-- CreateIndex
CREATE INDEX "organizations_parentId_idx" ON "organizations"("parentId");

-- CreateIndex
CREATE INDEX "organizations_type_idx" ON "organizations"("type");

-- CreateIndex
CREATE INDEX "organizations_isActive_idx" ON "organizations"("isActive");

-- CreateIndex
CREATE INDEX "cost_centers_organizationId_idx" ON "cost_centers"("organizationId");

-- CreateIndex
CREATE INDEX "cost_centers_code_idx" ON "cost_centers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_organizationId_code_key" ON "cost_centers"("organizationId", "code");

-- CreateIndex
CREATE INDEX "departments_organizationId_idx" ON "departments"("organizationId");

-- CreateIndex
CREATE INDEX "departments_parentId_idx" ON "departments"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_organizationId_code_key" ON "departments"("organizationId", "code");

-- CreateIndex
CREATE INDEX "licenses_tenantId_idx" ON "licenses"("tenantId");

-- CreateIndex
CREATE INDEX "licenses_licenseType_idx" ON "licenses"("licenseType");

-- CreateIndex
CREATE INDEX "licenses_isActive_idx" ON "licenses"("isActive");

-- CreateIndex
CREATE INDEX "license_allocations_licenseId_idx" ON "license_allocations"("licenseId");

-- CreateIndex
CREATE INDEX "license_allocations_userId_idx" ON "license_allocations"("userId");

-- CreateIndex
CREATE INDEX "license_allocations_organizationId_idx" ON "license_allocations"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "license_allocations_licenseId_userId_key" ON "license_allocations"("licenseId", "userId");

-- CreateIndex
CREATE INDEX "role_templates_tenantId_idx" ON "role_templates"("tenantId");

-- CreateIndex
CREATE INDEX "role_templates_category_idx" ON "role_templates"("category");

-- CreateIndex
CREATE INDEX "role_templates_isSystem_idx" ON "role_templates"("isSystem");

-- CreateIndex
CREATE INDEX "custom_roles_tenantId_idx" ON "custom_roles"("tenantId");

-- CreateIndex
CREATE INDEX "custom_roles_organizationId_idx" ON "custom_roles"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_organizationId_name_key" ON "custom_roles"("organizationId", "name");

-- CreateIndex
CREATE INDEX "access_reviews_organizationId_idx" ON "access_reviews"("organizationId");

-- CreateIndex
CREATE INDEX "access_reviews_status_idx" ON "access_reviews"("status");

-- CreateIndex
CREATE INDEX "access_reviews_dueDate_idx" ON "access_reviews"("dueDate");

-- CreateIndex
CREATE INDEX "user_activity_logs_userId_idx" ON "user_activity_logs"("userId");

-- CreateIndex
CREATE INDEX "user_activity_logs_organizationId_idx" ON "user_activity_logs"("organizationId");

-- CreateIndex
CREATE INDEX "user_activity_logs_action_idx" ON "user_activity_logs"("action");

-- CreateIndex
CREATE INDEX "user_activity_logs_resourceType_idx" ON "user_activity_logs"("resourceType");

-- CreateIndex
CREATE INDEX "user_activity_logs_timestamp_idx" ON "user_activity_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_endorsements" ADD CONSTRAINT "skill_endorsements_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "candidate_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_versions" ADD CONSTRAINT "profile_versions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_profiles" ADD CONSTRAINT "github_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_repositories" ADD CONSTRAINT "github_repositories_githubProfileId_fkey" FOREIGN KEY ("githubProfileId") REFERENCES "github_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linkedin_profiles" ADD CONSTRAINT "linkedin_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stackoverflow_profiles" ADD CONSTRAINT "stackoverflow_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notion_portfolios" ADD CONSTRAINT "notion_portfolios_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gitlab_profiles" ADD CONSTRAINT "gitlab_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gitlab_projects" ADD CONSTRAINT "gitlab_projects_gitlabProfileId_fkey" FOREIGN KEY ("gitlabProfileId") REFERENCES "gitlab_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_portfolios" ADD CONSTRAINT "design_portfolios_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_platforms" ADD CONSTRAINT "blog_platforms_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kaggle_profiles" ADD CONSTRAINT "kaggle_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_platform_profiles" ADD CONSTRAINT "coding_platform_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_course_profiles" ADD CONSTRAINT "online_course_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_courses" ADD CONSTRAINT "online_courses_courseProfileId_fkey" FOREIGN KEY ("courseProfileId") REFERENCES "online_course_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_profiles" ADD CONSTRAINT "academic_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_academicProfileId_fkey" FOREIGN KEY ("academicProfileId") REFERENCES "academic_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_portfolio_links" ADD CONSTRAINT "custom_portfolio_links_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_domain_verifications" ADD CONSTRAINT "email_domain_verifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linkedin_employment_verifications" ADD CONSTRAINT "linkedin_employment_verifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_endorsements" ADD CONSTRAINT "peer_endorsements_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_references" ADD CONSTRAINT "manager_references_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_verifications" ADD CONSTRAINT "certification_verifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_scores" ADD CONSTRAINT "trust_scores_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_verifications" ADD CONSTRAINT "education_verifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verified_badges" ADD CONSTRAINT "verified_badges_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "coding_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "technical_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "technical_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "take_home_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_assessments" ADD CONSTRAINT "external_assessments_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soft_skill_questions" ADD CONSTRAINT "soft_skill_questions_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "soft_skills_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soft_skill_attempts" ADD CONSTRAINT "soft_skill_attempts_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "soft_skills_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "language_questions" ADD CONSTRAINT "language_questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "language_proficiency_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "language_test_attempts" ADD CONSTRAINT "language_test_attempts_testId_fkey" FOREIGN KEY ("testId") REFERENCES "language_proficiency_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_questions" ADD CONSTRAINT "domain_questions_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "domain_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_assessment_attempts" ADD CONSTRAINT "domain_assessment_attempts_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "domain_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_enhancements" ADD CONSTRAINT "profile_enhancements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_descriptions" ADD CONSTRAINT "experience_descriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills_gap_analyses" ADD CONSTRAINT "skills_gap_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_preps" ADD CONSTRAINT "interview_preps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_negotiation_advice" ADD CONSTRAINT "salary_negotiation_advice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_path_advice" ADD CONSTRAINT "career_path_advice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_recommendations" ADD CONSTRAINT "learning_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_recommendations" ADD CONSTRAINT "learning_recommendations_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_insights" ADD CONSTRAINT "application_insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_insights" ADD CONSTRAINT "application_insights_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_feedback" ADD CONSTRAINT "portfolio_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parsed_documents" ADD CONSTRAINT "parsed_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_extractions" ADD CONSTRAINT "skill_extractions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semantic_search_index" ADD CONSTRAINT "semantic_search_index_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_recognitions" ADD CONSTRAINT "entity_recognitions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_integrations" ADD CONSTRAINT "calendar_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "calendar_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_conflicts" ADD CONSTRAINT "calendar_conflicts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buffer_time_settings" ADD CONSTRAINT "buffer_time_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_calendars" ADD CONSTRAINT "holiday_calendars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_links" ADD CONSTRAINT "scheduling_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_bookings" ADD CONSTRAINT "scheduling_bookings_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "scheduling_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panel_sessions" ADD CONSTRAINT "panel_sessions_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panel_members" ADD CONSTRAINT "panel_members_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "panel_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panel_members" ADD CONSTRAINT "panel_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timezone_preferences" ADD CONSTRAINT "timezone_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_schedules" ADD CONSTRAINT "reminder_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_notifications" ADD CONSTRAINT "reminder_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_notifications" ADD CONSTRAINT "reminder_notifications_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_requests" ADD CONSTRAINT "confirmation_requests_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_requests" ADD CONSTRAINT "confirmation_requests_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmation_requests" ADD CONSTRAINT "confirmation_requests_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prep_materials" ADD CONSTRAINT "prep_materials_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prep_material_deliveries" ADD CONSTRAINT "prep_material_deliveries_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "prep_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prep_material_deliveries" ADD CONSTRAINT "prep_material_deliveries_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prep_material_deliveries" ADD CONSTRAINT "prep_material_deliveries_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_screening_interviews" ADD CONSTRAINT "ai_screening_interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_screening_interviews" ADD CONSTRAINT "ai_screening_interviews_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_screening_interviews" ADD CONSTRAINT "ai_screening_interviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_screening_interviews" ADD CONSTRAINT "ai_screening_interviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_screening_interviews" ADD CONSTRAINT "ai_screening_interviews_questionFlowId_fkey" FOREIGN KEY ("questionFlowId") REFERENCES "question_flows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_flows" ADD CONSTRAINT "question_flows_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_flows" ADD CONSTRAINT "question_flows_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_questions" ADD CONSTRAINT "screening_questions_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "question_flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_responses" ADD CONSTRAINT "screening_responses_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "ai_screening_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_responses" ADD CONSTRAINT "screening_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "screening_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_responses" ADD CONSTRAINT "screening_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_rules" ADD CONSTRAINT "follow_up_rules_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "question_flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_rules" ADD CONSTRAINT "follow_up_rules_triggerQuestionId_fkey" FOREIGN KEY ("triggerQuestionId") REFERENCES "screening_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_rules" ADD CONSTRAINT "follow_up_rules_followUpQuestionId_fkey" FOREIGN KEY ("followUpQuestionId") REFERENCES "screening_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_transcriptions" ADD CONSTRAINT "interview_transcriptions_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "ai_screening_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_analyses" ADD CONSTRAINT "answer_analyses_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "ai_screening_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_analyses" ADD CONSTRAINT "answer_analyses_transcriptionId_fkey" FOREIGN KEY ("transcriptionId") REFERENCES "interview_transcriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_detections" ADD CONSTRAINT "topic_detections_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "ai_screening_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_detections" ADD CONSTRAINT "topic_detections_transcriptionId_fkey" FOREIGN KEY ("transcriptionId") REFERENCES "interview_transcriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentiment_analyses" ADD CONSTRAINT "sentiment_analyses_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "ai_screening_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentiment_analyses" ADD CONSTRAINT "sentiment_analyses_transcriptionId_fkey" FOREIGN KEY ("transcriptionId") REFERENCES "interview_transcriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_sync_logs" ADD CONSTRAINT "hr_sync_logs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "hr_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_board_postings" ADD CONSTRAINT "job_board_postings_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "job_board_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "webhook_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_automations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "approval_workflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_allocations" ADD CONSTRAINT "license_allocations_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "licenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
