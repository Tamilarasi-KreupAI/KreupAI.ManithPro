import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSocket, useSocketEvent, useSocketRoom } from '../useSocket';

// Mock the socket client
const mockSocketClient = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  reconnect: vi.fn(),
  emit: vi.fn(),
  emitWithAck: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  joinRoom: vi.fn(),
  leaveRoom: vi.fn(),
  isConnected: vi.fn(() => false),
  isAuthenticated: vi.fn(() => false),
  getSocketId: vi.fn(() => null),
  subscribeToState: vi.fn((callback) => {
    // Store callback for later use
    mockStateCallback = callback;
    return () => {};
  }),
};

let mockStateCallback: ((state: any) => void) | null = null;

vi.mock('../../socket', () => ({
  getSocketClient: () => mockSocketClient,
}));

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStateCallback = null;
    mockSocketClient.isConnected.mockReturnValue(false);
    mockSocketClient.isAuthenticated.mockReturnValue(false);
    mockSocketClient.getSocketId.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should return initial disconnected state', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isReconnecting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.socketId).toBeNull();
    });

    it('should subscribe to state changes on mount', () => {
      renderHook(() => useSocket({ autoConnect: false }));

      expect(mockSocketClient.subscribeToState).toHaveBeenCalledTimes(1);
    });
  });

  describe('auto-connect', () => {
    it('should auto-connect when token is provided and autoConnect is true', () => {
      renderHook(() => useSocket({ autoConnect: true, token: 'test-token' }));

      expect(mockSocketClient.connect).toHaveBeenCalledWith('test-token');
    });

    it('should not auto-connect when autoConnect is false', () => {
      renderHook(() => useSocket({ autoConnect: false, token: 'test-token' }));

      expect(mockSocketClient.connect).not.toHaveBeenCalled();
    });

    it('should not auto-connect without a token', () => {
      renderHook(() => useSocket({ autoConnect: true }));

      expect(mockSocketClient.connect).not.toHaveBeenCalled();
    });

    it('should not auto-connect if already connected', () => {
      mockSocketClient.isConnected.mockReturnValue(true);

      renderHook(() => useSocket({ autoConnect: true, token: 'test-token' }));

      expect(mockSocketClient.connect).not.toHaveBeenCalled();
    });
  });

  describe('connection methods', () => {
    it('should call connect on socket client', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));

      act(() => {
        result.current.connect('new-token');
      });

      expect(mockSocketClient.connect).toHaveBeenCalledWith('new-token');
    });

    it('should call disconnect on socket client', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));

      act(() => {
        result.current.disconnect();
      });

      expect(mockSocketClient.disconnect).toHaveBeenCalled();
    });

    it('should call reconnect on socket client', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));

      act(() => {
        result.current.reconnect();
      });

      expect(mockSocketClient.reconnect).toHaveBeenCalled();
    });
  });

  describe('emit methods', () => {
    it('should emit events through socket client', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));

      act(() => {
        result.current.emit('test-event', { data: 'test' });
      });

      expect(mockSocketClient.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
    });

    it('should emit with ack through socket client', async () => {
      mockSocketClient.emitWithAck.mockResolvedValue({ success: true });
      const { result } = renderHook(() => useSocket({ autoConnect: false }));

      let response;
      await act(async () => {
        response = await result.current.emitWithAck('test-event', { data: 'test' });
      });

      expect(mockSocketClient.emitWithAck).toHaveBeenCalledWith('test-event', { data: 'test' });
      expect(response).toEqual({ success: true });
    });
  });

  describe('event handling', () => {
    it('should register event listeners', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));
      const callback = vi.fn();

      act(() => {
        result.current.on('test-event', callback);
      });

      expect(mockSocketClient.on).toHaveBeenCalledWith('test-event', callback);
    });

    it('should unregister event listeners', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));
      const callback = vi.fn();

      act(() => {
        result.current.off('test-event', callback);
      });

      expect(mockSocketClient.off).toHaveBeenCalledWith('test-event', callback);
    });
  });

  describe('room management', () => {
    it('should join room through socket client', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));

      act(() => {
        result.current.joinRoom('test-room');
      });

      expect(mockSocketClient.joinRoom).toHaveBeenCalledWith('test-room');
    });

    it('should leave room through socket client', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));

      act(() => {
        result.current.leaveRoom('test-room');
      });

      expect(mockSocketClient.leaveRoom).toHaveBeenCalledWith('test-room');
    });
  });

  describe('state updates', () => {
    it('should update state when socket state changes', async () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));

      // Simulate state change
      act(() => {
        if (mockStateCallback) {
          mockStateCallback({
            connected: true,
            authenticated: true,
            reconnecting: false,
            error: null,
          });
        }
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should update error state', () => {
      const { result } = renderHook(() => useSocket({ autoConnect: false }));
      const error = new Error('Connection failed');

      act(() => {
        if (mockStateCallback) {
          mockStateCallback({
            connected: false,
            authenticated: false,
            reconnecting: false,
            error,
          });
        }
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('callbacks', () => {
    it('should call onConnect when connected', () => {
      const onConnect = vi.fn();
      renderHook(() => useSocket({ autoConnect: false, onConnect }));

      act(() => {
        if (mockStateCallback) {
          mockStateCallback({
            connected: true,
            authenticated: false,
            reconnecting: false,
            error: null,
          });
        }
      });

      expect(onConnect).toHaveBeenCalled();
    });

    it('should call onError when error occurs', () => {
      const onError = vi.fn();
      const error = new Error('Test error');
      renderHook(() => useSocket({ autoConnect: false, onError }));

      act(() => {
        if (mockStateCallback) {
          mockStateCallback({
            connected: false,
            authenticated: false,
            reconnecting: false,
            error,
          });
        }
      });

      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});

describe('useSocketEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register event listener on mount', () => {
    const callback = vi.fn();
    renderHook(() => useSocketEvent('test-event', callback));

    expect(mockSocketClient.on).toHaveBeenCalledWith('test-event', expect.any(Function));
  });

  it('should unregister event listener on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useSocketEvent('test-event', callback));

    unmount();

    expect(mockSocketClient.off).toHaveBeenCalledWith('test-event', expect.any(Function));
  });

  it('should not register when disabled', () => {
    const callback = vi.fn();
    renderHook(() => useSocketEvent('test-event', callback, { enabled: false }));

    expect(mockSocketClient.on).not.toHaveBeenCalled();
  });

  it('should re-register when event changes', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ event }) => useSocketEvent(event, callback),
      { initialProps: { event: 'event-1' } }
    );

    expect(mockSocketClient.on).toHaveBeenCalledWith('event-1', expect.any(Function));

    rerender({ event: 'event-2' });

    expect(mockSocketClient.off).toHaveBeenCalled();
    expect(mockSocketClient.on).toHaveBeenCalledWith('event-2', expect.any(Function));
  });
});

