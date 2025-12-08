import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ReactNode } from 'react';

// ============================================================
// UI STORE - Global UI State Management
// ============================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  type: 'confirm' | 'alert' | 'form' | 'custom';
  title?: string;
  message?: string | ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
  content?: ReactNode;
  isLoading?: boolean;
}

export interface Sidebar {
  isOpen: boolean;
  isCollapsed: boolean;
  activeItem: string | null;
}

export interface CommandPalette {
  isOpen: boolean;
  query: string;
  recentSearches: string[];
}

interface UIState {
  // Sidebar
  sidebar: Sidebar;

  // Modals
  modals: Modal[];

  // Toasts
  toasts: Toast[];

  // Loading States
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;

  // Command Palette
  commandPalette: CommandPalette;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Mobile
  isMobileMenuOpen: boolean;

  // Breadcrumbs
  breadcrumbs: Array<{ label: string; href?: string }>;

  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveSidebarItem: (item: string | null) => void;

  // Actions - Modals
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  setModalLoading: (id: string, loading: boolean) => void;

  // Actions - Toasts
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Actions - Loading
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;

  // Actions - Command Palette
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setCommandQuery: (query: string) => void;
  addRecentSearch: (search: string) => void;

  // Actions - Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Actions - Mobile
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;

  // Actions - Breadcrumbs
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;

  // Helpers
  showConfirm: (options: {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'danger' | 'warning';
  }) => string;

  showAlert: (options: {
    title: string;
    message: string;
    onClose?: () => void;
  }) => string;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const initialState = {
  sidebar: {
    isOpen: true,
    isCollapsed: false,
    activeItem: null,
  },
  modals: [],
  toasts: [],
  globalLoading: false,
  loadingStates: {},
  commandPalette: {
    isOpen: false,
    query: '',
    recentSearches: [],
  },
  theme: 'system' as const,
  isMobileMenuOpen: false,
  breadcrumbs: [],
};

export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    ...initialState,

    // Sidebar Actions
    toggleSidebar: () =>
      set((state) => {
        state.sidebar.isOpen = !state.sidebar.isOpen;
      }),

    setSidebarOpen: (open) =>
      set((state) => {
        state.sidebar.isOpen = open;
      }),

    setSidebarCollapsed: (collapsed) =>
      set((state) => {
        state.sidebar.isCollapsed = collapsed;
      }),

    setActiveSidebarItem: (item) =>
      set((state) => {
        state.sidebar.activeItem = item;
      }),

    // Modal Actions
    openModal: (modal) => {
      const id = generateId();
      set((state) => {
        state.modals.push({ ...modal, id });
      });
      return id;
    },

    closeModal: (id) =>
      set((state) => {
        if (id) {
          state.modals = state.modals.filter((m) => m.id !== id);
        } else if (state.modals.length > 0) {
          state.modals.pop();
        }
      }),

    closeAllModals: () =>
      set((state) => {
        state.modals = [];
      }),

    setModalLoading: (id, loading) =>
      set((state) => {
        const modal = state.modals.find((m) => m.id === id);
        if (modal) {
          modal.isLoading = loading;
        }
      }),

    // Toast Actions
    addToast: (toast) => {
      const id = generateId();
      set((state) => {
        state.toasts.push({ ...toast, id });
      });

      // Auto-remove after duration (default 5000ms for non-loading)
      if (toast.type !== 'loading') {
        const duration = toast.duration || 5000;
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      }

      return id;
    },

    removeToast: (id) =>
      set((state) => {
        state.toasts = state.toasts.filter((t) => t.id !== id);
      }),

    clearToasts: () =>
      set((state) => {
        state.toasts = [];
      }),

    // Loading Actions
    setGlobalLoading: (loading) =>
      set((state) => {
        state.globalLoading = loading;
      }),

    setLoadingState: (key, loading) =>
      set((state) => {
        if (loading) {
          state.loadingStates[key] = true;
        } else {
          delete state.loadingStates[key];
        }
      }),

    isLoading: (key) => get().loadingStates[key] || false,

    // Command Palette Actions
    openCommandPalette: () =>
      set((state) => {
        state.commandPalette.isOpen = true;
      }),

    closeCommandPalette: () =>
      set((state) => {
        state.commandPalette.isOpen = false;
        state.commandPalette.query = '';
      }),

    setCommandQuery: (query) =>
      set((state) => {
        state.commandPalette.query = query;
      }),

    addRecentSearch: (search) =>
      set((state) => {
        const recent = state.commandPalette.recentSearches.filter(
          (s) => s !== search
        );
        state.commandPalette.recentSearches = [search, ...recent].slice(0, 10);
      }),

    // Theme Actions
    setTheme: (theme) =>
      set((state) => {
        state.theme = theme;
      }),

    // Mobile Actions
    toggleMobileMenu: () =>
      set((state) => {
        state.isMobileMenuOpen = !state.isMobileMenuOpen;
      }),

    setMobileMenuOpen: (open) =>
      set((state) => {
        state.isMobileMenuOpen = open;
      }),

    // Breadcrumbs Actions
    setBreadcrumbs: (breadcrumbs) =>
      set((state) => {
        state.breadcrumbs = breadcrumbs;
      }),

    // Helper Methods
    showConfirm: (options) => {
      return get().openModal({
        type: 'confirm',
        title: options.title,
        message: options.message,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'default',
        size: 'sm',
      });
    },

    showAlert: (options) => {
      return get().openModal({
        type: 'alert',
        title: options.title,
        message: options.message,
        onConfirm: options.onClose,
        confirmText: 'OK',
        size: 'sm',
      });
    },
  }))
);

// Selectors
export const selectSidebar = (state: UIState) => state.sidebar;
export const selectModals = (state: UIState) => state.modals;
export const selectToasts = (state: UIState) => state.toasts;
export const selectTheme = (state: UIState) => state.theme;
export const selectGlobalLoading = (state: UIState) => state.globalLoading;
export const selectCommandPalette = (state: UIState) => state.commandPalette;
