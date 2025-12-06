import axios from 'axios';
import type {
  JobRecommendation,
  GenerateJobRecommendationsInput,
  JobRecommendationInteractionInput,
  CandidateRecommendation,
  GenerateCandidateRecommendationsInput,
  CandidateRecommendationActionInput,
  SimilarCandidateMatch,
  FindSimilarCandidatesInput,
  SimilarCandidateActionInput,
  PassiveCandidateProfile,
  IdentifyPassiveCandidatesInput,
  PassiveCandidateOutreachInput,
  SkillUpRecommendation,
  GenerateSkillUpRecommendationsInput,
  UpdateSkillProgressInput,
  ReEngagementSuggestion,
  GenerateReEngagementSuggestionsInput,
  UpdateReEngagementStatusInput,
  InterviewPanelRecommendation,
  GenerateInterviewPanelRecommendationsInput,
  SelectInterviewerInput,
  SourcingChannelRecommendation,
  GenerateSourcingRecommendationsInput,
  RecommendationFeedback,
  SubmitRecommendationFeedbackInput,
  RecommendationConfig,
  UpdateRecommendationConfigInput,
  SmartRecommendationsStats,
  RecommendationType,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = true;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockJobRecommendations: JobRecommendation[] = [
  {
    id: 'jr-1',
    candidateId: 'cand-1',
    jobId: 'job-1',
    matchScore: 0.92,
    skillMatchScore: 0.95,
    experienceMatchScore: 0.88,
    locationMatchScore: 1.0,
    salaryMatchScore: 0.85,
    cultureMatchScore: 0.90,
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    missingSkills: ['Kubernetes'],
    strengths: ['Strong frontend expertise', 'Full-stack experience', 'Agile methodology'],
    considerations: ['May need Kubernetes training', 'Slightly below salary range'],
    reasoning: 'Excellent skill match with strong full-stack background. Location and culture fit are ideal.',
    rank: 1,
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'jr-2',
    candidateId: 'cand-1',
    jobId: 'job-2',
    matchScore: 0.87,
    skillMatchScore: 0.90,
    experienceMatchScore: 0.85,
    locationMatchScore: 0.80,
    salaryMatchScore: 0.90,
    cultureMatchScore: 0.85,
    matchedSkills: ['React', 'TypeScript', 'GraphQL'],
    missingSkills: ['AWS', 'Docker'],
    strengths: ['Frontend focus aligns with role', 'Good salary match'],
    considerations: ['Location requires relocation', 'Missing cloud experience'],
    reasoning: 'Strong technical match with good compensation alignment. Relocation may be required.',
    rank: 2,
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockCandidateRecommendations: CandidateRecommendation[] = [
  {
    id: 'cr-1',
    jobId: 'job-1',
    candidateId: 'cand-2',
    recruiterId: 'rec-1',
    matchScore: 0.94,
    skillMatchScore: 0.96,
    experienceMatchScore: 0.92,
    educationMatchScore: 0.90,
    availabilityScore: 0.95,
    cultureFitScore: 0.88,
    matchedRequirements: ['5+ years experience', 'React expertise', 'Team lead experience'],
    partialMatches: ['AWS knowledge'],
    missingRequirements: [],
    highlights: ['Led team of 8 engineers', 'Built scalable microservices', 'Strong communication'],
    concerns: ['May expect higher salary'],
    reasoning: 'Exceptional candidate with leadership experience and strong technical skills.',
    rank: 1,
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockSimilarCandidates: SimilarCandidateMatch[] = [
  {
    id: 'scm-1',
    sourceCandidateId: 'cand-hired-1',
    matchedCandidateId: 'cand-3',
    recruiterId: 'rec-1',
    similarityScore: 0.89,
    skillSimilarity: 0.92,
    experienceSimilarity: 0.87,
    educationSimilarity: 0.85,
    industrySimilarity: 0.90,
    roleSimilarity: 0.88,
    sharedSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    uniqueToSource: ['Spark', 'Scala'],
    uniqueToMatched: ['PyTorch', 'FastAPI'],
    similarExperiences: ['Data science at Fortune 500', 'ML model deployment'],
    differentiators: ['More deep learning focus', 'Stronger API development'],
    reasoning: 'Very similar profile to successful hire with complementary modern ML skills.',
    rank: 1,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockPassiveCandidates: PassiveCandidateProfile[] = [
  {
    id: 'pc-1',
    candidateId: 'cand-passive-1',
    recruiterId: 'rec-1',
    passiveScore: 0.75,
    engagementLevel: 0.60,
    responselikelihood: 0.70,
    conversionPotential: 0.65,
    lastActivityDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedAvailability: '3-6 months',
    openToOpportunities: true,
    preferredContactMethod: 'LinkedIn',
    bestContactTime: 'Evening',
    interests: ['AI/ML', 'Startup culture', 'Remote work'],
    motivators: ['Career growth', 'Interesting problems', 'Equity'],
    dealBreakers: ['Micromanagement', 'No remote option'],
    targetRoles: ['Senior ML Engineer', 'Staff Engineer'],
    targetCompanies: ['Tech startups', 'AI companies'],
    salaryExpectation: 200000,
    relocationWillingness: 'Remote only',
    outreachStatus: 'NOT_CONTACTED',
    outreachHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockSkillUpRecommendations: SkillUpRecommendation[] = [
  {
    id: 'sur-1',
    candidateId: 'cand-1',
    targetSkill: 'Kubernetes',
    currentLevel: 2,
    targetLevel: 4,
    priority: 'HIGH',
    relevanceScore: 0.92,
    marketDemand: 0.95,
    careerImpact: 0.88,
    learningPath: [
      {
        id: 'lr-1',
        title: 'Kubernetes Fundamentals',
        provider: 'Linux Foundation',
        type: 'COURSE',
        url: 'https://training.linuxfoundation.org/kubernetes',
        duration: '40 hours',
        cost: 299,
        rating: 4.8,
        description: 'Core K8s concepts and administration',
        order: 1,
        completed: false,
      },
      {
        id: 'lr-2',
        title: 'CKA Certification',
        provider: 'CNCF',
        type: 'CERTIFICATION',
        url: 'https://www.cncf.io/certification/cka/',
        duration: '80 hours prep',
        cost: 395,
        rating: 4.9,
        description: 'Certified Kubernetes Administrator',
        order: 2,
        completed: false,
      },
    ],
    estimatedTimeHours: 120,
    estimatedCost: 694,
    reasoning: 'Kubernetes is highly demanded and would open 35% more job opportunities.',
    relatedJobs: ['job-1', 'job-3', 'job-5'],
    salaryImpact: 15000,
    progress: 0,
    status: 'NOT_STARTED',
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockReEngagementSuggestions: ReEngagementSuggestion[] = [
  {
    id: 'res-1',
    candidateId: 'cand-past-1',
    jobId: 'job-1',
    recruiterId: 'rec-1',
    previousApplicationId: 'app-old-1',
    reEngagementScore: 0.82,
    fitImprovement: 0.25,
    timeSinceLastContact: 180,
    reason: 'NEW_SKILLS',
    reasoning: 'Candidate has acquired new skills since last application that now match requirements.',
    previousFeedback: 'Good cultural fit but lacked Kubernetes experience',
    changesNoted: ['Added CKA certification', 'Led DevOps team', 'Built CI/CD pipelines'],
    suggestedApproach: 'Personalized outreach highlighting their new DevOps skills',
    suggestedMessage: 'Hi [Name], I noticed you\'ve earned your CKA certification since we last spoke...',
    bestContactTime: 'Tuesday morning',
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockInterviewPanelRecommendations: InterviewPanelRecommendation[] = [
  {
    id: 'ipr-1',
    jobId: 'job-1',
    candidateId: 'cand-1',
    recruiterId: 'rec-1',
    interviewerId: 'int-1',
    role: 'TECHNICAL',
    matchScore: 0.91,
    expertiseMatch: 0.95,
    availabilityScore: 0.85,
    interviewLoadScore: 0.80,
    diversityContribution: 0.70,
    reasoning: 'Senior engineer with matching tech stack expertise and available during preferred times.',
    expertiseAreas: ['React', 'Node.js', 'System Design'],
    previousInterviews: 45,
    averageRating: 4.7,
    availableSlots: ['2024-01-15T10:00:00Z', '2024-01-16T14:00:00Z'],
    selected: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ipr-2',
    jobId: 'job-1',
    candidateId: 'cand-1',
    recruiterId: 'rec-1',
    interviewerId: 'int-2',
    role: 'CULTURAL',
    matchScore: 0.88,
    expertiseMatch: 0.75,
    availabilityScore: 0.90,
    interviewLoadScore: 0.92,
    diversityContribution: 0.85,
    reasoning: 'Experienced hiring manager with strong culture assessment skills.',
    expertiseAreas: ['Team dynamics', 'Values alignment', 'Communication'],
    previousInterviews: 120,
    averageRating: 4.8,
    availableSlots: ['2024-01-15T14:00:00Z', '2024-01-17T10:00:00Z'],
    selected: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockSourcingRecommendations: SourcingChannelRecommendation[] = [
  {
    id: 'scr-1',
    jobId: 'job-1',
    roleType: 'Senior Software Engineer',
    recruiterId: 'rec-1',
    channel: 'LINKEDIN',
    effectiveness: 0.85,
    costEfficiency: 0.70,
    qualityScore: 0.88,
    speedScore: 0.75,
    volumeScore: 0.90,
    historicalSuccess: 0.82,
    reasoning: 'LinkedIn has highest success rate for senior engineering roles in this market.',
    recommendations: [
      'Use InMail for passive candidates',
      'Target groups related to React and Node.js',
      'Leverage employee networks for referrals',
    ],
    estimatedCost: 3000,
    estimatedTimeToHire: 45,
    estimatedCandidates: 25,
    bestPractices: [
      'Personalize connection requests',
      'Engage with candidate content before reaching out',
      'Use boolean search operators',
    ],
    rank: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scr-2',
    jobId: 'job-1',
    roleType: 'Senior Software Engineer',
    recruiterId: 'rec-1',
    channel: 'REFERRAL',
    effectiveness: 0.92,
    costEfficiency: 0.95,
    qualityScore: 0.90,
    speedScore: 0.85,
    volumeScore: 0.50,
    historicalSuccess: 0.88,
    reasoning: 'Referrals have highest conversion rate and lowest cost per hire.',
    recommendations: [
      'Launch referral bonus campaign',
      'Target specific teams with matching skills',
      'Make sharing job posts easy',
    ],
    estimatedCost: 5000,
    estimatedTimeToHire: 30,
    estimatedCandidates: 8,
    bestPractices: [
      'Offer competitive referral bonuses',
      'Keep referrers updated on progress',
      'Recognize successful referrals publicly',
    ],
    rank: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockRecommendationConfig: RecommendationConfig = {
  id: 'rc-1',
  recommendationType: 'JOB_RECOMMENDATION',
  enabled: true,
  minScore: 0.70,
  maxResults: 20,
  refreshInterval: 24,
  weights: {
    skillMatch: 0.35,
    experienceMatch: 0.25,
    locationMatch: 0.15,
    salaryMatch: 0.15,
    cultureMatch: 0.10,
  },
  filters: {
    excludeApplied: true,
    excludeDismissed: true,
  },
  features: {
    autoRefresh: true,
    emailNotifications: true,
    pushNotifications: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStats: SmartRecommendationsStats = {
  totalRecommendations: 1250,
  activeRecommendations: 850,
  byType: {
    JOB_RECOMMENDATION: 400,
    CANDIDATE_RECOMMENDATION: 300,
    SIMILAR_CANDIDATE: 150,
    PASSIVE_CANDIDATE: 100,
    SKILL_UP: 120,
    RE_ENGAGEMENT: 80,
    INTERVIEW_PANEL: 60,
    SOURCING_CHANNEL: 40,
  },
  averageMatchScore: 0.82,
  conversionRate: 0.18,
  feedbackScore: 4.2,
  topPerformingTypes: [
    { type: 'CANDIDATE_RECOMMENDATION', count: 300, conversionRate: 0.25, avgScore: 0.85 },
    { type: 'JOB_RECOMMENDATION', count: 400, conversionRate: 0.22, avgScore: 0.83 },
    { type: 'REFERRAL' as RecommendationType, count: 50, conversionRate: 0.35, avgScore: 0.88 },
  ],
  recentActivity: [
    { date: '2024-01-08', recommendations: 45, interactions: 120, conversions: 8 },
    { date: '2024-01-09', recommendations: 52, interactions: 135, conversions: 12 },
    { date: '2024-01-10', recommendations: 48, interactions: 110, conversions: 10 },
  ],
  channelEffectiveness: [
    { channel: 'LINKEDIN', effectiveness: 0.85, hires: 25, cost: 3000 },
    { channel: 'REFERRAL', effectiveness: 0.92, hires: 18, cost: 5000 },
    { channel: 'INDEED', effectiveness: 0.72, hires: 12, cost: 2500 },
  ],
};

// ============================================================================
// 5.3.1 JOB RECOMMENDATIONS API
// ============================================================================

export const jobRecommendationsAPI = {
  generate: async (input: GenerateJobRecommendationsInput): Promise<JobRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockJobRecommendations;
    }
    const response = await axios.post(`${API_URL}/recommendations/jobs`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getForCandidate: async (candidateId: string): Promise<JobRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockJobRecommendations.filter(r => r.candidateId === candidateId || candidateId === 'cand-1');
    }
    const response = await axios.get(`${API_URL}/recommendations/jobs/${candidateId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  recordInteraction: async (id: string, input: JobRecommendationInteractionInput): Promise<JobRecommendation> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const rec = mockJobRecommendations.find(r => r.id === id);
      if (!rec) throw new Error('Recommendation not found');
      return { ...rec, lastInteraction: new Date().toISOString(), status: 'VIEWED' };
    }
    const response = await axios.put(`${API_URL}/recommendations/jobs/${id}/interaction`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ============================================================================
// 5.3.2 CANDIDATE RECOMMENDATIONS API
// ============================================================================

export const candidateRecommendationsAPI = {
  generate: async (input: GenerateCandidateRecommendationsInput): Promise<CandidateRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockCandidateRecommendations;
    }
    const response = await axios.post(`${API_URL}/recommendations/candidates`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getForJob: async (jobId: string): Promise<CandidateRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockCandidateRecommendations.filter(r => r.jobId === jobId || jobId === 'job-1');
    }
    const response = await axios.get(`${API_URL}/recommendations/candidates/${jobId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  recordAction: async (id: string, input: CandidateRecommendationActionInput): Promise<CandidateRecommendation> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const rec = mockCandidateRecommendations.find(r => r.id === id);
      if (!rec) throw new Error('Recommendation not found');
      return { ...rec, actionTaken: input.actionType, actionTakenAt: new Date().toISOString() };
    }
    const response = await axios.put(`${API_URL}/recommendations/candidates/${id}/action`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ============================================================================
// 5.3.3 SIMILAR CANDIDATES API
// ============================================================================

export const similarCandidatesAPI = {
  find: async (input: FindSimilarCandidatesInput): Promise<SimilarCandidateMatch[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockSimilarCandidates;
    }
    const response = await axios.post(`${API_URL}/recommendations/similar`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getBySource: async (sourceCandidateId: string): Promise<SimilarCandidateMatch[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockSimilarCandidates;
    }
    const response = await axios.get(`${API_URL}/recommendations/similar/${sourceCandidateId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  recordAction: async (id: string, input: SimilarCandidateActionInput): Promise<SimilarCandidateMatch> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const match = mockSimilarCandidates.find(m => m.id === id);
      if (!match) throw new Error('Match not found');
      return { ...match, actionTaken: input.actionType, actionTakenAt: new Date().toISOString() };
    }
    const response = await axios.put(`${API_URL}/recommendations/similar/${id}/action`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ============================================================================
// 5.3.4 PASSIVE CANDIDATES API
// ============================================================================

export const passiveCandidatesAPI = {
  identify: async (input: IdentifyPassiveCandidatesInput): Promise<PassiveCandidateProfile[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockPassiveCandidates;
    }
    const response = await axios.post(`${API_URL}/recommendations/passive`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getAll: async (): Promise<PassiveCandidateProfile[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockPassiveCandidates;
    }
    const response = await axios.get(`${API_URL}/recommendations/passive`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  recordOutreach: async (id: string, input: PassiveCandidateOutreachInput): Promise<PassiveCandidateProfile> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const profile = mockPassiveCandidates.find(p => p.id === id);
      if (!profile) throw new Error('Profile not found');
      return {
        ...profile,
        outreachStatus: input.outreachStatus,
        lastContactedAt: new Date().toISOString(),
        outreachHistory: [
          ...profile.outreachHistory,
          { date: new Date().toISOString(), method: input.contactMethod || 'Email', ...input },
        ],
      };
    }
    const response = await axios.put(`${API_URL}/recommendations/passive/${id}/outreach`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ============================================================================
// 5.3.5 SKILL-UP RECOMMENDATIONS API
// ============================================================================

export const skillUpAPI = {
  generate: async (input: GenerateSkillUpRecommendationsInput): Promise<SkillUpRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockSkillUpRecommendations;
    }
    const response = await axios.post(`${API_URL}/recommendations/skill-up`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getForCandidate: async (candidateId: string): Promise<SkillUpRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockSkillUpRecommendations;
    }
    const response = await axios.get(`${API_URL}/recommendations/skill-up/${candidateId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateProgress: async (id: string, input: UpdateSkillProgressInput): Promise<SkillUpRecommendation> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const rec = mockSkillUpRecommendations.find(r => r.id === id);
      if (!rec) throw new Error('Recommendation not found');
      return {
        ...rec,
        progress: input.progress,
        status: input.status || rec.status,
        startedAt: rec.startedAt || new Date().toISOString(),
      };
    }
    const response = await axios.put(`${API_URL}/recommendations/skill-up/${id}/progress`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ============================================================================
// 5.3.6 RE-ENGAGEMENT API
// ============================================================================

export const reEngagementAPI = {
  generate: async (input: GenerateReEngagementSuggestionsInput): Promise<ReEngagementSuggestion[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockReEngagementSuggestions;
    }
    const response = await axios.post(`${API_URL}/recommendations/re-engage`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getForJob: async (jobId: string): Promise<ReEngagementSuggestion[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockReEngagementSuggestions;
    }
    const response = await axios.get(`${API_URL}/recommendations/re-engage/${jobId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateStatus: async (id: string, input: UpdateReEngagementStatusInput): Promise<ReEngagementSuggestion> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const suggestion = mockReEngagementSuggestions.find(s => s.id === id);
      if (!suggestion) throw new Error('Suggestion not found');
      return {
        ...suggestion,
        status: input.status,
        contactedAt: input.status === 'CONTACTED' ? new Date().toISOString() : suggestion.contactedAt,
        respondedAt: input.status === 'RESPONDED' ? new Date().toISOString() : suggestion.respondedAt,
      };
    }
    const response = await axios.put(`${API_URL}/recommendations/re-engage/${id}/status`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ============================================================================
// 5.3.7 INTERVIEW PANEL API
// ============================================================================

export const interviewPanelAPI = {
  generate: async (input: GenerateInterviewPanelRecommendationsInput): Promise<InterviewPanelRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockInterviewPanelRecommendations;
    }
    const response = await axios.post(`${API_URL}/recommendations/panel`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getForInterview: async (jobId: string, candidateId: string): Promise<InterviewPanelRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockInterviewPanelRecommendations;
    }
    const response = await axios.get(`${API_URL}/recommendations/panel/${jobId}/${candidateId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  selectInterviewer: async (id: string, input: SelectInterviewerInput): Promise<InterviewPanelRecommendation> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const rec = mockInterviewPanelRecommendations.find(r => r.id === id);
      if (!rec) throw new Error('Recommendation not found');
      return { ...rec, selected: true, selectedAt: new Date().toISOString(), notes: input.notes };
    }
    const response = await axios.put(`${API_URL}/recommendations/panel/${id}/select`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ============================================================================
// 5.3.8 SOURCING CHANNELS API
// ============================================================================

export const sourcingChannelsAPI = {
  generate: async (input: GenerateSourcingRecommendationsInput): Promise<SourcingChannelRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockSourcingRecommendations;
    }
    const response = await axios.post(`${API_URL}/recommendations/sourcing`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getAll: async (): Promise<SourcingChannelRecommendation[]> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockSourcingRecommendations;
    }
    const response = await axios.get(`${API_URL}/recommendations/sourcing`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// ============================================================================
// FEEDBACK & CONFIG API
// ============================================================================

export const feedbackAPI = {
  submit: async (input: SubmitRecommendationFeedbackInput): Promise<RecommendationFeedback> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: `fb-${Date.now()}`,
        ...input,
        relevance: input.relevance || input.rating,
        accuracy: input.accuracy || input.rating,
        usefulness: input.usefulness || input.rating,
        wouldRecommend: input.wouldRecommend ?? true,
        userId: 'current-user',
        createdAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_URL}/recommendations/feedback`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

export const configAPI = {
  getOrCreate: async (recommendationType: RecommendationType): Promise<RecommendationConfig> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockRecommendationConfig, recommendationType };
    }
    const response = await axios.get(`${API_URL}/recommendations/config/${recommendationType}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  update: async (id: string, input: UpdateRecommendationConfigInput): Promise<RecommendationConfig> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...mockRecommendationConfig, ...input, updatedAt: new Date().toISOString() };
    }
    const response = await axios.put(`${API_URL}/recommendations/config/${id}`, input, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

export const statsAPI = {
  getStats: async (): Promise<SmartRecommendationsStats> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockStats;
    }
    const response = await axios.get(`${API_URL}/recommendations/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

export default {
  jobRecommendations: jobRecommendationsAPI,
  candidateRecommendations: candidateRecommendationsAPI,
  similarCandidates: similarCandidatesAPI,
  passiveCandidates: passiveCandidatesAPI,
  skillUp: skillUpAPI,
  reEngagement: reEngagementAPI,
  interviewPanel: interviewPanelAPI,
  sourcingChannels: sourcingChannelsAPI,
  feedback: feedbackAPI,
  config: configAPI,
  stats: statsAPI,
};
