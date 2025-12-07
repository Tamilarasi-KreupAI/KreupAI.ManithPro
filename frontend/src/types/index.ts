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

// ============================================
// BATCH 17: AI SCREENING INTERVIEWS (4.1.1-4.1.8)
// ============================================

// Enums for AI Screening
export type ScreeningInterviewType = 'VIDEO_ASYNC' | 'PHONE' | 'CHAT';
export type ScreeningInterviewStatus = 'PENDING' | 'INVITED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
export type AITone = 'PROFESSIONAL' | 'FRIENDLY' | 'CASUAL' | 'FORMAL' | 'EMPATHETIC';
export type ScreeningQuestionType = 'TEXT' | 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'SCALE' | 'SITUATIONAL' | 'BEHAVIORAL' | 'TECHNICAL' | 'CODING';
export type ResponseType = 'VIDEO' | 'AUDIO' | 'TEXT' | 'CODE' | 'MULTIPLE_CHOICE';
export type ScreeningResponseStatus = 'PENDING' | 'RECORDING' | 'SUBMITTED' | 'ANALYZING' | 'REVIEWED' | 'FLAGGED';
export type FollowUpConditionType = 'KEYWORD_MATCH' | 'SCORE_THRESHOLD' | 'SENTIMENT' | 'RESPONSE_LENGTH' | 'TIME_SPENT' | 'ALWAYS';
export type FollowUpActionType = 'ASK_FOLLOW_UP' | 'SKIP_QUESTION' | 'ADD_QUESTIONS' | 'END_INTERVIEW' | 'FLAG_RESPONSE' | 'GENERATE_AI_QUESTION';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

// AI Screening Interview
export interface AIScreeningInterview {
  id: string;
  candidateId: string;
  recruiterId: string;
  jobId?: string;
  applicationId?: string;
  interviewType: ScreeningInterviewType;
  title: string;
  description?: string;
  inviteToken: string;
  status: ScreeningInterviewStatus;
  questionFlowId?: string;
  totalQuestions: number;
  completedQuestions: number;
  currentQuestionIndex: number;
  totalTimeLimit?: number;
  perQuestionTimeLimit?: number;
  timeRemaining?: number;
  language: string;
  accessibilitySettings?: Record<string, any>;
  aiTone: AITone;
  aiPersonality?: string;
  enableSmallTalk: boolean;
  recordingConsent: boolean;
  scheduledFor?: string;
  expiresAt?: string;
  startedAt?: string;
  completedAt?: string;
  tokenExpiresAt?: string;
  overallScore?: number;
  aiFeedback?: string;
  recruiterNotes?: string;
  isArchived: boolean;
  deadlineExtensions: number;
  createdAt: string;
  updatedAt: string;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    companyName?: string;
    companyLogo?: string;
    description?: string;
  };
  questionFlow?: QuestionFlow;
  responses?: ScreeningResponse[];
  _count?: {
    responses: number;
  };
}

// Question Flow
export interface QuestionFlow {
  id: string;
  createdById: string;
  name: string;
  description?: string;
  category?: string;
  jobId?: string;
  targetRole?: string;
  targetLevel?: string;
  interviewType: ScreeningInterviewType;
  supportedLanguages: string[];
  defaultLanguage: string;
  estimatedDuration?: number;
  defaultTimePerQuestion?: number;
  isTemplate: boolean;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  questions?: ScreeningQuestion[];
  followUpRules?: FollowUpRule[];
  job?: {
    id: string;
    title: string;
  };
  _count?: {
    questions: number;
    screeningInterviews: number;
  };
}

// Screening Question
export interface ScreeningQuestion {
  id: string;
  flowId: string;
  questionText: string;
  questionType: ScreeningQuestionType;
  category?: string;
  translations?: Record<string, string>;
  expectedResponseType: ResponseType;
  maxResponseDuration?: number;
  maxResponseLength?: number;
  allowRetakes: boolean;
  maxRetakes: number;
  options?: string[];
  correctAnswer?: string;
  orderIndex: number;
  isRequired: boolean;
  difficulty: DifficultyLevel;
  maxPoints: number;
  scoringCriteria?: Record<string, any>;
  hint?: string;
  sampleAnswer?: string;
  evaluationGuidelines?: string;
  timeLimit?: number;
  accessibilityNotes?: string;
  hasAudioDescription: boolean;
  hasSignLanguage: boolean;
  aiFollowUpEnabled: boolean;
  aiEvaluationPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

// Screening Response
export interface ScreeningResponse {
  id: string;
  interviewId: string;
  questionId: string;
  userId?: string;
  responseType: ResponseType;
  textResponse?: string;
  videoUrl?: string;
  audioUrl?: string;
  transcription?: string;
  codeResponse?: string;
  codeLanguage?: string;
  selectedOptions: string[];
  startedAt?: string;
  completedAt?: string;
  timeSpentSeconds?: number;
  retakeNumber: number;
  aiScore?: number;
  aiSummary?: string;
  aiKeywords?: string[];
  aiSentiment?: string;
  aiConfidenceLevel?: number;
  aiDetailedAnalysis?: Record<string, any>;
  manualScore?: number;
  manualFeedback?: string;
  reviewedById?: string;
  reviewedAt?: string;
  status: ScreeningResponseStatus;
  technicalIssues?: string;
  createdAt: string;
  updatedAt: string;
  question?: {
    id: string;
    questionText: string;
    questionType: ScreeningQuestionType;
    maxPoints: number;
  };
}

// Follow-Up Rule
export interface FollowUpRule {
  id: string;
  flowId: string;
  triggerQuestionId: string;
  conditionType: FollowUpConditionType;
  conditionValue: Record<string, any>;
  conditionOperator: string;
  actionType: FollowUpActionType;
  followUpQuestionId?: string;
  customFollowUpText?: string;
  additionalQuestionIds: string[];
  useAIGeneration: boolean;
  aiGenerationPrompt?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  triggerQuestion?: {
    id: string;
    questionText: string;
  };
  followUpQuestion?: {
    id: string;
    questionText: string;
  };
}

// Screening Template
export interface ScreeningTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  interviewType: ScreeningInterviewType;
  defaultQuestions?: Record<string, any>[];
  defaultDuration?: number;
  defaultTimePerQuestion?: number;
  aiTone: AITone;
  aiPersonality?: string;
  smallTalkEnabled: boolean;
  smallTalkPrompts: string[];
  supportedLanguages: string[];
  defaultLanguage: string;
  defaultAccessibility?: Record<string, any>;
  logoUrl?: string;
  primaryColor?: string;
  welcomeMessage?: string;
  completionMessage?: string;
  isPublic: boolean;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Candidate Accessibility Preferences
export interface CandidateAccessibilityPrefs {
  id: string;
  candidateId: string;
  needsScreenReader: boolean;
  needsHighContrast: boolean;
  needsLargeText: boolean;
  needsKeyboardNav: boolean;
  needsCaptions: boolean;
  needsSignLanguage: boolean;
  needsAudioDescriptions: boolean;
  needsExtendedTime: boolean;
  timeExtensionPercent: number;
  needsBreaks: boolean;
  breakFrequencyMinutes?: number;
  breakDurationMinutes?: number;
  preferredInputMethod?: string;
  preferredOutputFormat?: string;
  customAccommodations?: string;
  createdAt: string;
  updatedAt: string;
}

// Chat Message Response
export interface ChatMessage {
  type: 'QUESTION' | 'COMPLETION' | 'FOLLOW_UP' | 'SMALL_TALK';
  questionId?: string;
  message: string;
  questionType?: ScreeningQuestionType;
  expectedResponseType?: ResponseType;
  timeLimit?: number;
  options?: string[];
  hint?: string;
}

// Screening Statistics
export interface ScreeningStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: string;
  avgScore?: string;
}

// Follow-Up Evaluation Result
export interface FollowUpEvaluationResult {
  responseId: string;
  triggeredRules: FollowUpRule[];
  nextAction: FollowUpActionType | null;
  followUpQuestionId: string | null;
}

// Input Types for API Operations

export interface CreateScreeningInterviewInput {
  candidateId: string;
  jobId?: string;
  applicationId?: string;
  interviewType?: ScreeningInterviewType;
  title: string;
  description?: string;
  questionFlowId?: string;
  totalTimeLimit?: number;
  perQuestionTimeLimit?: number;
  language?: string;
  accessibilitySettings?: Record<string, any>;
  aiTone?: AITone;
  aiPersonality?: string;
  enableSmallTalk?: boolean;
  expiresAt?: string;
}

export interface CreateQuestionFlowInput {
  name: string;
  description?: string;
  category?: string;
  jobId?: string;
  targetRole?: string;
  targetLevel?: string;
  interviewType?: ScreeningInterviewType;
  supportedLanguages?: string[];
  defaultLanguage?: string;
  estimatedDuration?: number;
  defaultTimePerQuestion?: number;
  isTemplate?: boolean;
}

export interface UpdateQuestionFlowInput {
  name?: string;
  description?: string;
  category?: string;
  targetRole?: string;
  targetLevel?: string;
  supportedLanguages?: string[];
  defaultLanguage?: string;
  estimatedDuration?: number;
  defaultTimePerQuestion?: number;
  isTemplate?: boolean;
  isActive?: boolean;
}

export interface AddScreeningQuestionInput {
  questionText: string;
  questionType?: ScreeningQuestionType;
  category?: string;
  translations?: Record<string, string>;
  expectedResponseType?: ResponseType;
  maxResponseDuration?: number;
  maxResponseLength?: number;
  allowRetakes?: boolean;
  maxRetakes?: number;
  options?: string[];
  correctAnswer?: string;
  orderIndex?: number;
  isRequired?: boolean;
  difficulty?: DifficultyLevel;
  maxPoints?: number;
  scoringCriteria?: Record<string, any>;
  hint?: string;
  sampleAnswer?: string;
  evaluationGuidelines?: string;
  timeLimit?: number;
  accessibilityNotes?: string;
  hasAudioDescription?: boolean;
  hasSignLanguage?: boolean;
  aiFollowUpEnabled?: boolean;
  aiEvaluationPrompt?: string;
}

export interface SubmitScreeningResponseInput {
  responseType: ResponseType;
  textResponse?: string;
  videoUrl?: string;
  audioUrl?: string;
  codeResponse?: string;
  codeLanguage?: string;
  selectedOptions?: string[];
  timeSpentSeconds?: number;
}

export interface ReviewScreeningResponseInput {
  manualScore: number;
  manualFeedback?: string;
}

export interface AddFollowUpRuleInput {
  triggerQuestionId: string;
  conditionType: FollowUpConditionType;
  conditionValue: Record<string, any>;
  conditionOperator?: string;
  actionType: FollowUpActionType;
  followUpQuestionId?: string;
  customFollowUpText?: string;
  additionalQuestionIds?: string[];
  useAIGeneration?: boolean;
  aiGenerationPrompt?: string;
  priority?: number;
}

export interface CreateScreeningTemplateInput {
  name: string;
  description?: string;
  category?: string;
  interviewType?: ScreeningInterviewType;
  defaultQuestions?: Record<string, any>[];
  defaultDuration?: number;
  defaultTimePerQuestion?: number;
  aiTone?: AITone;
  aiPersonality?: string;
  smallTalkEnabled?: boolean;
  smallTalkPrompts?: string[];
  supportedLanguages?: string[];
  defaultLanguage?: string;
  defaultAccessibility?: Record<string, any>;
  logoUrl?: string;
  primaryColor?: string;
  welcomeMessage?: string;
  completionMessage?: string;
  isPublic?: boolean;
}

export interface UpdateAccessibilityPrefsInput {
  needsScreenReader?: boolean;
  needsHighContrast?: boolean;
  needsLargeText?: boolean;
  needsKeyboardNav?: boolean;
  needsCaptions?: boolean;
  needsSignLanguage?: boolean;
  needsAudioDescriptions?: boolean;
  needsExtendedTime?: boolean;
  timeExtensionPercent?: number;
  needsBreaks?: boolean;
  breakFrequencyMinutes?: number;
  breakDurationMinutes?: number;
  preferredInputMethod?: string;
  preferredOutputFormat?: string;
  customAccommodations?: string;
}

export interface StartInterviewInput {
  recordingConsent?: boolean;
  language?: string;
  accessibilitySettings?: Record<string, any>;
}

export interface SubmitChatResponseInput {
  questionId: string;
  message: string;
  responseType?: ResponseType;
}

// ============================================
// BATCH 18: AI INTERVIEW ANALYSIS (4.2.1-4.2.10)
// ============================================

// Enums for Interview Analysis
export type TranscriptionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type TranscriptionEngine = 'WHISPER' | 'GOOGLE' | 'AWS' | 'AZURE';
export type AudioQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
export type SentimentType = 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE';
export type ConfidenceLevelType = 'HIGH' | 'MODERATE' | 'LOW' | 'UNCERTAIN';
export type SentimentTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';
export type SpeechPace = 'SLOW' | 'NORMAL' | 'FAST';
export type VerificationStatus = 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIABLE' | 'INACCURATE' | 'PENDING';
export type TechnicalDepth = 'SURFACE' | 'INTERMEDIATE' | 'DEEP' | 'EXPERT';
export type ClaimType = 'TECHNICAL_FACT' | 'EXPERIENCE' | 'METRIC' | 'CREDENTIAL';
export type RedFlagType = 'INCONSISTENCY' | 'EVASION' | 'NEGATIVE_ATTITUDE' | 'CONCERNING_RESPONSE' | 'SKILL_GAP' | 'CULTURAL_MISMATCH';
export type RedFlagSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RedFlagDisposition = 'CONFIRMED' | 'DISMISSED' | 'NEEDS_FOLLOW_UP';
export type HiringRecommendation = 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO' | 'NEEDS_REVIEW';
export type HighlightType = 'STRENGTH' | 'CONCERN' | 'NOTABLE_ANSWER' | 'TECHNICAL_DEPTH' | 'GREAT_EXAMPLE' | 'ENTHUSIASM' | 'RED_FLAG';
export type HighlightImportance = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComparisonStatus = 'DRAFT' | 'COMPLETED' | 'SHARED';

// 4.2.1 - Interview Transcription
export interface InterviewTranscription {
  id: string;
  interviewId: string;
  responseId?: string;
  sourceType: string;
  sourceUrl?: string;
  duration?: number;
  rawTranscript: string;
  formattedTranscript?: string;
  language: string;
  detectedLanguage?: string;
  transcriptionEngine: TranscriptionEngine;
  confidence?: number;
  wordCount: number;
  timestamps?: Array<{ word: string; start: number; end: number; confidence: number }>;
  speakerLabels?: Record<string, any>;
  audioQuality?: AudioQuality;
  noiseLevel?: number;
  clarityScore?: number;
  status: TranscriptionStatus;
  errorMessage?: string;
  processingTime?: number;
  createdAt: string;
  updatedAt: string;
}

// 4.2.2 - Answer Analysis
export interface AnswerAnalysis {
  id: string;
  interviewId: string;
  transcriptionId?: string;
  responseId?: string;
  questionId?: string;
  questionText?: string;
  questionType?: string;
  expectedKeywords: string[];
  answerText: string;
  answerLength: number;
  overallScore: number;
  relevanceScore: number;
  completenessScore: number;
  depthScore: number;
  clarityScore: number;
  structureScore: number;
  specificityScore: number;
  strengths: string[];
  weaknesses: string[];
  keyPoints: string[];
  missingElements: string[];
  suggestions: string[];
  scoringCriteria?: Record<string, any>;
  aiReasoning?: string;
  confidenceLevel: number;
  analyzedAt: string;
  modelVersion?: string;
}

// 4.2.3 - Topic Detection
export interface TopicDetection {
  id: string;
  interviewId: string;
  transcriptionId?: string;
  topics: Array<{ topic: string; relevance: number; frequency: number; context: string[] }>;
  primaryTopics: string[];
  secondaryTopics: string[];
  keywords: Array<{ keyword: string; count: number; importance: number; contextSamples?: string[] }>;
  technicalKeywords: string[];
  softSkillKeywords: string[];
  industryKeywords: string[];
  namedEntities?: {
    companies: string[];
    technologies: string[];
    people: string[];
    locations: string[];
  };
  technicalTopics?: Record<string, any>;
  behavioralTopics?: Record<string, any>;
  experienceTopics?: Record<string, any>;
  expectedTopics: string[];
  coveredExpected: string[];
  missedTopics: string[];
  unexpectedTopics: string[];
  topicCoverageScore: number;
  topicDepthScore: number;
  relevanceScore: number;
  analyzedAt: string;
}

// 4.2.4 - Sentiment Analysis
export interface SentimentAnalysis {
  id: string;
  interviewId: string;
  transcriptionId?: string;
  responseId?: string;
  overallSentiment: SentimentType;
  sentimentScore: number;
  sentimentConfidence: number;
  emotions?: Record<string, number>;
  dominantEmotion?: string;
  emotionalVariation: number;
  confidenceLevel: ConfidenceLevelType;
  confidenceScore: number;
  hesitationMarkers: number;
  fillerWords?: Record<string, number>;
  enthusiasmScore: number;
  passionIndicators: string[];
  authenticityScore: number;
  consistencyScore: number;
  sentimentTimeline?: Array<{ timestamp: string; sentiment: string; confidence: number }>;
  sentimentTrend?: SentimentTrend;
  questionSentiments?: Array<{ questionId: string; sentiment: string; confidence: number; emotion: string }>;
  voiceEnergy?: number;
  speechPace?: SpeechPace;
  toneVariation?: number;
  analyzedAt: string;
}

// 4.2.5 - Communication Score
export interface CommunicationScore {
  id: string;
  interviewId: string;
  overallScore: number;
  clarityScore: number;
  articulationScore: number;
  vocabularyScore: number;
  grammarScore: number;
  coherenceScore: number;
  structureScore: number;
  conciseness: number;
  relevance: number;
  professionalismScore: number;
  engagementScore: number;
  listeningIndicators: number;
  technicalClarity?: number;
  useOfExamples: number;
  strengths: string[];
  areasForImprovement: string[];
  feedback?: Record<string, string>;
  recommendations: string[];
  percentile?: number;
  benchmarkRole?: string;
  analyzedAt: string;
}

// 4.2.6 - Technical Verification
export interface TechnicalVerification {
  id: string;
  interviewId: string;
  responseId?: string;
  claimText: string;
  claimType: ClaimType;
  claimContext?: string;
  verificationStatus: VerificationStatus;
  accuracyScore: number;
  confidenceLevel: number;
  supportingEvidence?: Array<{ source: string; match: string }>;
  contradictingEvidence?: Record<string, any>;
  relatedInformation?: Record<string, any>;
  technicalDepth?: TechnicalDepth;
  isCurrent: boolean;
  relevanceToRole: number;
  potentialIssues: string[];
  exaggerationRisk: number;
  inconsistencies?: Record<string, any>;
  followUpQuestions: string[];
  verificationNotes?: string;
  knowledgeBaseMatches?: Record<string, any>;
  verifiedAt: string;
  verifiedBy?: string;
}

// 4.2.7 - Red Flag Alert
export interface RedFlagAlert {
  id: string;
  interviewId: string;
  responseId?: string;
  flagType: RedFlagType;
  severity: RedFlagSeverity;
  title: string;
  description: string;
  triggerText?: string;
  questionContext?: string;
  timestamp?: string;
  confidence: number;
  evidence?: Record<string, any>;
  patterns: string[];
  categories: string[];
  impactArea?: string;
  riskLevel: string;
  suggestedActions: string[];
  followUpQuestions: string[];
  additionalContext?: string;
  isReviewed: boolean;
  reviewedById?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  isFalsePositive: boolean;
  disposition?: RedFlagDisposition;
  detectedAt: string;
}

