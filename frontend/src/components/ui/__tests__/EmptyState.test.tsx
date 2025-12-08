import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search, Inbox } from 'lucide-react';
import {
  EmptyState,
  NoResults,
  NoData,
  ErrorState,
  OfflineState,
  AccessDenied,
  NotFound,
  EmptyFolder,
  EmptyCart,
  NoEvents,
  NoMessages,
  NoNotifications,
  NoTeamMembers,
  ComingSoon,
  NoFavorites,
  NoBookmarks,
} from '../EmptyState';

describe('EmptyState', () => {
  describe('basic rendering', () => {
    it('renders title', () => {
      render(<EmptyState title="No items found" />);

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('No items found');
    });

    it('renders description', () => {
      render(
        <EmptyState title="No items" description="Try adjusting your search criteria." />
      );

      expect(screen.getByText('Try adjusting your search criteria.')).toBeInTheDocument();
    });

    it('renders Lucide icon component', () => {
      render(<EmptyState title="Search" icon={Search} />);

      // Icon should be rendered
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders custom ReactNode icon', () => {
      render(
        <EmptyState
          title="Custom Icon"
          icon={<span data-testid="custom-icon">Icon</span>}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('renders primary action button', async () => {
      const onClick = vi.fn();
      render(
        <EmptyState
          title="No items"
          action={{ label: 'Create Item', onClick }}
        />
      );

      const button = screen.getByRole('button', { name: 'Create Item' });
      await userEvent.click(button);

      expect(onClick).toHaveBeenCalled();
    });

    it('renders secondary action button', async () => {
      const onClick = vi.fn();
      render(
        <EmptyState
          title="No items"
          secondaryAction={{ label: 'Learn More', onClick }}
        />
      );

      const button = screen.getByRole('button', { name: 'Learn More' });
      await userEvent.click(button);

      expect(onClick).toHaveBeenCalled();
    });

    it('renders both actions', () => {
      render(
        <EmptyState
          title="No items"
          action={{ label: 'Primary', onClick: vi.fn() }}
          secondaryAction={{ label: 'Secondary', onClick: vi.fn() }}
        />
      );

      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
    });

    it('renders children', () => {
      render(
        <EmptyState title="Custom">
          <button>Custom Button</button>
        </EmptyState>
      );

      expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
    });

    it('applies action variant', async () => {
      render(
        <EmptyState
          title="Error"
          action={{ label: 'Retry', onClick: vi.fn(), variant: 'outline' }}
        />
      );

      // Button should exist with outline variant
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('applies sm size', () => {
      const { container } = render(<EmptyState title="Small" size="sm" />);

      expect(container.querySelector('.gap-3')).toBeInTheDocument();
    });

    it('applies md size (default)', () => {
      const { container } = render(<EmptyState title="Medium" size="md" />);

      expect(container.querySelector('.gap-4')).toBeInTheDocument();
    });

    it('applies lg size', () => {
      const { container } = render(<EmptyState title="Large" size="lg" />);

      expect(container.querySelector('.gap-5')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      const { container } = render(<EmptyState title="Default" variant="default" />);

      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('flex-col');
    });

    it('applies card variant', () => {
      const { container } = render(<EmptyState title="Card" variant="card" />);

      expect(container.firstChild).toHaveClass('rounded-xl');
      expect(container.firstChild).toHaveClass('border');
    });

    it('applies centered variant', () => {
      const { container } = render(<EmptyState title="Centered" variant="centered" />);

      expect(container.firstChild).toHaveClass('justify-center');
      expect(container.firstChild).toHaveClass('min-h-[400px]');
    });
  });

  it('applies custom className', () => {
    const { container } = render(<EmptyState title="Custom" className="custom-empty" />);

    expect(container.firstChild).toHaveClass('custom-empty');
  });
});

describe('NoResults', () => {
  it('renders with query', () => {
    render(<NoResults query="search term" />);

    expect(screen.getByText('No results for "search term"')).toBeInTheDocument();
  });

  it('renders without query', () => {
    render(<NoResults />);

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders clear button when onClear provided', async () => {
    const onClear = vi.fn();
    render(<NoResults onClear={onClear} />);

    const button = screen.getByRole('button', { name: 'Clear Search' });
    await userEvent.click(button);

    expect(onClear).toHaveBeenCalled();
  });

  it('hides clear button when onClear not provided', () => {
    render(<NoResults />);

    expect(screen.queryByRole('button', { name: 'Clear Search' })).not.toBeInTheDocument();
  });
});

describe('NoData', () => {
  it('renders with default entity name', () => {
    render(<NoData />);

    expect(screen.getByText('No items yet')).toBeInTheDocument();
  });

  it('renders with custom entity name', () => {
    render(<NoData entityName="users" />);

    expect(screen.getByText('No users yet')).toBeInTheDocument();
  });

  it('renders create button when onCreate provided', async () => {
    const onCreate = vi.fn();
    render(<NoData entityName="users" onCreate={onCreate} />);

    const button = screen.getByRole('button', { name: 'Create user' });
    await userEvent.click(button);

    expect(onCreate).toHaveBeenCalled();
  });
});

describe('ErrorState', () => {
  it('renders with default title and message', () => {
    render(<ErrorState />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText("We couldn't load this content. Please try again.")).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(<ErrorState title="Network Error" message="Please check your connection." />);

    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Please check your connection.')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: 'Try Again' });
    await userEvent.click(button);

    expect(onRetry).toHaveBeenCalled();
  });
});

describe('OfflineState', () => {
  it('renders offline message', () => {
    render(<OfflineState />);

    expect(screen.getByText("You're offline")).toBeInTheDocument();
    expect(screen.getByText('Check your internet connection and try again.')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', async () => {
    const onRetry = vi.fn();
    render(<OfflineState onRetry={onRetry} />);

    const button = screen.getByRole('button', { name: 'Retry' });
    await userEvent.click(button);

    expect(onRetry).toHaveBeenCalled();
  });
});

describe('AccessDenied', () => {
  it('renders access denied message', () => {
    render(<AccessDenied />);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to view this content.")).toBeInTheDocument();
  });

  it('renders go back button when onGoBack provided', async () => {
    const onGoBack = vi.fn();
    render(<AccessDenied onGoBack={onGoBack} />);

    const button = screen.getByRole('button', { name: 'Go Back' });
    await userEvent.click(button);

    expect(onGoBack).toHaveBeenCalled();
  });
});

describe('NotFound', () => {
  it('renders not found message', () => {
    render(<NotFound />);

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText("The page you're looking for doesn't exist or has been moved.")).toBeInTheDocument();
  });

  it('renders go home button when onGoHome provided', async () => {
    const onGoHome = vi.fn();
    render(<NotFound onGoHome={onGoHome} />);

    const button = screen.getByRole('button', { name: 'Go Home' });
    await userEvent.click(button);

    expect(onGoHome).toHaveBeenCalled();
  });
});

describe('EmptyFolder', () => {
  it('renders with default message', () => {
    render(<EmptyFolder />);

    expect(screen.getByText('This folder is empty')).toBeInTheDocument();
  });

  it('renders with folder name', () => {
    render(<EmptyFolder folderName="Documents" />);

    expect(screen.getByText('Documents is empty')).toBeInTheDocument();
  });

  it('renders upload button when onUpload provided', async () => {
    const onUpload = vi.fn();
    render(<EmptyFolder onUpload={onUpload} />);

    const button = screen.getByRole('button', { name: 'Upload Files' });
    await userEvent.click(button);

    expect(onUpload).toHaveBeenCalled();
  });
});

describe('EmptyCart', () => {
  it('renders cart empty message', () => {
    render(<EmptyCart />);

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Start shopping to add items to your cart.')).toBeInTheDocument();
  });

  it('renders browse button when onBrowse provided', async () => {
    const onBrowse = vi.fn();
    render(<EmptyCart onBrowse={onBrowse} />);

    const button = screen.getByRole('button', { name: 'Browse Products' });
    await userEvent.click(button);

    expect(onBrowse).toHaveBeenCalled();
  });
});

describe('NoEvents', () => {
  it('renders no events message', () => {
    render(<NoEvents />);

    expect(screen.getByText('No events scheduled')).toBeInTheDocument();
  });

  it('renders create button when onCreate provided', async () => {
    const onCreate = vi.fn();
    render(<NoEvents onCreate={onCreate} />);

    const button = screen.getByRole('button', { name: 'Create Event' });
    await userEvent.click(button);

    expect(onCreate).toHaveBeenCalled();
  });
});

describe('NoMessages', () => {
  it('renders no messages', () => {
    render(<NoMessages />);

    expect(screen.getByText('No messages')).toBeInTheDocument();
  });

  it('renders compose button when onCompose provided', async () => {
    const onCompose = vi.fn();
    render(<NoMessages onCompose={onCompose} />);

    const button = screen.getByRole('button', { name: 'New Message' });
    await userEvent.click(button);

    expect(onCompose).toHaveBeenCalled();
  });
});

describe('NoNotifications', () => {
  it('renders no notifications message', () => {
    render(<NoNotifications />);

    expect(screen.getByText('No notifications')).toBeInTheDocument();
    expect(screen.getByText("You're all caught up! Check back later for updates.")).toBeInTheDocument();
  });
});

describe('NoTeamMembers', () => {
  it('renders no team members message', () => {
    render(<NoTeamMembers />);

    expect(screen.getByText('No team members')).toBeInTheDocument();
  });

  it('renders invite button when onInvite provided', async () => {
    const onInvite = vi.fn();
    render(<NoTeamMembers onInvite={onInvite} />);

    const button = screen.getByRole('button', { name: 'Invite Members' });
    await userEvent.click(button);

    expect(onInvite).toHaveBeenCalled();
  });
});

describe('ComingSoon', () => {
  it('renders default coming soon message', () => {
    render(<ComingSoon />);

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.getByText('This feature is currently under development. Stay tuned!')).toBeInTheDocument();
  });

  it('renders with feature name', () => {
    render(<ComingSoon feature="Dark Mode" />);

    expect(screen.getByText('Dark Mode is currently under development. Stay tuned!')).toBeInTheDocument();
  });
});

describe('NoFavorites', () => {
  it('renders no favorites message', () => {
    render(<NoFavorites />);

    expect(screen.getByText('No favorites yet')).toBeInTheDocument();
  });

  it('renders browse button when onBrowse provided', async () => {
    const onBrowse = vi.fn();
    render(<NoFavorites onBrowse={onBrowse} />);

    const button = screen.getByRole('button', { name: 'Browse Items' });
    await userEvent.click(button);

    expect(onBrowse).toHaveBeenCalled();
  });
});

describe('NoBookmarks', () => {
  it('renders no bookmarks message', () => {
    render(<NoBookmarks />);

    expect(screen.getByText('No bookmarks')).toBeInTheDocument();
    expect(screen.getByText('Save items you want to revisit later.')).toBeInTheDocument();
  });
});
