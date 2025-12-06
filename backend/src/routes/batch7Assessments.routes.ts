import { Router } from 'express';
import { authenticate, optionalAuth, authorize } from '../middleware/auth';
import {
  // Live Coding (1.4.3)
  getLiveCodingSessions,
  getLiveCodingSession,
  scheduleLiveCodingSession,
  joinLiveCodingSession,
  startLiveCodingSession,
  submitLiveCodingCode,
  endLiveCodingSession,
  // Take-Home Projects (1.4.4)
  getTakeHomeProjects,
  getTakeHomeProject,
  createTakeHomeProject,
  assignTakeHomeProject,
  getCandidateProjectSubmissions,
  startProjectSubmission,
  submitProject,
  reviewProjectSubmission,
  // External Assessments (1.4.5)
  getExternalAssessments,
  linkExternalAssessment,
  verifyExternalAssessment,
  getExternalProviderAuthUrl,
  importExternalAssessments,
  // Soft Skills (1.4.6)
  getSoftSkillsAssessments,
  getSoftSkillsAssessment,
  startSoftSkillsAttempt,
  submitSoftSkillsAttempt,
  getUserSoftSkillsAttempts,
  // Language Tests (1.4.7)
  getLanguageTests,
  getLanguageTest,
  startLanguageTestAttempt,
  submitLanguageTestAttempt,
  getUserLanguageTestAttempts,
  // Stats
  getBatch7AssessmentStats,
} from '../controllers/batch7Assessments.controller';

const router = Router();

// ============================================
// 1.4.3 - LIVE CODING ENVIRONMENT ROUTES
// ============================================

// Candidate routes
router.get('/live-coding/sessions', authenticate, getLiveCodingSessions);
router.get('/live-coding/sessions/:sessionId', authenticate, getLiveCodingSession);
router.post('/live-coding/sessions/:sessionId/join', authenticate, joinLiveCodingSession);
router.post('/live-coding/sessions/:sessionId/submit-code', authenticate, submitLiveCodingCode);

// Recruiter/Admin routes
router.post('/live-coding/schedule', authenticate, authorize('RECRUITER', 'ADMIN'), scheduleLiveCodingSession);
router.post('/live-coding/sessions/:sessionId/start', authenticate, authorize('RECRUITER', 'ADMIN'), startLiveCodingSession);
router.post('/live-coding/sessions/:sessionId/end', authenticate, authorize('RECRUITER', 'ADMIN'), endLiveCodingSession);

// ============================================
// 1.4.4 - TAKE-HOME PROJECT ROUTES
// ============================================

// Public/Authenticated browsing
router.get('/projects', optionalAuth, getTakeHomeProjects);
router.get('/projects/:slug', optionalAuth, getTakeHomeProject);

// Candidate routes
router.get('/projects/user/submissions', authenticate, getCandidateProjectSubmissions);
router.post('/projects/submissions/:submissionId/start', authenticate, startProjectSubmission);
router.post('/projects/submissions/:submissionId/submit', authenticate, submitProject);

// Recruiter/Admin routes
router.post('/projects/create', authenticate, authorize('RECRUITER', 'ADMIN'), createTakeHomeProject);
router.post('/projects/assign', authenticate, authorize('RECRUITER', 'ADMIN'), assignTakeHomeProject);
router.post('/projects/submissions/:submissionId/review', authenticate, authorize('RECRUITER', 'ADMIN'), reviewProjectSubmission);

// ============================================
// 1.4.5 - EXTERNAL ASSESSMENT INTEGRATION ROUTES
// ============================================

router.get('/external', authenticate, getExternalAssessments);
router.post('/external/link', authenticate, linkExternalAssessment);
router.post('/external/:assessmentId/verify', authenticate, verifyExternalAssessment);
router.get('/external/auth/:provider', authenticate, getExternalProviderAuthUrl);
router.post('/external/import', authenticate, importExternalAssessments);

// ============================================
// 1.4.6 - SOFT SKILLS ASSESSMENT ROUTES
// ============================================

// Browsing assessments
router.get('/soft-skills', optionalAuth, getSoftSkillsAssessments);
router.get('/soft-skills/:slug', optionalAuth, getSoftSkillsAssessment);

// Taking assessments
router.post('/soft-skills/start', authenticate, startSoftSkillsAttempt);
router.post('/soft-skills/attempts/:attemptId/submit', authenticate, submitSoftSkillsAttempt);
router.get('/soft-skills/user/attempts', authenticate, getUserSoftSkillsAttempts);

// ============================================
// 1.4.7 - LANGUAGE PROFICIENCY TEST ROUTES
// ============================================

// Browsing tests
router.get('/language-tests', optionalAuth, getLanguageTests);
router.get('/language-tests/:slug', optionalAuth, getLanguageTest);

// Taking tests
router.post('/language-tests/start', authenticate, startLanguageTestAttempt);
router.post('/language-tests/attempts/:attemptId/submit', authenticate, submitLanguageTestAttempt);
router.get('/language-tests/user/attempts', authenticate, getUserLanguageTestAttempts);

// ============================================
// COMBINED STATS ROUTE
// ============================================

router.get('/stats', authenticate, getBatch7AssessmentStats);

export default router;
