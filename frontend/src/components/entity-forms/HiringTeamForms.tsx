// ============================================================
// HIRING TEAM FORMS - Team and member management forms
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
import { Button, Badge } from '../ui';
import { cn } from '../../lib/utils';
import { TeamRole, Permission, TeamMember, HiringTeam } from '../../types/team.types';

// ============================================
// Validation Schemas
// ============================================

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  department: z.string().optional(),
  settings: z.object({
    allowSelfAssignment: z.boolean().default(false),
    requireFeedback: z.boolean().default(true),
    feedbackDeadline: z.number().min(1).max(168).default(48),
    notifyOnNewApplication: z.boolean().default(true),
    notifyOnStageChange: z.boolean().default(true),
    autoAssignmentEnabled: z.boolean().default(false),
  }).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['admin', 'recruiter', 'hiring_manager', 'interviewer', 'viewer']),
  permissions: z.array(z.string()).optional(),
  message: z.string().optional(),
});

export const updateMemberSchema = z.object({
  role: z.enum(['admin', 'recruiter', 'hiring_manager', 'interviewer', 'viewer']),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
});

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberFormData = z.infer<typeof updateMemberSchema>;

// ============================================
// Role and Permission Options
// ============================================

const roleOptions: { value: TeamRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access to all team features' },
  { value: 'recruiter', label: 'Recruiter', description: 'Can manage jobs and candidates' },
  { value: 'hiring_manager', label: 'Hiring Manager', description: 'Can review and make hiring decisions' },
  { value: 'interviewer', label: 'Interviewer', description: 'Can conduct interviews and submit feedback' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to team data' },
];

const permissionGroups = [
  {
    name: 'Jobs',
    permissions: [
      { value: 'jobs:create', label: 'Create jobs' },
      { value: 'jobs:edit', label: 'Edit jobs' },
      { value: 'jobs:delete', label: 'Delete jobs' },
      { value: 'jobs:publish', label: 'Publish jobs' },
    ],
  },
  {
    name: 'Applications',
    permissions: [
      { value: 'applications:view', label: 'View applications' },
      { value: 'applications:edit', label: 'Edit applications' },
      { value: 'applications:move', label: 'Move pipeline stage' },
      { value: 'applications:reject', label: 'Reject applications' },
      { value: 'applications:offer', label: 'Make offers' },
    ],
  },
  {
    name: 'Interviews',
    permissions: [
      { value: 'interviews:schedule', label: 'Schedule interviews' },
      { value: 'interviews:conduct', label: 'Conduct interviews' },
      { value: 'interviews:feedback', label: 'Submit feedback' },
    ],
  },
  {
    name: 'Candidates',
    permissions: [
      { value: 'candidates:view', label: 'View candidates' },
      { value: 'candidates:contact', label: 'Contact candidates' },
      { value: 'candidates:export', label: 'Export data' },
    ],
  },
  {
    name: 'Admin',
    permissions: [
      { value: 'reports:view', label: 'View reports' },
      { value: 'reports:create', label: 'Create reports' },
      { value: 'settings:manage', label: 'Manage settings' },
      { value: 'team:manage', label: 'Manage team' },
    ],
  },
];

const departmentOptions = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'product', label: 'Product' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'customer_success', label: 'Customer Success' },
  { value: 'other', label: 'Other' },
];

// ============================================
// Create Team Form
// ============================================

export interface CreateTeamFormProps {
  initialData?: Partial<CreateTeamFormData>;
  onSubmit: (data: CreateTeamFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function CreateTeamForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode = 'create',
}: CreateTeamFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      department: '',
      settings: {
        allowSelfAssignment: false,
        requireFeedback: true,
        feedbackDeadline: 48,
        notifyOnNewApplication: true,
        notifyOnStageChange: true,
        autoAssignmentEnabled: false,
      },
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Team Information
        </h3>
        <div className="space-y-4">
          <FormInput
            label="Team Name"
            placeholder="e.g., Engineering Hiring Team"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Department"
                options={departmentOptions}
                error={errors.department?.message}
                {...field}
              />
            )}
          />

          <FormTextarea
            label="Description"
            placeholder="Describe the purpose of this hiring team..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>
      </section>

      {/* Team Settings */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Team Settings
        </h3>
        <div className="space-y-4">
          <Controller
            name="settings.allowSelfAssignment"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Allow Self-Assignment"
                description="Team members can assign themselves to applications"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="settings.requireFeedback"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Require Interview Feedback"
                description="Interviewers must submit feedback after interviews"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="settings.feedbackDeadline"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Feedback Deadline (hours)"
                type="number"
                min={1}
                max={168}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 48)}
              />
            )}
          />

          <Controller
            name="settings.notifyOnNewApplication"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Notify on New Applications"
                description="Send notifications when new applications are received"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="settings.notifyOnStageChange"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Notify on Stage Changes"
                description="Send notifications when applications move stages"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="settings.autoAssignmentEnabled"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Enable Auto-Assignment"
                description="Automatically assign applications based on rules"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {mode === 'create' ? 'Create Team' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

// ============================================
// Create Team Modal
// ============================================

export interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamFormData) => Promise<void>;
  initialData?: Partial<CreateTeamFormData>;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
}

