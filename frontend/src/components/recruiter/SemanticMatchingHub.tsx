import React, { useState, useEffect } from 'react';
import {
  SkillEmbedding,
  SkillSimilarity,
  ExperienceLevelRule,
  CandidateExperienceLevel,
  RoleMapping,
  RoleSimilarityScore,
  SkillTransferabilityScore,
  TransferableSkillsAnalysis,
  ProjectRelevanceScore,
  IndustryCrossover,
  HiddenTalentProfile,
  CandidateMatchScore,
  MatchingConfig,
  SemanticMatchingStats,
} from '../../types';
import {
  skillEmbeddingsAPI,
  experienceLevelAPI,
  roleMappingAPI,
  skillTransferAPI,
  projectRelevanceAPI,
  industryCrossoverAPI,
  hiddenTalentAPI,
  matchScoringAPI,
  matchingConfigAPI,
} from '../../services/batch21SemanticMatchingAPI';

type TabType =
  | 'overview'
  | 'skills'
  | 'experience'
  | 'roles'
  | 'transferability'
  | 'projects'
  | 'crossover'
  | 'hidden-talent'
  | 'config';

const SemanticMatchingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overview state
  const [stats, setStats] = useState<SemanticMatchingStats | null>(null);

  // Skills state
  const [skillEmbeddings, setSkillEmbeddings] = useState<SkillEmbedding[]>([]);
  const [skillSimilarities, setSkillSimilarities] = useState<SkillSimilarity[]>([]);
  const [similarSkillsQuery, setSimilarSkillsQuery] = useState('');
  const [similarSkillsResults, setSimilarSkillsResults] = useState<SkillSimilarity[]>([]);

  // Experience state
  const [experienceRules, setExperienceRules] = useState<ExperienceLevelRule[]>([]);
  const [candidateExperience, setCandidateExperience] = useState<CandidateExperienceLevel[]>([]);

  // Roles state
  const [roleMappings, setRoleMappings] = useState<RoleMapping[]>([]);
  const [roleSimilarities, setRoleSimilarities] = useState<RoleSimilarityScore[]>([]);

  // Transferability state
  const [transferabilities, setTransferabilities] = useState<SkillTransferabilityScore[]>([]);
  const [transferAnalysis, setTransferAnalysis] = useState<TransferableSkillsAnalysis | null>(null);

  // Projects state
  const [projectScores, setProjectScores] = useState<ProjectRelevanceScore[]>([]);

  // Crossover state
  const [crossovers, setCrossovers] = useState<IndustryCrossover[]>([]);

  // Hidden talent state
  const [hiddenTalents, setHiddenTalents] = useState<HiddenTalentProfile[]>([]);

  // Config state
  const [matchingConfig, setMatchingConfig] = useState<MatchingConfig | null>(null);
  const [matchScores, setMatchScores] = useState<CandidateMatchScore[]>([]);

  // Form states
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, configRes] = await Promise.all([
        matchScoringAPI.getStats(),
        matchingConfigAPI.getConfig(),
      ]);
      setStats(statsRes.data);
      setMatchingConfig(configRes.data);
    } catch (err) {
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab: TabType) => {
    setLoading(true);
    setError(null);
    try {
      switch (tab) {
        case 'skills':
          const [embeddingsRes, similaritiesRes] = await Promise.all([
            skillEmbeddingsAPI.list(),
            skillEmbeddingsAPI.listSimilarities(),
          ]);
          setSkillEmbeddings(embeddingsRes.data);
          setSkillSimilarities(similaritiesRes.data);
          break;
        case 'experience':
          const [rulesRes, candExpRes] = await Promise.all([
            experienceLevelAPI.listRules(),
            experienceLevelAPI.listCandidateExperience(),
          ]);
          setExperienceRules(rulesRes.data);
          setCandidateExperience(candExpRes.data);
          break;
        case 'roles':
          const [mappingsRes, roleSimilaritiesRes] = await Promise.all([
            roleMappingAPI.listMappings(),
            roleMappingAPI.listSimilarities(),
          ]);
          setRoleMappings(mappingsRes.data);
          setRoleSimilarities(roleSimilaritiesRes.data);
          break;
        case 'transferability':
          const transferRes = await skillTransferAPI.list();
          setTransferabilities(transferRes.data);
          break;
        case 'projects':
          const projectsRes = await projectRelevanceAPI.list();
          setProjectScores(projectsRes.data);
          break;
        case 'crossover':
          const crossoverRes = await industryCrossoverAPI.list();
          setCrossovers(crossoverRes.data);
          break;
        case 'hidden-talent':
          const hiddenRes = await hiddenTalentAPI.list();
          setHiddenTalents(hiddenRes.data);
          break;
        case 'config':
          const [configDataRes, scoresRes] = await Promise.all([
            matchingConfigAPI.getConfig(),
            matchScoringAPI.list(),
          ]);
          setMatchingConfig(configDataRes.data);
          setMatchScores(scoresRes.data);
          break;
      }
    } catch (err) {
      setError(`Failed to load ${tab} data`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== 'overview') {
      loadTabData(tab);
    }
  };

  const handleFindSimilarSkills = async () => {
    if (!similarSkillsQuery.trim()) return;
    setLoading(true);
    try {
      const res = await skillEmbeddingsAPI.findSimilar(similarSkillsQuery);
      setSimilarSkillsResults(res.data);
    } catch (err) {
      setError('Failed to find similar skills');
    } finally {
      setLoading(false);
    }
  };

  const handleInferExperience = async (candidateId: string) => {
    setLoading(true);
    try {
      await experienceLevelAPI.inferLevel(candidateId);
      await loadTabData('experience');
    } catch (err) {
      setError('Failed to infer experience level');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTransferability = async () => {
    if (!selectedCandidateId || !selectedJobId) return;
    setLoading(true);
    try {
      const res = await skillTransferAPI.analyze(selectedCandidateId, selectedJobId);
      setTransferAnalysis(res.data);
    } catch (err) {
      setError('Failed to analyze transferability');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverHiddenTalent = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    try {
      await hiddenTalentAPI.discover(selectedJobId);
      await loadTabData('hidden-talent');
    } catch (err) {
      setError('Failed to discover hidden talent');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateMatchScore = async () => {
    if (!selectedCandidateId || !selectedJobId) return;
    setLoading(true);
    try {
      await matchScoringAPI.calculate(selectedCandidateId, selectedJobId);
      await loadTabData('config');
    } catch (err) {
      setError('Failed to calculate match score');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'skills', label: 'Skills', icon: '🎯' },
    { id: 'experience', label: 'Experience', icon: '📈' },
    { id: 'roles', label: 'Roles', icon: '👤' },
    { id: 'transferability', label: 'Transferability', icon: '🔄' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'crossover', label: 'Industry Crossover', icon: '🌐' },
    { id: 'hidden-talent', label: 'Hidden Talent', icon: '💎' },
    { id: 'config', label: 'Configuration', icon: '⚙️' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Semantic Matching Statistics</h3>
        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">Skill Embeddings</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalSkillEmbeddings}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400">Skill Similarities</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.totalSkillSimilarities}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-purple-600 dark:text-purple-400">Role Mappings</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.totalRoleMappings}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="text-sm text-orange-600 dark:text-orange-400">Experience Rules</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.totalExperienceRules}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">Hidden Talents Found</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.totalHiddenTalents}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <p className="text-sm text-indigo-600 dark:text-indigo-400">Industry Crossovers</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.totalIndustryCrossovers}</p>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
              <p className="text-sm text-teal-600 dark:text-teal-400">Match Scores</p>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{stats.totalMatchScores}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Avg Match Score</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {(stats.averageMatchScore * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Loading statistics...</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Feature Highlights</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">🎯</span>
              <div>
                <p className="font-medium dark:text-white">Skill Similarity (5.1.1)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vector embeddings for semantic skill matching beyond keywords
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500">📈</span>
              <div>
                <p className="font-medium dark:text-white">Experience Level Inference (5.1.2)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically determine candidate seniority from titles and tenure
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500">👤</span>
              <div>
                <p className="font-medium dark:text-white">Role Similarity Detection (5.1.3)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Match equivalent roles across different industries and companies
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500">🔄</span>
              <div>
                <p className="font-medium dark:text-white">Skill Transferability (5.1.4)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identify transferable skills between different domains
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">More Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-red-500">📁</span>
              <div>
                <p className="font-medium dark:text-white">Project Relevance Scoring (5.1.5)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Score candidate projects against job requirements
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">🌐</span>
              <div>
                <p className="font-medium dark:text-white">Industry Crossover (5.1.6)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identify successful career transitions between industries
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-500">💎</span>
              <div>
                <p className="font-medium dark:text-white">Hidden Talent Discovery (5.1.7)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find qualified candidates missed by traditional keyword search
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {matchingConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Current Matching Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Skill Weight</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {(matchingConfig.skillWeight * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Experience Weight</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {(matchingConfig.experienceWeight * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Role Weight</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {(matchingConfig.roleWeight * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Project Weight</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {(matchingConfig.projectWeight * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Min Match Threshold</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {(matchingConfig.minimumMatchThreshold * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Find Similar Skills</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={similarSkillsQuery}
            onChange={(e) => setSimilarSkillsQuery(e.target.value)}
            placeholder="Enter a skill name..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleFindSimilarSkills}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
        </div>
        {similarSkillsResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2 dark:text-white">Similar Skills Found:</h4>
            <div className="flex flex-wrap gap-2">
              {similarSkillsResults.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  {skill.skill2Name} ({(skill.similarityScore * 100).toFixed(0)}%)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Skill Embeddings ({skillEmbeddings.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-4 dark:text-white">Skill Name</th>
                <th className="text-left py-2 px-4 dark:text-white">Type</th>
                <th className="text-left py-2 px-4 dark:text-white">Embedding Dim</th>
                <th className="text-left py-2 px-4 dark:text-white">Model</th>
                <th className="text-left py-2 px-4 dark:text-white">Updated</th>
              </tr>
            </thead>
            <tbody>
              {skillEmbeddings.map((embedding) => (
                <tr key={embedding.id} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4 dark:text-white">{embedding.skillName}</td>
                  <td className="py-2 px-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm dark:text-gray-300">
                      {embedding.skillType}
                    </span>
                  </td>
                  <td className="py-2 px-4 dark:text-gray-300">{embedding.embeddingVector.length}</td>
                  <td className="py-2 px-4 dark:text-gray-300">{embedding.modelVersion}</td>
                  <td className="py-2 px-4 dark:text-gray-300">
                    {new Date(embedding.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Skill Similarities ({skillSimilarities.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillSimilarities.map((similarity) => (
            <div
              key={similarity.id}
              className="p-4 border dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium dark:text-white">{similarity.skill1Name}</span>
                <span className="text-gray-500">↔</span>
                <span className="font-medium dark:text-white">{similarity.skill2Name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{similarity.relationshipType}</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {(similarity.similarityScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Experience Level Rules ({experienceRules.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-4 dark:text-white">Level</th>
                <th className="text-left py-2 px-4 dark:text-white">Min Years</th>
                <th className="text-left py-2 px-4 dark:text-white">Max Years</th>
                <th className="text-left py-2 px-4 dark:text-white">Title Patterns</th>
                <th className="text-left py-2 px-4 dark:text-white">Weight</th>
              </tr>
            </thead>
            <tbody>
              {experienceRules.map((rule) => (
                <tr key={rule.id} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      rule.level === 'SENIOR' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                      rule.level === 'MID' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      rule.level === 'LEAD' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                      rule.level === 'EXECUTIVE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {rule.level}
                    </span>
                  </td>
                  <td className="py-2 px-4 dark:text-gray-300">{rule.minYearsExperience}</td>
                  <td className="py-2 px-4 dark:text-gray-300">{rule.maxYearsExperience || 'N/A'}</td>
                  <td className="py-2 px-4 dark:text-gray-300">
                    <div className="flex flex-wrap gap-1">
                      {rule.titlePatterns.slice(0, 3).map((pattern, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {pattern}
                        </span>
                      ))}
                      {rule.titlePatterns.length > 3 && (
                        <span className="text-xs text-gray-500">+{rule.titlePatterns.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4 dark:text-gray-300">{rule.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Candidate Experience Levels ({candidateExperience.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidateExperience.map((exp) => (
            <div
              key={exp.id}
              className="p-4 border dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium dark:text-white">Candidate #{exp.candidateId.slice(0, 8)}</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  exp.inferredLevel === 'SENIOR' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  exp.inferredLevel === 'MID' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                  exp.inferredLevel === 'LEAD' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                  exp.inferredLevel === 'EXECUTIVE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {exp.inferredLevel}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Years:</span>
                  <span className="dark:text-gray-300">{exp.totalYearsExperience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                  <span className="dark:text-gray-300">{(exp.confidenceScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Role Mappings ({roleMappings.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-4 dark:text-white">Canonical Title</th>
                <th className="text-left py-2 px-4 dark:text-white">Industry</th>
                <th className="text-left py-2 px-4 dark:text-white">Variations</th>
                <th className="text-left py-2 px-4 dark:text-white">Level</th>
                <th className="text-left py-2 px-4 dark:text-white">Common Skills</th>
              </tr>
            </thead>
            <tbody>
              {roleMappings.map((mapping) => (
                <tr key={mapping.id} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4 font-medium dark:text-white">{mapping.canonicalTitle}</td>
                  <td className="py-2 px-4 dark:text-gray-300">{mapping.industry}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-1">
                      {mapping.variations.slice(0, 2).map((v, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                          {v}
                        </span>
                      ))}
                      {mapping.variations.length > 2 && (
                        <span className="text-xs text-gray-500">+{mapping.variations.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm dark:text-gray-300">
                      {mapping.level}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-1">
                      {mapping.commonSkills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Role Similarities ({roleSimilarities.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleSimilarities.map((similarity) => (
            <div
              key={similarity.id}
              className="p-4 border dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="text-center flex-1">
                  <p className="font-medium dark:text-white">{similarity.role1Title}</p>
                  <p className="text-xs text-gray-500">{similarity.role1Industry}</p>
                </div>
                <span className="text-2xl mx-4">⇄</span>
                <div className="text-center flex-1">
                  <p className="font-medium dark:text-white">{similarity.role2Title}</p>
                  <p className="text-xs text-gray-500">{similarity.role2Industry}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Overall</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    {(similarity.overallSimilarity * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Skills</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {(similarity.skillOverlap * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Responsibility</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    {(similarity.responsibilityOverlap * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTransferability = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Analyze Skill Transferability</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            placeholder="Candidate ID"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            placeholder="Job ID"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleAnalyzeTransferability}
            disabled={loading || !selectedCandidateId || !selectedJobId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Analyze
          </button>
        </div>

        {transferAnalysis && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium mb-3 dark:text-white">Analysis Results</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Transferable Skills</p>
                <p className="text-xl font-bold dark:text-white">{transferAnalysis.totalTransferableSkills}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Transferability</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {(transferAnalysis.averageTransferability * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 dark:text-white">Transferable Skills:</p>
              <div className="flex flex-wrap gap-2">
                {transferAnalysis.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                  >
                    {skill.sourceSkill} → {skill.targetSkill} ({(skill.transferabilityScore * 100).toFixed(0)}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Skill Transferability Database ({transferabilities.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-4 dark:text-white">Source Skill</th>
                <th className="text-left py-2 px-4 dark:text-white">Target Skill</th>
                <th className="text-left py-2 px-4 dark:text-white">Score</th>
                <th className="text-left py-2 px-4 dark:text-white">Learning Curve</th>
                <th className="text-left py-2 px-4 dark:text-white">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {transferabilities.map((transfer) => (
                <tr key={transfer.id} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4 dark:text-white">{transfer.sourceSkill}</td>
                  <td className="py-2 px-4 dark:text-white">{transfer.targetSkill}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      transfer.transferabilityScore >= 0.8 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      transfer.transferabilityScore >= 0.5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {(transfer.transferabilityScore * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      transfer.learningCurve === 'MINIMAL' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      transfer.learningCurve === 'MODERATE' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      transfer.learningCurve === 'STEEP' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {transfer.learningCurve}
                    </span>
                  </td>
                  <td className="py-2 px-4 dark:text-gray-300">
                    {(transfer.industrySuccessRate * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Project Relevance Scores ({projectScores.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectScores.map((score) => (
            <div
              key={score.id}
              className="p-4 border dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium dark:text-white">{score.projectTitle}</p>
                  <p className="text-sm text-gray-500">for Job #{score.jobId.slice(0, 8)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  score.overallRelevance >= 0.8 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  score.overallRelevance >= 0.5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {(score.overallRelevance * 100).toFixed(0)}% Relevant
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Tech Match</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    {(score.technicalMatch * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Scale Match</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {(score.scaleMatch * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Impact</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    {(score.impactScore * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              {score.highlightedAchievements.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Achievements:</p>
                  <div className="flex flex-wrap gap-1">
                    {score.highlightedAchievements.map((achievement, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCrossover = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Industry Crossover Intelligence ({crossovers.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crossovers.map((crossover) => (
            <div
              key={crossover.id}
              className="p-4 border dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium dark:text-white">{crossover.sourceIndustry}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium dark:text-white">{crossover.targetIndustry}</span>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  crossover.difficulty === 'EASY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  crossover.difficulty === 'MODERATE' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  crossover.difficulty === 'CHALLENGING' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {crossover.difficulty}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {(crossover.successRate * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Sample Size</p>
                  <p className="font-bold dark:text-white">{crossover.sampleSize}</p>
                </div>
              </div>
              {crossover.commonTransferableSkills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transferable Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {crossover.commonTransferableSkills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHiddenTalent = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Discover Hidden Talent</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            placeholder="Job ID to find hidden talent for..."
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleDiscoverHiddenTalent}
            disabled={loading || !selectedJobId}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Discover
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Hidden Talent Profiles ({hiddenTalents.length})</h3>
        <div className="space-y-4">
          {hiddenTalents.map((talent) => (
            <div
              key={talent.id}
              className="p-4 border dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium dark:text-white">Candidate #{talent.candidateId.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">for Job #{talent.jobId.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    talent.status === 'DISCOVERED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    talent.status === 'REVIEWED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    talent.status === 'CONTACTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    talent.status === 'CONVERTED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {talent.status}
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    {(talent.matchPotential * 100).toFixed(0)}% Potential
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{talent.discoveryReason}</p>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hidden Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {talent.hiddenSkills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Transferable Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {talent.transferableExperience.map((exp, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Adjacent Roles:</p>
                  <div className="flex flex-wrap gap-1">
                    {talent.adjacentRoles.map((role, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Calculate Match Score</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            placeholder="Candidate ID"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            placeholder="Job ID"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleCalculateMatchScore}
            disabled={loading || !selectedCandidateId || !selectedJobId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Calculate
          </button>
        </div>
      </div>

      {matchingConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Matching Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-sm text-blue-600 dark:text-blue-400">Skill Weight</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {(matchingConfig.skillWeight * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-sm text-green-600 dark:text-green-400">Experience Weight</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {(matchingConfig.experienceWeight * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
              <p className="text-sm text-purple-600 dark:text-purple-400">Role Weight</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {(matchingConfig.roleWeight * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
              <p className="text-sm text-orange-600 dark:text-orange-400">Project Weight</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {(matchingConfig.projectWeight * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
              <p className="text-sm text-red-600 dark:text-red-400">Min Threshold</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {(matchingConfig.minimumMatchThreshold * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Hidden Talent Enabled</p>
              <p className="text-lg font-medium dark:text-white">
                {matchingConfig.enableHiddenTalent ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Industry Crossover Enabled</p>
              <p className="text-lg font-medium dark:text-white">
                {matchingConfig.enableIndustryCrossover ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Match Scores ({matchScores.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-4 dark:text-white">Candidate</th>
                <th className="text-left py-2 px-4 dark:text-white">Job</th>
                <th className="text-left py-2 px-4 dark:text-white">Overall</th>
                <th className="text-left py-2 px-4 dark:text-white">Skill</th>
                <th className="text-left py-2 px-4 dark:text-white">Experience</th>
                <th className="text-left py-2 px-4 dark:text-white">Role</th>
                <th className="text-left py-2 px-4 dark:text-white">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {matchScores.map((score) => (
                <tr key={score.id} className="border-b dark:border-gray-700">
                  <td className="py-2 px-4 dark:text-white">#{score.candidateId.slice(0, 8)}</td>
                  <td className="py-2 px-4 dark:text-white">#{score.jobId.slice(0, 8)}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded font-medium ${
                      score.overallScore >= 0.8 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      score.overallScore >= 0.5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {(score.overallScore * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2 px-4 dark:text-gray-300">{(score.skillMatchScore * 100).toFixed(0)}%</td>
                  <td className="py-2 px-4 dark:text-gray-300">{(score.experienceMatchScore * 100).toFixed(0)}%</td>
                  <td className="py-2 px-4 dark:text-gray-300">{(score.roleMatchScore * 100).toFixed(0)}%</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      score.recommendation === 'STRONG_MATCH' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      score.recommendation === 'GOOD_MATCH' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      score.recommendation === 'POTENTIAL_MATCH' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      score.recommendation === 'WEAK_MATCH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {score.recommendation.replace('_', ' ')}
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
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'skills':
        return renderSkills();
      case 'experience':
        return renderExperience();
      case 'roles':
        return renderRoles();
      case 'transferability':
        return renderTransferability();
      case 'projects':
        return renderProjects();
      case 'crossover':
        return renderCrossover();
      case 'hidden-talent':
        return renderHiddenTalent();
      case 'config':
        return renderConfig();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Semantic Matching Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered candidate-job matching with semantic understanding
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && renderContent()}
      </div>
    </div>
  );
};

export default SemanticMatchingHub;
