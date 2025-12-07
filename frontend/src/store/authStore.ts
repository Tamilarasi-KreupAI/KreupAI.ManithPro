import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============================================================
// AUTH STORE - User Authentication & Session Management
// ============================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | 'candidate';
  avatar?: string;
  companyId?: string;
  companyName?: string;
  permissions: string[];
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    defaultView: string;
    widgets: string[];
  };
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: 'Bearer';
}

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;

  // Actions
  setUser: (user: User) => void;
  setSession: (session: Session) => void;
  login: (user: User, session: Session) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshSession: (session: Session) => void;
  checkSessionValidity: () => boolean;
  updateLastActivity: () => void;

  // Computed
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isRecruiter: () => boolean;
  isCandidate: () => boolean;
}

const initialState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: Date.now(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = true;
        }),

      setSession: (session) =>
        set((state) => {
          state.session = session;
        }),

      login: (user, session) =>
        set((state) => {
          state.user = user;
          state.session = session;
          state.isAuthenticated = true;
          state.error = null;
          state.lastActivity = Date.now();
        }),

      logout: () =>
        set((state) => {
          state.user = null;
          state.session = null;
          state.isAuthenticated = false;
          state.error = null;
        }),

      updateUser: (updates) =>
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates);
          }
        }),

      updatePreferences: (preferences) =>
        set((state) => {
          if (state.user) {
            Object.assign(state.user.preferences, preferences);
          }
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      refreshSession: (session) =>
        set((state) => {
          state.session = session;
        }),

      checkSessionValidity: () => {
        const { session } = get();
        if (!session) return false;
        return session.expiresAt > Date.now();
      },

      updateLastActivity: () =>
        set((state) => {
          state.lastActivity = Date.now();
        }),

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'admin') return true;
        return user.permissions.includes(permission);
      },

      isAdmin: () => get().user?.role === 'admin',
      isRecruiter: () => get().user?.role === 'recruiter',
      isCandidate: () => get().user?.role === 'candidate',
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectUserPermissions = (state: AuthState) => state.user?.permissions || [];