export function CreateTeamModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  isLoading,
}: CreateTeamModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      department: '',
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
      title={mode === 'create' ? 'Create Hiring Team' : 'Edit Team'}
      description={mode === 'create' ? 'Create a new hiring team for your organization.' : 'Update team details.'}
      size="md"
      submitText={mode === 'create' ? 'Create Team' : 'Save Changes'}
      isLoading={isLoading}
      isDirty={isDirty}
    >
      <div className="space-y-4">
        <FormInput
          label="Team Name"
          placeholder="e.g., Engineering Hiring Team"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Department"
              options={departmentOptions}
              error={errors.department?.message}
              {...field}
            />
          )}
        />

        <FormTextarea
          label="Description"
          placeholder="Describe the purpose of this hiring team..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />
      </div>
    </FormModal>
  );
}

// ============================================
// Invite Member Modal
// ============================================

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InviteMemberFormData) => Promise<void>;
  teamName: string;
  isLoading?: boolean;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onSubmit,
  teamName,
  isLoading,
}: InviteMemberModalProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'interviewer',
      permissions: [],
      message: '',
    },
  });

  const selectedRole = watch('role');

  const handleClose = () => {
    reset();
    onClose();
  };

  // Get default permissions based on role
  const getDefaultPermissions = (role: TeamRole): Permission[] => {
    switch (role) {
      case 'admin':
        return permissionGroups.flatMap((g) => g.permissions.map((p) => p.value as Permission));
      case 'recruiter':
        return ['jobs:create', 'jobs:edit', 'applications:view', 'applications:edit', 'applications:move', 'interviews:schedule', 'candidates:view', 'candidates:contact'] as Permission[];
      case 'hiring_manager':
        return ['jobs:edit', 'applications:view', 'applications:move', 'applications:reject', 'applications:offer', 'interviews:feedback', 'candidates:view', 'reports:view'] as Permission[];
      case 'interviewer':
        return ['applications:view', 'interviews:conduct', 'interviews:feedback', 'candidates:view'] as Permission[];
      case 'viewer':
        return ['applications:view', 'candidates:view'] as Permission[];
      default:
        return [];
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title="Invite Team Member"
      description={`Invite someone to join "${teamName}"`}
      size="lg"
      submitText="Send Invitation"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <FormInput
          label="Email Address"
          type="email"
          placeholder="colleague@company.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {roleOptions.filter((r) => r.value !== 'owner').map((role) => (
              <Controller
                key={role.value}
                name="role"
                control={control}
                render={({ field }) => (
                  <label
                    className={cn(
                      'flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all',
                      field.value === role.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      value={role.value}
                      checked={field.value === role.value}
                      onChange={() => field.onChange(role.value)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {role.label}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {role.description}
                      </p>
                    </div>
                  </label>
                )}
              />
            ))}
          </div>
        </div>

        {/* Default Permissions Preview */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Permissions for {roleOptions.find((r) => r.value === selectedRole)?.label}
          </p>
          <div className="flex flex-wrap gap-1">
            {getDefaultPermissions(selectedRole as TeamRole).slice(0, 6).map((p) => (
              <Badge key={p} variant="outline" size="sm">
                {p.split(':')[1]}
              </Badge>
            ))}
            {getDefaultPermissions(selectedRole as TeamRole).length > 6 && (
              <Badge variant="outline" size="sm">
                +{getDefaultPermissions(selectedRole as TeamRole).length - 6} more
              </Badge>
            )}
          </div>
        </div>

        <FormTextarea
          label="Personal Message (optional)"
          placeholder="Add a personal note to the invitation..."
          rows={2}
          {...register('message')}
        />
      </div>
    </FormModal>
  );
}

// ============================================
// Edit Member Permissions Modal
// ============================================

export interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateMemberFormData) => Promise<void>;
  member: TeamMember;
  isLoading?: boolean;
}

