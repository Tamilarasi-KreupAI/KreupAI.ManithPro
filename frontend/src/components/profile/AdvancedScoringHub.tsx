import React, { useState, useEffect } from 'react';
import type {
  CultureFitAnalysis,
  GrowthPotentialScore,
  TechnicalDepthScore,
  CommunicationScore,
  ReliabilityScore,
  AdvancedScoresSummary,
} from '../../types';
import {
  cultureFitAPI,
  growthPotentialAPI,
  technicalDepthAPI,
  communicationAPI,
  reliabilityAPI,
  advancedScoringDashboardAPI,
} from '../../services/batch9AdvancedScoringAPI';

type TabType = 'overview' | 'culture-fit' | 'growth-potential' | 'technical-depth' | 'communication' | 'reliability';

const AdvancedScoringHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdvancedScoresSummary | null>(null);
  const [cultureFit, setCultureFit] = useState<CultureFitAnalysis | null>(null);
  const [growthPotential, setGrowthPotential] = useState<GrowthPotentialScore | null>(null);
  const [technicalDepth, setTechnicalDepth] = useState<TechnicalDepthScore | null>(null);
  const [communication, setCommunication] = useState<CommunicationScore | null>(null);
  const [reliability, setReliability] = useState<ReliabilityScore | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, cultureRes, growthRes, techRes, commRes, reliRes] = await Promise.all([
        advancedScoringDashboardAPI.getAllScores(),
        cultureFitAPI.getAnalysis(),
        growthPotentialAPI.getScore(),
        technicalDepthAPI.getScore(),
        communicationAPI.getScore(),
        reliabilityAPI.getScore(),
      ]);
      setSummary(summaryRes);
      setCultureFit(cultureRes.analysis);
      setGrowthPotential(growthRes.score);
      setTechnicalDepth(techRes.score);
      setCommunication(commRes.score);
      setReliability(reliRes.score);
    } catch (error) {
      console.error('Error loading advanced scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getTierBadgeColor = (tier: string): string => {
    const colors: Record<string, string> = {
      // Culture Fit
      STRONG_FIT: 'bg-green-100 text-green-800',
      GOOD_FIT: 'bg-blue-100 text-blue-800',
      MODERATE_FIT: 'bg-yellow-100 text-yellow-800',
      POTENTIAL_MISMATCH: 'bg-orange-100 text-orange-800',
      POOR_FIT: 'bg-red-100 text-red-800',
      // Growth
      HIGH_POTENTIAL: 'bg-purple-100 text-purple-800',
      STRONG_GROWTH: 'bg-green-100 text-green-800',
      STEADY_GROWTH: 'bg-blue-100 text-blue-800',
      LIMITED_GROWTH: 'bg-yellow-100 text-yellow-800',
      // Technical
      EXPERT: 'bg-purple-100 text-purple-800',
      SENIOR: 'bg-green-100 text-green-800',
      MID_LEVEL: 'bg-blue-100 text-blue-800',
      JUNIOR: 'bg-yellow-100 text-yellow-800',
      ENTRY: 'bg-gray-100 text-gray-800',
      // Communication
      EXCEPTIONAL: 'bg-purple-100 text-purple-800',
      STRONG: 'bg-green-100 text-green-800',
      PROFICIENT: 'bg-blue-100 text-blue-800',
      DEVELOPING: 'bg-yellow-100 text-yellow-800',
      NEEDS_WORK: 'bg-red-100 text-red-800',
      // Reliability
      HIGHLY_RELIABLE: 'bg-green-100 text-green-800',
      RELIABLE: 'bg-blue-100 text-blue-800',
      MODERATELY_RELIABLE: 'bg-yellow-100 text-yellow-800',
      NEEDS_MONITORING: 'bg-orange-100 text-orange-800',
      UNRELIABLE: 'bg-red-100 text-red-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z' },
    { id: 'culture-fit' as TabType, label: 'Culture Fit', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'growth-potential' as TabType, label: 'Growth', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { id: 'technical-depth' as TabType, label: 'Technical', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { id: 'communication' as TabType, label: 'Communication', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'reliability' as TabType, label: 'Reliability', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Scoring
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              In-depth analysis of your professional profile across multiple dimensions
            </p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Scores
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && summary && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className={`text-5xl font-bold ${getScoreColor(summary.overallAdvancedScore)}`}>
                  {summary.overallAdvancedScore}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Overall Advanced Score</p>
                <p className="text-sm text-gray-500 mt-1">Top {100 - summary.marketPercentile}% in market</p>
              </div>

              {/* Score Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(summary.scores).map(([key, value]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${getScoreBgColor(value.score)}`}
                    onClick={() => setActiveTab(key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') as TabType)}
                  >
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(value.score)}`}>{value.score}</div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${getTierBadgeColor(value.tier)}`}>
                        {value.tier.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Top Strengths
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {summary.topStrengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-green-700 dark:text-green-400">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Development Areas
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {summary.developmentAreas.map((area, idx) => (
                      <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-400">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Key Insights</h4>
                <ul className="space-y-2">
                  {summary.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start text-sm text-blue-700 dark:text-blue-400">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Culture Fit Tab */}
          {activeTab === 'culture-fit' && cultureFit && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-4xl font-bold ${getScoreColor(cultureFit.overallCultureScore)}`}>
                    {cultureFit.overallCultureScore}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Culture Fit Score</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(cultureFit.fitLevel)}`}>
                  {cultureFit.fitLevel.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Work Style */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Collaboration', value: cultureFit.collaborationStyle },
                  { label: 'Communication', value: cultureFit.communicationStyle },
                  { label: 'Decision Making', value: cultureFit.decisionMaking },
                  { label: 'Feedback', value: cultureFit.feedbackPreference },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {item.value.replace(/_/g, ' ').toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Values Alignment */}
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Values Alignment ({cultureFit.valuesAlignment}%)</h4>
                <div className="space-y-2">
                  {cultureFit.matchedValues?.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{v.value}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${v.alignment}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{v.alignment}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Environment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Work Environment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Remote Preference</span>
                      <span className="text-gray-900 dark:text-white capitalize">{cultureFit.remotePreference.replace(/_/g, ' ').toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Work Hours</span>
                      <span className="text-gray-900 dark:text-white capitalize">{cultureFit.workHoursFlexibility.replace(/_/g, ' ').toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Meeting Tolerance</span>
                      <span className="text-gray-900 dark:text-white capitalize">{cultureFit.meetingTolerance.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Company Fit</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Startup Readiness</span>
                      <span className="text-gray-900 dark:text-white">{cultureFit.startupReadiness}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Corporate Readiness</span>
                      <span className="text-gray-900 dark:text-white">{cultureFit.corporateReadiness}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Preferred Size</span>
                      <span className="text-gray-900 dark:text-white capitalize">{cultureFit.preferredCompanySize.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {cultureFit.fitSummary && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Analysis Summary</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">{cultureFit.fitSummary}</p>
                </div>
              )}
            </div>
          )}

          {/* Growth Potential Tab */}
          {activeTab === 'growth-potential' && growthPotential && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-4xl font-bold ${getScoreColor(growthPotential.overallGrowthScore)}`}>
                    {growthPotential.overallGrowthScore}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Growth Potential Score</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(growthPotential.growthTier)}`}>
                  {growthPotential.growthTier.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Learning Agility', value: growthPotential.learningAgility },
                  { label: 'Leadership Potential', value: growthPotential.leadershipPotential },
                  { label: 'Innovation Score', value: growthPotential.innovationScore },
                  { label: 'Problem Solving', value: growthPotential.problemSolvingAbility },
                ].map((item) => (
                  <div key={item.label} className={`p-4 rounded-lg ${getScoreBgColor(item.value)}`}>
                    <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Career Trajectory */}
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Predicted Career Path</h4>
                <div className="flex items-center justify-between">
                  {growthPotential.predictedGrowthPath && Object.entries(growthPotential.predictedGrowthPath).map(([year, data], idx) => (
                    <div key={year} className="text-center flex-1">
                      {idx > 0 && (
                        <div className="hidden md:block absolute w-full h-0.5 bg-gray-300 dark:bg-gray-600 top-1/2 -left-1/2" />
                      )}
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 inline-block">
                        <p className="text-xs text-blue-600 dark:text-blue-400">{year}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.role}</p>
                        <p className="text-xs text-gray-500">{Math.round(data.probability * 100)}% likely</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promotion History */}
              {growthPotential.promotionHistory && growthPotential.promotionHistory.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Promotion History</h4>
                  <div className="space-y-2">
                    {growthPotential.promotionHistory.map((promo, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm border-l-2 border-blue-500 pl-3">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{promo.fromRole}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-gray-900 dark:text-white font-medium">{promo.toRole}</span>
                        </div>
                        <span className="text-gray-500">{promo.timespan} at {promo.company}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Development Recommendations</h4>
                <ul className="space-y-1">
                  {growthPotential.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-green-700 dark:text-green-400 flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Technical Depth Tab */}
          {activeTab === 'technical-depth' && technicalDepth && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-4xl font-bold ${getScoreColor(technicalDepth.overallTechnicalScore)}`}>
                    {technicalDepth.overallTechnicalScore}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Technical Depth Score</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(technicalDepth.technicalTier)}`}>
                  {technicalDepth.technicalTier.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Code Quality', value: technicalDepth.codeQualityScore },
                  { label: 'System Design', value: technicalDepth.systemDesignCapability },
                  { label: 'Best Practices', value: technicalDepth.bestPracticesScore },
                  { label: 'Technical Leadership', value: technicalDepth.technicalLeadership },
                ].map((item) => (
                  <div key={item.label} className={`p-4 rounded-lg ${getScoreBgColor(item.value)}`}>
                    <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Language Proficiency */}
              {technicalDepth.languageProficiency && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Language Proficiency</h4>
                  <div className="space-y-2">
                    {Object.entries(technicalDepth.languageProficiency).map(([lang, data]) => (
                      <div key={lang} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-24">{lang}</span>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${data.score}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{data.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Stack */}
              <div className="flex flex-wrap gap-2">
                {technicalDepth.primaryStack.map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {technicalDepth.technicalStrengths.map((s, idx) => (
                      <li key={idx} className="text-sm text-green-700 dark:text-green-400">+ {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Gaps</h4>
                  <ul className="space-y-1">
                    {technicalDepth.technicalGaps.map((g, idx) => (
                      <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-400">- {g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && communication && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-4xl font-bold ${getScoreColor(communication.overallCommScore)}`}>
                    {communication.overallCommScore}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Communication Score</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(communication.communicationTier)}`}>
                  {communication.communicationTier}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Written', value: communication.writtenScore },
                  { label: 'Verbal', value: communication.verbalScore || 0 },
                  { label: 'Technical', value: communication.technicalExplanation },
                  { label: 'Collaboration', value: communication.collaborationComm },
                ].map((item) => (
                  <div key={item.label} className={`p-4 rounded-lg ${getScoreBgColor(item.value)}`}>
                    <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Written Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Written Communication</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Clarity', value: communication.writingClarity },
                    { label: 'Conciseness', value: communication.writingConciseness },
                    { label: 'Grammar', value: communication.grammarAccuracy },
                    { label: 'Professional Tone', value: communication.professionalTone },
                    { label: 'Structure', value: communication.structureOrganization },
                    { label: 'Responsiveness', value: communication.responsiveness },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className={`text-sm font-medium ${getScoreColor(item.value)}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {communication.communicationStrengths.map((s, idx) => (
                      <li key={idx} className="text-sm text-green-700 dark:text-green-400">+ {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Development Areas</h4>
                  <ul className="space-y-1">
                    {communication.developmentAreas.map((d, idx) => (
                      <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-400">- {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Reliability Tab */}
          {activeTab === 'reliability' && reliability && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-4xl font-bold ${getScoreColor(reliability.overallReliabilityScore)}`}>
                    {reliability.overallReliabilityScore}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Reliability Score</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(reliability.reliabilityTier)}`}>
                  {reliability.reliabilityTier.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Response Rate', value: reliability.responseRate },
                  { label: 'Interview Attendance', value: reliability.interviewAttendance },
                  { label: 'Punctuality', value: reliability.punctualityScore },
                  { label: 'Follow Through', value: reliability.followThroughRate },
                ].map((item) => (
                  <div key={item.label} className={`p-4 rounded-lg ${getScoreBgColor(item.value)}`}>
                    <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}%</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Commitment Indicators */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Commitment Indicators</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Tenure</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{reliability.averageTenure} months</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Job Hopping Risk</span>
                    <span className={`text-sm font-medium ${reliability.jobHoppingRisk === 'LOW' ? 'text-green-600' : reliability.jobHoppingRisk === 'MODERATE' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {reliability.jobHoppingRisk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Career Stability</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{reliability.careerStability}%</span>
                  </div>
                </div>
              </div>

              {/* Green Flags */}
              {reliability.greenFlags.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Positive Indicators</h4>
                  <div className="flex flex-wrap gap-2">
                    {reliability.greenFlags.map((flag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trend */}
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <span className="text-sm text-blue-800 dark:text-blue-300">Reliability Trend</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  reliability.reliabilityTrend === 'IMPROVING' ? 'bg-green-100 text-green-800' :
                  reliability.reliabilityTrend === 'STABLE' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {reliability.reliabilityTrend}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedScoringHub;
