// @ts-nocheck
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Hiring Success Prediction (5.2.1)
  predictHiringSuccess,
  getHiringSuccessPrediction,
  listHiringPredictionsByJob,
  recordHiringOutcome,

  // Time-to-Hire Forecast (5.2.2)
  forecastTimeToHire,
  getTimeToHireForecast,
  updateActualTimeToHire,
  listTimeToHireForecasts,

  // Offer Acceptance Prediction (5.2.3)
  predictOfferAcceptance,
  getOfferAcceptancePrediction,
  recordOfferDecision,
  listOfferPredictionsByJob,

  // Retention Risk Score (5.2.4)
  calculateRetentionRisk,
  getRetentionRiskScore,
  listHighRiskCandidates,

  // Performance Prediction (5.2.5)
  predictPerformance,
  getPerformancePrediction,
  listTopPredictedPerformers,

  // Market Availability Analysis (5.2.6)
  analyzeMarketAvailability,
  getMarketAnalysis,
  getMarketAnalysisByJob,
  listMarketAnalyses,

  // Salary Trend Prediction (5.2.7)
  predictSalaryTrends,
  getSalaryTrendPrediction,
  searchSalaryTrends,

  // Pipeline Health Prediction (5.2.8)
  analyzePipelineHealth,
  getPipelineHealth,
  getPipelineHealthByJob,
  listUnhealthyPipelines,

  // Model Configuration
  getOrCreateModelConfig,
  updateModelConfig,
  listModelConfigs,

  // Audit & Analytics
  logPrediction,
  getPredictionAccuracyStats,
  getPredictiveAnalyticsStats,
} from '../controllers/batch22PredictiveAnalytics.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// 5.2.1 HIRING SUCCESS PREDICTION ROUTES
// ============================================================================

// POST /api/predictions/hiring-success - Predict hiring success
router.post('/hiring-success', authorize(['RECRUITER', 'ADMIN']), predictHiringSuccess);

// GET /api/predictions/hiring-success/:candidateId/:jobId - Get hiring prediction
router.get('/hiring-success/:candidateId/:jobId', authorize(['RECRUITER', 'ADMIN']), getHiringSuccessPrediction);

// GET /api/predictions/hiring-success/job/:jobId - List predictions by job
router.get('/hiring-success/job/:jobId', authorize(['RECRUITER', 'ADMIN']), listHiringPredictionsByJob);

// PUT /api/predictions/hiring-success/:id/outcome - Record actual outcome
router.put('/hiring-success/:id/outcome', authorize(['RECRUITER', 'ADMIN']), recordHiringOutcome);

// ============================================================================
// 5.2.2 TIME-TO-HIRE FORECAST ROUTES
// ============================================================================

// POST /api/predictions/time-to-hire - Create forecast
router.post('/time-to-hire', authorize(['RECRUITER', 'ADMIN']), forecastTimeToHire);

// GET /api/predictions/time-to-hire/:jobId - Get forecast by job
router.get('/time-to-hire/:jobId', authorize(['RECRUITER', 'ADMIN']), getTimeToHireForecast);

// PUT /api/predictions/time-to-hire/:jobId/actual - Record actual time
router.put('/time-to-hire/:jobId/actual', authorize(['RECRUITER', 'ADMIN']), updateActualTimeToHire);

// GET /api/predictions/time-to-hire - List all forecasts
router.get('/time-to-hire', authorize(['RECRUITER', 'ADMIN']), listTimeToHireForecasts);

// ============================================================================
// 5.2.3 OFFER ACCEPTANCE PREDICTION ROUTES
// ============================================================================

// POST /api/predictions/offer-acceptance - Predict offer acceptance
router.post('/offer-acceptance', authorize(['RECRUITER', 'ADMIN']), predictOfferAcceptance);

// GET /api/predictions/offer-acceptance/:candidateId/:jobId - Get prediction
router.get('/offer-acceptance/:candidateId/:jobId', authorize(['RECRUITER', 'ADMIN']), getOfferAcceptancePrediction);

// PUT /api/predictions/offer-acceptance/:id/decision - Record decision
router.put('/offer-acceptance/:id/decision', authorize(['RECRUITER', 'ADMIN']), recordOfferDecision);

// GET /api/predictions/offer-acceptance/job/:jobId - List by job
router.get('/offer-acceptance/job/:jobId', authorize(['RECRUITER', 'ADMIN']), listOfferPredictionsByJob);

// ============================================================================
// 5.2.4 RETENTION RISK SCORE ROUTES
// ============================================================================

