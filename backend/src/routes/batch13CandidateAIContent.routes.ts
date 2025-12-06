import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Profile Enhancement
  enhanceProfile,
  getProfileEnhancements,
  applyEnhancement,
  // Experience Description
  generateExperienceDescription,
  getExperienceDescriptions,
  // Skills Gap
  analyzeSkillsGap,
  getSkillsGapAnalyses,
  // Cover Letter
  generateCoverLetter,
  getCoverLetters,
  updateCoverLetter,
  // Interview Prep
  generateInterviewPrep,
  getInterviewPreps,
  recordPracticeSession,
  // Salary Negotiation
  getSalaryAdvice,
  getSalaryAdviceHistory,
  recordNegotiationOutcome,
} from '../controllers/batch13CandidateAIContent.controller';

const router = Router();

// ============================================
// 2.3.1 - AI PROFILE ENHANCER
// ============================================
router.post('/profile/enhance', authenticate, authorize('CANDIDATE'), enhanceProfile);
router.get('/profile/enhancements', authenticate, authorize('CANDIDATE'), getProfileEnhancements);
router.post('/profile/enhancement/:id/apply', authenticate, authorize('CANDIDATE'), applyEnhancement);

// ============================================
// 2.3.2 - EXPERIENCE DESCRIPTION GENERATOR
// ============================================
router.post('/experience/generate', authenticate, authorize('CANDIDATE'), generateExperienceDescription);
router.get('/experience/descriptions', authenticate, authorize('CANDIDATE'), getExperienceDescriptions);

// ============================================
// 2.3.3 - SKILLS GAP IDENTIFIER
// ============================================
router.post('/skills-gap/analyze', authenticate, authorize('CANDIDATE'), analyzeSkillsGap);
router.get('/skills-gap/analyses', authenticate, authorize('CANDIDATE'), getSkillsGapAnalyses);

// ============================================
// 2.3.4 - COVER LETTER GENERATOR
// ============================================
router.post('/cover-letter/generate', authenticate, authorize('CANDIDATE'), generateCoverLetter);
router.get('/cover-letters', authenticate, authorize('CANDIDATE'), getCoverLetters);
router.put('/cover-letter/:id', authenticate, authorize('CANDIDATE'), updateCoverLetter);

// ============================================
// 2.3.5 - INTERVIEW PREP COACH
// ============================================
router.post('/interview-prep/generate', authenticate, authorize('CANDIDATE'), generateInterviewPrep);
router.get('/interview-preps', authenticate, authorize('CANDIDATE'), getInterviewPreps);
router.post('/interview-prep/:id/practice', authenticate, authorize('CANDIDATE'), recordPracticeSession);

// ============================================
// 2.3.6 - SALARY NEGOTIATION ADVISOR
// ============================================
router.post('/salary/advice', authenticate, authorize('CANDIDATE'), getSalaryAdvice);
router.get('/salary/history', authenticate, authorize('CANDIDATE'), getSalaryAdviceHistory);
router.post('/salary/:id/outcome', authenticate, authorize('CANDIDATE'), recordNegotiationOutcome);

export default router;
