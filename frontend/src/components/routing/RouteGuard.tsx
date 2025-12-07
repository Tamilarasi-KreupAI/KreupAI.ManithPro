// ============================================================
// ROUTE GUARD - Route protection and access control
// ============================================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { cn } from '../../utils/cn';

// ============================================
// Types
// ============================================
export type UserRole = 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | 'candidate' | 'guest';

export interface User {
  id: string;
  email: string;
  roles: UserRole[];
  permissions?: string[];
  isVerified?: boolean;
  isOnboarded?: boolean;
}

export interface RouteGuardProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: UserRole[];
  requirePermissions?: string[];
  requireVerified?: boolean;
  requireOnboarded?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  // These would typically come from auth context
  user?: User | null;
  isAuthenticated?: boolean;
  isLoading?: boolean;
}

// ============================================
// Loading Spinner
// ============================================
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

// ============================================
// Route Guard Component
// ============================================
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = true,
  requireRoles = [],
  requirePermissions = [],
  requireVerified = false,
  requireOnboarded = false,
  redirectTo = '/login',
  fallback,
  user,
  isAuthenticated = false,
  isLoading = false,
}) => {
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname, message: 'Please sign in to continue' }}
        replace
      />
    );
  }

  // Check if user object exists when authenticated
  if (requireAuth && isAuthenticated && !user) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname, message: 'Session expired' }}
        replace
      />
    );
  }

  // Check roles
  if (requireRoles.length > 0 && user) {
    const hasRequiredRole = requireRoles.some((role) => user.roles.includes(role));
    if (!hasRequiredRole) {
      return (
        <Navigate
          to="/unauthorized"
          state={{ requiredRoles: requireRoles }}
          replace
        />
      );
    }
  }

  // Check permissions
  if (requirePermissions.length > 0 && user) {
    const userPermissions = user.permissions || [];
    const hasRequiredPermissions = requirePermissions.every((perm) =>
      userPermissions.includes(perm)
    );
    if (!hasRequiredPermissions) {
      return (
        <Navigate
          to="/unauthorized"
          state={{ requiredPermissions: requirePermissions }}
          replace
        />
      );
    }
  }

  // Check email verification
  if (requireVerified && user && !user.isVerified) {
    return <Navigate to="/verify-email" state={{ from: location.pathname }} replace />;
  }

  // Check onboarding
  if (requireOnboarded && user && !user.isOnboarded) {
    return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  }

  // Render children or outlet
  return <>{children || <Outlet />}</>;
};

// ============================================
// Public Route (redirect if authenticated)
// ============================================
export interface PublicRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
  isAuthenticated?: boolean;
  isLoading?: boolean;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard',
  isAuthenticated = false,
  isLoading = false,
}) => {
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Redirect to the page they came from, or dashboard
    const from = (location.state as { from?: string })?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children || <Outlet />}</>;
};

// ============================================
// Role-Based Route
// ============================================
export interface RoleBasedRouteProps {
  children?: React.ReactNode;
  allowedRoles: UserRole[];
  user?: User | null;
  fallback?: React.ReactNode;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  user,
  fallback,
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = allowedRoles.some((role) => user.roles.includes(role));

  if (!hasRole) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" replace />;
  }

  return <>{children || <Outlet />}</>;
};

// ============================================
// Feature Flag Route
// ============================================
export interface FeatureFlagRouteProps {
  children?: React.ReactNode;
  featureFlag: string;
  enabledFeatures?: string[];
  fallbackPath?: string;
  fallback?: React.ReactNode;
}

export const FeatureFlagRoute: React.FC<FeatureFlagRouteProps> = ({
  children,
  featureFlag,
  enabledFeatures = [],
  fallbackPath = '/404',
  fallback,
}) => {
  const isEnabled = enabledFeatures.includes(featureFlag);

  if (!isEnabled) {
    return fallback ? <>{fallback}</> : <Navigate to={fallbackPath} replace />;
  }

  return <>{children || <Outlet />}</>;
};

// ============================================
// Maintenance Route
// ============================================
export interface MaintenanceRouteProps {
  children?: React.ReactNode;
  isMaintenanceMode?: boolean;
  bypassRoles?: UserRole[];
  user?: User | null;
}

export const MaintenanceRoute: React.FC<MaintenanceRouteProps> = ({
  children,
  isMaintenanceMode = false,
  bypassRoles = ['admin'],
  user,
}) => {
  if (isMaintenanceMode) {
    const canBypass = user && bypassRoles.some((role) => user.roles.includes(role));

    if (!canBypass) {
      return <Navigate to="/maintenance" replace />;
    }
  }

  return <>{children || <Outlet />}</>;
};

// ============================================
// Redirect with State
// ============================================
export interface RedirectWithStateProps {
  to: string;
  state?: Record<string, unknown>;
  preserveSearch?: boolean;
}

export const RedirectWithState: React.FC<RedirectWithStateProps> = ({
  to,
  state,
  preserveSearch = false,
}) => {
  const location = useLocation();

  const destination = preserveSearch ? `${to}${location.search}` : to;

  return (
    <Navigate
      to={destination}
      state={{ ...state, from: location.pathname }}
      replace
    />
  );
};

// ============================================
// Route Transition Wrapper
// ============================================
export interface RouteTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
};
