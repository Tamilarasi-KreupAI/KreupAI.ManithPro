// @ts-nocheck
import { PrismaClient } from '@prisma/client';

// ============================================================
// PRISMA CLIENT SINGLETON
// ============================================================
//
// This module provides a singleton instance of PrismaClient
// to prevent multiple database connections in development
// and ensure efficient connection pooling in production.
//
// Usage:
//   import { prisma } from '../database/prisma';
//   const users = await prisma.user.findMany();
// ============================================================

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Connection pool configuration based on environment
const getConnectionPoolConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return {
        // Production: Higher pool size for handling concurrent requests
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        log: ['error', 'warn'] as const,
      };
    case 'staging':
      return {
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        log: ['query', 'error', 'warn'] as const,
      };
    default:
      return {
        // Development: Enable query logging for debugging
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        log: ['query', 'info', 'warn', 'error'] as const,
      };
  }
};

// Create Prisma client instance
const createPrismaClient = (): PrismaClient => {
  const config = getConnectionPoolConfig();

  const client = new PrismaClient(config);

  // Add middleware for query timing in development
  if (process.env.NODE_ENV === 'development') {
    client.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      if (after - before > 100) {
        console.warn(
          `⚠️ Slow query detected: ${params.model}.${params.action} took ${after - before}ms`
        );
      }

      return result;
    });
  }

  // Add middleware for soft delete support
  client.$use(async (params, next) => {
    // Handle soft deletes for models with deletedAt field
    if (params.action === 'delete') {
      const modelsWithSoftDelete = [
        'User', 'Job', 'Application', 'CandidateProfile',
        'Interview', 'Message', 'Notification'
      ];

      if (params.model && modelsWithSoftDelete.includes(params.model)) {
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
      }
    }

    if (params.action === 'deleteMany') {
      const modelsWithSoftDelete = [
        'User', 'Job', 'Application', 'CandidateProfile',
        'Interview', 'Message', 'Notification'
      ];

      if (params.model && modelsWithSoftDelete.includes(params.model)) {
        params.action = 'updateMany';
        if (params.args.data !== undefined) {
          params.args.data['deletedAt'] = new Date();
        } else {
          params.args['data'] = { deletedAt: new Date() };
        }
      }
    }

    return next(params);
  });

  return client;
};

// Singleton pattern - reuse client in development to prevent connection exhaustion
export const prisma: PrismaClient = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// ============================================================
// CONNECTION MANAGEMENT
// ============================================================

/**
 * Connect to the database
 * Call this on application startup
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from the database
 * Call this on application shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
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

// ============================================================
// TRANSACTION HELPERS
// ============================================================

/**
 * Execute operations in a transaction
 * Automatically handles rollback on error
 */
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  }
): Promise<T> {
  return prisma.$transaction(fn, {
    maxWait: options?.maxWait ?? 5000,
    timeout: options?.timeout ?? 10000,
    isolationLevel: options?.isolationLevel,
  });
}

// ============================================================
// QUERY HELPERS
// ============================================================

/**
 * Paginate query results
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  maxPageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export function getPaginationParams(params: PaginationParams): {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, params.page ?? 1);
  const maxSize = params.maxPageSize ?? 100;
  const pageSize = Math.min(Math.max(1, params.pageSize ?? 20), maxSize);

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    page,
    pageSize,
  };
}

export function createPaginatedResult<T>(
  data: T[],
  totalItems: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}

// ============================================================
// BATCH OPERATIONS
// ============================================================

/**
 * Batch process records to avoid memory issues with large datasets
 */
export async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Stream large query results using cursor-based pagination
 */
export async function* streamRecords<T extends { id: string }>(
  model: string,
  batchSize: number = 100,
  where?: Record<string, unknown>
): AsyncGenerator<T[], void, unknown> {
  let cursor: string | undefined;

  while (true) {
    const args: Record<string, unknown> = {
      take: batchSize,
      where,
      orderBy: { id: 'asc' },
    };

    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    // Use dynamic model access
    const records = await (prisma as unknown as Record<string, { findMany: (args: Record<string, unknown>) => Promise<T[]> }>)[model].findMany(args);

    if (records.length === 0) break;

    yield records;

    if (records.length < batchSize) break;

    cursor = records[records.length - 1].id;
  }
}

export default prisma;
