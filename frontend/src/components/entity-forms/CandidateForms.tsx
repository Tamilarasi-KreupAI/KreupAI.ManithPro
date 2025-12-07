// ============================================================
// CANDIDATE FORMS - Candidate profile management forms
// ============================================================

import React, { useState, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  profileBasicInfoSchema,
  workExperienceSchema,
  educationSchema,
  certificationSchema,
  skillSchema,
  projectSchema,
  socialLinksSchema,
  type ProfileBasicInfoFormData,
  type WorkExperienceFormData,
  type EducationFormData,
  type CertificationFormData,
  type SkillFormData,
  type ProjectFormData,
  type SocialLinksFormData,
} from '../../schemas/candidate.schema';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../modals/Modal';
import { FormField, FormInput, FormTextarea, FormSelect, FormCheckbox, FormSwitch } from '../forms/FormField';
import { FormDateInput, FormMonthYear } from '../forms/FormDatePicker';
import { FormTagsInput, FormMultiSelect } from '../forms/FormMultiSelect';
import { FormRating, FormSalaryRange, FormNumberInput } from '../forms/FormSpecialized';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

// ============================================
// Constants
// ============================================
const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
  { value: 'SELF_EMPLOYED', label: 'Self-employed' },
];

const REMOTE_PREFERENCES = [
  { value: 'remote', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
  { value: 'flexible', label: 'Flexible' },
];

const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Just starting to learn' },
  { value: 'ELEMENTARY', label: 'Elementary', description: 'Basic understanding' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Can work independently' },
  { value: 'ADVANCED', label: 'Advanced', description: 'Deep knowledge and experience' },
  { value: 'EXPERT', label: 'Expert', description: 'Industry-recognized expertise' },
];

const INSTITUTION_TYPES = [
  { value: 'university', label: 'University' },
  { value: 'college', label: 'College' },
  { value: 'online', label: 'Online Course' },
  { value: 'bootcamp', label: 'Bootcamp' },
];

const PROJECT_TYPES = [
  { value: 'personal', label: 'Personal' },
  { value: 'professional', label: 'Professional' },
  { value: 'open-source', label: 'Open Source' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'academic', label: 'Academic' },
];

const PROJECT_STATUSES = [
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'archived', label: 'Archived' },
];

// ============================================
// Work Experience Form
// ============================================
export interface WorkExperienceFormProps {
  onSubmit: (data: WorkExperienceFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<WorkExperienceFormData>;
  mode?: 'create' | 'edit';
}

export const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
  mode = 'create',
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      employmentType: 'FULL_TIME',
      isRemote: false,
      isCurrent: false,
      responsibilities: [],
      achievements: [],
      technologies: [],
      skills: [],
      ...defaultValues,
    },
  });

  const isCurrent = watch('isCurrent');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Company Name"
          {...register('companyName')}
          error={errors.companyName?.message}
          required
          placeholder="e.g. Acme Corporation"
        />

        <FormInput
          label="Company Website"
          type="url"
          {...register('companyWebsite')}
          error={errors.companyWebsite?.message}
          placeholder="https://example.com"
        />
      </div>

      {/* Position Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Job Title"
          {...register('title')}
          error={errors.title?.message}
          required
          placeholder="e.g. Senior Software Engineer"
        />

        <FormSelect
          label="Employment Type"
          {...register('employmentType')}
          error={errors.employmentType?.message}
          required
        >
          {EMPLOYMENT_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </FormSelect>
      </div>

      {/* Department & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Department"
          {...register('department')}
          error={errors.department?.message}
          placeholder="e.g. Engineering"
        />

        <div className="space-y-2">
          <FormInput
            label="Location"
            {...register('location')}
            error={errors.location?.message}
            placeholder="e.g. San Francisco, CA"
          />
          <FormCheckbox
            {...register('isRemote')}
            label="This is a remote position"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <FormMonthYear
              label="Start Date"
              value={field.value}
              onChange={field.onChange}
              error={errors.startDate?.message}
              required
            />
          )}
        />

        <div className="space-y-2">
          {!isCurrent && (
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <FormMonthYear
                  label="End Date"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.endDate?.message}
                  required={!isCurrent}
                />
              )}
            />
          )}
          <FormCheckbox
            {...register('isCurrent')}
            label="I currently work here"
          />
        </div>
      </div>

      {/* Description */}
      <FormTextarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Describe your role and responsibilities..."
        rows={4}
      />

      {/* Responsibilities */}
      <Controller
        name="responsibilities"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Key Responsibilities"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Press Enter to add a responsibility"
            hint="Add your main responsibilities in this role"
          />
        )}
      />

      {/* Achievements */}
      <Controller
        name="achievements"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Key Achievements"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Press Enter to add an achievement"
            hint="Quantify with numbers when possible (e.g., 'Increased sales by 25%')"
          />
        )}
      />

      {/* Technologies */}
      <Controller
        name="technologies"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Technologies Used"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Type technology and press Enter"
          />
        )}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {mode === 'edit' ? 'Save Changes' : 'Add Experience'}
        </Button>
      </div>
    </form>
  );
};

