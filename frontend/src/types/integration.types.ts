// ============================================================
// INTEGRATION TYPES - External platform integrations
// ============================================================

import {
  IntegrationStatus,
  DesignPlatformType,
  BlogPlatformType,
  CodingPlatformType,
  OnlineCoursePlatform,
  AcademicPlatform,
  KaggleTier,
  VerificationStatus,
  TimestampedRecord,
  DisplayOrderable,
} from './common.types';

// ============================================
// GitHub Integration
// ============================================

export interface GithubProfile extends TimestampedRecord {
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
  recentActivity?: unknown[];
  contributionGraph?: unknown;
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  connectedAt: string;
  repositories?: GithubRepository[];
}

export interface GithubRepository extends TimestampedRecord, DisplayOrderable {
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
  pushedAt?: string;
}

// ============================================
// LinkedIn Integration
// ============================================

export interface LinkedInProfile extends TimestampedRecord {
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
  recommendations?: unknown[];
  honors?: unknown[];
  publications?: unknown[];
  patents?: unknown[];
  courses?: unknown[];
  projects?: unknown[];
  volunteerExperiences?: unknown[];
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

// ============================================
// Stack Overflow Integration
// ============================================

export interface StackOverflowProfile extends TimestampedRecord {
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

// ============================================
// GitLab Integration
// ============================================

export interface GitLabProfile extends TimestampedRecord {
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
  contributionGraph?: unknown;
  topLanguages?: GitLabLanguage[];
  projects?: GitLabProject[];
  groups?: GitLabGroup[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  connectedAt: string;
}

export interface GitLabLanguage {
  name: string;
  percentage: number;
  bytes: number;
}

export interface GitLabProject extends TimestampedRecord, DisplayOrderable {
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
  isArchived: boolean;
  isForked: boolean;
  isMirror: boolean;
  role?: 'owner' | 'maintainer' | 'developer' | 'reporter' | 'guest';
  isShowcased: boolean;
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

// ============================================
// Design Portfolio (Behance/Dribbble)
// ============================================

export interface DesignPortfolio extends TimestampedRecord {
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
}

export interface DesignProject extends DisplayOrderable {
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
}

export interface DesignProjectImage {
  url: string;
  width: number;
  height: number;
  caption?: string;
}

// ============================================
// Blog Platform (Medium/Dev.to/Hashnode)
// ============================================

export interface BlogPlatform extends TimestampedRecord {
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
}

export interface BlogTag {
  name: string;
  count: number;
}

export interface BlogPost extends DisplayOrderable {
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
// Kaggle Integration
// ============================================

export interface KaggleProfile extends TimestampedRecord {
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
  achievements?: unknown[];
  topCompetitions?: KaggleCompetition[];
  featuredNotebooks?: KaggleNotebook[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  showOnProfile: boolean;
  connectedAt: string;
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

// ============================================
// Coding Platform (LeetCode/HackerRank)
// ============================================

export interface CodingPlatformProfile extends TimestampedRecord {
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
  recentSubmissions?: CodingSubmission[];
  contestHistory?: CodingContest[];
  hackerRankCertificates?: CodingCertificate[];
  status: IntegrationStatus;
  lastSyncAt?: string;
  syncError?: string;
  autoSync: boolean;
  showOnProfile: boolean;
  connectedAt: string;
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

export interface CodingSubmission {
  id: string;
  problemTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  runtime: string;
  memory: string;
  submittedAt: string;
}

export interface CodingContest {
  id: string;
  name: string;
  rank: number;
  totalParticipants: number;
  rating?: number;
  ratingChange?: number;
  date: string;
}

export interface CodingCertificate {
  id: string;
  name: string;
  skill: string;
  level?: string;
  url: string;
  earnedAt: string;
}

// ============================================
// Online Courses
// ============================================

export interface OnlineCourseProfile extends TimestampedRecord {
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
}

export interface Specialization {
  id: string;
  name: string;
  provider: string;
  completedAt: string;
  certificateUrl?: string;
}

export interface OnlineCourse extends DisplayOrderable {
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
}

// ============================================
// Academic Profile
// ============================================

export interface AcademicProfile extends TimestampedRecord {
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
}

export interface CoAuthor {
  name: string;
  affiliation?: string;
  collaborations: number;
  profileUrl?: string;
}

export interface Publication extends DisplayOrderable {
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
  publishedAt?: string;
}

// ============================================
// Integration Status Response
// ============================================

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
  stackoverflow?: {
    connected: boolean;
    id?: string;
    displayName?: string;
    reputation?: number;
    status?: IntegrationStatus;
    lastSyncAt?: string;
    syncError?: string;
  };
  gitlab?: {
    connected: boolean;
    id?: string;
    username?: string;
    status?: IntegrationStatus;
    lastSyncAt?: string;
    syncError?: string;
  };
}
