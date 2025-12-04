import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationService } from '../services/recommendationService';

const SmartRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobRecommendations, setJobRecommendations] = useState<any[]>([]);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'skills' | 'career'>('jobs');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const [jobs, gaps, paths] = await Promise.all([
        recommendationService.getJobRecommendations(user),
        recommendationService.getSkillGapAnalysis(user),
        recommendationService.getCareerPathSuggestions(user),
      ]);

      setJobRecommendations(jobs);
      setSkillGaps(gaps);
      setCareerPaths(paths);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getImportanceBadge = (importance: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700',
    };
    return colors[importance as keyof typeof colors] || colors.low;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing your profile and generating recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Smart Recommendations</h1>
          <p className="mt-2 text-gray-600">
            AI-powered insights to accelerate your career journey
          </p>
        </div>

        {/* Profile Strength Alert */}
        {user && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Improve Your Recommendations
                </h3>
                <p className="text-gray-700 mb-3">
                  Complete your profile with skills, experience, and preferences to get better job matches
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Update Profile
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-8 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Recommended Jobs ({jobRecommendations.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`py-4 px-8 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'skills'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Skill Gaps ({skillGaps.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('career')}
                className={`py-4 px-8 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'career'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Career Path
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Job Recommendations Tab */}
            {activeTab === 'jobs' && (
              <div>
                {jobRecommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Complete your profile to get personalized job recommendations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobRecommendations.map((rec, index) => (
                      <div
                        key={rec.job.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {rec.job.title}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(rec.matchScore)}`}>
                                {rec.matchScore}% Match
                              </span>
                              {index === 0 && (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                                  ⭐ Top Pick
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{rec.job.companyName}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="text-sm text-gray-600">📍 {rec.job.location}</span>
                              <span className="text-sm text-gray-600">💼 {rec.job.type.replace('_', ' ')}</span>
                              {rec.job.salaryMin && rec.job.salaryMax && (
                                <span className="text-sm text-gray-600">
                                  💰 ${rec.job.salaryMin.toLocaleString()} - ${rec.job.salaryMax.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Why this matches:</h4>
                          <div className="flex flex-wrap gap-2">
                            {rec.reasons.map((reason: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                ✓ {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Matched Skills */}
                        {rec.matchedSkills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Your matching skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.matchedSkills.map((skill: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Skills */}
                        {rec.missingSkills.length > 0 && rec.missingSkills.length <= 3 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills to learn:</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.missingSkills.map((skill: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Link
                            to={`/jobs/${rec.job.id}`}
                            className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            View Details
                          </Link>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Save for Later
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skill Gaps Tab */}
            {activeTab === 'skills' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Skill Gap Analysis</h2>
                  <p className="text-gray-600">
                    These skills are in high demand but missing from your profile. Learning them can open new opportunities.
                  </p>
                </div>

                {skillGaps.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Great job!</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your skills cover most in-demand requirements
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {skillGaps.map((gap, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{gap.skill}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getImportanceBadge(gap.importance)}`}>
                            {gap.importance.toUpperCase()} Priority
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                          This skill appears in many job listings and could significantly improve your job prospects.
                        </p>

                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700">Learning Resources:</h4>
                          {gap.learningResources.map((resource: string, idx: number) => (
                            <a
                              key={idx}
                              href={resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              {resource.includes('udemy') ? 'Udemy Courses' : resource.includes('coursera') ? 'Coursera' : 'YouTube Tutorials'}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Career Path Tab */}
            {activeTab === 'career' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Career Path Suggestions</h2>
                  <p className="text-gray-600">
                    Explore potential career trajectories and positions that align with your growth
                  </p>
                </div>

                <div className="space-y-6">
                  {careerPaths.map((path, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-white to-gray-50">
                      <div className="flex items-start gap-6 mb-6">
                        <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                          📈
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            From {path.currentRole}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            Expected timeframe: <span className="font-semibold">{path.timeframe}</span>
                          </p>
                        </div>
                      </div>

                      {/* Next Roles */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Potential Next Roles:</h4>
                        <div className="flex flex-wrap gap-3">
                          {path.nextRoles.map((role: string, idx: number) => (
                            <div key={idx} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium">
                              {role}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Required Skills */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Skills to Develop:</h4>
                        <div className="flex flex-wrap gap-2">
                          {path.requiredSkills.map((skill: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Available Positions */}
                      {path.availablePositions > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-800 font-medium">
                            🎯 {path.availablePositions} related positions available now
                          </p>
                          {path.jobs && path.jobs.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {path.jobs.map((job: any) => (
                                <Link
                                  key={job.id}
                                  to={`/jobs/${job.id}`}
                                  className="block p-3 bg-white rounded border border-green-200 hover:border-green-300 transition-colors"
                                >
                                  <div className="font-medium text-gray-900">{job.title}</div>
                                  <div className="text-sm text-gray-600">{job.companyName}</div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendations;
