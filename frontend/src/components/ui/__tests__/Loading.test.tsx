import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Spinner,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  PageLoader,
  InlineLoader,
  ProgressBar,
  DotsLoader,
} from '../Loading';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<Spinner label="Please wait..." />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Please wait...');
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  describe('sizes', () => {
    it('applies xs size', () => {
      const { container } = render(<Spinner size="xs" />);
      expect(container.querySelector('.h-3')).toBeInTheDocument();
    });

    it('applies sm size', () => {
      const { container } = render(<Spinner size="sm" />);
      expect(container.querySelector('.h-4')).toBeInTheDocument();
    });

    it('applies md size (default)', () => {
      const { container } = render(<Spinner size="md" />);
      expect(container.querySelector('.h-6')).toBeInTheDocument();
    });

    it('applies lg size', () => {
      const { container } = render(<Spinner size="lg" />);
      expect(container.querySelector('.h-8')).toBeInTheDocument();
    });

    it('applies xl size', () => {
      const { container } = render(<Spinner size="xl" />);
      expect(container.querySelector('.h-12')).toBeInTheDocument();
    });
  });

  describe('colors', () => {
    it('applies default color', () => {
      const { container } = render(<Spinner color="default" />);
      expect(container.querySelector('.text-gray-400')).toBeInTheDocument();
    });

    it('applies brand color', () => {
      const { container } = render(<Spinner color="brand" />);
      expect(container.querySelector('.text-brand-500')).toBeInTheDocument();
    });

    it('applies white color', () => {
      const { container } = render(<Spinner color="white" />);
      expect(container.querySelector('.text-white')).toBeInTheDocument();
    });

    it('applies current color', () => {
      const { container } = render(<Spinner color="current" />);
      expect(container.querySelector('.text-current')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />);

    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('rounded');
  });

  it('applies circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('applies text variant', () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass('h-4');
  });

  it('applies avatar variant', () => {
    const { container } = render(<Skeleton variant="avatar" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('applies button variant', () => {
    const { container } = render(<Skeleton variant="button" />);
    expect(container.firstChild).toHaveClass('h-10');
    expect(container.firstChild).toHaveClass('rounded-lg');
  });

  it('applies custom width and height as numbers', () => {
    const { container } = render(<Skeleton width={100} height={50} />);

    expect(container.firstChild).toHaveStyle({ width: '100px', height: '50px' });
  });

  it('applies custom width and height as strings', () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />);

    expect(container.firstChild).toHaveStyle({ width: '50%', height: '2rem' });
  });

  it('is hidden from screen readers', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    expect(container.firstChild).toHaveClass('custom-skeleton');
  });
});

describe('SkeletonCard', () => {
  it('renders with default props', () => {
    const { container } = render(<SkeletonCard />);

    expect(container.firstChild).toHaveClass('rounded-xl');
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders image placeholder by default', () => {
    const { container } = render(<SkeletonCard />);

    // Check for image placeholder height
    const imagePlaceholder = container.querySelector('[style*="height: 160px"]');
    expect(imagePlaceholder).toBeInTheDocument();
  });

  it('hides image when showImage is false', () => {
    const { container } = render(<SkeletonCard showImage={false} />);

    const imagePlaceholder = container.querySelector('[style*="height: 160px"]');
    expect(imagePlaceholder).not.toBeInTheDocument();
  });

  it('renders footer by default', () => {
    const { container } = render(<SkeletonCard />);

    expect(container.querySelector('.border-t')).toBeInTheDocument();
  });

  it('hides footer when showFooter is false', () => {
    const { container } = render(<SkeletonCard showFooter={false} />);

    // Should not have the footer border
    const footer = container.querySelector('.border-t.flex.justify-between');
    expect(footer).not.toBeInTheDocument();
  });

  it('renders correct number of lines', () => {
    const { container } = render(<SkeletonCard lines={5} />);

    // Count skeleton lines in content area (including title = 6 total)
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(5);
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonCard className="custom-card" />);
    expect(container.firstChild).toHaveClass('custom-card');
  });
});

