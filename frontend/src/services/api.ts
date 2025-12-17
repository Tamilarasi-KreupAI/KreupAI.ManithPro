import axios from 'axios';
import type {
  User,
  Job,
  Application,
  AuthResponse,
  DashboardStats,
  SavedJob,
  Company,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we get an actual 401 response from the server
    // Don't redirect on network errors or other failures
    if (error.response?.status === 401 && error.response?.data) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

import { mockUsers, mockJobs, mockApplications } from './mockData';

const USE_MOCK = false; // Set to false to use real backend API

// Helper to simulate network delay
const mockDelay = <T>(data: T, ms = 500): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

// Auth APIs
export const authAPI = {
  register: (data: any) => {
    if (USE_MOCK) {
      const newUser = { ...mockUsers[0], ...data, id: Math.random().toString() };
      return mockDelay({
        message: 'Registration successful',
        user: newUser,
        token: 'mock-jwt-token',
      });
    }
    return api.post<AuthResponse>('/auth/register', data).then((res) => res.data);
  },
  login: (data: { email: string; password: string }) => {
    if (USE_MOCK) {
      // Simulate login
      const user = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase().trim()) || mockUsers[0];
      return mockDelay({
        message: 'Login successful',
        user: user,
        token: 'mock-jwt-token',
      });
    }
    return api.post<AuthResponse>('/auth/login', data).then((res) => res.data);
  },
  getCurrentUser: () => {
    if (USE_MOCK) {
      return mockDelay(mockUsers[0]);
    }
    return api.get<User>('/auth/me').then((res) => res.data);
  },
};

// Job APIs
export const jobAPI = {
  getAll: (params?: any) => {
    if (USE_MOCK) {
      return mockDelay({ jobs: mockJobs, pagination: { total: mockJobs.length, pages: 1 } });
    }
    return api.get<{ jobs: Job[]; pagination: any }>('/jobs', { params }).then((res) => res.data);
  },
  getById: (id: string) => {
    if (USE_MOCK) {
      const job = mockJobs.find(j => j.id === id);
      if (!job) return Promise.reject(new Error('Job not found'));
      return mockDelay(job);
    }
    return api.get<Job>(`/jobs/${id}`).then((res) => res.data);
  },
  create: (data: any) => {
    if (USE_MOCK) {
      const newJob = { ...mockJobs[0], ...data, id: Math.random().toString() };
      return mockDelay({ message: 'Job created', job: newJob });
    }
    return api.post<{ message: string; job: Job }>('/jobs', data).then((res) => res.data);
  },
  update: (id: string, data: any) => {
    if (USE_MOCK) {
      const updatedJob = { ...mockJobs.find(j => j.id === id), ...data } as Job;
      return mockDelay({ message: 'Job updated', job: updatedJob });
    }
    return api.put<{ message: string; job: Job }>(`/jobs/${id}`, data).then((res) => res.data);
  },
  delete: (id: string) => {
    if (USE_MOCK) {
      return mockDelay({ message: 'Job deleted' });
    }
    return api.delete<{ message: string }>(`/jobs/${id}`).then((res) => res.data);
  },
};

