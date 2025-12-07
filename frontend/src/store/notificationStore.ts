import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============================================================
// NOTIFICATION STORE - Notifications State Management
// ============================================================

export type NotificationType =
  | 'application'
  | 'interview'
  | 'message'
  | 'system'
  | 'reminder'
  | 'alert'
  | 'success'
  | 'mention';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  relatedEntity?: {
    type: 'application' | 'job' | 'interview' | 'candidate' | 'message';
    id: string;
    name: string;
  };
}

export interface NotificationFilters {
  type?: NotificationType[];
  isRead?: boolean;
  priority?: NotificationPriority[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
    types: NotificationType[];
  };
  push: {
    enabled: boolean;
    types: NotificationType[];
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    types: NotificationType[];
  };
}

interface NotificationState {
  // Data
  notifications: Notification[];
  unreadCount: number;

  // Filters
  filters: NotificationFilters;

  // Preferences
  preferences: NotificationPreferences;

  // UI State
  isOpen: boolean;
  isLoading: boolean;

  // Pagination
  page: number;
  pageSize: number;
  hasMore: boolean;

  // Actions - Data
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  appendNotifications: (notifications: Notification[]) => void;

  // Actions - Read Status
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markMultipleAsRead: (ids: string[]) => void;

  // Actions - Filters
  setFilters: (filters: NotificationFilters) => void;
  clearFilters: () => void;

  // Actions - Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;

  // Actions - UI
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setLoading: (loading: boolean) => void;

  // Actions - Pagination
  loadMore: () => void;
  setHasMore: (hasMore: boolean) => void;
  resetPagination: () => void;

  // Getters
  getUnreadNotifications: () => Notification[];
  getFilteredNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
}

const defaultPreferences: NotificationPreferences = {
  email: {
    enabled: true,
    frequency: 'instant',
    types: ['application', 'interview', 'message', 'system'],
  },
  push: {
    enabled: true,
    types: ['application', 'interview', 'message', 'urgent' as NotificationType],
  },
  inApp: {
    enabled: true,
    sound: true,
    types: ['application', 'interview', 'message', 'system', 'reminder', 'alert', 'mention'],
  },
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  filters: {},
  preferences: defaultPreferences,
  isOpen: false,
  isLoading: false,
  page: 1,
  pageSize: 20,
  hasMore: true,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Data Actions
      setNotifications: (notifications) =>
        set((state) => {
          state.notifications = notifications;
          state.unreadCount = notifications.filter((n) => !n.isRead).length;
        }),

      addNotification: (notification) =>
        set((state) => {
          // Add to beginning of list
          state.notifications.unshift(notification);
          if (!notification.isRead) {
            state.unreadCount += 1;
          }
        }),

      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.isRead) {
            state.unreadCount -= 1;
          }
          state.notifications = state.notifications.filter((n) => n.id !== id);
        }),

      appendNotifications: (notifications) =>
        set((state) => {
          state.notifications.push(...notifications);
          state.unreadCount += notifications.filter((n) => !n.isRead).length;
          state.page += 1;
        }),

      // Read Status Actions
      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }),

      markAllAsRead: () =>
        set((state) => {
          const now = new Date().toISOString();
          state.notifications.forEach((n) => {
            if (!n.isRead) {
              n.isRead = true;
              n.readAt = now;
            }
          });
          state.unreadCount = 0;
        }),

      markMultipleAsRead: (ids) =>
        set((state) => {
          const now = new Date().toISOString();
          let unreadMarked = 0;
          ids.forEach((id) => {
            const notification = state.notifications.find((n) => n.id === id);
            if (notification && !notification.isRead) {
              notification.isRead = true;
              notification.readAt = now;
              unreadMarked += 1;
            }
          });
          state.unreadCount = Math.max(0, state.unreadCount - unreadMarked);
        }),

      // Filter Actions
      setFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        }),

      clearFilters: () =>
        set((state) => {
          state.filters = {};
        }),

      // Preferences Actions
      updatePreferences: (preferences) =>
        set((state) => {
          if (preferences.email) {
            Object.assign(state.preferences.email, preferences.email);
          }
          if (preferences.push) {
            Object.assign(state.preferences.push, preferences.push);
          }
          if (preferences.inApp) {
            Object.assign(state.preferences.inApp, preferences.inApp);
          }
        }),

      // UI Actions
      setOpen: (open) =>
        set((state) => {
          state.isOpen = open;
        }),

      toggle: () =>
        set((state) => {
          state.isOpen = !state.isOpen;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      // Pagination Actions
      loadMore: () =>
        set((state) => {
          state.page += 1;
        }),

      setHasMore: (hasMore) =>
        set((state) => {
          state.hasMore = hasMore;
        }),

      resetPagination: () =>
        set((state) => {
          state.page = 1;
          state.hasMore = true;
        }),

      // Getters
      getUnreadNotifications: () =>
        get().notifications.filter((n) => !n.isRead),

      getFilteredNotifications: () => {
        const { notifications, filters } = get();
        let filtered = [...notifications];

        if (filters.type?.length) {
          filtered = filtered.filter((n) => filters.type!.includes(n.type));
        }
        if (filters.isRead !== undefined) {
          filtered = filtered.filter((n) => n.isRead === filters.isRead);
        }
        if (filters.priority?.length) {
          filtered = filtered.filter((n) =>
            filters.priority!.includes(n.priority)
          );
        }
        if (filters.dateRange) {
          const start = new Date(filters.dateRange.start);
          const end = new Date(filters.dateRange.end);
          filtered = filtered.filter((n) => {
            const date = new Date(n.createdAt);
            return date >= start && date <= end;
          });
        }

        return filtered;
      },

      getNotificationsByType: (type) =>
        get().notifications.filter((n) => n.type === type),
    })),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);

// Selectors
export const selectNotifications = (state: NotificationState) =>
  state.notifications;
export const selectUnreadCount = (state: NotificationState) => state.unreadCount;
export const selectIsOpen = (state: NotificationState) => state.isOpen;
export const selectPreferences = (state: NotificationState) => state.preferences;