describe('SkeletonTable', () => {
  it('renders with default props', () => {
    const { container } = render(<SkeletonTable />);

    expect(container.querySelector('table')).toBeInTheDocument();
  });

  it('renders header by default', () => {
    const { container } = render(<SkeletonTable />);

    expect(container.querySelector('thead')).toBeInTheDocument();
  });

  it('hides header when showHeader is false', () => {
    const { container } = render(<SkeletonTable showHeader={false} />);

    expect(container.querySelector('thead')).not.toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    const { container } = render(<SkeletonTable rows={10} />);

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(10);
  });

  it('renders correct number of columns', () => {
    const { container } = render(<SkeletonTable columns={6} />);

    const headerCells = container.querySelectorAll('thead th');
    expect(headerCells.length).toBe(6);
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonTable className="custom-table" />);
    expect(container.firstChild).toHaveClass('custom-table');
  });
});

describe('SkeletonList', () => {
  it('renders with default props', () => {
    const { container } = render(<SkeletonList />);

    expect(container.firstChild).toHaveClass('space-y-4');
  });

  it('renders correct number of items', () => {
    const { container } = render(<SkeletonList items={8} />);

    const items = container.querySelectorAll('.flex.items-center.gap-4');
    expect(items.length).toBe(8);
  });

  it('renders avatar by default', () => {
    const { container } = render(<SkeletonList items={1} />);

    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('hides avatar when showAvatar is false', () => {
    const { container } = render(<SkeletonList items={1} showAvatar={false} />);

    // Check for avatar (40x40 rounded-full element)
    const avatar = container.querySelector('[style*="width: 40px"][style*="height: 40px"]');
    expect(avatar).not.toBeInTheDocument();
  });

  it('shows action button when showAction is true', () => {
    const { container } = render(<SkeletonList items={1} showAction />);

    // Should have action button skeleton (80px width)
    const action = container.querySelector('[style*="width: 80px"]');
    expect(action).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonList className="custom-list" />);
    expect(container.firstChild).toHaveClass('custom-list');
  });
});

describe('PageLoader', () => {
  it('renders with default props', () => {
    render(<PageLoader />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<PageLoader message="Please wait while we load your data..." />);

    expect(screen.getByText('Please wait while we load your data...')).toBeInTheDocument();
  });

  it('applies fullScreen styles by default', () => {
    const { container } = render(<PageLoader />);

    expect(container.firstChild).toHaveClass('fixed');
    expect(container.firstChild).toHaveClass('inset-0');
    expect(container.firstChild).toHaveClass('z-50');
  });

  it('removes fullScreen styles when disabled', () => {
    const { container } = render(<PageLoader fullScreen={false} />);

    expect(container.firstChild).not.toHaveClass('fixed');
  });

  it('applies transparent backdrop when enabled', () => {
    const { container } = render(<PageLoader transparent />);

    expect(container.firstChild).toHaveClass('backdrop-blur-sm');
  });

  it('applies custom className', () => {
    const { container } = render(<PageLoader className="custom-loader" />);
    expect(container.firstChild).toHaveClass('custom-loader');
  });
});

describe('InlineLoader', () => {
  it('renders with default props', () => {
    render(<InlineLoader />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom text', () => {
    render(<InlineLoader text="Saving..." />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('applies sm size', () => {
    const { container } = render(<InlineLoader size="sm" />);
    expect(container.firstChild).toHaveClass('text-xs');
  });

  it('applies md size (default)', () => {
    const { container } = render(<InlineLoader size="md" />);
    expect(container.firstChild).toHaveClass('text-sm');
  });

  it('applies lg size', () => {
    const { container } = render(<InlineLoader size="lg" />);
    expect(container.firstChild).toHaveClass('text-base');
  });

  it('applies custom className', () => {
    const { container } = render(<InlineLoader className="custom-inline" />);
    expect(container.firstChild).toHaveClass('custom-inline');
  });
});

describe('ProgressBar', () => {
  it('renders with value', () => {
    render(<ProgressBar value={50} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('sets aria attributes correctly', () => {
    render(<ProgressBar value={30} max={100} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('calculates percentage correctly', () => {
    const { container } = render(<ProgressBar value={25} max={100} />);

    const bar = container.querySelector('.bg-brand-500');
    expect(bar).toHaveStyle({ width: '25%' });
  });

  it('caps percentage at 100%', () => {
    const { container } = render(<ProgressBar value={150} max={100} />);

    const bar = container.querySelector('.bg-brand-500');
    expect(bar).toHaveStyle({ width: '100%' });
  });

  it('shows value when showValue is true', () => {
    render(<ProgressBar value={75} showValue />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides value when showValue is false', () => {
    render(<ProgressBar value={75} showValue={false} />);

    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  describe('colors', () => {
    it('applies brand color (default)', () => {
      const { container } = render(<ProgressBar value={50} color="brand" />);
      expect(container.querySelector('.bg-brand-500')).toBeInTheDocument();
    });

    it('applies success color', () => {
      const { container } = render(<ProgressBar value={50} color="success" />);
      expect(container.querySelector('.bg-success-500')).toBeInTheDocument();
    });

    it('applies warning color', () => {
      const { container } = render(<ProgressBar value={50} color="warning" />);
      expect(container.querySelector('.bg-warning-500')).toBeInTheDocument();
    });

    it('applies error color', () => {
      const { container } = render(<ProgressBar value={50} color="error" />);
      expect(container.querySelector('.bg-error-500')).toBeInTheDocument();
    });

    it('applies info color', () => {
      const { container } = render(<ProgressBar value={50} color="info" />);
      expect(container.querySelector('.bg-info-500')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies sm size', () => {
      const { container } = render(<ProgressBar value={50} size="sm" />);
      expect(container.querySelector('.h-1')).toBeInTheDocument();
    });

    it('applies md size (default)', () => {
      const { container } = render(<ProgressBar value={50} size="md" />);
      expect(container.querySelector('.h-2')).toBeInTheDocument();
    });

    it('applies lg size', () => {
      const { container } = render(<ProgressBar value={50} size="lg" />);
      expect(container.querySelector('.h-3')).toBeInTheDocument();
    });
  });

  it('applies indeterminate state', () => {
    const { container } = render(<ProgressBar value={0} indeterminate />);

    const bar = container.querySelector('.animate-progress-indeterminate');
    expect(bar).toBeInTheDocument();
  });

  it('removes aria-valuenow in indeterminate state', () => {
    render(<ProgressBar value={50} indeterminate />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressBar value={50} className="custom-progress" />);
    expect(container.firstChild).toHaveClass('custom-progress');
  });
});

describe('DotsLoader', () => {
  it('renders with default props', () => {
    render(<DotsLoader />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders three dots', () => {
    const { container } = render(<DotsLoader />);

    const dots = container.querySelectorAll('.rounded-full.animate-bounce');
    expect(dots.length).toBe(3);
  });

  describe('sizes', () => {
    it('applies sm size', () => {
      const { container } = render(<DotsLoader size="sm" />);
      expect(container.querySelector('.h-1\\.5')).toBeInTheDocument();
    });

    it('applies md size (default)', () => {
      const { container } = render(<DotsLoader size="md" />);
      expect(container.querySelector('.h-2')).toBeInTheDocument();
    });

    it('applies lg size', () => {
      const { container } = render(<DotsLoader size="lg" />);
      expect(container.querySelector('.h-3')).toBeInTheDocument();
    });
  });

  describe('colors', () => {
    it('applies default color', () => {
      const { container } = render(<DotsLoader color="default" />);
      expect(container.querySelector('.bg-gray-400')).toBeInTheDocument();
    });

    it('applies brand color', () => {
      const { container } = render(<DotsLoader color="brand" />);
      expect(container.querySelector('.bg-brand-500')).toBeInTheDocument();
    });

    it('applies white color', () => {
      const { container } = render(<DotsLoader color="white" />);
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
    });
  });

  it('applies staggered animation delays', () => {
    const { container } = render(<DotsLoader />);

    const dots = container.querySelectorAll('.rounded-full.animate-bounce');
    expect(dots[0]).toHaveStyle({ animationDelay: '0s' });
    expect(dots[1]).toHaveStyle({ animationDelay: '0.15s' });
    expect(dots[2]).toHaveStyle({ animationDelay: '0.3s' });
  });

  it('applies custom className', () => {
    const { container } = render(<DotsLoader className="custom-dots" />);
    expect(container.firstChild).toHaveClass('custom-dots');
  });
});
