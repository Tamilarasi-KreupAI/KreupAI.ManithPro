// ============================================================
// ACCESSIBILITY - A11y utility components (WCAG 2.1 AA)
// ============================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../../utils/cn';

// ============================================
// Skip Link
// ============================================
export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href = '#main-content',
  children = 'Skip to main content',
  className,
}) => {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:absolute focus:z-50 focus:top-4 focus:left-4',
        'focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        className
      )}
    >
      {children}
    </a>
  );
};

// ============================================
// Screen Reader Only
// ============================================
export interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  focusable?: boolean;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  as: Component = 'span',
  focusable = false,
}) => {
  return (
    <Component
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        '[clip:rect(0,0,0,0)]',
        focusable && 'focus:static focus:w-auto focus:h-auto focus:overflow-visible focus:clip-auto focus:m-0 focus:whitespace-normal'
      )}
    >
      {children}
    </Component>
  );
};

// Alias for convenience
export const VisuallyHidden = ScreenReaderOnly;

// ============================================
// Live Region (for dynamic announcements)
// ============================================
export interface LiveRegionProps {
  children?: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions',
  className,
}) => {
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
};

// ============================================
// Announcer Hook
// ============================================
export const useAnnouncer = () => {
  const [message, setMessage] = useState('');

  const announce = useCallback((text: string, delay = 100) => {
    // Clear first to ensure re-announcement of same message
    setMessage('');
    setTimeout(() => setMessage(text), delay);
  }, []);

  return { message, announce };
};

export const Announcer: React.FC<{ message: string }> = ({ message }) => (
  <LiveRegion politeness="assertive">{message}</LiveRegion>
);

// ============================================
// Focus Trap
// ============================================
export interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  restoreFocus = true,
  autoFocus = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store previously focused element
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Auto-focus first focusable element
    if (autoFocus && containerRef.current) {
      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    return () => {
      // Restore focus when unmounting
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, autoFocus, restoreFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!active || e.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: go to last element if on first
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: go to first element if on last
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} className={className}>
      {children}
    </div>
  );
};

// ============================================
// Focus Lock (alternative naming)
// ============================================
export const FocusLock = FocusTrap;

// ============================================
// Keyboard Navigation Hook
// ============================================
export interface UseKeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  preventDefault?: boolean;
}

export const useKeyboardNavigation = (options: UseKeyboardNavigationOptions) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const {
      onEnter,
      onEscape,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onHome,
      onEnd,
      preventDefault = true,
    } = options;

    const handlers: Record<string, (() => void) | undefined> = {
      Enter: onEnter,
      Escape: onEscape,
      ArrowUp: onArrowUp,
      ArrowDown: onArrowDown,
      ArrowLeft: onArrowLeft,
      ArrowRight: onArrowRight,
      Home: onHome,
      End: onEnd,
    };

    const handler = handlers[e.key];
    if (handler) {
      if (preventDefault) {
        e.preventDefault();
      }
      handler();
    }
  }, [options]);

  return { onKeyDown: handleKeyDown };
};

// ============================================
// Roving Tab Index
// ============================================
export interface UseRovingTabIndexOptions {
  itemCount: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
}

export const useRovingTabIndex = ({
  itemCount,
  currentIndex,
  onIndexChange,
  orientation = 'vertical',
  loop = true,
}: UseRovingTabIndexOptions) => {
  const getNextIndex = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (currentIndex >= itemCount - 1) {
        return loop ? 0 : currentIndex;
      }
      return currentIndex + 1;
    } else {
      if (currentIndex <= 0) {
        return loop ? itemCount - 1 : currentIndex;
      }
      return currentIndex - 1;
    }
  }, [currentIndex, itemCount, loop]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    switch (e.key) {
      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          onIndexChange(getNextIndex('next'));
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          onIndexChange(getNextIndex('prev'));
        }
        break;
      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault();
          onIndexChange(getNextIndex('next'));
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault();
          onIndexChange(getNextIndex('prev'));
        }
        break;
      case 'Home':
        e.preventDefault();
        onIndexChange(0);
        break;
      case 'End':
        e.preventDefault();
        onIndexChange(itemCount - 1);
        break;
    }
  }, [getNextIndex, onIndexChange, orientation, itemCount]);

  const getTabIndex = useCallback((index: number) => {
    return index === currentIndex ? 0 : -1;
  }, [currentIndex]);

  return { onKeyDown: handleKeyDown, getTabIndex };
};

// ============================================
// Focus Visible Hook
// ============================================
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback((e: React.FocusEvent) => {
    setIsFocused(true);
    // Check if focus was triggered by keyboard
    if (e.target.matches(':focus-visible')) {
      setIsFocusVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsFocusVisible(false);
  }, []);

  return {
    isFocused,
    isFocusVisible,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
};

// ============================================
// Reduced Motion Hook
// ============================================
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
};

// ============================================
// Focus Indicator
// ============================================
export interface FocusIndicatorProps {
  children: React.ReactNode;
  className?: string;
  focusClassName?: string;
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  className,
  focusClassName = 'ring-2 ring-indigo-500 ring-offset-2',
}) => {
  const { isFocusVisible, focusProps } = useFocusVisible();

  return (
    <div
      {...focusProps}
      className={cn(className, isFocusVisible && focusClassName)}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

// ============================================
// Accessible Icon
// ============================================
export interface AccessibleIconProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

export const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  children,
  label,
  className,
}) => {
  return (
    <span className={cn('inline-flex', className)} role="img" aria-label={label}>
      {children}
    </span>
  );
};

// ============================================
// Description List (for screen readers)
// ============================================
export interface DescriptionListProps {
  items: Array<{ term: string; description: React.ReactNode }>;
  className?: string;
  horizontal?: boolean;
}

export const DescriptionList: React.FC<DescriptionListProps> = ({
  items,
  className,
  horizontal = false,
}) => {
  return (
    <dl className={cn(horizontal && 'grid grid-cols-2 gap-4', className)}>
      {items.map((item, index) => (
        <div key={index} className={cn(!horizontal && 'mb-4')}>
          <dt className="text-sm font-medium text-gray-500">{item.term}</dt>
          <dd className="mt-1 text-sm text-gray-900">{item.description}</dd>
        </div>
      ))}
    </dl>
  );
};

// ============================================
// Helper Functions
// ============================================
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
  );
}

export function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[0] || null;
}

export function getLastFocusableElement(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] || null;
}

// ============================================
// Focus Management
// ============================================
export const focusFirst = (container: HTMLElement): void => {
  const element = getFirstFocusableElement(container);
  element?.focus();
};

export const focusLast = (container: HTMLElement): void => {
  const element = getLastFocusableElement(container);
  element?.focus();
};

// ============================================
// Accessible Loading
// ============================================
export interface AccessibleLoadingProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const AccessibleLoading: React.FC<AccessibleLoadingProps> = ({
  isLoading,
  loadingText = 'Loading...',
  children,
}) => {
  return (
    <div aria-busy={isLoading}>
      {isLoading && (
        <LiveRegion politeness="polite">
          {loadingText}
        </LiveRegion>
      )}
      {children}
    </div>
  );
};
