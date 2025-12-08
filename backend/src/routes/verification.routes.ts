import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  // Email verification
  requestEmailVerification,
  verifyEmailCode,
  getEmailVerifications,
  deleteEmailVerification,
  // LinkedIn verification
  requestLinkedInVerification,
  getLinkedInVerifications,
  // Peer endorsements
  requestPeerEndorsement,
  submitPeerEndorsement,
  getPeerEndorsements,
  deletePeerEndorsement,
  // Manager references
  requestManagerReference,
  submitManagerReference,
  getManagerReferences,
  sendReferenceReminder,
  deleteManagerReference,
  // Certification verification
  requestCertificationVerification,
  getCertificationVerifications,
  // Trust score
  getTrustScore,
  refreshTrustScore,
  getVerificationStatus,
} from '../controllers/verification.controller';

const router = Router();

// ============================================
// EMAIL DOMAIN VERIFICATION ROUTES (1.3.1)
// ============================================

router.post('/email/request', authenticate, requestEmailVerification);
router.post('/email/verify', authenticate, verifyEmailCode);
router.get('/email', authenticate, getEmailVerifications);
router.delete('/email/:id', authenticate, deleteEmailVerification);

// ============================================
// LINKEDIN EMPLOYMENT VERIFICATION ROUTES (1.3.2)
// ============================================

router.post('/linkedin/request', authenticate, requestLinkedInVerification);
router.get('/linkedin', authenticate, getLinkedInVerifications);

// ============================================
// PEER ENDORSEMENT ROUTES (1.3.3)
// ============================================

router.post('/endorsements/request', authenticate, requestPeerEndorsement);
router.post('/endorsements/submit/:token', submitPeerEndorsement); // Public route for endorsers
router.get('/endorsements', authenticate, getPeerEndorsements);
router.delete('/endorsements/:id', authenticate, deletePeerEndorsement);

// ============================================
// MANAGER REFERENCE ROUTES (1.3.4)
// ============================================

router.post('/references/request', authenticate, requestManagerReference);
router.post('/references/submit/:token', submitManagerReference); // Public route for references
router.get('/references', authenticate, getManagerReferences);
router.post('/references/:id/remind', authenticate, sendReferenceReminder);
router.delete('/references/:id', authenticate, deleteManagerReference);

// ============================================
// CERTIFICATION VERIFICATION ROUTES (1.3.5)
// ============================================

router.post('/certifications/request', authenticate, requestCertificationVerification);
router.get('/certifications', authenticate, getCertificationVerifications);

// ============================================
// TRUST SCORE ROUTES
// ============================================

router.get('/trust-score', authenticate, getTrustScore);
router.post('/trust-score/refresh', authenticate, refreshTrustScore);

// ============================================
// OVERALL STATUS ROUTE
// ============================================

router.get('/status', authenticate, getVerificationStatus);

export default router;
