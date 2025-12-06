import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Career Path Advisor (2.3.7)
  getCareerPathAdvice,
  getCareerPathHistory,
  // Learning Recommendations (2.3.8)
  getLearningRecommendations,
  updateLearningProgress,
  getLearningHistory,
  // Application Insights (2.3.9)
  getApplicationInsights,
  getAllApplicationInsights,
  // Portfolio Feedback (2.3.10)
  getPortfolioFeedback,
  getPortfolioFeedbackHistory,
  // Resume Parser (2.4.1)
  parseDocument,
  getParsedDocuments,
  // Skill Extraction (2.4.2)
  extractSkills,
  getSkillExtractions,
  // Semantic Search (2.4.3)
  indexForSearch,
  semanticSearch,
  // Entity Recognition (2.4.4)
  recognizeEntities,
  getEntityRecognitions
} from '../controllers/batch14ExtendedAINLP.controller';

const router = Router();

// ============================================
// CANDIDATE-ONLY ROUTES (2.3.7-2.3.10)
// ============================================

// 2.3.7 - Career Path Advisor
router.post('/career-path/advice', authenticate, authorize('CANDIDATE'), getCareerPathAdvice);
router.get('/career-path/history', authenticate, authorize('CANDIDATE'), getCareerPathHistory);

// 2.3.8 - Learning Recommendations
router.post('/learning/recommendations', authenticate, authorize('CANDIDATE'), getLearningRecommendations);
router.patch('/learning/:id/progress', authenticate, authorize('CANDIDATE'), updateLearningProgress);
router.get('/learning/history', authenticate, authorize('CANDIDATE'), getLearningHistory);

// 2.3.9 - Application Insights
router.get('/applications/:applicationId/insights', authenticate, authorize('CANDIDATE'), getApplicationInsights);
router.get('/applications/insights', authenticate, authorize('CANDIDATE'), getAllApplicationInsights);

// 2.3.10 - Portfolio Feedback
router.post('/portfolio/feedback', authenticate, authorize('CANDIDATE'), getPortfolioFeedback);
router.get('/portfolio/feedback/history', authenticate, authorize('CANDIDATE'), getPortfolioFeedbackHistory);

// ============================================
// NLP ROUTES (2.4.1-2.4.4) - MULTI-ROLE ACCESS
// ============================================

// 2.4.1 - Resume/Profile Parser
router.post('/parse/document', authenticate, parseDocument);
router.get('/parse/documents', authenticate, getParsedDocuments);

// 2.4.2 - Skill Extraction
router.post('/skills/extract', authenticate, extractSkills);
router.get('/skills/extractions', authenticate, getSkillExtractions);

// 2.4.3 - Semantic Search
router.post('/search/index', authenticate, authorize('RECRUITER', 'ADMIN'), indexForSearch);
router.post('/search/semantic', authenticate, semanticSearch);

// 2.4.4 - Entity Recognition
router.post('/entities/recognize', authenticate, recognizeEntities);
router.get('/entities/recognitions', authenticate, getEntityRecognitions);

export default router;
