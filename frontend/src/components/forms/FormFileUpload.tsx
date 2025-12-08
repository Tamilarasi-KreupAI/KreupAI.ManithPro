// ============================================================
// FORM FILE UPLOAD - File and image upload components
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { FormField } from './FormField';

// ============================================
// Types
// ============================================

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// ============================================
// File Upload (Single)
// ============================================

export interface FormFileUploadProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  value?: File | null;
  onChange?: (file: File | null) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export function FormFileUpload({
  label,
  error,
  hint,
  required,
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  value,
  onChange,
  onError,
  className,
  disabled,
}: FormFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', '/'));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept}`;
      }
    }
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }
    onChange?.(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className={className}>
        {!value ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative flex flex-col items-center justify-center',
              'w-full h-32 border-2 border-dashed rounded-lg cursor-pointer',
              'transition-colors duration-200',
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-red-500'
            )}
          >
            <svg
              className="w-8 h-8 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {accept !== '*' ? accept : 'Any file type'} (max {formatFileSize(maxSize)})
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              disabled={disabled}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {value.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(value.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </FormField>
  );
}

// ============================================
// Multiple File Upload
// ============================================

export interface FormMultiFileUploadProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export function FormMultiFileUpload({
  label,
  error,
  hint,
  required,
  accept = '*',
  maxSize = 10 * 1024 * 1024,
  maxFiles = 10,
  value = [],
  onChange,
  onError,
  className,
  disabled,
}: FormMultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = (files: FileList) => {
    if (value.length + files.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        onError?.(`${file.name} is too large (max ${formatFileSize(maxSize)})`);
        continue;
      }
      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      onChange?.([...value, ...newFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handleRemove = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange?.(newFiles);
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className={className}>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center',
            'w-full h-24 border-2 border-dashed rounded-lg cursor-pointer',
            'transition-colors duration-200',
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500'
          )}
        >
          <svg
            className="w-6 h-6 text-gray-400 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add files ({value.length}/{maxFiles})
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            multiple
            className="hidden"
          />
        </div>

        {value.length > 0 && (
          <ul className="mt-2 space-y-1">
            {value.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FormField>
  );
}

// ============================================
// Image Upload with Preview
// ============================================

export interface FormImageUploadProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  maxSize?: number;
  value?: string | File | null;
  onChange?: (file: File | null) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'free';
}

export function FormImageUpload({
  label,
  error,
  hint,
  required,
  maxSize = 5 * 1024 * 1024,
  value,
  onChange,
  onError,
  className,
  disabled,
  aspectRatio = 'square',
}: FormImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === 'string') {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const aspectRatioClass = {
    square: 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    free: '',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file');
      return;
    }

    if (file.size > maxSize) {
      onError?.(`Image must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    onChange?.(file);
  };

  const handleRemove = () => {
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <div className={cn('relative', className)}>
        {preview ? (
          <div className={cn('relative rounded-lg overflow-hidden', aspectRatioClass[aspectRatio])}>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer',
              'border-gray-300 dark:border-gray-600 hover:border-gray-400',
              'transition-colors duration-200',
              aspectRatioClass[aspectRatio] || 'h-40',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-red-500'
            )}
          >
            <svg
              className="w-8 h-8 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">Click to upload image</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
      </div>
    </FormField>
  );
}
