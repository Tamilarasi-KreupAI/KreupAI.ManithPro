# AI-04 â€” Embeddings & Semantic Matching: Endpoint Audit (Module 15)

Workstream: WS2 (Embeddings & Semantic Matching)
Scope: `backend/src/controllers/batch21SemanticMatching.controller.ts` (1,313 lines) and `backend/src/routes/batch21SemanticMatching.routes.ts` (335 lines)
Controller mounted at: `app.use('/api/matching', batch21SemanticMatchingRoutes)` â€” `backend/src/index.ts` line 190 (registered in the API index map as `batch21SemanticMatching: '/api/matching'`, line 129).

## 1. Verification summary (reproduce with grep)

All counts below were produced against the current controller file and can be reproduced:

```
Select-String -Path backend/src/controllers/batch21SemanticMatching.controller.ts -Pattern '^export const'
Select-String -Path backend/src/controllers/batch21SemanticMatching.controller.ts -Pattern 'Math.random'
Select-String -Path backend/src/controllers/batch21SemanticMatching.controller.ts -Pattern 'prisma'
```

| Check | Count | Detail |
|---|---|---|
| `export const` handlers | **30** | section 2 lists all 30 with exact line numbers |
| Route registrations (`router.get/post/put/patch/delete`) | **34** | 30 handlers; 4 are mounted on two routes each (see section 3) |
| `Math.random` occurrences | **17** | on 15 lines: 24, 107, 108, 484, 485, 486, 633 (Ã—2), 635 (Ã—2), 677, 678, 1044, 1045, 1046, 1047, 1086 |
| `prisma` / `Prisma` references | **0** | no database layer is wired into this controller; every endpoint returns in-memory mock data |
| Mock embedding implementation | controller **line 24** | `const mockEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);` |
| Model-name label | controller **line 33** | `embeddingModel: 'text-embedding-3-small',` (the only `text-embedding` occurrence in the file) |

## 2. All 30 exported endpoints â€” current behaviour

Base path: `/api/matching`. Route line numbers refer to `backend/src/routes/batch21SemanticMatching.routes.ts`; controller line numbers to the controller file. All endpoints wrap their body in a `try/catch` that logs via `console.error` and returns `{ error: ... }` with status 500 on failure. None of them touch a database.

### 2.1 Skill Embeddings (spec 5.1.1)

| # | Handler | Ctrl line | Route (route line) | Current behaviour |
|---|---|---|---|---|
| 1 | `createSkillEmbedding` | 12 | `POST /skills/embeddings` (52); `POST /companies/:companyId/skills/embeddings` (60) | Builds an embedding object from body (`skillName`, `skillCategory`, `skillType`, `synonyms`, `alternateNames`). The vector is the **mock embedding of line 24**: a random 1536-dim `Math.random()` array, labelled `text-embedding-3-small` (line 33) / version `1.0`. Returns 201 with the object; persists nothing. |
| 2 | `getSkillEmbeddings` | 53 | `GET /skills/embeddings` (68) | Accepts `category`, `type`, `search` query params but **ignores them all**; returns 3 hardcoded mock embeddings (JavaScript, Python, React â€” lines 58â€“92). |
| 3 | `calculateSkillSimilarity` | 102 | `POST /skills/similarity` (83) | Takes `skillAId/skillBId/skillAName/skillBName` from body. "Cosine" similarity is random: `0.75 + Math.random() * 0.25` (line 107), contextual = cosine Ã— `(0.9 + Math.random() * 0.1)` (line 108), combined = average. Classifies `SIMILAR` (>0.8) / `RELATED` (>0.6) / `DIFFERENT`; hardcoded `confidenceScore: 0.85`. No real vectors involved. |
| 4 | `findSimilarSkills` | 133 | `GET /skills/:skillId/similar` (90) | Honors `limit` (default 10) and `threshold` (default 0.7) query params; filters 5 hardcoded similar skills (TypeScript 0.92, Node.js 0.85, React 0.82, Vue.js 0.78, Angular 0.76 â€” lines 139â€“145) by threshold and slices to limit. |
| 5 | `batchEmbedSkills` | 160 | `POST /skills/embeddings/batch` (75) | Maps the input `skills` string array to `{ skillName, normalizedName, status: 'EMBEDDED', embeddingId: 'emb-batch-<ts>-<i>' }`. **Does not call the mock-embedding generator and produces no vectors at all.** |

### 2.2 Experience Level Inference (spec 5.1.2)

