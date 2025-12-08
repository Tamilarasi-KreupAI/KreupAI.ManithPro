import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  GeneratedJobDescription,
  JobTitleSuggestion,
  RequirementsAnalysis,
  InclusiveLanguageCheck,
  SalaryRangeSuggestion,
  GeneratedInterviewQuestions,
  SeniorityLevel,
  EmploymentType,
  WorkMode,
  InterviewRound,
  InclusivityGrade,
} from '../../types';
import {
  jobDescriptionAPI,
  jobTitleAPI,
  requirementsAPI,
  inclusiveLanguageAPI,
  salaryRangeAPI,
  interviewQuestionsAPI,
} from '../../services/batch11AIContentAPI';

type TabType = 'job-description' | 'title-optimizer' | 'requirements' | 'inclusive-language' | 'salary' | 'interview-questions';

const AIContentHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('job-description');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Job Description State
  const [jdForm, setJdForm] = useState({
    jobTitle: '',
    department: '',
    seniorityLevel: 'MID' as SeniorityLevel,
    employmentType: 'FULL_TIME' as EmploymentType,
    workMode: 'HYBRID' as WorkMode,
    location: '',
    requiredSkills: '',
    preferredSkills: '',
    yearsExperience: 3,
    educationLevel: '',
    companyDescription: '',
    teamSize: 0,
    reportingTo: '',
  });
  const [generatedJD, setGeneratedJD] = useState<GeneratedJobDescription | null>(null);

  // Title Optimizer State
  const [originalTitle, setOriginalTitle] = useState('');
  const [titleSuggestion, setTitleSuggestion] = useState<JobTitleSuggestion | null>(null);

  // Requirements Analyzer State
  const [rawRequirements, setRawRequirements] = useState('');
  const [requirementsAnalysis, setRequirementsAnalysis] = useState<RequirementsAnalysis | null>(null);

  // Inclusive Language State
  const [contentToCheck, setContentToCheck] = useState('');
  const [languageCheck, setLanguageCheck] = useState<InclusiveLanguageCheck | null>(null);

  // Salary Range State
  const [salaryForm, setSalaryForm] = useState({
    jobTitle: '',
    location: '',
    country: 'USA',
    state: '',
    city: '',
    seniorityLevel: 'MID' as SeniorityLevel,
    yearsExperience: 3,
    requiredSkills: '',
    industry: 'Technology',
    companySize: 'MEDIUM',
  });
  const [salarySuggestion, setSalarySuggestion] = useState<SalaryRangeSuggestion | null>(null);

  // Interview Questions State
  const [iqForm, setIqForm] = useState({
    jobTitle: '',
    seniorityLevel: 'MID' as SeniorityLevel,
    department: '',
    requiredSkills: '',
    interviewRound: 'TECHNICAL' as InterviewRound,
    interviewDuration: 60,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedInterviewQuestions | null>(null);

  const handleGenerateJD = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobDescriptionAPI.generate({
        ...jdForm,
        requiredSkills: jdForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: jdForm.preferredSkills ? jdForm.preferredSkills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      });
      setGeneratedJD(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate job description');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeTitle = async () => {
    if (!originalTitle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await jobTitleAPI.optimize(originalTitle);
      setTitleSuggestion(result);
    } catch (err: any) {
      setError(err.message || 'Failed to optimize title');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRequirements = async () => {
    if (!rawRequirements.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await requirementsAPI.analyze(rawRequirements, { jobTitle: jdForm.jobTitle });
      setRequirementsAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckLanguage = async () => {
    if (!contentToCheck.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await inclusiveLanguageAPI.check(contentToCheck, 'JOB_DESCRIPTION');
      setLanguageCheck(result);
    } catch (err: any) {
      setError(err.message || 'Failed to check language');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestSalary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await salaryRangeAPI.suggest({
        ...salaryForm,
        requiredSkills: salaryForm.requiredSkills ? salaryForm.requiredSkills.split(',').map(s => s.trim()) : undefined,
      });
      setSalarySuggestion(result);
    } catch (err: any) {
      setError(err.message || 'Failed to get salary suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await interviewQuestionsAPI.generate({
        ...iqForm,
        requiredSkills: iqForm.requiredSkills ? iqForm.requiredSkills.split(',').map(s => s.trim()) : undefined,
      });
      setGeneratedQuestions(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: InclusivityGrade): string => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'F': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'job-description' as TabType, label: 'Job Description', icon: '📝' },
    { id: 'title-optimizer' as TabType, label: 'Title Optimizer', icon: '🎯' },
    { id: 'requirements' as TabType, label: 'Requirements', icon: '📋' },
    { id: 'inclusive-language' as TabType, label: 'Inclusive Language', icon: '🌈' },
    { id: 'salary' as TabType, label: 'Salary Range', icon: '💰' },
    { id: 'interview-questions' as TabType, label: 'Interview Questions', icon: '❓' },
  ];

  const renderJobDescriptionTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate Job Description
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
            <input
              type="text"
              value={jdForm.jobTitle}
              onChange={(e) => setJdForm({ ...jdForm, jobTitle: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <input
              type="text"
              value={jdForm.department}
              onChange={(e) => setJdForm({ ...jdForm, department: e.target.value })}
              placeholder="e.g., Engineering"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seniority Level</label>
            <select
              value={jdForm.seniorityLevel}
              onChange={(e) => setJdForm({ ...jdForm, seniorityLevel: e.target.value as SeniorityLevel })}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment Type</label>
            <select
              value={jdForm.employmentType}
              onChange={(e) => setJdForm({ ...jdForm, employmentType: e.target.value as EmploymentType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Mode</label>
            <select
              value={jdForm.workMode}
              onChange={(e) => setJdForm({ ...jdForm, workMode: e.target.value as WorkMode })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-site</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input
              type="text"
              value={jdForm.location}
              onChange={(e) => setJdForm({ ...jdForm, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required Skills * (comma-separated)</label>
            <input
              type="text"
              value={jdForm.requiredSkills}
              onChange={(e) => setJdForm({ ...jdForm, requiredSkills: e.target.value })}
              placeholder="e.g., React, TypeScript, Node.js"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Skills (comma-separated)</label>
            <input
              type="text"
              value={jdForm.preferredSkills}
              onChange={(e) => setJdForm({ ...jdForm, preferredSkills: e.target.value })}
              placeholder="e.g., GraphQL, AWS, Docker"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
            <input
              type="number"
              value={jdForm.yearsExperience}
              onChange={(e) => setJdForm({ ...jdForm, yearsExperience: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateJD}
          disabled={loading || !jdForm.jobTitle || !jdForm.requiredSkills}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Job Description'}
        </button>
      </div>

      {generatedJD && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Job Description
            </h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Readability: {generatedJD.readabilityScore}%
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Inclusivity: {generatedJD.inclusivityScore}%
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                SEO: {generatedJD.seoScore}%
              </span>
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <h2>{generatedJD.generatedTitle}</h2>
            <h4>About the Role</h4>
            <p>{generatedJD.generatedSummary}</p>
            <h4>Responsibilities</h4>
            <ul>
              {generatedJD.generatedResponsibilities?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <h4>Qualifications</h4>
            <ul>
              {generatedJD.generatedQualifications?.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
            <h4>Benefits</h4>
            <ul>
              {generatedJD.generatedBenefits?.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Use This Description
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTitleOptimizerTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Optimize Job Title
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Enter your job title
          </label>
          <input
            type="text"
            value={originalTitle}
            onChange={(e) => setOriginalTitle(e.target.value)}
            placeholder="e.g., Sr. Full Stack Dev"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleOptimizeTitle}
          disabled={loading || !originalTitle.trim()}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Optimizing...' : 'Optimize Title'}
        </button>
      </div>

      {titleSuggestion && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recommendations
          </h3>

          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Recommended Title</div>
            <div className="text-xl font-bold text-green-800 dark:text-green-200">
              {titleSuggestion.recommendedTitle}
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              {titleSuggestion.recommendationReason}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Original SEO Score</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {titleSuggestion.originalSeoScore}%
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Improved SEO Score</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {titleSuggestion.improvedSeoScore}%
              </div>
            </div>
          </div>

          <h4 className="font-medium text-gray-900 dark:text-white mb-3">All Suggestions</h4>
          <div className="space-y-3">
            {titleSuggestion.suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{suggestion.title}</span>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">SEO: {suggestion.seoScore}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Inclusive: {suggestion.inclusivityScore}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.reasoning}</p>
              </div>
            ))}
          </div>

          {titleSuggestion.industryTrends && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Industry Trends</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xs text-green-600 mb-2">Rising</div>
                  {titleSuggestion.industryTrends.rising.map((t, i) => (
                    <div key={i} className="text-sm text-green-800 dark:text-green-200">{t}</div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-600 mb-2">Stable</div>
                  {titleSuggestion.industryTrends.stable.map((t, i) => (
                    <div key={i} className="text-sm text-gray-800 dark:text-gray-200">{t}</div>
                  ))}
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-xs text-red-600 mb-2">Declining</div>
                  {titleSuggestion.industryTrends.declining.map((t, i) => (
                    <div key={i} className="text-sm text-red-800 dark:text-red-200">{t}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderRequirementsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analyze Job Requirements
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Paste your job requirements (one per line)
          </label>
          <textarea
            value={rawRequirements}
            onChange={(e) => setRawRequirements(e.target.value)}
            placeholder="5+ years of experience&#10;React and TypeScript proficiency&#10;Strong communication skills&#10;Bachelor's degree in CS"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleAnalyzeRequirements}
          disabled={loading || !rawRequirements.trim()}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Requirements'}
        </button>
      </div>

      {requirementsAnalysis && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Analysis Results
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{requirementsAnalysis.essentialCount}</div>
              <div className="text-xs text-gray-500">Essential</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{requirementsAnalysis.niceToHaveCount}</div>
              <div className="text-xs text-gray-500">Nice to Have</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{requirementsAnalysis.marketAlignmentScore}%</div>
              <div className="text-xs text-gray-500">Market Alignment</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{requirementsAnalysis.restrictiveScore}%</div>
              <div className="text-xs text-gray-500">Restrictiveness</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Essential Requirements</h4>
              <div className="space-y-2">
                {requirementsAnalysis.essentialRequirements.map((req, idx) => (
                  <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="font-medium text-red-800 dark:text-red-200">{req.requirement}</div>
                    <div className="text-xs text-red-600 dark:text-red-400">{req.reasoning}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Nice to Have</h4>
              <div className="space-y-2">
                {requirementsAnalysis.niceToHaveRequirements.map((req, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium text-blue-800 dark:text-blue-200">{req.requirement}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">{req.reasoning}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {requirementsAnalysis.recommendations && requirementsAnalysis.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Recommendations</h4>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                {requirementsAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderInclusiveLanguageTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Check for Inclusive Language
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Paste your content to check
          </label>
          <textarea
            value={contentToCheck}
            onChange={(e) => setContentToCheck(e.target.value)}
            placeholder="Paste your job description, email, or any recruiting content here..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleCheckLanguage}
          disabled={loading || !contentToCheck.trim()}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Language'}
        </button>
      </div>

      {languageCheck && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Language Analysis
            </h3>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-lg font-bold rounded ${getGradeColor(languageCheck.grade)}`}>
                Grade: {languageCheck.grade}
              </span>
              <span className="text-2xl font-bold text-indigo-600">
                {languageCheck.overallScore}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{languageCheck.issueCount}</div>
              <div className="text-xs text-gray-500">Total Issues</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-xl font-bold text-red-600">{languageCheck.severeIssueCount}</div>
              <div className="text-xs text-red-500">Severe</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{languageCheck.moderateIssueCount}</div>
              <div className="text-xs text-orange-500">Moderate</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{languageCheck.minorIssueCount}</div>
              <div className="text-xs text-yellow-500">Minor</div>
            </div>
          </div>

          {languageCheck.issues.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Issues Found</h4>
              <div className="space-y-3">
                {languageCheck.issues.map((issue, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-red-600">"{issue.phrase}"</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        issue.severity === 'SEVERE' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'MODERATE' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{issue.issue}</p>
                    <div className="text-sm">
                      <span className="text-gray-500">Suggestion: </span>
                      <span className="text-green-600 dark:text-green-400">"{issue.suggestion}"</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languageCheck.suggestedContent && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Suggested Revision</h4>
              <p className="text-sm text-green-800 dark:text-green-300">{languageCheck.suggestedContent}</p>
              <button className="mt-3 text-sm text-green-600 hover:text-green-700">
                Copy Suggested Version
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSalaryTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Get Salary Range Suggestion
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
            <input
              type="text"
              value={salaryForm.jobTitle}
              onChange={(e) => setSalaryForm({ ...salaryForm, jobTitle: e.target.value })}
              placeholder="e.g., Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seniority Level</label>
            <select
              value={salaryForm.seniorityLevel}
              onChange={(e) => setSalaryForm({ ...salaryForm, seniorityLevel: e.target.value as SeniorityLevel })}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
            <input
              type="text"
              value={salaryForm.city}
              onChange={(e) => setSalaryForm({ ...salaryForm, city: e.target.value })}
              placeholder="e.g., San Francisco"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
            <input
              type="text"
              value={salaryForm.state}
              onChange={(e) => setSalaryForm({ ...salaryForm, state: e.target.value })}
              placeholder="e.g., CA"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
            <input
              type="text"
              value={salaryForm.industry}
              onChange={(e) => setSalaryForm({ ...salaryForm, industry: e.target.value })}
              placeholder="e.g., Technology"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Size</label>
            <select
              value={salaryForm.companySize}
              onChange={(e) => setSalaryForm({ ...salaryForm, companySize: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="STARTUP">Startup</option>
              <option value="SMALL">Small</option>
              <option value="MEDIUM">Medium</option>
              <option value="LARGE">Large</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required Skills (comma-separated)</label>
            <input
              type="text"
              value={salaryForm.requiredSkills}
              onChange={(e) => setSalaryForm({ ...salaryForm, requiredSkills: e.target.value })}
              placeholder="e.g., React, TypeScript, Node.js"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleSuggestSalary}
          disabled={loading || !salaryForm.jobTitle}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Get Salary Suggestion'}
        </button>
      </div>

      {salarySuggestion && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Salary Range Suggestion
          </h3>

          <div className="text-center p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-6">
            <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">Suggested Range</div>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
              ${salarySuggestion.suggestedMin.toLocaleString()} - ${salarySuggestion.suggestedMax.toLocaleString()}
            </div>
            <div className="text-lg text-indigo-600 dark:text-indigo-400 mt-1">
              Midpoint: ${salarySuggestion.suggestedMidpoint.toLocaleString()}
            </div>
            <div className="mt-2 flex justify-center gap-2">
              <span className={`px-2 py-1 text-sm rounded ${
                salarySuggestion.confidenceLevel === 'HIGH' ? 'bg-green-100 text-green-800' :
                salarySuggestion.confidenceLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {salarySuggestion.confidenceLevel} Confidence ({salarySuggestion.confidenceScore}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                ${salarySuggestion.marketPercentile25?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">25th %ile</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                ${salarySuggestion.marketMedian?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Median</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                ${salarySuggestion.marketPercentile75?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">75th %ile</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-bold text-indigo-600">
                ${salarySuggestion.marketPercentile90?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">90th %ile</div>
            </div>
          </div>

          {salarySuggestion.salaryFactors && salarySuggestion.salaryFactors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Salary Factors</h4>
              <div className="space-y-2">
                {salarySuggestion.salaryFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{factor.factor}</span>
                    <span className="font-medium text-indigo-600">{factor.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {salarySuggestion.recommendations && salarySuggestion.recommendations.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Recommendations</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                {salarySuggestion.recommendations.map((rec, idx) => (
                  <li key={idx}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Data sources: {salarySuggestion.dataSources?.join(', ')} |
            Freshness: {salarySuggestion.dataFreshness} |
            Sample size: {salarySuggestion.sampleSize?.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );

  const renderInterviewQuestionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generate Interview Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
            <input
              type="text"
              value={iqForm.jobTitle}
              onChange={(e) => setIqForm({ ...iqForm, jobTitle: e.target.value })}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seniority Level</label>
            <select
              value={iqForm.seniorityLevel}
              onChange={(e) => setIqForm({ ...iqForm, seniorityLevel: e.target.value as SeniorityLevel })}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Round</label>
            <select
              value={iqForm.interviewRound}
              onChange={(e) => setIqForm({ ...iqForm, interviewRound: e.target.value as InterviewRound })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="SCREENING">Screening</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="FINAL">Final</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={iqForm.interviewDuration}
              onChange={(e) => setIqForm({ ...iqForm, interviewDuration: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required Skills (comma-separated)</label>
            <input
              type="text"
              value={iqForm.requiredSkills}
              onChange={(e) => setIqForm({ ...iqForm, requiredSkills: e.target.value })}
              placeholder="e.g., React, TypeScript, System Design"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateQuestions}
          disabled={loading || !iqForm.jobTitle}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>

      {generatedQuestions && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Interview Questions
            </h3>
            <div className="flex gap-2 text-sm">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                {generatedQuestions.totalQuestions} questions
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                ~{generatedQuestions.estimatedDuration} min
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600">{generatedQuestions.difficultyDistribution?.easy || 0}</div>
              <div className="text-xs text-green-500">Easy</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{generatedQuestions.difficultyDistribution?.medium || 0}</div>
              <div className="text-xs text-yellow-500">Medium</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-xl font-bold text-red-600">{generatedQuestions.difficultyDistribution?.hard || 0}</div>
              <div className="text-xs text-red-500">Hard</div>
            </div>
          </div>

          <div className="space-y-4">
            {generatedQuestions.questions.map((q, idx) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{q.category}</span>
                    {q.skill && <span className="text-xs text-gray-500 ml-2">({q.skill})</span>}
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      q.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                      q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{q.expectedDuration}min</span>
                  </div>
                </div>
                <p className="text-gray-900 dark:text-white font-medium mb-3">{q.question}</p>

                {q.evaluationCriteria && (
                  <div className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">Evaluate:</span> {q.evaluationCriteria.join(', ')}
                  </div>
                )}

                {q.followUps && q.followUps.length > 0 && (
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    <span className="font-medium">Follow-ups:</span> {q.followUps.join(' | ')}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {q.greenFlags && (
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="text-green-700 dark:text-green-300 font-medium">Green Flags:</span>
                      <ul className="text-green-600 dark:text-green-400 mt-1">
                        {q.greenFlags.map((f, i) => <li key={i}>+ {f}</li>)}
                      </ul>
                    </div>
                  )}
                  {q.redFlags && (
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <span className="text-red-700 dark:text-red-300 font-medium">Red Flags:</span>
                      <ul className="text-red-600 dark:text-red-400 mt-1">
                        {q.redFlags.map((f, i) => <li key={i}>- {f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {generatedQuestions.complianceNotes && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">Compliance Notes</h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                {generatedQuestions.complianceNotes.map((note, idx) => (
                  <li key={idx}>• {note}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Save Question Set
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Export as PDF
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
            AI Content Generation Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate job descriptions, optimize titles, analyze requirements, and more with AI
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
                <span className="mr-2">{tab.icon}</span>
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
        {activeTab === 'job-description' && renderJobDescriptionTab()}
        {activeTab === 'title-optimizer' && renderTitleOptimizerTab()}
        {activeTab === 'requirements' && renderRequirementsTab()}
        {activeTab === 'inclusive-language' && renderInclusiveLanguageTab()}
        {activeTab === 'salary' && renderSalaryTab()}
        {activeTab === 'interview-questions' && renderInterviewQuestionsTab()}
      </div>
    </div>
  );
};

export default AIContentHub;