// 4.2.8 - Interview Summary
export interface InterviewSummary {
  id: string;
  interviewId: string;
  candidateId: string;
  executiveSummary: string;
  detailedSummary: string;
  bulletPoints: string[];
  overallScore: number;
  scoreBreakdown?: Record<string, number>;
  ranking?: string;
  topStrengths: string[];
  areasOfConcern: string[];
  uniqueQualities: string[];
  technicalSkills?: Record<string, number>;
  softSkills?: Record<string, number>;
  skillGaps: string[];
  culturalFitScore?: number;
  culturalFitNotes: string[];
  relevantExperience: string[];
  notableAchievements: string[];
  experienceGaps: string[];
  hiringRecommendation: HiringRecommendation;
  recommendationReason?: string;
  nextSteps: string[];
  suggestedInterviewers: string[];
  followUpQuestions: string[];
  areasToProbe: string[];
  comparedToCriteria?: Record<string, any>;
  standoutFactors: string[];
  reviewedById?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  isApproved: boolean;
  version: number;
  previousVersionId?: string;
  generatedAt: string;
  updatedAt: string;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// 4.2.9 - Interview Highlight
export interface InterviewHighlight {
  id: string;
  interviewId: string;
  responseId?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
  highlightType: HighlightType;
  title: string;
  description?: string;
  transcript?: string;
  questionAsked?: string;
  topic?: string;
  importance: HighlightImportance;
  relevanceScore: number;
  tags: string[];
  categories: string[];
  aiInsight?: string;
  sentiment?: string;
  keyTakeaway?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  isShareable: boolean;
  sharedWith: string[];
  isBookmarked: boolean;
  bookmarkedById?: string;
  bookmarkNotes?: string;
  extractedAt: string;
}

// 4.2.10 - Candidate Comparison
export interface CandidateComparison {
  id: string;
  jobId: string;
  comparisonName?: string;
  candidateIds: string[];
  interviewIds: string[];
  primaryCandidateId?: string;
  createdById: string;
  criteria: string[];
  weights?: Record<string, number>;
  overallRanking: Array<{ candidateId: string; rank: number; score: number }>;
  categoryRankings?: Record<string, Array<{ candidateId: string; rank: number; score: number }>>;
  scores: Record<string, Record<string, number>>;
  normalizedScores?: Record<string, Record<string, number>>;
  strengthsComparison?: Record<string, string[]>;
  weaknessesComparison?: Record<string, string[]>;
  uniqueStrengths?: Record<string, string[]>;
  skillsMatrix?: Record<string, Record<string, number>>;
  skillGapsAnalysis?: Record<string, any>;
  culturalFitScores?: Record<string, number>;
  experienceComparison?: Record<string, any>;
  qualificationMatch?: Record<string, any>;
  topRecommendation?: string;
  recommendationReason?: string;
  orderOfPreference: string[];
  keyDifferentiators?: Record<string, string>;
  tieBreakers: string[];
  concerns?: Record<string, string[]>;
  status: ComparisonStatus;
  isActive: boolean;
  sharedWith: string[];
  sharedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  primaryCandidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Full Analysis Result
export interface FullAnalysisResult {
  interviewId: string;
  transcriptions: InterviewTranscription[];
  answerAnalyses: AnswerAnalysis[];
  topicDetections: TopicDetection[];
  sentimentAnalyses: SentimentAnalysis[];
  communicationScore: CommunicationScore | null;
  technicalVerifications: TechnicalVerification[];
  redFlagAlerts: RedFlagAlert[];
  summaries: InterviewSummary[];
  highlights: InterviewHighlight[];
  analysisStats: {
    transcriptionCount: number;
    answerAnalysisCount: number;
    redFlagCount: number;
    highlightCount: number;
    averageAnswerScore: number | null;
  };
}

// Input Types for Batch 18

export interface CreateTranscriptionInput {
  interviewId: string;
  responseId?: string;
  sourceType: string;
  sourceUrl?: string;
  duration?: number;
  language?: string;
}

export interface AnalyzeAnswerInput {
  interviewId: string;
  transcriptionId?: string;
  responseId?: string;
  questionId?: string;
  questionText?: string;
  questionType?: string;
  answerText: string;
  expectedKeywords?: string[];
}

export interface DetectTopicsInput {
  interviewId: string;
  transcriptionId?: string;
  expectedTopics?: string[];
}

export interface AnalyzeSentimentInput {
  interviewId: string;
  transcriptionId?: string;
  responseId?: string;
}

export interface CalculateCommunicationScoreInput {
  interviewId: string;
  benchmarkRole?: string;
}

export interface VerifyTechnicalClaimInput {
  interviewId: string;
  responseId?: string;
  claimText: string;
  claimType?: ClaimType;
  claimContext?: string;
}

export interface ReviewRedFlagInput {
  disposition: RedFlagDisposition;
  reviewNotes?: string;
  isFalsePositive?: boolean;
}

export interface ApproveSummaryInput {
  reviewNotes?: string;
}

export interface UpdateRecommendationInput {
  hiringRecommendation: HiringRecommendation;
  recommendationReason?: string;
  nextSteps?: string[];
}

export interface BookmarkHighlightInput {
  bookmarkNotes?: string;
}

export interface ShareHighlightInput {
  userIds: string[];
}

export interface CreateComparisonInput {
  jobId: string;
  comparisonName?: string;
  candidateIds: string[];
  interviewIds?: string[];
  primaryCandidateId?: string;
  criteria?: string[];
  weights?: Record<string, number>;
}

export interface ShareComparisonInput {
  userIds: string[];
}

// ============================================
// BATCH 19: AI KNOWLEDGE BASE (4.3.1-4.3.8)
// ============================================

// 4.3.1 - Company Knowledge
export type DocumentType = 'COMPANY_INFO' | 'VALUES' | 'CULTURE' | 'BENEFITS' | 'POLICIES' | 'ONBOARDING' | 'TEAM_INFO';
export type ContentFormat = 'TEXT' | 'MARKDOWN' | 'HTML' | 'PDF';
export type KnowledgeCategory = 'ABOUT_US' | 'CULTURE' | 'BENEFITS' | 'POLICIES' | 'TEAM' | 'PROCESS' | 'FAQ';

export interface CompanyKnowledge {
  id: string;
  companyName: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  content: string;
  contentFormat: ContentFormat;
  sourceUrl?: string;
  filePath?: string;
  extractedTopics: string[];
  extractedKeywords: string[];
  extractedEntities?: Record<string, any>;
  category: KnowledgeCategory;
  subcategory?: string;
  tags: string[];
  isProcessed: boolean;
  processedAt?: string;
  embeddingVector?: string;
  summaryText?: string;
  version: number;
  previousVersionId?: string;
  isPublic: boolean;
  allowedRoles: string[];
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// 4.3.2 - Role-Specific Knowledge
export type SeniorityLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'DIRECTOR' | 'EXECUTIVE';

export interface SkillRequirement {
  level: string;
  weight: number;
}

export interface RoleSpecificKnowledge {
  id: string;
  jobId?: string;
  roleTitle: string;
  department?: string;
  seniorityLevel?: SeniorityLevel;
  teamName?: string;
  teamSize?: number;
  teamDescription?: string;
  reportingTo?: string;
  directReports?: number;
  teamDynamics?: string;
  requiredSkills: Record<string, SkillRequirement>;
  preferredSkills?: Record<string, SkillRequirement>;
  technicalStack: string[];
  toolsUsed: string[];
  dailyResponsibilities: string[];
  projectTypes: string[];
  collaboratesWithTeams: string[];
  meetingCadence?: string;
  currentChallenges: string[];
  growthOpportunities: string[];
  successMetrics: string[];
  domainKnowledge: string[];
  industrySpecifics?: string;
  complianceRequirements: string[];
  embeddingVector?: string;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// 4.3.3 - Interview Playbooks
export type PlaybookInterviewType = 'PHONE_SCREEN' | 'TECHNICAL' | 'BEHAVIORAL' | 'CULTURE_FIT' | 'FINAL';

export interface PlaybookSection {
  name: string;
  duration: number;
  type: string;
  questions: string[];
}

export interface EvaluationCriterion {
  weight: number;
  rubric: string;
}

export interface InterviewPlaybook {
  id: string;
  name: string;
  description?: string;
  roleTitle?: string;
  department?: string;
  seniorityLevel?: SeniorityLevel;
  interviewType: PlaybookInterviewType;
  duration: number;
  sections: PlaybookSection[];
  questionSequence: string[];
  requiredQuestions?: string[];
  optionalQuestions?: string[];
  followUpBank?: Record<string, string[]>;
  evaluationCriteria: Record<string, EvaluationCriterion>;
  scoringGuide?: Record<string, string>;
  mustPassCriteria: string[];
  redFlagIndicators: string[];
  greenFlagIndicators: string[];
  interviewerTips: string[];
  openingScript?: string;
  closingScript?: string;
  transitionPhrases: string[];
  timeBreakdown?: Record<string, number>;
  paceGuidance?: string;
  notesTakingTemplate?: Record<string, any>;
  feedbackFormTemplate?: Record<string, any>;
  timesUsed: number;
  averageRating?: number;
  isTemplate: boolean;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// 4.3.4 - Best Practices Library
export type PracticeType = 'QUESTION' | 'TECHNIQUE' | 'EVALUATION' | 'FEEDBACK' | 'COMMUNICATION' | 'LOGISTICS';

export interface BestPractice {
  id: string;
  practiceType: PracticeType;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  detailedExplanation?: string;
  exampleScenario?: string;
  goodExample?: string;
  badExample?: string;
  applicableRoles: string[];
  applicableSeniorityLevels: string[];
  applicableInterviewTypes: string[];
  dosList: string[];
  dontsList: string[];
  commonMistakes: string[];
  sourceReference?: string;
  successRate?: number;
  usageCount: number;
  rating: number;
  ratingsCount: number;
  feedback?: { userId: string; rating: number; comment: string }[];
  tags: string[];
  keywords: string[];
  isVerified: boolean;
  verifiedById?: string;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// 4.3.5 - Competitor Intelligence
export type MarketPosition = 'LEADER' | 'CHALLENGER' | 'FOLLOWER' | 'NICHE';
export type IntelligenceType = 'COMPENSATION' | 'BENEFITS' | 'CULTURE' | 'TECH_STACK' | 'HIRING_PRACTICES' | 'TALENT_POOL';
export type WorkArrangement = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type HiringVelocity = 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type DataConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SalaryRange {
  min: number;
  max: number;
  median: number;
}

export interface CompetitorIntelligence {
  id: string;
  competitorName: string;
  competitorWebsite?: string;
  industry: string;
  ourCompany?: string;
  competitorSize?: string;
  marketPosition?: MarketPosition;
  intelligenceType: IntelligenceType;
  salaryRanges?: Record<string, SalaryRange>;
  bonusStructure?: string;
  equityOfferings?: string;
  benefitsOffered: string[];
  uniquePerks: string[];
  benefitComparison?: Record<string, any>;
  cultureHighlights: string[];
  workArrangement?: WorkArrangement;
  glassdoorRating?: number;
  reviewSummary?: string;
  techStackUsed: string[];
  recentTechAdoptions: string[];
  hiringVelocity?: HiringVelocity;
  openPositionsCount?: number;
  talentFocusAreas: string[];
  hiringChallenges: string[];
  talentPoolOverlap?: number;
  poachingRisk?: RiskLevel;
  retentionStrategies: string[];
  strengthsVsUs: string[];
  weaknessesVsUs: string[];
  opportunities: string[];
  threats: string[];
  dataSource?: string;
  dataConfidence: DataConfidence;
  lastVerified?: string;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// 4.3.6 - Dynamic FAQ Answers
export type FAQCategory = 'ROLE' | 'COMPANY' | 'BENEFITS' | 'PROCESS' | 'TEAM' | 'TECHNICAL' | 'CULTURE';
export type FAQSourceType = 'MANUAL' | 'IMPORTED' | 'AI_GENERATED';

export interface DynamicFAQ {
  id: string;
  question: string;
  questionVariants: string[];
  questionCategory: FAQCategory;
  answer: string;
  shortAnswer?: string;
  detailedAnswer?: string;
  applicableRoles: string[];
  applicableDepartments: string[];
  applicableJobIds: string[];
  useAIGeneration: boolean;
  aiGeneratedAnswer?: string;
  aiConfidence?: number;
  sourceType: FAQSourceType;
  sourceReference?: string;
  embeddingVector?: string;
  timesAsked: number;
  helpfulCount: number;
  notHelpfulCount: number;
  relatedFAQIds: string[];
  relatedTopics: string[];
  showToCandidates: boolean;
  showToInterviewers: boolean;
  isActive: boolean;
  isVerified: boolean;
  verifiedById?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// 4.3.7 - Continuous Learning (AI Feedback)
export type FeedbackType = 'ASSESSMENT_CORRECTION' | 'SCORING_ADJUSTMENT' | 'QUESTION_QUALITY' | 'ANSWER_EVALUATION' | 'RED_FLAG_ACCURACY';
export type SourceEntityType = 'INTERVIEW' | 'TRANSCRIPTION' | 'ANSWER_ANALYSIS' | 'SUMMARY' | 'RED_FLAG';
export type ErrorType = 'FALSE_POSITIVE' | 'FALSE_NEGATIVE' | 'OVERSCORED' | 'UNDERSCORED' | 'MISSED_CONTEXT';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIFeedbackLearning {
  id: string;
  feedbackType: FeedbackType;
  sourceEntityType: SourceEntityType;
  sourceEntityId: string;
  originalAIOutput: Record<string, any>;
  aiConfidence?: number;
  feedbackById: string;
  feedbackRating: number;
  isAccurate?: boolean;
  accuracyPercentage?: number;
  corrections?: Record<string, any>;
  correctedFields: string[];
  correctionNotes?: string;
  errorType?: ErrorType;
  impactLevel: ImpactLevel;
  shouldTrainOn: boolean;
  trainingWeight: number;
  isProcessedForTraining: boolean;
  processedAt?: string;
  relatedPatterns: string[];
  suggestedImprovement?: string;
  wasAddressed: boolean;
  addressedAt?: string;
  addressedNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// 4.3.8 - Custom Evaluation Criteria
export type ScoringType = 'NUMERIC' | 'PASS_FAIL' | 'RUBRIC' | 'COMPETENCY_LEVELS';
export type CriteriaCategory = 'TECHNICAL' | 'BEHAVIORAL' | 'CULTURAL' | 'COMMUNICATION' | 'LEADERSHIP' | 'PROBLEM_SOLVING';

export interface ScoringRubric {
  [score: number]: string;
}

export interface BehavioralIndicators {
  [level: string]: string[];
}

export interface CustomEvaluationCriteria {
  id: string;
  companyName?: string;
  department?: string;
  roleTitle?: string;
  jobId?: string;
  criterionName: string;
  criterionCode: string;
  description: string;
  category: CriteriaCategory;
  weight: number;
  isMandatory: boolean;
  isKnockout: boolean;
  scoringType: ScoringType;
  minScore: number;
  maxScore: number;
  passingScore?: number;
  scoringRubric?: ScoringRubric;
  behavioralIndicators?: BehavioralIndicators;
  positiveIndicators: string[];
  negativeIndicators: string[];
  questionSuggestions: string[];
  aiEvaluationPrompt?: string;
  aiKeywords: string[];
  aiIgnoreKeywords: string[];
  industryBenchmark?: number;
  internalBenchmark?: number;
  topPerformerThreshold?: number;
  idealResponse?: string;
  acceptableResponse?: string;
  poorResponse?: string;
  isActive: boolean;
  isTemplate: boolean;
  timesUsed: number;
  averageScore?: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// Knowledge Base Stats
export interface KnowledgeBaseStats {
  companyKnowledge: number;
  roleKnowledge: number;
  playbooks: number;
  bestPractices: number;
  competitorIntel: number;
  faqs: number;
  aiFeedback: number;
  evaluationCriteria: number;
  total: number;
}

// Feedback Analytics
export interface FeedbackAnalytics {
  totalFeedback: number;
  processedCount: number;
  addressedCount: number;
  pendingProcessing: number;
  byType: { feedbackType: string; _count: { id: number }; _avg: { feedbackRating: number } }[];
  byEntityType: { sourceEntityType: string; _count: { id: number } }[];
  averageAccuracy: number;
}

// Input Types for Batch 19

export interface CreateCompanyKnowledgeInput {
  companyName: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  content: string;
  contentFormat?: ContentFormat;
  sourceUrl?: string;
  filePath?: string;
  category: KnowledgeCategory;
  subcategory?: string;
  tags?: string[];
  isPublic?: boolean;
  allowedRoles?: string[];
}

export interface CreateRoleKnowledgeInput {
  jobId?: string;
  roleTitle: string;
  department?: string;
  seniorityLevel?: SeniorityLevel;
  teamName?: string;
  teamSize?: number;
  teamDescription?: string;
  reportingTo?: string;
  directReports?: number;
  teamDynamics?: string;
  requiredSkills: Record<string, SkillRequirement>;
  preferredSkills?: Record<string, SkillRequirement>;
  technicalStack?: string[];
  toolsUsed?: string[];
  dailyResponsibilities?: string[];
  projectTypes?: string[];
  collaboratesWithTeams?: string[];
  meetingCadence?: string;
  currentChallenges?: string[];
  growthOpportunities?: string[];
  successMetrics?: string[];
  domainKnowledge?: string[];
  industrySpecifics?: string;
  complianceRequirements?: string[];
}

export interface CreatePlaybookInput {
  name: string;
  description?: string;
  roleTitle?: string;
  department?: string;
  seniorityLevel?: SeniorityLevel;
  interviewType: PlaybookInterviewType;
  duration?: number;
  sections?: PlaybookSection[];
  questionSequence?: string[];
  requiredQuestions?: string[];
  optionalQuestions?: string[];
  followUpBank?: Record<string, string[]>;
  evaluationCriteria?: Record<string, EvaluationCriterion>;
  scoringGuide?: Record<string, string>;
  mustPassCriteria?: string[];
  redFlagIndicators?: string[];
  greenFlagIndicators?: string[];
  interviewerTips?: string[];
  openingScript?: string;
  closingScript?: string;
  transitionPhrases?: string[];
  timeBreakdown?: Record<string, number>;
  paceGuidance?: string;
  notesTakingTemplate?: Record<string, any>;
  feedbackFormTemplate?: Record<string, any>;
  isTemplate?: boolean;
}

export interface CreateBestPracticeInput {
  practiceType: PracticeType;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  detailedExplanation?: string;
  exampleScenario?: string;
  goodExample?: string;
  badExample?: string;
  applicableRoles?: string[];
  applicableSeniorityLevels?: string[];
  applicableInterviewTypes?: string[];
  dosList?: string[];
  dontsList?: string[];
  commonMistakes?: string[];
  sourceReference?: string;
  tags?: string[];
  keywords?: string[];
}

export interface CreateCompetitorIntelInput {
  competitorName: string;
  competitorWebsite?: string;
  industry: string;
  ourCompany?: string;
  competitorSize?: string;
  marketPosition?: MarketPosition;
  intelligenceType: IntelligenceType;
  salaryRanges?: Record<string, SalaryRange>;
  bonusStructure?: string;
  equityOfferings?: string;
  benefitsOffered?: string[];
  uniquePerks?: string[];
  benefitComparison?: Record<string, any>;
  cultureHighlights?: string[];
  workArrangement?: WorkArrangement;
  glassdoorRating?: number;
  reviewSummary?: string;
  techStackUsed?: string[];
  recentTechAdoptions?: string[];
  hiringVelocity?: HiringVelocity;
  openPositionsCount?: number;
  talentFocusAreas?: string[];
  hiringChallenges?: string[];
  talentPoolOverlap?: number;
  poachingRisk?: RiskLevel;
  retentionStrategies?: string[];
  strengthsVsUs?: string[];
  weaknessesVsUs?: string[];
  opportunities?: string[];
  threats?: string[];
  dataSource?: string;
  dataConfidence?: DataConfidence;
}

export interface CreateFAQInput {
  question: string;
  questionVariants?: string[];
  questionCategory: FAQCategory;
  answer: string;
  shortAnswer?: string;
  detailedAnswer?: string;
  applicableRoles?: string[];
  applicableDepartments?: string[];
  applicableJobIds?: string[];
  useAIGeneration?: boolean;
  sourceType?: FAQSourceType;
  sourceReference?: string;
  relatedFAQIds?: string[];
  relatedTopics?: string[];
  showToCandidates?: boolean;
  showToInterviewers?: boolean;
}

export interface SubmitAIFeedbackInput {
  feedbackType: FeedbackType;
  sourceEntityType: SourceEntityType;
  sourceEntityId: string;
  originalAIOutput: Record<string, any>;
  aiConfidence?: number;
  feedbackRating: number;
  isAccurate?: boolean;
  accuracyPercentage?: number;
  corrections?: Record<string, any>;
  correctedFields?: string[];
  correctionNotes?: string;
  errorType?: ErrorType;
  impactLevel?: ImpactLevel;
  shouldTrainOn?: boolean;
  relatedPatterns?: string[];
  suggestedImprovement?: string;
}

export interface CreateEvaluationCriteriaInput {
  companyName?: string;
  department?: string;
  roleTitle?: string;
  jobId?: string;
  criterionName: string;
  criterionCode: string;
  description: string;
  category: CriteriaCategory;
  weight?: number;
  isMandatory?: boolean;
  isKnockout?: boolean;
  scoringType?: ScoringType;
  minScore?: number;
  maxScore?: number;
  passingScore?: number;
  scoringRubric?: ScoringRubric;
  behavioralIndicators?: BehavioralIndicators;
  positiveIndicators?: string[];
  negativeIndicators?: string[];
  questionSuggestions?: string[];
  aiEvaluationPrompt?: string;
  aiKeywords?: string[];
  aiIgnoreKeywords?: string[];
  industryBenchmark?: number;
  internalBenchmark?: number;
  topPerformerThreshold?: number;
  idealResponse?: string;
  acceptableResponse?: string;
  poorResponse?: string;
  isTemplate?: boolean;
}

// ============================================
// BATCH 20: VIDEO INTERVIEW PLATFORM (4.4.1-4.4.12)
// ============================================

// 4.4.1 - Video Room Status
export type VideoRoomStatus = 'SCHEDULED' | 'WAITING' | 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'FAILED';

// 4.4.1 - Video Room Type
export type VideoRoomType = 'LIVE_INTERVIEW' | 'ONE_WAY' | 'PANEL' | 'GROUP' | 'TECHNICAL';

// 4.4.1 - Video Quality
export type VideoQualityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'HD' | 'FULL_HD';

// 4.4.1 - Participant Role
export type VideoParticipantRole = 'HOST' | 'INTERVIEWER' | 'CANDIDATE' | 'OBSERVER' | 'TECHNICAL_SUPPORT';

// 4.4.1 - Participant Status
export type VideoParticipantStatus = 'INVITED' | 'JOINED' | 'LEFT' | 'DISCONNECTED' | 'REMOVED' | 'NO_SHOW';

// 4.4.2-4.4.4 - Video Provider
export type VideoProvider = 'NATIVE' | 'ZOOM' | 'TEAMS' | 'GOOGLE_MEET' | 'WEBEX' | 'CUSTOM';

// 4.4.2-4.4.4 - Integration Status
export type VideoIntegrationStatus = 'PENDING' | 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'FAILED';

// 4.4.5 - Recording Status
export type RecordingStatus = 'NOT_STARTED' | 'RECORDING' | 'PAUSED' | 'STOPPED' | 'PROCESSING' | 'READY' | 'FAILED' | 'DELETED';

// 4.4.6 - Transcription Status
export type TranscriptionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED';

// 4.4.7 - Background Type
export type BackgroundType = 'NONE' | 'BLUR' | 'IMAGE' | 'VIDEO' | 'CUSTOM';

// 4.4.9 - Whiteboard Status
export type WhiteboardStatus = 'IDLE' | 'ACTIVE' | 'PAUSED' | 'ENDED';

// 4.4.10 - Code Editor Status
export type CodeEditorStatus = 'IDLE' | 'ACTIVE' | 'RUNNING' | 'COMPLETED' | 'ERROR';

// 4.4.11 - Timer Status
export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'OVERTIME';

// 4.4.12 - One-Way Interview Status
export type OneWayInterviewStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWING' | 'REVIEWED' | 'EXPIRED' | 'ARCHIVED';

// 4.4.12 - One-Way Response Status
export type OneWayResponseStatus = 'PENDING' | 'RECORDING' | 'SUBMITTED' | 'PROCESSING' | 'READY' | 'REVIEWED' | 'FAILED';

// 4.4.1 - Video Room
export interface VideoRoom {
  id: string;
  companyId: string;
  interviewId?: string;
  applicationId?: string;
  roomType: VideoRoomType;
  roomName: string;
  roomCode: string;
  description?: string;
  provider: VideoProvider;
  externalRoomId?: string;
  externalRoomUrl?: string;
  hostUserId: string;
  scheduledStartAt: string;
  scheduledEndAt?: string;
  actualStartAt?: string;
  actualEndAt?: string;
  durationMinutes: number;
  maxParticipants: number;
  currentParticipantCount: number;
  status: VideoRoomStatus;
  waitingRoomEnabled: boolean;
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  screenShareEnabled: boolean;
  chatEnabled: boolean;
  whiteboardEnabled: boolean;
  codeEditorEnabled: boolean;
  breakoutRoomsEnabled: boolean;
  virtualBackgroundAllowed: boolean;
  defaultVideoQuality: VideoQualityType;
  autoAdmitParticipants: boolean;
  muteOnEntry: boolean;
  disableVideoOnEntry: boolean;
  password?: string;
  accessToken?: string;
  joinUrl: string;
  hostJoinUrl?: string;
  metadata?: Record<string, any>;
  connectionQuality?: ConnectionQuality;
  techIssues?: TechIssue[];
  feedbackScore?: number;
  feedbackNotes?: string;
  createdAt: string;
  updatedAt: string;
  participants?: VideoParticipant[];
  recordings?: VideoRecording[];
  transcriptions?: LiveTranscription[];
}

export interface ConnectionQuality {
  latency: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

export interface TechIssue {
  type: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

// 4.4.1 - Video Participant
export interface VideoParticipant {
  id: string;
  roomId: string;
  userId: string;
  email: string;
  displayName: string;
  role: VideoParticipantRole;
  status: VideoParticipantStatus;
  joinedAt?: string;
  leftAt?: string;
  totalTimeSeconds?: number;
  deviceInfo?: DeviceInfo;
  networkInfo?: NetworkInfo;
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
  handRaised: boolean;
  speakingTime?: number;
  interactionScore?: number;
  connectionQuality?: ConnectionQuality;
  techIssuesReported?: TechIssue[];
  createdAt: string;
  updatedAt: string;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  camera?: string;
  microphone?: string;
}

export interface NetworkInfo {
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

// 4.4.2-4.4.4 - Video Integration
export interface VideoIntegration {
  id: string;
  companyId: string;
  userId: string;
  provider: VideoProvider;
  providerAccountId?: string;
  providerEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes?: string[];
  webhookSecret?: string;
  webhookUrl?: string;
  status: VideoIntegrationStatus;
  lastSyncAt?: string;
  syncErrors?: string[];
  features: VideoProviderFeatures;
  settings: VideoProviderSettings;
  apiKey?: string;
  apiSecret?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoProviderFeatures {
  supportsRecording: boolean;
  supportsTranscription: boolean;
  supportsBreakoutRooms: boolean;
  supportsPolls: boolean;
  supportsChat: boolean;
  supportsScreenShare: boolean;
  supportsVirtualBackground: boolean;
  supportsWhiteboard: boolean;
  maxParticipants: number;
  maxDurationMinutes: number;
}

export interface VideoProviderSettings {
  defaultMeetingDuration: number;
  autoRecording: boolean;
  waitingRoomDefault: boolean;
  muteOnEntryDefault: boolean;
  allowJoinBeforeHost: boolean;
  requirePassword: boolean;
  timezone: string;
}

// 4.4.2-4.4.4 - External Meeting
export interface ExternalMeeting {
  id: string;
  integrationId: string;
  roomId?: string;
  externalMeetingId: string;
  meetingUuid?: string;
  topic: string;
  agenda?: string;
  startUrl: string;
  joinUrl: string;
  password?: string;
  dialInNumbers?: DialInNumber[];
  scheduledStartAt: string;
  scheduledEndAt?: string;
  durationMinutes: number;
  hostId: string;
  hostEmail?: string;
  settings: ExternalMeetingSettings;
  status: string;
  startedAt?: string;
  endedAt?: string;
  participantCount?: number;
  recordingUrls?: string[];
  transcriptUrl?: string;
  rawResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DialInNumber {
  country: string;
  countryCode: string;
  number: string;
  type: 'toll' | 'toll-free';
}

export interface ExternalMeetingSettings {
  hostVideo: boolean;
  participantVideo: boolean;
  joinBeforeHost: boolean;
  muteUponEntry: boolean;
  watermark: boolean;
  autoRecording: 'none' | 'local' | 'cloud';
  waitingRoom: boolean;
  breakoutRooms: boolean;
}

// 4.4.5 - Video Recording
export interface VideoRecording {
  id: string;
  roomId: string;
  externalRecordingId?: string;
  recordingType: 'FULL' | 'AUDIO_ONLY' | 'SCREEN_ONLY' | 'GALLERY' | 'SPEAKER';
  status: RecordingStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSizeBytes?: number;
  format: string;
  resolution?: string;
  codec?: string;
  bitrate?: number;
  processingProgress?: number;
  processedAt?: string;
  expiresAt?: string;
  storageLocation: 'LOCAL' | 'S3' | 'AZURE' | 'GCP' | 'PROVIDER';
  storagePath?: string;
  downloadable: boolean;
  downloadCount: number;
  viewCount: number;
  accessControl: RecordingAccessControl;
  retentionDays: number;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RecordingAccessControl {
  publicAccess: boolean;
  allowedUserIds: string[];
  allowedRoles: string[];
  requiresPassword: boolean;
  password?: string;
  expiresAt?: string;
}

// 4.4.6 - Live Transcription
export interface LiveTranscription {
  id: string;
  roomId: string;
  recordingId?: string;
  transcriptionProvider: 'NATIVE' | 'ASSEMBLY_AI' | 'DEEPGRAM' | 'AWS' | 'GOOGLE' | 'AZURE';
  language: string;
  status: TranscriptionStatus;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  fullTranscript?: string;
  segments: TranscriptionSegment[];
  wordCount?: number;
  confidenceScore?: number;
  speakerDiarization: boolean;
  speakers?: SpeakerInfo[];
  keyMoments?: KeyMoment[];
  topics?: TopicMention[];
  sentiment?: SentimentAnalysis;
  fillerWords?: FillerWordAnalysis;
  exportFormats?: string[];
  vttUrl?: string;
  srtUrl?: string;
  txtUrl?: string;
  jsonUrl?: string;
  processingProgress?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptionSegment {
  id: string;
  speakerId?: string;
  speakerName?: string;
  startTimeMs: number;
  endTimeMs: number;
  text: string;
  confidence: number;
  words?: WordTiming[];
  sentiment?: string;
  isQuestion?: boolean;
  isFlagged?: boolean;
}

export interface WordTiming {
  word: string;
  startTimeMs: number;
  endTimeMs: number;
  confidence: number;
}

export interface SpeakerInfo {
  id: string;
  name?: string;
  role?: string;
  totalSpeakingTimeSeconds: number;
  wordCount: number;
  averagePace: number;
  sentimentBreakdown?: Record<string, number>;
}

export interface KeyMoment {
  timestamp: number;
  type: 'QUESTION' | 'ANSWER' | 'TOPIC_CHANGE' | 'KEY_POINT' | 'ACTION_ITEM';
  text: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TopicMention {
  topic: string;
  count: number;
  firstMentionMs: number;
  lastMentionMs: number;
}

export interface SentimentAnalysis {
  overall: string;
  positive: number;
  negative: number;
  neutral: number;
  timeline?: SentimentTimepoint[];
}

export interface SentimentTimepoint {
  timestampMs: number;
  sentiment: string;
  score: number;
}

export interface FillerWordAnalysis {
  totalCount: number;
  perMinute: number;
  breakdown: Record<string, number>;
}

// 4.4.7 - Virtual Background
export interface VirtualBackground {
  id: string;
  companyId: string;
  userId?: string;
  backgroundName: string;
  backgroundType: BackgroundType;
  imageUrl?: string;
  thumbnailUrl?: string;
  blurIntensity?: number;
  isDefault: boolean;
  isCompanyBranded: boolean;
  brandColor?: string;
  brandLogoUrl?: string;
  category?: string;
  tags?: string[];
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 4.4.9 - Whiteboard Session
export interface WhiteboardSession {
  id: string;
  roomId: string;
  sessionName: string;
  status: WhiteboardStatus;
  createdById: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor?: string;
  currentState?: string;
  stateHistory?: WhiteboardState[];
  undoStack?: string[];
  redoStack?: string[];
  collaborators: WhiteboardCollaborator[];
  allowAllEdit: boolean;
  showCursors: boolean;
  showNames: boolean;
  gridEnabled: boolean;
  snapToGrid: boolean;
  exportUrls?: Record<string, string>;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WhiteboardState {
  stateId: string;
  timestamp: string;
  userId: string;
  action: string;
  data: string;
}

export interface WhiteboardCollaborator {
  participantId: string;
  userId: string;
  displayName: string;
  canEdit: boolean;
  cursorPosition?: { x: number; y: number };
  cursorColor: string;
  isActive: boolean;
  lastActiveAt: string;
}

// 4.4.10 - Code Editor Session
export interface CodeEditorSession {
  id: string;
  roomId: string;
  sessionName: string;
  problemTitle?: string;
  problemDescription?: string;
  programmingLanguage: string;
  supportedLanguages: string[];
  status: CodeEditorStatus;
  createdById: string;
  starterCode?: string;
  currentCode: string;
  codeHistory: CodeSnapshot[];
  testCases?: CodeTestCase[];
  hiddenTestCases?: CodeTestCase[];
  lastExecutionResult?: ExecutionResult;
  executionHistory: ExecutionResult[];
  collaborators: CodeCollaborator[];
  allowLanguageChange: boolean;
  allowExecution: boolean;
  allowAIAssist: boolean;
  showLineNumbers: boolean;
  syntaxHighlighting: boolean;
  autoComplete: boolean;
  theme: string;
  fontSize: number;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CodeSnapshot {
  snapshotId: string;
  timestamp: string;
  userId: string;
  language: string;
  code: string;
  cursorPosition?: { line: number; column: number };
}

export interface CodeTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
  isHidden?: boolean;
}

export interface ExecutionResult {
  executionId: string;
  timestamp: string;
  userId: string;
  language: string;
  code: string;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'MEMORY_LIMIT';
  output?: string;
  error?: string;
  executionTimeMs: number;
  memoryUsageBytes?: number;
  testResults?: TestCaseResult[];
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTimeMs: number;
}

export interface CodeCollaborator {
  participantId: string;
  userId: string;
  displayName: string;
  canEdit: boolean;
  cursorPosition?: { line: number; column: number };
  cursorColor: string;
  isActive: boolean;
  lastActiveAt: string;
}

// 4.4.8 - Video Chat Message
export interface VideoChatMessage {
  id: string;
  roomId: string;
  participantId: string;
  userId: string;
  displayName: string;
  messageType: 'TEXT' | 'FILE' | 'REACTION' | 'SYSTEM' | 'POLL';
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  replyToId?: string;
  reactions?: MessageReaction[];
  pollData?: PollData;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  isPrivate: boolean;
  recipientIds?: string[];
  isPinned: boolean;
  pinnedBy?: string;
  pinnedAt?: string;
  readBy: string[];
  sentAt: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface PollData {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  isAnonymous: boolean;
  endsAt?: string;
  status: 'ACTIVE' | 'ENDED';
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voterIds: string[];
}

// 4.4.11 - Interview Timer
export interface InterviewTimer {
  id: string;
  roomId: string;
  timerName: string;
  timerType: 'COUNTDOWN' | 'STOPWATCH' | 'SECTION' | 'BREAK';
  status: TimerStatus;
  totalDurationSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  warningAtSeconds?: number;
  sections?: TimerSection[];
  currentSectionIndex?: number;
  startedBy?: string;
  pausedBy?: string;
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  overtimeSeconds?: number;
  isVisible: boolean;
  soundEnabled: boolean;
  autoAdvance: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimerSection {
  id: string;
  name: string;
  durationSeconds: number;
  order: number;
  isCompleted: boolean;
  startedAt?: string;
  completedAt?: string;
}

// 4.4.12 - One-Way Interview
export interface OneWayInterview {
  id: string;
  companyId: string;
  jobId?: string;
  title: string;
  description?: string;
  instructions?: string;
  welcomeMessage?: string;
  completionMessage?: string;
  questions: OneWayQuestion[];
  settings: OneWaySettings;
  branding?: OneWayBranding;
  status: OneWayInterviewStatus;
  expiresAt?: string;
  maxAttempts: number;
  totalInvited: number;
  totalStarted: number;
  totalCompleted: number;
  averageScore?: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  responses?: OneWayResponse[];
}

export interface OneWayQuestion {
  id: string;
  order: number;
  questionText: string;
  questionType: 'VIDEO' | 'AUDIO' | 'TEXT' | 'MULTIPLE_CHOICE';
  thinkTimeSeconds: number;
  maxResponseSeconds: number;
  retakesAllowed: number;
  isRequired: boolean;
  aiEvaluationEnabled: boolean;
  evaluationCriteria?: string[];
  idealResponse?: string;
  options?: string[];
  weight: number;
}

export interface OneWaySettings {
  allowRetakes: boolean;
  showQuestionUpfront: boolean;
  randomizeQuestions: boolean;
  requireCamera: boolean;
  requireMicrophone: boolean;
  allowPause: boolean;
  allowSkip: boolean;
  deadlineEnforced: boolean;
  autoSubmit: boolean;
  notifyOnComplete: boolean;
  sendReminderEmails: boolean;
  reminderDays?: number[];
}

export interface OneWayBranding {
  logoUrl?: string;
  primaryColor?: string;
  backgroundColor?: string;
  welcomeVideoUrl?: string;
  customCss?: string;
}

// 4.4.12 - One-Way Response
export interface OneWayResponse {
  id: string;
  interviewId: string;
  candidateId: string;
  applicationId?: string;
  inviteToken: string;
  status: OneWayResponseStatus;
  attemptNumber: number;
  startedAt?: string;
  submittedAt?: string;
  totalDurationSeconds?: number;
  questionResponses: QuestionResponse[];
  deviceInfo?: DeviceInfo;
  networkInfo?: NetworkInfo;
  overallScore?: number;
  aiScore?: number;
  reviewerScore?: number;
  reviewerId?: string;
  reviewedAt?: string;
  feedback?: string;
  rating?: number;
  recommendation?: string;
  flags?: ResponseFlag[];
  viewCount: number;
  lastViewedAt?: string;
  lastViewedBy?: string;
  shareToken?: string;
  sharedWith?: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResponse {
  questionId: string;
  questionOrder: number;
  responseType: 'VIDEO' | 'AUDIO' | 'TEXT' | 'MULTIPLE_CHOICE';
  videoUrl?: string;
  audioUrl?: string;
  textResponse?: string;
  selectedOptions?: string[];
  thumbnailUrl?: string;
  durationSeconds?: number;
  retakeNumber: number;
  startedAt: string;
  completedAt?: string;
  transcription?: string;
  aiAnalysis?: AIResponseAnalysis;
  manualScore?: number;
  manualFeedback?: string;
}

export interface AIResponseAnalysis {
  contentScore: number;
  deliveryScore: number;
  clarityScore: number;
  relevanceScore: number;
  confidenceScore: number;
  overallScore: number;
  keyPoints: string[];
  strengths: string[];
  improvements: string[];
  sentiment: string;
  speechPace: number;
  fillerWordCount: number;
  eyeContactScore?: number;
  bodyLanguageScore?: number;
}

export interface ResponseFlag {
  type: 'TECHNICAL_ISSUE' | 'SUSPICIOUS_ACTIVITY' | 'INCOMPLETE' | 'LOW_QUALITY' | 'EXCEPTIONAL';
  description: string;
  timestamp: string;
  flaggedBy?: string;
}

// Video Interview Input Types
export interface CreateVideoRoomInput {
  interviewId?: string;
  applicationId?: string;
  roomType: VideoRoomType;
  roomName: string;
  description?: string;
  provider?: VideoProvider;
  scheduledStartAt: string;
  scheduledEndAt?: string;
  durationMinutes: number;
  maxParticipants?: number;
  waitingRoomEnabled?: boolean;
  recordingEnabled?: boolean;
  transcriptionEnabled?: boolean;
  screenShareEnabled?: boolean;
  chatEnabled?: boolean;
  whiteboardEnabled?: boolean;
  codeEditorEnabled?: boolean;
  virtualBackgroundAllowed?: boolean;
  defaultVideoQuality?: VideoQualityType;
  autoAdmitParticipants?: boolean;
  muteOnEntry?: boolean;
  password?: string;
}

export interface AddParticipantInput {
  userId: string;
  email: string;
  displayName: string;
  role: VideoParticipantRole;
}

export interface CreateVideoIntegrationInput {
  provider: VideoProvider;
  providerAccountId?: string;
  providerEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes?: string[];
  apiKey?: string;
  apiSecret?: string;
  settings?: VideoProviderSettings;
}

export interface CreateRecordingInput {
  recordingType?: 'FULL' | 'AUDIO_ONLY' | 'SCREEN_ONLY' | 'GALLERY' | 'SPEAKER';
  format?: string;
  resolution?: string;
  accessControl?: Partial<RecordingAccessControl>;
  retentionDays?: number;
}

export interface CreateTranscriptionInput {
  recordingId?: string;
  transcriptionProvider?: 'NATIVE' | 'ASSEMBLY_AI' | 'DEEPGRAM' | 'AWS' | 'GOOGLE' | 'AZURE';
  language?: string;
  speakerDiarization?: boolean;
}

export interface CreateVirtualBackgroundInput {
  backgroundName: string;
  backgroundType: BackgroundType;
  imageUrl?: string;
  blurIntensity?: number;
  isCompanyBranded?: boolean;
  brandColor?: string;
  brandLogoUrl?: string;
  category?: string;
  tags?: string[];
}

export interface CreateWhiteboardInput {
  sessionName?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundColor?: string;
  allowAllEdit?: boolean;
  showCursors?: boolean;
  showNames?: boolean;
  gridEnabled?: boolean;
  snapToGrid?: boolean;
}

export interface CreateCodeEditorInput {
  sessionName?: string;
  problemTitle?: string;
  problemDescription?: string;
  programmingLanguage: string;
  supportedLanguages?: string[];
  starterCode?: string;
  testCases?: CodeTestCase[];
  hiddenTestCases?: CodeTestCase[];
  allowLanguageChange?: boolean;
  allowExecution?: boolean;
  allowAIAssist?: boolean;
  theme?: string;
  fontSize?: number;
}

export interface ExecuteCodeInput {
  language: string;
  code: string;
  input?: string;
  timeoutSeconds?: number;
}

export interface SendChatMessageInput {
  messageType?: 'TEXT' | 'FILE' | 'REACTION' | 'POLL';
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  replyToId?: string;
  isPrivate?: boolean;
  recipientIds?: string[];
  pollData?: Omit<PollData, 'status'>;
}

export interface CreateTimerInput {
  timerName?: string;
  timerType: 'COUNTDOWN' | 'STOPWATCH' | 'SECTION' | 'BREAK';
  totalDurationSeconds: number;
  warningAtSeconds?: number;
  sections?: Omit<TimerSection, 'id' | 'isCompleted' | 'startedAt' | 'completedAt'>[];
  isVisible?: boolean;
  soundEnabled?: boolean;
  autoAdvance?: boolean;
}

export interface CreateOneWayInterviewInput {
  jobId?: string;
  title: string;
  description?: string;
  instructions?: string;
  welcomeMessage?: string;
  completionMessage?: string;
  questions: Omit<OneWayQuestion, 'id'>[];
  settings?: Partial<OneWaySettings>;
  branding?: OneWayBranding;
  expiresAt?: string;
  maxAttempts?: number;
}

export interface InviteCandidateInput {
  candidateId: string;
  applicationId?: string;
  email: string;
  name: string;
  deadline?: string;
  personalMessage?: string;
}

export interface ReviewOneWayResponseInput {
  overallScore?: number;
  reviewerScore?: number;
  feedback?: string;
  rating?: number;
  recommendation?: string;
  questionScores?: Record<string, { score: number; feedback?: string }>;
}

// Video Interview Stats
export interface VideoInterviewStats {
  rooms: {
    total: number;
    scheduled: number;
    active: number;
    completed: number;
    averageDuration: number;
  };
  recordings: {
    total: number;
    totalStorageBytes: number;
    averageDuration: number;
  };
  oneWayInterviews: {
    total: number;
    active: number;
    totalResponses: number;
    completionRate: number;
    averageScore: number;
  };
  integrations: {
    total: number;
    byProvider: Record<string, number>;
  };
}

// ============================================
// BATCH 21: SEMANTIC MATCHING ENGINE (5.1.1-5.1.7)
// ============================================

// 5.1.1 - Skill Types
export type SkillType = 'TECHNICAL' | 'SOFT' | 'DOMAIN' | 'TOOL';
export type SkillRelationshipType = 'SIMILAR' | 'PREREQUISITE' | 'ADVANCED' | 'SUBSET' | 'SUPERSET' | 'RELATED' | 'DIFFERENT';

// 5.1.2 - Experience Levels
export type ExperienceLevelType = 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL' | 'EXECUTIVE';
export type ExperienceRuleType = 'PATTERN' | 'TITLE' | 'DURATION' | 'KEYWORDS';

// 5.1.4 - Learning Curve
export type LearningCurve = 'EASY' | 'MODERATE' | 'STEEP';

// 5.1.6 - Industry Crossover Difficulty
export type CrossoverDifficulty = 'EASY' | 'MODERATE' | 'DIFFICULT';

// 5.1.7 - Hidden Talent Status
export type HiddenTalentStatus = 'DISCOVERED' | 'REVIEWED' | 'CONTACTED' | 'CONVERTED' | 'DISMISSED';

// Match Recommendation
export type MatchRecommendation = 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';

// Experience Level Fit
export type ExperienceLevelFit = 'UNDER' | 'MATCH' | 'OVER';

// 5.1.1 - Skill Embedding
export interface SkillEmbedding {
  id: string;
  companyId?: string;
  skillName: string;
  normalizedName: string;
  skillCategory?: string;
  skillType: SkillType;
  embeddingModel: string;
  embeddingVersion: string;
  vectorDimension: number;
  relatedSkills?: RelatedSkill[];
  synonyms: string[];
  alternateNames: string[];
  usageCount: number;
  lastUsedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RelatedSkill {
  skillId: string;
  skillName?: string;
  similarity: number;
}

// 5.1.1 - Skill Similarity
export interface SkillSimilarity {
  id: string;
  skillAId: string;
  skillAName: string;
  skillBId: string;
  skillBName: string;
  cosineSimilarity: number;
  contextualSimilarity?: number;
  combinedScore: number;
  relationshipType: SkillRelationshipType;
  confidenceScore: number;
  validatedBy?: string;
  validatedAt?: string;
  calculatedAt: string;
  expiresAt?: string;
}

// 5.1.2 - Experience Level Rule
export interface ExperienceLevelRule {
  id: string;
  companyId?: string;
  ruleName: string;
  ruleDescription?: string;
  ruleType: ExperienceRuleType;
  titlePatterns: string[];
  excludePatterns: string[];
  minYearsExperience?: number;
  maxYearsExperience?: number;
  minRoleDuration?: number;
  seniorityKeywords: string[];
  responsibilityKeywords: string[];
  inferredLevel: ExperienceLevelType;
  levelNumeric: number;
  levelConfidence: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 5.1.2 - Candidate Experience Level
export interface CandidateExperienceLevel {
  id: string;
  candidateId: string;
  profileId?: string;
  overallLevel: ExperienceLevelType;
  overallLevelNumeric: number;
  technicalLevel?: ExperienceLevelType;
  technicalLevelNumeric?: number;
  leadershipLevel?: ExperienceLevelType;
  leadershipLevelNumeric?: number;
  domainLevel?: ExperienceLevelType;
  domainLevelNumeric?: number;
  evidenceFactors: EvidenceFactor[];
  titleProgression?: string[];
  yearsCalculated?: number;
  roleCount?: number;
  confidenceScore: number;
  manualOverride: boolean;
  overriddenBy?: string;
  overriddenAt?: string;
  overrideReason?: string;
  calculatedAt: string;
  updatedAt: string;
}

export interface EvidenceFactor {
  factor: string;
  weight: number;
  contribution: number;
}

// 5.1.3 - Role Mapping
export interface RoleMapping {
  id: string;
  companyId?: string;
  roleTitle: string;
  normalizedTitle: string;
  roleCategory?: string;
  roleFamily?: string;
  roleFunction?: string;
  industry?: string;
  industrySpecific: boolean;
  similarRoles?: RelatedRole[];
  equivalentTitles: string[];
  seniorVariants: string[];
  juniorVariants: string[];
  typicalSkills: string[];
  typicalExperience?: number;
  typicalEducation?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RelatedRole {
  roleId: string;
  roleTitle?: string;
  similarity: number;
}

// 5.1.3 - Role Similarity
export interface RoleSimilarityScore {
  id: string;
  roleAId: string;
  roleATitle: string;
  roleBId: string;
  roleBTitle: string;
  titleSimilarity: number;
  functionSimilarity: number;
  skillOverlap: number;
  combinedScore: number;
  transferabilityScore?: number;
  gapAnalysis?: RoleGapAnalysis;
  crossIndustry: boolean;
  industryAdjustment: number;
  calculatedAt: string;
  expiresAt?: string;
}

export interface RoleGapAnalysis {
  skillsToAcquire: string[];
  experienceGap: number;
}

// 5.1.4 - Skill Transferability
export interface SkillTransferabilityScore {
  id: string;
  sourceSkillId: string;
  sourceSkillName: string;
  targetSkillId: string;
  targetSkillName: string;
  transferabilityScore: number;
  learningCurve: LearningCurve;
  estimatedLearningDays?: number;
  transferContext?: string;
  evidenceType: 'COMPUTED' | 'VALIDATED' | 'EXPERT';
  evidenceSource?: string;
  examplesCount: number;
  prerequisiteSkills: string[];
  bridgingConcepts: string[];
  confidenceScore: number;
  calculatedAt: string;
  updatedAt: string;
}

// 5.1.4 - Transferable Skills Analysis
export interface TransferableSkillsAnalysis {
  candidateId: string;
  analysis: SkillTransferAnalysis[];
  overallTransferability: number;
  readySkills: number;
  transferableSkills: number;
  gapSkills: number;
}

export interface SkillTransferAnalysis {
  targetSkill: string;
  hasDirectMatch: boolean;
  transferableFrom: string[];
  transferabilityScore: number;
  learningCurve: LearningCurve;
  estimatedDays: number;
}

// 5.1.5 - Project Relevance Score
export interface ProjectRelevanceScore {
  id: string;
  projectId: string;
  projectTitle: string;
  projectDescription?: string;
  projectSkills: string[];
  jobId: string;
  jobTitle: string;
  jobRequirements?: string;
  jobSkills: string[];
  overallRelevance: number;
  skillMatchScore: number;
  domainMatchScore: number;
  complexityMatchScore?: number;
  recencyScore?: number;
  matchedSkills: string[];
  partialMatchSkills?: PartialSkillMatch[];
  missingSkills: string[];
  bonusSkills: string[];
  projectComplexity?: 'LOW' | 'MEDIUM' | 'HIGH';
  projectImpact?: 'Individual' | 'Team' | 'Organization';
  projectScale?: 'Small' | 'Medium' | 'Large';
  calculatedAt: string;
  expiresAt?: string;
}

export interface PartialSkillMatch {
  skill: string;
  similarity: number;
}

// 5.1.5 - Batch Project Relevance Result
export interface BatchProjectRelevanceResult {
  candidateId: string;
  jobId: string;
  projectRelevanceScores: ProjectRelevanceSummary[];
  mostRelevantProject?: ProjectRelevanceSummary;
  averageRelevance: number;
}

export interface ProjectRelevanceSummary {
  projectId: string;
  projectTitle: string;
  overallRelevance: number;
  skillMatchScore: number;
  matchedSkills: string[];
  rank: number;
}

// 5.1.6 - Industry Crossover
export interface IndustryCrossover {
  id: string;
  sourceIndustry: string;
  targetIndustry: string;
  crossoverScore: number;
  crossoverDifficulty: CrossoverDifficulty;
  roleCompatibility?: Record<string, RoleCompatibility[]>;
  commonRoles: string[];
  transferableSkills: string[];
  industrySpecificSkills?: Record<string, string[]>;
  bridgingSkills: string[];
  successFactors: string[];
  commonChallenges: string[];
  typicalTransitionPath?: string;
  averageTransitionTime?: number;
  transitionExamples: number;
  successRate?: number;
  calculatedAt: string;
  updatedAt: string;
}

export interface RoleCompatibility {
  targetRole: string;
  compatibility: number;
}

// 5.1.6 - Industry Crossover Analysis
export interface IndustryCrossoverAnalysis {
  candidateId: string;
  currentIndustry: string;
  targetIndustry: string;
  crossoverScore: number;
  readiness: 'LOW' | 'MODERATE' | 'HIGH';
  transferableSkillsPresent: string[];
  skillsToAcquire: string[];
  estimatedTransitionTime: number;
  recommendations: string[];
  similarSuccessfulTransitions: number;
  confidenceScore: number;
}

// 5.1.7 - Hidden Talent Profile
export interface HiddenTalentProfile {
  id: string;
  companyId: string;
  candidateId: string;
  candidateName?: string;
  profileId?: string;
  discoveredForJobId?: string;
  discoveredForRole?: string;
  hiddenReasons: string[];
  keywordGaps: string[];
  unconventionalPath: boolean;
  careerPivot: boolean;
  industryOutsider: boolean;
  potentialScore: number;
  potentialFactors: Record<string, any>;
  transferableSkills?: Record<string, any>;
  relevantExperience?: Record<string, any>;
  hiddenQualifications: string[];
  traditionalMatchScore?: number;
  semanticMatchScore: number;
  scoreLift: number;
  status: HiddenTalentStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  outcomeNotes?: string;
  discoveredAt: string;
  updatedAt: string;
}

// 5.1.7 - Hidden Talent Discovery Result
export interface HiddenTalentDiscoveryResult {
  jobId: string;
  jobTitle: string;
  hiddenTalentFound: number;
  candidates: HiddenTalentProfile[];
  averageScoreLift: number;
  discoveredAt: string;
}

// Candidate Match Score
export interface CandidateMatchScore {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  overallMatchScore: number;
  semanticScore: number;
  keywordScore?: number;
  experienceScore?: number;
  skillScore?: number;
  projectScore?: number;
  cultureFitScore?: number;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[];
  partialMatchSkills?: PartialSkillMatch[];
  missingSkills: string[];
  bonusQualifications: string[];
  experienceLevelFit?: ExperienceLevelFit;
  yearsExperienceFit?: 'Below' | 'Match' | 'Above';
  seniorityFit?: number;
  flightRisk?: number;
  growthPotential?: number;
  retentionPrediction?: number;
  isHiddenTalent: boolean;
  hiddenTalentBoost: number;
  rankInPool?: number;
  percentile?: number;
  recommendation?: MatchRecommendation;
  recommendationReason?: string;
  matchingVersion: string;
  calculatedAt: string;
  expiresAt?: string;
}

export interface ScoreBreakdown {
  skills?: ScoreComponent;
  experience?: ScoreComponent;
  projects?: ScoreComponent;
  education?: ScoreComponent;
  cultureFit?: ScoreComponent;
}

export interface ScoreComponent {
  score: number;
  weight: number;
}

// Match Score Summary for Lists
export interface MatchScoreSummary {
  id: string;
  candidateId: string;
  jobId: string;
  overallMatchScore: number;
  recommendation: MatchRecommendation;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  isHiddenTalent: boolean;
  calculatedAt: string;
}

// Job Match Scores Result
export interface JobMatchScoresResult {
  jobId: string;
  totalCandidates: number;
  scores: MatchScoreSummary[];
  averageScore: number;
  hiddenTalentCount: number;
}

// Matching Configuration
export interface MatchingConfig {
  id: string;
  companyId: string;
  jobId?: string;
  skillWeight: number;
  experienceWeight: number;
  projectWeight: number;
  educationWeight: number;
  cultureFitWeight: number;
  bonusWeight: number;
  minimumMatchScore: number;
  hiddenTalentThreshold: number;
  autoAdvanceThreshold: number;
  autoRejectThreshold: number;
  enableSemanticMatching: boolean;
  enableHiddenTalent: boolean;
  enableIndustryCrossover: boolean;
  enableSkillTransfer: boolean;
  blindScreeningEnabled: boolean;
  diversityBoostEnabled: boolean;
  diversityBoostAmount: number;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  dealBreakerMissing: string[];
  customRules?: Record<string, any>;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// Semantic Matching Stats
export interface SemanticMatchingStats {
  skillEmbeddings: {
    total: number;
    active: number;
    byCategory: Record<string, number>;
  };
  roleMappings: {
    total: number;
    byCategory: Record<string, number>;
  };
  matchScores: {
    totalCalculated: number;
    averageScore: number;
    hiddenTalentDiscovered: number;
    hiddenTalentConversionRate: number;
  };
  industryCrossovers: {
    total: number;
    mostCommon: string[];
  };
  performance: {
    averageMatchTime: number;
    semanticBoostAverage: number;
    hiddenTalentBoostAverage: number;
  };
}

// Semantic Matching Input Types
export interface CreateSkillEmbeddingInput {
  skillName: string;
  skillCategory?: string;
  skillType?: SkillType;
  synonyms?: string[];
  alternateNames?: string[];
}

export interface CreateExperienceLevelRuleInput {
  companyId?: string;
  ruleName: string;
  ruleDescription?: string;
  ruleType?: ExperienceRuleType;
  titlePatterns?: string[];
  excludePatterns?: string[];
  minYearsExperience?: number;
  maxYearsExperience?: number;
  seniorityKeywords?: string[];
  inferredLevel: ExperienceLevelType;
  levelNumeric: number;
  priority?: number;
}

export interface InferExperienceLevelInput {
  titles: string[];
  yearsExperience: number;
  roleCount: number;
  companyHistory?: string[];
}

export interface CreateRoleMappingInput {
  companyId?: string;
  roleTitle: string;
  roleCategory?: string;
  roleFamily?: string;
  roleFunction?: string;
  industry?: string;
  equivalentTitles?: string[];
  seniorVariants?: string[];
  juniorVariants?: string[];
  typicalSkills?: string[];
  typicalExperience?: number;
}

export interface CalculateSkillSimilarityInput {
  skillAId: string;
  skillBId: string;
  skillAName: string;
  skillBName: string;
}

export interface CalculateRoleSimilarityInput {
  roleAId: string;
  roleBId: string;
  roleATitle: string;
  roleBTitle: string;
}

export interface CreateSkillTransferabilityInput {
  sourceSkillId: string;
  sourceSkillName: string;
  targetSkillId: string;
  targetSkillName: string;
  transferabilityScore?: number;
  learningCurve?: LearningCurve;
  estimatedLearningDays?: number;
  transferContext?: string;
  prerequisiteSkills?: string[];
  bridgingConcepts?: string[];
}

export interface AnalyzeTransferableSkillsInput {
  targetSkills: string[];
  candidateSkills: string[];
}

export interface CalculateProjectRelevanceInput {
  projectId: string;
  projectTitle: string;
  projectDescription?: string;
  projectSkills: string[];
  jobId: string;
  jobTitle: string;
  jobRequirements?: string;
  jobSkills: string[];
}

export interface BatchProjectRelevanceInput {
  projects: Array<{
    id: string;
    title: string;
    skills: string[];
  }>;
  jobId: string;
  jobSkills: string[];
}

export interface CreateIndustryCrossoverInput {
  sourceIndustry: string;
  targetIndustry: string;
  crossoverScore?: number;
  crossoverDifficulty?: CrossoverDifficulty;
  commonRoles?: string[];
  transferableSkills?: string[];
  bridgingSkills?: string[];
  successFactors?: string[];
  commonChallenges?: string[];
}

export interface AnalyzeIndustryCrossoverInput {
  currentIndustry: string;
  targetIndustry: string;
  candidateSkills: string[];
}

export interface DiscoverHiddenTalentInput {
  companyId: string;
  jobTitle: string;
  jobSkills: string[];
  limit?: number;
}

export interface UpdateHiddenTalentStatusInput {
  status: HiddenTalentStatus;
  reviewNotes?: string;
  outcomeNotes?: string;
}

export interface CalculateMatchScoreInput {
  companyId: string;
  candidateData: Record<string, any>;
  jobData: Record<string, any>;
  config?: Partial<MatchingConfig>;
}

export interface UpsertMatchingConfigInput {
  jobId?: string;
  skillWeight?: number;
  experienceWeight?: number;
  projectWeight?: number;
  educationWeight?: number;
  cultureFitWeight?: number;
  minimumMatchScore?: number;
  hiddenTalentThreshold?: number;
  autoAdvanceThreshold?: number;
  autoRejectThreshold?: number;
  enableSemanticMatching?: boolean;
  enableHiddenTalent?: boolean;
  enableIndustryCrossover?: boolean;
  enableSkillTransfer?: boolean;
  mustHaveSkills?: string[];
  niceToHaveSkills?: string[];
  dealBreakerMissing?: string[];
}

// ============================================================================
// BATCH 22: PREDICTIVE ANALYTICS TYPES (5.2.1 - 5.2.8)
// ============================================================================

// Enums and Type Aliases
export type PredictionGrade = 'A' | 'B' | 'C' | 'D' | 'F';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type HealthTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';
export type VelocityTrend = 'FASTER' | 'STABLE' | 'SLOWER';
export type TrendDirection = 'DECLINING' | 'STABLE' | 'GROWING' | 'SURGING';
export type Volatility = 'LOW' | 'MODERATE' | 'HIGH';
export type RoleComplexity = 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'HIGHLY_COMPLEX';
export type MarketCompetition = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
export type CompensationCompetitiveness = 'BELOW_MARKET' | 'AT_MARKET' | 'ABOVE_MARKET';
export type LocationDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD';
export type TalentSupply = 'ABUNDANT' | 'ADEQUATE' | 'LIMITED' | 'SCARCE';
export type HiringDemand = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
export type SalaryTrend = 'DECREASING' | 'STABLE' | 'INCREASING' | 'RAPIDLY_INCREASING';
export type DifficultyLevel = 'VERY_EASY' | 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD';
export type CompetitorActivity = 'LOW' | 'MODERATE' | 'HIGH' | 'INTENSE';
export type EngagementLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
export type ResponseTimeTrend = 'FASTER' | 'STABLE' | 'SLOWER';
export type MarketRateComparison = 'BELOW' | 'AT' | 'ABOVE';
export type OfferDecision = 'ACCEPTED' | 'REJECTED' | 'NEGOTIATED' | 'WITHDRAWN';
export type HiringOutcome = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE' | 'UNKNOWN';
export type PredictedPerformance = 'EXCEPTIONAL' | 'STRONG' | 'MEETS_EXPECTATIONS' | 'DEVELOPING' | 'CONCERN';
export type GrowthPotentialLevel = 'LIMITED' | 'MODERATE' | 'HIGH' | 'EXCEPTIONAL';
export type PredictionModelType = 'HIRING_SUCCESS' | 'TIME_TO_HIRE' | 'OFFER_ACCEPTANCE' | 'RETENTION_RISK' | 'PERFORMANCE' | 'MARKET_AVAILABILITY' | 'SALARY_TRENDS' | 'PIPELINE_HEALTH';

// 5.2.1 Hiring Success Prediction
export interface HiringSuccessPrediction {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  successProbability: number;
  confidenceLevel: number;
  predictionGrade: PredictionGrade;
  skillMatchScore: number;
  experienceMatchScore: number;
  cultureFitScore: number;
  motivationScore: number;
  stabilityScore: number;
  overallRiskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  mitigationSuggestions: string[];
  similarHiresCount: number;
  similarHiresSuccessRate?: number;
  benchmarkComparison?: Record<string, any>;
  positiveSignals: Signal[];
  negativeSignals: Signal[];
  neutralFactors?: Record<string, any>;
  modelVersion: string;
  featureImportance?: Record<string, number>;
  predictionBasis?: string;
  actualOutcome?: HiringOutcome;
  outcomeRecordedAt?: string;
  outcomeNotes?: string;
  predictedAt: string;
  expiresAt?: string;
  updatedAt: string;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  description?: string;
}

export interface Signal {
  signal: string;
  weight: number;
  description?: string;
}

// 5.2.2 Time-to-Hire Forecast
export interface TimeToHireForecast {
  id: string;
  companyId: string;
  jobId: string;
  predictedDays: number;
  confidenceInterval: ConfidenceInterval;
  confidenceLevel: number;
  sourcingDays?: number;
  screeningDays?: number;
  interviewingDays?: number;
  offerDays?: number;
  closingDays?: number;
  roleComplexity: RoleComplexity;
  marketCompetition: MarketCompetition;
  compensationCompetitiveness: CompensationCompetitiveness;
  locationDifficulty: LocationDifficulty;
  historicalAverage?: number;
  industryBenchmark?: number;
  companyBenchmark?: number;
  predictedBottlenecks: Bottleneck[];
  bottleneckRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  speedUpSuggestions: string[];
  resourceRecommendations?: Record<string, any>;
  actualDays?: number;
  hiredAt?: string;
  variance?: number;
  forecastedAt: string;
  updatedAt: string;
}

export interface ConfidenceInterval {
  low: number;
  high: number;
}

export interface Bottleneck {
  stage: string;
  risk: 'low' | 'medium' | 'high';
  reason: string;
}

// 5.2.3 Offer Acceptance Prediction
export interface OfferAcceptancePrediction {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  offerId?: string;
  acceptanceProbability: number;
  confidenceLevel: number;
  predictionGrade: PredictionGrade;
  compensationFit: number;
  roleFit: number;
  locationFit: number;
  cultureFit: number;
  growthOpportunityFit: number;
  workLifeBalanceFit: number;
  competingOfferRisk: number;
  counterofferRisk: number;
  timingRisk: number;
  engagementLevel: EngagementLevel;
  responseTimeTrend: ResponseTimeTrend;
  questionTopics: string[];
  marketRateComparison: MarketRateComparison;
  competitorAnalysis?: Record<string, any>;
  improvementSuggestions: ImprovementSuggestion[];
  negotiationGuidance?: string;
  optimalOfferRange?: OfferRange;
  actualDecision?: OfferDecision;
  decisionDate?: string;
  rejectionReason?: string;
  predictedAt: string;
  updatedAt: string;
}

export interface ImprovementSuggestion {
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  effort?: 'low' | 'medium' | 'high';
}

export interface OfferRange {
  min: number;
  target: number;
  max: number;
}

// 5.2.4 Retention Risk Score
export interface RetentionRiskScore {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  retentionProbability6Mo: number;
  retentionProbability1Yr: number;
  retentionProbability2Yr: number;
  predictedTenure: number;
  overallRiskLevel: RiskLevel;
  riskScore: number;
  jobHoppingIndicator: number;
  tenureConsistency: number;
  careerProgressionFit: number;
  compensationSatisfaction: number;
  growthOpportunityMatch: number;
  redFlags: Flag[];
  yellowFlags: Flag[];
  positiveIndicators: Indicator[];
  industryBenchmark?: number;
  companyBenchmark?: number;
  roleBenchmark?: number;
  retentionStrategies: RetentionStrategy[];
  onboardingFocus: string[];
  earlyWarningTriggers?: Record<string, any>;
  scoredAt: string;
  modelVersion: string;
  updatedAt: string;
}

export interface Flag {
  flag: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Indicator {
  indicator: string;
  weight: number;
}

export interface RetentionStrategy {
  strategy: string;
  priority: 'low' | 'medium' | 'high';
  timeline?: string;
}

// 5.2.5 Performance Prediction
export interface PerformancePrediction {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  predictedPerformance: PredictedPerformance;
  performanceScore: number;
  confidenceLevel: number;
  technicalPerformance: number;
  collaborationScore: number;
  leadershipPotential: number;
  adaptabilityScore: number;
  innovationScore: number;
  executionScore: number;
  expectedRampUpMonths: number;
  rampUpConfidence: number;
  earlyWins: string[];
  promotionReadiness?: number;
  growthPotentialLevel: GrowthPotentialLevel;
  careerCeiling?: string;
  performanceRisks: PerformanceRisk[];
  developmentNeeds: DevelopmentNeed[];
  supportRequirements: SupportRequirement[];
  topPerformerSimilarity?: number;
  peerGroupPercentile?: number;
  predictionFactors: Record<string, any>;
  historicalDataPoints?: Record<string, any>;
  predictedAt: string;
  modelVersion: string;
  updatedAt: string;
}

export interface PerformanceRisk {
  risk: string;
  likelihood: 'low' | 'medium' | 'high';
  impact?: 'low' | 'medium' | 'high';
}

export interface DevelopmentNeed {
  area: string;
  priority: 'low' | 'medium' | 'high';
  suggestedActions?: string[];
}

export interface SupportRequirement {
  requirement: string;
  duration: string;
  type?: string;
}

// 5.2.6 Market Availability Analysis
export interface MarketAvailabilityAnalysis {
  id: string;
  companyId: string;
  jobId?: string;
  roleTitle: string;
  requiredSkills: string[];
  location: string;
  experienceLevel: string;
  industry?: string;
  availabilityScore: number;
  difficultyLevel: DifficultyLevel;
  estimatedCandidatePool: number;
  talentSupply: TalentSupply;
  hiringDemand: HiringDemand;
  supplyDemandRatio: number;
  competitorActivity: CompetitorActivity;
  competingOpenings?: number;
  marketShare?: number;
  marketSalaryMin?: number;
  marketSalaryMax?: number;
  marketSalaryMedian?: number;
  salaryTrend: SalaryTrend;
  locationPremium?: number;
  remoteAvailability?: number;
  relocationWillingness?: number;
  scarcestSkills: SkillScarcity[];
  commonSkills: SkillAvailability[];
  skillPremiums?: Record<string, number>;
  sourcingRecommendations: SourcingRecommendation[];
  compensationGuidance: CompensationGuidance;
  timelineExpectation: number;
  analyzedAt: string;
  dataFreshness: string;
  updatedAt: string;
}

export interface SkillScarcity {
  skill: string;
  scarcity: 'low' | 'medium' | 'high';
}

export interface SkillAvailability {
  skill: string;
  availability: 'low' | 'medium' | 'high';
}

export interface SourcingRecommendation {
  channel: string;
  effectiveness: 'low' | 'medium' | 'high';
  cost?: 'low' | 'medium' | 'high';
}

export interface CompensationGuidance {
  recommendation: string;
  suggestedRange: OfferRange;
}

// 5.2.7 Salary Trend Prediction
export interface SalaryTrendPrediction {
  id: string;
  companyId: string;
  roleTitle: string;
  location: string;
  experienceLevel: string;
  industry?: string;
  currentMedian: number;
  currentMin: number;
  currentMax: number;
  currentPercentile25?: number;
  currentPercentile75?: number;
  prediction3Mo: SalaryPrediction;
  prediction6Mo: SalaryPrediction;
  prediction1Yr: SalaryPrediction;
  prediction2Yr?: SalaryPrediction;
  trendDirection: TrendDirection;
  annualGrowthRate: number;
  volatility: Volatility;
  demandImpact: number;
  supplyImpact: number;
  economicImpact: number;
  technologyImpact: number;
  regulatoryImpact?: number;
  industryComparison: Record<string, string>;
  locationComparison: Record<string, string>;
  experienceProgression: Record<string, number>;
  competitiveRange: OfferRange;
  budgetGuidance?: string;
  timingRecommendation?: string;
  predictedAt: string;
  modelVersion: string;
  dataSource?: string;
  updatedAt: string;
}

export interface SalaryPrediction {
  median: number;
  min: number;
  max: number;
  changePercent: number;
}

// 5.2.8 Pipeline Health Prediction
export interface PipelineHealthPrediction {
  id: string;
  companyId: string;
  jobId?: string;
  currentCandidates: number;
  byStage: Record<string, number>;
  stageConversions: Record<string, number>;
  overallHealthScore: number;
  healthGrade: PredictionGrade;
  healthTrend: HealthTrend;
  predictedHires: number;
  predictedDropouts: number;
  fillProbability: number;
  timeToFill?: number;
  bottleneckStages: StageBottleneck[];
  stageRisks: Record<string, string>;
  conversionConcerns: ConversionConcern[];
  candidateGap: number;
  qualityGap: number;
  diversityGap?: Record<string, any>;
  averageTimeInStage: Record<string, number>;
  velocityTrend: VelocityTrend;
  stalledCandidates: number;
  urgentActions: UrgentAction[];
  sourcingNeeds: SourcingNeed[];
  processImprovements: ProcessImprovement[];
  weeklyForecast: WeeklyForecast[];
  hireByDateProbability: Record<string, number>;
  analyzedAt: string;
  nextUpdateAt?: string;
  updatedAt: string;
}

export interface StageBottleneck {
  stage: string;
  severity: 'low' | 'medium' | 'high';
  cause: string;
}

export interface ConversionConcern {
  fromStage: string;
  toStage: string;
  issue: string;
}

export interface UrgentAction {
  action: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
}

export interface SourcingNeed {
  need: string;
  channel: string;
  quantity?: number;
}

export interface ProcessImprovement {
  improvement: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface WeeklyForecast {
  week: number;
  expectedHires: number;
  expectedDropouts: number;
}

// Prediction Model Configuration
export interface PredictionModelConfig {
  id: string;
  companyId: string;
  modelType: PredictionModelType;
  modelVersion: string;
  isEnabled: boolean;
  confidenceThreshold: number;
  featureWeights: Record<string, number>;
  enabledFeatures: string[];
  disabledFeatures: string[];
  calibrationDate?: string;
  calibrationData?: Record<string, any>;
  accuracyMetrics?: Record<string, any>;
  actionThresholds: ActionThresholds;
  alertThresholds: AlertThresholds;
  customRules?: Record<string, any>;
  exclusions?: Record<string, any>;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionThresholds {
  autoAdvance: number;
  autoReject: number;
  requireReview: number;
}

export interface AlertThresholds {
  highRisk: number;
  lowConfidence: number;
}

// Prediction Audit Log
export interface PredictionAuditLog {
  id: string;
  companyId: string;
  predictionType: PredictionModelType;
  predictionId: string;
  targetCandidateId?: string;
  targetJobId?: string;
  predictedValue: Record<string, any>;
  confidenceLevel: number;
  actualOutcome?: Record<string, any>;
  outcomeRecordedAt?: string;
  wasAccurate?: boolean;
  accuracyScore?: number;
  modelVersion: string;
  inputFeatures?: Record<string, any>;
  featureImportance?: Record<string, number>;
  createdAt: string;
}

// Stats Interface
export interface PredictiveAnalyticsStats {
  totalPredictions: {
    hiringSuccess: number;
    timeToHire: number;
    offerAcceptance: number;
    retentionRisk: number;
    performance: number;
    marketAvailability: number;
    salaryTrends: number;
    pipelineHealth: number;
  };
  averages: {
    hiringSuccessProbability: number;
    offerAcceptanceProbability: number;
    pipelineHealthScore: number;
  };
}

export interface PredictionAccuracyStats {
  totalPredictions: number;
  accuratePredictions: number;
  accuracyRate: number;
  averageAccuracy: number;
  byType: Record<string, {
    total: number;
    accurate: number;
    avgScore: number;
  }>;
}

// Input Types for API calls
export interface PredictHiringSuccessInput {
  candidateId: string;
  jobId: string;
  skillMatchScore?: number;
  experienceMatchScore?: number;
  cultureFitScore?: number;
  motivationScore?: number;
  stabilityScore?: number;
}

export interface ForecastTimeToHireInput {
  jobId: string;
  roleComplexity?: RoleComplexity;
  marketCompetition?: MarketCompetition;
  compensationCompetitiveness?: CompensationCompetitiveness;
  locationDifficulty?: LocationDifficulty;
}

export interface PredictOfferAcceptanceInput {
  candidateId: string;
  jobId: string;
  offerId?: string;
  compensationFit?: number;
  roleFit?: number;
  locationFit?: number;
  cultureFit?: number;
}

export interface CalculateRetentionRiskInput {
  candidateId: string;
  jobId: string;
  jobHoppingIndicator?: number;
  tenureConsistency?: number;
  careerProgressionFit?: number;
}

export interface PredictPerformanceInput {
  candidateId: string;
  jobId: string;
  technicalPerformance?: number;
  collaborationScore?: number;
  leadershipPotential?: number;
}

export interface AnalyzeMarketAvailabilityInput {
  roleTitle: string;
  location: string;
  experienceLevel: string;
  requiredSkills?: string[];
  industry?: string;
  jobId?: string;
}

export interface PredictSalaryTrendsInput {
  roleTitle: string;
  location: string;
  experienceLevel: string;
  industry?: string;
  currentMedian?: number;
}

export interface AnalyzePipelineHealthInput {
  jobId?: string;
  currentCandidates?: number;
  byStage?: Record<string, number>;
}

// ============================================================================
// BATCH 23: SMART RECOMMENDATIONS (5.3.1-5.3.8)
// ============================================================================

// Common types for recommendations
export type RecommendationType =
  | 'JOB_RECOMMENDATION'
  | 'CANDIDATE_RECOMMENDATION'
  | 'SIMILAR_CANDIDATE'
  | 'PASSIVE_CANDIDATE'
  | 'SKILL_UP'
  | 'RE_ENGAGEMENT'
  | 'INTERVIEW_PANEL'
  | 'SOURCING_CHANNEL';

export type RecommendationStatus = 'ACTIVE' | 'VIEWED' | 'APPLIED' | 'DISMISSED' | 'EXPIRED';

export type InteractionType = 'VIEW' | 'CLICK' | 'SAVE' | 'APPLY' | 'DISMISS' | 'SHARE';

export type ActionType = 'CONTACT' | 'SCHEDULE_INTERVIEW' | 'ADD_TO_PIPELINE' | 'REJECT' | 'ARCHIVE';

export type OutreachStatus = 'NOT_CONTACTED' | 'CONTACTED' | 'RESPONDED' | 'INTERESTED' | 'NOT_INTERESTED' | 'CONVERTED';

export type SkillPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type ReEngagementReason = 'GOOD_PREVIOUS_FIT' | 'NEW_SKILLS' | 'ROLE_CHANGE' | 'MARKET_CONDITIONS' | 'REFERRAL';

export type ReEngagementStatus = 'PENDING' | 'CONTACTED' | 'RESPONDED' | 'RE_ENGAGED' | 'DECLINED' | 'NO_RESPONSE';

export type InterviewerRole = 'LEAD' | 'TECHNICAL' | 'CULTURAL' | 'HR' | 'PEER';

export type SourcingChannel = 'LINKEDIN' | 'INDEED' | 'GLASSDOOR' | 'REFERRAL' | 'CAREER_SITE' | 'JOB_BOARD' | 'UNIVERSITY' | 'AGENCY' | 'SOCIAL_MEDIA' | 'OTHER';

// 5.3.1 Job Recommendation Types
export interface JobRecommendation {
  id: string;
  candidateId: string;
  jobId: string;
  matchScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  locationMatchScore: number;
  salaryMatchScore: number;
  cultureMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  considerations: string[];
  reasoning: string;
  rank: number;
  status: RecommendationStatus;
  lastInteraction?: string;
  viewedAt?: string;
  appliedAt?: string;
  dismissedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  candidate?: User;
}

export interface GenerateJobRecommendationsInput {
  candidateId: string;
  limit?: number;
  minMatchScore?: number;
  preferredLocations?: string[];
  preferredJobTypes?: JobType[];
  salaryExpectation?: {
    min?: number;
    max?: number;
  };
  excludeApplied?: boolean;
  excludeDismissed?: boolean;
}

export interface JobRecommendationInteractionInput {
  interactionType: InteractionType;
  duration?: number;
  feedback?: string;
}

// 5.3.2 Candidate Recommendation Types
export interface CandidateRecommendation {
  id: string;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  matchScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  availabilityScore: number;
  cultureFitScore: number;
  matchedRequirements: string[];
  partialMatches: string[];
  missingRequirements: string[];
  highlights: string[];
  concerns: string[];
  reasoning: string;
  rank: number;
  status: RecommendationStatus;
  actionTaken?: ActionType;
  actionTakenAt?: string;
  notes?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  candidate?: User;
}

export interface GenerateCandidateRecommendationsInput {
  jobId: string;
  limit?: number;
  minMatchScore?: number;
  requiredSkills?: string[];
  preferredExperience?: {
    min?: number;
    max?: number;
  };
  preferredLocations?: string[];
  includePassive?: boolean;
  excludeContacted?: boolean;
}

export interface CandidateRecommendationActionInput {
  actionType: ActionType;
  notes?: string;
  scheduledDate?: string;
}

// 5.3.3 Similar Candidate Types
export interface SimilarCandidateMatch {
  id: string;
  sourceCandidateId: string;
  matchedCandidateId: string;
  recruiterId: string;
  similarityScore: number;
  skillSimilarity: number;
  experienceSimilarity: number;
  educationSimilarity: number;
  industrySimilarity: number;
  roleSimilarity: number;
  sharedSkills: string[];
  uniqueToSource: string[];
  uniqueToMatched: string[];
  similarExperiences: string[];
  differentiators: string[];
  reasoning: string;
  rank: number;
  status: RecommendationStatus;
  actionTaken?: ActionType;
  actionTakenAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  sourceCandidate?: User;
  matchedCandidate?: User;
}

export interface FindSimilarCandidatesInput {
  sourceCandidateId: string;
  limit?: number;
  minSimilarity?: number;
  focusAreas?: ('skills' | 'experience' | 'education' | 'industry' | 'role')[];
  excludeContacted?: boolean;
  jobId?: string;
}

export interface SimilarCandidateActionInput {
  actionType: ActionType;
  notes?: string;
  jobId?: string;
}

// 5.3.4 Passive Candidate Types
export interface PassiveCandidateProfile {
  id: string;
  candidateId: string;
  recruiterId: string;
  passiveScore: number;
  engagementLevel: number;
  responselikelihood: number;
  conversionPotential: number;
  lastActivityDate?: string;
  estimatedAvailability?: string;
  openToOpportunities: boolean;
  preferredContactMethod?: string;
  bestContactTime?: string;
  interests: string[];
  motivators: string[];
  dealBreakers: string[];
  targetRoles: string[];
  targetCompanies: string[];
  salaryExpectation?: number;
  relocationWillingness?: string;
  outreachStatus: OutreachStatus;
  outreachHistory: OutreachHistoryEntry[];
  lastContactedAt?: string;
  lastResponseAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  candidate?: User;
}

export interface OutreachHistoryEntry {
  date: string;
  method: string;
  message?: string;
  response?: string;
  outcome?: string;
  recruiterNotes?: string;
}

export interface IdentifyPassiveCandidatesInput {
  criteria?: {
    skills?: string[];
    experience?: { min?: number; max?: number };
    location?: string[];
    industry?: string[];
    roles?: string[];
  };
  limit?: number;
  minPassiveScore?: number;
  excludeContacted?: boolean;
  targetJobId?: string;
}

export interface PassiveCandidateOutreachInput {
  outreachStatus: OutreachStatus;
  contactMethod?: string;
  message?: string;
  response?: string;
  outcome?: string;
  notes?: string;
}

// 5.3.5 Skill-Up Recommendation Types
export interface SkillUpRecommendation {
  id: string;
  candidateId: string;
  targetSkill: string;
  currentLevel: number;
  targetLevel: number;
  priority: SkillPriority;
  relevanceScore: number;
  marketDemand: number;
  careerImpact: number;
  learningPath: LearningResource[];
  estimatedTimeHours: number;
  estimatedCost?: number;
  reasoning: string;
  relatedJobs: string[];
  salaryImpact?: number;
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';
  startedAt?: string;
  completedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  candidate?: User;
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  type: 'COURSE' | 'CERTIFICATION' | 'TUTORIAL' | 'BOOK' | 'PROJECT' | 'WORKSHOP' | 'MENTORSHIP';
  url?: string;
  duration?: string;
  cost?: number;
  rating?: number;
  description?: string;
  prerequisites?: string[];
  order: number;
  completed: boolean;
  completedAt?: string;
}

export interface GenerateSkillUpRecommendationsInput {
  candidateId: string;
  targetRoles?: string[];
  targetIndustries?: string[];
  careerGoals?: string[];
  timeCommitment?: 'LOW' | 'MEDIUM' | 'HIGH';
  budget?: number;
  limit?: number;
}

export interface UpdateSkillProgressInput {
  progress: number;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';
  completedResources?: string[];
  notes?: string;
}

// 5.3.6 Re-Engagement Suggestion Types
export interface ReEngagementSuggestion {
  id: string;
  candidateId: string;
  jobId: string;
  recruiterId: string;
  previousApplicationId?: string;
  reEngagementScore: number;
  fitImprovement: number;
  timeSinceLastContact: number;
  reason: ReEngagementReason;
  reasoning: string;
  previousFeedback?: string;
  changesNoted: string[];
  suggestedApproach: string;
  suggestedMessage?: string;
  bestContactTime?: string;
  status: ReEngagementStatus;
  contactedAt?: string;
  respondedAt?: string;
  outcome?: string;
  notes?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  candidate?: User;
  job?: Job;
}

export interface GenerateReEngagementSuggestionsInput {
  jobId: string;
  minReEngagementScore?: number;
  minTimeSinceContact?: number;
  maxTimeSinceContact?: number;
  reasons?: ReEngagementReason[];
  limit?: number;
  excludeRejected?: boolean;
}

export interface UpdateReEngagementStatusInput {
  status: ReEngagementStatus;
  outcome?: string;
  notes?: string;
  nextFollowUpDate?: string;
}

// 5.3.7 Interview Panel Recommendation Types
export interface InterviewPanelRecommendation {
  id: string;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  interviewerId: string;
  role: InterviewerRole;
  matchScore: number;
  expertiseMatch: number;
  availabilityScore: number;
  interviewLoadScore: number;
  diversityContribution: number;
  reasoning: string;
  expertiseAreas: string[];
  previousInterviews: number;
  averageRating?: number;
  availableSlots: string[];
  conflicts?: string[];
  selected: boolean;
  selectedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  candidate?: User;
  interviewer?: User;
}

export interface GenerateInterviewPanelRecommendationsInput {
  jobId: string;
  candidateId: string;
  panelSize?: number;
  requiredRoles?: InterviewerRole[];
  requiredExpertise?: string[];
  preferredDates?: string[];
  excludeInterviewers?: string[];
  diversityPreference?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SelectInterviewerInput {
  notes?: string;
  scheduledDate?: string;
}

// 5.3.8 Sourcing Channel Recommendation Types
export interface SourcingChannelRecommendation {
  id: string;
  jobId?: string;
  roleType: string;
  recruiterId: string;
  channel: SourcingChannel;
  effectiveness: number;
  costEfficiency: number;
  qualityScore: number;
  speedScore: number;
  volumeScore: number;
  historicalSuccess: number;
  reasoning: string;
  recommendations: string[];
  estimatedCost?: number;
  estimatedTimeToHire?: number;
  estimatedCandidates?: number;
  bestPractices: string[];
  warnings?: string[];
  rank: number;
  createdAt: string;
  updatedAt: string;
  job?: Job;
}

export interface GenerateSourcingRecommendationsInput {
  jobId?: string;
  roleType: string;
  budget?: number;
  timeline?: string;
  targetCandidates?: number;
  preferredChannels?: SourcingChannel[];
  excludedChannels?: SourcingChannel[];
  prioritize?: 'COST' | 'SPEED' | 'QUALITY' | 'VOLUME';
}

// Recommendation Feedback Types
export interface RecommendationFeedback {
  id: string;
  recommendationType: RecommendationType;
  recommendationId: string;
  userId: string;
  rating: number;
  relevance: number;
  accuracy: number;
  usefulness: number;
  feedback?: string;
  suggestions?: string;
  wouldRecommend: boolean;
  createdAt: string;
}

export interface SubmitRecommendationFeedbackInput {
  recommendationType: RecommendationType;
  recommendationId: string;
  rating: number;
  relevance?: number;
  accuracy?: number;
  usefulness?: number;
  feedback?: string;
  suggestions?: string;
  wouldRecommend?: boolean;
}

// Recommendation Config Types
export interface RecommendationConfig {
  id: string;
  recommendationType: RecommendationType;
  enabled: boolean;
  minScore: number;
  maxResults: number;
  refreshInterval: number;
  weights: Record<string, number>;
  filters: Record<string, unknown>;
  features: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRecommendationConfigInput {
  enabled?: boolean;
  minScore?: number;
  maxResults?: number;
  refreshInterval?: number;
  weights?: Record<string, number>;
  filters?: Record<string, unknown>;
  features?: Record<string, boolean>;
}

// Smart Recommendations Stats
export interface SmartRecommendationsStats {
  totalRecommendations: number;
  activeRecommendations: number;
  byType: Record<RecommendationType, number>;
  averageMatchScore: number;
  conversionRate: number;
  feedbackScore: number;
  topPerformingTypes: Array<{
    type: RecommendationType;
    count: number;
    conversionRate: number;
    avgScore: number;
  }>;
  recentActivity: Array<{
    date: string;
    recommendations: number;
    interactions: number;
    conversions: number;
  }>;
  channelEffectiveness: Array<{
    channel: SourcingChannel;
    effectiveness: number;
    hires: number;
    cost: number;
  }>;
}

// ============================================================================
// BATCH 24: HIRING TEAM MANAGEMENT (6.1.1-6.1.7)
// ============================================================================

// Common types
export type TeamStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
export type TeamType = 'STANDARD' | 'EXECUTIVE' | 'HIGH_VOLUME';
export type TeamRole = 'LEAD_RECRUITER' | 'RECRUITER' | 'HIRING_MANAGER' | 'INTERVIEWER' | 'COORDINATOR' | 'VIEWER';
export type PermissionLevel = 'VIEWER' | 'COMMENTER' | 'EDITOR' | 'ADMIN';
export type RoundType = 'PHONE_SCREEN' | 'TECHNICAL' | 'BEHAVIORAL' | 'CULTURE' | 'FINAL' | 'OFFER';
export type InterviewFormat = 'IN_PERSON' | 'VIDEO' | 'PHONE';
export type SchedulingMode = 'MANUAL' | 'SELF_SCHEDULE' | 'AUTO';
export type CoverageReason = 'VACATION' | 'SICK' | 'LEAVE' | 'TRAINING' | 'OTHER';
export type CoverageType = 'FULL' | 'PARTIAL' | 'SPECIFIC_TASKS';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CoverageStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
export type ActivityType = 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'ROLE_CHANGED' | 'PERMISSIONS_CHANGED' | 'INTERVIEW_SCHEDULED' | 'CANDIDATE_MOVED' | 'DECISION_MADE';

// 6.1.1 Hiring Team Types
export interface HiringTeam {
  id: string;
  companyId: string;
  jobId: string;
  name: string;
  description?: string;
  teamType: TeamType;
  leadRecruiterId: string;
  hiringManagerId?: string;
  status: TeamStatus;
  activatedAt: string;
  completedAt?: string;
  settings?: Record<string, unknown>;
  notificationPrefs?: Record<string, boolean>;
  totalCandidates: number;
  totalInterviews: number;
  totalHires: number;
  avgTimeToHire?: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  members?: HiringTeamMember[];
}

export interface CreateHiringTeamInput {
  companyId: string;
  jobId: string;
  name: string;
  description?: string;
  teamType?: TeamType;
  leadRecruiterId: string;
  hiringManagerId?: string;
  settings?: Record<string, unknown>;
  notificationPrefs?: Record<string, boolean>;
}

export interface UpdateHiringTeamInput {
  name?: string;
  description?: string;
  teamType?: TeamType;
  hiringManagerId?: string;
  settings?: Record<string, unknown>;
  notificationPrefs?: Record<string, boolean>;
}

// 6.1.2 Team Member & Permission Types
export interface HiringTeamMember {
  id: string;
  teamId: string;
  userId: string;
  companyId: string;
  role: TeamRole;
  title?: string;
  permissionLevel: PermissionLevel;
  canViewCandidates: boolean;
  canEditCandidates: boolean;
  canScheduleInterviews: boolean;
  canSubmitFeedback: boolean;
  canMakeDecisions: boolean;
  canManageTeam: boolean;
  canAccessReports: boolean;
  customPermissions?: Record<string, boolean>;
  isActive: boolean;
  availableFrom?: string;
  availableUntil?: string;
  maxInterviewsPerWeek?: number;
  currentInterviewLoad: number;
  expertiseAreas?: string[];
  interviewTypes?: string[];
  notifyOnNewCandidates: boolean;
  notifyOnInterviews: boolean;
  notifyOnDecisions: boolean;
  addedById: string;
  joinedAt: string;
  lastActiveAt?: string;
  updatedAt: string;
}

export interface AddTeamMemberInput {
  userId: string;
  companyId: string;
  role: TeamRole;
  title?: string;
  permissionLevel?: PermissionLevel;
  canViewCandidates?: boolean;
  canEditCandidates?: boolean;
  canScheduleInterviews?: boolean;
  canSubmitFeedback?: boolean;
  canMakeDecisions?: boolean;
  canManageTeam?: boolean;
  canAccessReports?: boolean;
  customPermissions?: Record<string, boolean>;
  expertiseAreas?: string[];
  interviewTypes?: string[];
  maxInterviewsPerWeek?: number;
}

export interface UpdateMemberPermissionsInput {
  role?: TeamRole;
  title?: string;
  permissionLevel?: PermissionLevel;
  canViewCandidates?: boolean;
  canEditCandidates?: boolean;
  canScheduleInterviews?: boolean;
  canSubmitFeedback?: boolean;
  canMakeDecisions?: boolean;
  canManageTeam?: boolean;
  canAccessReports?: boolean;
  customPermissions?: Record<string, boolean>;
  isActive?: boolean;
  maxInterviewsPerWeek?: number;
}

// 6.1.3 Interview Panel Types
export interface PanelMember {
  userId: string;
  role: TeamRole;
  isRequired: boolean;
}

export interface InterviewPanel {
  id: string;
  companyId: string;
  teamId: string;
  jobId: string;
  name: string;
  roundNumber: number;
  roundType: RoundType;
  panelMembers: PanelMember[];
  minPanelSize: number;
  maxPanelSize: number;
  duration: number;
  format: InterviewFormat;
  location?: string;
  videoLink?: string;
  scorecardTemplateId?: string;
  passingScore?: number;
  requireUnanimous: boolean;
  schedulingMode: SchedulingMode;
  bufferTime: number;
  allowWeekends: boolean;
  timeSlotPreferences?: string[];
  isActive: boolean;
  order: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewPanelInput {
  companyId: string;
  teamId: string;
  jobId: string;
  name: string;
  roundNumber: number;
  roundType: RoundType;
  panelMembers: PanelMember[];
  minPanelSize?: number;
  maxPanelSize?: number;
  duration?: number;
  format?: InterviewFormat;
  location?: string;
  videoLink?: string;
  scorecardTemplateId?: string;
  passingScore?: number;
  requireUnanimous?: boolean;
  schedulingMode?: SchedulingMode;
  bufferTime?: number;
  allowWeekends?: boolean;
  timeSlotPreferences?: string[];
  order: number;
}

export interface UpdateInterviewPanelInput {
  name?: string;
  panelMembers?: PanelMember[];
  minPanelSize?: number;
  maxPanelSize?: number;
  duration?: number;
  format?: InterviewFormat;
  location?: string;
  videoLink?: string;
  scorecardTemplateId?: string;
  passingScore?: number;
  requireUnanimous?: boolean;
  schedulingMode?: SchedulingMode;
  bufferTime?: number;
  allowWeekends?: boolean;
  timeSlotPreferences?: string[];
  isActive?: boolean;
  order?: number;
}

// 6.1.4 Workload Types
export interface TeamWorkload {
  id: string;
  companyId: string;
  teamId: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  maxCapacity: number;
  currentLoad: number;
  availableCapacity: number;
  scheduledInterviews: number;
  completedInterviews: number;
  cancelledInterviews: number;
  pendingFeedback: number;
  pendingReviews: number;
  pendingDecisions: number;
  totalInterviewHours: number;
  totalPrepHours: number;
  avgFeedbackTime?: number;
  feedbackQualityScore?: number;
  availableSlots?: string[];
  blockedDates?: string[];
  timeZone: string;
  isOverloaded: boolean;
  overloadAlertSent: boolean;
  calculatedAt: string;
  updatedAt: string;
}

export interface WorkloadSummary {
  totalMembers: number;
  totalCapacity: number;
  currentLoad: number;
  availableCapacity: number;
  overloadedMembers: number;
  byRole: Record<string, { count: number; load: number; capacity: number }>;
}

// 6.1.5 Coverage Schedule Types
export interface CoverageSchedule {
  id: string;
  companyId: string;
  teamId: string;
  primaryUserId: string;
  coveringUserId: string;
  startDate: string;
  endDate: string;
  reason: CoverageReason;
  notes?: string;
  coverageType: CoverageType;
  coveredResponsibilities?: string[];
  excludedResponsibilities?: string[];
  handoffNotes?: string;
  handoffDocuments?: string[];
  handoffCompletedAt?: string;
  approvalStatus: ApprovalStatus;
  approvedById?: string;
  approvedAt?: string;
  notifyStakeholders: boolean;
  stakeholdersNotified: boolean;
  status: CoverageStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoverageScheduleInput {
  companyId: string;
  teamId: string;
  primaryUserId: string;
  coveringUserId: string;
  startDate: string;
  endDate: string;
  reason: CoverageReason;
  notes?: string;
  coverageType?: CoverageType;
  coveredResponsibilities?: string[];
  excludedResponsibilities?: string[];
  handoffNotes?: string;
  handoffDocuments?: string[];
  notifyStakeholders?: boolean;
}

export interface UpdateCoverageScheduleInput {
  coveringUserId?: string;
  startDate?: string;
  endDate?: string;
  reason?: CoverageReason;
  notes?: string;
  coverageType?: CoverageType;
  coveredResponsibilities?: string[];
  excludedResponsibilities?: string[];
  handoffNotes?: string;
  handoffDocuments?: string[];
  status?: CoverageStatus;
}

// 6.1.6 Team Performance Types
export interface TeamPerformance {
  id: string;
  companyId: string;
  teamId: string;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  candidatesSourced: number;
  candidatesScreened: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  offersExtended: number;
  offersAccepted: number;
  hiresMade: number;
  avgTimeToScreen?: number;
  avgTimeToInterview?: number;
  avgTimeToOffer?: number;
  avgTimeToHire?: number;
  avgInterviewsPerHire?: number;
  candidateQualityScore?: number;
  interviewQualityScore?: number;
  offerAcceptanceRate?: number;
  newHireRetention90?: number;
  teamUtilization?: number;
  avgFeedbackTurnaround?: number;
  feedbackCompletionRate?: number;
  teamSatisfactionScore?: number;
  vsCompanyAvg?: Record<string, number>;
  vsPreviousPeriod?: Record<string, number>;
  vsGoals?: Record<string, number>;
  byRecruiter?: Record<string, unknown>;
  bySource?: Record<string, unknown>;
  byStage?: Record<string, unknown>;
  calculatedAt: string;
  updatedAt: string;
}

export interface PerformanceTrend {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
}

export interface PerformanceComparison {
  performance: TeamPerformance[];
  trends: {
    hires: PerformanceTrend;
    interviews: PerformanceTrend;
    timeToHire: PerformanceTrend;
  };
}

// 6.1.7 Hiring Manager Dashboard Types
export interface DashboardWidget {
  type: string;
  position: { x: number; y: number; w: number; h: number };
  config?: Record<string, unknown>;
}

export interface SavedFilter {
  id: string;
  name: string;
  config: Record<string, unknown>;
  createdAt: string;
}

export interface HiringManagerDashboard {
  id: string;
  companyId: string;
  userId: string;
  dashboardName: string;
  layout?: Record<string, unknown>;
  visibleJobIds?: string[];
  pinnedJobIds?: string[];
  widgets: DashboardWidget[];
  defaultTimeRange: string;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultFilters?: Record<string, unknown>;
  savedFilters?: SavedFilter[];
  emailDigest: boolean;
  digestFrequency: string;
  alertThresholds?: Record<string, number>;
  quickActions?: Record<string, unknown>[];
  showCompletedJobs: boolean;
  showTeamMetrics: boolean;
  compactMode: boolean;
  colorScheme: string;
  lastViewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDashboardConfigInput {
  dashboardName?: string;
  defaultTimeRange?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  defaultFilters?: Record<string, unknown>;
  emailDigest?: boolean;
  digestFrequency?: string;
  alertThresholds?: Record<string, number>;
  showCompletedJobs?: boolean;
  showTeamMetrics?: boolean;
  compactMode?: boolean;
  colorScheme?: string;
}

export interface DashboardData {
  summary: {
    activeTeams: number;
    totalCandidates: number;
    totalInterviews: number;
    totalHires: number;
  };
  teams: Array<{
    id: string;
    name: string;
    candidates: number;
    interviews: number;
    hires: number;
    status: TeamStatus;
  }>;
  recentActivity: Array<{
    id: string;
    type: ActivityType;
    description: string;
    performedAt: string;
  }>;
  upcomingInterviews: Array<{
    id: string;
    candidateName: string;
    jobTitle: string;
    scheduledAt: string;
  }>;
  pendingActions: {
    feedbackPending: number;
    decisionsNeeded: number;
    interviewsToSchedule: number;
  };
}

// Team Activity Log Types
export interface TeamActivityLog {
  id: string;
  companyId: string;
  teamId: string;
  userId: string;
  activityType: ActivityType;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, unknown>;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// Hiring Team Stats
export interface HiringTeamStats {
  teamsByStatus: Record<TeamStatus, number>;
  membersByRole: Record<TeamRole, number>;
  activePanels: number;
  activeCoverages: number;
}

// ============================================================================
// BATCH 25: COLLABORATIVE EVALUATION (6.2.1-6.2.9)
// ============================================================================

// 6.2.1 Scorecard Templates
export type RatingScaleType = 'NUMERIC' | 'STAR' | 'LIKERT' | 'PERCENTAGE' | 'CUSTOM';
export type InterviewStageType = 'PHONE_SCREEN' | 'TECHNICAL' | 'BEHAVIORAL' | 'CULTURE_FIT' | 'FINAL' | 'CUSTOM';

export interface RatingScale {
  type: RatingScaleType;
  min: number;
  max: number;
  labels?: Record<number, string>;
  allowHalf?: boolean;
}

export interface ScorecardCriteria {
  id: string;
  name: string;
  description?: string;
  category: string;
  weight: number;
  ratingScale: RatingScale;
  guidelines?: string[];
  examples?: {
    low: string;
    medium: string;
    high: string;
  };
  isRequired: boolean;
}

export interface ScorecardTemplate {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  jobId?: string;
  interviewStage: InterviewStageType;
  criteria: ScorecardCriteria[];
  ratingScale: RatingScale;
  requiredFields: string[];
  optionalFields: string[];
  autoScoring: boolean;
  passingThreshold?: number;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// 6.2.2 Interview Feedback Forms
export type FeedbackStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'FINALIZED';
export type HiringRecommendation = 'STRONG_HIRE' | 'HIRE' | 'LEAN_HIRE' | 'LEAN_NO_HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE';

export interface CriteriaRating {
  criteriaId: string;
  criteriaName: string;
  rating: number;
  notes?: string;
  evidence?: string[];
}

export interface InterviewFeedback {
  id: string;
  companyId: string;
  applicationId: string;
  interviewId?: string;
  scorecardTemplateId?: string;
  evaluatorId: string;
  evaluatorName?: string;
  ratings: CriteriaRating[];
  overallScore?: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: HiringRecommendation;
  notes?: string;
  attachments?: string[];
  timeSpent?: number;
  status: FeedbackStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedbackDraft {
  applicationId: string;
  interviewId?: string;
  scorecardTemplateId?: string;
  ratings: CriteriaRating[];
  overallScore?: number;
  strengths: string[];
  weaknesses: string[];
  recommendation?: HiringRecommendation;
  notes?: string;
}

// 6.2.3 Blind Evaluation Mode
export interface BlindEvaluationConfig {
  id: string;
  companyId: string;
  jobId: string;
  hiddenFields: string[];
  revealStage?: InterviewStageType;
  anonymizeNames: boolean;
  hidePhotos: boolean;
  hideCompanyNames: boolean;
  hideEducationInstitutions: boolean;
  customRules?: BlindRule[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BlindRule {
  field: string;
  action: 'HIDE' | 'ANONYMIZE' | 'REDACT';
  replacement?: string;
  conditions?: Record<string, unknown>;
}

export interface AnonymizedCandidate {
  id: string;
  anonymousId: string;
  applicationId: string;
  skills?: string[];
  experience?: string;
  summary?: string;
  assessmentScores?: Record<string, number>;
  blindMode: boolean;
}

// 6.2.4 Feedback Aggregation
export interface AggregatedScore {
  criteriaId: string;
  criteriaName: string;
  average: number;
  min: number;
  max: number;
  standardDeviation: number;
  ratings: number[];
}

export interface FeedbackAggregation {
  id: string;
  companyId: string;
  applicationId: string;
  interviewStage?: InterviewStageType;
  feedbackIds: string[];
  feedbackCount: number;
  aggregatedScores: AggregatedScore[];
  consensusRating?: number;
  strengthsSummary: string[];
  weaknessesSummary: string[];
  keyInsights?: string[];
  recommendationBreakdown: Record<HiringRecommendation, number>;
  finalRecommendation?: HiringRecommendation;
  aggregatedAt: string;
  aggregatedBy: string;
}

// 6.2.5 Calibration Sessions
export type CalibrationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CalibrationParticipant {
  userId: string;
  name: string;
  role: string;
  attended?: boolean;
  joinedAt?: string;
  leftAt?: string;
}

export interface CalibrationSession {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  jobId?: string;
  scheduledDate: string;
  participants: CalibrationParticipant[];
  applicationIds: string[];
  agenda?: string[];
  calibrationCriteria?: string[];
  targetDuration?: number;
  facilitatorId: string;
  status: CalibrationStatus;
  actualStartTime?: string;
  actualEndTime?: string;
  outcomes?: CalibrationOutcome[];
  adjustedRatings?: Record<string, number>;
  notes?: string;
  actionItems?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CalibrationOutcome {
  applicationId: string;
  originalRating: number;
  adjustedRating: number;
  adjustmentReason: string;
  votedBy: string[];
}

// 6.2.6 Decision Voting
export type VotingDecision = 'HIRE' | 'NO_HIRE' | 'MAYBE' | 'ABSTAIN';
export type VotingRoundStatus = 'OPEN' | 'CLOSED' | 'EXPIRED';
export type VotingType = 'SIMPLE_MAJORITY' | 'UNANIMOUS' | 'WEIGHTED' | 'RANKED';

export interface HiringDecisionVote {
  id: string;
  companyId: string;
  applicationId: string;
  votingRoundId: string;
  voterId: string;
  voterName?: string;
  decision: VotingDecision;
  confidence?: number;
  reasoning?: string;
  conditions?: string[];
  feedbackReference?: string;
  votedAt: string;
}

export interface VotingRoundSummary {
  id: string;
  companyId: string;
  applicationId: string;
  roundNumber: number;
  votingType: VotingType;
  voters: string[];
  totalVoters: number;
  votesReceived: number;
  voteBreakdown?: Record<VotingDecision, number>;
  deadline?: string;
  requiredVotes?: number;
  passingThreshold?: number;
  status: VotingRoundStatus;
  finalDecision?: VotingDecision;
  decisionNotes?: string;
  createdBy: string;
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// 6.2.7 Evaluation Deadlines
export type DeadlineType = 'FEEDBACK_SUBMISSION' | 'VOTE_SUBMISSION' | 'CALIBRATION' | 'DECISION' | 'CUSTOM';
export type DeadlineTrigger = 'INTERVIEW_COMPLETED' | 'APPLICATION_RECEIVED' | 'STAGE_CHANGE' | 'MANUAL';
export type DeadlineInstanceStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'WAIVED' | 'EXTENDED';

export interface ReminderSchedule {
  daysBefore: number[];
  hoursBeforeDeadline?: number;
  notifyOverdue: boolean;
  overdueReminderIntervalHours?: number;
}

export interface EscalationRule {
  hoursOverdue: number;
  escalateTo: string[];
  action: 'NOTIFY' | 'REASSIGN' | 'AUTO_EXTEND' | 'MARK_INCOMPLETE';
}

export interface EvaluationDeadline {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  jobId?: string;
  deadlineType: DeadlineType;
  daysFromTrigger: number;
  triggerEvent: DeadlineTrigger;
  reminderSchedule?: ReminderSchedule;
  escalationRules?: EscalationRule[];
  autoActions?: Record<string, unknown>;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DeadlineInstance {
  id: string;
  deadlineId: string;
  applicationId: string;
  assigneeId: string;
  assigneeName?: string;
  dueDate: string;
  status: DeadlineInstanceStatus;
  remindersSent?: number;
  lastReminderAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// 6.2.8 Disagreement Resolution
export type DisagreementType = 'SCORE_VARIANCE' | 'RECOMMENDATION_CONFLICT' | 'CRITERIA_INTERPRETATION' | 'BIAS_CONCERN' | 'OTHER';
export type DisagreementStatus = 'OPEN' | 'IN_DISCUSSION' | 'ESCALATED' | 'RESOLVED' | 'DISMISSED';
export type ResolutionMethod = 'DISCUSSION' | 'CALIBRATION' | 'MANAGER_DECISION' | 'ADDITIONAL_INTERVIEW' | 'VOTE';

export interface EvaluationDisagreement {
  id: string;
  companyId: string;
  applicationId: string;
  feedbackIds: string[];
  disagreementType: DisagreementType;
  criteriaInvolved?: string[];
  scoreDifference?: number;
  description: string;
  suggestedResolution?: string;
  flaggedBy: string;
  status: DisagreementStatus;
  resolution?: string;
  resolutionMethod?: ResolutionMethod;
  adjustedScores?: Record<string, number>;
  resolvedBy?: string;
  resolvedAt?: string;
  escalatedTo?: string;
  escalationReason?: string;
  escalatedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// 6.2.9 Historical Comparison
export interface CandidateComparison {
  id: string;
  companyId: string;
  jobId: string;
  applicationIds: string[];
  candidateCount: number;
  comparisonCriteria: string[];
  scores: Record<string, CandidateComparisonScore>;
  rankings: CandidateRanking[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface CandidateComparisonScore {
  applicationId: string;
  candidateName?: string;
  criteriaScores: Record<string, number>;
  overallScore: number;
  rank?: number;
}

export interface CandidateRanking {
  applicationId: string;
  rank: number;
  criteriaRanks: Record<string, number>;
  notes?: string;
}

export type BenchmarkType = 'ROLE' | 'DEPARTMENT' | 'COMPANY' | 'INDUSTRY';

export interface HiringBenchmark {
  id: string;
  companyId: string;
  jobId?: string;
  benchmarkType: BenchmarkType;
  periodStart: string;
  periodEnd: string;
  metrics: BenchmarkMetrics;
  thresholds: BenchmarkThresholds;
  historicalData?: HistoricalDataPoint[];
  successIndicators?: SuccessIndicator[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BenchmarkMetrics {
  averageOverallScore: number;
  averageCriteriaScores: Record<string, number>;
  hireRate: number;
  offerAcceptRate: number;
  timeToHire: number;
  qualityOfHire?: number;
  retention90Days?: number;
  retention1Year?: number;
}

export interface BenchmarkThresholds {
  minimumOverallScore: number;
  minimumCriteriaScores: Record<string, number>;
  strongHireThreshold: number;
  hireThreshold: number;
  noHireThreshold: number;
}

export interface HistoricalDataPoint {
  date: string;
  metrics: Partial<BenchmarkMetrics>;
  candidateCount: number;
  hiredCount: number;
}

export interface SuccessIndicator {
  metric: string;
  value: number;
  benchmark: number;
  variance: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface HistoricalComparison {
  candidateScores: AggregatedScore[];
  benchmarkComparison: BenchmarkComparisonResult[];
  percentileRanking: Record<string, number>;
}

export interface BenchmarkComparisonResult {
  benchmarkId: string;
  benchmarkType: BenchmarkType;
  metrics: BenchmarkMetrics;
  thresholds: BenchmarkThresholds;
  candidatePosition: 'ABOVE' | 'WITHIN' | 'BELOW';
  percentile?: number;
}

// Collaborative Evaluation Stats
export interface CollaborativeEvaluationStats {
  scorecardTemplates: number;
  feedbacksSubmitted: number;
  aggregationsCreated: number;
  calibrationSessions: number;
  votingRounds: number;
  disagreements: {
    total: number;
    open: number;
    resolved: number;
  };
  candidateComparisons: number;
  hiringBenchmarks: number;
  avgFeedbackTimeMinutes: number;
}

// ============================================================================
// BATCH 26: REAL-TIME COMMUNICATION (7.1-7.2)
// ============================================================================

// 7.1.1-7.1.2 User Presence
export type PresenceStatus = 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';
export type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET';

export interface UserPresence {
  id: string;
  userId: string;
  status: PresenceStatus;
  customStatus?: string;
  lastSeen: string;
  currentPage?: string;
  currentActivity?: string;
  deviceType?: DeviceType;
  browserInfo?: string;
  platform?: string;
  autoAway: boolean;
  autoAwayMinutes: number;
  showPresence: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PresencePreferences {
  autoAway: boolean;
  autoAwayMinutes: number;
  showPresence: boolean;
}

// 7.1.1 WebSocket Connections
export interface RealtimeConnection {
  id: string;
  userId: string;
  socketId: string;
  connectedAt: string;
  lastPing: string;
  clientVersion?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  subscribedChannels?: string[];
  isActive: boolean;
  disconnectedAt?: string;
  disconnectReason?: string;
}

// 7.1.3 Real-Time Notifications
export type NotificationType = 'MESSAGE' | 'APPLICATION' | 'INTERVIEW' | 'SYSTEM' | 'MENTION' | 'REMINDER';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  url?: string;
}

export interface RealtimeNotification {
  id: string;
  companyId?: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  imageUrl?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  priority: NotificationPriority;
  sound: boolean;
  vibrate: boolean;
  persistent: boolean;
  isDelivered: boolean;
  deliveredAt?: string;
  isRead: boolean;
  readAt?: string;
  isDismissed: boolean;
  dismissedAt?: string;
  actions?: NotificationAction[];
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// 7.2.1-7.2.2 Conversations
export type ConversationType = 'DIRECT' | 'GROUP' | 'CHANNEL';
export type ParticipantRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Conversation {
  id: string;
  companyId?: string;
  type: ConversationType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  contextType?: string;
  contextId?: string;
  isArchived: boolean;
  isMuted: boolean;
  allowReactions: boolean;
  allowAttachments: boolean;
  isPublic: boolean;
  maxParticipants?: number;
  lastMessageId?: string;
  lastMessageAt?: string;
  messageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  participants?: ConversationParticipant[];
  messages?: Message[];
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  userName?: string;
  role: ParticipantRole;
  isActive: boolean;
  isMuted: boolean;
  isPinned: boolean;
  lastReadMessageId?: string;
  lastReadAt?: string;
  unreadCount: number;
  notifyOnMessage: boolean;
  notifyOnMention: boolean;
  joinedAt: string;
  leftAt?: string;
  removedBy?: string;
}

// 7.2.1 Messages
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'SYSTEM';
export type MessageStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Mention {
  userId: string;
  userName?: string;
  startIndex: number;
  length: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  type: MessageType;
  content?: string;
  richContent?: Record<string, unknown>;
  replyToId?: string;
  replyTo?: Message;
  threadCount: number;
  mentions?: Mention[];
  status: MessageStatus;
  editedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
  deliveredTo?: Record<string, string>;
  readBy?: Record<string, string>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}

// Message Reactions
export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  userName?: string;
  emoji: string;
  createdAt: string;
}

// 7.2.6 Message Attachments
export type AttachmentType = 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'OTHER';

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  attachmentType: AttachmentType;
  isProcessed: boolean;
  processingError?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// 7.2.3 Message Templates
export type TemplateCategory = 'GREETING' | 'FOLLOWUP' | 'REJECTION' | 'OFFER' | 'CUSTOM';

export interface TemplateVariable {
  name: string;
  placeholder: string;
  defaultValue?: string;
}

export interface MessageTemplate {
  id: string;
  companyId?: string;
  userId?: string;
  name: string;
  shortcut?: string;
  category: TemplateCategory;
  content: string;
  richContent?: Record<string, unknown>;
  variables?: TemplateVariable[];
  usageCount: number;
  lastUsedAt?: string;
  isShared: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// 7.2.4 Scheduled Messages
export type ScheduledMessageStatus = 'PENDING' | 'SENT' | 'CANCELLED' | 'FAILED';

export interface RecurrenceRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

export interface ScheduledMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  richContent?: Record<string, unknown>;
  attachmentIds?: string[];
  scheduledFor: string;
  timezone: string;
  status: ScheduledMessageStatus;
  sentAt?: string;
  sentMessageId?: string;
  failureReason?: string;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  createdAt: string;
  updatedAt?: string;
}

// 7.1.5 Typing Indicators
export interface TypingIndicator {
  id: string;
  conversationId: string;
  userId: string;
  userName?: string;
  isTyping: boolean;
  startedAt: string;
  expiresAt: string;
}

// 7.2.8 Email Fallback
export interface EmailFallbackConfig {
  id: string;
  userId: string;
  enabled: boolean;
  offlineMinutes: number;
  digestMode: boolean;
  digestIntervalHours: number;
  includeContent: boolean;
  includeSender: boolean;
  maxEmailsPerDay: number;
  lastDigestSent?: string;
  emailsSentToday: number;
  createdAt: string;
  updatedAt?: string;
}

// Communication Stats
export interface CommunicationStats {
  totalConversations: number;
  unreadMessages: number;
  totalMessagesSent: number;
  pendingScheduled: number;
  availableTemplates: number;
}

// Conversation with last message preview
export interface ConversationPreview extends Conversation {
  lastMessage?: Message;
  otherParticipants?: ConversationParticipant[];
}

// Search results
export interface MessageSearchResult extends Message {
  conversation?: Conversation;
  highlightedContent?: string;
}

// ============================================================================
// BATCH 27: AUTHENTICATION & ACCESS (8.1.1-8.1.11)
// ============================================================================

// 8.1.1 Two-Factor Authentication
export type TwoFactorMethod = 'TOTP' | 'SMS' | 'EMAIL' | 'BACKUP_CODES';

export interface TwoFactorStatus {
  enabled: boolean;
  method: TwoFactorMethod | null;
  verifiedAt?: string;
  methods: {
    totp: boolean;
    sms: boolean;
    email: boolean;
  };
  backupCodes: {
    used: number;
    generatedAt?: string;
  };
  recovery: {
    email: string | null;
    phone: string | null;
  };
}

export interface TwoFactorSetupResponse {
  message: string;
  method: TwoFactorMethod;
  qrCode?: string;
  requiresVerification: boolean;
}

export interface BackupCodesResponse {
  message: string;
  codes: string[];
  warning: string;
}

// 8.1.2, 8.1.3 SSO Integration
export type SSOProviderType = 'SAML' | 'OAUTH2' | 'OIDC';
export type SSOProviderName = 'google' | 'microsoft' | 'okta' | 'custom';

export interface SSOProvider {
  id: string;
  organizationId?: string;
  name: string;
  type: SSOProviderType;
  provider?: SSOProviderName;
  isEnabled: boolean;
  isDefault: boolean;

  // SAML config
  samlEntityId?: string;
  samlSsoUrl?: string;
  samlCertificate?: string;
  samlLogoutUrl?: string;
  samlNameIdFormat?: string;

  // OAuth2/OIDC config
  clientId?: string;
  clientSecret?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  scopes?: string[];
  callbackUrl?: string;

  // Provider-specific
  tenantId?: string;
  oktaDomain?: string;

  // Settings
  attributeMapping?: Record<string, string>;
  allowedDomains?: string[];
  autoCreateUsers?: boolean;
  defaultRole?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface SSOSession {
  id: string;
  userId: string;
  providerId: string;
  ssoSessionId?: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
}

export interface SSOLoginResponse {
  redirectUrl: string;
  provider: string;
  type: SSOProviderType;
}

// 8.1.4 Password Policies
export interface PasswordPolicy {
  id?: string;
  organizationId?: string;

  // Complexity
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialCharsAllowed?: string;

  // History & Rotation
  passwordHistoryCount: number;
  maxPasswordAgeDays: number;
  minPasswordAgeDays: number;
  warnBeforeExpireDays: number;

  // Lockout
  maxFailedAttempts: number;
  lockoutDurationMins: number;
  resetCounterAfterMins: number;

  // Additional
  preventCommonPasswords: boolean;
  preventUserInfoInPwd: boolean;

  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very_strong';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
}

// 8.1.5 Session Management
export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;

  // Device info
  deviceId?: string;
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  browserVersion?: string;
  operatingSystem?: string;
  osVersion?: string;

  // Location
  ipAddress?: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;

  // Status
  isActive: boolean;
  isCurrent?: boolean;
  lastActivityAt: string;
  expiresAt: string;
  terminatedAt?: string;
  terminatedReason?: string;

  // Security
  isTrusted: boolean;
  riskScore: number;

  createdAt: string;
  updatedAt?: string;
}

export interface SessionSettings {
  id?: string;
  userId?: string;
  organizationId?: string;

  sessionTimeoutMins: number;
  idleTimeoutMins: number;
  absoluteTimeoutHours: number;

  maxConcurrentSessions: number;
  singleSessionOnly: boolean;
  terminateOldest: boolean;

  allowRememberMe: boolean;
  rememberMeDays: number;

  createdAt?: string;
  updatedAt?: string;
}

// 8.1.6 IP Whitelisting
export type IPEnforcementMode = 'BLOCK' | 'WARN' | 'LOG';

export interface IPWhitelist {
  id: string;
  organizationId?: string;

  name: string;
  description?: string;
  ipAddress?: string;
  ipRangeStart?: string;
  ipRangeEnd?: string;
  cidrBlock?: string;

  appliesToAll: boolean;
  appliesToRoles?: string[];
  appliesToUsers?: string[];

  isEnabled: boolean;
  enforcementMode: IPEnforcementMode;

  activeStartTime?: string;
  activeEndTime?: string;
  activeDays?: string[];

  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IPAccessCheckResult {
  allowed: boolean;
  matchedRule?: string;
  reason?: string;
  enforcementMode?: IPEnforcementMode;
}

// 8.1.7 Trusted Devices
export type DeviceTrustLevel = 'STANDARD' | 'HIGH' | 'ALWAYS';

export interface TrustedDevice {
  id: string;
  userId: string;

  deviceFingerprint: string;
  deviceId?: string;

  deviceName?: string;
  deviceType: string;
  browser?: string;
  browserVersion?: string;
  operatingSystem?: string;
  osVersion?: string;

  isTrusted: boolean;
  trustLevel: DeviceTrustLevel;
  verificationMethod?: string;

  lastUsedAt: string;
  lastIpAddress?: string;
  lastLocation?: string;

  expiresAt?: string;
  autoRenew: boolean;

  createdAt: string;
  updatedAt?: string;
  revokedAt?: string;
  revokedReason?: string;
}

// 8.1.8 Login Anomaly Detection
export type AnomalyType = 'new_location' | 'new_device' | 'impossible_travel' | 'brute_force_suspected';
export type AnomalyAction = 'BLOCK' | 'CHALLENGE' | 'WARN' | 'LOG';

export interface LoginAttempt {
  id: string;
  userId?: string;
  email: string;
  success: boolean;
  failureReason?: string;

  ipAddress: string;
  userAgent?: string;
  deviceFingerprint?: string;

  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;

  riskScore: number;
  riskFactors?: string[];
  isAnomaly: boolean;
  anomalyType?: AnomalyType;
  actionTaken?: string;

  createdAt: string;
}

export interface LoginAnomalyConfig {
  id?: string;
  organizationId?: string;

  enableAnomalyDetection: boolean;
  enableImpossibleTravel: boolean;
  enableNewLocationAlert: boolean;
  enableNewDeviceAlert: boolean;
  enableBruteForceDetect: boolean;

  maxTravelSpeedKmh: number;
  suspiciousCountryList?: string[];
  blockedCountryList?: string[];

  anomalyAction: AnomalyAction;
  alertAdmins: boolean;
  alertUser: boolean;

  modelSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  learningPeriodDays: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface LoginAttemptResult {
  id: string;
  riskScore: number;
  isAnomaly: boolean;
  anomalyType?: AnomalyType;
  actionRequired?: string;
}

// 8.1.9 API Key Management
export interface APIKey {
  id: string;
  userId: string;
  organizationId?: string;

  name: string;
  description?: string;
  keyPrefix: string;
  lastFourChars: string;

  scopes?: string[];
  allowedEndpoints?: string[];
  allowedIPs?: string[];

  rateLimit: number;
  rateLimitWindow: number;

  isActive: boolean;
  expiresAt?: string;

  lastUsedAt?: string;
  lastUsedIP?: string;
  totalRequests: number;

  createdAt: string;
  updatedAt?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
}

export interface APIKeyCreateResponse {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  lastFourChars: string;
  scopes?: string[];
  expiresAt?: string;
  warning: string;
}

export interface APIKeyUsageLog {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

export interface APIKeyUsageStats {
  endpoint: string;
  _count: number;
  _avg: { responseTimeMs: number };
}

// 8.1.10 Role-Based Access Control (RBAC)
export interface RBACRole {
  id: string;
  organizationId?: string;

  name: string;
  displayName: string;
  description?: string;

  level: number;
  parentRoleId?: string;

  isSystem: boolean;
  isActive: boolean;

  permissions?: RolePermission[];
  _count?: { userRoles: number };

  createdAt: string;
  updatedAt?: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  resource: string;
  action: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type GrantType = 'ALLOW' | 'DENY';

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  grantType: GrantType;
  conditions?: Record<string, any>;
  permission?: Permission;
  createdAt: string;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  organizationId?: string;
  departmentId?: string;
  startsAt: string;
  expiresAt?: string;
  assignedBy?: string;
  role?: RBACRole;
  createdAt: string;
  updatedAt?: string;
}

export interface UserPermissionOverride {
  id: string;
  userId: string;
  permissionId: string;
  grantType: GrantType;
  organizationId?: string;
  resourceId?: string;
  expiresAt?: string;
  reason?: string;
  grantedBy?: string;
  permission?: Permission;
  createdAt: string;
  updatedAt?: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  source: 'user_override' | 'role' | null;
}

// 8.1.11 Attribute-Based Access Control (ABAC)
export type ABACEffect = 'ALLOW' | 'DENY';
export type ABACConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'between';

export interface ABACCondition {
  attribute: string;
  operator: ABACConditionOperator;
  value: any;
}

export interface ABACConditionGroup {
  all?: (ABACCondition | ABACConditionGroup)[];
  any?: (ABACCondition | ABACConditionGroup)[];
  none?: (ABACCondition | ABACConditionGroup)[];
}

export interface ABACPolicy {
  id: string;
  organizationId?: string;

  name: string;
  description?: string;
  priority: number;

  targetResource: string;
  targetAction?: string;

  conditions: ABACConditionGroup | ABACCondition;
  effect: ABACEffect;

  isEnabled: boolean;

  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ABACAttributeCategory = 'user' | 'resource' | 'environment' | 'context';
export type ABACAttributeDataType = 'string' | 'number' | 'boolean' | 'array' | 'date';

export interface ABACAttribute {
  id: string;
  name: string;
  displayName: string;
  description?: string;

  category: ABACAttributeCategory;
  dataType: ABACAttributeDataType;

  source: string;
  sourcePath?: string;

  allowedValues?: any[];

  createdAt: string;
  updatedAt?: string;
}

export interface ABACEvaluationResult {
  allowed: boolean;
  matchedPolicy?: string;
  effect?: ABACEffect;
  reason?: string;
}

// Security Audit Log
export type SecurityEventType =
  | 'login'
  | 'logout'
  | 'password_change'
  | '2fa_enable'
  | '2fa_disable'
  | 'api_key_create'
  | 'api_key_revoke'
  | 'role_assign'
  | 'role_revoke'
  | 'permission_change';

export type SecurityEventCategory = 'authentication' | 'authorization' | 'configuration';
export type SecurityRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityAuditLog {
  id: string;
  userId?: string;

  eventType: SecurityEventType;
  eventCategory: SecurityEventCategory;
  eventAction: string;

  description: string;
  details?: Record<string, any>;

  targetType?: string;
  targetId?: string;

  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  riskLevel: SecurityRiskLevel;

  createdAt: string;
}

// Security Stats
export interface SecurityStats {
  twoFactorAuth: {
    enabledUsers: number;
  };
  sessions: {
    active: number;
  };
  loginAttempts: {
    last24h: number;
    anomalies24h: number;
  };
  apiKeys: {
    active: number;
  };
  rbac: {
    roles: number;
    permissions: number;
  };
  auditLogs: {
    highRiskLast7d: number;
  };
}

// ==========================================
// Batch 28: Data Protection Types (8.2.1-8.2.8)
// ==========================================

// 8.2.1 Encryption Key Management
export type EncryptionKeyType = 'AES_256_GCM' | 'AES_256_CBC' | 'RSA_4096' | 'RSA_2048' | 'ECDSA_P384';
export type EncryptionKeyStatus = 'ACTIVE' | 'PENDING_ROTATION' | 'ROTATING' | 'RETIRED' | 'REVOKED';
export type EncryptionKeyPurpose = 'DATA_ENCRYPTION' | 'KEY_WRAPPING' | 'SIGNING' | 'AUTHENTICATION' | 'BACKUP';
export type KeyStorageType = 'SOFTWARE' | 'HSM' | 'CLOUD_KMS';

export interface EncryptionKey {
  id: string;
  name: string;
  description?: string;

  keyType: EncryptionKeyType;
  purpose: EncryptionKeyPurpose;
  status: EncryptionKeyStatus;

  storageType: KeyStorageType;
  hsmKeyId?: string;
  cloudKmsKeyId?: string;

  keyFingerprint: string;
  publicKeyPem?: string;

  version: number;
  previousVersionId?: string;

  createdAt: string;
  activatedAt?: string;
  lastRotatedAt?: string;
  expiresAt?: string;
  retiredAt?: string;

  rotationEnabled: boolean;
  rotationIntervalDays?: number;

  allowedOperations: string[];

  metadata?: Record<string, any>;
}

export interface KeyRotationSchedule {
  id: string;
  keyId: string;

  cronExpression: string;
  rotationIntervalDays: number;

  lastRotationAt?: string;
  nextRotationAt: string;

  autoRotateEnabled: boolean;
  notifyBeforeDays: number;
  notificationEmails: string[];

  retainVersionCount: number;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KeyRotationEvent {
  id: string;
  keyId: string;

  eventType: 'SCHEDULED' | 'MANUAL' | 'EMERGENCY' | 'AUTOMATED';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

  previousVersion: number;
  newVersion: number;

  initiatedBy?: string;
  startedAt: string;
  completedAt?: string;

  errorMessage?: string;
  details?: Record<string, any>;
}

// 8.2.2 TLS Configuration
export type TLSVersion = 'TLS_1_2' | 'TLS_1_3';
export type CertificateStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED' | 'PENDING';

export interface TLSConfig {
  id: string;

  minVersion: TLSVersion;
  maxVersion: TLSVersion;

  cipherSuites: string[];
  preferServerCipherOrder: boolean;

  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubdomains: boolean;
    preload: boolean;
  };

  certificateInfo: {
    issuer: string;
    subject: string;
    serialNumber: string;
    validFrom: string;
    validTo: string;
    status: CertificateStatus;
    daysUntilExpiry: number;
    fingerprint: string;
    san: string[];
  };

  ocspStapling: boolean;
  sessionTickets: boolean;
  sessionTimeout: number;

  clientCertificateAuth: {
    enabled: boolean;
    required: boolean;
    trustedCAs: string[];
  };

  updatedAt: string;
  updatedBy?: string;
}

// 8.2.3 PII Detection & Masking
export type PIIType =
  | 'SSN'
  | 'EMAIL'
  | 'PHONE'
  | 'CREDIT_CARD'
  | 'PASSPORT'
  | 'DRIVERS_LICENSE'
  | 'BANK_ACCOUNT'
  | 'DATE_OF_BIRTH'
  | 'ADDRESS'
  | 'IP_ADDRESS'
  | 'NAME'
  | 'CUSTOM';

export type MaskingStrategy =
  | 'FULL_MASK'
  | 'PARTIAL_MASK'
  | 'HASH'
  | 'TOKENIZE'
  | 'REDACT'
  | 'ENCRYPT';

export interface PIIDetectionConfig {
  id: string;
  name: string;
  description?: string;

  piiTypes: PIIType[];
  customPatterns?: {
    name: string;
    pattern: string;
    description?: string;
  }[];

  scanLocations: {
    databases: boolean;
    files: boolean;
    logs: boolean;
    apiResponses: boolean;
  };

  maskingStrategy: MaskingStrategy;
  maskingOptions: {
    maskChar: string;
    preserveLength: boolean;
    preserveFormat: boolean;
    showLastN?: number;
    showFirstN?: number;
  };

  autoMask: boolean;
  logDetections: boolean;
  alertOnDetection: boolean;
  alertThreshold?: number;

  excludePatterns?: string[];

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PIIDetectionLog {
  id: string;
  configId: string;

  piiType: PIIType;
  detectedValue: string; // Masked

  location: {
    type: 'DATABASE' | 'FILE' | 'LOG' | 'API_RESPONSE';
    path: string;
    field?: string;
    lineNumber?: number;
  };

  action: 'DETECTED' | 'MASKED' | 'ALERTED' | 'BLOCKED';

  matchedPattern?: string;
  confidence: number;

  userId?: string;
  requestId?: string;

  createdAt: string;
}

export interface PIIScanResult {
  scanId: string;
  status: 'SCANNING' | 'COMPLETED' | 'FAILED';

  scannedItems: number;
  detections: {
    piiType: PIIType;
    count: number;
    locations: string[];
  }[];

  totalDetections: number;
  maskedCount: number;

  startedAt: string;
  completedAt?: string;

  errors?: string[];
}

// 8.2.4 Data Anonymization
export type AnonymizationMethod =
  | 'GENERALIZATION'
  | 'SUPPRESSION'
  | 'PSEUDONYMIZATION'
  | 'DATA_SWAPPING'
  | 'NOISE_ADDITION'
  | 'AGGREGATION'
  | 'K_ANONYMITY'
  | 'L_DIVERSITY'
  | 'T_CLOSENESS';

export interface AnonymizationRule {
  id: string;
  name: string;
  description?: string;

  targetField: string;
  targetTable?: string;

  method: AnonymizationMethod;

  options: {
    generalizationLevel?: number;
    kValue?: number;
    lValue?: number;
    tValue?: number;
    noiseLevel?: number;
    aggregationType?: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
    replacementValue?: string;
    preserveFormat?: boolean;
    seedValue?: string;
  };

  conditions?: {
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'regex';
    value: string;
  }[];

  priority: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export type AnonymizationJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface AnonymizationJob {
  id: string;
  name: string;

  ruleIds: string[];

  sourceType: 'DATABASE' | 'FILE' | 'API';
  sourceConfig: Record<string, any>;

  destinationType: 'DATABASE' | 'FILE' | 'API';
  destinationConfig: Record<string, any>;

  status: AnonymizationJobStatus;

  progress: number;
  totalRecords?: number;
  processedRecords?: number;

  startedAt?: string;
  completedAt?: string;

  errors?: string[];
  warnings?: string[];

  createdBy: string;
  createdAt: string;
}

// 8.2.5 Secure File Storage
export type FileEncryptionMethod = 'AES_256_GCM' | 'AES_256_CBC' | 'CHACHA20_POLY1305';
export type FileStorageLocation = 'LOCAL' | 'S3' | 'AZURE_BLOB' | 'GCS';

export interface SecureFile {
  id: string;
  originalName: string;
  storageName: string;

  mimeType: string;
  size: number;

  encryptionMethod: FileEncryptionMethod;
  encryptionKeyId: string;

  storageLocation: FileStorageLocation;
  storagePath: string;
  storageRegion?: string;

  checksum: string;
  checksumAlgorithm: 'SHA256' | 'SHA512';

  metadata?: Record<string, any>;
  tags?: string[];

  accessControl: {
    ownerId: string;
    readAccess: string[];
    writeAccess: string[];
    publicAccess: boolean;
    expiresAt?: string;
  };

  virusScanStatus: 'PENDING' | 'CLEAN' | 'INFECTED' | 'SCAN_FAILED';
  virusScanDate?: string;

  retentionPolicy?: {
    deleteAfterDays?: number;
    archiveAfterDays?: number;
    legalHold: boolean;
  };

  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export interface FileAccessLog {
  id: string;
  fileId: string;

  action: 'VIEW' | 'DOWNLOAD' | 'UPLOAD' | 'DELETE' | 'SHARE' | 'MODIFY';

  userId: string;
  userEmail?: string;

  ipAddress: string;
  userAgent?: string;

  success: boolean;
  errorMessage?: string;

  metadata?: Record<string, any>;

  createdAt: string;
}

export interface FileShare {
  id: string;
  fileId: string;

  shareType: 'USER' | 'GROUP' | 'LINK';
  sharedWith?: string;

  permissions: ('READ' | 'WRITE' | 'DELETE')[];

  expiresAt?: string;
  accessCount: number;
  maxAccessCount?: number;

  password?: boolean; // Indicates if password protected

  createdBy: string;
  createdAt: string;
}

// 8.2.6 Data Residency
export type DataResidencyRegion =
  | 'US_EAST'
  | 'US_WEST'
  | 'EU_WEST'
  | 'EU_CENTRAL'
  | 'APAC_SOUTHEAST'
  | 'APAC_EAST';

export type ComplianceFramework = 'GDPR' | 'CCPA' | 'HIPAA' | 'SOC2' | 'LGPD' | 'PDPA';

export interface DataResidencyConfig {
  id: string;
  name: string;
  description?: string;

  primaryRegion: DataResidencyRegion;
  allowedRegions: DataResidencyRegion[];

  dataTypes: string[];

  complianceFrameworks: ComplianceFramework[];

  replicationConfig?: {
    enabled: boolean;
    targetRegions: DataResidencyRegion[];
    syncMode: 'SYNCHRONOUS' | 'ASYNCHRONOUS';
    lagTolerance?: number;
  };

  crossBorderTransfer: {
    allowed: boolean;
    requiresConsent: boolean;
    approvedCountries?: string[];
    dataTransferAgreement?: string;
  };

  retentionPolicy: {
    defaultRetentionDays: number;
    byDataType?: Record<string, number>;
  };

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegionInfo {
  id: DataResidencyRegion;
  name: string;
  country: string;
  countryCode: string;

  complianceFrameworks: ComplianceFramework[];

  datacenters: {
    provider: string;
    location: string;
    tier: number;
  }[];

  features: {
    encryption: boolean;
    backup: boolean;
    replication: boolean;
    edgeNodes: boolean;
  };

  latency?: number;
  isAvailable: boolean;
}

// 8.2.7 Backup & Recovery
export type BackupType = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
export type BackupStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CORRUPTED';
export type BackupStorageType = 'LOCAL' | 'S3' | 'AZURE_BLOB' | 'GCS' | 'TAPE';

export interface BackupConfig {
  id: string;
  name: string;
  description?: string;

  backupType: BackupType;

  schedule: {
    enabled: boolean;
    cronExpression: string;
    timezone: string;
  };

  sources: {
    databases: string[];
    tables?: string[];
    files?: string[];
    includeBlobs: boolean;
  };

  storage: {
    type: BackupStorageType;
    path: string;
    region?: DataResidencyRegion;

    encryption: {
      enabled: boolean;
      keyId?: string;
    };

    compression: {
      enabled: boolean;
      algorithm: 'GZIP' | 'LZ4' | 'ZSTD';
      level: number;
    };
  };

  retention: {
    dailyCount: number;
    weeklyCount: number;
    monthlyCount: number;
    yearlyCount: number;
  };

  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    emails: string[];
  };

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Backup {
  id: string;
  configId: string;
  configName: string;

  backupType: BackupType;
  status: BackupStatus;

  sizeBytes: number;
  compressedSizeBytes?: number;

  storagePath: string;
  storageType: BackupStorageType;
  storageRegion?: DataResidencyRegion;

  encryptionKeyId?: string;
  checksum: string;

  tablesIncluded: number;
  recordsIncluded: number;

  startedAt: string;
  completedAt?: string;
  duration?: number;

  verifiedAt?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'FAILED';

  expiresAt?: string;

  errorMessage?: string;

  metadata?: Record<string, any>;
}

export type RestoreJobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface RestoreJob {
  id: string;
  backupId: string;

  restoreType: 'FULL' | 'PARTIAL' | 'POINT_IN_TIME';

  targetDatabase?: string;
  tables?: string[];
  pointInTime?: string;

  status: RestoreJobStatus;
  progress: number;

  tablesRestored?: number;
  recordsRestored?: number;

  overwriteExisting: boolean;
  createNewDatabase: boolean;

  startedAt?: string;
  completedAt?: string;

  errorMessage?: string;
  warnings?: string[];

  initiatedBy: string;
  createdAt: string;
}

// 8.2.8 Key Lifecycle Management
export interface KeyLifecycleEvent {
  id: string;
  keyId: string;
  keyName: string;

  eventType: 'CREATED' | 'ACTIVATED' | 'ROTATED' | 'SUSPENDED' | 'RETIRED' | 'REVOKED' | 'DESTROYED';

  previousState?: EncryptionKeyStatus;
  newState: EncryptionKeyStatus;

  reason?: string;

  performedBy?: string;
  performedAt: string;

  metadata?: Record<string, any>;
}

export interface KeyUsageAnalytics {
  keyId: string;
  keyName: string;

  period: {
    start: string;
    end: string;
  };

  operations: {
    encrypt: number;
    decrypt: number;
    sign: number;
    verify: number;
    wrap: number;
    unwrap: number;
  };

  uniqueUsers: number;
  uniqueApplications: number;

  errorRate: number;
  avgLatencyMs: number;

  peakUsage: {
    timestamp: string;
    operationsPerSecond: number;
  };
}

// Data Protection Audit Log
export type DataProtectionEventType =
  | 'KEY_OPERATION'
  | 'PII_DETECTION'
  | 'DATA_ANONYMIZATION'
  | 'FILE_ACCESS'
  | 'BACKUP_OPERATION'
  | 'RESTORE_OPERATION'
  | 'CONFIG_CHANGE'
  | 'COMPLIANCE_CHECK';

export interface DataProtectionAuditLog {
  id: string;

  eventType: DataProtectionEventType;
  action: string;

  resourceType: string;
  resourceId: string;

  userId?: string;
  userEmail?: string;

  details: Record<string, any>;

  ipAddress?: string;
  userAgent?: string;

  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;

  createdAt: string;
}

// Data Protection Statistics
export interface DataProtectionStats {
  encryption: {
    activeKeys: number;
    pendingRotation: number;
    keysRotatedLast30d: number;
    hsmEnabled: boolean;
  };

  piiDetection: {
    activeConfigs: number;
    detectionsLast24h: number;
    maskedLast24h: number;
    alertsLast24h: number;
  };

  anonymization: {
    activeRules: number;
    jobsLast7d: number;
    recordsAnonymized: number;
  };

  secureStorage: {
    totalFiles: number;
    totalSizeGB: number;
    encryptedPercentage: number;
    accessesLast24h: number;
  };

  backup: {
    activeConfigs: number;
    backupsLast7d: number;
    lastBackupAt?: string;
    totalBackupSizeGB: number;
    verifiedBackups: number;
  };

  compliance: {
    frameworks: ComplianceFramework[];
    lastCheckAt?: string;
    passRate: number;
    criticalIssues: number;
  };
}

// Data Protection Dashboard
export interface DataProtectionDashboard {
  stats: DataProtectionStats;

  recentActivity: DataProtectionAuditLog[];

  alerts: {
    id: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: string;
    message: string;
    createdAt: string;
    acknowledged: boolean;
  }[];

  keyRotationSchedule: {
    keyId: string;
    keyName: string;
    nextRotation: string;
    daysUntil: number;
  }[];

  backupSchedule: {
    configId: string;
    configName: string;
    nextBackup: string;
    lastBackupStatus?: BackupStatus;
  }[];

  complianceStatus: {
    framework: ComplianceFramework;
    status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
    lastCheck: string;
    issues: number;
  }[];
}

// ==========================================
// Batch 29: Compliance Features Types (8.3.1-8.3.11)
// ==========================================

// 8.3.1 GDPR Compliance
export type ConsentType = 'data_processing' | 'marketing' | 'third_party' | 'cookies' | 'analytics';
export type LegalBasis = 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';

export interface GDPRConsentRecord {
  id: string;
  userId: string;

  consentType: ConsentType;
  purpose: string;
  legalBasis: LegalBasis;

  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  expiresAt?: string;

  source: string;
  ipAddress?: string;
  userAgent?: string;

  version: number;
  policyVersion?: string;

  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 8.3.2 CCPA Compliance
export type CCPARequestType = 'know' | 'delete' | 'opt_out' | 'opt_in';
export type CCPARequestStatus = 'pending' | 'verified' | 'processing' | 'completed' | 'rejected';

export interface CCPARequest {
  id: string;
  userId?: string;

  requestType: CCPARequestType;
  requestSource: string;
  requesterEmail: string;
  requesterName?: string;
  verificationMethod: string;

  status: CCPARequestStatus;
  verified: boolean;
  verifiedAt?: string;

  assignedTo?: string;
  dueDate: string;
  completedAt?: string;

  response?: string;
  dataExportUrl?: string;

  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 8.3.3 EEOC/OFCCP Reporting
export type EEOCReportType = 'eeo1' | 'vets4212' | 'ofccp_aap';
export type EEOCReportStatus = 'draft' | 'pending_review' | 'submitted' | 'accepted' | 'rejected';

export interface EEOCReport {
  id: string;
  organizationId: string;

  reportType: EEOCReportType;
  reportingYear: number;
  reportingPeriod: string;

  status: EEOCReportStatus;
  submittedAt?: string;

  employeeData?: Record<string, any>;
  applicantData?: Record<string, any>;
  aggregatedData?: Record<string, any>;

  filingConfirmation?: string;
  reviewedBy?: string;
  reviewNotes?: string;

  generatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// 8.3.4 Data Retention Policies
export type RetentionAction = 'delete' | 'anonymize' | 'archive';

export interface DataRetentionPolicy {
  id: string;
  organizationId?: string;

  name: string;
  description?: string;
  dataCategory: string;
  dataType?: string;

  retentionPeriodDays: number;
  retentionBasis: string;
  legalReference?: string;

  actionOnExpiry: RetentionAction;
  archiveLocation?: string;

  autoEnforce: boolean;
  lastEnforcedAt?: string;
  nextEnforcementAt?: string;

  exceptions?: Record<string, any>;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 8.3.5 Right to be Forgotten
export type DeletionRequestType = 'full_deletion' | 'partial_deletion' | 'anonymization';
export type DeletionRequestStatus = 'pending' | 'verified' | 'processing' | 'completed' | 'rejected';

export interface DeletionRequest {
  id: string;
  organizationId?: string;
  userId?: string;

  requestType: DeletionRequestType;
  requesterEmail: string;
  requesterName?: string;
  regulation: string;

  dataScope: string[];
  exclusions: string[];

  verified: boolean;
  verificationToken?: string;
  verifiedAt?: string;

  status: DeletionRequestStatus;
  statusHistory?: any[];

  assignedTo?: string;
  scheduledFor?: string;
  completedAt?: string;

  deletedItems?: Record<string, any>;
  retainedItems?: Record<string, any>;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 8.3.6 Consent Management
export type ConsentCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

export interface ConsentPolicy {
  id: string;
  organizationId?: string;

  name: string;
  description: string;
  category: ConsentCategory;
  purpose: string;

  legalBasis: string;
  dataCategories: string[];
  recipients: string[];
  crossBorderTransfer: boolean;
  transferCountries: string[];

  isRequired: boolean;
  canWithdraw: boolean;

  displayOrder: number;
  isActive: boolean;
  version: number;

  createdAt: string;
  updatedAt: string;
}

export interface UserConsent {
  id: string;
  organizationId?: string;
  userId: string;
  policyId: string;
  policyName?: string;

  consented: boolean;
  consentedAt?: string;
  withdrawnAt?: string;

  source: string;
  ipAddress?: string;
  userAgent?: string;

  policyVersion: number;

  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 8.3.7 Data Subject Access Requests (DSAR)
export type DSARRequestType = 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
export type DSARStatus = 'received' | 'verified' | 'processing' | 'completed' | 'rejected';
export type DSARPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface DataSubjectRequest {
  id: string;
  organizationId?: string;
  userId?: string;

  requestType: DSARRequestType;
  regulation: string;
  requesterEmail: string;
  requesterName?: string;

  verificationMethod: string;
  verified: boolean;
  verifiedAt?: string;

  status: DSARStatus;
  priority: DSARPriority;
  statusHistory?: any[];

  receivedAt: string;
  deadlineAt: string;
  respondedAt?: string;

  assignedTo?: string;
  department?: string;

  responseType?: string;
  responseDetails?: string;
  exportFileUrl?: string;

  communications?: any[];

  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 8.3.8 Audit Trail
export type ComplianceEventType = 'data_access' | 'data_modification' | 'consent_change' | 'deletion' | 'export';
export type ComplianceEventCategory = 'gdpr' | 'ccpa' | 'eeoc' | 'general';

export interface ComplianceAuditLog {
  id: string;
  organizationId?: string;
  userId?: string;

  eventType: ComplianceEventType;
  eventCategory: ComplianceEventCategory;
  action: string;

  resourceType: string;
  resourceId: string;
  resourceName?: string;

  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changedFields: string[];

  actorType: 'user' | 'system' | 'api';
  actorId?: string;
  actorEmail?: string;

  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  success: boolean;
  failureReason?: string;

  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

// 8.3.9 Compliance Dashboards
export type ComplianceMetricStatus = 'on_track' | 'at_risk' | 'non_compliant';

export interface ComplianceMetric {
  id: string;
  organizationId: string;

  metricType: string;
  category: ComplianceEventCategory;
  period: string;
  periodStart: string;
  periodEnd: string;

  value: number;
  previousValue?: number;
  target?: number;
  unit: string;

  status: ComplianceMetricStatus;
  threshold?: Record<string, any>;

  breakdown?: Record<string, any>;
  calculatedAt: string;
}

export interface ComplianceDashboard {
  summary: {
    overallScore: number;
    gdprCompliance: number;
    ccpaCompliance: number;
    eeocCompliance: number;
  };

  pendingActions: {
    dsars: number;
    deletionRequests: number;
    consentUpdates: number;
    retentionEnforcements: number;
  };

  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];

  upcomingDeadlines: {
    type: string;
    id: string;
    deadline: string;
    daysRemaining: number;
  }[];

  riskAreas: {
    area: string;
    risk: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }[];
}

// 8.3.10 Bias Auditing
export type BiasAuditType = 'hiring_funnel' | 'ai_scoring' | 'job_posting' | 'screening';
export type BiasRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface BiasAuditReport {
  id: string;
  organizationId: string;

  auditType: BiasAuditType;
  auditPeriod: string;
  startDate: string;
  endDate: string;

  jobIds: string[];
  departmentIds: string[];
  stages: string[];

  status: 'pending' | 'running' | 'completed' | 'failed';
  overallScore?: number;
  riskLevel?: BiasRiskLevel;

  demographicCategories: string[];

  findings?: {
    summary: string;
    byStage?: {
      stage: string;
      score: number;
      risk: string;
    }[];
  };

  disparities?: {
    category: string;
    stage: string;
    metric: string;
    groupA: { name: string; value: number };
    groupB: { name: string; value: number };
    adverseImpactRatio: number;
    significant: boolean;
  }[];

  recommendations?: string[];
  statisticalTests?: Record<string, any>;

  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  actionsTaken?: any[];

  generatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// 8.3.11 SOC 2 Readiness
export type SOC2Category = 'security' | 'availability' | 'processing_integrity' | 'confidentiality' | 'privacy';
export type SOC2ImplementationStatus = 'not_started' | 'in_progress' | 'implemented' | 'tested';
export type SOC2TestResult = 'pass' | 'fail' | 'partial';

export interface SOC2Control {
  id: string;
  organizationId?: string;

  controlId: string;
  category: SOC2Category;
  subcategory?: string;
  name: string;
  description: string;

  trustServiceCriteria: string;

  implementationStatus: SOC2ImplementationStatus;
  implementedBy?: string;
  implementedAt?: string;

  evidenceRequired: string[];
  evidenceProvided: any[];
  evidenceLastUpdated?: string;

  lastTestedAt?: string;
  testResult?: SOC2TestResult;
  testNotes?: string;
  testedBy?: string;

  gaps: any[];
  remediationPlan?: string;
  remediationDueDate?: string;

  riskLevel?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SOC2AuditType = 'type1' | 'type2';
export type SOC2AuditStatus = 'planning' | 'fieldwork' | 'review' | 'completed';
export type SOC2Opinion = 'unqualified' | 'qualified' | 'adverse' | 'disclaimer';

export interface SOC2Audit {
  id: string;
  organizationId: string;

  auditType: SOC2AuditType;
  auditPeriod?: string;
  startDate: string;
  endDate?: string;

  auditorFirm: string;
  auditorContact?: string;
  auditorEmail?: string;

  status: SOC2AuditStatus;
  phase?: string;

  trustCategories: SOC2Category[];
  systemDescription?: string;
  excludedControls: string[];

  opinion?: SOC2Opinion;
  exceptions: any[];
  recommendations: any[];

  reportDate?: string;
  reportUrl?: string;

  kickoffDate?: string;
  fieldworkStartDate?: string;
  fieldworkEndDate?: string;
  finalReportDate?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SOC2ReadinessScore {
  overallScore: number;

  byCategory: {
    security: number;
    availability: number;
    processing_integrity: number;
    confidentiality: number;
    privacy: number;
  };

  controlsStatus: {
    total: number;
    implemented: number;
    inProgress: number;
    notStarted: number;
  };

  gapsSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  recommendations: string[];
  lastUpdated: string;
}

// Compliance Statistics
export interface ComplianceStats {
  gdpr: {
    activeConsents: number;
    pendingDSARs: number;
    avgResponseTime: number;
    consentRate: number;
  };

  ccpa: {
    pendingRequests: number;
    completedThisMonth: number;
    avgResponseTime: number;
  };

  eeoc: {
    reportsGenerated: number;
    pendingSubmissions: number;
    lastSubmission?: string;
  };

  retention: {
    activePolicies: number;
    recordsProcessedThisMonth: number;
    complianceRate: number;
  };

  biasAudit: {
    auditsThisYear: number;
    avgScore: number;
    lastAudit?: string;
  };

  soc2: {
    readinessScore: number;
    controlsImplemented: number;
    gapsRemaining: number;
    auditStatus: string;
  };
}

// ==========================================
// Batch 30: Recruitment Analytics Types (9.1.1-9.1.12)
// ==========================================

// 9.1.1 Funnel Analytics
export interface FunnelAnalytics {
  id: string;
  organizationId: string;
  jobId?: string;
  departmentId?: string;
  recruiterId?: string;

  periodStart: string;
  periodEnd: string;
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly';

  sourced: number;
  applied: number;
  screened: number;
  interviewed: number;
  offered: number;
  hired: number;

  sourceToApply?: number;
  applyToScreen?: number;
  screenToInterview?: number;
  interviewToOffer?: number;
  offerToHire?: number;
  overallConversion?: number;

  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FunnelTrends {
  periods: string[];
  sourced: number[];
  applied: number[];
  screened: number[];
  interviewed: number[];
  offered: number[];
  hired: number[];
  conversionRates: number[];
}

// 9.1.2 Time-to-Hire
export interface TimeToHireMetric {
  id: string;
  organizationId: string;
  jobId?: string;
  departmentId?: string;
  recruiterId?: string;
  candidateId?: string;

  hireDate: string;
  jobOpenDate: string;
  firstApplyDate?: string;
  firstScreenDate?: string;
  firstInterviewDate?: string;
  offerDate?: string;
  offerAcceptDate?: string;

  timeToFill: number;
  timeToHire: number;
  timeToScreen?: number;
  timeToInterview?: number;
  timeToOffer?: number;
  timeToAccept?: number;

  jobType?: string;
  seniorityLevel?: string;
  department?: string;
  location?: string;

  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface TimeToHireAverages {
  overall: {
    avgTimeToFill: number;
    avgTimeToHire: number;
    avgTimeToScreen: number;
    avgTimeToInterview: number;
    avgTimeToOffer: number;
    avgTimeToAccept: number;
  };
  byDepartment: Array<{ department: string; avgTimeToHire: number }>;
  bySeniority: Array<{ level: string; avgTimeToHire: number }>;
  trend: string;
}

// 9.1.3 Cost-per-Hire
export interface CostPerHireMetric {
  id: string;
  organizationId: string;
  jobId?: string;
  departmentId?: string;
  recruiterId?: string;
  candidateId?: string;

  hireDate: string;

  recruiterTime: number;
  hiringManagerTime: number;
  interviewerTime: number;
  adminTime: number;
  internalCostTotal: number;

  jobBoardFees: number;
  agencyFees: number;
  advertisingCost: number;
  backgroundCheckCost: number;
  assessmentCost: number;
  relocationCost: number;
  signingBonus: number;
  travelCost: number;
  externalCostTotal: number;

  totalCost: number;
  costPerHire: number;
  currency: string;
  source?: string;
  department?: string;
  seniorityLevel?: string;

  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CostBreakdown {
  averageCostPerHire: number;
  medianCostPerHire: number;
  totalHiringCost: number;
  totalHires: number;
  byCategory: {
    internalCosts: number;
    externalCosts: number;
  };
  bySource: Array<{ source: string; avgCost: number; hires: number }>;
  byDepartment: Array<{ department: string; avgCost: number }>;
  trend: {
    currentPeriod: number;
    previousPeriod: number;
    change: number;
  };
}

// 9.1.4 Source Effectiveness
export interface SourceEffectiveness {
  id: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  periodType: string;

  sourceName: string;
  sourceCategory: string;

  candidatesSourced: number;
  applicants: number;
  screened: number;
  interviewed: number;
  offers: number;
  hires: number;

  avgTimeToHire?: number;
  avgCostPerHire?: number;
  avgQualityScore?: number;
  retentionRate?: number;

  totalSpend: number;
  costPerApplicant?: number;
  costPerHire?: number;
  roi?: number;

  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SourceROI {
  topSources: Array<{ name: string; roi: number; hires: number }>;
  recommendations: Array<{ action: string; source: string; reason: string }>;
}

// 9.1.5 Recruiter Performance
export interface RecruiterPerformance {
  id: string;
  organizationId: string;
  recruiterId: string;
  recruiterName: string;

  periodStart: string;
  periodEnd: string;
  periodType: string;

  jobsHandled: number;
  candidatesSourced: number;
  screensCompleted: number;
  interviewsScheduled: number;
  offersExtended: number;
  hiresCompleted: number;

  avgTimeToFill?: number;
  avgTimeToHire?: number;
  avgCostPerHire?: number;
  fillRate?: number;

  offerAcceptRate?: number;
  candidateSatisfaction?: number;
  hiringManagerSatisfaction?: number;
  qualityOfHireScore?: number;

  activePipeline: number;
  pipelineVelocity?: number;

  rank?: number;
  tier?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterLeaderboard {
  period: string;
  rankings: Array<{
    rank: number;
    name: string;
    hires: number;
    score: number;
  }>;
  teamAverage: {
    hires: number;
    avgTimeToHire: number;
    fillRate: number;
  };
}

export interface RecruiterGoals {
  recruiterId: string;
  period: string;
  goals: Array<{
    metric: string;
    target: number;
    actual: number;
    progress: number;
  }>;
  overallProgress: number;
}

// 9.1.6 Offer Acceptance
export interface OfferAcceptanceMetric {
  id: string;
  organizationId: string;
  jobId?: string;
  departmentId?: string;
  recruiterId?: string;
  candidateId?: string;

  offerDate: string;
  responseDate?: string;
  status: 'accepted' | 'declined' | 'pending' | 'expired' | 'withdrawn';

  offeredSalary?: number;
  expectedSalary?: number;
  salarySatisfaction?: number;
  currency: string;

  declineReason?: string;
  declineDetails?: string;
  competitorName?: string;
  competitorOffer?: number;

  daysToDecision?: number;
  negotiationRounds: number;

  department?: string;
  seniorityLevel?: string;
  jobType?: string;
  location?: string;

  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface OfferAcceptanceRates {
  overall: {
    totalOffers: number;
    accepted: number;
    declined: number;
    pending: number;
    acceptanceRate: number;
    avgDaysToDecision: number;
  };
  byDepartment: Array<{ department: string; rate: number; total: number }>;
  declineReasons: Array<{ reason: string; count: number; percentage: number }>;
  trend: {
    currentPeriod: number;
    previousPeriod: number;
    change: number;
  };
}

// 9.1.7 Pipeline Velocity
export interface PipelineVelocity {
  id: string;
  organizationId: string;
  jobId?: string;
  departmentId?: string;

  periodStart: string;
  periodEnd: string;
  periodType: string;

  inSourced: number;
  inScreening: number;
  inInterview: number;
  inOffer: number;
  hired: number;
  rejected: number;
  withdrawn: number;

  sourcedToScreening?: number;
  screeningToInterview?: number;
  interviewToOffer?: number;
  offerToHire?: number;
  totalVelocity?: number;

  candidatesEntered: number;
  candidatesExited: number;
  netPipelineChange: number;

  bottleneckStage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VelocityTrends {
  periods: string[];
  totalVelocity: number[];
  stageVelocity: {
    sourcedToScreening: number[];
    screeningToInterview: number[];
    interviewToOffer: number[];
    offerToHire: number[];
  };
  improvement: number;
}

export interface BottleneckAnalysis {
  currentBottleneck: {
    stage: string;
    avgDays: number;
    targetDays: number;
    impact: string;
    candidatesStuck: number;
  };
  recommendations: Array<{
    action: string;
    priority: string;
    expectedImprovement: string;
  }>;
  historicalBottlenecks: Array<{
    period: string;
    stage: string;
    resolved: boolean;
  }>;
}

// 9.1.8 Quality of Hire
export interface QualityOfHireMetric {
  id: string;
  organizationId: string;
  hireId: string;
  candidateId: string;
  jobId: string;
  recruiterId?: string;
  hiringManagerId?: string;

  hireDate: string;
  assessmentDate?: string;

  performanceScore30?: number;
  performanceScore60?: number;
  performanceScore90?: number;
  annualPerformance?: number;

  isRetained: boolean;
  retainedAt30Days: boolean;
  retainedAt90Days?: boolean;
  retainedAt1Year?: boolean;
  separationDate?: string;
  separationReason?: string;

  managerSatisfaction?: number;
  meetingExpectations?: string;
  wouldRehire?: boolean;
  promotionTimeline?: string;

  culturalFitScore?: number;
  teamIntegration?: number;

  timeToProductivity?: number;
  trainingCompleted: boolean;

  overallQualityScore?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface QualityScoreSummary {
  overall: {
    avgQualityScore: number;
    avgPerformance90: number;
    retentionRate90Days: number;
    retentionRate1Year: number;
    avgTimeToProductivity: number;
    managerSatisfactionAvg: number;
  };
  bySource: Array<{ source: string; avgQuality: number; retention: number }>;
  byRecruiter: Array<{ name: string; avgQuality: number; hires: number }>;
  trend: {
    currentPeriod: number;
    previousPeriod: number;
    change: number;
  };
}

// 9.1.9 Diversity Analytics
export interface DiversityAnalyticsData {
  id: string;
  organizationId: string;
  jobId?: string;
  departmentId?: string;

  periodStart: string;
  periodEnd: string;
  periodType: string;

  totalApplicants: number;

  genderDistribution: {
    male: number;
    female: number;
    nonBinary: number;
    undisclosed: number;
  };

  ethnicityDistribution: {
    white: number;
    black: number;
    hispanic: number;
    asian: number;
    other: number;
    undisclosed: number;
  };

  ageDistribution: Record<string, number>;

  veteranStatus: {
    yes: number;
    no: number;
    undisclosed: number;
  };

  disabilityStatus: {
    yes: number;
    no: number;
    undisclosed: number;
  };

  hiresTotal: number;
  hiresDiversity?: Record<string, number>;

  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DiversityGoals {
  goals: Array<{
    metric: string;
    target: number;
    actual: number;
    status: string;
  }>;
  initiatives: Array<{
    name: string;
    status: string;
    impact: string;
  }>;
}

export interface DiversityConversionRates {
  byGender: Array<{
    group: string;
    applyRate: number;
    screenRate: number;
    interviewRate: number;
    offerRate: number;
    hireRate: number;
  }>;
  byEthnicity: Array<{
    group: string;
    applyRate: number;
    hireRate: number;
  }>;
  disparityFlags: Array<{
    stage: string;
    group: string;
    disparity: string;
    severity: string;
  }>;
}

// 9.1.10 Interview-to-Offer Ratio
export interface InterviewOfferRatio {
  id: string;
  organizationId: string;
  jobId?: string;
  departmentId?: string;
  recruiterId?: string;
  hiringManagerId?: string;

  periodStart: string;
  periodEnd: string;
  periodType: string;

  phoneScreens: number;
  technicalInterviews: number;
  onsiteInterviews: number;
  finalInterviews: number;
  totalInterviews: number;

  uniqueCandidatesInterviewed: number;
  passedScreening: number;
  passedTechnical: number;
  passedOnsite: number;

  offersExtended: number;
  offersAccepted: number;
  hires: number;

  interviewsPerHire?: number;
  screenPassRate?: number;
  technicalPassRate?: number;
  onsitePassRate?: number;
  offerRate?: number;
  acceptanceRate?: number;

  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewEfficiency {
  currentInterviewsPerHire: number;
  targetInterviewsPerHire: number;
  industryBenchmark: number;
  byRole: Array<{
    role: string;
    interviewsPerHire: number;
    target: number;
  }>;
  passRatesByStage: Record<string, { rate: number; benchmark: number }>;
  recommendations: Array<{
    action: string;
    impact: string;
  }>;
}

// 9.1.11 Drop-off Analysis
export interface DropOffAnalysisData {
  id: string;
  organizationId: string;
  jobId?: string;
  departmentId?: string;

  periodStart: string;
  periodEnd: string;
  periodType: string;

  stageDropOffs: Record<string, { count: number; rate: number }>;
  withdrawalReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  rejectionReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  avgDaysBeforeDropOff: Record<string, number>;

  reEngaged: number;
  reEngagementRate?: number;

  worstStage?: string;
  worstDropRate?: number;

  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DropOffRecommendations {
  criticalIssues: Array<{
    stage: string;
    issue: string;
    rootCauses: string[];
    recommendations: string[];
    expectedImprovement: string;
  }>;
  quickWins: Array<{
    action: string;
    impact: string;
  }>;
}

// 9.1.12 SLA Tracking
export interface RecruitmentSLA {
  id: string;
  organizationId: string;
  name: string;
  description?: string;

  slaType: 'response_time' | 'stage_duration' | 'feedback' | 'overall';
  targetMetric: string;
  targetValue: number;
  targetUnit: 'hours' | 'days' | 'business_days';

  priority: 'high' | 'medium' | 'low';
  applicableJobs: string[];
  applicableDepartments: string[];

  escalationEnabled: boolean;
  escalationThreshold?: number;
  escalationRecipients: string[];

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SLATracking {
  id: string;
  organizationId: string;
  slaId: string;
  jobId?: string;
  candidateId?: string;
  recruiterId?: string;

  periodStart: string;
  periodEnd: string;
  periodType: string;

  totalMeasured: number;
  metSLA: number;
  missedSLA: number;
  complianceRate?: number;

  avgActualTime?: number;
  minTime?: number;
  maxTime?: number;
  medianTime?: number;
  p90Time?: number;

  breachDetails: Array<Record<string, unknown>>;
  escalationsTriggered: number;

  previousPeriodCompliance?: number;
  trend?: string;

  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SLABreaches {
  totalBreaches: number;
  bySLA: Array<{
    slaId: string;
    name: string;
    breaches: number;
    rate: number;
  }>;
  recentBreaches: Array<{
    id: string;
    slaId: string;
    candidateId: string;
    jobId: string;
    targetHours: number;
    actualHours: number;
    breach: number;
    recruiterId: string;
    timestamp: string;
  }>;
  byRecruiter: Array<{
    recruiterId: string;
    name: string;
    breaches: number;
    rate: number;
  }>;
}

// Recruitment Analytics Dashboard
export interface RecruitmentAnalyticsDashboard {
  summary: {
    totalHires: number;
    openPositions: number;
    activeCandidates: number;
    avgTimeToHire: number;
    avgCostPerHire: number;
    offerAcceptanceRate: number;
    diversityScore: number;
  };
  funnelSnapshot: {
    sourced: number;
    applied: number;
    screened: number;
    interviewed: number;
    offered: number;
    hired: number;
  };
  trends: {
    hiresOverTime: number[];
    timeToHireTrend: number[];
    costPerHireTrend: number[];
  };
  topSources: Array<{
    name: string;
    hires: number;
    percentage: number;
  }>;
  topRecruiters: Array<{
    name: string;
    hires: number;
    avgTime: number;
  }>;
  slaCompliance: {
    overall: number;
    byType: Record<string, number>;
  };
  alerts: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
}

export interface RecruitmentStats {
  period: {
    start: string;
    end: string;
  };
  hiring: {
    totalHires: number;
    targetHires: number;
    progress: number;
    avgTimeToHire: number;
    avgCostPerHire: number;
  };
  pipeline: {
    totalCandidates: number;
    activeInPipeline: number;
    hiredThisPeriod: number;
    rejectedThisPeriod: number;
    withdrawnThisPeriod: number;
  };
  efficiency: {
    funnelConversion: number;
    interviewsPerHire: number;
    offerAcceptanceRate: number;
    slaCompliance: number;
  };
  diversity: {
    femaleHires: number;
    minorityHires: number;
    veteranHires: number;
  };
  quality: {
    avgQualityScore: number;
    retention90Days: number;
    managerSatisfaction: number;
  };
}

// ==========================================
// Batch 31: Executive Dashboards Types (9.2.1-9.2.8)
// ==========================================

// 9.2.1 Executive Dashboard
export interface ExecutiveDashboard {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  layout: { columns: number; rows: number };
  widgets: DashboardWidgetConfig[];
  filters?: Record<string, unknown>;
  isDefault: boolean;
  isShared: boolean;
  createdBy: string;
  lastViewedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidgetConfig {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  value?: number | string;
}

export interface ExecutiveSummary {
  period: string;
  kpis: Array<{
    name: string;
    value: number;
    target: number;
    status: string;
    trend: string;
    unit?: string;
  }>;
  highlights: Array<{
    type: string;
    message: string;
  }>;
  departmentOverview: Array<{
    name: string;
    hires: number;
    target: number;
    progress: number;
  }>;
}

// 9.2.2 Trend Analysis
export interface TrendAnalysis {
  id: string;
  organizationId: string;
  metricName: string;
  metricCategory: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  dataPoints: Array<{ date: string; value: number }>;
  trend: string;
  trendStrength?: number;
  forecast: Array<{ date: string; value: number }>;
  avgValue: number;
  minValue: number;
  maxValue: number;
  stdDeviation?: number;
  yoyChange?: number;
  momChange?: number;
  seasonalPattern?: string;
  anomalies: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
}

export interface ForecastResult {
  metricName: string;
  currentValue: number;
  forecastedValues: Array<{
    period: string;
    value: number;
    confidence: number;
  }>;
  assumptions: string[];
  modelAccuracy: number;
}

// 9.2.3 Benchmark Comparisons
export interface IndustryBenchmark {
  id: string;
  industry: string;
  companySize: string;
  region: string;
  metricName: string;
  metricCategory: string;
  year: number;
  quarter?: number;
  p10Value: number;
  p25Value: number;
  p50Value: number;
  p75Value: number;
  p90Value: number;
  avgValue: number;
  source?: string;
  sampleSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BenchmarkComparison {
  id: string;
  organizationId: string;
  benchmarkId: string;
  comparisonDate: string;
  metricName: string;
  metricCategory: string;
  orgValue: number;
  benchmarkValue: number;
  percentile: number;
  gap: number;
  status: string;
  recommendation?: string;
  createdAt: string;
}

// 9.2.4 Dashboard Widget
export interface DashboardWidget {
  id: string;
  organizationId: string;
  dashboardId?: string;
  name: string;
  description?: string;
  widgetType: string;
  chartType?: string;
  dataSource: string;
  query?: Record<string, unknown>;
  width: number;
  height: number;
  position?: { x: number; y: number };
  colors?: Record<string, string>;
  showLegend: boolean;
  showLabels: boolean;
  refreshInterval?: number;
  lastRefreshed?: string;
  isTemplate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  widgetType: string;
  chartType?: string;
  description: string;
}

// 9.2.5 Scheduled Reports
export interface ScheduledReport {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  reportType: string;
  templateId?: string;
  format: 'pdf' | 'excel' | 'csv' | 'ppt';
  schedule: string;
  timezone: string;
  nextRunAt?: string;
  lastRunAt?: string;
  recipients: string[];
  ccRecipients: string[];
  includeComments: boolean;
  filters?: Record<string, unknown>;
  dateRange: string;
  customDateStart?: string;
  customDateEnd?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExecution {
  id: string;
  scheduledReportId: string;
  organizationId: string;
  executionTime: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  fileUrl?: string;
  fileSize?: number;
  pageCount?: number;
  recipientsSent: string[];
  deliveryStatus?: Record<string, unknown>;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
}

// 9.2.6 BI Export
export interface BIExportConfig {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  toolType: 'tableau' | 'looker' | 'powerbi' | 'google_datastudio';
  connectionType: 'direct' | 'api' | 'file_export';
  serverUrl?: string;
  apiKey?: string;
  credentials?: Record<string, unknown>;
  dataSources: string[];
  refreshSchedule?: string;
  lastExportAt?: string;
  connectionStatus: 'pending' | 'connected' | 'error';
  lastConnectionTest?: string;
  errorMessage?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BIExportLog {
  id: string;
  configId: string;
  organizationId: string;
  exportTime: string;
  status: 'started' | 'completed' | 'failed';
  exportType: 'full' | 'incremental';
  recordsExported?: number;
  duration?: number;
  fileSize?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// 9.2.7 Goal Tracking
export interface HiringGoal {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  goalType: 'hiring_count' | 'time_to_hire' | 'cost_per_hire' | 'diversity' | 'quality';
  targetValue: number;
  currentValue: number;
  unit: string;
  departmentId?: string;
  jobId?: string;
  recruiterId?: string;
  periodStart: string;
  periodEnd: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'exceeded' | 'completed';
  progress: number;
  milestones: Array<{
    name: string;
    date: string;
    target: number;
    actual?: number | null;
  }>;
  notifications?: Record<string, unknown>;
  createdBy: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  organizationId: string;
  recordDate: string;
  value: number;
  cumulativeValue: number;
  milestone?: string;
  note?: string;
  updatedBy?: string;
  createdAt: string;
}

// 9.2.8 Department/Team Views
export interface DepartmentView {
  id: string;
  organizationId: string;
  departmentId: string;
  departmentName: string;
  snapshotDate: string;
  periodStart: string;
  periodEnd: string;
  openPositions: number;
  activeApplicants: number;
  hiredThisPeriod: number;
  targetHires?: number;
  avgTimeToFill?: number;
  avgTimeToHire?: number;
  avgCostPerHire?: number;
  totalHiringBudget?: number;
  budgetUsed?: number;
  avgQualityScore?: number;
  offerAcceptRate?: number;
  retention90Days?: number;
  diversityScore?: number;
  pipelineHealth?: Record<string, number>;
  headcount?: number;
  attritionRate?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TeamHiringMetrics {
  id: string;
  organizationId: string;
  teamId: string;
  teamName: string;
  managerId?: string;
  managerName?: string;
  periodStart: string;
  periodEnd: string;
  positionsOpened: number;
  positionsFilled: number;
  positionsClosed: number;
  avgTimeToFill?: number;
  avgCostPerHire?: number;
  avgQualityScore?: number;
  fillRate?: number;
  interviewsPerHire?: number;
  offerAcceptRate?: number;
  hiringManagerSatisfaction?: number;
  candidateExperience?: number;
  trend?: string;
  ranking?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentComparison {
  departments: string[];
  metrics: Array<{
    metric: string;
    values: Record<string, number>;
  }>;
}

// ==========================================
// Batch 32: Market Intelligence Types (9.3.1-9.3.6)
// ==========================================

// 9.3.1 Salary Market Data
export interface SalaryMarketData {
  id: string;
  organizationId: string;
  jobTitle: string;
  jobFamily?: string;
  level?: string;
  location: string;
  country: string;
  region?: string;
  isRemote: boolean;
  currency: string;
  minSalary: number;
  maxSalary: number;
  medianSalary: number;
  percentile25?: number;
  percentile75?: number;
  percentile90?: number;
  bonusMin?: number;
  bonusMax?: number;
  bonusMedian?: number;
  equityMin?: number;
  equityMax?: number;
  equityMedian?: number;
  dataSource: string;
  sampleSize?: number;
  confidenceLevel?: number;
  effectiveDate: string;
  expiryDate?: string;
  industry?: string;
  companySize?: string;
  trendDirection?: string;
  trendPercentage?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryComparison {
  jobTitle: string;
  location: string;
  organizationSalary: {
    min: number;
    max: number;
    median: number;
  };
  marketSalary: {
    min: number;
    max: number;
    median: number;
  };
  variance: {
    minVariance: number;
    maxVariance: number;
    medianVariance: number;
  };
  competitiveness: string;
  recommendations: string[];
}

export interface SalaryTrend {
  jobTitle: string;
  location: string;
  period: string;
  dataPoints: Array<{
    month: string;
    median: number;
    change: number;
  }>;
  overallChange: number;
  averageMonthlyChange: number;
  forecast: {
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
}

// 9.3.2 Talent Pool Analysis
export interface TalentPoolAnalysis {
  id: string;
  organizationId: string;
  analysisName: string;
  analysisType: string;
  status: string;
  targetSkills?: string[];
  targetLocations?: string[];
  experienceRange?: { min: number; max: number };
  educationLevel?: string;
  totalCandidates?: number;
  qualifiedCandidates?: number;
  activeJobSeekers?: number;
  passiveCandidates?: number;
  skillDistribution?: Record<string, number>;
  locationDistribution?: Record<string, number>;
  experienceDistribution?: Record<string, number>;
  salaryDistribution?: Record<string, number>;
  availabilityScore?: number;
  competitionLevel?: string;
  avgTimeToHire?: number;
  recommendations?: string[];
  completedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// 9.3.3 Competitor Hiring Insights
export interface CompetitorInsight {
  id: string;
  organizationId: string;
  competitorName: string;
  competitorDomain?: string;
  industry?: string;
  companySize?: string;
  periodStart: string;
  periodEnd: string;
  totalJobPostings: number;
  activeJobPostings: number;
  closedJobPostings: number;
  engineeringJobs: number;
  salesJobs: number;
  marketingJobs: number;
  operationsJobs: number;
  otherJobs: number;
  avgPostingDuration?: number;
  hiringVelocity?: string;
  topSkills?: string[];
  emergingSkills?: string[];
  primaryLocations?: string[];
  remoteRatio?: number;
  avgSalaryRange?: { min: number; max: number; currency: string };
  growthTrend?: string;
  growthRate?: number;
  source?: string;
  lastUpdated: string;
  historicalData?: Array<{
    month: string;
    postings: number;
    hires: number;
  }>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// 9.3.4 Skills Demand Trends
export interface SkillDemandTrend {
  id: string;
  organizationId: string;
  skillName: string;
  skillCategory?: string;
  skillType?: string;
  periodStart: string;
  periodEnd: string;
  granularity: string;
  demandScore?: number;
  mentionCount: number;
  jobPostingCount: number;
  growthRate?: number;
  trendDirection?: string;
  velocityScore?: number;
  maturityLevel?: string;
  industryDemand?: Record<string, number>;
  locationDemand?: Record<string, number>;
  salaryPremium?: number;
  avgSalaryWithSkill?: number;
  relatedSkills?: string[];
  substitutes?: string[];
  forecastDemand?: Record<string, number>;
  confidenceScore?: number;
  source?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EmergingSkill {
  skillName: string;
  growthRate: number;
  demandScore: number;
  category: string;
}

export interface SkillForecast {
  skillName: string;
  currentDemandScore: number;
  forecast: Array<{
    period: string;
    demandScore: number;
    confidence: number;
  }>;
  factors: Array<{
    factor: string;
    impact: string;
    weight: number;
  }>;
  recommendations: string[];
}

// 9.3.5 Location Intelligence
export interface LocationIntelligence {
  id: string;
  organizationId: string;
  locationName: string;
  locationType: string;
  country: string;
  region?: string;
  timezone?: string;
  periodStart: string;
  periodEnd: string;
  totalTalentPool?: number;
  activeTalentPool?: number;
  talentDensity?: number;
  costOfLiving?: number;
  avgSalary?: number;
  salaryIndex?: number;
  remoteRatio?: number;
  hybridRatio?: number;
  onsiteRatio?: number;
  remoteGrowth?: number;
  competitorPresence?: number;
  hiringActivity?: string;
  talentDemand?: number;
  educationLevel?: Record<string, number>;
  experienceLevel?: Record<string, number>;
  skillAvailability?: Record<string, number>;
  unemploymentRate?: number;
  techJobGrowth?: number;
  startupActivity?: number;
  techInfrastructure?: number;
  connectivity?: number;
  recommendations?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LocationComparison {
  locations: string[];
  metrics: Array<{
    metric: string;
    [key: string]: string | number;
  }>;
  recommendation: string;
}

export interface RemoteWorkTrends {
  overallRemoteAdoption: number;
  hybridAdoption: number;
  onsiteOnly: number;
  yearOverYearChange: {
    remote: number;
    hybrid: number;
    onsite: number;
  };
  byRole: Record<string, { remote: number; hybrid: number; onsite: number }>;
  byCompanySize: Record<string, { remote: number; hybrid: number; onsite: number }>;
  forecast: Record<string, { remote: number; hybrid: number; onsite: number }>;
}

// 9.3.6 Industry Trends
export interface IndustryTrend {
  id: string;
  organizationId: string;
  industryName: string;
  industryCode?: string;
  subIndustry?: string;
  periodStart: string;
  periodEnd: string;
  totalHiring?: number;
  hiringGrowth?: number;
  hiringVelocity?: string;
  seasonality?: Record<string, number>;
  topRoles?: Array<{ role: string; percentage: number; growth: number }>;
  emergingRoles?: string[];
  decliningRoles?: string[];
  topSkills?: string[];
  emergingSkills?: string[];
  skillGaps?: string[];
  avgSalaryGrowth?: number;
  compensationTrends?: Record<string, unknown>;
  remoteAdoption?: number;
  hybridAdoption?: number;
  workModeShift?: Record<string, unknown>;
  marketSize?: number;
  marketGrowth?: number;
  investmentTrend?: Record<string, unknown>;
  talentFlow?: Record<string, unknown>;
  retentionTrends?: number;
  turnoverRate?: number;
  outlook?: string;
  predictions?: Record<string, unknown>;
  confidenceScore?: number;
  source?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface IndustryComparison {
  industries: string[];
  metrics: Array<{
    metric: string;
    [key: string]: string | number;
  }>;
  insights: string[];
}

export interface IndustryForecast {
  industryName: string;
  currentMetrics: {
    hiringGrowth: number;
    avgSalary: number;
    remoteAdoption: number;
  };
  forecast: Array<{
    period: string;
    hiringGrowth: number;
    avgSalaryGrowth: number;
    confidence: number;
  }>;
  keyDrivers: string[];
  risks: string[];
}

// Market Intelligence Dashboard
export interface MarketIntelligenceDashboard {
  snapshot: {
    date: string;
    marketHealthScore: number;
    salaryIndexChange: number;
    talentAvailabilityScore: number;
    competitorActivityScore: number;
    skillDemandShift: number;
  };
  topInsights: Array<{
    type: string;
    title: string;
    description: string;
    severity: string;
  }>;
  quickStats: {
    trackedCompetitors: number;
    salaryDataPoints: number;
    talentPoolAnalyses: number;
    skillsTracked: number;
    locationsMonitored: number;
  };
  recentActivity: Array<{
    action: string;
    target: string;
    time: string;
  }>;
}

export interface MarketSnapshot {
  id: string;
  organizationId: string;
  snapshotDate: string;
  snapshotType: string;
  salaryIndexChange?: number;
  talentAvailabilityScore?: number;
  competitorActivityScore?: number;
  skillDemandShift?: number;
  marketHealthScore?: number;
  topInsights?: string[];
  alerts?: Array<{ type: string; message: string }>;
  recommendations?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Batch 33: HR & Payroll Integrations Types (10.1.1-10.1.7)
// ==========================================

export interface HRIntegration {
  id: string;
  organizationId: string;
  name: string;
  provider: string;
  integrationType: string;
  connectionSettings?: Record<string, unknown>;
  authType: string;
  syncEnabled: boolean;
  syncFrequency: string;
  syncSchedule?: Record<string, unknown>;
  syncPositions: boolean;
  syncCandidates: boolean;
  syncHires: boolean;
  syncEmployees: boolean;
  fieldMapping?: Record<string, unknown>;
  statusMapping?: Record<string, unknown>;
  status: string;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  errorMessage?: string;
  errorCount: number;
  webhookEnabled: boolean;
  webhookUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface HRSyncLog {
  id: string;
  integrationId: string;
  syncType: string;
  direction: string;
  startedAt: string;
  completedAt?: string;
  status: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsFailed: number;
  errors?: Array<{ type: string; message: string; count: number }>;
  warnings?: Array<{ type: string; message: string; count: number }>;
  summary?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface HRProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  authTypes: string[];
  features: string[];
  complexity: string;
  setupTime: string;
}

// ==========================================
// Batch 34: Communication Platform Types (10.2.1-10.2.6)
// ==========================================

export interface CommunicationIntegration {
  id: string;
  organizationId: string;
  name: string;
  platform: string;
  integrationType: string;
  connectionSettings?: Record<string, unknown>;
  authType: string;
  workspaceId?: string;
  workspaceName?: string;
  defaultChannel?: string;
  notificationsEnabled: boolean;
  approvalsEnabled: boolean;
  messagingEnabled: boolean;
  threadingEnabled: boolean;
  notificationTypes?: string[];
  notificationChannels?: Record<string, string[]>;
  status: string;
  lastActivityAt?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  organizationId: string;
  name: string;
  templateType: string;
  platform?: string;
  eventType?: string;
  subject?: string;
  content: string;
  contentHtml?: string;
  variables?: string[];
  isActive: boolean;
  isDefault: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationPlatform {
  id: string;
  name: string;
  logo: string;
  description: string;
  authType: string;
  features: string[];
  setupTime: string;
  providers?: string[];
}

// ==========================================
// Batch 35: Job Boards & Sourcing Types (10.3.1-10.3.8)
// ==========================================

export interface JobBoardIntegration {
  id: string;
  organizationId: string;
  name: string;
  platform: string;
  platformSubtype?: string;
  connectionSettings?: Record<string, unknown>;
  authType: string;
  autoPostEnabled: boolean;
  postingRules?: Record<string, unknown>;
  defaultBudget?: number;
  applicationImport: boolean;
  applicationMapping?: Record<string, string>;
  deduplication: boolean;
  companyPageUrl?: string;
  brandingEnabled: boolean;
  status: string;
  lastSyncAt?: string;
  errorMessage?: string;
  totalPostings: number;
  activePostings: number;
  totalApplications: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface JobBoardPosting {
  id: string;
  integrationId: string;
  jobId: string;
  externalId?: string;
  externalUrl?: string;
  title: string;
  status: string;
  postedAt?: string;
  expiresAt?: string;
  isSponsored: boolean;
  budget?: number;
  budgetSpent?: number;
  impressions: number;
  clicks: number;
  applications: number;
  costPerApply?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface JobBoard {
  id: string;
  name: string;
  logo: string;
  description: string;
  authType: string;
  features: string[];
  pricing: string;
}

// ==========================================
// Batch 36: Developer Tools & API Types (10.4.1-10.4.8)
// ==========================================

export interface APIKey {
  id: string;
  organizationId: string;
  userId?: string;
  name: string;
  keyPrefix: string;
  keyValue?: string; // Only on creation
  scopes: string[];
  permissions?: Record<string, boolean>;
  rateLimit: number;
  rateLimitPeriod: string;
  allowedIPs?: string[];
  ipRestricted: boolean;
  isActive: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  description?: string;
  environment: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookConfig {
  id: string;
  organizationId: string;
  name: string;
  url: string;
  secret?: string; // Only on creation
  events: string[];
  eventFilters?: Record<string, unknown>;
  httpMethod: string;
  headers?: Record<string, string>;
  retryPolicy?: { maxRetries: number; retryInterval: number };
  timeout: number;
  isActive: boolean;
  lastTriggeredAt?: string;
  lastResponseCode?: number;
  failureCount: number;
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  eventId?: string;
  payload?: Record<string, unknown>;
  attemptNumber: number;
  requestUrl: string;
  requestHeaders?: Record<string, string>;
  requestBody?: string;
  responseCode?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  status: string;
  deliveredAt?: string;
  duration?: number;
  errorMessage?: string;
  nextRetryAt?: string;
  createdAt: string;
}

export interface AutomationIntegration {
  id: string;
  organizationId: string;
  name: string;
  platform: string;
  connectionId?: string;
  triggers?: Record<string, unknown>;
  triggerCount: number;
  actions?: Record<string, unknown>;
  actionCount: number;
  isActive: boolean;
  lastActivityAt?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface APIScope {
  name: string;
  description: string;
}

export interface APIEvent {
  name: string;
  description: string;
}

export interface DeveloperDashboard {
  organization: {
    name: string;
    plan: string;
    apiVersion: string;
  };
  apiKeys: {
    total: number;
    active: number;
    expired: number;
  };
  webhooks: {
    total: number;
    active: number;
    failureRate: number;
  };
  usage: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    rateLimit: number;
    rateLimitUsed: number;
  };
  recentActivity: Array<{
    type: string;
    endpoint?: string;
    event?: string;
    method?: string;
    status?: string;
    time: string;
  }>;
}

// ==========================================
// Batch 37-39: Workflow Automation Types (11.1-11.3)
// ==========================================

// Batch 37: Automation Engine
export interface WorkflowAutomation {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  description?: string;
  category?: string;
  triggerType: 'event' | 'schedule' | 'manual' | 'condition';
  triggerEvent?: string;
  triggerSchedule?: string;
  triggerConditions?: Record<string, unknown>;
  steps: WorkflowStep[];
  conditionalLogic?: Record<string, unknown>;
  delayEnabled: boolean;
  delayDuration?: number;
  delayType?: 'fixed' | 'business_hours' | 'smart';
  status: 'draft' | 'active' | 'paused' | 'archived';
  isActive: boolean;
  version: number;
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutedAt?: string;
  avgExecutionTime?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id?: string;
  action: string;
  params?: Record<string, unknown>;
  order?: number;
  configurable?: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  organizationId: string;
  triggeredBy: 'system' | 'user' | 'schedule' | 'event';
  triggerEvent?: string;
  triggerData?: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  currentStep: number;
  totalSteps: number;
  stepsCompleted: number;
  stepResults?: Record<string, unknown>;
  errorMessage?: string;
  errorStep?: number;
  retryCount: number;
  maxRetries: number;
  contextData?: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  useCase?: string;
  icon?: string;
  triggerType: string;
  triggerEvent?: string;
  steps: WorkflowStep[];
  conditionalLogic?: Record<string, unknown>;
  isPublic: boolean;
  isFeatured: boolean;
  usageCount: number;
  rating?: number;
  variables?: string[];
  requiredFields?: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledJob {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  description?: string;
  jobType: string;
  schedule: string;
  timezone: string;
  nextRunAt?: string;
  lastRunAt?: string;
  configuration?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  status: 'active' | 'paused' | 'disabled';
  isActive: boolean;
  runCount: number;
  successCount: number;
  failureCount: number;
  lastStatus?: string;
  lastError?: string;
  lastDuration?: number;
  retryOnFailure: boolean;
  maxRetries: number;
  retryDelay: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BulkAction {
  id: string;
  organizationId: string;
  createdBy: string;
  name?: string;
  actionType: string;
  targetType: string;
  targetIds: string[];
  totalCount: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  actionData: Record<string, unknown>;
  filters?: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  results?: Record<string, unknown>;
  errors?: Record<string, unknown>;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerEvent {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface WorkflowAction {
  id: string;
  name: string;
  category: string;
  params: string[];
}

// Batch 39: Approval Workflows
export interface ApprovalWorkflow {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  description?: string;
  workflowType: 'job_requisition' | 'offer_approval' | 'budget_approval' | 'exception_approval';
  steps: ApprovalStep[];
  escalationRules?: Record<string, unknown>;
  requireAllApprovers: boolean;
  allowParallelApproval: boolean;
  autoApproveOnTimeout: boolean;
  timeoutHours?: number;
  delegationEnabled: boolean;
  delegationRules?: Record<string, unknown>;
  isActive: boolean;
  version: number;
  avgApprovalTime?: number;
  approvalRate?: number;
  totalRequests: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  step: number;
  name: string;
  approverType: 'user' | 'role' | 'department' | 'manager';
  approverId?: string;
  approverRole?: string;
  condition?: string;
}

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  organizationId: string;
  requestedBy: string;
  requestedByName?: string;
  requestType: string;
  title: string;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  requestData: Record<string, unknown>;
  attachments?: Record<string, unknown>;
  currentStep: number;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'cancelled';
  approvalSteps: ApprovalStepStatus[];
  approvedBy: string[];
  rejectedBy?: string;
  submittedAt: string;
  dueDate?: string;
  decidedAt?: string;
  decision?: 'approved' | 'rejected';
  decisionNotes?: string;
  conditions?: Record<string, unknown>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isEscalated: boolean;
  escalatedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStepStatus {
  step: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'delegated';
  approver?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ApprovalAnalytics {
  summary: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    avgApprovalTime: number;
    approvalRate: number;
  };
  byWorkflowType: Array<{
    type: string;
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    avgTime: number;
  }>;
  bottlenecks: Array<{
    step: string;
    avgWaitTime: number;
    pendingCount: number;
  }>;
  trends: {
    daily: Array<{
      date: string;
      submitted: number;
      completed: number;
    }>;
  };
}

export interface AutomationDashboard {
  workflowAutomations: {
    total: number;
    active: number;
    paused: number;
    draft: number;
    executionsToday: number;
    successRate: number;
  };
  scheduledJobs: {
    total: number;
    active: number;
    paused: number;
    nextRunIn: number;
    jobsRunToday: number;
  };
  bulkActions: {
    inProgress: number;
    completedToday: number;
    recordsProcessedToday: number;
  };
  approvalWorkflows: {
    total: number;
    active: number;
    pendingApprovals: number;
    urgentApprovals: number;
    avgApprovalTime: number;
  };
  recentExecutions: Array<{
    id: string;
    workflowName: string;
    status: string;
    time: string;
  }>;
  recentApprovals: Array<{
    id: string;
    title: string;
    status: string;
    requester: string;
  }>;
}

// ==========================================
// Batch 40-42: Mobile & Accessibility Types (12.1-12.3)
// ==========================================

// Batch 40: Mobile Applications
export interface MobileDevice {
  id: string;
  userId: string;
  organizationId: string;
  deviceId: string;
  platform: 'ios' | 'android';
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  pushToken?: string;
  pushEnabled: boolean;
  pushCategories: string[];
  biometricEnabled: boolean;
  biometricType?: 'face_id' | 'touch_id' | 'fingerprint';
  isActive: boolean;
  lastActiveAt?: string;
  registeredAt: string;
  deviceTrusted: boolean;
  trustedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PushNotification {
  id: string;
  userId: string;
  deviceId?: string;
  organizationId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  notificationType: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  category?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  failureReason?: string;
  scheduledFor?: string;
  expiresAt?: string;
  clickedAt?: string;
  actionTaken?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MobileAppConfig {
  id: string;
  organizationId?: string;
  platform: string;
  minVersion?: string;
  currentVersion?: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  features?: Record<string, boolean>;
  featureFlags?: Record<string, boolean>;
  deepLinkScheme?: string;
  universalLinks?: Record<string, unknown>;
  offlineEnabled: boolean;
  offlineCacheDays: number;
  offlineFeatures: string[];
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OfflineSyncItem {
  id: string;
  userId: string;
  deviceId: string;
  entityType: string;
  entityId?: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  syncAttempts: number;
  lastAttemptAt?: string;
  syncedAt?: string;
  errorMessage?: string;
  hasConflict: boolean;
  conflictData?: Record<string, unknown>;
  resolution?: 'client_wins' | 'server_wins' | 'merged';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// Batch 41: PWA
export interface PWAConfig {
  id: string;
  organizationId?: string;
  appName: string;
  shortName?: string;
  description?: string;
  themeColor: string;
  backgroundColor: string;
  icons?: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
  swVersion?: string;
  cacheVersion?: string;
  cacheStrategies?: Record<string, string>;
  pushEnabled: boolean;
  vapidPublicKey?: string;
  installPromptEnabled: boolean;
  installBannerDelay: number;
  offlinePageUrl?: string;
  offlineFallbacks?: Record<string, string>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WebPushSubscription {
  id: string;
  userId: string;
  organizationId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  browserName?: string;
  browserVersion?: string;
  userAgent?: string;
  isActive: boolean;
  categories: string[];
  lastNotifiedAt?: string;
  totalSent: number;
  totalDelivered: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceWorkerStatus {
  version: string;
  cacheVersion: string;
  isActive: boolean;
  registeredAt: string;
  lastUpdated: string;
  cacheSize: number;
  cachedRoutes: string[];
  pendingUpdates: boolean;
}

// Batch 42: Accessibility
export interface AccessibilitySettings {
  id: string;
  userId: string;
  organizationId: string;
  // Visual
  highContrast: boolean;
  colorScheme: 'light' | 'dark' | 'system' | 'high_contrast';
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  fontFamily: 'system' | 'dyslexic-friendly' | 'monospace';
  reducedMotion: boolean;
  underlineLinks: boolean;
  // Reading
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  letterSpacing: 'tight' | 'normal' | 'wide';
  textAlignment: 'left' | 'justified';
  // Navigation
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  skipLinks: boolean;
  // Screen reader
  screenReaderOptimized: boolean;
  verboseLabels: boolean;
  announceImages: boolean;
  // Timing
  extendedTimeouts: boolean;
  autoPlayMedia: boolean;
  carouselAutoPlay: boolean;
  // Audio
  soundEnabled: boolean;
  soundVolume: number;
  speechRate: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AccessibilityPreset {
  id: string;
  name: string;
  description: string;
  settings: Partial<AccessibilitySettings>;
}

export interface AccessibilityAudit {
  id: string;
  organizationId: string;
  pageUrl: string;
  pageTitle?: string;
  auditDate: string;
  standard: 'WCAG20A' | 'WCAG20AA' | 'WCAG21A' | 'WCAG21AA' | 'WCAG21AAA';
  score: number;
  passedRules: number;
  failedRules: number;
  warningRules: number;
  manualReviewRules: number;
  issues: AccessibilityIssue[];
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  auditTool?: string;
  toolVersion?: string;
  remediationNotes?: string;
  fixedIssuesCount: number;
  lastFixedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AccessibilityIssue {
  id: string;
  rule: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  message: string;
  helpUrl?: string;
}

export interface MobileAccessibilityDashboard {
  mobile: {
    registeredDevices: number;
    activeDevices: number;
    iosDevices: number;
    androidDevices: number;
    pushEnabled: number;
    biometricEnabled: number;
    appVersion: string;
    updateRequired: number;
  };
  pwa: {
    installations: number;
    activeUsers: number;
    pushSubscriptions: number;
    offlineUsage: number;
    cacheHitRate: number;
  };
  accessibility: {
    overallScore: number;
    wcagCompliance: string;
    issuesOpen: number;
    usersWithSettings: number;
    highContrastUsers: number;
    screenReaderUsers: number;
  };
  notifications: {
    sentToday: number;
    deliveryRate: number;
    clickRate: number;
    byType: Record<string, number>;
  };
}

// ==========================================
// Batch 43-45: Enterprise Administration Types (13.1-13.3)
// ==========================================

// Batch 43: Multi-Tenant & Organization (13.1)
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  plan: 'starter' | 'professional' | 'enterprise' | 'custom';
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  maxUsers: number;
  maxJobs: number;
  storageLimit: number;
  dataRegion: string;
  settings?: TenantSettings;
  features?: TenantFeatures;
  createdAt: string;
  updatedAt?: string;
}

export interface TenantSettings {
  sso?: boolean;
  mfa?: boolean;
  ipWhitelist?: string[];
  customDomain?: boolean;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface TenantFeatures {
  ai: boolean;
  analytics: boolean;
  api: boolean;
  customIntegrations: boolean;
  advancedReporting: boolean;
  dedicatedSupport: boolean;
}

export interface Organization {
  id: string;
  tenantId: string;
  parentId?: string;
  name: string;
  type: 'company' | 'division' | 'department' | 'team' | 'branch';
  code?: string;
  isActive: boolean;
  level: number;
  headId?: string;
  headName?: string;
  children?: Organization[];
  createdAt?: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  organizationId?: string;
  managerId?: string;
  annualBudget: number;
  currentSpend: number;
  currency: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  headId?: string;
  headName?: string;
  level: number;
  employeeCount?: number;
  isActive: boolean;
}

// Batch 44: User & License Management (13.2)
export interface License {
  id: string;
  name: string;
  licenseType: 'seat' | 'feature' | 'usage' | 'module';
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
  pricePerSeat?: number;
  features?: string[];
  validFrom?: string;
  validUntil?: string;
  autoRenew: boolean;
  isActive: boolean;
}

export interface LicenseAllocation {
  id: string;
  licenseId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  allocatedAt: string;
  allocatedBy: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | 'viewer' | 'custom';
  permissions: string[];
  dataAccess: 'all' | 'organization' | 'team' | 'own';
  isSystem: boolean;
  isDefault?: boolean;
  userCount?: number;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  baseTemplateId?: string;
  permissions: string[];
  restrictions?: string[];
  dataAccess: 'all' | 'organization' | 'team' | 'own';
  userCount: number;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface AccessReview {
  id: string;
  name: string;
  description?: string;
  reviewType: 'periodic' | 'triggered' | 'certification';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scope: 'all_users' | 'role' | 'department' | 'custom';
  reviewerId: string;
  reviewerName?: string;
  totalItems: number;
  reviewedItems: number;
  approvedItems?: number;
  revokedItems?: number;
  dueDate: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'blocked';
  timestamp: string;
}

// Batch 45: Billing & Subscriptions (13.3)
export interface Subscription {
  id: string;
  tenantId: string;
  planName: string;
  planTier: 'starter' | 'professional' | 'enterprise' | 'custom';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'paused';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  cancelReason?: string;
  trialEndsAt?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'invoice';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  subtotal: number;
  tax: number;
  total: number;
  amountDue: number;
  amountPaid: number;
  currency: string;
  invoiceDate: string;
  dueDate?: string;
  paidAt?: string;
  pdfUrl?: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  period?: { start: string; end: string };
}

export interface UsageRecord {
  id?: string;
  metricName: string;
  metricValue: number;
  unit: string;
  limit?: number;
  percentUsed?: number;
  periodStart?: string;
  periodEnd?: string;
  recordedAt?: string;
}

export interface Quota {
  id?: string;
  quotaType: string;
  quotaLimit: number;
  currentUsage: number;
  unit: string;
  percentUsed?: number;
  resetDate?: string;
  warningThreshold?: number;
  isExceeded?: boolean;
}

export interface EnterpriseContract {
  id: string;
  contractNumber: string;
  name: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  contractValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  terms?: string;
  signedBy?: string;
  signedAt?: string;
  documentUrl?: string;
  createdAt: string;
}

export interface AdminDashboard {
  tenant: {
    name: string;
    plan: string;
    status: string;
  };
  users: {
    total: number;
    active: number;
    admins: number;
    pendingInvites: number;
  };
  licenses: {
    total: number;
    used: number;
    available: number;
  };
  billing: {
    currentPlan: string;
    mrr: number;
    nextInvoice: string;
    paymentStatus: string;
  };
  usage: {
    jobsPosted: number;
    candidatesProcessed: number;
    storageUsed: number;
    apiCalls: number;
  };
  recentActivity: Array<{
    action: string;
    user: string;
    time: string;
  }>;
}
