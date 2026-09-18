# ManithPro AI Feature Inventory

**Audit Date:** 18 September 2026  
**Repository:** KreupAI.ManithPro  
**Branch:** development  
**Scope:** ManithPro.md Modules 5–17

## Executive Summary

The ManithPro documentation describes a broad set of AI capabilities across scoring, content generation, career assistance, NLP, screening interviews, interview analysis, knowledge management, semantic matching, predictive analytics, and recommendations.

The backend audit found **no confirmed live OpenAI, Anthropic, Claude, GPT, or embedding API invocation** in the audited implementation.

The global backend search for the following provider invocation patterns returned **0 matches**:

- `chat.completions`
- `messages.create`
- `embeddings.create`
- `new OpenAI`
- `new Anthropic`

References to model names such as `gpt-4-turbo-preview` and `text-embedding-3-small` are metadata/placeholders and are not evidence of model inference.

### Overall Result

| Bucket | Result |
|---|---|
| REAL | No confirmed model-backed feature |
| PARTIAL | No confirmed real-model result with invented decoration |
| FAKE | AI functionality currently uses fixed, deterministic, random, template, rule-based, or simulated values |

Prisma usage found throughout the controllers represents database reads/writes and persistence. Prisma calls alone do not constitute AI inference.

---

# Feature Inventory

## Module 5 — AI Scoring & Candidate Intelligence

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| AI Profile Score | Module 5 | `backend/src/controllers/batch8Scoring.controller.ts` | FAKE | `batch8Scoring.controller.ts:819-884`, `:860-861` uses mock engagement with `Math.random()`, `:931-981` persists calculated score |
| Job-Fit Score | Module 5 | `backend/src/controllers/batch8Scoring.controller.ts` | FAKE | `batch8Scoring.controller.ts:1028-1108` calculates deterministic matching components; `:1125-1169` persists result |
| Culture Fit Analysis | Module 5 | `backend/src/controllers/batch9AdvancedScoring.controller.ts` | FAKE | `batch9AdvancedScoring.controller.ts:13-99`, fixed `overallCultureScore: 78` |
| Growth Potential Score | Module 5 | `backend/src/controllers/batch9AdvancedScoring.controller.ts` | FAKE | `batch9AdvancedScoring.controller.ts:159-253`, fixed `overallGrowthScore: 82` |
| Technical Depth Score | Module 5 | `backend/src/controllers/batch9AdvancedScoring.controller.ts` | FAKE | `batch9AdvancedScoring.controller.ts:288-418`, fixed `overallTechnicalScore: 85` |
| Communication Score | Module 5 | `backend/src/controllers/batch9AdvancedScoring.controller.ts` | FAKE | `batch9AdvancedScoring.controller.ts:454-559`, fixed communication score |
| Reliability Score | Module 5 | `backend/src/controllers/batch9AdvancedScoring.controller.ts` | FAKE | `batch9AdvancedScoring.controller.ts:593-705`, fixed `overallReliabilityScore: 88` |
| Salary Expectation Alignment | Module 5 | `backend/src/controllers/batch10ExtendedScoring.controller.ts` | FAKE | `batch10ExtendedScoring.controller.ts:8-87`, hardcoded alignment score and salary values |
| Location Compatibility | Module 5 | `backend/src/controllers/batch10ExtendedScoring.controller.ts` | FAKE | `batch10ExtendedScoring.controller.ts:220-274`, hardcoded compatibility values |
| Diversity & Inclusion Metrics | Module 5 | `backend/src/controllers/batch10ExtendedScoring.controller.ts` | FAKE | `batch10ExtendedScoring.controller.ts:323-397`, hardcoded gender, age, accessibility and overall scores |
| Explainable AI Scores | Module 5 | `backend/src/controllers/batch10ExtendedScoring.controller.ts` | FAKE | `batch10ExtendedScoring.controller.ts:469-559`, fixed component scores and percentile data |
| Score Calibration Tools | Module 5 | `backend/src/controllers/batch10ExtendedScoring.controller.ts` | FAKE | `batch10ExtendedScoring.controller.ts:615-670`, `:748-816`, fixed calibration results |
| Comprehensive Scoring Dashboard | Module 5 | `backend/src/controllers/batch9AdvancedScoring.controller.ts` | FAKE | `batch9AdvancedScoring.controller.ts:735-858`, hardcoded dimension and market-percentile values |
| Market Salary Data | Module 5 | `backend/src/controllers/batch10ExtendedScoring.controller.ts` | FAKE | `batch10ExtendedScoring.controller.ts:120-170`, hardcoded salary and growth data |

