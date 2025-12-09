// ============================================================
// ASSESSMENT FORMS - Create, edit, and take assessments
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
  FormNumberInput,
} from '../forms';
import { Modal, FormModal, ConfirmationModal } from '../modals';
import { Button, Badge, Card } from '../ui';
import { cn } from '../../lib/utils';

// ============================================
// Validation Schemas
// ============================================

const questionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['multiple_choice', 'single_choice', 'text', 'code', 'rating', 'file_upload']),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  description: z.string().optional(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isCorrect: z.boolean().optional(),
  })).optional(),
  correctAnswer: z.string().optional(),
  points: z.number().min(0).default(1),
  timeLimit: z.number().min(0).optional(),
  required: z.boolean().default(true),
  codeLanguage: z.string().optional(),
  codeTemplate: z.string().optional(),
  testCases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string(),
    isHidden: z.boolean(),
  })).optional(),
});

export const assessmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['technical', 'behavioral', 'cognitive', 'personality', 'skills', 'custom']),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  passingScore: z.number().min(0).max(100).optional(),
  instructions: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
  settings: z.object({
    shuffleQuestions: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    showResults: z.boolean().default(true),
    allowRetake: z.boolean().default(false),
    maxAttempts: z.number().min(1).default(1),
    proctored: z.boolean().default(false),
    requireWebcam: z.boolean().default(false),
    preventCopyPaste: z.boolean().default(false),
  }).optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const assessmentResponseSchema = z.object({
  assessmentId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.array(z.string())]),
    timeSpent: z.number().optional(),
  })),
  startedAt: z.string(),
  submittedAt: z.string().optional(),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
export type AssessmentFormData = z.infer<typeof assessmentSchema>;
export type AssessmentResponseData = z.infer<typeof assessmentResponseSchema>;

// ============================================
// Type Options
// ============================================

const assessmentTypeOptions = [
  { value: 'technical', label: 'Technical', description: 'Coding and technical skills' },
  { value: 'behavioral', label: 'Behavioral', description: 'Soft skills and behavior' },
  { value: 'cognitive', label: 'Cognitive', description: 'Problem-solving ability' },
  { value: 'personality', label: 'Personality', description: 'Personality traits' },
  { value: 'skills', label: 'Skills', description: 'Specific skill evaluation' },
  { value: 'custom', label: 'Custom', description: 'Custom assessment type' },
];

const questionTypeOptions = [
  { value: 'single_choice', label: 'Single Choice', icon: '○' },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: '☑' },
  { value: 'text', label: 'Text Answer', icon: '✎' },
  { value: 'code', label: 'Coding', icon: '</>' },
  { value: 'rating', label: 'Rating Scale', icon: '★' },
  { value: 'file_upload', label: 'File Upload', icon: '📎' },
];

const difficultyOptions = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700' },
];

const codeLanguageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'sql', label: 'SQL' },
];

// ============================================
// Create Assessment Form
// ============================================

