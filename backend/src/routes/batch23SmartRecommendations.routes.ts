import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Job Recommendations (5.3.1)
  generateJobRecommendations,
  getJobRecommendations,
  recordJobRecommendationInteraction,

  // Candidate Recommendations (5.3.2)
  generateCandidateRecommendations,
  getCandidateRecommendations,
  recordCandidateRecommendationAction,

  // Similar Candidates (5.3.3)
  findSimilarCandidates,
  getSimilarCandidates,
  recordSimilarCandidateAction,

  // Passive Candidates (5.3.4)
  identifyPassiveCandidates,
  getPassiveCandidates,
  recordPassiveCandidateOutreach,

  // Skill-Up Recommendations (5.3.5)
  generateSkillUpRecommendations,
  getSkillUpRecommendations,
  updateSkillProgress,

  // Re-Engagement (5.3.6)
  generateReEngagementSuggestions,
  getReEngagementSuggestions,
  updateReEngagementStatus,

  // Interview Panel (5.3.7)
  generateInterviewPanelRecommendations,
  getInterviewPanelRecommendations,
  selectInterviewer,

  // Sourcing Channels (5.3.8)
  generateSourcingRecommendations,
  getSourcingRecommendations,

  // Feedback & Config
  submitRecommendationFeedback,
  getOrCreateRecommendationConfig,
  updateRecommendationConfig,
  getSmartRecommendationsStats,
} from '../controllers/batch23SmartRecommendations.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// 5.3.1 JOB RECOMMENDATIONS FOR CANDIDATES
// ============================================================================

// POST /api/recommendations/jobs - Generate job recommendations
router.post('/jobs', authorize(['CANDIDATE', 'RECRUITER', 'ADMIN']), generateJobRecommendations);

// GET /api/recommendations/jobs/:candidateId - Get job recommendations for candidate
router.get('/jobs/:candidateId', authorize(['CANDIDATE', 'RECRUITER', 'ADMIN']), getJobRecommendations);

// PUT /api/recommendations/jobs/:id/interaction - Record interaction
router.put('/jobs/:id/interaction', authorize(['CANDIDATE', 'RECRUITER', 'ADMIN']), recordJobRecommendationInteraction);

// ============================================================================
// 5.3.2 CANDIDATE RECOMMENDATIONS FOR RECRUITERS
// ============================================================================

// POST /api/recommendations/candidates - Generate candidate recommendations
router.post('/candidates', authorize(['RECRUITER', 'ADMIN']), generateCandidateRecommendations);

// GET /api/recommendations/candidates/:jobId - Get candidate recommendations for job
router.get('/candidates/:jobId', authorize(['RECRUITER', 'ADMIN']), getCandidateRecommendations);

// PUT /api/recommendations/candidates/:id/action - Record action
router.put('/candidates/:id/action', authorize(['RECRUITER', 'ADMIN']), recordCandidateRecommendationAction);

// ============================================================================
// 5.3.3 SIMILAR CANDIDATES FINDER
// ============================================================================

// POST /api/recommendations/similar - Find similar candidates
router.post('/similar', authorize(['RECRUITER', 'ADMIN']), findSimilarCandidates);

// GET /api/recommendations/similar/:sourceCandidateId - Get similar candidates
router.get('/similar/:sourceCandidateId', authorize(['RECRUITER', 'ADMIN']), getSimilarCandidates);

// PUT /api/recommendations/similar/:id/action - Record action
router.put('/similar/:id/action', authorize(['RECRUITER', 'ADMIN']), recordSimilarCandidateAction);

// ============================================================================
// 5.3.4 PASSIVE CANDIDATE IDENTIFICATION
// ============================================================================

// POST /api/recommendations/passive - Identify passive candidates
router.post('/passive', authorize(['RECRUITER', 'ADMIN']), identifyPassiveCandidates);

// GET /api/recommendations/passive - Get passive candidates
router.get('/passive', authorize(['RECRUITER', 'ADMIN']), getPassiveCandidates);

// PUT /api/recommendations/passive/:id/outreach - Record outreach
router.put('/passive/:id/outreach', authorize(['RECRUITER', 'ADMIN']), recordPassiveCandidateOutreach);

// ============================================================================
// 5.3.5 SKILL-UP RECOMMENDATIONS
// ============================================================================

// POST /api/recommendations/skill-up - Generate skill-up recommendations
router.post('/skill-up', authorize(['CANDIDATE', 'RECRUITER', 'ADMIN']), generateSkillUpRecommendations);

// GET /api/recommendations/skill-up/:candidateId - Get skill-up recommendations
router.get('/skill-up/:candidateId', authorize(['CANDIDATE', 'RECRUITER', 'ADMIN']), getSkillUpRecommendations);

// PUT /api/recommendations/skill-up/:id/progress - Update progress
router.put('/skill-up/:id/progress', authorize(['CANDIDATE', 'RECRUITER', 'ADMIN']), updateSkillProgress);

// ============================================================================
// 5.3.6 RE-ENGAGEMENT SUGGESTIONS
// ============================================================================

// POST /api/recommendations/re-engage - Generate re-engagement suggestions
router.post('/re-engage', authorize(['RECRUITER', 'ADMIN']), generateReEngagementSuggestions);

// GET /api/recommendations/re-engage/:jobId - Get re-engagement suggestions for job
router.get('/re-engage/:jobId', authorize(['RECRUITER', 'ADMIN']), getReEngagementSuggestions);

// PUT /api/recommendations/re-engage/:id/status - Update status
router.put('/re-engage/:id/status', authorize(['RECRUITER', 'ADMIN']), updateReEngagementStatus);

// ============================================================================
// 5.3.7 INTERVIEW PANEL RECOMMENDATIONS
// ============================================================================

// POST /api/recommendations/panel - Generate panel recommendations
router.post('/panel', authorize(['RECRUITER', 'ADMIN']), generateInterviewPanelRecommendations);

// GET /api/recommendations/panel/:jobId/:candidateId - Get panel recommendations
router.get('/panel/:jobId/:candidateId', authorize(['RECRUITER', 'ADMIN']), getInterviewPanelRecommendations);

// PUT /api/recommendations/panel/:id/select - Select interviewer
router.put('/panel/:id/select', authorize(['RECRUITER', 'ADMIN']), selectInterviewer);

// ============================================================================
// 5.3.8 SOURCING CHANNEL RECOMMENDATIONS
// ============================================================================

// POST /api/recommendations/sourcing - Generate sourcing recommendations
router.post('/sourcing', authorize(['RECRUITER', 'ADMIN']), generateSourcingRecommendations);

// GET /api/recommendations/sourcing - Get sourcing recommendations
router.get('/sourcing', authorize(['RECRUITER', 'ADMIN']), getSourcingRecommendations);

// ============================================================================
// FEEDBACK & CONFIGURATION
// ============================================================================

// POST /api/recommendations/feedback - Submit feedback
router.post('/feedback', submitRecommendationFeedback);

// GET /api/recommendations/config/:recommendationType - Get/create config
router.get('/config/:recommendationType', authorize(['ADMIN']), getOrCreateRecommendationConfig);

// PUT /api/recommendations/config/:id - Update config
router.put('/config/:id', authorize(['ADMIN']), updateRecommendationConfig);

// GET /api/recommendations/stats - Get overall stats
router.get('/stats', authorize(['RECRUITER', 'ADMIN']), getSmartRecommendationsStats);

export default router;
