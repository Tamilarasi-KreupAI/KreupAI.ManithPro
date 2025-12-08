import axios from 'axios';
import {
  DomainAssessment,
  DomainAssessmentAttempt,
  DomainCategory,
  AssessmentAnalyticsData,
  SkillDecayTracker,
  SkillDecaySummary,
  AIProfileScore,
  JobFitScore,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const api = axios.create({
  baseURL: `${API_BASE_URL}/batch8-scoring`,
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

const mockDomainAssessments: DomainAssessment[] = [
  {
    id: 'da-1',
    title: 'Financial Analysis Fundamentals',
    slug: 'financial-analysis-fundamentals',
    description: 'Test your knowledge of financial statement analysis, ratio analysis, and valuation techniques.',
    domain: 'FINANCE',
    subDomain: 'Financial Analysis',
    difficultyLevel: 'INTERMEDIATE',
    estimatedMinutes: 45,
    passingScore: 70,
    totalPoints: 100,
    questionCount: 30,
    randomizeQuestions: true,
    showCorrectAnswers: true,
    timeLimit: 45,
    allowPause: false,
    providesCertificate: true,
    certificateValidDays: 365,
    tags: ['Finance', 'Analysis', 'Valuation'],
    prerequisites: [],
    targetRoles: ['Financial Analyst', 'Investment Banking Analyst'],
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 30, attempts: 150 },
  },
  {
    id: 'da-2',
    title: 'Healthcare Compliance Essentials',
    slug: 'healthcare-compliance-essentials',
    description: 'Comprehensive assessment covering HIPAA, patient privacy, and healthcare regulatory requirements.',
    domain: 'HEALTHCARE',
    subDomain: 'Compliance',
    difficultyLevel: 'INTERMEDIATE',
    estimatedMinutes: 40,
    passingScore: 80,
    totalPoints: 100,
    questionCount: 25,
    randomizeQuestions: true,
    showCorrectAnswers: false,
    timeLimit: 40,
    allowPause: false,
    providesCertificate: true,
    certificateValidDays: 180,
    tags: ['Healthcare', 'HIPAA', 'Compliance'],
    prerequisites: [],
    targetRoles: ['Healthcare Administrator', 'Compliance Officer'],
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 25, attempts: 89 },
  },
  {
    id: 'da-3',
    title: 'Cybersecurity Fundamentals',
    slug: 'cybersecurity-fundamentals',
    description: 'Test your knowledge of security principles, threat modeling, and best practices.',
    domain: 'CYBERSECURITY',
    subDomain: 'Security Basics',
    difficultyLevel: 'BEGINNER',
    estimatedMinutes: 30,
    passingScore: 70,
    totalPoints: 100,
    questionCount: 20,
    randomizeQuestions: true,
    showCorrectAnswers: true,
    timeLimit: 30,
    allowPause: true,
    providesCertificate: true,
    tags: ['Security', 'Fundamentals', 'IT'],
    prerequisites: [],
    targetRoles: ['Security Analyst', 'IT Professional'],
    version: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { questions: 20, attempts: 234 },
  },
];

const mockDomainAttempts: DomainAssessmentAttempt[] = [
  {
    id: 'daa-1',
    assessmentId: 'da-1',
    userId: 'user-1',
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 42 * 60 * 1000).toISOString(),
    timeSpentSeconds: 2520,
    totalPauseSeconds: 0,
    currentQuestionIndex: 30,
    questionsAnswered: 30,
    answers: [],
    flaggedQuestions: [],
    rawScore: 82,
    percentageScore: 82,
    passed: true,
    topicScores: {
      'Ratio Analysis': { correct: 8, total: 10 },
      'Financial Statements': { correct: 7, total: 10 },
      'Valuation': { correct: 9, total: 10 },
    },
    percentile: 78,
    certificateUrl: 'https://certificates.kreupai.com/daa-1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    assessment: mockDomainAssessments[0],
  },
];