describe('useSocketRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocketClient.isConnected.mockReturnValue(true);
  });

  it('should auto-join room on mount when connected', () => {
    renderHook(() => useSocketRoom('test-room'));

    expect(mockSocketClient.joinRoom).toHaveBeenCalledWith('test-room');
  });

  it('should not auto-join when autoJoin is false', () => {
    renderHook(() => useSocketRoom('test-room', { autoJoin: false }));

    expect(mockSocketClient.joinRoom).not.toHaveBeenCalled();
  });

  it('should not join when room is null', () => {
    renderHook(() => useSocketRoom(null));

    expect(mockSocketClient.joinRoom).not.toHaveBeenCalled();
  });

  it('should auto-leave room on unmount', () => {
    const { unmount } = renderHook(() => useSocketRoom('test-room'));

    unmount();

    expect(mockSocketClient.leaveRoom).toHaveBeenCalledWith('test-room');
  });

  it('should not auto-leave when autoLeave is false', () => {
    const { unmount } = renderHook(() => useSocketRoom('test-room', { autoLeave: false }));

    unmount();

    expect(mockSocketClient.leaveRoom).not.toHaveBeenCalled();
  });

  it('should provide manual join and leave methods', () => {
    mockSocketClient.isConnected.mockReturnValue(false);
    const { result } = renderHook(() => useSocketRoom('test-room', { autoJoin: false }));

    act(() => {
      result.current.join();
    });

    expect(mockSocketClient.joinRoom).toHaveBeenCalledWith('test-room');

    act(() => {
      result.current.leave();
    });

    expect(mockSocketClient.leaveRoom).toHaveBeenCalledWith('test-room');
  });

  it('should re-join when room changes', () => {
    const { rerender } = renderHook(
      ({ room }) => useSocketRoom(room),
      { initialProps: { room: 'room-1' } }
    );

    expect(mockSocketClient.joinRoom).toHaveBeenCalledWith('room-1');

    rerender({ room: 'room-2' });

    expect(mockSocketClient.leaveRoom).toHaveBeenCalledWith('room-1');
    expect(mockSocketClient.joinRoom).toHaveBeenCalledWith('room-2');
  });
});
