import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'green' | 'red' | 'yellow' | 'purple' | 'blue';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  subtitle,
  icon,
  trend,
  color = 'primary',
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'red':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'yellow':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'primary':
      default:
        return 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800';
    }
  };

  const getIconColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
      case 'red':
        return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400';
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:blue-green-400';
      case 'primary':
      default:
        return 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400';
    }
  };

  const getTrendIcon = () => {
    if (!trend || !change) return null;

    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${getColorClasses()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColorClasses()}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
        {change !== undefined && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' :
              trend === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
