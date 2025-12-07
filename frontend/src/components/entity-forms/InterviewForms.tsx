// ============================================================
// INTERVIEW FORMS - Interview scheduling and management forms
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  scheduleInterviewSchema,
  rescheduleInterviewSchema,
  cancelInterviewSchema,
  interviewFeedbackSchema,
  type ScheduleInterviewFormData,
  type RescheduleInterviewFormData,
  type CancelInterviewFormData,
  type InterviewFeedbackFormData,
} from '../../schemas/interview.schema';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../modals/Modal';
import { FormField, FormInput, FormTextarea, FormSelect, FormCheckbox } from '../forms/FormField';
import { FormDateTimeInput } from '../forms/FormDatePicker';
import { FormMultiSelect } from '../forms/FormMultiSelect';
import { FormRating } from '../forms/FormSpecialized';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

// ============================================
// Interview Type Options
// ============================================
const INTERVIEW_TYPES = [
  { value: 'PHONE_SCREEN', label: 'Phone Screen' },
  { value: 'VIDEO', label: 'Video Call' },
  { value: 'TECHNICAL', label: 'Technical Interview' },
  { value: 'BEHAVIORAL', label: 'Behavioral Interview' },
  { value: 'PANEL', label: 'Panel Interview' },
  { value: 'ONSITE', label: 'On-site Interview' },
  { value: 'FINAL', label: 'Final Interview' },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
];

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Europe/Moscow', label: 'Moscow Time (MSK)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

const RECOMMENDATION_OPTIONS = [
  { value: 'strong_hire', label: 'Strong Hire', color: 'text-green-700 bg-green-100' },
  { value: 'hire', label: 'Hire', color: 'text-green-600 bg-green-50' },
  { value: 'undecided', label: 'Undecided', color: 'text-yellow-700 bg-yellow-100' },
  { value: 'no_hire', label: 'No Hire', color: 'text-red-600 bg-red-50' },
  { value: 'strong_no_hire', label: 'Strong No Hire', color: 'text-red-700 bg-red-100' },
];

const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
];

// ============================================
// Types
// ============================================
interface Interviewer {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

interface Application {
  id: string;
  candidateName: string;
  jobTitle: string;
  candidateEmail?: string;
}

interface Interview {
  id: string;
  type: string;
  scheduledAt: string;
  duration: number;
  timezone: string;
  location?: string;
  meetingUrl?: string;
  interviewers: Interviewer[];
}

// ============================================
// Schedule Interview Form
// ============================================
export interface ScheduleInterviewFormProps {
  application: Application;
  interviewers: Interviewer[];
  onSubmit: (data: ScheduleInterviewFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<ScheduleInterviewFormData>;
}

export const ScheduleInterviewForm: React.FC<ScheduleInterviewFormProps> = ({
  application,
  interviewers,
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ScheduleInterviewFormData>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      applicationId: application.id,
      type: 'VIDEO',
      duration: 60,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
      interviewerIds: [],
      sendInvite: true,
      includeCalendarInvite: true,
      reminderMinutes: 60,
      ...defaultValues,
    },
  });

  const interviewType = watch('type');

