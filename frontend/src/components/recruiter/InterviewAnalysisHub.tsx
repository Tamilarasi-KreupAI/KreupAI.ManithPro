import React, { useState, useEffect } from 'react';
import {
  InterviewTranscription,
  AnswerAnalysis,
  TopicDetection,
  SentimentAnalysis,
  CommunicationScore,
  TechnicalVerification,
  RedFlagAlert,
  InterviewSummary,
  InterviewHighlight,
  CandidateComparison,
  FullAnalysisResult,
  HiringRecommendation,
  RedFlagDisposition,
} from '../../types';
import {
  getFullAnalysis,
  runFullAnalysis,
  getTranscriptions,
  getAnswerAnalyses,
  getTopicDetections,
  getSentimentAnalyses,
  getCommunicationScore,
  getTechnicalVerifications,
  getRedFlagAlerts,
  reviewRedFlag,
  getInterviewSummaries,
  generateSummary,
  approveSummary,
  updateRecommendation,
  getHighlights,
  extractHighlights,
  bookmarkHighlight,
  getComparisons,
  createComparison,
} from '../../services/batch18InterviewAnalysisAPI';

const InterviewAnalysisHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transcription' | 'answers' | 'topics' | 'sentiment' | 'communication' | 'verification' | 'redflags' | 'summary' | 'highlights' | 'comparison'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>('interview-1');

  // Data states
  const [fullAnalysis, setFullAnalysis] = useState<FullAnalysisResult | null>(null);
  const [transcriptions, setTranscriptions] = useState<InterviewTranscription[]>([]);
  const [answerAnalyses, setAnswerAnalyses] = useState<AnswerAnalysis[]>([]);
  const [topicDetections, setTopicDetections] = useState<TopicDetection[]>([]);
  const [sentimentAnalyses, setSentimentAnalyses] = useState<SentimentAnalysis[]>([]);
  const [communicationScore, setCommunicationScore] = useState<CommunicationScore | null>(null);
  const [technicalVerifications, setTechnicalVerifications] = useState<TechnicalVerification[]>([]);
  const [redFlagAlerts, setRedFlagAlerts] = useState<RedFlagAlert[]>([]);
  const [summaries, setSummaries] = useState<InterviewSummary[]>([]);
  const [highlights, setHighlights] = useState<InterviewHighlight[]>([]);
  const [comparisons, setComparisons] = useState<CandidateComparison[]>([]);

  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [selectedRedFlag, setSelectedRedFlag] = useState<RedFlagAlert | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<InterviewSummary | null>(null);

  // Form states
  const [reviewForm, setReviewForm] = useState({
    disposition: 'CONFIRMED' as RedFlagDisposition,
    reviewNotes: '',
    isFalsePositive: false,
  });
  const [recommendationForm, setRecommendationForm] = useState({
    hiringRecommendation: 'NEEDS_REVIEW' as HiringRecommendation,
    recommendationReason: '',
    nextSteps: [] as string[],
  });

  useEffect(() => {
    loadOverviewData();
  }, [selectedInterviewId]);

  useEffect(() => {
    loadTabData();
  }, [activeTab, selectedInterviewId]);

  const loadOverviewData = async () => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await getFullAnalysis(selectedInterviewId);
      setFullAnalysis(analysis);
    } catch (err) {
      setError('Failed to load analysis overview');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    if (activeTab === 'overview') return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'transcription':
          setTranscriptions(await getTranscriptions(selectedInterviewId));
          break;
        case 'answers':
          setAnswerAnalyses(await getAnswerAnalyses(selectedInterviewId));
          break;
        case 'topics':
          setTopicDetections(await getTopicDetections(selectedInterviewId));
          break;
        case 'sentiment':
          setSentimentAnalyses(await getSentimentAnalyses(selectedInterviewId));
          break;
        case 'communication':
          const commScore = await getCommunicationScore(selectedInterviewId);
          setCommunicationScore(commScore);
          break;
        case 'verification':
          setTechnicalVerifications(await getTechnicalVerifications(selectedInterviewId));
          break;
        case 'redflags':
          setRedFlagAlerts(await getRedFlagAlerts(selectedInterviewId));
          break;
        case 'summary':
          setSummaries(await getInterviewSummaries(selectedInterviewId));
          break;
        case 'highlights':
          setHighlights(await getHighlights(selectedInterviewId));
          break;
        case 'comparison':
          setComparisons(await getComparisons());
          break;
      }
    } catch (err) {
      setError(`Failed to load ${activeTab} data`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      setLoading(true);
      await runFullAnalysis(selectedInterviewId);
      loadOverviewData();
    } catch (err) {
      setError('Failed to run analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setLoading(true);
      await generateSummary(selectedInterviewId);
      setSummaries(await getInterviewSummaries(selectedInterviewId));
    } catch (err) {
      setError('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractHighlights = async () => {
    try {
      setLoading(true);
      await extractHighlights(selectedInterviewId);
      setHighlights(await getHighlights(selectedInterviewId));
    } catch (err) {
      setError('Failed to extract highlights');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRedFlag = async () => {
    if (!selectedRedFlag) return;
    try {
      await reviewRedFlag(selectedRedFlag.id, reviewForm);
      setShowReviewModal(false);
      setRedFlagAlerts(await getRedFlagAlerts(selectedInterviewId));
    } catch (err) {
      setError('Failed to review red flag');
    }
  };

  const handleUpdateRecommendation = async () => {
    if (!selectedSummary) return;
    try {
      await updateRecommendation(selectedSummary.id, recommendationForm);
      setShowRecommendationModal(false);
      setSummaries(await getInterviewSummaries(selectedInterviewId));
    } catch (err) {
      setError('Failed to update recommendation');
    }
  };

  const handleBookmarkHighlight = async (id: string) => {
    try {
      await bookmarkHighlight(id, { bookmarkNotes: 'Bookmarked for review' });
      setHighlights(await getHighlights(selectedInterviewId));
    } catch (err) {
      setError('Failed to bookmark highlight');
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[severity] || colors.MEDIUM;
  };

  const getRecommendationColor = (rec: string) => {
    const colors: Record<string, string> = {
      STRONG_YES: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      YES: 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      MAYBE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      NO: 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300',
      STRONG_NO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      NEEDS_REVIEW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[rec] || colors.NEEDS_REVIEW;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'transcription', label: 'Transcription', icon: '📝' },
    { id: 'answers', label: 'Answer Analysis', icon: '✅' },
    { id: 'topics', label: 'Topics', icon: '🏷️' },
    { id: 'sentiment', label: 'Sentiment', icon: '😊' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'verification', label: 'Technical', icon: '🔍' },
    { id: 'redflags', label: 'Red Flags', icon: '🚩' },
    { id: 'summary', label: 'Summary', icon: '📋' },
    { id: 'highlights', label: 'Highlights', icon: '⭐' },
    { id: 'comparison', label: 'Compare', icon: '⚖️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interview Analysis</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            AI-powered interview insights, scoring, and recommendations
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
          </div>
        )}

        {/* Interview Selector */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interview:</label>
          <select
            value={selectedInterviewId}
            onChange={(e) => setSelectedInterviewId(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="interview-1">Senior Frontend Developer - John Doe</option>
            <option value="interview-2">Product Manager - Jane Smith</option>
            <option value="interview-3">Backend Developer - Mike Johnson</option>
          </select>
          <button
            onClick={handleRunAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Run Full Analysis
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && !loading && fullAnalysis && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Transcriptions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{fullAnalysis.analysisStats.transcriptionCount}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Answer Analyses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{fullAnalysis.analysisStats.answerAnalysisCount}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Red Flags</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{fullAnalysis.analysisStats.redFlagCount}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Answer Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(fullAnalysis.analysisStats.averageAnswerScore || 0)}`}>
                  {fullAnalysis.analysisStats.averageAnswerScore?.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>

            {/* Quick Summary */}
            {fullAnalysis.summaries.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Executive Summary</h3>
                <p className="text-gray-700 dark:text-gray-300">{fullAnalysis.summaries[0].executiveSummary}</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(fullAnalysis.summaries[0].hiringRecommendation)}`}>
                    {fullAnalysis.summaries[0].hiringRecommendation.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Score: {fullAnalysis.summaries[0].overallScore.toFixed(1)}/100
                  </span>
                </div>
              </div>
            )}

            {/* Highlights Preview */}
            {fullAnalysis.highlights.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Highlights</h3>
                <div className="space-y-3">
                  {fullAnalysis.highlights.slice(0, 3).map((highlight) => (
                    <div key={highlight.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className={`px-2 py-1 text-xs rounded ${
                        highlight.highlightType === 'STRENGTH' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                        highlight.highlightType === 'CONCERN' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {highlight.highlightType}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{highlight.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{highlight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcription Tab */}
        {activeTab === 'transcription' && !loading && (
          <div className="space-y-4">
            {transcriptions.map((trans) => (
              <div key={trans.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Transcription</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Engine: {trans.transcriptionEngine} | Confidence: {(trans.confidence || 0 * 100).toFixed(0)}%
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    trans.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    trans.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                    trans.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {trans.status}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {trans.formattedTranscript || trans.rawTranscript}
                  </pre>
                </div>
                <div className="mt-4 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Words: {trans.wordCount}</span>
                  <span>Language: {trans.language}</span>
                  <span>Quality: {trans.audioQuality || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Answer Analysis Tab */}
        {activeTab === 'answers' && !loading && (
          <div className="space-y-4">
            {answerAnalyses.map((analysis) => (
              <div key={analysis.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{analysis.questionType}</p>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{analysis.questionText}</h3>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore.toFixed(0)}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {['relevanceScore', 'completenessScore', 'depthScore', 'clarityScore', 'structureScore', 'specificityScore'].map((key) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key.replace('Score', '')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${analysis[key as keyof AnswerAnalysis] as number >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${analysis[key as keyof AnswerAnalysis]}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{(analysis[key as keyof AnswerAnalysis] as number).toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Strengths</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                      {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">Areas to Improve</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                      {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && !loading && (
          <div className="space-y-4">
            {topicDetections.map((detection) => (
              <div key={detection.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Primary Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {detection.primaryTopics.map((topic, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {detection.keywords.slice(0, 10).map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                          {kw.keyword} ({kw.count})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{detection.topicCoverageScore}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Coverage Score</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{detection.topicDepthScore}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Depth Score</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{detection.relevanceScore}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Relevance Score</p>
                  </div>
                </div>

                {detection.missedTopics.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Missed Topics:</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{detection.missedTopics.join(', ')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sentiment Tab */}
        {activeTab === 'sentiment' && !loading && (
          <div className="space-y-4">
            {sentimentAnalyses.map((sentiment) => (
              <div key={sentiment.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className={`px-4 py-2 rounded-full text-lg font-medium ${
                      sentiment.overallSentiment.includes('POSITIVE') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                      sentiment.overallSentiment.includes('NEGATIVE') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {sentiment.overallSentiment.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Confidence</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{(sentiment.sentimentConfidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sentiment.enthusiasmScore}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enthusiasm</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{sentiment.authenticityScore}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Authenticity</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{sentiment.confidenceScore}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{sentiment.hesitationMarkers}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Hesitations</p>
                  </div>
                </div>

                {sentiment.passionIndicators.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passion Indicators</h4>
                    <div className="flex flex-wrap gap-2">
                      {sentiment.passionIndicators.map((indicator, i) => (
                        <span key={i} className="px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 rounded text-sm">
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && !loading && communicationScore && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Communication Skills Assessment</h3>
              <div className={`text-4xl font-bold ${getScoreColor(communicationScore.overallScore)}`}>
                {communicationScore.overallScore.toFixed(0)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Clarity', value: communicationScore.clarityScore },
                { label: 'Articulation', value: communicationScore.articulationScore },
                { label: 'Vocabulary', value: communicationScore.vocabularyScore },
                { label: 'Grammar', value: communicationScore.grammarScore },
                { label: 'Coherence', value: communicationScore.coherenceScore },
                { label: 'Structure', value: communicationScore.structureScore },
                { label: 'Conciseness', value: communicationScore.conciseness },
                { label: 'Relevance', value: communicationScore.relevance },
                { label: 'Professionalism', value: communicationScore.professionalismScore },
                { label: 'Engagement', value: communicationScore.engagementScore },
                { label: 'Technical Clarity', value: communicationScore.technicalClarity || 0 },
                { label: 'Use of Examples', value: communicationScore.useOfExamples },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className={`h-full ${item.value >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${item.value}%` }} />
                    </div>
                    <span className={`font-medium ${getScoreColor(item.value)}`}>{item.value.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Strengths</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {communicationScore.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">Recommendations</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {communicationScore.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Red Flags Tab */}
        {activeTab === 'redflags' && !loading && (
          <div className="space-y-4">
            {redFlagAlerts.length === 0 ? (
              <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-6 text-center">
                <p className="text-green-700 dark:text-green-300">No red flags detected in this interview.</p>
              </div>
            ) : redFlagAlerts.map((flag) => (
              <div key={flag.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(flag.severity)}`}>
                      {flag.severity}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{flag.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{flag.flagType}</p>
                    </div>
                  </div>
                  {flag.isReviewed && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded">
                      Reviewed
                    </span>
                  )}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">{flag.description}</p>

                {flag.triggerText && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">
                    <p className="text-sm text-red-700 dark:text-red-300 italic">"{flag.triggerText}"</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Confidence: {(flag.confidence * 100).toFixed(0)}%
                  </div>
                  {!flag.isReviewed && (
                    <button
                      onClick={() => { setSelectedRedFlag(flag); setShowReviewModal(true); }}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && !loading && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleGenerateSummary}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate New Summary
              </button>
            </div>

            {summaries.map((summary) => (
              <div key={summary.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Interview Summary</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Version {summary.version}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRecommendationColor(summary.hiringRecommendation)}`}>
                      {summary.hiringRecommendation.replace('_', ' ')}
                    </span>
                    <span className={`text-2xl font-bold ${getScoreColor(summary.overallScore)}`}>
                      {summary.overallScore.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-6">
                  <h4>Executive Summary</h4>
                  <p>{summary.executiveSummary}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Top Strengths</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                      {summary.topStrengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">Areas of Concern</h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                      {summary.areasOfConcern.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedSummary(summary); setRecommendationForm({ ...recommendationForm, hiringRecommendation: summary.hiringRecommendation }); setShowRecommendationModal(true); }}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    Update Recommendation
                  </button>
                  {!summary.isApproved && (
                    <button
                      onClick={() => approveSummary(summary.id, {})}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Highlights Tab */}
        {activeTab === 'highlights' && !loading && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleExtractHighlights}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Extract Highlights
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      highlight.highlightType === 'STRENGTH' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                      highlight.highlightType === 'CONCERN' || highlight.highlightType === 'RED_FLAG' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {highlight.highlightType}
                    </span>
                    <button
                      onClick={() => handleBookmarkHighlight(highlight.id)}
                      className={`p-1 rounded ${highlight.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      <svg className="w-5 h-5" fill={highlight.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{highlight.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{highlight.description}</p>

                  {highlight.transcript && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 italic">
                      "{highlight.transcript.slice(0, 150)}..."
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1">
                    {highlight.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && !loading && (
          <div>
            {comparisons.map((comparison) => (
              <div key={comparison.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {comparison.comparisonName || 'Candidate Comparison'}
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Rank</th>
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Candidate</th>
                        <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">Overall Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.overallRanking.map((ranking) => (
                        <tr key={ranking.candidateId} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              ranking.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                              ranking.rank === 2 ? 'bg-gray-100 text-gray-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {ranking.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                            Candidate {ranking.candidateId.split('-')[1]}
                            {ranking.candidateId === comparison.topRecommendation && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded">
                                Top Pick
                              </span>
                            )}
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${getScoreColor(ranking.score)}`}>
                            {ranking.score.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {comparison.recommendationReason && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Recommendation:</strong> {comparison.recommendationReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Red Flag Modal */}
        {showReviewModal && selectedRedFlag && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Review Red Flag</h2>

              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Flag: {selectedRedFlag.title}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disposition</label>
                  <select
                    value={reviewForm.disposition}
                    onChange={(e) => setReviewForm({ ...reviewForm, disposition: e.target.value as RedFlagDisposition })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="DISMISSED">Dismissed</option>
                    <option value="NEEDS_FOLLOW_UP">Needs Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={reviewForm.reviewNotes}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewNotes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="falsePositive"
                    checked={reviewForm.isFalsePositive}
                    onChange={(e) => setReviewForm({ ...reviewForm, isFalsePositive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="falsePositive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Mark as false positive
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewRedFlag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Recommendation Modal */}
        {showRecommendationModal && selectedSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Update Recommendation</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hiring Recommendation</label>
                  <select
                    value={recommendationForm.hiringRecommendation}
                    onChange={(e) => setRecommendationForm({ ...recommendationForm, hiringRecommendation: e.target.value as HiringRecommendation })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="STRONG_YES">Strong Yes</option>
                    <option value="YES">Yes</option>
                    <option value="MAYBE">Maybe</option>
                    <option value="NO">No</option>
                    <option value="STRONG_NO">Strong No</option>
                    <option value="NEEDS_REVIEW">Needs Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                  <textarea
                    value={recommendationForm.recommendationReason}
                    onChange={(e) => setRecommendationForm({ ...recommendationForm, recommendationReason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowRecommendationModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRecommendation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewAnalysisHub;
