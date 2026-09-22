import { TestTranscriptionProvider } from './testProvider';
import { TranscriptionProvider, TranscriptionProviderName, TranscriptionRequest, TranscriptionResult } from './types';

export * from './types';

function getConfiguredProvider(): TranscriptionProviderName {
  const provider = (process.env.TRANSCRIPTION_PROVIDER || 'test').trim().toLowerCase();

  if (provider !== 'openai' && provider !== 'test') {
    throw new Error(
      `Unsupported transcription provider "${provider}". Set TRANSCRIPTION_PROVIDER to "openai" or "test".`
    );
  }

  return provider;
}

export function getTranscriptionProviderName(): TranscriptionProviderName {
  return getConfiguredProvider();
}

export function getTranscriptionService(): TranscriptionProvider {
  const provider = getConfiguredProvider();
  if (provider === 'openai') {
    const { OpenAIWhisperProvider } = require('./openaiWhisper') as typeof import('./openaiWhisper');
    return new OpenAIWhisperProvider();
  }
  return new TestTranscriptionProvider();
}

export async function transcribeAudio(
  request: TranscriptionRequest
): Promise<TranscriptionResult> {
  return getTranscriptionService().transcribe(request);
}
