// ============================================================
// FORM FIELD - Base form field wrapper with label and error
// ============================================================

import React from 'react';
import { cn } from '../../lib/utils';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            'block text-sm font-medium text-gray-700 dark:text-gray-300',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// FORM INPUT - Text input with various types
// ============================================================

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'ghost';
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'default',
      className,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    const sizeClasses = {
      sm: 'h-8 text-sm px-2.5',
      md: 'h-10 text-sm px-3',
      lg: 'h-12 text-base px-4',
    };

    const variantClasses = {
      default:
        'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
      filled: 'border-0 bg-gray-100 dark:bg-gray-700',
      ghost: 'border-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    };

    return (
      <FormField
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
      >
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg transition-colors duration-200',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900',
              sizeClasses[size],
              variantClasses[variant],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
      </FormField>
    );
  }
);

FormInput.displayName = 'FormInput';

// ============================================================
// FORM TEXTAREA - Multi-line text input
// ============================================================

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
  (
    {
      label,
      error,
      hint,
      resize = 'vertical',
      className,
      required,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <FormField
        label={label}
        htmlFor={textareaId}
        error={error}
        hint={hint}
        required={required}
      >
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'w-full rounded-lg px-3 py-2 text-sm',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            resizeClasses[resize],
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
      </FormField>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

// ============================================================
// FORM SELECT - Dropdown select
// ============================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      size = 'md',
      className,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;

    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    return (
      <FormField
        label={label}
        htmlFor={selectId}
        error={error}
        hint={hint}
        required={required}
      >
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-lg px-3',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            'appearance-none cursor-pointer',
            'bg-no-repeat bg-right pr-10',
            sizeClasses[size],
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
          }}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// ============================================================
// FORM CHECKBOX - Checkbox input
// ============================================================

export interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
}

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    const checkboxId = id || props.name;

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              'w-4 h-4 rounded',
              'border-gray-300 dark:border-gray-600',
              'text-blue-600 dark:text-blue-500',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
              'bg-white dark:bg-gray-800',
              'cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500'
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={checkboxId}
            className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {label}
          </label>
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

// ============================================================
// FORM SWITCH - Toggle switch
// ============================================================

export interface FormSwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FormSwitch = React.forwardRef<HTMLInputElement, FormSwitchProps>(
  ({ label, description, size = 'md', className, id, ...props }, ref) => {
    const switchId = id || props.name;

    const sizeClasses = {
      sm: { switch: 'w-8 h-4', dot: 'w-3 h-3', translate: 'translate-x-4' },
      md: { switch: 'w-11 h-6', dot: 'w-5 h-5', translate: 'translate-x-5' },
      lg: { switch: 'w-14 h-7', dot: 'w-6 h-6', translate: 'translate-x-7' },
    };

    return (
      <div className={cn('flex items-center justify-between', className)}>
        <div className="flex flex-col">
          <label
            htmlFor={switchId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'relative rounded-full transition-colors duration-200',
              'bg-gray-200 dark:bg-gray-700',
              'peer-checked:bg-blue-600',
              'peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              sizeClasses[size].switch
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 left-0.5 rounded-full transition-transform duration-200',
                'bg-white shadow-sm',
                'peer-checked:' + sizeClasses[size].translate,
                sizeClasses[size].dot
              )}
              style={{
                transform: props.checked
                  ? sizeClasses[size].translate.replace('translate-x-', 'translateX(') + 'px)'
                  : 'translateX(0)',
              }}
            />
          </div>
        </label>
      </div>
    );
  }
);

FormSwitch.displayName = 'FormSwitch';

// ============================================================
// FORM RADIO GROUP - Radio button group
// ============================================================

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface FormRadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  required?: boolean;
}

export function FormRadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
  orientation = 'vertical',
  className,
  required,
}: FormRadioGroupProps) {
  return (
    <FormField label={label} error={error} required={required}>
      <div
        className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0',
          className
        )}
        role="radiogroup"
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start cursor-pointer',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange?.(option.value)}
                disabled={option.disabled}
                className={cn(
                  'w-4 h-4',
                  'border-gray-300 dark:border-gray-600',
                  'text-blue-600 dark:text-blue-500',
                  'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
                  'bg-white dark:bg-gray-800',
                  error && 'border-red-500'
                )}
              />
            </div>
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
              {option.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
    </FormField>
  );
}
