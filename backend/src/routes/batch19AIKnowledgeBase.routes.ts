import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Company Knowledge
  createCompanyKnowledge,
  getCompanyKnowledge,
  getCompanyKnowledgeById,
  updateCompanyKnowledge,
  processCompanyKnowledge,
  deleteCompanyKnowledge,
  // Role Knowledge
  createRoleKnowledge,
  getRoleKnowledge,
  getRoleKnowledgeById,
  updateRoleKnowledge,
  deleteRoleKnowledge,
  // Playbooks
  createPlaybook,
  getPlaybooks,
  getPlaybookById,
  updatePlaybook,
  clonePlaybook,
  deletePlaybook,
  // Best Practices
  createBestPractice,
  getBestPractices,
  getBestPracticeById,
  updateBestPractice,
  rateBestPractice,
  verifyBestPractice,
  deleteBestPractice,
  // Competitor Intelligence
  createCompetitorIntel,
  getCompetitorIntel,
  getCompetitorIntelById,
  updateCompetitorIntel,
  deleteCompetitorIntel,
  // FAQs
  createFAQ,
  getFAQs,
  getFAQById,
  searchFAQs,
  updateFAQ,
  rateFAQ,
  verifyFAQ,
  deleteFAQ,
  // AI Feedback
  submitAIFeedback,
  getAIFeedback,
  getAIFeedbackById,
  markFeedbackProcessed,
  addressFeedback,
  getFeedbackAnalytics,
  // Evaluation Criteria
  createEvaluationCriterion,
  getEvaluationCriteria,
  getEvaluationCriterionById,
  updateEvaluationCriterion,
  cloneEvaluationCriterion,
  recordCriterionUsage,
  deleteEvaluationCriterion,
  // Stats
  getKnowledgeBaseStats,
} from '../controllers/batch19AIKnowledgeBase.controller';

const router = Router();

// ============================================
// 4.3.1 - COMPANY KNOWLEDGE IMPORT
// ============================================

router.post('/company-knowledge', authenticate, authorize('recruiter', 'admin'), createCompanyKnowledge);
router.get('/company-knowledge', authenticate, getCompanyKnowledge);
router.get('/company-knowledge/:id', authenticate, getCompanyKnowledgeById);
router.patch('/company-knowledge/:id', authenticate, authorize('recruiter', 'admin'), updateCompanyKnowledge);
router.post('/company-knowledge/:id/process', authenticate, authorize('recruiter', 'admin'), processCompanyKnowledge);
router.delete('/company-knowledge/:id', authenticate, authorize('recruiter', 'admin'), deleteCompanyKnowledge);

// ============================================
// 4.3.2 - ROLE-SPECIFIC KNOWLEDGE
// ============================================

router.post('/role-knowledge', authenticate, authorize('recruiter', 'admin'), createRoleKnowledge);
router.get('/role-knowledge', authenticate, getRoleKnowledge);
router.get('/role-knowledge/:id', authenticate, getRoleKnowledgeById);
router.patch('/role-knowledge/:id', authenticate, authorize('recruiter', 'admin'), updateRoleKnowledge);
router.delete('/role-knowledge/:id', authenticate, authorize('recruiter', 'admin'), deleteRoleKnowledge);

// ============================================
// 4.3.3 - INTERVIEW PLAYBOOKS
// ============================================

router.post('/playbooks', authenticate, authorize('recruiter', 'admin'), createPlaybook);
router.get('/playbooks', authenticate, getPlaybooks);
router.get('/playbooks/:id', authenticate, getPlaybookById);
router.patch('/playbooks/:id', authenticate, authorize('recruiter', 'admin'), updatePlaybook);
router.post('/playbooks/:id/clone', authenticate, authorize('recruiter', 'admin'), clonePlaybook);
router.delete('/playbooks/:id', authenticate, authorize('recruiter', 'admin'), deletePlaybook);

