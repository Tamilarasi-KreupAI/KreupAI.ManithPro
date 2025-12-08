// ============================================================
// WORKFLOW FORMS - Automation and workflow builder forms
// ============================================================

import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormTagsInput,
  FormMultiSelect,
} from '../forms';
import { Modal, FormModal, ConfirmationModal } from '../modals';
import { Button, Badge, Card } from '../ui';
import { cn } from '../../lib/utils';

// ============================================
// Validation Schemas
// ============================================

const workflowConditionSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'in', 'not_in', 'is_empty', 'is_not_empty']),
  value: z.union([z.string(), z.array(z.string())]).optional(),
});

const workflowActionSchema = z.object({
  type: z.enum([
    'send_email',
    'send_notification',
    'update_status',
    'assign_to',
    'add_tag',
    'remove_tag',
    'schedule_interview',
    'create_task',
    'webhook',
    'delay',
    'conditional',
  ]),
  config: z.record(z.any()).optional(),
});

export const workflowSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  trigger: z.object({
    type: z.enum([
      'application_received',
      'application_status_changed',
      'interview_scheduled',
      'interview_completed',
      'offer_sent',
      'offer_accepted',
      'offer_rejected',
      'candidate_hired',
      'manual',
      'scheduled',
    ]),
    conditions: z.array(workflowConditionSchema).optional(),
  }),
  actions: z.array(workflowActionSchema).min(1, 'At least one action is required'),
  isActive: z.boolean().default(true),
  runOnce: z.boolean().default(false),
  priority: z.number().min(1).max(100).default(50),
  tags: z.array(z.string()).optional(),
});

export type WorkflowCondition = z.infer<typeof workflowConditionSchema>;
export type WorkflowAction = z.infer<typeof workflowActionSchema>;
export type WorkflowFormData = z.infer<typeof workflowSchema>;

// ============================================
// Trigger and Action Options
// ============================================

const triggerTypeOptions = [
  { value: 'application_received', label: 'Application Received', icon: '📥', description: 'When a new application is submitted' },
  { value: 'application_status_changed', label: 'Status Changed', icon: '🔄', description: 'When application status changes' },
  { value: 'interview_scheduled', label: 'Interview Scheduled', icon: '📅', description: 'When an interview is scheduled' },
  { value: 'interview_completed', label: 'Interview Completed', icon: '✅', description: 'When an interview is marked complete' },
  { value: 'offer_sent', label: 'Offer Sent', icon: '📤', description: 'When an offer is sent to candidate' },
  { value: 'offer_accepted', label: 'Offer Accepted', icon: '🎉', description: 'When candidate accepts offer' },
  { value: 'offer_rejected', label: 'Offer Rejected', icon: '❌', description: 'When candidate rejects offer' },
  { value: 'candidate_hired', label: 'Candidate Hired', icon: '👤', description: 'When candidate is marked as hired' },
  { value: 'manual', label: 'Manual Trigger', icon: '👆', description: 'Triggered manually by user' },
  { value: 'scheduled', label: 'Scheduled', icon: '⏰', description: 'Runs on a schedule' },
];

const actionTypeOptions = [
  { value: 'send_email', label: 'Send Email', icon: '📧', description: 'Send an email notification' },
  { value: 'send_notification', label: 'Send Notification', icon: '🔔', description: 'Send in-app notification' },
  { value: 'update_status', label: 'Update Status', icon: '🔄', description: 'Change application status' },
  { value: 'assign_to', label: 'Assign To', icon: '👤', description: 'Assign to team member' },
  { value: 'add_tag', label: 'Add Tag', icon: '🏷️', description: 'Add a tag to application' },
  { value: 'remove_tag', label: 'Remove Tag', icon: '🗑️', description: 'Remove a tag from application' },
  { value: 'schedule_interview', label: 'Schedule Interview', icon: '📅', description: 'Auto-schedule interview' },
  { value: 'create_task', label: 'Create Task', icon: '✅', description: 'Create a task for team member' },
  { value: 'webhook', label: 'Webhook', icon: '🔗', description: 'Send data to external URL' },
  { value: 'delay', label: 'Delay', icon: '⏳', description: 'Wait before next action' },
  { value: 'conditional', label: 'Conditional', icon: '🔀', description: 'Branch based on condition' },
];

const operatorOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'in', label: 'Is in' },
  { value: 'not_in', label: 'Is not in' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

const conditionFieldOptions = [
  { value: 'status', label: 'Application Status' },
  { value: 'job_title', label: 'Job Title' },
  { value: 'job_department', label: 'Department' },
  { value: 'candidate_experience', label: 'Experience (years)' },
  { value: 'candidate_location', label: 'Candidate Location' },
  { value: 'source', label: 'Application Source' },
  { value: 'score', label: 'Assessment Score' },
  { value: 'tags', label: 'Tags' },
];

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'REVIEWING', label: 'Reviewing' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
];

