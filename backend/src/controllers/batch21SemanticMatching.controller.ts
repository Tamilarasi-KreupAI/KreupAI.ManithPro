import { Request, Response } from 'express';
import { getOrCreateSkillEmbedding } from '../services/skillEmbedding.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// BATCH 21: SEMANTIC MATCHING ENGINE (5.1.1-5.1.7)
// ============================================

// ============================================
// 5.1.1 - SKILL EMBEDDINGS
// ============================================

// Create or update skill embedding
export const createSkillEmbedding = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const {
      skillName,
      skillCategory,
      skillType,
      synonyms,
      alternateNames,
    } = req.body;

    // Reuse an existing persisted embedding for this skill + company scope
    // when one exists; otherwise generate and persist a new one with the
    // actual provider/model metadata of the generation implementation.
    const { vector, created, record } = await getOrCreateSkillEmbedding({
      skillText: skillName,
      skillName,
      companyId: companyId || null,
      skillCategory: skillCategory || null,
      skillType,
      createdById: (req as any).user?.id || null,
    });

    const embedding = {
      id: record.id,
      companyId: record.companyId,
      skillName: record.skillName,
      normalizedName: record.normalizedName,
      skillCategory: record.skillCategory,
      skillType: record.skillType,
      embeddingProvider: record.embeddingProvider,
      embeddingModel: record.embeddingModel,
      embeddingVersion: record.embeddingVersion,
      embeddingVector: vector,
      vectorDimension: record.vectorDimension,
      synonyms: synonyms || [],
      alternateNames: alternateNames || [],
      usageCount: record.usageCount,
      isActive: record.isActive,
      reused: !created,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };

    res.status(created ? 201 : 200).json(embedding);
  } catch (error) {
    console.error('Error creating skill embedding:', error);
    res.status(500).json({ error: 'Failed to create skill embedding' });
  }
};

// Get all skill embeddings
export const getSkillEmbeddings = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { category, type, search } = req.query;

    const embeddings = await prisma.skillEmbedding.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        ...(category ? { skillCategory: category as string } : {}),
        ...(type ? { skillType: type as any } : {}),
        ...(search
          ? { normalizedName: { contains: String(search).toLowerCase().trim() } }
          : {}),
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyId: true,
        skillName: true,
        normalizedName: true,
        skillCategory: true,
        skillType: true,
        embeddingProvider: true,
        embeddingModel: true,
        embeddingVersion: true,
        vectorDimension: true,
        synonyms: true,
        alternateNames: true,
        usageCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // embeddingVector intentionally excluded from list responses
      },
    });

    res.json(embeddings);
  } catch (error) {
    console.error('Error fetching skill embeddings:', error);
    res.status(500).json({ error: 'Failed to fetch skill embeddings' });
  }
};

// Calculate skill similarity
export const calculateSkillSimilarity = async (req: Request, res: Response) => {
  try {
    const { skillAId, skillBId, skillAName, skillBName, companyId } = req.body;

    // Real cosine similarity over persisted (or newly generated + persisted)
    // company-scoped embeddings.
    const scopeCompanyId = companyId || null;
    const embA = await getOrCreateSkillEmbedding({ skillText: skillAName, companyId: scopeCompanyId });
    const embB = await getOrCreateSkillEmbedding({ skillText: skillBName, companyId: scopeCompanyId });

    const dot = embA.vector.reduce((sum, v, i) => sum + v * embB.vector[i], 0);
    const normA = Math.sqrt(embA.vector.reduce((s, v) => s + v * v, 0));
    const normB = Math.sqrt(embB.vector.reduce((s, v) => s + v * v, 0));
    const cosineSimilarity = normA && normB ? dot / (normA * normB) : 0;

    // Contextual similarity: Euclidean-distance-based measure over the same
    // persisted vectors (1 - d/d_max, where d_max = 2 for unit-normalized
    // vectors). Deterministic, computed from real stored vectors.
    const euclidean = Math.sqrt(
      embA.vector.reduce((s, v, i) => s + (v - embB.vector[i]) ** 2, 0)
    );
    const contextualSimilarity = 1 - euclidean / 2;
    const combinedScore = (cosineSimilarity + contextualSimilarity) / 2;

    const similarity = {
      id: `sim-${Date.now()}`,
      skillAId,
      skillAName,
      skillBId,
      skillBName,
      cosineSimilarity,
      contextualSimilarity,
      combinedScore,
      relationshipType: combinedScore > 0.8 ? 'SIMILAR' : combinedScore > 0.6 ? 'RELATED' : 'DIFFERENT',
      confidenceScore: 0.85,
      calculatedAt: new Date().toISOString(),
    };

    res.json(similarity);
  } catch (error) {
    console.error('Error calculating skill similarity:', error);
    res.status(500).json({ error: 'Failed to calculate skill similarity' });
  }
};

