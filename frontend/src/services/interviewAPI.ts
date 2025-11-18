import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/interviews`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Interview {
  id: string;
  type: 'PHONE_SCREEN' | 'TECHNICAL' | 'HR' | 'FINAL' | 'PEER' | 'CULTURAL_FIT' | 'OTHER';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  scheduledAt: string;
  endTime: string;
  timeZone?: string;
  meetingLink?: string;
  location?: string;
  instructions?: string;
  notes?: string;
  feedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  applicationId: string;
  scheduledById: string;
  candidateId: string;
  application?: any;
  scheduledBy?: any;
  candidate?: any;
}

export interface CreateInterviewData {
  applicationId: string;
  type: Interview['type'];
  scheduledAt: string;
  endTime: string;
  timeZone?: string;
  meetingLink?: string;
  location?: string;
  instructions?: string;
  notes?: string;
}

export interface UpdateInterviewData {
  type?: Interview['type'];
  status?: Interview['status'];
  scheduledAt?: string;
  endTime?: string;
  timeZone?: string;
  meetingLink?: string;
  location?: string;
  instructions?: string;
  notes?: string;
  feedback?: string;
  rating?: number;
}

export const interviewAPI = {
  // Create interview
  create: async (data: CreateInterviewData): Promise<Interview> => {
    const response = await api.post('/', data);
    return response.data;
  },

  // Get all interviews
  getAll: async (params?: {
    status?: string;
    type?: string;
    from?: string;
    to?: string;
  }): Promise<Interview[]> => {
    const response = await api.get('/', { params });
    return response.data;
  },

  // Get interview by ID
  getById: async (id: string): Promise<Interview> => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Update interview
  update: async (id: string, data: UpdateInterviewData): Promise<Interview> => {
    const response = await api.put(`/${id}`, data);
    return response.data;
  },

  // Delete interview
  delete: async (id: string): Promise<void> => {
    await api.delete(`/${id}`);
  },

  // Get upcoming interviews
  getUpcoming: async (): Promise<Interview[]> => {
    const response = await api.get('/upcoming');
    return response.data;
  },

  // Get interviews for an application
  getByApplication: async (applicationId: string): Promise<Interview[]> => {
    const response = await api.get(`/application/${applicationId}`);
    return response.data;
  },

  // Submit feedback
  submitFeedback: async (id: string, data: { feedback: string; rating: number }): Promise<Interview> => {
    const response = await api.post(`/${id}/feedback`, data);
    return response.data;
  },
};

export default interviewAPI;
