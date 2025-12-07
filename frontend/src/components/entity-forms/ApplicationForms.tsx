// ============================================================
// APPLICATION FORMS - Status change, bulk actions, rejection
// ============================================================

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  applicationUpdateSchema,
  ApplicationUpdateFormData,
  bulkActionSchema,
  BulkActionFormData,
  rejectionReasonSchema,
  RejectionReasonFormData,
} from '../../schemas/application.schema';
import { FormInput, FormTextarea, FormSelect, FormTagsInput, FormCheckbox } from '../forms';
import { Modal, ConfirmationModal, FormModal } from '../modals';
import { Button, Badge } from '../ui';
import { cn } from '../../lib/utils';
import { ApplicationStatus } from '../../types';

// ============================================
// Status Change Modal
// ============================================

export interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { status: ApplicationStatus; notes?: string }) => Promise<void>;
  currentStatus: ApplicationStatus;
  candidateName: string;
  jobTitle: string;
  isLoading?: boolean;
}

const statusOptions: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'REVIEWING', label: 'Reviewing', color: 'bg-blue-100 text-blue-700' },
  { value: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-purple-100 text-purple-700' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'bg-green-100 text-green-700' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'WITHDRAWN', label: 'Withdrawn', color: 'bg-orange-100 text-orange-700' },
];

export function StatusChangeModal({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  candidateName,
  jobTitle,
  isLoading,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  const handleSubmit = async () => {
    await onSubmit({ status: selectedStatus, notes });
    setNotes('');
    onClose();
  };

  const currentOption = statusOptions.find((o) => o.value === currentStatus);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Application Status"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={selectedStatus === currentStatus}
          >
            Update Status
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Candidate Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {candidateName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{jobTitle}</p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Current status: </span>
            <Badge className={currentOption?.color}>{currentOption?.label}</Badge>
          </div>
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStatus(option.value)}
                disabled={option.value === currentStatus}
                className={cn(
                  'p-3 rounded-lg border-2 text-left transition-all',
                  selectedStatus === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
                  option.value === currentStatus && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Badge className={option.color} size="sm">
                  {option.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <FormTextarea
          label="Notes (optional)"
          placeholder="Add any notes about this status change..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        {/* Notification */}
        <FormCheckbox
          label="Send notification to candidate"
          description="The candidate will receive an email about this status change"
          checked={sendNotification}
          onChange={(e) => setSendNotification(e.target.checked)}
        />
      </div>
    </Modal>
  );
}

// ============================================
// Bulk Status Update Modal
// ============================================

export interface BulkStatusUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BulkActionFormData) => Promise<void>;
  selectedCount: number;
  applicationIds: string[];
  isLoading?: boolean;
}

export function BulkStatusUpdate({
  isOpen,
  onClose,
  onSubmit,
  selectedCount,
  applicationIds,
  isLoading,
}: BulkStatusUpdateProps) {
  const [action, setAction] = useState<'update_status' | 'add_tag' | 'assign'>('update_status');
  const [status, setStatus] = useState<ApplicationStatus>('REVIEWING');
  const [tag, setTag] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const handleSubmit = async () => {
    const data: BulkActionFormData = {
      applicationIds,
      action,
      payload: {
        ...(action === 'update_status' && { status }),
        ...(action === 'add_tag' && { tag }),
        ...(action === 'assign' && { assigneeId }),
      },
    };
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Update"
      description={`Update ${selectedCount} selected applications`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            Apply to {selectedCount} Applications
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Action Selection */}
        <FormSelect
          label="Action"
          value={action}
          onChange={(e) => setAction(e.target.value as typeof action)}
          options={[
            { value: 'update_status', label: 'Update Status' },
            { value: 'add_tag', label: 'Add Tag' },
            { value: 'assign', label: 'Assign to Recruiter' },
          ]}
          required
        />

        {/* Action-specific inputs */}
        {action === 'update_status' && (
          <FormSelect
            label="New Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            options={statusOptions.map((o) => ({ value: o.value, label: o.label }))}
            required
          />
        )}

        {action === 'add_tag' && (
          <FormInput
            label="Tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Enter tag name"
            required
          />
        )}

        {action === 'assign' && (
          <FormSelect
            label="Assign to"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={[
              { value: '', label: 'Select recruiter...' },
              { value: '1', label: 'John Recruiter' },
              { value: '2', label: 'Jane HR' },
              { value: '3', label: 'Bob Manager' },
            ]}
            required
          />
        )}

        {/* Warning */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
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
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                This action will affect {selectedCount} applications
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                This action cannot be undone. Make sure you have selected the correct applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// Rejection Modal
// ============================================

export interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RejectionReasonFormData) => Promise<void>;
  candidateName: string;
  applicationId: string;
  isLoading?: boolean;
}

const rejectionReasons = [
  { value: 'not_qualified', label: 'Not Qualified', description: 'Does not meet minimum requirements' },
  { value: 'experience_mismatch', label: 'Experience Mismatch', description: 'Experience level does not match' },
  { value: 'culture_fit', label: 'Culture Fit', description: 'Not a good cultural fit' },
  { value: 'salary_expectations', label: 'Salary Expectations', description: 'Salary expectations too high' },
  { value: 'position_filled', label: 'Position Filled', description: 'The position has been filled' },
  { value: 'other', label: 'Other', description: 'Other reason' },
];

export function RejectionModal({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  applicationId,
  isLoading,
}: RejectionModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<RejectionReasonFormData>({
    resolver: zodResolver(rejectionReasonSchema),
    defaultValues: {
      applicationId,
      reason: 'not_qualified',
      sendEmail: true,
    },
  });

  const selectedReason = watch('reason');

  const onFormSubmit = async (data: RejectionReasonFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Application"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit(onFormSubmit)} loading={isLoading}>
            Reject Application
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Candidate Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Rejecting application from</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{candidateName}</p>
        </div>

        {/* Rejection Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {rejectionReasons.map((reason) => (
              <label
                key={reason.value}
                className={cn(
                  'flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all',
                  selectedReason === reason.value
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                )}
              >
                <input
                  type="radio"
                  value={reason.value}
                  {...register('reason')}
                  className="mt-1 text-red-600 focus:ring-red-500"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {reason.label}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {reason.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Reason */}
        {selectedReason === 'other' && (
          <FormTextarea
            label="Custom Reason"
            placeholder="Please specify the reason..."
            rows={3}
            error={errors.customReason?.message}
            {...register('customReason')}
          />
        )}

        {/* Send Email */}
        <FormCheckbox
          label="Send rejection email to candidate"
          description="A personalized rejection email will be sent"
          {...register('sendEmail')}
        />
      </form>
    </Modal>
  );
}

// ============================================
// Application Notes Modal
// ============================================

export interface ApplicationNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  candidateName: string;
  existingNotes?: string[];
  isLoading?: boolean;
}

export function ApplicationNotesModal({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  existingNotes = [],
  isLoading,
}: ApplicationNotesModalProps) {
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    if (!note.trim()) return;
    await onSubmit(note);
    setNote('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Notes"
      description={`Notes for ${candidateName}'s application`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSubmit} loading={isLoading} disabled={!note.trim()}>
            Add Note
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Existing Notes */}
        {existingNotes.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {existingNotes.map((existingNote, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300"
              >
                {existingNote}
              </div>
            ))}
          </div>
        )}

        {existingNotes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No notes yet
          </p>
        )}

        {/* New Note Input */}
        <FormTextarea
          label="Add Note"
          placeholder="Type your note here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
}

