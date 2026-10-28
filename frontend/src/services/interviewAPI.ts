import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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

export interface ScorecardCriterionRating {
  criteriaId: string;
  criteriaName: string;
  rating: number;
  notes?: string;
}

export interface InterviewScorecardFeedback {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorEmail?: string;
  evaluatorRole?: string;
  overallScore: number;
  rating: number;
  recommendation: string;
  ratings: ScorecardCriterionRating[];
  strengths: string[];
  weaknesses: string[];
  notes: string;
  submittedAt: string;
  updatedAt?: string;
}

export interface SubmitFeedbackPayload {
  feedbackId?: string;
  ratings?: ScorecardCriterionRating[];
  overallScore?: number;
  rating?: number;
  recommendation?: string;
  strengths?: string[] | string;
  weaknesses?: string[] | string;
  notes?: string;
  feedback?: string;
  isEdit?: boolean;
}

import { mockInterviews } from './mockData';

const USE_MOCK = false;

const mockDelay = <T>(data: T, ms = 500): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

export const interviewAPI = {
  // Create interview
  create: async (data: CreateInterviewData): Promise<Interview> => {
    if (USE_MOCK) {
      const newInterview = {
        id: Math.random().toString(),
        ...data,
        status: 'SCHEDULED' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledById: '2',
        candidateId: '1',
        application: null,
        scheduledBy: null,
        candidate: null
      };
      mockInterviews.push(newInterview as any);
      return mockDelay(newInterview as unknown as Interview);
    }
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
    if (USE_MOCK) {
      return mockDelay(mockInterviews as unknown as Interview[]);
    }
    const response = await api.get('/', { params });
    return response.data;
  },

  // Get interview by ID
  getById: async (id: string): Promise<Interview> => {
    if (USE_MOCK) {
      const interview = mockInterviews.find(i => i.id === id);
      if (!interview) throw new Error('Interview not found');
      return mockDelay(interview as unknown as Interview);
    }
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Update interview
  update: async (id: string, data: UpdateInterviewData): Promise<Interview> => {
    if (USE_MOCK) {
      const interview = mockInterviews.find(i => i.id === id);
      if (!interview) throw new Error('Interview not found');
      const updated = { ...interview, ...data };
      return mockDelay(updated as unknown as Interview);
    }
    const response = await api.put(`/${id}`, data);
    return response.data;
  },

  // Delete interview
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) return mockDelay(undefined);
    await api.delete(`/${id}`);
  },

  // Get upcoming interviews
  getUpcoming: async (): Promise<Interview[]> => {
    if (USE_MOCK) {
      return mockDelay(mockInterviews as unknown as Interview[]);
    }
    const response = await api.get('/upcoming');
    return response.data;
  },

  // Get interviews for an application
  getByApplication: async (applicationId: string): Promise<Interview[]> => {
    if (USE_MOCK) {
      return mockDelay(mockInterviews.filter(i => i.applicationId === applicationId) as unknown as Interview[]);
    }
    const response = await api.get(`/application/${applicationId}`);
    return response.data;
  },

  // Submit feedback (supports batch25 scorecard & multiple reviewers)
  submitFeedback: async (id: string, data: SubmitFeedbackPayload | { feedback: string; rating: number }): Promise<Interview> => {
    if (USE_MOCK) {
      const interview = mockInterviews.find(i => i.id === id);
      if (!interview) throw new Error('Interview not found');
      const updated = { ...interview, ...data };
      return mockDelay(updated as unknown as Interview);
    }
    const response = await api.post(`/${id}/feedback`, data);
    return response.data;
  },

  // Update existing interview feedback
  updateFeedback: async (id: string, data: SubmitFeedbackPayload): Promise<Interview> => {
    if (USE_MOCK) {
      const interview = mockInterviews.find(i => i.id === id);
      if (!interview) throw new Error('Interview not found');
      const updated = { ...interview, ...data };
      return mockDelay(updated as unknown as Interview);
    }
    const response = await api.put(`/${id}/feedback`, { ...data, isEdit: true });
    return response.data;
  },
};

export default interviewAPI;
