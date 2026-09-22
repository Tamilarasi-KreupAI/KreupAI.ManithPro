import OpenAI from 'openai';
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

function buildMessages(
  options: GenerateTextOptions,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (options.system) {
    messages.push({
      role: 'system',
      content: options.system,
    });
  }

  if (options.messages?.length) {
    messages.push(...options.messages);
  } else if (options.prompt) {
    messages.push({
      role: 'user',
      content: options.prompt,
    });
  }

  if (messages.length === 0) {
    throw new Error('AI request requires either prompt or messages');
  }

  return messages;
}

function mapUsage(usage?: OpenAI.Completions.CompletionUsage | null) {
  return {
    inputTokens: usage?.prompt_tokens ?? 0,
    outputTokens: usage?.completion_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
  };
}

export class OpenAIProvider implements AIProviderService {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly embeddingModel: string;

  constructor(config?: {
    apiKey?: string;
    model?: string;
    embeddingModel?: string;
  }) {
    const apiKey = config?.apiKey ?? getRequiredEnv('OPENAI_API_KEY');

    this.model = config?.model ?? getRequiredEnv('OPENAI_MODEL');

    this.embeddingModel =
      config?.embeddingModel ??
      getRequiredEnv('OPENAI_EMBEDDING_MODEL');

    this.client = new OpenAI({ apiKey });
  }

  async generateText(
    options: GenerateTextOptions,
  ): Promise<GenerateTextResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: buildMessages(options),
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    });

    const output = response.choices[0]?.message?.content;

    if (typeof output !== 'string') {
      throw new Error('OpenAI returned no text content');
    }

    return {
      output,
      model: response.model,
      provider: 'openai',
      usage: mapUsage(response.usage),
    };
  }

  async generateStructured<T>(
    options: GenerateStructuredOptions<T>,
  ): Promise<GenerateStructuredResult<T>> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: buildMessages(options),
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: options.schemaName ?? 'structured_response',
          description: options.schemaDescription,
          strict: true,
          schema: options.schema,
        },
      },
    });

    const output = response.choices[0]?.message?.content;

    if (typeof output !== 'string') {
      throw new Error('OpenAI returned no structured content');
    }

    let parsed: T;

    try {
      parsed = JSON.parse(output) as T;
    } catch {
      throw new Error('OpenAI returned invalid JSON for structured output');
    }

    return {
      output: parsed,
      model: response.model,
      provider: 'openai',
      usage: mapUsage(response.usage),
    };
  }

  async createEmbedding(
    options: EmbeddingOptions,
  ): Promise<EmbeddingResult> {
    const response = await this.client.embeddings.create({
      model: this.embeddingModel,
      input: options.input,
    });

    const embeddings = response.data.map((item) => item.embedding);

    return {
      embedding:
        typeof options.input === 'string' ? embeddings[0] : embeddings,
      model: response.model,
      provider: 'openai',
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }
}
