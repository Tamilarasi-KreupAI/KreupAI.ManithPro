import React, { useState, useEffect } from 'react';
import { matchingService } from '../utils/matchingService';
import SimpleLineChart from './SimpleLineChart';

interface SalaryInsightsProps {
  jobTitle: string;
  location?: string;
  yearsExperience?: number;
  currentSalary?: number;
  currency?: string;
}

interface SalaryData {
  jobTitle: string;
  location: string;
  currency: string;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  average: number;
  sampleSize: number;
  lastUpdated: string;
  trend: {
    period: string;
    data: { label: string; value: number }[];
  };
  factors: {
    name: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
    salaryIncrease: string;
  }[];
  negotiationTips: string[];
}

const SalaryInsights: React.FC<SalaryInsightsProps> = ({
  jobTitle,
  location,
  yearsExperience,
  currentSalary,
  currency = 'USD',
}) => {
  const [data, setData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparisonSalary, setComparisonSalary] = useState<number | undefined>(currentSalary);

  useEffect(() => {
    loadSalaryData();
  }, [jobTitle, location, yearsExperience]);

  const loadSalaryData = async () => {
    setLoading(true);
    try {
      const result = await matchingService.getSalaryInsights(jobTitle, location, yearsExperience);
      setData(result);
    } catch (error) {
      console.error('Failed to load salary insights:', error);
    }
    setLoading(false);
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPercentilePosition = (salary: number): number => {
    if (!data) return 0;
    const { p10, p90 } = data.percentiles;
    const range = p90 - p10;
    const position = ((salary - p10) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const getPercentileLabel = (salary: number): string => {
    if (!data) return '';
    const { p10, p25, p50, p75, p90 } = data.percentiles;

    if (salary < p10) return 'Below 10th percentile';
    if (salary < p25) return 'Between 10th-25th percentile';
    if (salary < p50) return 'Between 25th-50th percentile';
    if (salary < p75) return 'Between 50th-75th percentile';
    if (salary < p90) return 'Between 75th-90th percentile';
    return 'Above 90th percentile';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Failed to load salary insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Salary Insights: {data.jobTitle}
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{data.location}</span>
          <span>•</span>
          <span>Based on {data.sampleSize.toLocaleString()} salaries</span>
          <span>•</span>
          <span>Updated {data.lastUpdated}</span>
        </div>
      </div>

      {/* Salary Comparison Tool */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Compare Your Salary
        </h3>
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter your current or expected salary
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {currency === 'USD' ? '$' : currency}
              </span>
              <input
                type="number"
                value={comparisonSalary || ''}
                onChange={(e) => setComparisonSalary(Number(e.target.value))}
                placeholder="e.g., 75000"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={() => setComparisonSalary(data.percentiles.p50)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
          >
            Use Median
          </button>
        </div>

        {comparisonSalary && comparisonSalary > 0 && (
          <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Salary Position
              </p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatSalary(comparisonSalary)}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {getPercentileLabel(comparisonSalary)}
            </p>
            <div className="relative">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: '100%' }}
                />
              </div>
              <div
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${getPercentilePosition(comparisonSalary)}%` }}
              >
                <div className="relative">
                  <div className="w-4 h-4 bg-white dark:bg-gray-800 border-2 border-primary-600 dark:border-primary-400 rounded-full"></div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs">
                    You
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Percentile Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Salary Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: '10th', value: data.percentiles.p10, color: 'red' },
            { label: '25th', value: data.percentiles.p25, color: 'orange' },
            { label: '50th (Median)', value: data.percentiles.p50, color: 'yellow' },
            { label: '75th', value: data.percentiles.p75, color: 'lime' },
            { label: '90th', value: data.percentiles.p90, color: 'green' },
          ].map((percentile) => (
            <div key={percentile.label} className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {percentile.label}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatSalary(percentile.value)}
              </p>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Salary</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatSalary(data.average)}
          </p>
        </div>
      </div>

      {/* Salary Trend */}
      {data.trend && data.trend.data.length > 0 && (
        <SimpleLineChart
          title={`Salary Trend - ${data.trend.period}`}
          data={data.trend.data}
          color="#3b82f6"
          fillArea={true}
        />
      )}

      {/* Factors Affecting Salary */}
      {data.factors && data.factors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Factors That Can Increase Your Salary
          </h3>
          <div className="space-y-4">
            {data.factors.map((factor, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex-shrink-0">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getImpactColor(factor.impact)}`}>
                    {factor.impact.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {factor.name}
                    </h4>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      +{factor.salaryIncrease}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Negotiation Tips */}
      {data.negotiationTips && data.negotiationTips.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 p-6">
          <div className="flex items-start gap-3 mb-4">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Salary Negotiation Tips
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Use these insights to negotiate a competitive salary
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {data.negotiationTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
              About This Data
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              Salary estimates are based on anonymous submissions and may vary based on company size, industry,
              specific skills, and other factors. Use this as a general guideline, not an exact figure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryInsights;
