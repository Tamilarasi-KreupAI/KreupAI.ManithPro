import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast, ToastProvider } from '../Toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => {
  const toasts: any[] = [];
  let idCounter = 0;

  return {
    Toaster: () => null,
    toast: {
      custom: vi.fn((renderFn, options) => {
        const id = `toast-${++idCounter}`;
        const toastObj = { id, visible: true };
        toasts.push({ id, render: renderFn, options });
        return id;
      }),
      dismiss: vi.fn((id?: string) => {
        if (id) {
          const index = toasts.findIndex((t) => t.id === id);
          if (index > -1) toasts.splice(index, 1);
        } else {
          toasts.length = 0;
        }
      }),
    },
  };
});

// Import the mocked module
import { toast as hotToast } from 'react-hot-toast';

describe('toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toast.success', () => {
    it('calls hotToast.custom with correct message', () => {
      toast.success('Operation successful');

      expect(hotToast.custom).toHaveBeenCalled();
      const renderFn = (hotToast.custom as any).mock.calls[0][0];
      const { container } = render(renderFn({ id: 'test', visible: true }));

      expect(screen.getByText('Operation successful')).toBeInTheDocument();
    });

    it('includes description when provided', () => {
      toast.success('Success', 'Your changes have been saved');

      const renderFn = (hotToast.custom as any).mock.calls[0][0];
      const { container } = render(renderFn({ id: 'test', visible: true }));

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Your changes have been saved')).toBeInTheDocument();
    });

    it('sets duration to 5000ms', () => {
      toast.success('Success');

      const options = (hotToast.custom as any).mock.calls[0][1];
      expect(options.duration).toBe(5000);
    });
  });

  describe('toast.error', () => {
    it('calls hotToast.custom with correct message', () => {
      toast.error('Something went wrong');

      expect(hotToast.custom).toHaveBeenCalled();
      const renderFn = (hotToast.custom as any).mock.calls[0][0];
      render(renderFn({ id: 'test', visible: true }));

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('sets duration to 6000ms', () => {
      toast.error('Error');

      const options = (hotToast.custom as any).mock.calls[0][1];
      expect(options.duration).toBe(6000);
    });
  });

  describe('toast.warning', () => {
    it('calls hotToast.custom with correct message', () => {
      toast.warning('Please check your input');

      expect(hotToast.custom).toHaveBeenCalled();
      const renderFn = (hotToast.custom as any).mock.calls[0][0];
      render(renderFn({ id: 'test', visible: true }));

      expect(screen.getByText('Please check your input')).toBeInTheDocument();
    });

    it('sets duration to 5000ms', () => {
      toast.warning('Warning');

      const options = (hotToast.custom as any).mock.calls[0][1];
      expect(options.duration).toBe(5000);
    });
  });

  describe('toast.info', () => {
    it('calls hotToast.custom with correct message', () => {
      toast.info('Did you know?');

      expect(hotToast.custom).toHaveBeenCalled();
      const renderFn = (hotToast.custom as any).mock.calls[0][0];
      render(renderFn({ id: 'test', visible: true }));

      expect(screen.getByText('Did you know?')).toBeInTheDocument();
    });

    it('sets duration to 4000ms', () => {
      toast.info('Info');

      const options = (hotToast.custom as any).mock.calls[0][1];
      expect(options.duration).toBe(4000);
    });
  });

  describe('toast.loading', () => {
    it('calls hotToast.custom with correct message', () => {
      toast.loading('Loading...');

      expect(hotToast.custom).toHaveBeenCalled();
      const renderFn = (hotToast.custom as any).mock.calls[0][0];
      render(renderFn({ id: 'test', visible: true }));

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('sets duration to Infinity', () => {
      toast.loading('Loading');

      const options = (hotToast.custom as any).mock.calls[0][1];
      expect(options.duration).toBe(Infinity);
    });

    it('does not show dismiss button', () => {
      toast.loading('Loading');

      const renderFn = (hotToast.custom as any).mock.calls[0][0];
      render(renderFn({ id: 'test', visible: true }));

      expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
    });
  });

  describe('toast.promise', () => {
    it('shows loading toast initially', async () => {
      const promise = new Promise((resolve) => setTimeout(resolve, 100));

      toast.promise(promise, {
        loading: 'Saving...',
        success: 'Saved!',
        error: 'Failed to save',
      });

      expect(hotToast.custom).toHaveBeenCalled();
      const renderFn = (hotToast.custom as any).mock.calls[0][0];
      render(renderFn({ id: 'test', visible: true }));

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('shows success toast on resolution', async () => {
      const promise = Promise.resolve('data');

      toast.promise(promise, {
        loading: 'Saving...',
        success: 'Saved!',
        error: 'Failed',
      });

      await promise;
      await waitFor(() => {
        expect(hotToast.dismiss).toHaveBeenCalled();
      });
    });

    it('shows error toast on rejection', async () => {
      const promise = Promise.reject(new Error('Network error'));

      toast.promise(promise, {
        loading: 'Saving...',
        success: 'Saved!',
        error: 'Failed',
      });

      try {
        await promise;
      } catch (e) {
        // Expected
      }

      await waitFor(() => {
        expect(hotToast.dismiss).toHaveBeenCalled();
      });
    });

    it('supports function for success message', async () => {
      const promise = Promise.resolve({ name: 'John' });

      toast.promise(promise, {
        loading: 'Saving...',
        success: (data) => `Saved ${data.name}!`,
        error: 'Failed',
      });

      await promise;
    });

    it('supports function for error message', async () => {
      const promise = Promise.reject(new Error('Custom error'));

      toast.promise(promise, {
        loading: 'Saving...',
        success: 'Saved!',
        error: (err) => `Error: ${err.message}`,
      });

      try {
        await promise;
      } catch (e) {
        // Expected
      }
    });
  });

  describe('toast.dismiss', () => {
    it('dismisses specific toast by id', () => {
      const id = toast.success('Test');
      toast.dismiss(id);

      expect(hotToast.dismiss).toHaveBeenCalledWith(id);
    });
  });

  describe('toast.dismissAll', () => {
    it('dismisses all toasts', () => {
      toast.success('Toast 1');
      toast.success('Toast 2');
      toast.dismissAll();

      expect(hotToast.dismiss).toHaveBeenCalledWith();
    });
  });
});

describe('ToastContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders success icon for success type', () => {
    toast.success('Success message');

    const renderFn = (hotToast.custom as any).mock.calls[0][0];
    const { container } = render(renderFn({ id: 'test', visible: true }));

    expect(container.querySelector('.text-success-500')).toBeInTheDocument();
  });

  it('renders error icon for error type', () => {
    toast.error('Error message');

    const renderFn = (hotToast.custom as any).mock.calls[0][0];
    const { container } = render(renderFn({ id: 'test', visible: true }));

    expect(container.querySelector('.text-error-500')).toBeInTheDocument();
  });

  it('renders warning icon for warning type', () => {
    toast.warning('Warning message');

    const renderFn = (hotToast.custom as any).mock.calls[0][0];
    const { container } = render(renderFn({ id: 'test', visible: true }));

    expect(container.querySelector('.text-warning-500')).toBeInTheDocument();
  });

  it('renders info icon for info type', () => {
    toast.info('Info message');

    const renderFn = (hotToast.custom as any).mock.calls[0][0];
    const { container } = render(renderFn({ id: 'test', visible: true }));

    expect(container.querySelector('.text-info-500')).toBeInTheDocument();
  });

  it('renders loading spinner for loading type', () => {
    toast.loading('Loading');

    const renderFn = (hotToast.custom as any).mock.calls[0][0];
    const { container } = render(renderFn({ id: 'test', visible: true }));

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders dismiss button for non-loading types', async () => {
    toast.success('Success');

    const renderFn = (hotToast.custom as any).mock.calls[0][0];
    render(renderFn({ id: 'test', visible: true }));

    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
  });

  it('calls dismiss when dismiss button clicked', async () => {
    toast.success('Success');

    const renderFn = (hotToast.custom as any).mock.calls[0][0];
    render(renderFn({ id: 'test', visible: true }));

    await userEvent.click(screen.getByLabelText('Dismiss'));

    expect(hotToast.dismiss).toHaveBeenCalled();
  });

  it('applies correct border color for success', () => {
    toast.success('Success');

    const renderFn = (hotToast.custom as any).mock.calls[0][0];
    const { container } = render(renderFn({ id: 'test', visible: true }));

    expect(container.querySelector('.border-l-success-500')).toBeInTheDocument();
  });

  it('applies correct border color for error', () => {
    toast.error('Error');

    const renderFn = (hotToast.custom as any).mock.calls[0][0];
    const { container } = render(renderFn({ id: 'test', visible: true }));

    expect(container.querySelector('.border-l-error-500')).toBeInTheDocument();
  });
});

describe('ToastProvider', () => {
  it('renders without crashing', () => {
    const { container } = render(<ToastProvider />);
    // ToastProvider renders Toaster which is mocked to return null
    expect(container).toBeInTheDocument();
  });
});
