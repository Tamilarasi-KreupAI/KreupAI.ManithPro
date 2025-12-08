import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================
// SPINNER
// ============================================================

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    color: {
      default: 'text-gray-400 dark:text-gray-500',
      brand: 'text-brand-500',
      white: 'text-white',
      current: 'text-current',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'default',
  },
});

export interface SpinnerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

function Spinner({
  size,
  color,
  label = 'Loading...',
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex', className)}
      {...props}
    >
      <Loader2 className={spinnerVariants({ size, color })} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

// ============================================================
// SKELETON
// ============================================================

const skeletonVariants = cva(
  'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
  {
    variants: {
      variant: {
        default: '',
        circle: 'rounded-full',
        text: 'h-4 rounded',
        avatar: 'rounded-full',
        button: 'h-10 rounded-lg',
        input: 'h-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  variant,
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

// ============================================================
// SKELETON CARD
// ============================================================

export interface SkeletonCardProps {
  showImage?: boolean;
  imageHeight?: number;
  lines?: number;
  showFooter?: boolean;
  className?: string;
}

function SkeletonCard({
  showImage = true,
  imageHeight = 160,
  lines = 3,
  showFooter = true,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden',
        className
      )}
    >
      {showImage && <Skeleton height={imageHeight} className="rounded-none" />}
      <div className="p-4 space-y-3">
        <Skeleton height={20} width="60%" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            height={14}
            width={i === lines - 1 ? '80%' : '100%'}
          />
        ))}
      </div>
      {showFooter && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <Skeleton height={32} width={80} className="rounded-lg" />
          <Skeleton height={32} width={80} className="rounded-lg" />
        </div>
      )}
    </div>
  );
}

// ============================================================
// SKELETON TABLE
// ============================================================

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <table className="w-full">
        {showHeader && (
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton height={16} width="70%" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="bg-white dark:bg-gray-900">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton height={14} width={`${60 + Math.random() * 30}%`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// SKELETON LIST
// ============================================================

export interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  showDescription?: boolean;
  showAction?: boolean;
  className?: string;
}

function SkeletonList({
  items = 5,
  showAvatar = true,
  showDescription = true,
  showAction = false,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {showAvatar && <Skeleton variant="avatar" width={40} height={40} />}
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="40%" />
            {showDescription && <Skeleton height={12} width="70%" />}
          </div>
          {showAction && (
            <Skeleton height={32} width={80} className="rounded-lg" />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// PAGE LOADER
// ============================================================

export interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  transparent?: boolean;
  className?: string;
}

function PageLoader({
  message = 'Loading...',
  fullScreen = true,
  transparent = false,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen && 'fixed inset-0 z-50',
        !transparent && 'bg-white dark:bg-gray-900',
        transparent && 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700" />
        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
        {message}
      </p>
    </div>
  );
}

// ============================================================
// INLINE LOADER
// ============================================================

export interface InlineLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function InlineLoader({
  text = 'Loading...',
  size = 'md',
  className,
}: InlineLoaderProps) {
  const sizes = {
    sm: { spinner: 'xs' as const, text: 'text-xs' },
    md: { spinner: 'sm' as const, text: 'text-sm' },
    lg: { spinner: 'md' as const, text: 'text-base' },
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-gray-500 dark:text-gray-400',
        sizes[size].text,
        className
      )}
      role="status"
    >
      <Spinner size={sizes[size].spinner} color="current" />
      <span>{text}</span>
    </div>
  );
}

// ============================================================
// PROGRESS BAR
// ============================================================

const progressVariants = cva('h-full rounded-full transition-all duration-300', {
  variants: {
    color: {
      brand: 'bg-brand-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      info: 'bg-info-500',
    },
  },
  defaultVariants: {
    color: 'brand',
  },
});

export interface ProgressBarProps
  extends VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
  className?: string;
}

function ProgressBar({
  value,
  max = 100,
  color,
  showValue = false,
  size = 'md',
  indeterminate = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          heights[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            progressVariants({ color }),
            indeterminate && 'animate-progress-indeterminate w-1/3'
          )}
          style={indeterminate ? undefined : { width: `${percentage}%` }}
        />
      </div>
      {showValue && !indeterminate && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}

// ============================================================
// DOTS LOADER
// ============================================================

export interface DotsLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'brand' | 'white';
  className?: string;
}

function DotsLoader({
  size = 'md',
  color = 'default',
  className,
}: DotsLoaderProps) {
  const sizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  };

  const colors = {
    default: 'bg-gray-400 dark:bg-gray-500',
    brand: 'bg-brand-500',
    white: 'bg-white',
  };

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            sizes[size],
            colors[color]
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

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
};
