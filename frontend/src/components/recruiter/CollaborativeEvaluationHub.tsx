import React, { useState, useEffect } from 'react';
import {
  scorecardTemplatesAPI,
  interviewFeedbackAPI,
  blindEvaluationAPI,
  feedbackAggregationAPI,
  calibrationSessionsAPI,
  decisionVotingAPI,
  evaluationDeadlinesAPI,
  disagreementResolutionAPI,
  historicalComparisonAPI,
  evaluationStatsAPI,
} from '../../services/batch25CollaborativeEvaluationAPI';
import type {
  ScorecardTemplate,
  InterviewFeedback,
  BlindEvaluationConfig,
  FeedbackAggregation,
  CalibrationSession,
  VotingRoundSummary,
  HiringDecisionVote,
  EvaluationDeadline,
  DeadlineInstance,
  EvaluationDisagreement,
  CandidateComparison,
  HiringBenchmark,
  CollaborativeEvaluationStats,
} from '../../types';

type TabType = 'overview' | 'scorecards' | 'feedback' | 'blind' | 'aggregation' | 'calibration' | 'voting' | 'deadlines' | 'disagreements' | 'comparison';

const CollaborativeEvaluationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<CollaborativeEvaluationStats | null>(null);
  const [scorecardTemplates, setScorecardTemplates] = useState<ScorecardTemplate[]>([]);
  const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([]);
  const [blindConfig, setBlindConfig] = useState<BlindEvaluationConfig | null>(null);
  const [aggregations, setAggregations] = useState<FeedbackAggregation[]>([]);
  const [calibrationSessions, setCalibrationSessions] = useState<CalibrationSession[]>([]);
  const [votingRounds, setVotingRounds] = useState<VotingRoundSummary[]>([]);
  const [votes, setVotes] = useState<HiringDecisionVote[]>([]);
  const [deadlines, setDeadlines] = useState<EvaluationDeadline[]>([]);
  const [deadlineInstances, setDeadlineInstances] = useState<DeadlineInstance[]>([]);
  const [disagreements, setDisagreements] = useState<EvaluationDisagreement[]>([]);
  const [comparisons, setComparisons] = useState<CandidateComparison[]>([]);
  const [benchmarks, setBenchmarks] = useState<HiringBenchmark[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'overview':
          const statsData = await evaluationStatsAPI.getStats();
          setStats(statsData);
          break;
        case 'scorecards':
          const templates = await scorecardTemplatesAPI.getAll();
          setScorecardTemplates(templates);
          break;
        case 'feedback':
          const feedbackData = await interviewFeedbackAPI.getAll();
          setFeedbacks(feedbackData);
          break;
        case 'blind':
          const config = await blindEvaluationAPI.getConfig('job-1');
          setBlindConfig(config);
          break;
        case 'aggregation':
          const aggData = await feedbackAggregationAPI.getAll();
          setAggregations(aggData);
          break;
        case 'calibration':
          const sessions = await calibrationSessionsAPI.getAll();
          setCalibrationSessions(sessions);
          break;
        case 'voting':
          const [rounds, votesData] = await Promise.all([
            decisionVotingAPI.getRoundSummary('vr-1').then(r => [r]).catch(() => []),
            decisionVotingAPI.getVotes(),
          ]);
          setVotingRounds(rounds as VotingRoundSummary[]);
          setVotes(votesData);
          break;
        case 'deadlines':
          const [dlData, instances] = await Promise.all([
            evaluationDeadlinesAPI.getAll(),
            evaluationDeadlinesAPI.getInstances(),
          ]);
          setDeadlines(dlData);
          setDeadlineInstances(instances);
          break;
        case 'disagreements':
          const disData = await disagreementResolutionAPI.getAll();
          setDisagreements(disData);
          break;
        case 'comparison':
          const [compData, benchData] = await Promise.all([
            historicalComparisonAPI.getComparisons(),
            historicalComparisonAPI.getBenchmarks(),
          ]);
          setComparisons(compData);
          setBenchmarks(benchData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'scorecards', label: 'Scorecards', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'feedback', label: 'Feedback', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
    { id: 'blind', label: 'Blind Mode', icon: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' },
    { id: 'aggregation', label: 'Aggregation', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'calibration', label: 'Calibration', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    { id: 'voting', label: 'Voting', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'deadlines', label: 'Deadlines', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'disagreements', label: 'Disagreements', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'comparison', label: 'Comparison', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Collaborative Evaluation Overview</h3>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Scorecard Templates</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scorecardTemplates}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Feedbacks Submitted</div>
            <div className="text-2xl font-bold text-blue-600">{stats.feedbacksSubmitted}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Calibration Sessions</div>
            <div className="text-2xl font-bold text-purple-600">{stats.calibrationSessions}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Voting Rounds</div>
            <div className="text-2xl font-bold text-green-600">{stats.votingRounds}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Aggregations Created</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.aggregationsCreated}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Open Disagreements</div>
            <div className="text-2xl font-bold text-red-600">{stats.disagreements.open}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Candidate Comparisons</div>
            <div className="text-2xl font-bold text-orange-600">{stats.candidateComparisons}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Feedback Time</div>
            <div className="text-2xl font-bold text-teal-600">{stats.avgFeedbackTimeMinutes} min</div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('scorecards')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">Create Scorecard</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Design evaluation criteria</div>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">Submit Feedback</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Rate interview performance</div>
          </button>
          <button
            onClick={() => setActiveTab('calibration')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">Schedule Calibration</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Align team evaluations</div>
          </button>
          <button
            onClick={() => setActiveTab('voting')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">Start Voting</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Make hiring decisions</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderScorecards = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scorecard Templates</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Template
        </button>
      </div>

      <div className="grid gap-4">
        {scorecardTemplates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                template.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Stage:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{template.interviewStage}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Criteria:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{template.criteria.length}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Scale:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{template.ratingScale.min}-{template.ratingScale.max}</span>
              </div>
              {template.passingThreshold && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Pass:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{template.passingThreshold}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Evaluation Criteria:</div>
              <div className="flex flex-wrap gap-2">
                {template.criteria.slice(0, 5).map((criterion) => (
                  <span
                    key={criterion.id}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                  >
                    {criterion.name} ({criterion.weight}%)
                  </span>
                ))}
                {template.criteria.length > 5 && (
                  <span className="px-2 py-1 text-gray-500 text-xs">
                    +{template.criteria.length - 5} more
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Edit
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400">
                Clone
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400">
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interview Feedback</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          New Feedback
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Evaluator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Application</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Recommendation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {feedbacks.map((feedback) => (
              <tr key={feedback.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{feedback.evaluatorName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {feedback.applicationId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{feedback.overallScore?.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/5</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    feedback.recommendation.includes('HIRE') && !feedback.recommendation.includes('NO')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : feedback.recommendation.includes('NO_HIRE')
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {feedback.recommendation.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    feedback.status === 'SUBMITTED'
                      ? 'bg-green-100 text-green-800'
                      : feedback.status === 'DRAFT'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {feedback.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-700 mr-3">View</button>
                  <button className="text-gray-600 hover:text-gray-700">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBlindMode = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blind Evaluation Mode</h3>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Current Configuration</h4>

        {blindConfig ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={blindConfig.anonymizeNames}
                  readOnly
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Anonymize Names</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={blindConfig.hidePhotos}
                  readOnly
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Hide Photos</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={blindConfig.hideCompanyNames}
                  readOnly
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Hide Company Names</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={blindConfig.hideEducationInstitutions}
                  readOnly
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Hide Institutions</label>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hidden Fields:</div>
              <div className="flex flex-wrap gap-2">
                {blindConfig.hiddenFields.map((field, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reveal Stage:</div>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
                {blindConfig.revealStage || 'Never'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            No blind evaluation configured for this job.
            <button className="ml-2 text-blue-600 hover:text-blue-700">Configure Now</button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Benefits of Blind Evaluation</h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2 text-green-500">+</span>
            Reduces unconscious bias in hiring decisions
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-500">+</span>
            Focuses evaluation on skills and qualifications
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-500">+</span>
            Promotes diversity and inclusion
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-500">+</span>
            Ensures fair treatment of all candidates
          </li>
        </ul>
      </div>
    </div>
  );

  const renderAggregation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback Aggregation</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Aggregation
        </button>
      </div>

      {aggregations.map((agg) => (
        <div key={agg.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Application: {agg.applicationId}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {agg.feedbackCount} feedbacks aggregated | Stage: {agg.interviewStage}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{agg.consensusRating?.toFixed(1)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Consensus Rating</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score Breakdown</h5>
              <div className="space-y-2">
                {agg.aggregatedScores.slice(0, 5).map((score) => (
                  <div key={score.criteriaId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{score.criteriaName}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(score.average / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                        {score.average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendation Breakdown</h5>
              <div className="space-y-1">
                {Object.entries(agg.recommendationBreakdown).filter(([, count]) => count > 0).map(([rec, count]) => (
                  <div key={rec} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{rec.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Strengths</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {agg.strengthsSummary.slice(0, 3).map((s, i) => (
                  <li key={i}>+ {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Areas for Improvement</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {agg.weaknessesSummary.slice(0, 3).map((w, i) => (
                  <li key={i}>- {w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCalibration = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calibration Sessions</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Schedule Session
        </button>
      </div>

      {calibrationSessions.map((session) => (
        <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{session.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{session.description}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              session.status === 'COMPLETED'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : session.status === 'IN_PROGRESS'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : session.status === 'SCHEDULED'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {session.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Date:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(session.scheduledDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{session.targetDuration} min</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Participants:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{session.participants.length}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Candidates:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{session.applicationIds.length}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants:</div>
            <div className="flex flex-wrap gap-2">
              {session.participants.map((p) => (
                <span
                  key={p.userId}
                  className={`px-2 py-1 text-xs rounded ${
                    p.attended
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {p.name} ({p.role})
                </span>
              ))}
            </div>
          </div>

          {session.outcomes && session.outcomes.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Outcomes:</div>
              <div className="space-y-2">
                {session.outcomes.map((outcome, idx) => (
                  <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                    {outcome.applicationId}: {outcome.originalRating} → {outcome.adjustedRating}
                    <span className="text-gray-500 ml-2">({outcome.adjustmentReason})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderVoting = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hiring Decision Voting</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Start Voting Round
        </button>
      </div>

      {votingRounds.map((round) => (
        <div key={round.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Round {round.roundNumber} - {round.applicationId}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Type: {round.votingType.replace(/_/g, ' ')}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              round.status === 'CLOSED'
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                : round.status === 'OPEN'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {round.status}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {round.votesReceived}/{round.totalVoters}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Votes Received</div>
            </div>
            {round.voteBreakdown && (
              <>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{round.voteBreakdown.HIRE || 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Hire</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{round.voteBreakdown.NO_HIRE || 0}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">No Hire</div>
                </div>
              </>
            )}
          </div>

          {round.finalDecision && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Final Decision: </span>
              <span className={`font-bold ${
                round.finalDecision === 'HIRE' ? 'text-green-600' : 'text-red-600'
              }`}>
                {round.finalDecision}
              </span>
              {round.decisionNotes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{round.decisionNotes}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Individual Votes:</div>
            {votes.filter(v => v.votingRoundId === round.id).map((vote) => (
              <div key={vote.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{vote.voterName}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                    vote.decision === 'HIRE'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : vote.decision === 'NO_HIRE'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {vote.decision}
                  </span>
                </div>
                {vote.confidence && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {vote.confidence}% confident
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderDeadlines = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evaluation Deadlines</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Deadline
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Deadline Rules</h4>
          <div className="space-y-4">
            {deadlines.map((deadline) => (
              <div key={deadline.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{deadline.name}</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{deadline.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    deadline.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {deadline.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {deadline.daysFromTrigger} days after {deadline.triggerEvent.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Active Instances</h4>
          <div className="space-y-4">
            {deadlineInstances.map((instance) => (
              <div key={instance.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 ${
                instance.status === 'OVERDUE'
                  ? 'border-red-500'
                  : instance.status === 'COMPLETED'
                  ? 'border-green-500'
                  : 'border-yellow-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{instance.assigneeName}</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Application: {instance.applicationId}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    instance.status === 'OVERDUE'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : instance.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {instance.status}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Due: {new Date(instance.dueDate).toLocaleDateString()}
                  </span>
                  {instance.remindersSent && instance.remindersSent > 0 && (
                    <span className="text-orange-600">
                      {instance.remindersSent} reminder(s) sent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisagreements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Disagreement Resolution</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Flag Disagreement
        </button>
      </div>

      <div className="space-y-4">
        {disagreements.map((dis) => (
          <div key={dis.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${
            dis.status === 'OPEN'
              ? 'border-red-500'
              : dis.status === 'RESOLVED'
              ? 'border-green-500'
              : dis.status === 'ESCALATED'
              ? 'border-orange-500'
              : 'border-gray-500'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {dis.disagreementType.replace(/_/g, ' ')}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    dis.status === 'OPEN'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : dis.status === 'RESOLVED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : dis.status === 'ESCALATED'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {dis.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Application: {dis.applicationId}
                </p>
              </div>
              {dis.scoreDifference && (
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {dis.scoreDifference.toFixed(1)} pts
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Score difference</div>
                </div>
              )}
            </div>

            <p className="mt-3 text-gray-700 dark:text-gray-300">{dis.description}</p>

            {dis.criteriaInvolved && dis.criteriaInvolved.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Criteria involved: </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {dis.criteriaInvolved.join(', ')}
                </span>
              </div>
            )}

            {dis.resolution && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">Resolution:</div>
                <p className="text-sm text-green-700 dark:text-green-300">{dis.resolution}</p>
                {dis.resolutionMethod && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Method: {dis.resolutionMethod.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
            )}

            {dis.status === 'OPEN' && (
              <div className="mt-4 flex gap-2">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  Resolve
                </button>
                <button className="px-3 py-1 text-sm border border-orange-600 text-orange-600 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20">
                  Escalate
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400">
                  Discuss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderComparison = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Historical Comparison</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Create Benchmark
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Compare Candidates
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Candidate Comparisons</h4>
          {comparisons.map((comp) => (
            <div key={comp.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  {comp.candidateCount} Candidates Compared
                </h5>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comp.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-2">
                {comp.rankings.slice(0, 3).map((ranking) => (
                  <div key={ranking.applicationId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2 ${
                        ranking.rank === 1
                          ? 'bg-yellow-400 text-yellow-900'
                          : ranking.rank === 2
                          ? 'bg-gray-300 text-gray-700'
                          : ranking.rank === 3
                          ? 'bg-orange-400 text-orange-900'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {ranking.rank}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {comp.scores[ranking.applicationId]?.candidateName || ranking.applicationId}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comp.scores[ranking.applicationId]?.overallScore.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Hiring Benchmarks</h4>
          {benchmarks.map((bench) => (
            <div key={bench.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {bench.benchmarkType} Benchmark
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(bench.periodStart).toLocaleDateString()} - {new Date(bench.periodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-gray-500 dark:text-gray-400">Avg Score</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {bench.metrics.averageOverallScore.toFixed(1)}
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-gray-500 dark:text-gray-400">Hire Rate</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {(bench.metrics.hireRate * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-gray-500 dark:text-gray-400">Offer Accept</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {(bench.metrics.offerAcceptRate * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-gray-500 dark:text-gray-400">Time to Hire</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {bench.metrics.timeToHire} days
                  </div>
                </div>
              </div>

              {bench.successIndicators && bench.successIndicators.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Success Indicators
                  </div>
                  <div className="space-y-1">
                    {bench.successIndicators.map((ind, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{ind.metric}</span>
                        <div className="flex items-center">
                          <span className={`mr-1 ${
                            ind.trend === 'UP' ? 'text-green-500' : ind.trend === 'DOWN' ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {ind.trend === 'UP' ? '↑' : ind.trend === 'DOWN' ? '↓' : '→'}
                          </span>
                          <span className="text-gray-900 dark:text-white">{ind.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadData}
            className="mt-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Try again
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'scorecards':
        return renderScorecards();
      case 'feedback':
        return renderFeedback();
      case 'blind':
        return renderBlindMode();
      case 'aggregation':
        return renderAggregation();
      case 'calibration':
        return renderCalibration();
      case 'voting':
        return renderVoting();
      case 'deadlines':
        return renderDeadlines();
      case 'disagreements':
        return renderDisagreements();
      case 'comparison':
        return renderComparison();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collaborative Evaluation</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Streamline team-based candidate evaluation with scorecards, voting, and calibration
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-1 overflow-x-auto pb-1" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default CollaborativeEvaluationHub;
