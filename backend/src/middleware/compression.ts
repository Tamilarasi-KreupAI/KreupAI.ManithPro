import compression from 'compression';
import { Request, Response, NextFunction, Application } from 'express';

// ============================================================
// COMPRESSION MIDDLEWARE
// ============================================================
//
// This module configures response compression for better
// performance and reduced bandwidth usage.
//
// Features:
// - Gzip/Brotli compression
// - Threshold configuration
// - Content-type filtering
// - Level optimization
// ============================================================

// ============================================================
// CONFIGURATION
// ============================================================

const isProduction = process.env.NODE_ENV === 'production';

// Content types to compress
const COMPRESSIBLE_TYPES = [
  'text/html',
  'text/css',
  'text/javascript',
  'text/xml',
  'text/plain',
  'application/json',
  'application/javascript',
  'application/xml',
  'application/rss+xml',
  'image/svg+xml',
];

// ============================================================
// COMPRESSION FILTER
// ============================================================

function shouldCompress(req: Request, res: Response): boolean {
  // Don't compress if client doesn't support it
  if (!req.headers['accept-encoding']) {
    return false;
  }

  // Don't compress if no-transform is set
  if (res.getHeader('Cache-Control')?.toString().includes('no-transform')) {
    return false;
  }

  // Don't compress Server-Sent Events
  if (req.headers['accept'] === 'text/event-stream') {
    return false;
  }

  // Don't compress already compressed content
  const contentEncoding = res.getHeader('Content-Encoding');
  if (contentEncoding && contentEncoding !== 'identity') {
    return false;
  }

  // Check content type
  const contentType = res.getHeader('Content-Type')?.toString() || '';
  const isCompressible = COMPRESSIBLE_TYPES.some((type) =>
    contentType.includes(type)
  );

  if (!isCompressible) {
    return false;
  }

  // Use default filter for everything else
  return compression.filter(req, res);
}

// ============================================================
// COMPRESSION MIDDLEWARE
// ============================================================

export const compressionMiddleware = compression({
  // Only compress responses > 1KB
  threshold: 1024,

  // Compression level (1-9, higher = more compression but slower)
  // Use lower level in development for faster responses
  level: isProduction ? 6 : 1,

  // Memory level (1-9)
  memLevel: 8,

  // Custom filter function
  filter: shouldCompress,

  // Chunk size for streaming
  chunkSize: 16 * 1024, // 16KB chunks
});

// ============================================================
// STATIC ASSET COMPRESSION HEADERS
// ============================================================

export const staticCompressionHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Add Vary header for proper caching
  res.setHeader('Vary', 'Accept-Encoding');

  next();
};

// ============================================================
// APPLY COMPRESSION MIDDLEWARE
// ============================================================

export function applyCompressionMiddleware(app: Application): void {
  app.use(compressionMiddleware);
  app.use(staticCompressionHeaders);

  console.info('✅ Compression middleware configured');
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  compressionMiddleware,
  staticCompressionHeaders,
  applyCompressionMiddleware,
};
