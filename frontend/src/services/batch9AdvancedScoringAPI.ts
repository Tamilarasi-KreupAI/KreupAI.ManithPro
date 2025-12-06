import axios from 'axios';
import type {
  CultureFitAnalysis,
  GrowthPotentialScore,
  TechnicalDepthScore,
  CommunicationScore,
  ReliabilityScore,
  AdvancedScoresSummary,
  CandidateScoringDashboard,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const USE_MOCK = true; // Toggle for development

// ============================================
// MOCK DATA
// ============================================

const mockCultureFitAnalysis: CultureFitAnalysis = {
  id: 'cfa-001',
  userId: 'user-001',
  profileId: 'profile-001',
  overallCultureScore: 78,
  fitLevel: 'GOOD_FIT',
  workStyleAlignment: 82,
  collaborationStyle: 'BALANCED',
  communicationStyle: 'ASYNC_FIRST',
  decisionMaking: 'CONSULTATIVE',
  feedbackPreference: 'DIRECT',
  remotePreference: 'HYBRID',
  workHoursFlexibility: 'FLEXIBLE',
  meetingTolerance: 'MODERATE',
  focusTimeNeeds: 'HIGH',
  valuesAlignment: 85,
  topValues: ['innovation', 'growth', 'work_life_balance', 'impact'],
  matchedValues: [
    { value: 'Innovation', weight: 0.9, alignment: 92 },
    { value: 'Growth', weight: 0.85, alignment: 88 },
    { value: 'Work-Life Balance', weight: 0.8, alignment: 85 },
    { value: 'Impact', weight: 0.75, alignment: 80 },
  ],
  conflictingValues: [],
  teamSizePreference: 'MEDIUM',
  leadershipStyle: 'COACHING',
  conflictResolution: 'COLLABORATIVE',
  teamRoleArchetype: 'DRIVER',
  primaryMotivators: ['learning', 'impact', 'recognition', 'compensation'],
  careerPriorities: {
    learning: 0.9,
    impact: 0.85,
    recognition: 0.7,
    compensation: 0.75,
    stability: 0.6,
  },
  workLifeBalance: 80,
  preferredCompanySize: 'MEDIUM',
  preferredIndustries: ['Technology', 'Healthcare', 'Finance'],
  startupReadiness: 72,
  corporateReadiness: 78,
  changeAdaptability: 85,
  ambiguityTolerance: 75,
  riskTolerance: 'MODERATE',
  strengthFactors: [
    { factor: 'Collaboration', description: 'Strong team collaboration skills', impact: 'positive' },
    { factor: 'Adaptability', description: 'High adaptability to change', impact: 'positive' },
    { factor: 'Communication', description: 'Effective async communication', impact: 'positive' },
  ],
  concernFactors: [
    { factor: 'Meeting Heavy', description: 'May struggle in meeting-heavy cultures', recommendation: 'Discuss meeting expectations' },
  ],
  recommendations: [
    'Best fit for companies with flexible work arrangements',
    'Thrives in growth-oriented environments',
    'Would benefit from clear communication channels',
  ],
  fitSummary: 'This candidate demonstrates a strong alignment with modern, flexible work cultures. Their preference for async communication and balanced collaboration style makes them well-suited for hybrid environments.',
  scoringVersion: '1.0',
  lastAnalyzedAt: new Date().toISOString(),
  confidence: 0.82,
};

const mockGrowthPotentialScore: GrowthPotentialScore = {
  id: 'gps-001',
  userId: 'user-001',
  profileId: 'profile-001',
  overallGrowthScore: 82,
  growthTier: 'STRONG_GROWTH',
  learningAgility: 85,
  skillAcquisitionRate: 78,
  knowledgeRetention: 80,
  adaptabilityScore: 88,
  careerProgressionRate: 75,
  promotionHistory: [
    { fromRole: 'Junior Developer', toRole: 'Mid-Level Developer', timespan: '18 months', company: 'TechCorp' },
    { fromRole: 'Mid-Level Developer', toRole: 'Senior Developer', timespan: '24 months', company: 'TechCorp' },
    { fromRole: 'Senior Developer', toRole: 'Tech Lead', timespan: '30 months', company: 'InnovateCo' },
  ],
  roleComplexityGrowth: 82,
  responsibilityExpansion: 78,
  careerMomentum: 'ACCELERATING',
  skillGrowthVelocity: 4.5,
  techAdoptionSpeed: 'EARLY_MAJORITY',
  breadthVsDepth: 'T_SHAPED',
  emergingSkills: ['AI/ML', 'Cloud Native', 'System Design'],
  continuousLearning: 90,
  recentCertifications: 3,
  educationRecency: 'ONGOING',
  learningInvestment: 85,
  leadershipPotential: 78,
  managementExperience: { directReports: 5, teams: 2, projects: 12 },
  mentorshipActivities: 8,
  initiativeTaking: 82,
  innovationScore: 75,
  impactEvidence: [
    { project: 'Platform Migration', impact: 'Reduced costs by 40%', metrics: { savings: '$500K/year' } },
    { project: 'New Feature Launch', impact: 'Increased user engagement by 25%', metrics: { users: '+50K' } },
  ],
  problemSolvingAbility: 88,
  creativeThinking: 72,
  achievementDensity: 2.5,
  recognitionFrequency: 1.8,
  overachievementSignals: [
    { signal: 'Promoted ahead of schedule', frequency: 2 },
    { signal: 'Led initiatives beyond scope', frequency: 5 },
  ],
  predictedGrowthPath: {
    '1yr': { role: 'Senior Tech Lead', probability: 0.85 },
    '3yr': { role: 'Engineering Manager', probability: 0.70 },
    '5yr': { role: 'Director of Engineering', probability: 0.55 },
  },
  suggestedRoles: ['Engineering Manager', 'Principal Engineer', 'VP of Engineering'],
  developmentAreas: ['Strategic Planning', 'Executive Communication', 'Budget Management'],
  ceilingEstimate: 'VP/Director Level',
  growthDrivers: [
    { factor: 'Learning Agility', impact: 'High ability to acquire new skills quickly' },
    { factor: 'Initiative', impact: 'Consistently takes on challenges beyond current scope' },
    { factor: 'Technical Excellence', impact: 'Strong foundation enables rapid advancement' },
  ],
  growthLimiters: [
    { factor: 'Business Acumen', impact: 'Could strengthen understanding of business strategy' },
  ],
  recommendations: [
    'Pursue leadership development programs',
    'Take on cross-functional project leadership',
    'Develop strategic planning skills',
    'Build executive presence and communication',
  ],
  potentialSummary: 'This candidate demonstrates strong growth potential with a track record of progressive responsibility and continuous learning.',
  scoringVersion: '1.0',
  lastScoredAt: new Date().toISOString(),
  confidence: 0.85,
};

const mockTechnicalDepthScore: TechnicalDepthScore = {
  id: 'tds-001',
  userId: 'user-001',
  profileId: 'profile-001',
  overallTechnicalScore: 85,
  technicalTier: 'SENIOR',
  codeQualityScore: 88,
  codeComplexityHandled: 'HIGH',
  codingPatterns: ['MVC', 'Repository', 'Factory', 'Observer', 'Strategy'],
  bestPracticesScore: 85,
  testingPractices: 82,
  githubScore: 78,
  totalContributions: 2847,
  consistencyScore: 85,
  repositoryQuality: 72,
  openSourceImpact: { projects: 5, contributions: 127, maintainer: true, stars: 450 },
  languageProficiency: {
    TypeScript: { loc: 125000, projects: 15, score: 92 },
    Python: { loc: 45000, projects: 8, score: 78 },
    Go: { loc: 12000, projects: 3, score: 65 },
    JavaScript: { loc: 85000, projects: 20, score: 88 },
  },
  stackOverflowScore: 72,
  reputation: 15420,
  answerQuality: 78,
  topTags: ['typescript', 'react', 'node.js', 'postgresql', 'aws'],
  acceptedAnswerRate: 42,
  helpfulnessScore: 85,
  projectComplexityScore: 82,
  architectureExperience: {
    microservices: { count: 5, examples: ['Payment Service', 'Auth Service'] },
    monolith: { count: 3, examples: ['Legacy Platform'] },
    serverless: { count: 2, examples: ['Event Processor'] },
  },
  systemDesignCapability: 78,
  scalabilityExperience: { maxUsers: '10M+', maxRPS: '50K', databases: ['PostgreSQL', 'MongoDB', 'Redis'] },
  primaryStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
  stackDepth: {
    TypeScript: 'Expert',
    React: 'Expert',
    'Node.js': 'Advanced',
    PostgreSQL: 'Advanced',
    AWS: 'Intermediate',
  },
  stackBreadth: 18,
  modernTechAdoption: 85,
  domainExpertise: {
    'E-commerce': { level: 'Expert', years: 5, evidence: ['Built payment systems'] },
    FinTech: { level: 'Advanced', years: 3, evidence: ['Trading platform'] },
  },
  specializations: ['Distributed Systems', 'API Design', 'Performance Optimization'],
  industryExperience: ['Technology', 'Finance', 'Healthcare'],
  algorithmProficiency: 82,
  dataStructureSkills: 85,
  debuggingAbility: 90,
  optimizationSkills: 78,
  technicalLeadership: 80,
  architectureDecisions: [
    { decision: 'Microservices migration', impact: 'Improved scalability 10x' },
    { decision: 'Event-driven architecture', impact: 'Reduced coupling' },
  ],
  mentorshipEvidence: { juniorsMentored: 12, codeReviews: 500 },
  codeReviewActivity: 88,
  relevantCertifications: {
    'AWS Solutions Architect': { issuer: 'Amazon', date: '2023-06', level: 'Professional' },
  },
  certificationScore: 75,
  technicalStrengths: ['Full-stack TypeScript', 'System design', 'Code quality', 'Open source'],
  technicalGaps: ['ML/AI', 'Mobile development', 'DevOps automation'],
  recommendations: ['Explore ML fundamentals', 'Consider AWS certifications', 'Deepen Kubernetes expertise'],
  technicalSummary: 'Senior-level engineer with strong full-stack capabilities and proven system design experience.',
  marketPercentile: 82,
  similarProfiles: 1250,
  scoringVersion: '1.0',
  lastScoredAt: new Date().toISOString(),
  confidence: 0.88,
};

const mockCommunicationScore: CommunicationScore = {
  id: 'cs-001',
  userId: 'user-001',
  profileId: 'profile-001',
  overallCommScore: 82,
  communicationTier: 'STRONG',
  writtenScore: 85,
  writingClarity: 88,
  writingConciseness: 82,
  grammarAccuracy: 92,
  professionalTone: 85,
  structureOrganization: 80,
  writingSamples: [
    { source: 'Profile Summary', type: 'professional', score: 88, analysis: 'Clear and compelling' },
    { source: 'Project Descriptions', type: 'technical', score: 85, analysis: 'Well-structured' },
  ],
  vocabularyLevel: 'ADVANCED',
  technicalWriting: 85,
  persuasiveWriting: 78,
  verbalScore: 80,
  articulationClarity: 82,
  responseStructure: 78,
  activeListening: 85,
  questionHandling: 80,
  interviewCommunication: { averageScore: 80, interviews: 3, feedback: ['Clear explanations', 'Good examples'] },
  presentationSkills: 75,
  explanationAbility: 88,
  technicalExplanation: 85,
  emailProfessionalism: 90,
  responsiveness: 95,
  followUpQuality: 85,
  negotiationSkills: 72,
  languageProficiencies: { English: { level: 'Native' }, Spanish: { level: 'Intermediate', certified: true } },
  primaryLanguage: 'English',
  crossCulturalAwareness: 78,
  collaborationComm: 85,
  feedbackDelivery: 80,
  feedbackReception: 88,
  conflictCommunication: 75,
  profileWritingQuality: 88,
  projectDescriptions: 85,
  experienceArticulation: 82,
  publicSpeaking: 72,
  contentCreation: 68,
  socialMediaProfessionalism: 85,
  communicationStrengths: ['Written communication', 'Responsiveness', 'Technical explanation'],
  communicationGaps: ['Public speaking', 'Verbal conciseness'],
  developmentAreas: ['Presentation skills', 'Public speaking confidence'],
  recommendations: ['Join Toastmasters', 'Practice STAR framework', 'Develop executive summaries'],
  commSummary: 'Strong communicator with excellent written skills. Would benefit from developing presentation abilities.',
  scoringVersion: '1.0',
  lastScoredAt: new Date().toISOString(),
  confidence: 0.82,
};

const mockReliabilityScore: ReliabilityScore = {
  id: 'rs-001',
  userId: 'user-001',
  profileId: 'profile-001',
  overallReliabilityScore: 88,
  reliabilityTier: 'RELIABLE',
  applicationCompletion: 95,
  profileCompleteness: 92,
  documentSubmission: 100,
  deadlineAdherence: 90,
  responseRate: 98,
  averageResponseTime: 4.5,
  responseTimeConsistency: 85,
  responseQuality: 88,
  interviewAttendance: 100,
  punctualityScore: 95,
  rescheduleRate: 10,
  noShowCount: 0,
  lastMinuteCancellations: 0,
  engagementConsistency: 85,
  followThroughRate: 92,
  processAdherence: 90,
  loginConsistency: 80,
  profileUpdateFrequency: 75,
  applicationActivity: { applied: 12, withdrawn: 1, ghosted: 0, completed: 8 },
  applicationHistory: { totalApplications: 12, completionRate: 95, averageEngagementDays: 45 },
  withdrawalPatterns: { reason: 'Accepted other offer', advance_notice: true },
  ghostingIncidents: 0,
  longTermCommitment: 85,
  jobHoppingRisk: 'LOW',
  averageTenure: 36,
  careerStability: 88,
  referenceAvailability: 100,
  referenceQuality: 85,
  employerRelationships: 'EXCELLENT',
  verificationCompliance: 95,
  documentAuthenticity: 100,
  backgroundCheckStatus: 'PASSED',
  reliabilityRisks: [],
  redFlags: [],
  greenFlags: ['Zero no-shows', 'High response rate', 'Stable work history', 'Excellent references'],
  reliabilityDrivers: [
    { factor: 'Response Rate', impact: 'Consistently responds to all communications' },
    { factor: 'Interview Attendance', impact: 'Perfect attendance record' },
  ],
  concernAreas: [],
  recommendations: ['Maintain current engagement level', 'Continue providing timely updates'],
  reliabilitySummary: 'Highly reliable candidate with excellent track record of engagement and follow-through.',
  reliabilityTrend: 'STABLE',
  trendData: { '3mo': 88, '6mo': 87, '12mo': 86 },
  dataPoints: 156,
  confidenceLevel: 'HIGH',
  scoringVersion: '1.0',
  lastScoredAt: new Date().toISOString(),
  confidence: 0.92,
};

const mockAdvancedScoresSummary: AdvancedScoresSummary = {
  userId: 'user-001',
  lastUpdated: new Date().toISOString(),
  scores: {
    cultureFit: { score: 78, tier: 'GOOD_FIT', confidence: 0.82 },
    growthPotential: { score: 82, tier: 'STRONG_GROWTH', confidence: 0.85 },
    technicalDepth: { score: 85, tier: 'SENIOR', confidence: 0.88 },
    communication: { score: 82, tier: 'STRONG', confidence: 0.82 },
    reliability: { score: 88, tier: 'RELIABLE', confidence: 0.92 },
  },
  overallAdvancedScore: 83,
  marketPercentile: 78,
  insights: [
    'Strong technical foundation positions you well for senior roles',
    'High reliability score is a significant differentiator',
    'Growth potential indicates readiness for leadership advancement',
  ],
  topStrengths: ['Technical expertise', 'Reliability', 'Growth mindset', 'Communication'],
  developmentAreas: ['Public speaking', 'Business acumen', 'Cross-cultural communication'],
};

// ============================================
// API FUNCTIONS
// ============================================

// 2.1.3 - Culture Fit Analysis
export const cultureFitAPI = {
  getAnalysis: async (companyId?: string, jobId?: string): Promise<{ analysis: CultureFitAnalysis }> => {
    if (USE_MOCK) {
      return { analysis: mockCultureFitAnalysis };
    }
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (jobId) params.append('jobId', jobId);
    const response = await axios.get(`${API_URL}/api/batch9-advanced-scoring/culture-fit?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  generateAnalysis: async (data: { companyId?: string; jobId?: string; assessmentResponses?: Record<string, unknown> }): Promise<{ analysis: Partial<CultureFitAnalysis> }> => {
    if (USE_MOCK) {
      return { analysis: { id: 'cfa-new', overallCultureScore: 78, fitLevel: 'GOOD_FIT' } };
    }
    const response = await axios.post(`${API_URL}/api/batch9-advanced-scoring/culture-fit/generate`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  submitQuestionnaire: async (responses: Record<string, unknown>): Promise<{ submitted: boolean }> => {
    if (USE_MOCK) {
      return { submitted: true };
    }
    const response = await axios.post(`${API_URL}/api/batch9-advanced-scoring/culture-fit/questionnaire`, { responses }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};

// 2.1.4 - Growth Potential Score
export const growthPotentialAPI = {
  getScore: async (): Promise<{ score: GrowthPotentialScore }> => {
    if (USE_MOCK) {
      return { score: mockGrowthPotentialScore };
    }
    const response = await axios.get(`${API_URL}/api/batch9-advanced-scoring/growth-potential`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  regenerateScore: async (): Promise<{ score: Partial<GrowthPotentialScore> }> => {
    if (USE_MOCK) {
      return { score: { id: 'gps-new', overallGrowthScore: 82, growthTier: 'STRONG_GROWTH' } };
    }
    const response = await axios.post(`${API_URL}/api/batch9-advanced-scoring/growth-potential/regenerate`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};

// 2.1.5 - Technical Depth Score
export const technicalDepthAPI = {
  getScore: async (): Promise<{ score: TechnicalDepthScore }> => {
    if (USE_MOCK) {
      return { score: mockTechnicalDepthScore };
    }
    const response = await axios.get(`${API_URL}/api/batch9-advanced-scoring/technical-depth`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  regenerateScore: async (): Promise<{ score: Partial<TechnicalDepthScore> }> => {
    if (USE_MOCK) {
      return { score: { id: 'tds-new', overallTechnicalScore: 85, technicalTier: 'SENIOR' } };
    }
    const response = await axios.post(`${API_URL}/api/batch9-advanced-scoring/technical-depth/regenerate`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};

// 2.1.6 - Communication Score
export const communicationAPI = {
  getScore: async (): Promise<{ score: CommunicationScore }> => {
    if (USE_MOCK) {
      return { score: mockCommunicationScore };
    }
    const response = await axios.get(`${API_URL}/api/batch9-advanced-scoring/communication`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  regenerateScore: async (): Promise<{ score: Partial<CommunicationScore> }> => {
    if (USE_MOCK) {
      return { score: { id: 'cs-new', overallCommScore: 82, communicationTier: 'STRONG' } };
    }
    const response = await axios.post(`${API_URL}/api/batch9-advanced-scoring/communication/regenerate`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};

// 2.1.7 - Reliability Score
export const reliabilityAPI = {
  getScore: async (): Promise<{ score: ReliabilityScore }> => {
    if (USE_MOCK) {
      return { score: mockReliabilityScore };
    }
    const response = await axios.get(`${API_URL}/api/batch9-advanced-scoring/reliability`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  getUserScore: async (userId: string): Promise<{ score: Partial<ReliabilityScore> }> => {
    if (USE_MOCK) {
      return { score: { ...mockReliabilityScore, userId } };
    }
    const response = await axios.get(`${API_URL}/api/batch9-advanced-scoring/reliability/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};

// Dashboard
export const advancedScoringDashboardAPI = {
  getAllScores: async (): Promise<AdvancedScoresSummary> => {
    if (USE_MOCK) {
      return mockAdvancedScoresSummary;
    }
    const response = await axios.get(`${API_URL}/api/batch9-advanced-scoring/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  regenerateAll: async (): Promise<{ regenerationTriggered: boolean }> => {
    if (USE_MOCK) {
      return { regenerationTriggered: true };
    }
    const response = await axios.post(`${API_URL}/api/batch9-advanced-scoring/dashboard/regenerate`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  getCandidateDashboard: async (candidateId: string): Promise<{ dashboard: CandidateScoringDashboard }> => {
    if (USE_MOCK) {
      return {
        dashboard: {
          candidateId,
          candidateName: 'John Smith',
          lastUpdated: new Date().toISOString(),
          scores: {
            cultureFit: { score: 78, tier: 'GOOD_FIT' },
            growthPotential: { score: 82, tier: 'STRONG_GROWTH' },
            technicalDepth: { score: 85, tier: 'SENIOR' },
            communication: { score: 82, tier: 'STRONG' },
            reliability: { score: 88, tier: 'RELIABLE' },
          },
          overallScore: 83,
          recommendation: 'STRONG_CANDIDATE',
          interviewFocus: ['Leadership aspirations', 'Business acumen', 'Culture fit'],
          greenFlags: ['High reliability', 'Strong technical foundation'],
          yellowFlags: ['May need business strategy support'],
          redFlags: [],
        },
      };
    }
    const response = await axios.get(`${API_URL}/api/batch9-advanced-scoring/dashboard/candidate/${candidateId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};
