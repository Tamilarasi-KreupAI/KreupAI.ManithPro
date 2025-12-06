import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  ScreeningCriteria,
  CandidateSummary,
  RejectionEmail,
  OfferLetter,
  JobAdTest,
  ABTestResults,
  CompetitorJobAnalysis,
  SeniorityLevel,
} from '../../types';
import {
  screeningCriteriaAPI,
  candidateSummaryAPI,
  rejectionEmailAPI,
  offerLetterAPI,
  abTestingAPI,
  competitorAnalysisAPI,
} from '../../services/batch12ExtendedAIContentAPI';

type TabType = 'screening' | 'summaries' | 'rejections' | 'offers' | 'ab-testing' | 'competitor';

const ExtendedAIContentHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('screening');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Screening Criteria State
  const [screeningForm, setScreeningForm] = useState({
    jobTitle: '',
    seniorityLevel: 'MID' as SeniorityLevel,
    department: '',
    keyResponsibilities: '',
    requiredSkills: '',
  });
  const [generatedCriteria, setGeneratedCriteria] = useState<ScreeningCriteria | null>(null);
  const [criteriaList, setCriteriaList] = useState<ScreeningCriteria[]>([]);

  // Candidate Summary State
  const [summaryForm, setSummaryForm] = useState({
    candidateId: '',
    jobId: '',
    includeAIAnalysis: true,
  });
  const [generatedSummary, setGeneratedSummary] = useState<CandidateSummary | null>(null);
  const [summaryList, setSummaryList] = useState<CandidateSummary[]>([]);

  // Rejection Email State
  const [rejectionForm, setRejectionForm] = useState({
    candidateId: '',
    jobId: '',
    rejectionStage: 'INTERVIEW' as 'SCREENING' | 'INTERVIEW' | 'FINAL' | 'OFFER',
    rejectionReason: '',
    toneLevel: 'PROFESSIONAL' as 'FORMAL' | 'PROFESSIONAL' | 'WARM',
    includeReasoning: true,
    suggestAlternatives: true,
  });
  const [generatedRejection, setGeneratedRejection] = useState<RejectionEmail | null>(null);
  const [rejectionList, setRejectionList] = useState<RejectionEmail[]>([]);

  // Offer Letter State
  const [offerForm, setOfferForm] = useState({
    candidateId: '',
    jobId: '',
    baseSalary: 100000,
    currency: 'USD',
    startDate: '',
    signingBonus: 0,
    equityType: 'RSU',
    equityAmount: 0,
    equityVesting: '4 years with 1 year cliff',
    benefits: '',
    expirationDays: 14,
  });
  const [generatedOffer, setGeneratedOffer] = useState<OfferLetter | null>(null);
  const [offerList, setOfferList] = useState<OfferLetter[]>([]);

  // A/B Testing State
  const [abTestForm, setAbTestForm] = useState({
    jobId: '',
    testName: '',
    testType: 'TITLE' as 'TITLE' | 'DESCRIPTION' | 'REQUIREMENTS' | 'SALARY_DISPLAY' | 'BENEFITS' | 'CTA',
    hypothesis: '',
    controlContent: '',
    variantContent: '',
    targetMetric: 'APPLICATIONS' as 'IMPRESSIONS' | 'CLICKS' | 'APPLICATIONS' | 'QUALIFIED_APPLICATIONS',
    minimumSampleSize: 1000,
  });
  const [abTestList, setAbTestList] = useState<JobAdTest[]>([]);
  const [selectedTestResults, setSelectedTestResults] = useState<ABTestResults | null>(null);

  // Competitor Analysis State
  const [competitorForm, setCompetitorForm] = useState({
    jobId: '',
    competitorCompanies: '',
    includeMarketData: true,
    includeBenefitsComparison: true,
  });
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorJobAnalysis | null>(null);
  const [analysisList, setAnalysisList] = useState<CompetitorJobAnalysis[]>([]);

  // Load existing data on tab change
  useEffect(() => {
    const loadData = async () => {
      try {
        switch (activeTab) {
          case 'screening':
            const criteriaRes = await screeningCriteriaAPI.getAll();
            setCriteriaList(criteriaRes.criteria);
            break;
          case 'summaries':
            const summariesRes = await candidateSummaryAPI.getAll();
            setSummaryList(summariesRes.summaries);
            break;
          case 'rejections':
            const rejectionsRes = await rejectionEmailAPI.getAll();
            setRejectionList(rejectionsRes.emails);
            break;
          case 'offers':
            const offersRes = await offerLetterAPI.getAll();
            setOfferList(offersRes.offers);
            break;
          case 'ab-testing':
            const testsRes = await abTestingAPI.getAll();
            setAbTestList(testsRes.tests);
            break;
          case 'competitor':
            const analysesRes = await competitorAnalysisAPI.getAll();
            setAnalysisList(analysesRes.analyses);
            break;
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, [activeTab]);

  // Handlers
  const handleGenerateScreeningCriteria = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await screeningCriteriaAPI.generate({
        jobTitle: screeningForm.jobTitle,
        seniorityLevel: screeningForm.seniorityLevel,
        department: screeningForm.department || undefined,
        keyResponsibilities: screeningForm.keyResponsibilities
          ? screeningForm.keyResponsibilities.split('\n').filter(Boolean)
          : undefined,
        requiredSkills: screeningForm.requiredSkills
          ? screeningForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
      });
      setGeneratedCriteria(result);
      setCriteriaList(prev => [result, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate screening criteria');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateSummaryAPI.generate({
        candidateId: summaryForm.candidateId,
        jobId: summaryForm.jobId,
        includeAIAnalysis: summaryForm.includeAIAnalysis,
      });
      setGeneratedSummary(result);
      setSummaryList(prev => [result, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate candidate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRejection = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await rejectionEmailAPI.generate({
        candidateId: rejectionForm.candidateId,
        jobId: rejectionForm.jobId,
        rejectionStage: rejectionForm.rejectionStage,
        rejectionReason: rejectionForm.rejectionReason || undefined,
        toneLevel: rejectionForm.toneLevel,
        includeReasoning: rejectionForm.includeReasoning,
        suggestAlternatives: rejectionForm.suggestAlternatives,
      });
      setGeneratedRejection(result);
      setRejectionList(prev => [result, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate rejection email');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRejection = async (id: string) => {
    setLoading(true);
    try {
      await rejectionEmailAPI.send(id);
      setRejectionList(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'SENT', sentAt: new Date() } : r))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send rejection email');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOffer = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await offerLetterAPI.generate({
        candidateId: offerForm.candidateId,
        jobId: offerForm.jobId,
        baseSalary: offerForm.baseSalary,
        currency: offerForm.currency,
        startDate: new Date(offerForm.startDate),
        signingBonus: offerForm.signingBonus || undefined,
        equityGrant: offerForm.equityAmount
          ? {
              type: offerForm.equityType,
              amount: offerForm.equityAmount,
              vestingSchedule: offerForm.equityVesting,
            }
          : undefined,
        benefits: offerForm.benefits
          ? offerForm.benefits.split('\n').filter(Boolean)
          : undefined,
        expirationDays: offerForm.expirationDays,
      });
      setGeneratedOffer(result);
      setOfferList(prev => [result, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate offer letter');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (id: string) => {
    setLoading(true);
    try {
      await offerLetterAPI.send(id);
      setOfferList(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'SENT', sentAt: new Date() } : o))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send offer letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateABTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await abTestingAPI.create({
        jobId: abTestForm.jobId,
        testName: abTestForm.testName,
        testType: abTestForm.testType,
        hypothesis: abTestForm.hypothesis,
        variants: [
          {
            variantName: 'Control',
            variantType: 'CONTROL',
            content: { value: abTestForm.controlContent },
            isControl: true,
          },
          {
            variantName: 'Variant A',
            variantType: 'VARIANT',
            content: { value: abTestForm.variantContent },
            isControl: false,
          },
        ],
        targetMetric: abTestForm.targetMetric,
        minimumSampleSize: abTestForm.minimumSampleSize,
      });
      setAbTestList(prev => [result, ...prev]);
      setAbTestForm({
        ...abTestForm,
        testName: '',
        hypothesis: '',
        controlContent: '',
        variantContent: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create A/B test');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (id: string) => {
    setLoading(true);
    try {
      const result = await abTestingAPI.start(id);
      setAbTestList(prev => prev.map(t => (t.id === id ? result : t)));
    } catch (err: any) {
      setError(err.message || 'Failed to start test');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async (id: string) => {
    setLoading(true);
    try {
      const results = await abTestingAPI.getResults(id);
      setSelectedTestResults(results);
    } catch (err: any) {
      setError(err.message || 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await competitorAnalysisAPI.analyze({
        jobId: competitorForm.jobId,
        competitorCompanies: competitorForm.competitorCompanies
          ? competitorForm.competitorCompanies.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
        includeMarketData: competitorForm.includeMarketData,
        includeBenefitsComparison: competitorForm.includeBenefitsComparison,
      });
      setCompetitorAnalysis(result);
      setAnalysisList(prev => [result, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze competitors');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'screening' as TabType, label: 'Screening Criteria', icon: 'check-list' },
    { id: 'summaries' as TabType, label: 'Candidate Summaries', icon: 'user-check' },
    { id: 'rejections' as TabType, label: 'Rejection Emails', icon: 'mail-x' },
    { id: 'offers' as TabType, label: 'Offer Letters', icon: 'file-text' },
    { id: 'ab-testing' as TabType, label: 'A/B Testing', icon: 'split' },
    { id: 'competitor' as TabType, label: 'Competitor Analysis', icon: 'trending-up' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      DECLINED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      RUNNING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      SETUP: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return styles[status] || styles.DRAFT;
  };

  const renderScreeningTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate Screening Criteria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              value={screeningForm.jobTitle}
              onChange={(e) => setScreeningForm({ ...screeningForm, jobTitle: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Seniority Level
            </label>
            <select
              value={screeningForm.seniorityLevel}
              onChange={(e) => setScreeningForm({ ...screeningForm, seniorityLevel: e.target.value as SeniorityLevel })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ENTRY">Entry Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <input
              type="text"
              value={screeningForm.department}
              onChange={(e) => setScreeningForm({ ...screeningForm, department: e.target.value })}
              placeholder="e.g., Engineering"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              value={screeningForm.requiredSkills}
              onChange={(e) => setScreeningForm({ ...screeningForm, requiredSkills: e.target.value })}
              placeholder="e.g., React, TypeScript, Node.js"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key Responsibilities (one per line)
            </label>
            <textarea
              value={screeningForm.keyResponsibilities}
              onChange={(e) => setScreeningForm({ ...screeningForm, keyResponsibilities: e.target.value })}
              rows={3}
              placeholder="Design and implement scalable systems&#10;Lead code reviews&#10;Mentor junior developers"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateScreeningCriteria}
          disabled={loading || !screeningForm.jobTitle}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Screening Criteria'}
        </button>
      </div>

      {generatedCriteria && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Screening Criteria
            </h3>
            <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(generatedCriteria.status)}`}>
              {generatedCriteria.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{generatedCriteria.totalPossibleScore}</div>
              <div className="text-xs text-indigo-500">Total Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{generatedCriteria.passingThreshold}</div>
              <div className="text-xs text-green-500">Passing Threshold</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{generatedCriteria.autoAdvanceThreshold || 'N/A'}</div>
              <div className="text-xs text-blue-500">Auto-Advance</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Knockout Questions</h4>
              <div className="space-y-2">
                {generatedCriteria.knockoutQuestions?.map((q: any, idx: number) => (
                  <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-gray-900 dark:text-white">{q.question}</p>
                    <div className="mt-1 text-xs text-red-600">
                      Expected: {q.expectedAnswer ? 'Yes' : 'No'} | Weight: {q.weight}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Scoring Questions</h4>
              <div className="space-y-2">
                {generatedCriteria.scoringQuestions?.map((q: any, idx: number) => (
                  <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-gray-900 dark:text-white">{q.question}</p>
                    <div className="mt-1 text-xs text-blue-600">
                      Max Score: {q.maxScore} | Category: {q.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Must-Have Criteria</h4>
                <ul className="space-y-1">
                  {generatedCriteria.mustHaveCriteria?.map((c: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-red-500 mr-2">*</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preferred Criteria</h4>
                <ul className="space-y-1">
                  {generatedCriteria.preferredCriteria?.map((c: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-green-500 mr-2">+</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Activate Criteria
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Edit Criteria
            </button>
          </div>
        </div>
      )}

      {criteriaList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Existing Screening Criteria
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b dark:border-gray-700">
                  <th className="pb-2">Job Title</th>
                  <th className="pb-2">Seniority</th>
                  <th className="pb-2">Passing Score</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {criteriaList.map((criteria) => (
                  <tr key={criteria.id} className="text-sm">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{criteria.jobTitle}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{criteria.seniorityLevel}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{criteria.passingThreshold}/{criteria.totalPossibleScore}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(criteria.status)}`}>
                        {criteria.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {new Date(criteria.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderSummariesTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate Candidate Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Candidate ID *
            </label>
            <input
              type="text"
              value={summaryForm.candidateId}
              onChange={(e) => setSummaryForm({ ...summaryForm, candidateId: e.target.value })}
              placeholder="Enter candidate ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job ID *
            </label>
            <input
              type="text"
              value={summaryForm.jobId}
              onChange={(e) => setSummaryForm({ ...summaryForm, jobId: e.target.value })}
              placeholder="Enter job ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={summaryForm.includeAIAnalysis}
                onChange={(e) => setSummaryForm({ ...summaryForm, includeAIAnalysis: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include AI-powered analysis (skills, experience, fit)
              </span>
            </label>
          </div>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={loading || !summaryForm.candidateId || !summaryForm.jobId}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      {generatedSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {generatedSummary.candidateName}
              </h3>
              <p className="text-sm text-gray-500">{generatedSummary.jobTitle}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                generatedSummary.recommendation === 'STRONG_HIRE' ? 'bg-green-100 text-green-800' :
                generatedSummary.recommendation === 'HIRE' ? 'bg-blue-100 text-blue-800' :
                generatedSummary.recommendation === 'MAYBE' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {generatedSummary.recommendation?.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                {generatedSummary.confidenceScore}% confidence
              </span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Executive Summary</h4>
            <p className="text-gray-700 dark:text-gray-300">{generatedSummary.executiveSummary}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-xl font-bold text-indigo-600">
                {generatedSummary.roleAlignment?.overallFit}%
              </div>
              <div className="text-xs text-indigo-500">Overall Fit</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {generatedSummary.roleAlignment?.technicalFit}%
              </div>
              <div className="text-xs text-green-500">Technical</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {generatedSummary.roleAlignment?.cultureFit}%
              </div>
              <div className="text-xs text-blue-500">Culture</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {generatedSummary.roleAlignment?.experienceFit}%
              </div>
              <div className="text-xs text-purple-500">Experience</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Strengths</h4>
              <div className="space-y-2">
                {generatedSummary.strengthsHighlight?.map((s: any, idx: number) => (
                  <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-medium text-green-800 dark:text-green-200">{s.area}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">{s.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Concerns</h4>
              <div className="space-y-2">
                {generatedSummary.concernsHighlight?.map((c: any, idx: number) => (
                  <div key={idx} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="font-medium text-yellow-800 dark:text-yellow-200">{c.area}</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">{c.description}</div>
                    <span className="text-xs text-yellow-500">Severity: {c.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRejectionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate Rejection Email
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Candidate ID *
            </label>
            <input
              type="text"
              value={rejectionForm.candidateId}
              onChange={(e) => setRejectionForm({ ...rejectionForm, candidateId: e.target.value })}
              placeholder="Enter candidate ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job ID *
            </label>
            <input
              type="text"
              value={rejectionForm.jobId}
              onChange={(e) => setRejectionForm({ ...rejectionForm, jobId: e.target.value })}
              placeholder="Enter job ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rejection Stage
            </label>
            <select
              value={rejectionForm.rejectionStage}
              onChange={(e) => setRejectionForm({ ...rejectionForm, rejectionStage: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="SCREENING">Screening</option>
              <option value="INTERVIEW">Interview</option>
              <option value="FINAL">Final Round</option>
              <option value="OFFER">Offer Stage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tone Level
            </label>
            <select
              value={rejectionForm.toneLevel}
              onChange={(e) => setRejectionForm({ ...rejectionForm, toneLevel: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="FORMAL">Formal</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="WARM">Warm & Personalized</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rejection Reason (optional)
            </label>
            <textarea
              value={rejectionForm.rejectionReason}
              onChange={(e) => setRejectionForm({ ...rejectionForm, rejectionReason: e.target.value })}
              rows={2}
              placeholder="Brief explanation for the rejection (will be incorporated sensitively)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2 flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rejectionForm.includeReasoning}
                onChange={(e) => setRejectionForm({ ...rejectionForm, includeReasoning: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include reasoning</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rejectionForm.suggestAlternatives}
                onChange={(e) => setRejectionForm({ ...rejectionForm, suggestAlternatives: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Suggest alternative roles</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleGenerateRejection}
          disabled={loading || !rejectionForm.candidateId || !rejectionForm.jobId}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Rejection Email'}
        </button>
      </div>

      {generatedRejection && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                To: {generatedRejection.candidateName}
              </h3>
              <p className="text-sm text-gray-500">{generatedRejection.candidateEmail}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(generatedRejection.status)}`}>
              {generatedRejection.status}
            </span>
          </div>

          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Subject</div>
            <div className="text-gray-900 dark:text-white">{generatedRejection.subject}</div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">Email Content</div>
            <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {generatedRejection.fullEmail}
            </div>
          </div>

          {generatedRejection.alternativeRoles && generatedRejection.alternativeRoles.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Suggested Alternative Roles</div>
              <div className="flex gap-2">
                {generatedRejection.alternativeRoles.map((role, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm rounded">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleSendRejection(generatedRejection.id)}
              disabled={loading || generatedRejection.status === 'SENT'}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Email'}
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Edit Email
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderOffersTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate Offer Letter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Candidate ID *
            </label>
            <input
              type="text"
              value={offerForm.candidateId}
              onChange={(e) => setOfferForm({ ...offerForm, candidateId: e.target.value })}
              placeholder="Enter candidate ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job ID *
            </label>
            <input
              type="text"
              value={offerForm.jobId}
              onChange={(e) => setOfferForm({ ...offerForm, jobId: e.target.value })}
              placeholder="Enter job ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={offerForm.startDate}
              onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Base Salary *
            </label>
            <input
              type="number"
              value={offerForm.baseSalary}
              onChange={(e) => setOfferForm({ ...offerForm, baseSalary: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={offerForm.currency}
              onChange={(e) => setOfferForm({ ...offerForm, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Signing Bonus
            </label>
            <input
              type="number"
              value={offerForm.signingBonus}
              onChange={(e) => setOfferForm({ ...offerForm, signingBonus: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Equity Type
            </label>
            <select
              value={offerForm.equityType}
              onChange={(e) => setOfferForm({ ...offerForm, equityType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="RSU">RSU</option>
              <option value="STOCK_OPTIONS">Stock Options</option>
              <option value="NONE">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Equity Amount ($)
            </label>
            <input
              type="number"
              value={offerForm.equityAmount}
              onChange={(e) => setOfferForm({ ...offerForm, equityAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Offer Expiration (days)
            </label>
            <input
              type="number"
              value={offerForm.expirationDays}
              onChange={(e) => setOfferForm({ ...offerForm, expirationDays: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Benefits (one per line)
            </label>
            <textarea
              value={offerForm.benefits}
              onChange={(e) => setOfferForm({ ...offerForm, benefits: e.target.value })}
              rows={3}
              placeholder="Health insurance&#10;401k matching&#10;Unlimited PTO"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateOffer}
          disabled={loading || !offerForm.candidateId || !offerForm.jobId || !offerForm.startDate || !offerForm.baseSalary}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Offer Letter'}
        </button>
      </div>

      {generatedOffer && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Offer Letter: {generatedOffer.candidateName}
              </h3>
              <p className="text-sm text-gray-500">{generatedOffer.jobTitle}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(generatedOffer.status)}`}>
              {generatedOffer.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">
                ${generatedOffer.baseSalary.toLocaleString()}
              </div>
              <div className="text-xs text-green-500">Base Salary</div>
            </div>
            {generatedOffer.signingBonus && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600">
                  ${generatedOffer.signingBonus.toLocaleString()}
                </div>
                <div className="text-xs text-blue-500">Signing Bonus</div>
              </div>
            )}
            {generatedOffer.equityGrant && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <div className="text-lg font-bold text-purple-600">
                  ${generatedOffer.equityGrant.amount?.toLocaleString()}
                </div>
                <div className="text-xs text-purple-500">{generatedOffer.equityGrant.type}</div>
              </div>
            )}
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
              <div className="text-lg font-bold text-orange-600">
                {new Date(generatedOffer.startDate).toLocaleDateString()}
              </div>
              <div className="text-xs text-orange-500">Start Date</div>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">Full Offer Letter</div>
            <div className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm">
              {generatedOffer.fullLetter}
            </div>
          </div>

          {generatedOffer.expirationDate && (
            <div className="mb-4 text-sm text-orange-600">
              Offer expires: {new Date(generatedOffer.expirationDate).toLocaleDateString()}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleSendOffer(generatedOffer.id)}
              disabled={loading || generatedOffer.status === 'SENT'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Offer'}
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Edit Offer
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderABTestingTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create A/B Test
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job ID *
            </label>
            <input
              type="text"
              value={abTestForm.jobId}
              onChange={(e) => setAbTestForm({ ...abTestForm, jobId: e.target.value })}
              placeholder="Enter job ID"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Test Name *
            </label>
            <input
              type="text"
              value={abTestForm.testName}
              onChange={(e) => setAbTestForm({ ...abTestForm, testName: e.target.value })}
              placeholder="e.g., Title Impact Test"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Test Type
            </label>
            <select
              value={abTestForm.testType}
              onChange={(e) => setAbTestForm({ ...abTestForm, testType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="TITLE">Job Title</option>
              <option value="DESCRIPTION">Description</option>
              <option value="REQUIREMENTS">Requirements</option>
              <option value="SALARY_DISPLAY">Salary Display</option>
              <option value="BENEFITS">Benefits</option>
              <option value="CTA">Call to Action</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Metric
            </label>
            <select
              value={abTestForm.targetMetric}
              onChange={(e) => setAbTestForm({ ...abTestForm, targetMetric: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="IMPRESSIONS">Impressions</option>
              <option value="CLICKS">Clicks</option>
              <option value="APPLICATIONS">Applications</option>
              <option value="QUALIFIED_APPLICATIONS">Qualified Applications</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hypothesis *
            </label>
            <input
              type="text"
              value={abTestForm.hypothesis}
              onChange={(e) => setAbTestForm({ ...abTestForm, hypothesis: e.target.value })}
              placeholder="e.g., A more specific job title will attract better-qualified candidates"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Control (Current)
            </label>
            <input
              type="text"
              value={abTestForm.controlContent}
              onChange={(e) => setAbTestForm({ ...abTestForm, controlContent: e.target.value })}
              placeholder="Current content"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Variant A
            </label>
            <input
              type="text"
              value={abTestForm.variantContent}
              onChange={(e) => setAbTestForm({ ...abTestForm, variantContent: e.target.value })}
              placeholder="Test variant content"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleCreateABTest}
          disabled={loading || !abTestForm.jobId || !abTestForm.testName || !abTestForm.hypothesis}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create A/B Test'}
        </button>
      </div>

      {abTestList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            A/B Tests
          </h3>
          <div className="space-y-4">
            {abTestList.map((test) => (
              <div key={test.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{test.testName}</h4>
                    <p className="text-sm text-gray-500">{test.hypothesis}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(test.status)}`}>
                    {test.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {test.currentSampleSize?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Sample Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {test.variants?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Variants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {test.confidenceLevel}%
                    </div>
                    <div className="text-xs text-gray-500">Confidence Target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600">
                      {test.statisticalSignificance ? `${test.statisticalSignificance}%` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Current Significance</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {test.status === 'SETUP' && (
                    <button
                      onClick={() => handleStartTest(test.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Start Test
                    </button>
                  )}
                  <button
                    onClick={() => handleViewResults(test.id)}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  >
                    View Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTestResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Test Results: {selectedTestResults.testName}
            </h3>
            <button
              onClick={() => setSelectedTestResults(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            {selectedTestResults.variantResults?.map((variant, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${variant.isControl ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {variant.variantName}
                    {variant.isControl && <span className="text-xs text-gray-500 ml-2">(Control)</span>}
                  </span>
                  {!variant.isControl && variant.improvement > 0 && (
                    <span className="text-green-600 font-medium">+{variant.improvement.toFixed(1)}%</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Impressions</div>
                    <div className="font-medium">{variant.metrics.impressions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Clicks</div>
                    <div className="font-medium">{variant.metrics.clicks.toLocaleString()} ({variant.metrics.clickRate.toFixed(1)}%)</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Applications</div>
                    <div className="font-medium">{variant.metrics.applications.toLocaleString()} ({variant.metrics.applicationRate.toFixed(1)}%)</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Confidence</div>
                    <div className="font-medium">{variant.confidence.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedTestResults.winner && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="font-medium text-green-800 dark:text-green-200">
                Winner: {selectedTestResults.winner.variantName}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                +{selectedTestResults.winner.improvement.toFixed(1)}% improvement with {selectedTestResults.winner.confidence.toFixed(1)}% confidence
              </div>
            </div>
          )}

          {selectedTestResults.recommendation && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                {selectedTestResults.recommendation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderCompetitorTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analyze Competitors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job ID *
            </label>
            <input
              type="text"
              value={competitorForm.jobId}
              onChange={(e) => setCompetitorForm({ ...competitorForm, jobId: e.target.value })}
              placeholder="Enter job ID to compare"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Competitor Companies (comma-separated)
            </label>
            <input
              type="text"
              value={competitorForm.competitorCompanies}
              onChange={(e) => setCompetitorForm({ ...competitorForm, competitorCompanies: e.target.value })}
              placeholder="e.g., Google, Meta, Amazon"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2 flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={competitorForm.includeMarketData}
                onChange={(e) => setCompetitorForm({ ...competitorForm, includeMarketData: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include market salary data</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={competitorForm.includeBenefitsComparison}
                onChange={(e) => setCompetitorForm({ ...competitorForm, includeBenefitsComparison: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include benefits comparison</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleAnalyzeCompetitors}
          disabled={loading || !competitorForm.jobId}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Competitors'}
        </button>
      </div>

      {competitorAnalysis && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Competitor Analysis: {competitorAnalysis.ourJobTitle}
              </h3>
              <p className="text-sm text-gray-500">
                Analyzed {competitorAnalysis.competitorJobs?.length || 0} competitor jobs
              </p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                competitorAnalysis.overallCompetitivenessScore >= 80 ? 'text-green-600' :
                competitorAnalysis.overallCompetitivenessScore >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {competitorAnalysis.overallCompetitivenessScore}%
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                competitorAnalysis.marketPosition === 'LEADER' ? 'bg-green-100 text-green-800' :
                competitorAnalysis.marketPosition === 'COMPETITIVE' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {competitorAnalysis.marketPosition}
              </div>
            </div>
          </div>

          {competitorAnalysis.salaryComparison && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Salary Comparison</h4>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    ${competitorAnalysis.salaryComparison.marketMedian?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Market Median</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">
                    ${competitorAnalysis.salaryComparison.ourMidpoint?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Our Midpoint</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {competitorAnalysis.salaryComparison.percentile}th
                  </div>
                  <div className="text-xs text-gray-500">Percentile</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {competitorAnalysis.salaryComparison.recommendation}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Competitive Strengths</h4>
              <div className="space-y-2">
                {competitorAnalysis.competitiveStrengths?.map((s: string, idx: number) => (
                  <div key={idx} className="flex items-start p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-green-500 mr-2">+</span>
                    <span className="text-sm text-green-800 dark:text-green-200">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Competitive Weaknesses</h4>
              <div className="space-y-2">
                {competitorAnalysis.competitiveWeaknesses?.map((w: string, idx: number) => (
                  <div key={idx} className="flex items-start p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <span className="text-red-500 mr-2">-</span>
                    <span className="text-sm text-red-800 dark:text-red-200">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {competitorAnalysis.recommendations && competitorAnalysis.recommendations.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {competitorAnalysis.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-sm text-blue-800 dark:text-blue-300">
                    {idx + 1}. {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Export Report
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Refresh Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Extended AI Content Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Screening criteria, candidate summaries, communications, A/B testing, and competitor analysis
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
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
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'screening' && renderScreeningTab()}
        {activeTab === 'summaries' && renderSummariesTab()}
        {activeTab === 'rejections' && renderRejectionsTab()}
        {activeTab === 'offers' && renderOffersTab()}
        {activeTab === 'ab-testing' && renderABTestingTab()}
        {activeTab === 'competitor' && renderCompetitorTab()}
      </div>
    </div>
  );
};

export default ExtendedAIContentHub;
