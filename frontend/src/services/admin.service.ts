import api from './api';

// Analytics Services
export const getDashboardStats = async () => {
  const response = await api.get('/admin/analytics/dashboard');
  return response.data;
};

export const getUserAnalytics = async () => {
  const response = await api.get('/admin/analytics/users');
  return response.data;
};

export const getJobAnalytics = async () => {
  const response = await api.get('/admin/analytics/jobs');
  return response.data;
};

export const getApplicationAnalytics = async () => {
  const response = await api.get('/admin/analytics/applications');
  return response.data;
};

export const getInterviewAnalytics = async () => {
  const response = await api.get('/admin/analytics/interviews');
  return response.data;
};

export const getSystemActivity = async (limit = 20) => {
  const response = await api.get('/admin/analytics/activity', { params: { limit } });
  return response.data;
};

export const getConversionFunnel = async () => {
  const response = await api.get('/admin/analytics/funnel');
  return response.data;
};

// User Management Services
export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const createUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  location?: string;
}) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const updateUser = async (id: string, userData: any) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const updateUserRole = async (id: string, role: string) => {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const resetUserPassword = async (id: string, newPassword: string) => {
  const response = await api.patch(`/admin/users/${id}/password`, { newPassword });
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/admin/users/stats');
  return response.data;
};

export const bulkDeleteUsers = async (userIds: string[]) => {
  const response = await api.post('/admin/users/bulk-delete', { userIds });
  return response.data;
};

// Job Management Services
export const getAllJobs = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  companyName?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const response = await api.get('/admin/jobs', { params });
  return response.data;
};

export const getJobById = async (id: string) => {
  const response = await api.get(`/admin/jobs/${id}`);
  return response.data;
};