// ============================================
// Work Experience Modal
// ============================================
export interface WorkExperienceModalProps extends Omit<WorkExperienceFormProps, 'onCancel'> {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkExperienceModal: React.FC<WorkExperienceModalProps> = ({
  isOpen,
  onClose,
  ...formProps
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {formProps.mode === 'edit' ? 'Edit Experience' : 'Add Work Experience'}
            </h2>
            <p className="text-sm text-gray-500">Add your professional experience</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <WorkExperienceForm {...formProps} onCancel={onClose} />
      </ModalBody>
    </Modal>
  );
};

// ============================================
// Education Form
// ============================================
export interface EducationFormProps {
  onSubmit: (data: EducationFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<EducationFormData>;
  mode?: 'create' | 'edit';
}

export const EducationForm: React.FC<EducationFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
  mode = 'create',
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      isOngoing: false,
      activities: [],
      achievements: [],
      ...defaultValues,
    },
  });

  const isOngoing = watch('isOngoing');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Institution Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Institution Name"
          {...register('institutionName')}
          error={errors.institutionName?.message}
          required
          placeholder="e.g. Stanford University"
        />

        <FormSelect
          label="Institution Type"
          {...register('institutionType')}
          error={errors.institutionType?.message}
        >
          <option value="">Select type...</option>
          {INSTITUTION_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </FormSelect>
      </div>

      {/* Degree Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Degree"
          {...register('degree')}
          error={errors.degree?.message}
          required
          placeholder="e.g. Bachelor of Science"
        />

        <FormInput
          label="Field of Study"
          {...register('fieldOfStudy')}
          error={errors.fieldOfStudy?.message}
          required
          placeholder="e.g. Computer Science"
        />
      </div>

      {/* Specialization */}
      <FormInput
        label="Specialization (Optional)"
        {...register('specialization')}
        error={errors.specialization?.message}
        placeholder="e.g. Machine Learning"
      />

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <FormMonthYear
              label="Start Date"
              value={field.value}
              onChange={field.onChange}
              error={errors.startDate?.message}
              required
            />
          )}
        />

        <div className="space-y-2">
          {!isOngoing && (
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <FormMonthYear
                  label="End Date"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.endDate?.message}
                  required={!isOngoing}
                />
              )}
            />
          )}
          <FormCheckbox
            {...register('isOngoing')}
            label="Currently studying here"
          />
        </div>
      </div>

      {/* Grade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Grade/GPA"
          {...register('grade')}
          error={errors.grade?.message}
          placeholder="e.g. 3.8"
        />

        <FormInput
          label="Grade Scale"
          {...register('gradeScale')}
          error={errors.gradeScale?.message}
          placeholder="e.g. 4.0"
        />
      </div>

      {/* Activities */}
      <Controller
        name="activities"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Activities & Societies"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Press Enter to add an activity"
          />
        )}
      />

      {/* Achievements */}
      <Controller
        name="achievements"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Achievements & Honors"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Press Enter to add an achievement"
          />
        )}
      />

      {/* Thesis */}
      <FormInput
        label="Thesis Title (Optional)"
        {...register('thesis')}
        error={errors.thesis?.message}
        placeholder="e.g. Deep Learning for Natural Language Processing"
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {mode === 'edit' ? 'Save Changes' : 'Add Education'}
        </Button>
      </div>
    </form>
  );
};

