// ============================================================
// DATABASE MODULE
// ============================================================
//
// Central export point for all database-related utilities
//
// Usage:
//   import { prisma, cache, queries } from './database';
// ============================================================

// Prisma Client and utilities
export {
  prisma,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
  withTransaction,
  getPaginationParams,
  createPaginatedResult,
  batchProcess,
  streamRecords,
  type PaginationParams,
  type PaginatedResult,
} from './prisma';

// Redis Cache service
export {
  redis,
  cache,
  cacheAside,
  cacheAsideSWR,
  CacheKeys,
  invalidateEntity,
  acquireLock,
  releaseLock,
  withLock,
  checkRateLimit,
  checkCacheHealth,
  connectCache,
  disconnectCache,
  type CacheOptions,
} from './cache';

// Optimized query utilities
export {
  queries,
  UserQueries,
  JobQueries,
  ApplicationQueries,
  InterviewQueries,
  AnalyticsQueries,
} from './queries';

// ============================================================
// APPLICATION LIFECYCLE
// ============================================================

/**
 * Initialize all database connections
 * Call this on application startup
 */
export async function initializeDatabase(): Promise<void> {
  const { connectDatabase: connectDb } = await import('./prisma');
  const { connectCache: connectRedis } = await import('./cache');

  try {
    await Promise.all([
      connectDb(),
      connectRedis(),
    ]);
    console.log('✅ All database connections initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Close all database connections
 * Call this on application shutdown
 */
export async function shutdownDatabase(): Promise<void> {
  const { disconnectDatabase: disconnectDb } = await import('./prisma');
  const { disconnectCache: disconnectRedis } = await import('./cache');

  try {
    await Promise.all([
      disconnectDb(),
      disconnectRedis(),
    ]);
    console.log('✅ All database connections closed');
  } catch (error) {
    console.error('❌ Database shutdown failed:', error);
  }
}

/**
 * Check health of all database connections
 */
export async function checkAllHealth(): Promise<{
  database: { healthy: boolean; latency: number; error?: string };
  cache: { healthy: boolean; latency: number; error?: string };
  overall: boolean;
}> {
  const { checkDatabaseHealth: checkDb } = await import('./prisma');
  const { checkCacheHealth: checkRedis } = await import('./cache');

  const [database, cache] = await Promise.all([
    checkDb(),
    checkRedis(),
  ]);

  return {
    database,
    cache,
    overall: database.healthy && cache.healthy,
  };
}
