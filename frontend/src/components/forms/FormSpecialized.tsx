// ============================================================
// SPECIALIZED FORM COMPONENTS - Domain-specific inputs
// ============================================================

import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { FormField } from './FormField';

// ============================================
// Salary Range Input
// ============================================

export interface SalaryRange {
  min: number | null;
  max: number | null;
  currency: string;
  period: 'hourly' | 'monthly' | 'yearly';
}

export interface FormSalaryRangeProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  value?: SalaryRange;
  onChange?: (range: SalaryRange) => void;
  currencies?: { value: string; label: string }[];
  showPeriod?: boolean;
  className?: string;
  disabled?: boolean;
}

const defaultCurrencies = [
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'INR', label: '₹ INR' },
  { value: 'CAD', label: '$ CAD' },
  { value: 'AUD', label: '$ AUD' },
];

const periods = [
  { value: 'hourly', label: '/hr' },
  { value: 'monthly', label: '/mo' },
  { value: 'yearly', label: '/yr' },
];

export function FormSalaryRange({
  label,
  error,
  hint,
  required,
  value = { min: null, max: null, currency: 'USD', period: 'yearly' },
  onChange,
  currencies = defaultCurrencies,
  showPeriod = true,
  className,
  disabled,
}: FormSalaryRangeProps) {
  const formatNumber = (num: number | null): string => {
    if (num === null) return '';
    return num.toLocaleString();
  };

  const parseNumber = (str: string): number | null => {
    const cleaned = str.replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : null;
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className={cn('flex flex-wrap gap-2 items-center', className)}>
        {/* Currency */}
        <select
          value={value.currency}
          onChange={(e) => onChange?.({ ...value, currency: e.target.value })}
          disabled={disabled}
          className={cn(
            'h-10 rounded-lg px-2 text-sm',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:opacity-50'
          )}
        >
          {currencies.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Min */}
        <input
          type="text"
          value={formatNumber(value.min)}
          onChange={(e) => onChange?.({ ...value, min: parseNumber(e.target.value) })}
          placeholder="Min"
          disabled={disabled}
          className={cn(
            'w-28 h-10 rounded-lg px-3 text-sm',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:opacity-50',
            error && 'border-red-500'
          )}
        />

        <span className="text-gray-400">—</span>

        {/* Max */}
        <input
          type="text"
          value={formatNumber(value.max)}
          onChange={(e) => onChange?.({ ...value, max: parseNumber(e.target.value) })}
          placeholder="Max"
          disabled={disabled}
          className={cn(
            'w-28 h-10 rounded-lg px-3 text-sm',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:opacity-50',
            error && 'border-red-500'
          )}
        />

        {/* Period */}
        {showPeriod && (
          <select
            value={value.period}
            onChange={(e) =>
              onChange?.({ ...value, period: e.target.value as SalaryRange['period'] })
            }
            disabled={disabled}
            className={cn(
              'h-10 rounded-lg px-2 text-sm',
              'border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50'
            )}
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </FormField>
  );
}

// ============================================
// Skill Picker with Level
// ============================================

export interface Skill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface FormSkillPickerProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  value?: Skill[];
  onChange?: (skills: Skill[]) => void;
  suggestions?: string[];
  maxSkills?: number;
  showLevels?: boolean;
  className?: string;
  disabled?: boolean;
}

const levelLabels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

export function FormSkillPicker({
  label,
  error,
  hint,
  required,
  value = [],
  onChange,
  suggestions = [],
  maxSkills,
  showLevels = true,
  className,
  disabled,
}: FormSkillPickerProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !value.some((skill) => skill.name.toLowerCase() === s.toLowerCase())
  );

  const addSkill = (name: string) => {
    if (!name.trim()) return;
    if (maxSkills && value.length >= maxSkills) return;
    if (value.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;

    onChange?.([...value, { name: name.trim(), level: 3 }]);
    setInput('');
    setShowSuggestions(false);
  };

  const removeSkill = (index: number) => {
    if (disabled) return;
    const newSkills = [...value];
    newSkills.splice(index, 1);
    onChange?.(newSkills);
  };

  const updateLevel = (index: number, level: Skill['level']) => {
    if (disabled) return;
    const newSkills = [...value];
    newSkills[index] = { ...newSkills[index], level };
    onChange?.(newSkills);
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className={className}>
        {/* Input */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(input);
              }
            }}
            placeholder={
              maxSkills && value.length >= maxSkills
                ? `Maximum ${maxSkills} skills`
                : 'Add a skill...'
            }
            disabled={disabled || (maxSkills ? value.length >= maxSkills : false)}
            className={cn(
              'w-full h-10 rounded-lg px-3 text-sm',
              'border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50',
              error && 'border-red-500'
            )}
          />

          {/* Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && input && (
            <div className="absolute z-50 w-full mt-1 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-h-40 overflow-auto">
              {filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  onClick={() => addSkill(suggestion)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills list */}
        {value.length > 0 && (
          <div className="mt-3 space-y-2">
            {value.map((skill, index) => (
              <div
                key={skill.name}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {skill.name}
                </span>

                {showLevels && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateLevel(index, level as Skill['level'])}
                        disabled={disabled}
                        className={cn(
                          'w-6 h-6 rounded-full text-xs font-medium transition-colors',
                          skill.level >= level
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'
                        )}
                        title={levelLabels[level - 1]}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {maxSkills && (
          <p className="mt-1 text-xs text-gray-500">
            {value.length}/{maxSkills} skills
          </p>
        )}
      </div>
    </FormField>
  );
}

// ============================================
// Number Input with Stepper
// ============================================

export interface FormNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  value?: number;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  showStepper?: boolean;
  suffix?: string;
  prefix?: string;
}

export const FormNumberInput = React.forwardRef<HTMLInputElement, FormNumberInputProps>(
  (
    {
      label,
      error,
      hint,
      value,
      onChange,
      min,
      max,
      step = 1,
      showStepper = true,
      suffix,
      prefix,
      className,
      required,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    const handleChange = (newValue: number | null) => {
      if (newValue === null) {
        onChange?.(null);
        return;
      }
      if (min !== undefined && newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;
      onChange?.(newValue);
    };

    const increment = () => {
      const current = value ?? 0;
      handleChange(current + step);
    };

    const decrement = () => {
      const current = value ?? 0;
      handleChange(current - step);
    };

    return (
      <FormField
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
      >
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-gray-500 dark:text-gray-400 text-sm">
              {prefix}
            </span>
          )}

          {showStepper && (
            <button
              type="button"
              onClick={decrement}
              disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
              className={cn(
                'absolute left-0 h-full px-3',
                'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'border-r border-gray-300 dark:border-gray-600'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          )}

          <input
            ref={ref}
            id={inputId}
            type="number"
            value={value ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              handleChange(val === '' ? null : parseFloat(val));
            }}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn(
              'w-full h-10 rounded-lg text-sm text-center',
              'border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              showStepper && 'px-12',
              prefix && !showStepper && 'pl-8',
              suffix && !showStepper && 'pr-8',
              error && 'border-red-500',
              className
            )}
            {...props}
          />

          {suffix && (
            <span className="absolute right-3 text-gray-500 dark:text-gray-400 text-sm">
              {suffix}
            </span>
          )}

          {showStepper && (
            <button
              type="button"
              onClick={increment}
              disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
              className={cn(
                'absolute right-0 h-full px-3',
                'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'border-l border-gray-300 dark:border-gray-600'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </FormField>
    );
  }
);

FormNumberInput.displayName = 'FormNumberInput';

// ============================================
// Rating Input
// ============================================

export interface FormRatingProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  value?: number;
  onChange?: (rating: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  allowHalf?: boolean;
  showValue?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FormRating({
  label,
  error,
  hint,
  required,
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  allowHalf = false,
  showValue = false,
  className,
  disabled,
}: FormRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const displayValue = hoverValue ?? value;

  const handleClick = (rating: number) => {
    if (disabled) return;
    onChange?.(rating);
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className={cn('flex items-center gap-1', className)}>
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => {
          const filled = displayValue >= rating;
          const halfFilled = allowHalf && displayValue >= rating - 0.5 && displayValue < rating;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => !disabled && setHoverValue(rating)}
              onMouseLeave={() => setHoverValue(null)}
              disabled={disabled}
              className={cn(
                'transition-colors',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              <svg
                className={cn(
                  sizeClasses[size],
                  filled
                    ? 'text-yellow-400'
                    : halfFilled
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                )}
                fill={filled || halfFilled ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          );
        })}

        {showValue && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {value.toFixed(allowHalf ? 1 : 0)} / {max}
          </span>
        )}
      </div>
    </FormField>
  );
}

// ============================================
// Phone Input
// ============================================

export interface FormPhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
}

const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+81', country: 'JP' },
  { code: '+86', country: 'CN' },
  { code: '+61', country: 'AU' },
];

export const FormPhoneInput = React.forwardRef<HTMLInputElement, FormPhoneInputProps>(
  (
    {
      label,
      error,
      hint,
      countryCode = '+1',
      onCountryCodeChange,
      className,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <FormField
        label={label}
        htmlFor={inputId}
        error={error}
        hint={hint}
        required={required}
      >
        <div className="flex">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange?.(e.target.value)}
            className={cn(
              'h-10 rounded-l-lg px-2 text-sm border-r-0',
              'border border-gray-300 dark:border-gray-600',
              'bg-gray-50 dark:bg-gray-700',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10'
            )}
          >
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.country})
              </option>
            ))}
          </select>
          <input
            ref={ref}
            id={inputId}
            type="tel"
            className={cn(
              'flex-1 h-10 rounded-r-lg px-3 text-sm',
              'border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
        </div>
      </FormField>
    );
  }
);

FormPhoneInput.displayName = 'FormPhoneInput';