// ============================================
// Education Modal
// ============================================
export interface EducationModalProps extends Omit<EducationFormProps, 'onCancel'> {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationModal: React.FC<EducationModalProps> = ({
  isOpen,
  onClose,
  ...formProps
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {formProps.mode === 'edit' ? 'Edit Education' : 'Add Education'}
            </h2>
            <p className="text-sm text-gray-500">Add your educational background</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <EducationForm {...formProps} onCancel={onClose} />
      </ModalBody>
    </Modal>
  );
};

// ============================================
// Certification Form
// ============================================
export interface CertificationFormProps {
  onSubmit: (data: CertificationFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<CertificationFormData>;
  mode?: 'create' | 'edit';
}

export const CertificationForm: React.FC<CertificationFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
  mode = 'create',
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      doesNotExpire: false,
      skills: [],
      ...defaultValues,
    },
  });

  const doesNotExpire = watch('doesNotExpire');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Certification Name */}
      <FormInput
        label="Certification Name"
        {...register('name')}
        error={errors.name?.message}
        required
        placeholder="e.g. AWS Solutions Architect"
      />

      {/* Issuing Organization */}
      <FormInput
        label="Issuing Organization"
        {...register('issuingOrganization')}
        error={errors.issuingOrganization?.message}
        required
        placeholder="e.g. Amazon Web Services"
      />

      {/* Credential Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Credential ID"
          {...register('credentialId')}
          error={errors.credentialId?.message}
          placeholder="e.g. ABC123XYZ"
        />

        <FormInput
          label="Credential URL"
          type="url"
          {...register('credentialUrl')}
          error={errors.credentialUrl?.message}
          placeholder="https://verify.example.com/..."
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="issueDate"
          control={control}
          render={({ field }) => (
            <FormMonthYear
              label="Issue Date"
              value={field.value}
              onChange={field.onChange}
              error={errors.issueDate?.message}
              required
            />
          )}
        />

        <div className="space-y-2">
          {!doesNotExpire && (
            <Controller
              name="expirationDate"
              control={control}
              render={({ field }) => (
                <FormMonthYear
                  label="Expiration Date"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.expirationDate?.message}
                />
              )}
            />
          )}
          <FormCheckbox
            {...register('doesNotExpire')}
            label="This credential does not expire"
          />
        </div>
      </div>

      {/* Description */}
      <FormTextarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Brief description of the certification..."
        rows={3}
      />

      {/* Related Skills */}
      <Controller
        name="skills"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Related Skills"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Add skills covered by this certification"
          />
        )}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {mode === 'edit' ? 'Save Changes' : 'Add Certification'}
        </Button>
      </div>
    </form>
  );
};

// ============================================
// Certification Modal
// ============================================
export interface CertificationModalProps extends Omit<CertificationFormProps, 'onCancel'> {
  isOpen: boolean;
  onClose: () => void;
}

export const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  onClose,
  ...formProps
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {formProps.mode === 'edit' ? 'Edit Certification' : 'Add Certification'}
            </h2>
            <p className="text-sm text-gray-500">Add your professional certifications</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <CertificationForm {...formProps} onCancel={onClose} />
      </ModalBody>
    </Modal>
  );
};

