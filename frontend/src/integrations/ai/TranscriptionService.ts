// ============================================================
// TRANSCRIPTION SERVICE - Audio/Video transcription service
// ============================================================

import { BaseIntegrationService, integrationEvents } from '../base';
import type {
  IntegrationConfig,
  TranscriptionRequest,
  TranscriptionResponse,
  TranscriptionWord,
  TranscriptionSpeaker,
} from '../types';

// ============================================
// Transcription Types
// ============================================
export interface TranscriptionJob {
  id: string;
  status: TranscriptionJobStatus;
  createdAt: Date;
  completedAt?: Date;
  duration?: number;
  language?: string;
  result?: TranscriptionResponse;
  error?: string;
}

export type TranscriptionJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface TranscriptionOptions {
  language?: string;
  punctuate?: boolean;
  diarize?: boolean;
  speakerCount?: number;
  keywords?: string[];
  customVocabulary?: string[];
  redactPII?: boolean;
  summarize?: boolean;
  detectTopics?: boolean;
}

// ============================================
// Transcription Service
// ============================================
export class TranscriptionService extends BaseIntegrationService {
  private provider: 'deepgram' | 'assemblyai' | 'whisper' = 'deepgram';

  constructor(config?: Partial<IntegrationConfig>) {
    super({
      id: 'transcription',
      name: 'Transcription Service',
      description: 'Transcribe audio and video recordings',
      icon: 'mic',
      category: 'ai',
      ...config,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.request('/ai/transcription/verify', { method: 'POST' });
      this.setStatus('connected');
      this.config.connectedAt = new Date();

      integrationEvents.emit('connected', {
        integrationId: this.config.id,
        status: 'connected',
      });
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.setStatus('disconnected');
    integrationEvents.emit('disconnected', {
      integrationId: this.config.id,
      status: 'disconnected',
    });
  }

  isConnected(): boolean {
    return this.config.status === 'connected';
  }

  async refresh(): Promise<void> {
    await this.connect();
  }

  // ============================================
  // Transcription Methods
  // ============================================

  async transcribe(
    request: TranscriptionRequest,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResponse> {
    const formData = new FormData();

    if (request.audioFile) {
      formData.append('audio', request.audioFile);
    } else if (request.audioUrl) {
      formData.append('audioUrl', request.audioUrl);
    } else {
      throw this.createError(
        'NO_AUDIO',
        'Either audioFile or audioUrl must be provided',
        false
      );
    }

    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await fetch(`${this.baseUrl}/ai/transcription/transcribe`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw this.createError(
        error.code || 'TRANSCRIPTION_FAILED',
        error.message || 'Transcription failed',
        response.status >= 500
      );
    }

    const data = await response.json();
    return this.parseTranscriptionResponse(data);
  }

  async transcribeAsync(
    request: TranscriptionRequest,
    options?: TranscriptionOptions
  ): Promise<TranscriptionJob> {
    const formData = new FormData();

    if (request.audioFile) {
      formData.append('audio', request.audioFile);
    } else if (request.audioUrl) {
      formData.append('audioUrl', request.audioUrl);
    }

    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    formData.append('async', 'true');

    const response = await fetch(`${this.baseUrl}/ai/transcription/transcribe`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw this.createError(
        error.code || 'TRANSCRIPTION_FAILED',
        error.message || 'Failed to start transcription',
        response.status >= 500
      );
    }

    const data = await response.json();
    return {
      id: data.id,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  async getTranscriptionJob(jobId: string): Promise<TranscriptionJob> {
    const response = await this.request<{
      id: string;
      status: string;
      created_at: string;
      completed_at?: string;
      duration?: number;
      language?: string;
      result?: Record<string, unknown>;
      error?: string;
    }>(`/ai/transcription/jobs/${jobId}`);

    return {
      id: response.id,
      status: response.status as TranscriptionJobStatus,
      createdAt: new Date(response.created_at),
      completedAt: response.completed_at ? new Date(response.completed_at) : undefined,
      duration: response.duration,
      language: response.language,
      result: response.result ? this.parseTranscriptionResponse(response.result) : undefined,
      error: response.error,
    };
  }

  async waitForTranscription(
    jobId: string,
    options?: { pollInterval?: number; timeout?: number }
  ): Promise<TranscriptionResponse> {
    const pollInterval = options?.pollInterval || 2000;
    const timeout = options?.timeout || 300000; // 5 minutes default

    const startTime = Date.now();

    while (true) {
      const job = await this.getTranscriptionJob(jobId);

      if (job.status === 'completed' && job.result) {
        return job.result;
      }

      if (job.status === 'failed') {
        throw this.createError(
          'TRANSCRIPTION_FAILED',
          job.error || 'Transcription failed',
          true
        );
      }

      if (Date.now() - startTime > timeout) {
        throw this.createError(
          'TIMEOUT',
          'Transcription timed out',
          true
        );
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  // ============================================
  // Interview-Specific Features
  // ============================================

  async transcribeInterview(
    audioSource: string | File | Blob,
    options?: {
      interviewerCount?: number;
      detectSentiment?: boolean;
      extractKeyPhrases?: boolean;
    }
  ): Promise<{
    transcription: TranscriptionResponse;
    speakers: TranscriptionSpeaker[];
    keyPhrases?: string[];
  }> {
    const transcriptionOptions: TranscriptionOptions = {
      diarize: true,
      speakerCount: (options?.interviewerCount || 1) + 1, // interviewers + candidate
      punctuate: true,
      detectTopics: options?.extractKeyPhrases,
    };

    let result: TranscriptionResponse;

    if (typeof audioSource === 'string') {
      result = await this.transcribe({ audioUrl: audioSource }, transcriptionOptions);
    } else {
      result = await this.transcribe({ audioFile: audioSource }, transcriptionOptions);
    }

    return {
      transcription: result,
      speakers: result.speakers || [],
      keyPhrases: options?.extractKeyPhrases
        ? this.extractKeyPhrases(result.text)
        : undefined,
    };
  }

  async generateInterviewSummary(
    transcription: TranscriptionResponse
  ): Promise<{
    summary: string;
    duration: string;
    speakerBreakdown: Array<{ speaker: number; speakingTime: number; percentage: number }>;
    highlights: string[];
  }> {
    const response = await this.request<{
      summary: string;
      highlights: string[];
    }>('/ai/transcription/summarize', {
      method: 'POST',
      body: JSON.stringify({ text: transcription.text }),
    });

    // Calculate speaker breakdown
    const speakerBreakdown = this.calculateSpeakerBreakdown(transcription);

    return {
      summary: response.summary,
      duration: this.formatDuration(transcription.duration),
      speakerBreakdown,
      highlights: response.highlights,
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private parseTranscriptionResponse(data: Record<string, unknown>): TranscriptionResponse {
    return {
      id: String(data.id || ''),
      text: String(data.text || data.transcript || ''),
      confidence: Number(data.confidence || 0),
      words: this.parseWords(data.words),
      speakers: this.parseSpeakers(data.utterances || data.speakers),
      duration: Number(data.duration || data.audio_duration || 0),
    };
  }

  private parseWords(words: unknown): TranscriptionWord[] | undefined {
    if (!Array.isArray(words)) return undefined;

    return words.map((w: Record<string, unknown>) => ({
      word: String(w.word || w.text || ''),
      start: Number(w.start || 0),
      end: Number(w.end || 0),
      confidence: Number(w.confidence || 0),
      speaker: w.speaker !== undefined ? Number(w.speaker) : undefined,
    }));
  }

  private parseSpeakers(utterances: unknown): TranscriptionSpeaker[] | undefined {
    if (!Array.isArray(utterances)) return undefined;

    const speakerMap = new Map<number, TranscriptionSpeaker>();

    for (const utterance of utterances) {
      const u = utterance as Record<string, unknown>;
      const speakerId = Number(u.speaker || 0);

      if (!speakerMap.has(speakerId)) {
        speakerMap.set(speakerId, { id: speakerId, segments: [] });
      }

      speakerMap.get(speakerId)!.segments.push({
        start: Number(u.start || 0),
        end: Number(u.end || 0),
        text: String(u.text || ''),
      });
    }

    return Array.from(speakerMap.values());
  }

  private extractKeyPhrases(text: string): string[] {
    // Simple key phrase extraction - in production, use NLP
    const sentences = text.split(/[.!?]+/);
    const phrases: string[] = [];

    // Extract questions
    for (const sentence of sentences) {
      if (sentence.includes('?') || sentence.toLowerCase().includes('how') ||
          sentence.toLowerCase().includes('what') || sentence.toLowerCase().includes('why')) {
        phrases.push(sentence.trim());
      }
    }

    return phrases.slice(0, 10);
  }

  private calculateSpeakerBreakdown(
    transcription: TranscriptionResponse
  ): Array<{ speaker: number; speakingTime: number; percentage: number }> {
    if (!transcription.speakers) return [];

    const totalDuration = transcription.duration;
    const breakdown: Array<{ speaker: number; speakingTime: number; percentage: number }> = [];

    for (const speaker of transcription.speakers) {
      const speakingTime = speaker.segments.reduce(
        (total, segment) => total + (segment.end - segment.start),
        0
      );

      breakdown.push({
        speaker: speaker.id,
        speakingTime,
        percentage: totalDuration > 0 ? (speakingTime / totalDuration) * 100 : 0,
      });
    }

    return breakdown;
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // ============================================
  // Provider Configuration
  // ============================================

  setProvider(provider: 'deepgram' | 'assemblyai' | 'whisper'): void {
    this.provider = provider;
  }

  getProvider(): string {
    return this.provider;
  }
}

export default TranscriptionService;
