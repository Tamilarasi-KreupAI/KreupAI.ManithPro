import React, { useState, useEffect } from 'react';
import { analyticsService, RecruiterMetrics, DateRange } from '../utils/analyticsService';
import MetricCard from './MetricCard';
import SimpleBarChart from './SimpleBarChart';
import SimpleLineChart from './SimpleLineChart';

const RecruiterDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RecruiterMetrics | null>(null);
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
    const data = await analyticsService.getRecruiterMetrics(range);
    setMetrics(data);
    setLoading(false);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const presets = analyticsService.getDateRangePresets();
      const range = presets[dateRange as keyof typeof presets];

      if (format === 'csv') {
        await analyticsService.exportToCSV('recruiter', range);
      } else {
        await analyticsService.exportToPDF('recruiter', range);
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
    { label: 'Reviewed', value: metrics.applications.reviewed, color: '#3b82f6' },
    { label: 'Shortlisted', value: metrics.applications.shortlisted, color: '#10b981' },
    { label: 'Rejected', value: metrics.applications.rejected, color: '#ef4444' },
  ];

  const interviewsByStatus = [
    { label: 'Scheduled', value: metrics.interviews.scheduled, color: '#8b5cf6' },
    { label: 'Completed', value: metrics.interviews.completed, color: '#10b981' },
    { label: 'Cancelled', value: metrics.interviews.cancelled, color: '#ef4444' },
    { label: 'No Show', value: metrics.interviews.noShow, color: '#6b7280' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Recruiter Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your hiring performance and metrics
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
          title="Active Jobs"
          value={metrics.jobPostings.active}
          subtitle={`${metrics.jobPostings.total} total`}
          color="primary"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <MetricCard
          title="Total Applications"
          value={metrics.applications.total}
          subtitle={`${metrics.applications.shortlisted} shortlisted`}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        <MetricCard
          title="Interviews"
          value={metrics.interviews.completed}
          subtitle={`${metrics.interviews.scheduled} scheduled`}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        <MetricCard
          title="Total Hires"
          value={metrics.hires.total}
          subtitle={`${metrics.hires.accepted} accepted`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Avg Time to Hire"
          value={`${metrics.timeMetrics.avgTimeToHire} days`}
          subtitle="From posting to offer"
          color="yellow"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${metrics.timeMetrics.avgTimeToFirstResponse}h`}
          subtitle="First response to candidates"
          color="blue"
        />
        <MetricCard
          title="Interviews per Hire"
          value={metrics.timeMetrics.avgInterviewsPerHire.toFixed(1)}
          subtitle="Average efficiency"
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          title="Applications by Status"
          data={applicationsByStatus}
        />

        <SimpleBarChart
          title="Interviews by Status"
          data={interviewsByStatus}
        />
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Engagement Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profile Views</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.engagement.profileViews}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Messages Sent</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.engagement.messagesSent}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Messages Received</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.engagement.messagesReceived}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Response Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.engagement.responseRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
