// Batch 22 predictive analytics API contracts. These model the live
// /api/predictions controller responses after its { success, data } envelope.

export interface HiringSignal {
  signal: string;
  weight: number;
}

export interface HiringRiskFactor {
  factor: string;
  severity: string;
}

export interface HiringSuccessPrediction {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  successProbability: number;
  confidenceLevel: number;
  predictionGrade: string;
  skillMatchScore: number;
  experienceMatchScore: number;
  cultureFitScore: number;
  motivationScore: number;
  stabilityScore: number;
  overallRiskLevel: string;
  riskFactors: HiringRiskFactor[] | null;
  positiveSignals: HiringSignal[] | null;
  negativeSignals: HiringSignal[] | null;
  actualOutcome: string | null;
  outcomeNotes: string | null;
  outcomeRecordedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimeToHireBottleneck {
  stage: string;
  risk: string;
  reason: string;
}

export interface TimeToHireForecast {
  id: string;
  companyId: string;
  jobId: string;
  predictedDays: number;
  confidenceInterval: { low: number; high: number } | null;
  confidenceLevel: number;
  sourcingDays: number;
  screeningDays: number;
  interviewingDays: number;
  offerDays: number;
  closingDays: number;
  roleComplexity: string;
  marketCompetition: string;
  compensationCompetitiveness: string;
  locationDifficulty: string;
  predictedBottlenecks: TimeToHireBottleneck[] | null;
  bottleneckRisk: string;
  actualDays: number | null;
  hiredAt: string | null;
  variance: number | null;
  forecastedAt: string;
  updatedAt: string;
}

export interface OfferAcceptancePrediction {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  offerId: string | null;
  acceptanceProbability: number;
  confidenceLevel: number;
  predictionGrade: string;
  compensationFit: number;
  roleFit: number;
  locationFit: number;
  cultureFit: number;
  growthOpportunityFit: number;
  workLifeBalanceFit: number;
  competingOfferRisk: number;
  counterofferRisk: number;
  timingRisk: number;
  engagementLevel: string;
  responseTimeTrend: string;
  marketRateComparison: string;
  improvementSuggestions: Array<{ suggestion: string; impact: string }> | null;
  actualDecision: string | null;
  rejectionReason: string | null;
  decisionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RetentionRiskScore {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  retentionProbability6Mo: number;
  retentionProbability1Yr: number;
  retentionProbability2Yr: number;
  predictedTenure: number;
  overallRiskLevel: string;
  riskScore: number;
  jobHoppingIndicator: number;
  tenureConsistency: number;
  careerProgressionFit: number;
  compensationSatisfaction: number;
  growthOpportunityMatch: number;
  redFlags: Array<{ flag: string; severity: string }> | null;
  yellowFlags: Array<{ flag: string; severity: string }> | null;
  positiveIndicators: Array<{ indicator: string; weight: number }> | null;
  retentionStrategies: Array<{ strategy: string; priority: string }> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerformancePrediction {
  id: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  predictedPerformance: string;
  performanceScore: number;
  confidenceLevel: number;
  technicalPerformance: number;
  collaborationScore: number;
  leadershipPotential: number;
  adaptabilityScore: number;
  innovationScore: number;
  executionScore: number;
  expectedRampUpMonths: number;
  rampUpConfidence: number;
  growthPotentialLevel: string;
  performanceRisks: Array<{ risk: string; likelihood: string }> | null;
  developmentNeeds: Array<{ area: string; priority: string }> | null;
  supportRequirements: Array<{ requirement: string; duration: string }> | null;
  predictionFactors: { topFactors: string[] } | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketAvailabilityAnalysis {
  id: string;
  companyId: string;
  jobId: string | null;
  roleTitle: string;
  location: string;
  experienceLevel: string;
  requiredSkills: string[];
  industry: string | null;
  availabilityScore: number;
  difficultyLevel: string;
  estimatedCandidatePool: number;
  talentSupply: string;
  hiringDemand: string;
  supplyDemandRatio: number;
  competitorActivity: string;
  competingOpenings: number;
  salaryTrend: string;
  marketSalaryMin: number | null;
  marketSalaryMax: number | null;
  marketSalaryMedian: number | null;
  scarcestSkills: Array<{ skill: string; scarcity: string }> | null;
  commonSkills: Array<{ skill: string; availability: string }> | null;
  sourcingRecommendations: Array<{ channel: string; effectiveness: string }> | null;
  compensationGuidance: { recommendation: string; suggestedRange: { min: number; max: number } } | null;
  timelineExpectation: number;
  dataFreshness: string;
  analyzedAt: string;
}

export interface SalaryForecastPeriod {
  median: number;
  min: number;
  max: number;
  changePercent: number;
}

export interface SalaryTrendPrediction {
  id: string;
  companyId: string;
  roleTitle: string;
  location: string;
  experienceLevel: string;
  industry: string | null;
  currentMedian: number;
  currentMin: number;
  currentMax: number;
  currentPercentile25: number;
  currentPercentile75: number;
  prediction3Mo: SalaryForecastPeriod | null;
  prediction6Mo: SalaryForecastPeriod | null;
  prediction1Yr: SalaryForecastPeriod | null;
  trendDirection: string;
  annualGrowthRate: number;
  volatility: string;
  demandImpact: number;
  supplyImpact: number;
  economicImpact: number;
  technologyImpact: number;
  industryComparison: Record<string, string> | null;
  locationComparison: Record<string, string> | null;
  experienceProgression: Record<string, number> | null;
  competitiveRange: { low: number; target: number; high: number } | null;
  predictedAt: string;
}

export interface PipelineHealthPrediction {
  id: string;
  companyId: string;
  jobId: string;
  currentCandidates: number;
  byStage: Record<string, number> | null;
  stageConversions: Record<string, number> | null;
  overallHealthScore: number;
  healthGrade: string;
  healthTrend: string;
  predictedHires: number;
  predictedDropouts: number;
  fillProbability: number;
  timeToFill: number;
  bottleneckStages: Array<{ stage: string; severity: string; cause: string }> | null;
  stageRisks: Record<string, string> | null;
  conversionConcerns: Array<{ fromStage: string; toStage: string; issue: string }> | null;
  candidateGap: number;
  qualityGap: number;
  averageTimeInStage: Record<string, number> | null;
  velocityTrend: string;
  stalledCandidates: number;
  urgentActions: Array<{ action: string; priority: string; impact: string }> | null;
  sourcingNeeds: Array<{ need: string; channel: string }> | null;
  processImprovements: Array<{ improvement: string; effort: string; impact: string }> | null;
  weeklyForecast: Array<{ week: number; expectedHires: number; expectedDropouts: number }> | null;
  hireByDateProbability: Record<string, number> | null;
  analyzedAt: string;
}

export interface PredictionModelConfig {
  id: string;
  companyId: string;
  modelType: string;
  featureWeights: Record<string, number> | null;
  actionThresholds: Record<string, number> | null;
  alertThresholds: Record<string, number> | null;
  isEnabled: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionAccuracyStats {
  totalPredictions: number;
  accuratePredictions: number;
  accuracyRate: number;
  averageAccuracy: number;
  byType: Record<string, { total: number; accurate: number; avgScore: number }>;
}

export interface PredictiveAnalyticsStats {
  totalPredictions: {
    hiringSuccess: number;
    timeToHire: number;
    offerAcceptance: number;
    retentionRisk: number;
    performance: number;
    marketAvailability: number;
    salaryTrends: number;
    pipelineHealth: number;
  };
  averages: {
    hiringSuccessProbability: number;
    offerAcceptanceProbability: number;
    pipelineHealthScore: number;
  };
}

export interface PredictHiringSuccessInput {
  candidateId: string;
  jobId: string;
  successProbability?: number;
  confidenceLevel?: number;
  predictionGrade?: string;
  skillMatchScore?: number;
  experienceMatchScore?: number;
  cultureFitScore?: number;
  motivationScore?: number;
  stabilityScore?: number;
  overallRiskLevel?: string;
  riskFactors?: HiringRiskFactor[];
  positiveSignals?: HiringSignal[];
  negativeSignals?: HiringSignal[];
}

export interface ForecastTimeToHireInput {
  jobId: string;
  predictedDays?: number;
  confidenceInterval?: { low: number; high: number };
  confidenceLevel?: number;
  sourcingDays?: number;
  screeningDays?: number;
  interviewingDays?: number;
  offerDays?: number;
  closingDays?: number;
  roleComplexity?: string;
  marketCompetition?: string;
  compensationCompetitiveness?: string;
  locationDifficulty?: string;
  predictedBottlenecks?: TimeToHireBottleneck[];
  bottleneckRisk?: string;
}

export interface PredictOfferAcceptanceInput {
  candidateId: string;
  jobId: string;
  offerId?: string;
  acceptanceProbability?: number;
  confidenceLevel?: number;
  predictionGrade?: string;
  compensationFit?: number;
  roleFit?: number;
  locationFit?: number;
  cultureFit?: number;
  growthOpportunityFit?: number;
  workLifeBalanceFit?: number;
  competingOfferRisk?: number;
  counterofferRisk?: number;
  timingRisk?: number;
  engagementLevel?: string;
  responseTimeTrend?: string;
  marketRateComparison?: string;
  improvementSuggestions?: Array<{ suggestion: string; impact: string }>;
}

export interface CalculateRetentionRiskInput {
  candidateId: string;
  jobId: string;
  retentionProbability6Mo?: number;
  retentionProbability1Yr?: number;
  retentionProbability2Yr?: number;
  predictedTenure?: number;
  overallRiskLevel?: string;
  riskScore?: number;
}

export interface PredictPerformanceInput {
  candidateId: string;
  jobId: string;
  predictedPerformance?: string;
  performanceScore?: number;
  confidenceLevel?: number;
}

export interface AnalyzeMarketAvailabilityInput {
  roleTitle: string;
  location: string;
  experienceLevel: string;
  requiredSkills?: string[];
  industry?: string;
  jobId?: string;
}

export interface PredictSalaryTrendsInput {
  roleTitle: string;
  location: string;
  experienceLevel: string;
  industry?: string;
}

export interface AnalyzePipelineHealthInput {
  jobId: string;
}
