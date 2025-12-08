// ============================================================
// ROUTING COMPONENTS - Barrel Export
// ============================================================

// Route Guards
export {
  RouteGuard,
  PublicRoute,
  RoleBasedRoute,
  FeatureFlagRoute,
  MaintenanceRoute,
  RedirectWithState,
  RouteTransition,
} from './RouteGuard';

export type {
  UserRole,
  User,
  RouteGuardProps,
  PublicRouteProps,
  RoleBasedRouteProps,
  FeatureFlagRouteProps,
  MaintenanceRouteProps,
  RedirectWithStateProps,
  RouteTransitionProps,
} from './RouteGuard';

// Error Pages
export {
  NotFoundPage,
  UnauthorizedPage,
  ServerErrorPage,
  MaintenancePage,
  VerifyEmailPage,
  OfflinePage,
} from './ErrorPages';

export type {
  ErrorPageProps,
  MaintenancePageProps,
  VerifyEmailPageProps,
} from './ErrorPages';
