// ============================================================
// INTEGRATION FORMS - OAuth, Calendar, API Key management
// ============================================================

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormTagsInput,
} from '../forms';
import { Modal, FormModal, ConfirmationModal } from '../modals';
import { Button, Badge, Card } from '../ui';
import { cn } from '../../lib/utils';

// ============================================
// Validation Schemas
// ============================================

export const oauthConnectionSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  accountLabel: z.string().optional(),
});

export const apiKeySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().optional(),
  rateLimit: z.number().min(0).optional(),
  allowedIps: z.array(z.string()).optional(),
});

export const webhookSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  events: z.array(z.string()).min(1, 'Select at least one event'),
  secret: z.string().optional(),
  isActive: z.boolean().default(true),
  retryOnFailure: z.boolean().default(true),
  headers: z.record(z.string()).optional(),
});

export const calendarIntegrationSchema = z.object({
  provider: z.enum(['google', 'outlook', 'apple']),
  calendarId: z.string().optional(),
  syncDirection: z.enum(['one_way', 'two_way']).default('two_way'),
  syncFrequency: z.enum(['realtime', '5min', '15min', '30min', 'hourly']).default('realtime'),
  eventTypes: z.array(z.string()).optional(),
  workingHours: z.object({
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
    timezone: z.string(),
    daysOfWeek: z.array(z.number()),
  }).optional(),
});

export type OAuthConnectionFormData = z.infer<typeof oauthConnectionSchema>;
export type ApiKeyFormData = z.infer<typeof apiKeySchema>;
export type WebhookFormData = z.infer<typeof webhookSchema>;
export type CalendarIntegrationFormData = z.infer<typeof calendarIntegrationSchema>;

// ============================================
// Integration Provider Options
// ============================================

const oauthProviders = [
  { value: 'google', label: 'Google', icon: '🔵', description: 'Calendar, Drive, Gmail' },
  { value: 'microsoft', label: 'Microsoft', icon: '🟦', description: 'Outlook, Teams, OneDrive' },
  { value: 'linkedin', label: 'LinkedIn', icon: '🔷', description: 'Profile, Jobs, Recruiting' },
  { value: 'github', label: 'GitHub', icon: '⬛', description: 'Repositories, Profile' },
  { value: 'slack', label: 'Slack', icon: '💜', description: 'Messaging, Notifications' },
  { value: 'zoom', label: 'Zoom', icon: '🔵', description: 'Video Meetings' },
  { value: 'indeed', label: 'Indeed', icon: '🟣', description: 'Job Postings' },
  { value: 'greenhouse', label: 'Greenhouse', icon: '🟢', description: 'ATS Integration' },
];

const scopeOptions: Record<string, { value: string; label: string; description: string }[]> = {
  google: [
    { value: 'calendar.readonly', label: 'Calendar (Read)', description: 'View calendar events' },
    { value: 'calendar.events', label: 'Calendar (Write)', description: 'Create and edit events' },
    { value: 'gmail.readonly', label: 'Gmail (Read)', description: 'Read email messages' },
    { value: 'gmail.send', label: 'Gmail (Send)', description: 'Send emails' },
    { value: 'drive.readonly', label: 'Drive (Read)', description: 'View files' },
  ],
  microsoft: [
    { value: 'calendars.readwrite', label: 'Calendar', description: 'Read and write calendar' },
    { value: 'mail.readwrite', label: 'Mail', description: 'Read and send emails' },
    { value: 'onlineMeetings.readwrite', label: 'Teams Meetings', description: 'Create meetings' },
  ],
  linkedin: [
    { value: 'r_liteprofile', label: 'Profile (Basic)', description: 'Basic profile info' },
    { value: 'r_emailaddress', label: 'Email', description: 'Email address' },
    { value: 'w_member_social', label: 'Post', description: 'Post on behalf of user' },
  ],
  github: [
    { value: 'read:user', label: 'Profile', description: 'Read user profile' },
    { value: 'repo', label: 'Repositories', description: 'Access repositories' },
  ],
  slack: [
    { value: 'chat:write', label: 'Send Messages', description: 'Send messages to channels' },
    { value: 'channels:read', label: 'Read Channels', description: 'View channel info' },
  ],
};