// ============================================
// Workflow Builder Form
// ============================================

export interface WorkflowBuilderProps {
  initialData?: Partial<WorkflowFormData>;
  onSubmit: (data: WorkflowFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function WorkflowBuilder({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode = 'create',
}: WorkflowBuilderProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger: {
        type: 'application_received',
        conditions: [],
      },
      actions: [
        { type: 'send_notification', config: {} },
      ],
      isActive: true,
      runOnce: false,
      priority: 50,
      tags: [],
      ...initialData,
    },
  });

  const { fields: actionFields, append: appendAction, remove: removeAction, move: moveAction } = useFieldArray({
    control,
    name: 'actions',
  });

  const { fields: conditionFields, append: appendCondition, remove: removeCondition } = useFieldArray({
    control,
    name: 'trigger.conditions',
  });

  const triggerType = watch('trigger.type');
  const selectedTrigger = triggerTypeOptions.find((t) => t.value === triggerType);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Workflow Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Workflow Name"
            placeholder="e.g., Auto-respond to applications"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Priority (1-100)"
                type="number"
                min={1}
                max={100}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
              />
            )}
          />
        </div>

        <div className="mt-4">
          <FormTextarea
            label="Description"
            placeholder="Describe what this workflow does..."
            rows={2}
            {...register('description')}
          />
        </div>

        <div className="mt-4 flex items-center gap-6">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Active"
                description="Workflow will run automatically"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="runOnce"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Run Once Per Entity"
                description="Only trigger once per application"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </section>

      {/* Trigger Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          When this happens... (Trigger)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {triggerTypeOptions.map((trigger) => (
            <Controller
              key={trigger.value}
              name="trigger.type"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(trigger.value)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-center transition-all',
                    field.value === trigger.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <span className="text-2xl block mb-1">{trigger.icon}</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100 block">
                    {trigger.label}
                  </span>
                </button>
              )}
            />
          ))}
        </div>

        {selectedTrigger && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{selectedTrigger.label}:</strong> {selectedTrigger.description}
            </p>
          </div>
        )}

        {/* Conditions */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Conditions (Optional)
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendCondition({ field: '', operator: 'equals', value: '' })}
            >
              + Add Condition
            </Button>
          </div>

          {conditionFields.length > 0 && (
            <div className="space-y-2">
              {conditionFields.map((field, index) => (
                <ConditionRow
                  key={field.id}
                  index={index}
                  control={control}
                  register={register}
                  onRemove={() => removeCondition(index)}
                  isFirst={index === 0}
                />
              ))}
            </div>
          )}

          {conditionFields.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No conditions set. Workflow will trigger for all matching events.
            </p>
          )}
        </div>
      </section>

      {/* Actions Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Do this... (Actions)
          </h3>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAction({ type: 'send_notification', config: {} })}
            >
              + Add Action
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {actionFields.map((field, index) => (
            <ActionEditor
              key={field.id}
              index={index}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
              onRemove={() => removeAction(index)}
              onMoveUp={() => index > 0 && moveAction(index, index - 1)}
              onMoveDown={() => index < actionFields.length - 1 && moveAction(index, index + 1)}
              isFirst={index === 0}
              isLast={index === actionFields.length - 1}
            />
          ))}
        </div>

        {actionFields.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p>No actions configured.</p>
            <p className="text-sm mt-1">Click "Add Action" to get started.</p>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="outline">
          Test Workflow
        </Button>
        <Button type="submit" loading={isLoading}>
          {mode === 'create' ? 'Create Workflow' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

// ============================================
// Condition Row Component
// ============================================

interface ConditionRowProps {
  index: number;
  control: any;
  register: any;
  onRemove: () => void;
  isFirst: boolean;
}

function ConditionRow({ index, control, register, onRemove, isFirst }: ConditionRowProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {!isFirst && (
        <span className="text-sm font-medium text-gray-500 w-12">AND</span>
      )}

      <Controller
        name={`trigger.conditions.${index}.field`}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            className={cn(
              'h-9 rounded px-2 text-sm flex-1',
              'border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100'
            )}
          >
            <option value="">Select field...</option>
            {conditionFieldOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      />

      <Controller
        name={`trigger.conditions.${index}.operator`}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            className={cn(
              'h-9 rounded px-2 text-sm w-36',
              'border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100'
            )}
          >
            {operatorOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      />

      <input
        type="text"
        placeholder="Value"
        {...register(`trigger.conditions.${index}.value`)}
        className={cn(
          'h-9 rounded px-2 text-sm flex-1',
          'border border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100'
        )}
      />

      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-500"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ============================================
// Action Editor Component
// ============================================

interface ActionEditorProps {
  index: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function ActionEditor({
  index,
  control,
  register,
  watch,
  setValue,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ActionEditorProps) {
  const actionType = watch(`actions.${index}.type`);
  const selectedAction = actionTypeOptions.find((a) => a.value === actionType);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900">
        <span className="text-lg">{selectedAction?.icon || '⚡'}</span>
        <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>

        <Controller
          name={`actions.${index}.type`}
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className={cn(
                'h-8 rounded px-2 text-sm flex-1',
                'border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-gray-100'
              )}
            >
              {actionTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          )}
        />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className={cn('p-1 text-gray-400', !isFirst && 'hover:text-gray-600')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className={cn('p-1 text-gray-400', !isLast && 'hover:text-gray-600')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {selectedAction?.description}
        </p>

        {/* Action-specific configuration */}
        {actionType === 'send_email' && (
          <EmailActionConfig index={index} register={register} control={control} />
        )}

        {actionType === 'send_notification' && (
          <NotificationActionConfig index={index} register={register} control={control} />
        )}

        {actionType === 'update_status' && (
          <StatusActionConfig index={index} register={register} control={control} />
        )}

        {actionType === 'assign_to' && (
          <AssignActionConfig index={index} register={register} control={control} />
        )}

        {actionType === 'add_tag' && (
          <TagActionConfig index={index} register={register} control={control} action="add" />
        )}

        {actionType === 'remove_tag' && (
          <TagActionConfig index={index} register={register} control={control} action="remove" />
        )}

        {actionType === 'delay' && (
          <DelayActionConfig index={index} register={register} control={control} />
        )}

        {actionType === 'webhook' && (
          <WebhookActionConfig index={index} register={register} control={control} />
        )}

        {actionType === 'create_task' && (
          <TaskActionConfig index={index} register={register} control={control} />
        )}
      </div>
    </div>
  );
}

