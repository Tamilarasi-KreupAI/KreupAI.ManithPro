// Batch 32: Market Intelligence Routes (9.3.1-9.3.6)
import { Router } from 'express';
import * as marketController from '../controllers/batch32MarketIntelligence.controller';

const router = Router();

// ==========================================
// 9.3.1 Salary Market Data Routes
// ==========================================

// Get salary market data
router.get('/salary', marketController.getSalaryMarketData);

// Get salary comparison
router.get('/salary/comparison', marketController.getSalaryComparison);

// Get salary trends
router.get('/salary/trends', marketController.getSalaryTrends);

// ==========================================
// 9.3.2 Talent Pool Analysis Routes
// ==========================================

// Get talent pool analyses
router.get('/talent-pool', marketController.getTalentPoolAnalyses);

// Create talent pool analysis
router.post('/talent-pool', marketController.createTalentPoolAnalysis);

// Get specific talent pool analysis
router.get('/talent-pool/:analysisId', marketController.getTalentPoolAnalysis);

// ==========================================
// 9.3.3 Competitor Hiring Insights Routes
// ==========================================

// Get competitor insights
router.get('/competitors', marketController.getCompetitorInsights);

// Add competitor to track
router.post('/competitors', marketController.addCompetitor);

// Get specific competitor insight
router.get('/competitors/:competitorId', marketController.getCompetitorInsight);

// Delete competitor tracking
router.delete('/competitors/:competitorId', marketController.deleteCompetitor);

// ==========================================
// 9.3.4 Skills Demand Trends Routes
// ==========================================

// Get skills demand trends
router.get('/skills', marketController.getSkillsDemandTrends);

// Get emerging skills
router.get('/skills/emerging', marketController.getEmergingSkills);

// Get skill forecast
router.get('/skills/:skillName/forecast', marketController.getSkillForecast);

// ==========================================
// 9.3.5 Location Intelligence Routes
// ==========================================

// Get location intelligence
router.get('/locations', marketController.getLocationIntelligence);

// Compare locations
router.post('/locations/compare', marketController.getLocationComparison);

// Get remote work trends
router.get('/locations/remote-trends', marketController.getRemoteWorkTrends);

// ==========================================
// 9.3.6 Industry Trends Routes
// ==========================================

// Get industry trends
router.get('/industries', marketController.getIndustryTrends);

// Compare industries
router.post('/industries/compare', marketController.getIndustryComparison);

// Get industry forecast
router.get('/industries/:industryName/forecast', marketController.getIndustryForecast);

// ==========================================
// Dashboard & Summary Routes
// ==========================================

// Get market intelligence dashboard
router.get('/dashboard', marketController.getMarketIntelligenceDashboard);

// Get market snapshot
router.get('/snapshot', marketController.getMarketSnapshot);

// Export market intelligence report
router.post('/export', marketController.exportMarketIntelligenceReport);

export default router;