const apiPermissionOptions = [
  { value: 'jobs:read', label: 'Read Jobs' },
  { value: 'jobs:write', label: 'Write Jobs' },
  { value: 'applications:read', label: 'Read Applications' },
  { value: 'applications:write', label: 'Write Applications' },
  { value: 'candidates:read', label: 'Read Candidates' },
  { value: 'candidates:write', label: 'Write Candidates' },
  { value: 'interviews:read', label: 'Read Interviews' },
  { value: 'interviews:write', label: 'Write Interviews' },
  { value: 'analytics:read', label: 'Read Analytics' },
  { value: 'webhooks:manage', label: 'Manage Webhooks' },
];

const webhookEventOptions = [
  { value: 'application.created', label: 'Application Created' },
  { value: 'application.updated', label: 'Application Updated' },
  { value: 'application.status_changed', label: 'Application Status Changed' },
  { value: 'interview.scheduled', label: 'Interview Scheduled' },
  { value: 'interview.completed', label: 'Interview Completed' },
  { value: 'offer.sent', label: 'Offer Sent' },
  { value: 'offer.accepted', label: 'Offer Accepted' },
  { value: 'offer.rejected', label: 'Offer Rejected' },
  { value: 'candidate.hired', label: 'Candidate Hired' },
  { value: 'job.created', label: 'Job Created' },
  { value: 'job.closed', label: 'Job Closed' },
];

// ============================================
// OAuth Connection Modal
// ============================================

export interface OAuthConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (data: OAuthConnectionFormData) => Promise<void>;
  provider?: string;
  isLoading?: boolean;
}

