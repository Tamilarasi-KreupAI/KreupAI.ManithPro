// Batch 30: Recruitment Analytics Hub Component (9.1.1-9.1.12)
import React, { useState, useEffect } from 'react';
import {
  FunnelAnalytics,
  TimeToHireAverages,
  CostBreakdown,
  SourceEffectiveness,
  RecruiterPerformance,
  RecruiterLeaderboard,
  OfferAcceptanceRates,
  PipelineVelocity,
  BottleneckAnalysis,
  QualityScoreSummary,
  DiversityAnalyticsData,
  InterviewOfferRatio,
  DropOffAnalysisData,
  RecruitmentSLA,
  SLATracking,
  RecruitmentAnalyticsDashboard,
  RecruitmentStats
} from '../../types';
import {
  funnelAPI,
  timeToHireAPI,
  costPerHireAPI,
  sourceAPI,
  recruiterAPI,
  offerAPI,
  velocityAPI,
  qualityAPI,
  diversityAPI,
  interviewRatioAPI,
  dropOffAPI,
  slaAPI,
  dashboardAPI
} from '../../services/batch30RecruitmentAnalyticsAPI';

type TabType = 'dashboard' | 'funnel' | 'time' | 'cost' | 'sources' | 'recruiters' | 'offers' | 'velocity' | 'quality' | 'diversity' | 'interviews' | 'dropoff' | 'sla';

const RecruitmentAnalyticsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard state
  const [dashboard, setDashboard] = useState<RecruitmentAnalyticsDashboard | null>(null);
  const [stats, setStats] = useState<RecruitmentStats | null>(null);

  // Funnel state
  const [funnelData, setFunnelData] = useState<FunnelAnalytics[]>([]);

  // Time-to-Hire state
  const [timeToHireAvg, setTimeToHireAvg] = useState<TimeToHireAverages | null>(null);

  // Cost state
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);

  // Source state
  const [sources, setSources] = useState<SourceEffectiveness[]>([]);

  // Recruiter state
  const [recruiters, setRecruiters] = useState<RecruiterPerformance[]>([]);
  const [leaderboard, setLeaderboard] = useState<RecruiterLeaderboard | null>(null);

  // Offer state
  const [offerRates, setOfferRates] = useState<OfferAcceptanceRates | null>(null);

  // Velocity state
  const [velocity, setVelocity] = useState<PipelineVelocity[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAnalysis | null>(null);

  // Quality state
  const [qualitySummary, setQualitySummary] = useState<QualityScoreSummary | null>(null);

  // Diversity state
  const [diversityData, setDiversityData] = useState<DiversityAnalyticsData | null>(null);

  // Interview ratio state
  const [interviewRatios, setInterviewRatios] = useState<InterviewOfferRatio[]>([]);

  // Drop-off state
  const [dropOffData, setDropOffData] = useState<DropOffAnalysisData | null>(null);

  // SLA state
  const [slas, setSLAs] = useState<RecruitmentSLA[]>([]);
  const [slaTracking, setSLATracking] = useState<SLATracking[]>([]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 'dashboard':
          const [dashData, statsData] = await Promise.all([
            dashboardAPI.getDashboard(),
            dashboardAPI.getStats()
          ]);
          setDashboard(dashData);
          setStats(statsData);
          break;
        case 'funnel':
          const funnel = await funnelAPI.getAnalytics();
          setFunnelData(funnel);
          break;
        case 'time':
          const timeAvg = await timeToHireAPI.getAverages();
          setTimeToHireAvg(timeAvg);
          break;
        case 'cost':
          const cost = await costPerHireAPI.getBreakdown();
          setCostBreakdown(cost);
          break;
        case 'sources':
          const srcData = await sourceAPI.getEffectiveness();
          setSources(srcData);
          break;
        case 'recruiters':
          const [recData, lbData] = await Promise.all([
            recruiterAPI.getPerformance(),
            recruiterAPI.getLeaderboard()
          ]);
          setRecruiters(recData);
          setLeaderboard(lbData);
          break;
        case 'offers':
          const rates = await offerAPI.getRates();
          setOfferRates(rates);
          break;
        case 'velocity':
          const [velData, bnData] = await Promise.all([
            velocityAPI.getVelocity(),
            velocityAPI.getBottleneckAnalysis()
          ]);
          setVelocity(velData);
          setBottlenecks(bnData);
          break;
        case 'quality':
          const qualSum = await qualityAPI.getSummary();
          setQualitySummary(qualSum);
          break;
        case 'diversity':
          const divData = await diversityAPI.getAnalytics();
          setDiversityData(divData);
          break;
        case 'interviews':
          const intRatios = await interviewRatioAPI.getRatios();
          setInterviewRatios(intRatios);
          break;
        case 'dropoff':
          const doData = await dropOffAPI.getAnalysis();
          setDropOffData(doData);
          break;
        case 'sla':
          const [slasData, trackingData] = await Promise.all([
            slaAPI.getSLAs(),
            slaAPI.getTracking()
          ]);
          setSLAs(slasData);
          setSLATracking(trackingData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'funnel', label: 'Funnel', icon: '📈' },
    { id: 'time', label: 'Time-to-Hire', icon: '⏱️' },
    { id: 'cost', label: 'Cost Analysis', icon: '💰' },
    { id: 'sources', label: 'Sources', icon: '🎯' },
    { id: 'recruiters', label: 'Recruiters', icon: '👥' },
    { id: 'offers', label: 'Offers', icon: '📝' },
    { id: 'velocity', label: 'Velocity', icon: '🚀' },
    { id: 'quality', label: 'Quality', icon: '⭐' },
    { id: 'diversity', label: 'Diversity', icon: '🌍' },
    { id: 'interviews', label: 'Interviews', icon: '🎤' },
    { id: 'dropoff', label: 'Drop-off', icon: '📉' },
    { id: 'sla', label: 'SLAs', icon: '⏰' }
  ];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const renderDashboard = () => {
    if (!dashboard || !stats) return null;
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Hires</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboard.summary.totalHires}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Time to Hire</h3>
            <p className="text-3xl font-bold text-green-600">{dashboard.summary.avgTimeToHire} days</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Cost per Hire</h3>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(dashboard.summary.avgCostPerHire)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Offer Accept Rate</h3>
            <p className="text-3xl font-bold text-orange-600">{dashboard.summary.offerAcceptanceRate}%</p>
          </div>
        </div>

        {/* Funnel Snapshot */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recruitment Funnel</h3>
          <div className="flex items-center justify-between">
            {Object.entries(dashboard.funnelSnapshot).map(([stage, count], index, arr) => (
              <React.Fragment key={stage}>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-gray-500 capitalize">{stage}</p>
                </div>
                {index < arr.length - 1 && (
                  <div className="text-gray-300 text-2xl">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Top Sources and Recruiters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Sources</h3>
            <div className="space-y-3">
              {dashboard.topSources.map((source, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{source.name}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{source.hires} hires</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Recruiters</h3>
            <div className="space-y-3">
              {dashboard.topRecruiters.map((rec, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{rec.name}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{rec.hires} hires</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {rec.avgTime} days avg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">SLA Compliance</h3>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{dashboard.slaCompliance.overall}%</p>
              <p className="text-sm text-gray-500">Overall</p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4">
              {Object.entries(dashboard.slaCompliance.byType).map(([type, rate]) => (
                <div key={type} className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-xl font-semibold">{rate}%</p>
                  <p className="text-xs text-gray-500 capitalize">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {dashboard.alerts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Alerts</h3>
            <div className="space-y-2">
              {dashboard.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded flex items-center ${
                  alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 'bg-blue-50 text-blue-800'
                }`}>
                  <span className="mr-2">{alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFunnel = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Funnel Analytics</h2>
      {funnelData.map((funnel) => (
        <div key={funnel.id} className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{funnel.periodType} Report</h3>
            <span className="text-sm text-gray-500">
              {funnel.periodStart} - {funnel.periodEnd}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Sourced', value: funnel.sourced },
              { label: 'Applied', value: funnel.applied },
              { label: 'Screened', value: funnel.screened },
              { label: 'Interviewed', value: funnel.interviewed },
              { label: 'Offered', value: funnel.offered },
              { label: 'Hired', value: funnel.hired }
            ].map((stage, index) => (
              <div key={index} className="text-center p-4 bg-blue-50 rounded">
                <p className="text-2xl font-bold text-blue-600">{stage.value}</p>
                <p className="text-sm text-gray-500">{stage.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Source → Apply', value: funnel.sourceToApply },
              { label: 'Apply → Screen', value: funnel.applyToScreen },
              { label: 'Screen → Interview', value: funnel.screenToInterview },
              { label: 'Interview → Offer', value: funnel.interviewToOffer },
              { label: 'Offer → Hire', value: funnel.offerToHire }
            ].map((conv, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded">
                <p className="text-lg font-semibold">{conv.value}%</p>
                <p className="text-xs text-gray-500">{conv.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-500">Overall Conversion Rate</p>
            <p className="text-3xl font-bold text-green-600">{funnel.overallConversion}%</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTimeToHire = () => {
    if (!timeToHireAvg) return null;
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Time-to-Hire Analytics</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Overall Averages</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(timeToHireAvg.overall).map(([key, value]) => (
              <div key={key} className="text-center p-4 bg-blue-50 rounded">
                <p className="text-2xl font-bold text-blue-600">{value}</p>
                <p className="text-xs text-gray-500">{key.replace('avg', '').replace(/([A-Z])/g, ' $1')}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">By Department</h3>
            <div className="space-y-3">
              {timeToHireAvg.byDepartment.map((dept, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{dept.department}</span>
                  <span className="font-semibold">{dept.avgTimeToHire} days</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">By Seniority</h3>
            <div className="space-y-3">
              {timeToHireAvg.bySeniority.map((level, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{level.level}</span>
                  <span className="font-semibold">{level.avgTimeToHire} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCostAnalysis = () => {
    if (!costBreakdown) return null;
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Cost-per-Hire Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Average Cost</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(costBreakdown.averageCostPerHire)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Median Cost</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(costBreakdown.medianCostPerHire)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Hiring Cost</h3>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(costBreakdown.totalHiringCost)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Hires</h3>
            <p className="text-3xl font-bold text-orange-600">{costBreakdown.totalHires}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Cost by Category</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Internal Costs</span>
                <span className="font-semibold">{formatCurrency(costBreakdown.byCategory.internalCosts)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>External Costs</span>
                <span className="font-semibold">{formatCurrency(costBreakdown.byCategory.externalCosts)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Cost by Source</h3>
            <div className="space-y-3">
              {costBreakdown.bySource.map((src, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{src.source}</span>
                  <div className="text-right">
                    <span className="font-semibold">{formatCurrency(src.avgCost)}</span>
                    <span className="text-sm text-gray-500 ml-2">({src.hires} hires)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSources = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Source Effectiveness</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sources.map((source) => (
          <div key={source.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{source.sourceName}</h3>
                <p className="text-sm text-gray-500">{source.sourceCategory}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${source.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {source.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-bold">{source.candidatesSourced}</p>
                <p className="text-xs text-gray-500">Sourced</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-bold">{source.hires}</p>
                <p className="text-xs text-gray-500">Hired</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-bold">{source.roi?.toFixed(1)}x</p>
                <p className="text-xs text-gray-500">ROI</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Avg Time to Hire:</span>
                <span className="ml-2 font-medium">{source.avgTimeToHire} days</span>
              </div>
              <div>
                <span className="text-gray-500">Avg Cost:</span>
                <span className="ml-2 font-medium">{formatCurrency(source.avgCostPerHire || 0)}</span>
              </div>
              <div>
                <span className="text-gray-500">Quality Score:</span>
                <span className="ml-2 font-medium">{source.avgQualityScore}/5</span>
              </div>
              <div>
                <span className="text-gray-500">Retention:</span>
                <span className="ml-2 font-medium">{source.retentionRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecruiters = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Recruiter Performance</h2>
      {leaderboard && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Leaderboard - {leaderboard.period}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Hires</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.rankings.map((rec) => (
                  <tr key={rec.rank} className="border-b">
                    <td className="px-4 py-3">
                      {rec.rank === 1 ? '🥇' : rec.rank === 2 ? '🥈' : rec.rank === 3 ? '🥉' : rec.rank}
                    </td>
                    <td className="px-4 py-3 font-medium">{rec.name}</td>
                    <td className="px-4 py-3">{rec.hires}</td>
                    <td className="px-4 py-3">{rec.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recruiters.map((rec) => (
          <div key={rec.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{rec.recruiterName}</h3>
                <p className="text-sm text-gray-500">Rank #{rec.rank} - {rec.tier}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                rec.tier === 'Top' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {rec.tier}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-bold">{rec.hiresCompleted}</p>
                <p className="text-xs text-gray-500">Hires</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-bold">{rec.fillRate}%</p>
                <p className="text-xs text-gray-500">Fill Rate</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-bold">{rec.avgTimeToHire}</p>
                <p className="text-xs text-gray-500">Avg Days</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Candidate Satisfaction:</span>
                <span className="font-medium">{rec.candidateSatisfaction}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Manager Satisfaction:</span>
                <span className="font-medium">{rec.hiringManagerSatisfaction}/5</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOffers = () => {
    if (!offerRates) return null;
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Offer Acceptance Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Offers</h3>
            <p className="text-3xl font-bold text-blue-600">{offerRates.overall.totalOffers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Accepted</h3>
            <p className="text-3xl font-bold text-green-600">{offerRates.overall.accepted}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Acceptance Rate</h3>
            <p className="text-3xl font-bold text-purple-600">{offerRates.overall.acceptanceRate}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Decision Time</h3>
            <p className="text-3xl font-bold text-orange-600">{offerRates.overall.avgDaysToDecision} days</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">By Department</h3>
            <div className="space-y-3">
              {offerRates.byDepartment.map((dept, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{dept.department}</span>
                  <div className="text-right">
                    <span className="font-semibold">{dept.rate}%</span>
                    <span className="text-sm text-gray-500 ml-2">({dept.total} offers)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Decline Reasons</h3>
            <div className="space-y-3">
              {offerRates.declineReasons.map((reason, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{reason.reason}</span>
                  <div className="text-right">
                    <span className="font-semibold">{reason.count}</span>
                    <span className="text-sm text-gray-500 ml-2">({reason.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVelocity = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pipeline Velocity</h2>
      {velocity.map((v) => (
        <div key={v.id} className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4 mb-4">
            {[
              { label: 'Sourced', value: v.inSourced, color: 'blue' },
              { label: 'Screening', value: v.inScreening, color: 'yellow' },
              { label: 'Interview', value: v.inInterview, color: 'purple' },
              { label: 'Offer', value: v.inOffer, color: 'orange' },
              { label: 'Hired', value: v.hired, color: 'green' },
              { label: 'Rejected', value: v.rejected, color: 'red' },
              { label: 'Withdrawn', value: v.withdrawn, color: 'gray' }
            ].map((stage, index) => (
              <div key={index} className={`text-center p-3 bg-${stage.color}-50 rounded`}>
                <p className={`text-xl font-bold text-${stage.color}-600`}>{stage.value}</p>
                <p className="text-xs text-gray-500">{stage.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Stage Velocity (days)</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{v.sourcedToScreening}</p>
                <p className="text-xs text-gray-500">Source → Screen</p>
              </div>
              <div>
                <p className="text-lg font-bold">{v.screeningToInterview}</p>
                <p className="text-xs text-gray-500">Screen → Interview</p>
              </div>
              <div>
                <p className="text-lg font-bold">{v.interviewToOffer}</p>
                <p className="text-xs text-gray-500">Interview → Offer</p>
              </div>
              <div>
                <p className="text-lg font-bold">{v.offerToHire}</p>
                <p className="text-xs text-gray-500">Offer → Hire</p>
              </div>
            </div>
          </div>
          {v.bottleneckStage && (
            <div className="mt-4 p-3 bg-yellow-50 rounded text-yellow-800">
              <strong>Bottleneck:</strong> {v.bottleneckStage} stage
            </div>
          )}
        </div>
      ))}
      {bottlenecks && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Bottleneck Analysis</h3>
          <div className="p-4 bg-red-50 rounded mb-4">
            <h4 className="font-medium text-red-800">Current Bottleneck: {bottlenecks.currentBottleneck.stage}</h4>
            <p className="text-sm text-red-600">
              {bottlenecks.currentBottleneck.candidatesStuck} candidates stuck, averaging {bottlenecks.currentBottleneck.avgDays} days (target: {bottlenecks.currentBottleneck.targetDays})
            </p>
          </div>
          <h4 className="font-medium mb-2">Recommendations</h4>
          <div className="space-y-2">
            {bottlenecks.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded flex justify-between">
                <span>{rec.action}</span>
                <span className="text-green-600">{rec.expectedImprovement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderQuality = () => {
    if (!qualitySummary) return null;
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Quality of Hire</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Overall Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(qualitySummary.overall).map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-gray-50 rounded">
                <p className="text-xl font-bold text-blue-600">
                  {typeof value === 'number' ? value.toFixed(1) : value}
                  {key.includes('Rate') || key.includes('Days') ? '' : ''}
                </p>
                <p className="text-xs text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace('avg', 'Avg')}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Quality by Source</h3>
            <div className="space-y-3">
              {qualitySummary.bySource.map((src, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{src.source}</span>
                  <div className="text-right">
                    <span className="font-semibold">{src.avgQuality.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 ml-2">({src.retention}% retained)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Quality by Recruiter</h3>
            <div className="space-y-3">
              {qualitySummary.byRecruiter.map((rec, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{rec.name}</span>
                  <div className="text-right">
                    <span className="font-semibold">{rec.avgQuality.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 ml-2">({rec.hires} hires)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDiversity = () => {
    if (!diversityData) return null;
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Diversity Analytics</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Gender Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(diversityData.genderDistribution).map(([gender, count]) => (
              <div key={gender} className="text-center p-4 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-blue-600">{count}</p>
                <p className="text-sm text-gray-500 capitalize">{gender}</p>
                <p className="text-xs text-gray-400">
                  {((count / diversityData.totalApplicants) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Ethnicity Distribution</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Object.entries(diversityData.ethnicityDistribution).map(([ethnicity, count]) => (
              <div key={ethnicity} className="text-center p-4 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-purple-600">{count}</p>
                <p className="text-sm text-gray-500 capitalize">{ethnicity}</p>
                <p className="text-xs text-gray-400">
                  {((count / diversityData.totalApplicants) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Veteran Status</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(diversityData.veteranStatus).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-sm text-gray-500 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Disability Status</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(diversityData.disabilityStatus).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-sm text-gray-500 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInterviews = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Interview-to-Offer Ratios</h2>
      {interviewRatios.map((ratio) => (
        <div key={ratio.id} className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">{ratio.totalInterviews}</p>
              <p className="text-xs text-gray-500">Total Interviews</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">{ratio.uniqueCandidatesInterviewed}</p>
              <p className="text-xs text-gray-500">Unique Candidates</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <p className="text-2xl font-bold text-purple-600">{ratio.offersExtended}</p>
              <p className="text-xs text-gray-500">Offers Extended</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <p className="text-2xl font-bold text-orange-600">{ratio.hires}</p>
              <p className="text-xs text-gray-500">Hires</p>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-lg font-bold">{ratio.interviewsPerHire?.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Interviews/Hire</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-lg font-bold">{ratio.screenPassRate}%</p>
              <p className="text-xs text-gray-500">Screen Pass</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-lg font-bold">{ratio.technicalPassRate}%</p>
              <p className="text-xs text-gray-500">Technical Pass</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-lg font-bold">{ratio.onsitePassRate}%</p>
              <p className="text-xs text-gray-500">Onsite Pass</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-lg font-bold">{ratio.offerRate}%</p>
              <p className="text-xs text-gray-500">Offer Rate</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-lg font-bold">{ratio.acceptanceRate}%</p>
              <p className="text-xs text-gray-500">Acceptance</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDropOff = () => {
    if (!dropOffData) return null;
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Drop-off Analysis</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Stage Drop-offs</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(dropOffData.stageDropOffs).map(([stage, data]) => (
              <div key={stage} className="text-center p-4 bg-red-50 rounded">
                <p className="text-2xl font-bold text-red-600">{data.count}</p>
                <p className="text-sm text-gray-600">{data.rate}% rate</p>
                <p className="text-xs text-gray-500">{stage.replace(/([A-Z])/g, ' $1')}</p>
              </div>
            ))}
          </div>
          {dropOffData.worstStage && (
            <div className="mt-4 p-3 bg-red-100 rounded text-red-800">
              <strong>Worst Stage:</strong> {dropOffData.worstStage} with {dropOffData.worstDropRate}% drop rate
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Withdrawal Reasons</h3>
            <div className="space-y-2">
              {dropOffData.withdrawalReasons.map((reason, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{reason.reason}</span>
                  <div className="text-right">
                    <span className="font-semibold">{reason.count}</span>
                    <span className="text-sm text-gray-500 ml-2">({reason.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Rejection Reasons</h3>
            <div className="space-y-2">
              {dropOffData.rejectionReasons.map((reason, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>{reason.reason}</span>
                  <div className="text-right">
                    <span className="font-semibold">{reason.count}</span>
                    <span className="text-sm text-gray-500 ml-2">({reason.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSLA = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">SLA Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add SLA
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {slas.map((sla) => (
          <div key={sla.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{sla.name}</h3>
                <p className="text-sm text-gray-500">{sla.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${sla.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {sla.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-medium">{sla.slaType}</span>
              </div>
              <div>
                <span className="text-gray-500">Target:</span>
                <span className="ml-2 font-medium">{sla.targetValue} {sla.targetUnit}</span>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                  sla.priority === 'high' ? 'bg-red-100 text-red-800' :
                  sla.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{sla.priority}</span>
              </div>
              <div>
                <span className="text-gray-500">Escalation:</span>
                <span className="ml-2">{sla.escalationEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">SLA Compliance Tracking</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SLA</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Measured</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Met</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Missed</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Compliance</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Trend</th>
              </tr>
            </thead>
            <tbody>
              {slaTracking.map((tracking) => (
                <tr key={tracking.id} className="border-b">
                  <td className="px-4 py-3">{tracking.slaId}</td>
                  <td className="px-4 py-3">{tracking.totalMeasured}</td>
                  <td className="px-4 py-3 text-green-600">{tracking.metSLA}</td>
                  <td className="px-4 py-3 text-red-600">{tracking.missedSLA}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${(tracking.complianceRate || 0) >= 90 ? 'text-green-600' : (tracking.complianceRate || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {tracking.complianceRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={tracking.trend === 'improving' ? 'text-green-600' : tracking.trend === 'declining' ? 'text-red-600' : 'text-gray-600'}>
                      {tracking.trend === 'improving' ? '↑' : tracking.trend === 'declining' ? '↓' : '→'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'funnel': return renderFunnel();
      case 'time': return renderTimeToHire();
      case 'cost': return renderCostAnalysis();
      case 'sources': return renderSources();
      case 'recruiters': return renderRecruiters();
      case 'offers': return renderOffers();
      case 'velocity': return renderVelocity();
      case 'quality': return renderQuality();
      case 'diversity': return renderDiversity();
      case 'interviews': return renderInterviews();
      case 'dropoff': return renderDropOff();
      case 'sla': return renderSLA();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Analytics</h1>
          <p className="text-gray-500">Comprehensive insights into hiring performance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default RecruitmentAnalyticsHub;
