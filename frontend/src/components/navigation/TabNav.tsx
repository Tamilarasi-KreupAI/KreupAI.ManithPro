// ============================================================
// TABNAV - Tab navigation and step indicator components
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { cn } from '../../utils/cn';

// ============================================
// Types
// ============================================
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  href?: string;
}

export interface TabNavProps {
  tabs: TabItem[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  scrollable?: boolean;
  className?: string;
  syncWithUrl?: boolean;
  urlParam?: string;
}

// ============================================
// Tab Nav Component
// ============================================
export const TabNav: React.FC<TabNavProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  scrollable = true,
  className,
  syncWithUrl = false,
  urlParam = 'tab',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Determine active tab from URL or prop
  const currentTab = syncWithUrl
    ? searchParams.get(urlParam) || tabs[0]?.id
    : activeTab || tabs[0]?.id;

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (syncWithUrl) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(urlParam, tabId);
      setSearchParams(newParams, { replace: true });
    }
    onChange?.(tabId);
  };

  // Check scroll state
  const checkScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth;
    setShowScrollButtons(hasOverflow && scrollable);
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  }, [scrollable]);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.5;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Style variants
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  const paddingClasses = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5',
  };

  const getTabClasses = (tab: TabItem, isActive: boolean) => {
    const base = cn(
      'inline-flex items-center gap-2 font-medium whitespace-nowrap transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
      sizeClasses[size],
      paddingClasses[size],
      tab.disabled && 'opacity-50 cursor-not-allowed',
      fullWidth && 'flex-1 justify-center'
    );

    switch (variant) {
      case 'pills':
        return cn(
          base,
          'rounded-full',
          isActive
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        );
      case 'underline':
        return cn(
          base,
          'border-b-2 -mb-px',
          isActive
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        );
      case 'bordered':
        return cn(
          base,
          'border border-transparent rounded-t-lg -mb-px',
          isActive
            ? 'border-gray-200 border-b-white bg-white text-indigo-600'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        );
      default:
        return cn(
          base,
          'rounded-lg',
          isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        );
    }
  };

  const containerClasses = cn(
    'relative flex',
    variant === 'underline' && 'border-b border-gray-200',
    variant === 'bordered' && 'border-b border-gray-200',
    className
  );

  return (
    <div className={containerClasses}>
      {/* Left Scroll Button */}
      {showScrollButtons && canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 h-full px-2 bg-gradient-to-r from-white to-transparent"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-1 overflow-x-auto scrollbar-hide',
          fullWidth && 'w-full',
          showScrollButtons && 'px-8'
        )}
        onScroll={checkScroll}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          if (tab.href) {
            return (
              <Link
                key={tab.id}
                to={tab.href}
                className={getTabClasses(tab, location.pathname === tab.href)}
                role="tab"
                aria-selected={location.pathname === tab.href}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-medium',
                    isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                  )}>
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              className={getTabClasses(tab, isActive)}
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-medium',
                  isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      {showScrollButtons && canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 h-full px-2 bg-gradient-to-l from-white to-transparent"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================
// Tab Panel
// ============================================
export interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
  keepMounted?: boolean;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  id,
  activeTab,
  children,
  className,
  keepMounted = false,
}) => {
  const isActive = activeTab === id;

  if (!keepMounted && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!isActive}
      className={cn(
        'focus:outline-none',
        !isActive && 'hidden',
        className
      )}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

// ============================================
// Step Indicator
// ============================================
export interface StepItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
}

