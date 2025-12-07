// ============================================================
// INTERVIEW SCHEMAS - Interview scheduling validation schemas
// ============================================================

import { z } from 'zod';

// Interview Type enum
const interviewTypeEnum = z.enum([
  'PHONE_SCREEN',
  'VIDEO',
  'TECHNICAL',
  'BEHAVIORAL',
  'PANEL',
  'ONSITE',
  'FINAL',
]);

// Recommendation enum
const recommendationEnum = z.enum([
  'strong_hire',
  'hire',
  'no_hire',
  'strong_no_hire',
  'undecided',
]);

// ============================================
// Schedule Interview Schema
// ============================================
export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  type: interviewTypeEnum,
  scheduledAt: z
    .string()
    .min(1, 'Date and time is required')
    .refine(
      (val) => new Date(val) > new Date(),
      'Interview must be scheduled in the future'
    ),
  duration: z
    .number()
    .int()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  timezone: z.string().min(1, 'Timezone is required'),
  interviewerIds: z
    .array(z.string())
    .min(1, 'At least one interviewer is required'),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  sendInvite: z.boolean().optional().default(true),
  includeCalendarInvite: z.boolean().optional().default(true),
  reminderMinutes: z.number().int().optional(),
});

export type ScheduleInterviewFormData = z.infer<typeof scheduleInterviewSchema>;

// ============================================
// Reschedule Interview Schema
// ============================================
export const rescheduleInterviewSchema = z.object({
  interviewId: z.string().min(1, 'Interview ID is required'),
  scheduledAt: z
    .string()
    .min(1, 'New date and time is required')
    .refine(
      (val) => new Date(val) > new Date(),
      'Interview must be scheduled in the future'
    ),
  duration: z.number().int().min(15).max(480).optional(),
  reason: z.string().optional(),
  notifyParticipants: z.boolean().optional().default(true),
});

export type RescheduleInterviewFormData = z.infer<typeof rescheduleInterviewSchema>;

// ============================================
// Cancel Interview Schema
// ============================================
export const cancelInterviewSchema = z.object({
  interviewId: z.string().min(1, 'Interview ID is required'),
  reason: z.string().min(1, 'Cancellation reason is required'),
  notifyParticipants: z.boolean().optional().default(true),
  reschedule: z.boolean().optional().default(false),
});

export type CancelInterviewFormData = z.infer<typeof cancelInterviewSchema>;

// ============================================
// Interview Feedback Schema
// ============================================
export const interviewFeedbackSchema = z.object({
  interviewId: z.string().min(1, 'Interview ID is required'),
  overallRating: z
    .number()
    .int()
    .min(1, 'Rating is required')
    .max(5, 'Rating cannot exceed 5'),
  recommendation: recommendationEnum,
  strengths: z
    .string()
    .max(2000, 'Strengths must be less than 2000 characters')
    .optional(),
  weaknesses: z
    .string()
    .max(2000, 'Weaknesses must be less than 2000 characters')
    .optional(),
  notes: z
    .string()
    .max(3000, 'Notes must be less than 3000 characters')
    .optional(),
  skillRatings: z.record(z.number().int().min(1).max(5)).optional(),
  wouldWorkWith: z.boolean().optional(),
  cultureFit: z.number().int().min(1).max(5).optional(),
  technicalSkills: z.number().int().min(1).max(5).optional(),
  communicationSkills: z.number().int().min(1).max(5).optional(),
  problemSolving: z.number().int().min(1).max(5).optional(),
});

export type InterviewFeedbackFormData = z.infer<typeof interviewFeedbackSchema>;

// ============================================
// Scorecard Schema
// ============================================
export const scorecardSchema = z.object({
  interviewId: z.string().min(1, 'Interview ID is required'),
  templateId: z.string().optional(),
  sections: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      criteria: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          rating: z.number().int().min(1).max(5).optional(),
          notes: z.string().optional(),
        })
      ),
    })
  ),
  totalScore: z.number().optional(),
  overallNotes: z.string().optional(),
});

export type ScorecardFormData = z.infer<typeof scorecardSchema>;

// ============================================
// Availability Schema
// ============================================
export const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  timezone: z.string().min(1, 'Timezone is required'),
  isRecurring: z.boolean().optional().default(true),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
}).refine(
  (data) => {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    return endHour * 60 + endMin > startHour * 60 + startMin;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export type AvailabilityFormData = z.infer<typeof availabilitySchema>;

// ============================================
// Video Room Settings Schema
// ============================================
export const videoRoomSettingsSchema = z.object({
  waitingRoomEnabled: z.boolean().optional().default(true),
  recordingEnabled: z.boolean().optional().default(false),
  transcriptionEnabled: z.boolean().optional().default(false),
  chatEnabled: z.boolean().optional().default(true),
  screenShareEnabled: z.boolean().optional().default(true),
  whiteboardEnabled: z.boolean().optional().default(false),
  codeEditorEnabled: z.boolean().optional().default(false),
  maxParticipants: z.number().int().min(2).max(50).optional().default(10),
  quality: z.enum(['low', 'medium', 'high', 'hd', 'auto']).optional().default('auto'),
});

export type VideoRoomSettingsFormData = z.infer<typeof videoRoomSettingsSchema>;
