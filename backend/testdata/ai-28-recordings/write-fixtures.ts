import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

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

const dir = join(__dirname);
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'sample-a.wav'), pcmWav(0x21));
writeFileSync(join(dir, 'sample-b.wav'), pcmWav(0x42));
