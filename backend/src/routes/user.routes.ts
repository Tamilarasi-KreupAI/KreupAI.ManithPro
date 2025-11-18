import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getDashboardStats,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);
router.get('/dashboard-stats', authenticate, getDashboardStats);

export default router;