export function EditMemberModal({
  isOpen,
  onClose,
  onSubmit,
  member,
  isLoading,
}: EditMemberModalProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateMemberFormData>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: {
      role: member.role as 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | 'viewer',
      permissions: member.permissions,
      isActive: member.isActive,
    },
  });

  const selectedPermissions = watch('permissions');

  const handleClose = () => {
    reset();
    onClose();
  };

  const togglePermission = (permission: string, currentPermissions: string[], onChange: (value: string[]) => void) => {
    if (currentPermissions.includes(permission)) {
      onChange(currentPermissions.filter((p) => p !== permission));
    } else {
      onChange([...currentPermissions, permission]);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title="Edit Member"
      description={`Update permissions for ${member.user?.firstName} ${member.user?.lastName}`}
      size="lg"
      submitText="Save Changes"
      isLoading={isLoading}
      isDirty={isDirty}
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {/* Role Selection */}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Role"
              options={roleOptions.filter((r) => r.value !== 'owner').map((r) => ({
                value: r.value,
                label: r.label,
              }))}
              error={errors.role?.message}
              required
              {...field}
            />
          )}
        />

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Permissions
          </label>
          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <div className="space-y-4">
                {permissionGroups.map((group) => (
                  <div key={group.name} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {group.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {group.permissions.map((permission) => (
                        <label
                          key={permission.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={field.value.includes(permission.value)}
                            onChange={() =>
                              togglePermission(permission.value, field.value, field.onChange)
                            }
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {permission.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>

        {/* Active Status */}
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <FormCheckbox
              label="Active Member"
              description="Inactive members cannot access team resources"
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
// Remove Member Confirmation
// ============================================

export interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  member: TeamMember;
  isLoading?: boolean;
}

export function RemoveMemberModal({
  isOpen,
  onClose,
  onConfirm,
  member,
  isLoading,
}: RemoveMemberModalProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Remove Team Member"
      message={
        <>
          Are you sure you want to remove{' '}
          <span className="font-semibold">
            {member.user?.firstName} {member.user?.lastName}
          </span>{' '}
          from the team? They will lose access to all team resources.
        </>
      }
      confirmText="Remove Member"
      type="danger"
      isLoading={isLoading}
    />
  );
}

// ============================================
// Team Member Card
// ============================================

export interface TeamMemberCardProps {
  member: TeamMember;
  onEdit?: () => void;
  onRemove?: () => void;
  isCurrentUser?: boolean;
}

export function TeamMemberCard({
  member,
  onEdit,
  onRemove,
  isCurrentUser,
}: TeamMemberCardProps) {
  const roleConfig = roleOptions.find((r) => r.value === member.role);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        {member.user?.avatar ? (
          <img
            src={member.user.avatar}
            alt={`${member.user.firstName} ${member.user.lastName}`}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {member.user?.firstName?.charAt(0)}
              {member.user?.lastName?.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {member.user?.firstName} {member.user?.lastName}
            </h4>
            {isCurrentUser && (
              <Badge variant="outline" size="sm">You</Badge>
            )}
            {!member.isActive && (
              <Badge variant="warning" size="sm">Inactive</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {member.user?.email}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              className={cn(
                member.role === 'admin' && 'bg-purple-100 text-purple-700',
                member.role === 'recruiter' && 'bg-blue-100 text-blue-700',
                member.role === 'hiring_manager' && 'bg-green-100 text-green-700',
                member.role === 'interviewer' && 'bg-yellow-100 text-yellow-700',
                member.role === 'viewer' && 'bg-gray-100 text-gray-700'
              )}
              size="sm"
            >
              {roleConfig?.label || member.role}
            </Badge>
          </div>
        </div>

        {(onEdit || onRemove) && !isCurrentUser && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Bulk Invite Modal
// ============================================

export interface BulkInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (emails: string[], role: TeamRole) => Promise<void>;
  teamName: string;
  isLoading?: boolean;
}

export function BulkInviteModal({
  isOpen,
  onClose,
  onSubmit,
  teamName,
  isLoading,
}: BulkInviteModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<TeamRole>('interviewer');
  const [emailInput, setEmailInput] = useState('');

  const handleSubmit = async () => {
    await onSubmit(emails, role);
    setEmails([]);
    setRole('interviewer');
    setEmailInput('');
    onClose();
  };

  const addEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed && !emails.includes(trimmed) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmails([...emails, trimmed]);
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(emailInput);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Bulk Invite"
      description={`Invite multiple people to "${teamName}"`}
      size="md"
      submitText={`Invite ${emails.length} People`}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Addresses
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 min-h-[100px]">
            <div className="flex flex-wrap gap-2 mb-2">
              {emails.map((email) => (
                <Badge
                  key={email}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Badge>
              ))}
            </div>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => addEmail(emailInput)}
              placeholder="Type email and press Enter..."
              className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press Enter or comma to add multiple emails
          </p>
        </div>

        {/* Role Selection */}
        <FormSelect
          label="Role for All"
          options={roleOptions.filter((r) => r.value !== 'owner').map((r) => ({
            value: r.value,
            label: r.label,
          }))}
          value={role}
          onChange={(e) => setRole(e.target.value as TeamRole)}
          required
        />
      </div>
    </FormModal>
  );
}

// Export all
export default {
  CreateTeamForm,
  CreateTeamModal,
  InviteMemberModal,
  EditMemberModal,
  RemoveMemberModal,
  TeamMemberCard,
  BulkInviteModal,
};
