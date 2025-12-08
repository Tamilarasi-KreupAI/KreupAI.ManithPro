// ============================================================
// COMPANY FORMS - Company profile management forms
// ============================================================

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormTagsInput,
  FormImageUpload,
} from '../forms';
import { Modal, FormModal } from '../modals';
import { Button, Badge } from '../ui';
import { cn } from '../../lib/utils';

// ============================================
// Validation Schemas
// ============================================

export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  logo: z.string().optional(),
  size: z.string().optional(),
  industry: z.string().min(1, 'Please select an industry'),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  headquarters: z.string().optional(),
  locations: z.array(z.string()).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    glassdoor: z.string().url().optional().or(z.literal('')),
  }).optional(),
  benefits: z.array(z.string()).optional(),
  culture: z.string().optional(),
  techStack: z.array(z.string()).optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;

// ============================================
// Company Form Props
// ============================================

export interface CompanyFormProps {
  initialData?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

// ============================================
// Industry and Size Options
// ============================================

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'telecom', label: 'Telecommunications' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'transportation', label: 'Transportation & Logistics' },
  { value: 'hospitality', label: 'Hospitality & Tourism' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
];

const sizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1001-5000', label: '1001-5000 employees' },
  { value: '5001-10000', label: '5001-10000 employees' },
  { value: '10001+', label: '10001+ employees' },
];

// ============================================
// Company Form Component (Full Page)
// ============================================

export function CompanyForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode = 'create',
}: CompanyFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      logo: '',
      size: '',
      industry: '',
      headquarters: '',
      locations: [],
      benefits: [],
      culture: '',
      techStack: [],
      socialLinks: {
        linkedin: '',
        twitter: '',
        facebook: '',
        glassdoor: '',
      },
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Company Name"
            placeholder="e.g., Acme Corporation"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Industry"
                options={industryOptions}
                error={errors.industry?.message}
                required
                {...field}
              />
            )}
          />

          <FormInput
            label="Website"
            placeholder="https://www.example.com"
            error={errors.website?.message}
            {...register('website')}
          />

          <Controller
            name="size"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Company Size"
                options={sizeOptions}
                error={errors.size?.message}
                {...field}
              />
            )}
          />

          <FormInput
            label="Headquarters"
            placeholder="e.g., San Francisco, CA"
            {...register('headquarters')}
          />

          <Controller
            name="foundedYear"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Founded Year"
                type="number"
                placeholder="e.g., 2015"
                min={1800}
                max={new Date().getFullYear()}
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            )}
          />
        </div>

        <div className="mt-4">
          <FormTextarea
            label="Company Description"
            placeholder="Tell candidates about your company, mission, and values..."
            rows={4}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>
      </section>

      {/* Company Logo */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Company Logo
        </h3>
        <Controller
          name="logo"
          control={control}
          render={({ field }) => (
            <FormImageUpload
              label="Upload Logo"
              value={field.value}
              onChange={field.onChange}
              accept="image/*"
              maxSize={2 * 1024 * 1024} // 2MB
              hint="Recommended: Square image, at least 200x200px"
            />
          )}
        />
      </section>

      {/* Locations */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Office Locations
        </h3>
        <Controller
          name="locations"
          control={control}
          render={({ field }) => (
            <FormTagsInput
              label="Locations"
              placeholder="Add office locations..."
              value={field.value || []}
              onChange={field.onChange}
              suggestions={[
                'New York, NY',
                'San Francisco, CA',
                'London, UK',
                'Berlin, Germany',
                'Singapore',
                'Sydney, Australia',
                'Toronto, Canada',
                'Remote',
              ]}
            />
          )}
        />
      </section>

      {/* Culture & Benefits */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Culture & Benefits
        </h3>
        <div className="space-y-4">
          <FormTextarea
            label="Company Culture"
            placeholder="Describe your company culture, work environment, and team dynamics..."
            rows={4}
            {...register('culture')}
          />

          <Controller
            name="benefits"
            control={control}
            render={({ field }) => (
              <FormTagsInput
                label="Benefits"
                placeholder="Add company benefits..."
                value={field.value || []}
                onChange={field.onChange}
                suggestions={[
                  'Health Insurance',
                  'Dental Insurance',
                  '401(k) Matching',
                  'Remote Work',
                  'Flexible Hours',
                  'Stock Options',
                  'Unlimited PTO',
                  'Gym Membership',
                  'Professional Development',
                  'Parental Leave',
                  'Mental Health Support',
                  'Commuter Benefits',
                ]}
              />
            )}
          />

          <Controller
            name="techStack"
            control={control}
            render={({ field }) => (
              <FormTagsInput
                label="Tech Stack"
                placeholder="Add technologies your company uses..."
                value={field.value || []}
                onChange={field.onChange}
                suggestions={[
                  'React',
                  'Node.js',
                  'TypeScript',
                  'Python',
                  'AWS',
                  'Docker',
                  'Kubernetes',
                  'PostgreSQL',
                  'MongoDB',
                  'GraphQL',
                ]}
              />
            )}
          />
        </div>
      </section>

      {/* Social Links */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Social Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="LinkedIn"
            placeholder="https://linkedin.com/company/..."
            error={errors.socialLinks?.linkedin?.message}
            {...register('socialLinks.linkedin')}
          />

          <FormInput
            label="Twitter"
            placeholder="https://twitter.com/..."
            error={errors.socialLinks?.twitter?.message}
            {...register('socialLinks.twitter')}
          />

          <FormInput
            label="Facebook"
            placeholder="https://facebook.com/..."
            error={errors.socialLinks?.facebook?.message}
            {...register('socialLinks.facebook')}
          />

          <FormInput
            label="Glassdoor"
            placeholder="https://glassdoor.com/..."
            error={errors.socialLinks?.glassdoor?.message}
            {...register('socialLinks.glassdoor')}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {mode === 'create' ? 'Create Company' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

// ============================================
// Company Form Modal
// ============================================

export interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  initialData?: Partial<CompanyFormData>;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
}

export function CompanyFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  isLoading,
}: CompanyFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      industry: '',
      size: '',
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
      title={mode === 'create' ? 'Add Company' : 'Edit Company'}
      description={mode === 'create' ? 'Add a new company profile.' : 'Update company information.'}
      size="lg"
      submitText={mode === 'create' ? 'Add Company' : 'Save Changes'}
      isLoading={isLoading}
      isDirty={isDirty}
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Company Name"
            placeholder="e.g., Acme Corporation"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Industry"
                options={industryOptions}
                error={errors.industry?.message}
                required
                {...field}
              />
            )}
          />
        </div>

        <FormInput
          label="Website"
          placeholder="https://www.example.com"
          error={errors.website?.message}
          {...register('website')}
        />

        <Controller
          name="size"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Company Size"
              options={sizeOptions}
              error={errors.size?.message}
              {...field}
            />
          )}
        />

        <FormTextarea
          label="Description"
          placeholder="Tell candidates about your company..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <Controller
          name="benefits"
          control={control}
          render={({ field }) => (
            <FormTagsInput
              label="Benefits"
              placeholder="Add benefits..."
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </FormModal>
  );
}

