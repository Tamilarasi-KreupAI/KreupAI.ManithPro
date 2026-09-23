export type AIProvider = 'openai' | 'anthropic';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateTextOptions {
  prompt?: string;
  messages?: AIMessage[];
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateStructuredOptions<T = unknown>
  extends GenerateTextOptions {
  schema: Record<string, unknown>;
  schemaName?: string;
  schemaDescription?: string;
}

export interface EmbeddingOptions {
  input: string | string[];
}

export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface GenerateTextResult {
  output: string;
  model: string;
  provider: AIProvider;
  usage: AIUsage;
}

export interface GenerateStructuredResult<T> {
  output: T;
  model: string;
  provider: AIProvider;
  usage: AIUsage;
}

export interface EmbeddingResult {
  embedding: number[] | number[][];
  model: string;
  provider: AIProvider;
  usage: AIUsage;
}

export interface AIProviderService {
  generateText(options: GenerateTextOptions): Promise<GenerateTextResult>;

  generateStructured<T>(
    options: GenerateStructuredOptions<T>,
  ): Promise<GenerateStructuredResult<T>>;

  createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResult>;
}
