// ============================================================
// ANALYTICS TYPES - Analytics, reporting, and metrics
// ============================================================

import { DateRange, TimestampedRecord } from './common.types';

// ============================================
// Core Analytics
// ============================================

// Funnel Analytics
export interface FunnelAnalytics {
  stages: FunnelStage[];
  conversionRates: ConversionRate[];
  dropOffPoints: DropOffPoint[];
  averageTimeInStage: Record<string, number>;
  totalCandidates: number;
  totalHires: number;
  overallConversionRate: number;
}

export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  averageDuration: number;
}

export interface ConversionRate {
  fromStage: string;
  toStage: string;
  rate: number;
  count: number;
}

export interface DropOffPoint {
  stage: string;
  count: number;
  percentage: number;
  reasons: { reason: string; count: number }[];
}

// Time-to-Hire Analytics
export interface TimeToHireAnalytics {
  average: number;
  median: number;
  min: number;
  max: number;
  byStage: Record<string, number>;
  byDepartment: Record<string, number>;
  byJobType: Record<string, number>;
  trend: { date: string; value: number }[];
  benchmark?: number;
}

// Cost-per-Hire Analytics
export interface CostPerHireAnalytics {
  average: number;
  total: number;
  breakdown: {
    advertising: number;
    agency: number;
    technology: number;
    internal: number;
    other: number;
  };
  bySource: Record<string, number>;
  byDepartment: Record<string, number>;
  trend: { date: string; value: number }[];
  benchmark?: number;
}

// Source Effectiveness
export interface SourceEffectiveness {
  sources: SourceMetric[];
  topPerforming: string[];
  recommendations: string[];
}

export interface SourceMetric {
  source: string;
  applications: number;
  hires: number;
  conversionRate: number;
  costPerHire: number;
  qualityScore: number;
  timeToHire: number;
  retentionRate?: number;
}

// Recruiter Performance
export interface RecruiterPerformance {
  recruiterId: string;
  name: string;
  metrics: {
    openRequisitions: number;
    closedRequisitions: number;
    averageTimeToFill: number;
    candidatesSourced: number;
    interviewsScheduled: number;
    offersExtended: number;
    offerAcceptanceRate: number;
    candidateSatisfaction: number;
  };
  trend: { date: string; hires: number }[];
  ranking: number;
}

// Pipeline Health
export interface PipelineHealth {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    totalCandidates: number;
    activeCandidates: number;
    stagnantCandidates: number;
    bottlenecks: string[];
    velocity: number;
    coverage: number;
  };
  recommendations: string[];
}

// ============================================
// Dashboard & Reporting
// ============================================

// Dashboard Widget
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'funnel' | 'map';
  title: string;
  description?: string;
  dataSource: string;
  config: Record<string, unknown>;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  refreshInterval?: number;
}

// Dashboard
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  isDefault: boolean;
  isShared: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Filter
export interface DashboardFilter {
  id: string;
  field: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'search';
  options?: { value: string; label: string }[];
  defaultValue?: unknown;
}

// Scheduled Report
export interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  reportType: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  filters: Record<string, unknown>;
  isActive: boolean;
  lastSentAt?: string;
  nextSendAt?: string;
  createdAt: string;
}

// ============================================
// Predictive Analytics
// ============================================

// Hiring Success Prediction
export interface HiringSuccessPrediction {
  candidateId: string;
  jobId: string;
  successProbability: number;
  confidenceScore: number;
  factors: PredictionFactor[];
  recommendation: 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended';
  predictedPerformance?: number;
  predictedRetention?: number;
}

export interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// Offer Acceptance Prediction
export interface OfferAcceptancePrediction {
  candidateId: string;
  acceptanceProbability: number;
  factors: {
    salaryCompetitiveness: number;
    companyFit: number;
    roleMatch: number;
    timingScore: number;
    marketConditions: number;
  };
  suggestedActions: string[];
  competitorRisk: number;
}

// Retention Risk Score
export interface RetentionRiskScore {
  candidateId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  predictedTenure: number;
  riskFactors: RiskFactor[];
  mitigationSuggestions: string[];
}

export interface RiskFactor {
  factor: string;
  impact: number;
  description: string;
}

// ============================================
// Market Intelligence
// ============================================

// Salary Market Data
export interface SalaryMarketData {
  role: string;
  location: string;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  averageSalary: number;
  medianSalary: number;
  sampleSize: number;
  lastUpdated: string;
  trend: { period: string; change: number }[];
  byExperience: Record<string, number>;
  byCompanySize: Record<string, number>;
}

// Talent Pool Analysis
export interface TalentPoolAnalysis {
  role: string;
  location: string;
  totalCandidates: number;
  activeCandidates: number;
  passiveCandidates: number;
  supplyDemandRatio: number;
  competitionLevel: 'low' | 'medium' | 'high';
  skillAvailability: Record<string, number>;
  sourcingDifficulty: number;
  recommendations: string[];
}

// Skills Demand Trends
export interface SkillsDemandTrends {
  skills: SkillDemand[];
  emergingSkills: string[];
  decliningSkills: string[];
  period: DateRange;
}

export interface SkillDemand {
  skill: string;
  demandScore: number;
  growthRate: number;
  avgSalaryImpact: number;
  jobPostings: number;
  trend: { date: string; demand: number }[];
}

// ============================================
// Diversity Analytics
// ============================================

export interface DiversityAnalytics {
  overview: {
    diversityScore: number;
    representationIndex: number;
    inclusionScore: number;
  };
  demographics: Record<string, DemographicBreakdown>;
  hiring: {
    applicationsByDemographic: Record<string, number>;
    hiresByDemographic: Record<string, number>;
    conversionRatesByDemographic: Record<string, number>;
  };
  representation: {
    byLevel: Record<string, Record<string, number>>;
    byDepartment: Record<string, Record<string, number>>;
  };
  trends: { period: string; score: number }[];
  goals: DiversityGoal[];
}

export interface DemographicBreakdown {
  total: number;
  percentage: number;
  change: number;
}

export interface DiversityGoal {
  id: string;
  category: string;
  targetPercentage: number;
  currentPercentage: number;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'behind';
}

// ============================================
// Report Types
// ============================================

export interface AnalyticsReport {
  id: string;
  name: string;
  type: string;
  dateRange: DateRange;
  filters: Record<string, unknown>;
  data: unknown;
  generatedAt: string;
  generatedBy: string;
}

export interface ReportExport {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  sections: string[];
  dateRange: DateRange;
}
