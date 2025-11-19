import React, { useState, useEffect } from 'react';
import { metricsService, ResponseMetrics, ActivityScore } from '../utils/metricsService';

interface ResponseMetricsCardProps {
  userId: string;
  compact?: boolean;
}

const ResponseMetricsCard: React.FC<ResponseMetricsCardProps> = ({
  userId,
  compact = false,
}) => {
  const [metrics, setMetrics] = useState<ResponseMetrics | null>(null);
  const [activityScore, setActivityScore] = useState<ActivityScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [userId]);

  const loadMetrics = async () => {
    setLoading(true);
    const data = await metricsService.getUserMetrics(userId);
    if (data) {
      setMetrics(data);
      setActivityScore(metricsService.calculateActivityScore(data));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics || !activityScore) {
    return null;
  }

  const responseRateBadge = metricsService.getResponseRateBadge(metrics.messageResponseRate);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{responseRateBadge.icon}</span>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {metrics.messageResponseRate}% Response Rate
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Avg {metricsService.formatResponseTime(metrics.averageResponseTime)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Activity & Response Metrics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Performance and engagement statistics
          </p>
        </div>
        <div className={`px-4 py-2 rounded-full border font-medium ${responseRateBadge.color}`}>
          <span className="mr-1">{responseRateBadge.icon}</span>
          {responseRateBadge.label}
        </div>
      </div>

      {/* Activity Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Activity Score</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{activityScore.description}</p>
          </div>
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {Math.round(activityScore.score)}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${activityScore.score}%` }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Message Response Rate */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium text-green-700 dark:text-green-300">Response Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {metrics.messageResponseRate}%
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {metrics.messagesResponded} of {metrics.totalMessages}
          </div>
        </div>

        {/* Average Response Time */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Avg Response</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {metricsService.formatResponseTime(metrics.averageResponseTime)}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Response time
          </div>
        </div>

        {/* Interview Attendance */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Attendance</span>
          </div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {metrics.interviewAttendanceRate}%
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            {metrics.totalInterviewsAttended} of {metrics.totalInterviewsScheduled}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {metrics.activeDays}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Active Days</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">Last 30 days</div>
        </div>

        {metrics.userType === 'RECRUITER' ? (
          <>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {metrics.jobPostsCreated || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Jobs Posted</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {metrics.candidatesContacted || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Contacted</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {metrics.offersExtended || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Offers Sent</div>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {metrics.applicationsSubmitted || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Applications</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {metrics.interviewsCompleted || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Interviews</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {metrics.offersReceived || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Offers</div>
            </div>
          </>
        )}
      </div>

      {/* Last Active */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Last active: {metrics.lastActiveAt.toLocaleDateString()}</span>
          <span>Member since: {metrics.accountCreatedAt.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ResponseMetricsCard;
