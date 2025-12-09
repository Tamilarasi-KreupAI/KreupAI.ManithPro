import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useUIStore, Toast, Modal } from '../uiStore';
import { act } from '@testing-library/react';

// Helper to reset store between tests
const resetStore = () => {
  act(() => {
    useUIStore.setState({
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
      theme: 'system',
      isMobileMenuOpen: false,
      breadcrumbs: [],
    });
  });
};

describe('uiStore', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useUIStore.getState();

      expect(state.sidebar.isOpen).toBe(true);
      expect(state.sidebar.isCollapsed).toBe(false);
      expect(state.sidebar.activeItem).toBeNull();
      expect(state.modals).toEqual([]);
      expect(state.toasts).toEqual([]);
      expect(state.globalLoading).toBe(false);
      expect(state.loadingStates).toEqual({});
      expect(state.commandPalette.isOpen).toBe(false);
      expect(state.commandPalette.query).toBe('');
      expect(state.theme).toBe('system');
      expect(state.isMobileMenuOpen).toBe(false);
      expect(state.breadcrumbs).toEqual([]);
    });
  });

  describe('sidebar actions', () => {
    it('toggleSidebar should toggle sidebar open state', () => {
      expect(useUIStore.getState().sidebar.isOpen).toBe(true);

      act(() => {
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().sidebar.isOpen).toBe(false);

      act(() => {
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().sidebar.isOpen).toBe(true);
    });

    it('setSidebarOpen should set sidebar open state', () => {
      act(() => {
        useUIStore.getState().setSidebarOpen(false);
      });

      expect(useUIStore.getState().sidebar.isOpen).toBe(false);
    });

    it('setSidebarCollapsed should set sidebar collapsed state', () => {
      act(() => {
        useUIStore.getState().setSidebarCollapsed(true);
      });

      expect(useUIStore.getState().sidebar.isCollapsed).toBe(true);
    });

    it('setActiveSidebarItem should set active item', () => {
      act(() => {
        useUIStore.getState().setActiveSidebarItem('dashboard');
      });

      expect(useUIStore.getState().sidebar.activeItem).toBe('dashboard');
    });

    it('setActiveSidebarItem should clear with null', () => {
      act(() => {
        useUIStore.getState().setActiveSidebarItem('dashboard');
        useUIStore.getState().setActiveSidebarItem(null);
      });

      expect(useUIStore.getState().sidebar.activeItem).toBeNull();
    });
  });

  describe('modal actions', () => {
    it('openModal should add modal and return id', () => {
      let modalId: string;

      act(() => {
        modalId = useUIStore.getState().openModal({
          type: 'confirm',
          title: 'Confirm Action',
          message: 'Are you sure?',
        });
      });

      expect(modalId!).toBeDefined();
      expect(useUIStore.getState().modals.length).toBe(1);
      expect(useUIStore.getState().modals[0].title).toBe('Confirm Action');
    });

    it('closeModal with id should remove specific modal', () => {
      let modalId1: string;
      let modalId2: string;

      act(() => {
        modalId1 = useUIStore.getState().openModal({ type: 'alert', title: 'Alert 1' });
        modalId2 = useUIStore.getState().openModal({ type: 'alert', title: 'Alert 2' });
      });

      expect(useUIStore.getState().modals.length).toBe(2);

      act(() => {
        useUIStore.getState().closeModal(modalId1!);
      });

      expect(useUIStore.getState().modals.length).toBe(1);
      expect(useUIStore.getState().modals[0].id).toBe(modalId2!);
    });

    it('closeModal without id should remove last modal', () => {
      act(() => {
        useUIStore.getState().openModal({ type: 'alert', title: 'Alert 1' });
        useUIStore.getState().openModal({ type: 'alert', title: 'Alert 2' });
      });

      act(() => {
        useUIStore.getState().closeModal();
      });

      expect(useUIStore.getState().modals.length).toBe(1);
      expect(useUIStore.getState().modals[0].title).toBe('Alert 1');
    });

    it('closeAllModals should remove all modals', () => {
      act(() => {
        useUIStore.getState().openModal({ type: 'alert', title: 'Alert 1' });
        useUIStore.getState().openModal({ type: 'alert', title: 'Alert 2' });
        useUIStore.getState().openModal({ type: 'alert', title: 'Alert 3' });
      });

      expect(useUIStore.getState().modals.length).toBe(3);

      act(() => {
        useUIStore.getState().closeAllModals();
      });

      expect(useUIStore.getState().modals.length).toBe(0);
    });

    it('setModalLoading should update modal loading state', () => {
      let modalId: string;

      act(() => {
        modalId = useUIStore.getState().openModal({ type: 'form', title: 'Form' });
      });

      expect(useUIStore.getState().modals[0].isLoading).toBeUndefined();

      act(() => {
        useUIStore.getState().setModalLoading(modalId!, true);
      });

      expect(useUIStore.getState().modals[0].isLoading).toBe(true);

      act(() => {
        useUIStore.getState().setModalLoading(modalId!, false);
      });

      expect(useUIStore.getState().modals[0].isLoading).toBe(false);
    });
  });

  describe('toast actions', () => {
    it('addToast should add toast and return id', () => {
      let toastId: string;

      act(() => {
        toastId = useUIStore.getState().addToast({
          type: 'success',
          title: 'Success!',
          message: 'Operation completed',
        });
      });

      expect(toastId!).toBeDefined();
      expect(useUIStore.getState().toasts.length).toBe(1);
      expect(useUIStore.getState().toasts[0].title).toBe('Success!');
    });

    it('addToast should auto-remove after duration', () => {
      act(() => {
        useUIStore.getState().addToast({
          type: 'success',
          title: 'Success!',
          duration: 3000,
        });
      });

      expect(useUIStore.getState().toasts.length).toBe(1);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(useUIStore.getState().toasts.length).toBe(0);
    });

    it('addToast should use default duration of 5000ms', () => {
      act(() => {
        useUIStore.getState().addToast({
          type: 'info',
          title: 'Info',
        });
      });

      expect(useUIStore.getState().toasts.length).toBe(1);

      act(() => {
        vi.advanceTimersByTime(4999);
      });

      expect(useUIStore.getState().toasts.length).toBe(1);

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(useUIStore.getState().toasts.length).toBe(0);
    });

    it('addToast with loading type should not auto-remove', () => {
      act(() => {
        useUIStore.getState().addToast({
          type: 'loading',
          title: 'Loading...',
        });
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(useUIStore.getState().toasts.length).toBe(1);
    });

    it('removeToast should remove specific toast', () => {
      let toastId1: string;
      let toastId2: string;

      act(() => {
        toastId1 = useUIStore.getState().addToast({ type: 'loading', title: 'Toast 1' });
        toastId2 = useUIStore.getState().addToast({ type: 'loading', title: 'Toast 2' });
      });

      act(() => {
        useUIStore.getState().removeToast(toastId1!);
      });

      expect(useUIStore.getState().toasts.length).toBe(1);
      expect(useUIStore.getState().toasts[0].id).toBe(toastId2!);
    });

    it('clearToasts should remove all toasts', () => {
      act(() => {
        useUIStore.getState().addToast({ type: 'loading', title: 'Toast 1' });
        useUIStore.getState().addToast({ type: 'loading', title: 'Toast 2' });
      });

      act(() => {
        useUIStore.getState().clearToasts();
      });

      expect(useUIStore.getState().toasts.length).toBe(0);
    });
  });

  describe('loading actions', () => {
    it('setGlobalLoading should set global loading state', () => {
      act(() => {
        useUIStore.getState().setGlobalLoading(true);
      });

      expect(useUIStore.getState().globalLoading).toBe(true);
    });

    it('setLoadingState should set named loading state', () => {
      act(() => {
        useUIStore.getState().setLoadingState('fetchUsers', true);
      });

      expect(useUIStore.getState().loadingStates.fetchUsers).toBe(true);
    });

    it('setLoadingState false should remove key', () => {
      act(() => {
        useUIStore.getState().setLoadingState('fetchUsers', true);
        useUIStore.getState().setLoadingState('fetchUsers', false);
      });

      expect(useUIStore.getState().loadingStates.fetchUsers).toBeUndefined();
    });

    it('isLoading should return loading state for key', () => {
      act(() => {
        useUIStore.getState().setLoadingState('fetchUsers', true);
      });

      expect(useUIStore.getState().isLoading('fetchUsers')).toBe(true);
      expect(useUIStore.getState().isLoading('otherKey')).toBe(false);
    });
  });

  describe('command palette actions', () => {
    it('openCommandPalette should open palette', () => {
      act(() => {
        useUIStore.getState().openCommandPalette();
      });

      expect(useUIStore.getState().commandPalette.isOpen).toBe(true);
    });

    it('closeCommandPalette should close and clear query', () => {
      act(() => {
        useUIStore.getState().openCommandPalette();
        useUIStore.getState().setCommandQuery('search term');
        useUIStore.getState().closeCommandPalette();
      });

      const { commandPalette } = useUIStore.getState();
      expect(commandPalette.isOpen).toBe(false);
      expect(commandPalette.query).toBe('');
    });

    it('setCommandQuery should update query', () => {
      act(() => {
        useUIStore.getState().setCommandQuery('test query');
      });

      expect(useUIStore.getState().commandPalette.query).toBe('test query');
    });

    it('addRecentSearch should add to recent searches', () => {
      act(() => {
        useUIStore.getState().addRecentSearch('search 1');
        useUIStore.getState().addRecentSearch('search 2');
      });

      const { recentSearches } = useUIStore.getState().commandPalette;
      expect(recentSearches).toContain('search 1');
      expect(recentSearches).toContain('search 2');
      expect(recentSearches[0]).toBe('search 2'); // most recent first
    });

    it('addRecentSearch should not duplicate and move to front', () => {
      act(() => {
        useUIStore.getState().addRecentSearch('search 1');
        useUIStore.getState().addRecentSearch('search 2');
        useUIStore.getState().addRecentSearch('search 1');
      });

      const { recentSearches } = useUIStore.getState().commandPalette;
      expect(recentSearches.filter(s => s === 'search 1').length).toBe(1);
      expect(recentSearches[0]).toBe('search 1');
    });

    it('addRecentSearch should limit to 10 items', () => {
      act(() => {
        for (let i = 0; i < 15; i++) {
          useUIStore.getState().addRecentSearch(`search ${i}`);
        }
      });

      expect(useUIStore.getState().commandPalette.recentSearches.length).toBe(10);
    });
  });

  describe('theme actions', () => {
    it('setTheme should update theme', () => {
      act(() => {
        useUIStore.getState().setTheme('dark');
      });

      expect(useUIStore.getState().theme).toBe('dark');

      act(() => {
        useUIStore.getState().setTheme('light');
      });

      expect(useUIStore.getState().theme).toBe('light');
    });
  });

  describe('mobile menu actions', () => {
    it('toggleMobileMenu should toggle state', () => {
      expect(useUIStore.getState().isMobileMenuOpen).toBe(false);

      act(() => {
        useUIStore.getState().toggleMobileMenu();
      });

      expect(useUIStore.getState().isMobileMenuOpen).toBe(true);
    });

    it('setMobileMenuOpen should set state', () => {
      act(() => {
        useUIStore.getState().setMobileMenuOpen(true);
      });

      expect(useUIStore.getState().isMobileMenuOpen).toBe(true);
    });
  });

  describe('breadcrumbs actions', () => {
    it('setBreadcrumbs should set breadcrumbs', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Jobs', href: '/jobs' },
        { label: 'Software Engineer' },
      ];

      act(() => {
        useUIStore.getState().setBreadcrumbs(breadcrumbs);
      });

      expect(useUIStore.getState().breadcrumbs).toEqual(breadcrumbs);
    });
  });

  describe('helper methods', () => {
    it('showConfirm should open confirm modal', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      act(() => {
        useUIStore.getState().showConfirm({
          title: 'Delete Item',
          message: 'Are you sure?',
          onConfirm,
          onCancel,
          confirmText: 'Delete',
          cancelText: 'Keep',
          variant: 'danger',
        });
      });

      const modal = useUIStore.getState().modals[0];
      expect(modal.type).toBe('confirm');
      expect(modal.title).toBe('Delete Item');
      expect(modal.message).toBe('Are you sure?');
      expect(modal.confirmText).toBe('Delete');
      expect(modal.cancelText).toBe('Keep');
      expect(modal.variant).toBe('danger');
      expect(modal.size).toBe('sm');
    });

    it('showConfirm should use default button texts', () => {
      act(() => {
        useUIStore.getState().showConfirm({
          title: 'Confirm',
          message: 'Continue?',
          onConfirm: () => {},
        });
      });

      const modal = useUIStore.getState().modals[0];
      expect(modal.confirmText).toBe('Confirm');
      expect(modal.cancelText).toBe('Cancel');
      expect(modal.variant).toBe('default');
    });

    it('showAlert should open alert modal', () => {
      const onClose = vi.fn();

      act(() => {
        useUIStore.getState().showAlert({
          title: 'Error',
          message: 'Something went wrong',
          onClose,
        });
      });

      const modal = useUIStore.getState().modals[0];
      expect(modal.type).toBe('alert');
      expect(modal.title).toBe('Error');
      expect(modal.message).toBe('Something went wrong');
      expect(modal.confirmText).toBe('OK');
      expect(modal.size).toBe('sm');
    });
  });

  describe('selectors', () => {
    it('selectSidebar should return sidebar state', () => {
      act(() => {
        useUIStore.getState().setSidebarCollapsed(true);
        useUIStore.getState().setActiveSidebarItem('jobs');
      });

      const { selectSidebar } = require('../uiStore');
      const sidebar = selectSidebar(useUIStore.getState());

      expect(sidebar.isCollapsed).toBe(true);
      expect(sidebar.activeItem).toBe('jobs');
    });

    it('selectModals should return modals array', () => {
      act(() => {
        useUIStore.getState().openModal({ type: 'alert', title: 'Test' });
      });

      const { selectModals } = require('../uiStore');
      expect(selectModals(useUIStore.getState()).length).toBe(1);
    });

    it('selectToasts should return toasts array', () => {
      act(() => {
        useUIStore.getState().addToast({ type: 'loading', title: 'Loading' });
      });

      const { selectToasts } = require('../uiStore');
      expect(selectToasts(useUIStore.getState()).length).toBe(1);
    });

    it('selectTheme should return current theme', () => {
      act(() => {
        useUIStore.getState().setTheme('dark');
      });

      const { selectTheme } = require('../uiStore');
      expect(selectTheme(useUIStore.getState())).toBe('dark');
    });

    it('selectGlobalLoading should return loading state', () => {
      act(() => {
        useUIStore.getState().setGlobalLoading(true);
      });

      const { selectGlobalLoading } = require('../uiStore');
      expect(selectGlobalLoading(useUIStore.getState())).toBe(true);
    });

    it('selectCommandPalette should return command palette state', () => {
      act(() => {
        useUIStore.getState().openCommandPalette();
        useUIStore.getState().setCommandQuery('test');
      });

      const { selectCommandPalette } = require('../uiStore');
      const cp = selectCommandPalette(useUIStore.getState());

      expect(cp.isOpen).toBe(true);
      expect(cp.query).toBe('test');
    });
  });

  describe('modal with callbacks', () => {
    it('should store onConfirm callback', async () => {
      const onConfirm = vi.fn();

      act(() => {
        useUIStore.getState().openModal({
          type: 'confirm',
          title: 'Test',
          onConfirm,
        });
      });

      const modal = useUIStore.getState().modals[0];
      expect(modal.onConfirm).toBe(onConfirm);
    });

    it('should store onCancel callback', () => {
      const onCancel = vi.fn();

      act(() => {
        useUIStore.getState().openModal({
          type: 'confirm',
          title: 'Test',
          onCancel,
        });
      });

      const modal = useUIStore.getState().modals[0];
      expect(modal.onCancel).toBe(onCancel);
    });
  });

  describe('toast with action', () => {
    it('should store action in toast', () => {
      const onClick = vi.fn();

      act(() => {
        useUIStore.getState().addToast({
          type: 'loading',
          title: 'Processing',
          action: {
            label: 'Cancel',
            onClick,
          },
        });
      });

      const toast = useUIStore.getState().toasts[0];
      expect(toast.action?.label).toBe('Cancel');
      expect(toast.action?.onClick).toBe(onClick);
    });
  });
});
