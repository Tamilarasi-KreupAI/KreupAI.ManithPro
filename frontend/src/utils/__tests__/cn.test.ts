import { describe, it, expect } from 'vitest';
import {
  cn,
  conditionalClass,
  variantClass,
  sizeClass,
  focusRingClass,
  disabledClass,
  transitionClass,
} from '../cn';

describe('cn', () => {
  it('merges multiple class strings', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500');
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn('base-class', isActive && 'active', isDisabled && 'disabled');
    expect(result).toBe('base-class active');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles object syntax', () => {
    const result = cn({
      'base-class': true,
      'active': true,
      'disabled': false,
    });
    expect(result).toBe('base-class active');
  });

  it('deduplicates conflicting Tailwind classes', () => {
    const result = cn('px-4', 'px-8');
    expect(result).toBe('px-8');
  });

  it('handles color conflicts correctly', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('merges padding classes correctly', () => {
    const result = cn('p-4', 'px-6');
    expect(result).toContain('px-6');
  });

  it('handles undefined values', () => {
    const result = cn('class1', undefined, 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles null values', () => {
    const result = cn('class1', null, 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles empty strings', () => {
    const result = cn('class1', '', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles complex nested conditions', () => {
    const variant = 'primary';
    const size = 'lg';
    const isLoading = true;

    const result = cn(
      'btn',
      variant === 'primary' && 'btn-primary',
      variant === 'secondary' && 'btn-secondary',
      size === 'lg' && 'btn-lg',
      isLoading && 'loading'
    );

    expect(result).toBe('btn btn-primary btn-lg loading');
  });

  it('returns empty string for all falsy values', () => {
    const result = cn(false, null, undefined, '');
    expect(result).toBe('');
  });
});

describe('conditionalClass', () => {
  it('returns trueClass when condition is true', () => {
    expect(conditionalClass(true, 'active')).toBe('active');
  });

  it('returns falseClass when condition is false', () => {
    expect(conditionalClass(false, 'active', 'inactive')).toBe('inactive');
  });

  it('returns empty string when condition is false and no falseClass', () => {
    expect(conditionalClass(false, 'active')).toBe('');
  });

  it('handles undefined condition', () => {
    expect(conditionalClass(undefined, 'active', 'inactive')).toBe('inactive');
  });

  it('handles null condition', () => {
    expect(conditionalClass(null, 'active', 'inactive')).toBe('inactive');
  });
});

describe('variantClass', () => {
  const variants = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    outline: 'border border-blue-500 text-blue-500',
  };

  it('returns correct class for variant', () => {
    expect(variantClass('primary', variants)).toBe('bg-blue-500 text-white');
  });

  it('returns default variant class when variant not found', () => {
    expect(variantClass('unknown' as any, variants, 'primary')).toBe('bg-blue-500 text-white');
  });

  it('returns empty string when variant not found and no default', () => {
    expect(variantClass('unknown' as any, variants)).toBe('');
  });
});

describe('sizeClass', () => {
  const sizes = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  it('returns correct class for size', () => {
    expect(sizeClass('md', sizes)).toBe('text-base px-4 py-2');
  });

  it('returns default size class when size not found', () => {
    expect(sizeClass('unknown' as any, sizes, 'md')).toBe('text-base px-4 py-2');
  });

  it('returns empty string when size not found and no default', () => {
    expect(sizeClass('unknown' as any, sizes)).toBe('');
  });
});

describe('focusRingClass', () => {
  it('returns brand focus ring by default', () => {
    const result = focusRingClass();
    expect(result).toContain('focus-visible:ring-brand-500');
    expect(result).toContain('focus-visible:outline-none');
    expect(result).toContain('focus-visible:ring-2');
  });

  it('returns success focus ring', () => {
    const result = focusRingClass('success');
    expect(result).toContain('focus-visible:ring-success-500');
  });

  it('returns error focus ring', () => {
    const result = focusRingClass('error');
    expect(result).toContain('focus-visible:ring-error-500');
  });

  it('returns warning focus ring', () => {
    const result = focusRingClass('warning');
    expect(result).toContain('focus-visible:ring-warning-500');
  });
});

describe('disabledClass', () => {
  it('returns disabled state classes', () => {
    const result = disabledClass();
    expect(result).toContain('disabled:opacity-50');
    expect(result).toContain('disabled:cursor-not-allowed');
    expect(result).toContain('disabled:pointer-events-none');
  });
});

describe('transitionClass', () => {
  it('returns all transition by default', () => {
    const result = transitionClass();
    expect(result).toContain('transition-all');
    expect(result).toContain('duration-200');
    expect(result).toContain('ease-out');
  });

  it('returns specific property transition', () => {
    expect(transitionClass('colors')).toContain('transition-colors');
    expect(transitionClass('opacity')).toContain('transition-opacity');
    expect(transitionClass('shadow')).toContain('transition-shadow');
    expect(transitionClass('transform')).toContain('transition-transform');
  });

  it('returns correct duration', () => {
    expect(transitionClass('all', '100')).toContain('duration-100');
    expect(transitionClass('all', '300')).toContain('duration-300');
    expect(transitionClass('all', '500')).toContain('duration-500');
  });
});
