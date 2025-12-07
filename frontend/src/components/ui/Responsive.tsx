import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { cn } from '../../utils/cn';

// ============================================================
// BREAKPOINT DEFINITIONS
// ============================================================

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// ============================================================
// MEDIA QUERY HOOKS
// ============================================================

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Hook for checking if viewport is at least a certain breakpoint
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
}

// Hook for checking if viewport is below a certain breakpoint
export function useBreakpointDown(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(max-width: ${breakpoints[breakpoint] - 1}px)`);
}

// Hook for checking if viewport is between two breakpoints
export function useBreakpointBetween(
  minBreakpoint: Breakpoint,
  maxBreakpoint: Breakpoint
): boolean {
  return useMediaQuery(
    `(min-width: ${breakpoints[minBreakpoint]}px) and (max-width: ${breakpoints[maxBreakpoint] - 1}px)`
  );
}

// Hook that returns current breakpoint
export function useCurrentBreakpoint(): Breakpoint {
  const isXs = !useBreakpoint('sm');
  const isSm = useBreakpoint('sm') && !useBreakpoint('md');
  const isMd = useBreakpoint('md') && !useBreakpoint('lg');
  const isLg = useBreakpoint('lg') && !useBreakpoint('xl');
  const isXl = useBreakpoint('xl') && !useBreakpoint('2xl');

  if (isXs) return 'xs';
  if (isSm) return 'sm';
  if (isMd) return 'md';
  if (isLg) return 'lg';
  if (isXl) return 'xl';
  return '2xl';
}

// Hook for checking mobile/tablet/desktop
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useBreakpointDown('md');
  const isTablet = useBreakpointBetween('md', 'lg');

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

// ============================================================
// RESPONSIVE CONTEXT
// ============================================================

interface ResponsiveContextValue {
  breakpoint: Breakpoint;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

const ResponsiveContext = createContext<ResponsiveContextValue | null>(null);

export function useResponsive(): ResponsiveContextValue {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
}

export interface ResponsiveProviderProps {
  children: ReactNode;
}

export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const breakpoint = useCurrentBreakpoint();
  const deviceType = useDeviceType();
  const isMobile = useBreakpointDown('md');
  const isTablet = useBreakpointBetween('md', 'lg');
  const isDesktop = useBreakpoint('lg');

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ResponsiveContext.Provider
      value={{
        breakpoint,
        deviceType,
        isMobile,
        isTablet,
        isDesktop,
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
}

// ============================================================
// SHOW/HIDE COMPONENTS
// ============================================================

export interface ShowProps {
  children: ReactNode;
  above?: Breakpoint;
  below?: Breakpoint;
  at?: Breakpoint | Breakpoint[];
  className?: string;
}

function Show({ children, above, below, at, className }: ShowProps) {
  const breakpoint = useCurrentBreakpoint();
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  let shouldShow = true;

  if (above) {
    const aboveIndex = breakpointOrder.indexOf(above);
    shouldShow = shouldShow && currentIndex >= aboveIndex;
  }

  if (below) {
    const belowIndex = breakpointOrder.indexOf(below);
    shouldShow = shouldShow && currentIndex < belowIndex;
  }

  if (at) {
    const atArray = Array.isArray(at) ? at : [at];
    shouldShow = shouldShow && atArray.includes(breakpoint);
  }

  if (!shouldShow) return null;

  return className ? <div className={className}>{children}</div> : <>{children}</>;
}

export interface HideProps {
  children: ReactNode;
  above?: Breakpoint;
  below?: Breakpoint;
  at?: Breakpoint | Breakpoint[];
  className?: string;
}

function Hide({ children, above, below, at, className }: HideProps) {
  const breakpoint = useCurrentBreakpoint();
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  let shouldHide = false;

  if (above) {
    const aboveIndex = breakpointOrder.indexOf(above);
    shouldHide = shouldHide || currentIndex >= aboveIndex;
  }

  if (below) {
    const belowIndex = breakpointOrder.indexOf(below);
    shouldHide = shouldHide || currentIndex < belowIndex;
  }

  if (at) {
    const atArray = Array.isArray(at) ? at : [at];
    shouldHide = shouldHide || atArray.includes(breakpoint);
  }

  if (shouldHide) return null;

  return className ? <div className={className}>{children}</div> : <>{children}</>;
}

// ============================================================
// RESPONSIVE CONTAINER
// ============================================================

export interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
  padding?: boolean;
  className?: string;
}

function Container({
  children,
  size = 'xl',
  centered = true,
  padding = true,
  className,
}: ContainerProps) {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full',
        maxWidths[size],
        centered && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================
// RESPONSIVE GRID
// ============================================================

export interface GridProps {
  children: ReactNode;
  cols?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
  className?: string;
}

function Grid({ children, cols = 1, gap = 4, className }: GridProps) {
  const getColsClass = () => {
    if (typeof cols === 'number') {
      return `grid-cols-${cols}`;
    }

    const colClasses: string[] = [];
    if (cols.xs) colClasses.push(`grid-cols-${cols.xs}`);
    if (cols.sm) colClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`);
    return colClasses.join(' ');
  };

  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap;

  return (
    <div className={cn('grid', getColsClass(), gapClass, className)}>
      {children}
    </div>
  );
}

