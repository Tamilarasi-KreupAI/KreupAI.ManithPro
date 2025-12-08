import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Salary Alignment (2.1.8)
  getSalaryAlignment,
  updateSalaryExpectations,
  getMarketSalaryData,
  // Location Compatibility (2.1.9)
  getLocationCompatibility,
  updateLocationPreferences,
  // D&I Metrics (2.1.10)
  getDIMetrics,
  analyzeJobPostingBias,
  // Explainable AI (2.1.11)
  getScoreExplanation,
  submitExplanationFeedback,
  // Score Calibration (2.1.12)
  getCalibrationSettings,
  createCalibration,
  updateCalibration,
  activateCalibration,
  testCalibration,
  getCalibrationPerformance,
} from '../controllers/batch10ExtendedScoring.controller';

const router = Router();

// ============================================
// 2.1.8 - SALARY EXPECTATION ALIGNMENT
// ============================================

router.get('/salary/alignment', authenticate, getSalaryAlignment);
router.put('/salary/expectations', authenticate, updateSalaryExpectations);
router.get('/salary/market-data', authenticate, getMarketSalaryData);

// ============================================
// 2.1.9 - LOCATION COMPATIBILITY
// ============================================

router.get('/location/compatibility', authenticate, getLocationCompatibility);
router.put('/location/preferences', authenticate, updateLocationPreferences);

// ============================================
// 2.1.10 - DIVERSITY & INCLUSION METRICS
// ============================================

router.get('/di-metrics', authenticate, authorize('RECRUITER', 'ADMIN'), getDIMetrics);
router.post('/di-metrics/analyze-posting', authenticate, authorize('RECRUITER', 'ADMIN'), analyzeJobPostingBias);

// ============================================
// 2.1.11 - EXPLAINABLE AI SCORES
// ============================================

router.get('/explain/:scoreType/:scoreId', authenticate, getScoreExplanation);
router.post('/explain/:explanationId/feedback', authenticate, submitExplanationFeedback);

// ============================================
// 2.1.12 - SCORE CALIBRATION TOOLS
// ============================================

router.get('/calibration/:companyId', authenticate, authorize('RECRUITER', 'ADMIN'), getCalibrationSettings);
router.post('/calibration/:companyId', authenticate, authorize('ADMIN'), createCalibration);
router.put('/calibration/:calibrationId', authenticate, authorize('ADMIN'), updateCalibration);
router.post('/calibration/:calibrationId/activate', authenticate, authorize('ADMIN'), activateCalibration);
router.post('/calibration/:calibrationId/test', authenticate, authorize('RECRUITER', 'ADMIN'), testCalibration);
router.get('/calibration/:calibrationId/performance', authenticate, authorize('RECRUITER', 'ADMIN'), getCalibrationPerformance);

export default router;
