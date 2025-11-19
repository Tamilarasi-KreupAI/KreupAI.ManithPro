import React, { useState, useEffect } from 'react';
import { matchingService } from '../utils/matchingService';

interface SkillGapAnalysisProps {
  candidateId: string;
  jobId: string;
}

interface SkillGap {
  skill: string;
  required: boolean;
  candidateLevel: number; // 0-5 (0 means not present)
  requiredLevel: number; // 1-5
  priority: 'high' | 'medium' | 'low';
  learningResources?: {
    title: string;
    type: 'course' | 'article' | 'video' | 'book';
    url: string;
    provider: string;
    duration?: string;
    free: boolean;
  }[];
}

interface SkillGapData {
  candidateId: string;
  jobId: string;
  matchingSkills: SkillGap[];
  missingSkills: SkillGap[];
  partialSkills: SkillGap[];
  overallGapScore: number; // 0-100, higher is better
  estimatedLearningTime: string;
}

const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ candidateId, jobId }) => {
  const [data, setData] = useState<SkillGapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'missing' | 'partial' | 'matching'>('missing');

  useEffect(() => {
    loadSkillGapData();
  }, [candidateId, jobId]);

  const loadSkillGapData = async () => {
    setLoading(true);
    try {
      const result = await matchingService.getSkillGapAnalysis(candidateId, jobId);
      setData(result);
    } catch (error) {
      console.error('Failed to load skill gap analysis:', error);
    }
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  const getSkillLevelLabel = (level: number) => {
    switch (level) {
      case 0: return 'No Experience';
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const renderSkillCard = (gap: SkillGap, showResources: boolean = true) => {
    const hasGap = gap.candidateLevel < gap.requiredLevel;
    const gapSize = gap.requiredLevel - gap.candidateLevel;

    return (
      <div
        key={gap.skill}
        className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {gap.skill}
              </h4>
              {gap.required && (
                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium rounded">
                  Required
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(gap.priority)}`}>
                {gap.priority.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Your Level: </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getSkillLevelLabel(gap.candidateLevel)}
                </span>
              </div>
              <span className="text-gray-400">→</span>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Required: </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getSkillLevelLabel(gap.requiredLevel)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Level Visualization */}
        <div className="mb-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`flex-1 h-3 rounded ${
                  level <= gap.candidateLevel
                    ? 'bg-green-500'
                    : level <= gap.requiredLevel
                    ? 'bg-orange-300 dark:bg-orange-700'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
                title={`Level ${level}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Beginner</span>
            <span>Expert</span>
          </div>
        </div>

        {/* Learning Resources */}
        {showResources && hasGap && gap.learningResources && gap.learningResources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Recommended Learning Resources
            </h5>
            <div className="space-y-2">
              {gap.learningResources.slice(0, 3).map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {resource.type === 'course' && (
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                    {resource.type === 'video' && (
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {resource.type === 'article' && (
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {resource.type === 'book' && (
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h6 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {resource.title}
                      </h6>
                      {resource.free && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                          Free
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>{resource.provider}</span>
                      {resource.duration && (
                        <>
                          <span>•</span>
                          <span>{resource.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Failed to load skill gap analysis</p>
      </div>
    );
  }

  const currentSkills = activeTab === 'missing' ? data.missingSkills :
                        activeTab === 'partial' ? data.partialSkills :
                        data.matchingSkills;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Skill Gap Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Identify areas for improvement and access personalized learning resources
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Match</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.overallGapScore}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">skill coverage</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Matching Skills</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{data.matchingSkills.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skills to Improve</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{data.partialSkills.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skills to Learn</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{data.missingSkills.length}</p>
          </div>
        </div>
        {data.estimatedLearningTime && (
          <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                Estimated learning time: <strong>{data.estimatedLearningTime}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('missing')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'missing'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Skills to Learn ({data.missingSkills.length})
            {activeTab === 'missing' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('partial')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'partial'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Skills to Improve ({data.partialSkills.length})
            {activeTab === 'partial' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('matching')}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === 'matching'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Matching Skills ({data.matchingSkills.length})
            {activeTab === 'matching' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
            )}
          </button>
        </div>
      </div>

      {/* Skills List */}
      {currentSkills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {activeTab === 'missing' && 'Great! No missing skills for this role.'}
            {activeTab === 'partial' && 'No skills need improvement.'}
            {activeTab === 'matching' && 'No matching skills found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentSkills.map(skill => renderSkillCard(skill, activeTab !== 'matching'))}
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;