| # | Handler | Ctrl line | Route (line) | Current behaviour |
|---|---|---|---|---|
| 6 | `createExperienceLevelRule` | 187 | `POST /experience-levels/rules` (101) | Echoes a rule object built from body fields with defaults (`ruleType` â†’ `PATTERN`, `priority` â†’ 100); unused fields forced empty (`responsibilityKeywords: []`). No validation, no persistence, 201 response. |
| 7 | `getExperienceLevelRules` | 233 | `GET /experience-levels/rules` (109); `GET /companies/:companyId/experience-levels/rules` (116) | Ignores `companyId`; returns 4 hardcoded mock rules (Senior Title Pattern, Lead/Principal Pattern, Junior/Entry Pattern, Experience Duration â€” lines 238â€“280). |
| 8 | `inferCandidateExperienceLevel` | 290 | `POST /candidates/:candidateId/experience-level/infer` (123) | Mock inference: an if/else chain on `yearsExperience` only (lines 299â€“314: â‰¥10 SENIOR/7, â‰¥5 SENIOR/6, â‰¥3 MID/4, â‰¥1 JUNIOR/2, else ENTRY/1). **Does not consult the rules created by #6**; title patterns unused. Leadership level = `MID` if `roleCount > 3` else `JUNIOR`. Hardcoded `confidenceScore: 0.82`. |
| 9 | `getCandidateExperienceLevel` | 346 | `GET /candidates/:candidateId/experience-level` (130) | Returns one hardcoded `SENIOR` (numeric 6) level object with `leadershipLevel: 'MID'` (lines 351â€“362) regardless of candidate; `calculatedAt` is 24 h ago. |

### 2.3 Role Similarity Detection (spec 5.1.3)

| # | Handler | Ctrl line | Route (line) | Current behaviour |
|---|---|---|---|---|
| 10 | `createRoleMapping` | 376 | `POST /roles/mappings` (141) | Echoes a role-mapping object from body with normalized title, defaults (`equivalentTitles/seniorVariants/juniorVariants/typicalSkills` â†’ `[]`), `usageCount: 0`. No persistence, 201. |
| 11 | `getRoleMappings` | 421 | `GET /roles/mappings` (149) | Accepts `category/family/industry` query params but **ignores them**; returns 3 hardcoded mappings (Software Engineer, Product Manager, Data Scientist â€” lines 426â€“469). |
| 12 | `calculateRoleSimilarity` | 479 | `POST /roles/similarity` (156) | Random mock: `titleSimilarity = 0.7 + Math.random()*0.3` (484), `functionSimilarity = 0.6 + Math.random()*0.4` (485), `skillOverlap = 0.5 + Math.random()*0.5` (486); weighted combined score (0.3/0.4/0.3), `transferabilityScore = combined * 0.95`. Gap analysis is a literal `['Skill A', 'Skill B']`. |

### 2.4 Skill Transferability (spec 5.1.4)

| # | Handler | Ctrl line | Route (line) | Current behaviour |
|---|---|---|---|---|
| 14 | `createSkillTransferability` | 547 | `POST /skills/transferability` (174) | Echoes a transferability object from body with defaults (`transferabilityScore` â†’ 0.7, `learningCurve` â†’ `MODERATE`), `evidenceType: 'COMPUTED'`, hardcoded `confidenceScore: 0.75`. No persistence, 201. |
| 15 | `getSkillTransferability` | 591 | `GET /skills/:sourceSkillId/transferability/:targetSkillId` (182) | Ignores both path params for content; returns one hardcoded mapping (source shown as "JavaScript" â†’ target "TypeScript", score 0.85, EASY, 14 days â€” lines 596â€“608). |
| 16 | `analyzeTransferableSkills` | 618 | `POST /candidates/:candidateId/transferable-skills` (189) | For each `targetSkills` entry, finds a candidate skill whose name contains the first 3 chars of the target (case-insensitive, line 626). Direct match â†’ `transferabilityScore = 0.8 + Math.random()*0.2` and `estimatedDays = 7 + rand 0â€“13`; else `0.3 + Math.random()*0.3` and `30 + rand 0â€“29` (lines 633, 635). Aggregates `overallTransferability`, `readySkills`, `transferableSkills` (>0.6), `gapSkills`. |

### 2.5 Project Relevance Scoring (spec 5.1.5)

