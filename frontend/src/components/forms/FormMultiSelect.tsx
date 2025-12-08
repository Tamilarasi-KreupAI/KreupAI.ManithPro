// ============================================================
// FORM MULTI-SELECT - Multi-select and tags input components
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { FormField } from './FormField';

// ============================================
// Types
// ============================================

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// ============================================
// Multi-Select Dropdown
// ============================================

export interface FormMultiSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: SelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxItems?: number;
  className?: string;
  disabled?: boolean;
}

export function FormMultiSelect({
  label,
  error,
  hint,
  required,
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  searchable = true,
  maxItems,
  className,
  disabled,
}: FormMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOptions = options.filter((o) => value.includes(o.value));

  const toggleOption = (optionValue: string) => {
    if (disabled) return;

    if (value.includes(optionValue)) {
      onChange?.(value.filter((v) => v !== optionValue));
    } else {
      if (maxItems && value.length >= maxItems) return;
      onChange?.([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.(value.filter((v) => v !== optionValue));
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div ref={containerRef} className={cn('relative', className)}>
        {/* Selected items and trigger */}
        <div
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
          className={cn(
            'min-h-[42px] w-full rounded-lg px-3 py-2',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'cursor-pointer',
            'flex flex-wrap gap-1.5 items-center',
            'transition-colors duration-200',
            isOpen && 'ring-2 ring-blue-500 border-transparent',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
            error && 'border-red-500'
          )}
        >
          {selectedOptions.length === 0 && !isOpen && (
            <span className="text-sm text-gray-400">{placeholder}</span>
          )}

          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm',
                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
              )}
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => removeOption(option.value, e)}
                className="hover:text-blue-600 dark:hover:text-blue-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}

          {isOpen && searchable && (
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={selectedOptions.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          <svg
            className={cn(
              'w-4 h-4 text-gray-400 ml-auto transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                const isDisabled = option.disabled || (maxItems && value.length >= maxItems && !isSelected);

                return (
                  <div
                    key={option.value}
                    onClick={() => !isDisabled && toggleOption(option.value)}
                    className={cn(
                      'px-3 py-2 cursor-pointer flex items-center gap-2',
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                      isSelected && 'bg-blue-50 dark:bg-blue-900/20',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center',
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-gray-500">{option.description}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </FormField>
  );
}

// ============================================
// Tags Input
// ============================================

export interface FormTagsInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  allowCustom?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FormTagsInput({
  label,
  error,
  hint,
  required,
  value = [],
  onChange,
  placeholder = 'Type and press Enter...',
  maxTags,
  suggestions = [],
  allowCustom = true,
  className,
  disabled,
}: FormTagsInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    if (maxTags && value.length >= maxTags) return;

    onChange?.([...value, trimmed]);
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    if (disabled) return;
    onChange?.(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (allowCustom && input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div ref={containerRef} className={cn('relative', className)}>
        <div
          className={cn(
            'min-h-[42px] w-full rounded-lg px-3 py-2',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'flex flex-wrap gap-1.5 items-center',
            'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
            disabled && 'opacity-50 bg-gray-50 dark:bg-gray-900',
            error && 'border-red-500'
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((tag) => (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm',
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              )}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="hover:text-red-600 dark:hover:text-red-400"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled || (maxTags ? value.length >= maxTags : false)}
            className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-h-40 overflow-auto">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {maxTags && (
          <p className="mt-1 text-xs text-gray-500">
            {value.length}/{maxTags} tags
          </p>
        )}
      </div>
    </FormField>
  );
}

// ============================================
// Combobox (Searchable Single Select)
// ============================================

export interface FormComboboxProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function FormCombobox({
  label,
  error,
  hint,
  required,
  options,
  value,
  onChange,
  placeholder = 'Search...',
  emptyMessage = 'No results found',
  className,
  disabled,
}: FormComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div ref={containerRef} className={cn('relative', className)}>
        <div
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
          className={cn(
            'h-10 w-full rounded-lg px-3',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'cursor-pointer flex items-center',
            'transition-colors duration-200',
            isOpen && 'ring-2 ring-blue-500 border-transparent',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
            error && 'border-red-500'
          )}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={cn('flex-1 text-sm', selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400')}>
              {selectedOption?.label || placeholder}
            </span>
          )}
          <svg
            className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">{emptyMessage}</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  className={cn(
                    'px-3 py-2 cursor-pointer flex items-center gap-2',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    option.value === value && 'bg-blue-50 dark:bg-blue-900/20',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500">{option.description}</div>
                    )}
                  </div>
                  {option.value === value && (
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </FormField>
  );
}