  const interviewerOptions = useMemo(() =>
    interviewers.map(i => ({
      value: i.id,
      label: `${i.name}${i.role ? ` (${i.role})` : ''}`,
    })),
    [interviewers]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Application Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Scheduling interview for</h4>
        <p className="font-medium text-gray-900">{application.candidateName}</p>
        <p className="text-sm text-gray-600">{application.jobTitle}</p>
      </div>

      {/* Interview Type */}
      <FormSelect
        label="Interview Type"
        {...register('type')}
        error={errors.type?.message}
        required
      >
        {INTERVIEW_TYPES.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </FormSelect>

      {/* Date and Time */}
      <Controller
        name="scheduledAt"
        control={control}
        render={({ field }) => (
          <FormDateTimeInput
            label="Date and Time"
            value={field.value}
            onChange={field.onChange}
            error={errors.scheduledAt?.message}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        )}
      />

      {/* Duration */}
      <FormSelect
        label="Duration"
        {...register('duration', { valueAsNumber: true })}
        error={errors.duration?.message}
        required
      >
        {DURATION_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </FormSelect>

      {/* Timezone */}
      <FormSelect
        label="Timezone"
        {...register('timezone')}
        error={errors.timezone?.message}
        required
      >
        {TIMEZONE_OPTIONS.map(tz => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </FormSelect>

      {/* Interviewers */}
      <Controller
        name="interviewerIds"
        control={control}
        render={({ field }) => (
          <FormMultiSelect
            label="Interviewers"
            options={interviewerOptions}
            value={field.value}
            onChange={field.onChange}
            error={errors.interviewerIds?.message}
            required
            placeholder="Select interviewers..."
          />
        )}
      />

      {/* Location (for onsite) */}
      {(interviewType === 'ONSITE' || interviewType === 'PANEL') && (
        <FormInput
          label="Location"
          {...register('location')}
          error={errors.location?.message}
          placeholder="Office address or room number"
        />
      )}

      {/* Meeting URL (for video) */}
      {(interviewType === 'VIDEO' || interviewType === 'TECHNICAL') && (
        <FormInput
          label="Meeting URL"
          type="url"
          {...register('meetingUrl')}
          error={errors.meetingUrl?.message}
          placeholder="https://zoom.us/j/..."
          hint="Leave blank to generate automatically"
        />
      )}

      {/* Notes */}
      <FormTextarea
        label="Notes"
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Additional information for the interview..."
        rows={3}
      />

      {/* Notification Options */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>

        <div className="space-y-3">
          <FormCheckbox
            {...register('sendInvite')}
            label="Send email invitation to candidate"
          />

          <FormCheckbox
            {...register('includeCalendarInvite')}
            label="Include calendar invite (.ics)"
          />

          <FormSelect
            label="Send reminder"
            {...register('reminderMinutes', { valueAsNumber: true })}
          >
            <option value="">No reminder</option>
            {REMINDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Schedule Interview
        </Button>
      </div>
    </form>
  );
};

// ============================================
// Schedule Interview Modal
// ============================================
export interface ScheduleInterviewModalProps extends Omit<ScheduleInterviewFormProps, 'onCancel'> {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  ...formProps
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Schedule Interview</h2>
            <p className="text-sm text-gray-500">Set up interview details</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <ScheduleInterviewForm {...formProps} onCancel={onClose} />
      </ModalBody>
    </Modal>
  );
};

// ============================================
// Reschedule Interview Modal
// ============================================
export interface RescheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview;
  onSubmit: (data: RescheduleInterviewFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const RescheduleInterviewModal: React.FC<RescheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  interview,
  onSubmit,
  isSubmitting = false,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RescheduleInterviewFormData>({
    resolver: zodResolver(rescheduleInterviewSchema),
    defaultValues: {
      interviewId: interview.id,
      duration: interview.duration,
      notifyParticipants: true,
    },
  });

  const currentDate = new Date(interview.scheduledAt);
  const formatCurrentDateTime = () => {
    return currentDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Reschedule Interview</h2>
            <p className="text-sm text-gray-500">Change the interview time</p>
          </div>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          {/* Current Schedule */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Current schedule</h4>
            <p className="font-medium text-gray-900">{formatCurrentDateTime()}</p>
            <p className="text-sm text-gray-600">
              {INTERVIEW_TYPES.find(t => t.value === interview.type)?.label} • {interview.duration} minutes
            </p>
          </div>

          {/* New Date and Time */}
          <Controller
            name="scheduledAt"
            control={control}
            render={({ field }) => (
              <FormDateTimeInput
                label="New Date and Time"
                value={field.value}
                onChange={field.onChange}
                error={errors.scheduledAt?.message}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          />

          {/* Duration (optional change) */}
          <FormSelect
            label="Duration"
            {...register('duration', { valueAsNumber: true })}
            error={errors.duration?.message}
          >
            {DURATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FormSelect>

          {/* Reason */}
          <FormTextarea
            label="Reason for rescheduling"
            {...register('reason')}
            error={errors.reason?.message}
            placeholder="Briefly explain why the interview needs to be rescheduled..."
            rows={2}
          />

          {/* Notification */}
          <FormCheckbox
            {...register('notifyParticipants')}
            label="Notify all participants of the change"
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Reschedule
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// ============================================
// Cancel Interview Modal
// ============================================
export interface CancelInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview;
  candidateName: string;
  onSubmit: (data: CancelInterviewFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const CancelInterviewModal: React.FC<CancelInterviewModalProps> = ({
  isOpen,
  onClose,
  interview,
  candidateName,
  onSubmit,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CancelInterviewFormData>({
    resolver: zodResolver(cancelInterviewSchema),
    defaultValues: {
      interviewId: interview.id,
      notifyParticipants: true,
      reschedule: false,
    },
  });

  const reschedule = watch('reschedule');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Cancel Interview</h2>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">
                  You are about to cancel the interview with {candidateName}
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Scheduled for {new Date(interview.scheduledAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <FormTextarea
            label="Cancellation Reason"
            {...register('reason')}
            error={errors.reason?.message}
            placeholder="Please provide a reason for cancelling..."
            rows={3}
            required
          />

          {/* Options */}
          <div className="space-y-3 mt-4">
            <FormCheckbox
              {...register('notifyParticipants')}
              label="Send cancellation notice to all participants"
            />

            <FormCheckbox
              {...register('reschedule')}
              label="I want to reschedule this interview"
            />
          </div>

          {reschedule && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                After cancelling, you will be prompted to schedule a new interview.
              </p>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Keep Interview
          </Button>
          <Button type="submit" variant="danger" loading={isSubmitting}>
            Cancel Interview
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// ============================================
// Interview Feedback Form
// ============================================
export interface InterviewFeedbackFormProps {
  interviewId: string;
  candidateName: string;
  interviewType: string;
  onSubmit: (data: InterviewFeedbackFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<InterviewFeedbackFormData>;
}

export const InterviewFeedbackForm: React.FC<InterviewFeedbackFormProps> = ({
  interviewId,
  candidateName,
  interviewType,
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InterviewFeedbackFormData>({
    resolver: zodResolver(interviewFeedbackSchema),
    defaultValues: {
      interviewId,
      overallRating: 3,
      recommendation: 'undecided',
      ...defaultValues,
    },
  });

  const recommendation = watch('recommendation');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Feedback for</h4>
        <p className="font-medium text-gray-900">{candidateName}</p>
        <p className="text-sm text-gray-600">
          {INTERVIEW_TYPES.find(t => t.value === interviewType)?.label || interviewType}
        </p>
      </div>

      {/* Overall Rating */}
      <Controller
        name="overallRating"
        control={control}
        render={({ field }) => (
          <FormRating
            label="Overall Rating"
            value={field.value}
            onChange={field.onChange}
            error={errors.overallRating?.message}
            required
            max={5}
          />
        )}
      />

      {/* Recommendation */}
      <FormField
        label="Hiring Recommendation"
        error={errors.recommendation?.message}
        required
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {RECOMMENDATION_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={cn(
                'flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all',
                recommendation === opt.value
                  ? `${opt.color} border-current`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <input
                type="radio"
                value={opt.value}
                {...register('recommendation')}
                className="sr-only"
              />
              <span className="text-sm font-medium text-center">{opt.label}</span>
            </label>
          ))}
        </div>
      </FormField>

      {/* Skill Ratings */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-4">Skill Assessment</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="technicalSkills"
            control={control}
            render={({ field }) => (
              <FormRating
                label="Technical Skills"
                value={field.value || 0}
                onChange={field.onChange}
                max={5}
                size="sm"
              />
            )}
          />

          <Controller
            name="communicationSkills"
            control={control}
            render={({ field }) => (
              <FormRating
                label="Communication"
                value={field.value || 0}
                onChange={field.onChange}
                max={5}
                size="sm"
              />
            )}
          />

          <Controller
            name="problemSolving"
            control={control}
            render={({ field }) => (
              <FormRating
                label="Problem Solving"
                value={field.value || 0}
                onChange={field.onChange}
                max={5}
                size="sm"
              />
            )}
          />

          <Controller
            name="cultureFit"
            control={control}
            render={({ field }) => (
              <FormRating
                label="Culture Fit"
                value={field.value || 0}
                onChange={field.onChange}
                max={5}
                size="sm"
              />
            )}
          />
        </div>
      </div>

      {/* Strengths */}
      <FormTextarea
        label="Strengths"
        {...register('strengths')}
        error={errors.strengths?.message}
        placeholder="What did the candidate do well?"
        rows={3}
      />

      {/* Weaknesses */}
      <FormTextarea
        label="Areas for Improvement"
        {...register('weaknesses')}
        error={errors.weaknesses?.message}
        placeholder="What could the candidate improve on?"
        rows={3}
      />

      {/* Would Work With */}
      <FormCheckbox
        {...register('wouldWorkWith')}
        label="I would enjoy working with this candidate"
      />

      {/* Additional Notes */}
      <FormTextarea
        label="Additional Notes"
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Any other observations or comments..."
        rows={3}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Save as Draft
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Submit Feedback
        </Button>
      </div>
    </form>
  );
};

// ============================================
// Interview Feedback Modal
// ============================================
export interface InterviewFeedbackModalProps extends Omit<InterviewFeedbackFormProps, 'onCancel'> {
  isOpen: boolean;
  onClose: () => void;
}

export const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({
  isOpen,
  onClose,
  ...formProps
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Interview Feedback</h2>
            <p className="text-sm text-gray-500">Share your assessment</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <InterviewFeedbackForm {...formProps} onCancel={onClose} />
      </ModalBody>
    </Modal>
  );
};

// ============================================
// Quick Schedule Widget
// ============================================
export interface QuickScheduleWidgetProps {
  applicationId: string;
  candidateName: string;
  interviewers: Interviewer[];
  suggestedSlots?: { date: string; time: string }[];
  onSchedule: (data: Partial<ScheduleInterviewFormData>) => void;
}

export const QuickScheduleWidget: React.FC<QuickScheduleWidgetProps> = ({
  applicationId,
  candidateName,
  interviewers,
  suggestedSlots = [],
  onSchedule,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState('VIDEO');
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);

  const handleQuickSchedule = () => {
    if (selectedSlot !== null && suggestedSlots[selectedSlot]) {
      const slot = suggestedSlots[selectedSlot];
      onSchedule({
        applicationId,
        type: selectedType as ScheduleInterviewFormData['type'],
        scheduledAt: `${slot.date}T${slot.time}`,
        duration: 60,
        interviewerIds: selectedInterviewers,
      });
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-1">Quick Schedule</h4>
      <p className="text-sm text-gray-500 mb-4">Schedule an interview with {candidateName}</p>

      {/* Interview Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {INTERVIEW_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Suggested Slots */}
      {suggestedSlots.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Slots
          </label>
          <div className="grid grid-cols-2 gap-2">
            {suggestedSlots.slice(0, 4).map((slot, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedSlot(index)}
                className={cn(
                  'p-2 text-sm border rounded-md transition-colors',
                  selectedSlot === index
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="font-medium">
                  {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-gray-500">{slot.time}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interviewers */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interviewers
        </label>
        <div className="flex flex-wrap gap-2">
          {interviewers.slice(0, 4).map(interviewer => (
            <button
              key={interviewer.id}
              type="button"
              onClick={() => {
                setSelectedInterviewers(prev =>
                  prev.includes(interviewer.id)
                    ? prev.filter(id => id !== interviewer.id)
                    : [...prev, interviewer.id]
                );
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm transition-colors',
                selectedInterviewers.includes(interviewer.id)
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              {interviewer.avatar ? (
                <img
                  src={interviewer.avatar}
                  alt={interviewer.name}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">
                  {interviewer.name.charAt(0)}
                </div>
              )}
              <span>{interviewer.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Button */}
      <Button
        onClick={handleQuickSchedule}
        disabled={selectedSlot === null || selectedInterviewers.length === 0}
        className="w-full"
      >
        Schedule Interview
      </Button>
    </div>
  );
};

// ============================================
// Interview Timeline
// ============================================
export interface InterviewTimelineProps {
  interviews: Array<{
    id: string;
    type: string;
    scheduledAt: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    interviewers: Interviewer[];
    feedback?: {
      overallRating: number;
      recommendation: string;
    };
  }>;
  onViewFeedback?: (interviewId: string) => void;
  onReschedule?: (interviewId: string) => void;
  onCancel?: (interviewId: string) => void;
}

export const InterviewTimeline: React.FC<InterviewTimelineProps> = ({
  interviews,
  onViewFeedback,
  onReschedule,
  onCancel,
}) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationColor = (rec: string) => {
    const opt = RECOMMENDATION_OPTIONS.find(o => o.value === rec);
    return opt?.color || 'text-gray-600 bg-gray-100';
  };

  if (interviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>No interviews scheduled yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {interviews.map((interview, index) => {
          const interviewDate = new Date(interview.scheduledAt);
          const isPast = interviewDate < new Date();
          const typeLabel = INTERVIEW_TYPES.find(t => t.value === interview.type)?.label || interview.type;

          return (
            <div key={interview.id} className="relative flex gap-4 pl-10">
              {/* Timeline dot */}
              <div
                className={cn(
                  'absolute left-2.5 w-3 h-3 rounded-full border-2 bg-white',
                  interview.status === 'completed' ? 'border-green-500' :
                  interview.status === 'cancelled' ? 'border-gray-400' :
                  interview.status === 'no_show' ? 'border-red-500' :
                  'border-blue-500'
                )}
              />

              {/* Content */}
              <div className={cn(
                'flex-1 bg-white border rounded-lg p-4',
                interview.status === 'cancelled' && 'opacity-60'
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={cn(
                      'inline-block px-2 py-0.5 text-xs font-medium rounded border',
                      getStatusStyles(interview.status)
                    )}>
                      {interview.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <h4 className="font-medium text-gray-900 mt-1">{typeLabel}</h4>
                  </div>
                  <time className="text-sm text-gray-500">
                    {interviewDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </time>
                </div>

                {/* Interviewers */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {interview.interviewers.slice(0, 3).map(int => (
                      <div
                        key={int.id}
                        className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-white"
                        title={int.name}
                      >
                        {int.avatar ? (
                          <img src={int.avatar} alt={int.name} className="w-full h-full rounded-full" />
                        ) : (
                          int.name.charAt(0)
                        )}
                      </div>
                    ))}
                    {interview.interviewers.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                        +{interview.interviewers.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {interview.interviewers.map(i => i.name).join(', ')}
                  </span>
                </div>

                {/* Feedback summary */}
                {interview.feedback && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Rating:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              i < interview.feedback!.overallRating ? 'text-yellow-400' : 'text-gray-200'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      getRecommendationColor(interview.feedback.recommendation)
                    )}>
                      {RECOMMENDATION_OPTIONS.find(o => o.value === interview.feedback!.recommendation)?.label}
                    </span>
                  </div>
                )}

                {/* Actions */}
                {interview.status === 'scheduled' && !isPast && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    {onReschedule && (
                      <button
                        onClick={() => onReschedule(interview.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Reschedule
                      </button>
                    )}
                    {onCancel && (
                      <button
                        onClick={() => onCancel(interview.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}

                {interview.status === 'completed' && interview.feedback && onViewFeedback && (
                  <div className="mt-3 pt-3 border-t">
                    <button
                      onClick={() => onViewFeedback(interview.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View Full Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
