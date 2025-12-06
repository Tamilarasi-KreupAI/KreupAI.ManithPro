import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Culture Fit Analysis (2.1.3)
  getCultureFitAnalysis,
  generateCultureFitAnalysis,
  submitCultureQuestionnaire,
  // Growth Potential Score (2.1.4)
  getGrowthPotentialScore,
  regenerateGrowthPotentialScore,
  // Technical Depth Score (2.1.5)
  getTechnicalDepthScore,
  regenerateTechnicalDepthScore,
  // Communication Score (2.1.6)
  getCommunicationScore,
  regenerateCommunicationScore,
  // Reliability Score (2.1.7)
  getReliabilityScore,
  getUserReliabilityScore,
  // Dashboard
  getAllAdvancedScores,
  regenerateAllAdvancedScores,
  getCandidateScoringDashboard,
} from '../controllers/batch9AdvancedScoring.controller';

const router = Router();

// ============================================
// 2.1.3 - CULTURE FIT ANALYSIS
// ============================================

router.get('/culture-fit', authenticate, getCultureFitAnalysis);
router.post('/culture-fit/generate', authenticate, generateCultureFitAnalysis);
router.post('/culture-fit/questionnaire', authenticate, submitCultureQuestionnaire);

// ============================================
// 2.1.4 - GROWTH POTENTIAL SCORE
// ============================================

router.get('/growth-potential', authenticate, getGrowthPotentialScore);
router.post('/growth-potential/regenerate', authenticate, regenerateGrowthPotentialScore);

// ============================================
// 2.1.5 - TECHNICAL DEPTH SCORE
// ============================================

router.get('/technical-depth', authenticate, getTechnicalDepthScore);
router.post('/technical-depth/regenerate', authenticate, regenerateTechnicalDepthScore);

// ============================================
// 2.1.6 - COMMUNICATION SCORE
// ============================================

router.get('/communication', authenticate, getCommunicationScore);
router.post('/communication/regenerate', authenticate, regenerateCommunicationScore);

// ============================================
// 2.1.7 - RELIABILITY SCORE
// ============================================

router.get('/reliability', authenticate, getReliabilityScore);
router.get('/reliability/:userId', authenticate, authorize('RECRUITER', 'ADMIN'), getUserReliabilityScore);

// ============================================
// COMPREHENSIVE SCORING DASHBOARD
// ============================================

router.get('/dashboard', authenticate, getAllAdvancedScores);
router.post('/dashboard/regenerate', authenticate, regenerateAllAdvancedScores);
router.get('/dashboard/candidate/:candidateId', authenticate, authorize('RECRUITER', 'ADMIN'), getCandidateScoringDashboard);

export default router;
