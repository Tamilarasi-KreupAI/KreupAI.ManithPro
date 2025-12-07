import Redis from 'ioredis';

// ============================================================
// REDIS CACHE SERVICE
// ============================================================
//
// This module provides a comprehensive caching layer using Redis
// with support for:
// - Key-value caching with TTL
// - Cache invalidation patterns
// - Cache-aside pattern helpers
// - Distributed locking
//
// Usage:
//   import { cache, cacheAside } from '../database/cache';
//
//   // Simple caching
//   await cache.set('user:123', userData, 300);
//   const user = await cache.get('user:123');
//
//   // Cache-aside pattern
//   const user = await cacheAside('user:123', 300, () => prisma.user.findUnique({ where: { id: '123' } }));
// ============================================================

// ============================================================
// REDIS CLIENT SINGLETON
// ============================================================

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

const getRedisConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const config: Redis.RedisOptions = {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times > 10) {
        console.error('❌ Redis connection failed after 10 retries');
        return null;
      }
      return Math.min(times * 100, 3000);
    },
    enableReadyCheck: true,
    lazyConnect: true,
  };

  // Add TLS for production
  if (env === 'production' && process.env.REDIS_TLS === 'true') {
    config.tls = {};
  }

  // Add password if provided
  if (process.env.REDIS_PASSWORD) {
    config.password = process.env.REDIS_PASSWORD;
  }

  return { url: redisUrl, config };
};

const createRedisClient = (): Redis => {
  const { url, config } = getRedisConfig();
  const client = new Redis(url, config);

  client.on('connect', () => {
    console.log('✅ Redis client connected');
  });

  client.on('error', (error) => {
    console.error('❌ Redis client error:', error);
  });

  client.on('close', () => {
    console.log('⚠️ Redis connection closed');
  });

  return client;
};

// Singleton pattern
export const redis: Redis = global.__redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  global.__redis = redis;
}

// ============================================================
// CACHE SERVICE
// ============================================================

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

const DEFAULT_TTL = 300; // 5 minutes
const KEY_PREFIX = 'cache:';

/**
 * Build cache key with optional prefix
 */
function buildKey(key: string, prefix?: string): string {
  return `${prefix ?? KEY_PREFIX}${key}`;
}

/**
 * Cache service with common operations
 */
export const cache = {
  /**
   * Get a value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = buildKey(key, options?.prefix);
      const data = await redis.get(fullKey);

      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set a value in cache with optional TTL
   */
  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const fullKey = buildKey(key, options?.prefix);
      const serialized = JSON.stringify(value);
      const ttl = ttlSeconds ?? options?.ttl ?? DEFAULT_TTL;

      await redis.setex(fullKey, ttl, serialized);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Delete a value from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = buildKey(key, options?.prefix);
      await redis.del(fullKey);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string, options?: CacheOptions): Promise<number> {
    try {
      const fullPattern = buildKey(pattern, options?.prefix);
      const keys = await redis.keys(fullPattern);

      if (keys.length === 0) return 0;

      return await redis.del(...keys);
    } catch (error) {
      console.error('Cache deletePattern error:', error);
      return 0;
    }
  },

  /**
   * Check if a key exists in cache
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = buildKey(key, options?.prefix);
      return (await redis.exists(fullKey)) === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string, options?: CacheOptions): Promise<number> {
    try {
      const fullKey = buildKey(key, options?.prefix);
      return await redis.ttl(fullKey);
    } catch (error) {
      console.error('Cache ttl error:', error);
      return -1;
    }
  },

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1, options?: CacheOptions): Promise<number> {
    try {
      const fullKey = buildKey(key, options?.prefix);
      return await redis.incrby(fullKey, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  },

  /**
   * Get multiple values at once
   */
  async mget<T>(keys: string[], options?: CacheOptions): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map((k) => buildKey(k, options?.prefix));
      const values = await redis.mget(...fullKeys);

      return values.map((v) => (v ? JSON.parse(v) as T : null));
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  },

  /**
   * Set multiple values at once
   */
  async mset<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const pipeline = redis.pipeline();

      for (const { key, value, ttl } of entries) {
        const fullKey = buildKey(key, options?.prefix);
        const serialized = JSON.stringify(value);
        const finalTtl = ttl ?? options?.ttl ?? DEFAULT_TTL;

        pipeline.setex(fullKey, finalTtl, serialized);
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  },
};

// ============================================================
// CACHE-ASIDE PATTERN
// ============================================================

/**
 * Cache-aside pattern: Get from cache or fetch from source
 */
export async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Try to get from cache first
  const cached = await cache.get<T>(key, options);
  if (cached !== null) {
    return cached;
  }

  // Fetch from source
  const data = await fetcher();

  // Store in cache (don't await to avoid blocking)
  cache.set(key, data, ttlSeconds, options).catch((error) => {
    console.error('Cache-aside set error:', error);
  });

  return data;
}

/**
 * Cache-aside with stale-while-revalidate pattern
 */
