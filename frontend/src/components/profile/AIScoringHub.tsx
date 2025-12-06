import React, { useState, useEffect } from 'react';
import {
  AIProfileScore,
  AssessmentAnalyticsData,
  SkillDecayTracker,
  SkillDecaySummary,
  JobFitScore,
  DomainAssessment,
  DomainAssessmentAttempt,
} from '../../types';
import {
  aiProfileScorerAPI,
  analyticsAPI,
  skillDecayAPI,
  jobFitScoreAPI,
  domainAssessmentAPI,
} from '../../services/batch8ScoringAPI';

type TabType = 'ai-score' | 'analytics' | 'skill-decay' | 'job-fit' | 'domain-assessments';

const AIScoringHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ai-score');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [aiScore, setAiScore] = useState<AIProfileScore | null>(null);
  const [analytics, setAnalytics] = useState<AssessmentAnalyticsData | null>(null);
  const [skillDecayTrackers, setSkillDecayTrackers] = useState<SkillDecayTracker[]>([]);
  const [decaySummary, setDecaySummary] = useState<SkillDecaySummary | null>(null);
  const [jobFitScores, setJobFitScores] = useState<JobFitScore[]>([]);
  const [domainAssessments, setDomainAssessments] = useState<DomainAssessment[]>([]);
  const [domainAttempts, setDomainAttempts] = useState<DomainAssessmentAttempt[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        aiScoreData,
        analyticsData,
        trackersData,
        summaryData,
        fitScoresData,
        assessmentsData,
        attemptsData,
      ] = await Promise.all([
        aiProfileScorerAPI.getScore(),
        analyticsAPI.getAnalytics(),
        skillDecayAPI.getTrackers(),
        skillDecayAPI.getSummary(),
        jobFitScoreAPI.getAll(),
        domainAssessmentAPI.getAssessments({ isActive: true }),
        domainAssessmentAPI.getAttempts(),
      ]);

      setAiScore(aiScoreData);
      setAnalytics(analyticsData);
      setSkillDecayTrackers(trackersData);
      setDecaySummary(summaryData);
      setJobFitScores(fitScoresData);
      setDomainAssessments(assessmentsData);
      setDomainAttempts(attemptsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'ai-score' as TabType, label: 'AI Profile Score', icon: '🎯' },
    { id: 'analytics' as TabType, label: 'Analytics', icon: '📊' },
    { id: 'skill-decay' as TabType, label: 'Skill Decay', icon: '⏳' },
    { id: 'job-fit' as TabType, label: 'Job Fit', icon: '💼' },
    { id: 'domain-assessments' as TabType, label: 'Domain Tests', icon: '🏢' },
  ];

  const getGradeColor = (grade: string): string => {
    const colors: Record<string, string> = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100',
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  const getFitCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      EXCELLENT_FIT: 'bg-green-100 text-green-800',
      GOOD_FIT: 'bg-blue-100 text-blue-800',
      MODERATE_FIT: 'bg-yellow-100 text-yellow-800',
      LOW_FIT: 'bg-orange-100 text-orange-800',
      POOR_FIT: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority?: string): string => {
    const colors: Record<string, string> = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800',
    };
    return colors[priority || ''] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderAIScore = () => {
    if (!aiScore) return null;

    const componentScores = [
      { name: 'Profile Completeness', score: aiScore.profileCompleteness, color: 'blue' },
      { name: 'Experience Depth', score: aiScore.experienceDepth, color: 'purple' },
      { name: 'Skills Verification', score: aiScore.skillsVerification, color: 'green' },
      { name: 'Education', score: aiScore.educationStrength, color: 'indigo' },
      { name: 'Projects', score: aiScore.projectQuality, color: 'pink' },
      { name: 'Assessments', score: aiScore.assessmentPerformance, color: 'orange' },
      { name: 'Verification', score: aiScore.verificationScore, color: 'teal' },
      { name: 'Engagement', score: aiScore.engagementScore, color: 'cyan' },
    ];

    return (
      <div className="space-y-6">
        {/* Main Score Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Your AI Profile Score</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-5xl font-bold">{aiScore.overallScore}</span>
                <span className="text-2xl ml-1 opacity-75">/100</span>
              </div>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-lg font-bold ${getGradeColor(aiScore.scoreGrade)}`}>
                  {aiScore.scoreGrade}
                </span>
                {aiScore.marketPercentile && (
                  <span className="ml-3 text-sm opacity-80">
                    Top {(100 - aiScore.marketPercentile).toFixed(0)}% of candidates
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75">Estimated Level</div>
              <div className="text-xl font-semibold mt-1">{aiScore.estimatedLevel}</div>
              {aiScore.yearsOfExperience && (
                <div className="text-sm opacity-75 mt-2">~{aiScore.yearsOfExperience} years experience</div>
              )}
            </div>
          </div>
        </div>

        {/* Component Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {componentScores.map((comp) => (
            <div key={comp.name} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">{comp.name}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{Math.round(comp.score)}%</div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${comp.color}-500 h-2 rounded-full transition-all`}
                  style={{ width: `${comp.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-800 mb-3">Strengths</h4>
            <ul className="space-y-2">
              {aiScore.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-center text-green-700">
                  <span className="mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-3">Areas to Improve</h4>
            <ul className="space-y-2">
              {aiScore.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-center text-orange-700">
                  <span className="mr-2">→</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        {aiScore.recommendations && aiScore.recommendations.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
            <div className="space-y-3">
              {aiScore.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    rec.impact === 'HIGH' ? 'bg-red-100 text-red-700' :
                    rec.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {rec.impact}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{rec.area}</p>
                    <p className="text-sm text-gray-600">{rec.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Salary Estimate */}
        {aiScore.salaryEstimate && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Estimated Market Salary</h4>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-500">Range:</span>
                <span className="ml-2 font-semibold">
                  ${aiScore.salaryEstimate.min.toLocaleString()} - ${aiScore.salaryEstimate.max.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Median:</span>
                <span className="ml-2 font-semibold text-green-600">
                  ${aiScore.salaryEstimate.median.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600">Total Assessments</div>
            <div className="text-3xl font-bold text-blue-900">{analytics.totalAssessmentsTaken}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600">Passed</div>
            <div className="text-3xl font-bold text-green-900">{analytics.totalAssessmentsPassed}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600">Average Score</div>
            <div className="text-3xl font-bold text-purple-900">{analytics.overallAverageScore?.toFixed(0) || 'N/A'}%</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-sm text-orange-600">Time Spent</div>
            <div className="text-3xl font-bold text-orange-900">{analytics.totalTimeSpent || 0} min</div>
          </div>
        </div>

        {/* Assessment Breakdown */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Assessment Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.codingChallenges && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Coding Challenges</div>
                <div className="text-xl font-bold">{analytics.codingChallenges.taken} taken</div>
                {analytics.codingChallenges.avgScore && (
                  <div className="text-sm text-green-600">Avg: {analytics.codingChallenges.avgScore.toFixed(0)}%</div>
                )}
              </div>
            )}
            {analytics.technicalQuizzes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Technical Quizzes</div>
                <div className="text-xl font-bold">{analytics.technicalQuizzes.taken} taken</div>
                {analytics.technicalQuizzes.avgScore && (
                  <div className="text-sm text-green-600">Avg: {analytics.technicalQuizzes.avgScore.toFixed(0)}%</div>
                )}
              </div>
            )}
            {analytics.domainAssessments && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Domain Assessments</div>
                <div className="text-xl font-bold">{analytics.domainAssessments.taken} taken</div>
                {analytics.domainAssessments.avgScore && (
                  <div className="text-sm text-green-600">Avg: {analytics.domainAssessments.avgScore.toFixed(0)}%</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skill Performance */}
        {analytics.skillPerformance && Object.keys(analytics.skillPerformance).length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Skill Performance</h4>
            <div className="space-y-3">
              {Object.entries(analytics.skillPerformance).map(([skill, data]) => (
                <div key={skill} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800">{skill}</span>
                    <span className="text-xs text-gray-500">{data.assessments} assessments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${data.avgScore}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-700 w-12">{data.avgScore}%</span>
                    {data.trend && (
                      <span className={`text-sm ${
                        data.trend === 'UP' ? 'text-green-600' :
                        data.trend === 'DOWN' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {data.trend === 'UP' ? '↑' : data.trend === 'DOWN' ? '↓' : '→'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-800 mb-3">Top Strengths</h4>
            <div className="flex flex-wrap gap-2">
              {analytics.topStrengths.map((strength, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {strength}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-3">Areas for Improvement</h4>
            <div className="flex flex-wrap gap-2">
              {analytics.areasForImprovement.map((area, idx) => (
                <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSkillDecay = () => (
    <div className="space-y-6">
      {/* Summary */}
      {decaySummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600">Skills Tracked</div>
            <div className="text-3xl font-bold text-blue-900">{decaySummary.totalTracked}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-sm text-red-600">Needs Refresh</div>
            <div className="text-3xl font-bold text-red-900">{decaySummary.needsRefresh}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-sm text-yellow-600">Upcoming (30 days)</div>
            <div className="text-3xl font-bold text-yellow-900">{decaySummary.upcomingRefresh}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600">Up to Date</div>
            <div className="text-3xl font-bold text-green-900">
              {decaySummary.totalTracked - decaySummary.needsRefresh - decaySummary.upcomingRefresh}
            </div>
          </div>
        </div>
      )}

      {/* Urgent Skills Alert */}
      {decaySummary && decaySummary.urgentSkills.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-3">Skills Needing Refresh</h4>
          <div className="space-y-2">
            {decaySummary.urgentSkills.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white rounded p-3 border border-red-100">
                <div>
                  <span className="font-medium text-gray-900">{skill.skill}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    Last assessed: {formatDate(skill.lastAssessed)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {skill.estimatedScore && (
                    <span className="text-sm text-orange-600">~{skill.estimatedScore.toFixed(0)}% estimated</span>
                  )}
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    Retake
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Tracked Skills */}
      <div className="bg-white rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 p-4 border-b">All Tracked Skills</h4>
        {skillDecayTrackers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No skills being tracked yet. Complete assessments to start tracking.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {skillDecayTrackers.map((tracker) => (
              <div key={tracker.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{tracker.skillName}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(tracker.refreshPriority)}`}>
                      {tracker.refreshPriority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Peak: {tracker.peakScore}% | Last: {tracker.lastScore}%
                    {tracker.currentEstimatedScore && ` | Estimated: ${tracker.currentEstimatedScore.toFixed(0)}%`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {tracker.assessmentCount} assessments
                  </div>
                  {tracker.refreshDueAt && (
                    <div className={`text-sm ${
                      new Date(tracker.refreshDueAt) < new Date() ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      Due: {formatDate(tracker.refreshDueAt)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderJobFit = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Job Fit Scores</h3>
      </div>

      {jobFitScores.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <span className="text-4xl mb-3 block">💼</span>
          <p className="text-gray-500">No job fit scores calculated yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Apply to jobs and calculate your fit score to see how well you match
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobFitScores.map((score) => (
            <div key={score.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-gray-900">{score.overallFitScore}%</div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFitCategoryColor(score.fitCategory)}`}>
                      {score.fitCategory.replace('_', ' ')}
                    </span>
                  </div>
                  {score.candidateSummary && (
                    <p className="text-sm text-gray-600 mt-2">{score.candidateSummary}</p>
                  )}

                  {/* Match Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Skills:</span>
                      <span className="font-medium ml-1">{score.skillsMatch}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Experience:</span>
                      <span className="font-medium ml-1">{score.experienceMatch}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Education:</span>
                      <span className="font-medium ml-1">{score.educationMatch}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium ml-1">{score.locationMatch}%</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-4">
                    {score.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {score.matchedSkills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            {s.skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {score.missingSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {score.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                            {skill} (missing)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {score.rankAmongApplicants && (
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900">#{score.rankAmongApplicants}</div>
                    <div className="text-xs text-gray-500">among applicants</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDomainAssessments = () => (
    <div className="space-y-6">
      {/* Available Assessments */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Available Domain Assessments</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domainAssessments.map((assessment) => (
            <div key={assessment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded capitalize">
                  {assessment.domain.toLowerCase()}
                </span>
                {assessment.providesCertificate && (
                  <span className="text-xs text-green-600">Certificate Available</span>
                )}
              </div>
              <h5 className="font-medium text-gray-900">{assessment.title}</h5>
              {assessment.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assessment.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>⏱️ ~{assessment.estimatedMinutes} min</span>
                <span>📝 {assessment.questionCount} questions</span>
                <span className="capitalize">📈 {assessment.difficultyLevel.toLowerCase()}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">Pass: {assessment.passingScore}%</span>
                <button className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                  Start Assessment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Attempts */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">My Attempts</h4>
        {domainAttempts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <span className="text-4xl mb-3 block">🏢</span>
            <p className="text-gray-500">No domain assessments completed yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {domainAttempts.map((attempt) => (
              <div key={attempt.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{attempt.assessment?.title}</h5>
                    <div className="text-sm text-gray-500 mt-1">
                      Completed: {attempt.completedAt ? formatDate(attempt.completedAt) : 'In Progress'}
                    </div>
                  </div>
                  <div className="text-right">
                    {attempt.percentageScore !== undefined && (
                      <div className={`text-2xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.percentageScore.toFixed(0)}%
                      </div>
                    )}
                    {attempt.passed !== undefined && (
                      <span className={`text-sm ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.passed ? 'Passed' : 'Not Passed'}
                      </span>
                    )}
                  </div>
                </div>
                {attempt.certificateUrl && (
                  <a href={attempt.certificateUrl} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                    View Certificate →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading AI scoring data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading data</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadData} className="mt-2 text-sm underline hover:no-underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-900">AI Scoring & Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered profile scoring, assessment analytics, and job fit analysis
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto px-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'ai-score' && renderAIScore()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'skill-decay' && renderSkillDecay()}
        {activeTab === 'job-fit' && renderJobFit()}
        {activeTab === 'domain-assessments' && renderDomainAssessments()}
      </div>
    </div>
  );
};

export default AIScoringHub;
