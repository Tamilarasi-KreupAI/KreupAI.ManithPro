export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN' | 'B2B' | 'BUSINESS_CLIENT' | 'BUSINESS_VENDOR';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';

export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

export type ApplicationStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'WITHDRAWN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
  education?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
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
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

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

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface DashboardStats {
  totalJobs?: number;
  openJobs?: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications?: number;
  recentApplications: Application[];
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
  job: Job;
}

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

// ============================================
// CV-LESS RECRUITMENT & RICH PROFILES TYPES
// ============================================

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export type SkillProficiencyLevel = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'APPRENTICESHIP' | 'SELF_EMPLOYED';

// 1.1.1 - Structured Profile Builder
export interface CandidateProfile {
  id: string;
  userId: string;

  // Professional Summary
  headline?: string;
  summary?: string;

  // Personal Information
  dateOfBirth?: string;
  nationality?: string;
  languages?: Array<{ language: string; proficiency: string }>;

  // Contact & Location
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  preferredLocation: string[];
  willingToRelocate: boolean;
  remotePreference?: 'remote' | 'hybrid' | 'onsite' | 'flexible';

  // Career Preferences
  expectedSalary?: number;
  expectedSalaryCurrency?: string;
  noticePeriod?: string;
  availableFrom?: string;
  jobTypes: string[];
  industries: string[];

  // Profile Completeness
  completenessScore: number;
  lastCompletedSection?: string;

  // Social Links
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  stackoverflow?: string;
  dribbble?: string;
  behance?: string;
  medium?: string;
  kaggle?: string;

  // Profile Settings
  isPublic: boolean;
  allowMessages: boolean;
  showSalaryExpectation: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  workExperiences?: WorkExperience[];
  educations?: Education[];
  certifications?: Certification[];
  skills?: CandidateSkill[];
  projects?: Project[];
  achievements?: Achievement[];
}

// 1.1.3 - Experience Timeline
export interface WorkExperience {
  id: string;
  profileId: string;

  // Company Information
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companySize?: string;
  industry?: string;

  // Role Information
  title: string;
  employmentType: EmploymentType;
  department?: string;

  // Location
  location?: string;
  isRemote: boolean;

  // Duration
  startDate: string;
  endDate?: string;
  isCurrent: boolean;

  // Details
  description?: string;
  responsibilities: string[];
  achievements: string[];

  // Technologies & Skills Used
  technologies: string[];
  skills: string[];

  // Verification
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verificationMethod?: string;
  referenceEmail?: string;

  // Metrics & Impact
  teamSize?: number;
  budget?: number;
  revenue?: number;

  // Display Order
  displayOrder: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// 1.1.4 - Education & Certifications Hub
export interface Education {
  id: string;
  profileId: string;

  // Institution
  institutionName: string;
  institutionLogo?: string;
  institutionWebsite?: string;
  institutionLocation?: string;
  institutionType?: 'university' | 'college' | 'online' | 'bootcamp';

  // Degree/Program
  degree: string;
  fieldOfStudy: string;
  specialization?: string;

  // Duration
  startDate: string;
  endDate?: string;
  isOngoing: boolean;

  // Academic Details
  grade?: string;
  gradeScale?: string;
  activities: string[];
  achievements: string[];

  // Projects & Thesis
  thesis?: string;
  thesisDescription?: string;
  courseProjects?: Array<{ name: string; description: string; technologies: string[] }>;

  // Verification
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verificationMethod?: string;
  certificateUrl?: string;

  // Display Order
  displayOrder: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  profileId: string;

  // Certification Details
  name: string;
  issuingOrganization: string;
  organizationLogo?: string;
  organizationWebsite?: string;

  // Credential
  credentialId?: string;
  credentialUrl?: string;

  // Duration
  issueDate: string;
  expirationDate?: string;
  doesNotExpire: boolean;

  // Details
  description?: string;
  skills: string[];

  // Verification
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verificationMethod?: string;

  // Display Order
  displayOrder: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// 1.1.2 - Dynamic Skills Matrix
export interface CandidateSkill {
  id: string;
  profileId: string;

  // Skill Information
  name: string;
  category?: string;
  subcategory?: string;

  // Proficiency
  proficiencyLevel: number;
  proficiencyLabel: SkillProficiencyLevel;
  yearsOfExperience?: number;

  // Last Used
  lastUsed?: string;

  // Evidence
  projects: string[];
  certifications: string[];

  // Verification & Endorsements
  isVerified: boolean;
  verifiedAt?: string;
  verificationMethod?: string;
  endorsementCount: number;

  // Tags
  tags: string[];

  // Display Order
  isPrimary: boolean;
  displayOrder: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  endorsements?: SkillEndorsement[];
}

export interface SkillEndorsement {
  id: string;
  skillId: string;

  // Endorser Information
  endorserId: string;
  endorserName: string;
  endorserTitle?: string;
  endorserCompany?: string;
  endorserLinkedin?: string;
  relationship?: 'colleague' | 'manager' | 'client' | 'mentor';

  // Endorsement Details
  comment?: string;
  rating?: number;

  // Verification
  isVerified: boolean;
  verifiedAt?: string;

  // Timestamps
  createdAt: string;
}

// 1.1.5 - Project Portfolio
export interface Project {
  id: string;
  profileId: string;

  // Project Information
  title: string;
  shortDescription?: string;
  description?: string;

  // Project Type & Status
  projectType?: 'personal' | 'professional' | 'open-source' | 'freelance' | 'academic';
  status?: 'completed' | 'in-progress' | 'on-hold' | 'archived';

  // Duration
  startDate?: string;
  endDate?: string;
  isOngoing: boolean;

  // Technical Details
  technologies: string[];
  frameworks: string[];
  languages: string[];
  tools: string[];

  // Links
  repositoryUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  documentationUrl?: string;

  // Media
  thumbnailUrl?: string;
  images: string[];
  videos: string[];

  // Role & Team
  role?: string;
  teamSize?: number;
  contributions: string[];

  // Impact & Metrics
  impact?: string;
  users?: number;
  downloads?: number;
  stars?: number;
  forks?: number;

  // Associated Work Experience
  workExperienceId?: string;

  // Visibility
  isPublic: boolean;
  isFeatured: boolean;

  // Display Order
  displayOrder: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Achievement Badges System
export interface Achievement {
  id: string;
  profileId: string;

  // Achievement Details
  title: string;
  description?: string;
  type: 'profile' | 'activity' | 'skill' | 'milestone';
  category?: string;

  // Badge Information
  badgeIcon?: string;
  badgeColor?: string;
  points: number;

  // Progress
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;

