// ============================================================
// LAZY LOADING UTILITIES - Code splitting and lazy loading
// ============================================================

import React, { Suspense, ComponentType, lazy, useState, useEffect } from 'react';

// ============================================
// Types
// ============================================
export interface LazyComponentOptions {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface PreloadableComponent<T extends ComponentType<unknown>> {
  Component: React.LazyExoticComponent<T>;
  preload: () => Promise<{ default: T }>;
}

// ============================================
// Default Fallbacks
// ============================================
export const DefaultLoadingFallback: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  </div>
);

export const DefaultErrorFallback: React.FC<{
  error?: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-error-100 p-3">
        <svg
          className="h-6 w-6 text-error-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">Failed to load component</p>
        <p className="text-xs text-gray-500">{error?.message || 'An error occurred'}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// ============================================
// Error Boundary for Lazy Components
// ============================================
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class LazyErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error) => void;
    onRetry?: () => void;
  },
  ErrorBoundaryState
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error) => void;
    onRetry?: () => void;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Lazy component error:', error, errorInfo);
    this.props.onError?.(error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <DefaultErrorFallback
            error={this.state.error || undefined}
            onRetry={this.handleRetry}
          />
        )
      );
    }

    return this.props.children;
  }
}

// ============================================
// Lazy Loading with Retry
// ============================================
export function lazyWithRetry<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    retryCount?: number;
    retryDelay?: number;
  } = {}
): React.LazyExoticComponent<T> {
  const { retryCount = 3, retryDelay = 1000 } = options;

  const retryImport = async (): Promise<{ default: T }> => {
    let lastError: Error | null = null;

    for (let i = 0; i < retryCount; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        if (i < retryCount - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }
    }

    throw lastError;
  };

  return lazy(retryImport);
}

// ============================================
// Preloadable Lazy Component
// ============================================
export function lazyWithPreload<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const Component = lazy(importFn);

  return {
    Component,
    preload: importFn,
  };
}

// ============================================
// Lazy Component Wrapper
// ============================================
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
): React.FC<P> {
  const {
    fallback = <DefaultLoadingFallback />,
    errorFallback,
    onError,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const LazyComponent = lazyWithRetry(importFn, { retryCount, retryDelay });

  const WrappedComponent: React.FC<P> = (props) => {
    const [retryKey, setRetryKey] = useState(0);

    return (
      <LazyErrorBoundary
        key={retryKey}
        fallback={errorFallback}
        onError={onError}
        onRetry={() => setRetryKey((k) => k + 1)}
      >
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyErrorBoundary>
    );
  };

  WrappedComponent.displayName = `Lazy(${importFn.name || 'Component'})`;

  return WrappedComponent;
}

// ============================================
// Route-based Code Splitting
// ============================================
export const lazyRoutes = {
  // Dashboard
  Dashboard: lazyWithPreload(() => import('../../pages/Dashboard')),

  // Jobs
  JobsHub: lazyWithPreload(() => import('../../pages/jobs/JobsHub')),
  JobDetail: lazyWithPreload(() => import('../../pages/jobs/JobDetail')),
  JobCreate: lazyWithPreload(() => import('../../pages/jobs/JobCreate')),

  // Applications
  ApplicationsHub: lazyWithPreload(() => import('../../pages/applications/ApplicationsHub')),
  ApplicationDetail: lazyWithPreload(() => import('../../pages/applications/ApplicationDetail')),

  // Candidates
  CandidatesHub: lazyWithPreload(() => import('../../pages/candidates/CandidatesHub')),
  CandidateProfile: lazyWithPreload(() => import('../../pages/candidates/CandidateProfile')),

  // Interviews
  InterviewsHub: lazyWithPreload(() => import('../../pages/interviews/InterviewsHub')),
  InterviewDetail: lazyWithPreload(() => import('../../pages/interviews/InterviewDetail')),

  // Analytics
  AnalyticsHub: lazyWithPreload(() => import('../../pages/analytics/AnalyticsHub')),

  // Settings
  SettingsHub: lazyWithPreload(() => import('../../pages/settings/SettingsHub')),

  // Admin
  AdminHub: lazyWithPreload(() => import('../../pages/admin/AdminHub')),
};

// ============================================
// Preload on Hover/Focus
// ============================================
export function usePreloadOnInteraction<T extends ComponentType<unknown>>(
  preloadable: PreloadableComponent<T>
): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  const [preloaded, setPreloaded] = useState(false);

  const preload = (): void => {
    if (!preloaded) {
      preloadable.preload();
      setPreloaded(true);
    }
  };

  return {
    onMouseEnter: preload,
    onFocus: preload,
  };
}

// ============================================
// Preload on Visibility
// ============================================
export function usePreloadOnVisible<T extends ComponentType<unknown>>(
  preloadable: PreloadableComponent<T>,
  options?: IntersectionObserverInit
): React.RefObject<HTMLElement> {
  const ref = React.useRef<HTMLElement>(null);
  const [preloaded, setPreloaded] = useState(false);

  useEffect(() => {
    if (preloaded || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preloadable.preload();
          setPreloaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', ...options }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [preloadable, preloaded, options]);

  return ref;
}

// ============================================
// Batch Preloader
// ============================================
export async function preloadComponents(
  components: Array<PreloadableComponent<ComponentType<unknown>>>
): Promise<void> {
  await Promise.all(components.map((c) => c.preload().catch(() => {})));
}

export function preloadCriticalRoutes(): void {
  // Preload commonly accessed routes
  const criticalRoutes = [
    lazyRoutes.Dashboard,
    lazyRoutes.JobsHub,
    lazyRoutes.ApplicationsHub,
  ];

  // Use requestIdleCallback if available
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      preloadComponents(criticalRoutes);
    });
  } else {
    setTimeout(() => {
      preloadComponents(criticalRoutes);
    }, 2000);
  }
}

export default {
  createLazyComponent,
  lazyWithRetry,
  lazyWithPreload,
  lazyRoutes,
  preloadCriticalRoutes,
  usePreloadOnInteraction,
  usePreloadOnVisible,
};
