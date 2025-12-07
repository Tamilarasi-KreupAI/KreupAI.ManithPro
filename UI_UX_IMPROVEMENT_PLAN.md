# KreupAI ManithPro - UI/UX Improvement Plan

**Created:** December 2024
**Focus:** Enterprise-Grade User Experience

---

## Current State Analysis

### What's Working Well
- Tailwind CSS utility-first approach
- Dark mode with system preference detection
- Basic responsive grid layouts
- Component organization by feature
- Some accessibility features (skip links, ARIA labels)

### Critical Gaps Identified
| Area | Issue | Impact |
|------|-------|--------|
| Component Library | No centralized UI components | Inconsistent styling |
| Design Tokens | Hardcoded colors, spacing | Brand customization difficult |
| Forms | No validation patterns | Poor user feedback |
| Loading States | Inconsistent spinners | Unclear system status |
| Mobile Experience | Tablet breakpoints weak | Poor mid-device UX |
| Accessibility | Incomplete ARIA, contrast issues | Excludes users |

---

## Phase 1: Design System Foundation (Week 1-2)

### 1.1 Extended Tailwind Configuration

**File: `frontend/tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Semantic Color System
      colors: {
        // Brand Colors
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Semantic Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        // Surface Colors
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          elevated: 'var(--surface-elevated)',
        },
      },
      // Typography Scale
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.2', fontWeight: '600' }],
        'display-sm': ['2.25rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      // Spacing Scale
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      // Border Radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      // Box Shadow System
      boxShadow: {
        'soft-xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'soft-sm': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'soft-md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'soft-lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'soft-xl': '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.03)',
        'glow-brand': '0 0 20px -5px rgb(59 130 246 / 0.5)',
        'glow-success': '0 0 20px -5px rgb(34 197 94 / 0.5)',
        'glow-error': '0 0 20px -5px rgb(239 68 68 / 0.5)',
      },
      // Animation Timing
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      // Custom Animations
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

### 1.2 CSS Custom Properties (Variables)

**File: `frontend/src/styles/variables.css`**

```css
:root {
  /* Surface Colors - Light Mode */
  --surface-primary: #ffffff;
  --surface-secondary: #f9fafb;
  --surface-tertiary: #f3f4f6;
  --surface-elevated: #ffffff;

  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-tertiary: #9ca3af;
  --text-inverse: #ffffff;

  /* Border Colors */
  --border-primary: #e5e7eb;
  --border-secondary: #d1d5db;
  --border-focus: #3b82f6;

  /* Z-Index Scale */
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-modal-backdrop: 1200;
  --z-modal: 1300;
  --z-popover: 1400;
  --z-tooltip: 1500;
  --z-toast: 1600;

  /* Animation Durations */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;

  /* Focus Ring */
  --focus-ring: 0 0 0 2px var(--surface-primary), 0 0 0 4px var(--border-focus);
}

.dark {
  /* Surface Colors - Dark Mode */
  --surface-primary: #111827;
  --surface-secondary: #1f2937;
  --surface-tertiary: #374151;
  --surface-elevated: #1f2937;

  /* Text Colors */
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #6b7280;
  --text-inverse: #111827;

  /* Border Colors */
  --border-primary: #374151;
  --border-secondary: #4b5563;
  --border-focus: #60a5fa;
}
```

---

## Phase 2: Core UI Components (Week 2-3)

### 2.1 Button Component

**File: `frontend/src/components/ui/Button.tsx`**

```typescript
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500',
        secondary: 'bg-surface-secondary text-text-primary border border-border-primary hover:bg-surface-tertiary active:bg-gray-200 dark:active:bg-gray-600 focus-visible:ring-brand-500',
        outline: 'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 active:bg-brand-100 focus-visible:ring-brand-500',
        ghost: 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary active:bg-gray-200 dark:active:bg-gray-600',
        danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500',
        success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500',
        link: 'text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-11 px-5 text-base rounded-lg',
        xl: 'h-12 px-6 text-base rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-xl',
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
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    isLoading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {rightIcon && !isLoading ? rightIcon : null}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 2.2 Input Component