// Find similar skills
export const findSimilarSkills = async (req: Request, res: Response) => {
  try {
    const { skillId } = req.params;
    const { limit = 10, threshold = 0.7 } = req.query;

    // Mock similar skills
    const similarSkills = [
      { skillId: 'sk-1', skillName: 'TypeScript', similarity: 0.92 },
      { skillId: 'sk-2', skillName: 'Node.js', similarity: 0.85 },
      { skillId: 'sk-3', skillName: 'React', similarity: 0.82 },
      { skillId: 'sk-4', skillName: 'Vue.js', similarity: 0.78 },
      { skillId: 'sk-5', skillName: 'Angular', similarity: 0.76 },
    ].filter(s => s.similarity >= Number(threshold)).slice(0, Number(limit));

    res.json({
      sourceSkillId: skillId,
      similarSkills,
      totalFound: similarSkills.length,
      threshold: Number(threshold),
    });
  } catch (error) {
    console.error('Error finding similar skills:', error);
    res.status(500).json({ error: 'Failed to find similar skills' });
  }
};

// Batch embed skills
export const batchEmbedSkills = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { skills } = req.body; // Array of skill names

    const results = [];
    for (const [index, skill] of (skills as string[]).entries()) {
      const { vector, created, record } = await getOrCreateSkillEmbedding({
        skillText: skill,
        companyId: companyId || null,
        createdById: (req as any).user?.id || null,
      });

      results.push({
        skillName: skill,
        normalizedName: record.normalizedName,
        status: 'EMBEDDED',
        embeddingId: record.id,
        reused: !created,
        vectorDimension: record.vectorDimension,
      });
    }

    res.json({
      processed: results.length,
      results,
      message: `Successfully embedded ${results.length} skills`,
    });
  } catch (error) {
    console.error('Error batch embedding skills:', error);
    res.status(500).json({ error: 'Failed to batch embed skills' });
  }
};

// ============================================
// 5.1.2 - EXPERIENCE LEVEL INFERENCE
// ============================================

// Create experience level rule
export const createExperienceLevelRule = async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      ruleName,
      ruleDescription,
      ruleType,
      titlePatterns,
      excludePatterns,
      minYearsExperience,
      maxYearsExperience,
      seniorityKeywords,
      inferredLevel,
      levelNumeric,
      priority,
    } = req.body;

    const rule = {
      id: `rule-${Date.now()}`,
      companyId: companyId || null,
      ruleName,
      ruleDescription,
      ruleType: ruleType || 'PATTERN',
      titlePatterns: titlePatterns || [],
      excludePatterns: excludePatterns || [],
      minYearsExperience,
      maxYearsExperience,
      seniorityKeywords: seniorityKeywords || [],
      responsibilityKeywords: [],
      inferredLevel,
      levelNumeric,
      levelConfidence: 0.8,
      priority: priority || 100,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating experience level rule:', error);
    res.status(500).json({ error: 'Failed to create experience level rule' });
  }
};

// Get experience level rules
export const getExperienceLevelRules = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    // Mock rules
    const rules = [
      {
        id: 'rule-1',
        ruleName: 'Senior Title Pattern',
        ruleType: 'PATTERN',
        titlePatterns: ['Senior*', '*Sr.*', '*Sr *'],
        inferredLevel: 'SENIOR',
        levelNumeric: 6,
        priority: 100,
        isActive: true,
      },
      {
        id: 'rule-2',
        ruleName: 'Lead/Principal Pattern',
        ruleType: 'PATTERN',
        titlePatterns: ['*Lead*', 'Principal*', 'Staff*'],
        inferredLevel: 'LEAD',
        levelNumeric: 7,
        priority: 90,
        isActive: true,
      },
      {
        id: 'rule-3',
        ruleName: 'Junior/Entry Pattern',
        ruleType: 'PATTERN',
        titlePatterns: ['Junior*', '*Jr.*', 'Associate*', 'Entry*'],
        inferredLevel: 'JUNIOR',
        levelNumeric: 2,
        priority: 100,
        isActive: true,
      },
      {
        id: 'rule-4',
        ruleName: 'Experience Duration',
        ruleType: 'DURATION',
        minYearsExperience: 5,
        maxYearsExperience: 10,
        inferredLevel: 'SENIOR',
        levelNumeric: 6,
        priority: 80,
        isActive: true,
      },
    ];

    res.json(rules);
  } catch (error) {
    console.error('Error fetching experience level rules:', error);
    res.status(500).json({ error: 'Failed to fetch experience level rules' });
  }
};