// ============================================
// Skill Form
// ============================================
export interface SkillFormProps {
  onSubmit: (data: SkillFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<SkillFormData>;
  mode?: 'create' | 'edit';
  skillCategories?: string[];
}

export const SkillForm: React.FC<SkillFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
  mode = 'create',
  skillCategories = ['Technical', 'Soft Skills', 'Languages', 'Tools', 'Frameworks'],
}) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      proficiencyLevel: 3,
      proficiencyLabel: 'INTERMEDIATE',
      isPrimary: false,
      tags: [],
      ...defaultValues,
    },
  });

  const proficiencyLevel = watch('proficiencyLevel');

  const handleProficiencyChange = (level: number) => {
    setValue('proficiencyLevel', level);
    const labels = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
    setValue('proficiencyLabel', labels[level - 1]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Skill Name */}
      <FormInput
        label="Skill Name"
        {...register('name')}
        error={errors.name?.message}
        required
        placeholder="e.g. JavaScript, Project Management"
      />

      {/* Category */}
      <FormSelect
        label="Category"
        {...register('category')}
        error={errors.category?.message}
      >
        <option value="">Select a category...</option>
        {skillCategories.map(cat => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </FormSelect>

      {/* Proficiency Level */}
      <FormField
        label="Proficiency Level"
        error={errors.proficiencyLevel?.message}
        required
      >
        <div className="space-y-3">
          {SKILL_LEVELS.map((level, index) => (
            <label
              key={level.value}
              className={cn(
                'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all',
                proficiencyLevel === index + 1
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <input
                type="radio"
                name="proficiencyLevel"
                value={index + 1}
                checked={proficiencyLevel === index + 1}
                onChange={() => handleProficiencyChange(index + 1)}
                className="sr-only"
              />
              <div className="flex items-center gap-2 flex-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-3 h-3 rounded-full mr-0.5',
                        i < index + 1 ? 'bg-indigo-500' : 'bg-gray-200'
                      )}
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-900">{level.label}</span>
              </div>
              <span className="text-sm text-gray-500">{level.description}</span>
            </label>
          ))}
        </div>
      </FormField>

      {/* Years of Experience */}
      <Controller
        name="yearsOfExperience"
        control={control}
        render={({ field }) => (
          <FormNumberInput
            label="Years of Experience"
            value={field.value || 0}
            onChange={field.onChange}
            min={0}
            max={50}
            step={0.5}
          />
        )}
      />

      {/* Last Used */}
      <FormSelect
        label="Last Used"
        {...register('lastUsed')}
        error={errors.lastUsed?.message}
      >
        <option value="">Select...</option>
        <option value="currently">Currently using</option>
        <option value="this-year">This year</option>
        <option value="last-year">Last year</option>
        <option value="2-3-years">2-3 years ago</option>
        <option value="3-5-years">3-5 years ago</option>
        <option value="5+-years">5+ years ago</option>
      </FormSelect>

      {/* Primary Skill */}
      <FormSwitch
        {...register('isPrimary')}
        label="Mark as primary skill"
        description="Primary skills are highlighted on your profile"
      />

      {/* Tags */}
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Related Tags"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Add related tags"
          />
        )}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {mode === 'edit' ? 'Save Changes' : 'Add Skill'}
        </Button>
      </div>
    </form>
  );
};

// ============================================
// Skill Modal
// ============================================
export interface SkillModalProps extends Omit<SkillFormProps, 'onCancel'> {
  isOpen: boolean;
  onClose: () => void;
}

export const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  ...formProps
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {formProps.mode === 'edit' ? 'Edit Skill' : 'Add Skill'}
            </h2>
            <p className="text-sm text-gray-500">Add your skills and expertise</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <SkillForm {...formProps} onCancel={onClose} />
      </ModalBody>
    </Modal>
  );
};

