import { PrismaClient } from '@prisma/client';
import { transcribeAudio } from '../integrations/transcription';
import { resolveTranscriptionAudioPath } from '../integrations/transcription/resolveAudio';

const prisma = new PrismaClient();

export async function processTranscriptionJob(transcriptionId: string): Promise<void> {
  const existing = await prisma.interviewTranscription.findUnique({
    where: { id: transcriptionId },
  });

  if (!existing) {
    throw new Error(`Transcription job not found: ${transcriptionId}`);
  }

  await prisma.interviewTranscription.update({
    where: { id: transcriptionId },
    data: {
      status: 'IN_PROGRESS',
      errorMessage: null,
    },
  });

  const started = Date.now();

  try {
    const audioPath = await resolveTranscriptionAudioPath({
      sourceUrl: existing.sourceUrl,
    });

    const result = await transcribeAudio({
      audioPath,
      language: existing.language,
    });

    await prisma.interviewTranscription.update({
      where: { id: transcriptionId },
      data: {
        status: 'COMPLETED',
        rawTranscript: result.text,
        formattedTranscript: result.formattedText,
        detectedLanguage: result.language,
        transcriptionEngine: result.engine,
        confidence: result.confidence,
        wordCount: result.wordCount,
        timestamps: result.timestamps
  ? JSON.parse(JSON.stringify(result.timestamps))
  : undefined,
        speakerLabels: result.speakerLabels ?? undefined,
        processingTime: Date.now() - started,
        errorMessage: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transcription failed';
    await prisma.interviewTranscription.update({
      where: { id: transcriptionId },
      data: {
        status: 'FAILED',
        errorMessage: message,
        processingTime: Date.now() - started,
      },
    });
  }
}

export function queueTranscriptionJob(transcriptionId: string): void {
  setImmediate(() => {
    processTranscriptionJob(transcriptionId).catch((error) => {
      console.error('Transcription job error:', error);
    });
  });
}
