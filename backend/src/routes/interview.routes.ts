import express from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getUpcomingInterviews,
  getInterviewsByApplication,
  submitFeedback,
} from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Interview routes
router.post('/', createInterview);
router.get('/', getInterviews);
router.get('/upcoming', getUpcomingInterviews);
router.get('/application/:applicationId', getInterviewsByApplication);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
router.post('/:id/feedback', submitFeedback);

export default router;
