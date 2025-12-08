import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createProfileVersion,
  getProfileVersions,
  getProfileVersion,
  compareVersions,
  restoreVersion,
  deleteVersion,
  getVersionTimeline,
} from '../controllers/profileVersioning.controller';

const router = Router();

// ============================================
// PROFILE VERSION ROUTES
// ============================================

// Get all versions
router.get('/', authenticate, getProfileVersions);

// Get version timeline (for visualization)
router.get('/timeline', authenticate, getVersionTimeline);

// Create a new version (manual save point)
router.post('/', authenticate, createProfileVersion);

// Get a specific version
router.get('/:versionId', authenticate, getProfileVersion);

// Compare two versions
router.get('/compare/:versionId1/:versionId2', authenticate, compareVersions);

// Restore a version
router.post('/:versionId/restore', authenticate, restoreVersion);

// Delete a version
router.delete('/:versionId', authenticate, deleteVersion);

export default router;
