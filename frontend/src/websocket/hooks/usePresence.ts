// ============================================================
// USE PRESENCE HOOK - User presence and online status
// ============================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getSocketClient } from '../socket';
import { PRESENCE_EVENTS, type PresencePayload } from '../events';

// ============================================
// Types
// ============================================
export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

export interface UserPresence {
  userId: string;
  userName: string;
  status: PresenceStatus;
  lastSeen?: Date;
}

export interface UsePresenceOptions {
  enabled?: boolean;
  idleTimeout?: number; // ms before marking as away
  heartbeatInterval?: number; // ms between heartbeats
  onUserOnline?: (user: UserPresence) => void;
  onUserOffline?: (user: UserPresence) => void;
  onStatusChange?: (user: UserPresence) => void;
}

export interface UsePresenceReturn {
  onlineUsers: Map<string, UserPresence>;
  myStatus: PresenceStatus;
  setStatus: (status: PresenceStatus) => void;
  isUserOnline: (userId: string) => boolean;
  getUserPresence: (userId: string) => UserPresence | undefined;
  onlineCount: number;
}

// ============================================
// Hook Implementation
// ============================================
export const usePresence = (options: UsePresenceOptions = {}): UsePresenceReturn => {
  const {
    enabled = true,
    idleTimeout = 5 * 60 * 1000, // 5 minutes
    heartbeatInterval = 30 * 1000, // 30 seconds
    onUserOnline,
    onUserOffline,
    onStatusChange,
  } = options;

  const socketClient = useMemo(() => getSocketClient(), []);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());
  const [myStatus, setMyStatus] = useState<PresenceStatus>('online');

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callbacksRef = useRef({ onUserOnline, onUserOffline, onStatusChange });

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onUserOnline, onUserOffline, onStatusChange };
  }, [onUserOnline, onUserOffline, onStatusChange]);

  // Handle user activity for idle detection
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // If we were away, come back online
    if (myStatus === 'away') {
      setMyStatus('online');
      socketClient.emit(PRESENCE_EVENTS.STATUS_CHANGED, { status: 'online' });
    }

    // Set idle timer
    idleTimerRef.current = setTimeout(() => {
      setMyStatus('away');
      socketClient.emit(PRESENCE_EVENTS.STATUS_CHANGED, { status: 'away' });
    }, idleTimeout);
  }, [idleTimeout, myStatus, socketClient]);

  // Set up activity listeners
  useEffect(() => {
    if (!enabled) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Initial idle timer
    resetIdleTimer();

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [enabled, resetIdleTimer]);

  // Handle visibility change
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, mark as away
        setMyStatus('away');
        socketClient.emit(PRESENCE_EVENTS.STATUS_CHANGED, { status: 'away' });
      } else {
        // Tab is visible, mark as online
        setMyStatus('online');
        socketClient.emit(PRESENCE_EVENTS.STATUS_CHANGED, { status: 'online' });
        resetIdleTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, socketClient, resetIdleTimer]);

  // Set up heartbeat
  useEffect(() => {
    if (!enabled) return;

    heartbeatTimerRef.current = setInterval(() => {
      socketClient.emit(PRESENCE_EVENTS.STATUS_CHANGED, { status: myStatus });
    }, heartbeatInterval);

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };
  }, [enabled, heartbeatInterval, myStatus, socketClient]);

  // Listen for presence events
  useEffect(() => {
    if (!enabled) return;

    const handleUserOnline = (payload: PresencePayload) => {
      const user: UserPresence = {
        userId: payload.userId,
        userName: payload.userName,
        status: 'online',
        lastSeen: new Date(),
      };

      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(payload.userId, user);
        return newMap;
      });

      callbacksRef.current.onUserOnline?.(user);
    };

    const handleUserOffline = (payload: PresencePayload) => {
      const user: UserPresence = {
        userId: payload.userId,
        userName: payload.userName,
        status: 'offline',
        lastSeen: payload.lastSeen ? new Date(payload.lastSeen) : new Date(),
      };

      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(payload.userId);
        return newMap;
      });

      callbacksRef.current.onUserOffline?.(user);
    };

    const handleStatusChange = (payload: PresencePayload) => {
      const user: UserPresence = {
        userId: payload.userId,
        userName: payload.userName,
        status: payload.status,
        lastSeen: new Date(),
      };

      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        if (payload.status === 'offline') {
          newMap.delete(payload.userId);
        } else {
          newMap.set(payload.userId, user);
        }
        return newMap;
      });

      callbacksRef.current.onStatusChange?.(user);
    };

    const handleOnlineUsersList = (users: PresencePayload[]) => {
      const newMap = new Map<string, UserPresence>();
      users.forEach((payload) => {
        newMap.set(payload.userId, {
          userId: payload.userId,
          userName: payload.userName,
          status: payload.status,
          lastSeen: payload.lastSeen ? new Date(payload.lastSeen) : undefined,
        });
      });
      setOnlineUsers(newMap);
    };

    socketClient.on(PRESENCE_EVENTS.USER_ONLINE, handleUserOnline);
    socketClient.on(PRESENCE_EVENTS.USER_OFFLINE, handleUserOffline);
    socketClient.on(PRESENCE_EVENTS.STATUS_CHANGED, handleStatusChange);
    socketClient.on(PRESENCE_EVENTS.ONLINE_USERS_LIST, handleOnlineUsersList);

    // Request initial online users list
    if (socketClient.isConnected()) {
      socketClient.emit(PRESENCE_EVENTS.GET_ONLINE_USERS);
    }

    return () => {
      socketClient.off(PRESENCE_EVENTS.USER_ONLINE, handleUserOnline);
      socketClient.off(PRESENCE_EVENTS.USER_OFFLINE, handleUserOffline);
      socketClient.off(PRESENCE_EVENTS.STATUS_CHANGED, handleStatusChange);
      socketClient.off(PRESENCE_EVENTS.ONLINE_USERS_LIST, handleOnlineUsersList);
    };
  }, [enabled, socketClient]);

  // Methods
  const setStatus = useCallback((status: PresenceStatus) => {
    setMyStatus(status);
    socketClient.emit(PRESENCE_EVENTS.STATUS_CHANGED, { status });
  }, [socketClient]);

  const isUserOnline = useCallback((userId: string) => {
    const user = onlineUsers.get(userId);
    return user?.status === 'online' || user?.status === 'away' || user?.status === 'busy';
  }, [onlineUsers]);

  const getUserPresence = useCallback((userId: string) => {
    return onlineUsers.get(userId);
  }, [onlineUsers]);

  return {
    onlineUsers,
    myStatus,
    setStatus,
    isUserOnline,
    getUserPresence,
    onlineCount: onlineUsers.size,
  };
};

// ============================================
// Use User Presence Hook (for specific user)
// ============================================
export const useUserPresence = (userId: string | null): UserPresence | null => {
  const { getUserPresence, onlineUsers } = usePresence();

  if (!userId) return null;
  return getUserPresence(userId) || null;
};

export default usePresence;
