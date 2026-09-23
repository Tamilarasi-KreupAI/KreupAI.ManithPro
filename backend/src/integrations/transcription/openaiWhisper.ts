import { createReadStream } from 'fs';
import OpenAI from 'openai';
import { TranscriptionProvider, TranscriptionRequest, TranscriptionResult } from './types';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export class OpenAIWhisperProvider implements TranscriptionProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(config?: { apiKey?: string; model?: string }) {
    this.client = new OpenAI({
      apiKey: config?.apiKey ?? getRequiredEnv('OPENAI_API_KEY'),
    });
    this.model = config?.model ?? process.env.OPENAI_TRANSCRIPTION_MODEL ?? 'whisper-1';
  }

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    const response = await this.client.audio.transcriptions.create({
      file: createReadStream(request.audioPath) as any,
      model: this.model,
      language: request.language,
      response_format: 'verbose_json',
    });

    const payload = response as unknown as {
      text?: string;
      language?: string;
      segments?: Array<{ start: number; end: number; text: string }>;
    };

    const text = payload.text?.trim();
    if (!text) {
      throw new Error('OpenAI Whisper returned an empty transcript');
    }

    const segments = (payload.segments || []).map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text,
    }));

    const formatted = segments.length
      ? segments.map((s) => `[${formatTs(s.start)}] Speaker 1: ${s.text.trim()}`).join('\n')
      : `[00:00] Speaker 1: ${text}`;

    return {
      text,
      formattedText: formatted,
      language: payload.language || request.language,
      confidence: 0.9,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      timestamps: segments,
      speakerLabels: [{ speaker: 'Speaker 1', text }],
      engine: 'WHISPER',
      provider: 'openai',
    };
  }
}

function formatTs(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
