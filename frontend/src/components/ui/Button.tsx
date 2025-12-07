import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500 shadow-button hover:shadow-button-hover',
        secondary:
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 focus-visible:ring-brand-500',
        outline:
          'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 active:bg-brand-100 dark:active:bg-brand-900/40 focus-visible:ring-brand-500',
        ghost:
          'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 active:bg-gray-200 dark:active:bg-gray-700 focus-visible:ring-brand-500',
        danger:
          'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500 shadow-button hover:shadow-button-hover',
        success:
          'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 shadow-button hover:shadow-button-hover',
        warning:
          'bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 focus-visible:ring-warning-500 shadow-button hover:shadow-button-hover',
        link: 'text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-11 px-5 text-base rounded-lg',
        xl: 'h-12 px-6 text-base rounded-xl',
        icon: 'h-10 w-10 rounded-lg p-0',
        'icon-sm': 'h-8 w-8 rounded-md p-0',
        'icon-xs': 'h-7 w-7 rounded-md p-0',
        'icon-lg': 'h-12 w-12 rounded-xl p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        {children}
        {rightIcon && !isLoading ? (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
