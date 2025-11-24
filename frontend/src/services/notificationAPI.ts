import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/notifications`,
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

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
}

// Mock notifications for frontend-only mode
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'APPLICATION',
    title: 'Application Update',
    message: 'Your application for Senior Developer has been reviewed',
    link: '/applications',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    userId: 'user_1',
  },
  {
    id: '2',
    type: 'INTERVIEW',
    title: 'Interview Scheduled',
    message: 'Interview scheduled for tomorrow at 2 PM',
    link: '/interviews',
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    userId: 'user_1',
  },
];

export const notificationAPI = {
  // Get all notifications
  getAll: async (params?: { isRead?: boolean; limit?: number }): Promise<Notification[]> => {
    try {
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      // Return mock data when backend is unavailable
      console.log('Backend unavailable, using mock notifications');
      let filtered = [...MOCK_NOTIFICATIONS];
      if (params?.isRead !== undefined) {
        filtered = filtered.filter(n => n.isRead === params.isRead);
      }
      if (params?.limit) {
        filtered = filtered.slice(0, params.limit);
      }
      return filtered;
    }
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    try {
      const response = await api.put(`/${id}/read`);
      return response.data;
    } catch (error) {
      // Update mock data
      const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
        return notification;
      }
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    try {
      await api.put('/read-all');
    } catch (error) {
      // Update all mock notifications
      MOCK_NOTIFICATIONS.forEach(n => n.isRead = true);
    }
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/${id}`);
    } catch (error) {
      // Remove from mock data
      const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
      if (index > -1) {
        MOCK_NOTIFICATIONS.splice(index, 1);
      }
    }
  },

  // Delete all read notifications
  deleteAllRead: async (): Promise<void> => {
    try {
      await api.delete('/read/all');
    } catch (error) {
      // Remove read notifications from mock data
      const unread = MOCK_NOTIFICATIONS.filter(n => !n.isRead);
      MOCK_NOTIFICATIONS.length = 0;
      MOCK_NOTIFICATIONS.push(...unread);
    }
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get('/unread-count');
      return response.data.count;
    } catch (error) {
      // Return mock unread count
      return MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
    }
  },
};

export default notificationAPI;
