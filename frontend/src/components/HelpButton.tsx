import React from 'react';
import Tooltip from './Tooltip';

interface HelpButtonProps {
  content: string | React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'both';
  className?: string;
}

/**
 * Contextual help button with tooltip
 * Can be placed next to any UI element to provide inline help
 */
const HelpButton: React.FC<HelpButtonProps> = ({
  content,
  placement = 'top',
  size = 'sm',
  variant = 'icon',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      case 'md':
      default:
        return 'w-5 h-5';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-help';
    return `${baseClasses} ${className}`;
  };

  const icon = (
    <svg
      className={getSizeClasses()}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const renderContent = () => {
    switch (variant) {
      case 'text':
        return <span className="text-xs">Help</span>;
      case 'both':
        return (
          <>
            {icon}
            <span className="text-xs">Help</span>
          </>
        );
      case 'icon':
      default:
        return icon;
    }
  };

  return (
    <Tooltip content={content} placement={placement} trigger="hover">
      <button
        type="button"
        className={getButtonClasses()}
        aria-label="Help"
        onClick={(e) => e.preventDefault()}
      >
        {renderContent()}
      </button>
    </Tooltip>
  );
};

export default HelpButton;
