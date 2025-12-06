import axios from 'axios';
import {
  AIScreeningInterview,
  QuestionFlow,
  ScreeningQuestion,
  ScreeningResponse,
  FollowUpRule,
  ScreeningTemplate,
  CandidateAccessibilityPrefs,
  ChatMessage,
  ScreeningStats,
  FollowUpEvaluationResult,
  CreateScreeningInterviewInput,
  CreateQuestionFlowInput,
  UpdateQuestionFlowInput,
  AddScreeningQuestionInput,
  SubmitScreeningResponseInput,
  ReviewScreeningResponseInput,
  AddFollowUpRuleInput,
  CreateScreeningTemplateInput,
  UpdateAccessibilityPrefsInput,
  StartInterviewInput,
  SubmitChatResponseInput,
  ScreeningInterviewType,
  ScreeningInterviewStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Configure axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/screening`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// MOCK DATA
// ============================================

const mockScreeningInterviews: AIScreeningInterview[] = [
  {
    id: 'interview-1',
    candidateId: 'candidate-1',
    recruiterId: 'recruiter-1',
    jobId: 'job-1',
    interviewType: 'VIDEO_ASYNC',
    title: 'Senior Frontend Developer Screening',
    description: 'Initial screening for React/TypeScript position',
    inviteToken: 'token-abc123',
    status: 'PENDING',
    totalQuestions: 8,
    completedQuestions: 0,
    currentQuestionIndex: 0,
    totalTimeLimit: 45,
    perQuestionTimeLimit: 5,
    language: 'en',
    aiTone: 'PROFESSIONAL',
    enableSmallTalk: true,
    recordingConsent: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isArchived: false,
    deadlineExtensions: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    candidate: {
      id: 'candidate-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    job: {
      id: 'job-1',
      title: 'Senior Frontend Developer',
      companyName: 'TechCorp',
    },
    _count: { responses: 0 },
  },
  {
    id: 'interview-2',
    candidateId: 'candidate-2',
    recruiterId: 'recruiter-1',
    jobId: 'job-2',
    interviewType: 'CHAT',
    title: 'Product Manager Initial Screen',
    description: 'Chat-based screening for PM role',
    inviteToken: 'token-def456',
    status: 'IN_PROGRESS',
    totalQuestions: 10,
    completedQuestions: 4,
    currentQuestionIndex: 4,
    language: 'en',
    aiTone: 'FRIENDLY',
    enableSmallTalk: true,
    recordingConsent: true,
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isArchived: false,
    deadlineExtensions: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    candidate: {
      id: 'candidate-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
    },
    job: {
      id: 'job-2',
      title: 'Product Manager',
      companyName: 'TechCorp',
    },
    _count: { responses: 4 },
  },
  {
    id: 'interview-3',
    candidateId: 'candidate-3',
    recruiterId: 'recruiter-1',
    jobId: 'job-1',
    interviewType: 'PHONE',
    title: 'Backend Developer Phone Screen',
    description: 'AI phone screening for Node.js position',
    inviteToken: 'token-ghi789',
    status: 'COMPLETED',
    totalQuestions: 6,
    completedQuestions: 6,
    currentQuestionIndex: 6,
    language: 'en',
    aiTone: 'PROFESSIONAL',
    enableSmallTalk: false,
    recordingConsent: true,
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
    overallScore: 8.5,
    isArchived: false,
    deadlineExtensions: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    candidate: {
      id: 'candidate-3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.j@example.com',
    },
    job: {
      id: 'job-1',
      title: 'Backend Developer',
      companyName: 'TechCorp',
    },
    _count: { responses: 6 },
  },
];

const mockQuestionFlows: QuestionFlow[] = [
  {
    id: 'flow-1',
    createdById: 'recruiter-1',
    name: 'Frontend Developer Screening',
    description: 'Standard screening flow for frontend positions',
    category: 'ENGINEERING',
    targetRole: 'Frontend Developer',
    targetLevel: 'Senior',
    interviewType: 'VIDEO_ASYNC',
    supportedLanguages: ['en', 'es', 'fr'],
    defaultLanguage: 'en',
    estimatedDuration: 30,
    defaultTimePerQuestion: 180,
    isTemplate: true,
    isActive: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 8, screeningInterviews: 12 },
  },
  {
    id: 'flow-2',
    createdById: 'recruiter-1',
    name: 'Product Manager Assessment',
    description: 'Behavioral and situational questions for PM roles',
    category: 'PRODUCT',
    targetRole: 'Product Manager',
    targetLevel: 'Mid-Senior',
    interviewType: 'CHAT',
    supportedLanguages: ['en'],
    defaultLanguage: 'en',
    estimatedDuration: 25,
    isTemplate: true,
    isActive: true,
    version: 2,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 10, screeningInterviews: 8 },
  },
];

const mockQuestions: ScreeningQuestion[] = [
  {
    id: 'question-1',
    flowId: 'flow-1',
    questionText: 'Tell me about your experience with React and TypeScript. What complex features have you implemented?',
    questionType: 'BEHAVIORAL',
    category: 'Technical Experience',
    expectedResponseType: 'VIDEO',
    maxResponseDuration: 180,
    allowRetakes: true,
    maxRetakes: 2,
    orderIndex: 0,
    isRequired: true,
    difficulty: 'MEDIUM',
    maxPoints: 10,
    hint: 'Focus on specific projects and technical challenges you overcame',
    aiFollowUpEnabled: true,
    hasAudioDescription: false,
    hasSignLanguage: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'question-2',
    flowId: 'flow-1',
    questionText: 'How do you approach performance optimization in frontend applications?',
    questionType: 'TECHNICAL',
    category: 'Technical Skills',
    expectedResponseType: 'VIDEO',
    maxResponseDuration: 120,
    allowRetakes: true,
    maxRetakes: 1,
    orderIndex: 1,
    isRequired: true,
    difficulty: 'HARD',
    maxPoints: 15,
    aiFollowUpEnabled: true,
    hasAudioDescription: false,
    hasSignLanguage: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'question-3',
    flowId: 'flow-1',
    questionText: 'What testing strategies do you use for React components?',
    questionType: 'TECHNICAL',
    category: 'Testing',
    expectedResponseType: 'TEXT',
    maxResponseLength: 1000,
    allowRetakes: false,
    maxRetakes: 0,
    orderIndex: 2,
    isRequired: true,
    difficulty: 'MEDIUM',
    maxPoints: 10,
    options: ['Unit Testing', 'Integration Testing', 'E2E Testing', 'All of the above'],
    aiFollowUpEnabled: false,
    hasAudioDescription: false,
    hasSignLanguage: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockResponses: ScreeningResponse[] = [
  {
    id: 'response-1',
    interviewId: 'interview-3',
    questionId: 'question-1',
    userId: 'candidate-3',
    responseType: 'VIDEO',
    videoUrl: 'https://example.com/videos/response-1.mp4',
    transcription: 'I have extensive experience with React and TypeScript...',
    timeSpentSeconds: 145,
    retakeNumber: 0,
    aiScore: 8.5,
    aiSummary: 'Strong technical background with practical examples',
    aiKeywords: ['React', 'TypeScript', 'hooks', 'state management'],
    aiSentiment: 'POSITIVE',
    aiConfidenceLevel: 0.92,
    status: 'REVIEWED',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    selectedOptions: [],
    question: {
      id: 'question-1',
      questionText: 'Tell me about your experience with React and TypeScript.',
      questionType: 'BEHAVIORAL',
      maxPoints: 10,
    },
  },
];

const mockFollowUpRules: FollowUpRule[] = [
  {
    id: 'rule-1',
    flowId: 'flow-1',
    triggerQuestionId: 'question-1',
    conditionType: 'KEYWORD_MATCH',
    conditionValue: { keywords: ['state management', 'Redux', 'Zustand'] },
    conditionOperator: 'CONTAINS_ANY',
    actionType: 'ASK_FOLLOW_UP',
    followUpQuestionId: 'question-followup-1',
    additionalQuestionIds: [],
    useAIGeneration: false,
    priority: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    triggerQuestion: { id: 'question-1', questionText: 'Tell me about your React experience' },
    followUpQuestion: { id: 'question-followup-1', questionText: 'Can you elaborate on your state management approach?' },
  },
  {
    id: 'rule-2',
    flowId: 'flow-1',
    triggerQuestionId: 'question-2',
    conditionType: 'SCORE_THRESHOLD',
    conditionValue: { threshold: 5, comparison: 'LESS_THAN' },
    conditionOperator: 'LESS_THAN',
    actionType: 'ADD_QUESTIONS',
    additionalQuestionIds: ['question-extra-1', 'question-extra-2'],
    useAIGeneration: false,
    priority: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    triggerQuestion: { id: 'question-2', questionText: 'Performance optimization approach' },
  },
];

const mockTemplates: ScreeningTemplate[] = [
  {
    id: 'template-1',
    name: 'Technical Interview - Engineering',
    description: 'Standard technical screening for engineering roles',
    category: 'ENGINEERING',
    interviewType: 'VIDEO_ASYNC',
    defaultDuration: 45,
    defaultTimePerQuestion: 180,
    aiTone: 'PROFESSIONAL',
    smallTalkEnabled: true,
    smallTalkPrompts: ['How are you today?', 'Thank you for taking the time to speak with us.'],
    supportedLanguages: ['en', 'es', 'fr', 'de'],
    defaultLanguage: 'en',
    welcomeMessage: 'Welcome to your technical screening interview!',
    completionMessage: 'Thank you for completing the interview. We will be in touch soon.',
    isPublic: true,
    usageCount: 156,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-2',
    name: 'Behavioral Assessment',
    description: 'Behavioral and situational questions for any role',
    category: 'GENERAL',
    interviewType: 'CHAT',
    defaultDuration: 30,
    aiTone: 'FRIENDLY',
    smallTalkEnabled: true,
    smallTalkPrompts: ['Great to meet you!', 'Let\'s have a casual conversation.'],
    supportedLanguages: ['en'],
    defaultLanguage: 'en',
    isPublic: true,
    usageCount: 89,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockAccessibilityPrefs: CandidateAccessibilityPrefs = {
  id: 'prefs-1',
  candidateId: 'candidate-1',
  needsScreenReader: false,
  needsHighContrast: false,
  needsLargeText: false,
  needsKeyboardNav: true,
  needsCaptions: true,
  needsSignLanguage: false,
  needsAudioDescriptions: false,
  needsExtendedTime: false,
  timeExtensionPercent: 50,
  needsBreaks: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStats: ScreeningStats = {
  total: 45,
  completed: 28,
  inProgress: 8,
  pending: 9,
  completionRate: '62.22',
  avgScore: '7.45',
};

// ============================================
// API FUNCTIONS
// ============================================

// Screening Interviews
export const createScreeningInterview = async (data: CreateScreeningInterviewInput): Promise<AIScreeningInterview> => {
  if (USE_MOCK) {
    const newInterview: AIScreeningInterview = {
      id: `interview-${Date.now()}`,
      ...data,
      candidateId: data.candidateId,
      recruiterId: 'recruiter-1',
      interviewType: data.interviewType || 'VIDEO_ASYNC',
      title: data.title,
      inviteToken: `token-${Date.now()}`,
      status: 'PENDING',
      totalQuestions: 0,
      completedQuestions: 0,
      currentQuestionIndex: 0,
      language: data.language || 'en',
      aiTone: data.aiTone || 'PROFESSIONAL',
      enableSmallTalk: data.enableSmallTalk !== false,
      recordingConsent: false,
      isArchived: false,
      deadlineExtensions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newInterview;
  }
  const response = await api.post('/interviews', data);
  return response.data;
};

export const getScreeningInterviews = async (params?: {
  status?: ScreeningInterviewStatus;
  jobId?: string;
  interviewType?: ScreeningInterviewType;
  page?: number;
  limit?: number;
}): Promise<{ interviews: AIScreeningInterview[]; total: number; page: number; limit: number }> => {
  if (USE_MOCK) {
    let filtered = [...mockScreeningInterviews];
    if (params?.status) filtered = filtered.filter(i => i.status === params.status);
    if (params?.jobId) filtered = filtered.filter(i => i.jobId === params.jobId);
    if (params?.interviewType) filtered = filtered.filter(i => i.interviewType === params.interviewType);
    return { interviews: filtered, total: filtered.length, page: params?.page || 1, limit: params?.limit || 20 };
  }
  const response = await api.get('/interviews', { params });
  return response.data;
};

export const getCandidateInterviews = async (status?: ScreeningInterviewStatus): Promise<AIScreeningInterview[]> => {
  if (USE_MOCK) {
    return mockScreeningInterviews.filter(i => !status || i.status === status);
  }
  const response = await api.get('/candidate/interviews', { params: { status } });
  return response.data;
};

export const getInterviewByToken = async (token: string): Promise<AIScreeningInterview> => {
  if (USE_MOCK) {
    const interview = mockScreeningInterviews.find(i => i.inviteToken === token);
    if (!interview) throw new Error('Interview not found');
    return { ...interview, questionFlow: mockQuestionFlows[0], questions: mockQuestions } as any;
  }
  const response = await api.get(`/public/${token}`);
  return response.data;
};

export const startInterview = async (token: string, data: StartInterviewInput): Promise<AIScreeningInterview> => {
  if (USE_MOCK) {
    const interview = mockScreeningInterviews.find(i => i.inviteToken === token);
    if (!interview) throw new Error('Interview not found');
    return { ...interview, status: 'IN_PROGRESS', startedAt: new Date().toISOString(), recordingConsent: data.recordingConsent || false };
  }
  const response = await api.post(`/public/${token}/start`, data);
  return response.data;
};

export const completeInterview = async (id: string): Promise<AIScreeningInterview> => {
  if (USE_MOCK) {
    const interview = mockScreeningInterviews.find(i => i.id === id);
    if (!interview) throw new Error('Interview not found');
    return { ...interview, status: 'COMPLETED', completedAt: new Date().toISOString(), overallScore: 7.8 };
  }
  const response = await api.patch(`/public/${id}/complete`);
  return response.data;
};

export const cancelInterview = async (id: string): Promise<AIScreeningInterview> => {
  if (USE_MOCK) {
    const interview = mockScreeningInterviews.find(i => i.id === id);
    if (!interview) throw new Error('Interview not found');
    return { ...interview, status: 'CANCELLED' };
  }
  const response = await api.patch(`/interviews/${id}/cancel`);
  return response.data;
};

export const extendDeadline = async (id: string, additionalDays: number): Promise<AIScreeningInterview> => {
  if (USE_MOCK) {
    const interview = mockScreeningInterviews.find(i => i.id === id);
    if (!interview) throw new Error('Interview not found');
    const newExpiry = new Date(interview.expiresAt || Date.now());
    newExpiry.setDate(newExpiry.getDate() + additionalDays);
    return { ...interview, expiresAt: newExpiry.toISOString(), deadlineExtensions: interview.deadlineExtensions + 1 };
  }
  const response = await api.patch(`/interviews/${id}/extend`, { additionalDays });
  return response.data;
};

// Question Flows
export const createQuestionFlow = async (data: CreateQuestionFlowInput): Promise<QuestionFlow> => {
  if (USE_MOCK) {
    const newFlow: QuestionFlow = {
      id: `flow-${Date.now()}`,
      createdById: 'recruiter-1',
      ...data,
      name: data.name,
      interviewType: data.interviewType || 'VIDEO_ASYNC',
      supportedLanguages: data.supportedLanguages || ['en'],
      defaultLanguage: data.defaultLanguage || 'en',
      isTemplate: data.isTemplate || false,
      isActive: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newFlow;
  }
  const response = await api.post('/flows', data);
  return response.data;
};

export const getQuestionFlows = async (params?: {
  category?: string;
  isTemplate?: boolean;
  jobId?: string;
}): Promise<QuestionFlow[]> => {
  if (USE_MOCK) {
    let filtered = [...mockQuestionFlows];
    if (params?.category) filtered = filtered.filter(f => f.category === params.category);
    if (params?.isTemplate !== undefined) filtered = filtered.filter(f => f.isTemplate === params.isTemplate);
    if (params?.jobId) filtered = filtered.filter(f => f.jobId === params.jobId);
    return filtered;
  }
  const response = await api.get('/flows', { params });
  return response.data;
};

export const getQuestionFlowWithQuestions = async (id: string): Promise<QuestionFlow> => {
  if (USE_MOCK) {
    const flow = mockQuestionFlows.find(f => f.id === id);
    if (!flow) throw new Error('Question flow not found');
    return { ...flow, questions: mockQuestions.filter(q => q.flowId === id), followUpRules: mockFollowUpRules.filter(r => r.flowId === id) };
  }
  const response = await api.get(`/flows/${id}`);
  return response.data;
};

export const updateQuestionFlow = async (id: string, data: UpdateQuestionFlowInput): Promise<QuestionFlow> => {
  if (USE_MOCK) {
    const flow = mockQuestionFlows.find(f => f.id === id);
    if (!flow) throw new Error('Question flow not found');
    return { ...flow, ...data, updatedAt: new Date().toISOString() };
  }
  const response = await api.patch(`/flows/${id}`, data);
  return response.data;
};

export const deleteQuestionFlow = async (id: string): Promise<void> => {
  if (USE_MOCK) return;
  await api.delete(`/flows/${id}`);
};

// Questions
export const addQuestion = async (flowId: string, data: AddScreeningQuestionInput): Promise<ScreeningQuestion> => {
  if (USE_MOCK) {
    const newQuestion: ScreeningQuestion = {
      id: `question-${Date.now()}`,
      flowId,
      ...data,
      questionText: data.questionText,
      questionType: data.questionType || 'TEXT',
      expectedResponseType: data.expectedResponseType || 'VIDEO',
      allowRetakes: data.allowRetakes !== false,
      maxRetakes: data.maxRetakes || 2,
      orderIndex: data.orderIndex || mockQuestions.length,
      isRequired: data.isRequired !== false,
      difficulty: data.difficulty || 'MEDIUM',
      maxPoints: data.maxPoints || 10,
      aiFollowUpEnabled: data.aiFollowUpEnabled !== false,
      hasAudioDescription: data.hasAudioDescription || false,
      hasSignLanguage: data.hasSignLanguage || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newQuestion;
  }
  const response = await api.post(`/flows/${flowId}/questions`, data);
  return response.data;
};

export const updateQuestion = async (id: string, data: Partial<AddScreeningQuestionInput>): Promise<ScreeningQuestion> => {
  if (USE_MOCK) {
    const question = mockQuestions.find(q => q.id === id);
    if (!question) throw new Error('Question not found');
    return { ...question, ...data, updatedAt: new Date().toISOString() };
  }
  const response = await api.patch(`/questions/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  if (USE_MOCK) return;
  await api.delete(`/questions/${id}`);
};

