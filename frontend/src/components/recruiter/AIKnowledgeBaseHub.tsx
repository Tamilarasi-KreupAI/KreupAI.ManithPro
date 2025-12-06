import React, { useState, useEffect } from 'react';
import type {
  CompanyKnowledge,
  RoleSpecificKnowledge,
  InterviewPlaybook,
  BestPractice,
  CompetitorIntelligence,
  DynamicFAQ,
  AIFeedbackLearning,
  CustomEvaluationCriteria,
  KnowledgeBaseStats,
  FeedbackAnalytics,
} from '../../types';
import {
  getKnowledgeBaseStats,
  getCompanyKnowledge,
  processCompanyKnowledge,
  getRoleKnowledge,
  getPlaybooks,
  clonePlaybook,
  getBestPractices,
  rateBestPractice,
  getCompetitorIntel,
  getFAQs,
  searchFAQs,
  rateFAQ,
  getAIFeedback,
  getFeedbackAnalytics,
  markFeedbackProcessed,
  getEvaluationCriteria,
  cloneEvaluationCriteria,
} from '../../services/batch19AIKnowledgeBaseAPI';

type TabType = 'overview' | 'company' | 'roles' | 'playbooks' | 'practices' | 'competitors' | 'faqs' | 'feedback' | 'criteria';

const AIKnowledgeBaseHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);
  const [companyKnowledge, setCompanyKnowledge] = useState<CompanyKnowledge[]>([]);
  const [roleKnowledge, setRoleKnowledge] = useState<RoleSpecificKnowledge[]>([]);
  const [playbooks, setPlaybooks] = useState<InterviewPlaybook[]>([]);
  const [bestPractices, setBestPractices] = useState<BestPractice[]>([]);
  const [competitorIntel, setCompetitorIntel] = useState<CompetitorIntelligence[]>([]);
  const [faqs, setFAQs] = useState<DynamicFAQ[]>([]);
  const [aiFeedback, setAIFeedback] = useState<AIFeedbackLearning[]>([]);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [evaluationCriteria, setEvaluationCriteria] = useState<CustomEvaluationCriteria[]>([]);

  // Search & filters
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [selectedPlaybook, setSelectedPlaybook] = useState<InterviewPlaybook | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorIntelligence | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'overview':
          const statsData = await getKnowledgeBaseStats();
          setStats(statsData);
          break;
        case 'company':
          const companyData = await getCompanyKnowledge();
          setCompanyKnowledge(companyData);
          break;
        case 'roles':
          const roleData = await getRoleKnowledge();
          setRoleKnowledge(roleData);
          break;
        case 'playbooks':
          const playbookData = await getPlaybooks();
          setPlaybooks(playbookData);
          break;
        case 'practices':
          const practicesData = await getBestPractices();
          setBestPractices(practicesData);
          break;
        case 'competitors':
          const competitorData = await getCompetitorIntel();
          setCompetitorIntel(competitorData);
          break;
        case 'faqs':
          const faqData = await getFAQs();
          setFAQs(faqData);
          break;
        case 'feedback':
          const [feedbackData, analyticsData] = await Promise.all([
            getAIFeedback(),
            getFeedbackAnalytics(),
          ]);
          setAIFeedback(feedbackData);
          setFeedbackAnalytics(analyticsData);
          break;
        case 'criteria':
          const criteriaData = await getEvaluationCriteria();
          setEvaluationCriteria(criteriaData);
          break;
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDocument = async (id: string) => {
    try {
      await processCompanyKnowledge(id);
      loadData();
    } catch (err) {
      setError('Failed to process document');
    }
  };

  const handleClonePlaybook = async (id: string) => {
    try {
      await clonePlaybook(id);
      loadData();
    } catch (err) {
      setError('Failed to clone playbook');
    }
  };

  const handleRatePractice = async (id: string, rating: number) => {
    try {
      await rateBestPractice(id, rating);
      loadData();
    } catch (err) {
      setError('Failed to rate practice');
    }
  };

  const handleSearchFAQs = async () => {
    if (!faqSearchQuery.trim()) {
      loadData();
      return;
    }
    try {
      setLoading(true);
      const results = await searchFAQs(faqSearchQuery);
      setFAQs(results);
    } catch (err) {
      setError('Failed to search FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleRateFAQ = async (id: string, helpful: boolean) => {
    try {
      await rateFAQ(id, helpful);
      loadData();
    } catch (err) {
      setError('Failed to rate FAQ');
    }
  };

  const handleMarkFeedbackProcessed = async (id: string) => {
    try {
      await markFeedbackProcessed(id);
      loadData();
    } catch (err) {
      setError('Failed to mark feedback as processed');
    }
  };

  const handleCloneCriteria = async (id: string) => {
    try {
      await cloneEvaluationCriteria(id);
      loadData();
    } catch (err) {
      setError('Failed to clone criteria');
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'company', label: 'Company Knowledge' },
    { id: 'roles', label: 'Role Knowledge' },
    { id: 'playbooks', label: 'Playbooks' },
    { id: 'practices', label: 'Best Practices' },
    { id: 'competitors', label: 'Competitors' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'feedback', label: 'AI Feedback' },
    { id: 'criteria', label: 'Eval Criteria' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">Knowledge Base Overview</h2>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.companyKnowledge}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Company Docs</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.roleKnowledge}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Role Profiles</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.playbooks}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Playbooks</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.bestPractices}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Best Practices</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.competitorIntel}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Competitor Intel</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-teal-600">{stats.faqs}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">FAQs</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-indigo-600">{stats.aiFeedback}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">AI Feedback</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-pink-600">{stats.evaluationCriteria}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Eval Criteria</div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('company')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Add Company Doc
          </button>
          <button
            onClick={() => setActiveTab('playbooks')}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
          >
            Create Playbook
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200"
          >
            Add FAQ
          </button>
          <button
            onClick={() => setActiveTab('criteria')}
            className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200"
          >
            Define Criteria
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompanyKnowledge = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Company Knowledge</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Document
        </button>
      </div>

      <div className="grid gap-4">
        {companyKnowledge.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold dark:text-white">{doc.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{doc.companyName}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  doc.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.isProcessed ? 'Processed' : 'Pending'}
                </span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {doc.category}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
              {doc.description || doc.content.substring(0, 150)}...
            </p>
            <div className="flex gap-2 mt-3">
              {doc.extractedTopics.slice(0, 3).map((topic, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                  {topic}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-500">
                Version {doc.version} | {doc.isPublic ? 'Public' : 'Internal'}
              </div>
              {!doc.isProcessed && (
                <button
                  onClick={() => handleProcessDocument(doc.id)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Process with AI
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRoleKnowledge = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Role-Specific Knowledge</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Role Profile
        </button>
      </div>

      <div className="grid gap-4">
        {roleKnowledge.map((role) => (
          <div key={role.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold dark:text-white">{role.roleTitle}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {role.department} | {role.seniorityLevel}
                </p>
              </div>
              {role.teamName && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                  {role.teamName} ({role.teamSize} members)
                </span>
              )}
            </div>

            <div className="mt-3">
              <h4 className="text-sm font-medium dark:text-gray-300">Required Skills</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(role.requiredSkills).slice(0, 5).map(([skill, req]) => (
                  <span key={skill} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {skill}: {req.level}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <h4 className="text-sm font-medium dark:text-gray-300">Tech Stack</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {role.technicalStack.slice(0, 6).map((tech, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {role.currentChallenges.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium dark:text-gray-300">Current Challenges</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {role.currentChallenges.slice(0, 3).map((challenge, i) => (
                    <li key={i}>{challenge}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaybooks = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Interview Playbooks</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Playbook
        </button>
      </div>

      {selectedPlaybook ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold dark:text-white">{selectedPlaybook.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPlaybook.roleTitle} | {selectedPlaybook.interviewType} | {selectedPlaybook.duration} min
              </p>
            </div>
            <button
              onClick={() => setSelectedPlaybook(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          {selectedPlaybook.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {selectedPlaybook.description}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium dark:text-gray-300 mb-2">Sections</h4>
              <div className="space-y-2">
                {selectedPlaybook.sections.map((section, i) => (
                  <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{section.name}</span>
                      <span className="text-xs text-gray-500">{section.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium dark:text-gray-300 mb-2">Evaluation Criteria</h4>
              <div className="space-y-2">
                {Object.entries(selectedPlaybook.evaluationCriteria).map(([criterion, details]) => (
                  <div key={criterion} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{criterion}</span>
                      <span className="text-xs text-gray-500">Weight: {details.weight}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Green Flags</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {selectedPlaybook.greenFlagIndicators.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Red Flags</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {selectedPlaybook.redFlagIndicators.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>

          {selectedPlaybook.interviewerTips.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium dark:text-gray-300 mb-2">Interviewer Tips</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {selectedPlaybook.interviewerTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {playbooks.map((playbook) => (
            <div key={playbook.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold dark:text-white">{playbook.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {playbook.roleTitle} | {playbook.interviewType} | {playbook.duration} min
                  </p>
                </div>
                <div className="flex gap-2">
                  {playbook.isTemplate && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      Template
                    </span>
                  )}
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Used {playbook.timesUsed}x
                  </span>
                </div>
              </div>

              {playbook.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                  {playbook.description}
                </p>
              )}

              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  {playbook.averageRating && (
                    <span className="text-sm text-yellow-600">
                      Rating: {playbook.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPlaybook(playbook)}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleClonePlaybook(playbook.id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Clone
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBestPractices = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Best Practices Library</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Practice
        </button>
      </div>

      <div className="grid gap-4">
        {bestPractices.map((practice) => (
          <div key={practice.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold dark:text-white">{practice.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {practice.practiceType} | {practice.category}
                </p>
              </div>
              <div className="flex gap-2">
                {practice.isVerified && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    Verified
                  </span>
                )}
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  {practice.rating.toFixed(1)} ({practice.ratingsCount})
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {practice.description}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-3">
              {practice.goodExample && (
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <h4 className="text-xs font-medium text-green-700 dark:text-green-400">Good Example</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{practice.goodExample}</p>
                </div>
              )}
              {practice.badExample && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <h4 className="text-xs font-medium text-red-700 dark:text-red-400">Bad Example</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{practice.badExample}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-500">
                Used {practice.usageCount} times
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatePractice(practice.id, star)}
                    className={`text-lg ${star <= Math.round(practice.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    *
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompetitors = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Competitor Intelligence</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Competitor
        </button>
      </div>

      {selectedCompetitor ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold dark:text-white">{selectedCompetitor.competitorName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCompetitor.industry} | {selectedCompetitor.marketPosition}
              </p>
            </div>
            <button
              onClick={() => setSelectedCompetitor(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium dark:text-gray-300 mb-2">Company Info</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Size:</span> {selectedCompetitor.competitorSize}</p>
                <p><span className="text-gray-500">Work:</span> {selectedCompetitor.workArrangement}</p>
                <p><span className="text-gray-500">Glassdoor:</span> {selectedCompetitor.glassdoorRating}</p>
                <p><span className="text-gray-500">Hiring Velocity:</span> {selectedCompetitor.hiringVelocity}</p>
                <p><span className="text-gray-500">Open Positions:</span> {selectedCompetitor.openPositionsCount}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium dark:text-gray-300 mb-2">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCompetitor.techStackUsed.map((tech, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Their Strengths</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {selectedCompetitor.strengthsVsUs.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Their Weaknesses</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {selectedCompetitor.weaknessesVsUs.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Opportunities</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {selectedCompetitor.opportunities.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">Threats</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {selectedCompetitor.threats.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Data Confidence: {selectedCompetitor.dataConfidence} | Last verified: {selectedCompetitor.lastVerified ? new Date(selectedCompetitor.lastVerified).toLocaleDateString() : 'Never'}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {competitorIntel.map((competitor) => (
            <div key={competitor.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold dark:text-white">{competitor.competitorName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {competitor.industry} | {competitor.intelligenceType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    competitor.marketPosition === 'LEADER' ? 'bg-purple-100 text-purple-800' :
                    competitor.marketPosition === 'CHALLENGER' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {competitor.marketPosition}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    competitor.poachingRisk === 'HIGH' ? 'bg-red-100 text-red-800' :
                    competitor.poachingRisk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {competitor.poachingRisk} Risk
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mt-3 text-sm">
                <span>Glassdoor: {competitor.glassdoorRating}</span>
                <span>Open Roles: {competitor.openPositionsCount}</span>
                <span>Talent Overlap: {competitor.talentPoolOverlap ? `${(competitor.talentPoolOverlap * 100).toFixed(0)}%` : 'N/A'}</span>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setSelectedCompetitor(competitor)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFAQs = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Dynamic FAQs</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add FAQ
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={faqSearchQuery}
          onChange={(e) => setFaqSearchQuery(e.target.value)}
          placeholder="Search FAQs..."
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={handleSearchFAQs}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200"
        >
          Search
        </button>
      </div>

      <div className="grid gap-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold dark:text-white">{faq.question}</h3>
                <span className="text-xs text-gray-500">{faq.questionCategory}</span>
              </div>
              <div className="flex gap-2">
                {faq.isVerified && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    Verified
                  </span>
                )}
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Asked {faq.timesAsked}x
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {faq.answer}
            </p>

            {faq.questionVariants.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Also asked as: </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {faq.questionVariants.join(', ')}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-500">
                Helpful: {faq.helpfulCount} | Not Helpful: {faq.notHelpfulCount}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRateFAQ(faq.id, true)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Helpful
                </button>
                <button
                  onClick={() => handleRateFAQ(faq.id, false)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Not Helpful
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAIFeedback = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">AI Feedback & Learning</h2>
      </div>

      {feedbackAnalytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{feedbackAnalytics.totalFeedback}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Feedback</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{feedbackAnalytics.processedCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Processed</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{feedbackAnalytics.pendingProcessing}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{feedbackAnalytics.averageAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {aiFeedback.map((feedback) => (
          <div key={feedback.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold dark:text-white">{feedback.feedbackType}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feedback.sourceEntityType} | Impact: {feedback.impactLevel}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  feedback.isProcessedForTraining ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {feedback.isProcessedForTraining ? 'Processed' : 'Pending'}
                </span>
                {feedback.errorType && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                    {feedback.errorType}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 text-sm">
              <p><span className="text-gray-500">Rating:</span> {feedback.feedbackRating}/5</p>
              {feedback.accuracyPercentage !== undefined && (
                <p><span className="text-gray-500">Accuracy:</span> {feedback.accuracyPercentage}%</p>
              )}
              {feedback.correctionNotes && (
                <p className="mt-2 text-gray-700 dark:text-gray-300">{feedback.correctionNotes}</p>
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-500">
                {new Date(feedback.createdAt).toLocaleDateString()}
              </div>
              {!feedback.isProcessedForTraining && (
                <button
                  onClick={() => handleMarkFeedbackProcessed(feedback.id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Mark Processed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEvaluationCriteria = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Evaluation Criteria</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Criterion
        </button>
      </div>

      <div className="grid gap-4">
        {evaluationCriteria.map((criterion) => (
          <div key={criterion.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold dark:text-white">{criterion.criterionName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {criterion.criterionCode} | {criterion.category}
                </p>
              </div>
              <div className="flex gap-2">
                {criterion.isTemplate && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                    Template
                  </span>
                )}
                {criterion.isMandatory && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                    Mandatory
                  </span>
                )}
                {criterion.isKnockout && (
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                    Knockout
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {criterion.description}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <h4 className="text-xs font-medium text-gray-500">Scoring</h4>
                <p className="text-sm">
                  {criterion.scoringType} | {criterion.minScore}-{criterion.maxScore}
                  {criterion.passingScore && ` (Pass: ${criterion.passingScore})`}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500">Weight</h4>
                <p className="text-sm">{criterion.weight}x</p>
              </div>
            </div>

            {criterion.positiveIndicators.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-green-700 dark:text-green-400">Positive Indicators</h4>
                <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                  {criterion.positiveIndicators.slice(0, 3).map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-500">
                Used {criterion.timesUsed}x
                {criterion.averageScore && ` | Avg Score: ${criterion.averageScore.toFixed(1)}`}
              </div>
              <button
                onClick={() => handleCloneCriteria(criterion.id)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Clone
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'company': return renderCompanyKnowledge();
      case 'roles': return renderRoleKnowledge();
      case 'playbooks': return renderPlaybooks();
      case 'practices': return renderBestPractices();
      case 'competitors': return renderCompetitors();
      case 'faqs': return renderFAQs();
      case 'feedback': return renderAIFeedback();
      case 'criteria': return renderEvaluationCriteria();
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-white">AI Knowledge Base</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage company knowledge, playbooks, and AI training data
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-6 border-b dark:border-gray-700">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {renderContent()}
    </div>
  );
};

export default AIKnowledgeBaseHub;
