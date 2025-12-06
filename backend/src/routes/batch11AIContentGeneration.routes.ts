import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Job Description Generator (2.2.1)
  generateJobDescription,
  getGeneratedJobDescriptions,
  getJobDescriptionById,
  updateJobDescriptionStatus,
  // Job Title Optimizer (2.2.2)
  optimizeJobTitle,
  getTitleSuggestions,
  // Requirements Analyzer (2.2.3)
  analyzeRequirements,
  getRequirementsAnalysis,
  // Inclusive Language Checker (2.2.4)
  checkInclusiveLanguage,
  getInclusiveLanguageChecks,
  // Salary Range Suggester (2.2.5)
  getSalaryRangeSuggestion,
  getSalaryRangeSuggestions,
  // Interview Questions Generator (2.2.6)
  generateInterviewQuestions,
  getInterviewQuestions,
  getInterviewQuestionsById,
  rateInterviewQuestions,
} from '../controllers/batch11AIContentGeneration.controller';

const router = Router();

// ============================================
// 2.2.1 - AI JOB DESCRIPTION GENERATOR
// ============================================

router.post('/job-description/generate', authenticate, authorize('RECRUITER', 'ADMIN'), generateJobDescription);
router.get('/job-descriptions', authenticate, authorize('RECRUITER', 'ADMIN'), getGeneratedJobDescriptions);
router.get('/job-description/:id', authenticate, authorize('RECRUITER', 'ADMIN'), getJobDescriptionById);
router.patch('/job-description/:id/status', authenticate, authorize('RECRUITER', 'ADMIN'), updateJobDescriptionStatus);

// ============================================
// 2.2.2 - JOB TITLE OPTIMIZER
// ============================================

router.post('/title/optimize', authenticate, authorize('RECRUITER', 'ADMIN'), optimizeJobTitle);
router.get('/title/suggestions', authenticate, authorize('RECRUITER', 'ADMIN'), getTitleSuggestions);

// ============================================
// 2.2.3 - REQUIREMENTS ANALYZER
// ============================================

router.post('/requirements/analyze', authenticate, authorize('RECRUITER', 'ADMIN'), analyzeRequirements);
router.get('/requirements/:id', authenticate, authorize('RECRUITER', 'ADMIN'), getRequirementsAnalysis);

// ============================================
// 2.2.4 - INCLUSIVE LANGUAGE CHECKER
// ============================================

router.post('/language/check', authenticate, authorize('RECRUITER', 'ADMIN'), checkInclusiveLanguage);
router.get('/language/checks', authenticate, authorize('RECRUITER', 'ADMIN'), getInclusiveLanguageChecks);

// ============================================
// 2.2.5 - SALARY RANGE SUGGESTER
// ============================================

router.post('/salary/suggest', authenticate, authorize('RECRUITER', 'ADMIN'), getSalaryRangeSuggestion);
router.get('/salary/suggestions', authenticate, authorize('RECRUITER', 'ADMIN'), getSalaryRangeSuggestions);

// ============================================
// 2.2.6 - INTERVIEW QUESTIONS GENERATOR
// ============================================

router.post('/interview-questions/generate', authenticate, authorize('RECRUITER', 'ADMIN'), generateInterviewQuestions);
router.get('/interview-questions', authenticate, authorize('RECRUITER', 'ADMIN'), getInterviewQuestions);
router.get('/interview-questions/:id', authenticate, authorize('RECRUITER', 'ADMIN'), getInterviewQuestionsById);
router.post('/interview-questions/:id/rate', authenticate, authorize('RECRUITER', 'ADMIN'), rateInterviewQuestions);

export default router;
