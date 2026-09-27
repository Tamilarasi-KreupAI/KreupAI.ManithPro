import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getClientDashboardStats,
  getVendorDashboardStats,
  getRecentRequirements,
  getRecentPlacements,
  getPendingContracts,
  createRequirement,
  getAllRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  getAllContracts,
  downloadContract,
  viewContract,
  getCandidateProfile,
  getOpenRequirements,
} from '../controllers/b2b.controller';
import { createDraftContract, updateContractStatus } from '../controllers/b2b.controller';
import {
  getVendorCandidates,
  addCandidate,
  downloadCandidateResume,
} from '../controllers/b2b.controller';

const router = express.Router();

// 🔐 all B2B routes require auth
router.use(authenticate);

/* ================= DASHBOARD STATS ================= */

router.get('/stats/client', authorize('CLIENT'), getClientDashboardStats);
router.get('/stats/vendor', authorize('VENDOR'), getVendorDashboardStats);

/* ================= RECENT ACTIVITY ================= */

router.get('/requirements/recent', authorize('CLIENT'), getRecentRequirements);
router.get('/placements/recent', authorize('VENDOR'), getRecentPlacements);

/* ================= CONTRACTS ================= */

router.get('/contracts/pending', authorize('CLIENT', 'VENDOR'), getPendingContracts);
router.post('/requirements', authorize('CLIENT'), createRequirement);
router.get('/requirements', authorize('CLIENT'), getAllRequirements);
// IMPORTANT: /requirements/open must come BEFORE /requirements/:id
router.get('/requirements/open', authorize('VENDOR'), getOpenRequirements);
router.get('/requirements/:id', authorize('CLIENT'), getRequirementById);
router.put('/requirements/:id', authorize('CLIENT'), updateRequirement);
router.delete('/requirements/:id', authorize('CLIENT'), deleteRequirement);
router.get('/contracts', authorize('CLIENT', 'VENDOR'), getAllContracts);
router.get('/contracts/:id/download', authorize('CLIENT', 'VENDOR'), downloadContract);
router.get('/contracts/:id/view', authorize('CLIENT', 'VENDOR'), viewContract);
router.patch('/contracts/:id/status', authorize('CLIENT', 'VENDOR'), updateContractStatus);

router.get('/candidates', authorize('VENDOR'), getVendorCandidates);
router.post('/candidates', authorize('VENDOR'), addCandidate);
router.get('/candidates/:id/resume', authorize('VENDOR'), downloadCandidateResume);
router.post('/contracts', authorize('CLIENT'), createDraftContract);

router.get('/candidates/:id', authorize('VENDOR'), getCandidateProfile);

import {
  getInvoices,
  createInvoice,
  payInvoice,
  downloadInvoice,
  getVendors,
  submitCandidateToRequirement,
  getVendorSubmissions,
  getClientSubmissions,
  updateSubmissionStatus,
  getB2BSettings,
  updateB2BSettings,
} from '../controllers/b2b.controller';

router.get('/invoices', authorize('CLIENT', 'VENDOR'), getInvoices);
router.post('/invoices', authorize('CLIENT'), createInvoice);
router.post('/invoices/:id/pay', authorize('VENDOR'), payInvoice);
router.get('/invoices/:id/download', authorize('CLIENT', 'VENDOR'), downloadInvoice);

/* ================= VENDORS ================= */
router.get('/vendors', authorize('CLIENT'), getVendors);

/* ================= PLACEMENTS / SUBMISSIONS ================= */
router.post('/submissions', authorize('VENDOR'), submitCandidateToRequirement);    // Vendor submits candidate
router.get('/submissions/vendor', authorize('VENDOR'), getVendorSubmissions);      // Vendor sees their submissions
router.get('/submissions/client', authorize('CLIENT'), getClientSubmissions);      // Client sees submissions to their requirements
router.patch('/submissions/:id/status', authorize('CLIENT'), updateSubmissionStatus); // Client approves/rejects

/* ================= SETTINGS ================= */
router.get('/settings', authorize('CLIENT', 'VENDOR'), getB2BSettings);
router.put('/settings', authorize('CLIENT', 'VENDOR'), updateB2BSettings);

export default router;
