import { Request, Response, NextFunction } from 'express';

// ============================================================
// HTTP CACHING MIDDLEWARE
// ============================================================
//
// This module provides HTTP caching headers for optimal
// client-side and CDN caching behavior.
//
// Features:
// - Cache-Control headers
// - ETag support
// - Conditional requests
// - CDN integration
// ============================================================

// ============================================================
// TYPES
// ============================================================

export interface CacheOptions {
  maxAge?: number; // seconds
  sMaxAge?: number; // CDN cache time
  staleWhileRevalidate?: number;
  staleIfError?: number;
  private?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
  immutable?: boolean;
}

// ============================================================
// CACHE PRESETS
// ============================================================

export const CACHE_PRESETS = {
  // No caching - for sensitive/dynamic data
  noCache: {
    noCache: true,
    noStore: true,
    mustRevalidate: true,
  } as CacheOptions,

  // Short cache - for frequently changing data
  short: {
    maxAge: 60, // 1 minute
    sMaxAge: 60,
    staleWhileRevalidate: 30,
  } as CacheOptions,

  // Medium cache - for semi-static data
  medium: {
    maxAge: 300, // 5 minutes
    sMaxAge: 600, // 10 minutes for CDN
    staleWhileRevalidate: 60,
    staleIfError: 300,
  } as CacheOptions,

  // Long cache - for rarely changing data
  long: {
    maxAge: 3600, // 1 hour
    sMaxAge: 86400, // 24 hours for CDN
    staleWhileRevalidate: 600,
    staleIfError: 86400,
  } as CacheOptions,

  // Static assets - for immutable files
  static: {
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000,
    immutable: true,
  } as CacheOptions,

  // Private user data
  private: {
    maxAge: 0,
    private: true,
    noCache: true,
    mustRevalidate: true,
  } as CacheOptions,
};

// ============================================================
// BUILD CACHE-CONTROL HEADER
// ============================================================

function buildCacheControl(options: CacheOptions): string {
  const directives: string[] = [];

  if (options.noStore) {
    directives.push('no-store');
  }

  if (options.noCache) {
    directives.push('no-cache');
  }

  if (options.private) {
    directives.push('private');
  } else if (!options.noStore && !options.noCache) {
    directives.push('public');
  }

  if (options.maxAge !== undefined && !options.noStore) {
    directives.push(`max-age=${options.maxAge}`);
  }

  if (options.sMaxAge !== undefined && !options.private && !options.noStore) {
    directives.push(`s-maxage=${options.sMaxAge}`);
  }

  if (options.mustRevalidate) {
    directives.push('must-revalidate');
  }

  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }

  if (options.staleIfError !== undefined) {
    directives.push(`stale-if-error=${options.staleIfError}`);
  }

  if (options.immutable) {
    directives.push('immutable');
  }

  return directives.join(', ');
}

// ============================================================
// CACHE MIDDLEWARE FACTORY
// ============================================================

export function cacheControl(options: CacheOptions | keyof typeof CACHE_PRESETS) {
  const cacheOptions = typeof options === 'string' ? CACHE_PRESETS[options] : options;
  const headerValue = buildCacheControl(cacheOptions);

  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Cache-Control', headerValue);
    next();
  };
}

// ============================================================
// CONDITIONAL REQUEST HANDLING
// ============================================================

export function conditionalGet(
  req: Request,
  res: Response,
  etag: string,
  lastModified?: Date
): boolean {
  // Set ETag header
  res.setHeader('ETag', `"${etag}"`);

  // Set Last-Modified if provided
  if (lastModified) {
    res.setHeader('Last-Modified', lastModified.toUTCString());
  }

  // Check If-None-Match (ETag)
  const ifNoneMatch = req.headers['if-none-match'];
  if (ifNoneMatch) {
    const tags = ifNoneMatch.split(',').map((tag) => tag.trim().replace(/"/g, ''));
    if (tags.includes(etag) || tags.includes('*')) {
      res.status(304).end();
      return true;
    }
  }

  // Check If-Modified-Since
  if (lastModified) {
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince) {
      const clientDate = new Date(ifModifiedSince);
      if (clientDate >= lastModified) {
        res.status(304).end();
        return true;
      }
    }
  }

  return false;
}

// ============================================================
// CDN CACHE TAGS
// ============================================================

export function setCdnCacheTags(res: Response, tags: string[]): void {
  // Cloudflare
  res.setHeader('Cache-Tag', tags.join(','));

  // Fastly
  res.setHeader('Surrogate-Key', tags.join(' '));

  // Generic
  res.setHeader('X-Cache-Tags', tags.join(','));
}

// ============================================================
// CDN PURGE HELPERS
// ============================================================

export function setCdnPurgeHeaders(res: Response, keys: string[]): void {
  // Set headers that CDNs can use to identify content for purging
  res.setHeader('X-Purge-Keys', keys.join(' '));
}

// ============================================================
// VARY HEADER MIDDLEWARE
// ============================================================

export function varyOn(...headers: string[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const existing = res.getHeader('Vary')?.toString() || '';
    const existingHeaders = existing.split(',').map((h) => h.trim().toLowerCase());

    const newHeaders = headers.filter(
      (h) => !existingHeaders.includes(h.toLowerCase())
    );

    if (newHeaders.length > 0) {
      const allHeaders = [...existingHeaders.filter(Boolean), ...newHeaders];
      res.setHeader('Vary', allHeaders.join(', '));
    }

    next();
  };
}

// ============================================================
// API RESPONSE CACHE MIDDLEWARE
// ============================================================

export const apiCacheMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip caching for non-GET requests
  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return next();
  }

  // Skip caching for authenticated requests by default
  if (req.headers.authorization) {
    res.setHeader('Cache-Control', 'private, no-cache, must-revalidate');
    return next();
  }

  // Default API cache settings
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=30');

  // Vary by common headers
  res.setHeader('Vary', 'Accept, Accept-Encoding, Authorization');

  next();
};

// ============================================================
// STATIC FILE CACHE MIDDLEWARE
// ============================================================

export const staticCacheMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Long cache with immutable for static assets
  res.setHeader(
    'Cache-Control',
    'public, max-age=31536000, s-maxage=31536000, immutable'
  );

  next();
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  cacheControl,
  conditionalGet,
  setCdnCacheTags,
  setCdnPurgeHeaders,
  varyOn,
  apiCacheMiddleware,
  staticCacheMiddleware,
  CACHE_PRESETS,
};
