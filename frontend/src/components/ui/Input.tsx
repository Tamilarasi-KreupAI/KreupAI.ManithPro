import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'w-full transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800',
  {
    variants: {
      variant: {
        default:
          'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        filled:
          'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        error:
          'border-error-500 bg-error-50 dark:bg-error-900/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-error-500 focus:ring-2 focus:ring-error-500/20',
        success:
          'border-success-500 bg-success-50 dark:bg-success-900/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-success-500 focus:ring-2 focus:ring-success-500/20',
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

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
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
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    const hasError = !!errorMessage;
    const hasSuccess = !!successMessage;
    const currentVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
            {isRequired && (
              <span className="text-error-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              inputVariants({ variant: currentVariant, inputSize }),
              leftIcon && 'pl-10',
              (rightIcon || hasError || hasSuccess) && 'pr-10',
              className
            )}
            aria-invalid={hasError}
            aria-required={isRequired}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {(rightIcon || hasError || hasSuccess) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-error-500" aria-hidden="true" />
              ) : hasSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-success-500" aria-hidden="true" />
              ) : (
                <span className="text-gray-400 dark:text-gray-500">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {(helperText || errorMessage || successMessage) && (
          <p
            id={hasError ? `${inputId}-error` : `${inputId}-helper`}
            className={cn(
              'mt-1.5 text-sm',
              hasError
                ? 'text-error-600 dark:text-error-400'
                : hasSuccess
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-gray-500 dark:text-gray-400'
            )}
            role={hasError ? 'alert' : undefined}
          >
            {errorMessage || successMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
