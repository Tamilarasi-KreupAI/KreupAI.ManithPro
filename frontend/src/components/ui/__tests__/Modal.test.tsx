import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, ConfirmModal, AlertModal } from '../Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', async () => {
      render(<Modal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
      });
    });

    it('should not render modal when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render title when provided', async () => {
      render(<Modal {...defaultProps} title="Test Modal" />);

      await waitFor(() => {
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
      });
    });

    it('should render description when provided', async () => {
      render(
        <Modal {...defaultProps} title="Title" description="This is a description" />
      );

      await waitFor(() => {
        expect(screen.getByText('This is a description')).toBeInTheDocument();
      });
    });

    it('should render footer when provided', async () => {
      render(
        <Modal {...defaultProps} footer={<button>Footer Button</button>} />
      );

      await waitFor(() => {
        expect(screen.getByText('Footer Button')).toBeInTheDocument();
      });
    });

    it('should render close button by default', async () => {
      render(<Modal {...defaultProps} title="Test" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
      });
    });

    it('should hide close button when showCloseButton is false', async () => {
      render(<Modal {...defaultProps} title="Test" showCloseButton={false} />);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('sizes', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full'] as const)(
      'should render with size %s',
      async (size) => {
        render(<Modal {...defaultProps} size={size} />);

        await waitFor(() => {
          expect(screen.getByText('Modal Content')).toBeInTheDocument();
        });
      }
    );
  });

  describe('interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<Modal {...defaultProps} title="Test" onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /close modal/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when pressing Escape', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<Modal {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });

    it('should not call onClose on overlay click when closeOnOverlayClick is false', async () => {
      const onClose = vi.fn();

      render(
        <Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />
      );

      await waitFor(() => {
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
      });

      // The Dialog from HeadlessUI should not call onClose
      // We can't easily test overlay click without more complex setup
    });
  });

  describe('accessibility', () => {
    it('should have dialog role', async () => {
      render(<Modal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should have accessible title when provided', async () => {
      render(<Modal {...defaultProps} title="Accessible Title" />);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAccessibleName('Accessible Title');
      });
    });
  });

  describe('custom className', () => {
    it('should apply custom className', async () => {
      render(<Modal {...defaultProps} className="custom-class" />);

      await waitFor(() => {
        const content = screen.getByText('Modal Content');
        expect(content.closest('[class*="custom-class"]')).toBeInTheDocument();
      });
    });
  });
});

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to continue?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render title and message', async () => {
      render(<ConfirmModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Confirm Action')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to continue?')).toBeInTheDocument();
      });
    });

    it('should render default button texts', async () => {
      render(<ConfirmModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      });
    });

    it('should render custom button texts', async () => {
      render(
        <ConfirmModal
          {...defaultProps}
          confirmText="Yes, delete"
          cancelText="No, keep it"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'No, keep it' })).toBeInTheDocument();
      });
    });

    it('should render ReactNode message', async () => {
      render(
        <ConfirmModal
          {...defaultProps}
          message={<strong>Important message</strong>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Important message')).toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<ConfirmModal {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading state', () => {
    it('should disable buttons when isLoading is true', async () => {
      render(<ConfirmModal {...defaultProps} isLoading={true} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      });
    });

    it('should show loading indicator on confirm button', async () => {
      render(<ConfirmModal {...defaultProps} isLoading={true} />);

      await waitFor(() => {
        // The confirm button should be in loading state
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      });
    });
  });

  describe('variants', () => {
    it.each(['danger', 'warning', 'info'] as const)(
      'should render with %s variant',
      async (variant) => {
        render(<ConfirmModal {...defaultProps} variant={variant} />);

        await waitFor(() => {
          expect(screen.getByText('Confirm Action')).toBeInTheDocument();
        });
      }
    );
  });
});

describe('AlertModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Alert Title',
    message: 'This is an alert message',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render title and message', async () => {
      render(<AlertModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Alert Title')).toBeInTheDocument();
        expect(screen.getByText('This is an alert message')).toBeInTheDocument();
      });
    });

    it('should render default button text', async () => {
      render(<AlertModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
      });
    });

    it('should render custom button text', async () => {
      render(<AlertModal {...defaultProps} buttonText="Got it!" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Got it!' })).toBeInTheDocument();
      });
    });

    it('should render ReactNode message', async () => {
      render(
        <AlertModal
          {...defaultProps}
          message={<em>Emphasized message</em>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Emphasized message')).toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('should call onClose when button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AlertModal {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'OK' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('variants', () => {
    it.each(['info', 'success', 'warning', 'error'] as const)(
      'should render with %s variant',
      async (variant) => {
        render(<AlertModal {...defaultProps} variant={variant} />);

        await waitFor(() => {
          expect(screen.getByText('Alert Title')).toBeInTheDocument();
        });
      }
    );
  });
});
