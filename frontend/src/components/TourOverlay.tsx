import React, { useEffect, useState, useRef } from 'react';
import { tourService, TourStep } from '../utils/tourService';

const TourOverlay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<TourStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to tour step changes
    const unsubscribe = tourService.onStepChange((step, index) => {
      setCurrentStep(step);
      setStepIndex(index);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (currentStep) {
      updateHighlight();
    }
  }, [currentStep]);

  const updateHighlight = () => {
    if (!currentStep) return;

    if (currentStep.placement === 'center' || !currentStep.target) {
      setHighlightRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
      return;
    }

    // Find target element
    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) {
      console.warn(`Tour target not found: ${currentStep.target}`);
      setHighlightRect(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    setHighlightRect(rect);

    // Calculate tooltip position
    calculateTooltipPosition(rect, currentStep.placement || 'bottom');

    // Scroll element into view
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const calculateTooltipPosition = (rect: DOMRect, placement: string) => {
    const tooltipWidth = 400;
    const tooltipHeight = 200; // Approximate
    const padding = 20;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
    }

    // Keep tooltip within viewport
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    setTooltipPosition({ top, left });
  };

  const handleNext = () => {
    tourService.nextStep();
  };

  const handlePrevious = () => {
    tourService.previousStep();
  };

  const handleSkip = () => {
    tourService.skipTour();
  };

  if (!currentStep) return null;

  const progress = tourService.getTourProgress();
  const padding = currentStep.highlightPadding || 8;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay with spotlight effect */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 9998 }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - padding}
                y={highlightRect.top - padding}
                width={highlightRect.width + padding * 2}
                height={highlightRect.height + padding * 2}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tour-spotlight-mask)"
          onClick={handleSkip}
        />
      </svg>

      {/* Highlight border */}
      {highlightRect && (
        <div
          className="absolute border-4 border-primary-500 rounded-lg animate-pulse pointer-events-none"
          style={{
            top: highlightRect.top - padding,
            left: highlightRect.left - padding,
            width: highlightRect.width + padding * 2,
            height: highlightRect.height + padding * 2,
            zIndex: 9999,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md pointer-events-auto ${
          currentStep.placement === 'center' ? 'transform -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          zIndex: 10000,
        }}
      >
        {/* Progress bar */}
        {progress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Step {progress.current} of {progress.total}
              </span>
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                {Math.round(progress.percentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {currentStep.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        {/* Action button */}
        {currentStep.action && (
          <div className="mb-4">
            <button
              onClick={currentStep.action.onClick}
              className="w-full px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors font-medium"
            >
              {currentStep.action.label}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          {currentStep.showSkip && (
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Skip Tour
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            {stepIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {progress && stepIndex === progress.total - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Close tour"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TourOverlay;
