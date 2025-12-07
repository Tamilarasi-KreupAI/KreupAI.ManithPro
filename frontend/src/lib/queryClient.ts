import {
  QueryClient,
  QueryCache,
  MutationCache,
  DefaultOptions,
} from '@tanstack/react-query';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

// ============================================================
// REACT QUERY CLIENT CONFIGURATION
// ============================================================

// Error handler for queries
const handleQueryError = (error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';

  // Check for authentication errors
  if (error instanceof Error && error.message.includes('401')) {
    // Session expired - logout user
    useAuthStore.getState().logout();
    useUIStore.getState().addToast({
      type: 'error',
      title: 'Session Expired',
      message: 'Please log in again to continue.',
    });
    return;
  }

  // Check for authorization errors
  if (error instanceof Error && error.message.includes('403')) {
    useUIStore.getState().addToast({
      type: 'error',
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
    });
    return;
  }

  // Check for network errors
  if (error instanceof Error && error.message.includes('Network')) {
    useUIStore.getState().addToast({
      type: 'error',
      title: 'Network Error',
      message: 'Please check your internet connection.',
    });
    return;
  }

  // Generic error toast
  console.error('Query Error:', error);
};

// Error handler for mutations
const handleMutationError = (error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';

  // Check for validation errors (422)
  if (error instanceof Error && error.message.includes('422')) {
    useUIStore.getState().addToast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please check your input and try again.',
    });
    return;
  }

  // Check for conflict errors (409)
  if (error instanceof Error && error.message.includes('409')) {
    useUIStore.getState().addToast({
      type: 'error',
      title: 'Conflict',
      message: 'This resource has been modified. Please refresh and try again.',
    });
    return;
  }

  // Handle other errors same as queries
  handleQueryError(error);
};

// Success handler for mutations
const handleMutationSuccess = () => {
  // Optional: Add success toast for mutations
  // This can be overridden per-mutation
};

// Default options for queries
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Stale time: how long data is considered fresh (5 minutes)
    staleTime: 1000 * 60 * 5,
    // Cache time: how long inactive data stays in cache (30 minutes)
    gcTime: 1000 * 60 * 30,
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error) {
        const status = error.message.match(/\d{3}/)?.[0];
        if (status && parseInt(status) >= 400 && parseInt(status) < 500) {
          return false;
        }
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Don't refetch on mount if data is fresh
    refetchOnMount: true,
  },
  mutations: {
    // Retry configuration for mutations
    retry: 1,
    retryDelay: 1000,
  },
};

// Create Query Cache with error handling
const queryCache = new QueryCache({
  onError: handleQueryError,
});

// Create Mutation Cache with error handling
const mutationCache = new MutationCache({
  onError: handleMutationError,
  onSuccess: handleMutationSuccess,
});

// Create and export Query Client
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: defaultQueryOptions,
});

// ============================================================
// QUERY KEY FACTORY
// ============================================================
// Use consistent query keys for cache management

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  // Jobs
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    applications: (id: string) =>
      [...queryKeys.jobs.all, id, 'applications'] as const,
    stats: (id: string) => [...queryKeys.jobs.all, id, 'stats'] as const,
  },

  // Applications
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.applications.lists(), filters] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
    pipeline: (jobId: string) =>
      [...queryKeys.applications.all, 'pipeline', jobId] as const,
    timeline: (id: string) =>
      [...queryKeys.applications.all, id, 'timeline'] as const,
  },

  // Candidates
  candidates: {
    all: ['candidates'] as const,
    lists: () => [...queryKeys.candidates.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.candidates.lists(), filters] as const,
    details: () => [...queryKeys.candidates.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.candidates.details(), id] as const,
    profile: (id: string) =>
      [...queryKeys.candidates.all, id, 'profile'] as const,
  },

  // Interviews
  interviews: {
    all: ['interviews'] as const,
    lists: () => [...queryKeys.interviews.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.interviews.lists(), filters] as const,
    details: () => [...queryKeys.interviews.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.interviews.details(), id] as const,
    calendar: (dateRange: { start: string; end: string }) =>
      [...queryKeys.interviews.all, 'calendar', dateRange] as const,
    feedback: (id: string) =>
      [...queryKeys.interviews.all, id, 'feedback'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.notifications.all, 'list', filters] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    count: () => [...queryKeys.notifications.all, 'count'] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    reports: (type: string) =>
      [...queryKeys.analytics.all, 'reports', type] as const,
    metrics: (dateRange: { start: string; end: string }) =>
      [...queryKeys.analytics.all, 'metrics', dateRange] as const,
  },

  // Teams
  teams: {
    all: ['teams'] as const,
    list: () => [...queryKeys.teams.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.teams.all, id] as const,
    members: (id: string) => [...queryKeys.teams.all, id, 'members'] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    company: () => [...queryKeys.settings.all, 'company'] as const,
    user: () => [...queryKeys.settings.all, 'user'] as const,
    integrations: () => [...queryKeys.settings.all, 'integrations'] as const,
  },
};

// ============================================================
// CACHE INVALIDATION HELPERS
// ============================================================

export const invalidateQueries = {
  // Invalidate all queries for a domain
  all: (domain: keyof typeof queryKeys) => {
    queryClient.invalidateQueries({ queryKey: queryKeys[domain].all });
  },

  // Invalidate specific list queries
  lists: (domain: 'jobs' | 'applications' | 'candidates' | 'interviews') => {
    queryClient.invalidateQueries({ queryKey: queryKeys[domain].lists() });
  },

  // Invalidate a specific detail query
  detail: (
    domain: 'jobs' | 'applications' | 'candidates' | 'interviews',
    id: string
  ) => {
    queryClient.invalidateQueries({ queryKey: queryKeys[domain].detail(id) });
  },

  // Invalidate notifications
  notifications: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  },

  // Invalidate analytics
  analytics: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
  },
};

// ============================================================
// PREFETCH HELPERS
// ============================================================

export const prefetchQueries = {
  // Prefetch job details
  jobDetail: (id: string, queryFn: () => Promise<unknown>) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.detail(id),
      queryFn,
      staleTime: 1000 * 60 * 5,
    });
  },

  // Prefetch application details
  applicationDetail: (id: string, queryFn: () => Promise<unknown>) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.applications.detail(id),
      queryFn,
      staleTime: 1000 * 60 * 5,
    });
  },

  // Prefetch candidate profile
  candidateProfile: (id: string, queryFn: () => Promise<unknown>) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.candidates.detail(id),
      queryFn,
      staleTime: 1000 * 60 * 5,
    });
  },
};
