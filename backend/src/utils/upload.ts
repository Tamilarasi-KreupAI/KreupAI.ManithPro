/**
 * WS06-T03 — Unified Multer Upload Configuration
 *
 * Provides named multer instances for:
 *   - resume   (PDF/DOC/DOCX, 5 MB max)
 *   - avatar   (JPEG/PNG/WEBP, 2 MB max)
 *   - attachment (PDF/DOC/DOCX/images, 10 MB max)
 *
 * Features:
 *   - UUID-based random stored filenames (no original filename exposed)
 *   - Storage root from UPLOAD_STORAGE_ROOT env variable
 *   - Real magic-byte / file-signature validation (not extension-only)
 *   - HTTP 413 on LIMIT_FILE_SIZE, HTTP 400 on invalid content/type
 *   - Deletes uploaded file if post-upload validation fails
 *   - No internal paths or sensitive details exposed to the client
 */

import multer, { FileFilterCallback, MulterError } from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const unlinkAsync = promisify(fs.unlink);

// ─── Storage root ─────────────────────────────────────────────
// Use env variable when set; fall back to <project-root>/uploads.
const STORAGE_ROOT: string =
  process.env.UPLOAD_STORAGE_ROOT || path.join(__dirname, '../../uploads');

// ─── Sub-directory helpers ────────────────────────────────────
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function subDir(name: string): string {
  const dir = path.join(STORAGE_ROOT, name);
  ensureDir(dir);
  return dir;
}

// ─── Random filename generator (UUID, no original name) ───────
function randomFilename(ext: string): string {
  return `${randomUUID()}${ext}`;
}

// ─── Magic-byte signatures ────────────────────────────────────
type MagicCheck = { offset: number; bytes: number[] };

const MAGIC: Record<string, MagicCheck[]> = {
  pdf:  [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }],        // %PDF
  doc:  [{ offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0] }],        // OLE compound
  docx: [{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }],        // ZIP/OOXML
  png:  [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }],
  jpg:  [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  webp: [{ offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }],        // RIFF (WEBP extra check below)
};

async function readBytes(filePath: string, offset: number, length: number): Promise<Buffer> {
  const buf = Buffer.alloc(length);
  const fd = await fs.promises.open(filePath, 'r');
  try {
    await fd.read(buf, 0, length, offset);
  } finally {
    await fd.close();
  }
  return buf;
}

async function detectFileType(
  filePath: string,
  expectedTypes: string[]
): Promise<string | null> {
  try {
    const stat = await fs.promises.stat(filePath);
    if (stat.size === 0) return null;

    for (const type of expectedTypes) {
      const checks = MAGIC[type];
      if (!checks) continue;
      let matched = true;

      for (const check of checks) {
        const buf = await readBytes(filePath, check.offset, check.bytes.length);
        for (let i = 0; i < check.bytes.length; i++) {
          if (buf[i] !== check.bytes[i]) {
            matched = false;
            break;
          }
        }
        if (!matched) break;
      }

      if (matched) {
        if (type === 'webp') {
          const webpBuf = await readBytes(filePath, 8, 4);
          if (webpBuf.toString('ascii') !== 'WEBP') continue;
        }
        return type;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Generic disk storage factory ─────────────────────────────
function makeDiskStorage(subfolder: string): multer.StorageEngine {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, subDir(subfolder));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, randomFilename(ext));
    },
  });
}

// ─── Allowed MIME type maps ────────────────────────────────────
type AllowedMimesMap = Record<string, string[]>;

const RESUME_MIMES: AllowedMimesMap = {
  pdf:  ['application/pdf'],
  doc:  ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const AVATAR_MIMES: AllowedMimesMap = {
  jpg:  ['image/jpeg'],
  png:  ['image/png'],
  webp: ['image/webp'],
};

const ATTACHMENT_MIMES: AllowedMimesMap = {
  pdf:  ['application/pdf'],
  doc:  ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  jpg:  ['image/jpeg'],
  png:  ['image/png'],
};

function makeFileFilter(allowedMimes: AllowedMimesMap) {
  const allMimes = Object.values(allowedMimes).flat();
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error(
        `Invalid file type. Allowed: ${Object.keys(allowedMimes).join(', ').toUpperCase()}`
      ) as any;
      err.status = 400;
      cb(err);
    }
  };
}

// ─── Multer instances ──────────────────────────────────────────

/** Resume upload: PDF/DOC/DOCX, 5 MB max */
export const resumeUpload = multer({
  storage: makeDiskStorage('resumes'),
  fileFilter: makeFileFilter(RESUME_MIMES) as any,
  limits: {
    fileSize: parseInt(process.env.MAX_RESUME_SIZE || '5242880', 10), // 5 MB
  },
});

/** Avatar upload: JPEG/PNG/WEBP, 2 MB max */
export const avatarUpload = multer({
  storage: makeDiskStorage('avatars'),
  fileFilter: makeFileFilter(AVATAR_MIMES) as any,
  limits: {
    fileSize: parseInt(process.env.MAX_AVATAR_SIZE || '2097152', 10), // 2 MB
  },
});

/** General attachment: PDF/DOC/DOCX/images, 10 MB max */
export const attachmentUpload = multer({
  storage: makeDiskStorage('attachments'),
  fileFilter: makeFileFilter(ATTACHMENT_MIMES) as any,
  limits: {
    fileSize: parseInt(process.env.MAX_ATTACHMENT_SIZE || '10485760', 10), // 10 MB
  },
});

// ─── Post-upload signature validator ──────────────────────────
// Mount this AFTER the multer middleware in the route.
// Reads the saved file, checks magic bytes, and rejects (HTTP 400)
// while deleting the file if the signature is wrong.

export function validateFileSignature(allowedTypes: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      return next();
    }

    const detected = await detectFileType(file.path, allowedTypes);

    if (!detected) {
      try {
        await unlinkAsync(file.path);
      } catch (e) {
        console.error('[upload] Failed to delete invalid file:', e);
      }
      res.status(400).json({
        error:
          'File content is invalid or does not match the expected format. ' +
          `Allowed formats: ${allowedTypes.join(', ').toUpperCase()}`,
      });
      return;
    }

    next();
  };
}

// ─── Multer error handler ──────────────────────────────────────
// Mount as an Express error-handling middleware (4-argument form)
// AFTER your upload route to convert multer errors to clean HTTP responses.

export function handleUploadError(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'File too large. Maximum allowed size exceeded.' });
      return;
    }
    res.status(400).json({ error: 'Upload limit exceeded.' });
    return;
  }

  // File-type rejection from fileFilter (err.status = 400 set above)
  if (err && (err as any).status === 400) {
    res.status(400).json({ error: err.message || 'Invalid file type.' });
    return;
  }

  if (err && err.code === 'ENOSPC') {
    res.status(500).json({ error: 'Upload failed due to a server storage error.' });
    return;
  }

  next(err);
}
