// ============================================================
// JOB SCHEMAS - Job posting validation schemas
// ============================================================

import { z } from 'zod';

// Job Type enum
const jobTypeEnum = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']);

// Job Status enum
const jobStatusEnum = z.enum(['OPEN', 'CLOSED', 'DRAFT']);

// ============================================
// Job Create/Edit Schema
// ============================================
export const jobSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .min(3, 'Job title must be at least 3 characters')
    .max(100, 'Job title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Job description is required')
    .min(50, 'Job description must be at least 50 characters')
    .max(10000, 'Job description must be less than 10000 characters'),
  requirements: z
    .array(z.string().min(1, 'Requirement cannot be empty'))
    .min(1, 'At least one requirement is required'),
  responsibilities: z
    .array(z.string().min(1, 'Responsibility cannot be empty'))
    .min(1, 'At least one responsibility is required'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(100, 'Location must be less than 100 characters'),
  type: jobTypeEnum,
  salaryMin: z
    .number()
    .min(0, 'Minimum salary must be positive')
    .optional()
    .nullable(),
  salaryMax: z
    .number()
    .min(0, 'Maximum salary must be positive')
    .optional()
    .nullable(),
  benefits: z
    .array(z.string())
    .optional()
    .default([]),
  skills: z
    .array(z.string().min(1, 'Skill cannot be empty'))
    .min(1, 'At least one skill is required'),
  experience: z
    .string()
    .optional(),
  education: z
    .string()
    .optional(),
  positions: z
    .number()
    .int('Positions must be a whole number')
    .min(1, 'At least 1 position is required')
    .default(1),
  deadline: z
    .string()
    .optional()
    .refine(
      (val) => !val || new Date(val) > new Date(),
      'Deadline must be in the future'
    ),
  status: jobStatusEnum.optional().default('DRAFT'),
}).refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax'],
  }
);

export type JobFormData = z.infer<typeof jobSchema>;

// ============================================
// Job Filter Schema
// ============================================
export const jobFilterSchema = z.object({
  search: z.string().optional(),
  status: z.array(jobStatusEnum).optional(),
  type: z.array(jobTypeEnum).optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  postedAfter: z.string().optional(),
  postedBefore: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'applications', 'deadline']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type JobFilterFormData = z.infer<typeof jobFilterSchema>;

// ============================================
// Job Search Schema
// ============================================
export const jobSearchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  type: z.array(jobTypeEnum).optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  experience: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export type JobSearchFormData = z.infer<typeof jobSearchSchema>;

// ============================================
// Quick Apply Schema
// ============================================
export const quickApplySchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  coverLetter: z
    .string()
    .max(2000, 'Cover letter must be less than 2000 characters')
    .optional(),
  customAnswers: z.record(z.string()).optional(),
});

export type QuickApplyFormData = z.infer<typeof quickApplySchema>;
