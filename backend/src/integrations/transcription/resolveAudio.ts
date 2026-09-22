import { access } from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isLocalPath(value: string): boolean {
  if (value.startsWith('http://') || value.startsWith('https://')) return false;
  return true;
}

export async function resolveTranscriptionAudioPath(input: {
  sourceUrl?: string | null;
  recordingId?: string | null;
}): Promise<string> {
  if (input.recordingId) {
    const recording = await prisma.videoRecording.findUnique({
      where: { id: input.recordingId },
    });
    const fromRecording = recording?.filePath || recording?.fileUrl;
    if (fromRecording) {
      return resolveLocalOrThrow(fromRecording);
    }
  }

  if (!input.sourceUrl) {
    throw new Error('No recording path was provided. Pass sourceUrl or recordingId.');
  }

  if (!isLocalPath(input.sourceUrl)) {
    throw new Error(
      'Remote URLs are not downloaded in this environment. Store the test recording locally and pass sourceUrl as a file path.'
    );
  }

  return resolveLocalOrThrow(input.sourceUrl);
}

async function resolveLocalOrThrow(filePath: string): Promise<string> {
  const candidates = [
    filePath,
    path.resolve(filePath),
    path.resolve(process.cwd(), filePath),
    path.resolve(process.cwd(), 'uploads', filePath),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }

  throw new Error(`Recording file not found: ${filePath}`);
}
