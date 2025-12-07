// ============================================================
// ERROR PAGES - 404, 403, 500, and other error pages
// ============================================================

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

// ============================================
// Types
// ============================================
export interface ErrorPageProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  customAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

// ============================================
// Base Error Page Layout
// ============================================
const ErrorPageLayout: React.FC<{
  code: string | number;
  title: string;
  message: string;
  illustration?: React.ReactNode;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  customAction?: ErrorPageProps['customAction'];
  className?: string;
}> = ({
  code,
  title,
  message,
  illustration,
  showHomeButton = true,
  showBackButton = true,
  customAction,
  className,
}) => {
  const navigate = useNavigate();

  return (
    <div className={cn('min-h-screen flex items-center justify-center bg-gray-50 px-4', className)}>
      <div className="max-w-md w-full text-center">
        {/* Illustration or Code */}
        {illustration || (
          <div className="text-8xl font-bold text-gray-200 mb-4">
            {code}
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {showBackButton && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          )}

          {showHomeButton && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
          )}

          {customAction && (
            customAction.href ? (
              <Link
                to={customAction.href}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {customAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={customAction.onClick}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {customAction.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 404 Not Found Page
// ============================================
export const NotFoundPage: React.FC<ErrorPageProps> = ({
  title = 'Page Not Found',
  message = "Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.",
  ...props
}) => {
  const illustration = (
    <div className="mb-8">
      <svg className="w-48 h-48 mx-auto text-indigo-200" viewBox="0 0 200 200" fill="none">
        {/* Simple 404 illustration */}
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M60 80 L100 120 L140 80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="70" cy="90" r="8" fill="currentColor" />
        <circle cx="130" cy="90" r="8" fill="currentColor" />
        <path d="M70 130 Q100 110 130 130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
      <div className="text-6xl font-bold text-gray-200 mt-4">404</div>
    </div>
  );

  return (
    <ErrorPageLayout
      code={404}
      title={title}
      message={message}
      illustration={illustration}
      {...props}
    />
  );
};

// ============================================
// 403 Unauthorized Page
// ============================================
export const UnauthorizedPage: React.FC<ErrorPageProps> = ({
  title = 'Access Denied',
  message = "You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.",
  ...props
}) => {
  const location = useLocation();
  const state = location.state as { requiredRoles?: string[]; requiredPermissions?: string[] } | null;

  const detailedMessage = state?.requiredRoles
    ? `${message} Required roles: ${state.requiredRoles.join(', ')}`
    : message;

  const illustration = (
    <div className="mb-8">
      <svg className="w-48 h-48 mx-auto text-red-200" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M70 70 L130 130 M130 70 L70 130" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      </svg>
      <div className="text-6xl font-bold text-gray-200 mt-4">403</div>
    </div>
  );

  return (
    <ErrorPageLayout
      code={403}
      title={title}
      message={detailedMessage}
      illustration={illustration}
      customAction={{
        label: 'Request Access',
        onClick: () => {
          // Could open a modal or navigate to a request form
          console.log('Request access clicked');
        },
      }}
      {...props}
    />
  );
};

// ============================================
// 500 Server Error Page
// ============================================
export const ServerErrorPage: React.FC<ErrorPageProps & { onRetry?: () => void }> = ({
  title = 'Something Went Wrong',
  message = "We're experiencing some technical difficulties. Please try again later or contact support if the problem persists.",
  onRetry,
  ...props
}) => {
  const illustration = (
    <div className="mb-8">
      <svg className="w-48 h-48 mx-auto text-yellow-200" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M100 60 L100 110" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <circle cx="100" cy="135" r="6" fill="currentColor" />
      </svg>
      <div className="text-6xl font-bold text-gray-200 mt-4">500</div>
    </div>
  );

  return (
    <ErrorPageLayout
      code={500}
      title={title}
      message={message}
      illustration={illustration}
      customAction={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
      } : undefined}
      {...props}
    />
  );
};

// ============================================
// Maintenance Page
// ============================================
export interface MaintenancePageProps {
  title?: string;
  message?: string;
  estimatedTime?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  title = 'Under Maintenance',
  message = "We're currently performing scheduled maintenance. We'll be back shortly.",
  estimatedTime,
  showProgress = false,
  progress = 0,
  className,
}) => {
  return (
    <div className={cn('min-h-screen flex items-center justify-center bg-gray-50 px-4', className)}>
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <svg className="w-48 h-48 mx-auto text-indigo-200" viewBox="0 0 200 200" fill="none">
            {/* Wrench/gear illustration */}
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="4" fill="none" />
            <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="4" fill="none" />
            {/* Gear teeth */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <rect
                key={i}
                x="95"
                y="35"
                width="10"
                height="20"
                fill="currentColor"
                transform={`rotate(${angle} 100 100)`}
              />
            ))}
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-4">
          {message}
        </p>

        {/* Estimated Time */}
        {estimatedTime && (
          <p className="text-sm text-gray-500 mb-4">
            Estimated completion: {estimatedTime}
          </p>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Status Check Link */}
        <a
          href="https://status.example.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Check system status →
        </a>
      </div>
    </div>
  );
};

// ============================================
// Verify Email Page
// ============================================
export interface VerifyEmailPageProps {
  email?: string;
  onResend?: () => void;
  isResending?: boolean;
  className?: string;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({
  email,
  onResend,
  isResending = false,
  className,
}) => {
  return (
    <div className={cn('min-h-screen flex items-center justify-center bg-gray-50 px-4', className)}>
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          We've sent a verification link to:
        </p>
        {email && (
          <p className="font-medium text-gray-900 mb-6">
            {email}
          </p>
        )}

        <p className="text-sm text-gray-500 mb-6">
          Click the link in the email to verify your account. If you don't see it, check your spam folder.
        </p>

        {/* Resend Button */}
        {onResend && (
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isResending ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resend Email
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// Offline Page
// ============================================
export const OfflinePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You're Offline
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Please check your internet connection and try again.
        </p>

        {/* Retry Button */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    </div>
  );
};
