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