// ============================================
// Action Configuration Components
// ============================================

function EmailActionConfig({ index, register, control }: { index: number; register: any; control: any }) {
  return (
    <div className="space-y-3">
      <FormInput
        label="Email Template"
        placeholder="Select template or enter subject..."
        {...register(`actions.${index}.config.template`)}
      />
      <FormInput
        label="Recipient"
        placeholder="{{candidate.email}} or custom email"
        {...register(`actions.${index}.config.recipient`)}
      />
      <FormTextarea
        label="Custom Message (optional)"
        placeholder="Leave blank to use template..."
        rows={3}
        {...register(`actions.${index}.config.message`)}
      />
    </div>
  );
}

function NotificationActionConfig({ index, register, control }: { index: number; register: any; control: any }) {
  return (
    <div className="space-y-3">
      <FormInput
        label="Title"
        placeholder="Notification title..."
        {...register(`actions.${index}.config.title`)}
      />
      <FormTextarea
        label="Message"
        placeholder="Notification message..."
        rows={2}
        {...register(`actions.${index}.config.message`)}
      />
      <Controller
        name={`actions.${index}.config.recipients`}
        control={control}
        render={({ field }) => (
          <FormSelect
            label="Send To"
            options={[
              { value: 'recruiter', label: 'Assigned Recruiter' },
              { value: 'hiring_manager', label: 'Hiring Manager' },
              { value: 'team', label: 'Entire Team' },
              { value: 'custom', label: 'Custom' },
            ]}
            {...field}
          />
        )}
      />
    </div>
  );
}

function StatusActionConfig({ index, register, control }: { index: number; register: any; control: any }) {
  return (
    <div className="space-y-3">
      <Controller
        name={`actions.${index}.config.status`}
        control={control}
        render={({ field }) => (
          <FormSelect
            label="New Status"
            options={statusOptions}
            {...field}
          />
        )}
      />
      <FormInput
        label="Notes (optional)"
        placeholder="Add a note about this status change..."
        {...register(`actions.${index}.config.notes`)}
      />
    </div>
  );
}

function AssignActionConfig({ index, register, control }: { index: number; register: any; control: any }) {
  return (
    <div className="space-y-3">
      <Controller
        name={`actions.${index}.config.assignmentType`}
        control={control}
        render={({ field }) => (
          <FormSelect
            label="Assignment Type"
            options={[
              { value: 'specific', label: 'Specific Person' },
              { value: 'round_robin', label: 'Round Robin' },
              { value: 'least_busy', label: 'Least Busy' },
              { value: 'random', label: 'Random' },
            ]}
            {...field}
          />
        )}
      />
      <FormInput
        label="Assign To (if specific)"
        placeholder="Select team member..."
        {...register(`actions.${index}.config.assignee`)}
      />
    </div>
  );
}

