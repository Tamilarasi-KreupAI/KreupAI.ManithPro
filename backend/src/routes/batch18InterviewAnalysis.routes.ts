import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Transcription
  createTranscription,
  getTranscriptions,
  getTranscriptionById,
  retryTranscription,
  // Answer Analysis
  analyzeAnswer,
  getAnswerAnalyses,
  // Topic Detection
  detectTopics,
  getTopicDetections,
  // Sentiment Analysis
  analyzeSentiment,
  getSentimentAnalyses,
  // Communication Score
  calculateCommunicationScore,
  getCommunicationScore,
  // Technical Verification
  verifyTechnicalClaim,
  getTechnicalVerifications,
  // Red Flag Detection
  detectRedFlags,
  getRedFlagAlerts,
  reviewRedFlag,
  // Summary Generation
  generateSummary,
  getInterviewSummaries,
  approveSummary,
  updateRecommendation,
  // Highlight Extraction
  extractHighlights,
  getHighlights,
  bookmarkHighlight,
  shareHighlight,
  // Comparative Analysis
  createComparison,
  getComparisons,
  getComparisonById,
  shareComparison,
  // Analytics
  getFullAnalysis,
  runFullAnalysis,
} from '../controllers/batch18InterviewAnalysis.controller';

const router = Router();

// ============================================
// 4.2.1 - TRANSCRIPTION
// ============================================

router.post('/transcriptions', authenticate, authorize('recruiter', 'admin'), createTranscription);
router.get('/interviews/:interviewId/transcriptions', authenticate, getTranscriptions);
router.get('/transcriptions/:id', authenticate, getTranscriptionById);
router.post('/transcriptions/:id/retry', authenticate, authorize('recruiter', 'admin'), retryTranscription);

// ============================================
// 4.2.2 - ANSWER ANALYSIS
// ============================================

router.post('/answer-analysis', authenticate, authorize('recruiter', 'admin'), analyzeAnswer);
router.get('/interviews/:interviewId/answer-analyses', authenticate, getAnswerAnalyses);

// ============================================
// 4.2.3 - TOPIC DETECTION
// ============================================

router.post('/topic-detection', authenticate, authorize('recruiter', 'admin'), detectTopics);
router.get('/interviews/:interviewId/topics', authenticate, getTopicDetections);

// ============================================
// 4.2.4 - SENTIMENT ANALYSIS
// ============================================

router.post('/sentiment-analysis', authenticate, authorize('recruiter', 'admin'), analyzeSentiment);
router.get('/interviews/:interviewId/sentiment', authenticate, getSentimentAnalyses);

// ============================================
// 4.2.5 - COMMUNICATION SCORE
// ============================================

router.post('/communication-score', authenticate, authorize('recruiter', 'admin'), calculateCommunicationScore);
router.get('/interviews/:interviewId/communication-score', authenticate, getCommunicationScore);

// ============================================
// 4.2.6 - TECHNICAL VERIFICATION
// ============================================

router.post('/technical-verification', authenticate, authorize('recruiter', 'admin'), verifyTechnicalClaim);
router.get('/interviews/:interviewId/technical-verifications', authenticate, getTechnicalVerifications);

// ============================================
// 4.2.7 - RED FLAG DETECTION
// ============================================

router.post('/interviews/:interviewId/detect-red-flags', authenticate, authorize('recruiter', 'admin'), detectRedFlags);
router.get('/interviews/:interviewId/red-flags', authenticate, getRedFlagAlerts);
router.patch('/red-flags/:id/review', authenticate, authorize('recruiter', 'admin'), reviewRedFlag);

// ============================================
// 4.2.8 - SUMMARY GENERATION
// ============================================

router.post('/interviews/:interviewId/generate-summary', authenticate, authorize('recruiter', 'admin'), generateSummary);
router.get('/interviews/:interviewId/summaries', authenticate, getInterviewSummaries);
router.patch('/summaries/:id/approve', authenticate, authorize('recruiter', 'admin'), approveSummary);
router.patch('/summaries/:id/recommendation', authenticate, authorize('recruiter', 'admin'), updateRecommendation);

// ============================================
// 4.2.9 - HIGHLIGHT EXTRACTION
// ============================================

router.post('/interviews/:interviewId/extract-highlights', authenticate, authorize('recruiter', 'admin'), extractHighlights);
router.get('/interviews/:interviewId/highlights', authenticate, getHighlights);
router.patch('/highlights/:id/bookmark', authenticate, bookmarkHighlight);
router.patch('/highlights/:id/share', authenticate, shareHighlight);

// ============================================
// 4.2.10 - COMPARATIVE ANALYSIS
// ============================================

router.post('/comparisons', authenticate, authorize('recruiter', 'admin'), createComparison);
router.get('/comparisons', authenticate, getComparisons);
router.get('/comparisons/:id', authenticate, getComparisonById);
router.patch('/comparisons/:id/share', authenticate, authorize('recruiter', 'admin'), shareComparison);

// ============================================
// FULL ANALYSIS
// ============================================

router.get('/interviews/:interviewId/full-analysis', authenticate, getFullAnalysis);
router.post('/interviews/:interviewId/run-analysis', authenticate, authorize('recruiter', 'admin'), runFullAnalysis);

export default router;
