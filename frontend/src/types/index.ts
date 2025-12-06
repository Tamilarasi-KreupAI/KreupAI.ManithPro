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
