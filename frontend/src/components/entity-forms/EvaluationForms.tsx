// ============================================================
// EVALUATION FORMS - Scorecards, Feedback, and Decision forms
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
  FormRating,
} from '../forms';
import { Modal, FormModal, ConfirmationModal } from '../modals';
import { Button, Badge, Card } from '../ui';
import { cn } from '../../lib/utils';

// ============================================
// Validation Schemas
// ============================================

const scorecardCriterionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Criterion name is required'),
  description: z.string().optional(),
  type: z.enum(['rating', 'yes_no', 'text']).default('rating'),
  maxRating: z.number().min(1).max(10).default(5),
  isRequired: z.boolean().default(true),
  weight: z.number().min(0).max(100).default(1),
});

const scorecardSectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Section name is required'),
  description: z.string().optional(),
  weight: z.number().min(0).max(100).default(1),
  criteria: z.array(scorecardCriterionSchema).min(1, 'At least one criterion required'),
});

export const scorecardTemplateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  interviewType: z.string().optional(),
  sections: z.array(scorecardSectionSchema).min(1, 'At least one section required'),
  isDefault: z.boolean().default(false),
});

export const evaluationSchema = z.object({
  scores: z.array(z.object({
    criterionId: z.string(),
    rating: z.number().optional(),
    value: z.string().optional(),
    notes: z.string().optional(),
  })),
  overallRating: z.number().min(1).max(5).optional(),
  recommendation: z.enum(['strong_hire', 'hire', 'no_hire', 'strong_no_hire', 'undecided']),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  notes: z.string().optional(),
});

export const decisionVoteSchema = z.object({
  vote: z.enum(['hire', 'no_hire', 'needs_discussion']),
  confidence: z.number().min(1).max(5),
  reasoning: z.string().optional(),
});

export type ScorecardCriterion = z.infer<typeof scorecardCriterionSchema>;
export type ScorecardSection = z.infer<typeof scorecardSectionSchema>;
export type ScorecardTemplateFormData = z.infer<typeof scorecardTemplateSchema>;
export type EvaluationFormData = z.infer<typeof evaluationSchema>;
export type DecisionVoteFormData = z.infer<typeof decisionVoteSchema>;

// ============================================
// Recommendation Options
// ============================================

const recommendationOptions = [
  { value: 'strong_hire', label: 'Strong Hire', color: 'bg-green-600', description: 'Exceptional candidate, highly recommend' },
  { value: 'hire', label: 'Hire', color: 'bg-green-500', description: 'Good fit, recommend hiring' },
  { value: 'undecided', label: 'Undecided', color: 'bg-yellow-500', description: 'Need more information' },
  { value: 'no_hire', label: 'No Hire', color: 'bg-red-500', description: 'Not a good fit' },
  { value: 'strong_no_hire', label: 'Strong No Hire', color: 'bg-red-600', description: 'Definite pass' },
];

const interviewTypeOptions = [
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'technical', label: 'Technical Interview' },
  { value: 'behavioral', label: 'Behavioral Interview' },
  { value: 'culture_fit', label: 'Culture Fit' },
  { value: 'hiring_manager', label: 'Hiring Manager' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'final', label: 'Final Round' },
];

// ============================================
// Scorecard Template Builder
// ============================================

