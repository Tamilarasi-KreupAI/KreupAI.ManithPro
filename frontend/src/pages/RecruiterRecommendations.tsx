import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Smart Candidate Recommendations</h1>
          <p className="mt-2 text-gray-600">
            AI-powered candidate matching, scoring, and diversity insights
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-4 px-8 text-center border-b-2 font-medium text-sm ${activeTab === 'recommendations'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Candidate Matching
                </div>
              </button>
              <button
                onClick={() => setActiveTab('scoring')}
                className={`py-4 px-8 text-center border-b-2 font-medium text-sm ${activeTab === 'scoring'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Predictive Scoring
                </div>
              </button>
              <button
                onClick={() => setActiveTab('diversity')}
                className={`py-4 px-8 text-center border-b-2 font-medium text-sm ${activeTab === 'diversity'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Diversity Insights
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Candidate Matching Tab */}
            {activeTab === 'recommendations' && (
              <div>
                {/* Job Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Job to Find Matching Candidates
                  </label>
                  <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Job Info */}
                {selectedJobData && (
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedJobData.title}
                    </h3>
                    <p className="text-gray-700 mb-3">{selectedJobData.companyName}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600">📍 {selectedJobData.location}</span>
                      <span className="text-sm text-gray-600">💼 {selectedJobData.type.replace('_', ' ')}</span>
                      {selectedJobData.salaryMin && selectedJobData.salaryMax && (
                        <span className="text-sm text-gray-600">
                          💰 ${selectedJobData.salaryMin.toLocaleString()} - ${selectedJobData.salaryMax.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {selectedJobData.skills && selectedJobData.skills.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedJobData.skills.map((skill: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-white text-primary-700 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommended Candidates */}
                {recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No matching candidates</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try selecting a different job or wait for more candidates to apply
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div
                        key={rec.candidate.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {rec.candidate.firstName} {rec.candidate.lastName}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(rec.matchScore)}`}>
                                {rec.matchScore}% Match
                              </span>
                              {index === 0 && (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                                  ⭐ Top Match
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {rec.candidate.email && (
                                <span className="text-sm text-gray-600">✉️ {rec.candidate.email}</span>
                              )}
                              {rec.candidate.location && (
                                <span className="text-sm text-gray-600">📍 {rec.candidate.location}</span>
                              )}
                              {rec.candidate.experience && (
                                <span className="text-sm text-gray-600">💼 {rec.candidate.experience}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Why this candidate:</h4>
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
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Matching skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.matchedSkills.map((skill: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Bio */}
                        {rec.candidate.bio && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">About:</h4>
                            <p className="text-sm text-gray-600">{rec.candidate.bio}</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                            Invite to Apply
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Predictive Scoring Tab */}
            {activeTab === 'scoring' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate Quality Scoring</h2>
                  <p className="text-gray-600">
                    AI-powered predictive scores based on profile completeness, skills, and engagement
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-sm font-medium opacity-90 mb-2">High Quality</h3>
                    <p className="text-3xl font-bold">
                      {getCandidatesWithScores().filter(c => c.score >= 80).length}
                    </p>
                    <p className="text-sm opacity-75 mt-1">Score: 80-100</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-sm font-medium opacity-90 mb-2">Medium Quality</h3>
                    <p className="text-3xl font-bold">
                      {getCandidatesWithScores().filter(c => c.score >= 60 && c.score < 80).length}
                    </p>
                    <p className="text-sm opacity-75 mt-1">Score: 60-79</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-sm font-medium opacity-90 mb-2">Developing</h3>
                    <p className="text-3xl font-bold">
                      {getCandidatesWithScores().filter(c => c.score < 60).length}
                    </p>
                    <p className="text-sm opacity-75 mt-1">Score: Below 60</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {getCandidatesWithScores().slice(0, 20).map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-600">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {candidate.location && (
                              <span className="text-sm text-gray-600">📍 {candidate.location}</span>
                            )}
                            {candidate.skills && (
                              <span className="text-sm text-gray-600">🎯 {candidate.skills.length} skills</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(candidate.score).split(' ')[0]}`}>
                            {candidate.score}
                          </div>
                          <div className="text-xs text-gray-500">Quality Score</div>
                        </div>
                        <div className={`w-20 h-20 rounded-full ${getScoreColor(candidate.score)} flex items-center justify-center`}>
                          <span className="text-2xl font-bold">{candidate.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diversity Insights Tab */}
            {activeTab === 'diversity' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Diversity & Inclusion Insights</h2>
                  <p className="text-gray-600">
                    Analytics to help build diverse and inclusive teams
                  </p>
                </div>

                {diversityInsights && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="text-sm font-medium opacity-90 mb-2">Total Candidates</h3>
                        <p className="text-3xl font-bold">{diversityInsights.totalCandidates}</p>
                        <p className="text-sm opacity-75 mt-1">In your talent pool</p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="text-sm font-medium opacity-90 mb-2">Location Diversity</h3>
                        <p className="text-3xl font-bold">{diversityInsights.locationDiversity}</p>
                        <p className="text-sm opacity-75 mt-1">Unique locations</p>
                      </div>

                      <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="text-sm font-medium opacity-90 mb-2">Education Diversity</h3>
                        <p className="text-3xl font-bold">{diversityInsights.educationDiversity}</p>
                        <p className="text-sm opacity-75 mt-1">Unique backgrounds</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Recommendations</h3>
                      <div className="space-y-3">
                        {diversityInsights.suggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <svg className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-700">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <svg className="h-6 w-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Best Practices</h4>
                          <ul className="text-sm text-gray-700 space-y-2">
                            <li>• Use blind resume reviews to reduce unconscious bias</li>
                            <li>• Set diversity goals for your hiring pipeline</li>
                            <li>• Partner with organizations that support underrepresented groups</li>
                            <li>• Ensure job descriptions use inclusive language</li>
                            <li>• Track diversity metrics throughout the hiring process</li>
                          </ul>
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