function TagActionConfig({ index, register, control, action }: { index: number; register: any; control: any; action: 'add' | 'remove' }) {
  return (
    <div className="space-y-3">
      <FormInput
        label={action === 'add' ? 'Tag to Add' : 'Tag to Remove'}
        placeholder="Enter tag name..."
        {...register(`actions.${index}.config.tag`)}
      />
    </div>
  );
}

function DelayActionConfig({ index, register, control }: { index: number; register: any; control: any }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <FormInput
          label="Delay Duration"
          type="number"
          min={1}
          placeholder="5"
          {...register(`actions.${index}.config.duration`)}
        />
      </div>
      <div className="w-32">
        <Controller
          name={`actions.${index}.config.unit`}
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Unit"
              options={[
                { value: 'minutes', label: 'Minutes' },
                { value: 'hours', label: 'Hours' },
                { value: 'days', label: 'Days' },
              ]}
              {...field}
            />
          )}
        />
      </div>
    </div>
  );
}

function WebhookActionConfig({ index, register, control }: { index: number; register: any; control: any }) {
  return (
    <div className="space-y-3">
      <FormInput
        label="Webhook URL"
        placeholder="https://api.example.com/webhook"
        {...register(`actions.${index}.config.url`)}
      />
      <Controller
        name={`actions.${index}.config.method`}
        control={control}
        render={({ field }) => (
          <FormSelect
            label="HTTP Method"
            options={[
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'PATCH', label: 'PATCH' },
            ]}
            {...field}
          />
        )}
      />
      <FormTextarea
        label="Custom Headers (JSON)"
        placeholder='{"Authorization": "Bearer token"}'
        rows={2}
        className="font-mono text-sm"
        {...register(`actions.${index}.config.headers`)}
      />
    </div>
  );
}

function TaskActionConfig({ index, register, control }: { index: number; register: any; control: any }) {
  return (
    <div className="space-y-3">
      <FormInput
        label="Task Title"
        placeholder="Task title..."
        {...register(`actions.${index}.config.title`)}
      />
      <FormTextarea
        label="Task Description"
        placeholder="Task description..."
        rows={2}
        {...register(`actions.${index}.config.description`)}
      />
      <FormInput
        label="Due In (days)"
        type="number"
        min={0}
        placeholder="3"
        {...register(`actions.${index}.config.dueInDays`)}
      />
      <Controller
        name={`actions.${index}.config.priority`}
        control={control}
        render={({ field }) => (
          <FormSelect
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            {...field}
          />
        )}
      />
    </div>
  );
}

// ============================================
// Workflow Modal (Quick Create)
// ============================================

export interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowFormData) => Promise<void>;
  initialData?: Partial<WorkflowFormData>;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
}

export function WorkflowModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  isLoading,
}: WorkflowModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger: { type: 'application_received', conditions: [] },
      actions: [{ type: 'send_notification', config: {} }],
      isActive: true,
      ...initialData,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={mode === 'create' ? 'Create Workflow' : 'Edit Workflow'}
      description="Configure an automated workflow"
      size="lg"
      submitText={mode === 'create' ? 'Create' : 'Save'}
      isLoading={isLoading}
      isDirty={isDirty}
    >
      <div className="space-y-4">
        <FormInput
          label="Workflow Name"
          placeholder="e.g., Auto-respond to applications"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <Controller
          name="trigger.type"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Trigger"
              options={triggerTypeOptions.map((t) => ({
                value: t.value,
                label: `${t.icon} ${t.label}`,
              }))}
              error={errors.trigger?.type?.message}
              required
              {...field}
            />
          )}
        />

        <FormTextarea
          label="Description"
          placeholder="Describe what this workflow does..."
          rows={2}
          {...register('description')}
        />

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <FormCheckbox
              label="Active"
              description="Workflow will run automatically when triggered"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </FormModal>
  );
}

// ============================================
// Workflow Card Component
// ============================================

export interface WorkflowCardProps {
  workflow: WorkflowFormData & { id: string };
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: (isActive: boolean) => void;
}

export function WorkflowCard({
  workflow,
  onEdit,
  onDelete,
  onToggle,
}: WorkflowCardProps) {
  const trigger = triggerTypeOptions.find((t) => t.value === workflow.trigger.type);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        <div className="text-2xl">{trigger?.icon || '⚡'}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {workflow.name}
            </h4>
            <Badge variant={workflow.isActive ? 'success' : 'secondary'} size="sm">
              {workflow.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {trigger?.label} → {workflow.actions.length} action{workflow.actions.length !== 1 ? 's' : ''}
          </p>
          {workflow.description && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {workflow.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggle && (
            <button
              type="button"
              onClick={() => onToggle(!workflow.isActive)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                workflow.isActive ? 'bg-blue-600' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  workflow.isActive ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Export all
export default {
  WorkflowBuilder,
  WorkflowModal,
  WorkflowCard,
};