| # | Handler | Ctrl line | Route (line) | Current behaviour |
|---|---|---|---|---|
| 17 | `calculateProjectRelevance` | 658 | `POST /projects/relevance` (200) | Skill match is a real case-insensitive intersection of `projectSkills` Ã— `jobSkills` (lines 672â€“674) â†’ `skillMatchScore` (% of job skills covered). `domainMatchScore = 60 + Math.random()*40` (677), `recencyScore = 70 + Math.random()*30` (678); overall = 0.5/0.3/0.2-weighted. Derives `missingSkills` / `bonusSkills`; hardcodes `projectComplexity: 'MEDIUM'`, `projectImpact: 'Team'`, empty `partialMatchSkills`. |
| 18 | `batchCalculateProjectRelevance` | 716 | `POST /candidates/:candidateId/projects/relevance` (207) | Per project in body, computes the same skill-overlap `skillMatchScore` (deterministic) and `overallRelevance = 50 + skillScore * 0.5`; sorts descending and re-ranks; returns `mostRelevantProject` and `averageRelevance`. No random/semantic component. |

### 2.6 Industry Crossover Intelligence (spec 5.1.6)

| # | Handler | Ctrl line | Route (line) | Current behaviour |
|---|---|---|---|---|
| 19 | `createIndustryCrossover` | 756 | `POST /industries/crossover` (218) | Echoes a crossover object from body with defaults (`crossoverScore` â†’ 0.6, `crossoverDifficulty` â†’ `MODERATE`); many analytical fields forced `null`/`0`. No persistence, 201. |
| 20 | `getIndustryCrossover` | 799 | `GET /industries/:sourceIndustry/crossover/:targetIndustry` (226) | Ignores the two path industries for content; returns one hardcoded crossover (score 0.75, MODERATE, sample roles/skills/factors/challenges, `successRate: 0.72` â€” lines 804â€“825). |
| 21 | `getIndustryCrossovers` | 835 | `GET /industries/:industry/crossovers` (233) | Uses the path `industry` as `sourceIndustry` label only; returns 3 hardcoded crossovers (Finance 0.75/MODERATE, Healthcare 0.65/DIFFICULT, E-commerce 0.85/EASY â€” lines 840â€“862). |
| 22 | `analyzeIndustryCrossoverPotential` | 872 | `POST /candidates/:candidateId/industry-crossover` (240) | Fully hardcoded analysis: `crossoverScore: 0.72`, `readiness: 'MODERATE'`, first 5 candidate skills as `transferableSkillsPresent`, fixed `skillsToAcquire`, 4-month transition, 15 "similar successful transitions", `confidenceScore: 0.78` (lines 878â€“894). |

### 2.7 Hidden Talent Discovery (spec 5.1.7)

| # | Handler | Ctrl line | Route (line) | Current behaviour |
|---|---|---|---|---|
| 23 | `discoverHiddenTalent` | 908 | `POST /jobs/:jobId/hidden-talent/discover` (251) | Returns 2 hardcoded hidden-talent candidates ("Career Pivoter", "Adjacent Skills Expert") with fixed `potentialScore` 78/82, `traditionalMatchScore` 45/52 and `scoreLift` 33/30; honors `limit` (default 20) via `slice`; computes `averageScoreLift`. Labelled with comment "Mock hidden talent discovery" (line 913). |
| 24 | `getHiddenTalentProfiles` | 966 | `GET /companies/:companyId/hidden-talent` (259) | Ignores `companyId`; returns 2 hardcoded profiles and filters by `status` and `minScore` query params (lines 996â€“1000). |
| 25 | `updateHiddenTalentStatus` | 1010 | `PATCH /hidden-talent/:profileId/status` (267) | Echoes `{ id: profileId, status, reviewedAt, reviewedBy: (req as any).user?.id, reviewNotes, outcomeNotes }`. No persistence; any status string is accepted. |

### 2.8 Candidate Match Scoring

| # | Handler | Ctrl line | Route (line) | Current behaviour |
|---|---|---|---|---|
| 26 | `calculateCandidateMatchScore` | 1038 | `POST /candidates/:candidateId/jobs/:jobId/match-score` (279) | All component scores random: skill `70 + rand*30` (1044), experience `60 + rand*40` (1045), project `50 + rand*50` (1046), cultureFit `65 + rand*35` (1047). Weighted via config from body or defaults (0.35/0.25/0.15/0.10); `semanticScore` Ã— 1.15 "semantic boost" (line 1061), capped at 100. `keywordScore = semanticScore * 0.85`. Matched/partial/missing skills are literal mock values (1081â€“1083). `isHiddenTalent: Math.random() > 0.8` (line 1086). Recommendation thresholds 80/65/50. |
| 27 | `getCandidateMatchScores` | 1102 | `GET /jobs/:jobId/match-scores` (286) | Ignores the actual job; returns 3 hardcoded score rows (92/85/78) filtered by `minScore` and `recommendation` query params and sliced by `limit` (default 50); returns `totalCandidates`, `averageScore`, `hiddenTalentCount`. |