// ============================================
// Move to Stage Modal (Kanban)
// ============================================

export interface MoveToStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stage: ApplicationStatus) => Promise<void>;
  currentStage: ApplicationStatus;
  candidateName: string;
  isLoading?: boolean;
}

export function MoveToStageModal({
  isOpen,
  onClose,
  onSubmit,
  currentStage,
  candidateName,
  isLoading,
}: MoveToStageModalProps) {
  const [selectedStage, setSelectedStage] = useState<ApplicationStatus>(currentStage);

  const stages: { value: ApplicationStatus; label: string; icon: string }[] = [
    { value: 'PENDING', label: 'Pending', icon: '📥' },
    { value: 'REVIEWING', label: 'Reviewing', icon: '👀' },
    { value: 'SHORTLISTED', label: 'Shortlisted', icon: '⭐' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Interview', icon: '📅' },
    { value: 'ACCEPTED', label: 'Accepted', icon: '✅' },
    { value: 'REJECTED', label: 'Rejected', icon: '❌' },
  ];

  const handleSubmit = async () => {
    if (selectedStage !== currentStage) {
      await onSubmit(selectedStage);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Move to Stage"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={selectedStage === currentStage}
          >
            Move
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Move <span className="font-medium text-gray-900 dark:text-gray-100">{candidateName}</span> to:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {stages.map((stage) => (
            <button
              key={stage.value}
              type="button"
              onClick={() => setSelectedStage(stage.value)}
              disabled={stage.value === currentStage}
              className={cn(
                'p-3 rounded-lg border-2 text-left transition-all',
                selectedStage === stage.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
                stage.value === currentStage && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-lg mr-2">{stage.icon}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {stage.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
