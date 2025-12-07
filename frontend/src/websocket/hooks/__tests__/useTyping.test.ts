import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTyping, useTypingInput } from '../useTyping';

// Mock the socket client
const mockSocketClient = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

const eventHandlers: Record<string, Function[]> = {};

vi.mock('../../socket', () => ({
  getSocketClient: () => mockSocketClient,
}));

vi.mock('../../events', () => ({
  MESSAGE_EVENTS: {
    TYPING_START: 'message:typing_start',
    TYPING_STOP: 'message:typing_stop',
  },
}));

describe('useTyping', () => {
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper to trigger event
  const triggerEvent = (event: string, payload: any) => {
    eventHandlers[event]?.forEach((handler) => handler(payload));
  };

  describe('initial state', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      expect(result.current.typingUsers).toEqual([]);
      expect(result.current.isTyping).toBe(false);
    });

    it('should register event listeners', () => {
      renderHook(() => useTyping({ conversationId: 'conv-1' }));

      expect(mockSocketClient.on).toHaveBeenCalledWith('message:typing_start', expect.any(Function));
      expect(mockSocketClient.on).toHaveBeenCalledWith('message:typing_stop', expect.any(Function));
    });

    it('should not register events when disabled', () => {
      renderHook(() =>
        useTyping({ conversationId: 'conv-1', enabled: false })
      );

      expect(mockSocketClient.on).not.toHaveBeenCalled();
    });

    it('should not register events when conversationId is null', () => {
      renderHook(() => useTyping({ conversationId: null }));

      expect(mockSocketClient.on).not.toHaveBeenCalled();
    });
  });

  describe('typing events', () => {
    it('should add user when TYPING_START received', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(result.current.typingUsers).toHaveLength(1);
      expect(result.current.typingUsers[0]).toMatchObject({
        userId: 'user-1',
        userName: 'John Doe',
      });
    });

    it('should ignore events for different conversations', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-2', // Different conversation
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(result.current.typingUsers).toHaveLength(0);
    });

    it('should remove user when TYPING_STOP received', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      // Add user first
      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(result.current.typingUsers).toHaveLength(1);

      // Stop typing
      act(() => {
        triggerEvent('message:typing_stop', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(result.current.typingUsers).toHaveLength(0);
    });

    it('should update existing user startedAt on repeated typing', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      const firstStartedAt = result.current.typingUsers[0].startedAt;

      // Advance time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      const secondStartedAt = result.current.typingUsers[0].startedAt;
      expect(secondStartedAt.getTime()).toBeGreaterThan(firstStartedAt.getTime());
    });

    it('should handle multiple typing users', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John',
        });
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-2',
          userName: 'Jane',
        });
      });

      expect(result.current.typingUsers).toHaveLength(2);
    });
  });

  describe('typing timeout', () => {
    it('should remove user after timeout', () => {
      const timeoutMs = 3000;
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1', timeoutMs })
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      expect(result.current.typingUsers).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(timeoutMs);
      });

      expect(result.current.typingUsers).toHaveLength(0);
    });

    it('should reset timeout on repeated typing', () => {
      const timeoutMs = 3000;
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1', timeoutMs })
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      // Advance partway
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.typingUsers).toHaveLength(1);

      // Another typing event resets timeout
      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John Doe',
        });
      });

      // Advance past original timeout
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should still be typing
      expect(result.current.typingUsers).toHaveLength(1);

      // Advance to new timeout
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.typingUsers).toHaveLength(0);
    });
  });

  describe('startTyping', () => {
    it('should emit typing start event after debounce', () => {
      const debounceMs = 300;
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1', debounceMs })
      );

      act(() => {
        result.current.startTyping();
      });

      // Event not emitted yet (debouncing)
      expect(mockSocketClient.emit).not.toHaveBeenCalledWith(
        'message:typing_start',
        expect.any(Object)
      );

      act(() => {
        vi.advanceTimersByTime(debounceMs);
      });

      expect(mockSocketClient.emit).toHaveBeenCalledWith('message:typing_start', {
        conversationId: 'conv-1',
      });
      expect(result.current.isTyping).toBe(true);
    });

    it('should not emit when disabled', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1', enabled: false })
      );

      act(() => {
        result.current.startTyping();
        vi.advanceTimersByTime(500);
      });

      expect(mockSocketClient.emit).not.toHaveBeenCalled();
    });

    it('should not emit when conversationId is null', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: null })
      );

      act(() => {
        result.current.startTyping();
        vi.advanceTimersByTime(500);
      });

      expect(mockSocketClient.emit).not.toHaveBeenCalled();
    });

    it('should auto-stop after timeout', () => {
      const debounceMs = 300;
      const timeoutMs = 3000;
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1', debounceMs, timeoutMs })
      );

      act(() => {
        result.current.startTyping();
        vi.advanceTimersByTime(debounceMs);
      });

      expect(result.current.isTyping).toBe(true);

      act(() => {
        vi.advanceTimersByTime(timeoutMs);
      });

      expect(result.current.isTyping).toBe(false);
      expect(mockSocketClient.emit).toHaveBeenCalledWith('message:typing_stop', {
        conversationId: 'conv-1',
      });
    });
  });

  describe('stopTyping', () => {
    it('should emit typing stop event immediately', () => {
      const debounceMs = 300;
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1', debounceMs })
      );

      // Start typing first
      act(() => {
        result.current.startTyping();
        vi.advanceTimersByTime(debounceMs);
      });

      expect(result.current.isTyping).toBe(true);

      act(() => {
        result.current.stopTyping();
      });

      expect(result.current.isTyping).toBe(false);
      expect(mockSocketClient.emit).toHaveBeenCalledWith('message:typing_stop', {
        conversationId: 'conv-1',
      });
    });

    it('should cancel pending typing start', () => {
      const debounceMs = 300;
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1', debounceMs })
      );

      act(() => {
        result.current.startTyping();
      });

      // Stop before debounce completes
      act(() => {
        vi.advanceTimersByTime(100);
        result.current.stopTyping();
        vi.advanceTimersByTime(300);
      });

      expect(mockSocketClient.emit).not.toHaveBeenCalledWith(
        'message:typing_start',
        expect.any(Object)
      );
    });
  });

  describe('formatTypingText', () => {
    it('should return empty string when no one is typing', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      expect(result.current.formatTypingText()).toBe('');
    });

    it('should format single user typing', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John',
        });
      });

      expect(result.current.formatTypingText()).toBe('John is typing...');
    });

    it('should format two users typing', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John',
        });
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-2',
          userName: 'Jane',
        });
      });

      expect(result.current.formatTypingText()).toBe('John and Jane are typing...');
    });

    it('should format multiple users typing', () => {
      const { result } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John',
        });
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-2',
          userName: 'Jane',
        });
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-3',
          userName: 'Bob',
        });
      });

      expect(result.current.formatTypingText()).toBe('John and 2 others are typing...');
    });
  });

  describe('conversation change', () => {
    it('should clear typing users when conversation changes', () => {
      const { result, rerender } = renderHook(
        ({ conversationId }) => useTyping({ conversationId }),
        { initialProps: { conversationId: 'conv-1' } }
      );

      act(() => {
        triggerEvent('message:typing_start', {
          conversationId: 'conv-1',
          userId: 'user-1',
          userName: 'John',
        });
      });

      expect(result.current.typingUsers).toHaveLength(1);

      rerender({ conversationId: 'conv-2' });

      expect(result.current.typingUsers).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from events on unmount', () => {
      const { unmount } = renderHook(() =>
        useTyping({ conversationId: 'conv-1' })
      );

      unmount();

      expect(mockSocketClient.off).toHaveBeenCalledWith('message:typing_start', expect.any(Function));
      expect(mockSocketClient.off).toHaveBeenCalledWith('message:typing_stop', expect.any(Function));
    });
  });
});