  // Timestamps
  earnedAt?: string;
  createdAt: string;
}

// Profile Completeness
export interface ProfileCompleteness {
  score: number;
  sections: {
    basicInfo: {
      completed: boolean;
      weight: number;
      items: {
        headline: boolean;
        summary: boolean;
        location: boolean;
      };
    };
    workExperience: {
      completed: boolean;
      weight: number;
      count: number;
    };
    education: {
      completed: boolean;
      weight: number;
      count: number;
    };
    skills: {
      completed: boolean;
      weight: number;
      count: number;
    };
    projects: {
      completed: boolean;
      weight: number;
      count: number;
    };
    certifications: {
      completed: boolean;
      weight: number;
      count: number;
    };
    socialLinks: {
      completed: boolean;
      weight: number;
      items: {
        github: boolean;
        linkedin: boolean;
        website: boolean;
      };
    };
  };
  suggestions: string[];
}

// Skills Matrix
export interface SkillsMatrix {
  matrix: Record<string, CandidateSkill[]>;
  summary: {
    total: number;
    byProficiency: {
      beginner: number;
      elementary: number;
      intermediate: number;
      advanced: number;
      expert: number;
    };
    primarySkills: CandidateSkill[];
    totalEndorsements: number;
  };
}

// Experience Timeline Summary
export interface ExperienceTimelineSummary {
  experiences: WorkExperience[];
  summary: {
    totalExperiences: number;
    totalYears: number;
    totalMonths: number;
    totalExperienceString: string;
  };
}

// Portfolio Summary
export interface PortfolioSummary {
  projects: Project[];
  summary: {
    total: number;
    featured: number;
    byType: {
      personal: number;
      professional: number;
      openSource: number;
      freelance: number;
      academic: number;
    };
    technologies: string[];
  };
}

// ============================================
// BATCH 2: ACHIEVEMENTS, VERSIONING, INTEGRATIONS
// ============================================

// Integration Status
export type IntegrationStatus = 'PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'EXPIRED';

// 1.1.6 - Achievement Badges System
export interface AchievementDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  category: 'profile' | 'activity' | 'skill' | 'social' | 'milestone';
  type: 'one_time' | 'progressive' | 'repeatable';
  criteria: Record<string, any>;
  targetValue: number;
  points: number;
  badgeIcon?: string;
  badgeColor?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  isPublic: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  profileId: string;
  title: string;
  description?: string;
  type: string;
  category: string;
  badgeIcon?: string;
  badgeColor?: string;
  points: number;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  earnedAt?: string;
  createdAt: string;
}

export interface AchievementStats {
  totalPoints: number;
  maxPossiblePoints: number;
  progressPercentage: number;
  earnedCount: number;
  totalAvailable: number;
  byCategory: Record<string, { total: number; earned: number; points: number }>;
  tierDistribution: {
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
  };
  recentAchievements: Achievement[];
}

export interface AchievementLeaderboardEntry {
  userId: string;
  name: string;
  headline?: string;
  totalPoints: number;
  achievementCount: number;
}

// 1.1.8 - Profile Versioning
export interface ProfileVersion {
  id: string;
  profileId: string;
  versionNumber: number;
  versionLabel?: string;
  profileSnapshot: Record<string, any>;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
    type: 'add' | 'update' | 'remove';
  }[];
  changeSummary?: string;
  createdBy?: 'user' | 'system' | 'import';
  createdAt: string;
  isFirst?: boolean;
  isLatest?: boolean;
  changeCount?: number;
}

export interface VersionComparison {
  version1: {
    id: string;
    versionNumber: number;
    versionLabel?: string;
    createdAt: string;
  };
  version2: {
    id: string;
    versionNumber: number;
    versionLabel?: string;
    createdAt: string;
  };
  changes: ProfileVersion['changes'];
  summary: string;
}

// 1.2.1 - GitHub Integration
export interface GithubProfile {
  id: string;
  profileId: string;
  githubId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  profileUrl: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  email?: string;
  publicRepos: number;
  privateRepos: number;
  totalStars: number;
  followers: number;
  following: number;
  gists: number;
  totalContributions: number;
  contributionsLastYear: number;
  longestStreak: number;
  currentStreak: number;
  topLanguages?: { name: string; percentage: number; bytes: number }[];
  pinnedRepos?: GithubRepository[];
  recentActivity?: any[];
  contributionGraph?: any;
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  connectedAt: string;
  updatedAt: string;
  repositories?: GithubRepository[];
}

export interface GithubRepository {
  id: string;
  githubProfileId: string;
  repoId: string;
  name: string;
  fullName: string;
  description?: string;
  language?: string;
  languages?: { name: string; bytes: number }[];
  htmlUrl: string;
  cloneUrl?: string;
  homepage?: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  size: number;
  hasWiki: boolean;
  hasPages: boolean;
  hasProjects: boolean;
  hasDiscussions: boolean;
  topics: string[];
  isForked: boolean;
  isFork: boolean;
  isArchived: boolean;
  isPrivate: boolean;
  contributionCount: number;
  lastContributionAt?: string;
  role?: 'owner' | 'maintainer' | 'contributor';
  isShowcased: boolean;
  isPinned: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  pushedAt?: string;
}

// 1.2.2 - LinkedIn Integration
export interface LinkedInProfile {
  id: string;
  profileId: string;
  linkedInId: string;
  vanityName?: string;
  profileUrl: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  profilePicture?: string;
  backgroundImage?: string;
  location?: string;
  country?: string;
  currentCompany?: string;
  currentTitle?: string;
  industry?: string;
  connections: number;
  followersCount: number;
  positions?: LinkedInPosition[];
  education?: LinkedInEducation[];
  certifications?: LinkedInCertification[];
  skills?: LinkedInSkill[];
  recommendations?: any[];
  honors?: any[];
  publications?: any[];
  patents?: any[];
  courses?: any[];
  projects?: any[];
  volunteerExperiences?: any[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  importWorkHistory: boolean;
  importEducation: boolean;
  importSkills: boolean;
  importCertifications: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  connectedAt: string;
  updatedAt: string;
}

export interface LinkedInPosition {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface LinkedInEducation {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
}

export interface LinkedInCertification {
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface LinkedInSkill {
  name: string;
  endorsements: number;
}

// Integration Status Response
export interface IntegrationStatusResponse {
  github: {
    connected: boolean;
    id?: string;
    username?: string;
    status?: IntegrationStatus;
    lastSyncAt?: string;
    syncError?: string;
  };
  linkedin: {
    connected: boolean;
    id?: string;
    firstName?: string;
    lastName?: string;
    status?: IntegrationStatus;
    lastSyncAt?: string;
    syncError?: string;
    isVerified?: boolean;
  };
}

// ============================================
// BATCH 3: ADDITIONAL INTEGRATIONS
// ============================================

// 1.2.3 - Stack Overflow Integration
export interface StackOverflowProfile {
  id: string;
  profileId: string;
  stackOverflowId: string;
  displayName: string;
  profileUrl: string;
  avatarUrl?: string;
  websiteUrl?: string;
  location?: string;
  aboutMe?: string;
  reputation: number;
  reputationChangeYear: number;
  reputationChangeQuarter: number;
  reputationChangeMonth: number;
  reputationChangeWeek: number;
  reputationChangeDay: number;
  badges: {
    gold: number;
    silver: number;
    bronze: number;
  };
  questionCount: number;
  answerCount: number;
  acceptedAnswerCount: number;
  acceptRate?: number;
  topTags: StackOverflowTag[];
  recentAnswers?: StackOverflowAnswer[];
  recentQuestions?: StackOverflowQuestion[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  showOnProfile: boolean;
  connectedAt: string;
  updatedAt: string;
}

export interface StackOverflowTag {
  name: string;
  count: number;
  score: number;
  isTopTag: boolean;
}

export interface StackOverflowAnswer {
  id: string;
  questionId: string;
  questionTitle: string;
  score: number;
  isAccepted: boolean;
  createdAt: string;
  url: string;
}

export interface StackOverflowQuestion {
  id: string;
  title: string;
  score: number;
  answerCount: number;
  isAnswered: boolean;
  viewCount: number;
  tags: string[];
  createdAt: string;
  url: string;
}

// 1.2.4 - Notion Portfolio Import
export interface NotionPortfolio {
  id: string;
  profileId: string;
  workspaceId: string;
  workspaceName?: string;
  workspaceIcon?: string;
  accessToken?: string;
  pages: NotionPage[];
  databases: NotionDatabase[];
  importedProjects: NotionProject[];
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  status: IntegrationStatus;
  connectedAt: string;
  updatedAt: string;
}

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  icon?: string;
  cover?: string;
  lastEditedAt: string;
  isImported: boolean;
  importedAsType?: 'project' | 'case_study' | 'article';
}

export interface NotionDatabase {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;
  itemCount: number;
  lastEditedAt: string;
}

export interface NotionProject {
  id: string;
  notionPageId: string;
  title: string;
  description?: string;
  status?: string;
  technologies: string[];
  url?: string;
  thumbnailUrl?: string;
  importedAt: string;
}

// 1.2.5 - GitLab Integration
export interface GitLabProfile {
  id: string;
  profileId: string;
  gitLabId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  profileUrl: string;
  bio?: string;
  location?: string;
  website?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  publicRepos: number;
  privateRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  totalMergeRequests: number;
  totalIssues: number;
  totalContributions: number;
  contributionsLastYear: number;
  contributionGraph?: any;
  topLanguages?: GitLabLanguage[];
  projects?: GitLabProject[];
  groups?: GitLabGroup[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  connectedAt: string;
  updatedAt: string;
}

export interface GitLabLanguage {
  name: string;
  percentage: number;
  bytes: number;
}

export interface GitLabProject {
  id: string;
  gitLabProfileId: string;
  projectId: string;
  name: string;
  nameWithNamespace: string;
  path: string;
  pathWithNamespace: string;
  description?: string;
  visibility: 'public' | 'internal' | 'private';
  webUrl: string;
  httpUrlToRepo?: string;
  avatarUrl?: string;
  readmeUrl?: string;
  defaultBranch?: string;
  topics: string[];
  languages?: GitLabLanguage[];
  stars: number;
  forks: number;
  openIssuesCount: number;
  openMergeRequestsCount: number;
  pipelinesEnabled: boolean;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isForked: boolean;
  isMirror: boolean;
  role?: 'owner' | 'maintainer' | 'developer' | 'reporter' | 'guest';
  isShowcased: boolean;
  displayOrder: number;
}

export interface GitLabGroup {
  id: string;
  name: string;
  path: string;
  description?: string;
  visibility: string;
  webUrl: string;
  avatarUrl?: string;
  projectCount: number;
  memberCount: number;
}

// 1.2.6 - Behance/Dribbble Integration
export type DesignPlatformType = 'behance' | 'dribbble';

export interface DesignPortfolio {
  id: string;
  profileId: string;
  platform: DesignPlatformType;
  platformUserId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  profileUrl: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  specializations: string[];
  followers: number;
  following: number;
  projectsCount: number;
  appreciations: number;
  views: number;
  likes: number;
  comments: number;
  teams?: string[];
  fields?: string[];
  projects?: DesignProject[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  showOnProfile: boolean;
  connectedAt: string;
  updatedAt: string;
}

export interface DesignProject {
  id: string;
  designPortfolioId: string;
  projectId: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  images: DesignProjectImage[];
  fields: string[];
  tools: string[];
  tags: string[];
  colors?: string[];
  views: number;
  appreciations: number;
  likes: number;
  comments: number;
  publishedAt: string;
  modifiedAt?: string;
  isFeatured: boolean;
  isShowcased: boolean;
  displayOrder: number;
}

export interface DesignProjectImage {
  url: string;
  width: number;
  height: number;
  caption?: string;
}

// 1.2.7 - Medium/Dev.to Integration
export type BlogPlatformType = 'medium' | 'devto' | 'hashnode';

export interface BlogPlatform {
  id: string;
  profileId: string;
  platform: BlogPlatformType;
  platformUserId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  profileUrl: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  totalReactions: number;
  totalViews: number;
  totalComments: number;
  topTags: BlogTag[];
  featuredPost?: BlogPost;
  recentPosts: BlogPost[];
  publications?: BlogPublication[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  showOnProfile: boolean;
  connectedAt: string;
  updatedAt: string;
}

export interface BlogTag {
  name: string;
  count: number;
}

export interface BlogPost {
  id: string;
  blogPlatformId: string;
  postId: string;
  title: string;
  slug: string;
  url: string;
  excerpt?: string;
  coverImage?: string;
  content?: string;
  tags: string[];
  readingTime: number;
  reactions: number;
  comments: number;
  views: number;
  isPublished: boolean;
  isFeatured: boolean;
  isShowcased: boolean;
  publishedAt: string;
  updatedAt?: string;
  displayOrder: number;
}

export interface BlogPublication {
  id: string;
  name: string;
  description?: string;
  url: string;
  imageUrl?: string;
  followerCount: number;
}

// ============================================
// BATCH 4: KAGGLE, CODING PLATFORMS, COURSES, ACADEMIC, PORTFOLIO LINKS
// ============================================

// 1.2.8 - Kaggle Integration
export type KaggleTier = 'Grandmaster' | 'Master' | 'Expert' | 'Contributor' | 'Novice';

export interface KaggleProfile {
  id: string;
  profileId: string;
  kaggleId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  profileUrl: string;
  bio?: string;
  location?: string;
  occupation?: string;
  organization?: string;
  tier?: KaggleTier;
  competitionTier?: string;
  datasetTier?: string;
  notebookTier?: string;
  discussionTier?: string;
  competitionRanking?: number;
  datasetRanking?: number;
  notebookRanking?: number;
  discussionRanking?: number;
  competitionCount: number;
  datasetCount: number;
  notebookCount: number;
  discussionCount: number;
  totalMedals: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  achievements?: any[];
  topCompetitions?: KaggleCompetition[];
  featuredNotebooks?: KaggleNotebook[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  showOnProfile: boolean;
  connectedAt: string;
  updatedAt: string;
}

export interface KaggleCompetition {
  id: string;
  name: string;
  url: string;
  rank: number;
  totalTeams: number;
  medal?: 'gold' | 'silver' | 'bronze';
  date: string;
}

export interface KaggleNotebook {
  id: string;
  title: string;
  url: string;
  votes: number;
  comments: number;
  views: number;
  language: string;
}

// 1.2.9 - LeetCode/HackerRank Integration
export type CodingPlatformType = 'leetcode' | 'hackerrank' | 'codeforces' | 'codechef';

export interface CodingPlatformProfile {
  id: string;
  profileId: string;
  platform: CodingPlatformType;
  platformUserId: string;
  username: string;
  displayName?: string;
  profileUrl: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  globalRank?: number;
  countryRank?: number;
  rating?: number;
  maxRating?: number;
  percentile?: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate?: number;
  totalSubmissions: number;
  contestsAttended: number;
  badges?: CodingBadge[];
  totalBadges: number;
  currentStreak: number;
  maxStreak: number;
  totalActiveDays: number;
  languageStats?: LanguageStat[];
  topSkills?: CodingSkill[];
  recentSubmissions?: Submission[];
  contestHistory?: Contest[];
  hackerRankCertificates?: Certificate[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  showOnProfile: boolean;
  connectedAt: string;
  updatedAt: string;
}

export interface CodingBadge {
  name: string;
  icon?: string;
  description?: string;
  earnedAt?: string;
}

export interface LanguageStat {
  language: string;
  problemsSolved: number;
  percentage: number;
}

export interface CodingSkill {
  skill: string;
  problemsSolved: number;
  beats: number;
}

export interface Submission {
  id: string;
  problemTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  runtime: string;
  memory: string;
  submittedAt: string;
}

export interface Contest {
  id: string;
  name: string;
  rank: number;
  totalParticipants: number;
  rating?: number;
  ratingChange?: number;
  date: string;
}

export interface Certificate {
  id: string;
  name: string;
  skill: string;
  level?: string;
  url: string;
  earnedAt: string;
}

// 1.2.10 - Online Courses
export type OnlineCoursePlatform = 'coursera' | 'udemy' | 'edx' | 'pluralsight' | 'linkedin_learning';

export interface OnlineCourseProfile {
  id: string;
  profileId: string;
  platform: OnlineCoursePlatform;
  platformUserId?: string;
  username?: string;
  displayName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  totalCourses: number;
  completedCourses: number;
  totalHours?: number;
  certificationsEarned: number;
  specializations?: Specialization[];
  courses?: OnlineCourse[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  showOnProfile: boolean;
  connectedAt: string;
  updatedAt: string;
}

export interface Specialization {
  id: string;
  name: string;
  provider: string;
  completedAt: string;
  certificateUrl?: string;
}

export interface OnlineCourse {
  id: string;
  courseProfileId: string;
  courseId: string;
  title: string;
  description?: string;
  provider?: string;
  platformCourseUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  subcategory?: string;
  duration?: string;
  durationHours?: number;
  startDate?: string;
  completionDate?: string;
  progress?: number;
  isCompleted: boolean;
  grade?: string;
  gradeNumeric?: number;
  hasCertificate: boolean;
  certificateId?: string;
  certificateUrl?: string;
  certificateImageUrl?: string;
  skills: string[];
  topics: string[];
  verificationStatus: VerificationStatus;
  isShowcased: boolean;
  displayOrder: number;
}

// 1.2.11 - Academic Profiles
export type AcademicPlatform = 'google_scholar' | 'researchgate' | 'orcid' | 'academia';

export interface AcademicProfile {
  id: string;
  profileId: string;
  platform: AcademicPlatform;
  platformUserId: string;
  profileUrl: string;
  avatarUrl?: string;
  displayName?: string;
  affiliation?: string;
  department?: string;
  position?: string;
  email?: string;
  website?: string;
  bio?: string;
  totalPublications: number;
  totalCitations: number;
  hIndex?: number;
  i10Index?: number;
  citationsLastYear?: number;
  researchInterests: string[];
  keywords: string[];
  coAuthors?: CoAuthor[];
  featuredPublications?: Publication[];
  publications?: Publication[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  showOnProfile: boolean;
  connectedAt: string;
  updatedAt: string;
}

export interface CoAuthor {
  name: string;
  affiliation?: string;
  collaborations: number;
  profileUrl?: string;
}

export interface Publication {
  id: string;
  academicProfileId: string;
  publicationId: string;
  title: string;
  abstract?: string;
  publicationType?: 'journal' | 'conference' | 'preprint' | 'book' | 'thesis';
  venue?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year?: number;
  doi?: string;
  arxivId?: string;
  pubmedId?: string;
  url?: string;
  pdfUrl?: string;
  authors: string[];
  authorPosition?: number;
  citations: number;
  citationsLastYear?: number;
  keywords: string[];
  topics: string[];
  verificationStatus: VerificationStatus;
  isFeatured: boolean;
  isShowcased: boolean;
  displayOrder: number;
  publishedAt?: string;
}

// 1.2.12 - Custom Portfolio Links
export type PortfolioLinkType = 'portfolio' | 'project' | 'blog' | 'social' | 'video' | 'document' | 'other';

export interface CustomPortfolioLink {
  id: string;
  profileId: string;
  title: string;
  url: string;
  description?: string;
  linkType?: PortfolioLinkType;
  platform?: string;
  siteName?: string;
  favicon?: string;
  thumbnailUrl?: string;
  previewImage?: string;
  metaDescription?: string;
  metaKeywords: string[];
  embedUrl?: string;
  duration?: string;
  viewCount?: number;
  tags: string[];
  category?: string;
  isPublic: boolean;
  isFeatured: boolean;
  showPreview: boolean;
  displayOrder: number;
  isVerified: boolean;
  verifiedAt?: string;
  lastCheckedAt?: string;
  isAccessible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Batch 4 Integrations Status Response
export interface Batch4IntegrationsStatus {
  kaggle: {
    connected: boolean;
    id?: string;
    username?: string;
    tier?: string;
    status?: IntegrationStatus;
  };
  codingPlatforms: {
    leetcode?: {
      connected: boolean;
      id?: string;
      username?: string;
      totalSolved?: number;
    };
    hackerrank?: {
      connected: boolean;
      id?: string;
      username?: string;
      totalSolved?: number;
    };
    codeforces?: {
      connected: boolean;
      id?: string;
      username?: string;
      rating?: number;
    };
  };
  onlineCourses: {
    coursera?: {
      connected: boolean;
      id?: string;
      completedCourses?: number;
    };
    udemy?: {
      connected: boolean;
      id?: string;
      completedCourses?: number;
    };
  };
  academic: {
    googleScholar?: {
      connected: boolean;
      id?: string;
      totalPublications?: number;
      citations?: number;
    };
    researchgate?: {
      connected: boolean;
      id?: string;
      totalPublications?: number;
    };
  };
  portfolioLinks: {
    count: number;
    featuredCount: number;
  };
}

// Extended Integration Status Response (with all integrations)
export interface AllIntegrationsStatusResponse extends IntegrationStatusResponse {
  stackoverflow: {
    connected: boolean;
    id?: string;
    displayName?: string;
    reputation?: number;
    status?: IntegrationStatus;
    lastSyncAt?: string;
    syncError?: string;
  };
  notion: {
    connected: boolean;
    id?: string;
    workspaceName?: string;
    pageCount?: number;
    status?: IntegrationStatus;
    lastSyncAt?: string;
    syncError?: string;
  };
  gitlab: {
    connected: boolean;
    id?: string;
    username?: string;
    status?: IntegrationStatus;
    lastSyncAt?: string;
    syncError?: string;
  };
  design: {
    behance?: {
      connected: boolean;
      id?: string;
      username?: string;
      projectsCount?: number;
      status?: IntegrationStatus;
      lastSyncAt?: string;
      syncError?: string;
    };
    dribbble?: {
      connected: boolean;
      id?: string;
      username?: string;
      projectsCount?: number;
      status?: IntegrationStatus;
      lastSyncAt?: string;
      syncError?: string;
    };
  };
  blog: {
    medium?: {
      connected: boolean;
      id?: string;
      username?: string;
      postsCount?: number;
      status?: IntegrationStatus;
      lastSyncAt?: string;
      syncError?: string;
    };
    devto?: {
      connected: boolean;
      id?: string;
      username?: string;
      postsCount?: number;
      status?: IntegrationStatus;
      lastSyncAt?: string;
      syncError?: string;
    };
    hashnode?: {
      connected: boolean;
      id?: string;
      username?: string;
      postsCount?: number;
      status?: IntegrationStatus;
      lastSyncAt?: string;
      syncError?: string;
    };
  };
}

// ============================================
// BATCH 5: VERIFICATION & TRUST SYSTEM TYPES (Features 1.3.1-1.3.5)
// ============================================

// Verification Request Status
export type VerificationRequestStatus = 'PENDING' | 'SENT' | 'COMPLETED' | 'EXPIRED' | 'DECLINED' | 'FAILED';

// Reference Request Status
export type ReferenceRequestStatus = 'PENDING' | 'SENT' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED' | 'EXPIRED';

// Endorsement Request Status
export type EndorsementRequestStatus = 'PENDING' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

// Trust Score Tier
export type TrustScoreTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'unverified';

// Relationship types for endorsements
export type EndorserRelationship = 'colleague' | 'manager' | 'direct_report' | 'client' | 'mentor' | 'mentee';

// Reference relationship types
export type ReferenceRelationship = 'direct_manager' | 'skip_level_manager' | 'hr' | 'team_lead' | 'cto' | 'ceo';

// 1.3.1 - Email Domain Verification
export interface EmailDomainVerification {
  id: string;
  profileId: string;
  workExperienceId?: string;
  workEmail: string;
  emailDomain: string;
  companyName: string;
  verificationCode?: string;
  verificationToken?: string;
  verificationStatus: VerificationRequestStatus;
  isVerified: boolean;
  verifiedAt?: string;
  verificationMethod?: string;
  verificationAttempts: number;
  maxAttempts: number;
  domainInfo?: {
    companyName?: string;
    industry?: string;
    size?: string;
    website?: string;
  };
  mxRecordValid?: boolean;
  domainCreatedAt?: string;
  expiresAt?: string;
  codeSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 1.3.2 - LinkedIn Employment Verification
export interface LinkedInEmploymentVerification {
  id: string;
  profileId: string;
  workExperienceId: string;
  linkedInProfileId?: string;
  claimedCompanyName: string;
  claimedTitle: string;
  claimedStartDate: string;
  claimedEndDate?: string;
  claimedIsCurrent: boolean;
  linkedInCompanyName?: string;
  linkedInTitle?: string;
  linkedInStartDate?: string;
  linkedInEndDate?: string;
  linkedInIsCurrent?: boolean;
  companyNameMatch?: 'exact' | 'partial' | 'no_match' | 'not_found';
  titleMatch?: 'exact' | 'partial' | 'no_match' | 'not_found';
  dateMatch?: 'exact' | 'approximate' | 'no_match' | 'not_found';
  overallMatch?: 'verified' | 'partial' | 'unverified' | 'mismatch';
  matchScore?: number;
  matchDetails?: Record<string, any>;
  verificationStatus: VerificationRequestStatus;
  isVerified: boolean;
  verifiedAt?: string;
  verificationError?: string;
  needsManualReview: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  lastCheckedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 1.3.3 - Peer Endorsements
export interface PeerEndorsement {
  id: string;
  profileId: string;
  requestId?: string;
  requestStatus: EndorsementRequestStatus;
  requestSentAt?: string;
  requestExpiresAt?: string;
  requestMessage?: string;
  // Endorser Information
  endorserEmail: string;
  endorserName: string;
  endorserTitle?: string;
  endorserCompany?: string;
  endorserLinkedIn?: string;
  endorserPhone?: string;
  endorserAvatar?: string;
  // Relationship Details
  relationship: EndorserRelationship;
  workedTogetherFrom?: string;
  workedTogetherTo?: string;
  workedAtCompany?: string;
  sharedProjects: string[];
  // Endorsement Content
  endorsementTitle?: string;
  endorsementText?: string;
  strengths: string[];
  areasOfExpertise: string[];
  // Skill Endorsements
  skillEndorsements?: Array<{
    skillId?: string;
    skillName: string;
    rating: number;
    comment?: string;
  }>;
  // Ratings (1-5)
  overallRating?: number;
  workQualityRating?: number;
  collaborationRating?: number;
  communicationRating?: number;
  leadershipRating?: number;
  technicalSkillsRating?: number;
  reliabilityRating?: number;
  // Would Work With Again
  wouldWorkAgain?: boolean;
  wouldRecommend?: boolean;
  // Verification
  isVerified: boolean;
  verifiedAt?: string;
  verificationMethod?: string;
  verificationToken?: string;
  // Privacy Settings
  isPublic: boolean;
  showOnProfile: boolean;
  anonymizeEndorser: boolean;
  // Timestamps
  endorsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 1.3.4 - Manager References
export interface ManagerReference {
  id: string;
  profileId: string;
  workExperienceId?: string;
  requestId?: string;
  requestStatus: ReferenceRequestStatus;
  requestSentAt?: string;
  requestExpiresAt?: string;
  requestMessage?: string;
  reminderSentAt?: string;
  reminderCount: number;
  // Manager/Reference Information
  referenceEmail: string;
  referenceName: string;
  referenceTitle?: string;
  referenceCompany?: string;
  referencePhone?: string;
  referenceLinkedIn?: string;
  referenceAvatar?: string;
  referenceRelationship: ReferenceRelationship;
  // Employment Details Being Referenced
  companyName: string;
  candidateTitle: string;
  employmentStartDate?: string;
  employmentEndDate?: string;
  wasDirectReport?: boolean;
  reportingDuration?: string;
  // Structured Feedback Form (1-5 ratings)
  overallPerformance?: number;
  technicalCompetence?: number;
  communicationSkills?: number;
  teamworkCollaboration?: number;
  problemSolving?: number;
  leadership?: number;
  initiative?: number;
  reliability?: number;
  adaptability?: number;
  // Open-Ended Questions
  keyStrengths?: string;
  areasForImprovement?: string;
  majorAccomplishments?: string;
  reasonForLeaving?: string;
  additionalComments?: string;
  // Rehire Eligibility
  eligibleForRehire?: 'yes' | 'no' | 'conditional' | 'not_applicable';
  rehireComments?: string;
  // Recommendation
  overallRecommendation?: 'highly_recommend' | 'recommend' | 'recommend_with_reservations' | 'do_not_recommend';
  recommendationText?: string;
  // Verification
  isVerified: boolean;
  verifiedAt?: string;
  verificationMethod?: string;
  verificationToken?: string;
  verificationNotes?: string;
  // Privacy & Display
  isPublic: boolean;
  showOnProfile: boolean;
  anonymizeReference: boolean;
  shareWithEmployers: boolean;
  // Timestamps
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 1.3.5 - Certification Verification
export interface CertificationVerification {
  id: string;
  profileId: string;
  certificationId: string;
  certificationName: string;
  issuingOrganization: string;
  credentialId?: string;
  credentialUrl?: string;
  issueDate: string;
  expirationDate?: string;
  // Verification API Details
  verificationProvider?: string;
  verificationEndpoint?: string;
  apiResponse?: Record<string, any>;
  // Verification Results
  verificationStatus: VerificationRequestStatus;
  isVerified: boolean;
  verifiedAt?: string;
  verificationMethod?: string;
  // Verified Data (from issuer)
  verifiedName?: string;
  verifiedIssuingOrg?: string;
  verifiedCredentialId?: string;
  verifiedIssueDate?: string;
  verifiedExpirationDate?: string;
  verifiedHolderName?: string;
  verifiedHolderEmail?: string;
  verifiedSkills: string[];
  // Match Analysis
  nameMatch?: 'exact' | 'partial' | 'mismatch';
  dateMatch?: 'exact' | 'approximate' | 'mismatch';
  holderMatch?: 'exact' | 'partial' | 'mismatch';
  overallMatch?: 'verified' | 'partial' | 'invalid' | 'expired';
  matchScore?: number;
  // Credential Status
  credentialStatus?: 'active' | 'expired' | 'revoked' | 'suspended';
  statusCheckedAt?: string;
  // Badge/Digital Credential
  badgeUrl?: string;
  badgeImageUrl?: string;
  badgeAssertionId?: string;
  // Verification Errors
  verificationError?: string;
  errorCode?: string;
  lastVerificationAttempt?: string;
  verificationAttempts: number;
  // Manual Review
  needsManualReview: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  // Auto-Reverification
  autoReverify: boolean;
  nextReverificationAt?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Trust Score
export interface TrustScore {
  id: string;
  profileId: string;
  overallScore: number;
  tier: TrustScoreTier;
  // Component Scores
  emailVerificationScore: number;
  linkedInVerificationScore: number;
  endorsementScore: number;
  referenceScore: number;
  certificationScore: number;
  profileCompletenessScore: number;
  activityScore: number;
  // Verification Counts
  verifiedEmails: number;
  verifiedEmployments: number;
  endorsementsReceived: number;
  referencesReceived: number;
  verifiedCertifications: number;
  // Score Factors
  scoreFactors?: Record<string, any>;
  scoreHistory?: Array<{
    score: number;
    tier: TrustScoreTier;
    timestamp: string;
    reason?: string;
  }>;
  // Flags
  hasVerifiedIdentity: boolean;
  hasVerifiedEmployment: boolean;
  hasEndorsements: boolean;
  hasReferences: boolean;
  hasVerifiedCerts: boolean;
  // Last Calculation
  lastCalculatedAt: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Verification Status Summary
export interface VerificationStatusSummary {
  emailVerifications: {
    total: number;
    verified: number;
    pending: number;
  };
  linkedInVerifications: {
    total: number;
    verified: number;
    pending: number;
  };
  peerEndorsements: {
    total: number;
    received: number;
    pending: number;
  };
  managerReferences: {
    total: number;
    completed: number;
    pending: number;
  };
  certificationVerifications: {
    total: number;
    verified: number;
    pending: number;
  };
  trustScore?: TrustScore;
}

// Request Email Verification payload
export interface RequestEmailVerificationPayload {
  workEmail: string;
  companyName: string;
  workExperienceId?: string;
}

// Request Peer Endorsement payload
export interface RequestPeerEndorsementPayload {
  endorserEmail: string;
  endorserName: string;
  endorserTitle?: string;
  endorserCompany?: string;
  relationship: EndorserRelationship;
  workedAtCompany?: string;
  workedTogetherFrom?: string;
  workedTogetherTo?: string;
  requestMessage?: string;
}

// Submit Peer Endorsement payload (for endorsers)
export interface SubmitPeerEndorsementPayload {
  endorsementTitle?: string;
  endorsementText?: string;
  strengths?: string[];
  areasOfExpertise?: string[];
  skillEndorsements?: Array<{
    skillName: string;
    rating: number;
    comment?: string;
  }>;
  overallRating?: number;
  workQualityRating?: number;
  collaborationRating?: number;
  communicationRating?: number;
  leadershipRating?: number;
  technicalSkillsRating?: number;
  reliabilityRating?: number;
  wouldWorkAgain?: boolean;
  wouldRecommend?: boolean;
}

// Request Manager Reference payload
export interface RequestManagerReferencePayload {
  workExperienceId?: string;
  referenceEmail: string;
  referenceName: string;
  referenceTitle?: string;
  referenceCompany?: string;
  referencePhone?: string;
  referenceLinkedIn?: string;
  referenceRelationship: ReferenceRelationship;
  companyName: string;
  candidateTitle: string;
  employmentStartDate?: string;
  employmentEndDate?: string;
  requestMessage?: string;
}

// Submit Manager Reference payload (for references)
export interface SubmitManagerReferencePayload {
  wasDirectReport?: boolean;
  reportingDuration?: string;
  overallPerformance?: number;
  technicalCompetence?: number;
  communicationSkills?: number;
  teamworkCollaboration?: number;
  problemSolving?: number;
  leadership?: number;
  initiative?: number;
  reliability?: number;
  adaptability?: number;
  keyStrengths?: string;
  areasForImprovement?: string;
  majorAccomplishments?: string;
  reasonForLeaving?: string;
  additionalComments?: string;
  eligibleForRehire?: 'yes' | 'no' | 'conditional' | 'not_applicable';
  rehireComments?: string;
  overallRecommendation?: 'highly_recommend' | 'recommend' | 'recommend_with_reservations' | 'do_not_recommend';
  recommendationText?: string;
}

// Request Certification Verification payload
export interface RequestCertificationVerificationPayload {
  certificationId: string;
  certificationName: string;
  issuingOrganization: string;
  credentialId?: string;
  credentialUrl?: string;
  issueDate: string;
  expirationDate?: string;
}

// ============================================
// BATCH 6: EXTENDED VERIFICATION & SKILL ASSESSMENTS (Features 1.3.6-1.4.2)
// ============================================

// Background Check Types
export type BackgroundCheckStatus = 'NOT_STARTED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type BackgroundCheckType = 'BASIC' | 'STANDARD' | 'COMPREHENSIVE' | 'CUSTOM';

// Challenge Types
export type ChallengeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ChallengeSubmissionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'COMPLETED' | 'EXPIRED';
export type QuizDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

// 1.3.6 - Education Verification
export interface EducationVerification {
  id: string;
  profileId: string;
  educationId: string;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  verificationProvider?: string;
  requestId?: string;
  requestStatus: VerificationRequestStatus;
  requestSentAt?: string;
  requestExpiresAt?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verificationMethod?: string;
  verifiedInstitution?: string;
  verifiedDegree?: string;
  verifiedFieldOfStudy?: string;
  verifiedStartDate?: string;
  verifiedEndDate?: string;
  verifiedGraduationDate?: string;
  verifiedGrade?: string;
  verifiedHonors?: string;
  degreeConferred?: boolean;
  institutionMatch?: 'exact' | 'partial' | 'mismatch';
  degreeMatch?: 'exact' | 'partial' | 'mismatch';
  dateMatch?: 'exact' | 'approximate' | 'mismatch';
  overallMatch?: 'verified' | 'partial' | 'unverified' | 'mismatch';
  matchScore?: number;
  verificationError?: string;
  verificationAttempts: number;
  needsManualReview: boolean;
  transcriptUrl?: string;
  diplomaUrl?: string;
  additionalDocs: string[];
  createdAt: string;
  updatedAt: string;
}

// 1.3.7 - Background Check
export interface BackgroundCheck {
  id: string;
  profileId: string;
  provider: string;
  providerCheckId?: string;
  checkType: BackgroundCheckType;
  packageName?: string;
  includedChecks: string[];
  requestId?: string;
  status: BackgroundCheckStatus;
  requestedAt?: string;
  requestedBy?: string;
  consentGiven: boolean;
  consentGivenAt?: string;
  consentDocument?: string;
  completedChecks: number;
  totalChecks: number;
  currentStep?: string;
  overallResult?: 'clear' | 'consider' | 'alert' | 'pending';
  completedAt?: string;
  reportUrl?: string;
  checkResults?: Array<{
    checkType: string;
    status: string;
    completedAt?: string;
  }>;
  adjudicationStatus?: 'pending' | 'approved' | 'declined' | 'escalated';
  adjudicatedAt?: string;
  adjudicatedBy?: string;
  adjudicationNotes?: string;
  validUntil?: string;
  canBeShared: boolean;
  errorMessage?: string;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
}

// 1.3.9 - Verified Badge
export interface VerifiedBadge {
  id: string;
  profileId: string;
  badgeType: string;
  badgeName: string;
  badgeDescription?: string;
  badgeIcon?: string;
  badgeColor?: string;
  verificationSource: string;
  verificationId?: string;
  verificationType?: string;
  isActive: boolean;
  earnedAt: string;
  expiresAt?: string;
  showOnProfile: boolean;
  displayOrder: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 1.4.1 - Coding Challenges
export interface CodingChallenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  difficulty: QuizDifficulty;
  category: string;
  subcategory?: string;
  tags: string[];
  supportedLanguages: string[];
  defaultLanguage: string;
  problemStatement: string;
  constraints: string[];
  hints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  sampleTestCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
  }>;
  starterCode: Record<string, string>;
  timeLimitMinutes: number;
  maxAttempts?: number;
  pointsValue: number;
  autoGrade: boolean;
  partialCredit: boolean;
  status: ChallengeStatus;
  publishedAt?: string;
  totalAttempts: number;
  totalCompletions: number;
  avgCompletionTime?: number;
  avgScore?: number;
  successRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  attemptNumber: number;
  language: string;
  code: string;
  status: ChallengeSubmissionStatus;
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  timeSpentSeconds?: number;
  testCasesPassed: number;
  totalTestCases: number;
  score?: number;
  executionTime?: number;
  memoryUsed?: number;
  testResults?: Array<{
    testCaseId: string;
    passed: boolean;
    output?: string;
    expectedOutput?: string;
    error?: string;
    executionTime?: number;
  }>;
  codeQualityScore?: number;
  complexity?: string;
  linesOfCode?: number;
  autoFeedback?: string;
  reviewerFeedback?: string;
  createdAt: string;
  updatedAt: string;
  challenge?: Partial<CodingChallenge>;
}

// 1.4.2 - Technical Quizzes
export interface TechnicalQuiz {
  id: string;
  title: string;
  slug: string;
  description?: string;
  instructions?: string;
  category: string;
  subcategory?: string;
  difficulty: QuizDifficulty;
  tags: string[];
  questionCount: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  timeLimitMinutes?: number;
  showTimer: boolean;
  maxAttempts?: number;
  cooldownMinutes?: number;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  showScoreImmediately: boolean;
  status: ChallengeStatus;
  publishedAt?: string;
  totalAttempts: number;
  totalCompletions: number;
  avgScore?: number;
  avgTimeSeconds?: number;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionNumber: number;
  questionType: 'multiple_choice' | 'multiple_select' | 'true_false' | 'fill_blank' | 'code_output';
  questionText: string;
  questionCode?: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }>;
  correctAnswers: string[];
  expectedAnswer?: string;
  acceptedVariations: string[];
  caseSensitive: boolean;
  explanation?: string;
  references: string[];
  points: number;
  difficulty: QuizDifficulty;
  tags: string[];
  skill?: string;
  displayOrder: number;
  correctCount: number;
  incorrectCount: number;
  skipCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  status: ChallengeSubmissionStatus;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds?: number;
  score?: number;
  pointsEarned: number;
  totalPoints: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  totalQuestions: number;
  passed?: boolean;
  passingScore?: number;
  answers: Array<{
    questionId: string;
    selectedOptions: string[];
    answerText?: string;
    isCorrect: boolean;
    points: number;
  }>;
  skillBreakdown?: Record<string, {
    correct: number;
    total: number;
    percentage?: number;
  }>;
  createdAt: string;
  updatedAt: string;
  quiz?: Partial<TechnicalQuiz>;
}

// Assessment Statistics
export interface AssessmentStats {
  challenges: {
    completed: number;
    averageScore: number;
  };
  quizzes: {
    completed: number;
    averageScore: number;
  };
}

// Extended Verification Status
export interface ExtendedVerificationStatus {
  educationVerifications: {
    total: number;
    verified: number;
    pending: number;
  };
  backgroundChecks: {
    total: number;
    completed: number;
    pending: number;
    latestResult?: string;
  };
  badges: {
    total: number;
    active: number;
    displayed: number;
  };
}

// Badge Type Configuration
export interface BadgeTypeConfig {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ============================================
// BATCH 7: ADVANCED ASSESSMENTS (1.4.3-1.4.7)
// ============================================

// 1.4.3 - Live Coding Environment
export type LiveCodingSessionStatus =
  | 'SCHEDULED'
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface LiveCodingSession {
  id: string;
  candidateId: string;
  interviewerId: string;
  applicationId?: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: LiveCodingSessionStatus;
  programmingLanguage: string;
  problemStatement: string;
  starterCode?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }>;
  hints?: string[];
  difficultyLevel: string;
  roomUrl?: string;
  startedAt?: string;
  endedAt?: string;
  candidateCode?: string;
  codeSnapshots?: Array<{
    code: string;
    language: string;
    timestamp: string;
  }>;
  executionResults?: Record<string, unknown>;
  score?: number;
  feedback?: string;
  codeQualityScore?: number;
  problemSolvingScore?: number;
  communicationScore?: number;
  technicalKnowledgeScore?: number;
  recommendation?: string;
  createdAt: string;
  updatedAt: string;
}

// 1.4.4 - Take-Home Project System
export type ProjectSubmissionStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export interface TakeHomeProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficultyLevel: string;
  estimatedHours: number;
  deadlineHours: number;
  requirements: string;
  evaluationCriteria?: string;
  starterRepoUrl?: string;
  techStack: string[];
  skills: string[];
  allowedExtensions: string[];
  maxSubmissionSize: number;
  rubric?: Record<string, {
    criteria: string;
    maxScore: number;
    description?: string;
  }>;
  createdById?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSubmission {
  id: string;
  projectId: string;
  candidateId: string;
  applicationId?: string;
  assignedById?: string;
  status: ProjectSubmissionStatus;
  deadline: string;
  startedAt?: string;
  submittedAt?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  submissionNotes?: string;
  submittedFiles: string[];
  reviewerId?: string;
  reviewedAt?: string;
  overallScore?: number;
  criteriaScores?: Record<string, number>;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  recommendation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  project?: TakeHomeProject;
}

// 1.4.5 - External Assessment Integration
export type ExternalAssessmentProvider =
  | 'HACKERRANK'
  | 'CODESIGNAL'
  | 'LEETCODE'
  | 'CODILITY'
  | 'TESTGORILLA'
  | 'TOGGL_HIRE'
  | 'OTHER';

export interface ExternalAssessment {
  id: string;
  profileId: string;
  provider: ExternalAssessmentProvider;
  externalAssessmentId: string;
  assessmentName: string;
  assessmentUrl?: string;
  score?: number;
  maxScore?: number;
  percentile?: number;
  completedAt: string;
  skills: string[];
  certificateUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verificationMethod?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// 1.4.6 - Soft Skills Assessment
export type SoftSkillCategory =
  | 'PERSONALITY'
  | 'SITUATIONAL_JUDGMENT'
  | 'EMOTIONAL_INTELLIGENCE'
  | 'LEADERSHIP'
  | 'TEAMWORK'
  | 'COMMUNICATION'
  | 'PROBLEM_SOLVING'
  | 'ADAPTABILITY';

export interface SoftSkillsAssessment {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: SoftSkillCategory;
  estimatedMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: SoftSkillQuestion[];
  _count?: {
    questions: number;
  };
}

export interface SoftSkillQuestion {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  scenario?: string;
  order: number;
  scoringRubric?: Record<string, number>;
  traits?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SoftSkillAttempt {
  id: string;
  assessmentId: string;
  candidateId: string;
  applicationId?: string;
  startedAt: string;
  completedAt?: string;
  answers: Array<{
    questionId: string;
    answer: string;
    responseTime?: number;
  }>;
  overallScore?: number;
  traitScores?: Record<string, number>;
  insights?: string[];
  createdAt: string;
  updatedAt: string;
  assessment?: Partial<SoftSkillsAssessment>;
}

// 1.4.7 - Language Proficiency Tests
export type LanguageTestType =
  | 'SPEAKING'
  | 'WRITING'
  | 'READING'
  | 'LISTENING'
  | 'COMPREHENSIVE';

export interface LanguageProficiencyTest {
  id: string;
  title: string;
  slug: string;
  description?: string;
  language: string;
  testType: LanguageTestType;
  difficultyLevel: string;
  estimatedMinutes: number;
  passingScore?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: LanguageQuestion[];
  _count?: {
    questions: number;
  };
}

export interface LanguageQuestion {
  id: string;
  testId: string;
  questionText: string;
  questionType: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
  correctAnswer?: string;
  audioUrl?: string;
  imageUrl?: string;
  passage?: string;
  order: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageTestAttempt {
  id: string;
  testId: string;
  candidateId: string;
  applicationId?: string;
  startedAt: string;
  completedAt?: string;
  answers: Array<{
    questionId: string;
    answer: string;
    responseTime?: number;
  }>;
  score?: number;
  sectionScores?: Record<string, {
    correct: number;
    total: number;
  }>;
  cefrLevel?: string;
  correctAnswers?: number;
  totalQuestions?: number;
  createdAt: string;
  updatedAt: string;
  test?: Partial<LanguageProficiencyTest>;
}

// Batch 7 Combined Statistics
export interface Batch7AssessmentStats {
  liveCoding: {
    total: number;
    completed: number;
    averageScore: number;
  };
  takeHomeProjects: {
    total: number;
    submitted: number;
    averageScore: number;
  };
  externalAssessments: {
    total: number;
    byProvider: Record<string, number>;
    averagePercentile: number;
  };
  softSkills: {
    total: number;
    averageScore: number;
  };
  languageTests: {
    total: number;
    averageScore: number;
    highestCEFR: string | null;
  };
}

// ============================================
// BATCH 8: DOMAIN ASSESSMENTS, ANALYTICS & AI SCORING (1.4.8-2.1.2)
// ============================================

// 1.4.8 - Domain-Specific Assessments
export type DomainCategory =
  | 'FINANCE'
  | 'HEALTHCARE'
  | 'LEGAL'
  | 'TECHNOLOGY'
  | 'MARKETING'
  | 'SALES'
  | 'HR'
  | 'OPERATIONS'
  | 'ENGINEERING'
  | 'DATA_SCIENCE'
  | 'CYBERSECURITY'
  | 'COMPLIANCE'
  | 'OTHER';

export interface DomainAssessment {
  id: string;
  title: string;
  slug: string;
  description?: string;
  domain: DomainCategory;
  subDomain?: string;
  difficultyLevel: string;
  estimatedMinutes: number;
  passingScore: number;
  totalPoints: number;
  questionCount: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  timeLimit?: number;
  allowPause: boolean;
  providesCertificate: boolean;
  certificateValidDays?: number;
  tags: string[];
  prerequisites: string[];
  targetRoles: string[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: DomainQuestion[];
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface DomainQuestion {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: string;
  options?: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }>;
  correctAnswer?: string;
  caseStudy?: string;
  exhibits?: Record<string, unknown>;
  points: number;
  partialCreditAllowed: boolean;
  explanation?: string;
  references: string[];
  difficulty: string;
  topic?: string;
  skills: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DomainAssessmentAttempt {
  id: string;
  assessmentId: string;
  userId: string;
  applicationId?: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  timeSpentSeconds: number;
  pausedAt?: string;
  totalPauseSeconds: number;
  currentQuestionIndex: number;
  questionsAnswered: number;
  answers: Array<{
    questionId: string;
    answer: string;
    timeSpent?: number;
    flagged?: boolean;
  }>;
  flaggedQuestions: string[];
  rawScore?: number;
  percentageScore?: number;
  passed?: boolean;
  topicScores?: Record<string, { correct: number; total: number; percentage?: number }>;
  skillScores?: Record<string, { correct: number; total: number; percentage?: number }>;
  percentile?: number;
  ranking?: number;
  certificateId?: string;
  certificateUrl?: string;
  certificateExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  assessment?: Partial<DomainAssessment>;
}

// 1.4.9 - Assessment Analytics
export interface AssessmentAnalyticsData {
  id: string;
  userId: string;
  profileId?: string;
  totalAssessmentsTaken: number;
  totalAssessmentsPassed: number;
  overallAverageScore?: number;
  codingChallenges?: {
    taken: number;
    passed?: number;
    avgScore?: number;
    bestScore?: number;
    recentScores?: number[];
  };
  technicalQuizzes?: {
    taken: number;
    passed?: number;
    avgScore?: number;
  };
  domainAssessments?: {
    taken: number;
    passed?: number;
    avgScore?: number;
  };
  softSkillsTests?: {
    taken: number;
    avgScore?: number;
  };
  languageTests?: {
    taken: number;
    avgScore?: number;
  };
  skillPerformance?: Record<string, {
    assessments: number;
    avgScore: number;
    trend?: 'UP' | 'DOWN' | 'STABLE';
    lastAssessed?: string;
  }>;
  averageCompletionTime?: number;
  fastestCompletion?: number;
  totalTimeSpent?: number;
  scoreHistory?: Array<{
    date: string;
    type: string;
    score: number;
  }>;
  monthlyProgress?: Record<string, {
    taken: number;
    passed: number;
    avgScore: number;
  }>;
  percentileRankings?: Record<string, number>;
  industryComparison?: Record<string, unknown>;
  topStrengths: string[];
  areasForImprovement: string[];
  recommendedAssessments: string[];
  suggestedLearning?: Record<string, string[]>;
  lastAssessmentAt?: string;
  lastAnalyzedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 1.4.10 - Skill Decay Tracking
export interface SkillDecayTracker {
  id: string;
  userId: string;
  skillName: string;
  lastAssessedAt: string;
  lastScore: number;
  peakScore: number;
  assessmentCount: number;
  decayRate?: number;
  currentEstimatedScore?: number;
  confidenceLevel?: number;
  refreshDueAt?: string;
  refreshPriority?: 'HIGH' | 'MEDIUM' | 'LOW';
  skillCategory?: string;
  relatedAssessments: string[];
  reminderSent: boolean;
  reminderSentAt?: string;
  scoreHistory?: Array<{
    date: string;
    score: number;
    assessmentId: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SkillDecaySummary {
  totalTracked: number;
  needsRefresh: number;
  upcomingRefresh: number;
  byCategory: Record<string, number>;
  urgentSkills: Array<{
    skill: string;
    lastAssessed: string;
    estimatedScore?: number;
    priority?: string;
  }>;
}

// 2.1.1 - AI Profile Scorer
export interface AIProfileScore {
  id: string;
  profileId: string;
  userId: string;
  overallScore: number;
  scoreGrade: string;
  profileCompleteness: number;
  experienceDepth: number;
  skillsVerification: number;
  educationStrength: number;
  projectQuality: number;
  assessmentPerformance: number;
  verificationScore: number;
  engagementScore: number;
  componentWeights: Record<string, number>;
  componentDetails: Record<string, {
    score: number;
    factors?: string[];
    improvements?: string[];
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations?: Array<{
    area: string;
    suggestion: string;
    impact: string;
  }>;
  estimatedLevel?: string;
  yearsOfExperience?: number;
  topIndustries?: Array<{
    industry: string;
    fitScore: number;
    reasons: string[];
  }>;
  topRoles?: Array<{
    role: string;
    fitScore: number;
    matchingSkills: string[];
  }>;
  marketPercentile?: number;
  salaryEstimate?: {
    min: number;
    max: number;
    median: number;
    currency: string;
  };
  similarProfiles?: number;
  standoutFactors: string[];
  scoringVersion: string;
  scoringAlgorithm: string;
  lastScoredAt: string;
  createdAt: string;
  updatedAt: string;
}

// 2.1.2 - Job-Fit Score
export type FitCategory = 'EXCELLENT_FIT' | 'GOOD_FIT' | 'MODERATE_FIT' | 'LOW_FIT' | 'POOR_FIT';

export interface JobFitScore {
  id: string;
  userId: string;
  profileId?: string;
  jobId: string;
  applicationId?: string;
  overallFitScore: number;
  fitCategory: FitCategory;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  locationMatch: number;
  salaryMatch: number;
  senioritylMatch: number;
  industryMatch: number;
  cultureMatch?: number;
  matchedSkills: Array<{
    skill: string;
    requiredLevel?: number;
    candidateLevel?: number;
    match: boolean;
  }>;
  missingSkills: string[];
  bonusSkills: string[];
  experienceAnalysis?: {
    required: string;
    candidate: string;
    analysis: string;
  };
  relevantExperience?: Record<string, unknown>;
  requirementMatches: Record<string, {
    met: boolean;
    details?: string;
    score?: number;
  }>;
  knockoutFlags: string[];
  candidateSummary?: string;
  interviewFocus: string[];
  concernFlags: string[];
  rankAmongApplicants?: number;
  percentileAmongApplicants?: number;
  similarCandidates?: number;
  scoringVersion: string;
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
  job?: Partial<Job>;
  user?: Partial<User>;
}

// ============================================
// BATCH 9: ADVANCED CANDIDATE SCORING (2.1.3 - 2.1.7)
// ============================================

// 2.1.3 - Culture Fit Analysis
export type CultureFitLevel = 'STRONG_FIT' | 'GOOD_FIT' | 'MODERATE_FIT' | 'POTENTIAL_MISMATCH' | 'POOR_FIT';
export type CollaborationStyle = 'HIGHLY_COLLABORATIVE' | 'BALANCED' | 'INDEPENDENT';
export type CommunicationStyleType = 'FORMAL' | 'CASUAL' | 'ASYNC_FIRST' | 'MEETING_HEAVY';
export type DecisionMakingStyle = 'AUTONOMOUS' | 'CONSULTATIVE' | 'CONSENSUS';
export type FeedbackPreference = 'DIRECT' | 'SUPPORTIVE' | 'STRUCTURED';
export type RemotePreference = 'FULL_REMOTE' | 'HYBRID' | 'IN_OFFICE' | 'FLEXIBLE';
export type WorkHoursFlexibility = 'STRICT_SCHEDULE' | 'FLEXIBLE' | 'RESULTS_ONLY';
export type ToleranceLevel = 'LOW' | 'MODERATE' | 'HIGH';
export type TeamSizePreference = 'SMALL' | 'MEDIUM' | 'LARGE' | 'FLEXIBLE';
export type LeadershipStyleType = 'DIRECTIVE' | 'COACHING' | 'DELEGATING' | 'SUPPORTIVE';
export type ConflictResolutionStyle = 'AVOIDANT' | 'ACCOMMODATING' | 'COMPETITIVE' | 'COLLABORATIVE' | 'COMPROMISING';
export type TeamRoleArchetype = 'DRIVER' | 'ANALYST' | 'COLLABORATOR' | 'VISIONARY';
export type CompanySize = 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
export type RiskToleranceLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface CultureFitAnalysis {
  id: string;
  userId: string;
  profileId: string;
  companyId?: string;
  jobId?: string;
  overallCultureScore: number;
  fitLevel: CultureFitLevel;
  workStyleAlignment: number;
  collaborationStyle: CollaborationStyle;
  communicationStyle: CommunicationStyleType;
  decisionMaking: DecisionMakingStyle;
  feedbackPreference: FeedbackPreference;
  remotePreference: RemotePreference;
  workHoursFlexibility: WorkHoursFlexibility;
  meetingTolerance: ToleranceLevel;
  focusTimeNeeds: ToleranceLevel;
  valuesAlignment: number;
  topValues: string[];
  matchedValues?: Array<{
    value: string;
    weight: number;
    alignment: number;
  }>;
  conflictingValues: string[];
  teamSizePreference: TeamSizePreference;
  leadershipStyle: LeadershipStyleType;
  conflictResolution: ConflictResolutionStyle;
  teamRoleArchetype: TeamRoleArchetype;
  primaryMotivators: string[];
  careerPriorities?: Record<string, number>;
  workLifeBalance: number;
  preferredCompanySize: CompanySize;
  preferredIndustries: string[];
  startupReadiness: number;
  corporateReadiness: number;
  changeAdaptability: number;
  ambiguityTolerance: number;
  riskTolerance: RiskToleranceLevel;
  strengthFactors?: Array<{
    factor: string;
    description: string;
    impact: string;
  }>;
  concernFactors?: Array<{
    factor: string;
    description: string;
    recommendation: string;
  }>;
  recommendations: string[];
  fitSummary?: string;
  assessmentResponses?: Record<string, unknown>;
  inferredFromProfile?: Record<string, unknown>;
  behavioralSignals?: Record<string, unknown>;
  scoringVersion: string;
  lastAnalyzedAt: string;
  confidence: number;
  createdAt?: string;
  updatedAt?: string;
}

// 2.1.4 - Growth Potential Score
export type GrowthTier = 'HIGH_POTENTIAL' | 'STRONG_GROWTH' | 'STEADY_GROWTH' | 'LIMITED_GROWTH';
export type CareerMomentum = 'ACCELERATING' | 'STEADY' | 'PLATEAUED' | 'DECLINING';
export type TechAdoptionSpeed = 'EARLY_ADOPTER' | 'EARLY_MAJORITY' | 'LATE_MAJORITY' | 'LAGGARD';
export type SkillShape = 'T_SHAPED' | 'I_SHAPED' | 'GENERALIST' | 'SPECIALIST';
export type EducationRecency = 'RECENT' | 'ONGOING' | 'ESTABLISHED' | 'DATED';

export interface GrowthPotentialScore {
  id: string;
  userId: string;
  profileId: string;
  overallGrowthScore: number;
  growthTier: GrowthTier;
  learningAgility: number;
  skillAcquisitionRate: number;
  knowledgeRetention: number;
  adaptabilityScore: number;
  careerProgressionRate: number;
  promotionHistory?: Array<{
    fromRole: string;
    toRole: string;
    timespan: string;
    company: string;
  }>;
  roleComplexityGrowth: number;
  responsibilityExpansion: number;
  careerMomentum: CareerMomentum;
  skillGrowthVelocity: number;
  techAdoptionSpeed: TechAdoptionSpeed;
  breadthVsDepth: SkillShape;
  emergingSkills: string[];
  continuousLearning: number;
  recentCertifications: number;
  educationRecency: EducationRecency;
  learningInvestment: number;
  leadershipPotential: number;
  managementExperience?: {
    directReports?: number;
    teams?: number;
    projects?: number;
  };
  mentorshipActivities: number;
  initiativeTaking: number;
  innovationScore: number;
  impactEvidence?: Array<{
    project: string;
    impact: string;
    metrics?: Record<string, unknown>;
  }>;
  problemSolvingAbility: number;
  creativeThinking: number;
  achievementDensity: number;
  recognitionFrequency: number;
  overachievementSignals?: Array<{
    signal: string;
    frequency: number;
  }>;
  predictedGrowthPath?: {
    '1yr': { role: string; probability: number };
    '3yr': { role: string; probability: number };
    '5yr': { role: string; probability: number };
  };
  suggestedRoles: string[];
  developmentAreas: string[];
  ceilingEstimate?: string;
  growthDrivers?: Array<{
    factor: string;
    impact: string;
  }>;
  growthLimiters?: Array<{
    factor: string;
    impact: string;
  }>;
  recommendations: string[];
  potentialSummary?: string;
  linkedinActivity?: Record<string, unknown>;
  githubActivity?: Record<string, unknown>;
  learningPlatformData?: Record<string, unknown>;
  scoringVersion: string;
  lastScoredAt: string;
  confidence: number;
  createdAt?: string;
  updatedAt?: string;
}

// 2.1.5 - Technical Depth Score
export type TechnicalTier = 'EXPERT' | 'SENIOR' | 'MID_LEVEL' | 'JUNIOR' | 'ENTRY';
export type CodeComplexityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface TechnicalDepthScore {
  id: string;
  userId: string;
  profileId: string;
  overallTechnicalScore: number;
  technicalTier: TechnicalTier;
  codeQualityScore: number;
  codeComplexityHandled: CodeComplexityLevel;
  codingPatterns?: string[];
  bestPracticesScore: number;
  testingPractices: number;
  githubScore?: number;
  totalContributions?: number;
  consistencyScore?: number;
  repositoryQuality?: number;
  openSourceImpact?: {
    projects?: number;
    contributions?: number;
    maintainer?: boolean;
    stars?: number;
  };
  languageProficiency?: Record<string, {
    loc?: number;
    projects?: number;
    score: number;
  }>;
  stackOverflowScore?: number;
  reputation?: number;
  answerQuality?: number;
  topTags: string[];
  acceptedAnswerRate?: number;
  helpfulnessScore?: number;
  projectComplexityScore: number;
  architectureExperience?: Record<string, {
    count: number;
    examples?: string[];
  }>;
  systemDesignCapability: number;
  scalabilityExperience?: {
    maxUsers?: string;
    maxRPS?: string;
    databases?: string[];
  };
  primaryStack: string[];
  stackDepth?: Record<string, string>;
  stackBreadth: number;
  modernTechAdoption: number;
  domainExpertise?: Record<string, {
    level: string;
    years: number;
    evidence?: string[];
  }>;
  specializations: string[];
  industryExperience?: string[];
  algorithmProficiency?: number;
  dataStructureSkills?: number;
  debuggingAbility: number;
  optimizationSkills?: number;
  technicalLeadership: number;
  architectureDecisions?: Array<{
    decision: string;
    impact: string;
  }>;
  mentorshipEvidence?: {
    juniorsMentored?: number;
    codeReviews?: number;
  };
  codeReviewActivity?: number;
  relevantCertifications?: Record<string, {
    issuer: string;
    date: string;
    level?: string;
  }>;
  certificationScore: number;
  technicalStrengths: string[];
  technicalGaps: string[];
  recommendations: string[];
  technicalSummary?: string;
  marketPercentile?: number;
  similarProfiles?: number;
  analyzedRepos?: Record<string, unknown>;
  analyzedProjects?: Record<string, unknown>;
  lastGithubSync?: string;
  lastStackOverflowSync?: string;
  scoringVersion: string;
  lastScoredAt: string;
  confidence: number;
  createdAt?: string;
  updatedAt?: string;
}

// 2.1.6 - Communication Score
export type CommunicationTier = 'EXCEPTIONAL' | 'STRONG' | 'PROFICIENT' | 'DEVELOPING' | 'NEEDS_WORK';
export type VocabularyLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface CommunicationScore {
  id: string;
  userId: string;
  profileId: string;
  overallCommScore: number;
  communicationTier: CommunicationTier;
  writtenScore: number;
  writingClarity: number;
  writingConciseness: number;
  grammarAccuracy: number;
  professionalTone: number;
  structureOrganization: number;
  writingSamples?: Array<{
    source: string;
    type: string;
    score: number;
    analysis?: string;
  }>;
  vocabularyLevel: VocabularyLevel;
  technicalWriting: number;
  persuasiveWriting: number;
  verbalScore?: number;
  articulationClarity?: number;
  responseStructure?: number;
  activeListening?: number;
  questionHandling?: number;
  interviewCommunication?: {
    averageScore?: number;
    interviews?: number;
    feedback?: string[];
  };
  presentationSkills?: number;
  explanationAbility: number;
  technicalExplanation: number;
  emailProfessionalism?: number;
  responsiveness: number;
  followUpQuality?: number;
  negotiationSkills?: number;
  languageProficiencies?: Record<string, {
    level: string;
    certified?: boolean;
  }>;
  primaryLanguage: string;
  crossCulturalAwareness?: number;
  collaborationComm: number;
  feedbackDelivery?: number;
  feedbackReception?: number;
  conflictCommunication?: number;
  profileWritingQuality: number;
  projectDescriptions: number;
  experienceArticulation: number;
  publicSpeaking?: number;
  contentCreation?: number;
  socialMediaProfessionalism?: number;
  communicationStrengths: string[];
  communicationGaps: string[];
  developmentAreas: string[];
  recommendations: string[];
  commSummary?: string;
  analyzedDocuments?: Record<string, unknown>;
  interviewTranscripts?: Record<string, unknown>;
  emailSamples?: number;
  scoringVersion: string;
  lastScoredAt: string;
  confidence: number;
  createdAt?: string;
  updatedAt?: string;
}

// 2.1.7 - Reliability Score
export type ReliabilityTier = 'HIGHLY_RELIABLE' | 'RELIABLE' | 'MODERATELY_RELIABLE' | 'NEEDS_MONITORING' | 'UNRELIABLE';
export type JobHoppingRisk = 'LOW' | 'MODERATE' | 'HIGH';
export type EmployerRelationship = 'EXCELLENT' | 'GOOD' | 'MIXED' | 'CONCERNING';
export type BackgroundCheckStatus = 'PASSED' | 'PENDING' | 'ISSUES' | 'NOT_STARTED';
export type ReliabilityTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';
export type ConfidenceLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export interface ReliabilityScore {
  id: string;
  userId: string;
  profileId: string;
  overallReliabilityScore: number;
  reliabilityTier: ReliabilityTier;
  applicationCompletion: number;
  profileCompleteness: number;
  documentSubmission: number;
  deadlineAdherence: number;
  responseRate: number;
  averageResponseTime: number;
  responseTimeConsistency: number;
  responseQuality: number;
  interviewAttendance: number;
  punctualityScore: number;
  rescheduleRate: number;
  noShowCount: number;
  lastMinuteCancellations: number;
  engagementConsistency: number;
  followThroughRate: number;
  processAdherence: number;
  loginConsistency?: number;
  profileUpdateFrequency?: number;
  applicationActivity?: {
    applied?: number;
    withdrawn?: number;
    ghosted?: number;
    completed?: number;
  };
  applicationHistory?: {
    totalApplications?: number;
    completionRate?: number;
    averageEngagementDays?: number;
  };
  withdrawalPatterns?: {
    reason?: string;
    advance_notice?: boolean;
  };
  ghostingIncidents: number;
  longTermCommitment: number;
  jobHoppingRisk: JobHoppingRisk;
  averageTenure?: number;
  careerStability: number;
  referenceAvailability?: number;
  referenceQuality?: number;
  employerRelationships?: EmployerRelationship;
  verificationCompliance: number;
  documentAuthenticity?: number;
  backgroundCheckStatus?: BackgroundCheckStatus;
  reliabilityRisks?: Array<{
    risk: string;
    severity: string;
    evidence?: string;
  }>;
  redFlags: string[];
  greenFlags: string[];
  reliabilityDrivers?: Array<{
    factor: string;
    impact: string;
  }>;
  concernAreas: string[];
  recommendations: string[];
  reliabilitySummary?: string;
  reliabilityTrend: ReliabilityTrend;
  trendData?: Record<string, number>;
  dataPoints: number;
  confidenceLevel: ConfidenceLevel;
  scoringVersion: string;
  lastScoredAt: string;
  confidence: number;
  createdAt?: string;
  updatedAt?: string;
}

// Advanced Scoring Dashboard
export interface AdvancedScoresSummary {
  userId: string;
  lastUpdated: string;
  scores: {
    cultureFit: { score: number; tier: string; confidence: number };
    growthPotential: { score: number; tier: string; confidence: number };
    technicalDepth: { score: number; tier: string; confidence: number };
    communication: { score: number; tier: string; confidence: number };
    reliability: { score: number; tier: string; confidence: number };
  };
  overallAdvancedScore: number;
  marketPercentile: number;
  insights: string[];
  topStrengths: string[];
  developmentAreas: string[];
}

export interface CandidateScoringDashboard {
  candidateId: string;
  candidateName: string;
  lastUpdated: string;
  scores: {
    cultureFit: { score: number; tier: string };
    growthPotential: { score: number; tier: string };
    technicalDepth: { score: number; tier: string };
    communication: { score: number; tier: string };
    reliability: { score: number; tier: string };
  };
  overallScore: number;
  recommendation: string;
  interviewFocus: string[];
  greenFlags: string[];
  yellowFlags: string[];
  redFlags: string[];
}

// ============================================
// BATCH 10: EXTENDED SCORING & CALIBRATION (2.1.8 - 2.1.12)
// ============================================

// 2.1.8 - Salary Alignment
export type SalaryFlexibility = 'FIRM' | 'SOMEWHAT_FLEXIBLE' | 'VERY_FLEXIBLE';
export type AlignmentCategory = 'WELL_ALIGNED' | 'SLIGHTLY_HIGH' | 'SIGNIFICANTLY_HIGH' | 'BELOW_MARKET' | 'NEGOTIABLE';
export type BudgetFlexibility = 'STRICT' | 'FLEXIBLE' | 'VERY_FLEXIBLE';

export interface SalaryAlignment {
  id: string;
  userId: string;
  profileId: string;
  jobId?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  expectedSalaryCurrency: string;
  salaryFlexibility: SalaryFlexibility;
  prioritizesEquity: boolean;
  bonusExpectations?: number;
  benefitsPriority: string[];
  marketSalaryMin: number;
  marketSalaryMax: number;
  marketSalaryMedian: number;
  marketSalaryCurrency: string;
  marketPercentile: number;
  marketDataSource: string;
  marketDataDate: string;
  jobBudgetMin?: number;
  jobBudgetMax?: number;
  budgetFlexibility?: BudgetFlexibility;
  alignmentScore: number;
  alignmentCategory: AlignmentCategory;
  gapAnalysis?: {
    gap: number;
    percentage: number;
    direction: string;
    details?: string;
  };
  baseSalaryAlignment: number;
  bonusAlignment?: number;
  equityAlignment?: number;
  benefitsValue?: number;
  totalCompAlignment: number;
  locationAdjustment?: number;
  adjustedExpectation?: number;
  negotiationRoom?: number;
  suggestedOffer?: number;
  counterOfferLikely: boolean;
  recommendations: string[];
  negotiationTips: string[];
  alignmentSummary?: string;
  scoringVersion: string;
  lastAnalyzedAt: string;
  confidence: number;
}

export interface MarketSalaryData {
  jobTitle: string;
  normalizedTitle: string;
  location: string;
  seniorityLevel: string;
  industry?: string;
  currency: string;
  baseSalary: {
    min: number;
    max: number;
    median: number;
    mean?: number;
    percentile25?: number;
    percentile75?: number;
    percentile90?: number;
  };
  totalCompensation?: {
    min: number;
    max: number;
    median: number;
  };
  bonus?: {
    min: number;
    max: number;
    median: number;
    typicalPercent?: number;
  };
  equity?: {
    min: number;
    max: number;
    median: number;
  };
  sampleSize?: number;
  dataSource: string;
  dataDate: string;
  yoyGrowth?: number;
  skillsPremiums?: Record<string, number>;
}

// 2.1.9 - Location Compatibility
export type RemotePreferenceType = 'FULL_REMOTE' | 'HYBRID' | 'IN_OFFICE' | 'FLEXIBLE';
export type TravelWillingness = 'NONE' | 'MINIMAL' | 'MODERATE' | 'FREQUENT' | 'EXTENSIVE';
export type RelocationTimeframe = 'IMMEDIATE' | '1_3_MONTHS' | '3_6_MONTHS' | '6_PLUS_MONTHS';
export type LocationCompatibilityLevel = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'CHALLENGING' | 'INCOMPATIBLE';
export type WorkAuthorization = 'CITIZEN' | 'PERMANENT_RESIDENT' | 'VISA' | 'REQUIRES_SPONSORSHIP';

export interface LocationCompatibility {
  id: string;
  userId: string;
  profileId: string;
  jobId?: string;
  currentCity?: string;
  currentState?: string;
  currentCountry: string;
  currentTimezone?: string;
  remotePreference: RemotePreferenceType;
  hybridDaysInOffice?: number;
  relocationWilling: boolean;
  relocationLocations: string[];
  relocationTimeframe?: RelocationTimeframe;
  relocationAssistance: boolean;
  travelWillingness: TravelWillingness;
  maxTravelPercent?: number;
  internationalTravel: boolean;
  jobLocationType?: string;
  jobCity?: string;
  jobState?: string;
  jobCountry?: string;
  jobTimezone?: string;
  jobTravelRequired?: string;
  overallCompatibility: number;
  compatibilityLevel: LocationCompatibilityLevel;
  locationMatch: number;
  remoteCompatibility: number;
  timezoneOverlap: number;
  travelCompatibility: number;
  relocationFeasibility?: number;
  distanceToOffice?: number;
  commuteTime?: number;
  commuteMethod?: string;
  timezoneOffset?: number;
  overlapHours?: number;
  meetingFriendly: boolean;
  candidateCOL?: number;
  jobLocationCOL?: number;
  salaryAdjustment?: number;
  workAuthorization?: WorkAuthorization;
  visaType?: string;
  visaExpiry?: string;
  sponsorshipNeeded: boolean;
  compatibilityFactors?: Record<string, { score: number; impact: string; note?: string }>;
  challenges: string[];
  mitigations: string[];
  recommendations: string[];
  compatibilitySummary?: string;
  scoringVersion: string;
  lastAnalyzedAt: string;
  confidence: number;
}

// 2.1.10 - Diversity & Inclusion Metrics
export type DIAnalysisType = 'CANDIDATE_POOL' | 'JOB_POSTING' | 'HIRING_PROCESS' | 'PIPELINE';
export type DIGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

export interface DIMetrics {
  id: string;
  companyId?: string;
  jobId?: string;
  analysisType: DIAnalysisType;
  genderNeutralityScore?: number;
  ageNeutralityScore?: number;
  accessibilityScore?: number;
  inclusivityScore?: number;
  flaggedTerms?: Array<{
    term: string;
    issue: string;
    suggestion: string;
  }>;
  pipelineDiversity?: Record<string, unknown>;
  sourceChannelDiversity?: Record<string, unknown>;
  conversionByDemographic?: Record<string, unknown>;
  scoringBiasAnalysis?: Record<string, unknown>;
  demographicScoreGaps?: Record<string, { gap: number; significant: boolean }>;
  statParityScore?: number;
  equalOpportunityScore?: number;
  industryBenchmarks?: Record<string, unknown>;
  companyComparison?: Record<string, unknown>;
  underrepresentedGaps?: Record<string, { gap: number; trending: string }>;
  biasAlerts: string[];
  improvementActions?: Record<string, string[]>;
  priorityFixes: string[];
  eeocCompliant: boolean;
  gdprCompliant: boolean;
  localCompliance?: Record<string, boolean>;
  overallDIScore: number;
  diGrade: DIGrade;
  analyzedBy?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  analysisDate: string;
}

export interface JobPostingBiasAnalysis {
  title: string;
  overallScore: number;
  genderNeutrality: {
    score: number;
    flaggedTerms: Array<{ term: string; suggestion: string; reason: string }>;
  };
  ageNeutrality: {
    score: number;
    flaggedTerms: Array<{ term: string; suggestion: string; reason: string }>;
  };
  accessibilityInclusion: {
    score: number;
    suggestions: string[];
  };
  culturalInclusion: {
    score: number;
    suggestions: string[];
  };
  recommendations: string[];
}

// 2.1.11 - Explainable AI Scores
export type ConfidenceLevelType = 'HIGH' | 'MEDIUM' | 'LOW';
export type DataQuality = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ScoreExplanation {
  id: string;
  userId?: string;
  scoreType: string;
  scoreId: string;
  scoreValue: number;
  summary: string;
  headline: string;
  confidenceLevel: ConfidenceLevelType;
  components: Array<{
    name: string;
    weight: number;
    score: number;
    contribution: number;
    explanation: string;
  }>;
  topContributors: Array<{
    factor: string;
    impact: string;
    reason: string;
  }>;
  topDetractors: Array<{
    factor: string;
    impact: string;
    reason: string;
  }>;
  factors: Record<string, { weight: number; rawScore: number; normalizedScore: number; dataPoints?: number }>;
  factorWeights: Record<string, unknown>;
  factorSources: Record<string, string>;
  percentileRank?: number;
  similarProfiles?: {
    count: number;
    averageScore: number;
    medianScore: number;
    yourRank: string;
  };
  benchmarkComparison?: {
    roleAverage: number;
    industryAverage: number;
    topPerformers: number;
    yourPosition: string;
  };
  improvementSuggestions?: Array<{
    action: string;
    potentialImpact: string;
    effort: string;
  }>;
  sensitivityAnalysis?: Record<string, string>;
  visualizations?: {
    radarChart?: Record<string, number>;
    trendLine?: Record<string, number>;
    distribution?: { yourScore: number; distribution: string; mean: number; stdDev: number };
  };
  highlights: string[];
  algorithmVersion: string;
  dataPoints: number;
  dataQuality: DataQuality;
  limitations: string[];
  helpfulRating?: number;
  feedbackText?: string;
  feedbackDate?: string;
  generatedAt: string;
  expiresAt?: string;
}

// 2.1.12 - Score Calibration
export type CalibrationScope = 'COMPANY_WIDE' | 'DEPARTMENT' | 'JOB_FAMILY' | 'SPECIFIC_JOB';
export type CalibrationStatus = 'DRAFT' | 'TESTING' | 'VALIDATED' | 'ACTIVE' | 'ARCHIVED';

export interface ScoreCalibration {
  id: string;
  companyId: string;
  createdBy: string;
  calibrationName: string;
  description?: string;
  scope: CalibrationScope;
  jobFamilies: string[];
  departments: string[];
  jobIds: string[];
  profileScoreWeights?: Record<string, number>;
  jobFitWeights?: Record<string, number>;
  cultureFitWeights?: Record<string, number>;
  technicalWeights?: Record<string, number>;
  minimumThresholds?: Record<string, number>;
  knockoutCriteria?: Record<string, unknown>;
  bonusCriteria?: Record<string, unknown>;
  customRules?: unknown[];
  skillPriorities?: Record<string, number>;
  experienceWeighting?: Record<string, number>;
  benchmarkSource?: string;
  benchmarkData?: Record<string, unknown>;
  validationStatus: CalibrationStatus;
  testResults?: Record<string, unknown>;
  validatedBy?: string;
  validatedAt?: string;
  candidatesScored: number;
  hireCorrelation?: number;
  retentionCorrelation?: number;
  performanceCorrelation?: number;
  isABTest: boolean;
  controlCalibrationId?: string;
  testStartDate?: string;
  testEndDate?: string;
  version: number;
  previousVersionId?: string;
  changeLog?: Record<string, unknown>;
  isActive: boolean;
  activatedAt?: string;
  deactivatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalibrationTestResults {
  calibrationId: string;
  sampleSize: number;
  results: {
    avgScoreChange: number;
    candidatesAffected: number;
    scoresIncreased: number;
    scoresDecreased: number;
    thresholdImpact: {
      wouldPass: number;
      wouldFail: number;
      noChange: number;
    };
  };
  comparison: {
    currentCalibration: { avgScore: number; passRate: number };
    newCalibration: { avgScore: number; passRate: number };
  };
  recommendations: string[];
}

export interface CalibrationPerformance {
  calibrationId: string;
  period: string;
  metrics: {
    candidatesScored: number;
    averageScore: number;
    hireRate: number;
    offerAcceptRate: number;
  };
  correlations: {
    hireSuccess: { correlation: number; significance: string };
    retention: { correlation: number; significance: string };
    performance: { correlation: number; significance: string };
  };
  scoreDistribution: Record<string, number>;
  hiringOutcomes: Record<string, { avgScore: number; successRate: number }>;
  recommendations: string[];
}

// ============================================
// BATCH 11: AI CONTENT GENERATION FOR RECRUITERS
// ============================================

// Seniority Level Type
export type SeniorityLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';

// Employment Type
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

// Work Mode Type
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';

// Education Level Type
export type EducationLevel = 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELORS' | 'MASTERS' | 'PHD';

// Job Description Status
export type JobDescriptionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// Interview Round Type
export type InterviewRound = 'SCREENING' | 'TECHNICAL' | 'BEHAVIORAL' | 'FINAL' | 'ONSITE';

// Question Category
export type QuestionCategory = 'TECHNICAL' | 'BEHAVIORAL' | 'SITUATIONAL' | 'CULTURE_FIT' | 'PROBLEM_SOLVING' | 'LEADERSHIP';

// Question Difficulty
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

// Bias Category
export type BiasCategory = 'gender' | 'age' | 'ability' | 'cultural' | 'education' | 'socioeconomic';

// Bias Severity
export type BiasSeverity = 'MINOR' | 'MODERATE' | 'SEVERE';

// Inclusivity Grade
export type InclusivityGrade = 'A' | 'B' | 'C' | 'D' | 'F';

// Market Comparison
export type MarketComparison = 'BELOW_MARKET' | 'AT_MARKET' | 'ABOVE_MARKET';

// Confidence Level
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// 2.2.1 - Generated Job Description
export interface GeneratedJobDescription {
  id: string;
  companyId: string;
  createdById: string;

  // Input Parameters
  jobTitle: string;
  department?: string;
  seniorityLevel: SeniorityLevel;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location?: string;

  // Requirements Input
  requiredSkills: string[];
  preferredSkills?: string[];
  yearsExperience?: number;
  educationLevel?: EducationLevel;

  // Company Context
  companyDescription?: string;
  teamSize?: number;
  reportingTo?: string;

  // Generated Content
  generatedTitle?: string;
  generatedSummary?: string;
  generatedResponsibilities?: string[];
  generatedRequirements?: GeneratedRequirement[];
  generatedBenefits?: string[];
  generatedQualifications?: string[];
  fullDescription?: string;

  // AI Metadata
  modelVersion: string;
  promptTokens?: number;
  completionTokens?: number;
  generationTimeMs?: number;
  confidenceScore?: number;

  // Quality Scores
  readabilityScore?: number;
  inclusivityScore?: number;
  seoScore?: number;
  completenessScore?: number;

  // Usage
  status: JobDescriptionStatus;
  usedInJobPostings?: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedRequirement {
  skill: string;
  level: 'Expert' | 'Proficient' | 'Familiar';
  required: boolean;
}

export interface GenerateJobDescriptionInput {
  jobTitle: string;
  department?: string;
  seniorityLevel: SeniorityLevel;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location?: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  yearsExperience?: number;
  educationLevel?: EducationLevel;
  companyDescription?: string;
  teamSize?: number;
  reportingTo?: string;
}

// 2.2.2 - Job Title Suggestion
export interface JobTitleSuggestion {
  id: string;
  originalTitle: string;
  companyId?: string;
  createdById: string;

  // Suggestions
  suggestions: TitleSuggestionOption[];

  // Best Suggestion
  recommendedTitle: string;
  recommendationReason?: string;

  // Analysis
  originalTitleIssues?: TitleIssue[];
  keywordAnalysis?: KeywordAnalysis;
  competitorTitles?: string[];
  industryTrends?: IndustryTrends;

  // Scores
  originalSeoScore?: number;
  originalInclusivityScore?: number;
  improvedSeoScore?: number;
  improvedInclusivityScore?: number;

  // Metadata
  modelVersion: string;
  createdAt: string;
}

export interface TitleSuggestionOption {
  title: string;
  seoScore: number;
  inclusivityScore: number;
  clarityScore: number;
  industryMatch: number;
  reasoning: string;
}

export interface TitleIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high';
}

export interface KeywordAnalysis {
  topKeywords: string[];
  searchVolume: {
    high: string[];
    medium: string[];
    low: string[];
  };
}

export interface IndustryTrends {
  rising: string[];
  stable: string[];
  declining: string[];
}

// 2.2.3 - Requirements Analysis
export interface RequirementsAnalysis {
  id: string;
  jobDescriptionId?: string;
  companyId?: string;
  createdById: string;

  // Input
  rawRequirements: string;
  jobTitle?: string;
  industry?: string;

  // Analysis Results
  essentialRequirements: AnalyzedRequirement[];
  niceToHaveRequirements: AnalyzedRequirement[];

  // Categorization
  technicalSkills?: AnalyzedRequirement[];
  softSkills?: SkillRequirement[];
  educationRequirements?: EducationRequirementItem[];
  experienceRequirements?: ExperienceRequirement[];
  certificationRequirements?: CertificationRequirement[];

  // Issues & Recommendations
  overlyRestrictive?: RequirementIssue[];
  potentiallyBiased?: RequirementIssue[];
  marketMismatch?: RequirementIssue[];
  recommendations?: string[];

  // Metrics
  essentialCount: number;
  niceToHaveCount: number;
  restrictiveScore?: number;
  marketAlignmentScore?: number;

  // Metadata
  modelVersion: string;
  createdAt: string;
}

export interface AnalyzedRequirement {
  requirement: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PREFERRED';
  category: string;
  reasoning: string;
}

export interface SkillRequirement {
  skill: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface EducationRequirementItem {
  level: EducationLevel;
  field: string;
  required: boolean;
}

export interface ExperienceRequirement {
  years: string;
  type: string;
  required: boolean;
}

export interface CertificationRequirement {
  certification: string;
  required: boolean;
}

export interface RequirementIssue {
  requirement: string;
  issue: string;
}

// 2.2.4 - Inclusive Language Check
export interface InclusiveLanguageCheck {
  id: string;
  companyId?: string;
  createdById: string;

  // Input
  contentType: 'JOB_DESCRIPTION' | 'JOB_TITLE' | 'EMAIL' | 'MESSAGE';
  originalContent: string;

  // Analysis
  overallScore: number;
  grade: InclusivityGrade;

  // Issues Found
  issues: BiasIssue[];

  // Categories
  genderBiasIssues?: BiasIssue[];
  ageBiasIssues?: BiasIssue[];
  abilityBiasIssues?: BiasIssue[];
  culturalBiasIssues?: BiasIssue[];
  educationBiasIssues?: BiasIssue[];
  socioeconomicBiasIssues?: BiasIssue[];

  // Suggestions
  suggestedContent?: string;
  alternativePhrases?: AlternativePhrase[];

  // Statistics
  issueCount: number;
  severeIssueCount: number;
  moderateIssueCount: number;
  minorIssueCount: number;

  // Tone Analysis
  toneAnalysis?: ToneAnalysis;
  readabilityLevel?: string;
  wordCount?: number;

  // Metadata
  modelVersion: string;
  processingTimeMs?: number;
  createdAt: string;
}

export interface BiasIssue {
  phrase: string;
  issue: string;
  severity: BiasSeverity;
  category: BiasCategory;
  suggestion: string;
  startIndex?: number;
  endIndex?: number;
}

export interface AlternativePhrase {
  original: string;
  suggested: string;
  reason: string;
}

export interface ToneAnalysis {
  formal: number;
  friendly: number;
  professional: number;
  inclusive: number;
  aggressive?: number;
}

// 2.2.5 - Salary Range Suggestion
export interface SalaryRangeSuggestion {
  id: string;
  companyId?: string;
  createdById: string;

  // Input Parameters
  jobTitle: string;
  normalizedTitle?: string;
  location: string;
  country: string;
  state?: string;
  city?: string;

  seniorityLevel: SeniorityLevel;
  yearsExperience?: number;
  requiredSkills?: string[];
  industry?: string;
  companySize?: string;
  employmentType: EmploymentType;

  // Suggested Range
  currency: string;
  suggestedMin: number;
  suggestedMax: number;
  suggestedMidpoint: number;

  // Confidence
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;

  // Market Data
  marketPercentile25?: number;
  marketMedian?: number;
  marketPercentile75?: number;
  marketPercentile90?: number;

  // Comparisons
  industryComparison?: MarketComparison;
  locationComparison?: MarketComparison;
  companyComparison?: MarketComparison;

  // Factors
  salaryFactors?: SalaryFactor[];
  skillPremiums?: SkillPremium[];
  locationAdjustment?: number;

  // Recommendations
  recommendations?: string[];
  competitivenessScore?: number;

  // Data Sources
  dataSources?: string[];
  dataFreshness?: string;
  sampleSize?: number;

  // Metadata
  modelVersion: string;
  calculatedAt: string;
}

export interface SalaryFactor {
  factor: string;
  impact: string;
  description: string;
}

export interface SkillPremium {
  skill: string;
  premium: number;
}

// 2.2.6 - Generated Interview Questions
export interface GeneratedInterviewQuestions {
  id: string;
  companyId?: string;
  createdById: string;
  jobId?: string;

  // Input
  jobTitle: string;
  seniorityLevel: SeniorityLevel;
  department?: string;
  requiredSkills?: string[];
  competencies?: string[];
  interviewRound?: InterviewRound;
  interviewDuration?: number;

  // Generated Questions
  questions: InterviewQuestion[];

  // Question Categories
  technicalQuestions?: InterviewQuestion[];
  behavioralQuestions?: InterviewQuestion[];
  situationalQuestions?: InterviewQuestion[];
  cultureFitQuestions?: InterviewQuestion[];
  problemSolvingQuestions?: InterviewQuestion[];
  leadershipQuestions?: InterviewQuestion[];

  // Question Bank Metadata
  totalQuestions: number;
  estimatedDuration?: number;
  difficultyDistribution?: DifficultyDistribution;

  // Evaluation Guide
  scoringRubric?: Record<number, string>;
  mustAskQuestions?: string[];
  optionalQuestions?: string[];

  // Compliance
  legalCompliance: boolean;
  complianceNotes?: string[];
  avoidedTopics?: string[];

  // Usage Tracking
  timesUsed: number;
  averageRating?: number;
  feedback?: QuestionFeedback[];

  // Metadata
  modelVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  question: string;
  category: QuestionCategory;
  skill?: string;
  difficulty: QuestionDifficulty;
  expectedDuration: number;
  evaluationCriteria?: string[];
  followUps?: string[];
  redFlags?: string[];
  greenFlags?: string[];
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface QuestionFeedback {
  rating: number;
  feedback: string;
  date: string;
}

export interface GenerateInterviewQuestionsInput {
  jobTitle: string;
  seniorityLevel: SeniorityLevel;
  department?: string;
  requiredSkills?: string[];
  competencies?: string[];
  interviewRound?: InterviewRound;
  interviewDuration?: number;
  jobId?: string;
}

// ============================================
// BATCH 12: EXTENDED AI CONTENT GENERATION
// ============================================

// Rejection Stage
export type RejectionStage = 'SCREENING' | 'INTERVIEW' | 'FINAL' | 'OFFER';

// Tone Level
export type ToneLevel = 'WARM' | 'PROFESSIONAL' | 'FORMAL';

// Offer Status
export type OfferStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'SIGNED' | 'DECLINED' | 'EXPIRED';

// A/B Test Status
export type ABTestStatus = 'SETUP' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

// Market Position
export type MarketPosition = 'LEADER' | 'COMPETITIVE' | 'BEHIND' | 'UNKNOWN';

// 2.2.7 - Screening Criteria
export interface ScreeningCriteria {
  id: string;
  companyId: string;
  createdById: string;
  jobId?: string;

  // Input
  jobTitle: string;
  seniorityLevel: SeniorityLevel;
  requiredSkills?: string[];
  department?: string;

  // Generated Criteria
  knockoutQuestions: KnockoutQuestion[];
  scoringQuestions: ScoringQuestion[];
  mustHaveCriteria: MustHaveCriterion[];
  preferredCriteria?: PreferredCriterion[];

  // Filters
  experienceFilters?: ExperienceFilter;
  educationFilters?: EducationFilter;
  locationFilters?: LocationFilter;
  salaryFilters?: SalaryFilter;
  availabilityFilters?: AvailabilityFilter;

  // Scoring Configuration
  totalPossibleScore: number;
  passingThreshold: number;
  autoAdvanceThreshold?: number;

  // Compliance
  legalCompliance: boolean;
  complianceNotes?: string[];

  // Usage
  status: string;
  timesUsed: number;

  // Metadata
  modelVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnockoutQuestion {
  question: string;
  type: 'YES_NO' | 'MULTIPLE_CHOICE';
  expectedAnswer: string;
  weight: number;
  reasoning: string;
}

export interface ScoringQuestion {
  question: string;
  type: 'MULTIPLE_CHOICE' | 'SCALE' | 'TEXT';
  options: string[];
  weights: number[];
  maxScore: number;
}

export interface MustHaveCriterion {
  criterion: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  autoReject: boolean;
}

export interface PreferredCriterion {
  criterion: string;
  bonusPoints: number;
}

export interface ExperienceFilter {
  minYears?: number;
  maxYears?: number;
}

export interface EducationFilter {
  minimumLevel?: EducationLevel;
  preferredFields?: string[];
}

export interface LocationFilter {
  allowedLocations?: string[];
  remoteAllowed: boolean;
}

export interface SalaryFilter {
  minSalary?: number;
  maxSalary?: number;
  currency: string;
}

export interface AvailabilityFilter {
  maxStartDateDays?: number;
  visaRequired?: boolean;
}

// 2.2.8 - Candidate Summary
export interface CandidateSummary {
  id: string;
  companyId: string;
  createdById: string;
  candidateId: string;
  jobId?: string;
  applicationId?: string;

  // Candidate Info
  candidateName: string;
  candidateTitle?: string;

  // Generated Content
  executiveSummary: string;
  strengthsHighlight: StrengthItem[];
  concernsHighlight?: ConcernItem[];
  uniqueValue?: string;

  // Fit Analysis
  roleAlignment: RoleAlignment;
  experienceRelevance?: ExperienceRelevance;
  skillMatch?: SkillMatch;
  cultureIndicators?: CultureIndicators;

  // Recommendations
  interviewFocus?: string[];
  redFlags?: string[];
  negotiationInsights?: NegotiationInsights;

  // Quick Facts
  yearsExperience?: number;
  currentCompany?: string;
  educationLevel?: string;
  locationMatch?: boolean;
  salaryExpectation?: string;

  // Quality Metrics
  confidenceScore?: number;
  dataCompleteness?: number;

  // Status
  status: string;
  reviewedBy?: string;
  reviewNotes?: string;

  // Metadata
  modelVersion: string;
  generatedAt: string;
  updatedAt: string;
}

export interface StrengthItem {
  strength: string;
  evidence: string;
}

export interface ConcernItem {
  concern: string;
  mitigation?: string;
}

export interface RoleAlignment {
  score: number;
  keyMatches: string[];
  gaps: string[];
}

export interface ExperienceRelevance {
  totalYears: number;
  relevantYears: number;
  highlights: string[];
}

export interface SkillMatch {
  matched: string[];
  partial: string[];
  missing: string[];
}

export interface CultureIndicators {
  workStyle: string;
  values: string[];
  redFlags: string[];
}

export interface NegotiationInsights {
  likelyPriorities: string[];
  salaryFlexibility: string;
}

// 2.2.9 - Rejection Email
export interface RejectionEmail {
  id: string;
  companyId: string;
  createdById: string;
  candidateId?: string;
  applicationId?: string;

  // Context
  candidateName: string;
  jobTitle: string;
  rejectionStage: RejectionStage;
  rejectionReason?: string;

  // Generated Content
  subject: string;
  greeting: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  signature?: string;
  fullEmail: string;

  // Personalization
  positiveFeedback?: string[];
  constructiveFeedback?: string[];
  futureEncouragement?: string;

  // Tone Settings
  toneLevel: ToneLevel;
  includesFeedback: boolean;
  includesReapplyInfo: boolean;

  // Quality Metrics
  empathyScore?: number;
  professionalismScore?: number;
  clarityScore?: number;

  // Usage
  status: string;
  sentAt?: string;
  openedAt?: string;

  // Metadata
  modelVersion: string;
  createdAt: string;
}

// 2.2.10 - Offer Letter
export interface OfferLetter {
  id: string;
  companyId: string;
  createdById: string;
  candidateId: string;
  applicationId?: string;
  jobId?: string;

  // Candidate & Role
  candidateName: string;
  jobTitle: string;
  department?: string;
  reportingTo?: string;
  startDate?: string;

  // Compensation
  baseSalary: number;
  currency: string;
  payFrequency: string;
  signingBonus?: number;
  annualBonus?: number;
  bonusStructure?: string;

  // Equity
  equityGrant?: number;
  equityType?: string;
  vestingSchedule?: string;
  cliffPeriod?: number;

  // Benefits
  healthBenefits?: HealthBenefits;
  retirementBenefits?: RetirementBenefits;
  ptoPolicy?: string;
  otherBenefits?: string[];

  // Terms
  employmentType: EmploymentType;
  workLocation?: string;
  workSchedule?: string;
  probationPeriod?: number;
  noticePeriod?: number;

  // Generated Content
  openingParagraph: string;
  compensationSection: string;
  benefitsSection: string;
  termsSection: string;
  closingSection: string;
  fullLetter: string;

  // Legal
  contingencies?: string[];
  legalDisclosures?: string[];
  expirationDate?: string;

  // Status
  status: OfferStatus;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  declinedAt?: string;
  declineReason?: string;

  // Metadata
  templateVersion?: string;
  modelVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthBenefits {
  medical: boolean;
  dental: boolean;
  vision: boolean;
}

export interface RetirementBenefits {
  type: string;
  matchPercentage?: number;
}

// 2.2.11 - Job Ad A/B Testing
export interface JobAdVariant {
  id: string;
  companyId: string;
  createdById: string;
  jobId: string;
  testId: string;

  // Variant Info
  variantName: string;
  variantType: string;

  // Content
  title?: string;
  summary?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  fullContent?: string;

  // What was changed
  changesFromControl: VariantChange[];
  changeRationale?: string;

  // Performance Metrics
  impressions: number;
  clicks: number;
  applications: number;
  qualifiedApplications: number;

  // Calculated Metrics
  clickThroughRate?: number;
  applicationRate?: number;
  qualityRate?: number;

  // A/B Test Config
  trafficPercentage: number;
  isControl: boolean;
  isWinner?: boolean;

  // Status
  status: string;
  startedAt?: string;
  endedAt?: string;

  // Metadata
  modelVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VariantChange {
  field: string;
  originalValue: string;
  newValue: string;
}

export interface JobAdTest {
  id: string;
  companyId: string;
  createdById: string;
  jobId: string;

  // Test Configuration
  testName: string;
  testType: string;
  hypothesis?: string;

  // Variants
  variantCount: number;
  controlVariantId?: string;

  // Duration
  minSampleSize: number;
  maxDuration?: number;
  actualStartDate?: string;
  actualEndDate?: string;

  // Results
  winningVariantId?: string;
  statisticalSignificance?: number;
  confidenceLevel?: number;
  liftPercentage?: number;

  // Insights
  keyFindings?: string[];
  recommendations?: string[];

  // Status
  status: ABTestStatus;
  completedAt?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ABTestResults {
  test: JobAdTest;
  variants: JobAdVariant[];
  analysis: {
    winner: string;
    liftPercentage: number;
    statisticalSignificance: number;
    recommendation: string;
  };
}

// 2.2.12 - Competitor Analysis
export interface CompetitorJobAnalysis {
  id: string;
  companyId: string;
  createdById: string;
  jobId?: string;

  // Target Job
  ourJobTitle: string;
  ourJobDepartment?: string;

  // Competitor Data
  competitorJobs: CompetitorJob[];

  // Analysis Results
  salaryComparison: SalaryComparison;
  benefitsComparison?: BenefitsComparison;
  requirementsComparison?: RequirementsComparison;
  titleComparison?: TitleComparison;

  // Insights
  competitiveStrengths: CompetitiveInsight[];
  competitiveWeaknesses: CompetitiveInsight[];
  marketTrends?: string[];
  recommendations: string[];

  // Scores
  overallCompetitivenessScore: number;
  salaryCompetitivenessScore?: number;
  benefitsCompetitivenessScore?: number;
  requirementsReasonablenessScore?: number;

  // Market Position
  marketPosition: MarketPosition;

  // Data Quality
  competitorCount: number;
  dataFreshness: string;
  confidenceScore: number;

  // Metadata
  modelVersion: string;
  analyzedAt: string;
  expiresAt?: string;
}

export interface CompetitorJob {
  company: string;
  title: string;
  url?: string;
  salary?: { min: number; max: number };
  benefits?: string[];
  requirements?: string[];
  scrapedAt: string;
}

export interface SalaryComparison {
  ourRange: { min: number; max: number };
  marketMin: number;
  marketMedian: number;
  marketMax: number;
  percentile: number;
}

export interface BenefitsComparison {
  ourBenefits: string[];
  commonBenefits: string[];
  uniqueCompetitorBenefits: string[];
  ourUniqueBenefits: string[];
}

export interface RequirementsComparison {
  ourRequirements: string[];
  commonRequirements: string[];
  competitorOnlyReqs: string[];
}

export interface TitleComparison {
  ourTitle: string;
  alternatives: string[];
  recommendation?: string;
}

export interface CompetitiveInsight {
  area: string;
  detail: string;
}

// ==========================================
// BATCH 13: AI Content Generation for Candidates (2.3.1-2.3.6)
// ==========================================

// 2.3.1 - AI Profile Enhancer
export type ProfileSection = 'SUMMARY' | 'EXPERIENCE' | 'SKILLS' | 'EDUCATION' | 'PROJECTS';
export type EnhancementStatus = 'GENERATED' | 'APPLIED' | 'DISMISSED';

export interface ProfileEnhancementSuggestion {
  type: string;
  suggestion: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  example?: string;
  keywords?: string[];
}

export interface ProfileEnhancementAnalysis {
  wordCount: number;
  sentenceCount: number;
  hasMetrics: boolean;
  hasActionVerbs: boolean;
  readabilityScore: number;
  toneAnalysis: string;
}

export interface ProfileEnhancement {
  id: string;
  userId: string;
  profileSection: ProfileSection;
  currentContent: string;
  analysisResults: ProfileEnhancementAnalysis;
  suggestions: ProfileEnhancementSuggestion[];
  enhancedContent?: string;
  keyImprovements: string[];
  originalScore: number;
  potentialScore: number;
  improvementPercentage: number;
  clarityImprovements?: string[];
  impactImprovements?: string[];
  keywordImprovements?: string[];
  formattingImprovements?: string[];
  status: EnhancementStatus;
  appliedAt?: Date;
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2.3.2 - Experience Description Generator
export interface ExperienceDescriptionVariations {
  concise: string[];
  detailed: string[];
  technical: string[];
}

export interface ExperienceDescriptionTones {
  professional: string;
  casual: string;
  technical: string;
}

export interface ImpactStatement {
  metric: string;
  category: string;
}

export interface ExperienceDescription {
  id: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  industry?: string;
  duration?: string;
  responsibilities?: string[];
  technologies?: string[];
  achievements?: string[];
  generatedSummary: string;
  generatedBullets: string[];
  impactStatements: ImpactStatement[];
  skillsHighlighted: string[];
  variations?: ExperienceDescriptionVariations;
  toneOptions?: ExperienceDescriptionTones;
  atsKeywords: string[];
  industryTerms?: string[];
  actionVerbs: string[];
  impactScore: number;
  clarityScore: number;
  atsScore: number;
  status: EnhancementStatus;
  selectedVariation?: string;
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2.3.3 - Skills Gap Identifier
export interface SkillRequirement {
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'TECHNICAL' | 'SOFT_SKILL';
}

export interface SkillGap {
  skill: string;
  currentLevel?: number;
  requiredLevel: number;
}

export interface TransferableSkill {
  skill: string;
  transfersTo: string;
  transferability: number;
}

export interface LearningPathStep {
  step: number;
  skill: string;
  duration: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ResourceRecommendation {
  skill: string;
  resource: string;
  type: 'COURSE' | 'BOOK' | 'PROJECT' | 'CERTIFICATION';
  url?: string;
}

export interface SkillMarketDemand {
  demand: 'HIGH' | 'MEDIUM' | 'LOW';
  growth: string;
}

export interface SkillsGapAnalysis {
  id: string;
  userId: string;
  targetJobId?: string;
  targetJobTitle: string;
  targetIndustry?: string;
  targetSeniority?: string;
  currentSkills: string[];
  skillLevels: Record<string, number>;
  requiredSkills: SkillRequirement[];
  missingSkills: SkillRequirement[];
  underDevelopedSkills: SkillGap[];
  transferableSkills: TransferableSkill[];
  criticalGaps: SkillRequirement[];
  importantGaps: SkillRequirement[];
  niceToHaveGaps: SkillRequirement[];
  learningPath: LearningPathStep[];
  resourceRecommendations: ResourceRecommendation[];
  timeEstimates: Record<string, string>;
  priorityRanking: string[];
  marketDemand?: Record<string, SkillMarketDemand>;
  salaryImpact?: Record<string, string>;
  competitorAnalysis?: Record<string, unknown>;
  overallReadiness: number;
  technicalReadiness?: number;
  softSkillReadiness?: number;
  experienceAlignment?: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  modelVersion: string;
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 2.3.4 - Cover Letter Generator
export interface CoverLetterVariations {
  formal: string;
  friendly: string;
  enthusiastic: string;
}

export interface CoverLetterLengthVariations {
  brief: string;
  standard: string;
  detailed: string;
}

export interface CoverLetter {
  id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  companyName: string;
  companyDescription?: string;
  jobDescription?: string;
  whyInterested?: string;
  relevantExperience?: string[];
  keyAchievements?: string[];
  connectionToCompany?: string;
  opening: string;
  body: string;
  closing: string;
  fullLetter: string;
  toneVariations?: CoverLetterVariations;
  lengthVariations?: CoverLetterLengthVariations;
  focusVariations?: Record<string, string>;
  keywordsUsed: string[];
  skillsHighlighted: string[];
  achievementsMentioned: string[];
  relevanceScore: number;
  persuasivenessScore: number;
  professionalismScore: number;
  atsScore: number;
  status: 'DRAFT' | 'FINALIZED' | 'SENT';
  selectedTone?: string;
  selectedLength?: string;
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2.3.5 - Interview Prep Coach
export type InterviewType = 'PHONE' | 'VIDEO' | 'ONSITE' | 'TECHNICAL' | 'BEHAVIORAL';
export type InterviewPrepStatus = 'PREPARING' | 'READY' | 'COMPLETED';

export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  framework?: string;
}

export interface CompanyInfo {
  description: string;
  culture: string;
  values: string[];
}

export interface CompanyNews {
  headline: string;
  date: string;
}

export interface AnswerFramework {
  [key: string]: string;
}

export interface PracticeSession {
  date: Date;
  answers: Record<string, string>;
  feedback: Record<string, unknown>;
}

export interface InterviewPrep {
  id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  companyName: string;
  interviewType: InterviewType;
  companyInfo?: CompanyInfo;
  recentNews?: CompanyNews[];
  interviewerInfo?: Record<string, unknown>;
  commonQuestions: InterviewQuestion[];
  technicalQuestions?: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];
  situationalQuestions?: InterviewQuestion[];
  companySpecificQuestions?: InterviewQuestion[];
  sampleAnswers: Record<string, string>;
  answerFrameworks: Record<string, AnswerFramework>;
  keyPointsToMention: string[];
  thingsToAvoid: string[];
  questionsForInterviewer: string[];
  questionsToAvoid: string[];
  preparationChecklist: string[];
  dayOfTips: string[];
  commonMistakes: string[];
  bodyLanguageTips?: string[];
  practiceHistory?: PracticeSession[];
  feedbackHistory?: Record<string, unknown>[];
  improvementAreas?: string[];
  preparednessScore?: number;
  practiceSessionsCompleted: number;
  estimatedConfidence?: number;
  status: InterviewPrepStatus;
  interviewDate?: Date;
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2.3.6 - Salary Negotiation Advisor
export type NegotiationStatus = 'ADVISING' | 'NEGOTIATING' | 'COMPLETED';
export type NegotiationOutcome = 'WON' | 'PARTIAL' | 'DECLINED' | 'ACCEPTED_AS_IS';
export type MarketTrend = 'RISING' | 'STABLE' | 'DECLINING';
export type DemandLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SalaryMarketData {
  minimum: number;
  maximum: number;
  median: number;
  percentile25: number;
  percentile75: number;
  percentile90: number;
}

export interface NegotiationRange {
  min: number;
  max: number;
  target: number;
}

export interface NegotiationScript {
  opener: string;
  valueProposition: string;
  ask: string;
  closing: string;
}

export interface TimingAdvice {
  when: string;
  deadline: string;
  bestTime: string;
}

export interface AlternativeNegotiation {
  signingBonus: string;
  reviewTimeline: string;
  title: string;
  startDate: string;
}

export interface BenefitsNegotiation {
  pto: string;
  remote: string;
  education: string;
  equipment: string;
}

export interface SalaryNegotiationAdvice {
  id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  companyName?: string;
  location: string;
  industry?: string;
  currentSalary?: number;
  yearsExperience: number;
  highestEducation?: string;
  relevantCertifications?: string[];
  uniqueSkills?: string[];
  offeredSalary?: number;
  offeredBonus?: number;
  offeredEquity?: Record<string, unknown>;
  offeredBenefits?: string[];
  marketData: SalaryMarketData;
  percentilePosition: number;
  marketTrend?: MarketTrend;
  demandLevel?: DemandLevel;
  targetSalary: number;
  minimumAcceptable: number;
  anchorNumber: number;
  negotiationRange: NegotiationRange;
  negotiationScript: NegotiationScript;
  counterArguments: Record<string, string>;
  timingAdvice: TimingAdvice;
  leveragePoints: string[];
  alternativeAsk: AlternativeNegotiation;
  benefitsNegotiation: BenefitsNegotiation;
  signingBonusAdvice?: { suggested: number; reasoning: string };
  equityNegotiation?: { vesting: string; amount: string };
  riskLevel: RiskLevel;
  offerRescindRisk: number;
  marketAlternatives?: string[];
  finalSalary?: number;
  finalBonus?: number;
  finalEquity?: Record<string, unknown>;
  negotiationOutcome?: NegotiationOutcome;
  lessonsLearned?: string[];
  status: NegotiationStatus;
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types for Batch 13 APIs
export interface EnhanceProfileRequest {
  profileSection: ProfileSection;
  currentContent: string;
}

export interface GenerateExperienceRequest {
  jobTitle: string;
  companyName: string;
  industry?: string;
  duration?: string;
  responsibilities?: string[];
  technologies?: string[];
  achievements?: string[];
}

export interface AnalyzeSkillsGapRequest {
  targetJobId?: string;
  targetJobTitle: string;
  targetIndustry?: string;
  targetSeniority?: string;
  currentSkills?: string[];
}

export interface GenerateCoverLetterRequest {
  jobId?: string;
  jobTitle: string;
  companyName: string;
  companyDescription?: string;
  jobDescription?: string;
  whyInterested?: string;
  relevantExperience?: string[];
  keyAchievements?: string[];
  connectionToCompany?: string;
}

export interface GenerateInterviewPrepRequest {
  jobId?: string;
  jobTitle: string;
  companyName: string;
  interviewType: InterviewType;
}

export interface GetSalaryAdviceRequest {
  jobId?: string;
  jobTitle: string;
  companyName?: string;
  location: string;
  industry?: string;
  currentSalary?: number;
  yearsExperience: number;
  offeredSalary?: number;
  offeredBonus?: number;
  offeredEquity?: Record<string, unknown>;
  offeredBenefits?: string[];
}

export interface RecordNegotiationOutcomeRequest {
  finalSalary?: number;
  finalBonus?: number;
  finalEquity?: Record<string, unknown>;
  outcome: NegotiationOutcome;
  lessonsLearned?: string[];
}

// ============================================
// BATCH 14: EXTENDED AI FOR CANDIDATES & NLP
// Features 2.3.7-2.4.4
// ============================================

// 2.3.7 - Career Path Advisor Types
export type CareerLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'DIRECTOR' | 'VP' | 'C_LEVEL';
export type TransitionDifficulty = 'EASY' | 'MODERATE' | 'CHALLENGING' | 'DIFFICULT';
export type Timeframe = '1_YEAR' | '2_YEARS' | '5_YEARS';

export interface CareerPath {
  pathId: number;
  name: string;
  steps: Array<{
    step: number;
    role: string;
    timeline: string;
  }>;
  probability: number;
}

export interface CareerMilestone {
  milestone: string;
  priority: Priority;
  deadline: string;
}

export interface SkillGapItem {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: Priority;
}

export interface ExperienceGap {
  experience: string;
  gap: string;
  suggestion: string;
}

export interface CareerPathAdvice {
  id: string;
  userId: string;
  currentRole: string;
  currentLevel: CareerLevel;
  currentIndustry: string;
  yearsExperience: number;
  currentSkills: Record<string, unknown>[];
  currentSalary?: number;
  targetRoles: string[];
  targetLevel: CareerLevel;
  targetIndustry?: string;
  targetTimeframe: Timeframe;
  targetSalary?: number;
  priorities: Record<string, unknown>;
  careerPaths: CareerPath[];
  recommendedPath: CareerPath & { reason: string; confidence: number };
  milestones: CareerMilestone[];
  skillGaps: SkillGapItem[];
  experienceGaps: ExperienceGap[];
  transitionDifficulty: TransitionDifficulty;
  timeToTransition: string;
  marketDemand: MarketDemand;
  salaryProjection: Record<string, number>;
  riskAssessment: {
    risks: Array<{ risk: string; probability: number; impact: string }>;
    mitigations: string[];
  };
  immediateActions: string[];
  shortTermActions: string[];
  mediumTermActions: string[];
  longTermActions: string[];
  networkingAdvice: Record<string, unknown>;
  successFactors: string[];
  industryTrends: Array<{ trend: string; impact: string }>;
  alternativePaths: Array<{ path: string; viability: string; reason: string }>;
  modelVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerPathAdviceRequest {
  currentRole: string;
  currentLevel: CareerLevel;
  currentIndustry: string;
  yearsExperience: number;
  currentSkills: Array<{ skill: string; proficiency: number }>;
  currentSalary?: number;
  targetRoles: string[];
  targetLevel: CareerLevel;
  targetIndustry?: string;
  targetTimeframe: Timeframe;
  targetSalary?: number;
  priorities: Record<string, number>;
}

// 2.3.8 - Learning Recommendations Types
export type LearningGoal = 'SKILL_GAP' | 'CAREER_CHANGE' | 'UPSKILL' | 'CERTIFICATION';
export type LearningFormat = 'VIDEO' | 'READING' | 'HANDS_ON' | 'INSTRUCTOR_LED';
export type LearningLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Course {
  id: number;
  title: string;
  provider: string;
  duration: string;
  rating: number;
  price: number;
  skills: string[];
  relevance: number;
}

export interface Certification {
  name: string;
  provider: string;
  difficulty: string;
  prepTime: string;
  cost: number;
  salaryImpact: string;
}

export interface LearningRecommendation {
  id: string;
  userId: string;
  jobId?: string;
  learningGoal: LearningGoal;
  targetSkills: string[];
  currentLevel: LearningLevel;
  preferredFormat: LearningFormat[];
  timeAvailable: string;
  budget?: number;
  courses: Course[];
  certifications: Certification[];
  books: Array<{ title: string; author: string; relevance: number }>;
  tutorials: Array<{ title: string; platform: string; duration: string; free: boolean }>;
  projects: Array<{ title: string; skills: string[]; complexity: string; estimatedTime: string }>;
  communities: Array<{ name: string; platform: string; members: number }>;
  mentorship: Record<string, unknown>;
  learningPath: Array<{ phase: number; focus: string; duration: string }>;
  milestones: Array<{ week: number; milestone: string }>;
  estimatedDuration: string;
  priorityOrder: string[];
  courseraLinks: Array<{ url: string; title: string }>;
  udemyLinks: Array<{ url: string; title: string }>;
  linkedinLearning: Array<{ url: string; title: string }>;
  pluralsightLinks: Array<{ url: string; title: string }>;
  youtubeLinks: Array<{ url: string; title: string; free: boolean }>;
  freeResources: Array<{ title: string; url: string; type: string }>;
  skillValueIncrease: Record<string, { before: number; after: number; marketValue: string }>;
  salaryImpact?: number;
  marketabilityIncrease: string;
  completedItems: string[];
  currentProgress: number;
  startedAt?: string;
  completedAt?: string;
  modelVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningRecommendationRequest {
  learningGoal: LearningGoal;
  targetSkills: string[];
  currentLevel: LearningLevel;
  preferredFormat: LearningFormat[];
  timeAvailable: string;
  budget?: number;
  jobId?: string;
}

// 2.3.9 - Application Insights Types
export type RankEstimate = 'TOP_10' | 'TOP_25' | 'TOP_50' | 'UNKNOWN';
export type UrgencyLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ApplicationInsight {
  id: string;
  userId: string;
  applicationId: string;
  currentStage: string;
  stageDetails: Record<string, unknown>;
  timeInStage: number;
  averageTimeAtStage: number;
  competitorCount?: number;
  rankEstimate?: RankEstimate;
  strengthsVsField: Array<{ area: string; strength: string; details: string }>;
  weaknessesVsField: Array<{ area: string; weakness: string; details: string }>;
  advanceProbability: number;
  hireProbability: number;
  predictionFactors: Array<{ factor: string; impact: string; weight: number }>;
  confidenceLevel: ConfidenceLevel;
  immediateActions: string[];
  profileImprovements: string[];
  followUpAdvice: Record<string, unknown>;
  interviewTips?: string[];
  expectedNextStep: string;
  expectedTimeline: string;
  typicalProcessLength: number;
  urgencyLevel: UrgencyLevel;
  companyHiringPattern: Record<string, unknown>;
  roleCompetitiveness: string;
  seasonalFactors?: Array<{ factor: string; impact: string }>;
  redFlags: string[];
  positiveSignals: Array<{ signal: string; meaning: string }>;
  dealBreakers: string[];
  modelVersion: string;
  generatedAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  application?: {
    job: { title: string; companyName: string };
  };
}

// 2.3.10 - Portfolio Feedback Types
export type PortfolioType = 'GITHUB' | 'PERSONAL_WEBSITE' | 'BEHANCE' | 'DRIBBBLE' | 'OTHER';
export type LoadSpeed = 'FAST' | 'MEDIUM' | 'SLOW';
export type PortfolioGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface PortfolioFeedback {
  id: string;
  userId: string;
  portfolioUrl?: string;
  portfolioType: PortfolioType;
  projectCount: number;
  analyzedProjects: Record<string, unknown>[];
  overallScore: number;
  overallGrade: string;
  strengthAreas: Array<{ area: string; score: number; feedback: string }>;
  improvementAreas: Array<{ area: string; score: number; feedback: string }>;
  standoutProjects: Array<{ projectName: string; reason: string }>;
  visualAppeal: number;
  navigation: number;
  mobileResponsive: boolean;
  loadSpeed: LoadSpeed;
  accessibilityScore: number;
  presentationFeedback: string[];
  projectDescriptions: Record<string, unknown>;
  technicalDepth: number;
  problemSolving: number;
  realWorldImpact: number;
  contentFeedback: string[];
  techStackDiversity: number;
  codeQuality?: number;
  documentationQuality?: number;
  testCoverage?: number;
  technicalFeedback: string[];
  industryRelevance: number;
  trendAlignment: number;
  uniqueness: number;
  marketFeedback: string[];
  projectFeedback: Array<{
    project: string;
    score: number;
    strengths: string[];
    improvements: string[];
  }>;
  quickWins: Array<{ action: string; effort: string; impact: string }>;
  mediumEffort: Array<{ action: string; effort: string; impact: string }>;
  majorOverhauls: Array<{ action: string; effort: string; impact: string }>;
  prioritizedActions: Array<{ rank: number; action: string; reason: string }>;
  modelVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioFeedbackRequest {
  portfolioUrl?: string;
  portfolioType: PortfolioType;
  projects?: Array<{
    name: string;
    description: string;
    url?: string;
    technologies?: string[];
  }>;
}

// ============================================
// 2.4 NLP & CONTENT ANALYSIS Types
// ============================================

// 2.4.1 - Resume/Profile Parser Types
export type DocumentType = 'RESUME' | 'CV' | 'LINKEDIN_EXPORT' | 'PROFILE_EXPORT';
export type ParseStatus = 'PARSING' | 'PARSED' | 'FAILED' | 'NEEDS_REVIEW';
export type FormatQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location?: string;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

export interface ParsedDocument {
  id: string;
  userId?: string;
  documentType: DocumentType;
  fileName?: string;
  fileUrl?: string;
  rawText?: string;
  fileHash?: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Record<string, string[]>;
  certifications: Array<{ name: string; issuer: string; date: string }>;
  projects: Array<{ name: string; description: string; technologies: string[]; url?: string }>;
  publications?: Record<string, unknown>[];
  awards?: Array<{ name: string; issuer: string; date: string }>;
  languages?: Array<{ language: string; proficiency: string }>;
  volunteerWork?: Record<string, unknown>[];
  additionalSections?: Record<string, unknown>;
  parseConfidence: number;
  completenessScore: number;
  formatQuality: FormatQuality;
  issues: Array<{ section: string; issue: string }>;
  companies: string[];
  technologies: string[];
  locations: string[];
  dates: string[];
  urls: string[];
  seniorityLevel?: string;
  industryFocus?: string[];
  careerProgression?: Record<string, unknown>;
  keyAchievements?: string[];
  status: ParseStatus;
  errorMessage?: string;
  modelVersion: string;
  processingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParseDocumentRequest {
  documentType: DocumentType;
  fileName?: string;
  fileUrl?: string;
  rawText?: string;
}

// 2.4.2 - Skill Extraction Types
export type SkillSourceType = 'RESUME' | 'JOB_DESCRIPTION' | 'PROFILE' | 'PROJECT' | 'FREE_TEXT';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface ExtractedSkill {
  skill: string;
  confidence: number;
  mentions: number;
}

export interface SkillExtraction {
  id: string;
  userId?: string;
  sourceType: SkillSourceType;
  sourceId?: string;
  sourceText: string;
  skills: ExtractedSkill[];
  skillCategories: Record<string, string[]>;
  skillLevels: Record<string, SkillLevel>;
  skillRelationships: {
    clusters: Array<{ name: string; skills: string[] }>;
    dependencies: Array<{ skill: string; dependsOn: string[] }>;
  };
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  cloudPlatforms: string[];
  tools: string[];
  methodologies: string[];
  softSkills: string[];
  leadershipSkills: string[];
  communicationSkills: string[];
  domainExpertise: string[];
  certificationSkills: string[];
  coreCompetencies: string[];
  emergingSkills: string[];
  legacySkills: string[];
  rarityScores: Record<string, number>;
  marketDemand: Record<string, { demand: string; openRoles: number }>;
  salaryImpact: Record<string, { baseImpact: number; seniorImpact: number }>;
  trendingSkills: string[];
  overallConfidence: number;
  perSkillConfidence: Record<string, number>;
  modelVersion: string;
  processingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractSkillsRequest {
  sourceType: SkillSourceType;
  sourceId?: string;
  sourceText: string;
}

// 2.4.3 - Semantic Search Types
export type SearchEntityType = 'CANDIDATE' | 'JOB' | 'PROJECT' | 'COMPANY';
export type SearchStatus = 'ACTIVE' | 'STALE' | 'DELETED';

export interface SemanticSearchIndex {
  id: string;
  entityType: SearchEntityType;
  entityId: string;
  userId?: string;
  title: string;
  content: string;
  summary?: string;
  keywords: string[];
  embeddingModel: string;
  embeddingDimension: number;
  category?: string;
  subcategories?: string[];
  tags?: string[];
  skills?: string[];
  industries?: string[];
  locations?: string[];
  seniorityLevel?: string;
  experienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  remoteEligible?: boolean;
  contentQuality: number;
  freshness: string;
  popularity: number;
  status: SearchStatus;
  lastIndexed: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndexForSearchRequest {
  entityType: SearchEntityType;
  entityId: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  skills?: string[];
  industries?: string[];
  locations?: string[];
}

export interface SemanticSearchRequest {
  query: string;
  entityType?: SearchEntityType;
  filters?: {
    skills?: string[];
    locations?: string[];
    seniorityLevel?: string;
    remoteEligible?: boolean;
  };
  limit?: number;
}

export interface SemanticSearchResult extends Omit<SemanticSearchIndex, 'embedding'> {
  relevanceScore: number;
}

export interface SemanticSearchResponse {
  query: string;
  results: SemanticSearchResult[];
  totalResults: number;
}

// 2.4.4 - Entity Recognition Types
export type EntitySourceType = 'RESUME' | 'JOB_DESCRIPTION' | 'MESSAGE' | 'PROFILE';

export interface RecognizedEntity {
  name: string;
  type?: string;
  role?: string;
  confidence: number;
}

export interface EntityRecognition {
  id: string;
  userId?: string;
  sourceType: EntitySourceType;
  sourceId?: string;
  sourceText: string;
  people: RecognizedEntity[];
  organizations: Array<RecognizedEntity & { type: string }>;
  locations: Array<{ location: string; type: string; confidence: number }>;
  dates: Array<{ date: string; type: string; context: string }>;
  money: Array<{ amount: number; currency: string; type: string; confidence: number }>;
  percentages: Array<{ value: number; context: string; confidence: number }>;
  quantities: Array<{ value: number; unit: string; context: string; confidence: number }>;
  technologies: Array<{ name: string; category: string; confidence: number }>;
  products: Array<{ name: string; vendor: string; confidence: number }>;
  platforms: Array<{ name: string; type: string; confidence: number }>;
  languages: Array<{ name: string; type: string; confidence: number }>;
  jobTitles: Array<{ title: string; standardized: string; confidence: number }>;
  degrees: Array<{ degree: string; level: string; confidence: number }>;
  certifications: Array<{ name: string; issuer: string; confidence: number }>;
  universities: Array<{ name: string; type: string; confidence: number }>;
  industries: Array<{ name: string; confidence: number }>;
  entityRelationships: Array<{ entity1: string; entity2: string; relationship: string }>;
  timeline: Array<{ date: string; event: string }>;
  perEntityConfidence: Record<string, number>;
  overallConfidence: number;
  normalizedEntities: Record<string, Record<string, unknown>>;
  modelVersion: string;
  processingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecognizeEntitiesRequest {
  sourceType: EntitySourceType;
  sourceId?: string;
  sourceText: string;
}

// ============================================
// BATCH 15: SMART CALENDAR & AUTOMATED SCHEDULING
// Features 3.1.1-3.2.4
// ============================================

// Calendar Provider Types
export type CalendarProvider = 'GOOGLE' | 'OUTLOOK' | 'APPLE' | 'ICAL' | 'OTHER';
export type SyncDirection = 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR';
export type EventStatus = 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
export type EventVisibility = 'BUSY' | 'FREE' | 'TENTATIVE';
export type ConflictType = 'OVERLAP' | 'BACK_TO_BACK' | 'TRAVEL_TIME' | 'BUFFER_VIOLATION';
export type ConflictSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConflictStatus = 'UNRESOLVED' | 'RESOLVED' | 'IGNORED';
export type HolidayType = 'PUBLIC' | 'COMPANY' | 'PERSONAL' | 'RELIGIOUS' | 'OBSERVANCE';
export type HolidayScope = 'USER' | 'COMPANY' | 'GLOBAL';
export type MeetingType = 'PHONE_SCREEN' | 'VIDEO_INTERVIEW' | 'ONSITE' | 'PANEL' | 'CUSTOM';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'TENTATIVE' | 'BLOCKED';
export type AvailabilitySource = 'CALENDAR_SYNC' | 'MANUAL' | 'WORKING_HOURS' | 'HOLIDAY';
export type PanelSessionStatus = 'SCHEDULING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PanelRole = 'LEAD' | 'PANELIST' | 'OBSERVER' | 'NOTETAKER';
export type PanelResponseStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';

// 3.1.1-3.1.5 Calendar Integration Types
export interface CalendarIntegration {
  id: string;
  userId: string;
  provider: CalendarProvider;
  name: string;
  email?: string;
  isDefault: boolean;
  isPrimary: boolean;
  syncEnabled: boolean;
  syncDirection: SyncDirection;
  lastSyncAt?: string;
  syncStatus: SyncStatus;
  syncError?: string;
  color?: string;
  timezone: string;
  showInAvailability: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { events: number };
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  userId: string;
  title: string;
  description?: string;
  location?: string;
  meetingLink?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  timezone: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  status: EventStatus;
  visibility: EventVisibility;
  externalEventId?: string;
  interviewId?: string;
  applicationId?: string;
  attendees?: Array<{ email: string; name?: string; status?: string }>;
  organizer?: { email: string; name?: string };
  syncStatus: string;
  createdAt: string;
  updatedAt: string;
  calendar?: { name: string; provider: CalendarProvider; color?: string };
}

export interface ConnectCalendarRequest {
  provider: CalendarProvider;
  name: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
  calendarUrl?: string;
  timezone?: string;
}

export interface CreateCalendarEventRequest {
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  attendees?: Array<{ email: string; name?: string }>;
}

// 3.1.6 Conflict Detection Types
export interface CalendarConflict {
  id: string;
  userId: string;
  event1Id: string;
  event2Id: string;
  event1Title: string;
  event2Title: string;
  event1Start: string;
  event1End: string;
  event2Start: string;
  event2End: string;
  conflictType: ConflictType;
  overlapMinutes: number;
  severity: ConflictSeverity;
  status: ConflictStatus;
  resolution?: string;
  resolvedAt?: string;
  suggestions?: Array<{ action: string; description: string }>;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
}

// 3.1.7 Buffer Time Types
export interface BufferTimeSettings {
  id: string;
  userId: string;
  beforeMeeting: number;
  afterMeeting: number;
  beforeInterview: number;
  afterInterview: number;
  includeTravel: boolean;
  defaultTravelTime: number;
  phoneScreenBuffer: number;
  videoInterviewBuffer: number;
  onsiteInterviewBuffer: number;
  panelInterviewBuffer: number;
  autoApply: boolean;
  applyToExternal: boolean;
  createdAt: string;
  updatedAt: string;
}

// 3.1.8 Working Hours Types
export interface TimeSlot {
  start: string;
  end: string;
}

export interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

export interface WorkingHours {
  id: string;
  userId: string;
  name: string;
  timezone: string;
  isDefault: boolean;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  minNoticeHours: number;
  maxAdvanceDays: number;
  slotDuration: number;
  slotIncrement: number;
  lunchStart?: string;
  lunchEnd?: string;
  excludeLunch: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkingHoursRequest {
  name?: string;
  timezone?: string;
  isDefault?: boolean;
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  minNoticeHours?: number;
  maxAdvanceDays?: number;
  slotDuration?: number;
  slotIncrement?: number;
  lunchStart?: string;
  lunchEnd?: string;
  excludeLunch?: boolean;
}

// 3.1.9 Holiday Types
export interface Holiday {
  id: string;
  userId?: string;
  name: string;
  date: string;
  endDate?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  type: HolidayType;
  country?: string;
  region?: string;
  isOfficial: boolean;
  blockEntireDay: boolean;
  blockStart?: string;
  blockEnd?: string;
  scope: HolidayScope;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddHolidayRequest {
  name: string;
  date: string;
  endDate?: string;
  type: HolidayType;
  country?: string;
  region?: string;
  blockEntireDay?: boolean;
}

// 3.2.1 Scheduling Link Types
export interface SchedulingLink {
  id: string;
  userId: string;
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  meetingType: MeetingType;
  duration: number;
  location?: string;
  workingHoursId?: string;
  bufferBefore: number;
  bufferAfter: number;
  minNotice: number;
  maxAdvance: number;
  maxBookingsPerDay?: number;
  maxBookingsPerWeek?: number;
  requireConfirmation: boolean;
  autoConfirm: boolean;
  confirmationMessage?: string;
  questions?: Array<{ id: string; question: string; required: boolean }>;
  notifyOnBooking: boolean;
  reminderSchedule?: Array<{ hours: number; type: string }>;
  brandColor?: string;
  logoUrl?: string;
  welcomeMessage?: string;
  jobId?: string;
  applicationId?: string;
  viewCount: number;
  bookingCount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { bookings: number };
  user?: { name: string; email: string };
}

export interface CreateSchedulingLinkRequest {
  slug?: string;
  name: string;
  description?: string;
  meetingType: MeetingType;
  duration: number;
  location?: string;
  bufferBefore?: number;
  bufferAfter?: number;
  minNotice?: number;
  maxAdvance?: number;
  maxBookingsPerDay?: number;
  maxBookingsPerWeek?: number;
  requireConfirmation?: boolean;
  autoConfirm?: boolean;
  questions?: Array<{ question: string; required: boolean }>;
  notifyOnBooking?: boolean;
  brandColor?: string;
  welcomeMessage?: string;
  jobId?: string;
  expiresAt?: string;
}

export interface SchedulingBooking {
  id: string;
  linkId: string;
  bookerEmail: string;
  bookerName: string;
  bookerPhone?: string;
  bookerTimezone: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  candidateId?: string;
  applicationId?: string;
  interviewId?: string;
  responses?: Record<string, string>;
  meetingLink?: string;
  meetingPassword?: string;
  location?: string;
  confirmationToken?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  link?: { name: string; meetingType: MeetingType };
}

export interface BookSlotRequest {
  bookerEmail: string;
  bookerName: string;
  bookerPhone?: string;
  bookerTimezone: string;
  startTime: string;
  responses?: Record<string, string>;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// 3.2.2 Availability Types
export interface AvailabilitySlot {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: AvailabilityStatus;
  source: AvailabilitySource;
  preferenceScore: number;
  isOptimal: boolean;
  hasConflict: boolean;
  conflictEventId?: string;
  isPanelSlot: boolean;
  panelSessionId?: string;
  generatedAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateAvailabilityRequest {
  startDate: string;
  endDate: string;
  duration?: number;
}

// 3.2.3 Panel Coordinator Types
export interface PanelSession {
  id: string;
  organizerId: string;
  name: string;
  description?: string;
  duration: number;
  jobId?: string;
  applicationId?: string;
  panelists: PanelMember[];
  status: PanelSessionStatus;
  minPanelistsRequired: number;
  requireAllPanelists: boolean;
  schedulingDeadline?: string;
  preferredDates?: string[];
  preferredTimeRanges?: Array<{ start: string; end: string }>;
  excludedDates?: string[];
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  meetingLink?: string;
  location?: string;
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  invitesSentAt?: string;
  createdAt: string;
  updatedAt: string;
  organizer?: { name: string; email: string };
}

export interface PanelMember {
  id: string;
  sessionId: string;
  userId: string;
  role: PanelRole;
  isRequired: boolean;
  isOptional: boolean;
  responseStatus: PanelResponseStatus;
  respondedAt?: string;
  declineReason?: string;
  availabilitySubmitted: boolean;
  availableSlots?: Array<{ startTime: string; endTime: string }>;
  preferredSlots?: Array<{ startTime: string; endTime: string }>;
  unavailableDates?: string[];
  invitedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; email: string };
}

export interface CreatePanelSessionRequest {
  name: string;
  description?: string;
  duration: number;
  jobId?: string;
  applicationId?: string;
  candidateName?: string;
  candidateEmail?: string;
  panelists: Array<{ userId: string; role?: PanelRole; isRequired?: boolean }>;
  preferredDates?: string[];
}

export interface SubmitPanelAvailabilityRequest {
  availableSlots: Array<{ startTime: string; endTime: string }>;
  preferredSlots?: Array<{ startTime: string; endTime: string }>;
  unavailableDates?: string[];
}

export interface OptimalPanelTime {
  startTime: string;
  endTime: string;
  panelistsAvailable: number;
}

// 3.2.4 Timezone Types
export interface TimezonePreference {
  id: string;
  userId: string;
  primaryTimezone: string;
  autoDetect: boolean;
  lastDetectedTimezone?: string;
  lastDetectedAt?: string;
  use24HourFormat: boolean;
  showSecondaryTimezone: boolean;
  secondaryTimezone?: string;
  preferLocalTime: boolean;
  includeTimezoneInInvites: boolean;
  workLocation?: string;
  travelSchedule?: Array<{ startDate: string; endDate: string; timezone: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface TimezoneConversion {
  original: {
    dateTime: string;
    timezone: string;
  };
  converted: {
    dateTime: string;
    timezone: string;
    formatted: string;
  };
}

// ============================================
// BATCH 16: REMINDERS & NOTIFICATIONS (3.3.x)
// ============================================

// Channel Types
export type NotificationChannelType = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP';
export type ReminderStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
export type ConfirmationStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'EXPIRED';
export type PrepMaterialType = 'DOCUMENT' | 'VIDEO' | 'LINK' | 'CHECKLIST' | 'GUIDE';
export type DigestMode = 'INSTANT' | 'HOURLY' | 'DAILY' | 'WEEKLY';

// 3.3.1, 3.3.6 Reminder Schedule
export interface ReminderSchedule {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  reminderTimes: number[]; // Minutes before event
  eventTypes: string[];
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  emailTemplateId?: string;
  smsTemplateId?: string;
  whatsappTemplateId?: string;
  scope: 'USER' | 'TEAM' | 'ORGANIZATION';
  createdAt: string;
  updatedAt: string;
}

// 3.3.2-3.3.4 Notification Channel
export interface NotificationChannel {
  id: string;
  userId: string;
  channelType: NotificationChannelType;
  isEnabled: boolean;
  isPrimary: boolean;
  // Email
  emailAddress?: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  // SMS
  phoneNumber?: string;
  phoneCountryCode?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  smsCarrier?: string;
  // WhatsApp
  whatsappNumber?: string;
  whatsappVerified: boolean;
  whatsappOptIn: boolean;
  whatsappOptInAt?: string;
  // Push
  pushToken?: string;
  pushPlatform?: 'IOS' | 'ANDROID' | 'WEB';
  pushEnabled: boolean;
  // Quiet Hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
  // Rate Limiting
  maxPerHour?: number;
  maxPerDay?: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Reminder Notification Instance
export interface ReminderNotification {
  id: string;
  userId: string;
  interviewId?: string;
  interview?: Interview;
  reminderType: 'PRE_INTERVIEW' | 'DAY_OF' | 'FOLLOW_UP';
  scheduledFor: string;
  minutesBefore: number;
  status: ReminderStatus;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  channel: NotificationChannelType;
  recipientAddress?: string;
  subject?: string;
  body?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  externalMessageId?: string;
  providerResponse?: Record<string, any>;
  openedAt?: string;
  clickedAt?: string;
  interactionData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 3.3.4 Push Subscription
export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  platform: 'WEB' | 'IOS' | 'ANDROID';
  browser?: string;
  browserVersion?: string;
  deviceName?: string;
  deviceModel?: string;
  isActive: boolean;
  lastPingAt?: string;
  failedAttempts: number;
  interviewReminders: boolean;
  applicationUpdates: boolean;
  messageNotifications: boolean;
  systemAlerts: boolean;
  subscribedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 3.3.7 Confirmation Request
export interface ConfirmationRequest {
  id: string;
  recipientId: string;
  recipient?: User;
  senderId: string;
  sender?: User;
  interviewId: string;
  interview?: Interview;
  requestType: 'ATTENDANCE' | 'RESCHEDULE' | 'CANCELLATION';
  message?: string;
  token: string;
  expiresAt: string;
  status: ConfirmationStatus;
  respondedAt?: string;
  responseMessage?: string;
  declineReason?: 'SCHEDULING_CONFLICT' | 'NOT_INTERESTED' | 'OTHER';
  suggestReschedule: boolean;
  suggestedTimes?: Array<{ startTime: string; endTime: string }>;
  notificationsSent: number;
  lastNotificationAt?: string;
  channelsUsed: string[];
  reminderSchedule?: number[];
  nextReminderAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 3.3.8 Prep Material
export interface PrepMaterial {
  id: string;
  createdById: string;
  createdBy?: User;
  title: string;
  description?: string;
  materialType: PrepMaterialType;
  content?: string;
  fileUrl?: string;
  externalUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  category?: 'COMPANY_INFO' | 'ROLE_INFO' | 'INTERVIEW_TIPS' | 'TECHNICAL_PREP';
  tags: string[];
  forInterviewTypes: string[];
  forJobIds: string[];
  forDepartments: string[];
  isPublic: boolean;
  isActive: boolean;
  sendAutomatically: boolean;
  hoursBefore: number;
  viewCount: number;
  downloadCount: number;
  deliveries?: PrepMaterialDelivery[];
  _count?: {
    deliveries: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Prep Material Delivery
export interface PrepMaterialDelivery {
  id: string;
  materialId: string;
  material?: PrepMaterial;
  recipientId: string;
  recipient?: User;
  interviewId?: string;
  interview?: Interview;
  deliveryMethod: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';
  scheduledFor: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'VIEWED' | 'FAILED';
  sentAt?: string;
  deliveredAt?: string;
  viewedAt?: string;
  failedAt?: string;
  failureReason?: string;
  openCount: number;
  downloadCount: number;
  timeSpentSeconds?: number;
  helpfulRating?: number;
  feedbackText?: string;
  externalMessageId?: string;
  trackingPixelId?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Preferences
export interface NotificationPreference {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  digestMode: DigestMode;
  digestTime?: string;
  digestDay?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  interviewReminders: boolean;
  applicationUpdates: boolean;
  messageAlerts: boolean;
  jobAlerts: boolean;
  systemAnnouncements: boolean;
  marketingEmails: boolean;
  defaultReminderTimes?: number[];
  confirmationRequests: boolean;
  prepMaterialDelivery: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
  unsubscribedAt?: string;
  unsubscribeReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Stats
export interface NotificationStats {
  total: {
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
  };
  deliveryRate: string;
  openRate: string;
  byChannel: Record<string, number>;
}

// API Input Types
export interface CreateReminderScheduleInput {
  name: string;
  description?: string;
  isDefault?: boolean;
  reminderTimes?: number[];
  eventTypes?: string[];
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  pushEnabled?: boolean;
  emailTemplateId?: string;
  smsTemplateId?: string;
  whatsappTemplateId?: string;
  scope?: 'USER' | 'TEAM' | 'ORGANIZATION';
}

export interface UpsertNotificationChannelInput {
  channelType: NotificationChannelType;
  isEnabled?: boolean;
  isPrimary?: boolean;
  emailAddress?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  whatsappNumber?: string;
  pushToken?: string;
  pushPlatform?: 'IOS' | 'ANDROID' | 'WEB';
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
}

export interface ScheduleReminderInput {
  interviewId: string;
  reminderType: 'PRE_INTERVIEW' | 'DAY_OF' | 'FOLLOW_UP';
  scheduledFor: string;
  minutesBefore: number;
  channel: NotificationChannelType;
  subject?: string;
  body?: string;
}

export interface CreateConfirmationRequestInput {
  recipientId: string;
  interviewId: string;
  requestType?: 'ATTENDANCE' | 'RESCHEDULE' | 'CANCELLATION';
  message?: string;
  expiresInHours?: number;
}

export interface ConfirmationResponseInput {
  response: 'confirm' | 'decline';
  responseMessage?: string;
  declineReason?: string;
  suggestReschedule?: boolean;
  suggestedTimes?: Array<{ startTime: string; endTime: string }>;
}

export interface CreatePrepMaterialInput {
  title: string;
  description?: string;
  materialType: PrepMaterialType;
  content?: string;
  fileUrl?: string;
  externalUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  category?: string;
  tags?: string[];
  forInterviewTypes?: string[];
  forJobIds?: string[];
  forDepartments?: string[];
  isPublic?: boolean;
  sendAutomatically?: boolean;
  hoursBefore?: number;
}

export interface SchedulePrepDeliveryInput {
  materialId: string;
  recipientId: string;
  interviewId?: string;
  deliveryMethod?: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';
  scheduledFor: string;
}

export interface UpdateNotificationPreferencesInput {
  notificationsEnabled?: boolean;
  digestMode?: DigestMode;
  digestTime?: string;
  digestDay?: string;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  interviewReminders?: boolean;
  applicationUpdates?: boolean;
  messageAlerts?: boolean;
  jobAlerts?: boolean;
  systemAnnouncements?: boolean;
  marketingEmails?: boolean;
  defaultReminderTimes?: number[];
  confirmationRequests?: boolean;
  prepMaterialDelivery?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
}

export interface RegisterPushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  platform?: 'WEB' | 'IOS' | 'ANDROID';
  browser?: string;
  browserVersion?: string;
  deviceName?: string;
  deviceModel?: string;
}
