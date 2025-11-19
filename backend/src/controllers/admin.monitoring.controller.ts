import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import os from 'os';

/**
 * Get system health status
 */
export const getSystemHealth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      databaseHealth,
      memoryUsage,
      cpuUsage,
      diskUsage,
      uptime,
    ] = await Promise.all([
      checkDatabaseHealth(),
      getMemoryUsage(),
      getCPUUsage(),
      getDiskUsage(),
      getUptime(),
    ]);

    const overallStatus = determineOverallStatus({
      database: databaseHealth.status,
      memory: memoryUsage.status,
      cpu: cpuUsage.status,
    });

    res.json({
      status: overallStatus,
      timestamp: new Date(),
      components: {
        database: databaseHealth,
        memory: memoryUsage,
        cpu: cpuUsage,
        disk: diskUsage,
      },
      uptime,
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      status: 'ERROR',
      error: 'Failed to fetch system health',
    });
  }
};

/**
 * Get API usage statistics
 */
export const getAPIUsage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query;

    let startDate = new Date();
    if (period === '1h') {
      startDate.setHours(startDate.getHours() - 1);
    } else if (period === '24h') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    }

    // This would typically query an API request log table
    // For now, return mock data structure
    const mockAPIUsage = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      requestsByEndpoint: [],
      requestsByMethod: [],
      requestsByStatus: [],
      requestsOverTime: [],
    };

    res.json({
      period,
      startDate,
      endDate: new Date(),
      usage: mockAPIUsage,
      message: 'API usage tracking requires request logging middleware',
    });
  } catch (error) {
    console.error('Error fetching API usage:', error);
    res.status(500).json({ error: 'Failed to fetch API usage statistics' });
  }
};

/**
 * Get error logs and tracking
 */
export const getErrorLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '50',
      level,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (level) {
      where.level = level;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom as string) }),
        ...(dateTo && { lte: new Date(dateTo as string) }),
      };
    }

    if (search) {
      where.OR = [
        { message: { contains: search as string, mode: 'insensitive' } },
        { stack: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [errors, total] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.errorLog.count({ where }),
    ]);

    res.json({
      errors,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        currentPage: parseInt(page as string),
        perPage: take,
      },
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
};

/**
 * Get error statistics
 */
export const getErrorStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query;

    let startDate = new Date();
    if (period === '1h') {
      startDate.setHours(startDate.getHours() - 1);
    } else if (period === '24h') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    }

    const [
      totalErrors,
      errorsByLevel,
      errorsByType,
      recentErrors,
      errorTrend,
    ] = await Promise.all([
      prisma.errorLog.count({
        where: { createdAt: { gte: startDate } },
      }),

      prisma.errorLog.groupBy({
        by: ['level'],
        where: { createdAt: { gte: startDate } },
        _count: { level: true },
      }),

      prisma.errorLog.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startDate } },
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } },
        take: 10,
      }),

      prisma.errorLog.findMany({
        where: { createdAt: { gte: startDate } },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),

      // Error trend over time
      prisma.errorLog.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Group errors by hour or day
    const errorsByTime: { [key: string]: number } = {};
    errorTrend.forEach(error => {
      const timeKey = error.createdAt.toISOString().split(':')[0]; // Group by hour
      errorsByTime[timeKey] = (errorsByTime[timeKey] || 0) + 1;
    });

    res.json({
      totalErrors,
      byLevel: errorsByLevel.map(e => ({ level: e.level, count: e._count.level })),
      byType: errorsByType.map(e => ({ type: e.type, count: e._count.type })),
      recentErrors: recentErrors.map(e => ({
        id: e.id,
        level: e.level,
        message: e.message,
        timestamp: e.createdAt,
      })),
      errorTrend: Object.entries(errorsByTime).map(([time, count]) => ({
        time,
        count,
      })),
    });
  } catch (error) {
    console.error('Error fetching error stats:', error);
    res.status(500).json({ error: 'Failed to fetch error statistics' });
  }
};

/**
 * Get database performance metrics
 */
export const getDatabaseMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      tableStats,
      connectionPool,
      queryPerformance,
    ] = await Promise.all([
      getTableStatistics(),
      getConnectionPoolInfo(),
      getQueryPerformance(),
    ]);

    res.json({
      tables: tableStats,
      connectionPool,
      queryPerformance,
    });
  } catch (error) {
    console.error('Error fetching database metrics:', error);
    res.status(500).json({ error: 'Failed to fetch database metrics' });
  }
};

/**
 * Get system performance metrics
 */
