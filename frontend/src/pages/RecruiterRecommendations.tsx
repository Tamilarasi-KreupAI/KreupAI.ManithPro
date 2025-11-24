import React, { useState, useEffect } from 'react';
import { recommendationService } from '../services/recommendationService';
import { jobAPI, applicationAPI } from '../services/api';
import axios from 'axios';

const RecruiterRecommendations: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [diversityInsights, setDiversityInsights] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'scoring' | 'diversity'>('recommendations');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedJob && candidates.length > 0) {
      fetchRecommendations();
    }
  }, [selectedJob, candidates]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [{ jobs: jobsData }, candidatesData, { applications: applicationsData }] = await Promise.all([
        jobAPI.getAll(),
        fetchCandidates(),
        applicationAPI.getAll(),
      ]);

      setJobs(jobsData);
      setCandidates(candidatesData);
      setApplications(applicationsData);

      // Set first job as default
      if (jobsData.length > 0) {
        setSelectedJob(jobsData[0].id);
      }

      // Calculate diversity insights
      const diversity = recommendationService.getDiversityInsights(candidatesData);
      setDiversityInsights(diversity);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.filter((user: any) => user.role === 'CANDIDATE');
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      return [];
    }
  };

  const fetchRecommendations = async () => {
    if (!selectedJob) return;

    try {
      const recs = await recommendationService.getCandidateRecommendations(selectedJob, candidates);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const getCandidatesWithScores = () => {
    return candidates
      .map(candidate => ({
        ...candidate,
        score: recommendationService.calculateCandidateScore(candidate, applications),
      }))
      .sort((a, b) => b.score - a.score);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const selectedJobData = jobs.find(job => job.id === selectedJob);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Smart Candidate Recommendations</h1>
          <p className="mt-2 text-slate-500">
            AI-powered candidate matching, scoring, and diversity insights
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
          <div className="border-b border-slate-100">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium transition-all relative ${activeTab === 'recommendations'
                  ? 'text-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🎯</span>
                  Candidate Matching
                </div>
                {activeTab === 'recommendations' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('scoring')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium transition-all relative ${activeTab === 'scoring'
                  ? 'text-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">📊</span>
                  Predictive Scoring
                </div>
                {activeTab === 'scoring' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('diversity')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium transition-all relative ${activeTab === 'diversity'
                  ? 'text-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🌈</span>
                  Diversity Insights
                </div>
                {activeTab === 'diversity' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Candidate Matching Tab */}
            {activeTab === 'recommendations' && (
              <div className="animate-fadeIn">
                {/* Job Selector */}
                <div className="mb-8 max-w-xl">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Select Job to Find Matching Candidates
                  </label>
                  <div className="relative">
                    <select
                      value={selectedJob}
                      onChange={(e) => setSelectedJob(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white transition-all shadow-sm"
                    >
                      {jobs.map(job => (
                        <option key={job.id} value={job.id}>
                          {job.title} - {job.companyName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Selected Job Info */}
                {selectedJobData && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {selectedJobData.title}
                        </h3>
                        <p className="text-slate-600 font-medium mb-4">{selectedJobData.companyName}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">📍 {selectedJobData.location}</span>
                          <span className="flex items-center gap-1">💼 {selectedJobData.type.replace('_', ' ')}</span>
                          {selectedJobData.salaryMin && selectedJobData.salaryMax && (
                            <span className="flex items-center gap-1">
                              💰 ${selectedJobData.salaryMin.toLocaleString()} - ${selectedJobData.salaryMax.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedJobData.skills && selectedJobData.skills.length > 0 && (
                        <div className="hidden md:block text-right max-w-xs">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</p>
                          <div className="flex flex-wrap justify-end gap-2">
                            {selectedJobData.skills.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2.5 py-1 bg-white text-blue-700 rounded-lg text-xs font-bold shadow-sm border border-blue-100">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommended Candidates */}
                {recommendations.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="text-6xl mb-4 opacity-50">🔍</div>
                    <h3 className="text-lg font-bold text-slate-900">No matching candidates found</h3>
                    <p className="text-slate-500">
                      Try selecting a different job or wait for more candidates to apply
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {recommendations.map((rec, index) => (
                      <div
                        key={rec.candidate.id}
                        className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-0.5 group"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {rec.candidate.firstName} {rec.candidate.lastName}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${rec.matchScore >= 80 ? 'bg-green-50 text-green-700 border-green-100' :
                                rec.matchScore >= 60 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                  'bg-yellow-50 text-yellow-700 border-yellow-100'
                                }`}>
                                {rec.matchScore}% Match
                              </span>
                              {index === 0 && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                                  ⭐ Top Match
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                              {rec.candidate.email && (
                                <span className="flex items-center gap-1">✉️ {rec.candidate.email}</span>
                              )}
                              {rec.candidate.location && (
                                <span className="flex items-center gap-1">📍 {rec.candidate.location}</span>
                              )}
                              {rec.candidate.experience && (
                                <span className="flex items-center gap-1">💼 {rec.candidate.experience}</span>
                              )}
                            </div>

                            {rec.candidate.bio && (
                              <p className="text-slate-600 text-sm leading-relaxed mb-4 max-w-3xl">
                                {rec.candidate.bio}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-3 min-w-[200px]">
                            <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                              Invite to Apply
                            </button>
                            <button className="w-full px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors">
                              View Profile
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                          {/* Match Reasons */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Why this candidate</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.reasons.map((reason: string, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100 flex items-center gap-1.5">
                                  <span className="text-green-500">✓</span> {reason}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Matched Skills */}
                          {rec.matchedSkills.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Matching skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {rec.matchedSkills.map((skill: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
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

            {/* Predictive Scoring Tab */}
            {activeTab === 'scoring' && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Candidate Quality Scoring</h2>
                  <p className="text-slate-500">
                    AI-powered predictive scores based on profile completeness, skills, and engagement
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                    <h3 className="text-sm font-bold opacity-90 mb-2 uppercase tracking-wider">High Quality</h3>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-bold">
                        {getCandidatesWithScores().filter(c => c.score >= 80).length}
                      </p>
                      <p className="text-sm opacity-75 mb-1.5">candidates</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 text-sm font-medium">
                      Score Range: 80-100
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                    <h3 className="text-sm font-bold opacity-90 mb-2 uppercase tracking-wider">Medium Quality</h3>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-bold">
                        {getCandidatesWithScores().filter(c => c.score >= 60 && c.score < 80).length}
                      </p>
                      <p className="text-sm opacity-75 mb-1.5">candidates</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 text-sm font-medium">
                      Score Range: 60-79
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                    <h3 className="text-sm font-bold opacity-90 mb-2 uppercase tracking-wider">Developing</h3>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-bold">
                        {getCandidatesWithScores().filter(c => c.score < 60).length}
                      </p>
                      <p className="text-sm opacity-75 mb-1.5">candidates</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 text-sm font-medium">
                      Score Range: &lt; 60
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {getCandidatesWithScores().slice(0, 20).map((candidate, index) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-6 flex-1">
                          <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {candidate.firstName} {candidate.lastName}
                            </h3>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-500">
                              {candidate.location && (
                                <span className="flex items-center gap-1">📍 {candidate.location}</span>
                              )}
                              {candidate.skills && (
                                <span className="flex items-center gap-1">🎯 {candidate.skills.length} skills</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <div className={`text-2xl font-bold ${getScoreColor(candidate.score).split(' ')[0]}`}>
                              {candidate.score}
                            </div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Score</div>
                          </div>
                          <div className={`w-16 h-16 rounded-2xl ${getScoreColor(candidate.score)} flex items-center justify-center shadow-sm`}>
                            <span className="text-xl font-bold">{candidate.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Diversity Insights Tab */}
            {activeTab === 'diversity' && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Diversity & Inclusion Insights</h2>
                  <p className="text-slate-500">
                    Analytics to help build diverse and inclusive teams
                  </p>
                </div>

                {diversityInsights && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <h3 className="text-sm font-bold opacity-90 mb-2 uppercase tracking-wider">Total Candidates</h3>
                        <p className="text-4xl font-bold">{diversityInsights.totalCandidates}</p>
                        <p className="text-sm opacity-75 mt-1">In your talent pool</p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <h3 className="text-sm font-bold opacity-90 mb-2 uppercase tracking-wider">Location Diversity</h3>
                        <p className="text-4xl font-bold">{diversityInsights.locationDiversity}</p>
                        <p className="text-sm opacity-75 mt-1">Unique locations</p>
                      </div>

                      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <h3 className="text-sm font-bold opacity-90 mb-2 uppercase tracking-wider">Education Diversity</h3>
                        <p className="text-4xl font-bold">{diversityInsights.educationDiversity}</p>
                        <p className="text-sm opacity-75 mt-1">Unique backgrounds</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                          <span className="text-2xl">💡</span> AI Recommendations
                        </h3>
                        <div className="space-y-4">
                          {diversityInsights.suggestions.map((suggestion: string, index: number) => (
                            <div key={index} className="flex items-start gap-4 bg-white/60 p-4 rounded-xl border border-indigo-100/50">
                              <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg flex-shrink-0">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                              <p className="text-indigo-900 font-medium leading-relaxed pt-1">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2">
                          <span className="text-2xl">✨</span> Best Practices
                        </h3>
                        <div className="space-y-4">
                          {[
                            "Use blind resume reviews to reduce unconscious bias",
                            "Set diversity goals for your hiring pipeline",
                            "Partner with organizations that support underrepresented groups",
                            "Ensure job descriptions use inclusive language",
                            "Track diversity metrics throughout the hiring process"
                          ].map((practice, index) => (
                            <div key={index} className="flex items-start gap-4 bg-white/60 p-4 rounded-xl border border-amber-100/50">
                              <div className="bg-amber-100 text-amber-600 p-2 rounded-lg flex-shrink-0">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <p className="text-amber-900 font-medium leading-relaxed pt-1">{practice}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterRecommendations;
