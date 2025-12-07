// ============================================================
// KREUPAI MANITHPRO - UI COMPONENT LIBRARY
// ============================================================
// A comprehensive, enterprise-grade UI component library built with
// React, TypeScript, Tailwind CSS, and Headless UI.
// ============================================================

// Button Component
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

// Input Component
export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

// Card Components
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
} from './Card';
export type { CardProps } from './Card';

// Modal Components
export { Modal, ConfirmModal, AlertModal } from './Modal';
export type { ModalProps, ConfirmModalProps, AlertModalProps } from './Modal';

// Badge Components
export { Badge, StatusBadge, badgeVariants } from './Badge';
export type { BadgeProps, StatusBadgeProps } from './Badge';

// Toast Components
export { toast, ToastProvider } from './Toast';

// DataTable Component
export { DataTable } from './DataTable';
export type { DataTableProps, ColumnDef } from './DataTable';

// Loading Components
export {
  Spinner,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  PageLoader,
  InlineLoader,
  ProgressBar,
  DotsLoader,
  spinnerVariants,
  skeletonVariants,
  progressVariants,
} from './Loading';
export type {
  SpinnerProps,
  SkeletonProps,
  SkeletonCardProps,
  SkeletonTableProps,
  SkeletonListProps,
  PageLoaderProps,
  InlineLoaderProps,
  ProgressBarProps,
  DotsLoaderProps,
} from './Loading';

// Empty State Components
export {
  EmptyState,
  NoResults,
  NoData,
  ErrorState,
  OfflineState,
  AccessDenied,
  NotFound,
  EmptyFolder,
  EmptyCart,
  NoEvents,
  NoMessages,
  NoNotifications,
  NoTeamMembers,
  ComingSoon,
  NoFavorites,
  NoBookmarks,
} from './EmptyState';
export type {
  EmptyStateProps,
  NoResultsProps,
  NoDataProps,
  ErrorStateProps,
  OfflineStateProps,
  AccessDeniedProps,
  NotFoundProps,
  EmptyFolderProps,
  EmptyCartProps,
  NoEventsProps,
  NoMessagesProps,
  NoNotificationsProps,
  NoTeamMembersProps,
  ComingSoonProps,
  NoFavoritesProps,
  NoBookmarksProps,
} from './EmptyState';

// Form Components
export {
  Textarea,
  Select,
  Checkbox,
  Switch,
  RadioGroup,
  FormField,
  textareaVariants,
} from './Form';
export type {
  TextareaProps,
  SelectProps,
  SelectOption,
  CheckboxProps,
  SwitchProps,
  RadioGroupProps,
  RadioOption,
  FormFieldProps,
} from './Form';

// Responsive Components & Hooks
export {
  Show,
  Hide,
  Container,
  Grid,
  Stack,
  HStack,
  VStack,
  AspectRatio,
  Spacer,
  Divider,
  ResponsiveProvider,
  useMediaQuery,
  useBreakpoint,
  useBreakpointDown,
  useBreakpointBetween,
  useCurrentBreakpoint,
  useDeviceType,
  useResponsive,
  breakpoints,
} from './Responsive';
export type {
  ShowProps,
  HideProps,
  ContainerProps,
  GridProps,
  StackProps,
  HStackProps,
  VStackProps,
  AspectRatioProps,
  SpacerProps,
  DividerProps,
  ResponsiveProviderProps,
  Breakpoint,
} from './Responsive';

// Accessibility Components & Hooks
export {
  VisuallyHidden,
  SkipLink,
  FocusTrap,
  LiveRegion,
  AnnouncerProvider,
  KeyboardNavigation,
  SrOnly,
  FocusRing,
  RovingTabIndex,
  DescribedBy,
  useAnnouncer,
  usePrefersReducedMotion,
  usePrefersHighContrast,
  usePrefersColorScheme,
  useId,
  getFocusableElements,
} from './Accessibility';
export type {
  VisuallyHiddenProps,
  SkipLinkProps,
  FocusTrapProps,
  LiveRegionProps,
  AnnouncerProviderProps,
  KeyboardNavigationProps,
  SrOnlyProps,
  FocusRingProps,
  RovingTabIndexProps,
  DescribedByProps,
} from './Accessibility';

// Animation Components & Utilities
export {
  AnimationProvider,
  Fade,
  Slide,
  Scale,
  Collapse,
  Stagger,
  AnimateOnScroll,
  Pulse,
  Shake,
  TransitionGroup,
  useAnimation,
  keyframes,
} from './Animation';
export type {
  FadeProps,
  SlideProps,
  ScaleProps,
  CollapseProps,
  StaggerProps,
  AnimateOnScrollProps,
  PulseProps,
  ShakeProps,
  TransitionGroupProps,
  AnimationProviderProps,
} from './Animation';

// ============================================================
// COMPONENT OVERVIEW
// ============================================================
/*
This UI library provides:

1. CORE COMPONENTS
   - Button: Primary interactive element with 8 variants, 9 sizes, loading states
   - Input: Text input with validation states, icons, labels
   - Card: Content container with header, title, description, content, footer
   - Modal: Dialog overlays with confirm/alert presets
   - Badge: Status indicators with dots, removable options
   - Toast: Notification system with success/error/warning/info/loading

2. DATA DISPLAY
   - DataTable: Advanced table with sorting, pagination, search, selection
   - Loading states: Spinner, Skeleton, SkeletonCard, SkeletonTable, PageLoader
   - EmptyState: 15+ preset empty states for common scenarios

3. FORM CONTROLS
   - Textarea: Multi-line input with character count
   - Select: Dropdown with search, icons, descriptions
   - Checkbox: Toggle with label, description, indeterminate
   - Switch: Toggle switch with label
   - RadioGroup: Radio button groups

4. LAYOUT & RESPONSIVE
   - Container: Responsive container with max-widths
   - Grid: Responsive grid system
   - Stack/HStack/VStack: Flexible box layouts
   - Show/Hide: Conditional rendering by breakpoint
   - AspectRatio: Maintain aspect ratios
   - Spacer/Divider: Layout utilities

5. ACCESSIBILITY
   - VisuallyHidden: Screen reader only content
   - SkipLink: Skip navigation
   - FocusTrap: Focus containment
   - LiveRegion: ARIA live announcements
   - KeyboardNavigation: Keyboard-accessible lists

6. ANIMATION
   - Fade/Slide/Scale/Collapse: Transition components
   - Stagger: Staggered animations for lists
   - AnimateOnScroll: Intersection observer animations
   - TransitionGroup: Animated list transitions

USAGE:
```tsx
import {
  Button,
  Input,
  Card,
  Modal,
  toast,
  DataTable,
} from '@/components/ui';
```
*/
