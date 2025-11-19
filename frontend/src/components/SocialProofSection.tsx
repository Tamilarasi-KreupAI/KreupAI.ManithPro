import React, { useState, useEffect } from 'react';
import VerificationBadge from './VerificationBadge';
import TrustScoreBadge from './TrustScoreBadge';
import { verificationService, UserVerifications } from '../utils/verificationService';
import { referenceService, ReferenceStats } from '../utils/referenceService';
import { metricsService, ResponseMetrics } from '../utils/metricsService';

interface SocialProofSectionProps {
  userId: string;
  isOwnProfile?: boolean;
}

/**
 * Compact social proof section showing all trust signals
 * Can be displayed on profile cards or in sidebars
 */
const SocialProofSection: React.FC<SocialProofSectionProps> = ({
  userId,
  isOwnProfile = false,
}) => {
  const [verifications, setVerifications] = useState<UserVerifications | null>(null);
  const [referenceStats, setReferenceStats] = useState<ReferenceStats | null>(null);
  const [metrics, setMetrics] = useState<ResponseMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialProofData();
  }, [userId]);

  const loadSocialProofData = async () => {
    setLoading(true);

    const [verificationsData, referencesData, metricsData] = await Promise.all([
      verificationService.getUserVerifications(userId),
      referenceService.getReferenceStats(userId),
      metricsService.getUserMetrics(userId),
    ]);

    setVerifications(verificationsData);
    setReferenceStats(referencesData);
    setMetrics(metricsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!verifications || !referenceStats || !metrics) {
    return null;
  }

  const responseRateBadge = metricsService.getResponseRateBadge(metrics.messageResponseRate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Trust & Credibility
        </h3>
        <TrustScoreBadge score={verifications.trustScore} size="md" />
      </div>

      {/* Verification Badges */}
      {(verifications.email.isVerified ||
        verifications.phone.isVerified ||
        verifications.linkedin?.isVerified ||
        verifications.github?.isVerified ||
        verifications.identity?.isVerified) && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Verified
          </div>
          <div className="flex flex-wrap gap-2">
            {verifications.email.isVerified && (
              <VerificationBadge type="EMAIL" isVerified={true} size="sm" showLabel={true} />
            )}
            {verifications.phone.isVerified && (
              <VerificationBadge type="PHONE" isVerified={true} size="sm" showLabel={true} />
            )}
            {verifications.linkedin?.isVerified && (
              <VerificationBadge type="LINKEDIN" isVerified={true} size="sm" showLabel={true} />
            )}
            {verifications.github?.isVerified && (
              <VerificationBadge type="GITHUB" isVerified={true} size="sm" showLabel={true} />
            )}
            {verifications.identity?.isVerified && (
              <VerificationBadge type="IDENTITY" isVerified={true} size="sm" showLabel={true} />
            )}
          </div>
        </div>
      )}

      {/* Key Stats */}
      <div className="space-y-3">
        {/* Response Rate */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${responseRateBadge.color}`}>
              <span className="text-sm">{responseRateBadge.icon}</span>
            </div>
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

        {/* References */}
        {referenceStats.approved > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {referenceStats.approved} Professional {referenceStats.approved === 1 ? 'Reference' : 'References'}
                </div>
                {referenceStats.averageRating > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    {referenceStats.averageRating.toFixed(1)} average rating
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interview Attendance */}
        {metrics.totalInterviewsScheduled > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {metrics.interviewAttendanceRate}% Interview Attendance
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {metrics.totalInterviewsAttended} of {metrics.totalInterviewsScheduled} attended
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Days */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Active {metrics.activeDays} of 30 days
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Last active {metrics.lastActiveAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Building Tips (for own profile only) */}
      {isOwnProfile && verifications.trustScore < 100 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Build more trust:
          </div>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            {!verifications.email.isVerified && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">→</span>
                <span>Verify your email (+20 points)</span>
              </div>
            )}
            {!verifications.phone.isVerified && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">→</span>
                <span>Verify your phone (+20 points)</span>
              </div>
            )}
            {!verifications.linkedin?.isVerified && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">→</span>
                <span>Connect LinkedIn (+15 points)</span>
              </div>
            )}
            {referenceStats.approved === 0 && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">→</span>
                <span>Request professional references</span>
              </div>
            )}
            {metrics.messageResponseRate < 80 && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">→</span>
                <span>Improve response rate to messages</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialProofSection;
