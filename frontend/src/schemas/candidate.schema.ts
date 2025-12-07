// ============================================================
// CANDIDATE SCHEMAS - Candidate profile validation schemas
// ============================================================

import { z } from 'zod';

// Skill proficiency levels
const skillProficiencyEnum = z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);

// Employment types
const employmentTypeEnum = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'APPRENTICESHIP', 'SELF_EMPLOYED']);

// Remote preference
const remotePreferenceEnum = z.enum(['remote', 'hybrid', 'onsite', 'flexible']);

// ============================================
// Profile Basic Info Schema
// ============================================
export const profileBasicInfoSchema = z.object({
  headline: z
    .string()
    .max(150, 'Headline must be less than 150 characters')
    .optional(),
  summary: z
    .string()
    .max(2000, 'Summary must be less than 2000 characters')
    .optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  preferredLocation: z.array(z.string()).optional(),
  willingToRelocate: z.boolean().optional(),
  remotePreference: remotePreferenceEnum.optional(),
  expectedSalary: z.number().positive().optional().nullable(),
  expectedSalaryCurrency: z.string().length(3).optional(),
  noticePeriod: z.string().optional(),
  availableFrom: z.string().optional(),
  jobTypes: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
  showSalaryExpectation: z.boolean().optional(),
});

export type ProfileBasicInfoFormData = z.infer<typeof profileBasicInfoSchema>;

// ============================================
// Work Experience Schema
// ============================================
export const workExperienceSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),
  companyWebsite: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(100, 'Job title must be less than 100 characters'),
  employmentType: employmentTypeEnum,
  department: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().optional().default(false),
  startDate: z
    .string()
    .min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional().default(false),
  description: z
    .string()
    .max(3000, 'Description must be less than 3000 characters')
    .optional(),
  responsibilities: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
  technologies: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    if (!data.isCurrent && !data.endDate) {
      return false;
    }
    return true;
  },
  {
    message: 'End date is required for past positions',
    path: ['endDate'],
  }
).refine(
  (data) => {
    if (data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      return false;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;

// ============================================
// Education Schema
// ============================================
export const educationSchema = z.object({
  institutionName: z
    .string()
    .min(1, 'Institution name is required')
    .max(150, 'Institution name must be less than 150 characters'),
  institutionWebsite: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  institutionType: z.enum(['university', 'college', 'online', 'bootcamp']).optional(),
  degree: z
    .string()
    .min(1, 'Degree is required')
    .max(100, 'Degree must be less than 100 characters'),
  fieldOfStudy: z
    .string()
    .min(1, 'Field of study is required')
    .max(100, 'Field of study must be less than 100 characters'),
  specialization: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isOngoing: z.boolean().optional().default(false),
  grade: z.string().optional(),
  gradeScale: z.string().optional(),
  activities: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
  thesis: z.string().optional(),
  thesisDescription: z.string().optional(),
}).refine(
  (data) => {
    if (!data.isOngoing && !data.endDate) {
      return false;
    }
    return true;
  },
  {
    message: 'End date is required for completed education',
    path: ['endDate'],
  }
);

export type EducationFormData = z.infer<typeof educationSchema>;

// ============================================
// Certification Schema
// ============================================
export const certificationSchema = z.object({
  name: z
    .string()
    .min(1, 'Certification name is required')
    .max(150, 'Certification name must be less than 150 characters'),
  issuingOrganization: z
    .string()
    .min(1, 'Issuing organization is required')
    .max(100, 'Issuing organization must be less than 100 characters'),
  credentialId: z.string().optional(),
  credentialUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  issueDate: z.string().min(1, 'Issue date is required'),
  expirationDate: z.string().optional(),
  doesNotExpire: z.boolean().optional().default(false),
  description: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    if (!data.doesNotExpire && data.expirationDate && new Date(data.expirationDate) < new Date(data.issueDate)) {
      return false;
    }
    return true;
  },
  {
    message: 'Expiration date must be after issue date',
    path: ['expirationDate'],
  }
);

export type CertificationFormData = z.infer<typeof certificationSchema>;

// ============================================
// Skill Schema
// ============================================
export const skillSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name is required')
    .max(50, 'Skill name must be less than 50 characters'),
  category: z.string().optional(),
  proficiencyLevel: z.number().int().min(1).max(5),
  proficiencyLabel: skillProficiencyEnum,
  yearsOfExperience: z.number().min(0).optional(),
  lastUsed: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});

export type SkillFormData = z.infer<typeof skillSchema>;

// ============================================
// Project Schema
// ============================================
export const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(100, 'Project title must be less than 100 characters'),
  shortDescription: z
    .string()
    .max(200, 'Short description must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  projectType: z.enum(['personal', 'professional', 'open-source', 'freelance', 'academic']).optional(),
  status: z.enum(['completed', 'in-progress', 'on-hold', 'archived']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isOngoing: z.boolean().optional().default(false),
  technologies: z.array(z.string()).optional().default([]),
  frameworks: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  tools: z.array(z.string()).optional().default([]),
  repositoryUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  liveUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  demoUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  role: z.string().optional(),
  teamSize: z.number().int().positive().optional(),
  contributions: z.array(z.string()).optional().default([]),
  impact: z.string().optional(),
  isPublic: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// ============================================
// Social Links Schema
// ============================================
export const socialLinksSchema = z.object({
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  github: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.includes('github.com'),
      'Please enter a valid GitHub URL'
    ),
  linkedin: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.includes('linkedin.com'),
      'Please enter a valid LinkedIn URL'
    ),
  twitter: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.includes('twitter.com') || val.includes('x.com'),
      'Please enter a valid Twitter/X URL'
    ),
  stackoverflow: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.includes('stackoverflow.com'),
      'Please enter a valid Stack Overflow URL'
    ),
  dribbble: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.includes('dribbble.com'),
      'Please enter a valid Dribbble URL'
    ),
  behance: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.includes('behance.net'),
      'Please enter a valid Behance URL'
    ),
  medium: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.includes('medium.com'),
      'Please enter a valid Medium URL'
    ),
  kaggle: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.includes('kaggle.com'),
      'Please enter a valid Kaggle URL'
    ),
});

export type SocialLinksFormData = z.infer<typeof socialLinksSchema>;
