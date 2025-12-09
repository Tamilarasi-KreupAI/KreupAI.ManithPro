import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotificationStore, Notification, NotificationType, NotificationPriority } from '../notificationStore';
import { act } from '@testing-library/react';

// Helper to reset store between tests
const resetStore = () => {
  act(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      filters: {},
      preferences: {
        email: {
          enabled: true,
          frequency: 'instant',
          types: ['application', 'interview', 'message', 'system'],
        },
        push: {
          enabled: true,
          types: ['application', 'interview', 'message'],
        },
        inApp: {
          enabled: true,
          sound: true,
          types: ['application', 'interview', 'message', 'system', 'reminder', 'alert', 'mention'],
        },
      },
      isOpen: false,
      isLoading: false,
      page: 1,
      pageSize: 20,
      hasMore: true,
    });
  });
};

// Mock notification factory
const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: `notif-${Math.random().toString(36).slice(2)}`,
  type: 'application',
  priority: 'medium',
  title: 'New Application',
  message: 'You have a new application for Software Engineer',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('notificationStore', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useNotificationStore.getState();

      expect(state.notifications).toEqual([]);
      expect(state.unreadCount).toBe(0);
      expect(state.filters).toEqual({});
      expect(state.isOpen).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.page).toBe(1);
      expect(state.pageSize).toBe(20);
      expect(state.hasMore).toBe(true);
    });

    it('should have default preferences', () => {
      const { preferences } = useNotificationStore.getState();

      expect(preferences.email.enabled).toBe(true);
      expect(preferences.push.enabled).toBe(true);
      expect(preferences.inApp.enabled).toBe(true);
      expect(preferences.inApp.sound).toBe(true);
    });
  });

  describe('setNotifications', () => {
    it('should set notifications and update unread count', () => {
      const notifications = [
        createMockNotification({ isRead: false }),
        createMockNotification({ isRead: true }),
        createMockNotification({ isRead: false }),
      ];

      act(() => {
        useNotificationStore.getState().setNotifications(notifications);
      });

      const state = useNotificationStore.getState();
      expect(state.notifications).toEqual(notifications);
      expect(state.unreadCount).toBe(2);
    });
  });

  describe('addNotification', () => {
    it('should add notification to beginning of list', () => {
      const existing = createMockNotification({ id: 'notif-1' });
      const newNotif = createMockNotification({ id: 'notif-2' });

      act(() => {
        useNotificationStore.getState().setNotifications([existing]);
        useNotificationStore.getState().addNotification(newNotif);
      });

      const state = useNotificationStore.getState();
      expect(state.notifications.length).toBe(2);
      expect(state.notifications[0].id).toBe('notif-2');
    });

    it('should increment unread count for unread notification', () => {
      act(() => {
        useNotificationStore.getState().addNotification(
          createMockNotification({ isRead: false })
        );
      });

      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it('should not increment unread count for already read notification', () => {
      act(() => {
        useNotificationStore.getState().addNotification(
          createMockNotification({ isRead: true })
        );
      });

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe('removeNotification', () => {
    it('should remove notification by id', () => {
      const notif1 = createMockNotification({ id: 'notif-1' });
      const notif2 = createMockNotification({ id: 'notif-2' });

      act(() => {
        useNotificationStore.getState().setNotifications([notif1, notif2]);
        useNotificationStore.getState().removeNotification('notif-1');
      });

      const state = useNotificationStore.getState();
      expect(state.notifications.length).toBe(1);
      expect(state.notifications[0].id).toBe('notif-2');
    });

    it('should decrement unread count if removed notification was unread', () => {
      const unreadNotif = createMockNotification({ id: 'notif-1', isRead: false });

      act(() => {
        useNotificationStore.getState().setNotifications([unreadNotif]);
        useNotificationStore.getState().removeNotification('notif-1');
      });

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should not decrement unread count if removed notification was read', () => {
      const readNotif = createMockNotification({ id: 'notif-1', isRead: true });
      const unreadNotif = createMockNotification({ id: 'notif-2', isRead: false });

      act(() => {
        useNotificationStore.getState().setNotifications([readNotif, unreadNotif]);
        useNotificationStore.getState().removeNotification('notif-1');
      });

      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });
  });

  describe('appendNotifications', () => {
    it('should append notifications to end of list', () => {
      const existing = createMockNotification({ id: 'notif-1' });
      const newNotifications = [
        createMockNotification({ id: 'notif-2' }),
        createMockNotification({ id: 'notif-3' }),
      ];

      act(() => {
        useNotificationStore.getState().setNotifications([existing]);
        useNotificationStore.getState().appendNotifications(newNotifications);
      });

      const state = useNotificationStore.getState();
      expect(state.notifications.length).toBe(3);
      expect(state.notifications[0].id).toBe('notif-1');
      expect(state.notifications[2].id).toBe('notif-3');
    });

    it('should update unread count and increment page', () => {
      const unreadNotifs = [
        createMockNotification({ isRead: false }),
        createMockNotification({ isRead: true }),
      ];

      act(() => {
        useNotificationStore.getState().appendNotifications(unreadNotifs);
      });

      const state = useNotificationStore.getState();
      expect(state.unreadCount).toBe(1);
      expect(state.page).toBe(2);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notif = createMockNotification({ id: 'notif-1', isRead: false });

      act(() => {
        useNotificationStore.getState().setNotifications([notif]);
        useNotificationStore.getState().markAsRead('notif-1');
      });

      const state = useNotificationStore.getState();
      expect(state.notifications[0].isRead).toBe(true);
      expect(state.notifications[0].readAt).toBeDefined();
    });

    it('should decrement unread count', () => {
      const notif = createMockNotification({ id: 'notif-1', isRead: false });

      act(() => {
        useNotificationStore.getState().setNotifications([notif]);
        useNotificationStore.getState().markAsRead('notif-1');
      });

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should not decrement if already read', () => {
      const notif = createMockNotification({ id: 'notif-1', isRead: true });

      act(() => {
        useNotificationStore.getState().setNotifications([notif]);
        useNotificationStore.setState({ unreadCount: 1 });
        useNotificationStore.getState().markAsRead('notif-1');
      });

      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const notifications = [
        createMockNotification({ id: 'notif-1', isRead: false }),
        createMockNotification({ id: 'notif-2', isRead: false }),
        createMockNotification({ id: 'notif-3', isRead: true }),
      ];

      act(() => {
        useNotificationStore.getState().setNotifications(notifications);
        useNotificationStore.getState().markAllAsRead();
      });

      const state = useNotificationStore.getState();
      expect(state.notifications.every(n => n.isRead)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it('should set readAt for previously unread notifications', () => {
      const notif = createMockNotification({ isRead: false });

      act(() => {
        useNotificationStore.getState().setNotifications([notif]);
        useNotificationStore.getState().markAllAsRead();
      });

      expect(useNotificationStore.getState().notifications[0].readAt).toBeDefined();
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark specified notifications as read', () => {
      const notifications = [
        createMockNotification({ id: 'notif-1', isRead: false }),
        createMockNotification({ id: 'notif-2', isRead: false }),
        createMockNotification({ id: 'notif-3', isRead: false }),
      ];

      act(() => {
        useNotificationStore.getState().setNotifications(notifications);
        useNotificationStore.getState().markMultipleAsRead(['notif-1', 'notif-3']);
      });

      const state = useNotificationStore.getState();
      expect(state.notifications.find(n => n.id === 'notif-1')?.isRead).toBe(true);
      expect(state.notifications.find(n => n.id === 'notif-2')?.isRead).toBe(false);
      expect(state.notifications.find(n => n.id === 'notif-3')?.isRead).toBe(true);
      expect(state.unreadCount).toBe(1);
    });
  });

  describe('filter actions', () => {
    it('setFilters should merge with existing filters', () => {
      act(() => {
        useNotificationStore.getState().setFilters({ type: ['application'] });
        useNotificationStore.getState().setFilters({ isRead: false });
      });

      const filters = useNotificationStore.getState().filters;
      expect(filters.type).toEqual(['application']);
      expect(filters.isRead).toBe(false);
    });

    it('clearFilters should reset filters', () => {
      act(() => {
        useNotificationStore.getState().setFilters({ type: ['application'], isRead: false });
        useNotificationStore.getState().clearFilters();
      });

      expect(useNotificationStore.getState().filters).toEqual({});
    });
  });

  describe('updatePreferences', () => {
    it('should update email preferences', () => {
      act(() => {
        useNotificationStore.getState().updatePreferences({
          email: { enabled: false, frequency: 'daily', types: ['system'] },
        });
      });

      const { preferences } = useNotificationStore.getState();
      expect(preferences.email.enabled).toBe(false);
      expect(preferences.email.frequency).toBe('daily');
    });

    it('should update push preferences', () => {
      act(() => {
        useNotificationStore.getState().updatePreferences({
          push: { enabled: false, types: [] },
        });
      });

      expect(useNotificationStore.getState().preferences.push.enabled).toBe(false);
    });

    it('should update inApp preferences', () => {
      act(() => {
        useNotificationStore.getState().updatePreferences({
          inApp: { sound: false, enabled: true, types: ['alert'] },
        });
      });

      expect(useNotificationStore.getState().preferences.inApp.sound).toBe(false);
    });
  });

  describe('UI actions', () => {
    it('setOpen should set open state', () => {
      act(() => {
        useNotificationStore.getState().setOpen(true);
      });

      expect(useNotificationStore.getState().isOpen).toBe(true);
    });

    it('toggle should toggle open state', () => {
      expect(useNotificationStore.getState().isOpen).toBe(false);

      act(() => {
        useNotificationStore.getState().toggle();
      });

      expect(useNotificationStore.getState().isOpen).toBe(true);

      act(() => {
        useNotificationStore.getState().toggle();
      });

      expect(useNotificationStore.getState().isOpen).toBe(false);
    });

    it('setLoading should set loading state', () => {
      act(() => {
        useNotificationStore.getState().setLoading(true);
      });

      expect(useNotificationStore.getState().isLoading).toBe(true);
    });
  });

  describe('pagination actions', () => {
    it('loadMore should increment page', () => {
      act(() => {
        useNotificationStore.getState().loadMore();
      });

      expect(useNotificationStore.getState().page).toBe(2);
    });

    it('setHasMore should update hasMore', () => {
      act(() => {
        useNotificationStore.getState().setHasMore(false);
      });

      expect(useNotificationStore.getState().hasMore).toBe(false);
    });

    it('resetPagination should reset page and hasMore', () => {
      act(() => {
        useNotificationStore.getState().loadMore();
        useNotificationStore.getState().loadMore();
        useNotificationStore.getState().setHasMore(false);
        useNotificationStore.getState().resetPagination();
      });

      const state = useNotificationStore.getState();
      expect(state.page).toBe(1);
      expect(state.hasMore).toBe(true);
    });
  });

  describe('getters', () => {
    const notifications = [
      createMockNotification({ id: 'notif-1', type: 'application', isRead: false }),
      createMockNotification({ id: 'notif-2', type: 'interview', isRead: true }),
      createMockNotification({ id: 'notif-3', type: 'application', isRead: false }),
    ];

    beforeEach(() => {
      act(() => {
        useNotificationStore.getState().setNotifications(notifications);
      });
    });

    it('getUnreadNotifications should return only unread', () => {
      const unread = useNotificationStore.getState().getUnreadNotifications();

      expect(unread.length).toBe(2);
      expect(unread.every(n => !n.isRead)).toBe(true);
    });

    it('getNotificationsByType should filter by type', () => {
      const applicationNotifs = useNotificationStore.getState().getNotificationsByType('application');

      expect(applicationNotifs.length).toBe(2);
      expect(applicationNotifs.every(n => n.type === 'application')).toBe(true);
    });
  });

  describe('getFilteredNotifications', () => {
    const notifications = [
      createMockNotification({
        id: 'notif-1',
        type: 'application',
        priority: 'high',
        isRead: false,
        createdAt: '2024-12-05T00:00:00Z',
      }),
      createMockNotification({
        id: 'notif-2',
        type: 'interview',
        priority: 'medium',
        isRead: true,
        createdAt: '2024-12-01T00:00:00Z',
      }),
      createMockNotification({
        id: 'notif-3',
        type: 'application',
        priority: 'low',
        isRead: false,
        createdAt: '2024-12-03T00:00:00Z',
      }),
    ];

    beforeEach(() => {
      act(() => {
        useNotificationStore.getState().setNotifications(notifications);
      });
    });

    it('should filter by type', () => {
      act(() => {
        useNotificationStore.getState().setFilters({ type: ['application'] });
      });

      const filtered = useNotificationStore.getState().getFilteredNotifications();
      expect(filtered.length).toBe(2);
      expect(filtered.every(n => n.type === 'application')).toBe(true);
    });

    it('should filter by isRead', () => {
      act(() => {
        useNotificationStore.getState().setFilters({ isRead: false });
      });

      const filtered = useNotificationStore.getState().getFilteredNotifications();
      expect(filtered.length).toBe(2);
      expect(filtered.every(n => !n.isRead)).toBe(true);
    });

    it('should filter by priority', () => {
      act(() => {
        useNotificationStore.getState().setFilters({ priority: ['high', 'medium'] });
      });

      const filtered = useNotificationStore.getState().getFilteredNotifications();
      expect(filtered.length).toBe(2);
    });

    it('should filter by date range', () => {
      act(() => {
        useNotificationStore.getState().setFilters({
          dateRange: { start: '2024-12-02', end: '2024-12-06' },
        });
      });

      const filtered = useNotificationStore.getState().getFilteredNotifications();
      expect(filtered.length).toBe(2);
    });

    it('should combine multiple filters', () => {
      act(() => {
        useNotificationStore.getState().setFilters({
          type: ['application'],
          isRead: false,
        });
      });

      const filtered = useNotificationStore.getState().getFilteredNotifications();
      expect(filtered.length).toBe(2);
    });
  });

  describe('selectors', () => {
    it('selectNotifications should return notifications', () => {
      const notifs = [createMockNotification()];

      act(() => {
        useNotificationStore.getState().setNotifications(notifs);
      });

      const { selectNotifications } = require('../notificationStore');
      expect(selectNotifications(useNotificationStore.getState())).toEqual(notifs);
    });

    it('selectUnreadCount should return unread count', () => {
      act(() => {
        useNotificationStore.getState().setNotifications([
          createMockNotification({ isRead: false }),
          createMockNotification({ isRead: false }),
        ]);
      });

      const { selectUnreadCount } = require('../notificationStore');
      expect(selectUnreadCount(useNotificationStore.getState())).toBe(2);
    });

    it('selectIsOpen should return open state', () => {
      act(() => {
        useNotificationStore.getState().setOpen(true);
      });

      const { selectIsOpen } = require('../notificationStore');
      expect(selectIsOpen(useNotificationStore.getState())).toBe(true);
    });

    it('selectPreferences should return preferences', () => {
      const { selectPreferences } = require('../notificationStore');
      const prefs = selectPreferences(useNotificationStore.getState());

      expect(prefs.email).toBeDefined();
      expect(prefs.push).toBeDefined();
      expect(prefs.inApp).toBeDefined();
    });
  });
});
