// ============================================================
// USE TYPING HOOK - Real-time typing indicators
// ============================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getSocketClient } from '../socket';
import { MESSAGE_EVENTS, type TypingPayload } from '../events';

// ============================================
// Types
// ============================================
export interface TypingUser {
  userId: string;
  userName: string;
  startedAt: Date;
}

export interface UseTypingOptions {
  conversationId: string | null;
  enabled?: boolean;
  debounceMs?: number;
  timeoutMs?: number;
}

export interface UseTypingReturn {
  typingUsers: TypingUser[];
  isTyping: boolean;
  startTyping: () => void;
  stopTyping: () => void;
  formatTypingText: () => string;
}

// ============================================
// Hook Implementation
// ============================================
export const useTyping = (options: UseTypingOptions): UseTypingReturn => {
  const {
    conversationId,
    enabled = true,
    debounceMs = 300,
    timeoutMs = 3000,
  } = options;

  const socketClient = useMemo(() => getSocketClient(), []);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
      }
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Listen for typing events
  useEffect(() => {
    if (!enabled || !conversationId) return;

    const handleTypingStart = (payload: TypingPayload) => {
      if (payload.conversationId !== conversationId) return;

      // Clear existing timeout for this user
      const existingTimeout = typingTimeoutsRef.current.get(payload.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Add or update typing user
      setTypingUsers((prev) => {
        const existing = prev.find((u) => u.userId === payload.userId);
        if (existing) {
          return prev.map((u) =>
            u.userId === payload.userId
              ? { ...u, startedAt: new Date() }
              : u
          );
        }
        return [
          ...prev,
          {
            userId: payload.userId,
            userName: payload.userName,
            startedAt: new Date(),
          },
        ];
      });

      // Set timeout to remove typing indicator
      const timeout = setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((u) => u.userId !== payload.userId)
        );
        typingTimeoutsRef.current.delete(payload.userId);
      }, timeoutMs);

      typingTimeoutsRef.current.set(payload.userId, timeout);
    };

    const handleTypingStop = (payload: TypingPayload) => {
      if (payload.conversationId !== conversationId) return;

      // Clear timeout
      const timeout = typingTimeoutsRef.current.get(payload.userId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutsRef.current.delete(payload.userId);
      }

      // Remove from typing users
      setTypingUsers((prev) =>
        prev.filter((u) => u.userId !== payload.userId)
      );
    };

    socketClient.on(MESSAGE_EVENTS.TYPING_START, handleTypingStart);
    socketClient.on(MESSAGE_EVENTS.TYPING_STOP, handleTypingStop);

    return () => {
      socketClient.off(MESSAGE_EVENTS.TYPING_START, handleTypingStart);
      socketClient.off(MESSAGE_EVENTS.TYPING_STOP, handleTypingStop);
    };
  }, [enabled, conversationId, timeoutMs, socketClient]);

  // Clear typing users when conversation changes
  useEffect(() => {
    setTypingUsers([]);
  }, [conversationId]);

  // Start typing (debounced)
  const startTyping = useCallback(() => {
    if (!enabled || !conversationId) return;

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear stop timer
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
    }

    // Debounce the typing event
    debounceTimerRef.current = setTimeout(() => {
      if (!isTyping) {
        setIsTyping(true);
        socketClient.emit(MESSAGE_EVENTS.TYPING_START, { conversationId });
      }

      // Auto-stop after timeout
      stopTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        socketClient.emit(MESSAGE_EVENTS.TYPING_STOP, { conversationId });
      }, timeoutMs);
    }, debounceMs);
  }, [enabled, conversationId, debounceMs, timeoutMs, isTyping, socketClient]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!enabled || !conversationId) return;

    // Clear timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
    }

    if (isTyping) {
      setIsTyping(false);
      socketClient.emit(MESSAGE_EVENTS.TYPING_STOP, { conversationId });
    }
  }, [enabled, conversationId, isTyping, socketClient]);

  // Format typing text
  const formatTypingText = useCallback((): string => {
    const count = typingUsers.length;

    if (count === 0) return '';
    if (count === 1) return `${typingUsers[0].userName} is typing...`;
    if (count === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    }
    return `${typingUsers[0].userName} and ${count - 1} others are typing...`;
  }, [typingUsers]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping,
    formatTypingText,
  };
};

// ============================================
// Use Typing Input Hook (integrates with input)
// ============================================
export interface UseTypingInputOptions extends Omit<UseTypingOptions, 'conversationId'> {
  conversationId: string | null;
  onSend?: () => void;
}

export const useTypingInput = (options: UseTypingInputOptions) => {
  const { conversationId, onSend, ...typingOptions } = options;
  const { startTyping, stopTyping, ...rest } = useTyping({
    conversationId,
    ...typingOptions,
  });

  const handleChange = useCallback(() => {
    startTyping();
  }, [startTyping]);

  const handleBlur = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  const handleSend = useCallback(() => {
    stopTyping();
    onSend?.();
  }, [stopTyping, onSend]);

  return {
    ...rest,
    startTyping,
    stopTyping,
    inputProps: {
      onChange: handleChange,
      onBlur: handleBlur,
    },
    handleSend,
  };
};

export default useTyping;