---

## Module 6 — AI Content Generation

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| AI Job Description Generator | Module 6 | `backend/src/controllers/batch11AIContentGeneration.controller.ts` | FAKE | `batch11AIContentGeneration.controller.ts:36-65`, generated content is template-based; `:86-121` persists it |
| Job Title Optimizer | Module 6 | `backend/src/controllers/batch11AIContentGeneration.controller.ts` | FAKE | `batch11AIContentGeneration.controller.ts:219-245`, `:251-282` |
| Requirements Analyzer | Module 6 | `backend/src/controllers/batch11AIContentGeneration.controller.ts` | FAKE | `batch11AIContentGeneration.controller.ts:320-321`, fixed importance values; `:337` persists |
| Inclusive Language Checker | Module 6 | `backend/src/controllers/batch11AIContentGeneration.controller.ts` | FAKE | `batch11AIContentGeneration.controller.ts:418-445`, `:448-483` |
| Salary Range Suggester | Module 6 | `backend/src/controllers/batch11AIContentGeneration.controller.ts` | FAKE | `batch11AIContentGeneration.controller.ts:551-556`, random premium at `:623`; persistence at `:587` |
| Interview Questions Generator | Module 6 | `backend/src/controllers/batch11AIContentGeneration.controller.ts` | FAKE | `batch11AIContentGeneration.controller.ts:665-772`, persistence at `:774-816` |
| Screening Criteria Generator | Module 6 | `backend/src/controllers/batch12ExtendedAIContent.controller.ts` | FAKE | `batch12ExtendedAIContent.controller.ts:10-106`, fixed scoring values |
| Candidate Summary Generator | Module 6 | `backend/src/controllers/batch12ExtendedAIContent.controller.ts` | FAKE | `batch12ExtendedAIContent.controller.ts:151-180`, explicit simulated AI summary at `:165-166` |
| Rejection Email Generator | Module 6 | `backend/src/controllers/batch12ExtendedAIContent.controller.ts` | FAKE | `batch12ExtendedAIContent.controller.ts:275-342`, fixed/template output |
| Offer Letter Generator | Module 6 | `backend/src/controllers/batch12ExtendedAIContent.controller.ts` | FAKE | `batch12ExtendedAIContent.controller.ts:399-510` |
| Job Ad A/B Testing | Module 6 | `backend/src/controllers/batch12ExtendedAIContent.controller.ts` | FAKE | `batch12ExtendedAIContent.controller.ts:689-713` |
| Competitor Job Analysis | Module 6 | `backend/src/controllers/batch12ExtendedAIContent.controller.ts` | FAKE | `batch12ExtendedAIContent.controller.ts:740-828`, explicit simulation at `:740` |

---

## Module 7 — Candidate AI Career Assistant

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| AI Profile Enhancer | Module 7 | `backend/src/controllers/batch13CandidateAIContent.controller.ts` | FAKE | `batch13CandidateAIContent.controller.ts:15-22`, explicit simulated AI analysis; fixed scores at `:51-69` |
| Experience Description Generator | Module 7 | `backend/src/controllers/batch13CandidateAIContent.controller.ts` | FAKE | `batch13CandidateAIContent.controller.ts:151-200`, simulated AI content |
| Skills Gap Identifier | Module 7 | `backend/src/controllers/batch13CandidateAIContent.controller.ts` | FAKE | `batch13CandidateAIContent.controller.ts:244-291`, simulated output; random skill level at `:260` |
| Cover Letter Generator | Module 7 | `backend/src/controllers/batch13CandidateAIContent.controller.ts` | FAKE | `batch13CandidateAIContent.controller.ts:350-406`, template/fixed output |
| Interview Prep Coach | Module 7 | `backend/src/controllers/batch13CandidateAIContent.controller.ts` | FAKE | `batch13CandidateAIContent.controller.ts:467-563`, fixed structures |
| Salary Negotiation Advisor | Module 7 | `backend/src/controllers/batch13CandidateAIContent.controller.ts` | FAKE | `batch13CandidateAIContent.controller.ts:663`, market analysis is simulated |
| Career Path Advisor | Module 7 | `backend/src/controllers/batch14ExtendedAINLP.controller.ts` | FAKE | `batch14ExtendedAINLP.controller.ts:10-68` |
| Learning Recommendations | Module 7 | `backend/src/controllers/batch14ExtendedAINLP.controller.ts` | FAKE | `batch14ExtendedAINLP.controller.ts:186-327`, hardcoded recommendation at `:279` |
| Application Insights | Module 7 | `backend/src/controllers/batch14ExtendedAINLP.controller.ts` | FAKE | `batch14ExtendedAINLP.controller.ts:392-452`, fixed confidence |
| Portfolio Feedback | Module 7 | `backend/src/controllers/batch14ExtendedAINLP.controller.ts` | FAKE | `batch14ExtendedAINLP.controller.ts:550-631`, fixed scores |

