import { Router } from 'express';
import {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkIfSaved,
} from '../controllers/savedJob.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getSavedJobs);
router.post('/', authenticate, saveJob);
router.delete('/:jobId', authenticate, unsaveJob);
router.get('/check/:jobId', authenticate, checkIfSaved);

export default router;
