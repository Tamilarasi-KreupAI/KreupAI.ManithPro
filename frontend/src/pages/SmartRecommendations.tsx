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
    if (score >= 80) return 'text-green-700 bg-green-100 border-green-200';
    if (score >= 60) return 'text-blue-700 bg-blue-100 border-blue-200';
    if (score >= 40) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const getImportanceBadge = (importance: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[importance as keyof typeof colors] || colors.low;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Analyzing your profile and generating recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Smart Recommendations</h1>
          <p className="mt-2 text-slate-500 text-lg">
            AI-powered insights to accelerate your career journey
          </p>
        </div>

        {/* Profile Strength Alert */}
        {user && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-white p-2 rounded-xl shadow-sm">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Improve Your Recommendations
                </h3>
                <p className="text-slate-600 mb-4 font-medium">
                  Complete your profile with skills, experience, and preferences to get better job matches
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 text-sm"
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
          <div className="border-b border-slate-100">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex-1 py-5 text-center border-b-2 font-bold text-sm transition-colors ${activeTab === 'jobs'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Recommended Jobs ({jobRecommendations.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`flex-1 py-5 text-center border-b-2 font-bold text-sm transition-colors ${activeTab === 'skills'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Skill Gaps ({skillGaps.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('career')}
                className={`flex-1 py-5 text-center border-b-2 font-bold text-sm transition-colors ${activeTab === 'career'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Career Path
                </div>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Job Recommendations Tab */}
            {activeTab === 'jobs' && (
              <div>
                {jobRecommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📭</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">No recommendations yet</h3>
                    <p className="mt-1 text-slate-500">
                      Complete your profile to get personalized job recommendations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {jobRecommendations.map((rec, index) => (
                      <div
                        key={rec.job.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {rec.job.title}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getMatchScoreColor(rec.matchScore)}`}>
                                {rec.matchScore}% Match
                              </span>
                              {index === 0 && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                                  <span>⭐</span> Top Pick
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 font-medium mb-3">{rec.job.companyName}</p>
                            <div className="flex flex-wrap gap-3 mb-4">
                              <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-100">📍 {rec.job.location}</span>
                              <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-100">💼 {rec.job.type.replace('_', ' ')}</span>
                              {rec.job.salaryMin && rec.job.salaryMax && (
                                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                                  💰 ${rec.job.salaryMin.toLocaleString()} - ${rec.job.salaryMax.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3 w-full md:w-auto">
                            <Link
                              to={`/jobs/${rec.job.id}`}
                              className="flex-1 md:flex-none text-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/30 hover:-translate-y-0.5"
                            >
                              View Details
                            </Link>
                            <button className="px-4 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-bold">
                              Save
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
                          {/* Match Reasons */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                              <span>🎯</span> Why this matches:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.reasons.map((reason: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                                  ✓ {reason}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Matched Skills */}
                          {rec.matchedSkills.length > 0 && (
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <span>✨</span> Your matching skills:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {rec.matchedSkills.map((skill: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Missing Skills */}
                          {rec.missingSkills.length > 0 && rec.missingSkills.length <= 3 && (
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <span>📚</span> Skills to learn:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {rec.missingSkills.map((skill: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Skill Gap Analysis</h2>
                  <p className="text-slate-500">
                    These skills are in high demand but missing from your profile. Learning them can open new opportunities.
                  </p>
                </div>

                {skillGaps.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🏆</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">Great job!</h3>
                    <p className="mt-1 text-slate-500">
                      Your skills cover most in-demand requirements
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {skillGaps.map((gap, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-slate-900">{gap.skill}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getImportanceBadge(gap.importance)}`}>
                            {gap.importance.toUpperCase()} Priority
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-6 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                          This skill appears in many job listings and could significantly improve your job prospects.
                        </p>

                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>🎓</span> Learning Resources:
                          </h4>
                          {gap.learningResources.map((resource: string, idx: number) => (
                            <a
                              key={idx}
                              href={resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group border border-slate-100 hover:border-blue-100"
                            >
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                {resource.includes('youtube') ? '📺' : '📚'}
                              </div>
                              <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">
                                {resource.includes('udemy') ? 'Udemy Courses' : resource.includes('coursera') ? 'Coursera' : 'YouTube Tutorials'}
                              </span>
                              <span className="ml-auto text-slate-400 group-hover:text-blue-500">→</span>
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
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Career Path Suggestions</h2>
                  <p className="text-slate-500">
                    Explore potential career trajectories and positions that align with your growth
                  </p>
                </div>

                <div className="space-y-8">
                  {careerPaths.map((path, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -z-0 opacity-50" />

                      <div className="relative z-10">
                        <div className="flex items-start gap-6 mb-8">
                          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg shadow-blue-500/30">
                            📈
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                              From {path.currentRole}
                            </h3>
                            <p className="text-slate-500 font-medium">
                              Expected timeframe: <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg ml-2">{path.timeframe}</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Next Roles */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <span>🚀</span> Potential Next Roles
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {path.nextRoles.map((role: string, idx: number) => (
                                <div key={idx} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl font-bold border border-slate-200 shadow-sm">
                                  {role}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Required Skills */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <span>🛠️</span> Skills to Develop
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {path.requiredSkills.map((skill: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Available Positions */}
                        {path.availablePositions > 0 && (
                          <div className="mt-8 bg-green-50 border border-green-100 rounded-xl p-6">
                            <p className="text-green-800 font-bold mb-4 flex items-center gap-2">
                              <span>🎯</span> {path.availablePositions} related positions available now
                            </p>
                            {path.jobs && path.jobs.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {path.jobs.map((job: any) => (
                                  <Link
                                    key={job.id}
                                    to={`/jobs/${job.id}`}
                                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-100 hover:border-green-300 hover:shadow-sm transition-all group"
                                  >
                                    <div>
                                      <div className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">{job.title}</div>
                                      <div className="text-xs text-slate-500 font-medium">{job.companyName}</div>
                                    </div>
                                    <span className="text-slate-300 group-hover:text-green-500 transition-colors">→</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
