import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import { TranscriptionProvider, TranscriptionRequest, TranscriptionResult } from './types';

/**
 * TEST-SAFE provider: reads the real file bytes so two recordings produce two transcripts.
 * Does not call a vendor and does not return the old hardcoded sample string.
 */
export class TestTranscriptionProvider implements TranscriptionProvider {
  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    if (process.env.TRANSCRIPTION_FORCE_FAIL === '1') {
      throw new Error('Forced transcription failure for retry testing');
    }

    const bytes = await readFile(request.audioPath);
    const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const name = basename(request.audioPath);
    const text = `Test transcript for ${name}. Audio fingerprint ${digest}. Byte length ${bytes.length}.`;

    return {
      text,
      formattedText: `[00:00] Speaker 1: ${text}`,
      language: request.language || 'en',
      confidence: 0.88,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      timestamps: [{ start: 0, end: 2, speaker: 'Speaker 1', text }],
      speakerLabels: [{ speaker: 'Speaker 1', text }],
      engine: 'TEST',
      provider: 'test',
    };
  }
}
