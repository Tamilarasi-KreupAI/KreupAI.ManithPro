// Batch 35: Job Boards & Sourcing Integrations Routes (10.3.1-10.3.8)
import { Router } from 'express';
import * as jobBoardController from '../controllers/batch35JobBoardIntegrations.controller';

const router = Router();

// ==========================================
// Job Board Integration Routes
// ==========================================

// Get all job board integrations
router.get('/integrations', jobBoardController.getJobBoardIntegrations);

// Get specific integration
router.get('/integrations/:integrationId', jobBoardController.getJobBoardIntegration);

// Create job board integration
router.post('/integrations', jobBoardController.createJobBoardIntegration);

// Update job board integration
router.put('/integrations/:integrationId', jobBoardController.updateJobBoardIntegration);

// Delete job board integration
router.delete('/integrations/:integrationId', jobBoardController.deleteJobBoardIntegration);

// Test job board connection
router.post('/integrations/:integrationId/test', jobBoardController.testJobBoardConnection);

// ==========================================
// Job Posting Routes
// ==========================================

// Get job postings for integration
router.get('/integrations/:integrationId/postings', jobBoardController.getJobPostings);

// Post job to board
router.post('/integrations/:integrationId/postings', jobBoardController.postJobToBoard);

// Update job posting
router.put('/postings/:postingId', jobBoardController.updateJobPosting);

// Close job posting
router.post('/postings/:postingId/close', jobBoardController.closeJobPosting);

// Refresh job posting
router.post('/postings/:postingId/refresh', jobBoardController.refreshJobPosting);

// ==========================================
// Application Import Routes
// ==========================================

// Get imported applications
router.get('/integrations/:integrationId/applications', jobBoardController.getImportedApplications);

// Sync applications
router.post('/integrations/:integrationId/applications/sync', jobBoardController.syncApplications);

// ==========================================
// Analytics Routes
// ==========================================

// Get posting performance
router.get('/integrations/:integrationId/performance', jobBoardController.getPostingPerformance);

// Get source comparison
router.get('/analytics/source-comparison', jobBoardController.getSourceComparison);

// ==========================================
// Job Board & Dashboard Routes
// ==========================================

// Get available job boards
router.get('/boards', jobBoardController.getAvailableJobBoards);

// Get job boards dashboard
router.get('/dashboard', jobBoardController.getJobBoardsDashboard);

export default router;
