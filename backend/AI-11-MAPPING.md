# AI-11 - Advanced Scoring Storage Mapping

## Purpose

AI-11 provides persistent storage for five advanced candidate-scoring dimensions
exposed by `batch9AdvancedScoring`.

## Module 5 Mapping

| Prisma Model | Module 5 Scoring Dimension | Stored Score Field |
|---|---|---|
| `CultureFitAnalysis` | Culture Fit | `overallCultureScore` |
| `GrowthPotentialScore` | Growth Potential | `overallGrowthScore` |
| `TechnicalDepthScore` | Technical Depth | `overallTechnicalScore` |
| `CommunicationScore` | Communication | `overallCommScore` |
| `ReliabilityScore` | Reliability | `overallReliabilityScore` |

## Stored Information

Each scoring model stores:

- Candidate identifiers: `userId` and `profileId`
- Scoring result and related scoring metrics
- Input or supporting data through JSON fields where applicable
- `scoringVersion`
- Computation timestamp (`lastAnalyzedAt` or `lastScoredAt`)
- Creation and update timestamps

## Storage Operations

The storage service is located at:

`backend/src/services/scoringStorage.service.ts`

It provides save/update and fetch operations for all five scoring dimensions.

## Migration Status

The five tables already exist in the migration:

`20251215062529_initial_setup`

No duplicate migration should be created unless the existing schema requires changes.