---

## Module 8 — NLP & Document Understanding

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| Resume / Profile Parser | Module 8 | `backend/src/controllers/batch14ExtendedAINLP.controller.ts` | FAKE | `batch14ExtendedAINLP.controller.ts:699-797`, fixed parse confidence/completeness |
| Skill Extraction | Module 8 | `backend/src/controllers/batch14ExtendedAINLP.controller.ts` | FAKE | `batch14ExtendedAINLP.controller.ts:865-943`, hardcoded skills and confidence values |
| Semantic Search Index | Module 8 | `backend/src/controllers/batch14ExtendedAINLP.controller.ts` | FAKE | `batch14ExtendedAINLP.controller.ts:993-1036`, mock embedding generated with `Math.random()` at `:999` |
| Entity Recognition | Module 8 | `backend/src/controllers/batch14ExtendedAINLP.controller.ts` | FAKE | `batch14ExtendedAINLP.controller.ts:1101-1203`, hardcoded entities/confidences |

---

## Module 11 — AI Screening Interviews

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| AI-Conducted Screening Interviews | Module 11 | `backend/src/controllers/batch17AIScreening.controller.ts` | FAKE | `batch17AIScreening.controller.ts:640-651`, explicit `simulate AI scoring` and random AI score/sentiment/confidence |
| Screening Response AI Scoring | Module 11 | `backend/src/controllers/batch17AIScreening.controller.ts` | FAKE | `batch17AIScreening.controller.ts:640-651`, `aiScore` and `aiConfidenceLevel` use `Math.random()` |
| Follow-up Question Evaluation | Module 11 | `backend/src/controllers/batch17AIScreening.controller.ts` | FAKE | `batch17AIScreening.controller.ts:793-830`, rule-based answer evaluation rather than model inference |
| Chat-Based Screening | Module 11 | `backend/src/controllers/batch17AIScreening.controller.ts` | FAKE | `batch17AIScreening.controller.ts:1013-1021`, simplified/template AI chat response |

---

## Module 12 — Interview Analysis & Intelligence

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| Transcription | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:11-49`, simulated processing and stored transcript |
| Answer Analysis | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:127-191`, simulated/random analysis |
| Topic Detection | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:194-245`, explicit simulation at `:208` |
| Sentiment Analysis | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:272-315`, fixed sentiment and confidence |
| Communication Score | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:342-395`, random component scores at `:364` |
| Technical Verification | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:425-461`, simulated/random accuracy and confidence |
| Red Flag Alerts | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:486-534`, explicit simulation at `:491` |
| Summary Generation | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:592-665`, explicit simulated AI at `:611` |
| Highlight Extraction | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:741-795`, explicit simulation at `:745` |
| Comparative Analysis | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:882-928`, explicit simulation and random scores |
| Full Analysis | Module 12 | `backend/src/controllers/batch18InterviewAnalysis.controller.ts` | FAKE | `batch18InterviewAnalysis.controller.ts:1017-1097`, retrieves/stages existing data but invokes no model |

---

## Module 13 — AI Knowledge Base

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| Dynamic FAQ Answers | Module 13 | `backend/src/controllers/batch19AIKnowledgeBase.controller.ts` | FAKE | `batch19AIKnowledgeBase.controller.ts:902-1100`; semantic search is explicitly simulated at `:1003`, implementation uses Prisma `contains` at `:1012-1033` |
| Continuous Learning / AI Feedback Loop | Module 13 | `backend/src/controllers/batch19AIKnowledgeBase.controller.ts` | FAKE | `batch19AIKnowledgeBase.controller.ts:1117-1309`; feedback is stored and processed but no model retraining/inference is performed |

---

