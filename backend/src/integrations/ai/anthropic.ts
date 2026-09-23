import Anthropic from '@anthropic-ai/sdk';
import {
  AIProviderService,
  EmbeddingOptions,
  EmbeddingResult,
  GenerateStructuredOptions,
  GenerateStructuredResult,
  GenerateTextOptions,
  GenerateTextResult,
} from './types';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildPrompt(options: GenerateTextOptions): string {
  if (options.messages?.length) {
    return options.messages
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n\n');
  }

  if (options.prompt) {
    return options.prompt;
  }

  throw new Error('AI request requires either prompt or messages');
}

function mapUsage(usage?: {
  input_tokens?: number;
  output_tokens?: number;
}) {
  const inputTokens = usage?.input_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

export class AnthropicProvider implements AIProviderService {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config?: { apiKey?: string; model?: string }) {
    const apiKey =
      config?.apiKey ?? getRequiredEnv('ANTHROPIC_API_KEY');

    this.model =
      config?.model ?? getRequiredEnv('ANTHROPIC_MODEL');

    this.client = new Anthropic({ apiKey });
  }

  async generateText(
    options: GenerateTextOptions,
  ): Promise<GenerateTextResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens ?? 1024,
      system: options.system,
      temperature: options.temperature,
      messages: [
        {
          role: 'user',
          content: buildPrompt(options),
        },
      ],
    });

    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text',
    );

    const output = textBlocks.map((block) => block.text).join('');

    if (!output) {
      throw new Error('Anthropic returned no text content');
    }

    return {
      output,
      model: response.model,
      provider: 'anthropic',
      usage: mapUsage(response.usage),
    };
  }

  async generateStructured<T>(
    options: GenerateStructuredOptions<T>,
  ): Promise<GenerateStructuredResult<T>> {
    const schemaText = JSON.stringify(options.schema);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens ?? 2048,
      system:
        `${options.system ?? ''}\n\n` +
        `Return only valid JSON matching this schema:\n${schemaText}`,
      temperature: options.temperature,
      messages: [
        {
          role: 'user',
          content: buildPrompt(options),
        },
      ],
    });

    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text',
    );

    const output = textBlocks.map((block) => block.text).join('');

    if (!output) {
      throw new Error('Anthropic returned no structured content');
    }

    let parsed: T;

    try {
      parsed = JSON.parse(output) as T;
    } catch {
      throw new Error(
        'Anthropic returned invalid JSON for structured output',
      );
    }

    return {
      output: parsed,
      model: response.model,
      provider: 'anthropic',
      usage: mapUsage(response.usage),
    };
  }

  async createEmbedding(
    _options: EmbeddingOptions,
  ): Promise<EmbeddingResult> {
    throw new Error(
      'Anthropic does not provide an embeddings API. Configure AI_PROVIDER=openai for createEmbedding.',
    );
  }
}
