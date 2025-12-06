import React, { useState, useEffect } from 'react';
import {
  LiveCodingSession,
  TakeHomeProject,
  ProjectSubmission,
  ExternalAssessment,
  SoftSkillsAssessment,
  SoftSkillAttempt,
  LanguageProficiencyTest,
  LanguageTestAttempt,
  Batch7AssessmentStats,
  ExternalAssessmentProvider,
} from '../../types';
import {
  liveCodingAPI,
  takeHomeProjectAPI,
  externalAssessmentAPI,
  softSkillsAPI,
  languageTestAPI,
  batch7StatsAPI,
} from '../../services/batch7AssessmentsAPI';

type TabType = 'overview' | 'live-coding' | 'projects' | 'external' | 'soft-skills' | 'language';

const AdvancedAssessmentsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<Batch7AssessmentStats | null>(null);
  const [liveCodingSessions, setLiveCodingSessions] = useState<LiveCodingSession[]>([]);
  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmission[]>([]);
  const [externalAssessments, setExternalAssessments] = useState<ExternalAssessment[]>([]);
  const [softSkillAttempts, setSoftSkillAttempts] = useState<SoftSkillAttempt[]>([]);
  const [languageTestAttempts, setLanguageTestAttempts] = useState<LanguageTestAttempt[]>([]);

  // Available assessments for taking
  const [availableProjects, setAvailableProjects] = useState<TakeHomeProject[]>([]);
  const [availableSoftSkills, setAvailableSoftSkills] = useState<SoftSkillsAssessment[]>([]);
  const [availableLanguageTests, setAvailableLanguageTests] = useState<LanguageProficiencyTest[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        statsData,
        sessionsData,
        submissionsData,
        externalData,
        softSkillData,
        languageData,
        projectsData,
        softSkillsData,
        languageTestsData,
      ] = await Promise.all([
        batch7StatsAPI.getStats(),
        liveCodingAPI.getSessions(),
        takeHomeProjectAPI.getSubmissions(),
        externalAssessmentAPI.getAssessments(),
        softSkillsAPI.getAttempts(),
        languageTestAPI.getAttempts(),
        takeHomeProjectAPI.getProjects({ isActive: true }),
        softSkillsAPI.getAssessments({ isActive: true }),
        languageTestAPI.getTests({ isActive: true }),
      ]);

      setStats(statsData);
      setLiveCodingSessions(sessionsData);
      setProjectSubmissions(submissionsData);
      setExternalAssessments(externalData);
      setSoftSkillAttempts(softSkillData);
      setLanguageTestAttempts(languageData);
      setAvailableProjects(projectsData);
      setAvailableSoftSkills(softSkillsData);
      setAvailableLanguageTests(languageTestsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'live-coding' as TabType, label: 'Live Coding', icon: '💻' },
    { id: 'projects' as TabType, label: 'Take-Home Projects', icon: '📁' },
    { id: 'external' as TabType, label: 'External Assessments', icon: '🔗' },
    { id: 'soft-skills' as TabType, label: 'Soft Skills', icon: '🧠' },
    { id: 'language' as TabType, label: 'Language Tests', icon: '🌐' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      WAITING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      NO_SHOW: 'bg-red-100 text-red-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      SUBMITTED: 'bg-indigo-100 text-indigo-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      REVIEWED: 'bg-green-100 text-green-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProviderInfo = (provider: ExternalAssessmentProvider): { name: string; color: string } => {
    const providers: Record<string, { name: string; color: string }> = {
      HACKERRANK: { name: 'HackerRank', color: 'bg-green-100 text-green-800' },
      CODESIGNAL: { name: 'CodeSignal', color: 'bg-blue-100 text-blue-800' },
      LEETCODE: { name: 'LeetCode', color: 'bg-orange-100 text-orange-800' },
      CODILITY: { name: 'Codility', color: 'bg-purple-100 text-purple-800' },
      TESTGORILLA: { name: 'TestGorilla', color: 'bg-pink-100 text-pink-800' },
      TOGGL_HIRE: { name: 'Toggl Hire', color: 'bg-red-100 text-red-800' },
      OTHER: { name: 'Other', color: 'bg-gray-100 text-gray-800' },
    };
    return providers[provider] || providers.OTHER;
  };

  const getCEFRColor = (level: string): string => {
    const colors: Record<string, string> = {
      A1: 'bg-red-100 text-red-800',
      A2: 'bg-orange-100 text-orange-800',
      B1: 'bg-yellow-100 text-yellow-800',
      B2: 'bg-green-100 text-green-800',
      C1: 'bg-blue-100 text-blue-800',
      C2: 'bg-purple-100 text-purple-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const renderOverview = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Assessment Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Live Coding Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">💻</span>
              <span className="text-xs font-medium text-purple-600 bg-purple-200 px-2 py-1 rounded">Live Coding</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">Total Sessions</span>
                <span className="font-semibold text-purple-900">{stats.liveCoding.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">Completed</span>
                <span className="font-semibold text-purple-900">{stats.liveCoding.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-purple-700">Avg Score</span>
                <span className="font-semibold text-purple-900">{stats.liveCoding.averageScore}%</span>
              </div>
            </div>
          </div>

          {/* Take-Home Projects Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📁</span>
              <span className="text-xs font-medium text-blue-600 bg-blue-200 px-2 py-1 rounded">Projects</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Total Assigned</span>
                <span className="font-semibold text-blue-900">{stats.takeHomeProjects.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Submitted</span>
                <span className="font-semibold text-blue-900">{stats.takeHomeProjects.submitted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Avg Score</span>
                <span className="font-semibold text-blue-900">{stats.takeHomeProjects.averageScore}%</span>
              </div>
            </div>
          </div>

          {/* External Assessments Stats */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🔗</span>
              <span className="text-xs font-medium text-green-600 bg-green-200 px-2 py-1 rounded">External</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Total Linked</span>
                <span className="font-semibold text-green-900">{stats.externalAssessments.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Avg Percentile</span>
                <span className="font-semibold text-green-900">{stats.externalAssessments.averagePercentile}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Platforms</span>
                <span className="font-semibold text-green-900">{Object.keys(stats.externalAssessments.byProvider).length}</span>
              </div>
            </div>
          </div>

          {/* Soft Skills Stats */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🧠</span>
              <span className="text-xs font-medium text-pink-600 bg-pink-200 px-2 py-1 rounded">Soft Skills</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-pink-700">Assessments Taken</span>
                <span className="font-semibold text-pink-900">{stats.softSkills.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-pink-700">Avg Score</span>
                <span className="font-semibold text-pink-900">{stats.softSkills.averageScore}%</span>
              </div>
            </div>
          </div>

          {/* Language Tests Stats */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🌐</span>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-200 px-2 py-1 rounded">Languages</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-indigo-700">Tests Taken</span>
                <span className="font-semibold text-indigo-900">{stats.languageTests.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-indigo-700">Avg Score</span>
                <span className="font-semibold text-indigo-900">{stats.languageTests.averageScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-indigo-700">Highest CEFR</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${stats.languageTests.highestCEFR ? getCEFRColor(stats.languageTests.highestCEFR) : 'bg-gray-100 text-gray-600'}`}>
                  {stats.languageTests.highestCEFR || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        {liveCodingSessions.filter(s => s.status === 'SCHEDULED').length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-3">Upcoming Live Coding Sessions</h4>
            <div className="space-y-2">
              {liveCodingSessions.filter(s => s.status === 'SCHEDULED').slice(0, 3).map(session => (
                <div key={session.id} className="flex items-center justify-between bg-white rounded p-3 border border-yellow-100">
                  <div>
                    <p className="font-medium text-gray-900">{session.title}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(session.scheduledAt)}</p>
                  </div>
                  <button className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600">
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLiveCoding = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Live Coding Sessions</h3>
      </div>

      {liveCodingSessions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-4xl mb-3 block">💻</span>
          <p className="text-gray-500">No live coding sessions scheduled</p>
          <p className="text-sm text-gray-400 mt-1">Sessions will appear here when recruiters schedule them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {liveCodingSessions.map(session => (
            <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{session.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status.replace('_', ' ')}
                    </span>
                  </div>
                  {session.description && (
                    <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📅 {formatDateTime(session.scheduledAt)}</span>
                    <span>⏱️ {session.durationMinutes} min</span>
                    <span>🔧 {session.programmingLanguage}</span>
                    <span className="capitalize">📈 {session.difficultyLevel.toLowerCase()}</span>
                  </div>
                  {session.score !== undefined && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm text-green-700">Score</span>
                          <p className="text-2xl font-bold text-green-800">{session.score}%</p>
                        </div>
                        {session.codeQualityScore && (
                          <div className="text-sm">
                            <p className="text-gray-600">Code Quality: {session.codeQualityScore}%</p>
                            <p className="text-gray-600">Problem Solving: {session.problemSolvingScore}%</p>
                          </div>
                        )}
                      </div>
                      {session.feedback && (
                        <p className="mt-2 text-sm text-green-700 italic">"{session.feedback}"</p>
                      )}
                    </div>
                  )}
                </div>
                {session.status === 'SCHEDULED' && (
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Join Session
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Take-Home Projects</h3>
      </div>

      {/* Available Projects */}
      {availableProjects.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Available Projects</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableProjects.map(project => (
              <div key={project.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900">{project.title}</h5>
                <p className="text-sm text-blue-700 mt-1 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.techStack.slice(0, 4).map((tech, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 text-sm text-blue-600">
                  <span>⏱️ ~{project.estimatedHours}h</span>
                  <span className="capitalize">📈 {project.difficultyLevel.toLowerCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Submissions */}
      <h4 className="text-md font-medium text-gray-700 mb-3">My Submissions</h4>
      {projectSubmissions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-4xl mb-3 block">📁</span>
          <p className="text-gray-500">No project submissions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projectSubmissions.map(submission => (
            <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-medium text-gray-900">{submission.project?.title}</h5>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📅 Deadline: {formatDateTime(submission.deadline)}</span>
                    {submission.startedAt && <span>🚀 Started: {formatDate(submission.startedAt)}</span>}
                    {submission.submittedAt && <span>✅ Submitted: {formatDate(submission.submittedAt)}</span>}
                  </div>
                  {submission.repositoryUrl && (
                    <a href={submission.repositoryUrl} target="_blank" rel="noopener noreferrer"
                       className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                      View Repository →
                    </a>
                  )}
                  {submission.overallScore !== undefined && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm text-green-700">Overall Score</span>
                          <p className="text-2xl font-bold text-green-800">{submission.overallScore}%</p>
                        </div>
                        {submission.strengths && submission.strengths.length > 0 && (
                          <div className="text-sm">
                            <p className="text-gray-600 font-medium">Strengths:</p>
                            <ul className="list-disc list-inside text-green-700">
                              {submission.strengths.slice(0, 2).map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {submission.feedback && (
                        <p className="mt-2 text-sm text-gray-600">{submission.feedback}</p>
                      )}
                    </div>
                  )}
                </div>
                {submission.status === 'ASSIGNED' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Start Project
                  </button>
                )}
                {submission.status === 'IN_PROGRESS' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Submit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderExternalAssessments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">External Assessments</h3>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
          + Link Assessment
        </button>
      </div>

      {/* Connect Platforms */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Connect Your Platforms</h4>
        <div className="flex flex-wrap gap-3">
          {['HACKERRANK', 'CODESIGNAL', 'LEETCODE', 'CODILITY'].map(provider => {
            const info = getProviderInfo(provider as ExternalAssessmentProvider);
            return (
              <button key={provider} className={`px-4 py-2 rounded-lg text-sm font-medium ${info.color} hover:opacity-80 transition-opacity`}>
                Connect {info.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Linked Assessments */}
      {externalAssessments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-4xl mb-3 block">🔗</span>
          <p className="text-gray-500">No external assessments linked</p>
          <p className="text-sm text-gray-400 mt-1">Connect your HackerRank, CodeSignal, or other accounts to showcase your scores</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {externalAssessments.map(assessment => {
            const providerInfo = getProviderInfo(assessment.provider);
            return (
              <div key={assessment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${providerInfo.color}`}>
                      {providerInfo.name}
                    </span>
                    <h5 className="font-medium text-gray-900 mt-1">{assessment.assessmentName}</h5>
                  </div>
                  {assessment.isVerified && (
                    <span className="text-green-600" title="Verified">✓</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {assessment.score}
                  </span>
                  {assessment.maxScore && (
                    <span className="text-gray-500">/ {assessment.maxScore}</span>
                  )}
                  {assessment.percentile && (
                    <span className="text-sm text-green-600 ml-2">Top {100 - assessment.percentile}%</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {assessment.skills.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  Completed: {formatDate(assessment.completedAt)}
                  {assessment.certificateUrl && (
                    <a href={assessment.certificateUrl} target="_blank" rel="noopener noreferrer"
                       className="ml-2 text-blue-600 hover:underline">
                      View Certificate →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSoftSkills = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Soft Skills Assessments</h3>
      </div>

      {/* Available Assessments */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Available Assessments</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableSoftSkills.map(assessment => (
            <div key={assessment.id} className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-pink-100 text-pink-800 text-xs rounded capitalize">
                  {assessment.category.toLowerCase().replace('_', ' ')}
                </span>
                <span className="text-sm text-pink-600">~{assessment.estimatedMinutes} min</span>
              </div>
              <h5 className="font-medium text-pink-900">{assessment.title}</h5>
              {assessment.description && (
                <p className="text-sm text-pink-700 mt-1 line-clamp-2">{assessment.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-pink-600">{assessment._count?.questions} questions</span>
                <button className="px-3 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-700">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Assessments */}
      <h4 className="text-md font-medium text-gray-700 mb-3">My Results</h4>
      {softSkillAttempts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-4xl mb-3 block">🧠</span>
          <p className="text-gray-500">No soft skills assessments completed yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {softSkillAttempts.map(attempt => (
            <div key={attempt.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{attempt.assessment?.title}</h5>
                  <span className="text-sm text-gray-500 capitalize">
                    {attempt.assessment?.category?.toLowerCase().replace('_', ' ')}
                  </span>
                  <div className="mt-3 flex items-center gap-6">
                    <div>
                      <span className="text-sm text-gray-500">Overall Score</span>
                      <p className="text-2xl font-bold text-pink-600">{attempt.overallScore}%</p>
                    </div>
                    {attempt.traitScores && (
                      <div className="flex-1">
                        <span className="text-sm text-gray-500">Trait Scores</span>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {Object.entries(attempt.traitScores).slice(0, 4).map(([trait, score]) => (
                            <div key={trait} className="text-sm">
                              <span className="text-gray-600">{trait}:</span>
                              <span className="font-medium ml-1">{score}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {attempt.insights && attempt.insights.length > 0 && (
                    <div className="mt-3 p-3 bg-pink-50 rounded">
                      <p className="text-sm font-medium text-pink-800">Insights:</p>
                      <ul className="list-disc list-inside text-sm text-pink-700 mt-1">
                        {attempt.insights.map((insight, idx) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-500">{formatDate(attempt.completedAt!)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLanguageTests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Language Proficiency Tests</h3>
      </div>

      {/* Available Tests */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Available Tests</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableLanguageTests.map(test => (
            <div key={test.id} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded">
                  {test.language}
                </span>
                <span className="text-sm text-indigo-600 capitalize">{test.testType.toLowerCase()}</span>
              </div>
              <h5 className="font-medium text-indigo-900">{test.title}</h5>
              {test.description && (
                <p className="text-sm text-indigo-700 mt-1 line-clamp-2">{test.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-indigo-600">
                  <span>{test._count?.questions} questions</span>
                  <span className="mx-2">•</span>
                  <span>~{test.estimatedMinutes} min</span>
                </div>
                <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Tests */}
      <h4 className="text-md font-medium text-gray-700 mb-3">My Results</h4>
      {languageTestAttempts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-4xl mb-3 block">🌐</span>
          <p className="text-gray-500">No language tests completed yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {languageTestAttempts.map(attempt => (
            <div key={attempt.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-gray-900">{attempt.test?.title}</h5>
                    {attempt.cefrLevel && (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getCEFRColor(attempt.cefrLevel)}`}>
                        {attempt.cefrLevel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{attempt.test?.language}</span>
                    <span>•</span>
                    <span className="capitalize">{attempt.test?.testType?.toLowerCase()}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-6">
                    <div>
                      <span className="text-sm text-gray-500">Score</span>
                      <p className="text-2xl font-bold text-indigo-600">{attempt.score}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Correct Answers</span>
                      <p className="text-lg font-medium text-gray-800">
                        {attempt.correctAnswers} / {attempt.totalQuestions}
                      </p>
                    </div>
                    {attempt.sectionScores && (
                      <div className="flex-1">
                        <span className="text-sm text-gray-500">Section Breakdown</span>
                        <div className="flex gap-4 mt-1">
                          {Object.entries(attempt.sectionScores).map(([section, data]) => (
                            <div key={section} className="text-sm">
                              <span className="text-gray-600 capitalize">{section.toLowerCase()}:</span>
                              <span className="font-medium ml-1">{data.correct}/{data.total}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{formatDate(attempt.completedAt!)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading assessments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading assessments</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadData} className="mt-2 text-sm underline hover:no-underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-900">Advanced Assessments</h2>
        <p className="text-sm text-gray-500 mt-1">
          Showcase your skills through live coding, take-home projects, and certified assessments
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto px-4" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'live-coding' && renderLiveCoding()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'external' && renderExternalAssessments()}
        {activeTab === 'soft-skills' && renderSoftSkills()}
        {activeTab === 'language' && renderLanguageTests()}
      </div>
    </div>
  );
};

export default AdvancedAssessmentsHub;
