import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// 5.2.1 HIRING SUCCESS PREDICTION
// ============================================================================

// Create/Update Hiring Success Prediction
export const predictHiringSuccess = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    // Simulated prediction logic (in production, this would use ML models)
    const prediction = await prisma.hiringSuccessPrediction.upsert({
      where: {
        candidateId_jobId: { candidateId, jobId },
      },
      update: {
        ...req.body,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        candidateId,
        jobId,
        successProbability: req.body.successProbability || 0.75,
        confidenceLevel: req.body.confidenceLevel || 0.82,
        predictionGrade: req.body.predictionGrade || 'B',
        skillMatchScore: req.body.skillMatchScore || 0.85,
        experienceMatchScore: req.body.experienceMatchScore || 0.78,
        cultureFitScore: req.body.cultureFitScore || 0.72,
        motivationScore: req.body.motivationScore || 0.80,
        stabilityScore: req.body.stabilityScore || 0.65,
        overallRiskLevel: req.body.overallRiskLevel || 'MEDIUM',
        riskFactors: req.body.riskFactors || [
          { factor: 'Short tenure at previous jobs', severity: 'medium' },
        ],
        positiveSignals: req.body.positiveSignals || [
          { signal: 'Strong technical skills', weight: 0.3 },
          { signal: 'Relevant industry experience', weight: 0.25 },
        ],
        negativeSignals: req.body.negativeSignals || [
          { signal: 'Frequent job changes', weight: 0.15 },
        ],
      },
    });

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error('Error predicting hiring success:', error);
    res.status(500).json({ success: false, error: 'Failed to predict hiring success' });
  }
};

// Get Hiring Success Prediction
export const getHiringSuccessPrediction = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.params;

    const prediction = await prisma.hiringSuccessPrediction.findUnique({
      where: {
        candidateId_jobId: { candidateId, jobId },
      },
    });

    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error getting hiring prediction:', error);
    res.status(500).json({ success: false, error: 'Failed to get prediction' });
  }
};

// List Hiring Success Predictions for Job
export const listHiringPredictionsByJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user?.companyId || 'default-company';

    const predictions = await prisma.hiringSuccessPrediction.findMany({
      where: { companyId, jobId },
      orderBy: { successProbability: 'desc' },
    });

    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    console.error('Error listing predictions:', error);
    res.status(500).json({ success: false, error: 'Failed to list predictions' });
  }
};

// Record Actual Outcome
export const recordHiringOutcome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actualOutcome, outcomeNotes } = req.body;

    const prediction = await prisma.hiringSuccessPrediction.update({
      where: { id },
      data: {
        actualOutcome,
        outcomeNotes,
        outcomeRecordedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error recording outcome:', error);
    res.status(500).json({ success: false, error: 'Failed to record outcome' });
  }
};

// ============================================================================
// 5.2.2 TIME-TO-HIRE FORECAST
// ============================================================================

// Create/Update Time-to-Hire Forecast
export const forecastTimeToHire = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    const forecast = await prisma.timeToHireForecast.upsert({
      where: { jobId },
      update: {
        ...req.body,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        jobId,
        predictedDays: req.body.predictedDays || 45,
        confidenceInterval: req.body.confidenceInterval || { low: 30, high: 60 },
        confidenceLevel: req.body.confidenceLevel || 0.78,
        sourcingDays: req.body.sourcingDays || 10,
        screeningDays: req.body.screeningDays || 7,
        interviewingDays: req.body.interviewingDays || 14,
        offerDays: req.body.offerDays || 7,
        closingDays: req.body.closingDays || 7,
        roleComplexity: req.body.roleComplexity || 'MODERATE',
        marketCompetition: req.body.marketCompetition || 'HIGH',
        compensationCompetitiveness: req.body.compensationCompetitiveness || 'AT_MARKET',
        locationDifficulty: req.body.locationDifficulty || 'MODERATE',
        predictedBottlenecks: req.body.predictedBottlenecks || [
          { stage: 'Interviewing', risk: 'high', reason: 'Limited interviewer availability' },
        ],
        bottleneckRisk: req.body.bottleneckRisk || 'MEDIUM',
      },
    });

    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    console.error('Error forecasting time to hire:', error);
    res.status(500).json({ success: false, error: 'Failed to forecast time to hire' });
  }
};

