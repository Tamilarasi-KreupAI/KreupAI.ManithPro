// Batch 32: Market Intelligence API Services (9.3.1-9.3.6)
import api from './api';

const BASE_URL = '/api/market-intelligence';

// ==========================================
// 9.3.1 Salary Market Data API
// ==========================================

export const salaryAPI = {
  // Get salary market data
  getSalaryMarketData: async (params?: {
    jobTitle?: string;
    location?: string;
    level?: string;
    industry?: string;
    companySize?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/salary`, { params });
    return response.data;
  },

  // Get salary comparison
  getSalaryComparison: async (params?: {
    jobTitle?: string;
    location?: string;
    companySize?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/salary/comparison`, { params });
    return response.data;
  },

  // Get salary trends
  getSalaryTrends: async (params?: {
    jobTitle?: string;
    location?: string;
    period?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/salary/trends`, { params });
    return response.data;
  },
};

// ==========================================
// 9.3.2 Talent Pool Analysis API
// ==========================================

export const talentPoolAPI = {
  // Get talent pool analyses
  getTalentPoolAnalyses: async (params?: {
    status?: string;
    analysisType?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/talent-pool`, { params });
    return response.data;
  },

  // Create talent pool analysis
  createTalentPoolAnalysis: async (data: {
    analysisName: string;
    analysisType: string;
    targetSkills?: string[];
    targetLocations?: string[];
    experienceRange?: { min: number; max: number };
    educationLevel?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/talent-pool`, data);
    return response.data;
  },

  // Get specific talent pool analysis
  getTalentPoolAnalysis: async (analysisId: string) => {
    const response = await api.get(`${BASE_URL}/talent-pool/${analysisId}`);
    return response.data;
  },
};

// ==========================================
// 9.3.3 Competitor Hiring Insights API
// ==========================================

export const competitorAPI = {
  // Get competitor insights
  getCompetitorInsights: async (params?: {
    industry?: string;
    companySize?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/competitors`, { params });
    return response.data;
  },

  // Add competitor to track
  addCompetitor: async (data: {
    competitorName: string;
    competitorDomain?: string;
    industry?: string;
    companySize?: string;
  }) => {
    const response = await api.post(`${BASE_URL}/competitors`, data);
    return response.data;
  },

  // Get specific competitor insight
  getCompetitorInsight: async (competitorId: string) => {
    const response = await api.get(`${BASE_URL}/competitors/${competitorId}`);
    return response.data;
  },

  // Delete competitor tracking
  deleteCompetitor: async (competitorId: string) => {
    const response = await api.delete(`${BASE_URL}/competitors/${competitorId}`);
    return response.data;
  },
};

// ==========================================
// 9.3.4 Skills Demand Trends API
// ==========================================

export const skillsAPI = {
  // Get skills demand trends
  getSkillsDemandTrends: async (params?: {
    skillCategory?: string;
    industry?: string;
    trendDirection?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/skills`, { params });
    return response.data;
  },

  // Get emerging skills
  getEmergingSkills: async (params?: {
    industry?: string;
    limit?: number;
  }) => {
    const response = await api.get(`${BASE_URL}/skills/emerging`, { params });
    return response.data;
  },

  // Get skill forecast
  getSkillForecast: async (skillName: string) => {
    const response = await api.get(`${BASE_URL}/skills/${encodeURIComponent(skillName)}/forecast`);
    return response.data;
  },
};

// ==========================================
// 9.3.5 Location Intelligence API
// ==========================================

export const locationAPI = {
  // Get location intelligence
  getLocationIntelligence: async (params?: {
    country?: string;
    locationType?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/locations`, { params });
    return response.data;
  },

  // Compare locations
  compareLocations: async (data: {
    locations: string[];
    metrics?: string[];
  }) => {
    const response = await api.post(`${BASE_URL}/locations/compare`, data);
    return response.data;
  },

  // Get remote work trends
  getRemoteWorkTrends: async () => {
    const response = await api.get(`${BASE_URL}/locations/remote-trends`);
    return response.data;
  },
};

// ==========================================
// 9.3.6 Industry Trends API
// ==========================================

export const industryAPI = {
  // Get industry trends
  getIndustryTrends: async (params?: {
    industry?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/industries`, { params });
    return response.data;
  },

  // Compare industries
  compareIndustries: async (data: {
    industries: string[];
    metrics?: string[];
  }) => {
    const response = await api.post(`${BASE_URL}/industries/compare`, data);
    return response.data;
  },

  // Get industry forecast
  getIndustryForecast: async (industryName: string) => {
    const response = await api.get(`${BASE_URL}/industries/${encodeURIComponent(industryName)}/forecast`);
    return response.data;
  },
};

// ==========================================
// Dashboard API
// ==========================================

export const dashboardAPI = {
  // Get market intelligence dashboard
  getMarketIntelligenceDashboard: async () => {
    const response = await api.get(`${BASE_URL}/dashboard`);
    return response.data;
  },

  // Get market snapshot
  getMarketSnapshot: async (params?: {
    snapshotType?: string;
  }) => {
    const response = await api.get(`${BASE_URL}/snapshot`, { params });
    return response.data;
  },

  // Export market intelligence report
  exportMarketIntelligenceReport: async (data: {
    format?: string;
    sections?: string[];
  }) => {
    const response = await api.post(`${BASE_URL}/export`, data);
    return response.data;
  },
};

// Export all APIs
export default {
  salary: salaryAPI,
  talentPool: talentPoolAPI,
  competitor: competitorAPI,
  skills: skillsAPI,
  location: locationAPI,
  industry: industryAPI,
  dashboard: dashboardAPI,
};
