// ============================================================
// QUICKACTIONS - Floating action button and speed dial
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

// ============================================
// Types
// ============================================
export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

export interface FloatingActionButtonProps {
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  actions?: QuickAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  pulse?: boolean;
  className?: string;
}

// ============================================
// Floating Action Button (FAB)
// ============================================
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  actions = [],
  position = 'bottom-right',
  size = 'md',
  color = 'primary',
  pulse = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  const hasSpeedDial = actions.length > 0;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const colorClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-200',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-green-200',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200',
  };

  const handleClick = () => {
    if (hasSpeedDial) {
      setIsOpen(!isOpen);
    } else {
      onClick?.();
    }
  };

  const defaultIcon = (
    <svg className={iconSizeClasses[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  return (
    <div
      ref={fabRef}
      className={cn('fixed z-40', positionClasses[position], className)}
    >
      {/* Speed Dial Actions */}
      {hasSpeedDial && (
        <div
          className={cn(
            'absolute bottom-full mb-3 flex flex-col-reverse gap-2 transition-all duration-200',
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center gap-3"
              style={{
                transitionDelay: `${index * 50}ms`,
              }}
            >
              <span className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap shadow-lg">
                {action.label}
              </span>
              <button
                type="button"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                disabled={action.disabled}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  'shadow-lg transition-all hover:scale-110',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  action.disabled && 'opacity-50 cursor-not-allowed',
                  action.color === 'success' ? 'bg-green-500 text-white focus:ring-green-500' :
                  action.color === 'warning' ? 'bg-yellow-500 text-white focus:ring-yellow-500' :
                  action.color === 'danger' ? 'bg-red-500 text-white focus:ring-red-500' :
                  action.color === 'secondary' ? 'bg-gray-500 text-white focus:ring-gray-500' :
                  'bg-indigo-500 text-white focus:ring-indigo-500'
                )}
                aria-label={action.label}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'rounded-full flex items-center justify-center',
          'shadow-lg transition-all hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
          sizeClasses[size],
          colorClasses[color],
          hasSpeedDial && isOpen && 'rotate-45',
          pulse && 'animate-pulse'
        )}
        aria-expanded={hasSpeedDial ? isOpen : undefined}
        aria-haspopup={hasSpeedDial ? 'true' : undefined}
        aria-label={label || 'Quick actions'}
      >
        {icon || defaultIcon}
      </button>

      {/* Label (when no speed dial) */}
      {label && !hasSpeedDial && (
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {label}
        </span>
      )}
    </div>
  );
};

// ============================================
// Command Palette Trigger
// ============================================
export interface CommandPaletteTriggerProps {
  onClick: () => void;
  className?: string;
}

export const CommandPaletteTrigger: React.FC<CommandPaletteTriggerProps> = ({
  onClick,
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500',
        'border border-gray-300 rounded-lg bg-white hover:bg-gray-50',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500',
        'transition-colors',
        className
      )}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
};

// ============================================
// Quick Action Bar (Horizontal)
// ============================================
export interface QuickActionBarProps {
  actions: QuickAction[];
  className?: string;
  variant?: 'default' | 'compact' | 'pills';
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  actions,
  className,
  variant = 'default',
}) => {
  const colorClasses = {
    primary: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              'p-2 rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500',
              action.disabled && 'opacity-50 cursor-not-allowed',
              colorClasses[action.color || 'secondary']
            )}
            title={action.label}
            aria-label={action.label}
          >
            {action.icon}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-2 flex-wrap', className)}>
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
              action.disabled && 'opacity-50 cursor-not-allowed',
              colorClasses[action.color || 'primary']
            )}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
            'border border-gray-300 bg-white hover:bg-gray-50',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            action.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

// ============================================
// Contextual Actions (Right-click menu style)
// ============================================
export interface ContextualActionsProps {
  trigger: React.ReactNode;
  actions: QuickAction[];
  className?: string;
}

export const ContextualActions: React.FC<ContextualActionsProps> = ({
  trigger,
  actions,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
          style={{
            left: position.x,
            top: position.y,
          }}
          role="menu"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              disabled={action.disabled}
              className={cn(
                'flex items-center gap-2 w-full px-4 py-2 text-sm text-left',
                'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                action.disabled && 'opacity-50 cursor-not-allowed',
                action.color === 'danger' && 'text-red-600 hover:bg-red-50'
              )}
              role="menuitem"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};
