import axios from 'axios';
import {
  HiringSuccessPrediction, TimeToHireForecast, OfferAcceptancePrediction,
  RetentionRiskScore, PerformancePrediction, MarketAvailabilityAnalysis,
  SalaryTrendPrediction, PipelineHealthPrediction, PredictionModelConfig,
  PredictiveAnalyticsStats, PredictionAccuracyStats, PredictHiringSuccessInput,
  ForecastTimeToHireInput, PredictOfferAcceptanceInput, CalculateRetentionRiskInput,
  PredictPerformanceInput, AnalyzeMarketAvailabilityInput, PredictSalaryTrendsInput,
  AnalyzePipelineHealthInput,
} from '../types/batch22PredictiveAnalytics.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
type ApiResponse<T> = { success: boolean; data: T };

const api = axios.create({
  baseURL: `${API_BASE_URL}/predictions`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend responses are { success, data }; preserve consumers' response.data contract.
api.interceptors.response.use((response) => ({
  ...response,
  data: (response.data as ApiResponse<unknown>).data,
}));

export const hiringSuccessAPI = {
  predict: async (input: PredictHiringSuccessInput) => api.post<HiringSuccessPrediction>('/hiring-success', input),
  get: async (candidateId: string, jobId: string) => api.get<HiringSuccessPrediction>(`/hiring-success/${candidateId}/${jobId}`),
  listByJob: async (jobId: string) => api.get<HiringSuccessPrediction[]>(`/hiring-success/job/${jobId}`),
  recordOutcome: async (id: string, outcome: { actualOutcome: string; outcomeNotes?: string }) => api.put<HiringSuccessPrediction>(`/hiring-success/${id}/outcome`, outcome),
};

export const timeToHireAPI = {
  forecast: async (input: ForecastTimeToHireInput) => api.post<TimeToHireForecast>('/time-to-hire', input),
  get: async (jobId: string) => api.get<TimeToHireForecast>(`/time-to-hire/${jobId}`),
  updateActual: async (jobId: string, data: { actualDays: number; hiredAt?: string }) => api.put<TimeToHireForecast>(`/time-to-hire/${jobId}/actual`, data),
  list: async () => api.get<TimeToHireForecast[]>('/time-to-hire'),
};

export const offerAcceptanceAPI = {
  predict: async (input: PredictOfferAcceptanceInput) => api.post<OfferAcceptancePrediction>('/offer-acceptance', input),
  get: async (candidateId: string, jobId: string) => api.get<OfferAcceptancePrediction>(`/offer-acceptance/${candidateId}/${jobId}`),
  recordDecision: async (id: string, decision: { actualDecision: string; rejectionReason?: string }) => api.put<OfferAcceptancePrediction>(`/offer-acceptance/${id}/decision`, decision),
  listByJob: async (jobId: string) => api.get<OfferAcceptancePrediction[]>(`/offer-acceptance/job/${jobId}`),
};

export const retentionRiskAPI = {
  calculate: async (input: CalculateRetentionRiskInput) => api.post<RetentionRiskScore>('/retention-risk', input),
  get: async (candidateId: string, jobId: string) => api.get<RetentionRiskScore>(`/retention-risk/${candidateId}/${jobId}`),
  listHighRisk: async (jobId?: string) => api.get<RetentionRiskScore[]>('/retention-risk/high-risk', { params: jobId ? { jobId } : {} }),
};

export const performanceAPI = {
  predict: async (input: PredictPerformanceInput) => api.post<PerformancePrediction>('/performance', input),
  get: async (candidateId: string, jobId: string) => api.get<PerformancePrediction>(`/performance/${candidateId}/${jobId}`),
  listTopPerformers: async (jobId: string) => api.get<PerformancePrediction[]>(`/performance/top/${jobId}`),
};

export const marketAvailabilityAPI = {
  analyze: async (input: AnalyzeMarketAvailabilityInput) => api.post<MarketAvailabilityAnalysis>('/market', input),
  get: async (id: string) => api.get<MarketAvailabilityAnalysis>(`/market/${id}`),
  getByJob: async (jobId: string) => api.get<MarketAvailabilityAnalysis>(`/market/job/${jobId}`),
  list: async () => api.get<MarketAvailabilityAnalysis[]>('/market'),
};

export const salaryTrendsAPI = {
  predict: async (input: PredictSalaryTrendsInput) => api.post<SalaryTrendPrediction>('/salary-trends', input),
  get: async (id: string) => api.get<SalaryTrendPrediction>(`/salary-trends/${id}`),
  search: async (params: { roleTitle?: string; location?: string; experienceLevel?: string }) => api.get<SalaryTrendPrediction[]>('/salary-trends/search', { params }),
};

export const pipelineHealthAPI = {
  analyze: async (input: AnalyzePipelineHealthInput) => api.post<PipelineHealthPrediction>('/pipeline-health', input),
  get: async (id: string) => api.get<PipelineHealthPrediction>(`/pipeline-health/${id}`),
  getByJob: async (jobId: string) => api.get<PipelineHealthPrediction>(`/pipeline-health/job/${jobId}`),
  listUnhealthy: async () => api.get<PipelineHealthPrediction[]>('/pipeline-health/unhealthy'),
};

export const modelConfigAPI = {
  getOrCreate: async (modelType: string) => api.get<PredictionModelConfig>(`/config/${modelType}`),
  update: async (id: string, data: Partial<PredictionModelConfig>) => api.put<PredictionModelConfig>(`/config/${id}`, data),
  list: async () => api.get<PredictionModelConfig[]>('/configs'),
};

export const analyticsAPI = {
  getStats: async () => api.get<PredictiveAnalyticsStats>('/stats'),
  getAccuracyStats: async (predictionType?: string) => api.get<PredictionAccuracyStats>('/audit/accuracy', { params: predictionType ? { predictionType } : {} }),
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