export interface CreateAssessmentFormProps {
  initialData?: Partial<AssessmentFormData>;
  onSubmit: (data: AssessmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function CreateAssessmentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode = 'create',
}: CreateAssessmentFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'technical',
      duration: 30,
      passingScore: 70,
      instructions: '',
      questions: [
        {
          type: 'single_choice',
          question: '',
          options: [
            { id: '1', text: '', isCorrect: true },
            { id: '2', text: '', isCorrect: false },
          ],
          points: 1,
          required: true,
        },
      ],
      settings: {
        shuffleQuestions: false,
        shuffleOptions: false,
        showResults: true,
        allowRetake: false,
        maxAttempts: 1,
        proctored: false,
        requireWebcam: false,
        preventCopyPaste: false,
      },
      tags: [],
      difficulty: 'medium',
      ...initialData,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  const addQuestion = (type: QuestionFormData['type'] = 'single_choice') => {
    const newQuestion: Partial<QuestionFormData> = {
      type,
      question: '',
      points: 1,
      required: true,
    };

    if (type === 'single_choice' || type === 'multiple_choice') {
      newQuestion.options = [
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ];
    }

    if (type === 'code') {
      newQuestion.codeLanguage = 'javascript';
      newQuestion.codeTemplate = '';
      newQuestion.testCases = [];
    }

    append(newQuestion as QuestionFormData);
    setExpandedQuestion(fields.length);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Assessment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Title"
            placeholder="e.g., JavaScript Fundamentals"
            error={errors.title?.message}
            required
            {...register('title')}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Assessment Type"
                options={assessmentTypeOptions}
                error={errors.type?.message}
                required
                {...field}
              />
            )}
          />

          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Duration (minutes)"
                type="number"
                min={1}
                error={errors.duration?.message}
                required
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
              />
            )}
          />

          <Controller
            name="passingScore"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Passing Score (%)"
                type="number"
                min={0}
                max={100}
                error={errors.passingScore?.message}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 70)}
              />
            )}
          />

          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Difficulty"
                options={difficultyOptions}
                error={errors.difficulty?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <FormTagsInput
                label="Tags"
                placeholder="Add tags..."
                value={field.value || []}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="mt-4">
          <FormTextarea
            label="Description"
            placeholder="Describe what this assessment evaluates..."
            rows={2}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="mt-4">
          <FormTextarea
            label="Instructions"
            placeholder="Instructions for candidates taking this assessment..."
            rows={3}
            error={errors.instructions?.message}
            {...register('instructions')}
          />
        </div>
      </section>

      {/* Questions */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Questions ({fields.length})
          </h3>
          <div className="flex gap-2">
            {questionTypeOptions.map((type) => (
              <Button
                key={type.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion(type.value as QuestionFormData['type'])}
                title={`Add ${type.label}`}
              >
                <span className="mr-1">{type.icon}</span>
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <QuestionEditor
              key={field.id}
              index={index}
              control={control}
              register={register}
              errors={errors}
              isExpanded={expandedQuestion === index}
              onToggle={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
              onRemove={() => remove(index)}
              onMoveUp={() => index > 0 && move(index, index - 1)}
              onMoveDown={() => index < fields.length - 1 && move(index, index + 1)}
              watch={watch}
              setValue={setValue}
            />
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No questions added yet.</p>
            <p className="text-sm mt-1">Click a question type above to add your first question.</p>
          </div>
        )}
      </section>

      {/* Settings */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="settings.shuffleQuestions"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Shuffle Questions"
                description="Randomize question order for each candidate"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="settings.shuffleOptions"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Shuffle Options"
                description="Randomize option order for choice questions"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="settings.showResults"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Show Results"
                description="Show score to candidate after completion"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="settings.allowRetake"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Allow Retake"
                description="Allow candidates to retake the assessment"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="settings.proctored"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Proctored"
                description="Enable proctoring features"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="settings.preventCopyPaste"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                label="Prevent Copy/Paste"
                description="Disable copy and paste during assessment"
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
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" loading={isLoading}>
          {mode === 'create' ? 'Create Assessment' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

// ============================================
// Question Editor Component
// ============================================

interface QuestionEditorProps {
  index: number;
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

function QuestionEditor({
  index,
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
}: QuestionEditorProps) {
  const questionType = watch(`questions.${index}.type`);
  const question = watch(`questions.${index}.question`);
  const questionTypeConfig = questionTypeOptions.find((t) => t.value === questionType);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 cursor-pointer transition-colors',
          isExpanded ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'
        )}
        onClick={onToggle}
      >
        <span className="text-lg">{questionTypeConfig?.icon}</span>
        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
        <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate">
          {question || 'Untitled Question'}
        </span>
        <Badge variant="outline" size="sm">
          {questionTypeConfig?.label}
        </Badge>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <svg
            className={cn('w-5 h-5 text-gray-400 transition-transform', isExpanded && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormTextarea
                label="Question"
                placeholder="Enter your question..."
                rows={2}
                error={errors?.questions?.[index]?.question?.message}
                required
                {...register(`questions.${index}.question`)}
              />
            </div>
            <div className="space-y-4">
              <Controller
                name={`questions.${index}.points`}
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="Points"
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                )}
              />
              <Controller
                name={`questions.${index}.required`}
                control={control}
                render={({ field }) => (
                  <FormCheckbox
                    label="Required"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <FormTextarea
            label="Description (optional)"
            placeholder="Additional context or hints..."
            rows={2}
            {...register(`questions.${index}.description`)}
          />

          {/* Question Type Specific Fields */}
          {(questionType === 'single_choice' || questionType === 'multiple_choice') && (
            <ChoiceOptionsEditor
              index={index}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
              isMultiple={questionType === 'multiple_choice'}
            />
          )}

          {questionType === 'code' && (
            <CodeQuestionEditor
              index={index}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Choice Options Editor
// ============================================

interface ChoiceOptionsEditorProps {
  index: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  isMultiple: boolean;
}

function ChoiceOptionsEditor({
  index,
  control,
  register,
  watch,
  setValue,
  isMultiple,
}: ChoiceOptionsEditorProps) {
  const options = watch(`questions.${index}.options`) || [];

  const addOption = () => {
    const newOptions = [
      ...options,
      { id: crypto.randomUUID(), text: '', isCorrect: false },
    ];
    setValue(`questions.${index}.options`, newOptions);
  };

  const removeOption = (optIndex: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_: any, i: number) => i !== optIndex);
      setValue(`questions.${index}.options`, newOptions);
    }
  };

  const setCorrect = (optIndex: number) => {
    const newOptions = options.map((opt: any, i: number) => ({
      ...opt,
      isCorrect: isMultiple ? (i === optIndex ? !opt.isCorrect : opt.isCorrect) : i === optIndex,
    }));
    setValue(`questions.${index}.options`, newOptions);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Options
      </label>
      <div className="space-y-2">
        {options.map((option: any, optIndex: number) => (
          <div key={option.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrect(optIndex)}
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                option.isCorrect
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {option.isCorrect && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <input
              type="text"
              value={option.text}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[optIndex].text = e.target.value;
                setValue(`questions.${index}.options`, newOptions);
              }}
              placeholder={`Option ${optIndex + 1}`}
              className={cn(
                'flex-1 h-10 rounded-lg px-3 text-sm',
                'border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(optIndex)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addOption}
        className="mt-2"
      >
        + Add Option
      </Button>
    </div>
  );
}

// ============================================
// Code Question Editor
// ============================================

interface CodeQuestionEditorProps {
  index: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
}

function CodeQuestionEditor({
  index,
  control,
  register,
  watch,
  setValue,
}: CodeQuestionEditorProps) {
  const testCases = watch(`questions.${index}.testCases`) || [];

  const addTestCase = () => {
    const newTestCases = [
      ...testCases,
      { input: '', expectedOutput: '', isHidden: false },
    ];
    setValue(`questions.${index}.testCases`, newTestCases);
  };

  const removeTestCase = (tcIndex: number) => {
    const newTestCases = testCases.filter((_: any, i: number) => i !== tcIndex);
    setValue(`questions.${index}.testCases`, newTestCases);
  };

  return (
    <div className="space-y-4">
      <Controller
        name={`questions.${index}.codeLanguage`}
        control={control}
        render={({ field }) => (
          <FormSelect
            label="Programming Language"
            options={codeLanguageOptions}
            {...field}
          />
        )}
      />

      <FormTextarea
        label="Code Template"
        placeholder="// Starter code for the candidate..."
        rows={6}
        className="font-mono text-sm"
        {...register(`questions.${index}.codeTemplate`)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test Cases
        </label>
        <div className="space-y-2">
          {testCases.map((tc: any, tcIndex: number) => (
            <div key={tcIndex} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={tc.input}
                  onChange={(e) => {
                    const newTestCases = [...testCases];
                    newTestCases[tcIndex].input = e.target.value;
                    setValue(`questions.${index}.testCases`, newTestCases);
                  }}
                  placeholder="Input"
                  className="h-9 rounded px-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
                <input
                  type="text"
                  value={tc.expectedOutput}
                  onChange={(e) => {
                    const newTestCases = [...testCases];
                    newTestCases[tcIndex].expectedOutput = e.target.value;
                    setValue(`questions.${index}.testCases`, newTestCases);
                  }}
                  placeholder="Expected Output"
                  className="h-9 rounded px-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={tc.isHidden}
                  onChange={(e) => {
                    const newTestCases = [...testCases];
                    newTestCases[tcIndex].isHidden = e.target.checked;
                    setValue(`questions.${index}.testCases`, newTestCases);
                  }}
                  className="rounded"
                />
                Hidden
              </label>
              <button
                type="button"
                onClick={() => removeTestCase(tcIndex)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addTestCase}
          className="mt-2"
        >
          + Add Test Case
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Take Assessment Form
// ============================================

export interface TakeAssessmentFormProps {
  assessment: AssessmentFormData & { id: string };
  onSubmit: (data: AssessmentResponseData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TakeAssessmentForm({
  assessment,
  onSubmit,
  onCancel,
  isLoading,
}: TakeAssessmentFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [startedAt] = useState(new Date().toISOString());
  const [timeRemaining, setTimeRemaining] = useState(assessment.duration * 60);

  const handleAnswer = (questionIndex: number, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex.toString()]: answer,
    }));
  };

  const handleSubmit = async () => {
    const responseData: AssessmentResponseData = {
      assessmentId: assessment.id,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
      startedAt,
      submittedAt: new Date().toISOString(),
    };
    await onSubmit(responseData);
  };

  const question = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {assessment.title}
          </h2>
          <Badge variant="outline">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} remaining
          </Badge>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Question {currentQuestion + 1} of {assessment.questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">{questionTypeOptions.find((t) => t.value === question.type)?.label}</Badge>
          <Badge variant="outline">{question.points} points</Badge>
          {question.required && <Badge variant="destructive">Required</Badge>}
        </div>

        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {question.question}
        </h3>

        {question.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {question.description}
          </p>
        )}

        {/* Answer Input */}
        <div className="mt-4">
          {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    'flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all',
                    (question.type === 'single_choice'
                      ? answers[currentQuestion.toString()] === option.id
                      : (answers[currentQuestion.toString()] as string[])?.includes(option.id))
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <input
                    type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                    name={`question-${currentQuestion}`}
                    checked={
                      question.type === 'single_choice'
                        ? answers[currentQuestion.toString()] === option.id
                        : (answers[currentQuestion.toString()] as string[])?.includes(option.id)
                    }
                    onChange={() => {
                      if (question.type === 'single_choice') {
                        handleAnswer(currentQuestion, option.id);
                      } else {
                        const current = (answers[currentQuestion.toString()] as string[]) || [];
                        if (current.includes(option.id)) {
                          handleAnswer(currentQuestion, current.filter((id) => id !== option.id));
                        } else {
                          handleAnswer(currentQuestion, [...current, option.id]);
                        }
                      }
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900 dark:text-gray-100">
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={(answers[currentQuestion.toString()] as string) || ''}
              onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-sm',
                'border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            />
          )}

          {question.type === 'code' && (
            <textarea
              value={(answers[currentQuestion.toString()] as string) || question.codeTemplate || ''}
              onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
              placeholder="// Write your code here..."
              rows={12}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-sm font-mono',
                'border border-gray-300 dark:border-gray-600',
                'bg-gray-900 text-green-400',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion < assessment.questions.length - 1 ? (
            <Button
              type="button"
              onClick={() => setCurrentQuestion((prev) => Math.min(assessment.questions.length - 1, prev + 1))}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              loading={isLoading}
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="mt-6 flex flex-wrap gap-2">
        {assessment.questions.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentQuestion(idx)}
            className={cn(
              'w-8 h-8 rounded-full text-sm font-medium transition-colors',
              idx === currentQuestion
                ? 'bg-blue-600 text-white'
                : answers[idx.toString()]
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Assessment Preview Modal
// ============================================

export interface AssessmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentFormData;
}

export function AssessmentPreviewModal({
  isOpen,
  onClose,
  assessment,
}: AssessmentPreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assessment Preview"
      size="xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{assessment.type}</Badge>
          <Badge variant="outline">{assessment.duration} min</Badge>
          {assessment.difficulty && (
            <Badge className={difficultyOptions.find((d) => d.value === assessment.difficulty)?.color}>
              {assessment.difficulty}
            </Badge>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {assessment.title}
          </h3>
          {assessment.description && (
            <p className="text-sm text-gray-500 mt-1">{assessment.description}</p>
          )}
        </div>

        {assessment.instructions && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Instructions:</strong> {assessment.instructions}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Questions ({assessment.questions.length})
          </h4>
          {assessment.questions.map((q, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-500">Q{idx + 1}</span>
                <Badge variant="outline" size="sm">
                  {questionTypeOptions.find((t) => t.value === q.type)?.label}
                </Badge>
                <Badge variant="outline" size="sm">{q.points} pts</Badge>
              </div>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {q.question}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// Export all
export default {
  CreateAssessmentForm,
  TakeAssessmentForm,
  AssessmentPreviewModal,
};
