import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, StatusBadge } from '../Badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('should render children text', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should render as a span element', () => {
      render(<Badge>Test</Badge>);
      expect(screen.getByText('Test').tagName).toBe('SPAN');
    });
  });

  describe('variants', () => {
    it.each([
      'default',
      'brand',
      'success',
      'warning',
      'error',
      'info',
      'outline',
      'outline-brand',
      'outline-success',
      'outline-warning',
      'outline-error',
    ] as const)('should render with variant %s', (variant) => {
      render(<Badge variant={variant}>Badge</Badge>);
      expect(screen.getByText('Badge')).toBeInTheDocument();
    });

    it('should apply default variant when not specified', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-gray-100');
    });

    it('should apply success variant classes', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-success-100');
    });

    it('should apply error variant classes', () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-error-100');
    });
  });

  describe('sizes', () => {
    it.each(['xs', 'sm', 'md', 'lg'] as const)(
      'should render with size %s',
      (size) => {
        render(<Badge size={size}>Sized</Badge>);
        expect(screen.getByText('Sized')).toBeInTheDocument();
      }
    );

    it('should apply xs size classes', () => {
      render(<Badge size="xs">XS Badge</Badge>);
      const badge = screen.getByText('XS Badge');
      expect(badge).toHaveClass('px-1.5', 'py-0.5', 'text-xs');
    });

    it('should apply lg size classes', () => {
      render(<Badge size="lg">LG Badge</Badge>);
      const badge = screen.getByText('LG Badge');
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });
  });

  describe('dot indicator', () => {
    it('should show dot when showDot is true', () => {
      render(<Badge showDot>With Dot</Badge>);
      const badge = screen.getByText('With Dot');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveClass('rounded-full');
    });

    it('should not show dot by default', () => {
      render(<Badge>No Dot</Badge>);
      const badge = screen.getByText('No Dot');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).not.toBeInTheDocument();
    });

    it('should apply correct dot color for success variant', () => {
      render(
        <Badge variant="success" showDot>
          Success
        </Badge>
      );
      const badge = screen.getByText('Success');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-success-500');
    });

    it('should apply correct dot color for error variant', () => {
      render(
        <Badge variant="error" showDot>
          Error
        </Badge>
      );
      const badge = screen.getByText('Error');
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-error-500');
    });
  });

  describe('removable', () => {
    it('should show remove button when removable is true', () => {
      render(
        <Badge removable onRemove={() => {}}>
          Removable
        </Badge>
      );
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('should not show remove button when removable is false', () => {
      render(<Badge>Not Removable</Badge>);
      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    });

    it('should not show remove button when onRemove is not provided', () => {
      render(<Badge removable>Removable but no handler</Badge>);
      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    });

    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      render(
        <Badge removable onRemove={onRemove}>
          Removable
        </Badge>
      );

      await user.click(screen.getByRole('button', { name: /remove/i }));

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('should stop event propagation on remove click', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const onBadgeClick = vi.fn();

      render(
        <div onClick={onBadgeClick}>
          <Badge removable onRemove={onRemove}>
            Removable
          </Badge>
        </div>
      );

      await user.click(screen.getByRole('button', { name: /remove/i }));

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onBadgeClick).not.toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      expect(screen.getByText('Custom')).toHaveClass('custom-class');
    });
  });

  describe('additional props', () => {
    it('should pass through HTML attributes', () => {
      render(
        <Badge data-testid="test-badge" id="badge-1">
          Test
        </Badge>
      );
      expect(screen.getByTestId('test-badge')).toHaveAttribute('id', 'badge-1');
    });

    it('should handle onClick', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<Badge onClick={onClick}>Clickable</Badge>);

      await user.click(screen.getByText('Clickable'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe('StatusBadge', () => {
  describe('rendering', () => {
    it('should render with status', () => {
      render(<StatusBadge status="online" />);
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should render custom label', () => {
      render(<StatusBadge status="online" label="Available" />);
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.queryByText('Online')).not.toBeInTheDocument();
    });
  });

  describe('statuses', () => {
    it.each(['online', 'offline', 'busy', 'away', 'pending'] as const)(
      'should render %s status',
      (status) => {
        render(<StatusBadge status={status} />);
        // Each status has a default label
        const expectedLabels = {
          online: 'Online',
          offline: 'Offline',
          busy: 'Busy',
          away: 'Away',
          pending: 'Pending',
        };
        expect(screen.getByText(expectedLabels[status])).toBeInTheDocument();
      }
    );

    it('should show online status with pulse animation', () => {
      const { container } = render(<StatusBadge status="online" />);
      const pulseElement = container.querySelector('.animate-ping');
      expect(pulseElement).toBeInTheDocument();
    });

    it('should show pending status with pulse animation', () => {
      const { container } = render(<StatusBadge status="pending" />);
      const pulseElement = container.querySelector('.animate-ping');
      expect(pulseElement).toBeInTheDocument();
    });

    it('should not show pulse for offline status', () => {
      const { container } = render(<StatusBadge status="offline" />);
      const pulseElement = container.querySelector('.animate-ping');
      expect(pulseElement).not.toBeInTheDocument();
    });

    it('should not show pulse for busy status', () => {
      const { container } = render(<StatusBadge status="busy" />);
      const pulseElement = container.querySelector('.animate-ping');
      expect(pulseElement).not.toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)('should render with size %s', (size) => {
      render(<StatusBadge status="online" size={size} />);
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should apply sm text class', () => {
      render(<StatusBadge status="online" size="sm" />);
      expect(screen.getByText('Online').parentElement).toHaveClass('text-xs');
    });

    it('should apply md text class', () => {
      render(<StatusBadge status="online" size="md" />);
      expect(screen.getByText('Online').parentElement).toHaveClass('text-sm');
    });

    it('should apply lg text class', () => {
      render(<StatusBadge status="online" size="lg" />);
      expect(screen.getByText('Online').parentElement).toHaveClass('text-base');
    });
  });

  describe('dot colors', () => {
    it('should use success color for online', () => {
      const { container } = render(<StatusBadge status="online" />);
      const dot = container.querySelector('.bg-success-500');
      expect(dot).toBeInTheDocument();
    });

    it('should use gray color for offline', () => {
      const { container } = render(<StatusBadge status="offline" />);
      const dot = container.querySelector('.bg-gray-400');
      expect(dot).toBeInTheDocument();
    });

    it('should use error color for busy', () => {
      const { container } = render(<StatusBadge status="busy" />);
      const dot = container.querySelector('.bg-error-500');
      expect(dot).toBeInTheDocument();
    });

    it('should use warning color for away', () => {
      const { container } = render(<StatusBadge status="away" />);
      const dot = container.querySelector('.bg-warning-500');
      expect(dot).toBeInTheDocument();
    });

    it('should use info color for pending', () => {
      const { container } = render(<StatusBadge status="pending" />);
      const dot = container.querySelector('.bg-info-500');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<StatusBadge status="online" className="custom-status" />);
      const badge = screen.getByText('Online').parentElement;
      expect(badge).toHaveClass('custom-status');
    });
  });

  describe('accessibility', () => {
    it('should have aria-hidden on dot', () => {
      const { container } = render(<StatusBadge status="online" />);
      const dots = container.querySelectorAll('[aria-hidden="true"]');
      expect(dots.length).toBeGreaterThan(0);
    });
  });
});
