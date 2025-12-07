/**
 * Utility function for merging Tailwind CSS classes
 *
 * This is a lightweight implementation that doesn't require
 * additional dependencies. For full tailwind-merge functionality,
 * install clsx and tailwind-merge packages.
 *
 * Usage:
 *   cn('px-4 py-2', 'bg-blue-500', condition && 'hover:bg-blue-600')
 *   cn(['base-class', conditional && 'conditional-class'])
 */

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | { [key: string]: boolean | undefined | null };

/**
 * Converts class values to a flat array of strings
 */
function toClassArray(value: ClassValue): string[] {
  if (!value) return [];

  if (typeof value === 'string') {
    return value.split(/\s+/).filter(Boolean);
  }

  if (typeof value === 'number') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap(toClassArray);
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);
  }

  return [];
}

/**
 * Simple class name merger
 * Combines multiple class values into a single string
 */
export function cn(...inputs: ClassValue[]): string {
  const classes = inputs.flatMap(toClassArray);
  return [...new Set(classes)].join(' ');
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
 * Responsive class helper
 * Generates responsive classes for different breakpoints
 */
export function responsiveClass(
  baseClass: string,
  responsive?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }
): string {
  const classes = [baseClass];

  if (responsive) {
    if (responsive.sm) classes.push(`sm:${responsive.sm}`);
    if (responsive.md) classes.push(`md:${responsive.md}`);
    if (responsive.lg) classes.push(`lg:${responsive.lg}`);
    if (responsive.xl) classes.push(`xl:${responsive.xl}`);
    if (responsive['2xl']) classes.push(`2xl:${responsive['2xl']}`);
  }

  return classes.join(' ');
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

/**
 * Interactive class helper
 * Returns classes for interactive elements (buttons, links, etc.)
 */
export function interactiveClass(): string {
  return cn(
    transitionClass('colors'),
    focusRingClass(),
    disabledClass()
  );
}

export default cn;