// Infer candidate experience level
export const inferCandidateExperienceLevel = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const { titles, yearsExperience, roleCount, companyHistory } = req.body;

    // Mock inference logic
    let overallLevel = 'MID';
    let levelNumeric = 4;

    if (yearsExperience >= 10) {
      overallLevel = 'SENIOR';
      levelNumeric = 7;
    } else if (yearsExperience >= 5) {
      overallLevel = 'SENIOR';
      levelNumeric = 6;
    } else if (yearsExperience >= 3) {
      overallLevel = 'MID';
      levelNumeric = 4;
    } else if (yearsExperience >= 1) {
      overallLevel = 'JUNIOR';
      levelNumeric = 2;
    } else {
      overallLevel = 'ENTRY';
      levelNumeric = 1;
    }

    const result = {
      id: `cel-${Date.now()}`,
      candidateId,
      overallLevel,
      overallLevelNumeric: levelNumeric,
      technicalLevel: overallLevel,
      technicalLevelNumeric: levelNumeric,
      leadershipLevel: roleCount > 3 ? 'MID' : 'JUNIOR',
      leadershipLevelNumeric: roleCount > 3 ? 4 : 2,
      evidenceFactors: [
        { factor: 'yearsExperience', weight: 0.4, contribution: yearsExperience / 15 },
        { factor: 'roleCount', weight: 0.2, contribution: roleCount / 10 },
        { factor: 'titleProgression', weight: 0.4, contribution: 0.7 },
      ],
      titleProgression: titles,
      yearsCalculated: yearsExperience,
      roleCount,
      confidenceScore: 0.82,
      manualOverride: false,
      calculatedAt: new Date().toISOString(),
    };

    res.json(result);
  } catch (error) {
    console.error('Error inferring experience level:', error);
    res.status(500).json({ error: 'Failed to infer experience level' });
  }
};

// Get candidate experience level
export const getCandidateExperienceLevel = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;

    // Mock data
    const level = {
      id: 'cel-1',
      candidateId,
      overallLevel: 'SENIOR',
      overallLevelNumeric: 6,
      technicalLevel: 'SENIOR',
      technicalLevelNumeric: 6,
      leadershipLevel: 'MID',
      leadershipLevelNumeric: 4,
      confidenceScore: 0.85,
      calculatedAt: new Date(Date.now() - 86400000).toISOString(),
    };

    res.json(level);
  } catch (error) {
    console.error('Error fetching candidate experience level:', error);
    res.status(500).json({ error: 'Failed to fetch candidate experience level' });
  }
};

// ============================================
// 5.1.3 - ROLE SIMILARITY DETECTION
// ============================================

// Create role mapping
export const createRoleMapping = async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      roleTitle,
      roleCategory,
      roleFamily,
      roleFunction,
      industry,
      equivalentTitles,
      seniorVariants,
      juniorVariants,
      typicalSkills,
      typicalExperience,
    } = req.body;

    const mapping = {
      id: `rm-${Date.now()}`,
      companyId: companyId || null,
      roleTitle,
      normalizedTitle: roleTitle.toLowerCase().trim(),
      roleCategory,
      roleFamily,
      roleFunction,
      industry,
      industrySpecific: !!industry,
      equivalentTitles: equivalentTitles || [],
      seniorVariants: seniorVariants || [],
      juniorVariants: juniorVariants || [],
      typicalSkills: typicalSkills || [],
      typicalExperience,
      usageCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(mapping);
  } catch (error) {
    console.error('Error creating role mapping:', error);
    res.status(500).json({ error: 'Failed to create role mapping' });
  }
};

// Get role mappings
export const getRoleMappings = async (req: Request, res: Response) => {
  try {
    const { category, family, industry } = req.query;

    // Mock data
    const mappings = [
      {
        id: 'rm-1',
        roleTitle: 'Software Engineer',
        normalizedTitle: 'software engineer',
        roleCategory: 'Engineering',
        roleFamily: 'Software Development',
        roleFunction: 'Individual Contributor',
        equivalentTitles: ['Software Developer', 'Programmer', 'Developer'],
        seniorVariants: ['Senior Software Engineer', 'Staff Software Engineer'],
        juniorVariants: ['Junior Software Engineer', 'Associate Developer'],
        typicalSkills: ['JavaScript', 'Python', 'SQL', 'Git'],
        typicalExperience: 3,
        isActive: true,
      },
      {
        id: 'rm-2',
        roleTitle: 'Product Manager',
        normalizedTitle: 'product manager',
        roleCategory: 'Product',
        roleFamily: 'Product Management',
        roleFunction: 'Individual Contributor',
        equivalentTitles: ['PM', 'Product Owner'],
        seniorVariants: ['Senior Product Manager', 'Director of Product'],
        juniorVariants: ['Associate Product Manager', 'Junior PM'],
        typicalSkills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
        typicalExperience: 4,
        isActive: true,
      },
      {
        id: 'rm-3',
        roleTitle: 'Data Scientist',
        normalizedTitle: 'data scientist',
        roleCategory: 'Data',
        roleFamily: 'Data Science',
        roleFunction: 'Individual Contributor',
        equivalentTitles: ['ML Engineer', 'Data Analyst'],
        seniorVariants: ['Senior Data Scientist', 'Principal Data Scientist'],
        juniorVariants: ['Junior Data Scientist', 'Data Analyst'],
        typicalSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
        typicalExperience: 3,
        isActive: true,
      },
    ];

    res.json(mappings);
  } catch (error) {
    console.error('Error fetching role mappings:', error);
    res.status(500).json({ error: 'Failed to fetch role mappings' });
  }
};