// ============================================
// Project Form
// ============================================
export interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<ProjectFormData>;
  mode?: 'create' | 'edit';
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
  mode = 'create',
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      isOngoing: false,
      isPublic: true,
      isFeatured: false,
      technologies: [],
      frameworks: [],
      languages: [],
      tools: [],
      contributions: [],
      ...defaultValues,
    },
  });

  const isOngoing = watch('isOngoing');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Project Title */}
      <FormInput
        label="Project Title"
        {...register('title')}
        error={errors.title?.message}
        required
        placeholder="e.g. E-commerce Platform"
      />

      {/* Short Description */}
      <FormInput
        label="Short Description"
        {...register('shortDescription')}
        error={errors.shortDescription?.message}
        placeholder="Brief one-line description"
      />

      {/* Full Description */}
      <FormTextarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Detailed description of the project..."
        rows={4}
      />

      {/* Project Type & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Project Type"
          {...register('projectType')}
          error={errors.projectType?.message}
        >
          <option value="">Select type...</option>
          {PROJECT_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </FormSelect>

        <FormSelect
          label="Status"
          {...register('status')}
          error={errors.status?.message}
        >
          <option value="">Select status...</option>
          {PROJECT_STATUSES.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </FormSelect>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <FormMonthYear
              label="Start Date"
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.startDate?.message}
            />
          )}
        />

        <div className="space-y-2">
          {!isOngoing && (
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <FormMonthYear
                  label="End Date"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.endDate?.message}
                />
              )}
            />
          )}
          <FormCheckbox
            {...register('isOngoing')}
            label="This is an ongoing project"
          />
        </div>
      </div>

      {/* Role & Team Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Your Role"
          {...register('role')}
          error={errors.role?.message}
          placeholder="e.g. Lead Developer"
        />

        <Controller
          name="teamSize"
          control={control}
          render={({ field }) => (
            <FormNumberInput
              label="Team Size"
              value={field.value || 1}
              onChange={field.onChange}
              min={1}
              max={1000}
            />
          )}
        />
      </div>

      {/* Technologies */}
      <Controller
        name="technologies"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Technologies"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Add technologies used"
          />
        )}
      />

      {/* Languages */}
      <Controller
        name="languages"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Programming Languages"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Add programming languages"
          />
        )}
      />

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Repository URL"
          type="url"
          {...register('repositoryUrl')}
          error={errors.repositoryUrl?.message}
          placeholder="https://github.com/..."
        />

        <FormInput
          label="Live URL"
          type="url"
          {...register('liveUrl')}
          error={errors.liveUrl?.message}
          placeholder="https://example.com"
        />
      </div>

      {/* Key Contributions */}
      <Controller
        name="contributions"
        control={control}
        render={({ field }) => (
          <FormTagsInput
            label="Key Contributions"
            value={field.value || []}
            onChange={field.onChange}
            placeholder="Add your key contributions"
          />
        )}
      />

      {/* Impact */}
      <FormTextarea
        label="Impact"
        {...register('impact')}
        error={errors.impact?.message}
        placeholder="Describe the impact of this project..."
        rows={2}
      />

      {/* Visibility */}
      <div className="flex gap-6">
        <FormSwitch
          {...register('isPublic')}
          label="Show on public profile"
        />

        <FormSwitch
          {...register('isFeatured')}
          label="Feature this project"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {mode === 'edit' ? 'Save Changes' : 'Add Project'}
        </Button>
      </div>
    </form>
  );
};

// ============================================
// Project Modal
// ============================================
export interface ProjectModalProps extends Omit<ProjectFormProps, 'onCancel'> {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  ...formProps
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {formProps.mode === 'edit' ? 'Edit Project' : 'Add Project'}
            </h2>
            <p className="text-sm text-gray-500">Showcase your work</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <ProjectForm {...formProps} onCancel={onClose} />
      </ModalBody>
    </Modal>
  );
};

