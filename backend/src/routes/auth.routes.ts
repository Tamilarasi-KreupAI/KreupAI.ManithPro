import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  registerRecruiter,
  registerClient,
  registerVendor,
  registerB2B
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.post('/register', register);
router.post('/register/recruiter', registerRecruiter);
router.post('/register/client', registerClient);
router.post('/register/vendor', registerVendor);
router.post('/register/b2b', registerB2B);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);


export default router;
