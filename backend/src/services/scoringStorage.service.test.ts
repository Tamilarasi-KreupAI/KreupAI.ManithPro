import assert from 'assert';

// Basic AI-11 storage contract tests.
// Database integration tests should be added separately
// when a dedicated test database is available.

const requiredFunctions = [
  'saveCultureFitScore',
  'getCultureFitScore',
  'saveGrowthPotentialScore',
  'getGrowthPotentialScore',
  'saveTechnicalDepthScore',
  'getTechnicalDepthScore',
  'saveCommunicationScore',
  'getCommunicationScore',
  'saveReliabilityScore',
  'getReliabilityScore',
  'getAllProfileScores',
];

describe('AI-11 Advanced Scoring Storage', () => {
  it('should define all required storage operations', async () => {
    const storage = await import('./scoringStorage.service');

    for (const functionName of requiredFunctions) {
      assert.strictEqual(
        typeof (storage as any)[functionName],
        'function',
        `${functionName} should be exported`,
      );
    }
  });
});