// Calculate role similarity
export const calculateRoleSimilarity = async (req: Request, res: Response) => {
  try {
    const { roleAId, roleBId, roleATitle, roleBTitle } = req.body;

    // Mock similarity calculation
    const titleSimilarity = 0.7 + Math.random() * 0.3;
    const functionSimilarity = 0.6 + Math.random() * 0.4;
    const skillOverlap = 0.5 + Math.random() * 0.5;
    const combinedScore = (titleSimilarity * 0.3 + functionSimilarity * 0.4 + skillOverlap * 0.3);

    const similarity = {
      id: `rs-${Date.now()}`,
      roleAId,
      roleATitle,
      roleBId,
      roleBTitle,
      titleSimilarity,
      functionSimilarity,
      skillOverlap,
      combinedScore,
      transferabilityScore: combinedScore * 0.95,
      gapAnalysis: {
        skillsToAcquire: ['Skill A', 'Skill B'],
        experienceGap: 0,
      },
      crossIndustry: false,
      industryAdjustment: 1.0,
      calculatedAt: new Date().toISOString(),
    };

    res.json(similarity);
  } catch (error) {
    console.error('Error calculating role similarity:', error);
    res.status(500).json({ error: 'Failed to calculate role similarity' });
  }
};

// Find similar roles
export const findSimilarRoles = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { limit = 10, includeIndustry } = req.query;

    // Mock similar roles
    const similarRoles = [
      { roleId: 'rm-1', roleTitle: 'Senior Software Engineer', similarity: 0.95 },
      { roleId: 'rm-2', roleTitle: 'Full Stack Developer', similarity: 0.88 },
      { roleId: 'rm-3', roleTitle: 'Backend Engineer', similarity: 0.82 },
      { roleId: 'rm-4', roleTitle: 'Frontend Developer', similarity: 0.78 },
      { roleId: 'rm-5', roleTitle: 'DevOps Engineer', similarity: 0.65 },
    ].slice(0, Number(limit));

    res.json({
      sourceRoleId: roleId,
      similarRoles,
      totalFound: similarRoles.length,
    });
  } catch (error) {
    console.error('Error finding similar roles:', error);
    res.status(500).json({ error: 'Failed to find similar roles' });
  }
};

// ============================================
// 5.1.4 - SKILL TRANSFERABILITY
// ============================================

// Create skill transferability mapping
export const createSkillTransferability = async (req: Request, res: Response) => {
  try {
    const {
      sourceSkillId,
      sourceSkillName,
      targetSkillId,
      targetSkillName,
      transferabilityScore,
      learningCurve,
      estimatedLearningDays,
      transferContext,
      prerequisiteSkills,
      bridgingConcepts,
    } = req.body;

    const transferability = {
      id: `st-${Date.now()}`,
      sourceSkillId,
      sourceSkillName,
      targetSkillId,
      targetSkillName,
      transferabilityScore: transferabilityScore || 0.7,
      learningCurve: learningCurve || 'MODERATE',
      estimatedLearningDays,
      transferContext,
      contextConditions: null,
      evidenceType: 'COMPUTED',
      evidenceSource: null,
      examplesCount: 0,
      prerequisiteSkills: prerequisiteSkills || [],
      bridgingConcepts: bridgingConcepts || [],
      confidenceScore: 0.75,
      calculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(transferability);
  } catch (error) {
    console.error('Error creating skill transferability:', error);
    res.status(500).json({ error: 'Failed to create skill transferability' });
  }
};

// Get skill transferability
export const getSkillTransferability = async (req: Request, res: Response) => {
  try {
    const { sourceSkillId, targetSkillId } = req.params;

    // Mock data
    const transferability = {
      id: 'st-1',
      sourceSkillId,
      sourceSkillName: 'JavaScript',
      targetSkillId,
      targetSkillName: 'TypeScript',
      transferabilityScore: 0.85,
      learningCurve: 'EASY',
      estimatedLearningDays: 14,
      prerequisiteSkills: [],
      bridgingConcepts: ['Type system basics', 'Static typing'],
      confidenceScore: 0.9,
    };

    res.json(transferability);
  } catch (error) {
    console.error('Error fetching skill transferability:', error);
    res.status(500).json({ error: 'Failed to fetch skill transferability' });
  }
};

// Analyze candidate skill transferability
export const analyzeTransferableSkills = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const { targetSkills, candidateSkills } = req.body;

    // Mock analysis
    const transferAnalysis = targetSkills.map((target: string) => {
      const matchingSkill = candidateSkills.find((cs: string) =>
        cs.toLowerCase().includes(target.toLowerCase().slice(0, 3))
      );

      return {
        targetSkill: target,
        hasDirectMatch: !!matchingSkill,
        transferableFrom: matchingSkill ? [matchingSkill] : [],
        transferabilityScore: matchingSkill ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3,
        learningCurve: matchingSkill ? 'EASY' : 'MODERATE',
        estimatedDays: matchingSkill ? Math.floor(Math.random() * 14) + 7 : Math.floor(Math.random() * 30) + 30,
      };
    });

    res.json({
      candidateId,
      analysis: transferAnalysis,
      overallTransferability: transferAnalysis.reduce((sum: number, a: any) => sum + a.transferabilityScore, 0) / transferAnalysis.length,
      readySkills: transferAnalysis.filter((a: any) => a.hasDirectMatch).length,
      transferableSkills: transferAnalysis.filter((a: any) => a.transferabilityScore > 0.6).length,
      gapSkills: transferAnalysis.filter((a: any) => a.transferabilityScore <= 0.6).length,
    });
  } catch (error) {
    console.error('Error analyzing transferable skills:', error);
    res.status(500).json({ error: 'Failed to analyze transferable skills' });
  }
};

