import { Router } from 'express';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notificationPreference.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get notification preferences
router.get('/', authenticate, getNotificationPreferences);

// Update notification preferences
router.put('/', authenticate, updateNotificationPreferences);

export default router;
