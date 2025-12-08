import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/Button';

// ============================================================
// ERROR BOUNDARY - Catches React rendering errors
// ============================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error info
    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    this.props.onReset?.();
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-error-600 dark:text-error-400" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
              Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              We apologize for the inconvenience. An unexpected error has
              occurred.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="flex-1"
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex-1"
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go Home
              </Button>
            </div>

            {/* Error Details Toggle */}
            <button
              onClick={this.toggleDetails}
              className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Bug className="h-4 w-4" />
              Technical Details
              {this.state.showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {/* Error Details */}
            {this.state.showDetails && this.state.error && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto max-h-64">
                <p className="text-sm font-mono text-error-600 dark:text-error-400 mb-2">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Support Link */}
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
              If the problem persists, please{' '}
              <a
                href="mailto:support@kreupai.com"
                className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================
// ERROR FALLBACK COMPONENT - For use with Suspense boundaries
// ============================================================

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-6 bg-error-50 dark:bg-error-900/20 rounded-xl border border-error-200 dark:border-error-800">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-error-100 dark:bg-error-900/50 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-error-600 dark:text-error-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error.message}
          </p>
          <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// NOT FOUND PAGE
// ============================================================

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 -mt-4 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => window.history.back()}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Go Back
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAINTENANCE PAGE
// ============================================================

interface MaintenancePageProps {
  title?: string;
  message?: string;
  estimatedTime?: string;
}

export function MaintenancePage({
  title = 'Under Maintenance',
  message = "We're currently performing scheduled maintenance. Please check back soon.",
  estimatedTime,
}: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center mx-auto mb-6">
          <svg
            className="h-10 w-10 text-warning-600 dark:text-warning-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
        {estimatedTime && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Estimated completion: {estimatedTime}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// OFFLINE PAGE
// ============================================================

export function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
          <svg
            className="h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          You're Offline
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please check your internet connection and try again.
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
