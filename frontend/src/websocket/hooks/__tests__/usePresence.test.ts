import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePresence, useUserPresence, type PresenceStatus } from '../usePresence';

// Mock the socket client
const mockSocketClient = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isConnected: vi.fn(() => true),
};

const eventHandlers: Record<string, Function[]> = {};

vi.mock('../../socket', () => ({
  getSocketClient: () => mockSocketClient,
}));

vi.mock('../../events', () => ({
  PRESENCE_EVENTS: {
    USER_ONLINE: 'presence:user_online',
    USER_OFFLINE: 'presence:user_offline',
    STATUS_CHANGED: 'presence:status_changed',
    ONLINE_USERS_LIST: 'presence:online_users_list',
    GET_ONLINE_USERS: 'presence:get_online_users',
  },
}));

describe('usePresence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Clear event handlers
    Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key]);

    // Mock on to store handlers
    mockSocketClient.on.mockImplementation((event: string, handler: Function) => {
      if (!eventHandlers[event]) {
        eventHandlers[event] = [];
      }
      eventHandlers[event].push(handler);
    });

    // Mock off to remove handlers
    mockSocketClient.off.mockImplementation((event: string, handler: Function) => {
      if (eventHandlers[event]) {
        eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler);
      }
    });

    mockSocketClient.isConnected.mockReturnValue(true);

    // Mock document visibility
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // Helper to trigger event
  const triggerEvent = (event: string, payload: any) => {
    eventHandlers[event]?.forEach((handler) => handler(payload));
  };

  describe('initial state', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => usePresence());

      expect(result.current.onlineUsers.size).toBe(0);
      expect(result.current.myStatus).toBe('online');
      expect(result.current.onlineCount).toBe(0);
    });

    it('should request online users list on mount', () => {
      renderHook(() => usePresence());

      expect(mockSocketClient.emit).toHaveBeenCalledWith('presence:get_online_users');
    });

    it('should not request users list when disabled', () => {
      renderHook(() => usePresence({ enabled: false }));

      expect(mockSocketClient.emit).not.toHaveBeenCalledWith('presence:get_online_users');
    });
  });

  describe('event handling', () => {
    it('should add user when USER_ONLINE event received', () => {
      const { result } = renderHook(() => usePresence());

      act(() => {
        triggerEvent('presence:user_online', {
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(result.current.onlineUsers.size).toBe(1);
      expect(result.current.onlineUsers.get('user-1')).toMatchObject({
        userId: 'user-1',
        userName: 'John Doe',
        status: 'online',
      });
    });

    it('should remove user when USER_OFFLINE event received', () => {
      const { result } = renderHook(() => usePresence());

      // Add user first
      act(() => {
        triggerEvent('presence:user_online', {
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(result.current.onlineUsers.size).toBe(1);

      // Remove user
      act(() => {
        triggerEvent('presence:user_offline', {
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(result.current.onlineUsers.size).toBe(0);
    });

    it('should update user status when STATUS_CHANGED event received', () => {
      const { result } = renderHook(() => usePresence());

      // Add user first
      act(() => {
        triggerEvent('presence:user_online', {
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      // Change status
      act(() => {
        triggerEvent('presence:status_changed', {
          userId: 'user-1',
          userName: 'John Doe',
          status: 'busy',
        });
      });

      expect(result.current.onlineUsers.get('user-1')?.status).toBe('busy');
    });

    it('should remove user when status changed to offline', () => {
      const { result } = renderHook(() => usePresence());

      // Add user first
      act(() => {
        triggerEvent('presence:user_online', {
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      // Change status to offline
      act(() => {
        triggerEvent('presence:status_changed', {
          userId: 'user-1',
          userName: 'John Doe',
          status: 'offline',
        });
      });

      expect(result.current.onlineUsers.size).toBe(0);
    });

    it('should populate users from ONLINE_USERS_LIST event', () => {
      const { result } = renderHook(() => usePresence());

      act(() => {
        triggerEvent('presence:online_users_list', [
          { userId: 'user-1', userName: 'John', status: 'online' },
          { userId: 'user-2', userName: 'Jane', status: 'busy' },
          { userId: 'user-3', userName: 'Bob', status: 'away' },
        ]);
      });

      expect(result.current.onlineUsers.size).toBe(3);
      expect(result.current.onlineCount).toBe(3);
    });
  });

  describe('callbacks', () => {
    it('should call onUserOnline callback', () => {
      const onUserOnline = vi.fn();
      renderHook(() => usePresence({ onUserOnline }));

      act(() => {
        triggerEvent('presence:user_online', {
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(onUserOnline).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          userName: 'John Doe',
          status: 'online',
        })
      );
    });

    it('should call onUserOffline callback', () => {
      const onUserOffline = vi.fn();
      renderHook(() => usePresence({ onUserOffline }));

      act(() => {
        triggerEvent('presence:user_offline', {
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(onUserOffline).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          userName: 'John Doe',
          status: 'offline',
        })
      );
    });

    it('should call onStatusChange callback', () => {
      const onStatusChange = vi.fn();
      renderHook(() => usePresence({ onStatusChange }));

      act(() => {
        triggerEvent('presence:status_changed', {
          userId: 'user-1',
          userName: 'John Doe',
          status: 'busy',
        });
      });

      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          userName: 'John Doe',
          status: 'busy',
        })
      );
    });
  });

  describe('setStatus', () => {
    it('should update my status and emit event', () => {
      const { result } = renderHook(() => usePresence());

      act(() => {
        result.current.setStatus('busy');
      });

      expect(result.current.myStatus).toBe('busy');
      expect(mockSocketClient.emit).toHaveBeenCalledWith('presence:status_changed', { status: 'busy' });
    });
  });

  describe('isUserOnline', () => {
    it('should return true for online users', () => {
      const { result } = renderHook(() => usePresence());

      act(() => {
        triggerEvent('presence:user_online', {
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(result.current.isUserOnline('user-1')).toBe(true);
    });

    it('should return true for away users', () => {
      const { result } = renderHook(() => usePresence());

      act(() => {
        triggerEvent('presence:status_changed', {
          userId: 'user-1',
          userName: 'John Doe',
          status: 'away',
        });
      });

      expect(result.current.isUserOnline('user-1')).toBe(true);
    });

    it('should return true for busy users', () => {
      const { result } = renderHook(() => usePresence());

      act(() => {
        triggerEvent('presence:status_changed', {
          userId: 'user-1',
          userName: 'John Doe',
          status: 'busy',
        });
      });

      expect(result.current.isUserOnline('user-1')).toBe(true);
    });

    it('should return false for unknown users', () => {
      const { result } = renderHook(() => usePresence());

      expect(result.current.isUserOnline('unknown-user')).toBe(false);
    });
  });

  describe('getUserPresence', () => {
    it('should return user presence data', () => {
      const { result } = renderHook(() => usePresence());

      act(() => {
        triggerEvent('presence:user_online', {
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      const presence = result.current.getUserPresence('user-1');
      expect(presence).toMatchObject({
        userId: 'user-1',
        userName: 'John Doe',
        status: 'online',
      });
    });

    it('should return undefined for unknown users', () => {
      const { result } = renderHook(() => usePresence());

      expect(result.current.getUserPresence('unknown-user')).toBeUndefined();
    });
  });

  describe('idle detection', () => {
    it('should set status to away after idle timeout', () => {
      const idleTimeout = 5000; // 5 seconds
      const { result } = renderHook(() => usePresence({ idleTimeout }));

      expect(result.current.myStatus).toBe('online');

      act(() => {
        vi.advanceTimersByTime(idleTimeout);
      });

      expect(result.current.myStatus).toBe('away');
      expect(mockSocketClient.emit).toHaveBeenCalledWith('presence:status_changed', { status: 'away' });
    });

    it('should reset idle timer on activity', () => {
      const idleTimeout = 5000;
      const { result } = renderHook(() => usePresence({ idleTimeout }));

      // Advance partway
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.myStatus).toBe('online');

      // Simulate activity
      act(() => {
        window.dispatchEvent(new Event('mousemove'));
      });

      // Advance past original timeout
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Should still be online because timer was reset
      expect(result.current.myStatus).toBe('online');
    });

    it('should return to online when activity detected while away', () => {
      const idleTimeout = 5000;
      const { result } = renderHook(() => usePresence({ idleTimeout }));

      // Go idle
      act(() => {
        vi.advanceTimersByTime(idleTimeout);
      });

      expect(result.current.myStatus).toBe('away');

      // Simulate activity
      act(() => {
        window.dispatchEvent(new Event('keydown'));
      });

      expect(result.current.myStatus).toBe('online');
      expect(mockSocketClient.emit).toHaveBeenCalledWith('presence:status_changed', { status: 'online' });
    });
  });

  describe('heartbeat', () => {
    it('should send heartbeat at interval', () => {
      const heartbeatInterval = 10000; // 10 seconds
      renderHook(() => usePresence({ heartbeatInterval }));

      // Clear initial calls
      mockSocketClient.emit.mockClear();

      act(() => {
        vi.advanceTimersByTime(heartbeatInterval);
      });

      expect(mockSocketClient.emit).toHaveBeenCalledWith('presence:status_changed', { status: 'online' });

      mockSocketClient.emit.mockClear();

      act(() => {
        vi.advanceTimersByTime(heartbeatInterval);
      });

      expect(mockSocketClient.emit).toHaveBeenCalledWith('presence:status_changed', { status: 'online' });
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from events on unmount', () => {
      const { unmount } = renderHook(() => usePresence());

      unmount();

      expect(mockSocketClient.off).toHaveBeenCalledWith('presence:user_online', expect.any(Function));
      expect(mockSocketClient.off).toHaveBeenCalledWith('presence:user_offline', expect.any(Function));
      expect(mockSocketClient.off).toHaveBeenCalledWith('presence:status_changed', expect.any(Function));
      expect(mockSocketClient.off).toHaveBeenCalledWith('presence:online_users_list', expect.any(Function));
    });
  });
});

describe('useUserPresence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Clear event handlers
    Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key]);

    mockSocketClient.on.mockImplementation((event: string, handler: Function) => {
      if (!eventHandlers[event]) {
        eventHandlers[event] = [];
      }
      eventHandlers[event].push(handler);
    });

    mockSocketClient.isConnected.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const triggerEvent = (event: string, payload: any) => {
    eventHandlers[event]?.forEach((handler) => handler(payload));
  };

  it('should return null for null userId', () => {
    const { result } = renderHook(() => useUserPresence(null));

    expect(result.current).toBeNull();
  });

  it('should return null for unknown userId', () => {
    const { result } = renderHook(() => useUserPresence('unknown-user'));

    expect(result.current).toBeNull();
  });

  it('should return presence for known user', () => {
    const { result } = renderHook(() => useUserPresence('user-1'));

    act(() => {
      triggerEvent('presence:user_online', {
        userId: 'user-1',
        userName: 'John Doe',
      });
    });

    expect(result.current).toMatchObject({
      userId: 'user-1',
      userName: 'John Doe',
      status: 'online',
    });
  });
});
