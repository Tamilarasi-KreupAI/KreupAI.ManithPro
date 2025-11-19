import React from 'react';

interface TrustScoreBadgeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const getScoreLevel = () => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'low';
  };

  const getScoreConfig = () => {
    const level = getScoreLevel();
    switch (level) {
      case 'excellent':
        return {
          color: 'text-green-700 bg-green-100 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
          label: 'Excellent',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
        };
      case 'good':
        return {
          color: 'text-blue-700 bg-blue-100 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
          label: 'Good',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
        };
      case 'fair':
        return {
          color: 'text-yellow-700 bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
          label: 'Fair',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      default:
        return {
          color: 'text-gray-700 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
          label: 'Building',
          icon: (
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs gap-1',
          icon: 'w-3 h-3',
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base gap-2',
          icon: 'w-6 h-6',
        };
      case 'md':
      default:
        return {
          container: 'px-3 py-1.5 text-sm gap-1.5',
          icon: 'w-4 h-4',
        };
    }
  };

  const config = getScoreConfig();
  const sizeClasses = getSizeClasses();

  return (
    <div
      className={`inline-flex items-center ${sizeClasses.container} ${config.color} rounded-full border font-medium`}
      title={`Trust Score: ${score}/100 - ${config.label}`}
    >
      <div className={sizeClasses.icon}>
        {config.icon}
      </div>
      {showLabel && (
        <>
          <span className="font-semibold">{score}</span>
          <span className="opacity-75">/100</span>
        </>
      )}
    </div>
  );
};

export default TrustScoreBadge;