export const updateJob = async (id: string, jobData: any) => {
  const response = await api.put(`/admin/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id: string) => {
  const response = await api.delete(`/admin/jobs/${id}`);
  return response.data;
};

export const updateJobStatus = async (id: string, status: string) => {
  const response = await api.patch(`/admin/jobs/${id}/status`, { status });
  return response.data;
};

export const bulkDeleteJobs = async (jobIds: string[]) => {
  const response = await api.post('/admin/jobs/bulk-delete', { jobIds });
  return response.data;
};

export const bulkUpdateJobStatus = async (jobIds: string[], status: string) => {
  const response = await api.post('/admin/jobs/bulk-update-status', { jobIds, status });
  return response.data;
};

export const getJobStats = async () => {
  const response = await api.get('/admin/jobs/stats');
  return response.data;
};

export const getJobApplications = async (id: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await api.get(`/admin/jobs/${id}/applications`, { params });
  return response.data;
};

// Application Management Services
export const getAllApplications = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  jobId?: string;
  candidateId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/applications', { params });
  return response.data;
};

export const getApplicationById = async (id: string) => {
  const response = await api.get(`/admin/applications/${id}`);
  return response.data;
};

export const updateApplicationStatus = async (id: string, status: string, notes?: string) => {
  const response = await api.patch(`/admin/applications/${id}/status`, { status, notes });
  return response.data;
};

export const updateApplicationNotes = async (id: string, notes: string) => {
  const response = await api.patch(`/admin/applications/${id}/notes`, { notes });
  return response.data;
};

export const deleteApplication = async (id: string) => {
  const response = await api.delete(`/admin/applications/${id}`);
  return response.data;
};

export const bulkUpdateApplicationStatus = async (applicationIds: string[], status: string) => {
  const response = await api.post('/admin/applications/bulk-update-status', { applicationIds, status });
  return response.data;
};

export const bulkDeleteApplications = async (applicationIds: string[]) => {
  const response = await api.post('/admin/applications/bulk-delete', { applicationIds });
  return response.data;
};

export const getApplicationStats = async () => {
  const response = await api.get('/admin/applications/stats');
  return response.data;
};

export const exportApplications = async (params?: {
  status?: string;
  jobId?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/applications/export', { params });
  return response.data;
};

// Configuration Services
export const getSystemConfig = async () => {
  const response = await api.get('/admin/config');
  return response.data;
};

export const updateSiteConfig = async (config: any) => {
  const response = await api.put('/admin/config/site', config);
  return response.data;
};

export const updateJobsConfig = async (config: any) => {
  const response = await api.put('/admin/config/jobs', config);
  return response.data;
};

export const updateApplicationsConfig = async (config: any) => {
  const response = await api.put('/admin/config/applications', config);
  return response.data;
};

export const updateEmailConfig = async (config: any) => {
  const response = await api.put('/admin/config/email', config);
  return response.data;
};

export const updateUploadsConfig = async (config: any) => {
  const response = await api.put('/admin/config/uploads', config);
  return response.data;
};

export const updateSecurityConfig = async (config: any) => {
  const response = await api.put('/admin/config/security', config);
  return response.data;
};

export const resetConfig = async () => {
  const response = await api.post('/admin/config/reset');
  return response.data;
};

export const getSystemStats = async () => {
  const response = await api.get('/admin/config/system-stats');
  return response.data;
};

// Communication Services
export const sendBroadcastEmail = async (data: {
  recipients?: string[];
  subject: string;
  message: string;
  recipientType: 'all' | 'role' | 'specific';
  role?: string;
}) => {
  const response = await api.post('/admin/communication/email/broadcast', data);
  return response.data;
};

export const sendBroadcastNotification = async (data: {
  recipients?: string[];
  title: string;
  message: string;
  type: string;
  link?: string;
  recipientType: 'all' | 'role' | 'specific';
  role?: string;
}) => {
  const response = await api.post('/admin/communication/notification/broadcast', data);
  return response.data;
};

export const sendTestEmail = async (email: string, subject: string, message: string) => {
  const response = await api.post('/admin/communication/email/test', { email, subject, message });
  return response.data;
};

export const getCommunicationHistory = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
}) => {
  const response = await api.get('/admin/communication/history', { params });
  return response.data;
};

export const getNotificationTemplates = async () => {
  const response = await api.get('/admin/communication/templates');
  return response.data;
};

export const getEmailStats = async () => {
  const response = await api.get('/admin/communication/email/stats');
  return response.data;
};

export const getNotificationStats = async () => {
  const response = await api.get('/admin/communication/notification/stats');
  return response.data;
};

// ==================== Interview Management Services ====================
export const getAllInterviews = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  candidateId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/interviews', { params });
  return response.data;
};

export const getInterviewById = async (id: string) => {
  const response = await api.get(`/admin/interviews/${id}`);
  return response.data;
};

export const updateInterview = async (id: string, interviewData: any) => {
  const response = await api.put(`/admin/interviews/${id}`, interviewData);
  return response.data;
};

export const updateInterviewStatus = async (id: string, status: string, feedback?: string, rating?: number) => {
  const response = await api.patch(`/admin/interviews/${id}/status`, { status, feedback, rating });
  return response.data;
};

export const deleteInterview = async (id: string) => {
  const response = await api.delete(`/admin/interviews/${id}`);
  return response.data;
};

export const bulkUpdateInterviewStatus = async (interviewIds: string[], status: string) => {
  const response = await api.post('/admin/interviews/bulk-update-status', { interviewIds, status });
  return response.data;
};

export const bulkDeleteInterviews = async (interviewIds: string[]) => {
  const response = await api.post('/admin/interviews/bulk-delete', { interviewIds });
  return response.data;
};

export const getInterviewStats = async () => {
  const response = await api.get('/admin/interviews/stats');
  return response.data;
};

export const getInterviewCalendar = async (year: number, month: number) => {
  const response = await api.get('/admin/interviews/calendar', { params: { year, month } });
  return response.data;
};

export const getUpcomingInterviews = async (limit = 10) => {
  const response = await api.get('/admin/interviews/upcoming', { params: { limit } });
  return response.data;
};

export const exportInterviews = async (params?: {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/interviews/export', { params });
  return response.data;
};

// ==================== Advanced Analytics Services ====================
export const getComprehensiveAnalytics = async (period?: string) => {
  const response = await api.get('/admin/analytics/comprehensive', { params: { period } });
  return response.data;
};

export const getRecruiterPerformance = async () => {
  const response = await api.get('/admin/analytics/recruiters');
  return response.data;
};

export const getTimeToHireAnalytics = async () => {
  const response = await api.get('/admin/analytics/time-to-hire');
  return response.data;
};

export const getSourceAnalytics = async () => {
  const response = await api.get('/admin/analytics/sources');
  return response.data;
};

export const getSkillsDemandAnalytics = async () => {
  const response = await api.get('/admin/analytics/skills-demand');
  return response.data;
};

export const getIndustryAnalytics = async () => {
  const response = await api.get('/admin/analytics/industry');
  return response.data;
};

export const getEngagementMetrics = async () => {
  const response = await api.get('/admin/analytics/engagement');
  return response.data;
};

export const getRevenueAnalytics = async () => {
  const response = await api.get('/admin/analytics/revenue');
  return response.data;
};

// ==================== Content Management Services ====================
// FAQ Management
export const getAllFAQs = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  published?: boolean;
  search?: string;
}) => {
  const response = await api.get('/admin/content/faqs', { params });
  return response.data;
};

export const getFAQById = async (id: string) => {
  const response = await api.get(`/admin/content/faqs/${id}`);
  return response.data;
};

export const createFAQ = async (faqData: {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  published?: boolean;
}) => {
  const response = await api.post('/admin/content/faqs', faqData);
  return response.data;
};

export const updateFAQ = async (id: string, faqData: any) => {
  const response = await api.put(`/admin/content/faqs/${id}`, faqData);
  return response.data;
};

export const deleteFAQ = async (id: string) => {
  const response = await api.delete(`/admin/content/faqs/${id}`);
  return response.data;
};

export const reorderFAQs = async (faqOrders: { id: string; order: number }[]) => {
  const response = await api.post('/admin/content/faqs/reorder', { faqOrders });
  return response.data;
};

// Email Template Management
export const getAllEmailTemplates = async (params?: {
  type?: string;
  search?: string;
}) => {
  const response = await api.get('/admin/content/email-templates', { params });
  return response.data;
};

export const getEmailTemplateById = async (id: string) => {
  const response = await api.get(`/admin/content/email-templates/${id}`);
  return response.data;
};

export const createEmailTemplate = async (templateData: {
  name: string;
  type: string;
  subject: string;
  body: string;
  variables?: string[];
}) => {
  const response = await api.post('/admin/content/email-templates', templateData);
  return response.data;
};

export const updateEmailTemplate = async (id: string, templateData: any) => {
  const response = await api.put(`/admin/content/email-templates/${id}`, templateData);
  return response.data;
};

export const deleteEmailTemplate = async (id: string) => {
  const response = await api.delete(`/admin/content/email-templates/${id}`);
  return response.data;
};

// Notification Template Management
export const getAllNotificationTemplatesContent = async (params?: {
  type?: string;
  search?: string;
}) => {
  const response = await api.get('/admin/content/notification-templates', { params });
  return response.data;
};

export const getNotificationTemplateById = async (id: string) => {
  const response = await api.get(`/admin/content/notification-templates/${id}`);
  return response.data;
};

export const createNotificationTemplate = async (templateData: {
  name: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  variables?: string[];
}) => {
  const response = await api.post('/admin/content/notification-templates', templateData);
  return response.data;
};

export const updateNotificationTemplate = async (id: string, templateData: any) => {
  const response = await api.put(`/admin/content/notification-templates/${id}`, templateData);
  return response.data;
};

export const deleteNotificationTemplate = async (id: string) => {
  const response = await api.delete(`/admin/content/notification-templates/${id}`);
  return response.data;
};

// Static Page Management
export const getAllStaticPages = async (params?: {
  published?: boolean;
  search?: string;
}) => {
  const response = await api.get('/admin/content/static-pages', { params });
  return response.data;
};

export const getStaticPageById = async (id: string) => {
  const response = await api.get(`/admin/content/static-pages/${id}`);
  return response.data;
};

export const createStaticPage = async (pageData: {
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  published?: boolean;
}) => {
  const response = await api.post('/admin/content/static-pages', pageData);
  return response.data;
};

export const updateStaticPage = async (id: string, pageData: any) => {
  const response = await api.put(`/admin/content/static-pages/${id}`, pageData);
  return response.data;
};

export const deleteStaticPage = async (id: string) => {
  const response = await api.delete(`/admin/content/static-pages/${id}`);
  return response.data;
};

// Help Article Management
export const getAllHelpArticles = async (params?: {
  category?: string;
  published?: boolean;
  search?: string;
}) => {
  const response = await api.get('/admin/content/help-articles', { params });
  return response.data;
};

export const getHelpArticleById = async (id: string) => {
  const response = await api.get(`/admin/content/help-articles/${id}`);
  return response.data;
};

export const createHelpArticle = async (articleData: {
  title: string;
  slug: string;
  content: string;
  category?: string;
  order?: number;
  published?: boolean;
}) => {
  const response = await api.post('/admin/content/help-articles', articleData);
  return response.data;
};

export const updateHelpArticle = async (id: string, articleData: any) => {
  const response = await api.put(`/admin/content/help-articles/${id}`, articleData);
  return response.data;
};

export const deleteHelpArticle = async (id: string) => {
  const response = await api.delete(`/admin/content/help-articles/${id}`);
  return response.data;
};

export const reorderHelpArticles = async (articleOrders: { id: string; order: number }[]) => {
  const response = await api.post('/admin/content/help-articles/reorder', { articleOrders });
  return response.data;
};

// Content Statistics
export const getContentStats = async () => {
  const response = await api.get('/admin/content/stats');
  return response.data;
};

// ==================== Audit Log Services ====================
export const getAllAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
};

export const getAuditLogById = async (id: string) => {
  const response = await api.get(`/admin/audit-logs/${id}`);
  return response.data;
};

export const createAuditLog = async (logData: {
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  metadata?: any;
  ipAddress?: string;
}) => {
  const response = await api.post('/admin/audit-logs', logData);
  return response.data;
};

export const getAuditLogStats = async (period?: string) => {
  const response = await api.get('/admin/audit-logs/stats', { params: { period } });
  return response.data;
};

export const getUserActivity = async (userId: string, limit?: number) => {
  const response = await api.get(`/admin/audit-logs/user/${userId}`, { params: { limit } });
  return response.data;
};

export const exportAuditLogs = async (params?: {
  action?: string;
  entity?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/audit-logs/export', { params });
  return response.data;
};

export const deleteOldAuditLogs = async (days: number) => {
  const response = await api.delete('/admin/audit-logs/cleanup', { data: { days } });
  return response.data;
};

// ==================== Reports Services ====================
export const getReportTypes = async () => {
  const response = await api.get('/admin/reports/types');
  return response.data;
};

export const generateUserReport = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  role?: string;
  format?: string;
}) => {
  const response = await api.get('/admin/reports/users', { params });
  return response.data;
};

export const generateJobReport = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
  format?: string;
}) => {
  const response = await api.get('/admin/reports/jobs', { params });
  return response.data;
};

export const generateApplicationReport = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  format?: string;
}) => {
  const response = await api.get('/admin/reports/applications', { params });
  return response.data;
};

export const generateInterviewReport = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
  format?: string;
}) => {
  const response = await api.get('/admin/reports/interviews', { params });
  return response.data;
};

export const generateRecruiterReport = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  format?: string;
}) => {
  const response = await api.get('/admin/reports/recruiters', { params });
  return response.data;
};

export const generateConversionReport = async (params?: {
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/reports/conversion', { params });
  return response.data;
};

export const getScheduledReports = async () => {
  const response = await api.get('/admin/reports/scheduled');
  return response.data;
};

export const getReportHistory = async (limit?: number) => {
  const response = await api.get('/admin/reports/history', { params: { limit } });
  return response.data;
};

// ==================== Billing Services ====================
export const getAllSubscriptions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
  search?: string;
}) => {
  const response = await api.get('/admin/billing/subscriptions', { params });
  return response.data;
};

export const getSubscriptionById = async (id: string) => {
  const response = await api.get(`/admin/billing/subscriptions/${id}`);
  return response.data;
};

export const updateSubscription = async (id: string, data: any) => {
  const response = await api.put(`/admin/billing/subscriptions/${id}`, data);
  return response.data;
};

export const cancelSubscription = async (id: string, reason?: string) => {
  const response = await api.post(`/admin/billing/subscriptions/${id}/cancel`, { reason });
  return response.data;
};

export const getSubscriptionStats = async () => {
  const response = await api.get('/admin/billing/subscriptions/stats');
  return response.data;
};

export const getAllPayments = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/billing/payments', { params });
  return response.data;
};

export const getPaymentStats = async (period?: string) => {
  const response = await api.get('/admin/billing/payments/stats', { params: { period } });
  return response.data;
};

export const getAllInvoices = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/billing/invoices', { params });
  return response.data;
};

export const generateInvoice = async (invoiceData: {
  subscriptionId: string;
  amount: number;
  dueDate: string;
  items?: any[];
}) => {
  const response = await api.post('/admin/billing/invoices', invoiceData);
  return response.data;
};

export const markInvoiceAsPaid = async (id: string, paymentId: string, paidAmount: number) => {
  const response = await api.post(`/admin/billing/invoices/${id}/mark-paid`, { paymentId, paidAmount });
  return response.data;
};

export const getBillingRevenueAnalytics = async (period?: string) => {
  const response = await api.get('/admin/billing/revenue', { params: { period } });
  return response.data;
};

export const exportBillingData = async (params?: {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const response = await api.get('/admin/billing/export', { params });
  return response.data;
};

// ==================== Monitoring Services ====================
export const getSystemHealth = async () => {
  const response = await api.get('/admin/monitoring/health');
  return response.data;
};

export const getAPIUsage = async (period?: string) => {
  const response = await api.get('/admin/monitoring/api-usage', { params: { period } });
  return response.data;
};

export const getErrorLogs = async (params?: {
  page?: number;
  limit?: number;
  level?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) => {
  const response = await api.get('/admin/monitoring/errors', { params });
  return response.data;
};

export const getErrorStats = async (period?: string) => {
  const response = await api.get('/admin/monitoring/errors/stats', { params: { period } });
  return response.data;
};

export const getDatabaseMetrics = async () => {
  const response = await api.get('/admin/monitoring/database');
  return response.data;
};

export const getPerformanceMetrics = async (period?: string) => {
  const response = await api.get('/admin/monitoring/performance', { params: { period } });
  return response.data;
};

export const getBackgroundJobs = async () => {
  const response = await api.get('/admin/monitoring/jobs');
  return response.data;
};

export const getCacheMetrics = async () => {
  const response = await api.get('/admin/monitoring/cache');
  return response.data;
};

export const getActiveSessions = async () => {
  const response = await api.get('/admin/monitoring/sessions');
  return response.data;
};