**File: `frontend/src/components/ui/Input.tsx`**

```typescript
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle } from 'lucide-react';

const inputVariants = cva(
  'w-full transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-border-primary bg-surface-primary text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        filled: 'border-transparent bg-surface-tertiary text-text-primary placeholder:text-text-tertiary focus:bg-surface-primary focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        error: 'border-error-500 bg-error-50 dark:bg-error-900/20 text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-error-500/20',
        success: 'border-success-500 bg-success-50 dark:bg-success-900/20 text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-success-500/20',
      },
      inputSize: {
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-12 px-4 text-base rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    inputSize,
    label,
    helperText,
    errorMessage,
    successMessage,
    leftIcon,
    rightIcon,
    isRequired,
    id,
    ...props
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    const hasError = !!errorMessage;
    const hasSuccess = !!successMessage;

    const currentVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
            {isRequired && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              inputVariants({ variant: currentVariant, inputSize }),
              leftIcon && 'pl-10',
              (rightIcon || hasError || hasSuccess) && 'pr-10',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` :
              helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {(rightIcon || hasError || hasSuccess) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-error-500" />
              ) : hasSuccess ? (
                <CheckCircle className="h-5 w-5 text-success-500" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {(helperText || errorMessage || successMessage) && (
          <p
            id={hasError ? `${inputId}-error` : `${inputId}-helper`}
            className={cn(
              'text-sm',
              hasError ? 'text-error-600' :
              hasSuccess ? 'text-success-600' :
              'text-text-secondary'
            )}
          >
            {errorMessage || successMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### 2.3 Card Component

**File: `frontend/src/components/ui/Card.tsx`**

```typescript
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-surface-primary border border-border-primary',
        elevated: 'bg-surface-elevated shadow-soft-md',
        outlined: 'bg-transparent border-2 border-border-primary',
        filled: 'bg-surface-secondary',
        gradient: 'bg-gradient-to-br from-brand-500 to-brand-700 text-white',
        interactive: 'bg-surface-primary border border-border-primary hover:shadow-soft-lg hover:border-brand-200 dark:hover:border-brand-800 cursor-pointer',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card Header
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-heading-md text-text-primary', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-body-sm text-text-secondary', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// Card Footer
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
```

### 2.4 Modal Component

**File: `frontend/src/components/ui/Modal.tsx`**

```typescript
import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: ReactNode;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] h-[90vh]',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[var(--z-modal)]"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  'w-full transform overflow-hidden rounded-2xl bg-surface-primary shadow-xl transition-all',
                  sizeClasses[size]
                )}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-start justify-between gap-4 border-b border-border-primary p-6">
                    <div>
                      {title && (
                        <Dialog.Title className="text-heading-lg text-text-primary">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-body-sm text-text-secondary">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    {showCloseButton && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClose}
                        aria-label="Close modal"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>

                {/* Footer */}
                {footer && (
                  <div className="flex items-center justify-end gap-3 border-t border-border-primary bg-surface-secondary p-6">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Confirmation Modal
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading,
}: ConfirmModalProps) {
  const buttonVariant = variant === 'danger' ? 'danger' :
                        variant === 'warning' ? 'primary' : 'primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-body-md text-text-secondary">{message}</p>
    </Modal>
  );
}
```

### 2.5 Badge Component

**File: `frontend/src/components/ui/Badge.tsx`**

```typescript
import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-tertiary text-text-primary',
        brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
        success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
        warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
        error: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300',
        info: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-300',
        outline: 'border border-border-primary text-text-primary',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded-md',
        md: 'px-2.5 py-1 text-sm rounded-lg',
        lg: 'px-3 py-1.5 text-sm rounded-lg',
      },
      dot: {
        true: 'pl-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const dotColors = {
  default: 'bg-gray-500',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
  outline: 'bg-gray-500',
};

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  showDot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, dot: showDot, className }))}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            'mr-1.5 h-1.5 w-1.5 rounded-full',
            dotColors[variant || 'default']
          )}
        />
      )}
      {children}
    </span>
  );
}
```

---

## Phase 3: Toast Notification System (Week 3)

### 3.1 Toast Component

**File: `frontend/src/components/ui/Toast.tsx`**

```typescript
import { Toaster, toast as hotToast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

// Custom Toast Component
interface ToastContentProps {
  message: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

function ToastContent({ message, description, type }: ToastContentProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success-500" />,
    error: <XCircle className="h-5 w-5 text-error-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
    info: <Info className="h-5 w-5 text-info-500" />,
  };

  return (
    <div className="flex items-start gap-3">
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{message}</p>
        {description && (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        )}
      </div>
    </div>
  );
}

// Toast Functions
export const toast = {
  success: (message: string, description?: string) => {
    hotToast.custom((t) => (
      <div
        className={cn(
          'max-w-md w-full bg-surface-primary border border-border-primary shadow-soft-lg rounded-xl p-4',
          'animate-slide-in-right',
          !t.visible && 'animate-fade-out'
        )}
      >
        <ToastContent message={message} description={description} type="success" />
      </div>
    ));
  },

  error: (message: string, description?: string) => {
    hotToast.custom((t) => (
      <div
        className={cn(
          'max-w-md w-full bg-surface-primary border border-error-200 dark:border-error-800 shadow-soft-lg rounded-xl p-4',
          'animate-slide-in-right',
          !t.visible && 'animate-fade-out'
        )}
      >
        <ToastContent message={message} description={description} type="error" />
      </div>
    ));
  },

  warning: (message: string, description?: string) => {
    hotToast.custom((t) => (
      <div
        className={cn(
          'max-w-md w-full bg-surface-primary border border-warning-200 dark:border-warning-800 shadow-soft-lg rounded-xl p-4',
          'animate-slide-in-right',
          !t.visible && 'animate-fade-out'
        )}
      >
        <ToastContent message={message} description={description} type="warning" />
      </div>
    ));
  },

  info: (message: string, description?: string) => {
    hotToast.custom((t) => (
      <div
        className={cn(
          'max-w-md w-full bg-surface-primary border border-border-primary shadow-soft-lg rounded-xl p-4',
          'animate-slide-in-right',
          !t.visible && 'animate-fade-out'
        )}
      >
        <ToastContent message={message} description={description} type="info" />
      </div>
    ));
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return hotToast.promise(promise, messages);
  },

  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId);
  },
};

// Toast Container
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
      }}
      containerStyle={{
        top: 80, // Below navbar
      }}
    />
  );
}
```

---

## Phase 4: Data Table System (Week 4-5)

### 4.1 Data Table Component

**File: `frontend/src/components/ui/DataTable.tsx`**

```typescript
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/utils/cn';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  searchPlaceholder?: string;
  searchColumn?: string;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRows?: string[];
  enableSelection?: boolean;
  enableSorting?: boolean;
  enableSearch?: boolean;
  enablePagination?: boolean;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchColumn,
  pageSize = 10,
  isLoading,
  emptyMessage = 'No data found',
  onRowClick,
  selectedRows = [],
  enableSelection = false,
  enableSorting = true,
  enableSearch = true,
  enablePagination = true,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      {enableSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border border-border-primary rounded-lg bg-surface-primary text-text-primary placeholder:text-text-tertiary focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border-primary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-secondary">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-text-secondary"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center gap-2',
                            header.column.getCanSort() && enableSorting && 'cursor-pointer select-none hover:text-text-primary'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && enableSorting && (
                            <span className="text-text-tertiary">
                              {{
                                asc: <ChevronUp className="h-4 w-4" />,
                                desc: <ChevronDown className="h-4 w-4" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ChevronsUpDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border-primary">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-surface-tertiary rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'bg-surface-primary hover:bg-surface-secondary transition-colors',
                      onRowClick && 'cursor-pointer',
                      selectedRows.includes(row.original.id) && 'bg-brand-50 dark:bg-brand-900/20'
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-text-primary">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-text-secondary"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * pageSize,
              data.length
            )}{' '}
            of {data.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
                .slice(
                  Math.max(0, table.getState().pagination.pageIndex - 2),
                  Math.min(table.getPageCount(), table.getState().pagination.pageIndex + 3)
                )
                .map((page) => (
                  <Button
                    key={page}
                    variant={
                      page === table.getState().pagination.pageIndex + 1
                        ? 'primary'
                        : 'ghost'
                    }
                    size="sm"
                    onClick={() => table.setPageIndex(page - 1)}
                  >
                    {page}
                  </Button>
                ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 5: Loading & Empty States (Week 5)

### 5.1 Loading Components

**File: `frontend/src/components/ui/Loading.tsx`**

```typescript
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

// Spinner
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2 className={cn('animate-spin text-brand-600', spinnerSizes[size], className)} />
  );
}

// Page Loader
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}

// Skeleton Components
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-surface-tertiary rounded animate-pulse',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="border border-border-primary rounded-xl overflow-hidden">
      <div className="bg-surface-secondary px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border-primary">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
```

### 5.2 Empty State Component

**File: `frontend/src/components/ui/EmptyState.tsx`**

```typescript
import { ReactNode } from 'react';
import { Button } from './Button';
import { cn } from '@/utils/cn';
import {
  Inbox,
  Search,
  FileX,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  FolderOpen,
} from 'lucide-react';

const icons = {
  inbox: Inbox,
  search: Search,
  file: FileX,
  users: Users,
  jobs: Briefcase,
  calendar: Calendar,
  messages: MessageSquare,
  folder: FolderOpen,
};

interface EmptyStateProps {
  icon?: keyof typeof icons;
  customIcon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = 'inbox',
  customIcon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-tertiary mb-4">
        {customIcon || <Icon className="h-8 w-8 text-text-tertiary" />}
      </div>
      <h3 className="text-heading-md text-text-primary text-center mb-2">{title}</h3>
      {description && (
        <p className="text-body-md text-text-secondary text-center max-w-md mb-6">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset Empty States
export function NoSearchResults({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description="Try adjusting your search or filter criteria to find what you're looking for."
      action={onClear ? { label: 'Clear filters', onClick: onClear } : undefined}
    />
  );
}

export function NoDataYet({
  entityName,
  onAdd
}: {
  entityName: string;
  onAdd?: () => void;
}) {
  return (
    <EmptyState
      icon="folder"
      title={`No ${entityName} yet`}
      description={`Get started by creating your first ${entityName.toLowerCase()}.`}
      action={onAdd ? { label: `Add ${entityName}`, onClick: onAdd } : undefined}
    />
  );
}
```

---

## Phase 6: Form System (Week 6-7)

### 6.1 Form Components

**File: `frontend/src/components/ui/Form.tsx`**

```typescript
import { forwardRef, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, ChevronDown } from 'lucide-react';

// Form Label
interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function Label({ children, htmlFor, required, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-text-primary mb-1.5', className)}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );
}

// Form Group
interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>;
}

// Form Error
interface FormErrorProps {
  message?: string;
  id?: string;
}

export function FormError({ message, id }: FormErrorProps) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 text-sm text-error-600 mt-1.5">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      {message}
    </p>
  );
}

// Form Helper Text
interface FormHelperProps {
  children: ReactNode;
  id?: string;
}

export function FormHelper({ children, id }: FormHelperProps) {
  return (
    <p id={id} className="text-sm text-text-secondary mt-1.5">
      {children}
    </p>
  );
}

// Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, isRequired, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <FormGroup>
        {label && <Label htmlFor={textareaId} required={isRequired}>{label}</Label>}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 border rounded-lg bg-surface-primary text-text-primary',
            'placeholder:text-text-tertiary resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-error-500 focus:border-error-500' : 'border-border-primary focus:border-brand-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && <FormError message={error} id={`${textareaId}-error`} />}
        {helperText && !error && <FormHelper id={`${textareaId}-helper`}>{helperText}</FormHelper>}
      </FormGroup>
    );
  }
);
Textarea.displayName = 'Textarea';