// ============================================
// Social Links Form
// ============================================
export interface SocialLinksFormProps {
  onSubmit: (data: SocialLinksFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<SocialLinksFormData>;
}

export const SocialLinksForm: React.FC<SocialLinksFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues,
  });

  const socialPlatforms = [
    { name: 'website', label: 'Personal Website', icon: '🌐', placeholder: 'https://yourwebsite.com' },
    { name: 'github', label: 'GitHub', icon: '👨‍💻', placeholder: 'https://github.com/username' },
    { name: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
    { name: 'twitter', label: 'Twitter/X', icon: '🐦', placeholder: 'https://twitter.com/username' },
    { name: 'stackoverflow', label: 'Stack Overflow', icon: '📚', placeholder: 'https://stackoverflow.com/users/...' },
    { name: 'dribbble', label: 'Dribbble', icon: '🎨', placeholder: 'https://dribbble.com/username' },
    { name: 'behance', label: 'Behance', icon: '🎭', placeholder: 'https://behance.net/username' },
    { name: 'medium', label: 'Medium', icon: '📝', placeholder: 'https://medium.com/@username' },
    { name: 'kaggle', label: 'Kaggle', icon: '📊', placeholder: 'https://kaggle.com/username' },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {socialPlatforms.map(platform => (
        <div key={platform.name} className="flex items-start gap-3">
          <span className="text-2xl mt-1">{platform.icon}</span>
          <div className="flex-1">
            <FormInput
              label={platform.label}
              type="url"
              {...register(platform.name as keyof SocialLinksFormData)}
              error={errors[platform.name as keyof SocialLinksFormData]?.message}
              placeholder={platform.placeholder}
            />
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save Links
        </Button>
      </div>
    </form>
  );
};

// ============================================
// Social Links Modal
// ============================================
export interface SocialLinksModalProps extends Omit<SocialLinksFormProps, 'onCancel'> {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialLinksModal: React.FC<SocialLinksModalProps> = ({
  isOpen,
  onClose,
  ...formProps
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Social Links</h2>
            <p className="text-sm text-gray-500">Connect your online profiles</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <SocialLinksForm {...formProps} onCancel={onClose} />
      </ModalBody>
    </Modal>
  );
};

// ============================================
// Profile Edit Wizard
// ============================================
export interface ProfileEditWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: ProfileBasicInfoFormData) => Promise<void>;
  defaultValues?: Partial<ProfileBasicInfoFormData>;
  isSubmitting?: boolean;
}

type WizardStep = 'basic' | 'preferences' | 'visibility';

export const ProfileEditWizard: React.FC<ProfileEditWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  defaultValues,
  isSubmitting = false,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<ProfileBasicInfoFormData>({
    resolver: zodResolver(profileBasicInfoSchema),
    defaultValues: {
      isPublic: true,
      allowMessages: true,
      showSalaryExpectation: false,
      ...defaultValues,
    },
  });

  const steps: { id: WizardStep; title: string; description: string }[] = [
    { id: 'basic', title: 'Basic Info', description: 'Your professional headline and summary' },
    { id: 'preferences', title: 'Preferences', description: 'Job type and location preferences' },
    { id: 'visibility', title: 'Visibility', description: 'Profile privacy settings' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const goNext = async () => {
    let fieldsToValidate: (keyof ProfileBasicInfoFormData)[] = [];

    if (currentStep === 'basic') {
      fieldsToValidate = ['headline', 'summary'];
    } else if (currentStep === 'preferences') {
      fieldsToValidate = ['city', 'state', 'country', 'remotePreference', 'expectedSalary'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            <p className="text-sm text-gray-500">{steps[currentStepIndex].description}</p>
          </div>
        </div>
      </ModalHeader>

      {/* Progress Steps */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index <= currentStepIndex
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {index + 1}
              </div>
              <span className={cn(
                'ml-2 text-sm font-medium hidden sm:block',
                index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'
              )}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-12 sm:w-24 h-0.5 mx-2',
                  index < currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onComplete)}>
        <ModalBody>
          {/* Basic Info Step */}
          {currentStep === 'basic' && (
            <div className="space-y-6">
              <FormInput
                label="Professional Headline"
                {...register('headline')}
                error={errors.headline?.message}
                placeholder="e.g. Senior Software Engineer | 10+ years experience"
                hint="A brief title that appears below your name"
              />

              <FormTextarea
                label="Summary"
                {...register('summary')}
                error={errors.summary?.message}
                placeholder="Tell employers about yourself, your skills, and what you're looking for..."
                rows={5}
              />
            </div>
          )}

          {/* Preferences Step */}
          {currentStep === 'preferences' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="City"
                  {...register('city')}
                  error={errors.city?.message}
                  placeholder="e.g. San Francisco"
                />

                <FormInput
                  label="State/Province"
                  {...register('state')}
                  error={errors.state?.message}
                  placeholder="e.g. California"
                />

                <FormInput
                  label="Country"
                  {...register('country')}
                  error={errors.country?.message}
                  placeholder="e.g. United States"
                />
              </div>

              <FormSelect
                label="Remote Preference"
                {...register('remotePreference')}
                error={errors.remotePreference?.message}
              >
                <option value="">Select preference...</option>
                {REMOTE_PREFERENCES.map(pref => (
                  <option key={pref.value} value={pref.value}>
                    {pref.label}
                  </option>
                ))}
              </FormSelect>

              <FormCheckbox
                {...register('willingToRelocate')}
                label="I am willing to relocate"
              />

              <Controller
                name="preferredLocation"
                control={control}
                render={({ field }) => (
                  <FormTagsInput
                    label="Preferred Locations"
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Add preferred locations"
                  />
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="expectedSalary"
                  control={control}
                  render={({ field }) => (
                    <FormNumberInput
                      label="Expected Salary"
                      value={field.value || 0}
                      onChange={field.onChange}
                      min={0}
                      step={1000}
                      prefix="$"
                    />
                  )}
                />

                <FormInput
                  label="Notice Period"
                  {...register('noticePeriod')}
                  error={errors.noticePeriod?.message}
                  placeholder="e.g. 2 weeks, 1 month"
                />
              </div>

              <Controller
                name="availableFrom"
                control={control}
                render={({ field }) => (
                  <FormDateInput
                    label="Available From"
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.availableFrom?.message}
                    min={new Date().toISOString().split('T')[0]}
                  />
                )}
              />
            </div>
          )}

          {/* Visibility Step */}
          {currentStep === 'visibility' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Profile Visibility</h4>
                <p className="text-sm text-gray-600">
                  Control who can see your profile and what information is displayed.
                </p>
              </div>

              <FormSwitch
                {...register('isPublic')}
                label="Public Profile"
                description="Allow recruiters to find and view your profile"
              />

              <FormSwitch
                {...register('allowMessages')}
                label="Allow Messages"
                description="Let recruiters send you direct messages"
              />

              <FormSwitch
                {...register('showSalaryExpectation')}
                label="Show Salary Expectation"
                description="Display your expected salary on your profile"
              />
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={currentStepIndex === 0 ? onClose : goBack}
            >
              {currentStepIndex === 0 ? 'Cancel' : 'Back'}
            </Button>

            <div className="flex gap-3">
              {currentStepIndex < steps.length - 1 ? (
                <Button type="button" onClick={goNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" loading={isSubmitting}>
                  Save Profile
                </Button>
              )}
            </div>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// ============================================
// Profile Section Card
// ============================================
export interface ProfileSectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export const ProfileSectionCard: React.FC<ProfileSectionCardProps> = ({
  title,
  icon,
  children,
  onAdd,
  addLabel = 'Add',
  isEmpty = false,
  emptyMessage = 'No items added yet',
}) => {
  return (
    <div className="bg-white border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon}
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        {onAdd && (
          <Button variant="outline" size="sm" onClick={onAdd}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {addLabel}
          </Button>
        )}
      </div>
      <div className="p-4">
        {isEmpty ? (
          <div className="text-center py-8 text-gray-500">
            <p>{emptyMessage}</p>
            {onAdd && (
              <Button variant="ghost" size="sm" onClick={onAdd} className="mt-2">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {addLabel}
              </Button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
