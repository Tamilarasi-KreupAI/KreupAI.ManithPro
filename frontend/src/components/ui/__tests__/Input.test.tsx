// ============================================================
// INPUT COMPONENT TESTS
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import { Input } from '../Input';
import { Search, Mail } from 'lucide-react';

describe('Input', () => {
  // ============================================
  // Rendering Tests
  // ============================================
  describe('rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<Input helperText="This is helper text" />);
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('renders required indicator', () => {
      render(<Input label="Email" isRequired />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with custom id', () => {
      render(<Input id="custom-input" label="Custom" />);
      expect(screen.getByLabelText('Custom')).toHaveAttribute('id', 'custom-input');
    });

    it('generates id from label when not provided', () => {
      render(<Input label="First Name" />);
      const input = screen.getByLabelText('First Name');
      expect(input).toHaveAttribute('id', 'first-name');
    });
  });

  // ============================================
  // Variant Tests
  // ============================================
  describe('variants', () => {
    it('applies default variant styles', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border-gray-300');
    });

    it('applies filled variant styles', () => {
      render(<Input variant="filled" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('bg-gray-100');
    });

    it('applies error variant when errorMessage is provided', () => {
      render(<Input errorMessage="Invalid input" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border-error-500');
    });

    it('applies success variant when successMessage is provided', () => {
      render(<Input successMessage="Valid input" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('border-success-500');
    });
  });

  // ============================================
  // Size Tests
  // ============================================
  describe('sizes', () => {
    it('applies small size styles', () => {
      render(<Input inputSize="sm" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('h-8');
    });

    it('applies medium size styles (default)', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('h-10');
    });

    it('applies large size styles', () => {
      render(<Input inputSize="lg" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('h-12');
    });
  });

  // ============================================
  // Icon Tests
  // ============================================
  describe('icons', () => {
    it('renders with left icon', () => {
      render(<Input leftIcon={<Search data-testid="left-icon" />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(<Input rightIcon={<Mail data-testid="right-icon" />} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('adds padding for left icon', () => {
      render(<Input leftIcon={<Search />} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('pl-10');
    });

    it('adds padding for right icon', () => {
      render(<Input rightIcon={<Mail />} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('pr-10');
    });

    it('shows error icon when errorMessage is provided', () => {
      const { container } = render(<Input errorMessage="Error" />);
      expect(container.querySelector('.text-error-500')).toBeInTheDocument();
    });

    it('shows success icon when successMessage is provided', () => {
      const { container } = render(<Input successMessage="Success" />);
      expect(container.querySelector('.text-success-500')).toBeInTheDocument();
    });
  });

  // ============================================
  // Error State Tests
  // ============================================
  describe('error state', () => {
    it('displays error message', () => {
      render(<Input errorMessage="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('sets aria-invalid to true', () => {
      render(<Input errorMessage="Error" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    });

    it('error message has role="alert"', () => {
      render(<Input errorMessage="Error" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Error');
    });

    it('links input to error message via aria-describedby', () => {
      render(<Input id="test-input" errorMessage="Error" />);
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-describedby',
        'test-input-error'
      );
    });
  });

  // ============================================
  // Success State Tests
  // ============================================
  describe('success state', () => {
    it('displays success message', () => {
      render(<Input successMessage="Valid email" />);
      expect(screen.getByText('Valid email')).toBeInTheDocument();
    });

    it('success message does not have role="alert"', () => {
      render(<Input successMessage="Valid" />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Disabled State Tests
  // ============================================
  describe('disabled state', () => {
    it('applies disabled attribute', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('has disabled styles', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('disabled:opacity-50');
    });
  });

  // ============================================
  // Type Tests
  // ============================================
  describe('input types', () => {
    it('defaults to type="text"', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    });

    it('supports type="email"', () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('supports type="password"', () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('supports type="number"', () => {
      render(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });
  });

  // ============================================
  // Interaction Tests
  // ============================================
  describe('interactions', () => {
    it('calls onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} data-testid="input" />);

      fireEvent.change(screen.getByTestId('input'), {
        target: { value: 'new value' },
      });

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus when focused', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} data-testid="input" />);

      fireEvent.focus(screen.getByTestId('input'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when blurred', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} data-testid="input" />);

      fireEvent.blur(screen.getByTestId('input'));
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('updates value correctly', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'test value' } });
      expect(input.value).toBe('test value');
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('accessibility', () => {
    it('associates label with input', () => {
      render(<Input label="Username" />);
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('sets aria-required when isRequired', () => {
      render(<Input isRequired data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-required', 'true');
    });

    it('links helper text via aria-describedby', () => {
      render(<Input id="test-input" helperText="Help text" />);
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-describedby',
        'test-input-helper'
      );
    });

    it('required indicator is hidden from screen readers', () => {
      render(<Input label="Email" isRequired />);
      expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ============================================
  // Ref Forwarding Tests
  // ============================================
  describe('ref forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
    });

    it('allows focus via ref', () => {
      let inputRef: HTMLInputElement | null = null;
      render(
        <Input
          ref={(el) => {
            inputRef = el;
          }}
          data-testid="input"
        />
      );

      inputRef?.focus();
      expect(document.activeElement).toBe(screen.getByTestId('input'));
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('edge cases', () => {
    it('error takes priority over success', () => {
      render(
        <Input
          errorMessage="Error"
          successMessage="Success"
          data-testid="input"
        />
      );
      expect(screen.getByTestId('input')).toHaveClass('border-error-500');
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });

    it('error takes priority over helper text', () => {
      render(
        <Input errorMessage="Error" helperText="Help" data-testid="input" />
      );
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Help')).not.toBeInTheDocument();
    });

    it('success takes priority over helper text', () => {
      render(
        <Input successMessage="Success" helperText="Help" data-testid="input" />
      );
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.queryByText('Help')).not.toBeInTheDocument();
    });
  });
});
