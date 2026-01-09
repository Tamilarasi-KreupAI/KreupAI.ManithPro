import express from 'express';
import { authenticate } from '../middleware/auth';
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

router.get('/stats/client', getClientDashboardStats);
router.get('/stats/vendor', getVendorDashboardStats);

/* ================= RECENT ACTIVITY ================= */

router.get('/requirements/recent', getRecentRequirements);
router.get('/placements/recent', getRecentPlacements);

/* ================= CONTRACTS ================= */

router.get('/contracts/pending', getPendingContracts);
router.post('/requirements', createRequirement);
router.get('/requirements', getAllRequirements);
// IMPORTANT: /requirements/open must come BEFORE /requirements/:id
router.get('/requirements/open', getOpenRequirements);
router.get('/requirements/:id', getRequirementById);
router.put('/requirements/:id', updateRequirement);
router.delete('/requirements/:id', deleteRequirement);
router.get('/contracts', getAllContracts);
router.get('/contracts/:id/download', downloadContract);
router.get('/contracts/:id/view', viewContract);
router.patch('/contracts/:id/status', updateContractStatus);

router.get('/candidates', getVendorCandidates);
router.post('/candidates', addCandidate);
router.get('/candidates/:id/resume', downloadCandidateResume);
router.post('/contracts', createDraftContract);

router.get('/candidates/:id', getCandidateProfile);

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

router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);
router.post('/invoices/:id/pay', payInvoice);
router.get('/invoices/:id/download', downloadInvoice);

/* ================= VENDORS ================= */
router.get('/vendors', getVendors);

/* ================= PLACEMENTS / SUBMISSIONS ================= */
router.post('/submissions', submitCandidateToRequirement);    // Vendor submits candidate
router.get('/submissions/vendor', getVendorSubmissions);      // Vendor sees their submissions
router.get('/submissions/client', getClientSubmissions);      // Client sees submissions to their requirements
router.patch('/submissions/:id/status', updateSubmissionStatus); // Client approves/rejects

/* ================= SETTINGS ================= */
router.get('/settings', getB2BSettings);
router.put('/settings', updateB2BSettings);

export default router;
