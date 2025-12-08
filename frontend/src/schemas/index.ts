// ============================================================
// KREUPAI MANITHPRO - VALIDATION SCHEMAS
// ============================================================
// Centralized Zod validation schemas for forms.
// Use with React Hook Form's zodResolver.
// ============================================================

// ============================================
// AUTH SCHEMAS
// ============================================
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  twoFactorVerifySchema,
  profileUpdateSchema,
} from './auth.schema';

export type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
  TwoFactorVerifyFormData,
  ProfileUpdateFormData,
} from './auth.schema';

// ============================================
// JOB SCHEMAS
// ============================================
export {
  jobSchema,
  jobFilterSchema,
  jobSearchSchema,
  quickApplySchema,
} from './job.schema';

export type {
  JobFormData,
  JobFilterFormData,
  JobSearchFormData,
  QuickApplyFormData,
} from './job.schema';

// ============================================
// APPLICATION SCHEMAS
// ============================================
export {
  applicationCreateSchema,
  applicationUpdateSchema,
  applicationFilterSchema,
  bulkActionSchema,
  movePipelineStageSchema,
  applicationNoteSchema,
  rejectionReasonSchema,
} from './application.schema';

export type {
  ApplicationCreateFormData,
  ApplicationUpdateFormData,
  ApplicationFilterFormData,
  BulkActionFormData,
  MovePipelineStageFormData,
  ApplicationNoteFormData,
  RejectionReasonFormData,
} from './application.schema';

// ============================================
// CANDIDATE SCHEMAS
// ============================================
export {
  profileBasicInfoSchema,
  workExperienceSchema,
  educationSchema,
  certificationSchema,
  skillSchema,
  projectSchema,
  socialLinksSchema,
} from './candidate.schema';

export type {
  ProfileBasicInfoFormData,
  WorkExperienceFormData,
  EducationFormData,
  CertificationFormData,
  SkillFormData,
  ProjectFormData,
  SocialLinksFormData,
} from './candidate.schema';

// ============================================
// INTERVIEW SCHEMAS
// ============================================
export {
  scheduleInterviewSchema,
  rescheduleInterviewSchema,
  cancelInterviewSchema,
  interviewFeedbackSchema,
  scorecardSchema,
  availabilitySchema,
  videoRoomSettingsSchema,
} from './interview.schema';

export type {
  ScheduleInterviewFormData,
  RescheduleInterviewFormData,
  CancelInterviewFormData,
  InterviewFeedbackFormData,
  ScorecardFormData,
  AvailabilityFormData,
  VideoRoomSettingsFormData,
} from './interview.schema';

// ============================================
// USAGE EXAMPLES
// ============================================
/*
// With React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/schemas';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}

// Manual validation
import { loginSchema } from '@/schemas';

const result = loginSchema.safeParse({
  email: 'test@example.com',
  password: 'password123',
});

if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.error.errors);
}
*/