// POST /api/predictions/retention-risk - Calculate retention risk
router.post('/retention-risk', authorize(['RECRUITER', 'ADMIN']), calculateRetentionRisk);

// GET /api/predictions/retention-risk/:candidateId/:jobId - Get risk score
router.get('/retention-risk/:candidateId/:jobId', authorize(['RECRUITER', 'ADMIN']), getRetentionRiskScore);

// GET /api/predictions/retention-risk/high-risk - List high-risk candidates
router.get('/retention-risk/high-risk', authorize(['RECRUITER', 'ADMIN']), listHighRiskCandidates);

// ============================================================================
// 5.2.5 PERFORMANCE PREDICTION ROUTES
// ============================================================================

// POST /api/predictions/performance - Predict performance
router.post('/performance', authorize(['RECRUITER', 'ADMIN']), predictPerformance);

// GET /api/predictions/performance/:candidateId/:jobId - Get prediction
router.get('/performance/:candidateId/:jobId', authorize(['RECRUITER', 'ADMIN']), getPerformancePrediction);

// GET /api/predictions/performance/top/:jobId - List top predicted performers
router.get('/performance/top/:jobId', authorize(['RECRUITER', 'ADMIN']), listTopPredictedPerformers);

// ============================================================================
// 5.2.6 MARKET AVAILABILITY ANALYSIS ROUTES
// ============================================================================

// POST /api/predictions/market - Analyze market availability
router.post('/market', authorize(['RECRUITER', 'ADMIN']), analyzeMarketAvailability);

// GET /api/predictions/market/:id - Get market analysis
router.get('/market/:id', authorize(['RECRUITER', 'ADMIN']), getMarketAnalysis);

// GET /api/predictions/market/job/:jobId - Get market analysis by job
router.get('/market/job/:jobId', authorize(['RECRUITER', 'ADMIN']), getMarketAnalysisByJob);

// GET /api/predictions/market - List all market analyses
router.get('/market', authorize(['RECRUITER', 'ADMIN']), listMarketAnalyses);

// ============================================================================
// 5.2.7 SALARY TREND PREDICTION ROUTES
// ============================================================================

// POST /api/predictions/salary-trends - Predict salary trends
router.post('/salary-trends', authorize(['RECRUITER', 'ADMIN']), predictSalaryTrends);

// GET /api/predictions/salary-trends/:id - Get prediction
router.get('/salary-trends/:id', authorize(['RECRUITER', 'ADMIN']), getSalaryTrendPrediction);

// GET /api/predictions/salary-trends/search - Search salary trends
router.get('/salary-trends/search', authorize(['RECRUITER', 'ADMIN']), searchSalaryTrends);

// ============================================================================
// 5.2.8 PIPELINE HEALTH PREDICTION ROUTES
// ============================================================================

// POST /api/predictions/pipeline-health - Analyze pipeline health
router.post('/pipeline-health', authorize(['RECRUITER', 'ADMIN']), analyzePipelineHealth);

// GET /api/predictions/pipeline-health/:id - Get analysis
router.get('/pipeline-health/:id', authorize(['RECRUITER', 'ADMIN']), getPipelineHealth);

// GET /api/predictions/pipeline-health/job/:jobId - Get by job
router.get('/pipeline-health/job/:jobId', authorize(['RECRUITER', 'ADMIN']), getPipelineHealthByJob);

// GET /api/predictions/pipeline-health/unhealthy - List unhealthy pipelines
router.get('/pipeline-health/unhealthy', authorize(['RECRUITER', 'ADMIN']), listUnhealthyPipelines);

// ============================================================================
// MODEL CONFIGURATION ROUTES
// ============================================================================

// GET /api/predictions/config/:modelType - Get/create model config
router.get('/config/:modelType', authorize(['ADMIN']), getOrCreateModelConfig);

// PUT /api/predictions/config/:id - Update model config
router.put('/config/:id', authorize(['ADMIN']), updateModelConfig);

// GET /api/predictions/configs - List all model configs
router.get('/configs', authorize(['ADMIN']), listModelConfigs);

// ============================================================================
// AUDIT & ANALYTICS ROUTES
// ============================================================================

// POST /api/predictions/audit/log - Log a prediction
router.post('/audit/log', authorize(['RECRUITER', 'ADMIN']), logPrediction);

// GET /api/predictions/audit/accuracy - Get prediction accuracy stats
router.get('/audit/accuracy', authorize(['RECRUITER', 'ADMIN']), getPredictionAccuracyStats);

// GET /api/predictions/stats - Get overall predictive analytics stats
router.get('/stats', authorize(['RECRUITER', 'ADMIN']), getPredictiveAnalyticsStats);

export default router;
