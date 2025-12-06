import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
  // Coding challenges
  getCodingChallenges,
  getCodingChallenge,
  startChallenge,
  submitChallenge,
  getUserChallengeSubmissions,
  // Technical quizzes
  getTechnicalQuizzes,
  getTechnicalQuiz,
  startQuiz,
  submitQuiz,
  getUserQuizAttempts,
  // Stats
  getAssessmentStats,
} from '../controllers/assessments.controller';

const router = Router();

// ============================================
// CODING CHALLENGE ROUTES (1.4.1)
// ============================================

// Public routes (browsing challenges)
router.get('/challenges', optionalAuth, getCodingChallenges);
router.get('/challenges/:slug', optionalAuth, getCodingChallenge);

// Authenticated routes (taking challenges)
router.post('/challenges/start', authenticate, startChallenge);
router.post('/challenges/submit', authenticate, submitChallenge);
router.get('/challenges/user/submissions', authenticate, getUserChallengeSubmissions);

// ============================================
// TECHNICAL QUIZ ROUTES (1.4.2)
// ============================================

// Public routes (browsing quizzes)
router.get('/quizzes', optionalAuth, getTechnicalQuizzes);
router.get('/quizzes/:slug', optionalAuth, getTechnicalQuiz);

// Authenticated routes (taking quizzes)
router.post('/quizzes/start', authenticate, startQuiz);
router.post('/quizzes/submit', authenticate, submitQuiz);
router.get('/quizzes/user/attempts', authenticate, getUserQuizAttempts);

// ============================================
// STATS ROUTE
// ============================================

router.get('/stats', authenticate, getAssessmentStats);

export default router;