// Get Time-to-Hire Forecast
export const getTimeToHireForecast = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const forecast = await prisma.timeToHireForecast.findUnique({
      where: { jobId },
    });

    if (!forecast) {
      return res.status(404).json({ success: false, error: 'Forecast not found' });
    }

    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    console.error('Error getting forecast:', error);
    res.status(500).json({ success: false, error: 'Failed to get forecast' });
  }
};

// Update Actual Time-to-Hire
export const updateActualTimeToHire = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { actualDays, hiredAt } = req.body;

    const forecast = await prisma.timeToHireForecast.update({
      where: { jobId },
      data: {
        actualDays,
        hiredAt: hiredAt ? new Date(hiredAt) : new Date(),
        variance: actualDays - (await prisma.timeToHireForecast.findUnique({ where: { jobId } }))?.predictedDays!,
      },
    });

    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    console.error('Error updating actual time:', error);
    res.status(500).json({ success: false, error: 'Failed to update actual time' });
  }
};

// List All Forecasts
export const listTimeToHireForecasts = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';

    const forecasts = await prisma.timeToHireForecast.findMany({
      where: { companyId },
      orderBy: { forecastedAt: 'desc' },
    });

    res.status(200).json({ success: true, data: forecasts });
  } catch (error) {
    console.error('Error listing forecasts:', error);
    res.status(500).json({ success: false, error: 'Failed to list forecasts' });
  }
};

// ============================================================================
// 5.2.3 OFFER ACCEPTANCE PREDICTION
// ============================================================================

// Predict Offer Acceptance
export const predictOfferAcceptance = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    const prediction = await prisma.offerAcceptancePrediction.upsert({
      where: {
        candidateId_jobId: { candidateId, jobId },
      },
      update: {
        ...req.body,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        candidateId,
        jobId,
        offerId: req.body.offerId,
        acceptanceProbability: req.body.acceptanceProbability || 0.72,
        confidenceLevel: req.body.confidenceLevel || 0.80,
        predictionGrade: req.body.predictionGrade || 'B',
        compensationFit: req.body.compensationFit || 0.75,
        roleFit: req.body.roleFit || 0.85,
        locationFit: req.body.locationFit || 0.90,
        cultureFit: req.body.cultureFit || 0.78,
        growthOpportunityFit: req.body.growthOpportunityFit || 0.70,
        workLifeBalanceFit: req.body.workLifeBalanceFit || 0.82,
        competingOfferRisk: req.body.competingOfferRisk || 0.45,
        counterofferRisk: req.body.counterofferRisk || 0.30,
        timingRisk: req.body.timingRisk || 0.20,
        engagementLevel: req.body.engagementLevel || 'HIGH',
        responseTimeTrend: req.body.responseTimeTrend || 'STABLE',
        marketRateComparison: req.body.marketRateComparison || 'AT',
        improvementSuggestions: req.body.improvementSuggestions || [
          { suggestion: 'Consider adding signing bonus', impact: 'high' },
          { suggestion: 'Highlight growth opportunities', impact: 'medium' },
        ],
      },
    });

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error predicting offer acceptance:', error);
    res.status(500).json({ success: false, error: 'Failed to predict offer acceptance' });
  }
};

// Get Offer Acceptance Prediction
export const getOfferAcceptancePrediction = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.params;

    const prediction = await prisma.offerAcceptancePrediction.findUnique({
      where: {
        candidateId_jobId: { candidateId, jobId },
      },
    });

    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error getting prediction:', error);
    res.status(500).json({ success: false, error: 'Failed to get prediction' });
  }
};

