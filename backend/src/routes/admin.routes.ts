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

// Application Management Controllers
import {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  updateApplicationNotes,
  deleteApplication,
  bulkUpdateApplicationStatus,
  bulkDeleteApplications,
  getApplicationStats,
  exportApplications,
} from '../controllers/admin.application.controller';

// Configuration Controllers
import {
  getSystemConfig,
  updateSiteConfig,
  updateJobsConfig,
  updateApplicationsConfig,
  updateEmailConfig,
  updateUploadsConfig,
  updateSecurityConfig,
  resetConfig,
  getSystemStats,
} from '../controllers/admin.config.controller';

// Communication Controllers
import {
  sendBroadcastEmail,
  sendBroadcastNotification,
  getCommunicationHistory,
  getNotificationTemplates,
  sendTestEmail,
  getEmailStats,
  getNotificationStats,
} from '../controllers/admin.communication.controller';

// Interview Management Controllers
import {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  updateInterviewStatus,
  deleteInterview,
  bulkUpdateInterviewStatus,
  bulkDeleteInterviews,
  getInterviewStats,
  getInterviewCalendar,
  getUpcomingInterviews,
  exportInterviews,
} from '../controllers/admin.interview.controller';

// Advanced Analytics Controllers
import {
  getComprehensiveAnalytics,
  getRecruiterPerformance,
  getTimeToHireAnalytics,
  getSourceAnalytics,
  getSkillsDemandAnalytics,
  getIndustryAnalytics,
  getEngagementMetrics,
  getRevenueAnalytics,
} from '../controllers/admin.advancedAnalytics.controller';

// Content Management Controllers
import {
  // FAQ Management
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
  // Email Template Management
  getAllEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  // Notification Template Management
  getAllNotificationTemplates,
  getNotificationTemplateById,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  // Static Page Management
  getAllStaticPages,
  getStaticPageById,
  createStaticPage,
  updateStaticPage,
  deleteStaticPage,
  // Help Article Management
  getAllHelpArticles,
  getHelpArticleById,
  createHelpArticle,
  updateHelpArticle,
  deleteHelpArticle,
  reorderHelpArticles,
  // Content Statistics
  getContentStats,
} from '../controllers/admin.content.controller';

// Audit Log Controllers
import {
  getAllAuditLogs,
  getAuditLogById,
  createAuditLog,
  getAuditLogStats,
  getUserActivity,
  exportAuditLogs,
  deleteOldAuditLogs,
} from '../controllers/admin.auditLog.controller';

// Reports Controllers
import {
  getReportTypes,
  generateUserReport,
  generateJobReport,
  generateApplicationReport,
  generateInterviewReport,
  generateRecruiterReport,
  generateConversionReport,
  getScheduledReports,
  getReportHistory,
} from '../controllers/admin.reports.controller';

// Billing Controllers
import {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  getSubscriptionStats,
  getAllPayments,
  getPaymentStats,
  getAllInvoices,
  generateInvoice,
  markInvoiceAsPaid,
  getRevenueAnalytics as getBillingRevenueAnalytics,
  exportBillingData,
} from '../controllers/admin.billing.controller';

// Monitoring Controllers
import {
  getSystemHealth,
  getAPIUsage,
  getErrorLogs,
  getErrorStats,
  getDatabaseMetrics,
  getPerformanceMetrics,
  getBackgroundJobs,
  getCacheMetrics,
  getActiveSessions,
} from '../controllers/admin.monitoring.controller';

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

// ==================== Application Management Routes ====================
router.get('/applications', getAllApplications);
router.get('/applications/stats', getApplicationStats);
router.get('/applications/export', exportApplications);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);
router.patch('/applications/:id/notes', updateApplicationNotes);
router.delete('/applications/:id', deleteApplication);
router.post('/applications/bulk-update-status', bulkUpdateApplicationStatus);
router.post('/applications/bulk-delete', bulkDeleteApplications);

// ==================== Configuration Routes ====================
router.get('/config', getSystemConfig);
router.get('/config/system-stats', getSystemStats);
router.put('/config/site', updateSiteConfig);
router.put('/config/jobs', updateJobsConfig);
router.put('/config/applications', updateApplicationsConfig);
router.put('/config/email', updateEmailConfig);
router.put('/config/uploads', updateUploadsConfig);
router.put('/config/security', updateSecurityConfig);
router.post('/config/reset', resetConfig);

// ==================== Communication Routes ====================
router.post('/communication/email/broadcast', sendBroadcastEmail);
router.post('/communication/notification/broadcast', sendBroadcastNotification);
router.post('/communication/email/test', sendTestEmail);
router.get('/communication/history', getCommunicationHistory);
router.get('/communication/templates', getNotificationTemplates);
router.get('/communication/email/stats', getEmailStats);
router.get('/communication/notification/stats', getNotificationStats);

