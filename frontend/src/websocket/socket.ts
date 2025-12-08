// ============================================================
// WEBSOCKET CLIENT - Socket.io client configuration
// ============================================================

import { io, Socket } from 'socket.io-client';
import {
  CONNECTION_EVENTS,
  AUTH_EVENTS,
  ROOM_EVENTS,
  SYSTEM_EVENTS,
  type RoomPayload,
} from './events';

// ============================================
// Types
// ============================================
export interface SocketConfig {
  url?: string;
  path?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  transports?: ('websocket' | 'polling')[];
}

export interface SocketState {
  connected: boolean;
  authenticated: boolean;
  reconnecting: boolean;
  error: Error | null;
}

export type SocketEventCallback<T = unknown> = (data: T) => void;

// ============================================
// Default Configuration
// ============================================
const DEFAULT_CONFIG: SocketConfig = {
  url: import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001',
  path: '/socket.io',
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
};

// ============================================
// Socket Client Class
// ============================================
class SocketClient {
  private socket: Socket | null = null;
  private config: SocketConfig;
  private state: SocketState = {
    connected: false,
    authenticated: false,
    reconnecting: false,
    error: null,
  };
  private stateListeners: Set<(state: SocketState) => void> = new Set();
  private token: string | null = null;
  private rooms: Set<string> = new Set();

  constructor(config: SocketConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================
  // Connection Management
  // ============================================
  connect(token?: string): void {
    if (this.socket?.connected) {
      console.warn('Socket already connected');
      return;
    }

    if (token) {
      this.token = token;
    }

    this.socket = io(this.config.url!, {
      path: this.config.path,
      autoConnect: true,
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      reconnectionDelayMax: this.config.reconnectionDelayMax,
      timeout: this.config.timeout,
      transports: this.config.transports,
      auth: this.token ? { token: this.token } : undefined,
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.rooms.forEach((room) => this.leaveRoom(room));
      this.socket.disconnect();
      this.socket = null;
      this.updateState({
        connected: false,
        authenticated: false,
        reconnecting: false,
        error: null,
      });
    }
  }

  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else if (this.token) {
      this.connect(this.token);
    }
  }

  // ============================================
  // Event Listeners Setup
  // ============================================
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on(CONNECTION_EVENTS.CONNECT, () => {
      console.log('Socket connected');
      this.updateState({ connected: true, reconnecting: false, error: null });

      // Authenticate after connection
      if (this.token) {
        this.authenticate(this.token);
      }

      // Rejoin rooms after reconnection
      this.rooms.forEach((room) => {
        this.socket?.emit(ROOM_EVENTS.JOIN, { room });
      });
    });

    this.socket.on(CONNECTION_EVENTS.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
      this.updateState({ connected: false, authenticated: false });
    });

    this.socket.on(CONNECTION_EVENTS.CONNECT_ERROR, (error) => {
      console.error('Socket connection error:', error);
      this.updateState({ error, connected: false });
    });

    this.socket.on(CONNECTION_EVENTS.RECONNECT_ATTEMPT, (attemptNumber) => {
      console.log('Socket reconnect attempt:', attemptNumber);
      this.updateState({ reconnecting: true });
    });

    this.socket.on(CONNECTION_EVENTS.RECONNECT, (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.updateState({ connected: true, reconnecting: false });
    });

    this.socket.on(CONNECTION_EVENTS.RECONNECT_FAILED, () => {
      console.error('Socket reconnect failed');
      this.updateState({
        reconnecting: false,
        error: new Error('Failed to reconnect after maximum attempts'),
      });
    });

    // Authentication events
    this.socket.on(AUTH_EVENTS.AUTHENTICATED, () => {
      console.log('Socket authenticated');
      this.updateState({ authenticated: true });
    });

    this.socket.on(AUTH_EVENTS.AUTHENTICATION_ERROR, (error) => {
      console.error('Socket authentication error:', error);
      this.updateState({ authenticated: false, error: new Error(error) });
    });

    this.socket.on(AUTH_EVENTS.SESSION_EXPIRED, () => {
      console.warn('Socket session expired');
      this.updateState({ authenticated: false });
      this.disconnect();
    });

    // Room events
    this.socket.on(ROOM_EVENTS.JOINED, (data: RoomPayload) => {
      console.log('Joined room:', data.room);
    });

    this.socket.on(ROOM_EVENTS.LEFT, (data: RoomPayload) => {
      console.log('Left room:', data.room);
    });

    this.socket.on(ROOM_EVENTS.ERROR, (error) => {
      console.error('Room error:', error);
    });

    // System events
    this.socket.on(SYSTEM_EVENTS.MAINTENANCE_START, (data) => {
      console.warn('System maintenance starting:', data);
    });

    this.socket.on(SYSTEM_EVENTS.BROADCAST, (data) => {
      console.log('System broadcast:', data);
    });

    this.socket.on(SYSTEM_EVENTS.ERROR, (error) => {
      console.error('System error:', error);
    });
  }

  // ============================================
  // Authentication
  // ============================================
  authenticate(token: string): void {
    this.token = token;
    if (this.socket?.connected) {
      this.socket.emit(AUTH_EVENTS.AUTHENTICATE, { token });
    }
  }

  updateToken(token: string): void {
    this.token = token;
    if (this.socket?.connected) {
      this.socket.emit(AUTH_EVENTS.TOKEN_REFRESH, { token });
    }
  }

  // ============================================
  // Room Management
  // ============================================
  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit(ROOM_EVENTS.JOIN, { room });
      this.rooms.add(room);
    }
  }

  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit(ROOM_EVENTS.LEAVE, { room });
      this.rooms.delete(room);
    }
  }

  getRooms(): string[] {
    return Array.from(this.rooms);
  }

  // ============================================
  // Event Emission
  // ============================================
  emit<T = unknown>(event: string, data?: T): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  emitWithAck<T = unknown, R = unknown>(event: string, data?: T): Promise<R> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.timeout(10000).emit(event, data, (err: Error | null, response: R) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  // ============================================
  // Event Subscription
  // ============================================
  on<T = unknown>(event: string, callback: SocketEventCallback<T>): void {
    this.socket?.on(event, callback as SocketEventCallback<unknown>);
  }

  once<T = unknown>(event: string, callback: SocketEventCallback<T>): void {
    this.socket?.once(event, callback as SocketEventCallback<unknown>);
  }

  off(event: string, callback?: SocketEventCallback): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // ============================================
  // State Management
  // ============================================
  private updateState(updates: Partial<SocketState>): void {
    this.state = { ...this.state, ...updates };
    this.stateListeners.forEach((listener) => listener(this.state));
  }

  getState(): SocketState {
    return { ...this.state };
  }

  subscribeToState(listener: (state: SocketState) => void): () => void {
    this.stateListeners.add(listener);
    // Immediately notify with current state
    listener(this.state);
    // Return unsubscribe function
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  // ============================================
  // Utility Methods
  // ============================================
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  isAuthenticated(): boolean {
    return this.state.authenticated;
  }

  getSocketId(): string | null {
    return this.socket?.id ?? null;
  }
}

// ============================================
// Singleton Instance
// ============================================
let socketClient: SocketClient | null = null;

export const getSocketClient = (config?: SocketConfig): SocketClient => {
  if (!socketClient) {
    socketClient = new SocketClient(config);
  }
  return socketClient;
};

export const resetSocketClient = (): void => {
  if (socketClient) {
    socketClient.disconnect();
    socketClient = null;
  }
};

// ============================================
// Export
// ============================================
export { SocketClient };
export default getSocketClient;
