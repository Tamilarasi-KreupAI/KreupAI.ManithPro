import axios from 'axios';
import {
  InterviewTranscription,
  AnswerAnalysis,
  TopicDetection,
  SentimentAnalysis,
  CommunicationScore,
  TechnicalVerification,
  RedFlagAlert,
  InterviewSummary,
  InterviewHighlight,
  CandidateComparison,
  FullAnalysisResult,
  CreateTranscriptionInput,
  AnalyzeAnswerInput,
  DetectTopicsInput,
  AnalyzeSentimentInput,
  CalculateCommunicationScoreInput,
  VerifyTechnicalClaimInput,
  ReviewRedFlagInput,
  ApproveSummaryInput,
  UpdateRecommendationInput,
  BookmarkHighlightInput,
  ShareHighlightInput,
  CreateComparisonInput,
  ShareComparisonInput,
  RedFlagSeverity,
  HighlightType,
  HighlightImportance,
  ComparisonStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const api = axios.create({
  baseURL: `${API_BASE_URL}/analysis`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ============================================
// MOCK DATA
// ============================================

const mockTranscription: InterviewTranscription = {
  id: 'trans-1',
  interviewId: 'interview-1',
  sourceType: 'VIDEO',
  rawTranscript: 'The candidate discussed their experience with React and TypeScript extensively...',
  formattedTranscript: '[00:00] Interviewer: Tell me about your React experience.\n[00:15] Candidate: I have been working with React for 5 years...',
  language: 'en',
  transcriptionEngine: 'WHISPER',
  confidence: 0.92,
  wordCount: 1250,
  audioQuality: 'GOOD',
  status: 'COMPLETED',
  processingTime: 5000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAnswerAnalysis: AnswerAnalysis = {
  id: 'analysis-1',
  interviewId: 'interview-1',
  questionText: 'Tell me about your experience with React',
  questionType: 'BEHAVIORAL',
  answerText: 'I have been working with React for 5 years...',
  answerLength: 150,
  expectedKeywords: ['React', 'components', 'hooks'],
  overallScore: 82,
  relevanceScore: 88,
  completenessScore: 78,
  depthScore: 75,
  clarityScore: 85,
  structureScore: 80,
  specificityScore: 72,
  strengths: ['Clear communication', 'Good examples', 'Technical depth'],
  weaknesses: ['Could include more metrics'],
  keyPoints: ['5 years React experience', 'Led migration to hooks', 'Performance optimization'],
  missingElements: ['Team collaboration details', 'Specific metrics'],
  suggestions: ['Include quantifiable results', 'Mention team dynamics'],
  confidenceLevel: 0.88,
  aiReasoning: 'Strong technical response with clear examples but lacking specific metrics.',
  analyzedAt: new Date().toISOString(),
};

const mockTopicDetection: TopicDetection = {
  id: 'topic-1',
  interviewId: 'interview-1',
  topics: [
    { topic: 'React Development', relevance: 0.95, frequency: 12, context: ['frontend'] },
    { topic: 'State Management', relevance: 0.85, frequency: 8, context: ['Redux', 'Context'] },
  ],
  primaryTopics: ['React Development', 'State Management'],
  secondaryTopics: ['Testing', 'Performance'],
  keywords: [
    { keyword: 'React', count: 15, importance: 0.95 },
    { keyword: 'TypeScript', count: 10, importance: 0.88 },
  ],
  technicalKeywords: ['React', 'TypeScript', 'hooks'],
  softSkillKeywords: ['leadership', 'communication'],
  industryKeywords: ['agile', 'CI/CD'],
  expectedTopics: ['React', 'TypeScript', 'Testing'],
  coveredExpected: ['React', 'TypeScript'],
  missedTopics: ['Testing'],
  unexpectedTopics: [],
  topicCoverageScore: 85,
  topicDepthScore: 78,
  relevanceScore: 88,
  analyzedAt: new Date().toISOString(),
};

const mockSentimentAnalysis: SentimentAnalysis = {
  id: 'sentiment-1',
  interviewId: 'interview-1',
  overallSentiment: 'POSITIVE',
  sentimentScore: 0.72,
  sentimentConfidence: 0.88,
  emotions: { joy: 0.3, enthusiasm: 0.6, confidence: 0.7 },
  dominantEmotion: 'enthusiasm',
  emotionalVariation: 0.35,
  confidenceLevel: 'HIGH',
  confidenceScore: 82,
  hesitationMarkers: 3,
  fillerWords: { um: 2, uh: 1 },
  enthusiasmScore: 78,
  passionIndicators: ['excited about technology', 'passionate about learning'],
  authenticityScore: 85,
  consistencyScore: 88,
  sentimentTrend: 'IMPROVING',
  voiceEnergy: 72,
  speechPace: 'NORMAL',
  analyzedAt: new Date().toISOString(),
};

const mockCommunicationScore: CommunicationScore = {
  id: 'comm-1',
  interviewId: 'interview-1',
  overallScore: 78,
  clarityScore: 82,
  articulationScore: 75,
  vocabularyScore: 80,
  grammarScore: 88,
  coherenceScore: 76,
  structureScore: 72,
  conciseness: 70,
  relevance: 85,
  professionalismScore: 88,
  engagementScore: 78,
  listeningIndicators: 75,
  technicalClarity: 80,
  useOfExamples: 82,
  strengths: ['Clear articulation', 'Good vocabulary', 'Professional tone'],
  areasForImprovement: ['Be more concise', 'Improve structure'],
  recommendations: ['Use STAR method', 'Practice concise responses'],
  percentile: 72,
  benchmarkRole: 'Software Engineer',
  analyzedAt: new Date().toISOString(),
};

const mockTechnicalVerification: TechnicalVerification = {
  id: 'verify-1',
  interviewId: 'interview-1',
  claimText: 'Improved application performance by 40%',
  claimType: 'METRIC',
  verificationStatus: 'VERIFIED',
  accuracyScore: 85,
  confidenceLevel: 0.82,
  technicalDepth: 'INTERMEDIATE',
  isCurrent: true,
  relevanceToRole: 90,
  potentialIssues: [],
  exaggerationRisk: 15,
  followUpQuestions: ['How did you measure the improvement?'],
  verifiedAt: new Date().toISOString(),
};

const mockRedFlagAlert: RedFlagAlert = {
  id: 'flag-1',
  interviewId: 'interview-1',
  flagType: 'INCONSISTENCY',
  severity: 'MEDIUM',
  title: 'Timeline Discrepancy',
  description: 'Mentioned dates do not align with resume.',
  confidence: 0.72,
  patterns: ['date mismatch'],
  categories: ['CONSISTENCY'],
  riskLevel: 'MEDIUM',
  suggestedActions: ['Verify employment dates'],
  followUpQuestions: ['Can you clarify your employment timeline?'],
  isReviewed: false,
  isFalsePositive: false,
  detectedAt: new Date().toISOString(),
};

const mockSummary: InterviewSummary = {
  id: 'summary-1',
  interviewId: 'interview-1',
  candidateId: 'candidate-1',
  executiveSummary: 'Strong candidate with solid technical background and good communication skills.',
  detailedSummary: 'The candidate demonstrated extensive React experience with practical examples...',
  bulletPoints: ['5+ years React experience', 'Strong problem-solving', 'Good communication'],
  overallScore: 78,
  scoreBreakdown: { technical: 82, communication: 78, cultural: 75 },
  ranking: 'Strong',
  topStrengths: ['Technical expertise', 'Communication', 'Problem-solving'],
  areasOfConcern: ['Limited system design experience'],
  uniqueQualities: ['Cross-functional experience'],
  skillGaps: ['System design'],
  hiringRecommendation: 'YES',
  recommendationReason: 'Strong technical fit with good cultural alignment.',
  nextSteps: ['Technical deep-dive', 'Team interview'],
  suggestedInterviewers: ['Senior Engineer'],
  followUpQuestions: ['Dive into system design'],
  areasToProbe: ['Large-scale systems experience'],
  standoutFactors: ['Led migration project'],
  isApproved: false,
  version: 1,
  culturalFitNotes: [],
  relevantExperience: [],
  notableAchievements: [],
  experienceGaps: [],
  generatedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockHighlight: InterviewHighlight = {
  id: 'highlight-1',
  interviewId: 'interview-1',
  highlightType: 'STRENGTH',
  title: 'Strong Technical Example',
  description: 'Excellent explanation of performance optimization',
  transcript: 'I implemented memoization and reduced re-renders by 60%...',
  startTime: 120,
  endTime: 180,
  duration: 60,
  importance: 'HIGH',
  relevanceScore: 92,
  tags: ['technical', 'react', 'performance'],
  categories: ['Technical Skills'],
  aiInsight: 'Demonstrates deep understanding of React optimization.',
  sentiment: 'positive',
  keyTakeaway: 'Strong performance optimization skills',
  isShareable: true,
  sharedWith: [],
  isBookmarked: false,
  extractedAt: new Date().toISOString(),
};

const mockComparison: CandidateComparison = {
  id: 'comparison-1',
  jobId: 'job-1',
  comparisonName: 'Frontend Developer Candidates',
  candidateIds: ['candidate-1', 'candidate-2', 'candidate-3'],
  interviewIds: ['interview-1', 'interview-2', 'interview-3'],
  createdById: 'recruiter-1',
  criteria: ['technical', 'communication', 'cultural'],
  overallRanking: [
    { candidateId: 'candidate-1', rank: 1, score: 85 },
    { candidateId: 'candidate-2', rank: 2, score: 78 },
    { candidateId: 'candidate-3', rank: 3, score: 72 },
  ],
  scores: {
    'candidate-1': { overall: 85, technical: 88, communication: 82 },
    'candidate-2': { overall: 78, technical: 75, communication: 80 },
    'candidate-3': { overall: 72, technical: 70, communication: 74 },
  },
  topRecommendation: 'candidate-1',
  recommendationReason: 'Highest technical scores with strong communication.',
  orderOfPreference: ['candidate-1', 'candidate-2', 'candidate-3'],
  tieBreakers: [],
  status: 'COMPLETED',
  isActive: true,
  sharedWith: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// 4.2.1 - TRANSCRIPTION
// ============================================

export const createTranscription = async (data: CreateTranscriptionInput): Promise<InterviewTranscription> => {
  if (USE_MOCK) {
    return { ...mockTranscription, ...data, id: `trans-${Date.now()}`, status: 'PENDING' };
  }
  const response = await api.post('/transcriptions', data);
  return response.data;
};

export const getTranscriptions = async (interviewId: string): Promise<InterviewTranscription[]> => {
  if (USE_MOCK) return [mockTranscription];
  const response = await api.get(`/interviews/${interviewId}/transcriptions`);
  return response.data;
};

export const getTranscriptionById = async (id: string): Promise<InterviewTranscription> => {
  if (USE_MOCK) return mockTranscription;
  const response = await api.get(`/transcriptions/${id}`);
  return response.data;
};

export const retryTranscription = async (id: string): Promise<InterviewTranscription> => {
  if (USE_MOCK) return { ...mockTranscription, status: 'PENDING' };
  const response = await api.post(`/transcriptions/${id}/retry`);
  return response.data;
};

// ============================================
// 4.2.2 - ANSWER ANALYSIS
// ============================================

export const analyzeAnswer = async (data: AnalyzeAnswerInput): Promise<AnswerAnalysis> => {
  if (USE_MOCK) return { ...mockAnswerAnalysis, ...data, id: `analysis-${Date.now()}` };
  const response = await api.post('/answer-analysis', data);
  return response.data;
};

export const getAnswerAnalyses = async (interviewId: string): Promise<AnswerAnalysis[]> => {
  if (USE_MOCK) return [mockAnswerAnalysis];
  const response = await api.get(`/interviews/${interviewId}/answer-analyses`);
  return response.data;
};

// ============================================
// 4.2.3 - TOPIC DETECTION
// ============================================

export const detectTopics = async (data: DetectTopicsInput): Promise<TopicDetection> => {
  if (USE_MOCK) return { ...mockTopicDetection, ...data, id: `topic-${Date.now()}` };
  const response = await api.post('/topic-detection', data);
  return response.data;
};

export const getTopicDetections = async (interviewId: string): Promise<TopicDetection[]> => {
  if (USE_MOCK) return [mockTopicDetection];
  const response = await api.get(`/interviews/${interviewId}/topics`);
  return response.data;
};

// ============================================
// 4.2.4 - SENTIMENT ANALYSIS
// ============================================

export const analyzeSentiment = async (data: AnalyzeSentimentInput): Promise<SentimentAnalysis> => {
  if (USE_MOCK) return { ...mockSentimentAnalysis, ...data, id: `sentiment-${Date.now()}` };
  const response = await api.post('/sentiment-analysis', data);
  return response.data;
};

export const getSentimentAnalyses = async (interviewId: string): Promise<SentimentAnalysis[]> => {
  if (USE_MOCK) return [mockSentimentAnalysis];
  const response = await api.get(`/interviews/${interviewId}/sentiment`);
  return response.data;
};

// ============================================
// 4.2.5 - COMMUNICATION SCORE
// ============================================

export const calculateCommunicationScore = async (data: CalculateCommunicationScoreInput): Promise<CommunicationScore> => {
  if (USE_MOCK) return { ...mockCommunicationScore, interviewId: data.interviewId };
  const response = await api.post('/communication-score', data);
  return response.data;
};

export const getCommunicationScore = async (interviewId: string): Promise<CommunicationScore | null> => {
  if (USE_MOCK) return mockCommunicationScore;
  try {
    const response = await api.get(`/interviews/${interviewId}/communication-score`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

// ============================================
// 4.2.6 - TECHNICAL VERIFICATION
// ============================================

export const verifyTechnicalClaim = async (data: VerifyTechnicalClaimInput): Promise<TechnicalVerification> => {
  if (USE_MOCK) return { ...mockTechnicalVerification, ...data, id: `verify-${Date.now()}` };
  const response = await api.post('/technical-verification', data);
  return response.data;
};

export const getTechnicalVerifications = async (interviewId: string): Promise<TechnicalVerification[]> => {
  if (USE_MOCK) return [mockTechnicalVerification];
  const response = await api.get(`/interviews/${interviewId}/technical-verifications`);
  return response.data;
};

// ============================================
// 4.2.7 - RED FLAG DETECTION
// ============================================

export const detectRedFlags = async (interviewId: string): Promise<{ flagsDetected: number; flags: RedFlagAlert[] }> => {
  if (USE_MOCK) return { flagsDetected: 1, flags: [mockRedFlagAlert] };
  const response = await api.post(`/interviews/${interviewId}/detect-red-flags`);
  return response.data;
};

export const getRedFlagAlerts = async (
  interviewId: string,
  params?: { severity?: RedFlagSeverity; isReviewed?: boolean }
): Promise<RedFlagAlert[]> => {
  if (USE_MOCK) return [mockRedFlagAlert];
  const response = await api.get(`/interviews/${interviewId}/red-flags`, { params });
  return response.data;
};

export const reviewRedFlag = async (id: string, data: ReviewRedFlagInput): Promise<RedFlagAlert> => {
  if (USE_MOCK) return { ...mockRedFlagAlert, isReviewed: true, ...data };
  const response = await api.patch(`/red-flags/${id}/review`, data);
  return response.data;
};

// ============================================
// 4.2.8 - SUMMARY GENERATION
// ============================================

export const generateSummary = async (interviewId: string): Promise<InterviewSummary> => {
  if (USE_MOCK) return { ...mockSummary, interviewId };
  const response = await api.post(`/interviews/${interviewId}/generate-summary`);
  return response.data;
};

export const getInterviewSummaries = async (interviewId: string): Promise<InterviewSummary[]> => {
  if (USE_MOCK) return [mockSummary];
  const response = await api.get(`/interviews/${interviewId}/summaries`);
  return response.data;
};

export const approveSummary = async (id: string, data: ApproveSummaryInput): Promise<InterviewSummary> => {
  if (USE_MOCK) return { ...mockSummary, isApproved: true };
  const response = await api.patch(`/summaries/${id}/approve`, data);
  return response.data;
};

export const updateRecommendation = async (id: string, data: UpdateRecommendationInput): Promise<InterviewSummary> => {
  if (USE_MOCK) return { ...mockSummary, ...data };
  const response = await api.patch(`/summaries/${id}/recommendation`, data);
  return response.data;
};

// ============================================
// 4.2.9 - HIGHLIGHT EXTRACTION
// ============================================

export const extractHighlights = async (interviewId: string): Promise<InterviewHighlight[]> => {
  if (USE_MOCK) return [mockHighlight];
  const response = await api.post(`/interviews/${interviewId}/extract-highlights`);
  return response.data;
};

export const getHighlights = async (
  interviewId: string,
  params?: { highlightType?: HighlightType; importance?: HighlightImportance }
): Promise<InterviewHighlight[]> => {
  if (USE_MOCK) return [mockHighlight];
  const response = await api.get(`/interviews/${interviewId}/highlights`, { params });
  return response.data;
};

export const bookmarkHighlight = async (id: string, data: BookmarkHighlightInput): Promise<InterviewHighlight> => {
  if (USE_MOCK) return { ...mockHighlight, isBookmarked: true, bookmarkNotes: data.bookmarkNotes };
  const response = await api.patch(`/highlights/${id}/bookmark`, data);
  return response.data;
};

export const shareHighlight = async (id: string, data: ShareHighlightInput): Promise<InterviewHighlight> => {
  if (USE_MOCK) return { ...mockHighlight, sharedWith: data.userIds };
  const response = await api.patch(`/highlights/${id}/share`, data);
  return response.data;
};

// ============================================
// 4.2.10 - COMPARATIVE ANALYSIS
// ============================================

export const createComparison = async (data: CreateComparisonInput): Promise<CandidateComparison> => {
  if (USE_MOCK) return { ...mockComparison, ...data, id: `comparison-${Date.now()}` };
  const response = await api.post('/comparisons', data);
  return response.data;
};

export const getComparisons = async (params?: { jobId?: string; status?: ComparisonStatus }): Promise<CandidateComparison[]> => {
  if (USE_MOCK) return [mockComparison];
  const response = await api.get('/comparisons', { params });
  return response.data;
};

export const getComparisonById = async (id: string): Promise<CandidateComparison> => {
  if (USE_MOCK) return mockComparison;
  const response = await api.get(`/comparisons/${id}`);
  return response.data;
};

export const shareComparison = async (id: string, data: ShareComparisonInput): Promise<CandidateComparison> => {
  if (USE_MOCK) return { ...mockComparison, sharedWith: data.userIds, status: 'SHARED' };
  const response = await api.patch(`/comparisons/${id}/share`, data);
  return response.data;
};

// ============================================
// FULL ANALYSIS
// ============================================

export const getFullAnalysis = async (interviewId: string): Promise<FullAnalysisResult> => {
  if (USE_MOCK) {
    return {
      interviewId,
      transcriptions: [mockTranscription],
      answerAnalyses: [mockAnswerAnalysis],
      topicDetections: [mockTopicDetection],
      sentimentAnalyses: [mockSentimentAnalysis],
      communicationScore: mockCommunicationScore,
      technicalVerifications: [mockTechnicalVerification],
      redFlagAlerts: [mockRedFlagAlert],
      summaries: [mockSummary],
      highlights: [mockHighlight],
      analysisStats: {
        transcriptionCount: 1,
        answerAnalysisCount: 1,
        redFlagCount: 1,
        highlightCount: 1,
        averageAnswerScore: 82,
      },
    };
  }
  const response = await api.get(`/interviews/${interviewId}/full-analysis`);
  return response.data;
};

export const runFullAnalysis = async (interviewId: string): Promise<{ message: string; stages: any[] }> => {
  if (USE_MOCK) {
    return {
      message: 'Full analysis pipeline started',
      stages: [
        { stage: 'transcription', status: 'queued' },
        { stage: 'answerAnalysis', status: 'queued' },
        { stage: 'topicDetection', status: 'queued' },
        { stage: 'sentimentAnalysis', status: 'queued' },
        { stage: 'communicationScore', status: 'queued' },
        { stage: 'technicalVerification', status: 'queued' },
        { stage: 'redFlagDetection', status: 'queued' },
        { stage: 'highlightExtraction', status: 'queued' },
        { stage: 'summaryGeneration', status: 'queued' },
      ],
    };
  }
  const response = await api.post(`/interviews/${interviewId}/run-analysis`);
  return response.data;
};

export default {
  // Transcription
  createTranscription,
  getTranscriptions,
  getTranscriptionById,
  retryTranscription,
  // Answer Analysis
  analyzeAnswer,
  getAnswerAnalyses,
  // Topic Detection
  detectTopics,
  getTopicDetections,
  // Sentiment Analysis
  analyzeSentiment,
  getSentimentAnalyses,
  // Communication Score
  calculateCommunicationScore,
  getCommunicationScore,
  // Technical Verification
  verifyTechnicalClaim,
  getTechnicalVerifications,
  // Red Flag Detection
  detectRedFlags,
  getRedFlagAlerts,
  reviewRedFlag,
  // Summary Generation
  generateSummary,
  getInterviewSummaries,
  approveSummary,
  updateRecommendation,
  // Highlight Extraction
  extractHighlights,
  getHighlights,
  bookmarkHighlight,
  shareHighlight,
  // Comparative Analysis
  createComparison,
  getComparisons,
  getComparisonById,
  shareComparison,
  // Full Analysis
  getFullAnalysis,
  runFullAnalysis,
};
