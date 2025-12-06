import axios from 'axios';
import type {
  SalaryAlignment,
  MarketSalaryData,
  LocationCompatibility,
  DIMetrics,
  JobPostingBiasAnalysis,
  ScoreExplanation,
  ScoreCalibration,
  CalibrationTestResults,
  CalibrationPerformance,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const USE_MOCK = true; // Toggle for development

// ============================================
// MOCK DATA
// ============================================

const mockSalaryAlignment: SalaryAlignment = {
  id: 'sa-001',
  userId: 'user-001',
  profileId: 'profile-001',
  expectedSalaryMin: 120000,
  expectedSalaryMax: 150000,
  expectedSalaryCurrency: 'USD',
  salaryFlexibility: 'SOMEWHAT_FLEXIBLE',
  prioritizesEquity: true,
  bonusExpectations: 15,
  benefitsPriority: ['health', '401k', 'remote', 'pto'],
  marketSalaryMin: 110000,
  marketSalaryMax: 160000,
  marketSalaryMedian: 135000,
  marketSalaryCurrency: 'USD',
  marketPercentile: 65,
  marketDataSource: 'Glassdoor + LinkedIn',
  marketDataDate: new Date().toISOString(),
  alignmentScore: 82,
  alignmentCategory: 'WELL_ALIGNED',
  gapAnalysis: { gap: 0, percentage: 0, direction: 'ALIGNED', details: 'Within market range' },
  baseSalaryAlignment: 85,
  bonusAlignment: 78,
  equityAlignment: 72,
  benefitsValue: 25000,
  totalCompAlignment: 80,
  locationAdjustment: 1.0,
  adjustedExpectation: 135000,
  negotiationRoom: 10000,
  suggestedOffer: 132000,
  counterOfferLikely: true,
  recommendations: [
    'Expectations align well with market rates',
    'Consider offering equity to meet total comp expectations',
  ],
  negotiationTips: [
    'Lead with total compensation package value',
    'Highlight equity upside potential',
  ],
  alignmentSummary: 'Salary expectations are well-aligned with market data.',
  scoringVersion: '1.0',
  lastAnalyzedAt: new Date().toISOString(),
  confidence: 0.85,
};

const mockLocationCompatibility: LocationCompatibility = {
  id: 'lc-001',
  userId: 'user-001',
  profileId: 'profile-001',
  currentCity: 'Austin',
  currentState: 'Texas',
  currentCountry: 'USA',
  currentTimezone: 'America/Chicago',
  remotePreference: 'HYBRID',
  hybridDaysInOffice: 2,
  relocationWilling: true,
  relocationLocations: ['San Francisco', 'Seattle', 'New York'],
  relocationTimeframe: '1_3_MONTHS',
  relocationAssistance: true,
  travelWillingness: 'MODERATE',
  maxTravelPercent: 25,
  internationalTravel: true,
  overallCompatibility: 85,
  compatibilityLevel: 'EXCELLENT',
  locationMatch: 78,
  remoteCompatibility: 95,
  timezoneOverlap: 88,
  travelCompatibility: 92,
  relocationFeasibility: 82,
  timezoneOffset: 2,
  overlapHours: 6,
  meetingFriendly: true,
  candidateCOL: 95,
  workAuthorization: 'CITIZEN',
  sponsorshipNeeded: false,
  compatibilityFactors: {
    remoteWork: { score: 95, impact: 'positive', note: 'Strong hybrid preference matches job' },
    timezone: { score: 88, impact: 'positive', note: '6-hour overlap sufficient' },
  },
  challenges: ['Different timezone may require occasional early/late meetings'],
  mitigations: ['Async communication tools can bridge timezone gaps'],
  recommendations: [
    'Highly compatible with hybrid arrangements',
    'Timezone overlap sufficient for collaboration',
  ],
  compatibilitySummary: 'Excellent location compatibility with 85% score.',
  scoringVersion: '1.0',
  lastAnalyzedAt: new Date().toISOString(),
  confidence: 0.88,
};

const mockDIMetrics: DIMetrics = {
  id: 'di-001',
  companyId: 'company-001',
  analysisType: 'JOB_POSTING',
  genderNeutralityScore: 92,
  ageNeutralityScore: 88,
  accessibilityScore: 85,
  inclusivityScore: 90,
  flaggedTerms: [
    { term: 'rockstar', issue: 'Gendered language', suggestion: 'Use "high performer"' },
  ],
  biasAlerts: ['Review cultural fit scoring criteria for potential bias'],
  improvementActions: {
    jobPosting: ['Replace flagged terms', 'Add accessibility statement'],
    sourcing: ['Diversify referral program'],
  },
  priorityFixes: ['Update job posting language', 'Review cultural fit rubric'],
  eeocCompliant: true,
  gdprCompliant: true,
  overallDIScore: 87,
  diGrade: 'B+',
  analysisDate: new Date().toISOString(),
};

const mockScoreExplanation: ScoreExplanation = {
  id: 'exp-001',
  userId: 'user-001',
  scoreType: 'PROFILE_SCORE',
  scoreId: 'profile-001',
  scoreValue: 85,
  summary: 'Your profile score of 85 reflects a strong overall profile with excellent technical depth.',
  headline: 'Strong Profile with Excellent Technical Foundation',
  confidenceLevel: 'HIGH',
  components: [
    { name: 'Experience', weight: 0.25, score: 92, contribution: 23, explanation: 'Rich work history' },
    { name: 'Skills', weight: 0.20, score: 88, contribution: 17.6, explanation: 'High verified skills' },
    { name: 'Projects', weight: 0.20, score: 85, contribution: 17, explanation: 'Strong portfolio' },
  ],
  topContributors: [
    { factor: 'Work Experience', impact: '+15 points', reason: '8 years of experience' },
    { factor: 'Skill Assessments', impact: '+10 points', reason: '12 verified skills' },
  ],
  topDetractors: [
    { factor: 'Missing Certifications', impact: '-3 points', reason: 'Industry certs would help' },
  ],
  factors: {
    experience: { weight: 0.25, rawScore: 92, normalizedScore: 23, dataPoints: 5 },
    skills: { weight: 0.20, rawScore: 88, normalizedScore: 17.6, dataPoints: 25 },
  },
  factorWeights: { description: 'Based on industry standards' },
  factorSources: { experience: 'Profile work history', skills: 'Assessments + integrations' },
  percentileRank: 82,
  similarProfiles: { count: 1500, averageScore: 72, medianScore: 74, yourRank: 'Top 18%' },
  benchmarkComparison: { roleAverage: 75, industryAverage: 72, topPerformers: 90, yourPosition: 'Above Average' },
  improvementSuggestions: [
    { action: 'Add AWS certification', potentialImpact: '+3 points', effort: 'Medium' },
    { action: 'Complete profile sections', potentialImpact: '+2 points', effort: 'Low' },
  ],
  highlights: ['Strong technical foundation', 'Well-verified skills'],
  algorithmVersion: 'ProfileScore-v2.3',
  dataPoints: 156,
  dataQuality: 'HIGH',
  limitations: ['Score does not account for soft skills unless assessed'],
  generatedAt: new Date().toISOString(),
};

// ============================================
// API FUNCTIONS
// ============================================

// 2.1.8 - Salary Alignment
export const salaryAlignmentAPI = {
  getAlignment: async (jobId?: string): Promise<{ alignment: SalaryAlignment }> => {
    if (USE_MOCK) {
      return { alignment: mockSalaryAlignment };
    }
    const params = jobId ? `?jobId=${jobId}` : '';
    const response = await axios.get(`${API_URL}/api/batch10-extended-scoring/salary/alignment${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  updateExpectations: async (data: {
    expectedMin?: number;
    expectedMax?: number;
    currency?: string;
    flexibility?: string;
    prioritizesEquity?: boolean;
    bonusExpectations?: number;
    benefitsPriority?: string[];
  }): Promise<{ updated: boolean }> => {
    if (USE_MOCK) {
      return { updated: true };
    }
    const response = await axios.put(`${API_URL}/api/batch10-extended-scoring/salary/expectations`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  getMarketData: async (params: {
    title?: string;
    location?: string;
    seniority?: string;
    industry?: string;
  }): Promise<{ marketData: MarketSalaryData }> => {
    if (USE_MOCK) {
      return {
        marketData: {
          jobTitle: params.title || 'Software Engineer',
          normalizedTitle: 'software_engineer',
          location: params.location || 'San Francisco, CA',
          seniorityLevel: params.seniority || 'SENIOR',
          industry: params.industry || 'Technology',
          currency: 'USD',
          baseSalary: { min: 130000, max: 200000, median: 165000, mean: 168000 },
          sampleSize: 1250,
          dataSource: 'Aggregated from Glassdoor, LinkedIn',
          dataDate: new Date().toISOString(),
          yoyGrowth: 5.2,
        },
      };
    }
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await axios.get(`${API_URL}/api/batch10-extended-scoring/salary/market-data?${queryString}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};

// 2.1.9 - Location Compatibility
export const locationCompatibilityAPI = {
  getCompatibility: async (jobId?: string): Promise<{ compatibility: LocationCompatibility }> => {
    if (USE_MOCK) {
      return { compatibility: mockLocationCompatibility };
    }
    const params = jobId ? `?jobId=${jobId}` : '';
    const response = await axios.get(`${API_URL}/api/batch10-extended-scoring/location/compatibility${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  updatePreferences: async (data: {
    remotePreference?: string;
    relocationWilling?: boolean;
    relocationLocations?: string[];
    travelWillingness?: string;
  }): Promise<{ updated: boolean }> => {
    if (USE_MOCK) {
      return { updated: true };
    }
    const response = await axios.put(`${API_URL}/api/batch10-extended-scoring/location/preferences`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};

// 2.1.10 - D&I Metrics
export const diMetricsAPI = {
  getMetrics: async (params: {
    jobId?: string;
    companyId?: string;
    analysisType?: string;
  }): Promise<{ metrics: DIMetrics }> => {
    if (USE_MOCK) {
      return { metrics: mockDIMetrics };
    }
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await axios.get(`${API_URL}/api/batch10-extended-scoring/di-metrics?${queryString}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  analyzeJobPosting: async (data: {
    jobDescription: string;
    title?: string;
  }): Promise<{ analysis: JobPostingBiasAnalysis }> => {
    if (USE_MOCK) {
      return {
        analysis: {
          title: data.title || 'Job Posting',
          overallScore: 85,
          genderNeutrality: { score: 88, flaggedTerms: [] },
          ageNeutrality: { score: 92, flaggedTerms: [] },
          accessibilityInclusion: { score: 78, suggestions: ['Add accessibility statement'] },
          culturalInclusion: { score: 85, suggestions: ['Highlight diverse team'] },
          recommendations: ['Add equal opportunity statement', 'Include salary range'],
        },
      };
    }
    const response = await axios.post(`${API_URL}/api/batch10-extended-scoring/di-metrics/analyze-posting`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};

// 2.1.11 - Explainable AI
export const explainableAIAPI = {
  getExplanation: async (scoreType: string, scoreId: string): Promise<{ explanation: ScoreExplanation }> => {
    if (USE_MOCK) {
      return { explanation: { ...mockScoreExplanation, scoreType, scoreId } };
    }
    const response = await axios.get(`${API_URL}/api/batch10-extended-scoring/explain/${scoreType}/${scoreId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  submitFeedback: async (explanationId: string, data: {
    rating: number;
    feedbackText?: string;
  }): Promise<{ submitted: boolean }> => {
    if (USE_MOCK) {
      return { submitted: true };
    }
    const response = await axios.post(`${API_URL}/api/batch10-extended-scoring/explain/${explanationId}/feedback`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};

// 2.1.12 - Score Calibration
export const calibrationAPI = {
  getCalibrations: async (companyId: string): Promise<{ calibrations: ScoreCalibration[] }> => {
    if (USE_MOCK) {
      return {
        calibrations: [
          {
            id: 'cal-001',
            companyId,
            createdBy: 'admin-001',
            calibrationName: 'Engineering Roles Default',
            description: 'Standard calibration for engineering positions',
            scope: 'JOB_FAMILY',
            jobFamilies: ['Engineering', 'Product'],
            departments: [],
            jobIds: [],
            profileScoreWeights: { experience: 0.25, skills: 0.25, projects: 0.20, education: 0.15, engagement: 0.15 },
            validationStatus: 'ACTIVE',
            candidatesScored: 450,
            hireCorrelation: 0.72,
            isABTest: false,
            version: 3,
            isActive: true,
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: new Date().toISOString(),
          },
        ],
      };
    }
    const response = await axios.get(`${API_URL}/api/batch10-extended-scoring/calibration/${companyId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  createCalibration: async (companyId: string, data: Partial<ScoreCalibration>): Promise<{ calibration: ScoreCalibration }> => {
    if (USE_MOCK) {
      return {
        calibration: {
          id: 'cal-new',
          companyId,
          createdBy: 'user-001',
          calibrationName: data.calibrationName || 'New Calibration',
          scope: data.scope || 'COMPANY_WIDE',
          jobFamilies: [],
          departments: [],
          jobIds: [],
          validationStatus: 'DRAFT',
          candidatesScored: 0,
          isABTest: false,
          version: 1,
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
    const response = await axios.post(`${API_URL}/api/batch10-extended-scoring/calibration/${companyId}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  testCalibration: async (calibrationId: string, sampleSize?: number): Promise<{ testResults: CalibrationTestResults }> => {
    if (USE_MOCK) {
      return {
        testResults: {
          calibrationId,
          sampleSize: sampleSize || 50,
          results: {
            avgScoreChange: 3.2,
            candidatesAffected: 38,
            scoresIncreased: 25,
            scoresDecreased: 13,
            thresholdImpact: { wouldPass: 42, wouldFail: 8, noChange: 0 },
          },
          comparison: {
            currentCalibration: { avgScore: 72.5, passRate: 0.84 },
            newCalibration: { avgScore: 75.7, passRate: 0.82 },
          },
          recommendations: ['New calibration shows 4% higher average scores'],
        },
      };
    }
    const response = await axios.post(`${API_URL}/api/batch10-extended-scoring/calibration/${calibrationId}/test`, { sampleSize }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  getPerformance: async (calibrationId: string): Promise<{ performance: CalibrationPerformance }> => {
    if (USE_MOCK) {
      return {
        performance: {
          calibrationId,
          period: 'Last 6 months',
          metrics: { candidatesScored: 450, averageScore: 74.2, hireRate: 0.12, offerAcceptRate: 0.78 },
          correlations: {
            hireSuccess: { correlation: 0.72, significance: 'HIGH' },
            retention: { correlation: 0.68, significance: 'HIGH' },
            performance: { correlation: 0.61, significance: 'MEDIUM' },
          },
          scoreDistribution: { '0-50': 8, '51-60': 15, '61-70': 22, '71-80': 30, '81-90': 18, '91-100': 7 },
          hiringOutcomes: {
            high: { avgScore: 82, successRate: 0.89 },
            medium: { avgScore: 68, successRate: 0.72 },
            low: { avgScore: 55, successRate: 0.48 },
          },
          recommendations: ['Current calibration shows strong correlation with hiring success'],
        },
      };
    }
    const response = await axios.get(`${API_URL}/api/batch10-extended-scoring/calibration/${calibrationId}/performance`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },

  activateCalibration: async (calibrationId: string): Promise<{ activated: boolean }> => {
    if (USE_MOCK) {
      return { activated: true };
    }
    const response = await axios.post(`${API_URL}/api/batch10-extended-scoring/calibration/${calibrationId}/activate`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  },
};