## Module 15 — Semantic Matching Engine

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| Skill Embeddings | Module 15 | `backend/src/controllers/batch21SemanticMatching.controller.ts` | FAKE | `batch21SemanticMatching.controller.ts:23-35`, mock embedding uses `Math.random()`; provider references are placeholders |
| Skill Similarity | Module 15 | `backend/src/controllers/batch21SemanticMatching.controller.ts` | FAKE | `batch21SemanticMatching.controller.ts:101-125`, random similarity |
| Experience Level Inference | Module 15 | `backend/src/controllers/batch21SemanticMatching.controller.ts` | FAKE | `batch21SemanticMatching.controller.ts:290-338`, explicit mock inference logic |
| Role Similarity Detection | Module 15 | `backend/src/controllers/batch21SemanticMatching.controller.ts` | FAKE | `batch21SemanticMatching.controller.ts:478-509`, explicit mock implementation/random scores |
| Skill Transferability | Module 15 | `backend/src/controllers/batch21SemanticMatching.controller.ts` | FAKE | `batch21SemanticMatching.controller.ts:618-645`, mock/random transferability |
| Project Relevance Scoring | Module 15 | `backend/src/controllers/batch21SemanticMatching.controller.ts` | FAKE | `batch21SemanticMatching.controller.ts:658-695`, random relevance components |
| Industry Crossover Intelligence | Module 15 | `backend/src/controllers/batch21SemanticMatching.controller.ts` | FAKE | `batch21SemanticMatching.controller.ts:872-893`, mock/fixed output |
| Hidden Talent Discovery | Module 15 | `backend/src/controllers/batch21SemanticMatching.controller.ts` | FAKE | `batch21SemanticMatching.controller.ts:908-956`, mock semantic scores |
| Candidate Match Scoring | Module 15 | `backend/src/controllers/batch21SemanticMatching.controller.ts` | FAKE | `batch21SemanticMatching.controller.ts:1037-1090`, explicit mock/random component scores |

---

## Module 16 — Predictive Analytics

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| Hiring Success Prediction | Module 16 | `backend/src/controllers/batch22PredictiveAnalytics.controller.ts` | FAKE | `batch22PredictiveAnalytics.controller.ts:11-38`, simulated prediction logic at `:16` |
| Time-to-Hire Forecast | Module 16 | `backend/src/controllers/batch22PredictiveAnalytics.controller.ts` | FAKE | `batch22PredictiveAnalytics.controller.ts:128-157` |
| Offer Acceptance Prediction | Module 16 | `backend/src/controllers/batch22PredictiveAnalytics.controller.ts` | FAKE | `batch22PredictiveAnalytics.controller.ts:231-269` |
| Retention Risk Score | Module 16 | `backend/src/controllers/batch22PredictiveAnalytics.controller.ts` | FAKE | `batch22PredictiveAnalytics.controller.ts:345-389` |
| Performance Prediction | Module 16 | `backend/src/controllers/batch22PredictiveAnalytics.controller.ts` | FAKE | `batch22PredictiveAnalytics.controller.ts:452-497` |
| Market Availability Analysis | Module 16 | `backend/src/controllers/batch22PredictiveAnalytics.controller.ts` | FAKE | `batch22PredictiveAnalytics.controller.ts:555-600` |
| Salary Trend Prediction | Module 16 | `backend/src/controllers/batch22PredictiveAnalytics.controller.ts` | FAKE | `batch22PredictiveAnalytics.controller.ts:672-738` |
| Pipeline Health Prediction | Module 16 | `backend/src/controllers/batch22PredictiveAnalytics.controller.ts` | FAKE | `batch22PredictiveAnalytics.controller.ts:800-862` |

---

## Module 17 — Smart Recommendations

