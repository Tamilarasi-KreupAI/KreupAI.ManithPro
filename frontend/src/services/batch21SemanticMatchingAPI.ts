import axios from 'axios';
import type {
  SkillEmbedding,
  SkillSimilarity,
  ExperienceLevelRule,
  CandidateExperienceLevel,
  RoleMapping,
  RoleSimilarityScore,
  SkillTransferabilityScore,
  TransferableSkillsAnalysis,
  ProjectRelevanceScore,
  BatchProjectRelevanceResult,
  IndustryCrossover,
  IndustryCrossoverAnalysis,
  HiddenTalentProfile,
  HiddenTalentDiscoveryResult,
  CandidateMatchScore,
  JobMatchScoresResult,
  MatchingConfig,
  SemanticMatchingStats,
  CreateSkillEmbeddingInput,
  CreateExperienceLevelRuleInput,
  InferExperienceLevelInput,
  CreateRoleMappingInput,
  CalculateSkillSimilarityInput,
  CalculateRoleSimilarityInput,
  CreateSkillTransferabilityInput,
  AnalyzeTransferableSkillsInput,
  CalculateProjectRelevanceInput,
  BatchProjectRelevanceInput,
  CreateIndustryCrossoverInput,
  AnalyzeIndustryCrossoverInput,
  DiscoverHiddenTalentInput,
  UpdateHiddenTalentStatusInput,
  CalculateMatchScoreInput,
  UpsertMatchingConfigInput,
  RelatedSkill,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ============================================
// MOCK DATA
// ============================================

const mockSkillEmbeddings: SkillEmbedding[] = [
  {
    id: 'emb-1',
    skillName: 'JavaScript',
    normalizedName: 'javascript',
    skillCategory: 'Programming',
    skillType: 'TECHNICAL',
    embeddingModel: 'text-embedding-3-small',
    embeddingVersion: '1.0',
    vectorDimension: 1536,
    synonyms: ['JS', 'ECMAScript'],
    alternateNames: ['ES6', 'ES2015+'],
    usageCount: 1250,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'emb-2',
    skillName: 'TypeScript',
    normalizedName: 'typescript',
    skillCategory: 'Programming',
    skillType: 'TECHNICAL',
    embeddingModel: 'text-embedding-3-small',
    embeddingVersion: '1.0',
    vectorDimension: 1536,
    synonyms: ['TS'],
    alternateNames: ['TypeScript 5'],
    usageCount: 980,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'emb-3',
    skillName: 'React',
    normalizedName: 'react',
    skillCategory: 'Framework',
    skillType: 'TECHNICAL',
    embeddingModel: 'text-embedding-3-small',
    embeddingVersion: '1.0',
    vectorDimension: 1536,
    synonyms: ['ReactJS', 'React.js'],
    alternateNames: ['React 18'],
    usageCount: 870,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockRoleMappings: RoleMapping[] = [
  {
    id: 'rm-1',
    roleTitle: 'Software Engineer',
    normalizedTitle: 'software engineer',
    roleCategory: 'Engineering',
    roleFamily: 'Software Development',
    roleFunction: 'Individual Contributor',
    industrySpecific: false,
    equivalentTitles: ['Software Developer', 'Programmer', 'Developer'],
    seniorVariants: ['Senior Software Engineer', 'Staff Software Engineer'],
    juniorVariants: ['Junior Software Engineer', 'Associate Developer'],
    typicalSkills: ['JavaScript', 'Python', 'SQL', 'Git'],
    typicalExperience: 3,
    usageCount: 450,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-2',
    roleTitle: 'Product Manager',
    normalizedTitle: 'product manager',
    roleCategory: 'Product',
    roleFamily: 'Product Management',
    roleFunction: 'Individual Contributor',
    industrySpecific: false,
    equivalentTitles: ['PM', 'Product Owner'],
    seniorVariants: ['Senior Product Manager', 'Director of Product'],
    juniorVariants: ['Associate Product Manager', 'Junior PM'],
    typicalSkills: ['Product Strategy', 'Agile', 'Data Analysis'],
    typicalExperience: 4,
    usageCount: 320,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockHiddenTalent: HiddenTalentProfile[] = [
  {
    id: 'ht-1',
    companyId: 'company-1',
    candidateId: 'cand-1',
    candidateName: 'John Pivoter',
    discoveredForJobId: 'job-1',
    discoveredForRole: 'Software Engineer',
    hiddenReasons: ['Career pivot from different industry', 'Non-traditional background'],
    keywordGaps: ['specific framework experience'],
    unconventionalPath: true,
    careerPivot: true,
    industryOutsider: true,
    potentialScore: 78,
    potentialFactors: { transferableSkills: 0.8, learningAbility: 0.85 },
    hiddenQualifications: ['Problem-solving', 'Leadership experience'],
    traditionalMatchScore: 45,
    semanticMatchScore: 78,
    scoreLift: 33,
    status: 'DISCOVERED',
    discoveredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockMatchingConfig: MatchingConfig = {
  id: 'mc-1',
  companyId: 'company-1',
  skillWeight: 0.35,
  experienceWeight: 0.25,
  projectWeight: 0.15,
  educationWeight: 0.10,
  cultureFitWeight: 0.10,
  bonusWeight: 0.05,
  minimumMatchScore: 50,
  hiddenTalentThreshold: 60,
  autoAdvanceThreshold: 80,
  autoRejectThreshold: 30,
  enableSemanticMatching: true,
  enableHiddenTalent: true,
  enableIndustryCrossover: true,
  enableSkillTransfer: true,
  blindScreeningEnabled: false,
  diversityBoostEnabled: false,
  diversityBoostAmount: 0,
  mustHaveSkills: ['JavaScript', 'React'],
  niceToHaveSkills: ['TypeScript', 'Node.js'],
  dealBreakerMissing: [],
  isActive: true,
  createdById: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockStats: SemanticMatchingStats = {
  skillEmbeddings: {
    total: 1250,
    active: 1180,
    byCategory: {
      Programming: 420,
      Framework: 280,
      Database: 150,
      Cloud: 180,
      SoftSkills: 150,
    },
  },
  roleMappings: {
    total: 450,
    byCategory: {
      Engineering: 180,
      Product: 80,
      Design: 60,
      Data: 70,
      Operations: 60,
    },
  },
  matchScores: {
    totalCalculated: 15420,
    averageScore: 68.5,
    hiddenTalentDiscovered: 342,
    hiddenTalentConversionRate: 0.28,
  },
  industryCrossovers: {
    total: 45,
    mostCommon: ['Tech to Finance', 'Finance to Tech', 'Healthcare to Tech'],
  },
  performance: {
    averageMatchTime: 120,
    semanticBoostAverage: 12.5,
    hiddenTalentBoostAverage: 8.2,
  },
};

// ============================================
// SKILL EMBEDDINGS API (5.1.1)
// ============================================

export const skillEmbeddingsAPI = {
  create: async (data: CreateSkillEmbeddingInput, companyId?: string): Promise<SkillEmbedding> => {
    if (USE_MOCK) {
      const embedding: SkillEmbedding = {
        id: `emb-${Date.now()}`,
        companyId,
        skillName: data.skillName,
        normalizedName: data.skillName.toLowerCase().trim(),
        skillCategory: data.skillCategory,
        skillType: data.skillType || 'TECHNICAL',
        embeddingModel: 'text-embedding-3-small',
        embeddingVersion: '1.0',
        vectorDimension: 1536,
        synonyms: data.synonyms || [],
        alternateNames: data.alternateNames || [],
        usageCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockSkillEmbeddings.push(embedding);
      return embedding;
    }
    const url = companyId
      ? `${API_BASE_URL}/matching/companies/${companyId}/skills/embeddings`
      : `${API_BASE_URL}/matching/skills/embeddings`;
    const response = await axios.post(url, data);
    return response.data;
  },

  getAll: async (params?: { category?: string; type?: string }): Promise<SkillEmbedding[]> => {
    if (USE_MOCK) {
      let embeddings = [...mockSkillEmbeddings];
      if (params?.category) embeddings = embeddings.filter(e => e.skillCategory === params.category);
      if (params?.type) embeddings = embeddings.filter(e => e.skillType === params.type);
      return embeddings;
    }
    const response = await axios.get(`${API_BASE_URL}/matching/skills/embeddings`, { params });
    return response.data;
  },

  batchEmbed: async (skills: string[]): Promise<{ processed: number; results: any[] }> => {
    if (USE_MOCK) {
      return {
        processed: skills.length,
        results: skills.map((skill, i) => ({
          skillName: skill,
          normalizedName: skill.toLowerCase().trim(),
          status: 'EMBEDDED',
          embeddingId: `emb-batch-${Date.now()}-${i}`,
        })),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/skills/embeddings/batch`, { skills });
    return response.data;
  },

  calculateSimilarity: async (data: CalculateSkillSimilarityInput): Promise<SkillSimilarity> => {
    if (USE_MOCK) {
      const cosineSimilarity = 0.75 + Math.random() * 0.25;
      const contextualSimilarity = cosineSimilarity * (0.9 + Math.random() * 0.1);
      return {
        id: `sim-${Date.now()}`,
        ...data,
        cosineSimilarity,
        contextualSimilarity,
        combinedScore: (cosineSimilarity + contextualSimilarity) / 2,
        relationshipType: cosineSimilarity > 0.8 ? 'SIMILAR' : 'RELATED',
        confidenceScore: 0.85,
        calculatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/skills/similarity`, data);
    return response.data;
  },

  findSimilar: async (skillId: string, params?: { limit?: number; threshold?: number }): Promise<{ sourceSkillId: string; similarSkills: RelatedSkill[] }> => {
    if (USE_MOCK) {
      return {
        sourceSkillId: skillId,
        similarSkills: [
          { skillId: 'sk-1', skillName: 'TypeScript', similarity: 0.92 },
          { skillId: 'sk-2', skillName: 'Node.js', similarity: 0.85 },
          { skillId: 'sk-3', skillName: 'React', similarity: 0.82 },
        ].slice(0, params?.limit || 10),
      };
    }
    const response = await axios.get(`${API_BASE_URL}/matching/skills/${skillId}/similar`, { params });
    return response.data;
  },
};

// ============================================
// EXPERIENCE LEVEL API (5.1.2)
// ============================================

export const experienceLevelAPI = {
  createRule: async (data: CreateExperienceLevelRuleInput): Promise<ExperienceLevelRule> => {
    if (USE_MOCK) {
      const rule: ExperienceLevelRule = {
        id: `rule-${Date.now()}`,
        ...data,
        ruleType: data.ruleType || 'PATTERN',
        titlePatterns: data.titlePatterns || [],
        excludePatterns: data.excludePatterns || [],
        seniorityKeywords: data.seniorityKeywords || [],
        responsibilityKeywords: [],
        levelConfidence: 0.8,
        priority: data.priority || 100,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return rule;
    }
    const response = await axios.post(`${API_BASE_URL}/matching/experience-levels/rules`, data);
    return response.data;
  },

  getRules: async (companyId?: string): Promise<ExperienceLevelRule[]> => {
    if (USE_MOCK) {
      return [
        {
          id: 'rule-1',
          ruleName: 'Senior Title Pattern',
          ruleType: 'PATTERN',
          titlePatterns: ['Senior*', '*Sr.*'],
          excludePatterns: [],
          seniorityKeywords: [],
          responsibilityKeywords: [],
          inferredLevel: 'SENIOR',
          levelNumeric: 6,
          levelConfidence: 0.8,
          priority: 100,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
    const url = companyId
      ? `${API_BASE_URL}/matching/companies/${companyId}/experience-levels/rules`
      : `${API_BASE_URL}/matching/experience-levels/rules`;
    const response = await axios.get(url);
    return response.data;
  },

  inferLevel: async (candidateId: string, data: InferExperienceLevelInput): Promise<CandidateExperienceLevel> => {
    if (USE_MOCK) {
      let level: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL' | 'EXECUTIVE' = 'MID';
      let numeric = 4;
      if (data.yearsExperience >= 10) { level = 'LEAD'; numeric = 7; }
      else if (data.yearsExperience >= 5) { level = 'SENIOR'; numeric = 6; }
      else if (data.yearsExperience >= 3) { level = 'MID'; numeric = 4; }
      else if (data.yearsExperience >= 1) { level = 'JUNIOR'; numeric = 2; }
      else { level = 'ENTRY'; numeric = 1; }

      return {
        id: `cel-${Date.now()}`,
        candidateId,
        overallLevel: level,
        overallLevelNumeric: numeric,
        technicalLevel: level,
        technicalLevelNumeric: numeric,
        evidenceFactors: [
          { factor: 'yearsExperience', weight: 0.4, contribution: data.yearsExperience / 15 },
          { factor: 'roleCount', weight: 0.2, contribution: data.roleCount / 10 },
        ],
        titleProgression: data.titles,
        yearsCalculated: data.yearsExperience,
        roleCount: data.roleCount,
        confidenceScore: 0.82,
        manualOverride: false,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/candidates/${candidateId}/experience-level/infer`, data);
    return response.data;
  },

  getLevel: async (candidateId: string): Promise<CandidateExperienceLevel> => {
    if (USE_MOCK) {
      return {
        id: 'cel-1',
        candidateId,
        overallLevel: 'SENIOR',
        overallLevelNumeric: 6,
        technicalLevel: 'SENIOR',
        technicalLevelNumeric: 6,
        evidenceFactors: [],
        confidenceScore: 0.85,
        manualOverride: false,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.get(`${API_BASE_URL}/matching/candidates/${candidateId}/experience-level`);
    return response.data;
  },
};

// ============================================
// ROLE MAPPING API (5.1.3)
// ============================================

export const roleMappingAPI = {
  create: async (data: CreateRoleMappingInput): Promise<RoleMapping> => {
    if (USE_MOCK) {
      const mapping: RoleMapping = {
        id: `rm-${Date.now()}`,
        ...data,
        normalizedTitle: data.roleTitle.toLowerCase().trim(),
        industrySpecific: !!data.industry,
        equivalentTitles: data.equivalentTitles || [],
        seniorVariants: data.seniorVariants || [],
        juniorVariants: data.juniorVariants || [],
        typicalSkills: data.typicalSkills || [],
        usageCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRoleMappings.push(mapping);
      return mapping;
    }
    const response = await axios.post(`${API_BASE_URL}/matching/roles/mappings`, data);
    return response.data;
  },

  getAll: async (params?: { category?: string; family?: string; industry?: string }): Promise<RoleMapping[]> => {
    if (USE_MOCK) {
      let mappings = [...mockRoleMappings];
      if (params?.category) mappings = mappings.filter(m => m.roleCategory === params.category);
      if (params?.family) mappings = mappings.filter(m => m.roleFamily === params.family);
      return mappings;
    }
    const response = await axios.get(`${API_BASE_URL}/matching/roles/mappings`, { params });
    return response.data;
  },

  calculateSimilarity: async (data: CalculateRoleSimilarityInput): Promise<RoleSimilarityScore> => {
    if (USE_MOCK) {
      const titleSim = 0.7 + Math.random() * 0.3;
      const funcSim = 0.6 + Math.random() * 0.4;
      const skillSim = 0.5 + Math.random() * 0.5;
      return {
        id: `rs-${Date.now()}`,
        ...data,
        titleSimilarity: titleSim,
        functionSimilarity: funcSim,
        skillOverlap: skillSim,
        combinedScore: (titleSim * 0.3 + funcSim * 0.4 + skillSim * 0.3),
        crossIndustry: false,
        industryAdjustment: 1.0,
        calculatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/roles/similarity`, data);
    return response.data;
  },

  findSimilar: async (roleId: string, params?: { limit?: number }): Promise<{ sourceRoleId: string; similarRoles: any[] }> => {
    if (USE_MOCK) {
      return {
        sourceRoleId: roleId,
        similarRoles: [
          { roleId: 'rm-1', roleTitle: 'Senior Software Engineer', similarity: 0.95 },
          { roleId: 'rm-2', roleTitle: 'Full Stack Developer', similarity: 0.88 },
        ],
      };
    }
    const response = await axios.get(`${API_BASE_URL}/matching/roles/${roleId}/similar`, { params });
    return response.data;
  },
};

// ============================================
// SKILL TRANSFERABILITY API (5.1.4)
// ============================================

export const skillTransferAPI = {
  create: async (data: CreateSkillTransferabilityInput): Promise<SkillTransferabilityScore> => {
    if (USE_MOCK) {
      return {
        id: `st-${Date.now()}`,
        ...data,
        transferabilityScore: data.transferabilityScore || 0.7,
        learningCurve: data.learningCurve || 'MODERATE',
        evidenceType: 'COMPUTED',
        examplesCount: 0,
        prerequisiteSkills: data.prerequisiteSkills || [],
        bridgingConcepts: data.bridgingConcepts || [],
        confidenceScore: 0.75,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/skills/transferability`, data);
    return response.data;
  },

  get: async (sourceSkillId: string, targetSkillId: string): Promise<SkillTransferabilityScore> => {
    if (USE_MOCK) {
      return {
        id: 'st-1',
        sourceSkillId,
        sourceSkillName: 'JavaScript',
        targetSkillId,
        targetSkillName: 'TypeScript',
        transferabilityScore: 0.85,
        learningCurve: 'EASY',
        estimatedLearningDays: 14,
        evidenceType: 'COMPUTED',
        examplesCount: 150,
        prerequisiteSkills: [],
        bridgingConcepts: ['Type system', 'Static typing'],
        confidenceScore: 0.9,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.get(`${API_BASE_URL}/matching/skills/${sourceSkillId}/transferability/${targetSkillId}`);
    return response.data;
  },

  analyzeCandidate: async (candidateId: string, data: AnalyzeTransferableSkillsInput): Promise<TransferableSkillsAnalysis> => {
    if (USE_MOCK) {
      const analysis = data.targetSkills.map(target => ({
        targetSkill: target,
        hasDirectMatch: data.candidateSkills.some(cs => cs.toLowerCase() === target.toLowerCase()),
        transferableFrom: data.candidateSkills.filter(cs => cs.toLowerCase().includes(target.toLowerCase().slice(0, 3))),
        transferabilityScore: 0.5 + Math.random() * 0.5,
        learningCurve: 'MODERATE' as const,
        estimatedDays: Math.floor(Math.random() * 30) + 14,
      }));
      return {
        candidateId,
        analysis,
        overallTransferability: analysis.reduce((sum, a) => sum + a.transferabilityScore, 0) / analysis.length,
        readySkills: analysis.filter(a => a.hasDirectMatch).length,
        transferableSkills: analysis.filter(a => a.transferabilityScore > 0.6).length,
        gapSkills: analysis.filter(a => a.transferabilityScore <= 0.6).length,
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/candidates/${candidateId}/transferable-skills`, data);
    return response.data;
  },
};

// ============================================
// PROJECT RELEVANCE API (5.1.5)
// ============================================

export const projectRelevanceAPI = {
  calculate: async (data: CalculateProjectRelevanceInput): Promise<ProjectRelevanceScore> => {
    if (USE_MOCK) {
      const matchedSkills = data.projectSkills.filter(ps =>
        data.jobSkills.some(js => js.toLowerCase() === ps.toLowerCase())
      );
      const skillScore = matchedSkills.length / Math.max(data.jobSkills.length, 1) * 100;
      return {
        id: `pr-${Date.now()}`,
        ...data,
        overallRelevance: 50 + skillScore * 0.5,
        skillMatchScore: skillScore,
        domainMatchScore: 60 + Math.random() * 40,
        matchedSkills,
        missingSkills: data.jobSkills.filter(js => !data.projectSkills.some(ps => ps.toLowerCase() === js.toLowerCase())),
        bonusSkills: data.projectSkills.filter(ps => !data.jobSkills.some(js => js.toLowerCase() === ps.toLowerCase())),
        projectComplexity: 'MEDIUM',
        calculatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/projects/relevance`, data);
    return response.data;
  },

  batchCalculate: async (candidateId: string, data: BatchProjectRelevanceInput): Promise<BatchProjectRelevanceResult> => {
    if (USE_MOCK) {
      const scores = data.projects.map((project, i) => {
        const matched = project.skills.filter(ps => data.jobSkills.some(js => js.toLowerCase() === ps.toLowerCase()));
        const skillScore = matched.length / Math.max(data.jobSkills.length, 1) * 100;
        return {
          projectId: project.id,
          projectTitle: project.title,
          overallRelevance: 50 + skillScore * 0.5,
          skillMatchScore: skillScore,
          matchedSkills: matched,
          rank: i + 1,
        };
      }).sort((a, b) => b.overallRelevance - a.overallRelevance)
        .map((s, i) => ({ ...s, rank: i + 1 }));

      return {
        candidateId,
        jobId: data.jobId,
        projectRelevanceScores: scores,
        mostRelevantProject: scores[0],
        averageRelevance: scores.reduce((sum, s) => sum + s.overallRelevance, 0) / scores.length,
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/candidates/${candidateId}/projects/relevance`, data);
    return response.data;
  },
};

// ============================================
// INDUSTRY CROSSOVER API (5.1.6)
// ============================================

export const industryCrossoverAPI = {
  create: async (data: CreateIndustryCrossoverInput): Promise<IndustryCrossover> => {
    if (USE_MOCK) {
      return {
        id: `ic-${Date.now()}`,
        ...data,
        crossoverScore: data.crossoverScore || 0.6,
        crossoverDifficulty: data.crossoverDifficulty || 'MODERATE',
        commonRoles: data.commonRoles || [],
        transferableSkills: data.transferableSkills || [],
        bridgingSkills: data.bridgingSkills || [],
        successFactors: data.successFactors || [],
        commonChallenges: data.commonChallenges || [],
        transitionExamples: 0,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/industries/crossover`, data);
    return response.data;
  },

  get: async (sourceIndustry: string, targetIndustry: string): Promise<IndustryCrossover> => {
    if (USE_MOCK) {
      return {
        id: 'ic-1',
        sourceIndustry,
        targetIndustry,
        crossoverScore: 0.75,
        crossoverDifficulty: 'MODERATE',
        commonRoles: ['Software Engineer', 'Data Analyst', 'Project Manager'],
        transferableSkills: ['Python', 'SQL', 'Data Analysis'],
        bridgingSkills: ['Domain Knowledge', 'Regulatory Compliance'],
        successFactors: ['Strong analytical skills', 'Adaptability'],
        commonChallenges: ['Industry terminology', 'Different pace'],
        averageTransitionTime: 6,
        successRate: 0.72,
        transitionExamples: 45,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.get(`${API_BASE_URL}/matching/industries/${sourceIndustry}/crossover/${targetIndustry}`);
    return response.data;
  },

  getAll: async (industry: string): Promise<IndustryCrossover[]> => {
    if (USE_MOCK) {
      return [
        { id: 'ic-1', sourceIndustry: industry, targetIndustry: 'Finance', crossoverScore: 0.75, crossoverDifficulty: 'MODERATE' },
        { id: 'ic-2', sourceIndustry: industry, targetIndustry: 'Healthcare', crossoverScore: 0.65, crossoverDifficulty: 'DIFFICULT' },
        { id: 'ic-3', sourceIndustry: industry, targetIndustry: 'E-commerce', crossoverScore: 0.85, crossoverDifficulty: 'EASY' },
      ] as IndustryCrossover[];
    }
    const response = await axios.get(`${API_BASE_URL}/matching/industries/${industry}/crossovers`);
    return response.data;
  },

  analyzeCandidate: async (candidateId: string, data: AnalyzeIndustryCrossoverInput): Promise<IndustryCrossoverAnalysis> => {
    if (USE_MOCK) {
      return {
        candidateId,
        currentIndustry: data.currentIndustry,
        targetIndustry: data.targetIndustry,
        crossoverScore: 0.72,
        readiness: 'MODERATE',
        transferableSkillsPresent: data.candidateSkills.slice(0, 5),
        skillsToAcquire: ['Domain Knowledge', 'Industry Regulations'],
        estimatedTransitionTime: 4,
        recommendations: [
          'Complete industry certification',
          'Network with professionals in target industry',
        ],
        similarSuccessfulTransitions: 15,
        confidenceScore: 0.78,
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/candidates/${candidateId}/industry-crossover`, data);
    return response.data;
  },
};

// ============================================
// HIDDEN TALENT API (5.1.7)
// ============================================

export const hiddenTalentAPI = {
  discover: async (jobId: string, data: DiscoverHiddenTalentInput): Promise<HiddenTalentDiscoveryResult> => {
    if (USE_MOCK) {
      return {
        jobId,
        jobTitle: data.jobTitle,
        hiddenTalentFound: mockHiddenTalent.length,
        candidates: mockHiddenTalent,
        averageScoreLift: 28,
        discoveredAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/jobs/${jobId}/hidden-talent/discover`, data);
    return response.data;
  },

  getProfiles: async (companyId: string, params?: { jobId?: string; status?: string; minScore?: number }): Promise<HiddenTalentProfile[]> => {
    if (USE_MOCK) {
      let profiles = [...mockHiddenTalent];
      if (params?.status) profiles = profiles.filter(p => p.status === params.status);
      if (params?.minScore) profiles = profiles.filter(p => p.potentialScore >= params.minScore);
      return profiles;
    }
    const response = await axios.get(`${API_BASE_URL}/matching/companies/${companyId}/hidden-talent`, { params });
    return response.data;
  },

  updateStatus: async (profileId: string, data: UpdateHiddenTalentStatusInput): Promise<HiddenTalentProfile> => {
    if (USE_MOCK) {
      const profile = mockHiddenTalent.find(p => p.id === profileId);
      if (profile) {
        profile.status = data.status;
        profile.reviewNotes = data.reviewNotes;
        profile.outcomeNotes = data.outcomeNotes;
        profile.reviewedAt = new Date().toISOString();
      }
      return profile!;
    }
    const response = await axios.patch(`${API_BASE_URL}/matching/hidden-talent/${profileId}/status`, data);
    return response.data;
  },
};

// ============================================
// MATCH SCORING API
// ============================================

export const matchScoringAPI = {
  calculate: async (candidateId: string, jobId: string, data: CalculateMatchScoreInput): Promise<CandidateMatchScore> => {
    if (USE_MOCK) {
      const skillScore = 70 + Math.random() * 30;
      const experienceScore = 60 + Math.random() * 40;
      const projectScore = 50 + Math.random() * 50;
      const semanticScore = (skillScore * 0.35 + experienceScore * 0.25 + projectScore * 0.15);
      const overall = semanticScore * 1.15;
      return {
        id: `cms-${Date.now()}`,
        companyId: data.companyId,
        candidateId,
        jobId,
        overallMatchScore: Math.min(100, overall),
        semanticScore,
        keywordScore: semanticScore * 0.85,
        experienceScore,
        skillScore,
        projectScore,
        scoreBreakdown: { skills: { score: skillScore, weight: 0.35 } },
        matchedSkills: ['JavaScript', 'React', 'Node.js'],
        missingSkills: ['Go', 'Kubernetes'],
        bonusQualifications: [],
        isHiddenTalent: Math.random() > 0.8,
        hiddenTalentBoost: 5,
        recommendation: overall >= 80 ? 'STRONG_YES' : overall >= 65 ? 'YES' : 'MAYBE',
        matchingVersion: '1.0',
        calculatedAt: new Date().toISOString(),
      };
    }
    const response = await axios.post(`${API_BASE_URL}/matching/candidates/${candidateId}/jobs/${jobId}/match-score`, data);
    return response.data;
  },

  getForJob: async (jobId: string, params?: { minScore?: number; recommendation?: string; limit?: number }): Promise<JobMatchScoresResult> => {
    if (USE_MOCK) {
      return {
        jobId,
        totalCandidates: 3,
        scores: [
          { id: 'cms-1', candidateId: 'cand-1', jobId, overallMatchScore: 92, recommendation: 'STRONG_YES', matchedSkillsCount: 8, missingSkillsCount: 1, isHiddenTalent: false, calculatedAt: new Date().toISOString() },
          { id: 'cms-2', candidateId: 'cand-2', jobId, overallMatchScore: 85, recommendation: 'YES', matchedSkillsCount: 7, missingSkillsCount: 2, isHiddenTalent: false, calculatedAt: new Date().toISOString() },
          { id: 'cms-3', candidateId: 'cand-3', jobId, overallMatchScore: 78, recommendation: 'YES', matchedSkillsCount: 5, missingSkillsCount: 3, isHiddenTalent: true, calculatedAt: new Date().toISOString() },
        ],
        averageScore: 85,
        hiddenTalentCount: 1,
      };
    }
    const response = await axios.get(`${API_BASE_URL}/matching/jobs/${jobId}/match-scores`, { params });
    return response.data;
  },
};

// ============================================
// MATCHING CONFIG API
// ============================================

export const matchingConfigAPI = {
  upsert: async (companyId: string, data: UpsertMatchingConfigInput): Promise<MatchingConfig> => {
    if (USE_MOCK) {
      return { ...mockMatchingConfig, ...data, companyId, updatedAt: new Date().toISOString() };
    }
    const response = await axios.put(`${API_BASE_URL}/matching/companies/${companyId}/matching-config`, data);
    return response.data;
  },

  get: async (companyId: string, jobId?: string): Promise<MatchingConfig> => {
    if (USE_MOCK) {
      return { ...mockMatchingConfig, companyId, jobId };
    }
    const url = jobId
      ? `${API_BASE_URL}/matching/companies/${companyId}/jobs/${jobId}/matching-config`
      : `${API_BASE_URL}/matching/companies/${companyId}/matching-config`;
    const response = await axios.get(url);
    return response.data;
  },

  getStats: async (companyId?: string): Promise<SemanticMatchingStats> => {
    if (USE_MOCK) return mockStats;
    const url = companyId
      ? `${API_BASE_URL}/matching/companies/${companyId}/matching-stats`
      : `${API_BASE_URL}/matching/matching-stats`;
    const response = await axios.get(url);
    return response.data;
  },
};

export default {
  skills: skillEmbeddingsAPI,
  experienceLevel: experienceLevelAPI,
  roles: roleMappingAPI,
  transfer: skillTransferAPI,
  projects: projectRelevanceAPI,
  industry: industryCrossoverAPI,
  hiddenTalent: hiddenTalentAPI,
  matching: matchScoringAPI,
  config: matchingConfigAPI,
};