export const getPerformanceMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '1h' } = req.query;

    let startDate = new Date();
    if (period === '1h') {
      startDate.setHours(startDate.getHours() - 1);
    } else if (period === '24h') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    }

    const metrics = {
      timestamp: new Date(),
      period,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        loadAverage: os.loadavg(),
      },
      uptime: {
        system: os.uptime(),
        process: process.uptime(),
      },
      process: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
};

/**
 * Get background job status
 */
export const getBackgroundJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // This would typically query a job queue table (e.g., Bull, BullMQ)
    // For now, return placeholder data
    res.json({
      jobs: [],
      queues: [],
      message: 'Background job monitoring requires job queue integration',
    });
  } catch (error) {
    console.error('Error fetching background jobs:', error);
    res.status(500).json({ error: 'Failed to fetch background jobs' });
  }
};

/**
 * Get cache performance
 */
export const getCacheMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // This would typically query cache statistics (e.g., Redis)
    // For now, return placeholder data
    res.json({
      hitRate: 0,
      missRate: 0,
      totalKeys: 0,
      memoryUsed: 0,
      message: 'Cache monitoring requires cache integration',
    });
  } catch (error) {
    console.error('Error fetching cache metrics:', error);
    res.status(500).json({ error: 'Failed to fetch cache metrics' });
  }
};

/**
 * Get active sessions
 */
export const getActiveSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Count unique users with recent activity (last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const activeSessions = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM (
        SELECT user_id, updated_at FROM applications WHERE updated_at >= ${fifteenMinutesAgo}
        UNION
        SELECT user_id, updated_at FROM jobs WHERE updated_at >= ${fifteenMinutesAgo}
      ) as recent_activity
    `;

    res.json({
      activeSessions,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
};

// Helper Functions

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<{ status: string; responseTime: number; message?: string }> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: responseTime < 100 ? 'HEALTHY' : responseTime < 500 ? 'DEGRADED' : 'UNHEALTHY',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'ERROR',
      responseTime: -1,
      message: 'Database connection failed',
    };
  }
}

/**
 * Get memory usage
 */
function getMemoryUsage(): { status: string; total: number; used: number; free: number; percentage: number } {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const percentage = (used / total) * 100;

  let status = 'HEALTHY';
  if (percentage > 90) status = 'CRITICAL';
  else if (percentage > 75) status = 'WARNING';

  return {
    status,
    total,
    used,
    free,
    percentage: parseFloat(percentage.toFixed(2)),
  };
}

/**
 * Get CPU usage
 */
function getCPUUsage(): { status: string; cores: number; loadAverage: number[] } {
  const cores = os.cpus().length;
  const loadAvg = os.loadavg();

  const avgLoad = loadAvg[0] / cores;
  let status = 'HEALTHY';
  if (avgLoad > 0.9) status = 'CRITICAL';
  else if (avgLoad > 0.7) status = 'WARNING';

  return {
    status,
    cores,
    loadAverage: loadAvg,
  };
}

/**
 * Get disk usage (placeholder)
 */
function getDiskUsage(): { status: string; message: string } {
  return {
    status: 'UNKNOWN',
    message: 'Disk usage monitoring requires additional dependencies',
  };
}

/**
 * Get system uptime
 */
function getUptime(): { system: number; process: number } {
  return {
    system: os.uptime(),
    process: process.uptime(),
  };
}

/**
 * Determine overall system status
 */
function determineOverallStatus(components: { [key: string]: string }): string {
  const statuses = Object.values(components);

  if (statuses.includes('ERROR') || statuses.includes('CRITICAL')) {
    return 'CRITICAL';
  }
  if (statuses.includes('UNHEALTHY')) {
    return 'UNHEALTHY';
  }
  if (statuses.includes('DEGRADED') || statuses.includes('WARNING')) {
    return 'DEGRADED';
  }
  return 'HEALTHY';
}

/**
 * Get table statistics
 */
async function getTableStatistics(): Promise<any[]> {
  try {
    const tables = ['User', 'Job', 'Application', 'Interview', 'AuditLog'];
    const stats = await Promise.all(
      tables.map(async (table) => ({
        name: table,
        count: await (prisma as any)[table.toLowerCase()].count(),
      }))
    );
    return stats;
  } catch (error) {
    return [];
  }
}

/**
 * Get connection pool info
 */
function getConnectionPoolInfo(): { message: string } {
  return {
    message: 'Connection pool info requires database driver access',
  };
}

/**
 * Get query performance
 */
function getQueryPerformance(): { message: string } {
  return {
    message: 'Query performance tracking requires logging configuration',
  };
}
