// Batch 30: Recruitment Analytics API Service (9.1.1-9.1.12)
import {
  FunnelAnalytics,
  FunnelTrends,
  TimeToHireMetric,
  TimeToHireAverages,
  CostPerHireMetric,
  CostBreakdown,
  SourceEffectiveness,
  SourceROI,
  RecruiterPerformance,
  RecruiterLeaderboard,
  RecruiterGoals,
  OfferAcceptanceMetric,
  OfferAcceptanceRates,
  PipelineVelocity,
  VelocityTrends,
  BottleneckAnalysis,
  QualityOfHireMetric,
  QualityScoreSummary,
  DiversityAnalyticsData,
  DiversityGoals,
  DiversityConversionRates,
  InterviewOfferRatio,
  InterviewEfficiency,
  DropOffAnalysisData,
  DropOffRecommendations,
  RecruitmentSLA,
  SLATracking,
  SLABreaches,
  RecruitmentAnalyticsDashboard,
  RecruitmentStats
} from '../types';

const API_BASE = '/api/recruitment-analytics';

// Helper function
const apiCall = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return response.json();
};

// ==========================================
// 9.1.1 Funnel Analytics API
// ==========================================
export const funnelAPI = {
  getAnalytics: (params?: {
    jobId?: string;
    departmentId?: string;
    recruiterId?: string;
    periodType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<FunnelAnalytics[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/funnel${query}`);
  },

  createSnapshot: (data: Partial<FunnelAnalytics>): Promise<FunnelAnalytics> => {
    return apiCall('/funnel/snapshot', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getTrends: (params?: { jobId?: string; periods?: number }): Promise<FunnelTrends> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/funnel/trends${query}`);
  }
};

// ==========================================
// 9.1.2 Time-to-Hire API
// ==========================================
export const timeToHireAPI = {
  getMetrics: (params?: {
    jobId?: string;
    departmentId?: string;
    recruiterId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TimeToHireMetric[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/time-to-hire${query}`);
  },

  getAverages: (groupBy?: string): Promise<TimeToHireAverages> => {
    const query = groupBy ? `?groupBy=${groupBy}` : '';
    return apiCall(`/time-to-hire/averages${query}`);
  },

  recordHireTime: (data: Partial<TimeToHireMetric>): Promise<TimeToHireMetric> => {
    return apiCall('/time-to-hire', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// ==========================================
// 9.1.3 Cost-per-Hire API
// ==========================================
export const costPerHireAPI = {
  getMetrics: (params?: {
    jobId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CostPerHireMetric[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/cost-per-hire${query}`);
  },

  getBreakdown: (): Promise<CostBreakdown> => {
    return apiCall('/cost-per-hire/breakdown');
  },

  recordHireCost: (data: Partial<CostPerHireMetric>): Promise<CostPerHireMetric> => {
    return apiCall('/cost-per-hire', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// ==========================================
// 9.1.4 Source Effectiveness API
// ==========================================
export const sourceAPI = {
  getEffectiveness: (params?: {
    periodType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SourceEffectiveness[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/source-effectiveness${query}`);
  },

  getROI: (): Promise<SourceROI> => {
    return apiCall('/source-effectiveness/roi');
  },

  updateSpend: (sourceId: string, data: { totalSpend: number }): Promise<SourceEffectiveness> => {
    return apiCall(`/source-effectiveness/${sourceId}/spend`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

// ==========================================
// 9.1.5 Recruiter Performance API
// ==========================================
export const recruiterAPI = {
  getPerformance: (params?: {
    recruiterId?: string;
    periodType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RecruiterPerformance[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/recruiter-performance${query}`);
  },

  getLeaderboard: (): Promise<RecruiterLeaderboard> => {
    return apiCall('/recruiter-performance/leaderboard');
  },

  getGoals: (recruiterId: string): Promise<RecruiterGoals> => {
    return apiCall(`/recruiter-performance/${recruiterId}/goals`);
  }
};

// ==========================================
// 9.1.6 Offer Acceptance API
// ==========================================
export const offerAPI = {
  getMetrics: (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OfferAcceptanceMetric[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/offer-acceptance${query}`);
  },

  getRates: (): Promise<OfferAcceptanceRates> => {
    return apiCall('/offer-acceptance/rates');
  },

  recordOffer: (data: Partial<OfferAcceptanceMetric>): Promise<OfferAcceptanceMetric> => {
    return apiCall('/offer-acceptance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateStatus: (offerId: string, data: {
    status: string;
    declineReason?: string;
    declineDetails?: string;
  }): Promise<OfferAcceptanceMetric> => {
    return apiCall(`/offer-acceptance/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

// ==========================================
// 9.1.7 Pipeline Velocity API
// ==========================================
export const velocityAPI = {
  getVelocity: (params?: {
    jobId?: string;
    departmentId?: string;
    periodType?: string;
  }): Promise<PipelineVelocity[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/pipeline-velocity${query}`);
  },

  getTrends: (): Promise<VelocityTrends> => {
    return apiCall('/pipeline-velocity/trends');
  },

  getBottleneckAnalysis: (): Promise<BottleneckAnalysis> => {
    return apiCall('/pipeline-velocity/bottlenecks');
  }
};

// ==========================================
// 9.1.8 Quality of Hire API
// ==========================================
export const qualityAPI = {
  getMetrics: (params?: {
    recruiterId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<QualityOfHireMetric[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/quality-of-hire${query}`);
  },

  getSummary: (): Promise<QualityScoreSummary> => {
    return apiCall('/quality-of-hire/summary');
  },

  recordAssessment: (data: Partial<QualityOfHireMetric>): Promise<QualityOfHireMetric> => {
    return apiCall('/quality-of-hire', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateMetrics: (hireId: string, data: Partial<QualityOfHireMetric>): Promise<QualityOfHireMetric> => {
    return apiCall(`/quality-of-hire/${hireId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

// ==========================================
// 9.1.9 Diversity Analytics API
// ==========================================
export const diversityAPI = {
  getAnalytics: (params?: {
    jobId?: string;
    departmentId?: string;
    periodType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DiversityAnalyticsData> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/diversity${query}`);
  },

  getGoals: (): Promise<DiversityGoals> => {
    return apiCall('/diversity/goals');
  },

  getConversionRates: (): Promise<DiversityConversionRates> => {
    return apiCall('/diversity/conversion-rates');
  }
};

// ==========================================
// 9.1.10 Interview-to-Offer Ratio API
// ==========================================
export const interviewRatioAPI = {
  getRatios: (params?: {
    jobId?: string;
    recruiterId?: string;
    periodType?: string;
  }): Promise<InterviewOfferRatio[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/interview-offer-ratio${query}`);
  },

  getEfficiency: (): Promise<InterviewEfficiency> => {
    return apiCall('/interview-offer-ratio/efficiency');
  }
};

// ==========================================
// 9.1.11 Drop-off Analysis API
// ==========================================
export const dropOffAPI = {
  getAnalysis: (params?: {
    jobId?: string;
    departmentId?: string;
    periodType?: string;
  }): Promise<DropOffAnalysisData> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/drop-off${query}`);
  },

  getRecommendations: (): Promise<DropOffRecommendations> => {
    return apiCall('/drop-off/recommendations');
  }
};

// ==========================================
// 9.1.12 SLA Tracking API
// ==========================================
export const slaAPI = {
  getSLAs: (): Promise<RecruitmentSLA[]> => {
    return apiCall('/slas');
  },

  createSLA: (data: Partial<RecruitmentSLA>): Promise<RecruitmentSLA> => {
    return apiCall('/slas', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateSLA: (slaId: string, data: Partial<RecruitmentSLA>): Promise<RecruitmentSLA> => {
    return apiCall(`/slas/${slaId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteSLA: (slaId: string): Promise<{ message: string }> => {
    return apiCall(`/slas/${slaId}`, { method: 'DELETE' });
  },

  getTracking: (params?: {
    slaId?: string;
    periodType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SLATracking[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/sla-tracking${query}`);
  },

  getBreaches: (params?: {
    slaId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SLABreaches> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/sla-breaches${query}`);
  }
};

// ==========================================
// Dashboard & Stats API
// ==========================================
export const dashboardAPI = {
  getDashboard: (): Promise<RecruitmentAnalyticsDashboard> => {
    return apiCall('/dashboard');
  },

  getStats: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<RecruitmentStats> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiCall(`/stats${query}`);
  },

  exportReport: (data: {
    reportType: string;
    format?: string;
    startDate: string;
    endDate: string;
  }): Promise<{
    id: string;
    status: string;
    downloadUrl: string | null;
  }> => {
    return apiCall('/export', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Export all APIs
export default {
  funnel: funnelAPI,
  timeToHire: timeToHireAPI,
  costPerHire: costPerHireAPI,
  source: sourceAPI,
  recruiter: recruiterAPI,
  offer: offerAPI,
  velocity: velocityAPI,
  quality: qualityAPI,
  diversity: diversityAPI,
  interviewRatio: interviewRatioAPI,
  dropOff: dropOffAPI,
  sla: slaAPI,
  dashboard: dashboardAPI
};