// ============================================================
// STACK COMPONENTS
// ============================================================

export interface StackProps {
  children: ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  spacing?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
}

function Stack({
  children,
  direction = 'column',
  spacing = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
}: StackProps) {
  const directions = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
  };

  const alignments = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifications = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const gapClass = typeof spacing === 'number' ? `gap-${spacing}` : spacing;

  return (
    <div
      className={cn(
        'flex',
        directions[direction],
        alignments[align],
        justifications[justify],
        gapClass,
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}

// HStack (horizontal stack)
export interface HStackProps extends Omit<StackProps, 'direction'> {}

function HStack(props: HStackProps) {
  return <Stack direction="row" {...props} />;
}

// VStack (vertical stack)
export interface VStackProps extends Omit<StackProps, 'direction'> {}

function VStack(props: VStackProps) {
  return <Stack direction="column" {...props} />;
}

// ============================================================
// ASPECT RATIO
// ============================================================

export interface AspectRatioProps {
  children: ReactNode;
  ratio?: number | '1:1' | '4:3' | '16:9' | '21:9' | '3:2';
  className?: string;
}

function AspectRatio({ children, ratio = '16:9', className }: AspectRatioProps) {
  const ratios: Record<string, number> = {
    '1:1': 1,
    '4:3': 4 / 3,
    '16:9': 16 / 9,
    '21:9': 21 / 9,
    '3:2': 3 / 2,
  };

  const numericRatio = typeof ratio === 'number' ? ratio : ratios[ratio];
  const paddingBottom = `${(1 / numericRatio) * 100}%`;

  return (
    <div className={cn('relative w-full', className)} style={{ paddingBottom }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

// ============================================================
// SPACER
// ============================================================

export interface SpacerProps {
  size?: number | string;
  axis?: 'horizontal' | 'vertical';
  className?: string;
}

function Spacer({ size = 4, axis = 'vertical', className }: SpacerProps) {
  const sizeClass = typeof size === 'number' ? size : size;

  if (axis === 'horizontal') {
    return (
      <div
        className={cn('shrink-0', className)}
        style={{
          width: typeof size === 'number' ? `${size * 0.25}rem` : size,
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={cn('shrink-0 w-full', className)}
      style={{
        height: typeof size === 'number' ? `${size * 0.25}rem` : size,
      }}
      aria-hidden="true"
    />
  );
}

// ============================================================
// DIVIDER
// ============================================================

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  className?: string;
}

function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  className,
}: DividerProps) {
  const variants = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'border-l border-gray-200 dark:border-gray-700 self-stretch',
          variants[variant],
          className
        )}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <hr
      className={cn(
        'border-t border-gray-200 dark:border-gray-700 w-full',
        variants[variant],
        className
      )}
      role="separator"
    />
  );
}

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
  useMediaQuery,
};
