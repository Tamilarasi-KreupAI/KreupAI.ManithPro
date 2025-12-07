// ============================================================
// USE NOTIFICATIONS HOOK - Real-time notifications
// ============================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getSocketClient } from '../socket';
import { NOTIFICATION_EVENTS, type NotificationPayload } from '../events';

// ============================================
// Types
// ============================================
export type NotificationType =
  | 'application'
  | 'interview'
  | 'message'
  | 'job'
  | 'mention'
  | 'reminder'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: Date;
  read: boolean;
  href?: string;
}

export interface UseNotificationsOptions {
  enabled?: boolean;
  maxNotifications?: number;
  onNewNotification?: (notification: Notification) => void;
  showBrowserNotification?: boolean;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  hasUnread: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

// ============================================
// Browser Notification Helper
// ============================================
const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

const showBrowserNotification = (notification: Notification): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const browserNotification = new Notification(notification.title, {
    body: notification.message,
    icon: '/favicon.ico',
    tag: notification.id,
    requireInteraction: false,
  });

  browserNotification.onclick = () => {
    window.focus();
    if (notification.href) {
      window.location.href = notification.href;
    }
    browserNotification.close();
  };

  // Auto-close after 5 seconds
  setTimeout(() => {
    browserNotification.close();
  }, 5000);
};

// ============================================
// Hook Implementation
// ============================================
export const useNotifications = (
  options: UseNotificationsOptions = {}
): UseNotificationsReturn => {
  const {
    enabled = true,
    maxNotifications = 50,
    onNewNotification,
    showBrowserNotification: showBrowser = true,
  } = options;

  const socketClient = useMemo(() => getSocketClient(), []);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const callbackRef = useRef(onNewNotification);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onNewNotification;
  }, [onNewNotification]);

  // Request browser notification permission
  useEffect(() => {
    if (enabled && showBrowser) {
      requestNotificationPermission();
    }
  }, [enabled, showBrowser]);

  // Process incoming notification payload
  const processNotification = useCallback((payload: NotificationPayload): Notification => {
    return {
      id: payload.id,
      type: payload.type as NotificationType,
      title: payload.title,
      message: payload.message,
      data: payload.data,
      createdAt: new Date(payload.createdAt),
      read: payload.read,
      href: payload.data?.href as string | undefined,
    };
  }, []);

  // Listen for notification events
  useEffect(() => {
    if (!enabled) return;

    const handleNewNotification = (payload: NotificationPayload) => {
      const notification = processNotification(payload);

      setNotifications((prev) => {
        // Add to beginning of array
        const updated = [notification, ...prev];
        // Keep only the max number of notifications
        return updated.slice(0, maxNotifications);
      });

      // Trigger callback
      callbackRef.current?.(notification);

      // Show browser notification if enabled and tab is not focused
      if (showBrowser && document.hidden) {
        showBrowserNotification(notification);
      }
    };

    const handleNotificationRead = (data: { id: string }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.id ? { ...n, read: true } : n
        )
      );
    };

    const handleAllRead = () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    };

    const handleNotificationDeleted = (data: { id: string }) => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== data.id)
      );
    };

    const handleCountUpdate = (data: { count: number }) => {
      // Could sync with server-provided count if needed
      console.log('Notification count update:', data.count);
    };

    socketClient.on(NOTIFICATION_EVENTS.NEW, handleNewNotification);
    socketClient.on(NOTIFICATION_EVENTS.READ, handleNotificationRead);
    socketClient.on(NOTIFICATION_EVENTS.READ_ALL, handleAllRead);
    socketClient.on(NOTIFICATION_EVENTS.DELETE, handleNotificationDeleted);
    socketClient.on(NOTIFICATION_EVENTS.COUNT_UPDATE, handleCountUpdate);

    return () => {
      socketClient.off(NOTIFICATION_EVENTS.NEW, handleNewNotification);
      socketClient.off(NOTIFICATION_EVENTS.READ, handleNotificationRead);
      socketClient.off(NOTIFICATION_EVENTS.READ_ALL, handleAllRead);
      socketClient.off(NOTIFICATION_EVENTS.DELETE, handleNotificationDeleted);
      socketClient.off(NOTIFICATION_EVENTS.COUNT_UPDATE, handleCountUpdate);
    };
  }, [enabled, maxNotifications, processNotification, showBrowser, socketClient]);

  // Methods
  const markAsRead = useCallback((notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );

    // Emit to server
    socketClient.emit(NOTIFICATION_EVENTS.READ, { id: notificationId });
  }, [socketClient]);

  const markAllAsRead = useCallback(() => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );

    // Emit to server
    socketClient.emit(NOTIFICATION_EVENTS.READ_ALL);
  }, [socketClient]);

  const deleteNotification = useCallback((notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );

    // Emit to server
    socketClient.emit(NOTIFICATION_EVENTS.DELETE, { id: notificationId });
  }, [socketClient]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `local-${Date.now()}`,
      createdAt: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, maxNotifications));

    if (showBrowser && document.hidden) {
      showBrowserNotification(newNotification);
    }
  }, [maxNotifications, showBrowser]);

  // Computed values
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const hasUnread = unreadCount > 0;

  return {
    notifications,
    unreadCount,
    hasUnread,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  };
};

// ============================================
// Use Notification Sound Hook
// ============================================
export interface UseNotificationSoundOptions {
  enabled?: boolean;
  soundUrl?: string;
  volume?: number;
}

export const useNotificationSound = (
  options: UseNotificationSoundOptions = {}
): { play: () => void } => {
  const {
    enabled = true,
    soundUrl = '/sounds/notification.mp3',
    volume = 0.5,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enabled && typeof Audio !== 'undefined') {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.volume = volume;
    }

    return () => {
      audioRef.current = null;
    };
  }, [enabled, soundUrl, volume]);

  const play = useCallback(() => {
    if (enabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [enabled]);

  return { play };
};

export default useNotifications;
