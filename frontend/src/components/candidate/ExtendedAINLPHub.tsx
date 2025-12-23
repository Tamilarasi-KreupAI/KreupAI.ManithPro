import React, { useState } from 'react';
import {
  CareerPathAdvice,
  CareerPathAdviceRequest,
  LearningRecommendation,
  LearningRecommendationRequest,
  ApplicationInsight,
  PortfolioFeedback,
  PortfolioFeedbackRequest,
  ParsedDocument,
  ParseDocumentRequest,
  SkillExtraction,
  ExtractSkillsRequest,
  SemanticSearchResponse,
  SemanticSearchRequest,
  EntityRecognition,
  RecognizeEntitiesRequest,
  CareerLevel,
  Timeframe,
  LearningGoal,
  LearningFormat,
  LearningLevel,
  PortfolioType,
  DocumentType,
  SkillSourceType,
  SearchEntityType,
  EntitySourceType,
} from '../../types';
import {
  careerPathAPI,
  learningAPI,
  applicationInsightsAPI,
  portfolioFeedbackAPI,
  documentParserAPI,
  skillExtractionAPI,
  semanticSearchAPI,
  entityRecognitionAPI,
} from '../../services/batch14ExtendedAINLPAPI';

type TabType = 'career' | 'learning' | 'insights' | 'portfolio' | 'parser' | 'skills' | 'search' | 'entities';

const ExtendedAINLPHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('career');
  const [loading, setLoading] = useState(false);

  // Career Path State
  const [careerAdvice, setCareerAdvice] = useState<CareerPathAdvice | null>(null);
  const [careerForm, setCareerForm] = useState<Partial<CareerPathAdviceRequest>>({
    currentRole: '',
    currentLevel: 'MID',
    currentIndustry: '',
    yearsExperience: 5,
    targetRoles: [],
    targetLevel: 'SENIOR',
    targetTimeframe: '2_YEARS',
  });

  // Learning State
  const [learningRec, setLearningRec] = useState<LearningRecommendation | null>(null);
  const [learningForm, setLearningForm] = useState<Partial<LearningRecommendationRequest>>({
    learningGoal: 'SKILL_GAP',
    targetSkills: [],
    currentLevel: 'INTERMEDIATE',
    preferredFormat: ['VIDEO'],
    timeAvailable: '10 hours/week',
  });

  // Application Insights State
  const [applicationInsight, setApplicationInsight] = useState<ApplicationInsight | null>(null);
  const [applicationId, setApplicationId] = useState('');

  // Portfolio State
  const [portfolioFeedback, setPortfolioFeedback] = useState<PortfolioFeedback | null>(null);
  const [portfolioForm, setPortfolioForm] = useState<Partial<PortfolioFeedbackRequest>>({
    portfolioUrl: '',
    portfolioType: 'GITHUB',
  });

  // Parser State
  const [parsedDoc, setParsedDoc] = useState<ParsedDocument | null>(null);
  const [parseForm, setParseForm] = useState<Partial<ParseDocumentRequest>>({
    documentType: 'RESUME',
    rawText: '',
  });

  // Skills State
  const [skillExtraction, setSkillExtraction] = useState<SkillExtraction | null>(null);
  const [skillsForm, setSkillsForm] = useState<Partial<ExtractSkillsRequest>>({
    sourceType: 'RESUME',
    sourceText: '',
  });

  // Search State
  const [searchResults, setSearchResults] = useState<SemanticSearchResponse | null>(null);
  const [searchForm, setSearchForm] = useState<Partial<SemanticSearchRequest>>({
    query: '',
    entityType: 'CANDIDATE',
    limit: 20,
  });

  // Entity Recognition State
  const [entityResult, setEntityResult] = useState<EntityRecognition | null>(null);
  const [entityForm, setEntityForm] = useState<Partial<RecognizeEntitiesRequest>>({
    sourceType: 'RESUME',
    sourceText: '',
  });

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'career', label: 'Career Path', icon: '🎯' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'insights', label: 'App Insights', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'parser', label: 'Resume Parser', icon: '📄' },
    { id: 'skills', label: 'Skill Extract', icon: '🔍' },
    { id: 'search', label: 'Semantic Search', icon: '🔎' },
    { id: 'entities', label: 'Entity NER', icon: '🏷️' },
  ];

  // Handlers
  const handleGetCareerAdvice = async () => {
    setLoading(true);
    try {
      const result = await careerPathAPI.getAdvice(careerForm as CareerPathAdviceRequest);
      setCareerAdvice(result);
    } catch (error) {
      console.error('Error getting career advice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLearningRec = async () => {
    setLoading(true);
    try {
      const result = await learningAPI.getRecommendations(learningForm as LearningRecommendationRequest);
      setLearningRec(result);
    } catch (error) {
      console.error('Error getting learning recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsights = async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const result = await applicationInsightsAPI.getInsights(applicationId);
      setApplicationInsight(result);
    } catch (error) {
      console.error('Error getting insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetPortfolioFeedback = async () => {
    setLoading(true);
    try {
      const result = await portfolioFeedbackAPI.getFeedback(portfolioForm as PortfolioFeedbackRequest);
      setPortfolioFeedback(result);
    } catch (error) {
      console.error('Error getting portfolio feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParseDocument = async () => {
    setLoading(true);
    try {
      const result = await documentParserAPI.parseDocument(parseForm as ParseDocumentRequest);
      setParsedDoc(result);
    } catch (error) {
      console.error('Error parsing document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractSkills = async () => {
    setLoading(true);
    try {
      const result = await skillExtractionAPI.extractSkills(skillsForm as ExtractSkillsRequest);
      setSkillExtraction(result);
    } catch (error) {
      console.error('Error extracting skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = async () => {
    setLoading(true);
    try {
      const result = await semanticSearchAPI.search(searchForm as SemanticSearchRequest);
      setSearchResults(result);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecognizeEntities = async () => {
    setLoading(true);
    try {
      const result = await entityRecognitionAPI.recognizeEntities(entityForm as RecognizeEntitiesRequest);
      setEntityResult(result);
    } catch (error) {
      console.error('Error recognizing entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCareerTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Career Path Advisor</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get AI-powered career path recommendations based on your current position and goals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Role</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={careerForm.currentRole}
              onChange={(e) => setCareerForm({ ...careerForm, currentRole: e.target.value })}
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Level</label>
            <select
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={careerForm.currentLevel}
              onChange={(e) => setCareerForm({ ...careerForm, currentLevel: e.target.value as CareerLevel })}
            >
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid-Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="MANAGER">Manager</option>
              <option value="DIRECTOR">Director</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Industry</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={careerForm.currentIndustry}
              onChange={(e) => setCareerForm({ ...careerForm, currentIndustry: e.target.value })}
              placeholder="e.g., Technology"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years Experience</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={careerForm.yearsExperience}
              onChange={(e) => setCareerForm({ ...careerForm, yearsExperience: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Level</label>
            <select
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={careerForm.targetLevel}
              onChange={(e) => setCareerForm({ ...careerForm, targetLevel: e.target.value as CareerLevel })}
            >
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="MANAGER">Manager</option>
              <option value="DIRECTOR">Director</option>
              <option value="VP">VP</option>
              <option value="C_LEVEL">C-Level</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Timeframe</label>
            <select
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={careerForm.targetTimeframe}
              onChange={(e) => setCareerForm({ ...careerForm, targetTimeframe: e.target.value as Timeframe })}
            >
              <option value="1_YEAR">1 Year</option>
              <option value="2_YEARS">2 Years</option>
              <option value="5_YEARS">5 Years</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGetCareerAdvice}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing Career Path...' : 'Get Career Advice'}
        </button>
      </div>

      {careerAdvice && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Career Path Analysis</h4>

          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h5 className="font-medium text-blue-800 dark:text-blue-300">Recommended Path</h5>
            <p className="text-sm text-blue-600 dark:text-blue-400">{careerAdvice.recommendedPath.name}</p>
            <p className="text-xs text-blue-500 mt-1">Confidence: {(careerAdvice.recommendedPath.confidence * 100).toFixed(0)}%</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white">Transition Difficulty</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">{careerAdvice.transitionDifficulty}</p>
              <p className="text-xs text-gray-500 mt-1">Time: {careerAdvice.timeToTransition}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white">Market Demand</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">{careerAdvice.marketDemand}</p>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Career Steps</h5>
            <div className="space-y-2">
              {careerAdvice.recommendedPath.steps.map((step: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs">{step.step}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{step.role}</span>
                  <span className="text-xs text-gray-500 ml-auto">{step.timeline}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Skill Gaps</h5>
            <div className="space-y-2">
              {careerAdvice.skillGaps.map((gap: any, idx: number) => (
                <div key={idx} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{gap.skill}</span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">{gap.priority} Priority</span>
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    Current: {gap.currentLevel} → Required: {gap.requiredLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Immediate Actions</h5>
            <ul className="list-disc list-inside space-y-1">
              {careerAdvice.immediateActions.map((action: any, idx: number) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">{action}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderLearningTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Learning Recommendations</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get personalized learning paths, courses, and resources to boost your career.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learning Goal</label>
            <select
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={learningForm.learningGoal}
              onChange={(e) => setLearningForm({ ...learningForm, learningGoal: e.target.value as LearningGoal })}
            >
              <option value="SKILL_GAP">Fill Skill Gaps</option>
              <option value="CAREER_CHANGE">Career Change</option>
              <option value="UPSKILL">General Upskilling</option>
              <option value="CERTIFICATION">Get Certified</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Level</label>
            <select
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={learningForm.currentLevel}
              onChange={(e) => setLearningForm({ ...learningForm, currentLevel: e.target.value as LearningLevel })}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Available</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={learningForm.timeAvailable}
              onChange={(e) => setLearningForm({ ...learningForm, timeAvailable: e.target.value })}
              placeholder="e.g., 10 hours/week"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget ($)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={learningForm.budget || ''}
              onChange={(e) => setLearningForm({ ...learningForm, budget: parseInt(e.target.value) || undefined })}
              placeholder="Optional"
            />
          </div>
        </div>

        <button
          onClick={handleGetLearningRec}
          disabled={loading}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Generating Recommendations...' : 'Get Learning Plan'}
        </button>
      </div>

      {learningRec && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Your Learning Plan</h4>

          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-medium text-green-800 dark:text-green-300">Estimated Duration</h5>
                <p className="text-sm text-green-600 dark:text-green-400">{learningRec.estimatedDuration}</p>
              </div>
              <div className="text-right">
                <h5 className="font-medium text-green-800 dark:text-green-300">Salary Impact</h5>
                <p className="text-sm text-green-600 dark:text-green-400">+${learningRec.salaryImpact?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Recommended Courses</h5>
            <div className="space-y-2">
              {learningRec.courses.map((course) => (
                <div key={course.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{course.title}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">${course.price}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {course.provider} | {course.duration} | Rating: {course.rating}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Learning Path</h5>
            <div className="space-y-2">
              {learningRec.learningPath.map((phase) => (
                <div key={phase.phase} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="w-6 h-6 flex items-center justify-center bg-green-600 text-white rounded-full text-xs">{phase.phase}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{phase.focus}</span>
                  <span className="text-xs text-gray-500 ml-auto">{phase.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Free Resources</h5>
            <ul className="list-disc list-inside space-y-1">
              {learningRec.freeResources.map((resource: any, idx: number) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                  {resource.title} ({resource.type})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Application Status Insights</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get AI-powered insights about your job applications and hiring probability.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            placeholder="Enter application ID"
          />
        </div>

        <button
          onClick={handleGetInsights}
          disabled={loading || !applicationId}
          className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing Application...' : 'Get Insights'}
        </button>
      </div>

      {applicationInsight && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Application Analysis</h4>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(applicationInsight.advanceProbability * 100).toFixed(0)}%</p>
              <p className="text-xs text-blue-500">Advance Probability</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(applicationInsight.hireProbability * 100).toFixed(0)}%</p>
              <p className="text-xs text-green-500">Hire Probability</p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Stage</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{applicationInsight.currentStage}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time in Stage</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{applicationInsight.timeInStage} days</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Rank</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{applicationInsight.rankEstimate}</span>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Immediate Actions</h5>
            <ul className="list-disc list-inside space-y-1">
              {applicationInsight.immediateActions.map((action: any, idx: number) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">{action}</li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Positive Signals</h5>
            {applicationInsight.positiveSignals.map((signal: any, idx: number) => (
              <div key={idx} className="p-2 bg-green-50 dark:bg-green-900/20 rounded mb-2">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">{signal.signal}</p>
                <p className="text-xs text-green-600 dark:text-green-400">{signal.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPortfolioTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Portfolio Feedback</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get AI analysis and improvement suggestions for your portfolio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio URL</label>
            <input
              type="url"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={portfolioForm.portfolioUrl}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, portfolioUrl: e.target.value })}
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio Type</label>
            <select
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={portfolioForm.portfolioType}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, portfolioType: e.target.value as PortfolioType })}
            >
              <option value="GITHUB">GitHub</option>
              <option value="PERSONAL_WEBSITE">Personal Website</option>
              <option value="BEHANCE">Behance</option>
              <option value="DRIBBBLE">Dribbble</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGetPortfolioFeedback}
          disabled={loading}
          className="w-full py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing Portfolio...' : 'Get Feedback'}
        </button>
      </div>

      {portfolioFeedback && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Portfolio Analysis</h4>
            <div className="text-center">
              <span className="text-3xl font-bold text-orange-600">{portfolioFeedback.overallGrade}</span>
              <p className="text-xs text-gray-500">({portfolioFeedback.overallScore}/100)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{portfolioFeedback.visualAppeal}</p>
              <p className="text-xs text-gray-500">Visual Appeal</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{portfolioFeedback.technicalDepth}</p>
              <p className="text-xs text-gray-500">Tech Depth</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{portfolioFeedback.techStackDiversity}</p>
              <p className="text-xs text-gray-500">Tech Diversity</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{portfolioFeedback.uniqueness}</p>
              <p className="text-xs text-gray-500">Uniqueness</p>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Quick Wins</h5>
            {portfolioFeedback.quickWins.map((win: any, idx: number) => (
              <div key={idx} className="p-2 bg-green-50 dark:bg-green-900/20 rounded mb-2 flex justify-between">
                <span className="text-sm text-green-800 dark:text-green-300">{win.action}</span>
                <span className="text-xs text-green-600">{win.effort} | {win.impact} impact</span>
              </div>
            ))}
          </div>

          <div>
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Prioritized Actions</h5>
            {portfolioFeedback.prioritizedActions.map((action) => (
              <div key={action.rank} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded mb-2">
                <span className="w-6 h-6 flex items-center justify-center bg-orange-600 text-white rounded-full text-xs">{action.rank}</span>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{action.action}</p>
                  <p className="text-xs text-gray-500">{action.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderParserTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resume/Profile Parser</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Extract structured data from resumes and profiles using NLP.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
          <select
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={parseForm.documentType}
            onChange={(e) => setParseForm({ ...parseForm, documentType: e.target.value as DocumentType })}
          >
            <option value="RESUME">Resume</option>
            <option value="CV">CV</option>
            <option value="LINKEDIN_EXPORT">LinkedIn Export</option>
            <option value="PROFILE_EXPORT">Profile Export</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Text</label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={6}
            value={parseForm.rawText}
            onChange={(e) => setParseForm({ ...parseForm, rawText: e.target.value })}
            placeholder="Paste your resume text here..."
          />
        </div>

        <button
          onClick={handleParseDocument}
          disabled={loading || !parseForm.rawText}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Parsing Document...' : 'Parse Document'}
        </button>
      </div>

      {parsedDoc && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Parsed Results</h4>
            <span className="text-sm text-gray-500">Confidence: {(parsedDoc.parseConfidence * 100).toFixed(0)}%</span>
          </div>

          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Contact Info</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {parsedDoc.contactInfo.name}</p>
              <p><span className="text-gray-500">Email:</span> {parsedDoc.contactInfo.email}</p>
              <p><span className="text-gray-500">Phone:</span> {parsedDoc.contactInfo.phone}</p>
              <p><span className="text-gray-500">Location:</span> {parsedDoc.contactInfo.location}</p>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Work Experience</h5>
            {parsedDoc.workExperience.map((exp: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{exp.title}</span>
                  <span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Extracted Skills</h5>
            <div className="flex flex-wrap gap-2">
              {Object.values(parsedDoc.skills).flat().map((skill: any, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Analysis</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><span className="text-gray-500">Seniority:</span> {parsedDoc.seniorityLevel}</p>
              <p><span className="text-gray-500">Format Quality:</span> {parsedDoc.formatQuality}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSkillsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Skill Extraction</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Extract and analyze skills from any text using NLP.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Type</label>
          <select
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={skillsForm.sourceType}
            onChange={(e) => setSkillsForm({ ...skillsForm, sourceType: e.target.value as SkillSourceType })}
          >
            <option value="RESUME">Resume</option>
            <option value="JOB_DESCRIPTION">Job Description</option>
            <option value="PROFILE">Profile</option>
            <option value="PROJECT">Project</option>
            <option value="FREE_TEXT">Free Text</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Text</label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={6}
            value={skillsForm.sourceText}
            onChange={(e) => setSkillsForm({ ...skillsForm, sourceText: e.target.value })}
            placeholder="Paste text to extract skills from..."
          />
        </div>

        <button
          onClick={handleExtractSkills}
          disabled={loading || !skillsForm.sourceText}
          className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? 'Extracting Skills...' : 'Extract Skills'}
        </button>
      </div>

      {skillExtraction && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Extracted Skills</h4>

          <div className="mb-4">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Top Skills</h5>
            <div className="space-y-2">
              {skillExtraction.skills.slice(0, 10).map((skill: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{skill.mentions} mentions</span>
                    <span className="text-xs text-teal-600">{(skill.confidence * 100).toFixed(0)}% conf</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Programming Languages</h5>
              <div className="flex flex-wrap gap-1">
                {skillExtraction.programmingLanguages.map((lang: any, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Frameworks</h5>
              <div className="flex flex-wrap gap-1">
                {skillExtraction.frameworks.map((fw: any, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Trending Skills</h5>
            <div className="flex flex-wrap gap-2">
              {skillExtraction.trendingSkills.map((skill: any, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSearchTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Semantic Search</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Find candidates or jobs by meaning, not just keywords.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Query</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchForm.query}
            onChange={(e) => setSearchForm({ ...searchForm, query: e.target.value })}
            placeholder="e.g., senior react developer with AWS experience"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entity Type</label>
            <select
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchForm.entityType}
              onChange={(e) => setSearchForm({ ...searchForm, entityType: e.target.value as SearchEntityType })}
            >
              <option value="CANDIDATE">Candidates</option>
              <option value="JOB">Jobs</option>
              <option value="PROJECT">Projects</option>
              <option value="COMPANY">Companies</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Results Limit</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchForm.limit}
              onChange={(e) => setSearchForm({ ...searchForm, limit: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <button
          onClick={handleSemanticSearch}
          disabled={loading || !searchForm.query}
          className="w-full py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchResults && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Search Results</h4>
            <span className="text-sm text-gray-500">{searchResults.totalResults} results</span>
          </div>

          <div className="space-y-3">
            {searchResults.results.map((result) => (
              <div key={result.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800 dark:text-gray-200">{result.title}</h5>
                  <span className="text-sm text-pink-600">{(result.relevanceScore * 100).toFixed(0)}% match</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{result.summary}</p>
                <div className="flex flex-wrap gap-1">
                  {result.skills?.slice(0, 5).map((skill: any, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEntitiesTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Entity Recognition (NER)</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Extract named entities like companies, technologies, certifications, and more.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Type</label>
          <select
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={entityForm.sourceType}
            onChange={(e) => setEntityForm({ ...entityForm, sourceType: e.target.value as EntitySourceType })}
          >
            <option value="RESUME">Resume</option>
            <option value="JOB_DESCRIPTION">Job Description</option>
            <option value="MESSAGE">Message</option>
            <option value="PROFILE">Profile</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Text</label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={6}
            value={entityForm.sourceText}
            onChange={(e) => setEntityForm({ ...entityForm, sourceText: e.target.value })}
            placeholder="Paste text to recognize entities from..."
          />
        </div>

        <button
          onClick={handleRecognizeEntities}
          disabled={loading || !entityForm.sourceText}
          className="w-full py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? 'Recognizing Entities...' : 'Recognize Entities'}
        </button>
      </div>

      {entityResult && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Recognized Entities</h4>
            <span className="text-sm text-gray-500">Confidence: {(entityResult.overallConfidence * 100).toFixed(0)}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Organizations</h5>
              {entityResult.organizations.map((org: any, idx: number) => (
                <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {org.name} <span className="text-xs text-gray-500">({org.type})</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Technologies</h5>
              <div className="flex flex-wrap gap-1">
                {entityResult.technologies.map((tech: any, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 text-xs rounded">
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Job Titles</h5>
              {entityResult.jobTitles.map((title: any, idx: number) => (
                <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {title.title} <span className="text-xs text-gray-500">→ {title.standardized}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Education</h5>
              {entityResult.universities.map((uni: any, idx: number) => (
                <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {uni.name}
                </div>
              ))}
              {entityResult.degrees.map((degree: any, idx: number) => (
                <div key={idx} className="text-xs text-gray-500 mb-1">
                  {degree.degree} ({degree.level})
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Timeline</h5>
            <div className="space-y-1">
              {entityResult.timeline.map((event: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{event.date}</span>
                  <span className="text-gray-600 dark:text-gray-400">{event.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'career': return renderCareerTab();
      case 'learning': return renderLearningTab();
      case 'insights': return renderInsightsTab();
      case 'portfolio': return renderPortfolioTab();
      case 'parser': return renderParserTab();
      case 'skills': return renderSkillsTab();
      case 'search': return renderSearchTab();
      case 'entities': return renderEntitiesTab();
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Extended AI & NLP Tools</h1>
        <p className="text-gray-600 dark:text-gray-400">AI-powered career guidance, learning recommendations, and NLP analysis</p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default ExtendedAINLPHub;