export async function cacheAsideSWR<T>(
  key: string,
  ttlSeconds: number,
  staleSeconds: number,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const fullKey = buildKey(key, options?.prefix);
  const staleKey = `${fullKey}:stale`;

  // Try to get from cache
  const cached = await cache.get<T>(key, options);

  if (cached !== null) {
    // Check if we should revalidate in background
    const isStale = await redis.exists(staleKey) === 0;

    if (isStale) {
      // Revalidate in background
      fetcher()
        .then((data) => {
          cache.set(key, data, ttlSeconds + staleSeconds, options);
          redis.setex(staleKey, staleSeconds, '1');
        })
        .catch((error) => {
          console.error('SWR revalidation error:', error);
        });
    }

    return cached;
  }

  // Fetch from source
  const data = await fetcher();

  // Store in cache
  await Promise.all([
    cache.set(key, data, ttlSeconds + staleSeconds, options),
    redis.setex(staleKey, staleSeconds, '1'),
  ]);

  return data;
}

// ============================================================
// CACHE INVALIDATION PATTERNS
// ============================================================

/**
 * Entity-based cache keys
 */
export const CacheKeys = {
  // User cache keys
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userPermissions: (id: string) => `user:${id}:permissions`,

  // Job cache keys
  job: (id: string) => `job:${id}`,
  jobList: (filters: string) => `jobs:list:${filters}`,
  jobSearch: (query: string) => `jobs:search:${query}`,

  // Application cache keys
  application: (id: string) => `application:${id}`,
  applicationsByJob: (jobId: string) => `applications:job:${jobId}`,
  applicationsByCandidate: (candidateId: string) => `applications:candidate:${candidateId}`,

  // Interview cache keys
  interview: (id: string) => `interview:${id}`,
  interviewsByApplication: (appId: string) => `interviews:application:${appId}`,

  // Company cache keys
  company: (id: string) => `company:${id}`,
  companyJobs: (id: string) => `company:${id}:jobs`,

  // Analytics cache keys
  analytics: (type: string, params: string) => `analytics:${type}:${params}`,
  dashboardStats: (userId: string) => `dashboard:${userId}:stats`,

  // Session cache keys
  session: (id: string) => `session:${id}`,
  userSessions: (userId: string) => `sessions:user:${userId}`,
};

/**
 * Invalidate cache for an entity
 */
export async function invalidateEntity(
  entity: 'user' | 'job' | 'application' | 'interview' | 'company',
  id: string
): Promise<void> {
  const patterns = {
    user: [`user:${id}*`, `sessions:user:${id}*`, `dashboard:${id}*`],
    job: [`job:${id}*`, `jobs:*`],
    application: [`application:${id}*`, `applications:*`],
    interview: [`interview:${id}*`, `interviews:*`],
    company: [`company:${id}*`],
  };

  const entityPatterns = patterns[entity];

  for (const pattern of entityPatterns) {
    await cache.deletePattern(pattern);
  }
}

// ============================================================
// DISTRIBUTED LOCKING
// ============================================================

const LOCK_PREFIX = 'lock:';
const DEFAULT_LOCK_TTL = 30; // 30 seconds

/**
 * Acquire a distributed lock
 */
export async function acquireLock(
  resource: string,
  ttlSeconds: number = DEFAULT_LOCK_TTL
): Promise<string | null> {
  const lockKey = `${LOCK_PREFIX}${resource}`;
  const lockValue = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

  const acquired = await redis.set(lockKey, lockValue, 'EX', ttlSeconds, 'NX');

  return acquired ? lockValue : null;
}

/**
 * Release a distributed lock
 */
export async function releaseLock(resource: string, lockValue: string): Promise<boolean> {
  const lockKey = `${LOCK_PREFIX}${resource}`;

  // Use Lua script for atomic check-and-delete
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  const result = await redis.eval(script, 1, lockKey, lockValue);
  return result === 1;
}

/**
 * Execute a function with a distributed lock
 */
export async function withLock<T>(
  resource: string,
  fn: () => Promise<T>,
  options?: { ttlSeconds?: number; waitMs?: number; retries?: number }
): Promise<T> {
  const ttl = options?.ttlSeconds ?? DEFAULT_LOCK_TTL;
  const waitMs = options?.waitMs ?? 100;
  const maxRetries = options?.retries ?? 50;

  let lockValue: string | null = null;
  let retries = 0;

  // Try to acquire lock with retries
  while (!lockValue && retries < maxRetries) {
    lockValue = await acquireLock(resource, ttl);

    if (!lockValue) {
      retries++;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  if (!lockValue) {
    throw new Error(`Failed to acquire lock for resource: ${resource}`);
  }

  try {
    return await fn();
  } finally {
    await releaseLock(resource, lockValue);
  }
}

// ============================================================
// RATE LIMITING
// ============================================================

/**
 * Check rate limit using sliding window
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const redisKey = `ratelimit:${key}`;

  const pipeline = redis.pipeline();

  // Remove old entries
  pipeline.zremrangebyscore(redisKey, 0, windowStart);
  // Add current request
  pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
  // Count requests in window
  pipeline.zcard(redisKey);
  // Set expiry
  pipeline.expire(redisKey, windowSeconds);

  const results = await pipeline.exec();
  const count = (results?.[2]?.[1] as number) || 0;

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetIn: windowSeconds,
  };
}

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * Check Redis connection health
 */
export async function checkCacheHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    await redis.ping();
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Connect Redis client
 */
export async function connectCache(): Promise<void> {
  try {
    await redis.connect();
    console.log('✅ Redis cache connected');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect Redis client
 */
export async function disconnectCache(): Promise<void> {
  try {
    await redis.quit();
    console.log('✅ Redis cache disconnected');
  } catch (error) {
    console.error('❌ Redis disconnection failed:', error);
  }
}

export default redis;
