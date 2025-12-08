// ============================================================
// USE NOTIFICATIONS HOOK TESTS
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications, type Notification } from '../useNotifications';
import { getSocketClient, resetSocketClient } from '../../socket';
import { NOTIFICATION_EVENTS } from '../../events';

// Mock the socket client
vi.mock('../../socket', () => {
  const mockCallbacks = new Map<string, Set<Function>>();

  const mockSocketClient = {
    on: vi.fn((event: string, callback: Function) => {
      if (!mockCallbacks.has(event)) {
        mockCallbacks.set(event, new Set());
      }
      mockCallbacks.get(event)?.add(callback);
    }),
    off: vi.fn((event: string, callback: Function) => {
      mockCallbacks.get(event)?.delete(callback);
    }),
    emit: vi.fn(),
    // Helper to trigger events in tests
    __trigger: (event: string, data: unknown) => {
      mockCallbacks.get(event)?.forEach((cb) => cb(data));
    },
    __clearCallbacks: () => {
      mockCallbacks.clear();
    },
  };

  return {
    getSocketClient: vi.fn(() => mockSocketClient),
    resetSocketClient: vi.fn(),
  };
});

describe('useNotifications', () => {
  let mockSocket: ReturnType<typeof getSocketClient> & {
    __trigger: (event: string, data: unknown) => void;
    __clearCallbacks: () => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = getSocketClient() as typeof mockSocket;
    mockSocket.__clearCallbacks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // ============================================
  // Initial State Tests
  // ============================================
  describe('initial state', () => {
    it('returns empty notifications array', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.notifications).toEqual([]);
    });

    it('returns zero unread count', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.unreadCount).toBe(0);
    });

    it('returns hasUnread as false', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.hasUnread).toBe(false);
    });
  });

  // ============================================
  // Socket Subscription Tests
  // ============================================
  describe('socket subscriptions', () => {
    it('subscribes to notification events when enabled', () => {
      renderHook(() => useNotifications({ enabled: true }));

      expect(mockSocket.on).toHaveBeenCalledWith(
        NOTIFICATION_EVENTS.NEW,
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        NOTIFICATION_EVENTS.READ,
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        NOTIFICATION_EVENTS.READ_ALL,
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        NOTIFICATION_EVENTS.DELETE,
        expect.any(Function)
      );
    });

    it('does not subscribe when disabled', () => {
      renderHook(() => useNotifications({ enabled: false }));

      expect(mockSocket.on).not.toHaveBeenCalled();
    });

    it('unsubscribes on unmount', () => {
      const { unmount } = renderHook(() => useNotifications());

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith(
        NOTIFICATION_EVENTS.NEW,
        expect.any(Function)
      );
    });
  });

  // ============================================
  // Receiving Notifications Tests
  // ============================================
  describe('receiving notifications', () => {
    it('adds new notification when received', () => {
      const { result } = renderHook(() => useNotifications());

      const payload = {
        id: 'notif-1',
        type: 'application',
        title: 'New Application',
        message: 'John Doe applied',
        read: false,
        createdAt: new Date().toISOString(),
        data: {},
      };

      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, payload);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toBe('notif-1');
      expect(result.current.notifications[0].title).toBe('New Application');
    });

    it('updates unread count when receiving unread notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test',
          message: 'Test message',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      expect(result.current.unreadCount).toBe(1);
      expect(result.current.hasUnread).toBe(true);
    });

    it('calls onNewNotification callback', () => {
      const onNewNotification = vi.fn();
      renderHook(() => useNotifications({ onNewNotification }));

      const payload = {
        id: 'notif-1',
        type: 'application',
        title: 'Test',
        message: 'Test message',
        read: false,
        createdAt: new Date().toISOString(),
        data: {},
      };

      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, payload);
      });

      expect(onNewNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'notif-1',
          title: 'Test',
        })
      );
    });

    it('respects maxNotifications limit', () => {
      const { result } = renderHook(() =>
        useNotifications({ maxNotifications: 3 })
      );

      // Add 5 notifications
      for (let i = 1; i <= 5; i++) {
        act(() => {
          mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
            id: `notif-${i}`,
            type: 'application',
            title: `Notification ${i}`,
            message: 'Test',
            read: false,
            createdAt: new Date().toISOString(),
            data: {},
          });
        });
      }

      // Should only keep the most recent 3
      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.notifications[0].id).toBe('notif-5');
      expect(result.current.notifications[2].id).toBe('notif-3');
    });
  });

  // ============================================
  // Mark as Read Tests
  // ============================================
  describe('markAsRead', () => {
    it('marks notification as read locally', () => {
      const { result } = renderHook(() => useNotifications());

      // Add unread notification
      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      expect(result.current.notifications[0].read).toBe(false);

      // Mark as read
      act(() => {
        result.current.markAsRead('notif-1');
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it('emits read event to server', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      act(() => {
        result.current.markAsRead('notif-1');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        NOTIFICATION_EVENTS.READ,
        { id: 'notif-1' }
      );
    });
  });

  // ============================================
  // Mark All as Read Tests
  // ============================================
  describe('markAllAsRead', () => {
    it('marks all notifications as read', () => {
      const { result } = renderHook(() => useNotifications());

      // Add multiple unread notifications
      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test 1',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-2',
          type: 'application',
          title: 'Test 2',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      expect(result.current.unreadCount).toBe(2);

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
      result.current.notifications.forEach((n) => {
        expect(n.read).toBe(true);
      });
    });

    it('emits read all event to server', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markAllAsRead();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(NOTIFICATION_EVENTS.READ_ALL);
    });
  });

  // ============================================
  // Delete Notification Tests
  // ============================================
  describe('deleteNotification', () => {
    it('removes notification from list', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        result.current.deleteNotification('notif-1');
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('emits delete event to server', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      act(() => {
        result.current.deleteNotification('notif-1');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        NOTIFICATION_EVENTS.DELETE,
        { id: 'notif-1' }
      );
    });
  });

  // ============================================
  // Clear All Tests
  // ============================================
  describe('clearAll', () => {
    it('removes all notifications locally', () => {
      const { result } = renderHook(() => useNotifications());

      // Add notifications
      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test 1',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-2',
          type: 'application',
          title: 'Test 2',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      expect(result.current.notifications).toHaveLength(2);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  // ============================================
  // Add Notification Tests
  // ============================================
  describe('addNotification', () => {
    it('adds local notification with generated id', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({
          type: 'system',
          title: 'Local Notification',
          message: 'This is a local notification',
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toMatch(/^local-/);
      expect(result.current.notifications[0].title).toBe('Local Notification');
      expect(result.current.notifications[0].read).toBe(false);
    });

    it('creates notification with current timestamp', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.addNotification({
          type: 'system',
          title: 'Test',
          message: 'Test',
        });
      });

      expect(result.current.notifications[0].createdAt.getTime()).toBe(now);

      vi.useRealTimers();
    });
  });

  // ============================================
  // Server Event Handling Tests
  // ============================================
  describe('server event handling', () => {
    it('handles READ event from server', () => {
      const { result } = renderHook(() => useNotifications());

      // Add notification
      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      // Server marks it as read
      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.READ, { id: 'notif-1' });
      });

      expect(result.current.notifications[0].read).toBe(true);
    });

    it('handles READ_ALL event from server', () => {
      const { result } = renderHook(() => useNotifications());

      // Add notifications
      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test 1',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-2',
          type: 'application',
          title: 'Test 2',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      // Server marks all as read
      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.READ_ALL, {});
      });

      expect(result.current.notifications.every((n) => n.read)).toBe(true);
    });

    it('handles DELETE event from server', () => {
      const { result } = renderHook(() => useNotifications());

      // Add notification
      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.NEW, {
          id: 'notif-1',
          type: 'application',
          title: 'Test',
          message: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        });
      });

      // Server deletes it
      act(() => {
        mockSocket.__trigger(NOTIFICATION_EVENTS.DELETE, { id: 'notif-1' });
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });
});
