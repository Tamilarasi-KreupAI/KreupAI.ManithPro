import React, { useState, useEffect } from 'react';
import { analyticsService, CandidateMetrics } from '../utils/analyticsService';
import MetricCard from './MetricCard';
import SimpleBarChart from './SimpleBarChart';
import SimpleLineChart from './SimpleLineChart';

const CandidateDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<CandidateMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('last30days');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    setLoading(true);
    const presets = analyticsService.getDateRangePresets();
    const range = presets[dateRange as keyof typeof presets];
    const data = await analyticsService.getCandidateMetrics(range);
    setMetrics(data);
    setLoading(false);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const presets = analyticsService.getDateRangePresets();
      const range = presets[dateRange as keyof typeof presets];

      if (format === 'csv') {
        await analyticsService.exportToCSV('candidate', range);
      } else {
        await analyticsService.exportToPDF('candidate', range);
      }
    } catch (error) {
      alert('Export failed. Please try again.');
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  const applicationsByStatus = [
    { label: 'Pending', value: metrics.applications.pending, color: '#f59e0b' },
    { label: 'Interviewing', value: metrics.applications.interviewing, color: '#8b5cf6' },
    { label: 'Offered', value: metrics.applications.offered, color: '#10b981' },
    { label: 'Rejected', value: metrics.applications.rejected, color: '#ef4444' },
  ];

  const offersByStatus = [
    { label: 'Pending', value: metrics.offers.pending, color: '#f59e0b' },
    { label: 'Accepted', value: metrics.offers.accepted, color: '#10b981' },
    { label: 'Declined', value: metrics.offers.declined, color: '#ef4444' },
  ];

  const successRate = metrics.applications.total > 0
    ? ((metrics.applications.offered / metrics.applications.total) * 100).toFixed(1)
    : 0;

  const interviewRate = metrics.applications.total > 0
    ? ((metrics.applications.interviewing / metrics.applications.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job Search Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your job search progress and performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
          </select>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              disabled={exporting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exporting ? 'Exporting...' : 'Export'}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg dark:text-white"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg dark:text-white"
              >
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Applications"
          value={metrics.applications.total}
          subtitle="Jobs applied to"
          color="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        <MetricCard
          title="Interviews"
          value={metrics.interviews.completed}
          subtitle={`${metrics.interviews.upcoming} upcoming`}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        <MetricCard
          title="Job Offers"
          value={metrics.offers.received}
          subtitle={`${metrics.offers.accepted} accepted`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Profile Views"
          value={metrics.profileMetrics.views}
          subtitle={`${metrics.profileMetrics.saves} saves`}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
      </div>

      {/* Success Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Interview Rate"
          value={`${interviewRate}%`}
          subtitle="Applications to interviews"
          color="purple"
        />
        <MetricCard
          title="Offer Rate"
          value={`${successRate}%`}
          subtitle="Applications to offers"
          color="green"
        />
        <MetricCard
          title="Response Rate"
          value={`${metrics.engagement.responseRate}%`}
          subtitle="Message response rate"
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Applications by Status"
          data={applicationsByStatus}
        />

        <SimpleBarChart
          title="Offers by Status"
          data={offersByStatus}
        />
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Engagement Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Jobs Viewed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.engagement.jobsViewed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Jobs Saved</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.engagement.jobsSaved}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Messages</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.engagement.messagesReceived}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contact Requests</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.profileMetrics.contactRequests}</p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Tips to Improve Your Success Rate
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {interviewRate < 10 && (
            <li className="flex items-center gap-2">
              <span className="text-primary-600 dark:text-primary-400">→</span>
              <span>Complete your profile and add relevant skills to increase interview chances</span>
            </li>
          )}
          {metrics.profileMetrics.views < 50 && (
            <li className="flex items-center gap-2">
              <span className="text-primary-600 dark:text-primary-400">→</span>
              <span>Verify your email and phone to boost profile visibility</span>
            </li>
          )}
          {metrics.engagement.responseRate < 80 && (
            <li className="flex items-center gap-2">
              <span className="text-primary-600 dark:text-primary-400">→</span>
              <span>Respond quickly to messages to improve your response rate</span>
            </li>
          )}
          {metrics.offers.declined > metrics.offers.accepted && (
            <li className="flex items-center gap-2">
              <span className="text-primary-600 dark:text-primary-400">→</span>
              <span>Consider broadening your job search criteria</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CandidateDashboard;