// ============================================
// 4.3.4 - BEST PRACTICES LIBRARY
// ============================================

router.post('/best-practices', authenticate, authorize('recruiter', 'admin'), createBestPractice);
router.get('/best-practices', authenticate, getBestPractices);
router.get('/best-practices/:id', authenticate, getBestPracticeById);
router.patch('/best-practices/:id', authenticate, authorize('recruiter', 'admin'), updateBestPractice);
router.post('/best-practices/:id/rate', authenticate, rateBestPractice);
router.post('/best-practices/:id/verify', authenticate, authorize('admin'), verifyBestPractice);
router.delete('/best-practices/:id', authenticate, authorize('recruiter', 'admin'), deleteBestPractice);

// ============================================
// 4.3.5 - COMPETITOR INTELLIGENCE
// ============================================

router.post('/competitor-intel', authenticate, authorize('recruiter', 'admin'), createCompetitorIntel);
router.get('/competitor-intel', authenticate, authorize('recruiter', 'admin'), getCompetitorIntel);
router.get('/competitor-intel/:id', authenticate, authorize('recruiter', 'admin'), getCompetitorIntelById);
router.patch('/competitor-intel/:id', authenticate, authorize('recruiter', 'admin'), updateCompetitorIntel);
router.delete('/competitor-intel/:id', authenticate, authorize('admin'), deleteCompetitorIntel);

// ============================================
// 4.3.6 - DYNAMIC FAQ ANSWERS
// ============================================

router.post('/faqs', authenticate, authorize('recruiter', 'admin'), createFAQ);
router.get('/faqs', authenticate, getFAQs);
router.get('/faqs/search', authenticate, searchFAQs);
router.get('/faqs/:id', authenticate, getFAQById);
router.patch('/faqs/:id', authenticate, authorize('recruiter', 'admin'), updateFAQ);
router.post('/faqs/:id/rate', authenticate, rateFAQ);
router.post('/faqs/:id/verify', authenticate, authorize('admin'), verifyFAQ);
router.delete('/faqs/:id', authenticate, authorize('recruiter', 'admin'), deleteFAQ);

// ============================================
// 4.3.7 - CONTINUOUS LEARNING (AI FEEDBACK)
// ============================================

router.post('/ai-feedback', authenticate, authorize('recruiter', 'admin'), submitAIFeedback);
router.get('/ai-feedback', authenticate, authorize('recruiter', 'admin'), getAIFeedback);
router.get('/ai-feedback/analytics', authenticate, authorize('admin'), getFeedbackAnalytics);
router.get('/ai-feedback/:id', authenticate, authorize('recruiter', 'admin'), getAIFeedbackById);
router.post('/ai-feedback/:id/process', authenticate, authorize('admin'), markFeedbackProcessed);
router.post('/ai-feedback/:id/address', authenticate, authorize('admin'), addressFeedback);

// ============================================
// 4.3.8 - CUSTOM EVALUATION CRITERIA
// ============================================

router.post('/evaluation-criteria', authenticate, authorize('recruiter', 'admin'), createEvaluationCriterion);
router.get('/evaluation-criteria', authenticate, getEvaluationCriteria);
router.get('/evaluation-criteria/:id', authenticate, getEvaluationCriterionById);
router.patch('/evaluation-criteria/:id', authenticate, authorize('recruiter', 'admin'), updateEvaluationCriterion);
router.post('/evaluation-criteria/:id/clone', authenticate, authorize('recruiter', 'admin'), cloneEvaluationCriterion);
router.post('/evaluation-criteria/:id/record-usage', authenticate, recordCriterionUsage);
router.delete('/evaluation-criteria/:id', authenticate, authorize('recruiter', 'admin'), deleteEvaluationCriterion);

// ============================================
// KNOWLEDGE BASE STATS
// ============================================

router.get('/stats', authenticate, getKnowledgeBaseStats);

export default router;
