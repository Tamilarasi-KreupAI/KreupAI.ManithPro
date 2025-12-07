// ============================================================
// CANDIDATE TYPES - Candidate profiles, skills, experience
// ============================================================

import {
  VerificationStatus,
  SkillProficiencyLevel,
  EmploymentType,
  TimestampedRecord,
  DisplayOrderable,
} from './common.types';

// Candidate Profile
export interface CandidateProfile extends TimestampedRecord {
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

// Work Experience
export interface WorkExperience extends TimestampedRecord, DisplayOrderable {
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
}

// Education
export interface Education extends TimestampedRecord, DisplayOrderable {
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
}

// Certification
export interface Certification extends TimestampedRecord, DisplayOrderable {
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
}

// Candidate Skill
export interface CandidateSkill extends TimestampedRecord, DisplayOrderable {
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

  // Display
  isPrimary: boolean;

  // Relations
  endorsements?: SkillEndorsement[];
}

// Skill Endorsement
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

  createdAt: string;
}

// Project
export interface Project extends TimestampedRecord, DisplayOrderable {
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
}

// Achievement
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

// Custom Portfolio Link
export interface CustomPortfolioLink extends TimestampedRecord, DisplayOrderable {
  id: string;
  profileId: string;
  title: string;
  url: string;
  description?: string;
  linkType?: 'portfolio' | 'project' | 'blog' | 'social' | 'video' | 'document' | 'other';
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
  isVerified: boolean;
  verifiedAt?: string;
  lastCheckedAt?: string;
  isAccessible: boolean;
}
