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
  getAllContracts,
  downloadContract,
  viewContract,
  getCandidateProfile,
} from '../controllers/b2b.controller';
import { createDraftContract } from '../controllers/b2b.controller';
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
router.get('/contracts', getAllContracts);
router.get('/contracts/:id/download', downloadContract);
router.get('/contracts/:id/view', viewContract);

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
} from '../controllers/b2b.controller';

router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);
router.post('/invoices/:id/pay', payInvoice);
router.get('/invoices/:id/download', downloadInvoice);

export default router;
