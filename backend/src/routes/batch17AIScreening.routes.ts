import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // AI Screening Interviews
  createScreeningInterview,
  getScreeningInterviews,
  getCandidateInterviews,
  getInterviewByToken,
  startInterview,
  completeInterview,
  cancelInterview,
  extendDeadline,
  // Question Flows
  createQuestionFlow,
  getQuestionFlows,
  getQuestionFlowWithQuestions,
  updateQuestionFlow,
  deleteQuestionFlow,
  // Screening Questions
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  // Screening Responses
  submitResponse,
  getInterviewResponses,
  reviewResponse,
  // Follow-Up Rules
  addFollowUpRule,
  updateFollowUpRule,
  deleteFollowUpRule,
  evaluateFollowUps,
  // Templates
  getScreeningTemplates,
  createScreeningTemplate,
  // Accessibility
  getAccessibilityPrefs,
  updateAccessibilityPrefs,
  // Chat-Based Screening
  getChatMessage,
  submitChatResponse,
  // Statistics
  getScreeningStats,
} from '../controllers/batch17AIScreening.controller';

const router = Router();

// ============================================
// AI SCREENING INTERVIEWS (4.1.1-4.1.3)
// ============================================

// Recruiter routes
router.post('/interviews', authenticate, authorize('recruiter', 'admin'), createScreeningInterview);
router.get('/interviews', authenticate, authorize('recruiter', 'admin'), getScreeningInterviews);
router.patch('/interviews/:id/cancel', authenticate, authorize('recruiter', 'admin'), cancelInterview);
router.patch('/interviews/:id/extend', authenticate, authorize('recruiter', 'admin'), extendDeadline);
router.get('/interviews/:interviewId/responses', authenticate, authorize('recruiter', 'admin'), getInterviewResponses);
router.patch('/responses/:id/review', authenticate, authorize('recruiter', 'admin'), reviewResponse);

// Candidate routes
router.get('/candidate/interviews', authenticate, authorize('candidate'), getCandidateInterviews);
router.get('/candidate/accessibility', authenticate, authorize('candidate'), getAccessibilityPrefs);
router.patch('/candidate/accessibility', authenticate, authorize('candidate'), updateAccessibilityPrefs);

// Public routes (token-based access for candidates)
router.get('/public/:token', getInterviewByToken);
router.post('/public/:token/start', startInterview);
router.patch('/public/:id/complete', completeInterview);

// ============================================
// QUESTION FLOWS (4.1.4)
// ============================================

router.post('/flows', authenticate, authorize('recruiter', 'admin'), createQuestionFlow);
router.get('/flows', authenticate, authorize('recruiter', 'admin'), getQuestionFlows);
router.get('/flows/:id', authenticate, authorize('recruiter', 'admin'), getQuestionFlowWithQuestions);
router.patch('/flows/:id', authenticate, authorize('recruiter', 'admin'), updateQuestionFlow);
router.delete('/flows/:id', authenticate, authorize('recruiter', 'admin'), deleteQuestionFlow);

// Questions within flows
router.post('/flows/:flowId/questions', authenticate, authorize('recruiter', 'admin'), addQuestion);
router.post('/flows/:flowId/questions/reorder', authenticate, authorize('recruiter', 'admin'), reorderQuestions);
router.patch('/questions/:id', authenticate, authorize('recruiter', 'admin'), updateQuestion);
router.delete('/questions/:id', authenticate, authorize('recruiter', 'admin'), deleteQuestion);

// ============================================
// FOLLOW-UP RULES (4.1.5)
// ============================================

router.post('/flows/:flowId/follow-ups', authenticate, authorize('recruiter', 'admin'), addFollowUpRule);
router.patch('/follow-ups/:id', authenticate, authorize('recruiter', 'admin'), updateFollowUpRule);
router.delete('/follow-ups/:id', authenticate, authorize('recruiter', 'admin'), deleteFollowUpRule);
router.get('/responses/:responseId/evaluate-follow-ups', authenticate, evaluateFollowUps);

// ============================================
// SCREENING RESPONSES
// ============================================

router.post('/interviews/:interviewId/questions/:questionId/respond', authenticate, submitResponse);

// ============================================
// CHAT-BASED SCREENING (4.1.3)
// ============================================

router.get('/chat/:interviewId/message', authenticate, getChatMessage);
router.post('/chat/:interviewId/respond', authenticate, submitChatResponse);

// ============================================
// TEMPLATES
// ============================================

router.get('/templates', authenticate, getScreeningTemplates);
router.post('/templates', authenticate, authorize('recruiter', 'admin'), createScreeningTemplate);

// ============================================
// STATISTICS
// ============================================

router.get('/stats', authenticate, authorize('recruiter', 'admin'), getScreeningStats);

export default router;
