import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';
import {
  AIProvider,
  AIProviderService,
  EmbeddingOptions,
  EmbeddingResult,
  GenerateStructuredOptions,
  GenerateStructuredResult,
  GenerateTextOptions,
  GenerateTextResult,
} from './types';

export * from './types';

function getConfiguredProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (!provider) {
    throw new Error(
      'AI provider is not configured. Set AI_PROVIDER to "openai" or "anthropic".',
    );
  }

  if (provider !== 'openai' && provider !== 'anthropic') {
    throw new Error(
      `Unsupported AI provider "${provider}". Set AI_PROVIDER to "openai" or "anthropic".`,
    );
  }

  return provider;
}

function createProvider(): AIProviderService {
  const provider = getConfiguredProvider();

  switch (provider) {
    case 'openai':
      return new OpenAIProvider();

    case 'anthropic':
      return new AnthropicProvider();

    default:
      throw new Error(`Unsupported AI provider "${provider}".`);
  }
}

export function getAIProvider(): AIProvider {
  return getConfiguredProvider();
}

export function getAIService(): AIProviderService {
  return createProvider();
}

export async function generateText(
  options: GenerateTextOptions,
): Promise<GenerateTextResult> {
  return createProvider().generateText(options);
}

export async function generateStructured<T>(
  options: GenerateStructuredOptions<T>,
): Promise<GenerateStructuredResult<T>> {
  return createProvider().generateStructured<T>(options);
}

export async function createEmbedding(
  options: EmbeddingOptions,
): Promise<EmbeddingResult> {
  return createProvider().createEmbedding(options);
}

export { AnthropicProvider } from './anthropic';
export { OpenAIProvider } from './openai';