// Record Offer Decision
export const recordOfferDecision = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actualDecision, rejectionReason } = req.body;

    const prediction = await prisma.offerAcceptancePrediction.update({
      where: { id },
      data: {
        actualDecision,
        rejectionReason,
        decisionDate: new Date(),
      },
    });

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error recording decision:', error);
    res.status(500).json({ success: false, error: 'Failed to record decision' });
  }
};

// List Offer Predictions by Job
export const listOfferPredictionsByJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user?.companyId || 'default-company';

    const predictions = await prisma.offerAcceptancePrediction.findMany({
      where: { companyId, jobId },
      orderBy: { acceptanceProbability: 'desc' },
    });

    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    console.error('Error listing predictions:', error);
    res.status(500).json({ success: false, error: 'Failed to list predictions' });
  }
};

// ============================================================================
// 5.2.4 RETENTION RISK SCORE
// ============================================================================

// Calculate Retention Risk
export const calculateRetentionRisk = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    const riskScore = await prisma.retentionRiskScore.upsert({
      where: {
        candidateId_jobId: { candidateId, jobId },
      },
      update: {
        ...req.body,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        candidateId,
        jobId,
        retentionProbability6Mo: req.body.retentionProbability6Mo || 0.92,
        retentionProbability1Yr: req.body.retentionProbability1Yr || 0.78,
        retentionProbability2Yr: req.body.retentionProbability2Yr || 0.55,
        predictedTenure: req.body.predictedTenure || 24,
        overallRiskLevel: req.body.overallRiskLevel || 'MODERATE',
        riskScore: req.body.riskScore || 45,
        jobHoppingIndicator: req.body.jobHoppingIndicator || 0.35,
        tenureConsistency: req.body.tenureConsistency || 0.72,
        careerProgressionFit: req.body.careerProgressionFit || 0.80,
        compensationSatisfaction: req.body.compensationSatisfaction || 0.70,
        growthOpportunityMatch: req.body.growthOpportunityMatch || 0.75,
        redFlags: req.body.redFlags || [
          { flag: 'Average tenure under 2 years', severity: 'medium' },
        ],
        yellowFlags: req.body.yellowFlags || [
          { flag: 'Overqualified for entry-level aspects', severity: 'low' },
        ],
        positiveIndicators: req.body.positiveIndicators || [
          { indicator: 'Strong alignment with company mission', weight: 0.3 },
          { indicator: 'Local to area, no relocation needed', weight: 0.2 },
        ],
        retentionStrategies: req.body.retentionStrategies || [
          { strategy: 'Clear promotion path within 18 months', priority: 'high' },
          { strategy: 'Regular check-ins on career goals', priority: 'medium' },
        ],
      },
    });

    res.status(200).json({ success: true, data: riskScore });
  } catch (error) {
    console.error('Error calculating retention risk:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate retention risk' });
  }
};

// Get Retention Risk Score
export const getRetentionRiskScore = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.params;

    const riskScore = await prisma.retentionRiskScore.findUnique({
      where: {
        candidateId_jobId: { candidateId, jobId },
      },
    });

    if (!riskScore) {
      return res.status(404).json({ success: false, error: 'Risk score not found' });
    }

    res.status(200).json({ success: true, data: riskScore });
  } catch (error) {
    console.error('Error getting risk score:', error);
    res.status(500).json({ success: false, error: 'Failed to get risk score' });
  }
};

// List High-Risk Candidates
export const listHighRiskCandidates = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { jobId } = req.query;

    const whereClause: any = {
      companyId,
      overallRiskLevel: { in: ['HIGH', 'VERY_HIGH'] },
    };

    if (jobId) {
      whereClause.jobId = jobId;
    }

    const riskScores = await prisma.retentionRiskScore.findMany({
      where: whereClause,
      orderBy: { riskScore: 'desc' },
    });

    res.status(200).json({ success: true, data: riskScores });
  } catch (error) {
    console.error('Error listing high risk candidates:', error);
    res.status(500).json({ success: false, error: 'Failed to list high risk candidates' });
  }
};