// ============================================
// Quick Company Add (Minimal)
// ============================================

export interface QuickCompanyAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CompanyFormData>) => Promise<void>;
  isLoading?: boolean;
}

export function QuickCompanyAdd({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: QuickCompanyAddProps) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');

  const handleSubmit = async () => {
    await onSubmit({ name, industry, website });
    setName('');
    setIndustry('');
    setWebsite('');
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Quick Add Company"
      description="Add basic company info. You can add more details later."
      size="sm"
      submitText="Add Company"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <FormInput
          label="Company Name"
          placeholder="e.g., Acme Corporation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <FormSelect
          label="Industry"
          options={industryOptions}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          required
        />

        <FormInput
          label="Website"
          placeholder="https://www.example.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
    </FormModal>
  );
}

// ============================================
// Company Preview Card
// ============================================

export interface CompanyPreviewProps {
  company: CompanyFormData;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CompanyPreview({ company, onEdit, onDelete }: CompanyPreviewProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">
              {company.name.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {company.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            {company.industry && (
              <Badge variant="outline" size="sm">
                {industryOptions.find((o) => o.value === company.industry)?.label || company.industry}
              </Badge>
            )}
            {company.size && (
              <Badge variant="outline" size="sm">
                {company.size}
              </Badge>
            )}
          </div>
          {company.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {company.description}
            </p>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2">
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
        )}
      </div>
    </div>
  );
}

// Export all
export default {
  CompanyForm,
  CompanyFormModal,
  QuickCompanyAdd,
  CompanyPreview,
};
