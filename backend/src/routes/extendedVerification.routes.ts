import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  // Education verification
  requestEducationVerification,
  uploadEducationDocuments,
  getEducationVerifications,
  // Background checks
  requestBackgroundCheck,
  getBackgroundCheckStatus,
  getBackgroundChecks,
  // Badges
  getVerifiedBadges,
  toggleBadgeVisibility,
  reorderBadges,
  getAvailableBadges,
  // Status
  getExtendedVerificationStatus,
} from '../controllers/extendedVerification.controller';

const router = Router();

// ============================================
// EDUCATION VERIFICATION ROUTES (1.3.6)
// ============================================

router.post('/education/request', authenticate, requestEducationVerification);
router.post('/education/documents', authenticate, uploadEducationDocuments);
router.get('/education', authenticate, getEducationVerifications);

// ============================================
// BACKGROUND CHECK ROUTES (1.3.7)
// ============================================

router.post('/background-check/request', authenticate, requestBackgroundCheck);
router.get('/background-check/:id', authenticate, getBackgroundCheckStatus);
router.get('/background-checks', authenticate, getBackgroundChecks);

// ============================================
// VERIFIED BADGE ROUTES (1.3.9)
// ============================================

router.get('/badges', authenticate, getVerifiedBadges);
router.get('/badges/available', authenticate, getAvailableBadges);
router.post('/badges/visibility', authenticate, toggleBadgeVisibility);
router.post('/badges/reorder', authenticate, reorderBadges);

// ============================================
// STATUS ROUTE
// ============================================

router.get('/status', authenticate, getExtendedVerificationStatus);

export default router;
