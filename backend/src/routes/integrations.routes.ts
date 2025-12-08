import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  // GitHub
  getGithubAuthUrl,
  githubCallback,
  getGithubProfile,
  syncGithubProfile,
  getGithubRepositories,
  toggleRepositoryShowcase,
  disconnectGithub,
  // LinkedIn
  getLinkedInAuthUrl,
  linkedInCallback,
  getLinkedInProfile,
  syncLinkedInProfile,
  importLinkedInData,
  disconnectLinkedIn,
  // Status
  getIntegrationStatus,
} from '../controllers/integrations.controller';

const router = Router();

// ============================================
// INTEGRATION STATUS
// ============================================

// Get all integration statuses
router.get('/status', authenticate, getIntegrationStatus);

// ============================================
// GITHUB INTEGRATION ROUTES
// ============================================

// Get GitHub OAuth URL
router.get('/github/auth-url', authenticate, getGithubAuthUrl);

// GitHub OAuth callback
router.post('/github/callback', authenticate, githubCallback);

// Get connected GitHub profile
router.get('/github/profile', authenticate, getGithubProfile);

// Sync GitHub data
router.post('/github/sync', authenticate, syncGithubProfile);

// Get GitHub repositories
router.get('/github/repositories', authenticate, getGithubRepositories);

// Toggle repository showcase status
router.post('/github/repositories/:repoId/showcase', authenticate, toggleRepositoryShowcase);

// Disconnect GitHub
router.delete('/github/disconnect', authenticate, disconnectGithub);

// ============================================
// LINKEDIN INTEGRATION ROUTES
// ============================================

// Get LinkedIn OAuth URL
router.get('/linkedin/auth-url', authenticate, getLinkedInAuthUrl);

// LinkedIn OAuth callback
router.post('/linkedin/callback', authenticate, linkedInCallback);

// Get connected LinkedIn profile
router.get('/linkedin/profile', authenticate, getLinkedInProfile);

// Sync LinkedIn data
router.post('/linkedin/sync', authenticate, syncLinkedInProfile);

// Import LinkedIn data to profile
router.post('/linkedin/import', authenticate, importLinkedInData);

// Disconnect LinkedIn
router.delete('/linkedin/disconnect', authenticate, disconnectLinkedIn);

export default router;
