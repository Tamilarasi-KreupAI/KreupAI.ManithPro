import type { Job, User } from './index';

export interface RecommendationReason { reason: string; weight?: number; importance?: string }
export interface JobRecommendation {
  id: string; candidateId: string; jobId: string; recommendationScore: number; recommendationRank: number;
  recommendationType: string; skillMatch: number; experienceMatch: number; locationMatch: number; salaryMatch: number;
  jobTitle: string; jobCompany: string; jobLocation: string; matchReasons: RecommendationReason[]; highlightedSkills: string[];
  missingSkills: string[]; growthOpportunities: string[]; job: Job;
}
export interface CandidateRecommendation {
  id: string; jobId: string; candidateId: string; recommendationScore: number; recommendationRank: number;
  recommendationType: string; overallMatch: number; skillMatch: number; experienceMatch: number;
  candidateName: string; candidateTitle: string; candidateLocation: string; candidateExperience: number;
  candidateSkills: string[]; matchReasons: RecommendationReason[]; standoutFactors: string[]; candidate: User;
  contactedAt?: string | Date | null;
}
export interface GenerateJobRecommendationsInput { candidateId?: string }
export interface GenerateCandidateRecommendationsInput { jobId: string }
export interface JobRecommendationInteractionInput { action: 'view' | 'click' | 'save' | 'apply' | 'dismiss'; feedbackRating?: number; feedbackComment?: string; dismissReason?: string }
export interface CandidateRecommendationActionInput { action: 'view' | 'shortlist' | 'contact' | 'reject'; rejectionReason?: string }
export interface FindSimilarCandidatesInput { sourceCandidateId: string; sourceType?: string; forJobId?: string }
export interface SimilarCandidateActionInput { actionTaken: string }
export interface IdentifyPassiveCandidatesInput { candidateId: string; [key: string]: unknown }
export interface PassiveCandidateOutreachInput { outreachStatus?: string; contactMethod?: string; [key: string]: unknown }
export interface GenerateSkillUpRecommendationsInput { candidateId: string; targetRoleTitle?: string; targetJobId?: string }
export interface UpdateSkillProgressInput { skillsAcquired?: string[]; progressPercentage?: number }
export interface GenerateReEngagementSuggestionsInput { jobId: string; candidateId?: string }
export interface UpdateReEngagementStatusInput { suggestionStatus: string; actionNotes?: string }
export interface GenerateInterviewPanelRecommendationsInput { jobId: string; candidateId: string; interviewRound?: string }
export interface SelectInterviewerInput { notes?: string }
export interface GenerateSourcingRecommendationsInput { roleTitle: string; jobId?: string }
export interface SubmitRecommendationFeedbackInput { recommendationType: string; recommendationId: string; rating?: number; wasHelpful?: boolean; wasAccurate?: boolean; feedbackText?: string; actionTaken?: string; outcome?: string; userRole?: string }
export interface UpdateRecommendationConfigInput { weights?: Record<string, number>; thresholds?: Record<string, number> }
export type RecommendationType = string;
export type SimilarCandidateMatch = Record<string, unknown> & { id: string };
export type PassiveCandidateProfile = Record<string, unknown> & { id: string };
export type SkillUpRecommendation = Record<string, unknown> & { id: string };
export type ReEngagementSuggestion = Record<string, unknown> & { id: string };
export type InterviewPanelRecommendation = Record<string, unknown> & { id: string };
export type SourcingChannelRecommendation = Record<string, unknown> & { id: string };
export type RecommendationFeedback = Record<string, unknown> & { id: string };
export type RecommendationConfig = Record<string, unknown> & { id: string };
export type SmartRecommendationsStats = Record<string, unknown>;
