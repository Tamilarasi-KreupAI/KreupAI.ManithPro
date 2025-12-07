import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, User, Session, UserPreferences } from '../authStore';
import { act } from '@testing-library/react';

// Helper to reset store between tests
const resetStore = () => {
  act(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastActivity: Date.now(),
    });
  });
};

// Mock user factory
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'recruiter',
  companyId: 'company-1',
  companyName: 'Test Company',
  permissions: ['read:jobs', 'write:jobs', 'read:applications'],
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    dashboard: {
      defaultView: 'grid',
      widgets: ['applications', 'interviews', 'tasks'],
    },
  },
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-12-07T00:00:00Z',
  ...overrides,
});

// Mock session factory
const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: Date.now() + 3600000, // 1 hour from now
  tokenType: 'Bearer',
  ...overrides,
});

describe('authStore', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastActivity).toBeDefined();
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const mockUser = createMockUser();

      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setSession', () => {
    it('should set session', () => {
      const mockSession = createMockSession();

      act(() => {
        useAuthStore.getState().setSession(mockSession);
      });

      const state = useAuthStore.getState();
      expect(state.session).toEqual(mockSession);
    });
  });

  describe('login', () => {
    it('should set user, session, and mark as authenticated', () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession();

      act(() => {
        useAuthStore.getState().login(mockUser, mockSession);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should clear any existing error on login', () => {
      act(() => {
        useAuthStore.getState().setError('Previous error');
      });

      const mockUser = createMockUser();
      const mockSession = createMockSession();

      act(() => {
        useAuthStore.getState().login(mockUser, mockSession);
      });

      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should update lastActivity on login', () => {
      const beforeLogin = Date.now();

      act(() => {
        useAuthStore.getState().login(createMockUser(), createMockSession());
      });

      const state = useAuthStore.getState();
      expect(state.lastActivity).toBeGreaterThanOrEqual(beforeLogin);
    });
  });

  describe('logout', () => {
    it('should clear user, session, and mark as not authenticated', () => {
      // First login
      act(() => {
        useAuthStore.getState().login(createMockUser(), createMockSession());
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user properties', () => {
      const mockUser = createMockUser();

      act(() => {
        useAuthStore.getState().setUser(mockUser);
        useAuthStore.getState().updateUser({ firstName: 'Jane', lastName: 'Smith' });
      });

      const state = useAuthStore.getState();
      expect(state.user?.firstName).toBe('Jane');
      expect(state.user?.lastName).toBe('Smith');
      expect(state.user?.email).toBe(mockUser.email); // unchanged
    });

    it('should do nothing if no user is logged in', () => {
      act(() => {
        useAuthStore.getState().updateUser({ firstName: 'Jane' });
      });

      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', () => {
      const mockUser = createMockUser();

      act(() => {
        useAuthStore.getState().setUser(mockUser);
        useAuthStore.getState().updatePreferences({ theme: 'dark' });
      });

      const state = useAuthStore.getState();
      expect(state.user?.preferences.theme).toBe('dark');
      expect(state.user?.preferences.language).toBe('en'); // unchanged
    });

    it('should update nested notification preferences', () => {
      const mockUser = createMockUser();

      act(() => {
        useAuthStore.getState().setUser(mockUser);
        useAuthStore.getState().updatePreferences({
          notifications: { email: false, push: false, sms: true },
        } as Partial<UserPreferences>);
      });

      const state = useAuthStore.getState();
      expect(state.user?.preferences.notifications.email).toBe(false);
      expect(state.user?.preferences.notifications.push).toBe(false);
      expect(state.user?.preferences.notifications.sms).toBe(true);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      expect(useAuthStore.getState().isLoading).toBe(true);

      act(() => {
        useAuthStore.getState().setLoading(false);
      });

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      act(() => {
        useAuthStore.getState().setError('Authentication failed');
      });

      expect(useAuthStore.getState().error).toBe('Authentication failed');
    });

    it('should clear error when set to null', () => {
      act(() => {
        useAuthStore.getState().setError('Error');
        useAuthStore.getState().setError(null);
      });

      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('refreshSession', () => {
    it('should update session with new tokens', () => {
      const originalSession = createMockSession();
      const newSession = createMockSession({
        accessToken: 'new-access-token',
        expiresAt: Date.now() + 7200000,
      });

      act(() => {
        useAuthStore.getState().setSession(originalSession);
        useAuthStore.getState().refreshSession(newSession);
      });

      const state = useAuthStore.getState();
      expect(state.session?.accessToken).toBe('new-access-token');
      expect(state.session?.expiresAt).toBeGreaterThan(originalSession.expiresAt);
    });
  });

  describe('checkSessionValidity', () => {
    it('should return true for valid session', () => {
      const validSession = createMockSession({
        expiresAt: Date.now() + 3600000, // 1 hour from now
      });

      act(() => {
        useAuthStore.getState().setSession(validSession);
      });

      expect(useAuthStore.getState().checkSessionValidity()).toBe(true);
    });

    it('should return false for expired session', () => {
      const expiredSession = createMockSession({
        expiresAt: Date.now() - 1000, // 1 second ago
      });

      act(() => {
        useAuthStore.getState().setSession(expiredSession);
      });

      expect(useAuthStore.getState().checkSessionValidity()).toBe(false);
    });

    it('should return false if no session exists', () => {
      expect(useAuthStore.getState().checkSessionValidity()).toBe(false);
    });
  });

  describe('updateLastActivity', () => {
    it('should update lastActivity timestamp', () => {
      const before = Date.now();

      act(() => {
        useAuthStore.getState().updateLastActivity();
      });

      const after = Date.now();
      const state = useAuthStore.getState();

      expect(state.lastActivity).toBeGreaterThanOrEqual(before);
      expect(state.lastActivity).toBeLessThanOrEqual(after);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has the permission', () => {
      const mockUser = createMockUser({
        permissions: ['read:jobs', 'write:jobs'],
      });

      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      expect(useAuthStore.getState().hasPermission('read:jobs')).toBe(true);
      expect(useAuthStore.getState().hasPermission('write:jobs')).toBe(true);
    });

    it('should return false if user does not have the permission', () => {
      const mockUser = createMockUser({
        permissions: ['read:jobs'],
      });

      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      expect(useAuthStore.getState().hasPermission('delete:jobs')).toBe(false);
    });

    it('should return true for admin users regardless of permissions', () => {
      const adminUser = createMockUser({
        role: 'admin',
        permissions: [],
      });

      act(() => {
        useAuthStore.getState().setUser(adminUser);
      });

      expect(useAuthStore.getState().hasPermission('any:permission')).toBe(true);
    });

    it('should return false if no user is logged in', () => {
      expect(useAuthStore.getState().hasPermission('read:jobs')).toBe(false);
    });
  });

  describe('role checks', () => {
    it('isAdmin should return true for admin role', () => {
      act(() => {
        useAuthStore.getState().setUser(createMockUser({ role: 'admin' }));
      });

      expect(useAuthStore.getState().isAdmin()).toBe(true);
      expect(useAuthStore.getState().isRecruiter()).toBe(false);
      expect(useAuthStore.getState().isCandidate()).toBe(false);
    });

    it('isRecruiter should return true for recruiter role', () => {
      act(() => {
        useAuthStore.getState().setUser(createMockUser({ role: 'recruiter' }));
      });

      expect(useAuthStore.getState().isAdmin()).toBe(false);
      expect(useAuthStore.getState().isRecruiter()).toBe(true);
      expect(useAuthStore.getState().isCandidate()).toBe(false);
    });

    it('isCandidate should return true for candidate role', () => {
      act(() => {
        useAuthStore.getState().setUser(createMockUser({ role: 'candidate' }));
      });

      expect(useAuthStore.getState().isAdmin()).toBe(false);
      expect(useAuthStore.getState().isRecruiter()).toBe(false);
      expect(useAuthStore.getState().isCandidate()).toBe(true);
    });

    it('all role checks should return false if no user', () => {
      expect(useAuthStore.getState().isAdmin()).toBe(false);
      expect(useAuthStore.getState().isRecruiter()).toBe(false);
      expect(useAuthStore.getState().isCandidate()).toBe(false);
    });
  });

  describe('selectors', () => {
    it('selectUser should return user', () => {
      const mockUser = createMockUser();

      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      const { selectUser } = require('../authStore');
      expect(selectUser(useAuthStore.getState())).toEqual(mockUser);
    });

    it('selectIsAuthenticated should return authentication status', () => {
      const { selectIsAuthenticated } = require('../authStore');

      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);

      act(() => {
        useAuthStore.getState().login(createMockUser(), createMockSession());
      });

      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true);
    });

    it('selectUserRole should return user role', () => {
      const { selectUserRole } = require('../authStore');

      act(() => {
        useAuthStore.getState().setUser(createMockUser({ role: 'hiring_manager' }));
      });

      expect(selectUserRole(useAuthStore.getState())).toBe('hiring_manager');
    });

    it('selectUserPermissions should return permissions array', () => {
      const { selectUserPermissions } = require('../authStore');

      expect(selectUserPermissions(useAuthStore.getState())).toEqual([]);

      act(() => {
        useAuthStore.getState().setUser(createMockUser({
          permissions: ['read:jobs', 'write:jobs'],
        }));
      });

      expect(selectUserPermissions(useAuthStore.getState())).toEqual(['read:jobs', 'write:jobs']);
    });
  });
});
