import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  updateRecruiterStats,
} from '../controllers/recruiterProfile.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get recruiter profile
router.get('/', getRecruiterProfile);

// Update recruiter profile
router.put('/', updateRecruiterProfile);

// Update recruiter stats (for system use)
router.put('/stats', updateRecruiterStats);

export default router;
