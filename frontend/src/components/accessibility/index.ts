// ============================================================
// ACCESSIBILITY COMPONENTS - Barrel Export
// ============================================================

export {
  // Components
  SkipLink,
  ScreenReaderOnly,
  VisuallyHidden,
  LiveRegion,
  Announcer,
  FocusTrap,
  FocusLock,
  FocusIndicator,
  AccessibleIcon,
  DescriptionList,
  AccessibleLoading,
  // Hooks
  useAnnouncer,
  useKeyboardNavigation,
  useRovingTabIndex,
  useFocusVisible,
  useReducedMotion,
  // Utilities
  getFocusableElements,
  getFirstFocusableElement,
  getLastFocusableElement,
  focusFirst,
  focusLast,
} from './Accessibility';

export type {
  SkipLinkProps,
  ScreenReaderOnlyProps,
  LiveRegionProps,
  FocusTrapProps,
  UseKeyboardNavigationOptions,
  UseRovingTabIndexOptions,
  FocusIndicatorProps,
  AccessibleIconProps,
  DescriptionListProps,
  AccessibleLoadingProps,
} from './Accessibility';