// ============================================================================
// 5.2.5 PERFORMANCE PREDICTION
// ============================================================================

// Predict Performance
export const predictPerformance = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.body;
    const companyId = req.user?.companyId || 'default-company';

    const prediction = await prisma.performancePrediction.upsert({
      where: {
        candidateId_jobId: { candidateId, jobId },
      },
      update: {
        ...req.body,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        candidateId,
        jobId,
        predictedPerformance: req.body.predictedPerformance || 'STRONG',
        performanceScore: req.body.performanceScore || 78,
        confidenceLevel: req.body.confidenceLevel || 0.75,
        technicalPerformance: req.body.technicalPerformance || 0.85,
        collaborationScore: req.body.collaborationScore || 0.72,
        leadershipPotential: req.body.leadershipPotential || 0.68,
        adaptabilityScore: req.body.adaptabilityScore || 0.80,
        innovationScore: req.body.innovationScore || 0.70,
        executionScore: req.body.executionScore || 0.82,
        expectedRampUpMonths: req.body.expectedRampUpMonths || 3,
        rampUpConfidence: req.body.rampUpConfidence || 0.78,
        growthPotentialLevel: req.body.growthPotentialLevel || 'HIGH',
        performanceRisks: req.body.performanceRisks || [
          { risk: 'May need additional leadership training', likelihood: 'medium' },
        ],
        developmentNeeds: req.body.developmentNeeds || [
          { area: 'Strategic thinking', priority: 'medium' },
          { area: 'Cross-functional collaboration', priority: 'low' },
        ],
        supportRequirements: req.body.supportRequirements || [
          { requirement: 'Weekly 1:1 with manager', duration: '3 months' },
          { requirement: 'Mentor assignment', duration: '6 months' },
        ],
        predictionFactors: req.body.predictionFactors || {
          topFactors: ['Strong technical background', 'Proven track record', 'Good culture fit'],
        },
      },
    });

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error predicting performance:', error);
    res.status(500).json({ success: false, error: 'Failed to predict performance' });
  }
};

// Get Performance Prediction
export const getPerformancePrediction = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.params;

    const prediction = await prisma.performancePrediction.findUnique({
      where: {
        candidateId_jobId: { candidateId, jobId },
      },
    });

    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error getting prediction:', error);
    res.status(500).json({ success: false, error: 'Failed to get prediction' });
  }
};

// List Top Performers by Job
export const listTopPredictedPerformers = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user?.companyId || 'default-company';

    const predictions = await prisma.performancePrediction.findMany({
      where: {
        companyId,
        jobId,
        predictedPerformance: { in: ['EXCEPTIONAL', 'STRONG'] },
      },
      orderBy: { performanceScore: 'desc' },
      take: 20,
    });

    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    console.error('Error listing top performers:', error);
    res.status(500).json({ success: false, error: 'Failed to list top performers' });
  }
};

// ============================================================================
// 5.2.6 MARKET AVAILABILITY ANALYSIS
// ============================================================================