// ==================== Interview Management Routes ====================
router.get('/interviews', getAllInterviews);
router.get('/interviews/stats', getInterviewStats);
router.get('/interviews/calendar', getInterviewCalendar);
router.get('/interviews/upcoming', getUpcomingInterviews);
router.get('/interviews/export', exportInterviews);
router.get('/interviews/:id', getInterviewById);
router.put('/interviews/:id', updateInterview);
router.patch('/interviews/:id/status', updateInterviewStatus);
router.delete('/interviews/:id', deleteInterview);
router.post('/interviews/bulk-update-status', bulkUpdateInterviewStatus);
router.post('/interviews/bulk-delete', bulkDeleteInterviews);

// ==================== Advanced Analytics Routes ====================
router.get('/analytics/comprehensive', getComprehensiveAnalytics);
router.get('/analytics/recruiters', getRecruiterPerformance);
router.get('/analytics/time-to-hire', getTimeToHireAnalytics);
router.get('/analytics/sources', getSourceAnalytics);
router.get('/analytics/skills-demand', getSkillsDemandAnalytics);
router.get('/analytics/industry', getIndustryAnalytics);
router.get('/analytics/engagement', getEngagementMetrics);
router.get('/analytics/revenue', getRevenueAnalytics);

// ==================== Content Management Routes ====================
// FAQ Routes
router.get('/content/faqs', getAllFAQs);
router.get('/content/faqs/:id', getFAQById);
router.post('/content/faqs', createFAQ);
router.put('/content/faqs/:id', updateFAQ);
router.delete('/content/faqs/:id', deleteFAQ);
router.post('/content/faqs/reorder', reorderFAQs);

// Email Template Routes
router.get('/content/email-templates', getAllEmailTemplates);
router.get('/content/email-templates/:id', getEmailTemplateById);
router.post('/content/email-templates', createEmailTemplate);
router.put('/content/email-templates/:id', updateEmailTemplate);
router.delete('/content/email-templates/:id', deleteEmailTemplate);

// Notification Template Routes
router.get('/content/notification-templates', getAllNotificationTemplates);
router.get('/content/notification-templates/:id', getNotificationTemplateById);
router.post('/content/notification-templates', createNotificationTemplate);
router.put('/content/notification-templates/:id', updateNotificationTemplate);
router.delete('/content/notification-templates/:id', deleteNotificationTemplate);

// Static Page Routes
router.get('/content/static-pages', getAllStaticPages);
router.get('/content/static-pages/:id', getStaticPageById);
router.post('/content/static-pages', createStaticPage);
router.put('/content/static-pages/:id', updateStaticPage);
router.delete('/content/static-pages/:id', deleteStaticPage);

// Help Article Routes
router.get('/content/help-articles', getAllHelpArticles);
router.get('/content/help-articles/:id', getHelpArticleById);
router.post('/content/help-articles', createHelpArticle);
router.put('/content/help-articles/:id', updateHelpArticle);
router.delete('/content/help-articles/:id', deleteHelpArticle);
router.post('/content/help-articles/reorder', reorderHelpArticles);

// Content Statistics
router.get('/content/stats', getContentStats);

// ==================== Audit Log Routes ====================
router.get('/audit-logs', getAllAuditLogs);
router.get('/audit-logs/stats', getAuditLogStats);
router.get('/audit-logs/export', exportAuditLogs);
router.get('/audit-logs/user/:userId', getUserActivity);
router.get('/audit-logs/:id', getAuditLogById);
router.post('/audit-logs', createAuditLog);
router.delete('/audit-logs/cleanup', deleteOldAuditLogs);

// ==================== Reports Routes ====================
router.get('/reports/types', getReportTypes);
router.get('/reports/users', generateUserReport);
router.get('/reports/jobs', generateJobReport);
router.get('/reports/applications', generateApplicationReport);
router.get('/reports/interviews', generateInterviewReport);
router.get('/reports/recruiters', generateRecruiterReport);
router.get('/reports/conversion', generateConversionReport);
router.get('/reports/scheduled', getScheduledReports);
router.get('/reports/history', getReportHistory);

// ==================== Billing Routes ====================
router.get('/billing/subscriptions', getAllSubscriptions);
router.get('/billing/subscriptions/stats', getSubscriptionStats);
router.get('/billing/subscriptions/:id', getSubscriptionById);
router.put('/billing/subscriptions/:id', updateSubscription);
router.post('/billing/subscriptions/:id/cancel', cancelSubscription);

router.get('/billing/payments', getAllPayments);
router.get('/billing/payments/stats', getPaymentStats);

router.get('/billing/invoices', getAllInvoices);
router.post('/billing/invoices', generateInvoice);
router.post('/billing/invoices/:id/mark-paid', markInvoiceAsPaid);

router.get('/billing/revenue', getBillingRevenueAnalytics);
router.get('/billing/export', exportBillingData);

// ==================== Monitoring Routes ====================
router.get('/monitoring/health', getSystemHealth);
router.get('/monitoring/api-usage', getAPIUsage);
router.get('/monitoring/errors', getErrorLogs);
router.get('/monitoring/errors/stats', getErrorStats);
router.get('/monitoring/database', getDatabaseMetrics);
router.get('/monitoring/performance', getPerformanceMetrics);
router.get('/monitoring/jobs', getBackgroundJobs);
router.get('/monitoring/cache', getCacheMetrics);
router.get('/monitoring/sessions', getActiveSessions);

export default router;
