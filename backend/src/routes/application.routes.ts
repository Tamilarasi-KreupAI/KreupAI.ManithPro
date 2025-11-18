import { Router } from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../utils/fileUpload';

const router = Router();

router.get('/', authenticate, getApplications);
router.get('/:id', authenticate, getApplicationById);
router.post('/', authenticate, upload.single('resume'), createApplication);
router.put('/:id/status', authenticate, authorize('RECRUITER', 'ADMIN'), updateApplicationStatus);
router.put('/:id/withdraw', authenticate, withdrawApplication);

export default router;
