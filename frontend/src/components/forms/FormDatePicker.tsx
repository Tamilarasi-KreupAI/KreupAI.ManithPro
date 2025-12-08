// ============================================================
// FORM DATE PICKER - Date and date range selection
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { FormField } from './FormField';

// ============================================
// Date Input (Native HTML5)
// ============================================

export interface FormDateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

export const FormDateInput = React.forwardRef<HTMLInputElement, FormDateInputProps>(
  ({ label, error, hint, className, required, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <FormField
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
      >
        <input
          ref={ref}
          id={inputId}
          type="date"
          className={cn(
            'w-full h-10 rounded-lg px-3 text-sm',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
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

FormDateInput.displayName = 'FormDateInput';

// ============================================
// Date Time Input
// ============================================

export interface FormDateTimeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

export const FormDateTimeInput = React.forwardRef<
  HTMLInputElement,
  FormDateTimeInputProps
>(({ label, error, hint, className, required, id, ...props }, ref) => {
  const inputId = id || props.name;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      error={error}
      hint={hint}
      required={required}
    >
      <input
        ref={ref}
        id={inputId}
        type="datetime-local"
        className={cn(
          'w-full h-10 rounded-lg px-3 text-sm',
          'border border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-200',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
    </FormField>
  );
});

FormDateTimeInput.displayName = 'FormDateTimeInput';

// ============================================
// Time Input
// ============================================

export interface FormTimeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

export const FormTimeInput = React.forwardRef<HTMLInputElement, FormTimeInputProps>(
  ({ label, error, hint, className, required, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <FormField
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
      >
        <input
          ref={ref}
          id={inputId}
          type="time"
          className={cn(
            'w-full h-10 rounded-lg px-3 text-sm',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
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

FormTimeInput.displayName = 'FormTimeInput';

// ============================================
// Date Range Picker
// ============================================

export interface DateRange {
  start: string;
  end: string;
}

export interface FormDateRangeProps {
  label?: string;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
}

export function FormDateRange({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  className,
  minDate,
  maxDate,
  disabled,
}: FormDateRangeProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({
      start: e.target.value,
      end: value?.end || '',
    });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({
      start: value?.start || '',
      end: e.target.value,
    });
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className={cn('flex items-center gap-2', className)}>
        <input
          type="date"
          value={value?.start || ''}
          onChange={handleStartChange}
          min={minDate}
          max={value?.end || maxDate}
          disabled={disabled}
          className={cn(
            'flex-1 h-10 rounded-lg px-3 text-sm',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500'
          )}
          placeholder="Start date"
        />
        <span className="text-gray-400">to</span>
        <input
          type="date"
          value={value?.end || ''}
          onChange={handleEndChange}
          min={value?.start || minDate}
          max={maxDate}
          disabled={disabled}
          className={cn(
            'flex-1 h-10 rounded-lg px-3 text-sm',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500'
          )}
          placeholder="End date"
        />
      </div>
    </FormField>
  );
}

// ============================================
// Month Year Picker
// ============================================

export interface FormMonthYearProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

export const FormMonthYear = React.forwardRef<HTMLInputElement, FormMonthYearProps>(
  ({ label, error, hint, className, required, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <FormField
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
      >
        <input
          ref={ref}
          id={inputId}
          type="month"
          className={cn(
            'w-full h-10 rounded-lg px-3 text-sm',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
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

FormMonthYear.displayName = 'FormMonthYear';

// ============================================
// Quick Date Presets
// ============================================

export interface DatePreset {
  label: string;
  getValue: () => DateRange;
}

const defaultPresets: DatePreset[] = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date().toISOString().split('T')[0];
      return { start: today, end: today };
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      return { start: yesterday, end: yesterday };
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      return { start, end };
    },
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      return { start, end };
    },
  },
  {
    label: 'This month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const end = new Date().toISOString().split('T')[0];
      return { start, end };
    },
  },
  {
    label: 'Last month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split('T')[0];
      return { start, end };
    },
  },
];

export interface FormDateRangeWithPresetsProps extends FormDateRangeProps {
  presets?: DatePreset[];
}

export function FormDateRangeWithPresets({
  presets = defaultPresets,
  ...props
}: FormDateRangeWithPresetsProps) {
  const [showPresets, setShowPresets] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPresets(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <FormDateRange {...props} />
      <div className="mt-2 flex flex-wrap gap-1">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => props.onChange?.(preset.getValue())}
            className={cn(
              'px-2 py-1 text-xs rounded-md',
              'bg-gray-100 dark:bg-gray-700',
              'text-gray-600 dark:text-gray-300',
              'hover:bg-gray-200 dark:hover:bg-gray-600',
              'transition-colors duration-150'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