| Feature | ManithPro.md module | Controller file | Bucket | Evidence |
|---|---|---|---|---|
| Job Recommendations | Module 17 | `backend/src/controllers/batch23SmartRecommendations.controller.ts` | FAKE | `batch23SmartRecommendations.controller.ts:11-42`, fixed/default recommendation score |
| Candidate Recommendations | Module 17 | `backend/src/controllers/batch23SmartRecommendations.controller.ts` | FAKE | `batch23SmartRecommendations.controller.ts:102-133`, default score 88 |
| Similar Candidates Finder | Module 17 | `backend/src/controllers/batch23SmartRecommendations.controller.ts` | FAKE | `batch23SmartRecommendations.controller.ts:191-242`, no model inference |
| Passive Candidate Identification | Module 17 | `backend/src/controllers/batch23SmartRecommendations.controller.ts` | FAKE | `batch23SmartRecommendations.controller.ts:267-305`, default passive score |
| Skill-Up Recommendations | Module 17 | `backend/src/controllers/batch23SmartRecommendations.controller.ts` | FAKE | `batch23SmartRecommendations.controller.ts:355-386`, supplied/default recommendation data |
| Re-Engagement Suggestions | Module 17 | `backend/src/controllers/batch23SmartRecommendations.controller.ts` | FAKE | `batch23SmartRecommendations.controller.ts:437-468`, fixed/default score |
| Interview Panel Recommendations | Module 17 | `backend/src/controllers/batch23SmartRecommendations.controller.ts` | FAKE | `batch23SmartRecommendations.controller.ts:521-552`, fixed/default score and availability |
| Sourcing Channel Recommendations | Module 17 | `backend/src/controllers/batch23SmartRecommendations.controller.ts` | FAKE | `batch23SmartRecommendations.controller.ts:602-638`, fixed/default score and confidence |

---

# Frontend Mock Configuration

The corresponding frontend AI services were also inspected for `USE_MOCK`.

| Service | USE_MOCK evidence |
|---|---|
| `batch8ScoringAPI.ts` | `:14`, environment-controlled `USE_MOCK` |
| `batch9AdvancedScoringAPI.ts` | `:13`, `USE_MOCK = true` |
| `batch10ExtendedScoringAPI.ts` | `:15`, `USE_MOCK = true` |
| `batch11AIContentAPI.ts` | `:17`, environment-controlled `USE_MOCK` |
| `batch12ExtendedAIContentAPI.ts` | `:13`, environment-controlled `USE_MOCK` |
| `batch13CandidateAIAPI.ts` | `:21`, environment-controlled `USE_MOCK` |
| `batch14ExtendedAINLPAPI.ts` | `:22`, environment-controlled `USE_MOCK` |
| `batch17AIScreeningAPI.ts` | `:29`, environment-controlled `USE_MOCK` |
| `batch18InterviewAnalysisAPI.ts` | `:34`, environment-controlled `USE_MOCK` |
| `batch19AIKnowledgeBaseAPI.ts` | `:24`, `USE_MOCK = true` |
| `batch21SemanticMatchingAPI.ts` | `:41`, environment-controlled `USE_MOCK` |
| `batch22PredictiveAnalyticsAPI.ts` | `:25`, `USE_MOCK = true` |
| `batch23SmartRecommendationsAPI.ts` | `:35`, `USE_MOCK = true` |

The presence of `USE_MOCK` in these services reinforces that the frontend currently supports mock responses. The backend provider audit is the stronger evidence for determining whether real model inference exists.

---

# Backend Controller Audit Counts

| Controller | Prisma occurrences | Math.random occurrences | Provider invocation result |
|---|---:|---:|---|
| `batch8Scoring.controller.ts` | 36 | 5 | No actual provider call |
| `batch9AdvancedScoring.controller.ts` | 0 | 0 | No actual provider call |
| `batch10ExtendedScoring.controller.ts` | 0 | 0 | No actual provider call |
| `batch11AIContentGeneration.controller.ts` | 19 | 1 | No actual provider call |
| `batch12ExtendedAIContent.controller.ts` | 22 | 0 | No actual provider call |
| `batch13CandidateAIContent.controller.ts` | 23 | 1 | No actual provider call |
| `batch14ExtendedAINLP.controller.ts` | 19 | 2 | No actual provider call |
| `batch17AIScreening.controller.ts` | 49 | 3 | No actual provider call |
| `batch18InterviewAnalysis.controller.ts` | 44 | 29 | No actual provider call |
| `batch19AIKnowledgeBase.controller.ts` | 71 | 0 | No actual provider call |
| `batch21SemanticMatching.controller.ts` | 0 | 15 | No actual provider call |
| `batch22PredictiveAnalytics.controller.ts` | 47 | 0 | No actual provider call |
| `batch23SmartRecommendations.controller.ts` | 36 | 0 | No actual provider call |

**Note:** Prisma occurrence counts represent textual `prisma.` usage in the audited controllers. They are database operations and should not be interpreted as AI calls.

---

# AI Provider Audit

The following backend search was performed:

```powershell
(Get-ChildItem .\backend -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx |
  Select-String 'chat\.completions|messages\.create|embeddings\.create|new OpenAI|new Anthropic').Count