// ============================================================
// USE SOCKET HOOK - Core socket connection hook
// ============================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getSocketClient, type SocketState, type SocketEventCallback } from '../socket';

// ============================================
// Types
// ============================================
export interface UseSocketOptions {
  autoConnect?: boolean;
  token?: string;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onReconnect?: () => void;
}

export interface UseSocketReturn {
  isConnected: boolean;
  isAuthenticated: boolean;
  isReconnecting: boolean;
  error: Error | null;
  socketId: string | null;
  connect: (token?: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  emit: <T = unknown>(event: string, data?: T) => void;
  emitWithAck: <T = unknown, R = unknown>(event: string, data?: T) => Promise<R>;
  on: <T = unknown>(event: string, callback: SocketEventCallback<T>) => void;
  off: (event: string, callback?: SocketEventCallback) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

// ============================================
// Hook Implementation
// ============================================
export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const {
    autoConnect = true,
    token,
    onConnect,
    onDisconnect,
    onError,
    onReconnect,
  } = options;

  const [state, setState] = useState<SocketState>({
    connected: false,
    authenticated: false,
    reconnecting: false,
    error: null,
  });

  const socketClient = useMemo(() => getSocketClient(), []);
  const callbacksRef = useRef({ onConnect, onDisconnect, onError, onReconnect });

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onConnect, onDisconnect, onError, onReconnect };
  }, [onConnect, onDisconnect, onError, onReconnect]);

  // Subscribe to socket state changes
  useEffect(() => {
    const unsubscribe = socketClient.subscribeToState((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, [socketClient]);

  // Handle state change callbacks
  useEffect(() => {
    if (state.connected && callbacksRef.current.onConnect) {
      callbacksRef.current.onConnect();
    }
  }, [state.connected]);

  useEffect(() => {
    if (state.error && callbacksRef.current.onError) {
      callbacksRef.current.onError(state.error);
    }
  }, [state.error]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && token && !socketClient.isConnected()) {
      socketClient.connect(token);
    }

    return () => {
      // Don't disconnect on unmount - let the app manage lifecycle
    };
  }, [autoConnect, token, socketClient]);

  // Methods
  const connect = useCallback((connectToken?: string) => {
    socketClient.connect(connectToken || token);
  }, [socketClient, token]);

  const disconnect = useCallback(() => {
    socketClient.disconnect();
  }, [socketClient]);

  const reconnect = useCallback(() => {
    socketClient.reconnect();
  }, [socketClient]);

  const emit = useCallback(<T = unknown>(event: string, data?: T) => {
    socketClient.emit(event, data);
  }, [socketClient]);

  const emitWithAck = useCallback(<T = unknown, R = unknown>(event: string, data?: T) => {
    return socketClient.emitWithAck<T, R>(event, data);
  }, [socketClient]);

  const on = useCallback(<T = unknown>(event: string, callback: SocketEventCallback<T>) => {
    socketClient.on(event, callback);
  }, [socketClient]);

  const off = useCallback((event: string, callback?: SocketEventCallback) => {
    socketClient.off(event, callback);
  }, [socketClient]);

  const joinRoom = useCallback((room: string) => {
    socketClient.joinRoom(room);
  }, [socketClient]);

  const leaveRoom = useCallback((room: string) => {
    socketClient.leaveRoom(room);
  }, [socketClient]);

  return {
    isConnected: state.connected,
    isAuthenticated: state.authenticated,
    isReconnecting: state.reconnecting,
    error: state.error,
    socketId: socketClient.getSocketId(),
    connect,
    disconnect,
    reconnect,
    emit,
    emitWithAck,
    on,
    off,
    joinRoom,
    leaveRoom,
  };
};

// ============================================
// Use Socket Event Hook
// ============================================
export interface UseSocketEventOptions<T> {
  enabled?: boolean;
}

export const useSocketEvent = <T = unknown>(
  event: string,
  callback: SocketEventCallback<T>,
  options: UseSocketEventOptions<T> = {}
): void => {
  const { enabled = true } = options;
  const socketClient = useMemo(() => getSocketClient(), []);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handler: SocketEventCallback<T> = (data) => {
      callbackRef.current(data);
    };

    socketClient.on(event, handler);

    return () => {
      socketClient.off(event, handler as SocketEventCallback);
    };
  }, [event, enabled, socketClient]);
};

// ============================================
// Use Socket Room Hook
// ============================================
export interface UseSocketRoomOptions {
  autoJoin?: boolean;
  autoLeave?: boolean;
}

export const useSocketRoom = (
  room: string | null,
  options: UseSocketRoomOptions = {}
): { join: () => void; leave: () => void } => {
  const { autoJoin = true, autoLeave = true } = options;
  const socketClient = useMemo(() => getSocketClient(), []);

  const join = useCallback(() => {
    if (room) {
      socketClient.joinRoom(room);
    }
  }, [room, socketClient]);

  const leave = useCallback(() => {
    if (room) {
      socketClient.leaveRoom(room);
    }
  }, [room, socketClient]);

  useEffect(() => {
    if (autoJoin && room && socketClient.isConnected()) {
      join();
    }

    return () => {
      if (autoLeave && room) {
        leave();
      }
    };
  }, [room, autoJoin, autoLeave, join, leave, socketClient]);

  return { join, leave };
};

export default useSocket;