// Analyze Market Availability
export const analyzeMarketAvailability = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { roleTitle, location, experienceLevel, requiredSkills, industry, jobId } = req.body;

    const analysis = await prisma.marketAvailabilityAnalysis.create({
      data: {
        companyId,
        jobId,
        roleTitle,
        location,
        experienceLevel,
        requiredSkills: requiredSkills || [],
        industry,
        availabilityScore: req.body.availabilityScore || 55,
        difficultyLevel: req.body.difficultyLevel || 'MODERATE',
        estimatedCandidatePool: req.body.estimatedCandidatePool || 1250,
        talentSupply: req.body.talentSupply || 'LIMITED',
        hiringDemand: req.body.hiringDemand || 'HIGH',
        supplyDemandRatio: req.body.supplyDemandRatio || 0.8,
        competitorActivity: req.body.competitorActivity || 'HIGH',
        competingOpenings: req.body.competingOpenings || 145,
        salaryTrend: req.body.salaryTrend || 'INCREASING',
        marketSalaryMin: req.body.marketSalaryMin || 80000,
        marketSalaryMax: req.body.marketSalaryMax || 150000,
        marketSalaryMedian: req.body.marketSalaryMedian || 110000,
        scarcestSkills: req.body.scarcestSkills || [
          { skill: 'Machine Learning', scarcity: 'high' },
          { skill: 'Kubernetes', scarcity: 'medium' },
        ],
        commonSkills: req.body.commonSkills || [
          { skill: 'JavaScript', availability: 'high' },
          { skill: 'Python', availability: 'high' },
        ],
        sourcingRecommendations: req.body.sourcingRecommendations || [
          { channel: 'LinkedIn Recruiter', effectiveness: 'high' },
          { channel: 'Tech meetups', effectiveness: 'medium' },
        ],
        compensationGuidance: req.body.compensationGuidance || {
          recommendation: 'Offer above median to attract top talent',
          suggestedRange: { min: 115000, max: 140000 },
        },
        timelineExpectation: req.body.timelineExpectation || 45,
        dataFreshness: new Date(),
      },
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing market:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze market' });
  }
};

// Get Market Analysis
export const getMarketAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.marketAvailabilityAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error getting analysis:', error);
    res.status(500).json({ success: false, error: 'Failed to get analysis' });
  }
};

// Get Market Analysis by Job
export const getMarketAnalysisByJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const analysis = await prisma.marketAvailabilityAnalysis.findFirst({
      where: { jobId },
      orderBy: { analyzedAt: 'desc' },
    });

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error getting analysis:', error);
    res.status(500).json({ success: false, error: 'Failed to get analysis' });
  }
};

// List Market Analyses
export const listMarketAnalyses = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';

    const analyses = await prisma.marketAvailabilityAnalysis.findMany({
      where: { companyId },
      orderBy: { analyzedAt: 'desc' },
    });

    res.status(200).json({ success: true, data: analyses });
  } catch (error) {
    console.error('Error listing analyses:', error);
    res.status(500).json({ success: false, error: 'Failed to list analyses' });
  }
};

// ============================================================================
// 5.2.7 SALARY TREND PREDICTION
// ============================================================================

// Predict Salary Trends
export const predictSalaryTrends = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { roleTitle, location, experienceLevel, industry } = req.body;

    const prediction = await prisma.salaryTrendPrediction.create({
      data: {
        companyId,
        roleTitle,
        location,
        experienceLevel,
        industry,
        currentMedian: req.body.currentMedian || 110000,
        currentMin: req.body.currentMin || 80000,
        currentMax: req.body.currentMax || 150000,
        currentPercentile25: req.body.currentPercentile25 || 92000,
        currentPercentile75: req.body.currentPercentile75 || 130000,
        prediction3Mo: req.body.prediction3Mo || {
          median: 112000,
          min: 82000,
          max: 153000,
          changePercent: 1.8,
        },
        prediction6Mo: req.body.prediction6Mo || {
          median: 115000,
          min: 84000,
          max: 158000,
          changePercent: 4.5,
        },
        prediction1Yr: req.body.prediction1Yr || {
          median: 121000,
          min: 88000,
          max: 165000,
          changePercent: 10,
        },
        trendDirection: req.body.trendDirection || 'GROWING',
        annualGrowthRate: req.body.annualGrowthRate || 10,
        volatility: req.body.volatility || 'MODERATE',
        demandImpact: req.body.demandImpact || 0.35,
        supplyImpact: req.body.supplyImpact || 0.25,
        economicImpact: req.body.economicImpact || 0.20,
        technologyImpact: req.body.technologyImpact || 0.15,
        industryComparison: req.body.industryComparison || {
          vsFintech: '+5%',
          vsHealthcare: '+12%',
          vsRetail: '+18%',
        },
        locationComparison: req.body.locationComparison || {
          vsSF: '-15%',
          vsNYC: '-10%',
          vsAustin: '+5%',
        },
        experienceProgression: req.body.experienceProgression || {
          entry: 75000,
          mid: 110000,
          senior: 145000,
          lead: 175000,
        },
        competitiveRange: req.body.competitiveRange || {
          low: 105000,
          target: 118000,
          high: 135000,
        },
      },
    });

    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error predicting salary trends:', error);
    res.status(500).json({ success: false, error: 'Failed to predict salary trends' });
  }
};

