import {
  ReactNode,
  useRef,
  useEffect,
  createContext,
  useContext,
  useState,
  useCallback,
  KeyboardEvent,
  HTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';

// ============================================================
// VISUALLY HIDDEN
// ============================================================

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  as?: 'span' | 'div';
}

function VisuallyHidden({
  children,
  as: Component = 'span',
  ...props
}: VisuallyHiddenProps) {
  return (
    <Component
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{ clip: 'rect(0, 0, 0, 0)' }}
      {...props}
    >
      {children}
    </Component>
  );
}

// ============================================================
// SKIP LINK
// ============================================================

export interface SkipLinkProps {
  href?: string;
  children?: ReactNode;
  className?: string;
}

function SkipLink({
  href = '#main-content',
  children = 'Skip to main content',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'absolute left-4 top-4 z-[9999] px-4 py-2 rounded-lg',
        'bg-brand-600 text-white font-medium',
        'transform -translate-y-16 focus:translate-y-0',
        'transition-transform duration-200',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
}

// ============================================================
// FOCUS TRAP
// ============================================================

export interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  initialFocus?: boolean;
  returnFocus?: boolean;
  className?: string;
}

function FocusTrap({
  children,
  active = true,
  initialFocus = true,
  returnFocus = true,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    if (returnFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Set initial focus
    if (initialFocus && containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    return () => {
      // Return focus to the previous element
      if (returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, initialFocus, returnFocus]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!active || e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} className={className}>
      {children}
    </div>
  );
}

// Helper function to get focusable elements
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null // Check if visible
  );
}

// ============================================================
// LIVE REGION
// ============================================================

export interface LiveRegionProps {
  children?: ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions',
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}

// ============================================================
// ANNOUNCER (for screen reader announcements)
// ============================================================

interface AnnouncerContextValue {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within an AnnouncerProvider');
  }
  return context;
}

export interface AnnouncerProviderProps {
  children: ReactNode;
}

function AnnouncerProvider({ children }: AnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (priority === 'assertive') {
        setAssertiveMessage('');
        // Small delay to ensure the live region updates
        setTimeout(() => setAssertiveMessage(message), 50);
      } else {
        setPoliteMessage('');
        setTimeout(() => setPoliteMessage(message), 50);
      }
    },
    []
  );

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      <LiveRegion politeness="polite">{politeMessage}</LiveRegion>
      <LiveRegion politeness="assertive">{assertiveMessage}</LiveRegion>
    </AnnouncerContext.Provider>
  );
}

// ============================================================
// KEYBOARD NAVIGATION
// ============================================================

export interface KeyboardNavigationProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'grid';
  columns?: number; // For grid orientation
  loop?: boolean;
  onSelect?: (index: number) => void;
  className?: string;
}

function KeyboardNavigation({
  children,
  orientation = 'vertical',
  columns = 1,
  loop = true,
  onSelect,
  className,
}: KeyboardNavigationProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const items = getFocusableElements(containerRef.current);
    if (items.length === 0) return;

    const currentIndex = focusedIndex === -1 ? 0 : focusedIndex;
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'grid') {
          e.preventDefault();
          nextIndex = orientation === 'grid'
            ? currentIndex + columns
            : currentIndex + 1;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'grid') {
          e.preventDefault();
          nextIndex = orientation === 'grid'
            ? currentIndex - columns
            : currentIndex - 1;
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'grid') {
          e.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'grid') {
          e.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(currentIndex);
        return;
      default:
        return;
    }

    // Handle boundaries
    if (loop) {
      if (nextIndex < 0) nextIndex = items.length - 1;
      if (nextIndex >= items.length) nextIndex = 0;
    } else {
      nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
    }

    setFocusedIndex(nextIndex);
    items[nextIndex]?.focus();
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-orientation={orientation === 'grid' ? undefined : orientation}
      className={className}
    >
      {children}
    </div>
  );
}

// ============================================================
// SCREEN READER ONLY TEXT
// ============================================================

export interface SrOnlyProps {
  children: ReactNode;
  focusable?: boolean;
}

function SrOnly({ children, focusable = false }: SrOnlyProps) {
  return (
    <span
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        focusable && 'focus:static focus:w-auto focus:h-auto focus:overflow-visible focus:m-0'
      )}
      style={{ clip: 'rect(0, 0, 0, 0)' }}
    >
      {children}
    </span>
  );
}

// ============================================================
// FOCUS RING
// ============================================================

export interface FocusRingProps {
  children: ReactNode;
  focusRingClass?: string;
  className?: string;
}

function FocusRing({
  children,
  focusRingClass = 'ring-2 ring-brand-500 ring-offset-2',
  className,
}: FocusRingProps) {
  return (
    <div
      className={cn(
        'focus-within:outline-none',
        `focus-within:${focusRingClass}`,
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================
// ROVING TABINDEX
// ============================================================

export interface RovingTabIndexProps {
  children: ReactNode;
  activeIndex?: number;
  onChange?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

function RovingTabIndex({
  children,
  activeIndex = 0,
  onChange,
  orientation = 'horizontal',
  className,
}: RovingTabIndexProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const items = getFocusableElements(containerRef.current);
    if (items.length === 0) return;

    const isHorizontal = orientation === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    let nextIndex = activeIndex;

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        nextIndex = (activeIndex + 1) % items.length;
        break;
      case prevKey:
        e.preventDefault();
        nextIndex = (activeIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    onChange?.(nextIndex);
    items[nextIndex]?.focus();
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="tablist"
      aria-orientation={orientation}
      className={className}
    >
      {children}
    </div>
  );
}

// ============================================================
// A11Y HELPERS
// ============================================================

// Hook for reduced motion preference
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Hook for high contrast preference
export function usePrefersHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setPrefersHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersHighContrast;
}

// Hook for color scheme preference
export function usePrefersColorScheme(): 'light' | 'dark' {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) =>
      setColorScheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return colorScheme;
}

// Generate unique IDs for accessibility
let idCounter = 0;
export function useId(prefix = 'id'): string {
  const [id] = useState(() => `${prefix}-${++idCounter}`);
  return id;
}

// Describe element for screen readers
export interface DescribedByProps {
  id: string;
  children: ReactNode;
}

function DescribedBy({ id, children }: DescribedByProps) {
  return (
    <span id={id} className="sr-only">
      {children}
    </span>
  );
}

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
  getFocusableElements,
};