export const reorderQuestions = async (flowId: string, questionIds: string[]): Promise<void> => {
  if (USE_MOCK) return;
  await api.post(`/flows/${flowId}/questions/reorder`, { questionIds });
};

// Responses
export const submitResponse = async (
  interviewId: string,
  questionId: string,
  data: SubmitScreeningResponseInput
): Promise<ScreeningResponse> => {
  if (USE_MOCK) {
    const newResponse: ScreeningResponse = {
      id: `response-${Date.now()}`,
      interviewId,
      questionId,
      ...data,
      responseType: data.responseType,
      selectedOptions: data.selectedOptions || [],
      retakeNumber: 0,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newResponse;
  }
  const response = await api.post(`/interviews/${interviewId}/questions/${questionId}/respond`, data);
  return response.data;
};

export const getInterviewResponses = async (interviewId: string): Promise<ScreeningResponse[]> => {
  if (USE_MOCK) {
    return mockResponses.filter(r => r.interviewId === interviewId);
  }
  const response = await api.get(`/interviews/${interviewId}/responses`);
  return response.data;
};

export const reviewResponse = async (id: string, data: ReviewScreeningResponseInput): Promise<ScreeningResponse> => {
  if (USE_MOCK) {
    const resp = mockResponses.find(r => r.id === id);
    if (!resp) throw new Error('Response not found');
    return { ...resp, ...data, status: 'REVIEWED', reviewedAt: new Date().toISOString() };
  }
  const response = await api.patch(`/responses/${id}/review`, data);
  return response.data;
};

// Follow-Up Rules
export const addFollowUpRule = async (flowId: string, data: AddFollowUpRuleInput): Promise<FollowUpRule> => {
  if (USE_MOCK) {
    const newRule: FollowUpRule = {
      id: `rule-${Date.now()}`,
      flowId,
      ...data,
      conditionOperator: data.conditionOperator || 'EQUALS',
      additionalQuestionIds: data.additionalQuestionIds || [],
      useAIGeneration: data.useAIGeneration || false,
      priority: data.priority || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newRule;
  }
  const response = await api.post(`/flows/${flowId}/follow-ups`, data);
  return response.data;
};

export const updateFollowUpRule = async (id: string, data: Partial<AddFollowUpRuleInput>): Promise<FollowUpRule> => {
  if (USE_MOCK) {
    const rule = mockFollowUpRules.find(r => r.id === id);
    if (!rule) throw new Error('Rule not found');
    return { ...rule, ...data, updatedAt: new Date().toISOString() };
  }
  const response = await api.patch(`/follow-ups/${id}`, data);
  return response.data;
};

export const deleteFollowUpRule = async (id: string): Promise<void> => {
  if (USE_MOCK) return;
  await api.delete(`/follow-ups/${id}`);
};

export const evaluateFollowUps = async (responseId: string): Promise<FollowUpEvaluationResult> => {
  if (USE_MOCK) {
    return {
      responseId,
      triggeredRules: [],
      nextAction: null,
      followUpQuestionId: null,
    };
  }
  const response = await api.get(`/responses/${responseId}/evaluate-follow-ups`);
  return response.data;
};

// Templates
export const getScreeningTemplates = async (params?: {
  category?: string;
  interviewType?: ScreeningInterviewType;
}): Promise<ScreeningTemplate[]> => {
  if (USE_MOCK) {
    let filtered = [...mockTemplates];
    if (params?.category) filtered = filtered.filter(t => t.category === params.category);
    if (params?.interviewType) filtered = filtered.filter(t => t.interviewType === params.interviewType);
    return filtered;
  }
  const response = await api.get('/templates', { params });
  return response.data;
};

export const createScreeningTemplate = async (data: CreateScreeningTemplateInput): Promise<ScreeningTemplate> => {
  if (USE_MOCK) {
    const newTemplate: ScreeningTemplate = {
      id: `template-${Date.now()}`,
      ...data,
      name: data.name,
      interviewType: data.interviewType || 'VIDEO_ASYNC',
      aiTone: data.aiTone || 'PROFESSIONAL',
      smallTalkEnabled: data.smallTalkEnabled !== false,
      smallTalkPrompts: data.smallTalkPrompts || [],
      supportedLanguages: data.supportedLanguages || ['en'],
      defaultLanguage: data.defaultLanguage || 'en',
      isPublic: data.isPublic || false,
      usageCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newTemplate;
  }
  const response = await api.post('/templates', data);
  return response.data;
};

// Accessibility
export const getAccessibilityPrefs = async (): Promise<CandidateAccessibilityPrefs> => {
  if (USE_MOCK) {
    return mockAccessibilityPrefs;
  }
  const response = await api.get('/candidate/accessibility');
  return response.data;
};

export const updateAccessibilityPrefs = async (data: UpdateAccessibilityPrefsInput): Promise<CandidateAccessibilityPrefs> => {
  if (USE_MOCK) {
    return { ...mockAccessibilityPrefs, ...data, updatedAt: new Date().toISOString() };
  }
  const response = await api.patch('/candidate/accessibility', data);
  return response.data;
};

// Chat-Based Screening
export const getChatMessage = async (interviewId: string): Promise<ChatMessage> => {
  if (USE_MOCK) {
    return {
      type: 'QUESTION',
      questionId: 'question-1',
      message: 'Tell me about your experience with React and TypeScript. What complex features have you implemented?',
      questionType: 'BEHAVIORAL',
      expectedResponseType: 'TEXT',
      timeLimit: 180,
      hint: 'Focus on specific projects and technical challenges',
    };
  }
  const response = await api.get(`/chat/${interviewId}/message`);
  return response.data;
};

export const submitChatResponse = async (
  interviewId: string,
  data: SubmitChatResponseInput
): Promise<{ response: ScreeningResponse; isComplete: boolean }> => {
  if (USE_MOCK) {
    const newResponse: ScreeningResponse = {
      id: `response-${Date.now()}`,
      interviewId,
      questionId: data.questionId,
      responseType: data.responseType || 'TEXT',
      textResponse: data.message,
      selectedOptions: [],
      retakeNumber: 0,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { response: newResponse, isComplete: false };
  }
  const response = await api.post(`/chat/${interviewId}/respond`, data);
  return response.data;
};

// Statistics
export const getScreeningStats = async (): Promise<ScreeningStats> => {
  if (USE_MOCK) {
    return mockStats;
  }
  const response = await api.get('/stats');
  return response.data;
};

export default {
  // Interviews
  createScreeningInterview,
  getScreeningInterviews,
  getCandidateInterviews,
  getInterviewByToken,
  startInterview,
  completeInterview,
  cancelInterview,
  extendDeadline,
  // Question Flows
  createQuestionFlow,
  getQuestionFlows,
  getQuestionFlowWithQuestions,
  updateQuestionFlow,
  deleteQuestionFlow,
  // Questions
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  // Responses
  submitResponse,
  getInterviewResponses,
  reviewResponse,
  // Follow-Up Rules
  addFollowUpRule,
  updateFollowUpRule,
  deleteFollowUpRule,
  evaluateFollowUps,
  // Templates
  getScreeningTemplates,
  createScreeningTemplate,
  // Accessibility
  getAccessibilityPrefs,
  updateAccessibilityPrefs,
  // Chat
  getChatMessage,
  submitChatResponse,
  // Stats
  getScreeningStats,
};
