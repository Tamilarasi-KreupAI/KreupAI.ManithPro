import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: `${API_URL}/messages`,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    return Promise.reject(error);
  }
);

// Handle errors (don't auto-redirect, let components handle it)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed in messageAPI:', error.response?.data);
      // Don't auto-redirect, let the component handle it
    }
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
    const response = await api.get('/eligible-candidates');
    return response.data;
  },
};

export default messageAPI;
