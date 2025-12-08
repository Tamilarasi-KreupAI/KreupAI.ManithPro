import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: `${API_URL}/messages`,
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

import { mockMessages, mockUsers } from './mockData';

const USE_MOCK = true;

const mockDelay = <T>(data: T, ms = 500): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

export const messageAPI = {
  // Send message
  send: async (data: SendMessageData): Promise<Message> => {
    if (USE_MOCK) {
      const newMessage = {
        id: Math.random().toString(),
        ...data,
        status: 'SENT' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderId: '1', // Mock sender
        sender: mockUsers[0],
        receiver: mockUsers[1],
        attachments: data.attachments || []
      };
      return mockDelay(newMessage);
    }
    const response = await api.post('/', data);
    return response.data;
  },

  // Get conversation with a user
  getConversation: async (userId: string): Promise<Message[]> => {
    if (USE_MOCK) {
      return mockDelay(mockMessages as unknown as Message[]);
    }
    const response = await api.get(`/${userId}`);
    return response.data;
  },

  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    if (USE_MOCK) {
      return mockDelay([{
        user: mockUsers[1],
        lastMessage: mockMessages[1] as Message,
        unreadCount: 1
      }]);
    }
    const response = await api.get('/conversations');
    return response.data;
  },

  // Get messages for an application
  getApplicationMessages: async (applicationId: string): Promise<Message[]> => {
    if (USE_MOCK) {
      return mockDelay(mockMessages as unknown as Message[]);
    }
    const response = await api.get(`/application/${applicationId}`);
    return response.data;
  },

  // Mark message as read
  markAsRead: async (id: string): Promise<Message> => {
    if (USE_MOCK) {
      const msg = mockMessages.find(m => m.id === id);
      if (msg) (msg as any).status = 'READ';
      return mockDelay(msg as unknown as Message);
    }
    const response = await api.put(`/${id}/read`);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async (): Promise<number> => {
    if (USE_MOCK) return mockDelay(2);
    const response = await api.get('/unread-count');
    return response.data.count;
  },
};

export default messageAPI;
