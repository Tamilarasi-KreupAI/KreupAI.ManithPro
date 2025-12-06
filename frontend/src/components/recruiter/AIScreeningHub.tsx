import React, { useState, useEffect } from 'react';
import {
  AIScreeningInterview,
  QuestionFlow,
  ScreeningQuestion,
  ScreeningResponse,
  ScreeningTemplate,
  ScreeningStats,
  ScreeningInterviewType,
  ScreeningInterviewStatus,
  AITone,
  ScreeningQuestionType,
  ResponseType,
  DifficultyLevel,
} from '../../types';
import {
  getScreeningInterviews,
  createScreeningInterview,
  cancelInterview,
  extendDeadline,
  getQuestionFlows,
  createQuestionFlow,
  getQuestionFlowWithQuestions,
  deleteQuestionFlow,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getInterviewResponses,
  reviewResponse,
  getScreeningTemplates,
  getScreeningStats,
} from '../../services/batch17AIScreeningAPI';

const AIScreeningHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interviews' | 'flows' | 'questions' | 'responses' | 'templates' | 'analytics'>('interviews');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [interviews, setInterviews] = useState<AIScreeningInterview[]>([]);
  const [questionFlows, setQuestionFlows] = useState<QuestionFlow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<QuestionFlow | null>(null);
  const [responses, setResponses] = useState<ScreeningResponse[]>([]);
  const [templates, setTemplates] = useState<ScreeningTemplate[]>([]);
  const [stats, setStats] = useState<ScreeningStats | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<ScreeningInterviewStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ScreeningInterviewType | ''>('');

  // Modal states
  const [showCreateInterview, setShowCreateInterview] = useState(false);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<AIScreeningInterview | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<ScreeningResponse | null>(null);

  // Form states
  const [newInterview, setNewInterview] = useState({
    candidateId: '',
    jobId: '',
    title: '',
    description: '',
    interviewType: 'VIDEO_ASYNC' as ScreeningInterviewType,
    questionFlowId: '',
    totalTimeLimit: 45,
    perQuestionTimeLimit: 5,
    language: 'en',
    aiTone: 'PROFESSIONAL' as AITone,
    enableSmallTalk: true,
  });

  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    category: '',
    targetRole: '',
    targetLevel: '',
    interviewType: 'VIDEO_ASYNC' as ScreeningInterviewType,
    supportedLanguages: ['en'],
    estimatedDuration: 30,
    isTemplate: false,
  });

  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    questionType: 'BEHAVIORAL' as ScreeningQuestionType,
    category: '',
    expectedResponseType: 'VIDEO' as ResponseType,
    maxResponseDuration: 180,
    allowRetakes: true,
    maxRetakes: 2,
    isRequired: true,
    difficulty: 'MEDIUM' as DifficultyLevel,
    maxPoints: 10,
    hint: '',
    aiFollowUpEnabled: true,
  });

  const [reviewData, setReviewData] = useState({
    manualScore: 0,
    manualFeedback: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'interviews':
          const interviewResult = await getScreeningInterviews({
            status: statusFilter || undefined,
            interviewType: typeFilter || undefined,
          });
          setInterviews(interviewResult.interviews);
          break;
        case 'flows':
          const flows = await getQuestionFlows();
          setQuestionFlows(flows);
          break;
        case 'templates':
          const templateList = await getScreeningTemplates();
          setTemplates(templateList);
          break;
        case 'analytics':
          const statistics = await getScreeningStats();
          setStats(statistics);
          break;
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'interviews') {
      loadData();
    }
  }, [statusFilter, typeFilter]);

  const handleCreateInterview = async () => {
    try {
      setLoading(true);
      await createScreeningInterview(newInterview);
      setShowCreateInterview(false);
      setNewInterview({
        candidateId: '',
        jobId: '',
        title: '',
        description: '',
        interviewType: 'VIDEO_ASYNC',
        questionFlowId: '',
        totalTimeLimit: 45,
        perQuestionTimeLimit: 5,
        language: 'en',
        aiTone: 'PROFESSIONAL',
        enableSmallTalk: true,
      });
      loadData();
    } catch (err) {
      setError('Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    try {
      await cancelInterview(id);
      loadData();
    } catch (err) {
      setError('Failed to cancel interview');
    }
  };

  const handleExtendDeadline = async (id: string) => {
    const days = prompt('How many additional days?', '3');
    if (!days) return;
    try {
      await extendDeadline(id, parseInt(days));
      loadData();
    } catch (err) {
      setError('Failed to extend deadline');
    }
  };

  const handleCreateFlow = async () => {
    try {
      setLoading(true);
      await createQuestionFlow(newFlow);
      setShowCreateFlow(false);
      setNewFlow({
        name: '',
        description: '',
        category: '',
        targetRole: '',
        targetLevel: '',
        interviewType: 'VIDEO_ASYNC',
        supportedLanguages: ['en'],
        estimatedDuration: 30,
        isTemplate: false,
      });
      loadData();
    } catch (err) {
      setError('Failed to create question flow');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlow = async (flow: QuestionFlow) => {
    try {
      setLoading(true);
      const fullFlow = await getQuestionFlowWithQuestions(flow.id);
      setSelectedFlow(fullFlow);
      setActiveTab('questions');
    } catch (err) {
      setError('Failed to load question flow');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question flow?')) return;
    try {
      await deleteQuestionFlow(id);
      loadData();
    } catch (err) {
      setError('Failed to delete question flow');
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedFlow) return;
    try {
      setLoading(true);
      await addQuestion(selectedFlow.id, newQuestion);
      setShowAddQuestion(false);
      setNewQuestion({
        questionText: '',
        questionType: 'BEHAVIORAL',
        category: '',
        expectedResponseType: 'VIDEO',
        maxResponseDuration: 180,
        allowRetakes: true,
        maxRetakes: 2,
        isRequired: true,
        difficulty: 'MEDIUM',
        maxPoints: 10,
        hint: '',
        aiFollowUpEnabled: true,
      });
      const updatedFlow = await getQuestionFlowWithQuestions(selectedFlow.id);
      setSelectedFlow(updatedFlow);
    } catch (err) {
      setError('Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    if (!selectedFlow) return;
    try {
      await deleteQuestion(id);
      const updatedFlow = await getQuestionFlowWithQuestions(selectedFlow.id);
      setSelectedFlow(updatedFlow);
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  const handleViewResponses = async (interview: AIScreeningInterview) => {
    try {
      setLoading(true);
      setSelectedInterview(interview);
      const responseList = await getInterviewResponses(interview.id);
      setResponses(responseList);
      setActiveTab('responses');
    } catch (err) {
      setError('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewResponse = async () => {
    if (!selectedResponse) return;
    try {
      setLoading(true);
      await reviewResponse(selectedResponse.id, reviewData);
      setShowReviewModal(false);
      setReviewData({ manualScore: 0, manualFeedback: '' });
      if (selectedInterview) {
        const responseList = await getInterviewResponses(selectedInterview.id);
        setResponses(responseList);
      }
    } catch (err) {
      setError('Failed to review response');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: ScreeningInterviewStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      INVITED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || colors.PENDING;
  };

  const getInterviewTypeIcon = (type: ScreeningInterviewType) => {
    switch (type) {
      case 'VIDEO_ASYNC':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'PHONE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'CHAT':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  const tabs = [
    { id: 'interviews', label: 'Screening Interviews', icon: '🎥' },
    { id: 'flows', label: 'Question Flows', icon: '📋' },
    { id: 'questions', label: 'Questions', icon: '❓' },
    { id: 'responses', label: 'Responses', icon: '💬' },
    { id: 'templates', label: 'Templates', icon: '📝' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Screening Interviews
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage async video, phone, and chat-based AI screening interviews
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && !loading && (
          <div>
            {/* Filters and Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ScreeningInterviewStatus | '')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="INVITED">Invited</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ScreeningInterviewType | '')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="VIDEO_ASYNC">Video (Async)</option>
                <option value="PHONE">Phone</option>
                <option value="CHAT">Chat</option>
              </select>

              <button
                onClick={() => setShowCreateInterview(true)}
                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Screening Interview
              </button>
            </div>

            {/* Interview List */}
            <div className="grid gap-4">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {getInterviewTypeIcon(interview.interviewType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {interview.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {interview.candidate?.firstName} {interview.candidate?.lastName} - {interview.candidate?.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {interview.job?.title} at {interview.job?.companyName}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(interview.status)}`}>
                      {interview.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Type: {interview.interviewType}</span>
                    <span>|</span>
                    <span>Questions: {interview.completedQuestions}/{interview.totalQuestions}</span>
                    <span>|</span>
                    <span>Language: {interview.language}</span>
                    {interview.overallScore && (
                      <>
                        <span>|</span>
                        <span className="text-green-600 dark:text-green-400">Score: {interview.overallScore.toFixed(1)}/10</span>
                      </>
                    )}
                    {interview.expiresAt && (
                      <>
                        <span>|</span>
                        <span>Expires: {new Date(interview.expiresAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleViewResponses(interview)}
                      className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      View Responses
                    </button>
                    {interview.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleExtendDeadline(interview.id)}
                          className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800"
                        >
                          Extend Deadline
                        </button>
                        <button
                          onClick={() => handleCancelInterview(interview.id)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/screening/${interview.inviteToken}`)}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ))}

              {interviews.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No screening interviews found. Create one to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question Flows Tab */}
        {activeTab === 'flows' && !loading && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowCreateFlow(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Question Flow
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionFlows.map((flow) => (
                <div
                  key={flow.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{flow.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{flow.category}</p>
                    </div>
                    {flow.isTemplate && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 rounded">
                        Template
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{flow.description}</p>

                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Type: {flow.interviewType}</p>
                    <p>Questions: {flow._count?.questions || 0}</p>
                    <p>Duration: ~{flow.estimatedDuration || 30} min</p>
                    <p>Languages: {flow.supportedLanguages.join(', ')}</p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleSelectFlow(flow)}
                      className="flex-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Edit Questions
                    </button>
                    <button
                      onClick={() => handleDeleteFlow(flow.id)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {questionFlows.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  No question flows found. Create one to build your interview structure.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && !loading && (
          <div>
            {selectedFlow ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <button
                      onClick={() => { setSelectedFlow(null); setActiveTab('flows'); }}
                      className="text-blue-600 dark:text-blue-400 hover:underline mb-2"
                    >
                      &larr; Back to Flows
                    </button>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedFlow.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{selectedFlow.description}</p>
                  </div>
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedFlow.questions?.map((question, index) => (
                    <div
                      key={question.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">{question.questionText}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                {question.questionType}
                              </span>
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                {question.expectedResponseType}
                              </span>
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                {question.difficulty}
                              </span>
                              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded">
                                {question.maxPoints} pts
                              </span>
                              {question.isRequired && (
                                <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
                                  Required
                                </span>
                              )}
                              {question.aiFollowUpEnabled && (
                                <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded">
                                  AI Follow-up
                                </span>
                              )}
                            </div>
                            {question.hint && (
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                                Hint: {question.hint}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!selectedFlow.questions || selectedFlow.questions.length === 0) && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No questions yet. Add questions to build your interview flow.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Select a question flow from the Flows tab to manage its questions.
              </div>
            )}
          </div>
        )}

        {/* Responses Tab */}
        {activeTab === 'responses' && !loading && (
          <div>
            {selectedInterview ? (
              <>
                <div className="mb-6">
                  <button
                    onClick={() => { setSelectedInterview(null); setResponses([]); setActiveTab('interviews'); }}
                    className="text-blue-600 dark:text-blue-400 hover:underline mb-2"
                  >
                    &larr; Back to Interviews
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Responses for: {selectedInterview.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedInterview.candidate?.firstName} {selectedInterview.candidate?.lastName}
                  </p>
                </div>

                <div className="space-y-4">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {response.question?.questionText}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Response Type: {response.responseType} | Status: {response.status}
                          </p>
                        </div>
                        <div className="text-right">
                          {response.aiScore !== undefined && (
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              AI Score: {response.aiScore.toFixed(1)}/10
                            </p>
                          )}
                          {response.manualScore !== undefined && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Manual Score: {response.manualScore}/10
                            </p>
                          )}
                        </div>
                      </div>

                      {response.textResponse && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300">{response.textResponse}</p>
                        </div>
                      )}

                      {response.transcription && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Transcription:</p>
                          <p className="text-gray-700 dark:text-gray-300">{response.transcription}</p>
                        </div>
                      )}

                      {response.aiSummary && (
                        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">AI Summary:</p>
                          <p className="text-gray-700 dark:text-gray-300">{response.aiSummary}</p>
                          {response.aiKeywords && response.aiKeywords.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {response.aiKeywords.map((keyword, i) => (
                                <span key={i} className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        {response.videoUrl && (
                          <a
                            href={response.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            Watch Video
                          </a>
                        )}
                        {response.audioUrl && (
                          <a
                            href={response.audioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
                          >
                            Listen Audio
                          </a>
                        )}
                        <button
                          onClick={() => { setSelectedResponse(response); setShowReviewModal(true); }}
                          className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800"
                        >
                          Review & Score
                        </button>
                      </div>
                    </div>
                  ))}

                  {responses.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No responses recorded yet for this interview.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Select an interview from the Interviews tab to view responses.
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && !loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{template.category}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    template.isPublic
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {template.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{template.description}</p>

                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>Type: {template.interviewType}</p>
                  <p>AI Tone: {template.aiTone}</p>
                  <p>Duration: ~{template.defaultDuration || 30} min</p>
                  <p>Languages: {template.supportedLanguages.join(', ')}</p>
                  <p>Used: {template.usageCount} times</p>
                </div>

                {template.welcomeMessage && (
                  <div className="mt-4 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
                    "{template.welcomeMessage}"
                  </div>
                )}

                <button
                  className="mt-4 w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  Use Template
                </button>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                No templates available.
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && !loading && stats && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Completion Rate</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-blue-500"
                        strokeDasharray={`${parseFloat(stats.completionRate) * 3.52} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Average Score</h3>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-green-600 dark:text-green-400">
                      {stats.avgScore || 'N/A'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">out of 10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Interview Modal */}
        {showCreateInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Create Screening Interview
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title*</label>
                  <input
                    type="text"
                    value={newInterview.title}
                    onChange={(e) => setNewInterview({ ...newInterview, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Senior Developer Screening"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newInterview.description}
                    onChange={(e) => setNewInterview({ ...newInterview, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Candidate ID*</label>
                    <input
                      type="text"
                      value={newInterview.candidateId}
                      onChange={(e) => setNewInterview({ ...newInterview, candidateId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job ID</label>
                    <input
                      type="text"
                      value={newInterview.jobId}
                      onChange={(e) => setNewInterview({ ...newInterview, jobId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Type</label>
                    <select
                      value={newInterview.interviewType}
                      onChange={(e) => setNewInterview({ ...newInterview, interviewType: e.target.value as ScreeningInterviewType })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="VIDEO_ASYNC">Video (Async)</option>
                      <option value="PHONE">Phone</option>
                      <option value="CHAT">Chat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Tone</label>
                    <select
                      value={newInterview.aiTone}
                      onChange={(e) => setNewInterview({ ...newInterview, aiTone: e.target.value as AITone })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="FRIENDLY">Friendly</option>
                      <option value="CASUAL">Casual</option>
                      <option value="FORMAL">Formal</option>
                      <option value="EMPATHETIC">Empathetic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Time (min)</label>
                    <input
                      type="number"
                      value={newInterview.totalTimeLimit}
                      onChange={(e) => setNewInterview({ ...newInterview, totalTimeLimit: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                    <select
                      value={newInterview.language}
                      onChange={(e) => setNewInterview({ ...newInterview, language: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="pt">Portuguese</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableSmallTalk"
                    checked={newInterview.enableSmallTalk}
                    onChange={(e) => setNewInterview({ ...newInterview, enableSmallTalk: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableSmallTalk" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable AI small talk for a warmer experience
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowCreateInterview(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInterview}
                  disabled={!newInterview.title || !newInterview.candidateId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Interview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Question Flow Modal */}
        {showCreateFlow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Create Question Flow
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name*</label>
                  <input
                    type="text"
                    value={newFlow.name}
                    onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Frontend Developer Technical Screen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newFlow.description}
                    onChange={(e) => setNewFlow({ ...newFlow, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={newFlow.category}
                      onChange={(e) => setNewFlow({ ...newFlow, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., ENGINEERING"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Type</label>
                    <select
                      value={newFlow.interviewType}
                      onChange={(e) => setNewFlow({ ...newFlow, interviewType: e.target.value as ScreeningInterviewType })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="VIDEO_ASYNC">Video (Async)</option>
                      <option value="PHONE">Phone</option>
                      <option value="CHAT">Chat</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Role</label>
                    <input
                      type="text"
                      value={newFlow.targetRole}
                      onChange={(e) => setNewFlow({ ...newFlow, targetRole: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Level</label>
                    <input
                      type="text"
                      value={newFlow.targetLevel}
                      onChange={(e) => setNewFlow({ ...newFlow, targetLevel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Senior"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Duration (min)</label>
                  <input
                    type="number"
                    value={newFlow.estimatedDuration}
                    onChange={(e) => setNewFlow({ ...newFlow, estimatedDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isTemplate"
                    checked={newFlow.isTemplate}
                    onChange={(e) => setNewFlow({ ...newFlow, isTemplate: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isTemplate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Save as reusable template
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowCreateFlow(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFlow}
                  disabled={!newFlow.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Flow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Question Modal */}
        {showAddQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Add Question
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text*</label>
                  <textarea
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Enter your question here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Type</label>
                    <select
                      value={newQuestion.questionType}
                      onChange={(e) => setNewQuestion({ ...newQuestion, questionType: e.target.value as ScreeningQuestionType })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="TEXT">Text</option>
                      <option value="BEHAVIORAL">Behavioral</option>
                      <option value="SITUATIONAL">Situational</option>
                      <option value="TECHNICAL">Technical</option>
                      <option value="CODING">Coding</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="SINGLE_CHOICE">Single Choice</option>
                      <option value="SCALE">Scale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Response Type</label>
                    <select
                      value={newQuestion.expectedResponseType}
                      onChange={(e) => setNewQuestion({ ...newQuestion, expectedResponseType: e.target.value as ResponseType })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="VIDEO">Video</option>
                      <option value="AUDIO">Audio</option>
                      <option value="TEXT">Text</option>
                      <option value="CODE">Code</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Technical Skills"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as DifficultyLevel })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Duration (sec)</label>
                    <input
                      type="number"
                      value={newQuestion.maxResponseDuration}
                      onChange={(e) => setNewQuestion({ ...newQuestion, maxResponseDuration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Points</label>
                    <input
                      type="number"
                      value={newQuestion.maxPoints}
                      onChange={(e) => setNewQuestion({ ...newQuestion, maxPoints: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Retakes</label>
                    <input
                      type="number"
                      value={newQuestion.maxRetakes}
                      onChange={(e) => setNewQuestion({ ...newQuestion, maxRetakes: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hint (optional)</label>
                  <input
                    type="text"
                    value={newQuestion.hint}
                    onChange={(e) => setNewQuestion({ ...newQuestion, hint: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Provide a helpful hint for candidates"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRequired"
                      checked={newQuestion.isRequired}
                      onChange={(e) => setNewQuestion({ ...newQuestion, isRequired: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isRequired" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Required
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowRetakes"
                      checked={newQuestion.allowRetakes}
                      onChange={(e) => setNewQuestion({ ...newQuestion, allowRetakes: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="allowRetakes" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Allow Retakes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="aiFollowUp"
                      checked={newQuestion.aiFollowUpEnabled}
                      onChange={(e) => setNewQuestion({ ...newQuestion, aiFollowUpEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="aiFollowUp" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      AI Follow-up
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.questionText}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Response Modal */}
        {showReviewModal && selectedResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Review Response
              </h2>

              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Question:</p>
                <p className="text-gray-900 dark:text-white">{selectedResponse.question?.questionText}</p>
              </div>

              {selectedResponse.aiScore !== undefined && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    AI Score: {selectedResponse.aiScore.toFixed(1)}/10
                  </p>
                  {selectedResponse.aiSummary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedResponse.aiSummary}</p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manual Score (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={reviewData.manualScore}
                    onChange={(e) => setReviewData({ ...reviewData, manualScore: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Feedback
                  </label>
                  <textarea
                    value={reviewData.manualFeedback}
                    onChange={(e) => setReviewData({ ...reviewData, manualFeedback: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Provide detailed feedback..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => { setShowReviewModal(false); setSelectedResponse(null); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewResponse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIScreeningHub;
