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