export function OAuthConnectionModal({
  isOpen,
  onClose,
  onConnect,
  provider: initialProvider,
  isLoading,
}: OAuthConnectionModalProps) {
  const [selectedProvider, setSelectedProvider] = useState(initialProvider || '');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

  const handleConnect = async () => {
    await onConnect({
      provider: selectedProvider,
      scopes: selectedScopes,
    });
    onClose();
  };

  const availableScopes = scopeOptions[selectedProvider] || [];
  const providerInfo = oauthProviders.find((p) => p.value === selectedProvider);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Integration"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            loading={isLoading}
            disabled={!selectedProvider || selectedScopes.length === 0}
          >
            Connect
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Provider Selection */}
        {!initialProvider && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Provider
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {oauthProviders.map((provider) => (
                <button
                  key={provider.value}
                  type="button"
                  onClick={() => {
                    setSelectedProvider(provider.value);
                    setSelectedScopes([]);
                  }}
                  className={cn(
                    'p-4 rounded-lg border-2 text-center transition-all',
                    selectedProvider === provider.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <span className="text-2xl block mb-1">{provider.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">
                    {provider.label}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {provider.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Provider Info */}
        {providerInfo && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-4">
            <span className="text-3xl">{providerInfo.icon}</span>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {providerInfo.label}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {providerInfo.description}
              </p>
            </div>
          </div>
        )}

        {/* Scope Selection */}
        {selectedProvider && availableScopes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Permissions
            </label>
            <div className="space-y-2">
              {availableScopes.map((scope) => (
                <label
                  key={scope.value}
                  className={cn(
                    'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
                    selectedScopes.includes(scope.value)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedScopes([...selectedScopes, scope.value]);
                      } else {
                        setSelectedScopes(selectedScopes.filter((s) => s !== scope.value));
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {scope.label}
                    </span>
                    <p className="text-xs text-gray-500">{scope.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Security Note:</strong> We only request the permissions necessary for the selected features.
            You can revoke access at any time.
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// API Key Form Modal
// ============================================

export interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApiKeyFormData) => Promise<void>;
  initialData?: Partial<ApiKeyFormData>;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  isLoading,
}: ApiKeyModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
      allowedIps: [],
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
      title={mode === 'create' ? 'Create API Key' : 'Edit API Key'}
      description="Generate a new API key for programmatic access"
      size="lg"
      submitText={mode === 'create' ? 'Generate Key' : 'Save Changes'}
      isLoading={isLoading}
      isDirty={isDirty}
    >
      <div className="space-y-4">
        <FormInput
          label="Key Name"
          placeholder="e.g., Production Integration"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <FormTextarea
          label="Description"
          placeholder="What is this key used for?"
          rows={2}
          {...register('description')}
        />

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Permissions <span className="text-red-500">*</span>
          </label>
          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {apiPermissionOptions.map((perm) => (
                  <label
                    key={perm.value}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={field.value?.includes(perm.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...field.value, perm.value]);
                        } else {
                          field.onChange(field.value.filter((v: string) => v !== perm.value));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {perm.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          />
          {errors.permissions && (
            <p className="text-sm text-red-600 mt-1">{errors.permissions.message}</p>
          )}
        </div>

        <Controller
          name="expiresAt"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Expiration"
              options={[
                { value: '', label: 'Never expires' },
                { value: '30d', label: '30 days' },
                { value: '90d', label: '90 days' },
                { value: '1y', label: '1 year' },
              ]}
              {...field}
            />
          )}
        />

        <Controller
          name="allowedIps"
          control={control}
          render={({ field }) => (
            <FormTagsInput
              label="IP Whitelist (optional)"
              placeholder="Add IP addresses..."
              value={field.value || []}
              onChange={field.onChange}
              hint="Leave empty to allow all IPs"
            />
          )}
        />

        <Controller
          name="rateLimit"
          control={control}
          render={({ field }) => (
            <FormInput
              label="Rate Limit (requests/minute)"
              type="number"
              min={0}
              placeholder="1000"
              {...field}
              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          )}
        />
      </div>
    </FormModal>
  );
}

// ============================================
// API Key Display Component
// ============================================

export interface ApiKeyDisplayProps {
  apiKey: string;
  onClose: () => void;
}

export function ApiKeyDisplay({ apiKey, onClose }: ApiKeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="API Key Created" size="md">
      <div className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 mb-2">
            Your API key has been created successfully. Copy it now as it won't be shown again.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono break-all">
            {apiKey}
          </code>
          <Button onClick={copyToClipboard} variant="outline">
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Important:</strong> Store this key securely. You won't be able to see it again.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// Webhook Form Modal
// ============================================

export interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WebhookFormData) => Promise<void>;
  initialData?: Partial<WebhookFormData>;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
}

export function WebhookModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  isLoading,
}: WebhookModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      url: '',
      events: [],
      secret: '',
      isActive: true,
      retryOnFailure: true,
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
      title={mode === 'create' ? 'Create Webhook' : 'Edit Webhook'}
      description="Configure a webhook endpoint to receive events"
      size="lg"
      submitText={mode === 'create' ? 'Create Webhook' : 'Save Changes'}
      isLoading={isLoading}
      isDirty={isDirty}
    >
      <div className="space-y-4">
        <FormInput
          label="Endpoint URL"
          placeholder="https://api.yourapp.com/webhooks"
          error={errors.url?.message}
          required
          {...register('url')}
        />

        {/* Events */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Events <span className="text-red-500">*</span>
          </label>
          <Controller
            name="events"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                {webhookEventOptions.map((event) => (
                  <label
                    key={event.value}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={field.value?.includes(event.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...field.value, event.value]);
                        } else {
                          field.onChange(field.value.filter((v: string) => v !== event.value));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {event.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          />
          {errors.events && (
            <p className="text-sm text-red-600 mt-1">{errors.events.message}</p>
          )}
        </div>

        <FormInput
          label="Secret (optional)"
          placeholder="Used to verify webhook signatures"
          type="password"
          {...register('secret')}
        />

        <div className="flex items-center gap-6">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Active"
                description="Webhook will receive events"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="retryOnFailure"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Retry on Failure"
                description="Retry failed deliveries"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
    </FormModal>
  );
}

// ============================================
// Calendar Integration Form
// ============================================

export interface CalendarIntegrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarIntegrationFormData) => Promise<void>;
  initialData?: Partial<CalendarIntegrationFormData>;
  isLoading?: boolean;
}

export function CalendarIntegrationForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CalendarIntegrationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<CalendarIntegrationFormData>({
    resolver: zodResolver(calendarIntegrationSchema),
    defaultValues: {
      provider: 'google',
      syncDirection: 'two_way',
      syncFrequency: 'realtime',
      eventTypes: ['interviews'],
      workingHours: {
        enabled: true,
        start: '09:00',
        end: '17:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        daysOfWeek: [1, 2, 3, 4, 5],
      },
      ...initialData,
    },
  });

  const workingHoursEnabled = watch('workingHours.enabled');

  const handleClose = () => {
    reset();
    onClose();
  };

  const calendarProviders = [
    { value: 'google', label: 'Google Calendar', icon: '📅' },
    { value: 'outlook', label: 'Outlook Calendar', icon: '📆' },
    { value: 'apple', label: 'Apple Calendar', icon: '🍎' },
  ];

  const daysOfWeek = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title="Calendar Integration"
      description="Configure calendar sync settings"
      size="lg"
      submitText="Save Settings"
      isLoading={isLoading}
      isDirty={isDirty}
    >
      <div className="space-y-6">
        {/* Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Calendar Provider
          </label>
          <Controller
            name="provider"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3">
                {calendarProviders.map((provider) => (
                  <button
                    key={provider.value}
                    type="button"
                    onClick={() => field.onChange(provider.value)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-center transition-all',
                      field.value === provider.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <span className="text-2xl block mb-1">{provider.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {provider.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* Sync Settings */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="syncDirection"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Sync Direction"
                options={[
                  { value: 'one_way', label: 'One-way (to calendar)' },
                  { value: 'two_way', label: 'Two-way sync' },
                ]}
                {...field}
              />
            )}
          />

          <Controller
            name="syncFrequency"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Sync Frequency"
                options={[
                  { value: 'realtime', label: 'Real-time' },
                  { value: '5min', label: 'Every 5 minutes' },
                  { value: '15min', label: 'Every 15 minutes' },
                  { value: '30min', label: 'Every 30 minutes' },
                  { value: 'hourly', label: 'Hourly' },
                ]}
                {...field}
              />
            )}
          />
        </div>

        {/* Working Hours */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Controller
            name="workingHours.enabled"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Set Working Hours"
                description="Only allow scheduling during these hours"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {workingHoursEnabled && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Start Time"
                  type="time"
                  {...register('workingHours.start')}
                />
                <FormInput
                  label="End Time"
                  type="time"
                  {...register('workingHours.end')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Working Days
                </label>
                <Controller
                  name="workingHours.daysOfWeek"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            if (field.value?.includes(day.value)) {
                              field.onChange(field.value.filter((d: number) => d !== day.value));
                            } else {
                              field.onChange([...(field.value || []), day.value]);
                            }
                          }}
                          className={cn(
                            'w-10 h-10 rounded-full text-sm font-medium transition-colors',
                            field.value?.includes(day.value)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}

// ============================================
// Integration Card Component
// ============================================

export interface IntegrationCardProps {
  integration: {
    id: string;
    provider: string;
    name: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSync?: string;
    connectedAt?: string;
  };
  onDisconnect?: () => void;
  onRefresh?: () => void;
  onSettings?: () => void;
}

export function IntegrationCard({
  integration,
  onDisconnect,
  onRefresh,
  onSettings,
}: IntegrationCardProps) {
  const provider = oauthProviders.find((p) => p.value === integration.provider);

  const statusConfig = {
    connected: { color: 'bg-green-100 text-green-700', label: 'Connected' },
    disconnected: { color: 'bg-gray-100 text-gray-700', label: 'Disconnected' },
    error: { color: 'bg-red-100 text-red-700', label: 'Error' },
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{provider?.icon || '🔗'}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {integration.name}
            </h4>
            <Badge className={statusConfig[integration.status].color} size="sm">
              {statusConfig[integration.status].label}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {provider?.label || integration.provider}
          </p>
          {integration.lastSync && (
            <p className="text-xs text-gray-400 mt-1">
              Last synced: {new Date(integration.lastSync).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && integration.status === 'connected' && (
            <Button variant="ghost" size="sm" onClick={onRefresh} title="Refresh">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          )}
          {onSettings && (
            <Button variant="ghost" size="sm" onClick={onSettings}>
              Settings
            </Button>
          )}
          {onDisconnect && (
            <Button variant="ghost" size="sm" onClick={onDisconnect}>
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Disconnect Confirmation Modal
// ============================================

export interface DisconnectIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  integrationName: string;
  isLoading?: boolean;
}

export function DisconnectIntegrationModal({
  isOpen,
  onClose,
  onConfirm,
  integrationName,
  isLoading,
}: DisconnectIntegrationModalProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Disconnect Integration"
      message={
        <>
          Are you sure you want to disconnect <strong>{integrationName}</strong>?
          This will stop syncing data and may affect related features.
        </>
      }
      confirmText="Disconnect"
      type="danger"
      isLoading={isLoading}
    />
  );
}

// Export all
export default {
  OAuthConnectionModal,
  ApiKeyModal,
  ApiKeyDisplay,
  WebhookModal,
  CalendarIntegrationForm,
  IntegrationCard,
  DisconnectIntegrationModal,
};