export interface StepIndicatorProps {
  steps: StepItem[];
  currentStep: number;
  variant?: 'default' | 'circles' | 'arrows' | 'dots';
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  variant = 'default',
  orientation = 'horizontal',
  size = 'md',
  clickable = false,
  onStepClick,
  className,
}) => {
  const sizeClasses = {
    sm: {
      circle: 'w-6 h-6 text-xs',
      text: 'text-xs',
      connector: 'h-0.5',
      verticalConnector: 'w-0.5 h-8',
    },
    md: {
      circle: 'w-8 h-8 text-sm',
      text: 'text-sm',
      connector: 'h-0.5',
      verticalConnector: 'w-0.5 h-12',
    },
    lg: {
      circle: 'w-10 h-10 text-base',
      text: 'text-base',
      connector: 'h-1',
      verticalConnector: 'w-1 h-16',
    },
  };

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const handleClick = (index: number) => {
    if (clickable && onStepClick) {
      onStepClick(index);
    }
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleClick(index)}
              disabled={!clickable}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                clickable && 'cursor-pointer hover:scale-125',
                status === 'completed' && 'bg-indigo-600',
                status === 'current' && 'bg-indigo-600 ring-4 ring-indigo-100',
                status === 'upcoming' && 'bg-gray-300'
              )}
              aria-label={`Step ${index + 1}: ${step.label}`}
              aria-current={status === 'current' ? 'step' : undefined}
            />
          );
        })}
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <ol className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="flex gap-4">
              {/* Step Circle and Connector */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleClick(index)}
                  disabled={!clickable}
                  className={cn(
                    'flex items-center justify-center rounded-full font-medium transition-all',
                    sizeClasses[size].circle,
                    clickable && status !== 'upcoming' && 'cursor-pointer hover:ring-4 hover:ring-indigo-100',
                    status === 'completed' && 'bg-indigo-600 text-white',
                    status === 'current' && 'bg-indigo-600 text-white ring-4 ring-indigo-100',
                    status === 'upcoming' && 'bg-gray-200 text-gray-500'
                  )}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )}
                </button>
                {!isLast && (
                  <div className={cn(
                    'mt-2',
                    sizeClasses[size].verticalConnector,
                    status === 'completed' ? 'bg-indigo-600' : 'bg-gray-200'
                  )} />
                )}
              </div>

              {/* Step Content */}
              <div className="pt-1 pb-4">
                <p className={cn(
                  'font-medium',
                  sizeClasses[size].text,
                  status === 'upcoming' ? 'text-gray-500' : 'text-gray-900'
                )}>
                  {step.label}
                  {step.optional && (
                    <span className="ml-2 text-gray-400 font-normal">(Optional)</span>
                  )}
                </p>
                {step.description && (
                  <p className={cn('mt-1 text-gray-500', sizeClasses[size].text)}>
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  // Horizontal (default)
  return (
    <ol className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className={cn('flex items-center', !isLast && 'flex-1')}>
            <button
              type="button"
              onClick={() => handleClick(index)}
              disabled={!clickable}
              className={cn(
                'flex items-center gap-2',
                clickable && status !== 'upcoming' && 'cursor-pointer'
              )}
              aria-current={status === 'current' ? 'step' : undefined}
            >
              {/* Step Circle */}
              <span
                className={cn(
                  'flex items-center justify-center rounded-full font-medium transition-all flex-shrink-0',
                  sizeClasses[size].circle,
                  clickable && status !== 'upcoming' && 'hover:ring-4 hover:ring-indigo-100',
                  status === 'completed' && 'bg-indigo-600 text-white',
                  status === 'current' && 'bg-indigo-600 text-white ring-4 ring-indigo-100',
                  status === 'upcoming' && 'bg-gray-200 text-gray-500'
                )}
              >
                {status === 'completed' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.icon ? (
                  step.icon
                ) : (
                  index + 1
                )}
              </span>

              {/* Step Label (hidden on small screens for many steps) */}
              <span
                className={cn(
                  'font-medium hidden sm:block',
                  sizeClasses[size].text,
                  status === 'upcoming' ? 'text-gray-500' : 'text-gray-900'
                )}
              >
                {step.label}
              </span>
            </button>

            {/* Connector */}
            {!isLast && (
              <div className={cn(
                'flex-1 mx-4 rounded',
                sizeClasses[size].connector,
                status === 'completed' ? 'bg-indigo-600' : 'bg-gray-200'
              )} />
            )}
          </li>
        );
      })}
    </ol>
  );
};

// ============================================
// Progress Steps (Alternative design)
// ============================================
export interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  className,
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Step {currentStep + 1} of {steps.length}</span>
        <span>{steps[currentStep]}</span>
      </div>
    </div>
  );
};
