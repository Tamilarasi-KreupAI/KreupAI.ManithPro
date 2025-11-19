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
