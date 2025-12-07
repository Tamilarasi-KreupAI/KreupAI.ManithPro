// ============================================================
// APPLICATION SCHEMAS - Application validation schemas
// ============================================================

import { z } from 'zod';

// Application Status enum
const applicationStatusEnum = z.enum([
  'PENDING',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'REJECTED',
  'ACCEPTED',
  'WITHDRAWN',
]);

// File validation helper
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// ============================================
// Application Create Schema
// ============================================
export const applicationCreateSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  resume: z
    .any()
    .refine((file) => file instanceof File, 'Resume is required')
    .refine(
      (file) => file instanceof File && file.size <= MAX_FILE_SIZE,
      'Resume must be less than 5MB'
    )
    .refine(
      (file) => file instanceof File && ACCEPTED_FILE_TYPES.includes(file.type),
      'Resume must be a PDF or Word document'
    ),
  coverLetter: z
    .string()
    .max(5000, 'Cover letter must be less than 5000 characters')
    .optional(),
  additionalDocuments: z
    .array(z.any())
    .optional(),
  customAnswers: z.record(z.string()).optional(),
  referralSource: z.string().optional(),
});

export type ApplicationCreateFormData = z.infer<typeof applicationCreateSchema>;

// ============================================
// Application Update Schema (Recruiter)
// ============================================
export const applicationUpdateSchema = z.object({
  status: applicationStatusEnum.optional(),
  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),
  tags: z.array(z.string()).optional(),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  assigneeId: z.string().optional(),
});

export type ApplicationUpdateFormData = z.infer<typeof applicationUpdateSchema>;

// ============================================
// Application Filter Schema
// ============================================
export const applicationFilterSchema = z.object({
  search: z.string().optional(),
  status: z.array(applicationStatusEnum).optional(),
  jobId: z.string().optional(),
  candidateId: z.string().optional(),
  appliedAfter: z.string().optional(),
  appliedBefore: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  assigneeId: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  sortBy: z.enum(['appliedAt', 'status', 'rating', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type ApplicationFilterFormData = z.infer<typeof applicationFilterSchema>;

// ============================================
// Bulk Action Schema
// ============================================
export const bulkActionSchema = z.object({
  applicationIds: z
    .array(z.string())
    .min(1, 'At least one application must be selected'),
  action: z.enum([
    'update_status',
    'add_tag',
    'remove_tag',
    'assign',
    'archive',
    'delete',
  ]),
  payload: z.object({
    status: applicationStatusEnum.optional(),
    tag: z.string().optional(),
    assigneeId: z.string().optional(),
  }).optional(),
});

export type BulkActionFormData = z.infer<typeof bulkActionSchema>;

// ============================================
// Move Pipeline Stage Schema
// ============================================
export const movePipelineStageSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  newStatus: applicationStatusEnum,
  notes: z.string().optional(),
  sendNotification: z.boolean().optional().default(true),
});

export type MovePipelineStageFormData = z.infer<typeof movePipelineStageSchema>;

// ============================================
// Application Note Schema
// ============================================
export const applicationNoteSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  content: z
    .string()
    .min(1, 'Note content is required')
    .max(2000, 'Note must be less than 2000 characters'),
  isPrivate: z.boolean().optional().default(false),
  mentions: z.array(z.string()).optional(),
});

export type ApplicationNoteFormData = z.infer<typeof applicationNoteSchema>;

// ============================================
// Rejection Reason Schema
// ============================================
export const rejectionReasonSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  reason: z.enum([
    'not_qualified',
    'experience_mismatch',
    'culture_fit',
    'salary_expectations',
    'position_filled',
    'other',
  ]),
  customReason: z.string().optional(),
  sendEmail: z.boolean().optional().default(true),
  emailTemplate: z.string().optional(),
});

export type RejectionReasonFormData = z.infer<typeof rejectionReasonSchema>;
