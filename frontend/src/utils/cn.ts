import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 *
 * Usage:
 *   cn('px-4 py-2', 'bg-blue-500', condition && 'hover:bg-blue-600')
 *   cn(['base-class', conditional && 'conditional-class'])
 *   cn({ 'active': isActive, 'disabled': isDisabled })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Conditional class helper
 * Returns the class string only if the condition is true
 */
export function conditionalClass(
  condition: boolean | undefined | null,
  trueClass: string,
  falseClass?: string
): string {
  if (condition) return trueClass;
  return falseClass || '';
}

/**
 * Variant class helper
 * Maps a variant value to its corresponding class
 */
export function variantClass<T extends string>(
  variant: T,
  variants: Record<T, string>,
  defaultVariant?: T
): string {
  return variants[variant] || (defaultVariant ? variants[defaultVariant] : '');
}

/**
 * Size class helper
 * Maps a size value to its corresponding class
 */
export function sizeClass<T extends string>(
  size: T,
  sizes: Record<T, string>,
  defaultSize?: T
): string {
  return sizes[size] || (defaultSize ? sizes[defaultSize] : '');
}

/**
 * Focus ring class helper
 * Returns consistent focus ring classes
 */
export function focusRingClass(
  color: 'brand' | 'success' | 'error' | 'warning' = 'brand'
): string {
  const colors = {
    brand: 'focus-visible:ring-brand-500 focus-visible:ring-offset-2',
    success: 'focus-visible:ring-success-500 focus-visible:ring-offset-2',
    error: 'focus-visible:ring-error-500 focus-visible:ring-offset-2',
    warning: 'focus-visible:ring-warning-500 focus-visible:ring-offset-2',
  };

  return `focus-visible:outline-none focus-visible:ring-2 ${colors[color]}`;
}

/**
 * Disabled class helper
 * Returns consistent disabled state classes
 */
export function disabledClass(): string {
  return 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';
}

/**
 * Transition class helper
 * Returns consistent transition classes
 */
export function transitionClass(
  properties: 'all' | 'colors' | 'opacity' | 'shadow' | 'transform' = 'all',
  duration: '100' | '150' | '200' | '300' | '500' = '200'
): string {
  return `transition-${properties} duration-${duration} ease-out`;
}

export default cn;