export interface ScorecardBuilderProps {
  initialData?: Partial<ScorecardTemplateFormData>;
  onSubmit: (data: ScorecardTemplateFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function ScorecardBuilder({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode = 'create',
}: ScorecardBuilderProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScorecardTemplateFormData>({
    resolver: zodResolver(scorecardTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      interviewType: '',
      sections: [
        {
          name: 'Technical Skills',
          description: '',
          weight: 1,
          criteria: [
            { name: '', type: 'rating', maxRating: 5, isRequired: true, weight: 1 },
          ],
        },
      ],
      isDefault: false,
      ...initialData,
    },
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control,
    name: 'sections',
  });

  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const addSection = () => {
    appendSection({
      name: '',
      description: '',
      weight: 1,
      criteria: [
        { name: '', type: 'rating', maxRating: 5, isRequired: true, weight: 1 },
      ],
    });
    setExpandedSection(sectionFields.length);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Scorecard Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Template Name"
            placeholder="e.g., Engineering Technical Interview"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Controller
            name="interviewType"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Interview Type"
                options={interviewTypeOptions}
                {...field}
              />
            )}
          />
        </div>

        <div className="mt-4">
          <FormTextarea
            label="Description"
            placeholder="Describe what this scorecard evaluates..."
            rows={2}
            {...register('description')}
          />
        </div>

        <div className="mt-4">
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Set as Default"
                description="Use this scorecard as the default for this interview type"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </section>

      {/* Sections */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Evaluation Sections ({sectionFields.length})
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addSection}>
            + Add Section
          </Button>
        </div>

        <div className="space-y-4">
          {sectionFields.map((field, sectionIndex) => (
            <SectionEditor
              key={field.id}
              sectionIndex={sectionIndex}
              control={control}
              register={register}
              errors={errors}
              isExpanded={expandedSection === sectionIndex}
              onToggle={() => setExpandedSection(expandedSection === sectionIndex ? null : sectionIndex)}
              onRemove={() => removeSection(sectionIndex)}
              onMoveUp={() => sectionIndex > 0 && moveSection(sectionIndex, sectionIndex - 1)}
              onMoveDown={() => sectionIndex < sectionFields.length - 1 && moveSection(sectionIndex, sectionIndex + 1)}
              watch={watch}
              setValue={setValue}
            />
          ))}
        </div>

        {sectionFields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sections added. Click "Add Section" to get started.
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {mode === 'create' ? 'Create Scorecard' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

// ============================================
// Section Editor Component
// ============================================

interface SectionEditorProps {
  sectionIndex: number;
  control: any;
  register: any;
  errors: any;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  watch: any;
  setValue: any;
}

function SectionEditor({
  sectionIndex,
  control,
  register,
  errors,
  isExpanded,
  onToggle,
  onRemove,
  onMoveUp,
  onMoveDown,
  watch,
  setValue,
}: SectionEditorProps) {
  const sectionName = watch(`sections.${sectionIndex}.name`);
  const criteria = watch(`sections.${sectionIndex}.criteria`) || [];

  const addCriterion = () => {
    const newCriteria = [
      ...criteria,
      { name: '', type: 'rating', maxRating: 5, isRequired: true, weight: 1 },
    ];
    setValue(`sections.${sectionIndex}.criteria`, newCriteria);
  };

  const removeCriterion = (criterionIndex: number) => {
    if (criteria.length > 1) {
      const newCriteria = criteria.filter((_: any, i: number) => i !== criterionIndex);
      setValue(`sections.${sectionIndex}.criteria`, newCriteria);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 cursor-pointer transition-colors',
          isExpanded ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'
        )}
        onClick={onToggle}
      >
        <span className="text-sm font-medium text-gray-500">Section {sectionIndex + 1}</span>
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
          {sectionName || 'Untitled Section'}
        </span>
        <Badge variant="outline" size="sm">{criteria.length} criteria</Badge>
        <div className="flex items-center gap-1">
          <button type="button" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <svg className={cn('w-5 h-5 text-gray-400 transition-transform', isExpanded && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Section Body */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Section Name"
              placeholder="e.g., Technical Skills"
              error={errors?.sections?.[sectionIndex]?.name?.message}
              required
              {...register(`sections.${sectionIndex}.name`)}
            />
            <Controller
              name={`sections.${sectionIndex}.weight`}
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Weight"
                  type="number"
                  min={0}
                  max={100}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                />
              )}
            />
          </div>

          <FormTextarea
            label="Description"
            placeholder="What should interviewers evaluate in this section?"
            rows={2}
            {...register(`sections.${sectionIndex}.description`)}
          />

          {/* Criteria */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Criteria
              </label>
              <Button type="button" variant="ghost" size="sm" onClick={addCriterion}>
                + Add Criterion
              </Button>
            </div>

            <div className="space-y-2">
              {criteria.map((criterion: any, criterionIndex: number) => (
                <div key={criterionIndex} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <input
                    type="text"
                    placeholder="Criterion name..."
                    {...register(`sections.${sectionIndex}.criteria.${criterionIndex}.name`)}
                    className="flex-1 h-9 rounded px-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                  <select
                    {...register(`sections.${sectionIndex}.criteria.${criterionIndex}.type`)}
                    className="h-9 rounded px-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    <option value="rating">Rating (1-5)</option>
                    <option value="yes_no">Yes/No</option>
                    <option value="text">Text</option>
                  </select>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      {...register(`sections.${sectionIndex}.criteria.${criterionIndex}.isRequired`)}
                      className="rounded"
                    />
                    Required
                  </label>
                  {criteria.length > 1 && (
                    <button type="button" onClick={() => removeCriterion(criterionIndex)} className="p-1 text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Evaluation Form (Fill Scorecard)
// ============================================

export interface EvaluationFormProps {
  scorecard: ScorecardTemplateFormData & { id: string };
  candidate: { name: string; position: string };
  initialData?: Partial<EvaluationFormData>;
  onSubmit: (data: EvaluationFormData) => Promise<void>;
  onSaveDraft?: (data: EvaluationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isBlindMode?: boolean;
}

export function EvaluationForm({
  scorecard,
  candidate,
  initialData,
  onSubmit,
  onSaveDraft,
  onCancel,
  isLoading,
  isBlindMode = false,
}: EvaluationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      scores: scorecard.sections.flatMap((section) =>
        section.criteria.map((c) => ({
          criterionId: c.id || c.name,
          rating: undefined,
          value: undefined,
          notes: '',
        }))
      ),
      recommendation: 'undecided',
      strengths: '',
      weaknesses: '',
      notes: '',
      ...initialData,
    },
  });

  const scores = watch('scores');
  const recommendation = watch('recommendation');

  const getCriterionScore = (criterionId: string) => {
    return scores.find((s) => s.criterionId === criterionId);
  };

  const setCriterionScore = (criterionId: string, field: 'rating' | 'value' | 'notes', value: any) => {
    const newScores = scores.map((s) =>
      s.criterionId === criterionId ? { ...s, [field]: value } : s
    );
    setValue('scores', newScores);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Candidate Info */}
      {!isBlindMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            {candidate.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {candidate.position}
          </p>
        </div>
      )}

      {/* Scorecard Sections */}
      {scorecard.sections.map((section, sectionIndex) => (
        <section
          key={sectionIndex}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {section.name}
          </h3>
          {section.description && (
            <p className="text-sm text-gray-500 mb-4">{section.description}</p>
          )}

          <div className="space-y-4">
            {section.criteria.map((criterion, criterionIndex) => {
              const criterionId = criterion.id || criterion.name;
              const score = getCriterionScore(criterionId);

              return (
                <div
                  key={criterionIndex}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <label className="font-medium text-gray-900 dark:text-gray-100">
                        {criterion.name}
                        {criterion.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {criterion.description && (
                        <p className="text-sm text-gray-500">{criterion.description}</p>
                      )}
                    </div>
                  </div>

                  {criterion.type === 'rating' && (
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {Array.from({ length: criterion.maxRating || 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setCriterionScore(criterionId, 'rating', i + 1)}
                            className={cn(
                              'w-10 h-10 rounded-full text-sm font-medium transition-colors',
                              score?.rating === i + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300'
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={score?.notes || ''}
                        onChange={(e) => setCriterionScore(criterionId, 'notes', e.target.value)}
                        className="flex-1 h-9 rounded px-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                  )}

                  {criterion.type === 'yes_no' && (
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCriterionScore(criterionId, 'value', 'yes')}
                          className={cn(
                            'px-4 py-2 rounded font-medium transition-colors',
                            score?.value === 'yes'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                          )}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setCriterionScore(criterionId, 'value', 'no')}
                          className={cn(
                            'px-4 py-2 rounded font-medium transition-colors',
                            score?.value === 'no'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                          )}
                        >
                          No
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={score?.notes || ''}
                        onChange={(e) => setCriterionScore(criterionId, 'notes', e.target.value)}
                        className="flex-1 h-9 rounded px-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                  )}

                  {criterion.type === 'text' && (
                    <textarea
                      placeholder="Enter your response..."
                      value={score?.value || ''}
                      onChange={(e) => setCriterionScore(criterionId, 'value', e.target.value)}
                      rows={3}
                      className="w-full rounded px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Overall Assessment */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Overall Assessment
        </h3>

        {/* Recommendation */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recommendation <span className="text-red-500">*</span>
          </label>
          <Controller
            name="recommendation"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-5 gap-2">
                {recommendationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-center transition-all',
                      field.value === option.value
                        ? `border-current ${option.color} text-white`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm font-medium block">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormTextarea
            label="Key Strengths"
            placeholder="What are this candidate's strongest qualities?"
            rows={3}
            {...register('strengths')}
          />

          <FormTextarea
            label="Areas for Improvement"
            placeholder="What concerns or weaknesses did you observe?"
            rows={3}
            {...register('weaknesses')}
          />
        </div>

        <FormTextarea
          label="Additional Notes"
          placeholder="Any other observations or comments..."
          rows={3}
          {...register('notes')}
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit(onSaveDraft)}
            disabled={isLoading}
          >
            Save Draft
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          Submit Evaluation
        </Button>
      </div>
    </form>
  );
}

// ============================================
// Quick Feedback Modal
// ============================================

export interface QuickFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; notes: string; recommendation: string }) => Promise<void>;
  candidateName: string;
  interviewType: string;
  isLoading?: boolean;
}

export function QuickFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  interviewType,
  isLoading,
}: QuickFeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('undecided');

  const handleSubmit = async () => {
    await onSubmit({ rating, notes, recommendation });
    setRating(0);
    setNotes('');
    setRecommendation('undecided');
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Quick Feedback"
      description={`Provide feedback for ${candidateName} - ${interviewType}`}
      size="md"
      submitText="Submit Feedback"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Overall Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={cn(
                  'w-12 h-12 rounded-full text-lg font-medium transition-colors',
                  rating >= value
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                )}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recommendation
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'hire', label: 'Hire', color: 'bg-green-100 text-green-700' },
              { value: 'undecided', label: 'Undecided', color: 'bg-yellow-100 text-yellow-700' },
              { value: 'no_hire', label: 'No Hire', color: 'bg-red-100 text-red-700' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRecommendation(option.value)}
                className={cn(
                  'p-2 rounded-lg border-2 text-sm font-medium transition-all',
                  recommendation === option.value
                    ? `${option.color} border-current`
                    : 'border-gray-200 dark:border-gray-700'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <FormTextarea
          label="Notes"
          placeholder="Share your thoughts on the candidate..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>
    </FormModal>
  );
}

// ============================================
// Decision Vote Modal
// ============================================

export interface DecisionVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DecisionVoteFormData) => Promise<void>;
  candidateName: string;
  isLoading?: boolean;
}

export function DecisionVoteModal({
  isOpen,
  onClose,
  onSubmit,
  candidateName,
  isLoading,
}: DecisionVoteModalProps) {
  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { errors },
    reset,
  } = useForm<DecisionVoteFormData>({
    resolver: zodResolver(decisionVoteSchema),
    defaultValues: {
      vote: 'needs_discussion',
      confidence: 3,
      reasoning: '',
    },
  });

  const vote = watch('vote');
  const confidence = watch('confidence');

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title="Submit Your Vote"
      description={`Make a hiring decision for ${candidateName}`}
      size="md"
      submitText="Submit Vote"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Vote */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Your Decision
          </label>
          <Controller
            name="vote"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'hire', label: 'Hire', icon: '✓', color: 'border-green-500 bg-green-50' },
                  { value: 'needs_discussion', label: 'Discuss', icon: '?', color: 'border-yellow-500 bg-yellow-50' },
                  { value: 'no_hire', label: 'No Hire', icon: '✗', color: 'border-red-500 bg-red-50' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-center transition-all',
                      field.value === option.value
                        ? option.color
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <span className="text-2xl block mb-1">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* Confidence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Confidence Level
          </label>
          <Controller
            name="confidence"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Low</span>
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => field.onChange(level)}
                      className={cn(
                        'flex-1 h-8 rounded transition-colors',
                        field.value >= level
                          ? 'bg-blue-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">High</span>
              </div>
            )}
          />
        </div>

        {/* Reasoning */}
        <FormTextarea
          label="Reasoning (optional)"
          placeholder="Explain your decision..."
          rows={3}
          {...register('reasoning')}
        />
      </div>
    </FormModal>
  );
}

// Export all
export default {
  ScorecardBuilder,
  EvaluationForm,
  QuickFeedbackModal,
  DecisionVoteModal,
};
