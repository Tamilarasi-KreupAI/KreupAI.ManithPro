import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // Skill Embeddings (5.1.1)
  createSkillEmbedding,
  getSkillEmbeddings,
  calculateSkillSimilarity,
  findSimilarSkills,
  batchEmbedSkills,
  // Experience Level Inference (5.1.2)
  createExperienceLevelRule,
  getExperienceLevelRules,
  inferCandidateExperienceLevel,
  getCandidateExperienceLevel,
  // Role Similarity (5.1.3)
  createRoleMapping,
  getRoleMappings,
  calculateRoleSimilarity,
  findSimilarRoles,
  // Skill Transferability (5.1.4)
  createSkillTransferability,
  getSkillTransferability,
  analyzeTransferableSkills,
  // Project Relevance (5.1.5)
  calculateProjectRelevance,
  batchCalculateProjectRelevance,
  // Industry Crossover (5.1.6)
  createIndustryCrossover,
  getIndustryCrossover,
  getIndustryCrossovers,
  analyzeIndustryCrossoverPotential,
  // Hidden Talent (5.1.7)
  discoverHiddenTalent,
  getHiddenTalentProfiles,
  updateHiddenTalentStatus,
  // Match Scoring
  calculateCandidateMatchScore,
  getCandidateMatchScores,
  // Matching Config
  upsertMatchingConfig,
  getMatchingConfig,
  getSemanticMatchingStats,
} from '../controllers/batch21SemanticMatching.controller';

const router = Router();

// ============================================
// 5.1.1 - SKILL EMBEDDINGS
// ============================================

// Create skill embedding
router.post(
  '/skills/embeddings',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createSkillEmbedding
);

// Create skill embedding for company
router.post(
  '/companies/:companyId/skills/embeddings',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createSkillEmbedding
);

// Get all skill embeddings
router.get(
  '/skills/embeddings',
  authenticate,
  getSkillEmbeddings
);

// Batch embed skills
router.post(
  '/skills/embeddings/batch',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  batchEmbedSkills
);

// Calculate skill similarity
router.post(
  '/skills/similarity',
  authenticate,
  calculateSkillSimilarity
);

// Find similar skills
router.get(
  '/skills/:skillId/similar',
  authenticate,
  findSimilarSkills
);

// ============================================
// 5.1.2 - EXPERIENCE LEVEL INFERENCE
// ============================================

// Create experience level rule
router.post(
  '/experience-levels/rules',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createExperienceLevelRule
);

// Get experience level rules
router.get(
  '/experience-levels/rules',
  authenticate,
  getExperienceLevelRules
);

// Get company-specific rules
router.get(
  '/companies/:companyId/experience-levels/rules',
  authenticate,
  getExperienceLevelRules
);

// Infer candidate experience level
router.post(
  '/candidates/:candidateId/experience-level/infer',
  authenticate,
  inferCandidateExperienceLevel
);

// Get candidate experience level
router.get(
  '/candidates/:candidateId/experience-level',
  authenticate,
  getCandidateExperienceLevel
);

// ============================================
// 5.1.3 - ROLE SIMILARITY DETECTION
// ============================================

// Create role mapping
router.post(
  '/roles/mappings',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createRoleMapping
);

// Get role mappings
router.get(
  '/roles/mappings',
  authenticate,
  getRoleMappings
);

// Calculate role similarity
router.post(
  '/roles/similarity',
  authenticate,
  calculateRoleSimilarity
);

// Find similar roles
router.get(
  '/roles/:roleId/similar',
  authenticate,
  findSimilarRoles
);

// ============================================
// 5.1.4 - SKILL TRANSFERABILITY
// ============================================

// Create skill transferability mapping
router.post(
  '/skills/transferability',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createSkillTransferability
);

// Get skill transferability
router.get(
  '/skills/:sourceSkillId/transferability/:targetSkillId',
  authenticate,
  getSkillTransferability
);

// Analyze candidate's transferable skills
router.post(
  '/candidates/:candidateId/transferable-skills',
  authenticate,
  analyzeTransferableSkills
);

// ============================================
// 5.1.5 - PROJECT RELEVANCE SCORING
// ============================================

// Calculate project relevance to job
router.post(
  '/projects/relevance',
  authenticate,
  calculateProjectRelevance
);

// Batch calculate project relevance for candidate
router.post(
  '/candidates/:candidateId/projects/relevance',
  authenticate,
  batchCalculateProjectRelevance
);

// ============================================
// 5.1.6 - INDUSTRY CROSSOVER INTELLIGENCE
// ============================================

// Create industry crossover mapping
router.post(
  '/industries/crossover',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  createIndustryCrossover
);

// Get industry crossover
router.get(
  '/industries/:sourceIndustry/crossover/:targetIndustry',
  authenticate,
  getIndustryCrossover
);

// Get all crossovers for an industry
router.get(
  '/industries/:industry/crossovers',
  authenticate,
  getIndustryCrossovers
);

// Analyze candidate industry crossover potential
router.post(
  '/candidates/:candidateId/industry-crossover',
  authenticate,
  analyzeIndustryCrossoverPotential
);

// ============================================
// 5.1.7 - HIDDEN TALENT DISCOVERY
// ============================================

// Discover hidden talent for job
router.post(
  '/jobs/:jobId/hidden-talent/discover',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  discoverHiddenTalent
);

// Get hidden talent profiles
router.get(
  '/companies/:companyId/hidden-talent',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  getHiddenTalentProfiles
);

// Update hidden talent profile status
router.patch(
  '/hidden-talent/:profileId/status',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  updateHiddenTalentStatus
);

// ============================================
// CANDIDATE MATCH SCORING
// ============================================

// Calculate candidate match score
router.post(
  '/candidates/:candidateId/jobs/:jobId/match-score',
  authenticate,
  calculateCandidateMatchScore
);

// Get candidate match scores for job
router.get(
  '/jobs/:jobId/match-scores',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  getCandidateMatchScores
);

// ============================================
// MATCHING CONFIGURATION
// ============================================

// Create/update matching configuration
router.put(
  '/companies/:companyId/matching-config',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  upsertMatchingConfig
);

// Get matching configuration
router.get(
  '/companies/:companyId/matching-config',
  authenticate,
  getMatchingConfig
);

// Get job-specific matching configuration
router.get(
  '/companies/:companyId/jobs/:jobId/matching-config',
  authenticate,
  getMatchingConfig
);

// Get semantic matching stats
router.get(
  '/companies/:companyId/matching-stats',
  authenticate,
  authorize('RECRUITER', 'ADMIN'),
  getSemanticMatchingStats
);

// Global matching stats (admin only)
router.get(
  '/matching-stats',
  authenticate,
  authorize('ADMIN'),
  getSemanticMatchingStats
);

export default router;
