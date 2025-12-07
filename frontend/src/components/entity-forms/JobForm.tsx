// ============================================================
// JOB FORM - Create and edit job posting forms
// ============================================================

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobSchema, JobFormData } from '../../schemas/job.schema';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormTagsInput,
  FormSalaryRange,
  FormDateInput,
  FormCheckbox,
  SalaryRange,
} from '../forms';
import { FormModal, WizardModal, WizardStep } from '../modals';
import { Button } from '../ui';
import { cn } from '../../lib/utils';

// ============================================
// Job Form Props
// ============================================

export interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

// ============================================
// Job Form Component (Full Page)
// ============================================

export function JobForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode = 'create',
}: JobFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: [''],
      responsibilities: [''],
      location: '',
      type: 'FULL_TIME',
      skills: [],
      benefits: [],
      positions: 1,
      status: 'DRAFT',
      ...initialData,
    },
  });

  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || ['']
  );
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialData?.responsibilities || ['']
  );

  const addRequirement = () => setRequirements([...requirements, '']);
  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const addResponsibility = () => setResponsibilities([...responsibilities, '']);
  const removeResponsibility = (index: number) => {
    if (responsibilities.length > 1) {
      setResponsibilities(responsibilities.filter((_, i) => i !== index));
    }
  };

  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'REMOTE', label: 'Remote' },
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'OPEN', label: 'Open' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Job Title"
            placeholder="e.g., Senior Software Engineer"
            error={errors.title?.message}
            required
            {...register('title')}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Job Type"
                options={jobTypes}
                error={errors.type?.message}
                required
                {...field}
              />
            )}
          />

          <FormInput
            label="Location"
            placeholder="e.g., San Francisco, CA"
            error={errors.location?.message}
            required
            {...register('location')}
          />

          <Controller
            name="positions"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Number of Positions"
                type="number"
                min={1}
                error={errors.positions?.message}
                required
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
              />
            )}
          />
        </div>

        <div className="mt-4">
          <FormTextarea
            label="Job Description"
            placeholder="Describe the role, team, and what the candidate will be working on..."
            rows={6}
            error={errors.description?.message}
            required
            {...register('description')}
          />
        </div>
      </section>

      {/* Requirements */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Requirements
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
            Add Requirement
          </Button>
        </div>
        <div className="space-y-2">
          {requirements.map((_, index) => (
            <div key={index} className="flex gap-2">
              <FormInput
                placeholder={`Requirement ${index + 1}`}
                className="flex-1"
                {...register(`requirements.${index}`)}
              />
              {requirements.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRequirement(index)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
          ))}
        </div>
        {errors.requirements && (
          <p className="text-sm text-red-600 mt-1">{errors.requirements.message}</p>
        )}
      </section>

      {/* Responsibilities */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Responsibilities
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addResponsibility}>
            Add Responsibility
          </Button>
        </div>
        <div className="space-y-2">
          {responsibilities.map((_, index) => (
            <div key={index} className="flex gap-2">
              <FormInput
                placeholder={`Responsibility ${index + 1}`}
                className="flex-1"
                {...register(`responsibilities.${index}`)}
              />
              {responsibilities.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeResponsibility(index)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Skills & Compensation */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Skills & Compensation
        </h3>
        <div className="space-y-4">
          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <FormTagsInput
                label="Required Skills"
                placeholder="Add skills..."
                value={field.value}
                onChange={field.onChange}
                error={errors.skills?.message}
                suggestions={[
                  'JavaScript',
                  'TypeScript',
                  'React',
                  'Node.js',
                  'Python',
                  'Java',
                  'Go',
                  'Rust',
                  'AWS',
                  'Docker',
                  'Kubernetes',
                  'SQL',
                  'MongoDB',
                  'GraphQL',
                  'REST API',
                ]}
                required
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="salaryMin"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Minimum Salary"
                  type="number"
                  placeholder="e.g., 80000"
                  leftIcon={<span className="text-sm">$</span>}
                  error={errors.salaryMin?.message}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              )}
            />

            <Controller
              name="salaryMax"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Maximum Salary"
                  type="number"
                  placeholder="e.g., 120000"
                  leftIcon={<span className="text-sm">$</span>}
                  error={errors.salaryMax?.message}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                />
              )}
            />
          </div>

          <Controller
            name="benefits"
            control={control}
            render={({ field }) => (
              <FormTagsInput
                label="Benefits"
                placeholder="Add benefits..."
                value={field.value || []}
                onChange={field.onChange}
                suggestions={[
                  'Health Insurance',
                  'Dental Insurance',
                  '401k',
                  'Remote Work',
                  'Flexible Hours',
                  'Stock Options',
                  'Unlimited PTO',
                  'Gym Membership',
                  'Professional Development',
                  'Parental Leave',
                ]}
              />
            )}
          />
        </div>
      </section>

      {/* Additional Details */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Additional Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Experience Required"
            placeholder="e.g., 3-5 years"
            {...register('experience')}
          />

          <FormInput
            label="Education Required"
            placeholder="e.g., Bachelor's degree in CS"
            {...register('education')}
          />

          <Controller
            name="deadline"
            control={control}
            render={({ field }) => (
              <FormDateInput
                label="Application Deadline"
                error={errors.deadline?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Status"
                options={statusOptions}
                {...field}
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
          {mode === 'create' ? 'Create Job' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

// ============================================
// Job Form Modal
// ============================================

export interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormData) => Promise<void>;
  initialData?: Partial<JobFormData>;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
}

export function JobFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
  isLoading,
}: JobFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: [''],
      responsibilities: [''],
      location: '',
      type: 'FULL_TIME',
      skills: [],
      benefits: [],
      positions: 1,
      status: 'DRAFT',
      ...initialData,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'REMOTE', label: 'Remote' },
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={mode === 'create' ? 'Create New Job' : 'Edit Job'}
      description={mode === 'create' ? 'Fill in the details to create a new job posting.' : 'Update the job posting details.'}
      size="xl"
      submitText={mode === 'create' ? 'Create Job' : 'Save Changes'}
      isLoading={isLoading}
      isDirty={isDirty}
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Job Title"
            placeholder="e.g., Senior Software Engineer"
            error={errors.title?.message}
            required
            {...register('title')}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Job Type"
                options={jobTypes}
                error={errors.type?.message}
                required
                {...field}
              />
            )}
          />
        </div>

        <FormInput
          label="Location"
          placeholder="e.g., San Francisco, CA"
          error={errors.location?.message}
          required
          {...register('location')}
        />

        <FormTextarea
          label="Job Description"
          placeholder="Describe the role..."
          rows={4}
          error={errors.description?.message}
          required
          {...register('description')}
        />

        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <FormTagsInput
              label="Required Skills"
              placeholder="Add skills..."
              value={field.value}
              onChange={field.onChange}
              error={errors.skills?.message}
              required
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="salaryMin"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Min Salary"
                type="number"
                placeholder="80000"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
              />
            )}
          />

          <Controller
            name="salaryMax"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Max Salary"
                type="number"
                placeholder="120000"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
              />
            )}
          />
        </div>
      </div>
    </FormModal>
  );
}

// ============================================
// Quick Job Post (Simplified)
// ============================================

export interface QuickJobPostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<JobFormData>) => Promise<void>;
  isLoading?: boolean;
}

export function QuickJobPost({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: QuickJobPostProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('FULL_TIME');

  const handleSubmit = async () => {
    await onSubmit({
      title,
      location,
      type: type as any,
      status: 'DRAFT',
    });
    setTitle('');
    setLocation('');
    setType('FULL_TIME');
    onClose();
  };

  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'REMOTE', label: 'Remote' },
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Quick Job Post"
      description="Create a draft job posting quickly. You can add more details later."
      size="sm"
      submitText="Create Draft"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <FormInput
          label="Job Title"
          placeholder="e.g., Senior Software Engineer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <FormInput
          label="Location"
          placeholder="e.g., San Francisco, CA"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <FormSelect
          label="Job Type"
          options={jobTypes}
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
      </div>
    </FormModal>
  );
}