// Get Salary Trend Prediction
export const getSalaryTrendPrediction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const prediction = await prisma.salaryTrendPrediction.findUnique({
      where: { id },
    });

    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error('Error getting prediction:', error);
    res.status(500).json({ success: false, error: 'Failed to get prediction' });
  }
};

// Search Salary Trends
export const searchSalaryTrends = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { roleTitle, location, experienceLevel } = req.query;

    const whereClause: any = { companyId };

    if (roleTitle) {
      whereClause.roleTitle = { contains: roleTitle as string, mode: 'insensitive' };
    }
    if (location) {
      whereClause.location = { contains: location as string, mode: 'insensitive' };
    }
    if (experienceLevel) {
      whereClause.experienceLevel = experienceLevel;
    }

    const predictions = await prisma.salaryTrendPrediction.findMany({
      where: whereClause,
      orderBy: { predictedAt: 'desc' },
    });

    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    console.error('Error searching salary trends:', error);
    res.status(500).json({ success: false, error: 'Failed to search salary trends' });
  }
};

// ============================================================================
// 5.2.8 PIPELINE HEALTH PREDICTION
// ============================================================================

// Analyze Pipeline Health
export const analyzePipelineHealth = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { jobId } = req.body;

    const analysis = await prisma.pipelineHealthPrediction.create({
      data: {
        companyId,
        jobId,
        currentCandidates: req.body.currentCandidates || 45,
        byStage: req.body.byStage || {
          sourced: 15,
          screening: 12,
          interview: 10,
          offer: 5,
          hired: 3,
        },
        stageConversions: req.body.stageConversions || {
          sourcedToScreening: 0.80,
          screeningToInterview: 0.83,
          interviewToOffer: 0.50,
          offerToHired: 0.60,
        },
        overallHealthScore: req.body.overallHealthScore || 72,
        healthGrade: req.body.healthGrade || 'B',
        healthTrend: req.body.healthTrend || 'STABLE',
        predictedHires: req.body.predictedHires || 4,
        predictedDropouts: req.body.predictedDropouts || 8,
        fillProbability: req.body.fillProbability || 0.85,
        timeToFill: req.body.timeToFill || 35,
        bottleneckStages: req.body.bottleneckStages || [
          { stage: 'Interview', severity: 'high', cause: 'Limited interviewer availability' },
        ],
        stageRisks: req.body.stageRisks || {
          sourcing: 'low',
          screening: 'medium',
          interview: 'high',
          offer: 'medium',
        },
        conversionConcerns: req.body.conversionConcerns || [
          { fromStage: 'interview', toStage: 'offer', issue: 'Below benchmark conversion' },
        ],
        candidateGap: req.body.candidateGap || 10,
        qualityGap: req.body.qualityGap || 0.15,
        averageTimeInStage: req.body.averageTimeInStage || {
          sourcing: 5,
          screening: 3,
          interview: 10,
          offer: 7,
        },
        velocityTrend: req.body.velocityTrend || 'SLOWER',
        stalledCandidates: req.body.stalledCandidates || 5,
        urgentActions: req.body.urgentActions || [
          { action: 'Add more interviewers', priority: 'high', impact: 'Reduce bottleneck' },
          { action: 'Follow up on stalled candidates', priority: 'medium', impact: 'Improve velocity' },
        ],
        sourcingNeeds: req.body.sourcingNeeds || [
          { need: 'Add 10 more qualified candidates', channel: 'LinkedIn' },
        ],
        processImprovements: req.body.processImprovements || [
          { improvement: 'Streamline interview scheduling', effort: 'low', impact: 'high' },
        ],
        weeklyForecast: req.body.weeklyForecast || [
          { week: 1, expectedHires: 1, expectedDropouts: 2 },
          { week: 2, expectedHires: 1, expectedDropouts: 2 },
          { week: 3, expectedHires: 1, expectedDropouts: 2 },
          { week: 4, expectedHires: 1, expectedDropouts: 2 },
        ],
        hireByDateProbability: req.body.hireByDateProbability || {
          '2024-02-01': 0.65,
          '2024-02-15': 0.82,
          '2024-03-01': 0.95,
        },
      },
    });

    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing pipeline:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze pipeline' });
  }
};

