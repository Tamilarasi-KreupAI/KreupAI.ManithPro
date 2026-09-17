import React, { useState, useEffect } from 'react';
import {
  HiringSuccessPrediction,
  TimeToHireForecast,
  OfferAcceptancePrediction,
  RetentionRiskScore,
  PerformancePrediction,
  MarketAvailabilityAnalysis,
  SalaryTrendPrediction,
  PipelineHealthPrediction,
  PredictiveAnalyticsStats,
} from '../../types/batch22PredictiveAnalytics.types';
import {
  hiringSuccessAPI,
  timeToHireAPI,
  offerAcceptanceAPI,
  retentionRiskAPI,
  performanceAPI,
  marketAvailabilityAPI,
  salaryTrendsAPI,
  pipelineHealthAPI,
  analyticsAPI,
} from '../../services/batch22PredictiveAnalyticsAPI';

type TabType =
  | 'overview'
  | 'hiring-success'
  | 'time-to-hire'
  | 'offer-acceptance'
  | 'retention-risk'
  | 'performance'
  | 'market'
  | 'salary'
  | 'pipeline';

const PredictiveAnalyticsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for each prediction type
  const [stats, setStats] = useState<PredictiveAnalyticsStats | null>(null);
  const [hiringPredictions, setHiringPredictions] = useState<HiringSuccessPrediction[]>([]);
  const [timeForecasts, setTimeForecasts] = useState<TimeToHireForecast[]>([]);
  const [offerPredictions, setOfferPredictions] = useState<OfferAcceptancePrediction[]>([]);
  const [retentionScores, setRetentionScores] = useState<RetentionRiskScore[]>([]);
  const [performancePredictions, setPerformancePredictions] = useState<PerformancePrediction[]>([]);
  const [marketAnalyses, setMarketAnalyses] = useState<MarketAvailabilityAnalysis[]>([]);
  const [salaryTrends, setSalaryTrends] = useState<SalaryTrendPrediction[]>([]);
  const [pipelineHealth, setPipelineHealth] = useState<PipelineHealthPrediction[]>([]);

  // Form inputs
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getStats();
      setStats(res.data);
    } catch (err) {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 'hiring-success':
          if (jobId) {
            const res = await hiringSuccessAPI.listByJob(jobId);
            setHiringPredictions(res.data);
          }
          break;
        case 'time-to-hire':
          const timeRes = await timeToHireAPI.list();
          setTimeForecasts(timeRes.data);
          break;
        case 'offer-acceptance':
          if (jobId) {
            const offerRes = await offerAcceptanceAPI.listByJob(jobId);
            setOfferPredictions(offerRes.data);
          }
          break;
        case 'retention-risk':
          const riskRes = await retentionRiskAPI.listHighRisk();
          setRetentionScores(riskRes.data);
          break;
        case 'performance':
          if (jobId) {
            const perfRes = await performanceAPI.listTopPerformers(jobId);
            setPerformancePredictions(perfRes.data);
          }
          break;
        case 'market':
          const marketRes = await marketAvailabilityAPI.list();
          setMarketAnalyses(marketRes.data);
          break;
        case 'salary':
          const salaryRes = await salaryTrendsAPI.search({});
          setSalaryTrends(salaryRes.data);
          break;
        case 'pipeline':
          const pipelineRes = await pipelineHealthAPI.listUnhealthy();
          setPipelineHealth(pipelineRes.data);
          break;
      }
    } catch (err) {
      setError(`Failed to load ${tab} data`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== 'overview') {
      loadTabData(tab);
    }
  };

  const handlePredictHiringSuccess = async () => {
    if (!candidateId || !jobId) return;
    setLoading(true);
    try {
      const res = await hiringSuccessAPI.predict({ candidateId, jobId });
      setHiringPredictions((prev) => [res.data, ...prev]);
    } catch (err) {
      setError('Failed to predict hiring success');
    } finally {
      setLoading(false);
    }
  };

  const handleForecastTimeToHire = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await timeToHireAPI.forecast({ jobId });
      setTimeForecasts((prev) => [res.data, ...prev]);
    } catch (err) {
      setError('Failed to forecast time to hire');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMarket = async () => {
    if (!roleTitle || !location) return;
    setLoading(true);
    try {
      const res = await marketAvailabilityAPI.analyze({
        roleTitle,
        location,
        experienceLevel: 'SENIOR',
      });
      setMarketAnalyses((prev) => [res.data, ...prev]);
    } catch (err) {
      setError('Failed to analyze market');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'hiring-success', label: 'Hiring Success', icon: '🎯' },
    { id: 'time-to-hire', label: 'Time to Hire', icon: '⏱️' },
    { id: 'offer-acceptance', label: 'Offer Acceptance', icon: '🤝' },
    { id: 'retention-risk', label: 'Retention Risk', icon: '⚠️' },
    { id: 'performance', label: 'Performance', icon: '📈' },
    { id: 'market', label: 'Market Analysis', icon: '🌍' },
    { id: 'salary', label: 'Salary Trends', icon: '💰' },
    { id: 'pipeline', label: 'Pipeline Health', icon: '🔬' },
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'B': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'C': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'D': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'F': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'VERY_HIGH': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Predictive Analytics Dashboard</h3>
        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">Hiring Predictions</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalPredictions.hiringSuccess}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400">Time-to-Hire Forecasts</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.totalPredictions.timeToHire}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-purple-600 dark:text-purple-400">Offer Predictions</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.totalPredictions.offerAcceptance}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="text-sm text-orange-600 dark:text-orange-400">Retention Scores</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.totalPredictions.retentionRisk}</p>
            </div>
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
              <p className="text-sm text-pink-600 dark:text-pink-400">Performance Predictions</p>
              <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">{stats.totalPredictions.performance}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <p className="text-sm text-indigo-600 dark:text-indigo-400">Market Analyses</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.totalPredictions.marketAvailability}</p>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
              <p className="text-sm text-teal-600 dark:text-teal-400">Salary Predictions</p>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{stats.totalPredictions.salaryTrends}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pipeline Health</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.totalPredictions.pipelineHealth}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Loading statistics...</p>
        )}
      </div>

      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Average Scores</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Hiring Success Rate</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {(stats.averages.hiringSuccessProbability * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Offer Acceptance Rate</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(stats.averages.offerAcceptanceProbability * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pipeline Health Score</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.averages.pipelineHealthScore}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Feature Highlights</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium dark:text-white">Hiring Success Predictor (5.2.1)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Probability of successful hire based on candidate-job fit
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="font-medium dark:text-white">Time-to-Hire Forecast (5.2.2)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Predict how long it will take to fill a position
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🤝</span>
              <div>
                <p className="font-medium dark:text-white">Offer Acceptance Predictor (5.2.3)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Likelihood candidate will accept the offer
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium dark:text-white">Retention Risk Score (5.2.4)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Predict employee longevity in the role
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">More Predictions</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-medium dark:text-white">Performance Predictor (5.2.5)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Forecast job performance from candidate signals
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🌍</span>
              <div>
                <p className="font-medium dark:text-white">Market Availability Analysis (5.2.6)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Predict difficulty of finding candidates
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-medium dark:text-white">Salary Trend Predictions (5.2.7)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Forecast compensation changes
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🔬</span>
              <div>
                <p className="font-medium dark:text-white">Pipeline Health Predictor (5.2.8)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Forecast bottlenecks and pipeline gaps
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderHiringSuccess = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Predict Hiring Success</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            placeholder="Candidate ID"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Job ID"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handlePredictHiringSuccess}
            disabled={loading || !candidateId || !jobId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Predict
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Hiring Predictions ({hiringPredictions.length})</h3>
        <div className="space-y-4">
          {hiringPredictions.map((prediction) => (
            <div key={prediction.id} className="p-4 border dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium dark:text-white">Candidate #{prediction.candidateId.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">Job #{prediction.jobId.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(prediction.predictionGrade)}`}>
                    Grade {prediction.predictionGrade}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(prediction.overallRiskLevel)}`}>
                    {prediction.overallRiskLevel} Risk
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Success</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {(prediction.successProbability * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Skill Match</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {(prediction.skillMatchScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {(prediction.experienceMatchScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Culture Fit</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {(prediction.cultureFitScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Confidence</p>
                  <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                    {(prediction.confidenceLevel * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              {(prediction.positiveSignals?.length ?? 0) > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Positive Signals:</p>
                  <div className="flex flex-wrap gap-1">
                    {prediction.positiveSignals?.map((signal, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                        {signal.signal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(prediction.riskFactors?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Risk Factors:</p>
                  <div className="flex flex-wrap gap-1">
                    {prediction.riskFactors?.map((risk, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                        {risk.factor}
                      </span>
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

  const renderTimeToHire = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Forecast Time to Hire</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Job ID"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleForecastTimeToHire}
            disabled={loading || !jobId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Forecast
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Time-to-Hire Forecasts ({timeForecasts.length})</h3>
        <div className="space-y-4">
          {timeForecasts.map((forecast) => (
            <div key={forecast.id} className="p-4 border dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <p className="font-medium dark:text-white">Job #{forecast.jobId.slice(0, 8)}</p>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{forecast.predictedDays} days</p>
                  <p className="text-xs text-gray-500">
                    Range: {forecast.confidenceInterval?.low}-{forecast.confidenceInterval?.high} days
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500">Sourcing</p>
                  <p className="font-bold dark:text-white">{forecast.sourcingDays}d</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500">Screening</p>
                  <p className="font-bold dark:text-white">{forecast.screeningDays}d</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500">Interview</p>
                  <p className="font-bold dark:text-white">{forecast.interviewingDays}d</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500">Offer</p>
                  <p className="font-bold dark:text-white">{forecast.offerDays}d</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500">Closing</p>
                  <p className="font-bold dark:text-white">{forecast.closingDays}d</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                  {forecast.roleComplexity} Complexity
                </span>
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">
                  {forecast.marketCompetition} Competition
                </span>
                <span className={`px-2 py-1 rounded text-xs ${getRiskColor(forecast.bottleneckRisk)}`}>
                  {forecast.bottleneckRisk} Bottleneck Risk
                </span>
              </div>
              {(forecast.predictedBottlenecks?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Predicted Bottlenecks:</p>
                  <div className="flex flex-wrap gap-1">
                    {forecast.predictedBottlenecks?.map((bottleneck, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                        {bottleneck.stage}: {bottleneck.reason}
                      </span>
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

  const renderMarketAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Analyze Market Availability</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Role Title (e.g., Senior Software Engineer)"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g., San Francisco, CA)"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleAnalyzeMarket}
            disabled={loading || !roleTitle || !location}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Analyze
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Market Analyses ({marketAnalyses.length})</h3>
        <div className="space-y-4">
          {marketAnalyses.map((analysis) => (
            <div key={analysis.id} className="p-4 border dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium dark:text-white">{analysis.roleTitle}</p>
                  <p className="text-sm text-gray-500">{analysis.location} - {analysis.experienceLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Availability Score</p>
                  <p className={`text-2xl font-bold ${
                    analysis.availabilityScore >= 70 ? 'text-green-600 dark:text-green-400' :
                    analysis.availabilityScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {analysis.availabilityScore}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500">Talent Supply</p>
                  <p className="font-medium dark:text-white">{analysis.talentSupply}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500">Hiring Demand</p>
                  <p className="font-medium dark:text-white">{analysis.hiringDemand}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500">Competitor Activity</p>
                  <p className="font-medium dark:text-white">{analysis.competitorActivity}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-500">Est. Pool</p>
                  <p className="font-medium dark:text-white">{analysis.estimatedCandidatePool.toLocaleString()}</p>
                </div>
              </div>
              {analysis.marketSalaryMedian && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Salary Range: ${analysis.marketSalaryMin?.toLocaleString()} - ${analysis.marketSalaryMax?.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Median: ${analysis.marketSalaryMedian.toLocaleString()} | Trend: {analysis.salaryTrend}
                  </p>
                </div>
              )}
              {(analysis.scarcestSkills?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Scarcest Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.scarcestSkills?.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                        {skill.skill} ({skill.scarcity})
                      </span>
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

  const renderPipelineHealth = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Pipeline Health Analysis ({pipelineHealth.length})</h3>
        <div className="space-y-4">
          {pipelineHealth.map((health) => (
            <div key={health.id} className="p-4 border dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium dark:text-white">
                    {health.jobId ? `Job #${health.jobId.slice(0, 8)}` : 'Overall Pipeline'}
                  </p>
                  <p className="text-sm text-gray-500">{health.currentCandidates} candidates</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(health.healthGrade)}`}>
                    Grade {health.healthGrade}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    health.healthTrend === 'IMPROVING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    health.healthTrend === 'DECLINING' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {health.healthTrend}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Object.entries(health.byStage ?? {}).map(([stage, count]) => (
                  <div key={stage} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <p className="text-xs text-gray-500 capitalize">{stage}</p>
                    <p className="font-bold dark:text-white">{count}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Health Score</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{health.overallHealthScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Fill Probability</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {(health.fillProbability * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Predicted Hires</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{health.predictedHires}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Stalled</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{health.stalledCandidates}</p>
                </div>
              </div>
              {(health.urgentActions?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Urgent Actions:</p>
                  <div className="space-y-1">
                    {health.urgentActions?.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          action.priority === 'high' ? 'bg-red-500' :
                          action.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="text-sm dark:text-gray-300">{action.action}</span>
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
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'hiring-success':
        return renderHiringSuccess();
      case 'time-to-hire':
        return renderTimeToHire();
      case 'market':
        return renderMarketAnalysis();
      case 'pipeline':
        return renderPipelineHealth();
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Select a tab to view predictive analytics for {activeTab.replace('-', ' ')}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Predictive Analytics Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered predictions for hiring, retention, and talent market insights
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && renderContent()}
      </div>
    </div>
  );
};

export default PredictiveAnalyticsHub;
