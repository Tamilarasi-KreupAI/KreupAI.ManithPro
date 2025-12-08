// ============================================================
// FORM COMPONENTS - Barrel Export
// ============================================================

// Base form components
export {
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormSwitch,
  FormRadioGroup,
} from './FormField';

export type {
  FormFieldProps,
  FormInputProps,
  FormTextareaProps,
  SelectOption,
  FormSelectProps,
  FormCheckboxProps,
  FormSwitchProps,
  RadioOption,
  FormRadioGroupProps,
} from './FormField';

// Date picker components
export {
  FormDateInput,
  FormDateTimeInput,
  FormTimeInput,
  FormDateRange,
  FormMonthYear,
  FormDateRangeWithPresets,
} from './FormDatePicker';

export type {
  FormDateInputProps,
  FormDateTimeInputProps,
  FormTimeInputProps,
  DateRange,
  FormDateRangeProps,
  FormMonthYearProps,
  DatePreset,
  FormDateRangeWithPresetsProps,
} from './FormDatePicker';

// File upload components
export {
  FormFileUpload,
  FormMultiFileUpload,
  FormImageUpload,
} from './FormFileUpload';

export type {
  UploadedFile,
  FormFileUploadProps,
  FormMultiFileUploadProps,
  FormImageUploadProps,
} from './FormFileUpload';

// Multi-select and tags components
export {
  FormMultiSelect,
  FormTagsInput,
  FormCombobox,
} from './FormMultiSelect';

export type {
  FormMultiSelectProps,
  FormTagsInputProps,
  FormComboboxProps,
} from './FormMultiSelect';

// Specialized form components
export {
  FormSalaryRange,
  FormSkillPicker,
  FormNumberInput,
  FormRating,
  FormPhoneInput,
} from './FormSpecialized';

export type {
  SalaryRange,
  FormSalaryRangeProps,
  Skill,
  FormSkillPickerProps,
  FormNumberInputProps,
  FormRatingProps,
  FormPhoneInputProps,
} from './FormSpecialized';