describe('useTypingInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key]);

    mockSocketClient.on.mockImplementation((event: string, handler: Function) => {
      if (!eventHandlers[event]) {
        eventHandlers[event] = [];
      }
      eventHandlers[event].push(handler);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should provide input props', () => {
    const { result } = renderHook(() =>
      useTypingInput({ conversationId: 'conv-1' })
    );

    expect(result.current.inputProps).toHaveProperty('onChange');
    expect(result.current.inputProps).toHaveProperty('onBlur');
  });

  it('should start typing on change', () => {
    const debounceMs = 300;
    const { result } = renderHook(() =>
      useTypingInput({ conversationId: 'conv-1', debounceMs })
    );

    act(() => {
      result.current.inputProps.onChange();
      vi.advanceTimersByTime(debounceMs);
    });

    expect(mockSocketClient.emit).toHaveBeenCalledWith('message:typing_start', {
      conversationId: 'conv-1',
    });
  });

  it('should stop typing on blur', () => {
    const debounceMs = 300;
    const { result } = renderHook(() =>
      useTypingInput({ conversationId: 'conv-1', debounceMs })
    );

    // Start typing first
    act(() => {
      result.current.inputProps.onChange();
      vi.advanceTimersByTime(debounceMs);
    });

    act(() => {
      result.current.inputProps.onBlur();
    });

    expect(mockSocketClient.emit).toHaveBeenCalledWith('message:typing_stop', {
      conversationId: 'conv-1',
    });
  });

  it('should stop typing and call onSend on handleSend', () => {
    const onSend = vi.fn();
    const debounceMs = 300;
    const { result } = renderHook(() =>
      useTypingInput({ conversationId: 'conv-1', debounceMs, onSend })
    );

    // Start typing first
    act(() => {
      result.current.inputProps.onChange();
      vi.advanceTimersByTime(debounceMs);
    });

    act(() => {
      result.current.handleSend();
    });

    expect(mockSocketClient.emit).toHaveBeenCalledWith('message:typing_stop', {
      conversationId: 'conv-1',
    });
    expect(onSend).toHaveBeenCalled();
  });
});