// ============================================
// 5.1.5 - PROJECT RELEVANCE SCORING
// ============================================

// Calculate project relevance to job
export const calculateProjectRelevance = async (req: Request, res: Response) => {
  try {
    const {
      projectId,
      projectTitle,
      projectDescription,
      projectSkills,
      jobId,
      jobTitle,
      jobRequirements,
      jobSkills,
    } = req.body;

    // Calculate overlaps
    const matchedSkills = projectSkills.filter((ps: string) =>
      jobSkills.some((js: string) => js.toLowerCase() === ps.toLowerCase())
    );

    const skillMatchScore = matchedSkills.length / Math.max(jobSkills.length, 1) * 100;
    const domainMatchScore = 60 + Math.random() * 40;
    const recencyScore = 70 + Math.random() * 30;
    const overallRelevance = (skillMatchScore * 0.5 + domainMatchScore * 0.3 + recencyScore * 0.2);

    const relevance = {
      id: `pr-${Date.now()}`,
      projectId,
      projectTitle,
      projectDescription,
      projectSkills,
      jobId,
      jobTitle,
      jobRequirements,
      jobSkills,
      overallRelevance,
      skillMatchScore,
      domainMatchScore,
      recencyScore,
      matchedSkills,
      partialMatchSkills: [],
      missingSkills: jobSkills.filter((js: string) =>
        !projectSkills.some((ps: string) => ps.toLowerCase() === js.toLowerCase())
      ),
      bonusSkills: projectSkills.filter((ps: string) =>
        !jobSkills.some((js: string) => js.toLowerCase() === ps.toLowerCase())
      ),
      projectComplexity: 'MEDIUM',
      projectImpact: 'Team',
      calculatedAt: new Date().toISOString(),
    };

    res.json(relevance);
  } catch (error) {
    console.error('Error calculating project relevance:', error);
    res.status(500).json({ error: 'Failed to calculate project relevance' });
  }
};

// Batch calculate project relevance for candidate
export const batchCalculateProjectRelevance = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const { projects, jobId, jobSkills } = req.body;

    const results = projects.map((project: any, index: number) => {
      const matchedSkills = project.skills.filter((ps: string) =>
        jobSkills.some((js: string) => js.toLowerCase() === ps.toLowerCase())
      );
      const skillScore = matchedSkills.length / Math.max(jobSkills.length, 1) * 100;

      return {
        projectId: project.id,
        projectTitle: project.title,
        overallRelevance: 50 + skillScore * 0.5,
        skillMatchScore: skillScore,
        matchedSkills,
        rank: index + 1,
      };
    }).sort((a: any, b: any) => b.overallRelevance - a.overallRelevance)
      .map((r: any, i: number) => ({ ...r, rank: i + 1 }));

    res.json({
      candidateId,
      jobId,
      projectRelevanceScores: results,
      mostRelevantProject: results[0],
      averageRelevance: results.reduce((sum: number, r: any) => sum + r.overallRelevance, 0) / results.length,
    });
  } catch (error) {
    console.error('Error batch calculating project relevance:', error);
    res.status(500).json({ error: 'Failed to batch calculate project relevance' });
  }
};

// ============================================
// 5.1.6 - INDUSTRY CROSSOVER INTELLIGENCE
// ============================================

