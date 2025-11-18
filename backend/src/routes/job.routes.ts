import { Router } from 'express';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from '../controllers/job.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllJobs);
router.get('/:id', authenticate, getJobById);
router.post('/', authenticate, authorize('RECRUITER', 'ADMIN'), createJob);
router.put('/:id', authenticate, authorize('RECRUITER', 'ADMIN'), updateJob);
router.delete('/:id', authenticate, authorize('RECRUITER', 'ADMIN'), deleteJob);

export default router;