### 2.9 Matching Configuration


## 3. Route mounting notes (why 34 routes for 30 handlers)

Four handlers are registered on two routes each:

| Handler | Routes |
|---|---|
| `createSkillEmbedding` | `POST /skills/embeddings` and `POST /companies/:companyId/skills/embeddings` |
| `getExperienceLevelRules` | `GET /experience-levels/rules` and `GET /companies/:companyId/experience-levels/rules` |
| `getMatchingConfig` | `GET /companies/:companyId/matching-config` and `GET /companies/:companyId/jobs/:jobId/matching-config` |
| `getSemanticMatchingStats` | `GET /companies/:companyId/matching-stats` and `GET /matching-stats` (ADMIN-only variant) |

30 unique handlers + 4 second mounts = **34 route registrations**. In every dual-mounted case the handler ignores the company/job scoping parameter, so both routes behave identically.

## 4. Module 15 capability mapping (ManithPro.md, `## Module 15 — Semantic Matching Engine`, lines 401–417)

ManithPro.md lists 10 capabilities for Module 15. All 10 map to controller sections; none is entirely missing, but every mapping is currently a mock implementation (see section 5).

| # | Module 15 capability | ManithPro.md description | Controller section (spec ref) | Endpoints (ctrl lines) | Status |
|---|---|---|---|---|---|
| 1 | **Skill Embeddings** | "Vector representations of skills; batch embedding; company-scoped embeddings" | 5.1.1 | `createSkillEmbedding` (12), `getSkillEmbeddings` (53), `batchEmbedSkills` (160) | **Mock implemented** — vectors are `Math.random()` (line 24); batch endpoint produces no vectors; company scoping accepted on the route but unused |
| 2 | **Skill Similarity** | "Compute similarity between any two skills; find similar skills" | 5.1.1 | `calculateSkillSimilarity` (102), `findSimilarSkills` (133) | **Mock implemented** — similarity values random (lines 107–108) or a hardcoded list |
| 3 | **Experience Level Inference** | "Rule-driven inference of a candidate's true seniority (with company-specific rules)" | 5.1.2 | `createExperienceLevelRule` (187), `getExperienceLevelRules` (233), `inferCandidateExperienceLevel` (290), `getCandidateExperienceLevel` (346) | **Mock implemented** — rule CRUD is echo-only; inference ignores the rules and uses a years-only if/else chain (299–314) |

## 5. Endpoints blocked on real embeddings — and why

The blocker is a single implementation point: **line 24** generates the vector as `Array.from({ length: 1536 }, () => Math.random() * 2 - 1)` — there is no embedding-model call at all, yet the response labels the vector as model `text-embedding-3-small` (line 33). No other endpoint can be correct until real vectors exist, because none computes over stored vectors (there is no vector store — Prisma references in this controller: 0).

| Endpoint (ctrl line) | Why blocked on real embeddings |
|---|---|
| `createSkillEmbedding` (12) | Stores a random vector while claiming the `text-embedding-3-small` model; needs a real embedding API call plus vector persistence |
| `calculateSkillSimilarity` (102) | Supposed to compute cosine similarity "of vectors" (comment, line 106); returns `0.75 + Math.random()*0.25` (line 107) because no vectors exist to compare |
| `batchEmbedSkills` (160) | Reports `status: 'EMBEDDED'` without generating any vector — needs the real embedding pipeline |
| `findSimilarSkills` (133) | Similarity ranking is a hardcoded list; real neighbourhood search requires stored vectors |
| `analyzeTransferableSkills` (618) | Falls back to 3-char substring matching (line 626) with random scores (633, 635); semantic transfer scoring needs embeddings |
| `calculateRoleSimilarity` (479) | Title/function/skill similarities are all random (484–486); semantic role comparison needs embeddings |
| `calculateProjectRelevance` (658) | `domainMatchScore`/`recencyScore` random (677–678); genuine project↔job semantic relevance needs embeddings |
| `calculateCandidateMatchScore` (1038) | Every component score random (1044–1047); the weighted "semanticScore" (1056) and ×1.15 semantic boost (1061) are meaningless without real vectors |
| `discoverHiddenTalent` (908) | Semantic-vs-traditional score lift is hardcoded; true hidden-talent discovery is a semantic-search problem |
| `getHiddenTalentProfiles` (966) | Downstream of discovery; profiles are hardcoded until discovery is real |

