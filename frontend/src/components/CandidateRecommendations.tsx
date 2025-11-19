import React, { useState, useEffect } from 'react';
import { matchingService, CandidateRecommendation } from '../utils/matchingService';
import VerificationBadge from './VerificationBadge';
import TrustScoreBadge from './TrustScoreBadge';

interface CandidateRecommendationsProps {
  jobId: string;
}

const CandidateRecommendations: React.FC<CandidateRecommendationsProps> = ({ jobId }) => {
  const [recommendations, setRecommendations] = useState<CandidateRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good'>('all');

  useEffect(() => {
    loadRecommendations();
  }, [jobId]);

  const loadRecommendations = async () => {
    setLoading(true);
    const data = await matchingService.getCandidateRecommendations(jobId);
    setRecommendations(data);
    setLoading(false);
  };

  const handleCandidateClick = (candidateId: string) => {
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
    matchingService.trackRecommendationClick('candidate', candidateId, 'view');
  };

  const handleContact = (candidateId: string) => {
    matchingService.trackRecommendationClick('candidate', candidateId, 'contact');
    // Navigate to messaging
    window.location.href = `/messages?userId=${candidateId}`;
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const filteredRecommendations = recommendations.filter(candidate => {
    if (filter === 'excellent') return candidate.matchScore.overallScore >= 80;
    if (filter === 'good') return candidate.matchScore.overallScore >= 60 && candidate.matchScore.overallScore < 80;
    return true;
  });

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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          No matching candidates found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your job requirements
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Recommended Candidates
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredRecommendations.length} candidates matched to this job
          </p>
        </div>

        {/* Match Score Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({recommendations.length})
          </button>
          <button
            onClick={() => setFilter('excellent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'excellent'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Excellent (80%+)
          </button>
          <button
            onClick={() => setFilter('good')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'good'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Good (60-79%)
          </button>
        </div>
      </div>

      {/* Candidates List */}
      {filteredRecommendations.map((candidate) => (
        <div
          key={candidate.candidateId}
          className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Candidate Header */}
          <div
            className="p-6 cursor-pointer"
            onClick={() => handleCandidateClick(candidate.candidateId)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar */}
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0">
                  {candidate.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {candidate.name}
                    </h3>
                    {candidate.isVerified && (
                      <VerificationBadge type="EMAIL" isVerified={true} size="sm" />
                    )}
                    <TrustScoreBadge score={candidate.trustScore} size="sm" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {candidate.title} • {candidate.location}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    {formatSalary(candidate.expectedSalary.min, candidate.expectedSalary.max, candidate.expectedSalary.currency)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{candidate.yearsExperience} years experience</span>
                    <span>•</span>
                    <span>{candidate.availability}</span>
                  </div>
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="text-center">
                <div className={`inline-block px-4 py-2 rounded-full border-2 ${matchingService.getMatchScoreBadgeColor(candidate.matchScore.overallScore)}`}>
                  <div className="text-2xl font-bold">
                    {candidate.matchScore.overallScore}%
                  </div>
                  <div className="text-xs">
                    {matchingService.getMatchScoreLabel(candidate.matchScore.overallScore)}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Preview */}
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 5 && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                  +{candidate.skills.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Expanded Details */}
          {expandedCandidate === candidate.candidateId && (
            <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              {/* Match Breakdown */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Match Breakdown
                </h4>
                <div className="space-y-2">
                  {Object.entries(candidate.matchScore.breakdown).map(([key, value]) => (
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
              {candidate.matchScore.strengths.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Key Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.matchScore.strengths.map((strength, idx) => (
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

              {/* All Skills */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  All Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, idx) => (
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
                    handleContact(candidate.candidateId);
                  }}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Candidate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/candidates/${candidate.candidateId}`;
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white font-semibold"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CandidateRecommendations;