// Get Pipeline Health
export const getPipelineHealth = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.pipelineHealthPrediction.findUnique({
      where: { id },
    });

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error getting analysis:', error);
    res.status(500).json({ success: false, error: 'Failed to get analysis' });
  }
};

// Get Pipeline Health by Job
export const getPipelineHealthByJob = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const analysis = await prisma.pipelineHealthPrediction.findFirst({
      where: { jobId },
      orderBy: { analyzedAt: 'desc' },
    });

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error getting analysis:', error);
    res.status(500).json({ success: false, error: 'Failed to get analysis' });
  }
};

// List Pipeline Analyses with Health Issues
export const listUnhealthyPipelines = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';

    const analyses = await prisma.pipelineHealthPrediction.findMany({
      where: {
        companyId,
        OR: [
          { healthGrade: { in: ['C', 'D', 'F'] } },
          { healthTrend: 'DECLINING' },
        ],
      },
      orderBy: { overallHealthScore: 'asc' },
    });

    res.status(200).json({ success: true, data: analyses });
  } catch (error) {
    console.error('Error listing unhealthy pipelines:', error);
    res.status(500).json({ success: false, error: 'Failed to list unhealthy pipelines' });
  }
};

// ============================================================================
// PREDICTION MODEL CONFIGURATION
// ============================================================================

// Get/Create Model Config
export const getOrCreateModelConfig = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { modelType } = req.params;

    let config = await prisma.predictionModelConfig.findUnique({
      where: {
        companyId_modelType: { companyId, modelType },
      },
    });

    if (!config) {
      config = await prisma.predictionModelConfig.create({
        data: {
          companyId,
          modelType,
          featureWeights: {},
          actionThresholds: {
            autoAdvance: 0.85,
            autoReject: 0.25,
            requireReview: 0.5,
          },
          alertThresholds: {
            highRisk: 0.7,
            lowConfidence: 0.5,
          },
          createdById: req.user?.id || 'system',
        },
      });
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('Error getting model config:', error);
    res.status(500).json({ success: false, error: 'Failed to get model config' });
  }
};

// Update Model Config
export const updateModelConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await prisma.predictionModelConfig.update({
      where: { id },
      data: {
        ...req.body,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('Error updating model config:', error);
    res.status(500).json({ success: false, error: 'Failed to update model config' });
  }
};

// List All Model Configs
export const listModelConfigs = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';

    const configs = await prisma.predictionModelConfig.findMany({
      where: { companyId },
    });

    res.status(200).json({ success: true, data: configs });
  } catch (error) {
    console.error('Error listing model configs:', error);
    res.status(500).json({ success: false, error: 'Failed to list model configs' });
  }
};

// ============================================================================
// PREDICTION AUDIT & ANALYTICS
// ============================================================================

