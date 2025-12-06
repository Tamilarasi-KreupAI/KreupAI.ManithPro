import axios from 'axios';
import type {
  ScorecardTemplate,
  ScorecardCriteria,
  InterviewFeedback,
  FeedbackDraft,
  BlindEvaluationConfig,
  AnonymizedCandidate,
  FeedbackAggregation,
  CalibrationSession,
  HiringDecisionVote,
  VotingRoundSummary,
  EvaluationDeadline,
  DeadlineInstance,
  EvaluationDisagreement,
  CandidateComparison,
  HiringBenchmark,
  HistoricalComparison,
  CollaborativeEvaluationStats,
  InterviewStageType,
  HiringRecommendation,
  VotingDecision,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = true;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockScorecardTemplates: ScorecardTemplate[] = [
  {
    id: 'sct-1',
    companyId: 'company-1',
    name: 'Technical Interview Scorecard',
    description: 'Standard scorecard for technical interviews',
    jobId: 'job-1',
    interviewStage: 'TECHNICAL',
    criteria: [
      {
        id: 'crit-1',
        name: 'Problem Solving',
        description: 'Ability to break down and solve complex problems',
        category: 'Technical Skills',
        weight: 25,
        ratingScale: { type: 'NUMERIC', min: 1, max: 5 },
        guidelines: ['Assess analytical thinking', 'Look for systematic approach'],
        isRequired: true,
      },
      {
        id: 'crit-2',
        name: 'Code Quality',
        description: 'Clean, maintainable, and efficient code',
        category: 'Technical Skills',
        weight: 25,
        ratingScale: { type: 'NUMERIC', min: 1, max: 5 },
        isRequired: true,
      },
      {
        id: 'crit-3',
        name: 'System Design',
        description: 'Understanding of scalable systems',
        category: 'Technical Skills',
        weight: 20,
        ratingScale: { type: 'NUMERIC', min: 1, max: 5 },
        isRequired: false,
      },
      {
        id: 'crit-4',
        name: 'Communication',
        description: 'Ability to explain technical concepts',
        category: 'Soft Skills',
        weight: 15,
        ratingScale: { type: 'NUMERIC', min: 1, max: 5 },
        isRequired: true,
      },
      {
        id: 'crit-5',
        name: 'Culture Fit',
        description: 'Alignment with company values',
        category: 'Soft Skills',
        weight: 15,
        ratingScale: { type: 'NUMERIC', min: 1, max: 5 },
        isRequired: true,
      },
    ],
    ratingScale: { type: 'NUMERIC', min: 1, max: 5, labels: { 1: 'Poor', 2: 'Below Avg', 3: 'Average', 4: 'Good', 5: 'Excellent' } },
    requiredFields: ['overallScore', 'recommendation', 'strengths', 'weaknesses'],
    optionalFields: ['notes', 'attachments'],
    autoScoring: true,
    passingThreshold: 3.5,
    createdBy: 'user-1',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'sct-2',
    companyId: 'company-1',
    name: 'Behavioral Interview Scorecard',
    description: 'Scorecard for behavioral/competency interviews',
    interviewStage: 'BEHAVIORAL',
    criteria: [
      {
        id: 'crit-6',
        name: 'Leadership',
        category: 'Competencies',
        weight: 25,
        ratingScale: { type: 'LIKERT', min: 1, max: 5 },
        isRequired: true,
      },
      {
        id: 'crit-7',
        name: 'Teamwork',
        category: 'Competencies',
        weight: 25,
        ratingScale: { type: 'LIKERT', min: 1, max: 5 },
        isRequired: true,
      },
      {
        id: 'crit-8',
        name: 'Adaptability',
        category: 'Competencies',
        weight: 25,
        ratingScale: { type: 'LIKERT', min: 1, max: 5 },
        isRequired: true,
      },
      {
        id: 'crit-9',
        name: 'Initiative',
        category: 'Competencies',
        weight: 25,
        ratingScale: { type: 'LIKERT', min: 1, max: 5 },
        isRequired: true,
      },
    ],
    ratingScale: { type: 'LIKERT', min: 1, max: 5 },
    requiredFields: ['overallScore', 'recommendation'],
    optionalFields: ['notes'],
    autoScoring: false,
    createdBy: 'user-1',
    isActive: true,
    createdAt: '2024-01-20T14:30:00Z',
  },
];

const mockInterviewFeedbacks: InterviewFeedback[] = [
  {
    id: 'fb-1',
    companyId: 'company-1',
    applicationId: 'app-1',
    interviewId: 'int-1',
    scorecardTemplateId: 'sct-1',
    evaluatorId: 'user-2',
    evaluatorName: 'John Smith',
    ratings: [
      { criteriaId: 'crit-1', criteriaName: 'Problem Solving', rating: 4, notes: 'Strong analytical skills' },
      { criteriaId: 'crit-2', criteriaName: 'Code Quality', rating: 5, notes: 'Excellent code structure' },
      { criteriaId: 'crit-3', criteriaName: 'System Design', rating: 4 },
      { criteriaId: 'crit-4', criteriaName: 'Communication', rating: 4 },
      { criteriaId: 'crit-5', criteriaName: 'Culture Fit', rating: 5 },
    ],
    overallScore: 4.4,
    strengths: ['Strong technical skills', 'Excellent communication', 'Great problem-solving approach'],
    weaknesses: ['Could improve on system design'],
    recommendation: 'STRONG_HIRE',
    notes: 'Highly recommend this candidate',
    timeSpent: 45,
    status: 'SUBMITTED',
    submittedAt: '2024-02-10T16:00:00Z',
    createdAt: '2024-02-10T15:00:00Z',
  },
  {
    id: 'fb-2',
    companyId: 'company-1',
    applicationId: 'app-1',
    interviewId: 'int-1',
    scorecardTemplateId: 'sct-1',
    evaluatorId: 'user-3',
    evaluatorName: 'Jane Doe',
    ratings: [
      { criteriaId: 'crit-1', criteriaName: 'Problem Solving', rating: 4 },
      { criteriaId: 'crit-2', criteriaName: 'Code Quality', rating: 4 },
      { criteriaId: 'crit-3', criteriaName: 'System Design', rating: 3 },
      { criteriaId: 'crit-4', criteriaName: 'Communication', rating: 5 },
      { criteriaId: 'crit-5', criteriaName: 'Culture Fit', rating: 4 },
    ],
    overallScore: 4.0,
    strengths: ['Great communicator', 'Solid technical foundation'],
    weaknesses: ['System design needs more experience'],
    recommendation: 'HIRE',
    status: 'SUBMITTED',
    submittedAt: '2024-02-10T17:00:00Z',
    createdAt: '2024-02-10T16:30:00Z',
  },
];

const mockBlindConfig: BlindEvaluationConfig = {
  id: 'blind-1',
  companyId: 'company-1',
  jobId: 'job-1',
  hiddenFields: ['name', 'email', 'photo', 'linkedin', 'university'],
  revealStage: 'FINAL',
  anonymizeNames: true,
  hidePhotos: true,
  hideCompanyNames: true,
  hideEducationInstitutions: true,
  customRules: [
    { field: 'gender', action: 'HIDE' },
    { field: 'age', action: 'HIDE' },
  ],
  createdBy: 'user-1',
  isActive: true,
  createdAt: '2024-01-05T09:00:00Z',
};

const mockAggregations: FeedbackAggregation[] = [
  {
    id: 'agg-1',
    companyId: 'company-1',
    applicationId: 'app-1',
    interviewStage: 'TECHNICAL',
    feedbackIds: ['fb-1', 'fb-2'],
    feedbackCount: 2,
    aggregatedScores: [
      { criteriaId: 'crit-1', criteriaName: 'Problem Solving', average: 4.0, min: 4, max: 4, standardDeviation: 0, ratings: [4, 4] },
      { criteriaId: 'crit-2', criteriaName: 'Code Quality', average: 4.5, min: 4, max: 5, standardDeviation: 0.5, ratings: [5, 4] },
      { criteriaId: 'crit-3', criteriaName: 'System Design', average: 3.5, min: 3, max: 4, standardDeviation: 0.5, ratings: [4, 3] },
      { criteriaId: 'crit-4', criteriaName: 'Communication', average: 4.5, min: 4, max: 5, standardDeviation: 0.5, ratings: [4, 5] },
      { criteriaId: 'crit-5', criteriaName: 'Culture Fit', average: 4.5, min: 4, max: 5, standardDeviation: 0.5, ratings: [5, 4] },
    ],
    consensusRating: 4.2,
    strengthsSummary: ['Strong technical skills', 'Excellent communication', 'Great problem-solving approach', 'Solid technical foundation'],
    weaknessesSummary: ['Could improve on system design', 'System design needs more experience'],
    keyInsights: ['Both interviewers recommend hire', 'Consistent high scores across evaluators'],
    recommendationBreakdown: { STRONG_HIRE: 1, HIRE: 1, LEAN_HIRE: 0, LEAN_NO_HIRE: 0, NO_HIRE: 0, STRONG_NO_HIRE: 0 },
    finalRecommendation: 'HIRE',
    aggregatedAt: '2024-02-11T09:00:00Z',
    aggregatedBy: 'user-1',
  },
];

const mockCalibrationSessions: CalibrationSession[] = [
  {
    id: 'cal-1',
    companyId: 'company-1',
    name: 'Q1 2024 Hiring Calibration',
    description: 'Calibration session for engineering hires',
    jobId: 'job-1',
    scheduledDate: '2024-02-15T14:00:00Z',
    participants: [
      { userId: 'user-1', name: 'Alice Manager', role: 'Hiring Manager', attended: true },
      { userId: 'user-2', name: 'John Smith', role: 'Technical Lead', attended: true },
      { userId: 'user-3', name: 'Jane Doe', role: 'Senior Engineer', attended: true },
    ],
    applicationIds: ['app-1', 'app-2', 'app-3'],
    agenda: ['Review scoring criteria', 'Discuss candidates', 'Align on thresholds'],
    calibrationCriteria: ['Problem Solving', 'Code Quality', 'System Design'],
    targetDuration: 60,
    facilitatorId: 'user-1',
    status: 'COMPLETED',
    actualStartTime: '2024-02-15T14:05:00Z',
    actualEndTime: '2024-02-15T15:10:00Z',
    outcomes: [
      { applicationId: 'app-1', originalRating: 4.0, adjustedRating: 4.2, adjustmentReason: 'Team agreed on stronger technical performance', votedBy: ['user-1', 'user-2', 'user-3'] },
    ],
    notes: 'Productive session with good alignment',
    actionItems: ['Update scorecard weights', 'Schedule follow-up for next quarter'],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-15T15:15:00Z',
  },
];

const mockVotingRounds: VotingRoundSummary[] = [
  {
    id: 'vr-1',
    companyId: 'company-1',
    applicationId: 'app-1',
    roundNumber: 1,
    votingType: 'SIMPLE_MAJORITY',
    voters: ['user-1', 'user-2', 'user-3'],
    totalVoters: 3,
    votesReceived: 3,
    voteBreakdown: { HIRE: 2, NO_HIRE: 0, MAYBE: 1, ABSTAIN: 0 },
    deadline: '2024-02-20T18:00:00Z',
    requiredVotes: 3,
    passingThreshold: 0.5,
    status: 'CLOSED',
    finalDecision: 'HIRE',
    decisionNotes: 'Majority voted to hire',
    createdBy: 'user-1',
    closedAt: '2024-02-20T16:00:00Z',
    closedBy: 'user-1',
    createdAt: '2024-02-18T10:00:00Z',
    updatedAt: '2024-02-20T16:00:00Z',
  },
];

const mockVotes: HiringDecisionVote[] = [
  {
    id: 'vote-1',
    companyId: 'company-1',
    applicationId: 'app-1',
    votingRoundId: 'vr-1',
    voterId: 'user-1',
    voterName: 'Alice Manager',
    decision: 'HIRE',
    confidence: 90,
    reasoning: 'Strong technical skills and culture fit',
    votedAt: '2024-02-19T10:00:00Z',
  },
  {
    id: 'vote-2',
    companyId: 'company-1',
    applicationId: 'app-1',
    votingRoundId: 'vr-1',
    voterId: 'user-2',
    voterName: 'John Smith',
    decision: 'HIRE',
    confidence: 85,
    reasoning: 'Excellent technical performance',
    votedAt: '2024-02-19T11:00:00Z',
  },
  {
    id: 'vote-3',
    companyId: 'company-1',
    applicationId: 'app-1',
    votingRoundId: 'vr-1',
    voterId: 'user-3',
    voterName: 'Jane Doe',
    decision: 'MAYBE',
    confidence: 60,
    reasoning: 'Good but concerned about system design experience',
    conditions: ['Needs mentorship in first 3 months'],
    votedAt: '2024-02-19T14:00:00Z',
  },
];

const mockDeadlines: EvaluationDeadline[] = [
  {
    id: 'dl-1',
    companyId: 'company-1',
    name: 'Interview Feedback Deadline',
    description: 'Feedback must be submitted within 24 hours',
    deadlineType: 'FEEDBACK_SUBMISSION',
    daysFromTrigger: 1,
    triggerEvent: 'INTERVIEW_COMPLETED',
    reminderSchedule: { daysBefore: [0], hoursBeforeDeadline: 4, notifyOverdue: true, overdueReminderIntervalHours: 12 },
    escalationRules: [
      { hoursOverdue: 24, escalateTo: ['user-1'], action: 'NOTIFY' },
      { hoursOverdue: 48, escalateTo: ['user-1'], action: 'REASSIGN' },
    ],
    createdBy: 'user-1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dl-2',
    companyId: 'company-1',
    name: 'Hiring Decision Vote',
    description: 'Vote must be cast within 3 days',
    deadlineType: 'VOTE_SUBMISSION',
    daysFromTrigger: 3,
    triggerEvent: 'STAGE_CHANGE',
    reminderSchedule: { daysBefore: [1], notifyOverdue: true },
    createdBy: 'user-1',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockDeadlineInstances: DeadlineInstance[] = [
  {
    id: 'dli-1',
    deadlineId: 'dl-1',
    applicationId: 'app-2',
    assigneeId: 'user-2',
    assigneeName: 'John Smith',
    dueDate: '2024-02-25T18:00:00Z',
    status: 'PENDING',
    remindersSent: 1,
    lastReminderAt: '2024-02-25T14:00:00Z',
    createdAt: '2024-02-24T18:00:00Z',
  },
  {
    id: 'dli-2',
    deadlineId: 'dl-1',
    applicationId: 'app-3',
    assigneeId: 'user-3',
    assigneeName: 'Jane Doe',
    dueDate: '2024-02-24T18:00:00Z',
    status: 'OVERDUE',
    remindersSent: 3,
    lastReminderAt: '2024-02-25T06:00:00Z',
    createdAt: '2024-02-23T18:00:00Z',
  },
];

const mockDisagreements: EvaluationDisagreement[] = [
  {
    id: 'dis-1',
    companyId: 'company-1',
    applicationId: 'app-4',
    feedbackIds: ['fb-3', 'fb-4'],
    disagreementType: 'SCORE_VARIANCE',
    criteriaInvolved: ['System Design'],
    scoreDifference: 2,
    description: 'Significant score difference on system design evaluation',
    suggestedResolution: 'Schedule calibration discussion',
    flaggedBy: 'user-1',
    status: 'OPEN',
    createdAt: '2024-02-22T10:00:00Z',
  },
  {
    id: 'dis-2',
    companyId: 'company-1',
    applicationId: 'app-5',
    feedbackIds: ['fb-5', 'fb-6'],
    disagreementType: 'RECOMMENDATION_CONFLICT',
    description: 'One interviewer recommends hire, other recommends no hire',
    flaggedBy: 'user-1',
    status: 'RESOLVED',
    resolution: 'After discussion, agreed on lean hire with mentorship',
    resolutionMethod: 'DISCUSSION',
    resolvedBy: 'user-1',
    resolvedAt: '2024-02-21T15:00:00Z',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-21T15:00:00Z',
  },
];

const mockComparisons: CandidateComparison[] = [
  {
    id: 'comp-1',
    companyId: 'company-1',
    jobId: 'job-1',
    applicationIds: ['app-1', 'app-2', 'app-3'],
    candidateCount: 3,
    comparisonCriteria: ['Problem Solving', 'Code Quality', 'Communication', 'Culture Fit'],
    scores: {
      'app-1': { applicationId: 'app-1', candidateName: 'Candidate A', criteriaScores: { 'Problem Solving': 4.5, 'Code Quality': 4.5, 'Communication': 4.5, 'Culture Fit': 4.5 }, overallScore: 4.5, rank: 1 },
      'app-2': { applicationId: 'app-2', candidateName: 'Candidate B', criteriaScores: { 'Problem Solving': 4.0, 'Code Quality': 4.0, 'Communication': 4.0, 'Culture Fit': 3.5 }, overallScore: 3.9, rank: 2 },
      'app-3': { applicationId: 'app-3', candidateName: 'Candidate C', criteriaScores: { 'Problem Solving': 3.5, 'Code Quality': 4.5, 'Communication': 3.5, 'Culture Fit': 4.0 }, overallScore: 3.9, rank: 3 },
    },
    rankings: [
      { applicationId: 'app-1', rank: 1, criteriaRanks: { 'Problem Solving': 1, 'Code Quality': 1, 'Communication': 1, 'Culture Fit': 1 } },
      { applicationId: 'app-2', rank: 2, criteriaRanks: { 'Problem Solving': 2, 'Code Quality': 3, 'Communication': 2, 'Culture Fit': 3 } },
      { applicationId: 'app-3', rank: 3, criteriaRanks: { 'Problem Solving': 3, 'Code Quality': 1, 'Communication': 3, 'Culture Fit': 2 } },
    ],
    notes: 'Candidate A is the strongest overall',
    createdBy: 'user-1',
    createdAt: '2024-02-25T10:00:00Z',
  },
];

const mockBenchmarks: HiringBenchmark[] = [
  {
    id: 'bench-1',
    companyId: 'company-1',
    jobId: 'job-1',
    benchmarkType: 'ROLE',
    periodStart: '2023-01-01T00:00:00Z',
    periodEnd: '2023-12-31T23:59:59Z',
    metrics: {
      averageOverallScore: 3.8,
      averageCriteriaScores: { 'Problem Solving': 3.9, 'Code Quality': 3.7, 'Communication': 4.0, 'Culture Fit': 3.8 },
      hireRate: 0.25,
      offerAcceptRate: 0.85,
      timeToHire: 28,
      qualityOfHire: 4.2,
      retention90Days: 0.95,
      retention1Year: 0.88,
    },
    thresholds: {
      minimumOverallScore: 3.0,
      minimumCriteriaScores: { 'Problem Solving': 3.0, 'Code Quality': 3.0, 'Communication': 2.5, 'Culture Fit': 3.0 },
      strongHireThreshold: 4.5,
      hireThreshold: 3.5,
      noHireThreshold: 2.5,
    },
    historicalData: [
      { date: '2023-Q1', metrics: { averageOverallScore: 3.7, hireRate: 0.22 }, candidateCount: 50, hiredCount: 11 },
      { date: '2023-Q2', metrics: { averageOverallScore: 3.8, hireRate: 0.24 }, candidateCount: 45, hiredCount: 11 },
      { date: '2023-Q3', metrics: { averageOverallScore: 3.9, hireRate: 0.27 }, candidateCount: 55, hiredCount: 15 },
      { date: '2023-Q4', metrics: { averageOverallScore: 3.8, hireRate: 0.26 }, candidateCount: 50, hiredCount: 13 },
    ],
    successIndicators: [
      { metric: 'Quality of Hire', value: 4.2, benchmark: 4.0, variance: 5, trend: 'UP' },
      { metric: '90-Day Retention', value: 95, benchmark: 90, variance: 5.5, trend: 'STABLE' },
    ],
    createdBy: 'user-1',
    createdAt: '2024-01-05T10:00:00Z',
  },
];

const mockStats: CollaborativeEvaluationStats = {
  scorecardTemplates: 8,
  feedbacksSubmitted: 145,
  aggregationsCreated: 52,
  calibrationSessions: 6,
  votingRounds: 48,
  disagreements: { total: 12, open: 3, resolved: 9 },
  candidateComparisons: 18,
  hiringBenchmarks: 4,
  avgFeedbackTimeMinutes: 32,
};

// ============================================================================
// 6.2.1 SCORECARD TEMPLATES API
// ============================================================================

export const scorecardTemplatesAPI = {
  create: async (data: Partial<ScorecardTemplate>): Promise<ScorecardTemplate> => {
    if (USE_MOCK) {
      const newTemplate: ScorecardTemplate = {
        ...data,
        id: `sct-${Date.now()}`,
        companyId: 'company-1',
        isActive: true,
        createdAt: new Date().toISOString(),
      } as ScorecardTemplate;
      return newTemplate;
    }
    const response = await axios.post(`${API_URL}/evaluation/scorecards`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAll: async (params?: { jobId?: string; interviewStage?: InterviewStageType; isActive?: boolean }): Promise<ScorecardTemplate[]> => {
    if (USE_MOCK) {
      let templates = [...mockScorecardTemplates];
      if (params?.jobId) templates = templates.filter(t => t.jobId === params.jobId);
      if (params?.interviewStage) templates = templates.filter(t => t.interviewStage === params.interviewStage);
      if (params?.isActive !== undefined) templates = templates.filter(t => t.isActive === params.isActive);
      return templates;
    }
    const response = await axios.get(`${API_URL}/evaluation/scorecards`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  getById: async (id: string): Promise<ScorecardTemplate> => {
    if (USE_MOCK) {
      const template = mockScorecardTemplates.find(t => t.id === id);
      if (!template) throw new Error('Template not found');
      return template;
    }
    const response = await axios.get(`${API_URL}/evaluation/scorecards/${id}`, { headers: getAuthHeaders() });
    return response.data.data;
  },

  update: async (id: string, data: Partial<ScorecardTemplate>): Promise<ScorecardTemplate> => {
    if (USE_MOCK) {
      const template = mockScorecardTemplates.find(t => t.id === id);
      if (!template) throw new Error('Template not found');
      return { ...template, ...data, updatedAt: new Date().toISOString() };
    }
    const response = await axios.put(`${API_URL}/evaluation/scorecards/${id}`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  clone: async (id: string, data: { name?: string; jobId?: string }): Promise<ScorecardTemplate> => {
    if (USE_MOCK) {
      const original = mockScorecardTemplates.find(t => t.id === id);
      if (!original) throw new Error('Template not found');
      return {
        ...original,
        id: `sct-${Date.now()}`,
        name: data.name || `${original.name} (Copy)`,
        jobId: data.jobId || original.jobId,
        createdAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_URL}/evaluation/scorecards/${id}/clone`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 6.2.2 INTERVIEW FEEDBACK API
// ============================================================================

export const interviewFeedbackAPI = {
  submit: async (data: Partial<InterviewFeedback>): Promise<InterviewFeedback> => {
    if (USE_MOCK) {
      const feedback: InterviewFeedback = {
        ...data,
        id: `fb-${Date.now()}`,
        companyId: 'company-1',
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      } as InterviewFeedback;
      return feedback;
    }
    const response = await axios.post(`${API_URL}/evaluation/feedback`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAll: async (params?: { applicationId?: string; evaluatorId?: string; status?: string }): Promise<InterviewFeedback[]> => {
    if (USE_MOCK) {
      let feedbacks = [...mockInterviewFeedbacks];
      if (params?.applicationId) feedbacks = feedbacks.filter(f => f.applicationId === params.applicationId);
      if (params?.evaluatorId) feedbacks = feedbacks.filter(f => f.evaluatorId === params.evaluatorId);
      if (params?.status) feedbacks = feedbacks.filter(f => f.status === params.status);
      return feedbacks;
    }
    const response = await axios.get(`${API_URL}/evaluation/feedback`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  getById: async (id: string): Promise<InterviewFeedback> => {
    if (USE_MOCK) {
      const feedback = mockInterviewFeedbacks.find(f => f.id === id);
      if (!feedback) throw new Error('Feedback not found');
      return feedback;
    }
    const response = await axios.get(`${API_URL}/evaluation/feedback/${id}`, { headers: getAuthHeaders() });
    return response.data.data;
  },

  update: async (id: string, data: Partial<InterviewFeedback>): Promise<InterviewFeedback> => {
    if (USE_MOCK) {
      const feedback = mockInterviewFeedbacks.find(f => f.id === id);
      if (!feedback) throw new Error('Feedback not found');
      return { ...feedback, ...data, updatedAt: new Date().toISOString() };
    }
    const response = await axios.put(`${API_URL}/evaluation/feedback/${id}`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  saveDraft: async (id: string, data: FeedbackDraft): Promise<InterviewFeedback> => {
    if (USE_MOCK) {
      return {
        ...data,
        id: id || `fb-draft-${Date.now()}`,
        companyId: 'company-1',
        evaluatorId: 'user-1',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      } as InterviewFeedback;
    }
    const response = await axios.post(`${API_URL}/evaluation/feedback/${id}/draft`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 6.2.3 BLIND EVALUATION API
// ============================================================================

export const blindEvaluationAPI = {
  configure: async (data: Partial<BlindEvaluationConfig>): Promise<BlindEvaluationConfig> => {
    if (USE_MOCK) {
      const config: BlindEvaluationConfig = {
        ...data,
        id: `blind-${Date.now()}`,
        companyId: 'company-1',
        isActive: true,
        createdAt: new Date().toISOString(),
      } as BlindEvaluationConfig;
      return config;
    }
    const response = await axios.post(`${API_URL}/evaluation/blind-evaluation`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getConfig: async (jobId: string): Promise<BlindEvaluationConfig | null> => {
    if (USE_MOCK) {
      return mockBlindConfig.jobId === jobId ? mockBlindConfig : null;
    }
    const response = await axios.get(`${API_URL}/evaluation/blind-evaluation/${jobId}`, { headers: getAuthHeaders() });
    return response.data.data;
  },

  update: async (id: string, data: Partial<BlindEvaluationConfig>): Promise<BlindEvaluationConfig> => {
    if (USE_MOCK) {
      return { ...mockBlindConfig, ...data, updatedAt: new Date().toISOString() };
    }
    const response = await axios.put(`${API_URL}/evaluation/blind-evaluation/${id}`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAnonymizedCandidate: async (jobId: string, applicationId: string): Promise<AnonymizedCandidate> => {
    if (USE_MOCK) {
      return {
        id: applicationId,
        anonymousId: `Candidate-${applicationId.slice(-4)}`,
        applicationId,
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        experience: '5+ years in software development',
        summary: 'Experienced full-stack developer with strong problem-solving skills',
        assessmentScores: { technical: 85, behavioral: 78 },
        blindMode: true,
      };
    }
    const response = await axios.get(`${API_URL}/evaluation/blind-evaluation/${jobId}/candidate/${applicationId}`, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 6.2.4 FEEDBACK AGGREGATION API
// ============================================================================

export const feedbackAggregationAPI = {
  create: async (data: Partial<FeedbackAggregation>): Promise<FeedbackAggregation> => {
    if (USE_MOCK) {
      const aggregation: FeedbackAggregation = {
        ...data,
        id: `agg-${Date.now()}`,
        companyId: 'company-1',
        aggregatedAt: new Date().toISOString(),
        aggregatedBy: 'user-1',
      } as FeedbackAggregation;
      return aggregation;
    }
    const response = await axios.post(`${API_URL}/evaluation/aggregation`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAll: async (params?: { applicationId?: string; interviewStage?: InterviewStageType }): Promise<FeedbackAggregation[]> => {
    if (USE_MOCK) {
      let aggregations = [...mockAggregations];
      if (params?.applicationId) aggregations = aggregations.filter(a => a.applicationId === params.applicationId);
      if (params?.interviewStage) aggregations = aggregations.filter(a => a.interviewStage === params.interviewStage);
      return aggregations;
    }
    const response = await axios.get(`${API_URL}/evaluation/aggregation`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  calculate: async (applicationId: string, interviewStage?: InterviewStageType): Promise<FeedbackAggregation> => {
    if (USE_MOCK) {
      return mockAggregations[0];
    }
    const response = await axios.post(`${API_URL}/evaluation/aggregation/calculate`, { applicationId, interviewStage }, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 6.2.5 CALIBRATION SESSIONS API
// ============================================================================

export const calibrationSessionsAPI = {
  create: async (data: Partial<CalibrationSession>): Promise<CalibrationSession> => {
    if (USE_MOCK) {
      const session: CalibrationSession = {
        ...data,
        id: `cal-${Date.now()}`,
        companyId: 'company-1',
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
      } as CalibrationSession;
      return session;
    }
    const response = await axios.post(`${API_URL}/evaluation/calibration`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAll: async (params?: { jobId?: string; status?: string; facilitatorId?: string }): Promise<CalibrationSession[]> => {
    if (USE_MOCK) {
      let sessions = [...mockCalibrationSessions];
      if (params?.jobId) sessions = sessions.filter(s => s.jobId === params.jobId);
      if (params?.status) sessions = sessions.filter(s => s.status === params.status);
      if (params?.facilitatorId) sessions = sessions.filter(s => s.facilitatorId === params.facilitatorId);
      return sessions;
    }
    const response = await axios.get(`${API_URL}/evaluation/calibration`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  update: async (id: string, data: Partial<CalibrationSession>): Promise<CalibrationSession> => {
    if (USE_MOCK) {
      const session = mockCalibrationSessions.find(s => s.id === id);
      if (!session) throw new Error('Session not found');
      return { ...session, ...data, updatedAt: new Date().toISOString() };
    }
    const response = await axios.put(`${API_URL}/evaluation/calibration/${id}`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  start: async (id: string): Promise<CalibrationSession> => {
    if (USE_MOCK) {
      const session = mockCalibrationSessions.find(s => s.id === id);
      if (!session) throw new Error('Session not found');
      return { ...session, status: 'IN_PROGRESS', actualStartTime: new Date().toISOString() };
    }
    const response = await axios.post(`${API_URL}/evaluation/calibration/${id}/start`, {}, { headers: getAuthHeaders() });
    return response.data.data;
  },

  complete: async (id: string, data: { outcomes?: any[]; adjustedRatings?: Record<string, number>; notes?: string; actionItems?: string[] }): Promise<CalibrationSession> => {
    if (USE_MOCK) {
      const session = mockCalibrationSessions.find(s => s.id === id);
      if (!session) throw new Error('Session not found');
      return { ...session, ...data, status: 'COMPLETED', actualEndTime: new Date().toISOString() };
    }
    const response = await axios.post(`${API_URL}/evaluation/calibration/${id}/complete`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 6.2.6 DECISION VOTING API
// ============================================================================

export const decisionVotingAPI = {
  createRound: async (data: Partial<VotingRoundSummary>): Promise<VotingRoundSummary> => {
    if (USE_MOCK) {
      const round: VotingRoundSummary = {
        ...data,
        id: `vr-${Date.now()}`,
        companyId: 'company-1',
        votesReceived: 0,
        status: 'OPEN',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
      } as VotingRoundSummary;
      return round;
    }
    const response = await axios.post(`${API_URL}/evaluation/voting`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  submitVote: async (data: Partial<HiringDecisionVote>): Promise<HiringDecisionVote> => {
    if (USE_MOCK) {
      const vote: HiringDecisionVote = {
        ...data,
        id: `vote-${Date.now()}`,
        companyId: 'company-1',
        voterId: 'user-1',
        votedAt: new Date().toISOString(),
      } as HiringDecisionVote;
      return vote;
    }
    const response = await axios.post(`${API_URL}/evaluation/voting/vote`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getVotes: async (params?: { applicationId?: string; votingRoundId?: string }): Promise<HiringDecisionVote[]> => {
    if (USE_MOCK) {
      let votes = [...mockVotes];
      if (params?.applicationId) votes = votes.filter(v => v.applicationId === params.applicationId);
      if (params?.votingRoundId) votes = votes.filter(v => v.votingRoundId === params.votingRoundId);
      return votes;
    }
    const response = await axios.get(`${API_URL}/evaluation/voting/votes`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  getRoundSummary: async (id: string): Promise<VotingRoundSummary & { votes: HiringDecisionVote[] }> => {
    if (USE_MOCK) {
      const round = mockVotingRounds.find(r => r.id === id);
      if (!round) throw new Error('Round not found');
      const votes = mockVotes.filter(v => v.votingRoundId === id);
      return { ...round, votes };
    }
    const response = await axios.get(`${API_URL}/evaluation/voting/${id}`, { headers: getAuthHeaders() });
    return response.data.data;
  },

  closeRound: async (id: string, data: { finalDecision?: VotingDecision; decisionNotes?: string }): Promise<VotingRoundSummary> => {
    if (USE_MOCK) {
      const round = mockVotingRounds.find(r => r.id === id);
      if (!round) throw new Error('Round not found');
      return { ...round, ...data, status: 'CLOSED', closedAt: new Date().toISOString(), closedBy: 'user-1' };
    }
    const response = await axios.post(`${API_URL}/evaluation/voting/${id}/close`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 6.2.7 EVALUATION DEADLINES API
// ============================================================================

export const evaluationDeadlinesAPI = {
  create: async (data: Partial<EvaluationDeadline>): Promise<EvaluationDeadline> => {
    if (USE_MOCK) {
      const deadline: EvaluationDeadline = {
        ...data,
        id: `dl-${Date.now()}`,
        companyId: 'company-1',
        isActive: true,
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
      } as EvaluationDeadline;
      return deadline;
    }
    const response = await axios.post(`${API_URL}/evaluation/deadlines`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAll: async (params?: { jobId?: string; isActive?: boolean }): Promise<EvaluationDeadline[]> => {
    if (USE_MOCK) {
      let deadlines = [...mockDeadlines];
      if (params?.jobId) deadlines = deadlines.filter(d => d.jobId === params.jobId);
      if (params?.isActive !== undefined) deadlines = deadlines.filter(d => d.isActive === params.isActive);
      return deadlines;
    }
    const response = await axios.get(`${API_URL}/evaluation/deadlines`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  update: async (id: string, data: Partial<EvaluationDeadline>): Promise<EvaluationDeadline> => {
    if (USE_MOCK) {
      const deadline = mockDeadlines.find(d => d.id === id);
      if (!deadline) throw new Error('Deadline not found');
      return { ...deadline, ...data, updatedAt: new Date().toISOString() };
    }
    const response = await axios.put(`${API_URL}/evaluation/deadlines/${id}`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getInstances: async (params?: { deadlineId?: string; applicationId?: string; status?: string; overdue?: boolean }): Promise<DeadlineInstance[]> => {
    if (USE_MOCK) {
      let instances = [...mockDeadlineInstances];
      if (params?.deadlineId) instances = instances.filter(i => i.deadlineId === params.deadlineId);
      if (params?.applicationId) instances = instances.filter(i => i.applicationId === params.applicationId);
      if (params?.status) instances = instances.filter(i => i.status === params.status);
      if (params?.overdue) instances = instances.filter(i => i.status === 'OVERDUE');
      return instances;
    }
    const response = await axios.get(`${API_URL}/evaluation/deadline-instances`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  updateInstanceStatus: async (id: string, data: { status: string; completedAt?: string; notes?: string }): Promise<DeadlineInstance> => {
    if (USE_MOCK) {
      const instance = mockDeadlineInstances.find(i => i.id === id);
      if (!instance) throw new Error('Instance not found');
      return { ...instance, ...data, updatedAt: new Date().toISOString() };
    }
    const response = await axios.patch(`${API_URL}/evaluation/deadline-instances/${id}/status`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 6.2.8 DISAGREEMENT RESOLUTION API
// ============================================================================

export const disagreementResolutionAPI = {
  flag: async (data: Partial<EvaluationDisagreement>): Promise<EvaluationDisagreement> => {
    if (USE_MOCK) {
      const disagreement: EvaluationDisagreement = {
        ...data,
        id: `dis-${Date.now()}`,
        companyId: 'company-1',
        flaggedBy: 'user-1',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      } as EvaluationDisagreement;
      return disagreement;
    }
    const response = await axios.post(`${API_URL}/evaluation/disagreements`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getAll: async (params?: { applicationId?: string; status?: string; disagreementType?: string }): Promise<EvaluationDisagreement[]> => {
    if (USE_MOCK) {
      let disagreements = [...mockDisagreements];
      if (params?.applicationId) disagreements = disagreements.filter(d => d.applicationId === params.applicationId);
      if (params?.status) disagreements = disagreements.filter(d => d.status === params.status);
      if (params?.disagreementType) disagreements = disagreements.filter(d => d.disagreementType === params.disagreementType);
      return disagreements;
    }
    const response = await axios.get(`${API_URL}/evaluation/disagreements`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  resolve: async (id: string, data: { resolution: string; resolutionMethod?: string; adjustedScores?: Record<string, number>; notes?: string }): Promise<EvaluationDisagreement> => {
    if (USE_MOCK) {
      const disagreement = mockDisagreements.find(d => d.id === id);
      if (!disagreement) throw new Error('Disagreement not found');
      return { ...disagreement, ...data, status: 'RESOLVED', resolvedBy: 'user-1', resolvedAt: new Date().toISOString() };
    }
    const response = await axios.post(`${API_URL}/evaluation/disagreements/${id}/resolve`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  escalate: async (id: string, data: { escalatedTo: string; escalationReason: string }): Promise<EvaluationDisagreement> => {
    if (USE_MOCK) {
      const disagreement = mockDisagreements.find(d => d.id === id);
      if (!disagreement) throw new Error('Disagreement not found');
      return { ...disagreement, ...data, status: 'ESCALATED', escalatedAt: new Date().toISOString() };
    }
    const response = await axios.post(`${API_URL}/evaluation/disagreements/${id}/escalate`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// 6.2.9 HISTORICAL COMPARISON API
// ============================================================================

export const historicalComparisonAPI = {
  createComparison: async (data: Partial<CandidateComparison>): Promise<CandidateComparison> => {
    if (USE_MOCK) {
      const comparison: CandidateComparison = {
        ...data,
        id: `comp-${Date.now()}`,
        companyId: 'company-1',
        candidateCount: data.applicationIds?.length || 0,
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
      } as CandidateComparison;
      return comparison;
    }
    const response = await axios.post(`${API_URL}/evaluation/comparisons`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getComparisons: async (params?: { jobId?: string; createdBy?: string }): Promise<CandidateComparison[]> => {
    if (USE_MOCK) {
      let comparisons = [...mockComparisons];
      if (params?.jobId) comparisons = comparisons.filter(c => c.jobId === params.jobId);
      if (params?.createdBy) comparisons = comparisons.filter(c => c.createdBy === params.createdBy);
      return comparisons;
    }
    const response = await axios.get(`${API_URL}/evaluation/comparisons`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  createBenchmark: async (data: Partial<HiringBenchmark>): Promise<HiringBenchmark> => {
    if (USE_MOCK) {
      const benchmark: HiringBenchmark = {
        ...data,
        id: `bench-${Date.now()}`,
        companyId: 'company-1',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
      } as HiringBenchmark;
      return benchmark;
    }
    const response = await axios.post(`${API_URL}/evaluation/benchmarks`, data, { headers: getAuthHeaders() });
    return response.data.data;
  },

  getBenchmarks: async (params?: { jobId?: string; benchmarkType?: string }): Promise<HiringBenchmark[]> => {
    if (USE_MOCK) {
      let benchmarks = [...mockBenchmarks];
      if (params?.jobId) benchmarks = benchmarks.filter(b => b.jobId === params.jobId);
      if (params?.benchmarkType) benchmarks = benchmarks.filter(b => b.benchmarkType === params.benchmarkType);
      return benchmarks;
    }
    const response = await axios.get(`${API_URL}/evaluation/benchmarks`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },

  compareToHistorical: async (jobId: string, applicationId: string): Promise<HistoricalComparison> => {
    if (USE_MOCK) {
      return {
        candidateScores: mockAggregations[0].aggregatedScores,
        benchmarkComparison: [{
          benchmarkId: 'bench-1',
          benchmarkType: 'ROLE',
          metrics: mockBenchmarks[0].metrics,
          thresholds: mockBenchmarks[0].thresholds,
          candidatePosition: 'ABOVE',
          percentile: 78,
        }],
        percentileRanking: { 'Problem Solving': 82, 'Code Quality': 90, 'Communication': 85, 'Culture Fit': 88 },
      };
    }
    const response = await axios.get(`${API_URL}/evaluation/benchmarks/${jobId}/compare/${applicationId}`, { headers: getAuthHeaders() });
    return response.data.data;
  },
};

// ============================================================================
// STATS API
// ============================================================================

export const evaluationStatsAPI = {
  getStats: async (params?: { jobId?: string; startDate?: string; endDate?: string }): Promise<CollaborativeEvaluationStats> => {
    if (USE_MOCK) {
      return mockStats;
    }
    const response = await axios.get(`${API_URL}/evaluation/stats`, { params, headers: getAuthHeaders() });
    return response.data.data;
  },
};
