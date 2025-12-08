// ============================================================
// RESPONSIVE - Responsive utility components
// ============================================================

import React, { useState, useEffect, createContext, useContext } from 'react';
import { cn } from '../../utils/cn';

// ============================================
// Breakpoint Definitions (matching Tailwind)
// ============================================
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// ============================================
// Media Query Hook
// ============================================
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
};

// ============================================
// Breakpoint Hook
// ============================================
export const useBreakpoint = (): {
  breakpoint: Breakpoint | 'xs';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
} => {
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return window.innerWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBreakpoint = (): Breakpoint | 'xs' => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  };

  return {
    breakpoint: getBreakpoint(),
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isLargeDesktop: width >= BREAKPOINTS.xl,
    width,
  };
};

// ============================================
// Responsive Context
// ============================================
interface ResponsiveContextValue {
  breakpoint: Breakpoint | 'xs';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
}

const ResponsiveContext = createContext<ResponsiveContextValue>({
  breakpoint: 'xs',
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  isLargeDesktop: false,
  width: 0,
});

export const useResponsive = () => useContext(ResponsiveContext);

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useBreakpoint();
  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// ============================================
// Show/Hide Components
// ============================================
export interface ShowProps {
  children: React.ReactNode;
  above?: Breakpoint;
  below?: Breakpoint;
  at?: Breakpoint | Breakpoint[];
}

export const Show: React.FC<ShowProps> = ({ children, above, below, at }) => {
  const { breakpoint, width } = useBreakpoint();

  const shouldShow = (): boolean => {
    if (at) {
      const breakpoints = Array.isArray(at) ? at : [at];
      return breakpoints.includes(breakpoint as Breakpoint);
    }

    if (above && below) {
      return width >= BREAKPOINTS[above] && width < BREAKPOINTS[below];
    }

    if (above) {
      return width >= BREAKPOINTS[above];
    }

    if (below) {
      return width < BREAKPOINTS[below];
    }

    return true;
  };

  if (!shouldShow()) {
    return null;
  }

  return <>{children}</>;
};

export const Hide: React.FC<ShowProps> = ({ children, above, below, at }) => {
  const { breakpoint, width } = useBreakpoint();

  const shouldHide = (): boolean => {
    if (at) {
      const breakpoints = Array.isArray(at) ? at : [at];
      return breakpoints.includes(breakpoint as Breakpoint);
    }

    if (above && below) {
      return width >= BREAKPOINTS[above] && width < BREAKPOINTS[below];
    }

    if (above) {
      return width >= BREAKPOINTS[above];
    }

    if (below) {
      return width < BREAKPOINTS[below];
    }

    return true;
  };

  if (shouldHide()) {
    return null;
  }

  return <>{children}</>;
};

// ============================================
// Mobile-First Conditional Rendering
// ============================================
export interface MobileOnlyProps {
  children: React.ReactNode;
}

export const MobileOnly: React.FC<MobileOnlyProps> = ({ children }) => (
  <Show below="md">{children}</Show>
);

export const TabletOnly: React.FC<MobileOnlyProps> = ({ children }) => (
  <Show above="md" below="lg">{children}</Show>
);

export const DesktopOnly: React.FC<MobileOnlyProps> = ({ children }) => (
  <Show above="lg">{children}</Show>
);

export const MobileAndTablet: React.FC<MobileOnlyProps> = ({ children }) => (
  <Show below="lg">{children}</Show>
);

export const TabletAndDesktop: React.FC<MobileOnlyProps> = ({ children }) => (
  <Show above="md">{children}</Show>
);

// ============================================
// Responsive Container
// ============================================
export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'prose';
  padding?: boolean;
  centered?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
  centered = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
    prose: 'max-w-prose',
  };

  return (
    <div
      className={cn(
        maxWidthClasses[maxWidth],
        padding && 'px-4 sm:px-6 lg:px-8',
        centered && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================
// Responsive Grid
// ============================================
export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md',
}) => {
  const colClasses = [
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  };

  return (
    <div className={cn('grid', colClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
};

// ============================================
// Responsive Stack
// ============================================
export interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    default: 'row' | 'column';
    sm?: 'row' | 'column';
    md?: 'row' | 'column';
    lg?: 'row' | 'column';
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className,
  direction = { default: 'column', md: 'row' },
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
}) => {
  const directionClasses = [
    direction.default === 'row' ? 'flex-row' : 'flex-col',
    direction.sm && (direction.sm === 'row' ? 'sm:flex-row' : 'sm:flex-col'),
    direction.md && (direction.md === 'row' ? 'md:flex-row' : 'md:flex-col'),
    direction.lg && (direction.lg === 'row' ? 'lg:flex-row' : 'lg:flex-col'),
  ].filter(Boolean).join(' ');

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses,
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================
// Responsive Image
// ============================================
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  className?: string;
  aspectRatio?: '1/1' | '4/3' | '16/9' | '21/9' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  loading?: 'lazy' | 'eager';
  placeholder?: React.ReactNode;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  srcSet,
  sizes,
  className,
  aspectRatio = 'auto',
  objectFit = 'cover',
  loading = 'lazy',
  placeholder,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]',
    auto: '',
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-gray-100 flex items-center justify-center',
          aspectRatioClasses[aspectRatio],
          className
        )}
      >
        {placeholder || (
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}>
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {placeholder}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        srcSet={srcSet}
        sizes={sizes}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFitClasses[objectFit],
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};

// ============================================
// Responsive Text
// ============================================
export interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: {
    default: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  };
  truncate?: boolean;
  lineClamp?: number;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  as: Component = 'p',
  size = { default: 'base', md: 'lg' },
  truncate = false,
  lineClamp,
}) => {
  const sizeClasses = [
    `text-${size.default}`,
    size.sm && `sm:text-${size.sm}`,
    size.md && `md:text-${size.md}`,
    size.lg && `lg:text-${size.lg}`,
  ].filter(Boolean).join(' ');

  return (
    <Component
      className={cn(
        sizeClasses,
        truncate && 'truncate',
        lineClamp && `line-clamp-${lineClamp}`,
        className
      )}
    >
      {children}
    </Component>
  );
};

// ============================================
// Safe Area Padding
// ============================================
export interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  className,
  top = true,
  bottom = true,
  left = true,
  right = true,
}) => {
  return (
    <div
      className={cn(
        top && 'pt-safe',
        bottom && 'pb-safe',
        left && 'pl-safe',
        right && 'pr-safe',
        className
      )}
      style={{
        paddingTop: top ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: bottom ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: left ? 'env(safe-area-inset-left)' : undefined,
        paddingRight: right ? 'env(safe-area-inset-right)' : undefined,
      }}
    >
      {children}
    </div>
  );
};