const mockAnalytics: AssessmentAnalyticsData = {
  id: 'aa-1',
  userId: 'user-1',
  totalAssessmentsTaken: 15,
  totalAssessmentsPassed: 12,
  overallAverageScore: 78,
  codingChallenges: { taken: 5, passed: 4, avgScore: 82, bestScore: 95 },
  technicalQuizzes: { taken: 4, passed: 3, avgScore: 75 },
  domainAssessments: { taken: 3, passed: 2, avgScore: 76 },
  softSkillsTests: { taken: 2, avgScore: 80 },
  languageTests: { taken: 1, avgScore: 85 },
  skillPerformance: {
    'JavaScript': { assessments: 3, avgScore: 88, trend: 'UP' },
    'React': { assessments: 2, avgScore: 85, trend: 'STABLE' },
    'Python': { assessments: 2, avgScore: 78, trend: 'UP' },
    'SQL': { assessments: 1, avgScore: 72, trend: 'STABLE' },
  },
  averageCompletionTime: 35,
  fastestCompletion: 18,
  totalTimeSpent: 525,
  scoreHistory: [
    { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), type: 'coding', score: 85 },
    { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), type: 'quiz', score: 72 },
    { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), type: 'domain', score: 78 },
    { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), type: 'coding', score: 92 },
    { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), type: 'softSkill', score: 80 },
  ],
  topStrengths: ['JavaScript', 'React', 'Problem Solving'],
  areasForImprovement: ['SQL', 'System Design'],
  recommendedAssessments: ['Advanced SQL', 'System Design Principles'],
  lastAssessmentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  lastAnalyzedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSkillDecayTrackers: SkillDecayTracker[] = [
  {
    id: 'sdt-1',
    userId: 'user-1',
    skillName: 'JavaScript',
    lastAssessedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastScore: 88,
    peakScore: 92,
    assessmentCount: 5,
    decayRate: 2.5,
    currentEstimatedScore: 85,
    confidenceLevel: 0.85,
    refreshDueAt: new Date(Date.now() + 135 * 24 * 60 * 60 * 1000).toISOString(),
    refreshPriority: 'LOW',
    skillCategory: 'TECHNICAL',
    relatedAssessments: ['JavaScript Fundamentals', 'Advanced JavaScript'],
    reminderSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sdt-2',
    userId: 'user-1',
    skillName: 'Python',
    lastAssessedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    lastScore: 78,
    peakScore: 82,
    assessmentCount: 3,
    decayRate: 3.0,
    currentEstimatedScore: 65,
    confidenceLevel: 0.70,
    refreshDueAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    refreshPriority: 'HIGH',
    skillCategory: 'TECHNICAL',
    relatedAssessments: ['Python Basics', 'Data Science with Python'],
    reminderSent: true,
    reminderSentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sdt-3',
    userId: 'user-1',
    skillName: 'SQL',
    lastAssessedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastScore: 72,
    peakScore: 75,
    assessmentCount: 2,
    decayRate: 2.0,
    currentEstimatedScore: 68,
    confidenceLevel: 0.75,
    refreshDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    refreshPriority: 'MEDIUM',
    skillCategory: 'TECHNICAL',
    relatedAssessments: ['SQL Fundamentals'],
    reminderSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockAIProfileScore: AIProfileScore = {
  id: 'aps-1',
  profileId: 'profile-1',
  userId: 'user-1',
  overallScore: 78,
  scoreGrade: 'B+',
  profileCompleteness: 85,
  experienceDepth: 72,
  skillsVerification: 68,
  educationStrength: 80,
  projectQuality: 75,
  assessmentPerformance: 82,
  verificationScore: 70,
  engagementScore: 88,
  componentWeights: {
    profileCompleteness: 0.15,
    experienceDepth: 0.20,
    skillsVerification: 0.15,
    educationStrength: 0.10,
    projectQuality: 0.10,
    assessmentPerformance: 0.15,
    verificationScore: 0.10,
    engagementScore: 0.05,
  },
  componentDetails: {
    profileCompleteness: { score: 85, factors: ['Complete basic info', 'Added work history'], improvements: ['Add more projects'] },
    experienceDepth: { score: 72, factors: ['5+ years experience', 'Multiple roles'], improvements: ['Add achievements for recent roles'] },
    skillsVerification: { score: 68, factors: ['Some verified skills'], improvements: ['Take more skill assessments'] },
  },
  strengths: ['Engagement Score', 'Profile Completeness', 'Assessment Performance'],
  weaknesses: ['Skills Verification', 'Verification Score'],
  recommendations: [
    { area: 'Skills', suggestion: 'Complete more skill assessments to verify your abilities', impact: 'HIGH' },
    { area: 'Profile', suggestion: 'Add more portfolio projects', impact: 'MEDIUM' },
  ],
  estimatedLevel: 'MID',
  yearsOfExperience: 5,
  topIndustries: [
    { industry: 'Technology', fitScore: 92, reasons: ['Strong technical skills', 'Relevant experience'] },
    { industry: 'Finance', fitScore: 78, reasons: ['Analytical skills', 'Some domain knowledge'] },
  ],
  topRoles: [
    { role: 'Full Stack Developer', fitScore: 88, matchingSkills: ['JavaScript', 'React', 'Node.js'] },
    { role: 'Frontend Engineer', fitScore: 85, matchingSkills: ['JavaScript', 'React', 'CSS'] },
  ],
  marketPercentile: 72,
  salaryEstimate: { min: 90000, max: 130000, median: 110000, currency: 'USD' },
  similarProfiles: 1250,
  standoutFactors: ['Active on platform', 'High assessment scores'],
  scoringVersion: '1.0',
  scoringAlgorithm: 'default',
  lastScoredAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockJobFitScores: JobFitScore[] = [
  {
    id: 'jfs-1',
    userId: 'user-1',
    profileId: 'profile-1',
    jobId: 'job-1',
    overallFitScore: 85,
    fitCategory: 'GOOD_FIT',
    skillsMatch: 90,
    experienceMatch: 80,
    educationMatch: 85,
    locationMatch: 100,
    salaryMatch: 75,
    senioritylMatch: 85,
    industryMatch: 90,
    matchedSkills: [
      { skill: 'JavaScript', match: true },
      { skill: 'React', match: true },
      { skill: 'Node.js', match: true },
    ],
    missingSkills: ['GraphQL', 'AWS'],
    bonusSkills: ['TypeScript', 'Testing'],
    requirementMatches: {},
    knockoutFlags: [],
    candidateSummary: 'Strong candidate with excellent frontend skills and good full-stack experience.',
    interviewFocus: ['GraphQL knowledge', 'AWS experience'],
    concernFlags: [],
    rankAmongApplicants: 5,
    percentileAmongApplicants: 85,
    scoringVersion: '1.0',
    calculatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================
// 1.4.8 - DOMAIN ASSESSMENTS API
// ============================================

export const domainAssessmentAPI = {
  getAssessments: async (params?: { domain?: DomainCategory; difficulty?: string; isActive?: boolean }): Promise<DomainAssessment[]> => {
    if (USE_MOCK) {
      let assessments = [...mockDomainAssessments];
      if (params?.domain) assessments = assessments.filter(a => a.domain === params.domain);
      if (params?.difficulty) assessments = assessments.filter(a => a.difficultyLevel === params.difficulty);
      return assessments;
    }
    const response = await api.get('/domain-assessments', { params });
    return response.data.assessments;
  },

  getAssessment: async (slug: string, includeQuestions = false): Promise<DomainAssessment> => {
    if (USE_MOCK) {
      const assessment = mockDomainAssessments.find(a => a.slug === slug || a.id === slug);
      if (!assessment) throw new Error('Assessment not found');
      return assessment;
    }
    const response = await api.get(`/domain-assessments/${slug}`, { params: { includeQuestions } });
    return response.data.assessment;
  },

  start: async (assessmentId: string, applicationId?: string): Promise<{ attempt: DomainAssessmentAttempt; assessment: DomainAssessment; resuming?: boolean }> => {
    if (USE_MOCK) {
      const assessment = mockDomainAssessments.find(a => a.id === assessmentId);
      if (!assessment) throw new Error('Assessment not found');
      const attempt: DomainAssessmentAttempt = {
        id: `daa-${Date.now()}`,
        assessmentId,
        userId: 'user-1',
        applicationId,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        timeSpentSeconds: 0,
        totalPauseSeconds: 0,
        currentQuestionIndex: 0,
        questionsAnswered: 0,
        answers: [],
        flaggedQuestions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { attempt, assessment };
    }
    const response = await api.post('/domain-assessments/start', { assessmentId, applicationId });
    return response.data;
  },

  saveProgress: async (attemptId: string, data: {
    answers: Array<{ questionId: string; answer: string; timeSpent?: number; flagged?: boolean }>;
    currentQuestionIndex: number;
    timeSpentSeconds: number;
    flaggedQuestions?: string[];
  }): Promise<DomainAssessmentAttempt> => {
    if (USE_MOCK) {
      return { ...mockDomainAttempts[0], ...data, id: attemptId };
    }
    const response = await api.put(`/domain-assessments/attempts/${attemptId}/progress`, data);
    return response.data.attempt;
  },

  submit: async (attemptId: string, data: {
    answers: Array<{ questionId: string; answer: string; timeSpent?: number }>;
    timeSpentSeconds: number;
  }): Promise<DomainAssessmentAttempt> => {
    if (USE_MOCK) {
      const percentageScore = 75 + Math.floor(Math.random() * 20);
      return {
        ...mockDomainAttempts[0],
        id: attemptId,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        answers: data.answers,
        timeSpentSeconds: data.timeSpentSeconds,
        percentageScore,
        passed: percentageScore >= 70,
      };
    }
    const response = await api.post(`/domain-assessments/attempts/${attemptId}/submit`, data);
    return response.data.attempt;
  },

  getAttempts: async (params?: { domain?: DomainCategory; status?: string }): Promise<DomainAssessmentAttempt[]> => {
    if (USE_MOCK) {
      return mockDomainAttempts;
    }
    const response = await api.get('/domain-assessments/user/attempts', { params });
    return response.data.attempts;
  },
};

// ============================================
// 1.4.9 - ASSESSMENT ANALYTICS API
// ============================================

export const analyticsAPI = {
  getAnalytics: async (): Promise<AssessmentAnalyticsData> => {
    if (USE_MOCK) {
      return mockAnalytics;
    }
    const response = await api.get('/analytics');
    return response.data.analytics;
  },

  refresh: async (): Promise<AssessmentAnalyticsData> => {
    if (USE_MOCK) {
      return { ...mockAnalytics, lastAnalyzedAt: new Date().toISOString() };
    }
    const response = await api.post('/analytics/refresh');
    return response.data.analytics;
  },
};

// ============================================
// 1.4.10 - SKILL DECAY TRACKING API
// ============================================

export const skillDecayAPI = {
  getTrackers: async (params?: { needsRefresh?: boolean; category?: string }): Promise<SkillDecayTracker[]> => {
    if (USE_MOCK) {
      let trackers = [...mockSkillDecayTrackers];
      if (params?.needsRefresh) {
        trackers = trackers.filter(t => t.refreshDueAt && new Date(t.refreshDueAt) <= new Date());
      }
      if (params?.category) {
        trackers = trackers.filter(t => t.skillCategory === params.category);
      }
      return trackers;
    }
    const response = await api.get('/skill-decay', { params });
    return response.data.trackers;
  },

  getSummary: async (): Promise<SkillDecaySummary> => {
    if (USE_MOCK) {
      const now = new Date();
      const needsRefresh = mockSkillDecayTrackers.filter(t => t.refreshDueAt && new Date(t.refreshDueAt) <= now);
      return {
        totalTracked: mockSkillDecayTrackers.length,
        needsRefresh: needsRefresh.length,
        upcomingRefresh: 1,
        byCategory: { TECHNICAL: 3 },
        urgentSkills: needsRefresh.map(t => ({
          skill: t.skillName,
          lastAssessed: t.lastAssessedAt,
          estimatedScore: t.currentEstimatedScore,
          priority: t.refreshPriority,
        })),
      };
    }
    const response = await api.get('/skill-decay/summary');
    return response.data.summary;
  },
};

// ============================================
// 2.1.1 - AI PROFILE SCORER API
// ============================================

export const aiProfileScorerAPI = {
  getScore: async (): Promise<AIProfileScore> => {
    if (USE_MOCK) {
      return mockAIProfileScore;
    }
    const response = await api.get('/ai-score');
    return response.data.score;
  },

  regenerate: async (): Promise<AIProfileScore> => {
    if (USE_MOCK) {
      return { ...mockAIProfileScore, lastScoredAt: new Date().toISOString() };
    }
    const response = await api.post('/ai-score/regenerate');
    return response.data.score;
  },
};

// ============================================
// 2.1.2 - JOB-FIT SCORE API
// ============================================

export const jobFitScoreAPI = {
  calculate: async (jobId: string): Promise<JobFitScore> => {
    if (USE_MOCK) {
      return { ...mockJobFitScores[0], jobId, calculatedAt: new Date().toISOString() };
    }
    const response = await api.post(`/job-fit/${jobId}/calculate`);
    return response.data.score;
  },

  get: async (jobId: string): Promise<JobFitScore> => {
    if (USE_MOCK) {
      const score = mockJobFitScores.find(s => s.jobId === jobId);
      if (!score) throw new Error('Score not found');
      return score;
    }
    const response = await api.get(`/job-fit/${jobId}`);
    return response.data.score;
  },

  getAll: async (): Promise<JobFitScore[]> => {
    if (USE_MOCK) {
      return mockJobFitScores;
    }
    const response = await api.get('/job-fit');
    return response.data.scores;
  },

  getApplicantScores: async (jobId: string, params?: { minScore?: number; fitCategory?: string }): Promise<JobFitScore[]> => {
    if (USE_MOCK) {
      return mockJobFitScores;
    }
    const response = await api.get(`/job-fit/${jobId}/applicants`, { params });
    return response.data.scores;
  },
};

export default {
  domainAssessments: domainAssessmentAPI,
  analytics: analyticsAPI,
  skillDecay: skillDecayAPI,
  aiProfileScorer: aiProfileScorerAPI,
  jobFitScore: jobFitScoreAPI,
};