// Create industry crossover mapping
export const createIndustryCrossover = async (req: Request, res: Response) => {
  try {
    const {
      sourceIndustry,
      targetIndustry,
      crossoverScore,
      crossoverDifficulty,
      commonRoles,
      transferableSkills,
      bridgingSkills,
      successFactors,
      commonChallenges,
    } = req.body;

    const crossover = {
      id: `ic-${Date.now()}`,
      sourceIndustry,
      targetIndustry,
      crossoverScore: crossoverScore || 0.6,
      crossoverDifficulty: crossoverDifficulty || 'MODERATE',
      roleCompatibility: null,
      commonRoles: commonRoles || [],
      transferableSkills: transferableSkills || [],
      industrySpecificSkills: null,
      bridgingSkills: bridgingSkills || [],
      successFactors: successFactors || [],
      commonChallenges: commonChallenges || [],
      typicalTransitionPath: null,
      averageTransitionTime: null,
      transitionExamples: 0,
      successRate: null,
      calculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(crossover);
  } catch (error) {
    console.error('Error creating industry crossover:', error);
    res.status(500).json({ error: 'Failed to create industry crossover' });
  }
};

// Get industry crossover mapping
export const getIndustryCrossover = async (req: Request, res: Response) => {
  try {
    const { sourceIndustry, targetIndustry } = req.params;

    // Mock data
    const crossover = {
      id: 'ic-1',
      sourceIndustry,
      targetIndustry,
      crossoverScore: 0.75,
      crossoverDifficulty: 'MODERATE',
      commonRoles: ['Software Engineer', 'Data Analyst', 'Project Manager'],
      transferableSkills: ['Python', 'SQL', 'Data Analysis', 'Agile'],
      bridgingSkills: ['Domain Knowledge', 'Regulatory Compliance'],
      successFactors: [
        'Strong analytical skills',
        'Adaptability',
        'Willingness to learn domain',
      ],
      commonChallenges: [
        'Industry-specific terminology',
        'Regulatory requirements',
        'Different pace of work',
      ],
      averageTransitionTime: 6,
      successRate: 0.72,
    };

    res.json(crossover);
  } catch (error) {
    console.error('Error fetching industry crossover:', error);
    res.status(500).json({ error: 'Failed to fetch industry crossover' });
  }
};

// Get all industry crossovers for a source industry
export const getIndustryCrossovers = async (req: Request, res: Response) => {
  try {
    const { industry } = req.params;

    // Mock data
    const crossovers = [
      {
        id: 'ic-1',
        sourceIndustry: industry,
        targetIndustry: 'Finance',
        crossoverScore: 0.75,
        crossoverDifficulty: 'MODERATE',
      },
      {
        id: 'ic-2',
        sourceIndustry: industry,
        targetIndustry: 'Healthcare',
        crossoverScore: 0.65,
        crossoverDifficulty: 'DIFFICULT',
      },
      {
        id: 'ic-3',
        sourceIndustry: industry,
        targetIndustry: 'E-commerce',
        crossoverScore: 0.85,
        crossoverDifficulty: 'EASY',
      },
    ];

    res.json(crossovers);
  } catch (error) {
    console.error('Error fetching industry crossovers:', error);
    res.status(500).json({ error: 'Failed to fetch industry crossovers' });
  }
};

// Analyze candidate industry crossover potential
export const analyzeIndustryCrossoverPotential = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const { currentIndustry, targetIndustry, candidateSkills } = req.body;

    // Mock analysis
    const crossoverAnalysis = {
      candidateId,
      currentIndustry,
      targetIndustry,
      crossoverScore: 0.72,
      readiness: 'MODERATE',
      transferableSkillsPresent: candidateSkills.slice(0, 5),
      skillsToAcquire: ['Domain Knowledge', 'Industry Regulations'],
      estimatedTransitionTime: 4, // months
      recommendations: [
        'Complete industry certification',
        'Network with professionals in target industry',
        'Highlight transferable project experience',
      ],
      similarSuccessfulTransitions: 15,
      confidenceScore: 0.78,
    };

    res.json(crossoverAnalysis);
  } catch (error) {
    console.error('Error analyzing industry crossover potential:', error);
    res.status(500).json({ error: 'Failed to analyze industry crossover potential' });
  }
};

// ============================================
// 5.1.7 - HIDDEN TALENT DISCOVERY
// ============================================

// Discover hidden talent for a job
export const discoverHiddenTalent = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { companyId, jobTitle, jobSkills, limit = 20 } = req.body;

    // Mock hidden talent discovery
    const hiddenTalent = [
      {
        id: `ht-${Date.now()}-1`,
        candidateId: 'cand-1',
        candidateName: 'Career Pivoter',
        discoveredForJobId: jobId,
        discoveredForRole: jobTitle,
        hiddenReasons: ['Non-traditional background', 'Different industry'],
        unconventionalPath: true,
        careerPivot: true,
        industryOutsider: true,
        potentialScore: 78,
        traditionalMatchScore: 45,
        semanticMatchScore: 78,
        scoreLift: 33,
        transferableSkills: ['Problem Solving', 'Data Analysis', 'Leadership'],
        status: 'DISCOVERED',
      },
      {
        id: `ht-${Date.now()}-2`,
        candidateId: 'cand-2',
        candidateName: 'Adjacent Skills Expert',
        discoveredForJobId: jobId,
        discoveredForRole: jobTitle,
        hiddenReasons: ['Adjacent skill set', 'Keyword mismatch'],
        unconventionalPath: false,
        careerPivot: false,
        industryOutsider: false,
        potentialScore: 82,
        traditionalMatchScore: 52,
        semanticMatchScore: 82,
        scoreLift: 30,
        transferableSkills: ['Related Technical Skills', 'Domain Expertise'],
        status: 'DISCOVERED',
      },
    ].slice(0, Number(limit));

    res.json({
      jobId,
      jobTitle,
      hiddenTalentFound: hiddenTalent.length,
      candidates: hiddenTalent,
      averageScoreLift: hiddenTalent.reduce((sum, h) => sum + h.scoreLift, 0) / hiddenTalent.length,
      discoveredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error discovering hidden talent:', error);
    res.status(500).json({ error: 'Failed to discover hidden talent' });
  }
};

