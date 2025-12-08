import { Fragment, ReactNode } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

const sizeClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-[95vw] min-h-[90vh]',
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: keyof typeof sizeClasses;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: ReactNode;
  className?: string;
}

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className,
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1300]"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />
        </TransitionChild>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={cn(
                  'w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-modal transition-all',
                  sizeClasses[size],
                  className
                )}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <div className="flex-1">
                      {title && (
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {title}
                        </DialogTitle>
                      )}
                      {description && (
                        <Description className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {description}
                        </Description>
                      )}
                    </div>
                    {showCloseButton && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="shrink-0 -mr-2 -mt-1"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="px-6 py-4">{children}</div>

                {/* Footer */}
                {footer && (
                  <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
                    {footer}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Confirmation Modal
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const buttonVariant =
    variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-sm text-gray-600 dark:text-gray-400">{message}</div>
    </Modal>
  );
}

// Alert Modal (single action)
export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  buttonText?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  variant = 'info',
}: AlertModalProps) {
  const buttonVariant =
    variant === 'error'
      ? 'danger'
      : variant === 'success'
        ? 'success'
        : variant === 'warning'
          ? 'warning'
          : 'primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <Button variant={buttonVariant} onClick={onClose} className="ml-auto">
          {buttonText}
        </Button>
      }
    >
      <div className="text-sm text-gray-600 dark:text-gray-400">{message}</div>
    </Modal>
  );
}

export { Modal, ConfirmModal, AlertModal };
