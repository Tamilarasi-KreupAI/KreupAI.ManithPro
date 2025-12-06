import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Scorecard Templates (6.2.1)
  createScorecardTemplate,
  getScorecardTemplates,
  getScorecardTemplateById,
  updateScorecardTemplate,
  cloneScorecardTemplate,

  // Interview Feedback (6.2.2)
  submitInterviewFeedback,
  getInterviewFeedbacks,
  getInterviewFeedbackById,
  updateInterviewFeedback,
  saveFeedbackDraft,

  // Blind Evaluation (6.2.3)
  configureBlindEvaluation,
  getBlindEvaluationConfig,
  updateBlindEvaluationConfig,
  getAnonymizedCandidate,

  // Feedback Aggregation (6.2.4)
  createFeedbackAggregation,
  getFeedbackAggregations,
  calculateAggregation,

  // Calibration Sessions (6.2.5)
  createCalibrationSession,
  getCalibrationSessions,
  updateCalibrationSession,
  startCalibrationSession,
  completeCalibrationSession,

  // Decision Voting (6.2.6)
  createVotingRound,
  submitVote,
  getVotes,
  getVotingRoundSummary,
  closeVotingRound,

  // Evaluation Deadlines (6.2.7)
  createEvaluationDeadline,
  getEvaluationDeadlines,
  updateEvaluationDeadline,
  getDeadlineInstances,
  updateDeadlineInstanceStatus,

  // Disagreement Resolution (6.2.8)
  flagDisagreement,
  getDisagreements,
  resolveDisagreement,
  escalateDisagreement,

  // Historical Comparison (6.2.9)
  createCandidateComparison,
  getCandidateComparisons,
  createHiringBenchmark,
  getHiringBenchmarks,
  compareToHistoricalBenchmarks,

  // Stats
  getCollaborativeEvaluationStats,
} from '../controllers/batch25CollaborativeEvaluation.controller';

const router = Router();

// ============================================================================
// 6.2.1 SCORECARD TEMPLATE ROUTES
// ============================================================================

// Create scorecard template
router.post(
  '/scorecards',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createScorecardTemplate
);

// Get scorecard templates
router.get(
  '/scorecards',
  authenticate,
  getScorecardTemplates
);

// Get scorecard template by ID
router.get(
  '/scorecards/:id',
  authenticate,
  getScorecardTemplateById
);

// Update scorecard template
router.put(
  '/scorecards/:id',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateScorecardTemplate
);

// Clone scorecard template
router.post(
  '/scorecards/:id/clone',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  cloneScorecardTemplate
);

// ============================================================================
// 6.2.2 INTERVIEW FEEDBACK ROUTES
// ============================================================================

// Submit interview feedback
router.post(
  '/feedback',
  authenticate,
  submitInterviewFeedback
);

// Get interview feedbacks
router.get(
  '/feedback',
  authenticate,
  getInterviewFeedbacks
);

// Get feedback by ID
router.get(
  '/feedback/:id',
  authenticate,
  getInterviewFeedbackById
);

// Update interview feedback
router.put(
  '/feedback/:id',
  authenticate,
  updateInterviewFeedback
);

// Save feedback draft
router.post(
  '/feedback/:id/draft',
  authenticate,
  saveFeedbackDraft
);

// ============================================================================
// 6.2.3 BLIND EVALUATION ROUTES
// ============================================================================

// Configure blind evaluation
router.post(
  '/blind-evaluation',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  configureBlindEvaluation
);

// Get blind evaluation config
router.get(
  '/blind-evaluation/:jobId',
  authenticate,
  getBlindEvaluationConfig
);

// Update blind evaluation config
router.put(
  '/blind-evaluation/:id',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateBlindEvaluationConfig
);

// Get anonymized candidate data
router.get(
  '/blind-evaluation/:jobId/candidate/:applicationId',
  authenticate,
  getAnonymizedCandidate
);

// ============================================================================
// 6.2.4 FEEDBACK AGGREGATION ROUTES
// ============================================================================

// Create feedback aggregation
router.post(
  '/aggregation',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createFeedbackAggregation
);

// Get feedback aggregations
router.get(
  '/aggregation',
  authenticate,
  getFeedbackAggregations
);

// Calculate aggregation automatically
router.post(
  '/aggregation/calculate',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  calculateAggregation
);

// ============================================================================
// 6.2.5 CALIBRATION SESSION ROUTES
// ============================================================================

// Create calibration session
router.post(
  '/calibration',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createCalibrationSession
);

// Get calibration sessions
router.get(
  '/calibration',
  authenticate,
  getCalibrationSessions
);

// Update calibration session
router.put(
  '/calibration/:id',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateCalibrationSession
);

// Start calibration session
router.post(
  '/calibration/:id/start',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  startCalibrationSession
);

// Complete calibration session
router.post(
  '/calibration/:id/complete',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  completeCalibrationSession
);

// ============================================================================
// 6.2.6 DECISION VOTING ROUTES
// ============================================================================

// Create voting round
router.post(
  '/voting',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createVotingRound
);

// Submit vote
router.post(
  '/voting/vote',
  authenticate,
  submitVote
);

// Get votes
router.get(
  '/voting/votes',
  authenticate,
  getVotes
);

// Get voting round summary
router.get(
  '/voting/:id',
  authenticate,
  getVotingRoundSummary
);

// Close voting round
router.post(
  '/voting/:id/close',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  closeVotingRound
);

// ============================================================================
// 6.2.7 EVALUATION DEADLINE ROUTES
// ============================================================================

// Create evaluation deadline
router.post(
  '/deadlines',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createEvaluationDeadline
);

// Get evaluation deadlines
router.get(
  '/deadlines',
  authenticate,
  getEvaluationDeadlines
);

// Update evaluation deadline
router.put(
  '/deadlines/:id',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateEvaluationDeadline
);

// Get deadline instances
router.get(
  '/deadline-instances',
  authenticate,
  getDeadlineInstances
);

// Update deadline instance status
router.patch(
  '/deadline-instances/:id/status',
  authenticate,
  updateDeadlineInstanceStatus
);

// ============================================================================
// 6.2.8 DISAGREEMENT RESOLUTION ROUTES
// ============================================================================

// Flag disagreement
router.post(
  '/disagreements',
  authenticate,
  flagDisagreement
);

// Get disagreements
router.get(
  '/disagreements',
  authenticate,
  getDisagreements
);

// Resolve disagreement
router.post(
  '/disagreements/:id/resolve',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  resolveDisagreement
);

// Escalate disagreement
router.post(
  '/disagreements/:id/escalate',
  authenticate,
  escalateDisagreement
);

// ============================================================================
// 6.2.9 HISTORICAL COMPARISON ROUTES
// ============================================================================

// Create candidate comparison
router.post(
  '/comparisons',
  authenticate,
  createCandidateComparison
);

// Get candidate comparisons
router.get(
  '/comparisons',
  authenticate,
  getCandidateComparisons
);

// Create hiring benchmark
router.post(
  '/benchmarks',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createHiringBenchmark
);

// Get hiring benchmarks
router.get(
  '/benchmarks',
  authenticate,
  getHiringBenchmarks
);

// Compare to historical benchmarks
router.get(
  '/benchmarks/:jobId/compare/:applicationId',
  authenticate,
  compareToHistoricalBenchmarks
);

// ============================================================================
// STATS ROUTES
// ============================================================================

// Get collaborative evaluation stats
router.get(
  '/stats',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  getCollaborativeEvaluationStats
);

export default router;