// Get hidden talent profiles
export const getHiddenTalentProfiles = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { jobId, status, minScore } = req.query;

    // Mock data
    const profiles = [
      {
        id: 'ht-1',
        candidateId: 'cand-1',
        discoveredForJobId: jobId as string || 'job-1',
        discoveredForRole: 'Software Engineer',
        potentialScore: 78,
        semanticMatchScore: 78,
        scoreLift: 33,
        status: 'DISCOVERED',
        discoveredAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'ht-2',
        candidateId: 'cand-2',
        discoveredForJobId: jobId as string || 'job-1',
        discoveredForRole: 'Software Engineer',
        potentialScore: 82,
        semanticMatchScore: 82,
        scoreLift: 30,
        status: 'REVIEWED',
        reviewedAt: new Date().toISOString(),
        discoveredAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ].filter(p => {
      if (status && p.status !== status) return false;
      if (minScore && p.potentialScore < Number(minScore)) return false;
      return true;
    });

    res.json(profiles);
  } catch (error) {
    console.error('Error fetching hidden talent profiles:', error);
    res.status(500).json({ error: 'Failed to fetch hidden talent profiles' });
  }
};

// Update hidden talent profile status
export const updateHiddenTalentStatus = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const { status, reviewNotes, outcomeNotes } = req.body;
    const reviewedBy = (req as any).user?.id;

    const updatedProfile = {
      id: profileId,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      reviewNotes,
      outcomeNotes,
      updatedAt: new Date().toISOString(),
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating hidden talent status:', error);
    res.status(500).json({ error: 'Failed to update hidden talent status' });
  }
};

// ============================================
// CANDIDATE MATCH SCORING
// ============================================

// Calculate candidate match score
export const calculateCandidateMatchScore = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.params;
    const { companyId, candidateData, jobData, config } = req.body;

    // Mock comprehensive matching
    const skillScore = 70 + Math.random() * 30;
    const experienceScore = 60 + Math.random() * 40;
    const projectScore = 50 + Math.random() * 50;
    const cultureFitScore = 65 + Math.random() * 35;

    const weights = config || {
      skillWeight: 0.35,
      experienceWeight: 0.25,
      projectWeight: 0.15,
      cultureFitWeight: 0.10,
    };

    const semanticScore = skillScore * weights.skillWeight +
                          experienceScore * weights.experienceWeight +
                          projectScore * weights.projectWeight +
                          cultureFitScore * weights.cultureFitWeight;

    const overallMatchScore = semanticScore * 1.15; // Semantic boost

    const matchScore = {
      id: `cms-${Date.now()}`,
      companyId,
      candidateId,
      jobId,
      overallMatchScore: Math.min(100, overallMatchScore),
      semanticScore,
      keywordScore: semanticScore * 0.85, // Keyword would be lower
      experienceScore,
      skillScore,
      projectScore,
      cultureFitScore,
      scoreBreakdown: {
        skills: { score: skillScore, weight: weights.skillWeight },
        experience: { score: experienceScore, weight: weights.experienceWeight },
        projects: { score: projectScore, weight: weights.projectWeight },
        cultureFit: { score: cultureFitScore, weight: weights.cultureFitWeight },
      },
      matchedSkills: ['JavaScript', 'React', 'Node.js'],
      partialMatchSkills: [{ skill: 'TypeScript', similarity: 0.85 }],
      missingSkills: ['Go', 'Kubernetes'],
      experienceLevelFit: 'MATCH',
      seniorityFit: 0.85,
      isHiddenTalent: Math.random() > 0.8,
      hiddenTalentBoost: 5,
      recommendation: overallMatchScore >= 80 ? 'STRONG_YES' : overallMatchScore >= 65 ? 'YES' : overallMatchScore >= 50 ? 'MAYBE' : 'NO',
      recommendationReason: 'Strong skill match with relevant project experience',
      matchingVersion: '1.0',
      calculatedAt: new Date().toISOString(),
    };

    res.json(matchScore);
  } catch (error) {
    console.error('Error calculating match score:', error);
    res.status(500).json({ error: 'Failed to calculate match score' });
  }
};

