import { forwardRef, TextareaHTMLAttributes, ReactNode, Fragment } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Switch as HeadlessSwitch,
  RadioGroup as HeadlessRadioGroup,
  Radio,
  Field,
  Label,
  Transition,
} from '@headlessui/react';
import { Check, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// ============================================================
// TEXTAREA
// ============================================================

const textareaVariants = cva(
  'w-full transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 resize-y',
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
      textareaSize: {
        sm: 'p-2 text-sm rounded-md min-h-[80px]',
        md: 'p-3 text-sm rounded-lg min-h-[100px]',
        lg: 'p-4 text-base rounded-lg min-h-[120px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'md',
    },
  }
);

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  isRequired?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      textareaSize,
      label,
      helperText,
      errorMessage,
      successMessage,
      isRequired,
      showCharCount,
      maxLength,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');
    const hasError = !!errorMessage;
    const hasSuccess = !!successMessage;
    const currentVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
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
          <textarea
            id={textareaId}
            ref={ref}
            value={value}
            maxLength={maxLength}
            className={cn(
              textareaVariants({ variant: currentVariant, textareaSize }),
              className
            )}
            aria-invalid={hasError}
            aria-required={isRequired}
            aria-describedby={
              hasError
                ? `${textareaId}-error`
                : helperText
                  ? `${textareaId}-helper`
                  : undefined
            }
            {...props}
          />

          {(hasError || hasSuccess) && (
            <div className="absolute right-3 top-3 pointer-events-none">
              {hasError ? (
                <AlertCircle className="h-5 w-5 text-error-500" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-success-500" aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-1.5">
          <div className="flex-1">
            {(helperText || errorMessage || successMessage) && (
              <p
                id={hasError ? `${textareaId}-error` : `${textareaId}-helper`}
                className={cn(
                  'text-sm',
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
          {showCharCount && maxLength && (
            <p className="text-sm text-gray-400 dark:text-gray-500 ml-2">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================
// SELECT
// ============================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  helperText,
  errorMessage,
  isRequired,
  disabled,
  size = 'md',
  className,
}: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);
  const hasError = !!errorMessage;

  const sizes = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-4',
    lg: 'h-12 text-base px-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {isRequired && (
            <span className="text-error-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ListboxButton
            className={cn(
              'relative w-full cursor-pointer rounded-lg text-left transition-all',
              sizes[size],
              'bg-white dark:bg-gray-900 border',
              hasError
                ? 'border-error-500 focus:ring-2 focus:ring-error-500/20'
                : 'border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
              disabled && 'cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800',
              'focus:outline-none'
            )}
          >
            <span
              className={cn(
                'block truncate pr-8',
                !selectedOption && 'text-gray-400 dark:text-gray-500'
              )}
            >
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  {selectedOption.icon}
                  {selectedOption.label}
                </span>
              ) : (
                placeholder
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-900 py-1 shadow-dropdown border border-gray-200 dark:border-gray-700 focus:outline-none"
            >
              {options.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, selected }) =>
                    cn(
                      'relative cursor-pointer select-none py-2 pl-10 pr-4',
                      active && 'bg-gray-100 dark:bg-gray-800',
                      selected && 'bg-brand-50 dark:bg-brand-900/20',
                      option.disabled && 'cursor-not-allowed opacity-50'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cn(
                          'block truncate',
                          selected
                            ? 'font-medium text-brand-600 dark:text-brand-400'
                            : 'text-gray-900 dark:text-gray-100'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {option.icon}
                          <span>
                            {option.label}
                            {option.description && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400">
                                {option.description}
                              </span>
                            )}
                          </span>
                        </span>
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-600 dark:text-brand-400">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>

      {(helperText || errorMessage) && (
        <p
          className={cn(
            'mt-1.5 text-sm',
            hasError
              ? 'text-error-600 dark:text-error-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
          role={hasError ? 'alert' : undefined}
        >
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
}

// ============================================================
// CHECKBOX
// ============================================================

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Checkbox({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  indeterminate = false,
  size = 'md',
  className,
}: CheckboxProps) {
  const sizes = {
    sm: { box: 'h-4 w-4', check: 'h-3 w-3', text: 'text-sm', desc: 'text-xs' },
    md: { box: 'h-5 w-5', check: 'h-3.5 w-3.5', text: 'text-sm', desc: 'text-sm' },
    lg: { box: 'h-6 w-6', check: 'h-4 w-4', text: 'text-base', desc: 'text-sm' },
  };

  const sizeConfig = sizes[size];

  return (
    <label
      className={cn(
        'flex items-start gap-3 cursor-pointer group',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <div
        className={cn(
          'relative flex items-center justify-center shrink-0 rounded border-2 transition-all',
          sizeConfig.box,
          checked || indeterminate
            ? 'bg-brand-500 border-brand-500 text-white'
            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 group-hover:border-brand-400',
          disabled && 'pointer-events-none'
        )}
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange?.(!checked);
          }
        }}
        onClick={() => !disabled && onChange?.(!checked)}
      >
        {(checked || indeterminate) && (
          indeterminate ? (
            <div className={cn('bg-white rounded-sm', size === 'sm' ? 'h-0.5 w-2' : size === 'md' ? 'h-0.5 w-2.5' : 'h-0.5 w-3')} />
          ) : (
            <Check className={sizeConfig.check} strokeWidth={3} />
          )
        )}
      </div>

      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span
              className={cn(
                'font-medium text-gray-900 dark:text-gray-100',
                sizeConfig.text
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              className={cn(
                'text-gray-500 dark:text-gray-400',
                sizeConfig.desc
              )}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}

// ============================================================
// SWITCH
// ============================================================

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Switch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
}: SwitchProps) {
  const sizes = {
    sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
    lg: { track: 'h-7 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7' },
  };

  const sizeConfig = sizes[size];

  return (
    <Field className={cn('flex items-center gap-3', className)}>
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          sizeConfig.track,
          checked
            ? 'bg-brand-500'
            : 'bg-gray-200 dark:bg-gray-700',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
            sizeConfig.thumb,
            checked ? sizeConfig.translate : 'translate-x-0.5',
            'transform mt-0.5 ml-0.5'
          )}
        />
      </HeadlessSwitch>

      {(label || description) && (
        <Label className="flex flex-col cursor-pointer">
          {label && (
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </span>
          )}
        </Label>
      )}
    </Field>
  );
}

// ============================================================
// RADIO GROUP
// ============================================================

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function RadioGroup({
  options,
  value,
  onChange,
  label,
  orientation = 'vertical',
  size = 'md',
  className,
}: RadioGroupProps) {
  const sizes = {
    sm: { radio: 'h-4 w-4', dot: 'h-1.5 w-1.5', text: 'text-sm', desc: 'text-xs' },
    md: { radio: 'h-5 w-5', dot: 'h-2 w-2', text: 'text-sm', desc: 'text-sm' },
    lg: { radio: 'h-6 w-6', dot: 'h-2.5 w-2.5', text: 'text-base', desc: 'text-sm' },
  };

  const sizeConfig = sizes[size];

  return (
    <HeadlessRadioGroup value={value} onChange={onChange} className={className}>
      {label && (
        <HeadlessRadioGroup.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
        </HeadlessRadioGroup.Label>
      )}

      <div
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={({ checked, disabled: isDisabled }) =>
              cn(
                'flex items-start gap-3 cursor-pointer group',
                isDisabled && 'cursor-not-allowed opacity-50'
              )
            }
          >
            {({ checked }) => (
              <>
                <div
                  className={cn(
                    'relative flex items-center justify-center shrink-0 rounded-full border-2 transition-all',
                    sizeConfig.radio,
                    checked
                      ? 'border-brand-500 bg-white dark:bg-gray-900'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 group-hover:border-brand-400'
                  )}
                >
                  {checked && (
                    <div
                      className={cn(
                        'rounded-full bg-brand-500',
                        sizeConfig.dot
                      )}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-0.5">
                  <span
                    className={cn(
                      'font-medium text-gray-900 dark:text-gray-100',
                      sizeConfig.text
                    )}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span
                      className={cn(
                        'text-gray-500 dark:text-gray-400',
                        sizeConfig.desc
                      )}
                    >
                      {option.description}
                    </span>
                  )}
                </div>
              </>
            )}
          </Radio>
        ))}
      </div>
    </HeadlessRadioGroup>
  );
}

// ============================================================
// FORM FIELD WRAPPER
// ============================================================

export interface FormFieldProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  children: ReactNode;
  className?: string;
}

function FormField({
  label,
  helperText,
  errorMessage,
  isRequired,
  children,
  className,
}: FormFieldProps) {
  const hasError = !!errorMessage;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {isRequired && (
            <span className="text-error-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {(helperText || errorMessage) && (
        <p
          className={cn(
            'mt-1.5 text-sm',
            hasError
              ? 'text-error-600 dark:text-error-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
          role={hasError ? 'alert' : undefined}
        >
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
}

export {
  Textarea,
  Select,
  Checkbox,
  Switch,
  RadioGroup,
  FormField,
  textareaVariants,
};
