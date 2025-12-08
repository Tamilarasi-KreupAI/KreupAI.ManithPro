import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Screening Criteria (2.2.7)
  generateScreeningCriteria,
  getScreeningCriteria,
  // Candidate Summary (2.2.8)
  generateCandidateSummary,
  getCandidateSummaries,
  // Rejection Email (2.2.9)
  generateRejectionEmail,
  getRejectionEmails,
  sendRejectionEmail,
  // Offer Letter (2.2.10)
  generateOfferLetter,
  getOfferLetters,
  sendOfferLetter,
  // A/B Testing (2.2.11)
  createABTest,
  getABTests,
  startABTest,
  getABTestResults,
  // Competitor Analysis (2.2.12)
  analyzeCompetitors,
  getCompetitorAnalyses,
  refreshCompetitorAnalysis,
} from '../controllers/batch12ExtendedAIContent.controller';

const router = Router();

// ============================================
// 2.2.7 - SCREENING CRITERIA GENERATOR
// ============================================

router.post('/screening/generate', authenticate, authorize('RECRUITER', 'ADMIN'), generateScreeningCriteria);
router.get('/screening', authenticate, authorize('RECRUITER', 'ADMIN'), getScreeningCriteria);

// ============================================
// 2.2.8 - CANDIDATE SUMMARY GENERATOR
// ============================================

router.post('/summary/generate', authenticate, authorize('RECRUITER', 'ADMIN'), generateCandidateSummary);
router.get('/summaries', authenticate, authorize('RECRUITER', 'ADMIN'), getCandidateSummaries);

// ============================================
// 2.2.9 - REJECTION EMAIL GENERATOR
// ============================================

router.post('/rejection/generate', authenticate, authorize('RECRUITER', 'ADMIN'), generateRejectionEmail);
router.get('/rejections', authenticate, authorize('RECRUITER', 'ADMIN'), getRejectionEmails);
router.post('/rejection/:id/send', authenticate, authorize('RECRUITER', 'ADMIN'), sendRejectionEmail);

// ============================================
// 2.2.10 - OFFER LETTER GENERATOR
// ============================================

router.post('/offer/generate', authenticate, authorize('RECRUITER', 'ADMIN'), generateOfferLetter);
router.get('/offers', authenticate, authorize('RECRUITER', 'ADMIN'), getOfferLetters);
router.post('/offer/:id/send', authenticate, authorize('RECRUITER', 'ADMIN'), sendOfferLetter);

// ============================================
// 2.2.11 - JOB AD A/B TESTING
// ============================================

router.post('/ab-test', authenticate, authorize('RECRUITER', 'ADMIN'), createABTest);
router.get('/ab-tests', authenticate, authorize('RECRUITER', 'ADMIN'), getABTests);
router.post('/ab-test/:id/start', authenticate, authorize('RECRUITER', 'ADMIN'), startABTest);
router.get('/ab-test/:id/results', authenticate, authorize('RECRUITER', 'ADMIN'), getABTestResults);

// ============================================
// 2.2.12 - COMPETITOR ANALYSIS
// ============================================

router.post('/competitor/analyze', authenticate, authorize('RECRUITER', 'ADMIN'), analyzeCompetitors);
router.get('/competitor/analyses', authenticate, authorize('RECRUITER', 'ADMIN'), getCompetitorAnalyses);
router.post('/competitor/:id/refresh', authenticate, authorize('RECRUITER', 'ADMIN'), refreshCompetitorAnalysis);

export default router;