// Select
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, isRequired, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <FormGroup>
        {label && <Label htmlFor={selectId} required={isRequired}>{label}</Label>}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 px-4 pr-10 border rounded-lg bg-surface-primary text-text-primary appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-error-500 focus:border-error-500' : 'border-border-primary focus:border-brand-500',
              className
            )}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary pointer-events-none" />
        </div>
        {error && <FormError message={error} id={`${selectId}-error`} />}
        {helperText && !error && <FormHelper id={`${selectId}-helper`}>{helperText}</FormHelper>}
      </FormGroup>
    );
  }
);
Select.displayName = 'Select';

// Checkbox
interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  id?: string;
}

export function Checkbox({ label, checked, onChange, disabled, error, id }: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={checkboxId}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className={cn(
          'h-5 w-5 rounded border-border-primary text-brand-600',
          'focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-error-500'
        )}
      />
      <label htmlFor={checkboxId} className="text-sm text-text-primary cursor-pointer">
        {label}
      </label>
    </div>
  );
}

// Radio Group
interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  name: string;
}

export function RadioGroup({ label, options, value, onChange, error, name }: RadioGroupProps) {
  return (
    <FormGroup>
      {label && <Label>{label}</Label>}
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all',
              value === option.value
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-border-primary hover:border-brand-200 dark:hover:border-brand-800'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="h-5 w-5 text-brand-600 border-border-primary focus:ring-brand-500/20"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">{option.label}</p>
              {option.description && (
                <p className="text-sm text-text-secondary mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <FormError message={error} />}
    </FormGroup>
  );
}
```

---

## Phase 7: Responsive & Accessibility (Week 8-9)

### 7.1 Responsive Utilities

**File: `frontend/src/components/ui/Responsive.tsx`**

```typescript
import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

// Show/Hide based on breakpoint
interface ResponsiveProps {
  children: ReactNode;
  className?: string;
}

export function MobileOnly({ children, className }: ResponsiveProps) {
  return <div className={cn('lg:hidden', className)}>{children}</div>;
}

export function DesktopOnly({ children, className }: ResponsiveProps) {
  return <div className={cn('hidden lg:block', className)}>{children}</div>;
}

export function TabletUp({ children, className }: ResponsiveProps) {
  return <div className={cn('hidden md:block', className)}>{children}</div>;
}

// Responsive Container
interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function Container({ children, size = 'xl', className }: ContainerProps) {
  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', containerSizes[size], className)}>
      {children}
    </div>
  );
}

// Responsive Stack
interface StackProps {
  children: ReactNode;
  direction?: 'row' | 'column' | 'responsive';
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapSizes = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function Stack({ children, direction = 'column', gap = 'md', className }: StackProps) {
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
    responsive: 'flex-col md:flex-row',
  };

  return (
    <div className={cn('flex', directionClasses[direction], gapSizes[gap], className)}>
      {children}
    </div>
  );
}

// Responsive Grid
interface GridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Grid({ children, cols = { default: 1, md: 2, lg: 3 }, gap = 'md', className }: GridProps) {
  const colClasses = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn('grid', colClasses, gapSizes[gap], className)}>
      {children}
    </div>
  );
}
```

### 7.2 Accessibility Components

**File: `frontend/src/components/ui/Accessibility.tsx`**

```typescript
import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

