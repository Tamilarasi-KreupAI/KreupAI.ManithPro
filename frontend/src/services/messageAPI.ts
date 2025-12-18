import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to get token
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('[Message API] ❌ No token found in localStorage');
    return null;
  }
  return token;
};

const api = axios.create({
  baseURL: `${API_URL}/messages`,
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< Updated upstream
// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
=======
// Add auth token to requests - CRITICAL: This must work!
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    if (!token) {
      console.error('[Message API] ❌ CRITICAL: Cannot make request without token');
      return Promise.reject(new Error('No authentication token available'));
    }

    // Ensure Authorization header is set
    if (!config.headers) {
      config.headers = {} as any;
    }

    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('[Message API] ✅ Request:', config.method?.toUpperCase(), config.url, '| Token:', token.substring(0, 20) + '...');

    return config;
  },
  (error) => {
    console.error('[Message API] ❌ Request interceptor error:', error);
>>>>>>> Stashed changes
    return Promise.reject(error);
  }
);

<<<<<<< Updated upstream
// Handle errors (don't auto-redirect, let components handle it)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed in messageAPI:', error.response?.data);
      // Don't auto-redirect, let the component handle it
    }
=======
// Add response interceptor to catch errors
api.interceptors.response.use(
  (response) => {
    console.log('[Message API] ✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error('[Message API] ❌ Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.error('[Message API] ❌ 401 Unauthorized - Token is invalid or expired');

      // Check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('[Message API] No token found - user needs to log in');
      } else {
        console.error('[Message API] Token exists but was rejected by server');
        console.error('[Message API] Token value:', token.substring(0, 50) + '...');

        // Decode and check token
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const isExpired = Date.now() > payload.exp * 1000;
            console.error('[Message API] Token expired:', isExpired);
            console.error('[Message API] Token expires at:', new Date(payload.exp * 1000).toISOString());

            if (isExpired) {
              console.error('[Message API] Token is expired - clearing localStorage');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            } else {
              console.error('[Message API] Token is valid but server rejected it - possible JWT_SECRET mismatch');
              console.error('[Message API] SOLUTION: Log out and log in again to get a fresh token');
            }
          }
        } catch (e) {
          console.error('[Message API] Failed to decode token:', e);
        }
      }
    }

>>>>>>> Stashed changes
    return Promise.reject(error);
  }
);

export interface Message {
  id: string;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  senderId: string;
  receiverId: string;
  applicationId?: string;
  sender?: any;
  receiver?: any;
  application?: any;
}

export interface SendMessageData {
  receiverId: string;
  content: string;
  applicationId?: string;
  attachments?: string[];
}

export interface Conversation {
  user: any;
  lastMessage: Message;
  unreadCount: number;
}

<<<<<<< Updated upstream
=======
import { mockMessages, mockUsers } from './mockData';

const USE_MOCK = false;

const mockDelay = <T>(data: T, ms = 500): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

>>>>>>> Stashed changes
export const messageAPI = {
  // Send message
  send: async (data: SendMessageData): Promise<Message> => {
    try {
      const response = await api.post('/', data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  },

  // Get conversation with a user
  getConversation: async (userId: string): Promise<Message[]> => {
    try {
      const response = await api.get(`/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching conversation:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch conversation');
    }
  },

  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching conversations:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch conversations');
    }
  },

  // Get messages for an application
  getApplicationMessages: async (applicationId: string): Promise<Message[]> => {
    try {
      const response = await api.get(`/application/${applicationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching application messages:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch application messages');
    }
  },

  // Mark message as read
  markAsRead: async (id: string): Promise<Message> => {
    try {
      const response = await api.put(`/${id}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Error marking message as read:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to mark message as read');
    }
  },

  // Get unread message count
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get('/unread-count');
      return response.data.count;
    } catch (error: any) {
      console.error('Error fetching unread count:', error.response?.data || error.message);
      return 0;
    }
  },

  // Get eligible candidates for messaging (recruiter only)
  getEligibleCandidates: async (): Promise<any> => {
    if (USE_MOCK) {
      return mockDelay({
        eligibleCandidates: [],
        count: 0
      });
    }
    const response = await api.get('/eligible-candidates');
    return response.data;
  },
};

export default messageAPI;
