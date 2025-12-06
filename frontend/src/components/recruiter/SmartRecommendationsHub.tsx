import React, { useState, useEffect } from 'react';
import {
  jobRecommendationsAPI,
  candidateRecommendationsAPI,
  similarCandidatesAPI,
  passiveCandidatesAPI,
  skillUpAPI,
  reEngagementAPI,
  interviewPanelAPI,
  sourcingChannelsAPI,
  statsAPI,
} from '../../services/batch23SmartRecommendationsAPI';
import type {
  JobRecommendation,
  CandidateRecommendation,
  SimilarCandidateMatch,
  PassiveCandidateProfile,
  SkillUpRecommendation,
  ReEngagementSuggestion,
  InterviewPanelRecommendation,
  SourcingChannelRecommendation,
  SmartRecommendationsStats,
} from '../../types';

type TabType =
  | 'overview'
  | 'job-recommendations'
  | 'candidate-recommendations'
  | 'similar-candidates'
  | 'passive-candidates'
  | 'skill-up'
  | 're-engagement'
  | 'interview-panel'
  | 'sourcing-channels';

const SmartRecommendationsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for each feature
  const [stats, setStats] = useState<SmartRecommendationsStats | null>(null);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([]);
  const [candidateRecommendations, setCandidateRecommendations] = useState<CandidateRecommendation[]>([]);
  const [similarCandidates, setSimilarCandidates] = useState<SimilarCandidateMatch[]>([]);
  const [passiveCandidates, setPassiveCandidates] = useState<PassiveCandidateProfile[]>([]);
  const [skillUpRecommendations, setSkillUpRecommendations] = useState<SkillUpRecommendation[]>([]);
  const [reEngagementSuggestions, setReEngagementSuggestions] = useState<ReEngagementSuggestion[]>([]);
  const [interviewPanelRecs, setInterviewPanelRecs] = useState<InterviewPanelRecommendation[]>([]);
  const [sourcingChannelRecs, setSourcingChannelRecs] = useState<SourcingChannelRecommendation[]>([]);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'overview':
          const statsData = await statsAPI.getStats();
          setStats(statsData);
          break;
        case 'job-recommendations':
          const jobRecs = await jobRecommendationsAPI.getForCandidate('cand-1');
          setJobRecommendations(jobRecs);
          break;
        case 'candidate-recommendations':
          const candRecs = await candidateRecommendationsAPI.getForJob('job-1');
          setCandidateRecommendations(candRecs);
          break;
        case 'similar-candidates':
          const similar = await similarCandidatesAPI.getBySource('cand-hired-1');
          setSimilarCandidates(similar);
          break;
        case 'passive-candidates':
          const passive = await passiveCandidatesAPI.getAll();
          setPassiveCandidates(passive);
          break;
        case 'skill-up':
          const skillUp = await skillUpAPI.getForCandidate('cand-1');
          setSkillUpRecommendations(skillUp);
          break;
        case 're-engagement':
          const reEngage = await reEngagementAPI.getForJob('job-1');
          setReEngagementSuggestions(reEngage);
          break;
        case 'interview-panel':
          const panel = await interviewPanelAPI.getForInterview('job-1', 'cand-1');
          setInterviewPanelRecs(panel);
          break;
        case 'sourcing-channels':
          const sourcing = await sourcingChannelsAPI.getAll();
          setSourcingChannelRecs(sourcing);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'chart-pie' },
    { id: 'job-recommendations', label: 'Job Recommendations', icon: 'briefcase' },
    { id: 'candidate-recommendations', label: 'Candidate Recs', icon: 'users' },
    { id: 'similar-candidates', label: 'Similar Candidates', icon: 'user-group' },
    { id: 'passive-candidates', label: 'Passive Candidates', icon: 'user-plus' },
    { id: 'skill-up', label: 'Skill-Up', icon: 'academic-cap' },
    { id: 're-engagement', label: 'Re-Engagement', icon: 'arrow-path' },
    { id: 'interview-panel', label: 'Interview Panel', icon: 'user-circle' },
    { id: 'sourcing-channels', label: 'Sourcing Channels', icon: 'megaphone' },
  ];

  const renderOverview = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Recommendations</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalRecommendations.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Recommendations</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeRecommendations.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{(stats.conversionRate * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Match Score</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{(stats.averageMatchScore * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendations by Type</h3>
            <div className="space-y-3">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{type.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / stats.totalRecommendations) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Types</h3>
            <div className="space-y-4">
              {stats.topPerformingTypes.map((item, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{item.type.replace(/_/g, ' ')}</span>
                    <span className="text-green-600 font-semibold">{(item.conversionRate * 100).toFixed(0)}% conv.</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{item.count} recommendations</span>
                    <span>Avg score: {(item.avgScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Channel Effectiveness</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Channel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Effectiveness</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hires</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost/Hire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.channelEffectiveness.map((channel) => (
                  <tr key={channel.channel}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{channel.channel}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${channel.effectiveness * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">{(channel.effectiveness * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{channel.hires}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">${channel.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      ${channel.hires > 0 ? Math.round(channel.cost / channel.hires).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderJobRecommendations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Job Recommendations for Candidates</h2>
        <button
          onClick={() => jobRecommendationsAPI.generate({ candidateId: 'cand-1' }).then(setJobRecommendations)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Generate New
        </button>
      </div>

      <div className="space-y-4">
        {jobRecommendations.map((rec) => (
          <div key={rec.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job #{rec.jobId}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rank #{rec.rank}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{(rec.matchScore * 100).toFixed(0)}%</div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rec.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  rec.status === 'VIEWED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {rec.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-4">
              {[
                { label: 'Skills', value: rec.skillMatchScore },
                { label: 'Experience', value: rec.experienceMatchScore },
                { label: 'Location', value: rec.locationMatchScore },
                { label: 'Salary', value: rec.salaryMatchScore },
                { label: 'Culture', value: rec.cultureMatchScore },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{(item.value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Matched Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {rec.matchedSkills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {rec.missingSkills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{rec.reasoning}</p>

            <div className="flex gap-2">
              <button
                onClick={() => jobRecommendationsAPI.recordInteraction(rec.id, { interactionType: 'VIEW' })}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                View Details
              </button>
              <button
                onClick={() => jobRecommendationsAPI.recordInteraction(rec.id, { interactionType: 'SAVE' })}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Save Job
              </button>
              <button
                onClick={() => jobRecommendationsAPI.recordInteraction(rec.id, { interactionType: 'APPLY' })}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCandidateRecommendations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Candidate Recommendations for Jobs</h2>
        <button
          onClick={() => candidateRecommendationsAPI.generate({ jobId: 'job-1' }).then(setCandidateRecommendations)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Generate New
        </button>
      </div>

      <div className="space-y-4">
        {candidateRecommendations.map((rec) => (
          <div key={rec.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Candidate #{rec.candidateId}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rank #{rec.rank} for Job #{rec.jobId}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{(rec.matchScore * 100).toFixed(0)}%</div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rec.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {rec.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-4">
              {[
                { label: 'Skills', value: rec.skillMatchScore },
                { label: 'Experience', value: rec.experienceMatchScore },
                { label: 'Education', value: rec.educationMatchScore },
                { label: 'Availability', value: rec.availabilityScore },
                { label: 'Culture', value: rec.cultureFitScore },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{(item.value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Highlights</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                {rec.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            </div>

            {rec.concerns.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Concerns</h4>
                <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                  {rec.concerns.map((concern, i) => (
                    <li key={i}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{rec.reasoning}</p>

            <div className="flex gap-2">
              <button
                onClick={() => candidateRecommendationsAPI.recordAction(rec.id, { actionType: 'CONTACT' })}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Contact
              </button>
              <button
                onClick={() => candidateRecommendationsAPI.recordAction(rec.id, { actionType: 'SCHEDULE_INTERVIEW' })}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Schedule Interview
              </button>
              <button
                onClick={() => candidateRecommendationsAPI.recordAction(rec.id, { actionType: 'ADD_TO_PIPELINE' })}
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Add to Pipeline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSimilarCandidates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Similar Candidates Finder</h2>
        <button
          onClick={() => similarCandidatesAPI.find({ sourceCandidateId: 'cand-hired-1' }).then(setSimilarCandidates)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Find Similar
        </button>
      </div>

      <div className="space-y-4">
        {similarCandidates.map((match) => (
          <div key={match.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Similar to: #{match.sourceCandidateId}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Matched: #{match.matchedCandidateId}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{(match.similarityScore * 100).toFixed(0)}%</div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Similarity</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-4">
              {[
                { label: 'Skills', value: match.skillSimilarity },
                { label: 'Experience', value: match.experienceSimilarity },
                { label: 'Education', value: match.educationSimilarity },
                { label: 'Industry', value: match.industrySimilarity },
                { label: 'Role', value: match.roleSimilarity },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{(item.value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shared Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {match.sharedSkills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unique to Source</h4>
                <div className="flex flex-wrap gap-1">
                  {match.uniqueToSource.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unique to Match</h4>
                <div className="flex flex-wrap gap-1">
                  {match.uniqueToMatched.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{match.reasoning}</p>

            <div className="flex gap-2">
              <button
                onClick={() => similarCandidatesAPI.recordAction(match.id, { actionType: 'CONTACT' })}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Contact
              </button>
              <button
                onClick={() => similarCandidatesAPI.recordAction(match.id, { actionType: 'ADD_TO_PIPELINE' })}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add to Pipeline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPassiveCandidates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Passive Candidate Identification</h2>
        <button
          onClick={() => passiveCandidatesAPI.identify({}).then(setPassiveCandidates)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Identify New
        </button>
      </div>

      <div className="space-y-4">
        {passiveCandidates.map((profile) => (
          <div key={profile.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Candidate #{profile.candidateId}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.openToOpportunities ? 'Open to opportunities' : 'Not actively looking'}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  profile.outreachStatus === 'NOT_CONTACTED' ? 'bg-gray-100 text-gray-800' :
                  profile.outreachStatus === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                  profile.outreachStatus === 'RESPONDED' ? 'bg-green-100 text-green-800' :
                  profile.outreachStatus === 'CONVERTED' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.outreachStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Passive Score', value: profile.passiveScore },
                { label: 'Engagement', value: profile.engagementLevel },
                { label: 'Response Likelihood', value: profile.responselikelihood },
                { label: 'Conversion Potential', value: profile.conversionPotential },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{(item.value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interests</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{interest}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motivators</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.motivators.map((motivator) => (
                    <span key={motivator} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{motivator}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Preferred Contact:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{profile.preferredContactMethod}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Best Time:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{profile.bestContactTime}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Salary Expectation:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">${profile.salaryExpectation?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => passiveCandidatesAPI.recordOutreach(profile.id, { outreachStatus: 'CONTACTED', contactMethod: 'LinkedIn' })}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Record Outreach
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkillUp = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Skill-Up Recommendations</h2>
        <button
          onClick={() => skillUpAPI.generate({ candidateId: 'cand-1' }).then(setSkillUpRecommendations)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Generate Recommendations
        </button>
      </div>

      <div className="space-y-4">
        {skillUpRecommendations.map((rec) => (
          <div key={rec.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rec.targetSkill}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Level {rec.currentLevel} → {rec.targetLevel}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  rec.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rec.priority} Priority
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Relevance', value: rec.relevanceScore },
                { label: 'Market Demand', value: rec.marketDemand },
                { label: 'Career Impact', value: rec.careerImpact },
                { label: 'Progress', value: rec.progress / 100 },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{(item.value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Learning Path</h4>
              <div className="space-y-2">
                {rec.learningPath.map((resource, index) => (
                  <div key={resource.id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      resource.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{resource.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {resource.provider} • {resource.type} • {resource.duration}
                        {resource.cost && ` • $${resource.cost}`}
                      </div>
                    </div>
                    {resource.rating && (
                      <span className="text-yellow-500">★ {resource.rating}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Est. Time:</span> {rec.estimatedTimeHours}h
                {rec.estimatedCost && <> • <span className="font-medium">Est. Cost:</span> ${rec.estimatedCost}</>}
                {rec.salaryImpact && <> • <span className="font-medium">Salary Impact:</span> +${rec.salaryImpact.toLocaleString()}</>}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{rec.reasoning}</p>

            <div className="flex gap-2">
              <button
                onClick={() => skillUpAPI.updateProgress(rec.id, { progress: 10, status: 'IN_PROGRESS' })}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Start Learning
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                View Resources
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReEngagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Re-Engagement Suggestions</h2>
        <button
          onClick={() => reEngagementAPI.generate({ jobId: 'job-1' }).then(setReEngagementSuggestions)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Find Candidates
        </button>
      </div>

      <div className="space-y-4">
        {reEngagementSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Candidate #{suggestion.candidateId}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last contact: {suggestion.timeSinceLastContact} days ago
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{(suggestion.reEngagementScore * 100).toFixed(0)}%</div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  suggestion.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  suggestion.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                  suggestion.status === 'RE_ENGAGED' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {suggestion.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Reason:</span>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{suggestion.reason.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Fit Improvement:</span>
                <span className="ml-2 text-sm font-medium text-green-600">+{(suggestion.fitImprovement * 100).toFixed(0)}%</span>
              </div>
            </div>

            {suggestion.previousFeedback && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Previous Feedback</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{suggestion.previousFeedback}</p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Changes Noted</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                {suggestion.changesNoted.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Suggested Approach</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">{suggestion.suggestedApproach}</p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{suggestion.reasoning}</p>

            <div className="flex gap-2">
              <button
                onClick={() => reEngagementAPI.updateStatus(suggestion.id, { status: 'CONTACTED' })}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Contact Now
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInterviewPanel = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interview Panel Recommendations</h2>
        <button
          onClick={() => interviewPanelAPI.generate({ jobId: 'job-1', candidateId: 'cand-1' }).then(setInterviewPanelRecs)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Generate Panel
        </button>
      </div>

      <div className="space-y-4">
        {interviewPanelRecs.map((rec) => (
          <div key={rec.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interviewer #{rec.interviewerId}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    rec.role === 'TECHNICAL' ? 'bg-blue-100 text-blue-800' :
                    rec.role === 'CULTURAL' ? 'bg-purple-100 text-purple-800' :
                    rec.role === 'LEAD' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {rec.role}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{(rec.matchScore * 100).toFixed(0)}%</div>
                {rec.selected && <span className="text-green-600 text-sm">Selected</span>}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-4">
              {[
                { label: 'Expertise', value: rec.expertiseMatch },
                { label: 'Availability', value: rec.availabilityScore },
                { label: 'Load', value: rec.interviewLoadScore },
                { label: 'Diversity', value: rec.diversityContribution },
                { label: 'Rating', value: (rec.averageRating || 0) / 5 },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{(item.value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expertise Areas</h4>
              <div className="flex flex-wrap gap-1">
                {rec.expertiseAreas.map((area) => (
                  <span key={area} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{area}</span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Previous Interviews:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{rec.previousInterviews}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Avg Rating:</span>
                  <span className="ml-2 text-yellow-500">★ {rec.averageRating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{rec.reasoning}</p>

            <div className="flex gap-2">
              <button
                onClick={() => interviewPanelAPI.selectInterviewer(rec.id, {})}
                className={`px-3 py-1 rounded ${
                  rec.selected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                disabled={rec.selected}
              >
                {rec.selected ? 'Selected' : 'Select for Panel'}
              </button>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                View Availability
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSourcingChannels = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sourcing Channel Recommendations</h2>
        <button
          onClick={() => sourcingChannelsAPI.generate({ roleType: 'Senior Software Engineer' }).then(setSourcingChannelRecs)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Analyze Channels
        </button>
      </div>

      <div className="space-y-4">
        {sourcingChannelRecs.map((rec) => (
          <div key={rec.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rec.channel}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  For: {rec.roleType} • Rank #{rec.rank}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{(rec.effectiveness * 100).toFixed(0)}%</div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Effectiveness</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-4">
              {[
                { label: 'Cost Efficiency', value: rec.costEfficiency },
                { label: 'Quality', value: rec.qualityScore },
                { label: 'Speed', value: rec.speedScore },
                { label: 'Volume', value: rec.volumeScore },
                { label: 'Historical', value: rec.historicalSuccess },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{(item.value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Est. Cost:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">${rec.estimatedCost?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Time to Hire:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{rec.estimatedTimeToHire} days</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Est. Candidates:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{rec.estimatedCandidates}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                {rec.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Best Practices</h4>
              <ul className="list-disc list-inside text-sm text-green-600 dark:text-green-400 space-y-1">
                {rec.bestPractices.map((bp, i) => (
                  <li key={i}>{bp}</li>
                ))}
              </ul>
            </div>

            {rec.warnings && rec.warnings.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warnings</h4>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
                  {rec.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-300">{rec.reasoning}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadTabData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'job-recommendations':
        return renderJobRecommendations();
      case 'candidate-recommendations':
        return renderCandidateRecommendations();
      case 'similar-candidates':
        return renderSimilarCandidates();
      case 'passive-candidates':
        return renderPassiveCandidates();
      case 'skill-up':
        return renderSkillUp();
      case 're-engagement':
        return renderReEngagement();
      case 'interview-panel':
        return renderInterviewPanel();
      case 'sourcing-channels':
        return renderSourcingChannels();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Recommendations Hub</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered recommendations for jobs, candidates, skill development, and recruitment optimization
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
};

export default SmartRecommendationsHub;