// Screen Reader Only
export function ScreenReaderOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Skip Link
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }: { href?: string; children?: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg"
    >
      {children}
    </a>
  );
}

// Focus Trap (for modals)
interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return <div ref={containerRef}>{children}</div>;
}

// Live Region for Announcements
interface LiveRegionProps {
  message: string;
  type?: 'polite' | 'assertive';
}

export function LiveRegion({ message, type = 'polite' }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Keyboard Shortcut Display
interface KeyboardShortcutProps {
  keys: string[];
  className?: string;
}

export function KeyboardShortcut({ keys, className }: KeyboardShortcutProps) {
  return (
    <kbd className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((key, index) => (
        <span key={index}>
          <span className="px-1.5 py-0.5 text-xs font-medium bg-surface-tertiary border border-border-primary rounded">
            {key}
          </span>
          {index < keys.length - 1 && <span className="mx-0.5 text-text-tertiary">+</span>}
        </span>
      ))}
    </kbd>
  );
}
```

---

## Phase 8: Animation & Micro-interactions (Week 9-10)

### 8.1 Animation Utilities

**File: `frontend/src/components/ui/Animations.tsx`**

```typescript
import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

// Fade In
interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  duration?: 'fast' | 'normal' | 'slow';
}

export function FadeIn({ children, delay = 0, duration = 'normal', className, ...props }: FadeInProps) {
  const durations = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  return (
    <div
      className={cn('animate-fade-in', durations[duration], className)}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
}

// Slide In
interface SlideInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

export function SlideIn({ children, direction = 'up', delay = 0, className, ...props }: SlideInProps) {
  const animations = {
    up: 'animate-slide-in-up',
    down: 'animate-slide-in-down',
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right',
  };

  return (
    <div
      className={cn(animations[direction], className)}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
}

// Stagger Children Animation
interface StaggerProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function Stagger({ children, staggerDelay = 50, className }: StaggerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Hover Scale
interface HoverScaleProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  scale?: 'sm' | 'md' | 'lg';
}

export function HoverScale({ children, scale = 'sm', className, ...props }: HoverScaleProps) {
  const scales = {
    sm: 'hover:scale-[1.02]',
    md: 'hover:scale-105',
    lg: 'hover:scale-110',
  };

  return (
    <div
      className={cn('transition-transform duration-200', scales[scale], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Pulse on Update
interface PulseOnUpdateProps {
  children: ReactNode;
  trigger: any; // Value to watch for changes
  className?: string;
}

export function PulseOnUpdate({ children, trigger, className }: PulseOnUpdateProps) {
  return (
    <div key={String(trigger)} className={cn('animate-pulse-soft', className)}>
      {children}
    </div>
  );
}
```

---

## Implementation Priority Order

### Week 1-2: Foundation
1. Extended Tailwind config with design tokens
2. CSS custom properties for theming
3. `cn()` utility function with clsx + tailwind-merge

### Week 2-3: Core Components
1. Button component with all variants
2. Input component with validation states
3. Card component with variants
4. Badge component

### Week 3-4: Modal & Toast
1. Modal component with Headless UI
2. Confirm modal
3. Toast notification system

### Week 4-5: Data Display
1. DataTable with TanStack Table
2. Pagination controls
3. Search and filter components

### Week 5-6: Loading & Empty States
1. Spinner and loaders
2. Skeleton components
3. Empty state components

### Week 6-7: Forms
1. Form field components
2. Select, Textarea, Checkbox
3. Radio group
4. Form validation integration

### Week 8-9: Responsive & A11y
1. Responsive utility components
2. Skip links and focus management
3. ARIA improvements
4. Screen reader support

### Week 9-10: Polish
1. Animations and transitions
2. Micro-interactions
3. Final accessibility audit
4. Performance optimization

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@headlessui/react": "^1.7.17",
    "@tanstack/react-table": "^8.10.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10",
    "@tailwindcss/aspect-ratio": "^0.4.2"
  }
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Accessibility | 95+ |
| Lighthouse Performance | 90+ |
| Color Contrast Ratio | 4.5:1 (AA) |
| Touch Target Size | 44x44px minimum |
| Component Reusability | 80% shared components |
| Style Consistency | 100% design token usage |

---

*Document Version: 1.0*
*Total UI Components: 30+*
*Estimated Effort: 10 weeks*
