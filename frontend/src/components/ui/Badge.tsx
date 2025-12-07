import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        brand:
          'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
        success:
          'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300',
        warning:
          'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300',
        error:
          'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300',
        info:
          'bg-info-100 dark:bg-info-900/30 text-info-700 dark:text-info-300',
        outline:
          'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300',
        'outline-brand':
          'bg-transparent border border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400',
        'outline-success':
          'bg-transparent border border-success-300 dark:border-success-700 text-success-600 dark:text-success-400',
        'outline-warning':
          'bg-transparent border border-warning-300 dark:border-warning-700 text-warning-600 dark:text-warning-400',
        'outline-error':
          'bg-transparent border border-error-300 dark:border-error-700 text-error-600 dark:text-error-400',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-xs rounded',
        sm: 'px-2 py-0.5 text-xs rounded-md',
        md: 'px-2.5 py-1 text-sm rounded-md',
        lg: 'px-3 py-1.5 text-sm rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const dotColors: Record<string, string> = {
  default: 'bg-gray-500',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
  outline: 'bg-gray-500',
  'outline-brand': 'bg-brand-500',
  'outline-success': 'bg-success-500',
  'outline-warning': 'bg-warning-500',
  'outline-error': 'bg-error-500',
};

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

function Badge({
  className,
  variant = 'default',
  size,
  showDot,
  removable,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        badgeVariants({ variant, size }),
        showDot && 'pl-1.5',
        removable && 'pr-1',
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            'mr-1.5 h-1.5 w-1.5 rounded-full shrink-0',
            dotColors[variant || 'default']
          )}
          aria-hidden="true"
        />
      )}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 -mr-0.5 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Remove"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

// Status Badge with icon
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away' | 'pending';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  online: { color: 'bg-success-500', label: 'Online', pulse: true },
  offline: { color: 'bg-gray-400', label: 'Offline', pulse: false },
  busy: { color: 'bg-error-500', label: 'Busy', pulse: false },
  away: { color: 'bg-warning-500', label: 'Away', pulse: false },
  pending: { color: 'bg-info-500', label: 'Pending', pulse: true },
};

function StatusBadge({
  status,
  label,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        className
      )}
    >
      <span className="relative flex">
        <span
          className={cn('rounded-full', config.color, dotSizes[size])}
          aria-hidden="true"
        />
        {config.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              config.color
            )}
            aria-hidden="true"
          />
        )}
      </span>
      {label ?? config.label}
    </span>
  );
}

export { Badge, StatusBadge, badgeVariants };