// Application APIs
export const applicationAPI = {
  getAll: (params?: any) => {
    if (USE_MOCK) {
      return mockDelay({ applications: mockApplications, pagination: { total: mockApplications.length, pages: 1 } });
    }
    return api
      .get<{ applications: Application[]; pagination: any }>('/applications', { params })
      .then((res) => res.data);
  },
  getById: (id: string) => {
    if (USE_MOCK) {
      const app = mockApplications.find(a => a.id === id);
      if (!app) return Promise.reject(new Error('Application not found'));
      return mockDelay(app);
    }
    return api.get<Application>(`/applications/${id}`).then((res) => res.data);
  },
  create: (formData: FormData) => {
    if (USE_MOCK) {
      const newApp = { ...mockApplications[0], id: Math.random().toString() };
      return mockDelay({ message: 'Application submitted', application: newApp });
    }
    return api
      .post<{ message: string; application: Application }>('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
  updateStatus: (id: string, data: { status: string; notes?: string }) => {
    if (USE_MOCK) {
      const app = mockApplications.find(a => a.id === id);
      if (app) app.status = data.status as any;
      return mockDelay({ message: 'Status updated', application: app! });
    }
    return api
      .put<{ message: string; application: Application }>(`/applications/${id}/status`, data)
      .then((res) => res.data);
  },
  withdraw: (id: string) => {
    if (USE_MOCK) {
      const app = mockApplications.find(a => a.id === id);
      if (app) app.status = 'WITHDRAWN';
      return mockDelay({ message: 'Application withdrawn', application: app! });
    }
    return api
      .put<{ message: string; application: Application }>(`/applications/${id}/withdraw`)
      .then((res) => res.data);
  },
  checkIfApplied: (jobId: string) => {
    if (USE_MOCK) {
      const hasApplied = mockApplications.some(a => a.jobId === jobId);
      return mockDelay({ hasApplied, application: hasApplied ? mockApplications.find(a => a.jobId === jobId) : null });
    }
    return api
      .get<{ hasApplied: boolean; application?: Application }>(`/applications/check/${jobId}`)
      .then((res) => res.data);
  },
};

// User APIs
export const userAPI = {
  getProfile: () => {
    if (USE_MOCK) return mockDelay(mockUsers[0]);
    return api.get<User>('/users/profile').then((res) => res.data);
  },
  updateProfile: (data: any) => {
    if (USE_MOCK) {
      const updatedUser = { ...mockUsers[0], ...data };
      return mockDelay({ message: 'Profile updated', user: updatedUser });
    }
    return api
      .put<{ message: string; user: User }>('/users/profile', data)
      .then((res) => res.data);
  },
  changePassword: (data: { currentPassword: string; newPassword: string }) => {
    if (USE_MOCK) return mockDelay({ message: 'Password changed' });
    return api
      .post<{ message: string }>('/users/change-password', data)
      .then((res) => res.data);
  },
  deleteAccount: (password: string) => {
    if (USE_MOCK) return mockDelay({ message: 'Account deleted' });
    return api
      .delete<{ message: string }>('/users/account', { data: { password } })
      .then((res) => res.data);
  },
  getDashboardStats: () => {
    if (USE_MOCK) {
      return mockDelay({
        totalJobs: 10,
        openJobs: 5,
        totalApplications: 20,
        pendingApplications: 5,
        acceptedApplications: 2,
        recentApplications: mockApplications
      });
    }
    return api.get<DashboardStats>('/users/dashboard-stats').then((res) => res.data);
  },
};

// Recruiter Profile APIs
export const recruiterProfileAPI = {
  getProfile: () => {
    return api.get('/recruiter-profile').then((res) => res.data);
  },
  updateProfile: (data: any) => {
    return api.put('/recruiter-profile', data).then((res) => res.data);
  },
  updateStats: (data: { activeJobs?: number; totalHires?: number; successRate?: number }) => {
    return api.put('/recruiter-profile/stats', data).then((res) => res.data);
  },
};

// Saved Jobs APIs
export const savedJobAPI = {
  getAll: (params?: any) => {
    if (USE_MOCK) return mockDelay({ savedJobs: [], pagination: { total: 0, pages: 0 } });
    return api
      .get<{ savedJobs: SavedJob[]; pagination: any }>('/saved-jobs', { params })
      .then((res) => res.data);
  },
  save: (jobId: string) => {
    if (USE_MOCK) return mockDelay({ message: 'Job saved', savedJob: { id: '1', userId: '1', jobId, savedAt: new Date().toISOString(), job: mockJobs[0] } });
    return api
      .post<{ message: string; savedJob: SavedJob }>('/saved-jobs', { jobId })
      .then((res) => res.data);
  },
  unsave: (jobId: string) => {
    if (USE_MOCK) return mockDelay({ message: 'Job unsaved' });
    return api.delete<{ message: string }>(`/saved-jobs/${jobId}`).then((res) => res.data);
  },
  checkIfSaved: (jobId: string) => {
    if (USE_MOCK) return mockDelay({ isSaved: false });
    return api.get<{ isSaved: boolean }>(`/saved-jobs/check/${jobId}`).then((res) => res.data);
  },
};

// Company APIs
export const companyAPI = {
  getAll: (params?: any) => {
    if (USE_MOCK) return mockDelay({ companies: [], pagination: { total: 0, pages: 0 } });
    return api
      .get<{ companies: any[]; pagination: any }>('/companies', { params })
      .then((res) => res.data);
  },
  getByName: (name: string) => {
    if (USE_MOCK) return mockDelay({ company: { name: 'TechCorp', description: 'Great company' }, jobs: mockJobs });
    return api
      .get<{ company: Company; jobs: Job[] }>(`/companies/${name}`)
      .then((res) => res.data);
  },
};

export default api;
