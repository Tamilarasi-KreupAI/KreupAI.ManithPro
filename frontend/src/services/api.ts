import axios from 'axios';
import type {
  User,
  Job,
  Application,
  AuthResponse,
  DashboardStats,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: any) =>
    api.post<AuthResponse>('/auth/register', data).then((res) => res.data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((res) => res.data),
  getCurrentUser: () => api.get<User>('/auth/me').then((res) => res.data),
};

// Job APIs
export const jobAPI = {
  getAll: (params?: any) =>
    api.get<{ jobs: Job[]; pagination: any }>('/jobs', { params }).then((res) => res.data),
  getById: (id: string) => api.get<Job>(`/jobs/${id}`).then((res) => res.data),
  create: (data: any) =>
    api.post<{ message: string; job: Job }>('/jobs', data).then((res) => res.data),
  update: (id: string, data: any) =>
    api.put<{ message: string; job: Job }>(`/jobs/${id}`, data).then((res) => res.data),
  delete: (id: string) =>
    api.delete<{ message: string }>(`/jobs/${id}`).then((res) => res.data),
};

// Application APIs
export const applicationAPI = {
  getAll: (params?: any) =>
    api
      .get<{ applications: Application[]; pagination: any }>('/applications', { params })
      .then((res) => res.data),
  getById: (id: string) =>
    api.get<Application>(`/applications/${id}`).then((res) => res.data),
  create: (formData: FormData) =>
    api
      .post<{ message: string; application: Application }>('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    api
      .put<{ message: string; application: Application }>(`/applications/${id}/status`, data)
      .then((res) => res.data),
  withdraw: (id: string) =>
    api
      .put<{ message: string; application: Application }>(`/applications/${id}/withdraw`)
      .then((res) => res.data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get<User>('/users/profile').then((res) => res.data),
  updateProfile: (data: any) =>
    api
      .put<{ message: string; user: User }>('/users/profile', data)
      .then((res) => res.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api
      .post<{ message: string }>('/users/change-password', data)
      .then((res) => res.data),
  getDashboardStats: () =>
    api.get<DashboardStats>('/users/dashboard-stats').then((res) => res.data),
};

export default api;
