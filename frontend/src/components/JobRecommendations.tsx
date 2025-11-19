import React, { useState, useEffect } from 'react';
import { matchingService, JobRecommendation } from '../utils/matchingService';

const JobRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    const data = await matchingService.getJobRecommendations();
    setRecommendations(data);
    setLoading(false);
  };

  const handleJobClick = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
    matchingService.trackRecommendationClick('job', jobId, 'view');
  };

  const handleApply = (jobId: string) => {
    matchingService.trackRecommendationClick('job', jobId, 'apply');
    // Navigate to application page
    window.location.href = `/jobs/${jobId}/apply`;
  };

  const handleDismiss = async (jobId: string) => {
    await matchingService.trackRecommendationClick('job', jobId, 'dismiss');
    setRecommendations(prev => prev.filter(r => r.jobId !== jobId));
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-48"></div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          No recommendations yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete your profile to get personalized job recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Recommended Jobs for You
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {recommendations.length} jobs matched to your profile
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      {recommendations.map((job) => (
        <div
          key={job.jobId}
          className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Job Header */}
          <div
            className="p-6 cursor-pointer"
            onClick={() => handleJobClick(job.jobId)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {job.jobTitle}
                  </h3>
                  {job.isRemote && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      Remote
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {job.company} • {job.location}
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">
                  {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                </p>
              </div>

              {/* Match Score Badge */}
              <div className="text-center">
                <div className={`inline-block px-4 py-2 rounded-full border-2 ${matchingService.getMatchScoreBadgeColor(job.matchScore.overallScore)}`}>
                  <div className="text-2xl font-bold">
                    {job.matchScore.overallScore}%
                  </div>
                  <div className="text-xs">
                    {matchingService.getMatchScoreLabel(job.matchScore.overallScore)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Posted {formatDate(job.postedDate)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {job.experienceLevel}
              </span>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedJob === job.jobId && (
            <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              {/* Match Breakdown */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Match Breakdown
                </h4>
                <div className="space-y-2">
                  {Object.entries(job.matchScore.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-24 capitalize">
                        {key}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-12 text-right">
                        {value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              {job.matchScore.strengths.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Your Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.matchScore.strengths.map((strength, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm rounded-full"
                      >
                        ✓ {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gaps */}
              {job.matchScore.gaps.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Skills to Develop
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.matchScore.gaps.map((gap, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-sm rounded-full"
                      >
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {job.matchScore.recommendations.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 text-sm">
                    💡 Tips to Improve Your Match
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                    {job.matchScore.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(job.jobId);
                  }}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Apply Now
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(job.jobId);
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white font-semibold"
                >
                  Not Interested
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default JobRecommendations;