// Log Prediction
export const logPrediction = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';

    const log = await prisma.predictionAuditLog.create({
      data: {
        companyId,
        ...req.body,
      },
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('Error logging prediction:', error);
    res.status(500).json({ success: false, error: 'Failed to log prediction' });
  }
};

// Get Prediction Accuracy Stats
export const getPredictionAccuracyStats = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';
    const { predictionType } = req.query;

    const whereClause: any = {
      companyId,
      wasAccurate: { not: null },
    };

    if (predictionType) {
      whereClause.predictionType = predictionType;
    }

    const logs = await prisma.predictionAuditLog.findMany({
      where: whereClause,
    });

    const totalPredictions = logs.length;
    const accuratePredictions = logs.filter((l) => l.wasAccurate).length;
    const averageAccuracy = logs.reduce((sum, l) => sum + (l.accuracyScore || 0), 0) / totalPredictions;

    const byType: Record<string, { total: number; accurate: number; avgScore: number }> = {};
    logs.forEach((log) => {
      if (!byType[log.predictionType]) {
        byType[log.predictionType] = { total: 0, accurate: 0, avgScore: 0 };
      }
      byType[log.predictionType].total++;
      if (log.wasAccurate) byType[log.predictionType].accurate++;
      byType[log.predictionType].avgScore += log.accuracyScore || 0;
    });

    Object.keys(byType).forEach((key) => {
      byType[key].avgScore = byType[key].avgScore / byType[key].total;
    });

    res.status(200).json({
      success: true,
      data: {
        totalPredictions,
        accuratePredictions,
        accuracyRate: totalPredictions > 0 ? accuratePredictions / totalPredictions : 0,
        averageAccuracy,
        byType,
      },
    });
  } catch (error) {
    console.error('Error getting accuracy stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get accuracy stats' });
  }
};

// Get Overall Predictive Analytics Stats
export const getPredictiveAnalyticsStats = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId || 'default-company';

    const [
      hiringPredictions,
      timeForecasts,
      offerPredictions,
      retentionScores,
      performancePredictions,
      marketAnalyses,
      salaryTrends,
      pipelineHealth,
    ] = await Promise.all([
      prisma.hiringSuccessPrediction.count({ where: { companyId } }),
      prisma.timeToHireForecast.count({ where: { companyId } }),
      prisma.offerAcceptancePrediction.count({ where: { companyId } }),
      prisma.retentionRiskScore.count({ where: { companyId } }),
      prisma.performancePrediction.count({ where: { companyId } }),
      prisma.marketAvailabilityAnalysis.count({ where: { companyId } }),
      prisma.salaryTrendPrediction.count({ where: { companyId } }),
      prisma.pipelineHealthPrediction.count({ where: { companyId } }),
    ]);

    // Get average scores
    const avgHiringSuccess = await prisma.hiringSuccessPrediction.aggregate({
      where: { companyId },
      _avg: { successProbability: true },
    });

    const avgOfferAcceptance = await prisma.offerAcceptancePrediction.aggregate({
      where: { companyId },
      _avg: { acceptanceProbability: true },
    });

    const avgPipelineHealth = await prisma.pipelineHealthPrediction.aggregate({
      where: { companyId },
      _avg: { overallHealthScore: true },
    });

    res.status(200).json({
      success: true,
      data: {
        totalPredictions: {
          hiringSuccess: hiringPredictions,
          timeToHire: timeForecasts,
          offerAcceptance: offerPredictions,
          retentionRisk: retentionScores,
          performance: performancePredictions,
          marketAvailability: marketAnalyses,
          salaryTrends: salaryTrends,
          pipelineHealth: pipelineHealth,
        },
        averages: {
          hiringSuccessProbability: avgHiringSuccess._avg.successProbability || 0,
          offerAcceptanceProbability: avgOfferAcceptance._avg.acceptanceProbability || 0,
          pipelineHealthScore: avgPipelineHealth._avg.overallHealthScore || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
};
