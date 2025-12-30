import { Router } from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  checkIfApplied,
  downloadApplicationResume,
} from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getApplications);
router.get('/check/:jobId', authenticate, checkIfApplied);
router.get('/:id', authenticate, getApplicationById);
router.get('/:id/resume/download', authenticate, downloadApplicationResume);
router.post('/', authenticate, createApplication);
router.put('/:id/status', authenticate, authorize('RECRUITER', 'ADMIN'), updateApplicationStatus);
router.put('/:id/withdraw', authenticate, withdrawApplication);

export default router;
