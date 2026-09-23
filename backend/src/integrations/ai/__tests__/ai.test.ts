import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGenerateText = vi.fn();
const mockGenerateStructured = vi.fn();
const mockCreateEmbedding = vi.fn();

vi.mock('../openai', () => ({
  OpenAIProvider: vi.fn().mockImplementation(() => ({
    generateText: mockGenerateText,
    generateStructured: mockGenerateStructured,
    createEmbedding: mockCreateEmbedding,
  })),
}));

vi.mock('../anthropic', () => ({
  AnthropicProvider: vi.fn().mockImplementation(() => ({
    generateText: mockGenerateText,
    generateStructured: mockGenerateStructured,
    createEmbedding: mockCreateEmbedding,
  })),
}));

describe('AI integration facade', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    delete process.env.AI_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
    delete process.env.OPENAI_EMBEDDING_MODEL;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_MODEL;
  });

  it('throws when no provider is configured', async () => {
    const { generateText } = await import('../index');

    await expect(
      generateText({
        prompt: 'Hello',
      }),
    ).rejects.toThrow(
      'AI provider is not configured',
    );
  });

  it('throws when an unsupported provider is configured', async () => {
    process.env.AI_PROVIDER = 'unknown';

    const { generateText } = await import('../index');

    await expect(
      generateText({
        prompt: 'Hello',
      }),
    ).rejects.toThrow(
      'Unsupported AI provider "unknown"',
    );
  });

  it('routes generateText to OpenAI when configured', async () => {
    process.env.AI_PROVIDER = 'openai';

    mockGenerateText.mockResolvedValue({
      output: 'Hello from OpenAI',
      model: 'test-openai-model',
      provider: 'openai',
      usage: {
        inputTokens: 5,
        outputTokens: 4,
        totalTokens: 9,
      },
    });

    const { generateText } = await import('../index');

    const result = await generateText({
      prompt: 'Hello',
    });

    expect(result).toEqual({
      output: 'Hello from OpenAI',
      model: 'test-openai-model',
      provider: 'openai',
      usage: {
        inputTokens: 5,
        outputTokens: 4,
        totalTokens: 9,
      },
    });

    expect(mockGenerateText).toHaveBeenCalledWith({
      prompt: 'Hello',
    });
  });

  it('routes generateText to Anthropic when configured', async () => {
    process.env.AI_PROVIDER = 'anthropic';

    mockGenerateText.mockResolvedValue({
      output: 'Hello from Anthropic',
      model: 'test-anthropic-model',
      provider: 'anthropic',
      usage: {
        inputTokens: 6,
        outputTokens: 3,
        totalTokens: 9,
      },
    });

    const { generateText } = await import('../index');

    const result = await generateText({
      prompt: 'Hello',
    });

    expect(result).toEqual({
      output: 'Hello from Anthropic',
      model: 'test-anthropic-model',
      provider: 'anthropic',
      usage: {
        inputTokens: 6,
        outputTokens: 3,
        totalTokens: 9,
      },
    });

    expect(mockGenerateText).toHaveBeenCalledWith({
      prompt: 'Hello',
    });
  });

  it('routes structured generation through the configured provider', async () => {
    process.env.AI_PROVIDER = 'openai';

    const structuredOutput = {
      category: 'engineering',
      confidence: 0.95,
    };

    mockGenerateStructured.mockResolvedValue({
      output: structuredOutput,
      model: 'test-openai-model',
      provider: 'openai',
      usage: {
        inputTokens: 10,
        outputTokens: 8,
        totalTokens: 18,
      },
    });

    const { generateStructured } = await import('../index');

    const result = await generateStructured({
      prompt: 'Classify this job',
      schema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
          },
          confidence: {
            type: 'number',
          },
        },
        required: ['category', 'confidence'],
        additionalProperties: false,
      },
    });

    expect(result.output).toEqual(structuredOutput);
    expect(result.model).toBe('test-openai-model');
    expect(result.provider).toBe('openai');
    expect(result.usage.totalTokens).toBe(18);
  });

  it('routes embeddings through the configured provider', async () => {
    process.env.AI_PROVIDER = 'openai';

    mockCreateEmbedding.mockResolvedValue({
      embedding: [0.1, 0.2, 0.3],
      model: 'test-embedding-model',
      provider: 'openai',
      usage: {
        inputTokens: 4,
        outputTokens: 0,
        totalTokens: 4,
      },
    });

    const { createEmbedding } = await import('../index');

    const result = await createEmbedding({
      input: 'candidate profile',
    });

    expect(result.embedding).toEqual([0.1, 0.2, 0.3]);
    expect(result.model).toBe('test-embedding-model');
    expect(result.provider).toBe('openai');
    expect(result.usage.totalTokens).toBe(4);
  });

  it('propagates provider errors instead of fabricating output', async () => {
    process.env.AI_PROVIDER = 'openai';

    mockGenerateText.mockRejectedValue(
      new Error('Provider API failure'),
    );

    const { generateText } = await import('../index');

    await expect(
      generateText({
        prompt: 'Hello',
      }),
    ).rejects.toThrow('Provider API failure');
  });
});
