// ============================================================
// INTERVIEW TYPES - Interviews, scheduling, and video platform
// ============================================================

import { TimestampedRecord } from './common.types';

// Interview Status
export type InterviewStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

// Interview Type
export type InterviewType =
  | 'PHONE_SCREEN'
  | 'VIDEO'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'PANEL'
  | 'ONSITE'
  | 'FINAL';

// Video Room Status
export type VideoRoomStatus = 'WAITING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

// Video Quality
export type VideoQuality = 'low' | 'medium' | 'high' | 'hd' | 'auto';

// Participant Role
export type ParticipantRole = 'host' | 'interviewer' | 'candidate' | 'observer' | 'notetaker';

// Participant Status
export type ParticipantStatus = 'invited' | 'joined' | 'left' | 'disconnected' | 'waiting';

// Interview Interface
export interface Interview extends TimestampedRecord {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: string;
  duration: number; // minutes
  timezone: string;
  location?: string;
  meetingUrl?: string;
  meetingId?: string;
  notes?: string;
  interviewers: InterviewParticipant[];
  feedback?: InterviewFeedback[];
  application?: {
    id: string;
    job: {
      id: string;
      title: string;
    };
    candidate: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

// Interview Participant
export interface InterviewParticipant {
  id: string;
  interviewId: string;
  userId: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt?: string;
  leftAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Interview Feedback
export interface InterviewFeedback extends TimestampedRecord {
  id: string;
  interviewId: string;
  interviewerId: string;
  overallRating: number;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire' | 'undecided';
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  skillRatings?: Record<string, number>;
  isSubmitted: boolean;
  submittedAt?: string;
}

// Interview Schedule Request
export interface InterviewScheduleRequest {
  applicationId: string;
  type: InterviewType;
  scheduledAt: string;
  duration: number;
  timezone: string;
  interviewerIds: string[];
  location?: string;
  notes?: string;
  sendInvite?: boolean;
}

// Interview Reschedule Request
export interface InterviewRescheduleRequest {
  scheduledAt: string;
  duration?: number;
  reason?: string;
  notifyParticipants?: boolean;
}

// Interview Calendar Event
export interface InterviewCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: InterviewType;
  status: InterviewStatus;
  candidate: {
    id: string;
    name: string;
  };
  job: {
    id: string;
    title: string;
  };
  interviewers: string[];
  location?: string;
  meetingUrl?: string;
}

// Video Room
export interface VideoRoom extends TimestampedRecord {
  id: string;
  interviewId: string;
  roomId: string;
  status: VideoRoomStatus;
  provider: 'internal' | 'zoom' | 'teams' | 'google_meet';
  meetingUrl: string;
  hostKey?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  participants: VideoParticipant[];
  recording?: VideoRecording;
  settings: VideoRoomSettings;
}

// Video Participant
export interface VideoParticipant {
  id: string;
  roomId: string;
  participantId: string;
  userId?: string;
  name: string;
  email?: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt?: string;
  leftAt?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
}

// Video Room Settings
export interface VideoRoomSettings {
  waitingRoomEnabled: boolean;
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  whiteboardEnabled: boolean;
  codeEditorEnabled: boolean;
  maxParticipants: number;
  quality: VideoQuality;
}

// Video Recording
export interface VideoRecording {
  id: string;
  roomId: string;
  status: 'recording' | 'processing' | 'ready' | 'failed';
  startedAt: string;
  endedAt?: string;
  duration?: number;
  fileUrl?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  transcription?: string;
}

// Interview Scorecard
export interface InterviewScorecard {
  id: string;
  interviewId: string;
  templateId?: string;
  name: string;
  sections: ScorecardSection[];
  totalScore?: number;
  maxScore: number;
  isCompleted: boolean;
  completedAt?: string;
}

// Scorecard Section
export interface ScorecardSection {
  id: string;
  name: string;
  weight: number;
  criteria: ScorecardCriterion[];
}

// Scorecard Criterion
export interface ScorecardCriterion {
  id: string;
  name: string;
  description?: string;
  rating?: number;
  maxRating: number;
  notes?: string;
}

// Scorecard Template
export interface ScorecardTemplate {
  id: string;
  name: string;
  description?: string;
  interviewType?: InterviewType;
  sections: ScorecardSection[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interview Availability
export interface InterviewAvailability {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6, Sunday = 0
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  isRecurring: boolean;
  validFrom?: string;
  validUntil?: string;
}

// Available Time Slot
export interface AvailableTimeSlot {
  start: string;
  end: string;
  interviewerIds: string[];
  score?: number; // Preference score
}

// Interview Prep Material
export interface InterviewPrepMaterial {
  id: string;
  interviewId: string;
  type: 'job_description' | 'resume' | 'cover_letter' | 'portfolio' | 'notes' | 'questions' | 'other';
  title: string;
  content?: string;
  fileUrl?: string;
  isShared: boolean;
  sharedWith: string[];
  createdAt: string;
}
