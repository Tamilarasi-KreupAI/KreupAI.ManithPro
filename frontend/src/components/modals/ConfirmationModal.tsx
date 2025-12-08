// ============================================================
// CONFIRMATION MODAL - Various confirmation dialogs
// ============================================================

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../ui';
import { cn } from '../../lib/utils';

// ============================================
// Types
// ============================================

export type ConfirmationType = 'warning' | 'danger' | 'info' | 'success';

// ============================================
// Base Confirmation Modal
// ============================================

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
  requireInput?: string; // Require user to type this to confirm
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false,
  requireInput,
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (requireInput && inputValue !== requireInput) return;

    setConfirming(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setConfirming(false);
      setInputValue('');
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  const typeConfig = {
    warning: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      buttonVariant: 'warning' as const,
    },
    danger: {
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonVariant: 'danger' as const,
    },
    info: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonVariant: 'primary' as const,
    },
    success: {
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      buttonVariant: 'success' as const,
    },
  };

  const config = typeConfig[type];

  const icons = {
    warning: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
    danger: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    ),
    info: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    success: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm" hideHeader>
      <div className="text-center">
        {/* Icon */}
        <div
          className={cn(
            'mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4',
            config.iconBg
          )}
        >
          <svg
            className={cn('w-6 h-6', config.iconColor)}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icons[type]}
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>

        {/* Message */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </div>

        {/* Require input confirmation */}
        {requireInput && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Type <span className="font-mono font-bold">{requireInput}</span> to confirm:
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={cn(
                'w-full h-10 rounded-lg px-3 text-sm text-center',
                'border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
              placeholder={requireInput}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={handleClose} disabled={confirming || isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            loading={confirming || isLoading}
            disabled={requireInput ? inputValue !== requireInput : false}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// Delete Confirmation Modal
// ============================================

export interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
  requireTypedConfirmation?: boolean;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isLoading,
  requireTypedConfirmation = false,
}: DeleteConfirmationProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType}?`}
      message={
        <>
          Are you sure you want to delete{' '}
          <span className="font-semibold">{itemName}</span>? This action cannot
          be undone.
        </>
      }
      confirmText="Delete"
      type="danger"
      isLoading={isLoading}
      requireInput={requireTypedConfirmation ? itemName : undefined}
    />
  );
}

// ============================================
// Discard Changes Modal
// ============================================

export interface DiscardChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
}

export function DiscardChangesModal({
  isOpen,
  onClose,
  onDiscard,
  onSave,
  isSaving,
}: DiscardChangesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" hideHeader>
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
          <svg
            className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Unsaved Changes
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You have unsaved changes. Do you want to save them before leaving?
        </p>

        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onDiscard}>
            Discard
          </Button>
          <Button variant="outline" onClick={onClose}>
            Keep editing
          </Button>
          {onSave && (
            <Button onClick={onSave} loading={isSaving}>
              Save changes
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// Alert Modal (Info/Success/Error)
// ============================================

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  type?: 'info' | 'success' | 'error' | 'warning';
  buttonText?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
}: AlertModalProps) {
  const typeConfig = {
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      color: 'text-blue-600 dark:text-blue-400',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    success: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      color: 'text-green-600 dark:text-green-400',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      color: 'text-red-600 dark:text-red-400',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      color: 'text-yellow-600 dark:text-yellow-400',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      ),
    },
  };

  const config = typeConfig[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" hideHeader>
      <div className="text-center">
        <div
          className={cn(
            'mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4',
            config.bg
          )}
        >
          <svg
            className={cn('w-6 h-6', config.color)}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {config.icon}
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </div>

        <Button onClick={onClose} className="w-full">
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}

// ============================================
// Prompt Modal (with input)
// ============================================

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void | Promise<void>;
  title: string;
  message?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputType?: 'text' | 'email' | 'number' | 'textarea';
  defaultValue?: string;
  submitText?: string;
  cancelText?: string;
  required?: boolean;
  isLoading?: boolean;
}

export function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  inputLabel,
  inputPlaceholder,
  inputType = 'text',
  defaultValue = '',
  submitText = 'Submit',
  cancelText = 'Cancel',
  required = false,
  isLoading,
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (required && !value.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(value);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setValue(defaultValue);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <form onSubmit={handleSubmit}>
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {message}
          </p>
        )}

        {inputLabel && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {inputLabel}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {inputType === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={inputPlaceholder}
            required={required}
            rows={4}
            className={cn(
              'w-full rounded-lg px-3 py-2 text-sm',
              'border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          />
        ) : (
          <input
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={inputPlaceholder}
            required={required}
            className={cn(
              'w-full h-10 rounded-lg px-3 text-sm',
              'border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          />
        )}

        <div className="flex gap-3 justify-end mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={submitting || isLoading}
          >
            {cancelText}
          </Button>
          <Button type="submit" loading={submitting || isLoading}>
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
