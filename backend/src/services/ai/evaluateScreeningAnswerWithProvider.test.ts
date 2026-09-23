import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGenerateStructured = vi.fn();

vi.mock('../../integrations/ai', () => ({
  generateStructured: (...args: unknown[]) => mockGenerateStructured(...args),
}));

describe('evaluateScreeningAnswerWithProvider (AI-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.AI_PROVIDER;
  });

  it('does not call the AI layer for an empty answer', async () => {
    const { evaluateScreeningAnswerWithProvider } = await import(
      './evaluateScreeningAnswerWithProvider'
    );

    const result = await evaluateScreeningAnswerWithProvider(
      { textResponse: '' },
      { questionText: 'Describe React.', maxPoints: 10 }
    );

    expect(result.status).toBe('UNANSWERED');
    expect(result.aiScore).toBeNull();
    expect(mockGenerateStructured).not.toHaveBeenCalled();
  });

  it('uses generateStructured when AI_PROVIDER is set', async () => {
    process.env.AI_PROVIDER = 'openai';
    mockGenerateStructured.mockResolvedValue({
      output: {
        aiScore: 9.1,
        aiSentiment: 'POSITIVE',
        aiConfidenceLevel: 0.94,
        aiSummary: 'Strong production React example.',
      },
      model: 'test-model',
      provider: 'openai',
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    });

    const { evaluateScreeningAnswerWithProvider } = await import(
      './evaluateScreeningAnswerWithProvider'
    );

    const result = await evaluateScreeningAnswerWithProvider(
      {
        textResponse:
          'I implemented React and TypeScript in production and measured load time.',
      },
      { questionText: 'Describe your React and TypeScript experience.', maxPoints: 10 }
    );

    expect(mockGenerateStructured).toHaveBeenCalled();
    expect(result.aiScore).toBe(9.1);
    expect(result.aiSentiment).toBe('POSITIVE');
    expect(result.aiConfidenceLevel).toBe(0.94);
    expect(result.aiScoreBreakdown).toMatchObject({ method: 'ai-02-generateStructured' });
  });

  it('falls back to lexical scoring when the AI provider throws', async () => {
    process.env.AI_PROVIDER = 'openai';
    mockGenerateStructured.mockRejectedValue(new Error('provider down'));

    const { evaluateScreeningAnswerWithProvider } = await import(
      './evaluateScreeningAnswerWithProvider'
    );

    const result = await evaluateScreeningAnswerWithProvider(
      { textResponse: 'I used React TypeScript production hooks for example.' },
      { questionText: 'Describe React and TypeScript in production.', maxPoints: 10 }
    );

    expect(result.status).toBe('ANALYZED');
    expect(typeof result.aiScore).toBe('number');
    expect(result.aiScoreBreakdown).not.toMatchObject({
      method: 'ai-02-generateStructured',
    });
  });
});
