import { Router } from 'express';
import { authenticate, optionalAuth, authorize } from '../middleware/auth';
import {
  // Domain Assessments (1.4.8)
  getDomainAssessments,
  getDomainAssessment,
  startDomainAssessment,
  saveDomainAssessmentProgress,
  submitDomainAssessment,
  getUserDomainAttempts,
  // Assessment Analytics (1.4.9)
  getAssessmentAnalytics,
  refreshAssessmentAnalytics,
  // Skill Decay Tracking (1.4.10)
  getSkillDecayTrackers,
  getSkillDecaySummary,
  // AI Profile Scorer (2.1.1)
  getAIProfileScore,
  regenerateAIProfileScore,
  // Job-Fit Score (2.1.2)
  calculateJobFitScore,
  getJobFitScore,
  getUserJobFitScores,
  getJobApplicantScores,
} from '../controllers/batch8Scoring.controller';

const router = Router();

// ============================================
// 1.4.8 - DOMAIN-SPECIFIC ASSESSMENTS
// ============================================

// Browse domain assessments (public)
router.get('/domain-assessments', optionalAuth, getDomainAssessments);
router.get('/domain-assessments/:slug', optionalAuth, getDomainAssessment);

// Take domain assessments (authenticated)
router.post('/domain-assessments/start', authenticate, startDomainAssessment);
router.put('/domain-assessments/attempts/:attemptId/progress', authenticate, saveDomainAssessmentProgress);
router.post('/domain-assessments/attempts/:attemptId/submit', authenticate, submitDomainAssessment);
router.get('/domain-assessments/user/attempts', authenticate, getUserDomainAttempts);

// ============================================
// 1.4.9 - ASSESSMENT ANALYTICS
// ============================================

router.get('/analytics', authenticate, getAssessmentAnalytics);
router.post('/analytics/refresh', authenticate, refreshAssessmentAnalytics);

// ============================================
// 1.4.10 - SKILL DECAY TRACKING
// ============================================

router.get('/skill-decay', authenticate, getSkillDecayTrackers);
router.get('/skill-decay/summary', authenticate, getSkillDecaySummary);

// ============================================
// 2.1.1 - AI PROFILE SCORER
// ============================================

router.get('/ai-score', authenticate, getAIProfileScore);
router.post('/ai-score/regenerate', authenticate, regenerateAIProfileScore);

// ============================================
// 2.1.2 - JOB-FIT SCORE
// ============================================

// Candidate routes
router.post('/job-fit/:jobId/calculate', authenticate, calculateJobFitScore);
router.get('/job-fit/:jobId', authenticate, getJobFitScore);
router.get('/job-fit', authenticate, getUserJobFitScores);

// Recruiter routes
router.get('/job-fit/:jobId/applicants', authenticate, authorize('RECRUITER', 'ADMIN'), getJobApplicantScores);

export default router;
