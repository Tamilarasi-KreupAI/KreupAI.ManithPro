// ============================================================
// FORM MODAL - Modal wrapper for forms
// ============================================================

import React, { useState } from 'react';
import { Modal, ModalSize } from './Modal';
import { Button } from '../ui';
import { cn } from '../../lib/utils';

// ============================================
// Form Modal
// ============================================

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDirty?: boolean;
  showDiscardPrompt?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  size = 'md',
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading,
  isDirty = false,
  showDiscardPrompt = true,
  footer,
  className,
}: FormModalProps) {
  const [showDiscard, setShowDiscard] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (isDirty && showDiscardPrompt) {
      setShowDiscard(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(e);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setShowDiscard(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        description={description}
        size={size}
        closeOnOverlayClick={!isDirty}
        footer={
          footer || (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={submitting || isLoading}
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                form="modal-form"
                loading={submitting || isLoading}
              >
                {submitText}
              </Button>
            </>
          )
        }
        className={className}
      >
        <form id="modal-form" onSubmit={handleSubmit}>
          {children}
        </form>
      </Modal>

      {/* Discard prompt */}
      <Modal
        isOpen={showDiscard}
        onClose={() => setShowDiscard(false)}
        size="sm"
        hideHeader
      >
        <div className="text-center">
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
            Discard changes?
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You have unsaved changes. Are you sure you want to discard them?
          </p>

          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setShowDiscard(false)}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={handleDiscard}>
              Discard
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ============================================
// Stepped Form Modal (Wizard)
// ============================================

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isValid?: () => boolean;
  isOptional?: boolean;
}

export interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void | Promise<void>;
  title: string;
  steps: WizardStep[];
  size?: ModalSize;
  completeText?: string;
  isLoading?: boolean;
  className?: string;
}

export function WizardModal({
  isOpen,
  onClose,
  onComplete,
  title,
  steps,
  size = 'lg',
  completeText = 'Complete',
  isLoading,
  className,
}: WizardModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const canGoNext = current.isValid ? current.isValid() : true;

  const handleNext = () => {
    if (canGoNext && !isLast) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!canGoNext) return;

    setCompleting(true);
    try {
      await onComplete({});
      setCurrentStep(0);
      onClose();
    } finally {
      setCompleting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size={size}
      className={className}
    >
      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    'transition-colors duration-200',
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  )}
                >
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1 text-xs',
                    index <= currentStep
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {current.title}
        </h3>
        {current.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {current.description}
          </p>
        )}
        {current.content}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" onClick={handlePrev} disabled={isFirst}>
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          {isLast ? (
            <Button
              onClick={handleComplete}
              loading={completing || isLoading}
              disabled={!canGoNext}
            >
              {completeText}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canGoNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// Detail Modal (View Mode)
// ============================================

export interface DetailField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

export interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: DetailField[];
  actions?: React.ReactNode;
  onEdit?: () => void;
  size?: ModalSize;
  className?: string;
}

export function DetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
  actions,
  onEdit,
  size = 'md',
  className,
}: DetailModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={subtitle}
      size={size}
      className={className}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              Edit
            </Button>
          )}
          {actions}
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <div
            key={index}
            className={cn(field.fullWidth && 'sm:col-span-2')}
          >
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {field.label}
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {field.value || '—'}
            </dd>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ============================================
// Loading Modal
// ============================================

export interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export function LoadingModal({
  isOpen,
  message = 'Loading...',
}: LoadingModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      size="sm"
      hideHeader
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="flex flex-col items-center py-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </Modal>
  );
}
