import express from 'express';
import {
  sendMessage,
  getConversation,
  getConversations,
  getApplicationMessages,
  markAsRead,
  getUnreadCount,
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Message routes
router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/application/:applicationId', getApplicationMessages);
router.get('/:userId', getConversation);
router.put('/:id/read', markAsRead);

export default router;
