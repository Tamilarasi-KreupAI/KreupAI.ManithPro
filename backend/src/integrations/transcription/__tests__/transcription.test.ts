import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { getTranscriptionProviderName, transcribeAudio } from '../index';
import { resolveTranscriptionAudioPath } from '../resolveAudio';
import { TestTranscriptionProvider } from '../testProvider';

const dir = resolve(__dirname, '../../../../testdata/ai-28-recordings');
const sampleA = resolve(dir, 'sample-a.wav');
const sampleB = resolve(dir, 'sample-b.wav');

function pcmWav(uniqueByte: number): Buffer {
  const samples = Buffer.alloc(800);
  samples.fill(uniqueByte);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + samples.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(8000, 24);
  header.writeUInt32LE(8000, 28);
  header.writeUInt16LE(1, 32);
  header.writeUInt16LE(8, 34);
  header.write('data', 36);
  header.writeUInt32LE(samples.length, 40);
  return Buffer.concat([header, samples]);
}

beforeAll(() => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(sampleA, pcmWav(0x21));
  writeFileSync(sampleB, pcmWav(0x42));
});

describe('AI-28 transcription provider', () => {
  afterEach(() => {
    delete process.env.TRANSCRIPTION_FORCE_FAIL;
    delete process.env.TRANSCRIPTION_PROVIDER;
  });

  it('produces different transcripts for two different test recordings', async () => {
    const provider = new TestTranscriptionProvider();
    const a = await provider.transcribe({ audioPath: sampleA });
    const b = await provider.transcribe({ audioPath: sampleB });
    expect(a.text).not.toEqual(b.text);
    expect(a.text).not.toContain('Sample transcription text from interview');
    expect(b.text).not.toContain('Sample transcription text from interview');
  });

  it('uses the test provider by default through transcribeAudio', async () => {
    delete process.env.TRANSCRIPTION_PROVIDER;
    const result = await transcribeAudio({ audioPath: sampleA });
    expect(result.provider).toBe('test');
    expect(result.engine).toBe('TEST');
    expect(result.text).toContain('sample-a.wav');
  });

  it('marks a forced failure so the job can be retried', async () => {
    process.env.TRANSCRIPTION_FORCE_FAIL = '1';
    const provider = new TestTranscriptionProvider();
    await expect(provider.transcribe({ audioPath: sampleA })).rejects.toThrow(
      'Forced transcription failure'
    );
  });

  it('defaults to the test provider and rejects unknown provider names', () => {
    delete process.env.TRANSCRIPTION_PROVIDER;
    expect(getTranscriptionProviderName()).toBe('test');
    process.env.TRANSCRIPTION_PROVIDER = 'assemblyai';
    expect(() => getTranscriptionProviderName()).toThrow(/Unsupported transcription provider/);
  });

  it('resolves a local recording and rejects remote URLs', async () => {
    const local = await resolveTranscriptionAudioPath({ sourceUrl: sampleA });
    expect(local).toBe(sampleA);
    await expect(
      resolveTranscriptionAudioPath({ sourceUrl: 'https://example.com/interview.wav' })
    ).rejects.toThrow('Remote URLs');
  });
});

describe('AI-28 job runner states', () => {
  it('marks IN_PROGRESS, COMPLETED, and FAILED in the job service', () => {
    const source = readFileSync(
      resolve(__dirname, '../../../services/transcriptionJob.ts'),
      'utf8'
    );
    expect(source).toContain("status: 'IN_PROGRESS'");
    expect(source).toContain("status: 'COMPLETED'");
    expect(source).toContain("status: 'FAILED'");
    expect(source).not.toContain('Sample transcription text from interview');
  });
});

describe('AI-28 controller no longer uses the sample string', () => {
  it('does not hardcode the fake transcript', () => {
    const source = readFileSync(
      resolve(__dirname, '../../../controllers/batch18InterviewAnalysis.controller.ts'),
      'utf8'
    );
    expect(source).not.toContain('Sample transcription text from interview');
    expect(source).toContain('queueTranscriptionJob');
    expect(source).toContain("status: 'PENDING'");
    expect(source).toContain('retryTranscription');
  });
});
