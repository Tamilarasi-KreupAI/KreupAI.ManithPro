import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

// User Management Controllers
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  resetUserPassword,
  getUserStats,
  bulkDeleteUsers,
} from '../controllers/admin.user.controller';

// Analytics Controllers
import {
  getDashboardStats,
  getUserAnalytics,
  getJobAnalytics,
  getApplicationAnalytics,
  getInterviewAnalytics,
  getSystemActivity,
  getConversionFunnel,
} from '../controllers/admin.analytics.controller';

// Job Management Controllers
import {
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
  bulkDeleteJobs,
  bulkUpdateJobStatus,
  getJobStats,
  getJobApplications,
} from '../controllers/admin.job.controller';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// ==================== Analytics Routes ====================
router.get('/analytics/dashboard', getDashboardStats);
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/jobs', getJobAnalytics);
router.get('/analytics/applications', getApplicationAnalytics);
router.get('/analytics/interviews', getInterviewAnalytics);
router.get('/analytics/activity', getSystemActivity);
router.get('/analytics/funnel', getConversionFunnel);

// ==================== User Management Routes ====================
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/password', resetUserPassword);
router.post('/users/bulk-delete', bulkDeleteUsers);

// ==================== Job Management Routes ====================
router.get('/jobs', getAllJobs);
router.get('/jobs/stats', getJobStats);
router.get('/jobs/:id', getJobById);
router.get('/jobs/:id/applications', getJobApplications);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);
router.patch('/jobs/:id/status', updateJobStatus);
router.post('/jobs/bulk-delete', bulkDeleteJobs);
router.post('/jobs/bulk-update-status', bulkUpdateJobStatus);

export default router;
