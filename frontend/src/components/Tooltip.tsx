import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number; // milliseconds before showing
  maxWidth?: number;
  trigger?: 'hover' | 'click' | 'focus';
  showArrow?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  maxWidth = 250,
  trigger = 'hover',
  showArrow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState(placement);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      calculatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;
    const arrowSize = showArrow ? 6 : 0;

    let top = 0;
    let left = 0;
    let finalPlacement = placement;

    // Calculate initial position
    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - arrowSize - padding;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + arrowSize + padding;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - arrowSize - padding;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + arrowSize + padding;
        break;
    }

    // Adjust if tooltip goes off screen
    const viewportPadding = 10;

    // Check horizontal bounds
    if (left < viewportPadding) {
      left = viewportPadding;
    } else if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
      left = window.innerWidth - tooltipRect.width - viewportPadding;
    }

    // Check vertical bounds and flip if necessary
    if (top < viewportPadding && (placement === 'top' || placement === 'bottom')) {
      if (placement === 'top') {
        // Flip to bottom
        top = triggerRect.bottom + arrowSize + padding;
        finalPlacement = 'bottom';
      }
    } else if (
      top + tooltipRect.height > window.innerHeight - viewportPadding &&
      (placement === 'top' || placement === 'bottom')
    ) {
      if (placement === 'bottom') {
        // Flip to top
        top = triggerRect.top - tooltipRect.height - arrowSize - padding;
        finalPlacement = 'top';
      }
    }

    // Final bounds check
    top = Math.max(viewportPadding, Math.min(top, window.innerHeight - tooltipRect.height - viewportPadding));

    setPosition({ top, left });
    setActualPlacement(finalPlacement);
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hideTooltip();
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      showTooltip();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      hideTooltip();
    }
  };

  const getArrowStyles = () => {
    const arrowSize = 6;
    const baseStyles = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid' as const,
    };

    switch (actualPlacement) {
      case 'top':
        return {
          ...baseStyles,
          bottom: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: 'rgb(31 41 55) transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent rgb(31 41 55) transparent',
        };
      case 'left':
        return {
          ...baseStyles,
          right: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent transparent rgb(31 41 55)',
        };
      case 'right':
        return {
          ...baseStyles,
          left: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: 'transparent rgb(31 41 55) transparent transparent',
        };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <>
          {/* Backdrop for click-away */}
          {trigger === 'click' && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsVisible(false)}
              style={{ background: 'transparent' }}
            />
          )}

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-800 dark:bg-gray-900 rounded-lg shadow-lg animate-in fade-in duration-200"
            style={{
              top: position.top,
              left: position.left,
              maxWidth: maxWidth,
            }}
            role="tooltip"
          >
            {content}
            {showArrow && <div style={getArrowStyles()} />}
          </div>
        </>
      )}
    </>
  );
};

export default Tooltip;