// Get candidate match scores for a job
export const getCandidateMatchScores = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { minScore, recommendation, limit = 50 } = req.query;

    // Mock data
    const scores = [
      {
        id: 'cms-1',
        candidateId: 'cand-1',
        jobId,
        overallMatchScore: 92,
        recommendation: 'STRONG_YES',
        matchedSkillsCount: 8,
        missingSkillsCount: 1,
        isHiddenTalent: false,
        calculatedAt: new Date().toISOString(),
      },
      {
        id: 'cms-2',
        candidateId: 'cand-2',
        jobId,
        overallMatchScore: 85,
        recommendation: 'YES',
        matchedSkillsCount: 7,
        missingSkillsCount: 2,
        isHiddenTalent: false,
        calculatedAt: new Date().toISOString(),
      },
      {
        id: 'cms-3',
        candidateId: 'cand-3',
        jobId,
        overallMatchScore: 78,
        recommendation: 'YES',
        matchedSkillsCount: 5,
        missingSkillsCount: 3,
        isHiddenTalent: true,
        calculatedAt: new Date().toISOString(),
      },
    ].filter(s => {
      if (minScore && s.overallMatchScore < Number(minScore)) return false;
      if (recommendation && s.recommendation !== recommendation) return false;
      return true;
    }).slice(0, Number(limit));

    res.json({
      jobId,
      totalCandidates: scores.length,
      scores,
      averageScore: scores.reduce((sum, s) => sum + s.overallMatchScore, 0) / scores.length,
      hiddenTalentCount: scores.filter(s => s.isHiddenTalent).length,
    });
  } catch (error) {
    console.error('Error fetching match scores:', error);
    res.status(500).json({ error: 'Failed to fetch match scores' });
  }
};

// ============================================
// MATCHING CONFIGURATION
// ============================================

// Create or update matching configuration
export const upsertMatchingConfig = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const {
      jobId,
      skillWeight,
      experienceWeight,
      projectWeight,
      educationWeight,
      cultureFitWeight,
      minimumMatchScore,
      hiddenTalentThreshold,
      autoAdvanceThreshold,
      autoRejectThreshold,
      enableSemanticMatching,
      enableHiddenTalent,
      enableIndustryCrossover,
      enableSkillTransfer,
      mustHaveSkills,
      niceToHaveSkills,
      dealBreakerMissing,
    } = req.body;

    const config = {
      id: `mc-${Date.now()}`,
      companyId,
      jobId: jobId || null,
      skillWeight: skillWeight ?? 0.35,
      experienceWeight: experienceWeight ?? 0.25,
      projectWeight: projectWeight ?? 0.15,
      educationWeight: educationWeight ?? 0.10,
      cultureFitWeight: cultureFitWeight ?? 0.10,
      bonusWeight: 0.05,
      minimumMatchScore: minimumMatchScore ?? 50,
      hiddenTalentThreshold: hiddenTalentThreshold ?? 60,
      autoAdvanceThreshold: autoAdvanceThreshold ?? 80,
      autoRejectThreshold: autoRejectThreshold ?? 30,
      enableSemanticMatching: enableSemanticMatching ?? true,
      enableHiddenTalent: enableHiddenTalent ?? true,
      enableIndustryCrossover: enableIndustryCrossover ?? true,
      enableSkillTransfer: enableSkillTransfer ?? true,
      blindScreeningEnabled: false,
      diversityBoostEnabled: false,
      diversityBoostAmount: 0,
      mustHaveSkills: mustHaveSkills || [],
      niceToHaveSkills: niceToHaveSkills || [],
      dealBreakerMissing: dealBreakerMissing || [],
      customRules: null,
      isActive: true,
      createdById: (req as any).user?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.json(config);
  } catch (error) {
    console.error('Error upserting matching config:', error);
    res.status(500).json({ error: 'Failed to upsert matching config' });
  }
};

// Get matching configuration
export const getMatchingConfig = async (req: Request, res: Response) => {
  try {
    const { companyId, jobId } = req.params;

    // Mock config
    const config = {
      id: 'mc-1',
      companyId,
      jobId: jobId || null,
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
      mustHaveSkills: ['JavaScript', 'React'],
      niceToHaveSkills: ['TypeScript', 'Node.js'],
      dealBreakerMissing: [],
      isActive: true,
    };

    res.json(config);
  } catch (error) {
    console.error('Error fetching matching config:', error);
    res.status(500).json({ error: 'Failed to fetch matching config' });
  }
};

// Get semantic matching stats
export const getSemanticMatchingStats = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const stats = {
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
        averageMatchTime: 120, // ms
        semanticBoostAverage: 12.5, // points
        hiddenTalentBoostAverage: 8.2, // points
      },
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching semantic matching stats:', error);
    res.status(500).json({ error: 'Failed to fetch semantic matching stats' });
  }
};
