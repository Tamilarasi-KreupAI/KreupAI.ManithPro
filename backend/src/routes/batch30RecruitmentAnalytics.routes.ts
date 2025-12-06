// Batch 30: Recruitment Analytics Routes (9.1.1-9.1.12)
import { Router } from 'express';
import * as analyticsController from '../controllers/batch30RecruitmentAnalytics.controller';

const router = Router();

// ==========================================
// 9.1.1 Funnel Analytics Routes
// ==========================================

// Get funnel analytics
router.get('/funnel', analyticsController.getFunnelAnalytics);

// Create funnel snapshot
router.post('/funnel/snapshot', analyticsController.createFunnelSnapshot);

// Get funnel trends
router.get('/funnel/trends', analyticsController.getFunnelTrends);

// ==========================================
// 9.1.2 Time-to-Hire Tracking Routes
// ==========================================

// Get time-to-hire metrics
router.get('/time-to-hire', analyticsController.getTimeToHireMetrics);

// Get time-to-hire averages
router.get('/time-to-hire/averages', analyticsController.getTimeToHireAverages);

// Record hire time
router.post('/time-to-hire', analyticsController.recordHireTime);

// ==========================================
// 9.1.3 Cost-per-Hire Analysis Routes
// ==========================================

// Get cost-per-hire metrics
router.get('/cost-per-hire', analyticsController.getCostPerHireMetrics);

// Get cost breakdown
router.get('/cost-per-hire/breakdown', analyticsController.getCostBreakdown);

// Record hire cost
router.post('/cost-per-hire', analyticsController.recordHireCost);

// ==========================================
// 9.1.4 Source Effectiveness Routes
// ==========================================

// Get source effectiveness
router.get('/source-effectiveness', analyticsController.getSourceEffectiveness);

// Get source ROI
router.get('/source-effectiveness/roi', analyticsController.getSourceROI);

// Update source spend
router.put('/source-effectiveness/:sourceId/spend', analyticsController.updateSourceSpend);

// ==========================================
// 9.1.5 Recruiter Performance Routes
// ==========================================

// Get recruiter performance
router.get('/recruiter-performance', analyticsController.getRecruiterPerformance);

// Get recruiter leaderboard
router.get('/recruiter-performance/leaderboard', analyticsController.getRecruiterLeaderboard);

// Get recruiter goals
router.get('/recruiter-performance/:recruiterId/goals', analyticsController.getRecruiterGoals);

// ==========================================
// 9.1.6 Offer Acceptance Routes
// ==========================================

// Get offer acceptance metrics
router.get('/offer-acceptance', analyticsController.getOfferAcceptanceMetrics);

// Get offer acceptance rates
router.get('/offer-acceptance/rates', analyticsController.getOfferAcceptanceRates);

// Record new offer
router.post('/offer-acceptance', analyticsController.recordOffer);

// Update offer status
router.put('/offer-acceptance/:offerId', analyticsController.updateOfferStatus);

// ==========================================
// 9.1.7 Pipeline Velocity Routes
// ==========================================

// Get pipeline velocity
router.get('/pipeline-velocity', analyticsController.getPipelineVelocity);

// Get velocity trends
router.get('/pipeline-velocity/trends', analyticsController.getVelocityTrends);

// Get bottleneck analysis
router.get('/pipeline-velocity/bottlenecks', analyticsController.getBottleneckAnalysis);

// ==========================================
// 9.1.8 Quality of Hire Routes
// ==========================================

// Get quality of hire metrics
router.get('/quality-of-hire', analyticsController.getQualityOfHireMetrics);

// Get quality score summary
router.get('/quality-of-hire/summary', analyticsController.getQualityScoreSummary);

// Record quality assessment
router.post('/quality-of-hire', analyticsController.recordQualityAssessment);

// Update quality metrics
router.put('/quality-of-hire/:hireId', analyticsController.updateQualityMetrics);

// ==========================================
// 9.1.9 Diversity Analytics Routes
// ==========================================

// Get diversity analytics
router.get('/diversity', analyticsController.getDiversityAnalytics);

// Get diversity goals
router.get('/diversity/goals', analyticsController.getDiversityGoals);

// Get diversity conversion rates
router.get('/diversity/conversion-rates', analyticsController.getDiversityConversionRates);

// ==========================================
// 9.1.10 Interview-to-Offer Ratio Routes
// ==========================================

// Get interview-offer ratios
router.get('/interview-offer-ratio', analyticsController.getInterviewOfferRatios);

// Get interview efficiency
router.get('/interview-offer-ratio/efficiency', analyticsController.getInterviewEfficiency);

// ==========================================
// 9.1.11 Drop-off Analysis Routes
// ==========================================

// Get drop-off analysis
router.get('/drop-off', analyticsController.getDropOffAnalysis);

// Get drop-off recommendations
router.get('/drop-off/recommendations', analyticsController.getDropOffRecommendations);

// ==========================================
// 9.1.12 SLA Tracking Routes
// ==========================================

// Get SLAs
router.get('/slas', analyticsController.getSLAs);

// Create SLA
router.post('/slas', analyticsController.createSLA);

// Update SLA
router.put('/slas/:slaId', analyticsController.updateSLA);

// Delete SLA
router.delete('/slas/:slaId', analyticsController.deleteSLA);

// Get SLA tracking
router.get('/sla-tracking', analyticsController.getSLATracking);

// Get SLA breaches
router.get('/sla-breaches', analyticsController.getSLABreaches);

// ==========================================
// Dashboard & Stats Routes
// ==========================================

// Get recruitment analytics dashboard
router.get('/dashboard', analyticsController.getRecruitmentAnalyticsDashboard);

// Get recruitment stats
router.get('/stats', analyticsController.getRecruitmentStats);

// Export analytics report
router.post('/export', analyticsController.exportAnalyticsReport);

export default router;
