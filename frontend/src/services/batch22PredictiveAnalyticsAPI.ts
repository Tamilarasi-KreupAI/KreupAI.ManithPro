import axios from 'axios';
import {
  HiringSuccessPrediction,
  TimeToHireForecast,
  OfferAcceptancePrediction,
  RetentionRiskScore,
  PerformancePrediction,
  MarketAvailabilityAnalysis,
  SalaryTrendPrediction,
  PipelineHealthPrediction,
  PredictionModelConfig,
  PredictiveAnalyticsStats,
  PredictionAccuracyStats,
  PredictHiringSuccessInput,
  ForecastTimeToHireInput,
  PredictOfferAcceptanceInput,
  CalculateRetentionRiskInput,
  PredictPerformanceInput,
  AnalyzeMarketAvailabilityInput,
  PredictSalaryTrendsInput,
  AnalyzePipelineHealthInput,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = true; // Toggle for development

// Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/predictions`,
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

// ============================================================================
// MOCK DATA
// ============================================================================

const mockHiringPrediction: HiringSuccessPrediction = {
  id: 'hp-001',
  companyId: 'company-001',
  candidateId: 'candidate-001',
  jobId: 'job-001',
  successProbability: 0.78,
  confidenceLevel: 0.85,
  predictionGrade: 'B',
  skillMatchScore: 0.82,
  experienceMatchScore: 0.75,
  cultureFitScore: 0.80,
  motivationScore: 0.85,
  stabilityScore: 0.70,
  overallRiskLevel: 'MEDIUM',
  riskFactors: [
    { factor: 'Short tenure at previous job', severity: 'medium' },
    { factor: 'Salary expectations may be high', severity: 'low' },
  ],
  mitigationSuggestions: [
    'Discuss long-term career path',
    'Clarify compensation structure',
  ],
  similarHiresCount: 45,
  similarHiresSuccessRate: 0.72,
  positiveSignals: [
    { signal: 'Strong technical background', weight: 0.3 },
    { signal: 'Relevant industry experience', weight: 0.25 },
    { signal: 'Good interview performance', weight: 0.2 },
  ],
  negativeSignals: [
    { signal: 'Frequent job changes', weight: 0.15 },
  ],
  modelVersion: '2.1',
  predictedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockTimeToHireForecast: TimeToHireForecast = {
  id: 'tth-001',
  companyId: 'company-001',
  jobId: 'job-001',
  predictedDays: 42,
  confidenceInterval: { low: 30, high: 55 },
  confidenceLevel: 0.78,
  sourcingDays: 10,
  screeningDays: 7,
  interviewingDays: 14,
  offerDays: 5,
  closingDays: 6,
  roleComplexity: 'MODERATE',
  marketCompetition: 'HIGH',
  compensationCompetitiveness: 'AT_MARKET',
  locationDifficulty: 'MODERATE',
  historicalAverage: 45,
  industryBenchmark: 38,
  companyBenchmark: 40,
  predictedBottlenecks: [
    { stage: 'Interviewing', risk: 'high', reason: 'Limited interviewer availability' },
    { stage: 'Offer', risk: 'medium', reason: 'Competitive market' },
  ],
  bottleneckRisk: 'MEDIUM',
  speedUpSuggestions: [
    'Add more interviewers to panel',
    'Pre-approve salary ranges',
    'Streamline background check process',
  ],
  forecastedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockOfferAcceptancePrediction: OfferAcceptancePrediction = {
  id: 'oap-001',
  companyId: 'company-001',
  candidateId: 'candidate-001',
  jobId: 'job-001',
  acceptanceProbability: 0.72,
  confidenceLevel: 0.80,
  predictionGrade: 'B',
  compensationFit: 0.75,
  roleFit: 0.88,
  locationFit: 0.95,
  cultureFit: 0.82,
  growthOpportunityFit: 0.70,
  workLifeBalanceFit: 0.85,
  competingOfferRisk: 0.45,
  counterofferRisk: 0.30,
  timingRisk: 0.20,
  engagementLevel: 'HIGH',
  responseTimeTrend: 'STABLE',
  questionTopics: ['Growth opportunities', 'Remote work policy', 'Team structure'],
  marketRateComparison: 'AT',
  improvementSuggestions: [
    { suggestion: 'Increase base salary by 5%', impact: 'high' },
    { suggestion: 'Offer signing bonus', impact: 'medium' },
    { suggestion: 'Highlight career growth path', impact: 'medium' },
  ],
  optimalOfferRange: { min: 115000, target: 125000, max: 140000 },
  predictedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockRetentionRiskScore: RetentionRiskScore = {
  id: 'rrs-001',
  companyId: 'company-001',
  candidateId: 'candidate-001',
  jobId: 'job-001',
  retentionProbability6Mo: 0.92,
  retentionProbability1Yr: 0.78,
  retentionProbability2Yr: 0.58,
  predictedTenure: 26,
  overallRiskLevel: 'MEDIUM',
  riskScore: 42,
  jobHoppingIndicator: 0.35,
  tenureConsistency: 0.72,
  careerProgressionFit: 0.80,
  compensationSatisfaction: 0.75,
  growthOpportunityMatch: 0.70,
  redFlags: [
    { flag: 'Average tenure under 2 years', severity: 'medium' },
  ],
  yellowFlags: [
    { flag: 'Slight overqualification', severity: 'low' },
    { flag: 'Long commute', severity: 'low' },
  ],
  positiveIndicators: [
    { indicator: 'Strong alignment with company mission', weight: 0.3 },
    { indicator: 'Local to area', weight: 0.2 },
    { indicator: 'Enthusiastic about role', weight: 0.25 },
  ],
  retentionStrategies: [
    { strategy: 'Clear promotion path within 18 months', priority: 'high' },
    { strategy: 'Regular career development check-ins', priority: 'medium' },
    { strategy: 'Consider remote work flexibility', priority: 'low' },
  ],
  onboardingFocus: ['Career growth opportunities', 'Team integration', 'Mentorship program'],
  scoredAt: new Date().toISOString(),
  modelVersion: '1.5',
  updatedAt: new Date().toISOString(),
};

const mockPerformancePrediction: PerformancePrediction = {
  id: 'pp-001',
  companyId: 'company-001',
  candidateId: 'candidate-001',
  jobId: 'job-001',
  predictedPerformance: 'STRONG',
  performanceScore: 78,
  confidenceLevel: 0.75,
  technicalPerformance: 0.85,
  collaborationScore: 0.72,
  leadershipPotential: 0.68,
  adaptabilityScore: 0.80,
  innovationScore: 0.75,
  executionScore: 0.82,
  expectedRampUpMonths: 3,
  rampUpConfidence: 0.78,
  earlyWins: ['Quick technical contributions', 'Process improvements', 'Team collaboration'],
  promotionReadiness: 18,
  growthPotentialLevel: 'HIGH',
  careerCeiling: 'Senior Manager',
  performanceRisks: [
    { risk: 'May need leadership training', likelihood: 'medium' },
    { risk: 'Could struggle with ambiguity initially', likelihood: 'low' },
  ],
  developmentNeeds: [
    { area: 'Strategic thinking', priority: 'medium' },
    { area: 'Cross-functional collaboration', priority: 'low' },
  ],
  supportRequirements: [
    { requirement: 'Weekly 1:1 with manager', duration: '3 months' },
    { requirement: 'Mentor assignment', duration: '6 months' },
  ],
  predictionFactors: {
    topFactors: ['Strong technical background', 'Proven track record', 'Good culture fit'],
  },
  predictedAt: new Date().toISOString(),
  modelVersion: '2.0',
  updatedAt: new Date().toISOString(),
};

const mockMarketAnalysis: MarketAvailabilityAnalysis = {
  id: 'maa-001',
  companyId: 'company-001',
  jobId: 'job-001',
  roleTitle: 'Senior Software Engineer',
  requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS'],
  location: 'San Francisco, CA',
  experienceLevel: 'SENIOR',
  industry: 'Technology',
  availabilityScore: 55,
  difficultyLevel: 'HARD',
  estimatedCandidatePool: 1250,
  talentSupply: 'LIMITED',
  hiringDemand: 'HIGH',
  supplyDemandRatio: 0.75,
  competitorActivity: 'HIGH',
  competingOpenings: 342,
  marketSalaryMin: 150000,
  marketSalaryMax: 220000,
  marketSalaryMedian: 185000,
  salaryTrend: 'INCREASING',
  locationPremium: 1.25,
  remoteAvailability: 0.65,
  relocationWillingness: 0.20,
  scarcestSkills: [
    { skill: 'AWS', scarcity: 'high' },
    { skill: 'System Design', scarcity: 'high' },
  ],
  commonSkills: [
    { skill: 'JavaScript', availability: 'high' },
    { skill: 'React', availability: 'medium' },
  ],
  sourcingRecommendations: [
    { channel: 'LinkedIn Recruiter', effectiveness: 'high' },
    { channel: 'Tech meetups', effectiveness: 'medium' },
    { channel: 'Employee referrals', effectiveness: 'high' },
  ],
  compensationGuidance: {
    recommendation: 'Offer above median to attract top talent',
    suggestedRange: { min: 180000, target: 195000, max: 215000 },
  },
  timelineExpectation: 45,
  analyzedAt: new Date().toISOString(),
  dataFreshness: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSalaryTrendPrediction: SalaryTrendPrediction = {
  id: 'stp-001',
  companyId: 'company-001',
  roleTitle: 'Senior Software Engineer',
  location: 'San Francisco, CA',
  experienceLevel: 'SENIOR',
  industry: 'Technology',
  currentMedian: 185000,
  currentMin: 150000,
  currentMax: 220000,
  currentPercentile25: 165000,
  currentPercentile75: 205000,
  prediction3Mo: { median: 188000, min: 153000, max: 225000, changePercent: 1.6 },
  prediction6Mo: { median: 192000, min: 156000, max: 230000, changePercent: 3.8 },
  prediction1Yr: { median: 200000, min: 162000, max: 242000, changePercent: 8.1 },
  prediction2Yr: { median: 215000, min: 175000, max: 260000, changePercent: 16.2 },
  trendDirection: 'GROWING',
  annualGrowthRate: 8.1,
  volatility: 'MODERATE',
  demandImpact: 0.35,
  supplyImpact: 0.30,
  economicImpact: 0.20,
  technologyImpact: 0.10,
  industryComparison: {
    'vs Fintech': '+5%',
    'vs Healthcare': '+12%',
    'vs E-commerce': '+3%',
  },
  locationComparison: {
    'vs NYC': '+8%',
    'vs Austin': '+25%',
    'vs Seattle': '+5%',
  },
  experienceProgression: {
    entry: 120000,
    mid: 155000,
    senior: 185000,
    lead: 220000,
  },
  competitiveRange: { min: 175000, target: 190000, max: 210000 },
  budgetGuidance: 'Plan for 8-10% annual increases to remain competitive',
  timingRecommendation: 'Q1 hiring may face more competition; consider Q4',
  predictedAt: new Date().toISOString(),
  modelVersion: '1.8',
  updatedAt: new Date().toISOString(),
};

const mockPipelineHealth: PipelineHealthPrediction = {
  id: 'php-001',
  companyId: 'company-001',
  jobId: 'job-001',
  currentCandidates: 48,
  byStage: {
    sourced: 18,
    screening: 12,
    interview: 10,
    offer: 5,
    hired: 3,
  },
  stageConversions: {
    sourcedToScreening: 0.67,
    screeningToInterview: 0.83,
    interviewToOffer: 0.50,
    offerToHired: 0.60,
  },
  overallHealthScore: 72,
  healthGrade: 'B',
  healthTrend: 'STABLE',
  predictedHires: 4,
  predictedDropouts: 8,
  fillProbability: 0.85,
  timeToFill: 35,
  bottleneckStages: [
    { stage: 'Interview', severity: 'high', cause: 'Limited interviewer availability' },
    { stage: 'Offer', severity: 'medium', cause: 'Competitive market' },
  ],
  stageRisks: {
    sourcing: 'low',
    screening: 'low',
    interview: 'high',
    offer: 'medium',
  },
  conversionConcerns: [
    { fromStage: 'interview', toStage: 'offer', issue: 'Below benchmark conversion rate' },
  ],
  candidateGap: 8,
  qualityGap: 0.12,
  averageTimeInStage: {
    sourcing: 5,
    screening: 3,
    interview: 10,
    offer: 7,
  },
  velocityTrend: 'SLOWER',
  stalledCandidates: 4,
  urgentActions: [
    { action: 'Add more interviewers', priority: 'high', impact: 'Reduce interview bottleneck' },
    { action: 'Follow up on stalled candidates', priority: 'medium', impact: 'Improve velocity' },
  ],
  sourcingNeeds: [
    { need: 'Add 10 more qualified candidates', channel: 'LinkedIn' },
    { need: 'Increase referral bonuses', channel: 'Employee Referrals' },
  ],
  processImprovements: [
    { improvement: 'Streamline interview scheduling', effort: 'low', impact: 'high' },
    { improvement: 'Add async technical assessment', effort: 'medium', impact: 'high' },
  ],
  weeklyForecast: [
    { week: 1, expectedHires: 1, expectedDropouts: 2 },
    { week: 2, expectedHires: 1, expectedDropouts: 2 },
    { week: 3, expectedHires: 1, expectedDropouts: 2 },
    { week: 4, expectedHires: 1, expectedDropouts: 2 },
  ],
  hireByDateProbability: {
    '2024-02-01': 0.55,
    '2024-02-15': 0.75,
    '2024-03-01': 0.90,
  },
  analyzedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStats: PredictiveAnalyticsStats = {
  totalPredictions: {
    hiringSuccess: 245,
    timeToHire: 89,
    offerAcceptance: 178,
    retentionRisk: 203,
    performance: 215,
    marketAvailability: 34,
    salaryTrends: 56,
    pipelineHealth: 67,
  },
  averages: {
    hiringSuccessProbability: 0.72,
    offerAcceptanceProbability: 0.68,
    pipelineHealthScore: 74,
  },
};

// ============================================================================
// 5.2.1 HIRING SUCCESS PREDICTION API
// ============================================================================

export const hiringSuccessAPI = {
  predict: async (input: PredictHiringSuccessInput) => {
    if (USE_MOCK) {
      return { data: { ...mockHiringPrediction, ...input } };
    }
    return api.post<{ success: boolean; data: HiringSuccessPrediction }>('/hiring-success', input);
  },

  get: async (candidateId: string, jobId: string) => {
    if (USE_MOCK) {
      return { data: mockHiringPrediction };
    }
    return api.get<{ success: boolean; data: HiringSuccessPrediction }>(`/hiring-success/${candidateId}/${jobId}`);
  },

  listByJob: async (jobId: string) => {
    if (USE_MOCK) {
      return { data: [mockHiringPrediction] };
    }
    return api.get<{ success: boolean; data: HiringSuccessPrediction[] }>(`/hiring-success/job/${jobId}`);
  },

  recordOutcome: async (id: string, outcome: { actualOutcome: string; outcomeNotes?: string }) => {
    if (USE_MOCK) {
      return { data: { ...mockHiringPrediction, ...outcome } };
    }
    return api.put<{ success: boolean; data: HiringSuccessPrediction }>(`/hiring-success/${id}/outcome`, outcome);
  },
};

// ============================================================================
// 5.2.2 TIME-TO-HIRE FORECAST API
// ============================================================================

export const timeToHireAPI = {
  forecast: async (input: ForecastTimeToHireInput) => {
    if (USE_MOCK) {
      return { data: { ...mockTimeToHireForecast, ...input } };
    }
    return api.post<{ success: boolean; data: TimeToHireForecast }>('/time-to-hire', input);
  },

  get: async (jobId: string) => {
    if (USE_MOCK) {
      return { data: mockTimeToHireForecast };
    }
    return api.get<{ success: boolean; data: TimeToHireForecast }>(`/time-to-hire/${jobId}`);
  },

  updateActual: async (jobId: string, data: { actualDays: number; hiredAt?: string }) => {
    if (USE_MOCK) {
      return { data: { ...mockTimeToHireForecast, ...data } };
    }
    return api.put<{ success: boolean; data: TimeToHireForecast }>(`/time-to-hire/${jobId}/actual`, data);
  },

  list: async () => {
    if (USE_MOCK) {
      return { data: [mockTimeToHireForecast] };
    }
    return api.get<{ success: boolean; data: TimeToHireForecast[] }>('/time-to-hire');
  },
};

// ============================================================================
// 5.2.3 OFFER ACCEPTANCE PREDICTION API
// ============================================================================

export const offerAcceptanceAPI = {
  predict: async (input: PredictOfferAcceptanceInput) => {
    if (USE_MOCK) {
      return { data: { ...mockOfferAcceptancePrediction, ...input } };
    }
    return api.post<{ success: boolean; data: OfferAcceptancePrediction }>('/offer-acceptance', input);
  },

  get: async (candidateId: string, jobId: string) => {
    if (USE_MOCK) {
      return { data: mockOfferAcceptancePrediction };
    }
    return api.get<{ success: boolean; data: OfferAcceptancePrediction }>(`/offer-acceptance/${candidateId}/${jobId}`);
  },

  recordDecision: async (id: string, decision: { actualDecision: string; rejectionReason?: string }) => {
    if (USE_MOCK) {
      return { data: { ...mockOfferAcceptancePrediction, ...decision } };
    }
    return api.put<{ success: boolean; data: OfferAcceptancePrediction }>(`/offer-acceptance/${id}/decision`, decision);
  },

  listByJob: async (jobId: string) => {
    if (USE_MOCK) {
      return { data: [mockOfferAcceptancePrediction] };
    }
    return api.get<{ success: boolean; data: OfferAcceptancePrediction[] }>(`/offer-acceptance/job/${jobId}`);
  },
};

// ============================================================================
// 5.2.4 RETENTION RISK API
// ============================================================================

export const retentionRiskAPI = {
  calculate: async (input: CalculateRetentionRiskInput) => {
    if (USE_MOCK) {
      return { data: { ...mockRetentionRiskScore, ...input } };
    }
    return api.post<{ success: boolean; data: RetentionRiskScore }>('/retention-risk', input);
  },

  get: async (candidateId: string, jobId: string) => {
    if (USE_MOCK) {
      return { data: mockRetentionRiskScore };
    }
    return api.get<{ success: boolean; data: RetentionRiskScore }>(`/retention-risk/${candidateId}/${jobId}`);
  },

  listHighRisk: async (jobId?: string) => {
    if (USE_MOCK) {
      return { data: [{ ...mockRetentionRiskScore, overallRiskLevel: 'HIGH' as const }] };
    }
    const params = jobId ? { jobId } : {};
    return api.get<{ success: boolean; data: RetentionRiskScore[] }>('/retention-risk/high-risk', { params });
  },
};

// ============================================================================
// 5.2.5 PERFORMANCE PREDICTION API
// ============================================================================

export const performanceAPI = {
  predict: async (input: PredictPerformanceInput) => {
    if (USE_MOCK) {
      return { data: { ...mockPerformancePrediction, ...input } };
    }
    return api.post<{ success: boolean; data: PerformancePrediction }>('/performance', input);
  },

  get: async (candidateId: string, jobId: string) => {
    if (USE_MOCK) {
      return { data: mockPerformancePrediction };
    }
    return api.get<{ success: boolean; data: PerformancePrediction }>(`/performance/${candidateId}/${jobId}`);
  },

  listTopPerformers: async (jobId: string) => {
    if (USE_MOCK) {
      return { data: [mockPerformancePrediction] };
    }
    return api.get<{ success: boolean; data: PerformancePrediction[] }>(`/performance/top/${jobId}`);
  },
};

// ============================================================================
// 5.2.6 MARKET AVAILABILITY API
// ============================================================================

export const marketAvailabilityAPI = {
  analyze: async (input: AnalyzeMarketAvailabilityInput) => {
    if (USE_MOCK) {
      return { data: { ...mockMarketAnalysis, ...input } };
    }
    return api.post<{ success: boolean; data: MarketAvailabilityAnalysis }>('/market', input);
  },

  get: async (id: string) => {
    if (USE_MOCK) {
      return { data: mockMarketAnalysis };
    }
    return api.get<{ success: boolean; data: MarketAvailabilityAnalysis }>(`/market/${id}`);
  },

  getByJob: async (jobId: string) => {
    if (USE_MOCK) {
      return { data: mockMarketAnalysis };
    }
    return api.get<{ success: boolean; data: MarketAvailabilityAnalysis }>(`/market/job/${jobId}`);
  },

  list: async () => {
    if (USE_MOCK) {
      return { data: [mockMarketAnalysis] };
    }
    return api.get<{ success: boolean; data: MarketAvailabilityAnalysis[] }>('/market');
  },
};

// ============================================================================
// 5.2.7 SALARY TRENDS API
// ============================================================================

export const salaryTrendsAPI = {
  predict: async (input: PredictSalaryTrendsInput) => {
    if (USE_MOCK) {
      return { data: { ...mockSalaryTrendPrediction, ...input } };
    }
    return api.post<{ success: boolean; data: SalaryTrendPrediction }>('/salary-trends', input);
  },

  get: async (id: string) => {
    if (USE_MOCK) {
      return { data: mockSalaryTrendPrediction };
    }
    return api.get<{ success: boolean; data: SalaryTrendPrediction }>(`/salary-trends/${id}`);
  },

  search: async (params: { roleTitle?: string; location?: string; experienceLevel?: string }) => {
    if (USE_MOCK) {
      return { data: [mockSalaryTrendPrediction] };
    }
    return api.get<{ success: boolean; data: SalaryTrendPrediction[] }>('/salary-trends/search', { params });
  },
};

// ============================================================================
// 5.2.8 PIPELINE HEALTH API
// ============================================================================

export const pipelineHealthAPI = {
  analyze: async (input: AnalyzePipelineHealthInput) => {
    if (USE_MOCK) {
      return { data: { ...mockPipelineHealth, ...input } };
    }
    return api.post<{ success: boolean; data: PipelineHealthPrediction }>('/pipeline-health', input);
  },

  get: async (id: string) => {
    if (USE_MOCK) {
      return { data: mockPipelineHealth };
    }
    return api.get<{ success: boolean; data: PipelineHealthPrediction }>(`/pipeline-health/${id}`);
  },

  getByJob: async (jobId: string) => {
    if (USE_MOCK) {
      return { data: mockPipelineHealth };
    }
    return api.get<{ success: boolean; data: PipelineHealthPrediction }>(`/pipeline-health/job/${jobId}`);
  },

  listUnhealthy: async () => {
    if (USE_MOCK) {
      return { data: [{ ...mockPipelineHealth, healthGrade: 'D' as const, overallHealthScore: 45 }] };
    }
    return api.get<{ success: boolean; data: PipelineHealthPrediction[] }>('/pipeline-health/unhealthy');
  },
};

// ============================================================================
// MODEL CONFIGURATION API
// ============================================================================

export const modelConfigAPI = {
  getOrCreate: async (modelType: string) => {
    if (USE_MOCK) {
      const mockConfig: PredictionModelConfig = {
        id: 'pmc-001',
        companyId: 'company-001',
        modelType: modelType as any,
        modelVersion: '2.0',
        isEnabled: true,
        confidenceThreshold: 0.7,
        featureWeights: { skills: 0.3, experience: 0.25, culture: 0.2 },
        enabledFeatures: ['skills', 'experience', 'culture', 'education'],
        disabledFeatures: [],
        actionThresholds: { autoAdvance: 0.85, autoReject: 0.25, requireReview: 0.5 },
        alertThresholds: { highRisk: 0.7, lowConfidence: 0.5 },
        createdById: 'user-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { data: mockConfig };
    }
    return api.get<{ success: boolean; data: PredictionModelConfig }>(`/config/${modelType}`);
  },

  update: async (id: string, data: Partial<PredictionModelConfig>) => {
    if (USE_MOCK) {
      return { data: { id, ...data } };
    }
    return api.put<{ success: boolean; data: PredictionModelConfig }>(`/config/${id}`, data);
  },

  list: async () => {
    if (USE_MOCK) {
      return { data: [] };
    }
    return api.get<{ success: boolean; data: PredictionModelConfig[] }>('/configs');
  },
};

// ============================================================================
// ANALYTICS & STATS API
// ============================================================================

export const analyticsAPI = {
  getStats: async () => {
    if (USE_MOCK) {
      return { data: mockStats };
    }
    return api.get<{ success: boolean; data: PredictiveAnalyticsStats }>('/stats');
  },

  getAccuracyStats: async (predictionType?: string) => {
    if (USE_MOCK) {
      const mockAccuracy: PredictionAccuracyStats = {
        totalPredictions: 500,
        accuratePredictions: 380,
        accuracyRate: 0.76,
        averageAccuracy: 0.78,
        byType: {
          HIRING_SUCCESS: { total: 150, accurate: 118, avgScore: 0.79 },
          OFFER_ACCEPTANCE: { total: 120, accurate: 89, avgScore: 0.74 },
          RETENTION_RISK: { total: 130, accurate: 102, avgScore: 0.78 },
        },
      };
      return { data: mockAccuracy };
    }
    const params = predictionType ? { predictionType } : {};
    return api.get<{ success: boolean; data: PredictionAccuracyStats }>('/audit/accuracy', { params });
  },
};

export default {
  hiringSuccess: hiringSuccessAPI,
  timeToHire: timeToHireAPI,
  offerAcceptance: offerAcceptanceAPI,
  retentionRisk: retentionRiskAPI,
  performance: performanceAPI,
  marketAvailability: marketAvailabilityAPI,
  salaryTrends: salaryTrendsAPI,
  pipelineHealth: pipelineHealthAPI,
  modelConfig: modelConfigAPI,
  analytics: analyticsAPI,
};
