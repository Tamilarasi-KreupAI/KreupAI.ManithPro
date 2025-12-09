import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  SalaryAlignment,
  MarketSalaryData,
  LocationCompatibility,
  DIMetrics,
  JobPostingBiasAnalysis,
  ScoreExplanation,
  ScoreCalibration,
  CalibrationTestResults,
  CalibrationPerformance,
  SalaryFlexibility,
  LocationCompatibilityLevel,
} from '../../types';
import {
  salaryAlignmentAPI,
  locationCompatibilityAPI,
  diMetricsAPI,
  explainableAIAPI,
  calibrationAPI,
} from '../../services/batch10ExtendedScoringAPI';

type TabType = 'salary' | 'location' | 'di-metrics' | 'explanations' | 'calibration';

const ExtendedScoringHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('salary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Salary Alignment State
  const [salaryAlignment, setSalaryAlignment] = useState<SalaryAlignment | null>(null);
  const [marketData, setMarketData] = useState<MarketSalaryData | null>(null);
  const [salaryForm, setSalaryForm] = useState({
    expectedSalaryMin: 0,
    expectedSalaryMax: 0,
    expectedSalaryCurrency: 'USD',
    salaryFlexibility: 'SOMEWHAT_FLEXIBLE' as SalaryFlexibility,
    includesBenefits: true,
    includesEquity: false,
    remoteWorkConsideration: true,
  });

  // Location Compatibility State
  const [locationCompatibility, setLocationCompatibility] = useState<LocationCompatibility | null>(null);
  const [locationForm, setLocationForm] = useState({
    preferredLocations: [''],
    willingToRelocate: false,
    relocationAssistanceRequired: false,
    remotePreference: 'HYBRID' as 'REMOTE' | 'HYBRID' | 'ONSITE' | 'FLEXIBLE',
    maxCommuteMinutes: 45,
    workAuthorizationStatus: 'AUTHORIZED',
  });

  // D&I Metrics State
  const [diMetrics, setDIMetrics] = useState<DIMetrics | null>(null);
  const [biasAnalysis, setBiasAnalysis] = useState<JobPostingBiasAnalysis | null>(null);
  const [jobPostingText, setJobPostingText] = useState('');

  // Explainable AI State
  const [scoreExplanation, setScoreExplanation] = useState<ScoreExplanation | null>(null);
  const [selectedScoreType, setSelectedScoreType] = useState('PROFILE_SCORE');
  const [selectedScoreId, setSelectedScoreId] = useState('');

  // Calibration State
  const [calibrations, setCalibrations] = useState<ScoreCalibration[]>([]);
  const [selectedCalibration, setSelectedCalibration] = useState<ScoreCalibration | null>(null);
  const [testResults, setTestResults] = useState<CalibrationTestResults | null>(null);
  const [calibrationPerformance, setCalibrationPerformance] = useState<CalibrationPerformance | null>(null);

  const isRecruiterOrAdmin = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 'salary':
          const [alignmentData, marketDataResult] = await Promise.all([
            salaryAlignmentAPI.getSalaryAlignment(),
            salaryAlignmentAPI.getMarketSalaryData({ role: 'Software Engineer', location: 'United States' }),
          ]);
          setSalaryAlignment(alignmentData);
          setMarketData(marketDataResult);
          if (alignmentData) {
            setSalaryForm({
              expectedSalaryMin: alignmentData.expectedSalaryMin || 0,
              expectedSalaryMax: alignmentData.expectedSalaryMax || 0,
              expectedSalaryCurrency: alignmentData.expectedSalaryCurrency,
              salaryFlexibility: alignmentData.salaryFlexibility,
              includesBenefits: alignmentData.includesBenefits || true,
              includesEquity: alignmentData.includesEquity || false,
              remoteWorkConsideration: alignmentData.remoteWorkConsideration || true,
            });
          }
          break;
        case 'location':
          const locationData = await locationCompatibilityAPI.getLocationCompatibility();
          setLocationCompatibility(locationData);
          if (locationData) {
            setLocationForm({
              preferredLocations: locationData.preferredLocations || [''],
              willingToRelocate: locationData.willingToRelocate || false,
              relocationAssistanceRequired: locationData.relocationAssistanceRequired || false,
              remotePreference: locationData.remotePreference || 'HYBRID',
              maxCommuteMinutes: locationData.maxCommuteMinutes || 45,
              workAuthorizationStatus: locationData.workAuthorizationStatus || 'AUTHORIZED',
            });
          }
          break;
        case 'di-metrics':
          if (isRecruiterOrAdmin) {
            const diData = await diMetricsAPI.getDIMetrics();
            setDIMetrics(diData);
          }
          break;
        case 'explanations':
          // Will load on demand when user selects a score
          break;
        case 'calibration':
          if (isRecruiterOrAdmin && user?.companyId) {
            const calibrationData = await calibrationAPI.getCalibrationSettings(user.companyId);
            setCalibrations(calibrationData);
          }
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSalaryExpectations = async () => {
    setLoading(true);
    try {
      const updated = await salaryAlignmentAPI.updateSalaryExpectations(salaryForm);
      setSalaryAlignment(updated);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update salary expectations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocationPreferences = async () => {
    setLoading(true);
    try {
      const updated = await locationCompatibilityAPI.updateLocationPreferences(locationForm);
      setLocationCompatibility(updated);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update location preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeJobPosting = async () => {
    if (!jobPostingText.trim()) return;
    setLoading(true);
    try {
      const analysis = await diMetricsAPI.analyzeJobPostingBias(jobPostingText);
      setBiasAnalysis(analysis);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze job posting');
    } finally {
      setLoading(false);
    }
  };

  const handleGetExplanation = async () => {
    if (!selectedScoreId) return;
    setLoading(true);
    try {
      const explanation = await explainableAIAPI.getScoreExplanation(selectedScoreType, selectedScoreId);
      setScoreExplanation(explanation);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to get score explanation');
    } finally {
      setLoading(false);
    }
  };

  const handleTestCalibration = async (calibrationId: string) => {
    setLoading(true);
    try {
      const results = await calibrationAPI.testCalibration(calibrationId, {
        sampleSize: 100,
        includeHistorical: true,
      });
      setTestResults(results);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to test calibration');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCalibration = async (calibrationId: string) => {
    setLoading(true);
    try {
      await calibrationAPI.activateCalibration(calibrationId);
      if (user?.companyId) {
        const calibrationData = await calibrationAPI.getCalibrationSettings(user.companyId);
        setCalibrations(calibrationData);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to activate calibration');
    } finally {
      setLoading(false);
    }
  };

  const getAlignmentColor = (category: string): string => {
    switch (category) {
      case 'PERFECT_MATCH': return 'text-green-600 dark:text-green-400';
      case 'GOOD_MATCH': return 'text-blue-600 dark:text-blue-400';
      case 'NEGOTIABLE': return 'text-yellow-600 dark:text-yellow-400';
      case 'MISALIGNED': return 'text-orange-600 dark:text-orange-400';
      case 'SIGNIFICANTLY_MISALIGNED': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCompatibilityColor = (level: LocationCompatibilityLevel): string => {
    switch (level) {
      case 'EXCELLENT': return 'text-green-600 dark:text-green-400';
      case 'GOOD': return 'text-blue-600 dark:text-blue-400';
      case 'MODERATE': return 'text-yellow-600 dark:text-yellow-400';
      case 'CHALLENGING': return 'text-orange-600 dark:text-orange-400';
      case 'INCOMPATIBLE': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDIGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'F': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const tabs = [
    { id: 'salary' as TabType, label: 'Salary Alignment', icon: '💰' },
    { id: 'location' as TabType, label: 'Location', icon: '📍' },
    { id: 'di-metrics' as TabType, label: 'D&I Metrics', icon: '🌈', requiresRole: true },
    { id: 'explanations' as TabType, label: 'Score Explanations', icon: '🔍' },
    { id: 'calibration' as TabType, label: 'Calibration', icon: '⚙️', requiresRole: true },
  ].filter(tab => !tab.requiresRole || isRecruiterOrAdmin);

  const renderSalaryTab = () => (
    <div className="space-y-6">
      {/* Current Alignment */}
      {salaryAlignment && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Salary Alignment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {salaryAlignment.alignmentScore?.toFixed(0) || '-'}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Alignment Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`text-xl font-semibold ${getAlignmentColor(salaryAlignment.alignmentCategory || '')}`}>
                {salaryAlignment.alignmentCategory?.replace(/_/g, ' ') || 'Not Analyzed'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Category</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {salaryAlignment.expectedSalaryCurrency} {salaryAlignment.expectedSalaryMin?.toLocaleString()} - {salaryAlignment.expectedSalaryMax?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Your Range</div>
            </div>
          </div>

          {salaryAlignment.negotiationInsights && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Negotiation Insights</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                {(salaryAlignment.negotiationInsights as string[]).map((insight, idx) => (
                  <li key={idx}>• {insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Market Data */}
      {marketData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Market Salary Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${marketData.percentile25?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">25th Percentile</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                ${marketData.median?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Median</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${marketData.percentile75?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">75th Percentile</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                ${marketData.percentile90?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">90th Percentile</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Based on {marketData.sampleSize} data points • Last updated: {new Date(marketData.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Update Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Update Salary Expectations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Salary
            </label>
            <input
              type="number"
              value={salaryForm.expectedSalaryMin}
              onChange={(e) => setSalaryForm({ ...salaryForm, expectedSalaryMin: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Salary
            </label>
            <input
              type="number"
              value={salaryForm.expectedSalaryMax}
              onChange={(e) => setSalaryForm({ ...salaryForm, expectedSalaryMax: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={salaryForm.expectedSalaryCurrency}
              onChange={(e) => setSalaryForm({ ...salaryForm, expectedSalaryCurrency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Flexibility
            </label>
            <select
              value={salaryForm.salaryFlexibility}
              onChange={(e) => setSalaryForm({ ...salaryForm, salaryFlexibility: e.target.value as SalaryFlexibility })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="FIRM">Firm</option>
              <option value="SOMEWHAT_FLEXIBLE">Somewhat Flexible</option>
              <option value="VERY_FLEXIBLE">Very Flexible</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={salaryForm.includesBenefits}
              onChange={(e) => setSalaryForm({ ...salaryForm, includesBenefits: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Includes Benefits</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={salaryForm.includesEquity}
              onChange={(e) => setSalaryForm({ ...salaryForm, includesEquity: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Includes Equity</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={salaryForm.remoteWorkConsideration}
              onChange={(e) => setSalaryForm({ ...salaryForm, remoteWorkConsideration: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Open to Remote (may affect salary)</span>
          </label>
        </div>
        <button
          onClick={handleUpdateSalaryExpectations}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Expectations'}
        </button>
      </div>
    </div>
  );

  const renderLocationTab = () => (
    <div className="space-y-6">
      {/* Current Compatibility */}
      {locationCompatibility && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Location Compatibility Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {locationCompatibility.compatibilityScore?.toFixed(0) || '-'}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Compatibility Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`text-xl font-semibold ${getCompatibilityColor(locationCompatibility.compatibilityLevel || 'MODERATE')}`}>
                {locationCompatibility.compatibilityLevel || 'Not Analyzed'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Level</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {locationCompatibility.timezoneOverlapHours || 0}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Timezone Overlap</div>
            </div>
          </div>

          {locationCompatibility.relocationFeasibility && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Relocation Feasibility</h4>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {(locationCompatibility.relocationFeasibility as any).score}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Timeline: {(locationCompatibility.relocationFeasibility as any).estimatedTimeline}
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Work Authorization</h4>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {locationCompatibility.workAuthorizationStatus}
                </div>
                {locationCompatibility.visaSponsorshipNeeded && (
                  <span className="text-sm text-orange-600 dark:text-orange-400">Visa sponsorship needed</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Update Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Update Location Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preferred Locations
            </label>
            <input
              type="text"
              value={locationForm.preferredLocations.join(', ')}
              onChange={(e) => setLocationForm({ ...locationForm, preferredLocations: e.target.value.split(',').map(s => s.trim()) })}
              placeholder="San Francisco, New York, Remote"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remote Preference
            </label>
            <select
              value={locationForm.remotePreference}
              onChange={(e) => setLocationForm({ ...locationForm, remotePreference: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="REMOTE">Fully Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-Site</option>
              <option value="FLEXIBLE">Flexible</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Commute (minutes)
            </label>
            <input
              type="number"
              value={locationForm.maxCommuteMinutes}
              onChange={(e) => setLocationForm({ ...locationForm, maxCommuteMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Work Authorization
            </label>
            <select
              value={locationForm.workAuthorizationStatus}
              onChange={(e) => setLocationForm({ ...locationForm, workAuthorizationStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="CITIZEN">Citizen</option>
              <option value="PERMANENT_RESIDENT">Permanent Resident</option>
              <option value="AUTHORIZED">Work Authorized</option>
              <option value="NEEDS_SPONSORSHIP">Needs Sponsorship</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={locationForm.willingToRelocate}
              onChange={(e) => setLocationForm({ ...locationForm, willingToRelocate: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Willing to Relocate</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={locationForm.relocationAssistanceRequired}
              onChange={(e) => setLocationForm({ ...locationForm, relocationAssistanceRequired: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Requires Relocation Assistance</span>
          </label>
        </div>
        <button
          onClick={handleUpdateLocationPreferences}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Preferences'}
        </button>
      </div>
    </div>
  );

  const renderDIMetricsTab = () => (
    <div className="space-y-6">
      {/* D&I Overview */}
      {diMetrics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Diversity & Inclusion Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {diMetrics.overallDIScore.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className={`px-3 py-1 text-lg font-bold rounded ${getDIGradeColor(diMetrics.diGrade)}`}>
                {diMetrics.diGrade}
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Grade</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {diMetrics.genderNeutralityScore?.toFixed(0) || '-'}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gender Neutrality</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {diMetrics.ageNeutralityScore?.toFixed(0) || '-'}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Age Neutrality</div>
            </div>
          </div>

          {diMetrics.biasIndicators && (diMetrics.biasIndicators as any[]).length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">Bias Indicators Detected</h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                {(diMetrics.biasIndicators as any[]).map((indicator, idx) => (
                  <li key={idx}>• {indicator.type}: {indicator.description}</li>
                ))}
              </ul>
            </div>
          )}

          {diMetrics.recommendations && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Recommendations</h4>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                {(diMetrics.recommendations as string[]).map((rec, idx) => (
                  <li key={idx}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Job Posting Bias Analyzer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Job Posting Bias Analyzer
        </h3>
        <textarea
          value={jobPostingText}
          onChange={(e) => setJobPostingText(e.target.value)}
          placeholder="Paste job posting text here to analyze for potential bias..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={handleAnalyzeJobPosting}
          disabled={loading || !jobPostingText.trim()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze for Bias'}
        </button>

        {biasAnalysis && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {biasAnalysis.overallBiasScore.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bias Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {biasAnalysis.inclusivityScore.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Inclusivity</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {biasAnalysis.readabilityScore.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Readability</div>
              </div>
            </div>

            {biasAnalysis.flaggedPhrases.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Flagged Phrases</h4>
                <div className="space-y-2">
                  {biasAnalysis.flaggedPhrases.map((phrase, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-red-800 dark:text-red-300 font-medium">"{phrase.phrase}"</span>
                      <span className="text-red-700 dark:text-red-400 ml-2">- {phrase.reason}</span>
                      {phrase.suggestion && (
                        <span className="text-green-700 dark:text-green-400 ml-2">
                          Suggestion: "{phrase.suggestion}"
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {biasAnalysis.suggestedRevisions && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Suggested Revisions</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">
                  {biasAnalysis.suggestedRevisions}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderExplanationsTab = () => (
    <div className="space-y-6">
      {/* Score Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Get Score Explanation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Score Type
            </label>
            <select
              value={selectedScoreType}
              onChange={(e) => setSelectedScoreType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="PROFILE_SCORE">Profile Score</option>
              <option value="JOB_FIT">Job Fit Score</option>
              <option value="CULTURE_FIT">Culture Fit Score</option>
              <option value="TECHNICAL_DEPTH">Technical Depth Score</option>
              <option value="GROWTH_POTENTIAL">Growth Potential Score</option>
              <option value="COMMUNICATION">Communication Score</option>
              <option value="RELIABILITY">Reliability Score</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Score ID
            </label>
            <input
              type="text"
              value={selectedScoreId}
              onChange={(e) => setSelectedScoreId(e.target.value)}
              placeholder="Enter score ID or leave blank for latest"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleGetExplanation}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Explanation'}
        </button>
      </div>

      {/* Explanation Display */}
      {scoreExplanation && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {scoreExplanation.headline}
            </h3>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {scoreExplanation.scoreValue.toFixed(0)}%
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{scoreExplanation.summary}</p>

          {/* Score Components */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Score Components</h4>
            <div className="space-y-3">
              {(scoreExplanation.components as any[]).map((component, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{component.name}</span>
                      <span className="text-gray-500">{(component.weight * 100).toFixed(0)}% weight</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${component.score}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {component.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors & Detractors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Top Contributors</h4>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                {(scoreExplanation.topContributors as any[]).map((item, idx) => (
                  <li key={idx}>+ {item.factor}: +{item.impact}%</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Areas for Improvement</h4>
              <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                {(scoreExplanation.topDetractors as any[]).map((item, idx) => (
                  <li key={idx}>- {item.factor}: {item.impact}%</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improvement Suggestions */}
          {scoreExplanation.improvementSuggestions && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Improvement Suggestions</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                {(scoreExplanation.improvementSuggestions as any[]).map((suggestion, idx) => (
                  <li key={idx}>
                    <strong>{suggestion.action}:</strong> {suggestion.description}
                    <span className="text-blue-600 dark:text-blue-400 ml-2">
                      (Potential impact: +{suggestion.potentialImpact}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Algorithm version: {scoreExplanation.algorithmVersion} |
            Confidence: {(scoreExplanation.confidenceLevel * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );

  const renderCalibrationTab = () => (
    <div className="space-y-6">
      {/* Calibration List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Score Calibration Settings
        </h3>

        {calibrations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No calibration settings found.</p>
        ) : (
          <div className="space-y-4">
            {calibrations.map((calibration) => (
              <div
                key={calibration.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCalibration?.id === calibration.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCalibration(calibration)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {calibration.calibrationName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Scope: {calibration.scope} | Status: {calibration.validationStatus}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {calibration.isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded">
                        Active
                      </span>
                    )}
                    {calibration.hireCorrelation && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Correlation: {(calibration.hireCorrelation * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Calibration Details */}
      {selectedCalibration && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedCalibration.calibrationName} - Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Score Weights */}
            {selectedCalibration.profileScoreWeights && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Profile Score Weights</h4>
                <div className="space-y-2">
                  {Object.entries(selectedCalibration.profileScoreWeights as Record<string, number>).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{key}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{(value * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Fit Weights */}
            {selectedCalibration.jobFitWeights && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Job Fit Weights</h4>
                <div className="space-y-2">
                  {Object.entries(selectedCalibration.jobFitWeights as Record<string, number>).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{key}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{(value * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Minimum Thresholds */}
            {selectedCalibration.minimumThresholds && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Minimum Thresholds</h4>
                <div className="space-y-2">
                  {Object.entries(selectedCalibration.minimumThresholds as Record<string, number>).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{key}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knockout Criteria */}
            {selectedCalibration.knockoutCriteria && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Knockout Criteria</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {(selectedCalibration.knockoutCriteria as string[]).map((criterion, idx) => (
                    <li key={idx}>• {criterion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => handleTestCalibration(selectedCalibration.id)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Calibration'}
            </button>
            {!selectedCalibration.isActive && user?.role === 'ADMIN' && (
              <button
                onClick={() => handleActivateCalibration(selectedCalibration.id)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Activate
              </button>
            )}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Calibration Test Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {testResults.sampleSize}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sample Size</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(testResults.predictedHireRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Predicted Hire Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {testResults.averageScoreChange > 0 ? '+' : ''}{testResults.averageScoreChange.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score Change</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(testResults.correlationWithOutcomes * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Outcome Correlation</div>
            </div>
          </div>

          {testResults.recommendations && testResults.recommendations.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Recommendations</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                {testResults.recommendations.map((rec, idx) => (
                  <li key={idx}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Extended Scoring & Calibration
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <>
          {activeTab === 'salary' && renderSalaryTab()}
          {activeTab === 'location' && renderLocationTab()}
          {activeTab === 'di-metrics' && renderDIMetricsTab()}
          {activeTab === 'explanations' && renderExplanationsTab()}
          {activeTab === 'calibration' && renderCalibrationTab()}
        </>
      )}
    </div>
  );
};

export default ExtendedScoringHub;
