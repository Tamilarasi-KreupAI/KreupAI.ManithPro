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

export const notificationAPI = {
  // Get all notifications
  getAll: async (params?: { isRead?: boolean; limit?: number }): Promise<Notification[]> => {
    const response = await api.get('/', { params });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.put(`/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.put('/read-all');
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    await api.delete(`/${id}`);
  },

  // Delete all read notifications
  deleteAllRead: async (): Promise<void> => {
    await api.delete('/read/all');
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/unread-count');
    return response.data.count;
  },
};

export default notificationAPI;