Not strictly embedding-blocked (deterministic mocks, blocked instead on database wiring — Prisma count 0): `createExperienceLevelRule`, `getExperienceLevelRules`, `inferCandidateExperienceLevel`, `getCandidateExperienceLevel`, `createRoleMapping`, `getRoleMappings`, `findSimilarRoles`, `createSkillTransferability`, `getSkillTransferability`, `batchCalculateProjectRelevance`, `createIndustryCrossover`, `getIndustryCrossover`, `getIndustryCrossovers`, `analyzeIndustryCrossoverPotential`, `updateHiddenTalentStatus`, `getCandidateMatchScores`, `upsertMatchingConfig`, `getMatchingConfig`, `getSemanticMatchingStats`.

## 6. Reviewer verification checklist

1. **30 exported handlers:** `Select-String -Pattern '^export const'` on the controller → 30 matches, names and line numbers as in section 2.
2. **34 routes:** count `router.(get|post|put|patch|delete)` in the routes file → 34.
3. **Math.random = 17 occurrences / 15 lines** (24, 107, 108, 484, 485, 486, 633×2, 635×2, 677, 678, 1044–1047, 1086).
4. **Prisma = 0** (case-insensitive `prisma` in the controller: no matches).
5. **Mock embedding:** controller line 24. **Model label:** controller line 33 (`'text-embedding-3-small'`), the only occurrence of the string `text-embedding` in the controller.
6. **Module 15 mapping:** 10/10 capabilities mapped in section 4; none marked "Not Implemented" as an entire capability, with per-capability mock caveats recorded.

*Generated for task AI-04. Source of truth: `batch21SemanticMatching.controller.ts` @ commit `3e37c4a` (branch `development`).*

| 4 | **Role Similarity Detection** | "Maps equivalent roles across different titles and companies" | 5.1.3 | `createRoleMapping` (376), `getRoleMappings` (421), `calculateRoleSimilarity` (479), `findSimilarRoles` (517) | **Mock implemented** — similarity random (484–486); role-mapping storage is echo-only |
| 5 | **Skill Transferability** | "Identifies which of a candidate's skills transfer to a target role" | 5.1.4 | `createSkillTransferability` (547), `getSkillTransferability` (591), `analyzeTransferableSkills` (618) | **Mock implemented** — prefix substring matching (line 626) with random scores (633, 635) |
| 6 | **Project Relevance Scoring** | "Scores each portfolio project against a specific job" | 5.1.5 | `calculateProjectRelevance` (658), `batchCalculateProjectRelevance` (716) | **Partially real** — skill-overlap scoring is genuine case-insensitive matching (672–674); domain/recency components random (677–678); no vectors |
| 7 | **Industry Crossover Intelligence** | "Finds candidates whose industry background transfers" | 5.1.6 | `createIndustryCrossover` (756), `getIndustryCrossover` (799), `getIndustryCrossovers` (835), `analyzeIndustryCrossoverPotential` (872) | **Mock implemented** — all responses hardcoded (no `Math.random`, but no computation either) |
| 8 | **Hidden Talent Discovery** | "Surfaces strong candidates keyword search would never return" | 5.1.7 | `discoverHiddenTalent` (908), `getHiddenTalentProfiles` (966), `updateHiddenTalentStatus` (1010) | **Mock implemented** — two hardcoded candidate archetypes; status update is echo-only |
| 9 | **Candidate Match Scoring** | "Composite match score per candidate/job pair" | controller section "CANDIDATE MATCH SCORING" | `calculateCandidateMatchScore` (1038), `getCandidateMatchScores` (1102) | **Mock implemented** — all four component scores random (1044–1047), hidden-talent flag random (1086), fixed 1.15 semantic boost (1061) |
| 10 | **Matching Configuration** | "Global, company and job-level tuning of matching behaviour" | controller section "MATCHING CONFIGURATION" | `upsertMatchingConfig` (1166), `getMatchingConfig` (1228), `getSemanticMatchingStats` (1265) | **Mock implemented** — config echo-only, stats hardcoded; no config is ever consumed by other endpoints |

**Capabilities marked "Not Implemented": none** — all 10 Module 15 capabilities have at least one endpoint. Caveat recorded per capability in the Status column: company/job scoping accepted but ignored, nothing persists, and no capability performs genuine semantic computation (sections 5–6).

