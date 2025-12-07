// ============================================================
// KREUPAI MANITHPRO - ZUSTAND STORE EXPORTS
// ============================================================
// Centralized state management using Zustand with:
// - Immer for immutable state updates
// - Persistence for critical stores
// - TypeScript for type safety
// ============================================================

// Auth Store - User authentication & session management
export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectUserRole,
  selectUserPermissions,
} from './authStore';
export type { User, Session, UserPreferences } from './authStore';

// UI Store - Global UI state (modals, toasts, sidebar, etc.)
export {
  useUIStore,
  selectSidebar,
  selectModals,
  selectToasts,
  selectTheme,
  selectGlobalLoading,
  selectCommandPalette,
} from './uiStore';
export type { Toast, Modal, Sidebar, CommandPalette } from './uiStore';

// Application Store - Job applications state
export {
  useApplicationStore,
  selectApplications,
  selectSelectedIds,
  selectCurrentApplication,
  selectFilters,
  selectPagination,
} from './applicationStore';
export type {
  Application,
  ApplicationStatus,
  ApplicationFilters,
  PipelineStage,
} from './applicationStore';

// Notification Store - Notifications state
export {
  useNotificationStore,
  selectNotifications,
  selectUnreadCount,
  selectIsOpen,
  selectPreferences,
} from './notificationStore';
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationFilters,
  NotificationPreferences,
} from './notificationStore';

// ============================================================
// STORE USAGE EXAMPLES
// ============================================================
/*
// Auth Store
const { user, login, logout, isAuthenticated } = useAuthStore();
const user = useAuthStore((state) => state.user);

// UI Store
const { openModal, addToast, sidebar } = useUIStore();
const showConfirm = useUIStore((state) => state.showConfirm);

// Application Store
const { applications, setFilters, bulkUpdateStatus } = useApplicationStore();
const filtered = useApplicationStore((state) => state.getFilteredApplications());

// Notification Store
const { notifications, markAsRead, unreadCount } = useNotificationStore();
const unread = useNotificationStore((state) => state.getUnreadNotifications());
*/

// ============================================================
// GLOBAL STORE RESET (for logout)
// ============================================================
export function resetAllStores() {
  useAuthStore.getState().logout();
  useApplicationStore.setState({
    applications: [],
    selectedIds: [],
    currentApplication: null,
    pipelineStages: [],
    pipelineJobId: null,
    filters: {},
    page: 1,
    totalCount: 0,
  });
  useNotificationStore.setState({
    notifications: [],
    unreadCount: 0,
    filters: {},
    page: 1,
    hasMore: true,
  });
  useUIStore.getState().closeAllModals();
  useUIStore.getState().clearToasts();
}
