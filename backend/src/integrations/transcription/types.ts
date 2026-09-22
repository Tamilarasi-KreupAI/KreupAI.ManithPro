export type TranscriptionProviderName = 'openai' | 'test';

export interface TranscriptionRequest {
  audioPath: string;
  language?: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  speaker?: string;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  formattedText: string;
  language?: string;
  confidence?: number;
  wordCount: number;
  timestamps?: TranscriptSegment[];
  speakerLabels?: Array<{ speaker: string; text: string }>;
  engine: string;
  provider: TranscriptionProviderName;
}

export interface TranscriptionProvider {
  transcribe(request: TranscriptionRequest): Promise<TranscriptionResult>;
}
